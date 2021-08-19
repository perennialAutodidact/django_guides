from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from .models import Todo
from .serializers import TodoSerializer

@api_view(['GET', 'POST'])
def todo_list(request):
    '''
    GET  - Retrieve all Todos
    POST - Create Todo
    '''
    # create empty DRF Response object
    response = Response()

    if request.method == 'GET':
        todos = Todo.objects.all()


        todo_serializer = TodoSerializer(todos, many=True)

        response.data = {
            'todos': todo_serializer.data
        }

        return response
    
    elif request.method == 'POST':
        form_data = request.data.get('formData')

        new_todo_serializer = TodoSerializer(data=form_data)

        if new_todo_serializer.is_valid():
            new_todo_serializer.save()

            response.data = {
                'todo': new_todo_serializer.validated_data,
                'message': 'Item added to the list'
            }

        else:
            response.status = status.HTTP_400_BAD_REQUEST
            response.data = {
                'message': new_todo_serializer.errors
            }

    return response


@api_view(['GET', 'POST'])
def todo_detail(request, todo_id):
    '''
    GET  - Retrieve single Todo
    POST - Update Todo
    '''
    # create empty DRF Response object
    response = Response()

    todo = Todo.objects.filter(id=todo_id).first()

    if not todo:
        response.status_code = status.HTTP_400_BAD_REQUEST
        response.data = {
                'message': 'Item not found'
            }

    # if the todo item was retrieved
    else:
        if request.method == 'GET':
            todo_serializer = TodoSerializer(todo)

            response.data = {
                'todo': todo_serializer.data
            }

        elif request.method == 'POST':
            form_data = request.data

            new_todo_serializer = TodoSerializer(todo, data=form_data, partial=True)

            if new_todo_serializer.is_valid():
                new_todo = new_todo_serializer.save()

                response.data = {
                    'todo': new_todo_serializer.validated_data,
                    'message': 'Item updated'
                }

            else:
                response.status = status.HTTP_400_BAD_REQUEST
                response.data = {
                    'message': new_todo_serializer.errors
                }
    
    return response



@api_view(['POST'])
def todo_delete(request, todo_id):
    '''
    POST - delete the todo with the given id
    '''
    response = Response()

    todo = Todo.objects.filter(id=todo_id).first()

    if todo:

        todo.delete()

        response.data = {
            'message': 'Todo deleted'
        }

    else:
        response.status_code = status.HTTP_400_BAD_REQUEST
        response.data = {
                'message': 'Item not found'
            }

    return response
