import { getClientSocket } from '#api/socket';
import { assert } from '#api/assert';
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
 * info above, but is specific to the asset for which the API initialized. */
export let assetConfig = {};

/* The websocket socket that we use to talk to the server. */
export let socket = undefined;

/* This sets the log levels that we support, in the order of their severity.
 * The order is important since a given level will log itself and everything
 * before it. */
const levels = ['error', 'warn', 'info', 'debug', 'silly'];

/* Our log object. We front load it with stubs for all levels, and when the API
 * is initialized the log initialize routine will replace some or all of the
 * stubs with a logger that uses the asset name, depending on level and
 * configuration. */
export const log = {
  'error': () => {},
  'warn': () => {},
  'info': () => {},
  'debug': () => {},
  'silly': () => {},
};


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


/* Initialize logging based on the passed in logger configuration object and
 * the name of the asset.
 *
 * This will set up any required log levels with a dedicated logger that outputs
 * logs for the given asset. */
function setupLogger(config, name) {
  // Already configured if we don't want to log to the console at all.
  if (config.console === false) {
    return;
  }

  // Set up a logger from the lowest level up to and including the desired log
  // level.
  const timestamp = () => format(new Date(), config.timefmt);
  for (let i = 0 ; i <= levels.indexOf(config.level) ; i++) {
    const level = levels[i];

    log[level] = msg => console.log(`${timestamp} [${level}] ${name}: ${msg}`);
  }
}


// =============================================================================


/* Initializes the Omphalos API by providing information on the given bundle,
 * asset and application configuration.
 *
 * Once the API is configured, a socket connection to the back end will be
 * established.
 *
 * This guards against repeated initialization and will throw an exception
 * if it is called when the API is already initialized. */
export function __init_api(manifest, asset, config) {
  // Guard against repeated calls; the socket is the fastest way to check.
  assert(socket === undefined, 'omphalos API is already initialized');

  // Save all of the incoming information.
  bundleInfo = manifest;
  assetConfig = asset;
  appConfig = config;

  // Set up our back-channel communications socket; this will keep itself
  // connected permanently.
  socket = getClientSocket();

  // Set up our log handling.
  setupLogger(appConfig.logging, asset.name);

  // When our socket connects, we need to announce ourselves to the server to
  // join the communications channel that is associated with our bundle, so that
  // events can be directed to us.
  socket.on('connect', () => {
    log.debug(`connection for ${asset.name}:${manifest.name} established on ${socket.id}`);

    // As soon as we connect, send a message to tell the server to join us to
    // events transmitted to our bundle.
    socket.emit("join", manifest.name);
  });

  // Dispatch incoming messages. They should have a structure of:
  //    event: 'message'
  //    data: {
  //             bundle: <bundle-name-as-string>
  //             event:  <event-name-as-string>
  //             data:   <opaque-event-payload>
  //          }
  socket.on('message', data => {
    // Log first so if an assertion fails, we can see the full content first.
    log.silly(`incoming: bundle: ${data.bundle}, event: ${data.event}, payload: ${JSON.stringify(data.data)}`)

    assert(data.bundle !== undefined, 'incoming message contains no bundle');
    assert(data.event !== undefined, 'incoming message has no message name');

    // Raise the event
    log.silly(`emitting event: ${data.event}.${data.bundle}`)
    bridge.emit(`${data.event}.${data.bundle}`, data.data);
  });
}


// =============================================================================


/* Transmit an event to all listeners in a specific bundle. The event will get
 * sent to all members of that bundle except the sender, which presumably does
 * not need to get a message to itself since it already knows the content. */
export function sendMessageToBundle(bundle, event, data) {
  assert(bundle !== undefined, 'valid bundle not specified');
  assert(event !== undefined, 'message not specified');

  socket.emit('message', { bundle, event, data });
}


// =============================================================================


/* Transmit an event to all listeners in the current bundle. The event will get
 * sent to all members of the bundle except the sender. */
export function sendMessage(event, data) {
  assert(event !== undefined, 'message not specified');

  sendMessageToBundle(bundleInfo.name, event, data);
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
  assert(event !== undefined, 'message not specified');

  // If there is no listener, the bundle argument is actually the listener and
  // the bundle is inferred; hence we need at least one of the two set or the
  // call is missing too many arguments.
  assert(bundle !== undefined || listener !== undefined, 'no event listener callback supplied');

  // Second argument is optional but listener is required; if the call signature
  // has only two arguments, infer the bundle and use it as the listener.
  if (listener === undefined) {
    listener = bundle;
    bundle = bundleInfo.name;
  }

  // Count this as an event listened for in this bundle.
  listens[bundle] = (listens[bundle] === undefined) ? 1 : listens[bundle] + 1;

  // If this is not our bundle and this is the first listen on it, we need to
  // join that bundle's messaging group.
  if (bundle !== bundleInfo.name && listens[bundle] === 1) {
    log.debug(`joining ${bundle}; listening for ${event} outside our bundle`);
    socket.emit("join", bundle);
  }

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

    // If this is not our bundle and this was our last listen, we can leave the
    // messaging group now.
    listens[bundle]--;
    if (bundle !== bundleInfo.name && listens[bundle] === 0) {
      log.debug(`leaving ${bundle}; no remaining events outside our bundle`);
      socket.emit("leave", bundle);
    }
  }
}
