import express from 'express';
import compression from 'compression';
import http from 'http';

// - Package this up as a zip that someone could run, on any platform
//   - as an application that opens a window
//       https://www.npmjs.com/package/nw-builder           (recommended for long term)
//       https://www.npmjs.com/package/nwjs-builder-phoenix (easier to set up, no longer maintained)
//   - as a "console" application that just runs in the background
//       https://github.com/vercel/pkg
// - tray icon to interface with this bad boy
// - application icon, though I guess we haev to draw one
//
// We can set the "main" in the package.json to a js file, and then have it be
// the thing that opens the window; that way we could configure the port. Could
// also maybe done done from "node-main" as well?
//
// It has been suggested we could start the app pointing at a local page, so
// that it could be configured as well;
//

// =============================================================================


/* Try to load an existing token from the database, and if we find one, use it
 * to set up the database. */
async function launch() {
  // The express application that houses the routes that we use to carry out
  // authentication with Twitch as well as serve user requests.
  const app = express();
  app.use(express.json());
  app.use(compression());

  // Set up some middleware that will serve static files out of the static
  // folder so that we don't have to inline the pages in code.
  app.use(express.static('pages'));

  // Create a server to serve our content
  const server = http.createServer(app);

  // Get the server to listen for incoming requests.
  const webPort = 3000;
  server.listen(webPort, () => {
    console.info(`listening for requests at http://localhost:${webPort}`);
  });
}


// =============================================================================

launch();