import 'dotenv/config';

import convict from 'convict';
import json5 from 'json5';
import jetpack from 'fs-jetpack';

import { existsSync, mkdirSync, accessSync, copyFileSync, constants } from 'fs';
import { homedir } from 'os';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

/* These special constants are used as the name of the configuration folder and
 * the name of the configuration file within that folder, respectively. They're
 * used to set up the configuration variables. */
const APP_NAME = 'omphalos';
const CONFIG_FILE = 'omphalos.json';
const CONFIG_FILE_TEMPLATE = 'omphalos.json.example';

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

  configDir: {
    doc: 'The OS specific configuration folder; set at runtime',
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


/* Bootstraps out the configuration folder in the user's configuration location
 * (the location of which is platform specific), and ensures that all files that
 * should be there when it is created are there. An example of this is the
 * configuration file sample.
 *
 * When the folder already exists, this does nothing. */
function boostrapConfigFolder(baseDir, configPath) {
  // We don't need to do anything if the config folder already exists.
  if (existsSync(configPath) === true) {
    return;
  }

  // Create the config folder with the permissions that we want, and then
  // bootstrap the files over. We need to create the folder ourselves or Jetpack
  // won't give it the appropriate permissions.
  mkdirSync(configPath, { mode: 0o700 });
  jetpack.copy(resolve(baseDir, 'bootstrap', APP_NAME), configPath, { overwrite: true })
}


// =============================================================================


/* Based on the current operating system, look up the appropriate folder to
 * store application specific configuration and files in and return the name of
 * it. In addition, if the folder does not already exist, it will be created.
 *
 * This uses best practices (as far as a simple Google points out anyway) for
 * the location to use based on the operating system in use. */
function getOSConfigDir(baseDir) {
  let root;

  // Start by getting the root path, which is OS specific.
  switch (process.platform) {
    // Linux should be in .config in the home folder, unless XDG says that the
    // user thinks it should be stored elsewhere instead.
    case "linux":
      root = `${process.env.XDG_CONFIG_HOME || `${homedir()}/.config`}`;
      break;

    // On Windows, the configuration is always in AppData, which presumably is
    // something that always exists because the OS puts it there.
    case "windows":
      root = `${process.env.APPDATA}`;
      break;

    // On MacOS, the location is hard coded and always the same right up until
    // Apple decides to change it without warning because why not, right?
    case "darin":
      root = `${homedir()}/Library/Application Support`
      break;

    default: throw new Error(`Unknown process platform ${process.platform}`);
  }

  // Add in the application specific portion, and ensure that the folder exists.
  return resolve(root, APP_NAME);
}


// =============================================================================


/* Calculate what the base of the project folder is; this is required for some
 * aspects that need to grab files relative to the root. */
const baseDir = resolve(__dirname, '../..');
const configDir = getOSConfigDir(baseDir);
const configFile = resolve(configDir, CONFIG_FILE);

/* Ensure that the configuration folder exists; this will create and populate it
 * with samples if it doesn't. */
boostrapConfigFolder(baseDir, configDir);

/* Store our base paths into the configuration object. */
config.set('baseDir', baseDir);
config.set('configDir', configDir)

/* If the configuration file exists, load it. */
if (existsSync(configFile) === true) {
  config.loadFile(configFile);
}

/* Validate that everything in the configuration file is valid. */
config.validate();
// console.log(`configuration is: \n${config.toString()}`);
