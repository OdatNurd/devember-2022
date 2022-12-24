import { config } from '#core/config';
import { logger } from '#core/logger';

import { assert } from '#api/assert';

import { loadBundles } from '#core/bundle_loader';
import { setupSocketIO, dispatchMessageEvent } from '#core/network';

import fileRoutes from '@labyrinthos/file-routes/express';

import { Server } from 'socket.io';

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


/* Construct a server side omphalos API object, which is passed to the lifecycle
 * main entry point of all bundles to give them access to the application.
 *
 * This fills out most of the API structure; some items are per bundle and
 * require a bundle to load, so they are stubbed out here as placeholders before
 * return as a reminder of the contract. */
function makeTemplateAPIObject(io) {
  const exportSymbols = {};
  return {
    // The list of symbols that are exported by bundles; the keys are the names
    // of bundles and the objects are the symbols from that object.
    exportSymbols,

    // The global socket.io context.
    socketIO: io,

    // Build a require function that looks up symbols from the list of exported
    // symbols from other bundles that loaded before us.
    require: modName => {
      assert(modName !== undefined, 'module name not specified');
      return exportSymbols[modName] ?? {}
    },

    // The logger is specific to the extension since it has the bundle name  in
    // it, so it gets set up when a bundle loads.
    log: undefined,

    // The bundle configuration is specific to the bundle and is inserted when
    // a bundle is loaded.
    bundleConfig: undefined,

    // Application configuration
    appConfig: config.getProperties(),

    // Directs a message to all listeners in a specific bundle;
    sendMessageToBundle: (event, bundle, data) => {
      assert(bundle !== undefined, 'valid bundle not specified');
      assert(event !== undefined, 'message not specified');

      io.to(bundle).emit('message', { bundle, event, data });
      dispatchMessageEvent(bundle, event, data);
    },

    // Sending a message to only the current bundle requires that we know the
    // current bundle, which is not known until the bundle actually loads.
    sendMessage: undefined,

    // Listen for incoming messages and trigger a handler. This is entirely
    // event based on the server side because there is no socket. This requires
    // a known bundle to infer arguments, so this is just a placeholder entry.
    listenFor: undefined,

    // Trigger a toast message.
    toast: (msg, level, timeout_secs) => {
      const levels = ['message', 'info', 'warning', 'success', 'error'];

      level ||= 'message';

      assert(msg !== undefined, 'no toast message text given');
      assert(levels.indexOf(level) !== -1, `unknown toast level '${level}'`);

      // Direct the message to the front end; we don't need to use the full
      // sender here since nothing on the server side can do anything about a
      // toast anyway.
      io.to('__omphalos_system__').emit('message', {
        bundle: '__omphalos_system__',
        event: 'toast', data:
        { toast: msg, level, timeout: timeout_secs * 1000 }
      });
    }
  }
}

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

  // Get the template API object that we will pass to extension code; it will
  // get filled out by the module loader.
  const omphalos = makeTemplateAPIObject(io);

  // Discover and load all bundles; we get a list of routers that serve files
  // for any that have any; apply them all.
  const { bundles, routers } = await loadBundles(omphalos, manifest);
  routers.forEach(router => app.use(router));

  // Inject the list of bundles into requests; this has to happen before we
  // set up the file routes, since they rely on this information.
  app.use((req, res, next) => {
    req.bundles = bundles;
    next()
  });

  // Use the file router to set up the routes for the back end services that
  // we expose to the UI; this requires that the list of bundles has been added
  // to requests via middleware.
  app.use(await fileRoutes("src/server/routes"));

  // Get the server to listen for incoming requests.
  const webPort = config.get('port');
  await server.listen(webPort, () => {
    log.info(`listening for requests at http://localhost:${webPort}`);
  });
}


// =============================================================================


// Boom goes the proverbial dynamite.
launchServer();