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
 * regular bundle folder as well as in all configured extra bundle folders.
 *
 * The return value is a list of absolute paths which probably contain a bundle;
 * this means that they have a manifest but that it has not been checked for
 * validity yet. */
function getBundlePaths() {
  const baseDir = config.get('baseDir');
  const bundles = config.get('bundleDir');

  log.info('scanning the bundle folder for installed bundles');

  // Scan for all directories in the overall bundle directory and find all that
  // have a packqge.json in them; we don't need to validate it, just find it to
  // mark it as a candidate.
  //
  // All candidates are stored into an array as their absolute bundle path.
  const pathList = jetpack.list(bundles).filter(dir => {
    return jetpack.inspect(resolve(bundles, dir)).type === 'dir' &&
           jetpack.exists(resolve(bundles, dir, 'package.json')) === 'file'
  }).map(dir => resolve(bundles, dir));

  // In addition to the above, the configuration can specify extra folders that
  // contain bundles. Scan now over those taking the same steps as above to
  // find all extra directories that appear to be bundles and return their
  // absolute paths.
  //
  // Here the path might be absolute; if it's not then it's relative to the
  // base install location of the application.
  pathList.push(...config.get('bundles.additional')
    .map(dir => isAbsolute(dir) ? dir : resolve(baseDir, dir))
    .filter(dir => jetpack.exists(resolve(bundles, dir, 'package.json')) === 'file')
  );

  log.info(`found ${pathList.length} potential bundle(s)`)

  return pathList;
}


// =============================================================================


/* Given an object that contains a list of bundles, remove from it all of the
 * bundles which have dependencies that are not satisified, either because the
 * bundle was not found, or because its version is not valid. */
function stripInvalidDependencies(bundles) {
  // Iterate over the bundles and clear away any that are not satisfied by
  // recursively calling ourselves until the loop completes.
  //
  // This can't use Array.forEach() because we need the iteration to stop when
  // a dependency is stripped away.
  for (const bundle of Object.values(bundles)) {
    if (bundle.omphalos.deps === undefined) {
      continue;
    }

    // Iterate over all of the dependencies to verify that they exist and that
    // their versions are satisified. Anything that is not valid or satisfied
    // gets kicked out of the list.
    for (const [pkgName, requiredVersion] of Object.entries(bundle.omphalos.deps)) {
      // If the dependant bundle doesn't exist, we can't load this one.
      const dependant = bundles[pkgName];

      if (dependant === undefined || semver.satisfies(dependant.version, requiredVersion) === false) {
        log.error((dependant === undefined)
          ? `${bundle.name} depends on ${pkgName}, which was not found or not loaded`
          : `${bundle.name} requires ${pkgName}:${requiredVersion}; not satified by ${dependant.version}`)
        delete bundles[bundle.name];
        return stripInvalidDependencies(bundles);
      }
    }
  };
}


// =============================================================================

/* Using the configuration of the application, find all of the folders that
 * contain bundles, determine which are actually valid, and return back all of
 * the manifests that are valid.
 *
 * This performs validations on the manifests to ensure that we only keep the
 * ones that are actually bundles; those which are well formed, have the
 * required application specific keys, and match version requirements. */
export function loadBundleManifests(appManifest) {
  // Get the list of bundle names that we should skip over loading; this holds
  // the names of bundles as defined from the name property in their manifest,
  // NOT their folder names.
  const ignoredBundles = config.get('bundles.ignore');
  const bundleDir = config.get('bundleDir');

  // The list of loaded and validated bundle manifests; items in here are
  // valid in that their structure is good and their version requirements for
  // the app are satisfied.
  //
  // Bundles are stored with their name as a key and their manifest as the
  // value.
  let bundles = {};

  // Find all possible bundles, then load and validate their manifest files.
  for (const thisBundle of getBundlePaths()) {
    try {
      // Determine the manifest file name based on the bundle path.
      const name = resolve(thisBundle, 'package.json');
      log.info(`loading bundle manifest from ${name.startsWith(bundleDir) ? name.substring(bundleDir.length + 1) : name}`);

      // Start by loading the package.json for the bundle; this gets an object
      // or undefined if the file is missing. Errors are handled below.
      const manifest = jetpack.read(name, 'json');
      if (manifest === undefined) {
        throw new Error(`bundle folder does not contain a package.json`)
      }

      // Validate that the "normal" node package keys are present and valid.
      const validPkg = validPackageManifest(manifest);
      if (validPkg !== true) {
        throw new Error(validPkg.map(e => e.message).join(', '))
      }

      // If this is a bundle we can ignore, do so now. This happens after the
      // prior validation because it requires that there be a name.
      if (ignoredBundles.includes(manifest.name)) {
        log.info(`skipping ${manifest.name}; this bundle is ignored`)
        continue;
      }

      // In order to be a valid bundle, the manifest needs to have the required
      // extra application specific keys.
      const validBundle = validBundleManifest(manifest.omphalos);
      if (validBundle !== true){
        throw new Error(validBundle.map(e => e.message).join(', '))
      }

      // If this bundle's required application version is not satisfied, this
      // bundle can't be loaded.
      if (semver.satisfies(appManifest.version, manifest.omphalos.compatibleRange) !== true) {
        throw new Error(`bundle ${manifest.name} cannot run in this application version; requires ${manifest.omphalos.compatibleRange}`)
      }

      // If this bundle already exists in the list of known bundles, then there
      // is more than one bundle with the same name but in different locations.
      // In such a case, don't load this bundle, and also don't load the other
      // one.
      //
      // TODO: This test presumes that the same bundle only appears twice; if it
      //       appears an odd number of times, then the odd version will be
      //       loaded because the first two will have been cleared away.
      if (bundles[manifest.name] !== undefined) {
        log.error(`duplicate bundle '${manifest.name}'; cannot load`);
        log.error(`${manifest.name} first seen at: ${bundles[manifest.name].omphalos.location}`);
        log.error(`${manifest.name} also found at: ${thisBundle}`)
        delete bundles[manifest.name]
      } else {
        // This is a valid manifest; store it's manifest location inside of the
        // omphalos key so that the server code knows where to find any assets
        // from this bundle, then save it.
        manifest.omphalos.location = thisBundle;
        bundles[manifest.name] = manifest;
      }
    }
    catch (err) {
      log.error(`error loading bundle manifest: ${err}`)
    }
  }

  // Given our object that contains all of the currently known bundles, adjust
  // it to kick out any whose depencies are not in the list or whose
  // dependencies are in the list but are not satisfied by version requirements.
  stripInvalidDependencies(bundles);

  // Return back the object that lists all of the dependencies that still exist
  // and can still be loaded.
  return bundles;
}

// =============================================================================

export async function loadBundles(appManifest) {
  // Gather the list of bundles that we should be loading; this will discover
  // all bundles,
  const bundles = loadBundleManifests(appManifest);
  console.dir(bundles, { depth: null});

  // We now have a list of bundles that we know how to load; determine the
  // dependency load order. If this turns up any bundles whose dependencies do
  // not exist, those packages need to also be removed, which might cause a
  // removal cascade.
  //
  // Part of this check has to verify that not only do bundles exist, but that
  // they have correct verions.

}

// =============================================================================

