from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class Dataset_Formatted_Pagination(PageNumberPagination):
    page_size = 20 

    def get_paginated_response(self, data):
        return Response({
            'info': data.get('info', {}),
            'images': data.get('images', []),
            'annotations': data.get('annotations', []),
            'licenses': data.get('licenses', []),
            'categories': data.get('categories', []), 
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'count': self.page.paginator.count
        })
    
