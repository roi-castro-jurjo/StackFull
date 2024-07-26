from django.core.management.base import BaseCommand
from dataset_API.models import Evaluation
from dataset_API.utils import calculate_evaluation_metrics  

class Command(BaseCommand):
    help = 'Calculates the metrics for a given evaluation ID.'

    def add_arguments(self, parser):
        parser.add_argument('evaluation_id', type=int, help='The ID of the evaluation to calculate metrics for')

    def handle(self, *args, **options):
        evaluation_id = options['evaluation_id']
        try:
            evaluation = Evaluation.objects.get(pk=evaluation_id)
            calculate_evaluation_metrics(evaluation.id)  # Llama a la función para calcular las métricas
            self.stdout.write(self.style.SUCCESS(f'Successfully calculated metrics for evaluation ID {evaluation_id}'))
        except Evaluation.DoesNotExist:
            self.stdout.write(self.style.ERROR('Evaluation with the specified ID does not exist.'))
