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


/* Transmit a message to the remote end, optionally directing the message to a
 * specific room. If the room is not specified, the message will be transmitted
 * globally. */
export function sendMsg(socket, msg, room=undefined) {
  // Transmit a message away; the event is always 'msg'; the room is optional
  // and the message will go either to there or to everyone, depending. The
  // msg is the actual payload of the message.
  socket.emit('msg', { room, msg } );
}


// =============================================================================