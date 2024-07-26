from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    urls = models.TextField()  # Almacena el hostname
    encrypted_password = models.CharField(max_length=256, blank=True, null=True)  # Almacena la contraseña encriptada

    def __str__(self):
        return self.user.username
    
    class Meta:
        db_table = 'user'