# Customize Error messages for Models and Forms

This guide is for overwriting the error messages that appear when creating a model instance or submitting a form in Django.

For instance, if you have a model field with the `unique=True` option, you can customize the message that appears if a user tries to enter a duplicate of that model.

```python
class User(AbstractUser):
    email = models.EmailField(
    'email address', 
    unique=True, 
    error_messages={'unique':"This email has already been registered."}
    )
```

The `error_messages` option can be used on form fields as well. 

```python
email = forms.EmailField(error_messages={'invalid': 'Your email address is incorrect'})
```

These error messages will come back in the HTTP response when a user tries to register an email that is already registered.
