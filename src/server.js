import express from 'express';
import compression from 'compression';
import http from 'http';

// - Package this up as a zip that someone could run, on any platform
//   - as an application that opens a window
//       https://www.npmjs.com/package/nw-builder           (recommended for long term)
//       https://www.npmjs.com/package/nwjs-builder-phoenix (easier to set up, no longer maintained)
//   - as a "console" application that just runs in the background
//       https://github.com/vercel/pkg
// - application icon, though I guess we have to draw one
//
// We can set the "main" in the package.json to a js file, and then have it be
// the thing that opens the window; that way we could configure the port. Could
// also maybe done done from "node-main" as well?
//
// It has been suggested we could start the app pointing at a local page, so
// that it could be configured as well;


/* This will set up an application tray icon and provide a menu of items that
 * allows for taking various actions on the application.
 *
 * This presumes that the application manifest has been told that the app
 * should not present in the taskbar, and should start hidden. Either could be
 * altered by the below code as needed. */
function setupTrayIcon() {
  // This code is 100% wholesale taken from the nw-tray-example code; that code
  // will only run in older versions of NW.ks (specifically nothing later than
  // 0.40.2, at least on Linux), and ironically trying to start up an express
  // server and then launch the window using it doesn't work from a pure
  // manifest level, though I have not looked into it.
  //
  // Probably important to note that in the original code this came from, this
  // was in a client side file running in the browser context, so it being here
  // is untested. Still, it doesn't work anyway, so, you know, *shrug*
  return;

  let tray = new nw.Tray({
    title: 'Tray',
    tooltip: 'Tray App is running',
    icon: 'assets/icon.png'
  });

  let menu = new nw.Menu();

  let menuItems = [
    {
      type: 'normal',
      label: 'Open Dev Tools',
      click: () => nw.Window.get().showDevTools()
    },
    {
      type: 'normal',
      label: 'Show Window',
      click: () => nw.Window.get().show()
    },
    {
      type: 'normal',
      label: 'Hide Window',
      click: () => nw.Window.get().hide()
    },
    {
      type: 'separator'
    },
    {
      type: 'normal',
      label: 'Exit',
      click: () => nw.Window.get().close()
    }
  ];

  menuItems.forEach(function (item) {
    menu.append(new nw.MenuItem(item));
  });

  tray.menu = menu;
}


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
  app.use(express.static('pages'));

  // Create a server to serve our content
  const server = http.createServer(app);

  // Get the server to listen for incoming requests.
  const webPort = 3000;
  await server.listen(webPort, () => {
    console.info(`listening for requests at http://localhost:${webPort}`);
  });
}


// =============================================================================


/* Does all server and NW.js (if needed) work to get the application up and
 * running. */
async function main() {
  // Start the server and wait for it to start listening.
  await launchServer();

  // If the nw symbol is defined, then we're running inside of NW.js, so we need
  // to do more setup here.
  if (typeof nw !== 'undefined') {
    // Capture the default window, which is displaying the content from the page
    // that is specified in the manifest.
    let old = nw.Window.get();

    // Create a new window for the site that we just started; once tha's done we can
    // close the initial window.
    nw.Window.open('http://localhost:3000', { id: 'omphalos-main-window' })
    old.close();
  }
}

// Boom goes the proverbial dynamite.
main();