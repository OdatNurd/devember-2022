import { config } from '#core/config';
import { logger } from '#core/logger';

import { loadBundles } from '#core/bundle_loader';

import { resolve } from 'path';

import jetpack from 'fs-jetpack'
import express from 'express';
import compression from 'compression';
import http from 'http';


// - Package this up as a zip that someone could run, on any platform
//   - as a "console" application that just runs in the background
//       https://github.com/vercel/pkg
// - Package this up as an electron application
//   - this has to work in combination with the above

// =============================================================================


/* Get our subsystem logger. */
const log = logger('core');


// =============================================================================


/* Try to load an existing token from the database, and if we find one, use it
 * to set up the database. */
async function launchServer() {
  const manifest = jetpack.read(resolve(config.get('baseDir'), 'package.json'), 'json');

  const startMsg = `${manifest.name} version ${manifest.version} launching`;
  const sep = '-'.repeat(startMsg.length);

  log.info(sep);
  log.info(startMsg);
  log.info(sep);

  // The express application that houses the routes that we use to carry out
  // authentication with Twitch as well as serve user requests.
  const app = express();
  app.use(express.json());
  app.use(compression());

  // A common API object that is passed to all extension code when it's loaded.
  // This is augmented in the bundle loader to provide the the bundle specific
  // portions of the API, such as a
  const api = {
    // These fields are not global; they're specific to each bundle that has an
    // extension module in it. When such a bundle is loaded, the API that it
    // gets passed will have these values swapped out for the correct ones.
    log: undefined,
    bundleInfo: undefined,
  }

  // Discover and load all bundles; we get a list of routers that serve files
  // for any that have any; apply them all.
  const bundleRouters = await loadBundles(api, manifest);
  bundleRouters.forEach(router => app.use(router));

  // Set up some middleware that will serve static files out of the static
  // folder so that we don't have to inline the pages in code.
  app.use(express.static('www'));

  // Create a server to serve our content
  const server = http.createServer(app);

  // Get the server to listen for incoming requests.
  const webPort = config.get('port');
  await server.listen(webPort, () => {
    log.info(`listening for requests at http://localhost:${webPort}`);
  });
}


// =============================================================================


// Boom goes the proverbial dynamite.
launchServer();