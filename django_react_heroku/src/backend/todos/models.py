from django.db import models

class Todo(models.Model):
    title=models.CharField(max_length=200)
    completed=models.BooleanField(default=False)

def str(self):
    return f"{self.id}. {self.title}\nCompleted:{self.completed}"