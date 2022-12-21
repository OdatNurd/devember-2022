import { logger } from '#core/logger';


// =============================================================================


/* Get our subsystem logger. */
const log = logger('network');


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
    // things that are in that bundle.
    socket.on("join", bundle => {
      log.debug(`socket is associated with bundle '${bundle}': ${socket.id}`);
      socket.join(bundle);
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

      log.debug(`emiting '${data.event}'`);
      target.emit('message', { event: data.event, data: data.data });
    })
  });
}


// =============================================================================
