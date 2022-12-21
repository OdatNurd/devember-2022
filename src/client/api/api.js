import { getClientSocket, sendMsg } from '#api/socket';


// =============================================================================


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
