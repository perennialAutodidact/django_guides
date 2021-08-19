# Deploy to Heroku with Django REST Framework and React


- [Deploy to Heroku with Django REST Framework and React](#deploy-to-heroku-with-django-rest-framework-and-react)
  - [Setup](#setup)
  - [Setup Backend](#setup-backend)
    - [backend/.env](#backendenv)
    - [main/settings.py](#mainsettingspy)
    - [todos/models.py](#todosmodelspy)
    - [todos/serializers.py](#todosserializerspy)
    - [main/urls.py](#mainurlspy)
    - [todos/urls.py](#todosurlspy)
    - [todos/views.py](#todosviewspy)
    - [Create Todo Objects](#create-todo-objects)
  - [Setup Frontend](#setup-frontend)
    - [Todos.js](#todosjs)

A step-by-step guide for deploying a project with [Django](https://www.djangoproject.com/), [Django REST Framework](https://www.django-rest-framework.org/) (DRF) and [React](https://reactjs.org/) to [Heroku](https://www.heroku.com/) using the Git command line.

We'll be deploying both backend and frontend servers from the same Git repository on Heroku. This guide will assume a basic working knowledge of Django, DRF and React.

This guide is written using a Linux terminal and will use Python 3.9, Django 3.2, DRF 3.12, and React X.X.

As cumbersome as it may be, we'll walk through setting up a simple To Do List REST API with Django & DRF and connecting it to a React application on the frontend that we'll create using `create-react-app`.

## Setup

First, we'll create a directory to house our project. We'll create subdirectories for `backend` and `frontend`.

```bash
heroku_django_react/
├── backend
├── frontend
├── LICENSE.txt
└── .gitignore
```

We'll include `.gitignore` and `LICENSE.txt` in the project-level folder.

Next, we'll setup a Pipenv environment in the `backend` folder and install Django, DRF and other dependencies.

```bash
/backend$ pipenv install django django-rest-framework django-cors-headers python-decouple
```

## Setup Backend

Next, we'll create our Django project.

```bash
/backend$ django-admin startproject main . && python manage.py startapp todos
```

We'll hop into `main/settings.py` to setup a few things.

We'll create a file called `.env` in the `backend` folder to store Django's dev and production secret keys and `DEBUG` boolean. `DEBUG` will be set to `True` by default and we'll keep it that way until we're ready to setup our app for Heroku to help us debug.

### backend/.env
```
DEBUG='True'

DJANGO_SECRET_KEY_DEVELOPMENT='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
DJANGO_SECRET_KEY_PRODUCTION='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

Add the following sections to `main/settings.py`. Leave all other default settings for the time being.

### main/settings.py
```python
# main/settings.py
import decouple

# Pull DEBUG boolean from .env
# Add lines 16-19 to conditionally set
DEBUG = decouple.config('DJANGO_DEBUB', cast=bool)

# set SECRET_KEY based on DEBUG value
if DEBUG:
    SECRET_KEY = decouple.config('DJANGO_SECRET_KEY_DEVELOPMENT')
else:
    SECRET_KEY = decouple.config('DJANGO_SECRET_KEY_PRODUCTION')

INSTALLED_APPS = [
    # ... default apps

    ### ADD
    'rest_framework',
    'corsheaders',
    'todos',
]

MIDDLEWARE = [
    # ADD AT THE TOP
    'corsheaders.middleware.CorsMiddleware',

    # ... other defaults
]

# Add CORS allowed origins and headers
CORS_ORIGIN_WHITELIST = []
CORS_ALLOWED_ORIGINS = []
CSRF_TRUSTED_ORIGINS = []
CORS_ALLOWED_HEADERS = [
    'content-type',
    # 'x-csrftoken', # needed for CSRF cookies
    # 'authorization', # needed for token auth
    # 'withcredentials' # needed for sending cookies in requests/responses
    # ... other headers
]
```

Next we'll set up the `todos` app and populate a few Todo items into the database.

### todos/models.py

Our `Todo` model will only have two fields: `title` and `completed`.
```python
# todos/models.py
from django.db import models

class Todo(models.Model):
    title=models.CharField(max_length=200)
    completed=models.BooleanField(default=False)

    def __str__(self):
        return f"{self.id}. {self.title}\nCompleted:{self.completed}"
```

Make migrations and migrate.

```
/backend$  pipenv run python manage.py makemigrations 
/backend$  pipenv run python manage.py migrate 
```

### todos/serializers.py
Set up a `ModelSerializer` for the `Todo` model which will display all available fields.

```python
# todos/serializers.py
from rest_framework import serializers

from .models import Todo

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = '__all__'
```

### main/urls.py

Include `todos.views` in the project URLs.

```python
# main/urls.py
from django.contrib import admin
from django.urls import path, include # import include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('todos/', include('todos.urls')) # add
]
```

### todos/urls.py

Set up a URL which returns all the Todo items with a GET request and adds an item to the list with a POST request.

```python
#todos/urls.py
from django.urls import path

from . import views

urlpatterns = [
  path('', views.todo_list), # GET - Get all Todos, POST - Add Todos
]
```

### todos/views.py

Let's create CRUD endpoints for our Todo items.

`/todo_list`: GET - retrieve all Todos, POST - create Todo
`/todo_detail/:todo_id/`: GET - retrieve Todo by id, POST - update Todo

```python
# todos/views.py
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
            todos: todo_serializer.data
        }

    elif request.method == 'POST':
        form_data = request.data.get('formData')

        new_todo_serializer = TodoSerializer(data=form_data)

        if new_todo_serializer.is_valid():
            new_todo = new_todo_serializer.save()

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

    todo = Todo.objects.get(id=todo_id)

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
                todo: todo_serializer.data
            }

        elif request.method == 'POST':
            form_data = request.data.get('formData')

            new_todo_serializer = TodoSerializer(todo, data=form_data, partial=True)

            if new_todo_serializer.is_valid():
                new_todo = new_todo_serializer.save()

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
```

### Create Todo Objects

Let's open the Django shell and create a few Todo objects.

```
/backend$ pipenv run python manage.py shell

>>> from todos.models import Todo
>>> todos = dict([('Weed the garden', False), ('Flip the compost', False), ('Prune the grapes', False)])
>>> for title, completed in todos.items():
...    Todo.objects.create(title=title, completed=completed)

1. Weed the garden
Completed:False
2. Flip the compost
Completed:False
3. Prune the grapes
Completed:False
```

Excellent! Now we're ready to move on to the Frontend

## Setup Frontend

Let's navigate into the `frontend` folder and create a React app with `create-react-app`.

```
/frontend$ create-react-app .
```

Once the app is created, we'll clean up the file structure to look like this:

```
frontend/
├── node_modules/
├── src
       ├── App.css
       ├── App.js
       ├── index.css
       └── index.js
├── public
       └── index.html     
├── package.json
└── yarn.lock     
```

We'll also get rid of all boilerplate HTML and styles in `App.js` to start from scratch.

We can also install Axios for making HTTP requests.

```
/frontend$ npm install --s axios
```

### Todos.js

Because we're keeping this app relatively simple, we'll handle all state using the `useState` hook within `Todos.js`.
