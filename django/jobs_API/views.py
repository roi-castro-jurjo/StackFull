from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils import get_queued_jobs, get_cluster_info, get_job_details, get_job_history
import logging
from django.contrib.auth import authenticate
import base64



logger = logging.getLogger(__name__)

class JobsAPIView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Basic '):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        auth_data = auth_header.split(' ')[1]
        try:
            decoded_auth_data = base64.b64decode(auth_data).decode('utf-8')
            username, password = decoded_auth_data.split(':')
        except Exception as e:
            return Response({'error': 'Invalid authentication header'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            jobs = get_queued_jobs(username)
            return Response(jobs, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting jobs: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ClusterInfoAPIView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Basic '):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        auth_data = auth_header.split(' ')[1]
        try:
            decoded_auth_data = base64.b64decode(auth_data).decode('utf-8')
            username, password = decoded_auth_data.split(':')
        except Exception as e:
            return Response({'error': 'Invalid authentication header'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            info = get_cluster_info(username)
            return Response(info, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting cluster info: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class JobDetailsAPIView(APIView):
    def get(self, request, job_id):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Basic '):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        auth_data = auth_header.split(' ')[1]
        try:
            decoded_auth_data = base64.b64decode(auth_data).decode('utf-8')
            username, password = decoded_auth_data.split(':')
        except Exception as e:
            return Response({'error': 'Invalid authentication header'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            details = get_job_details(username, job_id)
            return Response(details, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting job details for job {job_id}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class JobHistoryAPIView(APIView):
    def get(self, request, job_id):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Basic '):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        auth_data = auth_header.split(' ')[1]
        try:
            decoded_auth_data = base64.b64decode(auth_data).decode('utf-8')
            username, password = decoded_auth_data.split(':')
        except Exception as e:
            return Response({'error': 'Invalid authentication header'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            history = get_job_history(username, job_id)
            return Response(history, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting job history for job {job_id}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
