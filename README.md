# require-fastifyroutes

A module to help organize and manage Fastify route definitions using ES Modules. This package automatically discovers and loads route files from a directory structure.

## Requirements

- Node.js >= 14.8.0 (for ES Modules support)

## Installation

```bash
npm install require-fastifyroutes --save
```

## Usage

### Basic Usage

In your main application file:

```javascript
import Fastify from 'fastify';
import routeLoader from 'require-fastifyroutes';

const fastify = Fastify({ logger: true });

// Register all routes
const start = async () => {
  try {
    // Load routes from a directory
    const routes = await routeLoader('./routes');
    
    // Register routes with Fastify
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

### Auto-Loading Routes

You can use the `autoLoadModules` helper to manually load modules from a directory:

```javascript
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { autoLoadModules } from 'require-fastifyroutes';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Auto-load all modules in the current directory
export default await autoLoadModules(__dirname);
```

## Defining Routes

Routes can be defined in several ways:

### 1. Export a routes array:

```javascript
export default {
  routes: [
    {
      method: 'GET',
      path: '/route1',
      handler: async (request, reply) => {
        return { hello: 'world' }
      }
    }
  ]
};
```

### 2. Export a single route:

```javascript
export default {
  method: 'GET',
  path: '/route1',
  handler: async (request, reply) => {
    return { hello: 'world' }
  }
};
```

### 3. Export an array of routes:

```javascript
export default [
  {
    method: 'GET',
    path: '/route1',
    handler: async (request, reply) => {
      return { hello: 'world' }
    }
  },
  {
    method: 'POST',
    path: '/route2',
    handler: async (request, reply) => {
      const { body } = request;
      return body;
    }
  }
];
```

## Features

- ESM Support: Uses native ES Modules
- Auto-discovery: Automatically finds and loads route files
- Flexible Route Definitions: Supports multiple ways to define routes
- Error Handling: Gracefully handles various error cases
- Type Safety: Uses optional chaining for safer property access
- Directory Support: Works with both directory paths and import.meta.url

## Debug Logging

This module uses the debug module for logging output. To see logging output, set:
```bash
DEBUG=require-fastifyroutes*
```

## Error Handling

The module handles various error cases:
- Non-existent directories
- Invalid route definitions
- Syntax errors in route files
- Circular dependencies
- Missing file extensions
- Invalid import URLs

## API

### Default Export
```javascript
import routeLoader from 'require-fastifyroutes';
const routes = await routeLoader('./routes');
```

### Named Exports
```javascript
import { autoLoadModules } from 'require-fastifyroutes';
const modules = await autoLoadModules('./routes');
```

## Release History

* 2.0.0 Complete rewrite with ESM support and improved error handling
* 1.0.0 Initial release

## License

MIT
