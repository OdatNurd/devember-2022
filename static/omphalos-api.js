function getClientSocket() {
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

function sendMsg(socket, msg, room=undefined) {
  // Transmit a message away; the event is always 'msg'; the room is optional
  // and the message will go either to there or to everyone, depending. The
  // msg is the actual payload of the message.
  socket.emit('msg', { room, msg } );
}

// Create a socket on load, an when it connects, join the channel related to
// the panel name. (should actually be bundle name, but right now we're
// testing with a single bundle).
const socket = getClientSocket();
socket.on('connect', () => {
  console.log(`connection for ${assetConfig.name} established on ${socket.id}`);

  // When we connect, transmit an immediate message to have the server join us
  // to our channel. Only the server can do this, and only the server can direct
  // traffic to a room. fun.
  console.log(`joining room '${assetConfig.name}'`)
  socket.emit("join", assetConfig.name);

  // Sample messages; the first one will go only to the room that we given,
  // and the other should end up everywhere.
  sendMsg(socket, `I am a message to just my room, '${assetConfig.name}'`, assetConfig.name);
  sendMsg(socket, `I am a message from '${assetConfig.name}' to everyone everywhere`);
});


// If we get a message, regardless of where, then display it.
socket.on('msg', data => {
  console.log(`${assetConfig.name} received a message: '${data}'`)
});
