import { config } from '#core/config';
import { logger } from '#core/logger';

import joker from '@axel669/joker';
import jetpack from 'fs-jetpack';
import semver from 'semver';

import { resolve, isAbsolute } from 'path';


// =============================================================================


/* Get our subsystem logger. */
const log = logger('bundles');


/* Include an extra validation type that knows how to validate a packge semver
 * and semver ranges. Includes also appropriate error messages for the
 * validations. */
joker.extendTypes({
  "semver.$":   (item) => semver.valid(item) === null,
  "semrange.$": (item) => semver.validRange(item) === null,
})

joker.extendErrors({
    "semver.$":   (item) => `${item} is not a valid semantic version number`,
    "semrange.$": (item) => `${item} is not a valid semantic version range`
})



// =============================================================================


/* This validates that an object is a valid general package manifest as far as
 * the properties that we need out of it are concerned. */
const validPackageManifest = joker.validator({
  itemName: 'root',
  root: {
    "name": "string",
    "version": "semver"
  }
});


/* For any folder that might contain a bundle it must have a package.json with
 * a manifest that includes an omphalos key with the following structure; if
 * not it will not be considered as a valid bundle and will not be loaded. */
const validBundleManifest = joker.validator({
  itemName: 'omphalos',
  root: {
    // What versions of omphalos are compatible with this bundle? If the version
    // of omphalos is not compatible, this bundle won't load.
    "compatibleRange": "semrange",

    // Bundles that must exist and be loaded in order for this bundle to load.
    // If present, a bundle with the given name and compatible version will be
    // loaded prior to this bundle loading; if any dependencies fail to load,
    // this bundle will also not load.
    "?deps{}": "semrange",

    // manifest relative path to an optional server side extension js file; if
    // this is set, the file must export the appropriate function which will be
    // called when the bundle is mounted.
    "?extension": "string",

    // A list of user interface panels that should be presented for this bundle.
    // Sizes are in columns and rows. If a panel is locked, it will not be
    // automatically moved, though it can still be moved manually. All panels
    // in the same workspace are grouped together; there is a default workspace.
    // If a panel is fullbleed, it consumes its entire workspace. In that case
    // it is the only item that will exist in that workspace; a new workspace
    // will be created as needed to enforce this.
    "?panels[]": {
      "file": "string",
      "name": "string",
      "title": "string",
      "?locked": "bool",
      "size": {
        "width": "int",
        "height": "int"
      },
      "?minSize": {
        "width": "int",
        "height": "int"
      },
      "?maxSize": {
        "width": "int",
        "height": "int"
      },
      "?workspace": "string",
      "?fullbleed": "bool"
    },

    // A list of stream graphic files that are contained in thus bundle. The
    // sizes are in pixels and are informational only. A graphic that is single
    // instance will only be served to a single client, after which all other
    // attempts to serve that graphic will fail unless the connection is broken.
    "?graphics[]": {
      "file": "string",
      "size": {
        "width": "int",
        "height": "int"
      },
      "?singleInstance": "bool"
    }
  }
});


// =============================================================================


/* This does the work of scanning for all possible bundle folders, both in the
 * regular bundle folder as well as in all configured extra bundle folders. The
 * return value is a list of paths which probably contain a bundle; this means
 * that they have a manifest but that it has not been checked yet. */
function getBundlePaths() {
  const baseDir = config.get('baseDir');
  const bundles = config.get('bundleDir');

  log.info('scanning the bundle folder for installed bundles');

  // Find all directories in the bundle directory that appear to have a manifest
  // in them.
  const pathList = jetpack.list(bundles).filter(dir => {
    return jetpack.inspect(resolve(bundles, dir)).type === 'dir' &&
           jetpack.exists(resolve(bundles, dir, 'package.json')) === 'file'
  }).map(dir => resolve(bundles, dir));

  // Iterate over all of the extra bundle paths that have been configured, and
  // collect the ones that are actually bundles. The paths can be either
  // relative to the install directory, or absolute.
  pathList.push(...config.get('bundles.additional')
    .map(dir => isAbsolute(dir) ? dir : resolve(baseDir, dir))
    .filter(dir => jetpack.exists(resolve(bundles, dir, 'package.json')) === 'file')
  );

  log.info(`found ${pathList.length} potential bundle(s)`)

  return pathList;
}


// =============================================================================


/* This will scan the global bundle folder as well as all of the folders that
 * have been configuered for extra bundles to find all potential bundles.
 *
 * From the list of potentials, any that we're supposed to ignore are kicked out
 * and the remainder are validated and loaded in dependency order.
 *
 * Execution does not contiunue until all bundles have been loaded. */
export async function loadBundles() {
  // Get the list of bundle names that we should skip over loading; this holds
  // the names of bundles as defined from the name property in their manifest.
  const ignoredBundles = config.get('bundles.ignore');
  const bundleDir = config.get('bundleDir');

  // Check all potential bundles to see if they actually represent a bundle of
  // some sort.
  for (const thisBundle of getBundlePaths()) {
    try {
      const name = resolve(thisBundle, 'package.json');
      log.info(`loading bundle manifest from ${name.startsWith(bundleDir) ? name.substring(bundleDir.length + 1) : name}`);

      // Start by loading the package.json for the bundle; this gets an object
      // or undefined if the file is missing. Errors are handled below.
      const manifest = jetpack.read(name, 'json');
      if (manifest === undefined) {
        throw new Error(`bundle folder does not contain a package.json`)
      }

      // console.log(manifest);

      // A bare minimum of fields must be present for this to be an overall
      // valid package manifest.
      const validPkg = validPackageManifest(manifest);
      if (validPkg !== true) {
        throw new Error(validPkg.map(e => e.message).join(', '))
      }

      // If the name of this package is in the list of bundles to ignore, we
      // can just skip to the next item.
      if (ignoredBundles.includes(manifest.name)) {
        log.info(`skipping ${manifest.name}; this bundle is ignored`)
        continue;
      }

      // In order to be a valid bundle, the manifest needs to have the required
      // extra keys.
      const validBundle = validBundleManifest(manifest.omphalos);
      if (validBundle !== true){
        throw new Error(validBundle.map(e => e.message).join(', '))
      }
    }
    catch (err) {
      log.error(`error loading bundle manifest: ${err}`)
    }
  }
}

// =============================================================================


