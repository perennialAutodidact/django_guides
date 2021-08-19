# Deploy to Heroku with Django REST Framework and React


- [Deploy to Heroku with Django REST Framework and React](#deploy-to-heroku-with-django-rest-framework-and-react)
  - [Setup](#setup)
    - [backend/.env](#backendenv)
    - [main/settings.py](#mainsettingspy)
    - [todos/models.py](#todosmodelspy)
    - [todos/serializers.py](#todosserializerspy)
    - [main/urls.py](#mainurlspy)
    - [todos/urls.py](#todosurlspy)
    - [todos/views.py](#todosviewspy)

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
from django.db import models

class Todo(models.Model):
    title=models.CharField(max_length=200)
    completed=models.BooleanField(default=False)

def str(self):
    return f"{self.id}. {self.title}\nCompleted:{self.completed}"
```

### todos/serializers.py
Set up a `ModelSerializer` for the `Todo` model which will display all available fields.

```python
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
from django.contrib import admin
from django.urls import path, include # import include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('todos/', include('todos.views')) # add
]
```

### todos/urls.py

Set up a URL which returns all the Todo items with a GET request and adds an item to the list with a POST request.

```
from django.urls import path

from . import views

urlpatterns = [
  path('', views.todo_list), # GET - Get all Todos, POST - Add Todos
]
```

### todos/views.py

Create a decorated view function for our `todo_list` API endpoint.
which returns all the Todo items with a GET request and adds an item to the list with a POST request.

```python



```