# Frontend

- [Frontend](#frontend)
  - [Frontend Dependencies](#frontend-dependencies)
  - [public/index.html](#publicindexhtml)
  - [src/index.js](#srcindexjs)
  - [Utils](#utils)
  - [context/types.js](#contexttypesjs)
  - [Context](#context)
  - [Auth Context](#auth-context)
    - [authContext.js](#authcontextjs)
    - [AuthState.js](#authstatejs)
    - [authReducer.js](#authreducerjs)
  - [Alert Context](#alert-context)
    - [alerts/alertContext.js](#alertsalertcontextjs)
    - [alerts/AlertState.js](#alertsalertstatejs)
    - [alerts/alertReducer.js](#alertsalertreducerjs)
  - [Components](#components)
    - [app.js](#appjs)
    - [Components Folder](#components-folder)
      - [Layout](#layout)
        - [Navbar.js](#navbarjs)
        - [Spinner.js](#spinnerjs)
        - [Alerts.js](#alertsjs)
      - [Pages](#pages)
        - [Home.js](#homejs)
        - [UserDetail.js](#userdetailjs)
      - [Auth](#auth)
        - [Register.js](#registerjs)
        - [Login.js](#loginjs)
        - [PrivateRoute.js](#privateroutejs)

[Top &#8593;](#frontend)

Navigate into the `frontend` directory inside the main `jwt_drf_react` project folder. From here we'll use create-react-app to start our front end React project.

```bash
jwt_drf_react/ $ cd frontend && npx create-react-app .
```

Notice the . in place of an app name.

File structure after deleting some of the React boilerplate files:

```bash
frontend/
│    node_modules/
│    package.json
│    package-lock.json
├─── public
│        index.html
│        robots.txt
├─── src
│        App.css
│        App.js
│        index.js
```

## Frontend Dependencies

[Top &#8593;](#frontend)

- Axios
  - for HTTP requests
- react-router-dom
  - for routing between React components
- bootstrap / jQuery / popper.js
  - layout/styling

Install frontend dependencies

```bash
frontend/ $ npm install axios react-router-dom bootstrap jquery popper.js
```

## public/index.html

[Top &#8593;](#frontend)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Authenticate users with a combo of
       JSON Web Tokens and Django's CSRF Token. Django
       REST Framework API on the backend and React on the front"
    />

    <title>JWT, DRF & React</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

## src/index.js

[Top &#8593;](#frontend)

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import AuthState from './context/auth/AuthState';
import AlertState from './context/alerts/AlertState';

ReactDOM.render(
  <React.StrictMode>
    <AuthState>
      <AlertState>
        <App />
      </AlertState>
    </AuthState>
  </React.StrictMode>,
  document.getElementById('root')
);
```

Most of the changes we'll be making will be within the `src/` folder.

## Utils

[Top &#8593;](#frontend)
To avoid having to manually include the `Authorization` header in each Axios request, it can be set automatically when `AuthState.js` is loaded. We'll create a function to do this for us.

Create a folder called `utils` which will store this function. Inside we'll create a file called `setAccessToken.js`.

```javascript
import axios from 'axios';

const setAccessToken = accessToken => {
  if (accessToken) {
    axios.defaults.headers.common['Authorization'] = `token ${accessToken}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default setAccessToken;
```

## context/types.js

[Top &#8593;](#frontend)

This file contains the different ways we'll be changing the auth state. They will be used by the Auth Reducer to return updated data to state.

```javascript
// context/types.js

export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAIL = 'REGISTER_FAIL';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const LOGOUT = 'LOGOUT';
export const LOAD_USER_SUCCESS = 'LOAD_USER_SUCCESS';
export const LOAD_USER_FAIL = 'LOAD_USER_FAIL';
export const EXTEND_TOKEN_SUCCESS = 'EXTEND_TOKEN_SUCCESS';
export const EXTEND_TOKEN_FAIL = 'EXTEND_TOKEN_FAIL';
export const SET_ALERT = 'SET_ALERT';
export const CLEAR_ALERTS = 'CLEAR_ALERTS';
```

## Context

[Top &#8593;](#frontend)

This app will utilize function-based components, React's Context API and React Hooks to manage state.

First we'll create a directory called `context` to store our auth context files.

Inside we'll create a file called `types.js` and two more directories called `auth` and `alerts`.

## Auth Context

[Top &#8593;](#frontend)

Inside `context/auth/` we'll create three files

- `AuthState.js`
- `authContext.js`
- `authReducer.js`

Inside `context/alerts/` we'll create three files

- `AlertState.js`
- `alertContext.js`
- `alertReducer.js`

The `src/` directory should now look like this:

```bash
src/
│   App.css
│   App.js
│   index.css
│   index.js
│
└───context
    │   types.js
    │
    └───alerts
    │       alertContext.js
    │       alertReducer.js
    │       AlertState.js
    │
    └───auth
    │       authContext.js
    │       authReducer.js
    │       AuthState.js
    │
    └─── utils
    │       setAccessToken.js
```

### authContext.js

[Top &#8593;](#frontend)

```javascript
import { createContext } from 'react';

const AuthContext = createContext();

export default AuthContext;
```

### AuthState.js

[Top &#8593;](#frontend)

State and methods for authenitcating users

```javascript
// context/auth/AuthState.js
import React, { useReducer } from 'react';
import axios from 'axios';
import setAccessToken from '../../utils/setAccessToken';

import AuthContext from './authContext';
import authReducer from './authReducer';

import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOAD_USER_SUCCESS,
  LOAD_USER_FAIL,
  LOGOUT,
  EXTEND_TOKEN_SUCCESS,
  EXTEND_TOKEN_FAIL,
  SET_ALERT,
  CLEAR_ALERTS,
} from '../types'; // action types to dispatch to reducer

const BASE_URL = 'http://localhost:8000/users';

const AuthState = props => {
  const initialState = {
    accessToken: null, // logged in user's current access token
    isAuthenticated: false, // boolean indicating if a user is logged in
    messages: null, // response messages
    messageType: '',
    user: null, // object with auth user data
    loading: true, // no response yet from api
  };

  // initialize the auth reducer and access auth state
  const [state, dispatch] = useReducer(authReducer, initialState);

  // destructure state
  const { accessToken } = state;

  // set 'Authorization' header in Axios
  setAccessToken(accessToken);

  // request a new access token
  const requestAccessToken = async () => {
    try {
      const config = {
        'Content-Type': 'application/json',
        withCredentials: true,
      };
      const response = await axios.get(BASE_URL + '/token/', config);

      // Dispatch accessToken to state
      dispatch({
        type: EXTEND_TOKEN_SUCCESS,
        // payload is the new access token
        payload: response.data,
      });

      loadUser();
    } catch (error) {
      dispatch({
        type: EXTEND_TOKEN_FAIL,
        // no message to display
        payload: {
          messages: null,
          messageType: null,
        },
      });
    }
  };

  // register new user. async because of axios call
  const register = async formData => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        withCredentials: true, // required to set the refreshtoken cookie in the browser!!!
      },
    };

    try {
      // POST to api register view
      const response = await axios.post(BASE_URL + '/', formData, config);

      // dispatch register success to user and pass the user's token as payload
      dispatch({
        type: REGISTER_SUCCESS,
        payload: {
          accessToken: response.data.accessToken,
          // 'Login successful!
          messages: response.data.msg,
          messageType: 'success',
        },
      });
      loadUser();
    } catch (error) {
      // dispatch register fail to reducer and display alerts
      dispatch({
        type: REGISTER_FAIL,
        payload: {
          messages: error.response.data.msg,
          messageType: 'danger',
        },
      });
    }
  };

  // login user. async because of axios call
  const login = async formData => {
    const config = {
      'Content-Type': 'application/json',
      withCredentials: true, // required to set the refreshtoken cookie in the browser!!!
    };

    try {
      // POST to users/login/
      const response = await axios.post(BASE_URL + '/login/', formData, config);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          accessToken: response.data.accessToken,
          messages: response.data.msg,
          messageType: 'success',
        },
      });

      loadUser();
    } catch (error) {
      dispatch({
        type: LOGIN_FAIL,
        payload: {
          messages: error.response.data.msg,
          messageType: 'danger',
        },
      });
    }
  };

  // get user object from accessToken
  const loadUser = async () => {
    const headers = {
      'Content-Type': 'application/json',
      withCredentials: true,
    };

    try {
      const response = await axios.get(BASE_URL + '/auth/');

      dispatch({
        // payload is the user object
        type: LOAD_USER_SUCCESS,
        payload: response.data.user,
      });
    } catch (error) {
      // if the access token is expired when the request is made,
      // use the refresh token to request a new one
      if (error.response.data.msg === 'Access token expired') {
        requestAccessToken();
      }

      dispatch({
        type: LOAD_USER_FAIL,
        payload: { messages: null, messageType: null },
      });
    }
  };

  const logout = async () => {
    const headers = {
      'Content-Type': 'application/json',
      withCredentials: true,
    };

    try {
      const response = await axios.post(BASE_URL + '/logout/', {
        user: state.user.id,
      });

      dispatch({
        type: LOGOUT,
        payload: { messages: response.data.msg, messageType: 'success' },
      });
    } catch (error) {
      dispatch({
        type: LOGOUT,
        payload: { messages: null, messageType: null },
      });
    }
  };

  // clear alerts
  const clearAlerts = () => dispatch({ type: CLEAR_ALERTS });

  return (
    <AuthContext.Provider
      value={{
        // provide auth state items and methods to app
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        messages: state.messages,
        messageType: state.messageType,
        register,
        login,
        loadUser,
        requestAccessToken,
        logout,
        clearAlerts,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
```

### authReducer.js

[Top &#8593;](#frontend)

The Reducer will handle changes to state. Actions from `types.js` will be dispatched to the reducer along with a payload for each action. The payload state will be updated with the data in the payload.

```javascript
// context/auth/authReducer.js

import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOAD_USER_SUCCESS,
  LOAD_USER_FAIL,
  LOGOUT,
  EXTEND_TOKEN_SUCCESS,
  EXTEND_TOKEN_FAIL,
  CLEAR_ALERTS,
} from '../types'; // action types

// depending on the type passed to dispatch() in AuthState,
// change state accordingly
export default (state, action) => {
  switch (action.type) {
    default:
      return {
        ...state,
      };
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        messages: action.payload.messages,
        messageType: action.payload.messageType,
        loading: false,
      };
    case REGISTER_FAIL:
    case LOGIN_FAIL:
    case LOAD_USER_FAIL:
    case EXTEND_TOKEN_FAIL:
    case LOGOUT:
      return {
        ...state,
        accessToken: null,
        isAuthenticated: false,
        user: null,
        messages: action.payload.messages,
        messageType: action.payload.messageType,
        loading: false,
      };
    case LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        loading: false,
        messages: null,
        messageType: null,
      };
    case EXTEND_TOKEN_SUCCESS:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        loading: false,
        messages: null,
        messageType: null,
      };
    case CLEAR_ALERTS:
      return {
        ...state,
        message: null,
        messageType: null,
      };
  }
};
```

## Alert Context

We'll need a way to display response messages to the user to let them know about successes and failures of our different API calls. These files will follow the same pattern as the Auth Context.

Create another folder within `src/context` called `alerts`.

Inside create the following:

### alerts/alertContext.js

```javascript
// context/alerts/alertContext.js

import { createContext } from 'react';

const AlertContext = createContext();

export default AlertContext;
```

### alerts/AlertState.js

[Top &#8593;](#frontend)

```javascript
// context/alerts/AlertState.js

import React, { useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';

import AlertContext from './alertContext';
import alertReducer from './alertReducer';

import { SET_ALERT, CLEAR_ALERTS } from '../types';

const AlertState = props => {
  const initialState = []; // blank list of alert messages

  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Set Alert
  const setAlert = (msg, type, timeout = 3000) => {
    // create a unique identifier for each alert
    const id = uuidv4();

    dispatch({ type: SET_ALERT, payload: { msg, type, id } });

    // remove alerts after a few seconds
    setTimeout(() => dispatch({ type: CLEAR_ALERTS, payload: id }), timeout);
  };

  return (
    <AlertContext.Provider
      value={{
        // provide alerts to app
        alerts: state,
        setAlert,
      }}
    >
      {props.children}
    </AlertContext.Provider>
  );
};

export default AlertState;
```

### alerts/alertReducer.js

[Top &#8593;](#frontend)

```javascript
// context/alerts/alertReducer.js

import { SET_ALERT, CLEAR_ALERTS } from '../types';

export default (state, action) => {
  switch (action.type) {
    default:
      return state;
    case SET_ALERT:
      // add alert in payload to list of alert to display
      return [...state, action.payload];
    case CLEAR_ALERTS:
      // remove alerts that aren't in the current list
      return state.filter(alert => alert.id !== action.payload);
  }
};
```

## Components

### app.js

[Top &#8593;](#frontend)

```javascript
// components/app.js

import React, { useContext, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import './App.css';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import AuthContext from './context/auth/authContext';
import AlertContext from './context/alerts/alertContext';

import Register from './components/auth/Register';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';

import Alerts from './components/layout/Alerts';
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import UserDetail from './components/pages/UserDetail';

const App = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { requestAccessToken, user, messages } = authContext;
  const { setAlert } = alertContext;

  useEffect(() => {
    // if refresh token exists, request new access token
    requestAccessToken();
  }, []); // empty [] ensures this only runs once when App.js is mounted

  return (
    <div className='App'>
      <Router>
        <Navbar />
        <Alerts />
        <Route exact path='/' component={Home} />
        <Route exact path='/register' component={Register} />
        <Route exact path='/login' component={Login} />
        <PrivateRoute path='/account' component={UserDetail} user={user} />
      </Router>
    </div>
  );
};

export default App;
```

### Components Folder

We'll need a folder for components inside the `src` folder.

Inside we'll be create the following folders and components:

#### Layout

- `Navbar.js`
  - Navigating between components
- `Spinner.js`
  - Loading spinner displayed as API data is loaded
- `Alerts.js`
  - Display alerts

##### Navbar.js

[Top &#8593;](#frontend)

```javascript
// components/layout/Navbar.js

import React, { Fragment, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';

import AuthContext from '../../context/auth/authContext';

const Navbar = () => {
  const authContext = useContext(AuthContext);

  const { logout } = authContext;

  const onLogout = () => {
    logout();
  };

  const {
    isAuthenticated,
    user,
    accessToken,
    requestAccessToken,
  } = authContext;

  const guestLinks = (
    <Fragment>
      <li className='nav-item'>
        <Link className='nav-link' to='/register'>
          <h4 className='m-0'>Register</h4>
        </Link>
      </li>
      <li className='nav-item'>
        <Link className='nav-link' to='/login'>
          <h4 className='m-0'>Login</h4>
        </Link>
      </li>
    </Fragment>
  );

  const authLinks = (
    <Fragment>
      <li className='nav-item'>
        <Link className='nav-link' to='/account'>
          <h4 className='m-0'>Account</h4>
        </Link>
      </li>
      <li className='nav-item'>
        <Link className='nav-link' onClick={onLogout}>
          <h4 className='m-0'>Logout</h4>
        </Link>
      </li>
    </Fragment>
  );

  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-info'>
      <Link className='navbar-brand' to='/'>
        <h1>JWT Auth</h1>
      </Link>
      <button
        className='navbar-toggler'
        type='button'
        data-toggle='collapse'
        data-target='#navbarNav'
        aria-controls='navbarNav'
        aria-expanded='false'
        aria-label='Toggle navigation'
      >
        <span className='navbar-toggler-icon'></span>
      </button>
      <div className='collapse navbar-collapse' id='navbarNav'>
        <ul className='navbar-nav ml-auto mr-4'>
          {isAuthenticated ? authLinks : guestLinks}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
```

##### Spinner.js

[Top &#8593;](#frontend)

This component imports a .gif image of a loading spinner, which will need to be in the `components/layout` folder along with this component.

```javascript
import React, { Fragment } from 'react';
import spinner from './spinner.gif';

const Spinner = () => {
  return (
    <Fragment>
      <img src={spinner} style={{ width: '200px' }} alt='loading...' />
    </Fragment>
  );
};

export default Spinner;
```

##### Alerts.js

[Top &#8593;](#frontend)

This component uses the `.map()` function to display all the messages in the messages variables in auth state.

```javascript
import React, { useContext, useEffect } from 'react';

import AlertContext from '../../context/alerts/alertContext';
import AuthContext from '../../context/auth/authContext';

const Alerts = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { setAlert } = alertContext;
  const { messages, messageType } = authContext;

  useEffect(() => {
    if (messages) {
      const errorMsg = messages.map(msg => setAlert(msg, messageType));
    }
  }, [messages]);

  return (
    <div className='container text-center alerts w-75'>
      <div className='row'>
        {alertContext.alerts.length > 0 &&
          alertContext.alerts.map(alert => (
            <div
              key={alert.id}
              className={`col col-10  offset-1  col-lg-6 offset-lg-3 text-center alert alert-${alert.type}`}
            >
              <i className='fas fa-info-circle'> {alert.msg}</i>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Alerts;
```

#### Pages

- `Home.js`
  - Splash page for redirect after login
- `UserDetail.js`
  - View / edit details of logged in user

##### Home.js

[Top &#8593;](#frontend)

```javascript
// components/pages/Home.js

import React, { useContext } from 'react';

import AuthContext from '../../context/auth/authContext';

import Spinner from '../layout/Spinner';

const Home = () => {
  const authContext = useContext(AuthContext);

  const { isAuthenticated, loading, user } = authContext;

  return (
    <div className='container text-center'>
      {/* if the page is finished loading, display welcome!
      Otherwise, display spinner */}
      {!loading ? (
        // if a user exists, display their username
        <h1 className='text-center'>Welcome{user && ', ' + user.username}!</h1>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Home;
```

##### UserDetail.js

[Top &#8593;](#frontend)

```javascript
// components/pages/Register.js

import React, { useContext, useEffect } from 'react';
import AuthContext from '../../context/auth/authContext';

import Spinner from '../layout/Spinner';
const UserDetail = props => {
  const authContext = useContext(AuthContext);

  const { user, requestAccessToken, accessToken } = authContext;

  return (
    <div>
      <div className='container text-center'>
        {user !== null ? (
          <div className='row'>
            <div className='col col-12'>
              <h1>{user.username}'s account</h1>
              <h1>{user.email}</h1>
            </div>
          </div>
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
};

export default UserDetail;
```

#### Auth

[Top &#8593;](#frontend)

- `PrivateRoute.js`
  - Wrapper for protected Routes that will redirect to Login page if no user is logged in
- `Register.js`
  - Form for creating users
- `Login.js`
  - Form for logging in users

The file structure of these files is completely up to the needs of your project. The user detail component would probably be looped in with other user CRUD components.

##### Register.js

[Top &#8593;](#frontend)

```javascript
// components/auth/Register.js

import React, { useState, useContext, useEffect } from 'react';

import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alerts/alertContext';
const Register = props => {
  // initialize auth context
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  // destructure context items
  const { register, isAuthenticated } = authContext;
  const { setAlert } = alertContext;

  // run effect when isAuthenticated or props.history change
  useEffect(() => {
    // redirect if an authenticated user exists
    if (isAuthenticated) {
      // redirect to the homepage
      props.history.push('/');
    }
  }, [isAuthenticated, props.history]);

  // setup component-level state to hold form data
  const [userForm, setUser] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  const { username, email, password, password2 } = userForm;

  // add new form changes to state
  const onChange = e =>
    setUser({ ...userForm, [e.target.name]: e.target.value });

  // call when form is submitted
  const onSubmit = e => {
    e.preventDefault(); // ignore default form submit action

    // if username, email or password are blank
    // or password doesn't match password 2, raise an alert
    if (username === '' || email === '' || password === '') {
      setAlert('Please enter all fields', 'danger');
    } else if (password !== password2) {
      setAlert("Passwords don't match", 'danger');
    } else {
      // if all info is valid, pass the form data to register() from AuthState
      register({
        username,
        email,
        password,
        password2,
      });
    }
  };

  return (
    <div className='container'>
      <div className='row'>
        <div className='col col-12 col-md-10 offset-md-1 col-lg-8 offset-lg-2'>
          <h1 className='text-center'>Register</h1>
          <form onSubmit={onSubmit}>
            <div className='form-group'>
              <label htmlFor='username'>Username</label>
              <input
                className='form-control'
                type='text'
                name='username'
                id='username'
                onChange={onChange}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='username'>Email</label>
              <input
                className='form-control'
                type='text'
                name='email'
                id='email'
                onChange={onChange}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='password'>Password</label>
              <input
                className='form-control'
                type='password'
                name='password'
                id='password'
                onChange={onChange}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='password2'>Password Confirm</label>
              <input
                className='form-control'
                type='password'
                name='password2'
                id='password2'
                onChange={onChange}
              />
            </div>

            <input
              className='btn btn-lg btn-primary'
              type='submit'
              value='Register'
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
```

##### Login.js

[Top &#8593;](#frontend)

```javascript
// components/auth/Login.js

import React, { useContext, useState, useEffect } from 'react';

import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alerts/alertContext';

const Login = props => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { login, isAuthenticated } = authContext;
  const { setAlert } = alertContext;

  // call useEffect when isAuthenticated or props.history are changed
  useEffect(() => {
    // redirect if an authenticated user exists
    if (isAuthenticated) {
      // redirect to the homepage
      props.history.push('/');
    }
  }, [isAuthenticated, props.history]);

  // set up component-level state to hold form data
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
  });

  const { username, password } = user;

  // add new form changes to state
  const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });

  // call when form is submitted
  const onSubmit = e => {
    e.preventDefault(); // ignore default form submit action

    if (username === '' || password === '') {
      setAlert('Please fill in all fields.', 'danger');
    } else {
      login({ username, password });
    }
  };

  return (
    <div className='container'>
      <div className='row'>
        <div className='col col-12 col-md-10 offset-md-1 col-lg-8 offset-lg-2'>
          <h1 className='text-center'>Login</h1>
          <form onSubmit={onSubmit}>
            <div className='form-group'>
              <label htmlFor='username'>Username</label>
              <input
                className='form-control'
                type='text'
                name='username'
                id='username'
                onChange={onChange}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='password'>Password</label>
              <input
                className='form-control'
                type='password'
                name='password'
                id='password'
                onChange={onChange}
              />
            </div>

            <input
              className='btn btn-lg btn-primary'
              type='submit'
              value='Login'
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

##### PrivateRoute.js

[Top &#8593;](#frontend)

```javascript
// components/auth/PrivateRoute.js

import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';

import AuthContext from '../../context/auth/authContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const authContext = useContext(AuthContext);

  const { isAuthenticated, loading } = authContext;

  return (
    <Route
      // pass the rest of the props
      {...rest}
      render={props =>
        // if not authenticated when loaded, redirect to login page
        !isAuthenticated && !loading ? (
          <Redirect to='/login' />
        ) : (
          // if authenticated, load the protected component
          <Component {...props} />
        )
      }
    />
  );
};

export default PrivateRoute;
```

[Top &#8593;](#frontend)
