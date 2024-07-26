from django.urls import path

from . import views

urlpatterns = [
    path('', views.DatasetAPIView.as_view(), name='dataset_api'),
    path('list/', views.DatasetListAPIView.as_view(), name='datasets_list_api'),
    path('<int:dataset_id>/image/<int:image_id>/', views.ImageAPIView.as_view(), name='image_api'),
    path('<int:dataset_id>/evaluations/', views.EvaluationAPIView.as_view(), name='evaluation_api'),
    path('evaluations/<int:evaluation_id>/pr_points', views.PRPointAPIView.as_view(), name='prpoints-api'),
    path('images', views.AllImagesAPIView.as_view(), name='all_images_api'),
    path('images/<int:coco_id>/', views.ImageByCocoIDAPIView.as_view(), name='image_detail_api'),
    path('evaluations/<int:id>/', views.EvaluationDetailAPIView.as_view(), name='evaluation_detail'),
    path('categories/', views.CategoryListAPIView.as_view(), name='category-list'),
    path('upload-dataset/', views.upload_dataset, name='upload_dataset'),
    path('upload-avaliation/', views.upload_avaliation, name='upload_avaliation'),
    path('recalculate_metrics/<int:evaluation_id>/', views.RecalculateMetricsAPIView.as_view(), name='recalculate_metrics'),
]