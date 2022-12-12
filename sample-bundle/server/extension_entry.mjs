/* All bundles with server side code must specify a file that is the entry point
 * to the serve code, and that file should export a specifically named function
 * which will take as a paramter the API for the application.
 *
 * When the bundle loads, this function gets called to do final initialization
 * that might be needed. */
export function main(omphalos) {
    omphalos.log.info(`I am the extension entry point for the bundle ${omphalos.bundleInfo.name}`);
}

console.log('**************************************************');
console.log('*** Hold onto your wingnuts, the bundle loaded ***');
console.log('**************************************************');
