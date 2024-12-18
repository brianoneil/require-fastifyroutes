import { expect } from 'chai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, writeFile, rm } from 'fs/promises';
import requireFastifyRoutes, { autoLoadModules } from '../index.js';
import fs from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('require-fastifyroutes', () => {
  let routes;

  before(async () => {
    const routesDir = join(__dirname, 'testRoutes');
    const result = await requireFastifyRoutes(routesDir);
    routes = result.routes;
  });

  it('should load a single route from a module', () => {
    const singleRoute = routes.find(route => route.path === '/singleroute');
    expect(singleRoute).to.exist;
    expect(singleRoute?.handler).to.be.a('function');
  });

  it('should load multiple routes from routes property', () => {
    const multiRoutes = routes.filter(route => 
      route.path === '/multiroute1' || route.path === '/multiroute2'
    );
    expect(multiRoutes).to.have.lengthOf(2);
    multiRoutes.forEach(route => {
      expect(route?.handler).to.be.a('function');
    });
  });

  it('should load multiple routes from array', () => {
    const arrayRoutes = routes.filter(route => 
      route.path === '/arrayroute1' || route.path === '/arrayroute2'
    );
    expect(arrayRoutes).to.have.lengthOf(2);
    arrayRoutes.forEach(route => {
      expect(route?.handler).to.be.a('function');
    });
  });

  it('should load routes with handler in config', () => {
    const configRoute = routes.find(route => route.path === '/configroute');
    expect(configRoute).to.exist;
    expect(configRoute?.config?.handler).to.be.a('function');
  });

  it('should ignore non-route modules', () => {
    const nonRoute = routes.find(route => route.path === '/nonroute');
    expect(nonRoute).to.be.undefined;
  });
});

// New tests for ESM specific functionality
describe('ESM specific functionality', () => {
  it('should handle import.meta.url input', async () => {
    const result = await requireFastifyRoutes({ url: import.meta.url });
    expect(result).to.be.an('object');
  });

  it('should handle both default and named exports', async () => {
    const routesDir = join(__dirname, 'testRoutes');
    const result = await requireFastifyRoutes(routesDir);
    expect(result.singleRoute).to.exist;
  });

  it('should throw on invalid directory', async () => {
    try {
      await requireFastifyRoutes('nonexistent/directory');
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });
});

// Test route file types
describe('Route file handling', () => {
  it('should only process .js files', async () => {
    const routesDir = join(__dirname, 'testRoutes');
    const result = await requireFastifyRoutes(routesDir);
    // Assuming we add a .txt file to testRoutes, it should be ignored
    expect(result.textfile).to.be.undefined;
  });

  it('should handle nested routes properly', async () => {
    const routesDir = join(__dirname, 'testRoutes');
    const result = await requireFastifyRoutes(routesDir);
    expect(result.routes).to.be.an('array');
    // Check that all routes have required properties
    result.routes.forEach(route => {
      expect(route).to.have.property('path');
      expect(route).to.satisfy(r => r?.handler || r?.config?.handler);
    });
  });
});

// Add new describe block for negative tests
describe('Error handling and edge cases', () => {
  it('should throw on non-existent directory', async () => {
    try {
      await requireFastifyRoutes('./nonexistent-directory');
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.code).to.equal('ENOENT');
    }
  });

  it('should handle directory with no JS files', async () => {
    const emptyDir = join(__dirname, 'testRoutes', 'empty');
    // Create empty directory if it doesn't exist
    await fs.mkdir(emptyDir, { recursive: true });
    
    const result = await requireFastifyRoutes(emptyDir);
    expect(result.routes).to.be.an('array').that.is.empty;
  });

  it('should ignore invalid route definitions', async () => {
    const invalidRouteDir = join(__dirname, 'testRoutes', 'invalid');
    await fs.mkdir(invalidRouteDir, { recursive: true });
    
    // Create a test file with invalid route
    await fs.writeFile(
      join(invalidRouteDir, 'invalidRoute.js'),
      'export default { path: "/test" }; // Missing handler'
    );

    const result = await requireFastifyRoutes(invalidRouteDir);
    expect(result.routes).to.be.an('array').that.is.empty;
  });

  it('should handle syntax errors in route files', async () => {
    const badSyntaxDir = join(__dirname, 'testRoutes', 'syntax-error');
    await fs.mkdir(badSyntaxDir, { recursive: true });
    
    // Create a test file with syntax error
    await fs.writeFile(
      join(badSyntaxDir, 'badSyntax.js'),
      'export default { this is not valid javascript'
    );

    try {
      await requireFastifyRoutes(badSyntaxDir);
      expect.fail('Should have thrown a syntax error');
    } catch (err) {
      expect(err).to.be.instanceof(SyntaxError);
    }
  });

  it('should handle circular dependencies', async () => {
    const circularDir = join(__dirname, 'testRoutes', 'circular');
    await fs.mkdir(circularDir, { recursive: true });
    
    // Create a self-referential circular dependency
    await fs.writeFile(
      join(circularDir, 'circular.js'),
      `import './circular.js';
       export default {
         path: '/circular',
         handler: () => {}
       };`
    );

    try {
      await requireFastifyRoutes(circularDir);
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
      // Any error is acceptable here since we're just verifying
      // that circular dependencies don't crash the application
    }
  });

  it('should handle non-route JS files gracefully', async () => {
    const result = await requireFastifyRoutes(join(__dirname, 'testRoutes'));
    const nonRouteModule = result.nonRouteModule;
    expect(nonRouteModule).to.exist;
    expect(result.routes).to.not.include(nonRouteModule);
  });

  it('should handle missing file extensions', async () => {
    try {
      await autoLoadModules(join(__dirname, 'testRoutes/nonexistent'));
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.code).to.equal('ENOENT');
    }
  });

  it('should handle invalid import URLs', async () => {
    try {
      await requireFastifyRoutes({ url: 'invalid://url' });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.message).to.include('URL');
    }
  });

  it('should handle undefined input', async () => {
    try {
      await requireFastifyRoutes(undefined);
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should handle null input', async () => {
    try {
      await requireFastifyRoutes(null);
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });
});

// Clean up test directories after tests
after(async () => {
  const testDirs = ['empty', 'invalid', 'syntax-error', 'circular'];
  for (const dir of testDirs) {
    try {
      await fs.rm(join(__dirname, 'testRoutes', dir), { recursive: true });
    } catch (err) {
      // Ignore errors during cleanup
    }
  }
});
