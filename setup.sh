#!/bin/bash

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

abort_on_error() {
    echo "Error: $1"
    exit 1
}

if ! command_exists git; then
    abort_on_error "Git no está instalado. Por favor, instala Git desde https://git-scm.com/downloads."
else
    echo "Git ya está instalado."
fi

if ! command_exists docker; then
    abort_on_error "Docker no está instalado. Por favor, instala Docker desde https://www.docker.com/products/docker-desktop."
else
    echo "Docker ya está instalado."
fi

if ! command_exists docker-compose; then
    abort_on_error "Docker Compose no está instalado. Por favor, instala Docker Compose desde https://docs.docker.com/compose/install/"
else
    echo "Docker Compose ya está instalado."
fi

if ! docker info >/dev/null 2>&1; then
    abort_on_error "El demonio de Docker no está corriendo. Por favor, inicia Docker y vuelve a intentarlo."
else
    echo "El demonio de Docker ya está corriendo."
fi

echo "Iniciando el despliegue de la aplicación..."

if [ ! -f .env ]; then
    echo "Creando archivo .env..."
    cat <<EOT >> .env
POSTGRES_DB=database
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1 [::1]
EOT
else
    echo "Archivo .env ya existe, omitiendo creación."
fi

echo "Construyendo imágenes de Docker..."
docker-compose build || abort_on_error "Error al construir las imágenes de Docker."

echo "Levantando contenedores..."
docker-compose up -d || abort_on_error "Error al levantar los contenedores."

echo "Aplicando migraciones de Django..."
docker-compose exec python python manage.py migrate || abort_on_error "Error al aplicar las migraciones de Django."

echo "Creando superusuario de Django..."
docker-compose exec python python manage.py createsuperuser --noinput --username admin --email admin@example.com || abort_on_error "Error al crear el superusuario de Django."

echo "Despliegue completo. La aplicación está corriendo."

echo "Puedes acceder a la aplicación en los siguientes URLs:"
echo "Django Backend: http://localhost:8000"
echo "React Frontend: http://localhost:3000"
