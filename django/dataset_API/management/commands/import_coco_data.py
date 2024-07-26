from django.core.management.base import BaseCommand
from dataset_API.utils import insert_coco_json_to_db

class Command(BaseCommand):
    help = 'Import COCO formatted JSON data into the database'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='The path to the COCO formatted JSON file')

    def handle(self, *args, **kwargs):
        json_file_path = kwargs['json_file']
        self.stdout.write(self.style.SUCCESS(f'Starting import from {json_file_path}'))
        try:
            insert_coco_json_to_db(json_file_path)
            self.stdout.write(self.style.SUCCESS('Successfully imported COCO data'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error during import: {str(e)}'))
