/* Bundles can optionally export an object named symbols; if they do, those
 * symbols will be available to other bundles that wish to import them through
 * the omphalos.require() function. */
export const symbols = {}

/* All bundles with server side code must specify a file that is the entry point
 * to the serve code, and that file should export a specifically named function
 * which will take as a paramter the API for the application.
 *
 * When the bundle loads, this function gets called to do final initialization
 * that might be needed. */
export function main(omphalos) {
    omphalos.log.info(`I am the extension entry point for the bundle ${omphalos.bundleInfo.name}`);

    // Add a simple export; we don't need to do this here, but it lets us
    // capture the omphalos object for logging.
    symbols["exported"] = () => omphalos.log.info('I am an exported function');

    // Try to import a symbol from another omphalos bundle; this will give you
    // object list of symbols from that bundle, which may be empty if that
    // bundle exports no symbols.
    const { imported } = omphalos.require('some-bundle');
    if (imported !== undefined) {
        omphalos.log.info('We imported a function from another bundle');
    } else {
        omphalos.log.warn('Attempt to import a symbol failed.');
    }
}
