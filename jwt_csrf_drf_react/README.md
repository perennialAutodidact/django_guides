# Introduction

JSON Web Token & CSRF Token Authentication between a Django REST Framework API and React

<!-- TOC -->

- [Introduction](#introduction)
  - [Setup](#setup)
  - [Overview](#overview)
  - [Environment Variables](#environment-variables)
    - [env](#env)
- [Backend](#backend)
- [Frontend](#frontend)

## Setup

[Top &#8593;](#introduction)

This project will be using **Django 3.1**, **Django REST Framework 3.1.1** and React via **create-react-app 3.4**.

Create a folder `jwt_drf_react` for the project. Inside create a folder for `backend` and `frontend`.

```bash
~/ $ mkdir jwt_def_react && cd mkdir jwt_def_react
jwt_def_react/ $ mkdir backend frontend
```

## Overview

[Top &#8593;](#introduction)

Authentication will require three items:

1. Django's Cross-Site Request Forgery (CSRF) Cookie

   - Standard Django CSRF cookie
   - Sent with each request

2. JSON Web Token (JWT) Access Token

   - Short exipiration
   - Stored in app's state
   - Used to access protected routes

3. JWT Refresh Token

   - Longer expiration
   - Used to request access tokens
   - Stored in an HTTPOnly cookie
   - Associated with foreign key to a user in the database
   - Deleted from database on logout or exipration

When a user registers or logs in, they will be assigned a refresh token and and access token. When request is made for protected data, the access token will be passed to the server via the `Authorization` HTTP Header.

If the access token is expired when sent, the refresh token is checked for validity. If the refresh token hasn't expired, a new access token is returned and the original request is repeated.

If the token isn't expired and the user with the id of the token's `user_id` is authorized to access the data, the data is returned.

The CSRF cookie will also be attached to each request and its existence and validity will be checked.

## Environment Variables

[Top &#8593;](#introduction)

Create a file called `.env` in the `jwt_drf_react` project folder. This file will be used to define environment variables. You will want to add this file the your `.gitignore` file to keep your secrets secret.

### env

```python
DJANGO_DEBUG = 'True'

# Django secret keys
DJANGO_SECRET_KEY_DEVELOPMENT='xxxxxxxxxx'
DJANGO_SECRET_KEY_PRODUCTION='xxxxxxxxxx'

# Key for encoding user refresh tokens
DJANGO_REFRESH_TOKEN_SECRET='xxxxxxxxxx'
```

Current file structure:

```bash
jwt_def_react/
│   .env
│   .gitignore
├───backend
└───frontend
```

# [Backend](backend.md)

# [Frontend](frontend.md)
