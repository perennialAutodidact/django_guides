# Deploy Django Project to Heroku

A step-by-step guide for deploying a [Django](https://www.djangoproject.com/) project to [Heroku](https://www.heroku.com/) using the Git command line.

This guide is written using a Linux terminal and will use Django 3.0 and Python 3.8.

## Create Django Project

This guide will be using a [Pipenv](https://github.com/pypa/pipenv) environment to manage dependencies.

Create a `pipenv` environment in the root directory for your repository.

    $ pipenv shell

Install Django

    $ pipenv install django

Create a Django project inside the Pipenv environment. 

    $ django-admin startproject <PROJECT_NAME>
    
where `<PROJECT_NAME>` is the name of your project.

## Git

We will be using the Git command line to push our code to the Heroku server. Make sure you have [Git](https://git-scm.com/) installed.

To initialize your project as a Git repository, navigate to the top level of your repository and run:

    <PROJECT_NAME> $ git init 
    
Changes to files will need to be committed to this repository in order for them to be pushed to Heroku to be run. 

To see changes that have been made and other untracked files, run:

    <PROJECT_NAME> $ git status 

You can add files individually entering their file paths separated by spaces or by using the `-A` flag

    <PROJECT_NAME> $ git add file_name1 file_name2 directory_1

or

    <PROJECT_NAME> $ git add -A
    
Then commit the changes by running `git commit` with the `-m` flag with a message describing the changes

    <PROJECT_NAME> $ git commit -m 'Created <PROJECT_NAME> Django Project'

## Gunicorn

[Gunicorn](https://gunicorn.org/) is a server for Python Web Server Gateway Interface (WSGI) applications (like your Django app). It is a way to make sure that web servers and python web applications can talk to each other. Gunicorn takes care of everything which happens in-between the web server and your web application.

Install the `gunicorn` package

    $ pipenv install gunicorn

## Create Procfile

The `Procfile` is used to explicitly declare your application’s process types and entry points. 

All commands in the `Procfile` are executed by the app on startup. The `Procfile` should be created without a file extension and placed in the root directory of your repository.

    $ touch Procfile

Add the command `web: gunicorn <PROJECT_NAME>.wsgi` to your `Procfile`:
    
    $ echo 'web: gunicorn <PROJECT_NAME>.wsgi' >> Procfile
    
This will start your project on the Gunicorn server on Heroku.    

More info on the `Procfile` [here](https://devcenter.heroku.com/articles/procfile)

## Environment Variables

Environment variables will be handled using [Python Decouple](https://github.com/henriquebastos/python-decouple), which allows easy access to environment variables using a `.env` file.

Install `python-decouple`

    $ pipenv install python-decouple

In `settings.py`:

    import decouple

In the root directory of your repository, create a file called `.env` which will store sensitive data such as Django's `SECRET_KEY`, database credentials, and API credentials:

    $ touch .env

Generate a 50-character `SECRET_KEY_PRODUCTION` which will be used in production.

    import random
    from string import (
    ascii_letters as letters,
    digits,
    punctuation
    )

    chars = letters + digits + punctuation

    secret_key = ''.join([random.choice(chars) for i in range(50)])

    print(secret_key)

Add this key to the `.env` file as a keyword pair.

    $ echo "DJANGO_SECRET_KEY_PRODUCTION='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'" >> .env

Let's also add Django's `DEBUG` variable to `.env`. 

    $ echo "DJANGO_DEBUG = 'True'" >> .env

In `settings.py`, replace the current definition of the `SECRET_KEY` and `DEBUG` with:

    # cast=bool will convert the string 'True' in .env into a boolean True
    DEBUG = decouple.config('DJANGO_DEBUG', cast=bool)

    # Secret Key - Development vs Production
    if DEBUG:
        # SECURITY WARNING: keep the secret key used in production secret!
        key = 'DJANGO_SECRET_KEY_DEV'
    else:
        key = 'DJANGO_SECRET_KEY_PRODUCTION'
    
    # get the secret key
    SECRET_KEY = decouple.config(key)

If any other environment variables are used in your project, references to them will need to be changed to use `decouple.config()`.

### Config Vars in Heroku

All local environment variables will have to be set in the Heroku environment as well.

    $ heroku config:set <VARIABLE_NAME>='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

These **Config Vars** can also be set at `https://dashboard.heroku.com/apps/<YOUR_APP_NAME>/settings` by clicking the 'Reveal Config Vars' button.

## Static Files

Django does not support serving static files in production. However, the fantastic [WhiteNoise](http://whitenoise.evans.io/en/stable/) project can integrate into your Django application, and was designed with exactly this purpose in mind.

    $ pipenv install whitenoise

In `settings.py`:

    MIDDLEWARE = [
    # Simplified static file serving.
    # https://warehouse.python.org/project/whitenoise/
    # PLACE AT THE TOP
    'whitenoise.middleware.WhiteNoiseMiddleware',
    ...

Your application will now serve static assets directly from Gunicorn in production. This will be perfectly adequate for most applications, but top-tier applications may want to explore using a CDN with Django-Storages.

## PostgresQL

Heroku uses `postgresql` rather than `sqlite3` by default.

You can find instructions for installing PostgreSQL in your local environment [here](https://devcenter.heroku.com/articles/heroku-postgresql#local-setup).

To use PostgreSQL as your database in Python applications you will need to use the `psycopg2` package.

    $ pipenv install psycopg2

In `settings.py`:

    import psycopg2

    DATABASE_URL = decouple.config('DATABASE_URL')

    conn = psycopg2.connect(DATABASE_URL, sslmode='require')

If you leave off `sslmode=require` you may get a connection error when attempting to connect to production-tier databases.

Install `dj-database-url`

    $ pipenv install dj-database-url

In `settings.py`:

    import dj_database_url

    ...

    DATABASES['default'] = dj_database_url.config(conn_max_age=600, ssl_require=True)

This will parse the values of the `DATABASE_URL` environment variable and convert them to something Django can understand.

Now that PostgreSQL has been set up in Django, let's try pushing our code to Heroku.

## django-heroku

The [Django-Heroku](https://github.com/heroku/django-heroku) package will help us automatically set up our `DATABASE_URL`, `ALLOWED_HOSTS`, WhiteNoise (for static assets), Logging, and Heroku Continuous Integration (CI) for your application.

as specified in the [Django Deployment Checklist](https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/).

`django-heroku` is compatible with Django 2.0 applications as well as Django 3.0 applications. Only Python 3 is supported.

Install the `django-heroku` package

    $ pipenv install django-heroku

In `settings.py`:

At the top:

    import django_heroku

At the very bottom:

    django_heroku.settings(locals())

## Heroku

Create a new Heroku app.

    $ heroku apps:create <APP_NAME>

Link your project repository to the Heroku app

    $ heroku git:remote -a <APP_NAME>

After pushing the code to Heroku, Heroku may create a PostgreSQL database for you automatically. To check to see if a database was created, run:

    $ heroku addons

This will display a list of the addons attached to the current heroku app.

If no PostgreSQL database was created, the following command can be used:

    heroku addons:create heroku-postgresql:<PLAN_NAME>

where `<PLAN_NAME>` is the name of the [Heroku PostreSQL Plan](https://devcenter.heroku.com/articles/heroku-postgres-plans) you want for your database. 

For now we'll set up the database with Heroku's free plan with the name of `hobby-dev`, which allows 10,000 database rows for free. 

The final command will look like this:

    heroku addons:create heroku-postgresql:hobby-dev

You can view more info about the current database by running:

    $ heroku pg

As long as a `Pipfile`, `Pipfile.lock` or `requirements.txt` file are included in your project, Heroku shouldn't have trouble installing the dependencies on your server. Using Pipenv will generate both a `Pipfile` and `Pipfile.lock`, so you should be okay.

If you want to generate a `requirements.txt` file you can run

    $ pipenv run pip freeze > requirements.txt
    
Add and commit all local changes in your repository.

Push the changes to Heroku

    $ pipenv run git push heroku master

Once successfully pushed, we need to apply our database migrations:

    $ heroku run python manage.py migrate

Bash can also be run from within Heroku with:

    $ heroku run bash

This will open a shell instance on the Heroku Dyno and all commands entered will be the same as if having entered `$ heroku run <COMMAND>`

Create a superuser for your app on Heroku with the Heroku shell:

    Running bash on ⬢ <APPNAME>... up, run.5514 (Free)
    ~ $ python manage.py createsuperuser

Enter a username and password for the superuser.

To return to your local machine in the terminal, enter:

    ~ $ exit

## Extra

Follow the [Django Deployment Checklist](https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/) to make sure you have tied up all loose ends before pushing to production.
