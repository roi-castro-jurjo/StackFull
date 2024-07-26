from django.db import models
from django.contrib.postgres.fields import ArrayField


class Dataset(models.Model):
    id = models.AutoField(primary_key=True)
    year = models.IntegerField()
    version = models.CharField(max_length=100)
    description = models.TextField()
    contributor = models.CharField(max_length=100)
    url = models.URLField()
    date_created = models.DateField(null=True)

    class Meta:
        db_table = 'dataset'
    
    def __str__(self):
        return self.description


class License(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    url = models.URLField()

    class Meta:
        db_table = 'license'

    def __str__(self):
        return self.name

class Image(models.Model):
    id = models.AutoField(primary_key=True)
    coco_id = models.CharField(max_length=100, null=True)
    width = models.IntegerField()
    height = models.IntegerField()
    file_name = models.CharField(max_length=100)
    flickr_url = models.URLField(blank=True, null=True)
    coco_url = models.URLField(blank=True, null=True)
    date_captured = models.DateTimeField(null=True)
    license = models.ForeignKey(License, on_delete=models.CASCADE)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'image'

    def __str__(self):
        return self.file_name

class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    supercategory = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'category'

    def __str__(self):
        return self.name

class Annotation(models.Model):
    id = models.AutoField(primary_key=True)
    segmentation = models.JSONField()
    area = models.FloatField()
    iscrowd = models.BooleanField()
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    bbox = ArrayField(models.FloatField(), size=4)
    
    class Meta:
        db_table = 'annotation'




class Detection(models.Model):
    id = models.AutoField(primary_key=True)
    x = models.IntegerField()
    y = models.IntegerField()
    width = models.IntegerField()
    height = models.IntegerField()
    score = models.FloatField()
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    evaluation = models.ForeignKey('Evaluation', on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'detection'

class Evaluation(models.Model):
    id = models.AutoField(primary_key=True)
    AP = models.FloatField(null=True)
    AP50 = models.FloatField(null=True)
    AP75 = models.FloatField(null=True)
    APs = models.FloatField(null=True)
    APm = models.FloatField(null=True)
    APl = models.FloatField(null=True)
    avg_conf = models.FloatField(null=True)
    true_positives = models.IntegerField(null=True) 
    false_positives = models.IntegerField(null=True)  
    false_negatives = models.IntegerField(null=True)  
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'evaluation'

class PRPoint(models.Model):
    id = models.AutoField(primary_key=True)
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE)
    precision = models.FloatField()
    recall = models.FloatField()
    score = models.FloatField()
    iou = models.FloatField()
    area = ArrayField(models.BigIntegerField(), size=2)
    cat = models.ForeignKey(Category, on_delete=models.CASCADE, null=True)

    
    class Meta:
        db_table = 'PRPoint'