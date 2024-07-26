from django.core.management.base import BaseCommand
from dataset_API.utils import insert_coco_results_to_db
from dataset_API.models import Dataset

class Command(BaseCommand):
    help = 'Import COCO formatted detection results into the database, prompting for dataset ID if not provided.'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='The path to the COCO formatted results JSON file')
        parser.add_argument('dataset_id', nargs='?', type=int, help='The ID of the Dataset the results are associated with (optional)')

    def handle(self, *args, **kwargs):
        json_file_path = kwargs['json_file']
        dataset_id = kwargs.get('dataset_id')

        if dataset_id is None:
            try:
                dataset_id = int(input('Please enter the dataset ID: '))
            except ValueError:
                self.stdout.write(self.style.ERROR('Invalid dataset ID. Please provide an integer.'))
                return  

        try:
            if not Dataset.objects.filter(id=dataset_id).exists():
                self.stdout.write(self.style.ERROR(f'Dataset with id {dataset_id} does not exist.'))
                return 

            self.stdout.write(self.style.SUCCESS(f'Starting import from {json_file_path} for dataset ID {dataset_id}'))
            
            insert_coco_results_to_db(json_file_path, dataset_id)
            
            self.stdout.write(self.style.SUCCESS('Successfully imported COCO detection results'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error during import: {str(e)}'))