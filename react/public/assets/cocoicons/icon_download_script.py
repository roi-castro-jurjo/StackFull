import os
import requests

# Crear el directorio para guardar las imágenes
output_dir = "cocoicons"
os.makedirs(output_dir, exist_ok=True)

# Función para descargar una imagen desde una URL
def download_image(url, save_path):
    response = requests.get(url)
    if response.status_code == 200:
        with open(save_path, 'wb') as file:
            file.write(response.content)
    else:
        print(f"Error {response.status_code} al descargar {url}")

# Descargar las imágenes desde las URLs especificadas
base_url = "https://cocodataset.org/images/cocoicons/"

for i in range(1, 101):
    url = f"{base_url}{i}.jpg"
    save_path = os.path.join(output_dir, f"{i}.jpg")
    download_image(url, save_path)

print("Descarga completa")
