from rest_framework import serializers
from cryptography.fernet import Fernet
from django.conf import settings
from .models import UserProfile
from django.contrib.auth.models import User

import logging

logger = logging.getLogger(__name__)

class RegisterSerializer(serializers.ModelSerializer):
    hostname = serializers.CharField(write_only=True)  # Agregar campo hostname

    class Meta:
        model = User
        fields = ['username', 'password', 'hostname']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        logger.info(f"Validated data: {validated_data}")
        try:
            plain_password = validated_data.pop('password')
            hostname = validated_data.pop('hostname')  # Extraer hostname
            cipher_suite = Fernet(settings.ENCRYPTION_KEY)
            encrypted_password = cipher_suite.encrypt(plain_password.encode()).decode()

            user = User.objects.create_user(
                username=validated_data['username'],
                password=plain_password
            )

            # Verificar si el perfil del usuario ya existe antes de crearlo
            if not hasattr(user, 'profile'):
                UserProfile.objects.create(user=user, urls=hostname, encrypted_password=encrypted_password)
            else:
                user.profile.urls = hostname
                user.profile.encrypted_password = encrypted_password
                user.profile.save()

            return user
        except Exception as e:
            logger.error(f"Error creating user profile: {e}")
            raise serializers.ValidationError({"error": str(e)})

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['urls']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'profile']