// =============================================================================


/* Set the position and size of the passed in window.
 *
 * In the fullness of time this should use some value that was saved at quit so
 * that the window always comes back in the same location as before.
 *
 * For now, it's hard coded to a position that is conducive to looking at the
 * content in the stream while we're developing it. */
function setupWinPos(win) {
  win.x = 0;
  win.y = 0;
  win.width = 1360;
  win.height = 1000;
}


// =============================================================================


// The window object will only have the nw property when running under NWjs; use
// that to know if we need to do any startup config in that environment.
if (window.nw) {
  let win = nw.Window.get();
  setupWinPos(win);
}
