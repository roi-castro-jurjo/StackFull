# Generated by Django 5.0.2 on 2024-03-10 01:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dataset_API', '0006_rename_category_annotation_category_id_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='detection',
            old_name='image',
            new_name='image_id',
        ),
    ]