import { getClientSocket, sendMsg } from '#api/socket';
import { format } from 'fecha';

import EventBridge from '@axel669/event-bridge';

// =============================================================================


/* All of the values here have this default value to begin with, and are set
 * by a call to the API initialization routine, which is where the data for
 * them comes from (except for the socket, which we make ourselves). */

/* The overall application configuration information. */
export let appConfig = {};

/* The bundle manifest for the bundle this asset is stored in. */
export let bundleInfo = {};

/* The configuration object for this asset; this is taken from the bundle
 * info above, but is specific to the asset for which the API initalized. */
export let assetConfig = {};

/* The log object; this needs to be initialized when the API is initialized
 * because it requires the name of the asset. */
export let log = {};

/* The websocket socket that we use to talk to the server. */
export let socket = undefined;

/* This sets the log levels that we support, in the order of their severity.
 * The order is important since a given level will log itself and everything
 * before it. */
const levels = ['error', 'warn', 'info', 'debug', 'silly'];

/* The global event object that we use to dispatch and listen for all of our
 * events. */
const bridge = EventBridge();

/* This object contains keys that are the names of bundles that we have listened
 * for events in and the number of times a listen for that bundle has happened.
 *
 * This is used to essentially garbage collect any joins to bundles other than
 * our own that are no longer needed when listens go away. */
const listens = {};


// =============================================================================


/* Initializes the Omphalos API by providing information on the given bundle,
 * asset and application configuration.
 *
 * Once the API is configured, a socket connection to the back end will be
 * established.
 *
 * This guards against repeated initializations and will throw an exception
 * if it is called when the API is already initialized. */
export function __init_api(manifest, asset, config) {
  // Guard against repeated calls; the socket is the fastest way to check.
  if (socket !== undefined) {
    throw new Error('omphalos api is already initialized; cannot re-init');
  }

  // Save all of the incoming information.
  bundleInfo = manifest;
  assetConfig = asset;
  appConfig = config;

  // Set up our backchannel communications.
  socket = getClientSocket();

  // Loop over all levels and set up a logger for all of them; loggers at a
  // level higher than the configured level are stubs.
  const timefmt = appConfig.logging.timestamp;
  levels.forEach(level => {
    if (appConfig.logging.console && levels.indexOf(level) <= levels.indexOf(appConfig.logging.level)) {
      log[level] = (msg) => console.log(`${format(new Date(), timefmt)} [${level}] ${asset.name}: ${msg}`)
    } else {
      log[level] = () => {}
    }
  });

  // When our socket connects, we need to announce ourselves to the server to
  // join the communications channel that is associated with our bundle, so that
  // events can be directed to us.
  socket.on('connect', () => {
    log.debug(`connection for ${asset.name}:${manifest.name} established on ${socket.id}`);

    // As soon as we connect, send a message to tell the server to join us to
    // events transmitted to our bundle.
    socket.emit("join", manifest.name);
  });

  // Display any messages that we get.
  socket.on('message', data => {
    const bundle = data.bundle || '*';

    log.silly(`incoming: bundle: ${bundle}, event: ${data.event}, payload: ${JSON.stringify(data.data)}`)
    log.silly(`emit: ${data.event}.${bundle}`)

    bridge.emit(`${data.event}.${bundle}`, data.data);
  });
}


// =============================================================================


/* Transmit an event to all listeners in a specific bundle. The event will get
 * sent to all members of that bundle except the sender, which presumably does
 * not need to get a message to itself since it already knows the content. */
export function sendMessageToBundle(bundle, event, data) {
  socket.emit('message', { bundle, event, data });
}


// =============================================================================


/* Transmit an event to all listeners in the current bundle. The event will get
 * sent to all members of the bundle except the sender. */
export function sendMessage(event, data) {
  sendMessageToBundle(bundleInfo.name, event, data);
}


// =============================================================================


/* Transmit an event to all listeners in all bundles. The event will not get
 * sent to the sender. */
export function broadcastMessage(event, data) {
  sendMessageToBundle(undefined, event, data);
}


// =============================================================================


/* Listen for an event and invoke the listener function provided with the
 * payload of the event when the event happens.
 *
 * The listen is for events in your own bundle; in order to listen for messages
 * in other bundles, specify the bundle name as the second argument to the
 * function.
 *
 * The return value is a function that you can use to remove the listener if
 * you no longer require it. */
export function listenFor(event, bundle, listener) {
  if (listener === undefined && bundle === undefined) {
    throw new Error('no event listener callback supplied');
  }

  // Second argument is optional but listener is required; if the call signature
  // has only two arguments, infer the bundle and use it as the listener.
  if (listener === undefined) {
    listener = bundle;
    bundle = bundleInfo.name;
  }

  // Count this as an event listened for in this bundle.
  listens[bundle] = (listens[bundle] === undefined) ? 1 : listens[bundle] + 1;

  // If the target bundle isn't ours and the join count on it is 1, we need to
  // join
  if (bundle !== bundleInfo.name && listens[bundle] === 1) {
    log.debug(`joining ${bundle} due to a listen on that bundle since that is not our bundle`);
    socket.emit("join", bundle);
  }

  // Listen for the event so it can trigger the listener, and capture the
  // function that will remove the listen.
  const unlisten = bridge.on(`${event}.${bundle}`, (event) => listener(event.data));

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

    // Drop the count. If it's 0 and this is not our bundle, then we can
    // leave this bundle's event stream.
    listens[bundle]--;
    if (bundle !== bundleInfo.name && listens[bundle] === 0) {
      log.debug(`leaving ${bundle}; not our bundle and there are no remaining listeners`);
      socket.emit("leave", bundle);
    }
  }
}
