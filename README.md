# StackFull

## Installation

Follow these steps to install and run the application:

### 1. Clone the repository

Open a terminal and clone the repository to your local machine:
```sh
git clone https://github.com/roi-castro-jurjo/StackFull
```

### 2. Grant execution permissions to the setup.sh script (if necessary)

On some systems, you may need to grant execution permissions to the script:

```sh
chmod +x setup.sh
```

### 3. Run the setup script
   
This script will build the Docker images, start the containers, and apply the necessary migrations:

```sh
./setup.sh
```

### 4. Access the application

Once the containers are running, you can access the following URLs in your browser:

Django Backend: http://localhost:8000
React Frontend: http://localhost:3000


## Additional Notes
Make sure that ports 5432, 8000, and 3000 are free before running the application.

If you encounter any issues, check the container logs for more information on potential errors.
