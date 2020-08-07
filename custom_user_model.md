# Profile Images in Django

This guide will walk through the steps necessary to create a custom user model in Django by extending Django's `django.contrib.auth.models.AbstractUser` class.

This process will be necessary anytime the user model needs extra fields that Django's built-in `django.contrib.auth.models.User` class doesn't provide.

For the sake of simplicity, `django.contrib.auth.models.AbstractUser` and `django.contrib.auth.models.User` will be referred to as `AbstractUser` and `User`, respectively.

By default the `User` class contains the following fields:

|     Field          |             Type              |
|--------------------|-------------------------------|
|     `username`     |           CharField           |   
|    `first_name`    |           CharField           |
|     `last_name`    |           CharField           |
|      `email`       |           EmailField          |
|     `password`     |           CharField           |    
|      `groups`      |     ManyToMany with Group     |
| `user_permissions` |  ManyToMany with Permission   |    
|     `is_staff`     |            Boolean            |
|    `is_active`     |            Boolean            |
|   `is_superuser`   |            Boolean            |
|    `last_login`    |            DateTime           |
-----------------------------------------------------

If you need to customize any of these fields or if your user model will require fields that don't appear on this list, you will need to extend the `AbstractUser` class.

It can be tricky to change the user model after rows have been added to the database, so it is highly recommended that this is set up at the very beginning, even if you don't know if you need extra fields. You can read more about changing user models mid-project [here](https://docs.djangoproject.com/en/3.0/topics/auth/customizing/#changing-to-a-custom-user-model-mid-project).

`AbstractUser` performs the same way as `User`, so it's never a bad idea to use it anyway.

Be sure not to confuse `AbstractUser` for `AbstractBaseUser` in `django.contrib.auth.models`. `AbstractBaseUser` only contains the authentication functionality, and no actual fields.

## Environment

The project in this guide will be setup in a **[Pipenv](https://pipenv-fork.readthedocs.io/en/latest/)** environment and all commands will be issed from within the environment unless otherwise noted. Commands will be executed on a Linux terminal.

## Project Setup

Create a directory for your project and navigate into it

    $ mkdir <PROJECT_NAME>
    $ cd <PROJECT_NAME>

Create the Pipenv environment

    $ pipenv shell

Install Django

    $ pipenv install django

Start a Django project

    $ django-admin startproject <PROJECT_NAME> .

The dot after `<PROJECT_NAME>` will tell Django to start the project in the current directory.

Create `users` app

    $ python manage.py startapp users

Create `profile_images` app

    $ python manage.py startapp profile_images

In your project's `settings.py`, add `users` and `profile_images` to the list of installed apps.

    INSTALLED_APPS = [
        'django.contrib.admin',
        'django.contrib.auth',
        ...
        ...
        ...
        'users',           # add this
        'profile_images',  # add this
    ]

## Custom User Model

Now we will extend the built-in `AbstractUser` model in order to add extra fields to our `CustomUser` model. 

We could call our extended model `User`, but to avoid confusing with Django's default `User` model, we'll call ours `CustomUser`.

In `users/models.py`:

    from django.contrib.auth.models import AbstractUser

    class CustomUser(AbstractUser):
        # we're not adding any new fields yet so we'll just
        pass
    
    def __str__(self):
        return self.username
        
That's really all it takes. Now our `CustomUser` model is ready to accept new fields.

We do have a few more things to configure to get our `CustomUser` model ready for use.

In `settings.py`, near the bottom we can set the `AUTH_USER_MODEL` variable to point to the name of our `CustomUser`.

    AUTH_USER_MODEL = 'users.CustomUser'

Notice that we first refer to the name of the app in which our `CustomUser` model is defined. In this case it's our `users` app.

We need to register our new `CustomUser` model in `users/admin.py`:

    from django.contrib import admin
    from django.contrib.auth.admin import UserAdmin # add
    from .models import CustomUser                  # add

    # Register our user model and the UserAdmin
    admin.site.register(CustomUser, UserAdmin)      # add

## Migrate

Apply changes to the database.

    $ python manage.py makemigrations
        Migrations for 'users':
          users/migrations/0001_initial.py
              - Create model CustomUser
    
    $ python manage.py migrate
      Operations to perform:
        Apply all migrations: admin, auth, contenttypes, sessions, users
      Running migrations:
        Applying contenttypes.0001_initial... OK
        Applying contenttypes.0002_remove_content_type_name... OK
        Applying auth.0001_initial... OK
        Applying auth.0002_alter_permission_name_max_length... OK
        Applying auth.0003_alter_user_email_max_length... OK
        Applying auth.0004_alter_user_username_opts... OK
        Applying auth.0005_alter_user_last_login_null... OK
        Applying auth.0006_require_contenttypes_0002... OK
        Applying auth.0007_alter_validators_add_error_messages... OK
        Applying auth.0008_alter_user_username_max_length... OK
        Applying auth.0009_alter_user_last_name_max_length... OK
        Applying auth.0010_alter_group_name_max_length... OK
        Applying auth.0011_update_proxy_permissions... OK
        Applying auth.0012_alter_user_first_name_max_length... OK
        Applying users.0001_initial... OK
        Applying admin.0001_initial... OK
        Applying admin.0002_logentry_remove_auto_add... OK
        Applying admin.0003_logentry_add_action_flag_choices... OK
        Applying sessions.0001_initial... OK

## That's it!

Now we're ready to start adding fields to our `CustomUser` model. 