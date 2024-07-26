import json
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from .models import Dataset, License, Image, Category, Annotation, Evaluation, Detection, PRPoint
from .serializers import DatasetSerializer, ImageSerializer, AnnotationSerializer, LicenseSerializer, CategorySerializer, DetectionSerializer
from django.core.serializers.json import DjangoJSONEncoder
from tqdm import tqdm

from pycocotools.coco import COCO
from pycocotools.cocoeval import COCOeval
import io
import tempfile
import os
import numpy as np




def insert_coco_json_to_db(json_file_path):
    with open(json_file_path) as file:
        data = json.load(file)
    
    print(f"Inserting data from {json_file_path}")


    with transaction.atomic():
        print("Inserting dataset...")
        info = data.get('info', {})
        dataset_date_created_str = info.get('date_created', None)
        dataset_date_created = None
        if dataset_date_created_str:
            dataset_date_created = datetime.strptime(dataset_date_created_str, "%Y/%m/%d").date()
        
        dataset = Dataset.objects.create(
            version=info.get('version', '1.0'),
            year=info.get('year', 0),
            description=info.get('description', ''),
            contributor=info.get('contributor', ''),
            url=info.get('url', ''),
            date_created=dataset_date_created
        )
        
        for lic in tqdm(data.get('licenses', []), desc="Inserting licenses"):
            License.objects.get_or_create(
                id=lic['id'],
                name=lic.get('name', ''),
                defaults={'url': lic.get('url', '')}
            )
        
        for cat in tqdm(data['categories'], desc="Inserting categories"):
            Category.objects.get_or_create(
                id=cat['id'],
                name=cat['name'],
                defaults={'supercategory': cat['supercategory']}
            )
        
        for img in tqdm(data['images'], desc="Inserting images"):
            image_date_captured_str = img.get('date_captured', None)
            image_date_captured = None
            if image_date_captured_str:
                image_date_captured = datetime.strptime(image_date_captured_str, "%Y-%m-%d %H:%M:%S")
            
            license_obj = None
            if img.get('license'):
                try:
                    license_obj = License.objects.get(id=img['license'])
                except ObjectDoesNotExist:
                    pass
            
            Image.objects.create(
                coco_id=img['id'],
                width=img['width'],
                height=img['height'],
                file_name=img['file_name'],
                flickr_url=img.get('flickr_url', ''),
                coco_url=img.get('coco_url', ''),
                date_captured=image_date_captured, 
                license=license_obj,
                dataset=dataset
            )
        
        for ann in tqdm(data['annotations'], desc="Inserting annotations"):
            image_obj = Image.objects.filter(coco_id=ann['image_id'], dataset=dataset).first()
            category_obj = Category.objects.get(id=ann['category_id'])

            if image_obj and category_obj:
                bbox_value = ann.get('bbox', [0, 0, 0, 0])
                
                Annotation.objects.create(
                    segmentation=ann['segmentation'],
                    area=ann['area'],
                    iscrowd=ann['iscrowd'],
                    image=image_obj,
                    category=category_obj,
                    bbox=bbox_value 
                )
    

def insert_coco_results_to_db(json_file_path, dataset_id):
    with open(json_file_path) as file:
        data = json.load(file)
    
    try:
        dataset = Dataset.objects.get(id=dataset_id)
    except Dataset.DoesNotExist:
        print(f"Dataset with id {dataset_id} does not exist.")
        return
    
    with transaction.atomic():
        evaluation = Evaluation.objects.create(
            dataset=dataset
        )
        
        for det in tqdm(data, desc="Inserting detections"):
            image_id = det.get('image_id')
            try:
                image = Image.objects.get(coco_id=image_id, dataset=dataset)
                category = Category.objects.get(id=det.get('category_id'))
                Detection.objects.create(
                    x=det['bbox'][0],
                    y=det['bbox'][1],
                    width=det['bbox'][2],
                    height=det['bbox'][3],
                    score=det.get('score'),
                    image=image,
                    evaluation=evaluation,
                    category=category
                )
            except Image.DoesNotExist:
                print(f"Image with coco_id {image_id} does not exist in dataset {dataset_id}. Detection skipped.")


def format_dataset(dataset_id):
    try:
        dataset = Dataset.objects.get(id=dataset_id)
        images_qs = Image.objects.filter(dataset=dataset).prefetch_related('license')
        annotations = Annotation.objects.filter(image__in=images_qs)

        images_serializer = ImageSerializer(tqdm(images_qs, desc="Serializing images"), many=True)
        annotations_serializer = AnnotationSerializer(tqdm(annotations, desc="Serializing annotations"), many=True)

        licenses_serializer = LicenseSerializer(tqdm(License.objects.all(), desc="Serializing licenses"), many=True)
        categories_serializer = CategorySerializer(tqdm(Category.objects.all(), desc="Serializing categories"), many=True)

        data = {
            "info": DatasetSerializer(dataset).data,
            "images": images_serializer.data,
            "annotations": annotations_serializer.data,
            "licenses": licenses_serializer.data,
            "categories": categories_serializer.data,
        }

        return data

    except Dataset.DoesNotExist:
        return {"error": "Dataset not found"}
    
def format_results(evaluation_id):
    try:
        evaluation = Evaluation.objects.get(id=evaluation_id)
        detections_qs = Detection.objects.filter(evaluation=evaluation)
        
        detections_serializer = DetectionSerializer(tqdm(detections_qs, desc="Serializing detections"), many=True)
        
        return detections_serializer.data
    except Evaluation.DoesNotExist:
        return {"error": "Evaluation not found"}



def calculate_evaluation_metrics(evaluation_id):
    evaluation = Evaluation.objects.get(id=evaluation_id)
    dataset = evaluation.dataset
    
    print(f"Calculating metrics for evaluation {evaluation_id} and dataset {dataset.id}...")
    dataset_formatted = format_dataset(dataset.id)
    results_formatted = format_results(evaluation_id)

    with tempfile.NamedTemporaryFile('w', delete=False) as ann_file, tempfile.NamedTemporaryFile('w', delete=False) as det_file:
        print(f"Files are being written to {ann_file.name} and {det_file.name} in directory {os.path.dirname(ann_file.name)}")
        json.dump(dataset_formatted, ann_file)
        json.dump(results_formatted, det_file)
        ann_file_path = ann_file.name
        det_file_path = det_file.name
    
    cocoGt = COCO(ann_file_path)
    cocoDt = cocoGt.loadRes(det_file_path)

    cocoEval = COCOeval(cocoGt, cocoDt, 'bbox')
    cocoEvalNoCats = COCOeval(cocoGt, cocoDt, 'bbox')
    cocoEvalNoCats.params.useCats = 0
    cocoEval.params.recThrs = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95]
    cocoEval.params.maxDets = [100, 100, 100]

    cocoEval.evaluate()
    cocoEval.accumulate()
    cocoEval.summarize()
    cocoEvalNoCats.evaluate()
    cocoEvalNoCats.accumulate()
    cocoEvalNoCats.summarize()

    # Guardar las métricas AP y avg_conf en la evaluación
    evaluation.AP = cocoEval.stats[0]
    evaluation.AP50 = cocoEval.stats[1]
    evaluation.AP75 = cocoEval.stats[2]
    evaluation.APs = cocoEval.stats[3]
    evaluation.APm = cocoEval.stats[4]
    evaluation.APl = cocoEval.stats[5]
    evaluation.avg_conf = cocoEval.stats[6]

    evalImgs = cocoEval.evalImgs

    truePositives = 0
    falsePositives = 0
    falseNegatives = 0

    for evalImg in evalImgs:
        if evalImg is None:
            continue
        truePositives += sum([1 for match in evalImg['dtMatches'].flatten() if match > 0])
        falsePositives += sum([1 for match in evalImg['dtMatches'].flatten() if match == 0])
        falseNegatives += sum([1 for match in evalImg['gtMatches'].flatten() if match == 0])

    evaluation.true_positives = truePositives
    evaluation.false_positives = falsePositives
    evaluation.false_negatives = falseNegatives

    evaluation.save()

    print(f"truePositives: {truePositives}")
    print(f"falsePositives: {falsePositives}")
    print(f"falseNegatives: {falseNegatives}")

    with open('coco_precision.txt', 'w') as file1:
        for T, iouThr in enumerate(cocoEval.eval['params'].iouThrs):
            for R, recThr in enumerate(cocoEval.eval['params'].recThrs):
                for K, catId in enumerate(cocoEval.eval['params'].catIds):
                    for A, areaRng in enumerate(cocoEval.eval['params'].areaRng):
                        file1.write(f"Precision @ IoU={iouThr}, recThr={recThr}, Cat={catId}, Area={areaRng} => Precision: { cocoEval.eval['precision'][T][R][K][A][0]}\n")
    
    with open('coco_score.txt', 'w') as file1:
        for T, iouThr in enumerate(cocoEval.eval['params'].iouThrs):
            for R, recThr in enumerate(cocoEval.eval['params'].recThrs):
                for K, catId in enumerate(cocoEval.eval['params'].catIds):
                    for A, areaRng in enumerate(cocoEval.eval['params'].areaRng):
                        file1.write(f"Score @ IoU={iouThr}, recThr={recThr}, Cat={catId}, Area={areaRng} => Score: { cocoEval.eval['scores'][T][R][K][A][0]}\n")

    with open('coco_recall.txt', 'w') as file2:
        for T, iouThr in enumerate(cocoEval.eval['params'].iouThrs):
            for K, catId in enumerate(cocoEval.eval['params'].catIds):
                for A, areaRng in enumerate(cocoEval.eval['params'].areaRng):
                    file2.write(f"Recall @ IoU={iouThr}, Cat={catId}, Area={areaRng} => Recall: {cocoEval.eval['recall'][T][K][A][0]}\n")

    total_iterations = len(cocoEval.eval['params'].iouThrs) * len(cocoEval.eval['params'].recThrs) * len(cocoEval.eval['params'].catIds) * len(cocoEval.eval['params'].areaRng)
    pr_points_to_create = []

    with transaction.atomic():
        PRPoint.objects.filter(evaluation=evaluation).delete()
        with tqdm(total=total_iterations, desc='Inserting PRPoints (Cats)') as pbar:
            for T, iouThr in enumerate(cocoEval.eval['params'].iouThrs):
                for R, recThr in enumerate(cocoEval.eval['params'].recThrs):
                    for K, catId in enumerate(cocoEval.eval['params'].catIds):
                        for A, areaRng in enumerate(cocoEval.eval['params'].areaRng):
                            precision = cocoEval.eval['precision'][T][R][K][A][0]
                            score = cocoEval.eval['scores'][T][R][K][A][0]
                            try:
                                category_instance = Category.objects.get(id=catId)
                            except Category.DoesNotExist:
                                continue

                            pr_point = PRPoint(
                                evaluation=evaluation,
                                precision=precision,
                                recall=recThr, 
                                score=score,  
                                iou=iouThr,
                                area=areaRng,  
                                cat=category_instance
                            )
                            pr_points_to_create.append(pr_point)
                            pbar.update(1)

                PRPoint.objects.bulk_create(pr_points_to_create)
                pr_points_to_create.clear()

        total_iterations = len(cocoEvalNoCats.eval['params'].iouThrs) * len(cocoEvalNoCats.eval['params'].recThrs) * len(cocoEvalNoCats.eval['params'].catIds) * len(cocoEvalNoCats.eval['params'].areaRng)
        with tqdm(total=total_iterations, desc='Inserting PRPoints (No Cats)') as pbar:
            for T, iouThr in enumerate(cocoEvalNoCats.eval['params'].iouThrs):
                for R, recThr in enumerate(cocoEvalNoCats.eval['params'].recThrs):
                    for K, catId in enumerate(cocoEvalNoCats.eval['params'].catIds):
                        for A, areaRng in enumerate(cocoEvalNoCats.eval['params'].areaRng):
                            precision = cocoEvalNoCats.eval['precision'][T][R][K][A][0]
                            score = cocoEvalNoCats.eval['scores'][T][R][K][A][0]
                            category_instance = None

                            pr_point = PRPoint(
                                evaluation=evaluation,
                                precision=precision,
                                recall=recThr, 
                                score=score,  
                                iou=iouThr,
                                area=areaRng,  
                                cat=category_instance
                            )
                            pr_points_to_create.append(pr_point)
                            pbar.update(1)

                PRPoint.objects.bulk_create(pr_points_to_create)
                pr_points_to_create.clear()

    os.remove(ann_file_path)
    os.remove(det_file_path)