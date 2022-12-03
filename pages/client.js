// =============================================================================

/* Set the position and size of the passed in window.
 *
 * In the fullness of time this should use some value that was saved at quit so
 * that the window always comes back in the same location as before.
 *
 * For now, it's hard coded to a position that is conducive to looking at the
 * content in the stream while we're developing it. */
function setupWindow(win) {
  win.x = 0;
  win.y = 0;
  win.width = 1360;
  win.height = 1000;
}


// =============================================================================


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
  // As such, even if you call this, it does nothing, because well, it does
  // nothing
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


// The window object will only have the nw property when running under NWjs; use
// that to know if we need to do any startup config in that environment.
if (window.nw) {
  let win = nw.Window.get();
  setupWindow(win);
  setupTrayIcon()
}
