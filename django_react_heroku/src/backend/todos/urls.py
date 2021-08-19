from django.urls import path

from . import views

urlpatterns = [
    path('', views.todo_list), # GET - Get all Todos, POST - Add Todos 
]