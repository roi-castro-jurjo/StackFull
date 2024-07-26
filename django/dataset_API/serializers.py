from rest_framework import serializers
from .models import Dataset, Image, License, Category, Annotation, Evaluation, Detection, PRPoint

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = '__all__'
    
class LicenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = License
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ImageSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ['id', 'width', 'height', 'file_name', 'flickr_url', 'coco_url', 'date_captured', 'license', 'coco_id', 'categories']

    def get_categories(self, obj):
        annotations = Annotation.objects.filter(image=obj).values_list('category_id', flat=True).distinct()
        return list(annotations)

class AnnotationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Annotation
        fields = ['id', 'area', 'iscrowd', 'image_id', 'category_id', 'bbox']
        
    

class DetectionSerializer(serializers.ModelSerializer):
    bbox = serializers.SerializerMethodField()

    class Meta:
        model = Detection
        fields = ['id', 'score', 'image_id', 'category_id', 'bbox']
    
    def get_bbox(self, obj):
        if obj is not None:
            return [obj.x, obj.y, obj.width, obj.height]
        else:
            return [0, 0, 0, 0]


class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = '__all__'

class PRPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = PRPoint
        fields = '__all__'