import 'dotenv/config';

import convict from 'convict';
import json5 from 'json5';

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

/* __dirname is not available in this module type, but we can create our own
 * value with the same name based on the URL of the current file. */
const __dirname = dirname(fileURLToPath(import.meta.url));

// Tell convict about json5 so that our configuration file can have comments in
// it without the parser taking a dump on our heads.
convict.addParser([
  { extension: 'json', parse: json5.parse }
]);


// =============================================================================


/* This sets the configuration schema to be used for the overlay. */
export const config = convict({
  // When we start up the configuration system, this value is populated with the
  // current base directory of the project, so that it can be accessed
  // throughout the system by anything that has access to the config.
  baseDir: {
    doc: 'The directory that represents the root of the project; set at runtime',
    format: '*',
    default: ''
  },

  port: {
    doc: 'The port that the server should listen on',
    format: 'port',
    env: 'PORT',
    default: 3000
  },

  logging: {
    level: {
        doc: 'Sets the logging level that rhe server uses',
        format: ['error', 'warn', 'info', 'debug', 'silly'],
        default: 'info',
        env: 'LOG_LEVEL'
    },
    timestamp: {
      doc: 'The format string for the timestamps that get written as part of the log',
      format: '*',
      default: 'YYYY-MM-DD HH:mm:ss.SSS',
      env: 'LOG_TIMESTAMP'
    }
  },
});


// =============================================================================


/* Calculate what the base of the project folder is; this is required for some
 * aspects that need to grab files relative to the root. */
const baseDir = resolve(__dirname, '../..');

/* Store the base directory into the configuration object, then load and
 * validate the configuration file. */
config.set('baseDir', baseDir);
// config.loadFile(resolve(baseDir, 'omphalos.json'));
config.validate();

// console.log(`configuration is: \n${config.toString()}`);
