from django.contrib import admin

from .models import Dataset, License, Image, Category, Annotation, Detection, Evaluation

# Register your models here.
admin.site.register(Dataset)
admin.site.register(License)
admin.site.register(Image)
admin.site.register(Category)
admin.site.register(Annotation)
admin.site.register(Detection)
admin.site.register(Evaluation)