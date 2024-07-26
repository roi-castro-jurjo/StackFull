from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from cryptography.fernet import Fernet
from django.conf import settings
from django.core.cache import cache

import logging

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        logger.info(f"Received data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            logger.info(f"Validated data: {serializer.validated_data}")
            self.perform_create(serializer)
            return Response(serializer.data)
        else:
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=400)

    def perform_create(self, serializer):
        serializer.save()
    
class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            try:
                profile = user.profile
                cipher_suite = Fernet(settings.ENCRYPTION_KEY)
                decrypted_password = cipher_suite.decrypt(profile.encrypted_password.encode()).decode()
                
                # Actualizar la base de datos con las credenciales
                profile.encrypted_password = cipher_suite.encrypt(password.encode()).decode()
                profile.urls = request.data.get('hostname', profile.urls)  # Actualizar hostname si es proporcionado
                profile.save()

                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            except Exception as e:
                logger.error(f"Error storing user credentials in database: {e}")
                return Response({'error': 'Failed to store user credentials'}, status=500)
        return Response({'error': 'Invalid credentials'}, status=401)


class ValidateTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({'detail': 'Token is valid'}, status=200)
    
class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)