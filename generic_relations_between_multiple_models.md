# Generic Relations Between Multiple Models

Recently I was creating a Django app to emulate the journaling technique known as the [Bullet Journal](https://bulletjournal.com/), which uses a series of Notes, Tasks and Events to plan out each day, month and year. 

These elements are able to be nested so that they can all be used as attributes of one another - tasks that have memorable events and notes associated with them, tasks that have other tasks that describe the various steps and notes about each, and any other permutations of the three that one could imagine.

In trying to design the database for my project, I immediately though of using Django's `ManyToManyField` to represent these relationships. So, I started by creating my `Note`, `Task` and `Event`models.

```python
from django.db import models

class Note(models.Model):
    text = models.CharField(max_length=1000)

    # set up relationships
    notes = models.ManyToManyField('self', on_delete=models.CASCADE, symmetrical=False)
    events = models.ManyToManyField(Event, on_delete=models.CASCADE)
    tasks = models.ManyToManyField(Task, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.id} - {self.text}'
```

However, I quickly realized that this only allowed the models to be parents or children to themselves and not any of the other two models, unless many-to-many relationships were used for all three models.

A little research introduced me to Django's [contenttypes framework](https://docs.djangoproject.com/en/3.2/ref/contrib/contenttypes/), which allows objects from different models to be associated with one another through foreign key associations the `ContentType` model.

According to the Django docs for the [GenericForeignKey](https://docs.djangoproject.com/en/3.2/ref/contrib/contenttypes/#django.contrib.contenttypes.fields.GenericForeignKey) field:

> "A normal ForeignKey can only “point to” one other model. The contenttypes application provides a special field type (GenericForeignKey) which works around this and allows the relationship to be with any model."

This sounded perfect for allowing each of my three models to be related to one another using a singular field. To set this up, I created a generic `JournalItem` model to manage the relationships between the other models. 

There are three required fields when setting up a `GenericForeignKey`

There are three parts to setting up a GenericForeignKey:

1. Give your model a ForeignKey to ContentType. The usual name for this field is “content_type”.

2. Give your model a field that can store primary key values from the models you’ll be relating to. For most models, this means a PositiveIntegerField. The usual name for this field is “object_id”.

3. Give your model a GenericForeignKey, and pass it the names of the two fields described above. If these fields are named “content_type” and “object_id”, you can omit this – those are the default field names GenericForeignKey will look for.

### journals/models.py
```python
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType

class JournalItem(models.Model):
    NOTE = 'N'
    TASK = 'T'
    EVENT = 'E'

    # define types of items for the item_type field
    ITEM_TYPES = (
        (NOTE, 'Note'),
        (TASK, 'Task'),
        (EVENT, 'Event'),
    )

    # item_type denotes whether the JournalItem is a Note, Task or Event object
    item_type = models.CharField(max_length=1, choices=ITEM_TYPES)

    # the user that is creating the item
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    # ... other fields that will be on every Note, Task or Event

    # mandatory fields for setting up GenericRelations
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="object_item")
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
```

Now we can head to a view function or to the Django shell to create some JournalItems.

### journals/views.py
```python
from django.contrib.auth import get_user_model

from journals.models import Note, Task, Event, JournalItem

def get_journal_items(request):
    # delete all JournalItems, Notes and Tasks for testing
    JournalItem.objects.all().delete()
    Note.objects.all().delete()
    Task.objects.all().delete()
    Event.objects.all().delete()

    # This will ultimately be request.user
    user = get_user_model().objects.first()

    
```