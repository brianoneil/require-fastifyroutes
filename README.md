# require-fastifyroutes

A module to automatically load and manage Fastify route definitions from a directory structure.

## Installation

```bash
npm install require-fastifyroutes --save
```

## Usage

In the directory where you want to define your routes, create an `index.js` file with:

```javascript
const requireFastifyRoutes = require('require-fastifyroutes');
module.exports = requireFastifyRoutes(module);
```

Then in your main application file:

```javascript
const fastify = require('fastify')({ logger: true });
const routes = require('./routes');

// Register all routes
const start = async () => {
  try {
    await fastify.register(async (instance) => {
      routes.routes.forEach(route => instance.route(route));
    });
    
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
```

This module uses the debug module for logging output. To see logging output, set:
```bash
DEBUG=require-fastifyroutes*
```

## Defining Routes

Routes can be defined in several ways:

### 1. Export a routes array:

```javascript
module.exports.routes = [
  {
    method: 'GET',
    url: '/route1', // Fastify uses 'url' instead of 'path'
    handler: async (request, reply) => {
      return { hello: 'world' }
    },
    schema: {  // Fastify uses 'schema' for validation and documentation
      description: 'My route description',
      tags: ['app'],
      response: {
        200: {
          type: 'object',
          properties: {
            hello: { type: 'string' }
          }
        }
      }
    }
  }
];
```

### 2. Export a single route:

```javascript
module.exports = {
  method: 'GET',
  url: '/route1',
  handler: async (request, reply) => {
    return { hello: 'world' }
  },
  schema: {
    description: 'My route description',
    tags: ['app']
  }
};
```

### 3. Export an array of routes:

```javascript
module.exports = [
  {
    method: 'GET',
    url: '/route1',
    handler: async (request, reply) => {
      return { hello: 'world' }
    }
  },
  {
    method: 'POST',
    url: '/route2',
    handler: async (request, reply) => {
      const { body } = request
      return body
    },
    schema: {
      body: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string' }
        }
      }
    }
  }
];
```

## Key Changes from Previous Versions

- Uses `url` instead of `path` in route definitions
- Uses `schema` instead of `config` for route configuration
- Supports async/await handlers
- Uses Fastify's built-in schema validation
- Supports TypeScript via type definitions (coming soon)

## Release History

* 1.0.0 Updated for latest Fastify version with modern JavaScript features
* 0.10.0 Updated all package versions
* 0.9.0 Initial release

## License

MIT
