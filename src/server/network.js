import { logger } from '#core/logger';

import EventBridge from '@axel669/event-bridge';


// =============================================================================


/* Get our subsystem logger. */
const log = logger('network');

/* The global event object that we use to dispatch and listen for all of our
 * events. */
const bridge = EventBridge();


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
    log.debug(`incoming connection for ${socket.id}`);

    // Handle disconnects; for graphics this needs to update state that is used
    // in the UI so that the graphic display can indicate connection status.
    socket.on('disconnect', () => {
      log.debug(`socket is disconnecting: ${socket.id}`)
    });

    // We implement our own "join" message which the asset that is talking to us
    // will invoke to associate itself with a private communications channel.
    // This is what allows bundle specific events to be directed to only those
    // things that care about that bundle.
    socket.on("join", bundle => {
      log.debug(`socket is joining '${bundle}': ${socket.id}`);
      socket.join(bundle);
    });

    // The inverse of the join message; an asset can stop listening for the
    // events sent to a specific bundle.
    socket.on("leave", bundle => {
      log.debug(`socket is leaving '${bundle}': ${socket.id}`);
      socket.leave(bundle);
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
    // If bundle is set, the event will be broadcast to that specific bundle;
    // otherwise the message is broadcast to all assets in all bundles.
    // The event name and data can be anything you like.
    socket.on('message', data => {
      log.debug(`incoming message: ${JSON.stringify(data)}`);

      const target = (data.bundle !== undefined) ? socket.to(data.bundle) : socket.broadcast;

      target.emit('message', { bundle: data.bundle, event: data.event, data: data.data });
      dispatchMessageEvent(data.bundle, data.event, data.data);
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
  // If no bundle was provided, wildcard it. This can happen if the message is
  // a broadcast.
  bundle ??= '*';

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
  // Listen for the event so it can trigger the listener, and capture the
  // function that will remove the listen.
  const unlisten = bridge.on(`${event}.${bundle}`, (event) => listener(event.data));

  log.silly(`listening for event: ${event}.${bundle}`);

  // Return a wrapped function that will unlisten and also potentially remove a
  // listen on a bundle if it is no longer needed. This has a guard so that it
  // does not allow you to unlisten more than once.
  let unlistened = false;
  return () => {
    if (unlistened === true) {
      throw new Error('cannot unlisten more than once')
    }

    unlisten();
    unlistened = true;
  }
}