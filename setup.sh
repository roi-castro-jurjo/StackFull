#!/bin/bash

# Función para comprobar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para detener la ejecución en caso de error
abort_on_error() {
    echo "Error: $1"
    exit 1
}

# Comprobación de Git
if ! command_exists git; then
    abort_on_error "Git no está instalado. Por favor, instala Git desde https://git-scm.com/downloads."
else
    echo "Git ya está instalado."
fi

# Comprobación de Docker
if ! command_exists docker; then
    abort_on_error "Docker no está instalado. Por favor, instala Docker desde https://www.docker.com/products/docker-desktop."
else
    echo "Docker ya está instalado."
fi

# Comprobación de Docker Compose
if ! command_exists docker-compose; then
    abort_on_error "Docker Compose no está instalado. Por favor, instala Docker Compose desde https://docs.docker.com/compose/install/"
else
    echo "Docker Compose ya está instalado."
fi

# Comprobación de que el demonio de Docker está corriendo
if ! docker info >/dev/null 2>&1; then
    abort_on_error "El demonio de Docker no está corriendo. Por favor, inicia Docker y vuelve a intentarlo."
else
    echo "El demonio de Docker ya está corriendo."
fi

# Mostrar mensaje de inicio
echo "Iniciando el despliegue de la aplicación..."

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "Creando archivo .env..."
    cat <<EOT >> .env
POSTGRES_DB=database
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
DJANGO_SECRET_KEY=tu_secreto
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1 [::1]
EOT
else
    echo "Archivo .env ya existe, omitiendo creación."
fi

# Construir contenedores
echo "Construyendo imágenes de Docker..."
docker-compose build || abort_on_error "Error al construir las imágenes de Docker."

# Levantar contenedores
echo "Levantando contenedores..."
docker-compose up -d || abort_on_error "Error al levantar los contenedores."

# Aplicar migraciones de Django
echo "Aplicando migraciones de Django..."
docker-compose exec python python manage.py migrate || abort_on_error "Error al aplicar las migraciones de Django."

# Crear superusuario de Django si no existe
echo "Creando superusuario de Django..."
docker-compose exec python python manage.py createsuperuser --noinput --username admin --email admin@example.com || abort_on_error "Error al crear el superusuario de Django."

# Mensaje de finalización
echo "Despliegue completo. La aplicación está corriendo."

# Mostrar URLs de acceso
echo "Puedes acceder a la aplicación en los siguientes URLs:"
echo "Django Backend: http://localhost:8000"
echo "React Frontend: http://localhost:3000"
