import { config } from '#core/config';
import { logger } from '#core/logger';

import { loadBundles } from '#core/bundle_loader';

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
  const api = {
    // These fields are not global; they're specific to each bundle that has an
    // extension module in it. When such a bundle is loaded, the API that it
    // gets passed will have these values swapped out for the correct ones.
    log: undefined,
    bundleInfo: undefined,
  }

  // Discover and load all bundles; we get a list of routers that serve files
  // for any that have any; apply them all.
  const { bundles, routers } = await loadBundles(api, manifest);
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

  // Our event solution is:
  //
  //  - rooms will equate to bundle names
  //  - there will be a specific 'join' message from clients that tells the
  //    server to join them to a room; the room is the bundle name
  //  - the protocol for sending events is to send an "event" message with
  //    an object payload:
  //      - "bundle": for the bundle to direct to; if not given, goes everywhere
  //      - "data": the actual payload of the message; can be anything.
  //
  // The code below is a small version of that concept that uses the panel name
  // as the room instead, so we don't need so many bundles to test with.

  // Listen for connections and disconnections an announce them.
  io.on('connection', socket => {
    log.info(`incoming connection for ${socket.id}`);

    // Log a disconnect when it happens. Sockets get dropped from rooms when
    // this happens (or at least, they better; verify that conclusively).
    socket.on('disconnect', () => {
      log.info(`socket is disconnecting: ${socket.id}`)
    });

    // When the socket sends a join message, join it to that channel; channels
    // are a server side only concept which seems mildly wonky in its abstract
    // setup.
    socket.on("join", room => {
      log.info(`socket is joining room ${room}: ${socket.id}`);
      socket.join(room);
    });

    // When messages arrive, they can either be for specific rooms, or they
    // can be global; if there is a 'room' key in the data, send the payload
    // there; otherwise the payload is just global.
    socket.on('msg', data => {
      console.dir(data, { depth: null });

      // If there is not a room, broadcast the message to everyone but the
      // person that sent it.
      if (data.room === undefined) {
        socket.broadcast.emit('msg', data.msg);

      // There is a room; broadcast the message to everyone in that room except
      // the socket that sent it (which may or may not actually be in the room,
      // but whatever).
      } else {
        socket.to(data.room).emit('msg', data.msg)
      }
    })
  });

  // Get the server to listen for incoming requests.
  const webPort = config.get('port');
  await server.listen(webPort, () => {
    log.info(`listening for requests at http://localhost:${webPort}`);
  });
}


// =============================================================================


// Boom goes the proverbial dynamite.
launchServer();