# require-fastifyroutes

[![Build Status](https://travis-ci.org/brianoneil/require-fastifyroutes.svg)](https://travis-ci.org/brianoneil/require-fastifyroutes)

A module based on require-directory to load and manage Fastify route definitions

## Installation

  ```
  npm install require-fastifyroutes --save
  ```
## Usage

In the directory you want to define your routes, create an ```index.js``` file with the following code in it.  This will load all the routes in the directory (as well as all the modules like require-directory does).

```javascript
//required file for require-fastifyroutes.  Make it easier to setup routes to js files

var requireFastifyRoutes = require('require-fastifyroutes');
module.exports = requireFastifyRoutes(module);
```

In your module, you just require the directory and register the ```routes``` property with the server.  It will have all defined routes in the array from all the files.

```javascript
var routes = require('./routes');
server.route(routes.routes);
```

This module uses the debug module for logging output.  To see logging output, set
 ```
 DEBUG=require-fastifyroutes*
 ```
## Defining Routes

In your route file you can define the routes in a few ways.

Export a property called ```routes``` on your module that is an array of Fastify route config objects.  Other exports will still be available from the
module if you use this way of loading routes *(be careful not to overwrite the object after you set the routes property as it will be lost)*

Example of routes property:
```javascript
  module.exports.routes = [
    {
      method : 'GET',
      path : '/route1',
      handler : routeHandler1,
      config : {
        description: 'my route description',
        notes: 'Important stuff to know about this route',
        tags : ['app']
      }
    },
    {
      method : 'GET',
      path : '/route2',
      handler : routeHandler2,
      config : {
        description: 'my route description',
        notes: 'Important stuff to know about this route',
        tags : ['app']
      }
    }
  ];
```

Or, you can set the route object as your export (must have path and handler properties)

Example:
```javascript
  module.exports =
  {
    method : 'GET',
    path : '/route1',
    handler : routeHandler1,
    config : {
      description: 'my route description',
      notes: 'Important stuff to know about this route',
      tags : ['app']
    }
  };
```

Or, you can set an array of them

```javascript
module.exports = [
{
  method : 'GET',
  path : '/route3',
  handler : routeHandler3,
  config : {
    description: 'my route description',
    notes: 'Important stuff to know about this route',
    tags : ['app']
  }
},
{
  method : 'GET',
  path : '/route4',
  handler : routeHandler4,
  config : {
    description: 'my route description',
    notes: 'Important stuff to know about this route',
    tags : ['app']
  }
}
];
```

If you don't do either of these, it will just do the normal module loading stuff for it.  Also, you can mix and match between and they will all get loaded in the end.

## Release History
* 1.0.0 Updated debug dependency and moved version number
* 0.1.9 One more update to clean up the handler checks
* 0.1.8 Updated loading to allow handler to be in the config section
* 0.1.7 Added test for loading regular modules that don't have routes in them
* 0.1.6 Updated loader to also look for the module export to be an array of route objects
* 0.1.5 Got build running test on Travis.ci
* 0.1.4 Added the build indicator to the readme
* 0.1.3 Updated the package to have the tests and update the readme
* 0.1.2 Added tests for the package
* 0.1.1 Readme corrections for npm
* 0.1.0 Initial release
