import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { autoLoadModules } from '../../index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Export a promise that resolves to the modules object
export default await autoLoadModules(__dirname);
