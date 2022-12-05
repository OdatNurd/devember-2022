import { config } from '#core/config';

import express from 'express';
import compression from 'compression';
import http from 'http';

// - Package this up as a zip that someone could run, on any platform
//   - as a "console" application that just runs in the background
//       https://github.com/vercel/pkg
// - Package this up as an electron application
//   - this has to work in combination with the above


// =============================================================================


/* Try to load an existing token from the database, and if we find one, use it
 * to set up the database. */
async function launchServer() {
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

  // Get the server to listen for incoming requests.
  const webPort = config.get('port');
  await server.listen(webPort, () => {
    console.info(`listening for requests at http://localhost:${webPort}`);
  });
}


// =============================================================================


// Boom goes the proverbial dynamite.
launchServer();