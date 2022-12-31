import { logger } from '#core/logger';

import { assert } from '#api/assert';

import EventBridge from '@axel669/event-bridge';


// =============================================================================


/* Get our subsystem logger. */
const log = logger('network');

/* The global event object that we use to dispatch and listen for all of our
 * events. */
const bridge = EventBridge();

/* This tracks a list of incoming sockets and associates them with the info that
 * is provided in a "hello" introduction message.
 *
 * In the object the keys are socket ID's and the value is the information about
 * that particular client.
 *
 * Items are added on connect and dropped on disconnect. */
const clients = {};


// =============================================================================


/* Given a socket instance, return back a string that describes who the other
 * other end of the connection is. */
function client_info(socket) {
  const client = clients[socket.id];
  if (client === undefined) {
    return `??? (${socket.id})`;
  }

  return `${client.type}.${client.name}.${client.bundle}`;
}


// =============================================================================


/* Set up all of the server side socket handling.
 *
 * We implement a simple protocol in which, when an asset connects to us it
 * sends us a message that joins it to a specific server side room based on its
 * bundle name:
 *
 *    event: 'join'
 *    data:  <bundle-name-as-string>
 *
 * All messages are transported between the various parts of the system by
 * sending a "message" message, with a field that indicates the bundle that the
 * message is for, the name of the actual message to deliver, and the payload:
 *
 *    event: 'message'
 *    data: {
 *             bundle: <bundle-name-as-string>
 *             event:  <event-name-as-string>
 *             data:   <opaque-event-payload>
 *          }
 *
 * When a 'message' event is received, we will direct it to the appropriate
 * room, where the handlers can use the internal event to know what the message
 * actually is.
 *
 * Short story long, the 'message' event is used to route traffic, and the
 * actual event is in the payload. */
export function setupSocketIO(io) {
  // Set up a global event handler for knowing when we're getting incoming
  // connections. This sets up the socket specific handlers that allow us to
  // manage our communications.
  io.on('connection', socket => {
    log.silly(`CONNECT: ${socket.id}`);

    // Handle disconnects; for graphics this needs to update state that is used
    // in the UI so that the graphic display can indicate connection status.
    socket.on('disconnect', () => {
      log.silly(`DISCONNECT: [${client_info(socket)}]`);

      // Drop this client since their socket is now gone.
      delete clients[socket.id];
    });

    // Our messaging system from client to client comes through us and directs
    // traffic at specific bundles. To that end clients need to join and leave
    // the transmission groups of messages as they deem neccessary.
    socket.on("join", bundle => {
      if (clients[socket.id] !== undefined) {
        log.debug(`JOIN: ${bundle}: [${client_info(socket)}]`);
        socket.join(bundle);
      } else {
        log.warning(`JOIN: incoming request from unknown client (${socket.id}`);
      }
    });

    socket.on("part", bundle => {
      if (clients[socket.id] !== undefined) {
        log.debug(`PART: ${bundle}: [${client_info(socket)}]`);
        socket.leave(bundle);
      } else {
        log.warning(`PART: incoming request from unknown client (${socket.id}`);
      }
    });

    socket.on("hello", data => {
      clients[socket.id] = {
        type: data.type,
        name: data.name,
        bundle: data.bundle
      };

      log.debug(`HELO: [${client_info(socket)}]`)
    });

    // Handle an incoming message from the remote end; these are in a very
    // specific format:
    //
    //   event name: 'message'
    //   data:       {
    //                   bundle: '',
    //                   event: '',
    //                   data: '',
    //               }
    //
    // Messages get sent to the specific bundle provided. The event name is
    // required and is the actual message being sent (which is defined at the
    // user level); the data payload is optional.
    socket.on('message', msgData => {
      if (clients[socket.id] === undefined) {
        log.warning(`MSG: incoming request from unknown client (${socket.id}`);
        return;
      }

      log.silly(`MSG: ${JSON.stringify(msgData)}`);

      const { bundle, event, data } = msgData;

      assert(bundle !== undefined, 'incoming message contains no bundle');
      assert(event !== undefined, 'incoming message has no message name');

      socket.to(bundle).emit('message', { bundle, event, data });
      dispatchMessageEvent(bundle, event, data);
    })
  });
}


// =============================================================================


/* This internal helper will trigger an appropriate event on the event bridge
 * to let any listeners know that a message has arrived.
 *
 * This is used to deliver messages to extension code, which don't have web
 * socket connections and thus are outside of the chain of delivery. */
export function dispatchMessageEvent(bundle, event, data) {
  log.silly(`incoming: bundle: ${bundle}, event: ${event}, payload: ${JSON.stringify(data)}`)

  log.silly(`emit event: ${event}.${bundle}`)
  bridge.emit(`${event}.${bundle}`, data);
}


// =============================================================================


/* Listen for an event and invoke the listener function provided with the
 * payload of the event when the event happens.
 *
 * This is meant to be used in the actual implementation in the server side API;
 * this one assumes that it has ALWAYS been given a bundle. The caller needs to
 * backfill the bundle with the default at the call point where it's known.
 *
 * As in the client API, the  return value is a function that you can use to
 * remove the listener if you no longer require it. */
export function listenFor(event, bundle, listener) {
  // Listen for the event; the return is the function to remove the listener.
  log.silly(`listening for event: ${event}.${bundle}`);
  const unlisten = bridge.on(`${event}.${bundle}`, (event) => listener(event.data));

  // When removing the listener, update the listen count and possibly leave a
  // bundle's messaging group if we no longer need it.
  let unlistened = false;
  return () => {
    assert(unlistened === false, 'cannot remove listener more than once');

    unlisten();
    unlistened = true;
  }
}