# Generated by Django 5.0.2 on 2024-03-15 14:39

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dataset_API', '0012_annotation_bbox'),
    ]

    operations = [
        migrations.CreateModel(
            name='PRPoint',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('precision', models.FloatField()),
                ('recall', models.FloatField()),
                ('score', models.FloatField()),
                ('iou', models.FloatField()),
                ('area', models.IntegerField()),
                ('cat', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dataset_API.category')),
                ('evaluation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dataset_API.evaluation')),
            ],
            options={
                'db_table': 'metric',
            },
        ),
    ]
