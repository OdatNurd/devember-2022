import { assert } from '#api/assert';


// =============================================================================


/* Obtain a socket that will attempt to connect back to where the page was
 * served from, and remain connected.
 *
 * The socket will automatically try to remain connected, trying persistently
 * forever until it regains connectivity with the server.
 *
 * The connection tries to establish a websocket connection first, and will
 * fall back to polling if that fails (rather than the inverse). */
export function getClientSocket() {
  return io({
    // The amount of time a connection attempt will wait to establish before
    // failing.
    timeout: 20000,

    // Immediately connect and always reconnect if we get disconnected; keep
    // trying forever.
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,

    // This factor is applied to the reconnection time so that if the server goes
    // down ti doesn't get immediately swamped by all clients connecting again.
    randomizationFactor: 0.5,

    // we want to use websockets right away if they are available, and fall back
    // to polling only if they're not (and we probably don't want polling either,
    // generally speaking).
    transports: ["websocket", "polling"]
  });
}


// =============================================================================


/* Transmit a message to the remote end that announces who we are.
 *
 * The protocol between the client and the server on socket communications is
 * that before the server will accept any messages from a client socket, that
 * socket must first have announced itself.
 *
 *    event: 'hello'
 *    data: {
 *             bundle: <bundle-name-as-string>
 *             name:   <asset-name-as-string>
 *             type:   <asset-type-as-string>
 *          }
 */
export function hello(socket, asset, bundle) {
  assert(socket !== undefined, 'no socket provided to hello()');
  assert(asset !== undefined, 'no asset provided to hello()');
  assert(bundle !== undefined, 'no bundle provided to hello()');

  socket.emit('hello', {
    bundle: bundle.name,
    name:   asset.name,
    type:   asset.type
  });
}


// =============================================================================


/* Transmit a request to the remote end that tells it that we would like to
 * receive events directed at the named bundle.
 *
 * The server will reject this message if this socket has not first announced
 * itself via hello().
 *
 *    event: 'join'
 *    data: <bundle-name-as-string>
 */
export function join(socket, bundleName) {
  assert(socket !== undefined,     'no socket provided to join()');
  assert(bundleName !== undefined, 'no bundleName provided to join()');

  socket.emit("join", bundleName);
}


// =============================================================================


/* Transmit a request to the remote end that tells it that we would like to stop
 * receiving events directed at the named bundle.
 *
 * The server will reject this message if this socket has not first announced
 * itself via hello().
 *
 *    event: 'leave'
 *    data: <bundle-name-as-string>
 */
export function part(socket, bundleName) {
  assert(socket !== undefined, 'no socket provided to part()');
  assert(bundleName !== undefined, 'no bundleName provided to part()');

  socket.emit("part", bundleName);
}


// =============================================================================


/* Transmit a request to the remote end that tells it that we would like to
 * receive events directed at the named bundle.
 *
 * The server will reject this message if this socket has not first announced
 * itself via hello().
 *
 *     event: 'message'
 *     data: {
 *              bundle: <bundle-name-as-string>
 *              event:  <event-name-as-string>
 *              data:   <opaque-event-payload>
 *           }
 */
export function message(socket, bundleName, event, data) {
  assert(socket !== undefined, 'no socket provided to message()');
  assert(bundleName !== undefined, 'no bundleName provided to message()');
  assert(event !== undefined,  'no event provided to message()');

  socket.emit('message', { bundle: bundleName, event, data });
}


// =============================================================================
