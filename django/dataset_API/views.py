from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from .models import Dataset, Image, Annotation, License, Category, Detection, Evaluation, PRPoint
from .serializers import DatasetSerializer, ImageSerializer, AnnotationSerializer, LicenseSerializer, CategorySerializer, DetectionSerializer, EvaluationSerializer, PRPointSerializer
from django.db.models import Prefetch
from .pagination import Dataset_Formatted_Pagination

from django.http import JsonResponse
from .utils import insert_coco_json_to_db, insert_coco_results_to_db
import os
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from dataset_API.utils import calculate_evaluation_metrics
from rest_framework import status


    
    
class GetDatasetFormatted(APIView):
    pagination_class = Dataset_Formatted_Pagination()  

    def get(self, request, dataset_id):
        category_id = request.query_params.get('category_id', None)

        try:
            dataset = Dataset.objects.get(id=dataset_id)
            images_qs = Image.objects.filter(dataset=dataset).prefetch_related('license')

            if category_id:
                filtered_images = images_qs.filter(annotation__category_id=category_id).distinct()
                page = self.pagination_class.paginate_queryset(filtered_images, request, view=self)
            else:
                page = self.pagination_class.paginate_queryset(images_qs, request, view=self)

            if page is not None:
                images_serializer = ImageSerializer(page, many=True)
                annotations = Annotation.objects.filter(image__in=page)
                annotations_serializer = AnnotationSerializer(annotations, many=True)
                
                licenses_ids = {image.license.id for image in page if image.license is not None}

                licenses = License.objects.filter(id__in=licenses_ids)
                licenses_serializer = LicenseSerializer(licenses, many=True)
                
                categories = Category.objects.all()
                categories_serializer = CategorySerializer(categories, many=True)

                return self.pagination_class.get_paginated_response(
                    data={
                        "info": DatasetSerializer(dataset).data,
                        "images": images_serializer.data,
                        "annotations": annotations_serializer.data,
                        "licenses": licenses_serializer.data,
                        "categories": categories_serializer.data,
                    }
                )

            return Response({"error": "There was a problem with paginating the images."}, status=400)
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=404)
        

class ImageAPIView(APIView):
    def get(self, request, dataset_id, image_id):
        try:
            image = Image.objects.filter(id=image_id, dataset_id=dataset_id).first()
            if image is None:
                return Response({"error": "Image not found"}, status=404)

            image_serializer = ImageSerializer(image)
            annotations = Annotation.objects.filter(image=image)
            annotations_serializer = AnnotationSerializer(annotations, many=True)
            detection = Detection.objects.filter(image=image)
            detection_serializer = DetectionSerializer(detection, many=True)

            data = {
                "image": image_serializer.data,
                "annotations": annotations_serializer.data,
                "detections": detection_serializer.data
            }

            return Response(data)
        except Image.DoesNotExist:
            return Response({"error": "Image not found"}, status=404)
        
class ImageByCocoIDAPIView(APIView):
    def get(self, request, coco_id):
        try:
            image = Image.objects.filter(coco_id=coco_id).first()
            if image is None:
                return Response({"error": "Image not found"}, status=404)

            image_serializer = ImageSerializer(image)
            annotations = Annotation.objects.filter(image=image)
            annotations_serializer = AnnotationSerializer(annotations, many=True)

            datasets = Dataset.objects.filter(image=image)
            datasets_data = []
            for dataset in datasets:
                evaluations = Evaluation.objects.filter(dataset=dataset)
                evaluations_data = []
                for evaluation in evaluations:
                    detections = Detection.objects.filter(evaluation=evaluation, image=image)
                    detection_serializer = DetectionSerializer(detections, many=True)
                    evaluations_data.append({
                        "evaluation": EvaluationSerializer(evaluation).data,
                        "detections": detection_serializer.data
                    })
                datasets_data.append({
                    "dataset": DatasetSerializer(dataset).data,
                    "evaluations": evaluations_data
                })

            data = {
                "image": image_serializer.data,
                "annotations": annotations_serializer.data,
                "datasets": datasets_data
            }

            return Response(data)
        except Image.DoesNotExist:
            return Response({"error": "Image not found"}, status=404)

        
class AllImagesAPIView(APIView):
    pagination_class = PageNumberPagination
    pagination_class.page_size = 15

    def get(self, request):
        queries = request.query_params.get('query', '')
        query_list = queries.split(',') if queries else []
        dataset_id = request.query_params.get('dataset', None)
        images = Image.objects.all()

        if dataset_id:
            images = images.filter(dataset_id=dataset_id)

        for query in query_list:
            if query.isdigit():
                images = images.filter(annotation__category_id=query)
            else:
                images = images.filter(annotation__category__name__icontains=query)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(images, request, view=self)

        if page is not None:
            serializer = ImageSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = ImageSerializer(images, many=True)
        return Response(serializer.data)
    
class DatasetAPIView(APIView):
    def get(self, request):
        datasets = Dataset.objects.all()
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(datasets, request, view=self)
        
        if page is not None:
            serializer = DatasetSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = DatasetSerializer(datasets, many=True)
        return Response(serializer.data)
    
class EvaluationAPIView(APIView):
    def get(self, request, dataset_id):
        evaluation = Evaluation.objects.filter(dataset_id=dataset_id)
        evaluation_serializer = EvaluationSerializer(evaluation, many=True)

        data = {
            "evaluation": evaluation_serializer.data
        }

        return Response(data)
    
class EvaluationDetailAPIView(APIView):
    def get(self, request, id):
        try:
            evaluation = Evaluation.objects.get(pk=id)
        except Evaluation.DoesNotExist:
            return Response(status=404)

        serializer = EvaluationSerializer(evaluation)
        return Response(serializer.data)



class PRPointAPIView(APIView):
    def get(self, request, evaluation_id):
        iou = request.query_params.get('iou', 0.5)
        cat = request.query_params.get('cat', None)
        area = request.query_params.get('area', [0, 10000000000])

        pr_points = PRPoint.objects.filter(evaluation_id=evaluation_id)

        if iou is not None:
            pr_points = pr_points.filter(iou=iou)

        if cat is not None:
            pr_points = pr_points.filter(cat_id=cat) 
        else:
            pr_points = pr_points.filter(cat=None)

        if area is not None:
            pr_points = pr_points.filter(area=area)

        
        serializer = PRPointSerializer(pr_points, many=True)
        return Response(serializer.data)
    

class CategoryListAPIView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
class DatasetListAPIView(APIView):
    def get(self, request):
        datasets = Dataset.objects.all()
        serializer = DatasetSerializer(datasets, many=True)
        return Response(serializer.data)
    




@csrf_exempt
def upload_dataset(request):
    if request.method == 'POST':
        file = request.FILES.get('file')
        if not file:
            return JsonResponse({'error': 'No file uploaded'}, status=400)
        
        media_dir = settings.MEDIA_ROOT
        if not os.path.exists(media_dir):
            os.makedirs(media_dir)
        
        file_path = os.path.join(media_dir, file.name)
        try:
            with open(file_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            
            insert_coco_json_to_db(file_path)
            return JsonResponse({'success': 'File uploaded and data inserted successfully'})
        except Exception as e:
            print(f"Error during file upload: {e}")
            return JsonResponse({'error': 'There was an error processing the file. Please ensure it is in the correct format with all required fields.'}, status=500)
        

@csrf_exempt
def upload_avaliation(request):
    if request.method == 'POST':
        file = request.FILES.get('file')
        if not file:
            return JsonResponse({'error': 'No file uploaded'}, status=400)
        
        media_dir = settings.MEDIA_ROOT
        if not os.path.exists(media_dir):
            os.makedirs(media_dir)
        
        file_path = os.path.join(media_dir, file.name)
        try:
            with open(file_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            
            insert_coco_results_to_db(file_path)
            return JsonResponse({'success': 'File uploaded and data inserted successfully'})
        except Exception as e:
            print(f"Error during file upload: {e}")
            return JsonResponse({'error': 'There was an error processing the file. Please ensure it is in the correct format with all required fields.'}, status=500)

class RecalculateMetricsAPIView(APIView):
    def post(self, request, evaluation_id):
        try:
            evaluation = Evaluation.objects.get(id=evaluation_id)
            calculate_evaluation_metrics(evaluation_id)
            return Response({'message': 'Metrics recalculated successfully'}, status=status.HTTP_200_OK)
        except Evaluation.DoesNotExist:
            return Response({'error': 'Evaluation not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)