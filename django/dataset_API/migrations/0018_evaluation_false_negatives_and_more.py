# Generated by Django 5.0.2 on 2024-07-26 17:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dataset_API', '0017_alter_prpoint_area'),
    ]

    operations = [
        migrations.AddField(
            model_name='evaluation',
            name='false_negatives',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='false_positives',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='true_positives',
            field=models.IntegerField(null=True),
        ),
    ]
