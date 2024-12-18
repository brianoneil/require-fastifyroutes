import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Debug from 'debug';

const debug = Debug('require-fastifyroutes:routediscovery');

function isRoute(route) {
  const hasHandler = route?.handler || route?.config?.handler;
  const hasPath = route?.path;
  return hasHandler && hasPath;
}

async function loadModule(filePath) {
  try {
    const fileUrl = new URL(`file://${filePath}`).href;
    const module = await import(fileUrl);
    return module?.default || module;
  } catch (err) {
    debug('Error loading module:', err);
    throw err;
  }
}

export async function autoLoadModules(directory) {
  const modules = {};
  const files = await readdir(directory);
  
  for (const file of files) {
    // Skip index.js and non-js files
    if (file === 'index.js' || !file.endsWith('.js')) continue;

    // Convert filename to module name (remove .js)
    const moduleName = file.replace('.js', '');
    
    // Import the module
    const filePath = join(directory, file);
    const module = await loadModule(filePath);
    
    // Store the module
    modules[moduleName] = module;
  }

  return modules;
}

async function requireDirectory(directory) {
  const dirModules = await autoLoadModules(directory);
  const routes = [];

  for (const [file, routeModule] of Object.entries(dirModules)) {
    if (routeModule?.routes) {
      debug('loading routes from routes property file: %s with %s routes', 
        file, routeModule.routes.length);
      routes.push(...routeModule.routes);
    }
    else if (Array.isArray(routeModule) && 
             routeModule.length > 0 && 
             isRoute(routeModule[0])) {
      debug('loading routes from module as an Array from file: %s', file);
      routes.push(...routeModule);
    }
    else if (isRoute(routeModule)) {
      debug('loading module as a route file: %s', file);
      routes.push(routeModule);
    }
  }

  dirModules.routes = routes;
  return dirModules;
}

export default async function(mod) {
  const directory = typeof mod === 'string' ? mod : dirname(fileURLToPath(mod.url));
  return requireDirectory(directory);
}
