from django.urls import path
from .views import JobsAPIView, ClusterInfoAPIView, JobDetailsAPIView, JobHistoryAPIView

urlpatterns = [
    path('', JobsAPIView.as_view(), name='api_jobs'),
    path('cluster_info/', ClusterInfoAPIView.as_view(), name='api_cluster_info'),
    path('<int:job_id>/', JobDetailsAPIView.as_view(), name='api_job_details'),
    path('<int:job_id>/job_history/', JobHistoryAPIView.as_view(), name='api_job_history'),
]
