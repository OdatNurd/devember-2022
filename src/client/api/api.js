import { getClientSocket, sendMsg } from '#api/socket';
import { format } from 'fecha';

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
    log.debug(`event: ${data.event}, payload: ${JSON.stringify(data.data)}`)
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


