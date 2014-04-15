# Superstate

An agent for saving and reading objects, shared between the client and server.

## Setup

### Browser

First, use [http://browserify.org/](browserify) and install superstate.

```

var superstate = require('superstate');

// the data should be stored in a cookie called "MyState"
var state = superstate.browser(window.document, 'MyState'); 

state.set('name', 'My Name');

state.get('name'); // -> "My Name"

```

### Server / Express

Be sure to configure express for cookies:

```
// express pre-v4
app.configure(function() {
  app.use(express.cookieParser());
});
// express v4
var cookieParser = require('cookie-parser');
app.use(cookieParser());
```

Create a superstate with a request/response combo:

```

var superstate = require('superstate');

app.use(function(req, res) {
  
  // the data should be stored in a cookie called "MyState"
  req.state = superstate.express(req, res, 'MyState'); 

  req.state.get('name'); // -> "My Name"

});

```

## API

### superstate.setState();

Sets a new state object into the cookie

### superstate.getState();

Returns the current state object that the cookie stores

### superstate.get(property);

Get a single property from the state

### superstate.set(property, value);

Save a single property into the state
