from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from .models import Todo

@api_view(['GET', 'POST'])
def todo_list(request):
    # create empty DRF Response object
    response = Response()

