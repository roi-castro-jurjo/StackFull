# Generated by Django 5.0.2 on 2024-03-10 01:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dataset_API', '0005_alter_evaluation_ap_alter_evaluation_ap50_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='annotation',
            old_name='category',
            new_name='category_id',
        ),
        migrations.RenameField(
            model_name='annotation',
            old_name='image',
            new_name='image_id',
        ),
    ]