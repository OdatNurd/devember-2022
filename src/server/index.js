import { config } from '#core/config';
import { logger } from '#core/logger';

import { loadBundles } from '#core/bundle_loader';
import { setupSocketIO } from '#core/network';
import { resolve } from 'path';

import fileRoutes from '@labyrinthos/file-routes/express';

import { Server } from 'socket.io';

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
  const omphalos = {
    // This is installed at bundle load time, when the list of symbols that has
    // been loaded from extensions exists.
    require: undefined,

    // The logger is specific to the extension since it has the bundle name  in
    // it, so it gets set up when a bundle loads.
    log: undefined,

    // The bundle configuration is specific to the bundle and is inserted when
    // a bundle is loaded.
    bundleConfig: undefined,

    // Application configuration
    appConfig: config.getProperties(),

    // sendMessage
    // sendMessageToBundle
    // broadcastMessage
  }

  // Discover and load all bundles; we get a list of routers that serve files
  // for any that have any; apply them all.
  const { bundles, routers } = await loadBundles(omphalos, manifest);
  routers.forEach(router => app.use(router));

  /* Inject the list of bundles into request objects so that our API has access
   * to them. */
  app.use((req, res, next) => {
    req.bundles = bundles;
    next()
  });

  // Use the file router to set up the routes for the back end services that
  // we expose to the UI.
  app.use(await fileRoutes("src/server/routes"));

  // Set up some middleware that will serve static files out of the static
  // folder so that we don't have to inline the pages in code.
  app.use(express.static('www'));

  // Create a server to serve our content
  const server = http.createServer(app);

  // The configuration tells us which, if any, extra hosts should be allowed to
  // make requests.
  const corsOrigin = config.get('cors.origin').map(entry => {
    if (entry.startsWith('/') && entry.endsWith('/')) {
      return new RegExp(entry.substring(1, entry.length - 1));
    }

    return entry;
  });

  if (corsOrigin.length !== 0) {
    log.info(`CORS origin: ${corsOrigin}`);
  } else {
    log.info('no extra CORS origin added')
  }

  // Create a socket-io server using the eiows server as the back end, wrapped
  // inside of our main server.
  const io = new Server(server, {
//    wsEngine: eiows.Server,
    cors: {
      origin: corsOrigin,
      // Maybe needed; this is not hardly a correct list, one assumes. I've
      // certainly never vetted it.
      // methods: ["GET", "POST"]
    }
  });

  // Initialize all of the websocket related code.
  setupSocketIO(io);

  // Get the server to listen for incoming requests.
  const webPort = config.get('port');
  await server.listen(webPort, () => {
    log.info(`listening for requests at http://localhost:${webPort}`);
  });
}


// =============================================================================


// Boom goes the proverbial dynamite.
launchServer();