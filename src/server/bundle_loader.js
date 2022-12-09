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

/* Exceptions of this class represent errors in loading bundles that are related
 * to files being missing; this does not include any exceptions that might be
 * thrown during the execution of extension code at startup. */
export class BundleLoadError extends Error {
  constructor(message = "", ...args) {
    super(message, ...args);
  }
}


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
    .filter(dir => {
      if (jetpack.exists(resolve(bundles, dir, 'package.json')) === 'file') {
        return true;
      }

      log.warn(`configured additional bundle was not found: ${dir}`);
      return false;
    })
  );

  log.info(`found ${pathList.length} potential bundle(s)`)

  return pathList;
}


// =============================================================================


/* Given an object whose keys are the names of valid bundles and whose values
 * are the manifests for those bundles, satisfy all depenencides as well as we
 * possibly can.
 *
 * For each package, the list of dependencies is verified to ensure that all of
 * the dependencies that it requires are present and at a sufficient version.
 *
 * If any dependency is missing, the entire bundle is redacted away, and this
 * will cascade so that any bundles that depend on this bundle will also be
 * similarly removed.
 *
 * On return, the incoming list of bundles will have been modified (in place)
 * to contain only those bundles whose dependencies are satisified.
 *
 * All remaining bundles are normalized so that they have a deps key (even if
 * it is empty) and all dependency records have their version specifier replaced
 * with a reference to the actual bundle object.
 *
 * The result is a directed graph, which we **DO NOT** guarantee is Acyclic;
 * that test/adjustment needs to be done separately by the caller. */
function satisfyDependencies(bundles) {
  // Iterate over the bundles and clear away any that are not satisfied by
  // recursively calling ourselves until the loop completes.
  //
  // This can't use Array.forEach() because we need the iteration to stop when
  // a dependency is stripped away.
  for (const bundle of Object.values(bundles)) {
    // Normalize to have a deps key on the inner omphalos object
    if (bundle.omphalos.deps === undefined) {
      bundle.omphalos.deps = {};
    }

    // Iterate over all of the dependencies to verify that they exist and that
    // their versions are satisified. Anything that is not valid or satisfied
    // gets kicked out of the list, and if it is satisfied, the record is
    // updated so that it references the actual bundle object by name and not
    // just a version.
    for (const [depName, neededVersion] of Object.entries(bundle.omphalos.deps)) {
      const dep = bundles[depName];

      // Delete and cycle if this dependency is missing, doesnot have a version
      // that satisifies, or is depending on itself.
      if (depName === bundle.name || dep === undefined || semver.satisfies(dep.version, neededVersion) === false) {
        log.error(
          (depName === bundle.name)
            ? `${bundle.name} is listed as a dependency of itself`
            : (dep === undefined)
                ? `${bundle.name} depends on ${depName}, which was not found or not loaded`
                : `${bundle.name} requires ${depName}:${neededVersion}; not satified by ${dep.version}`
        );
        delete bundles[bundle.name];
        return satisfyDependencies(bundles);
      } else {
        // Update the reference on this dependency to point to the manifest
        bundle.omphalos.deps[depName] = bundles[depName]
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

      // Now that we know that the manifest is nominally correct, announce what
      // bundle this manifest included, since logs up until now have only
      // included the path, which may not match.
      log.info(`found bundle '${manifest.name}`)

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
      if (bundles[manifest.name] !== undefined) {
        log.error(`duplicate bundle '${manifest.name}'; cannot load`);

        // Mark this entry in the list as a duplicate.
        if (bundles[manifest.name].omphalos.duplicate !== true) {
          log.error(`'${manifest.name}' first seen at: ${bundles[manifest.name].omphalos.location}`);
          bundles[manifest.name].omphalos.duplicate = true;
        }

        log.error(`'${manifest.name}' also found at: ${thisBundle}`)
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

  // Trim away all of the bundles that were flagged as being duplicates; those
  // bundles should not be loaded because the version chosen would be ambiguous.
  bundles = Object.fromEntries(
    Object.entries(bundles).filter(
      item => item[1].omphalos.duplicate === undefined
    )
  );

  // Satisfy all the dependencies in the list of bundles; this may remove items
  // from the list if their dependencies cannot be satisfied. This also converts
  // the structure into a directed graph, though it is not guaranteed to be
  // acyclic.
  satisfyDependencies(bundles);

  // TODO: Implement Tarjan here to ensure that there are no cyclic dependencies
  //       in our dependency tree; anything that is cyclic needs to be kicked
  //       out similar to what the manifest loader does.

  return bundles;
}


// =============================================================================


/* This function takes as input an object whose keys are bundle names and whose
 * values are manifest objects for those bundles, and updates the provided
 * output load order such that it contains the order the bundles in the list
 * should be loaded to ensure that all dependencies are satisfied prior to a
 * load.
 *
 * The function calls itself recursively in a depth first search in order to
 * root the load in the leaf nodes that have no dependencies before considering
 * the bundles that rely on those dependencies. */
function getLoadOrder(node, out_load_order) {
  for (const manifest of Object.values(node)) {
    // Recursively call ourselves on our dependency list, which may be empty.
    getLoadOrder(manifest.omphalos.deps, out_load_order);

    // If we haven't already been visited, add ourselves to the output load
    // order and mark ourselves. We might appear several times in the traversal
    // but we only need to record ourselves once.
    if (manifest.visited !== true) {
      manifest.visited = true;
      out_load_order.push(manifest.name)
    }
  }
}


// =============================================================================


/* Given a bundle manifest, attempt to load the content. This includes loading
 * the extension module (if any) and invoking the entry point as well as
 * returning a router that will serve the panels and overlays for the bundle
 * as appropriate.
 *
 * If the bundle has no pages to serve, then no router will be returned.
 *
 * If there is any error in loading the bundle, such as a missing resource or
 * an error occurs while launching the extension code, this will raise an
 * exception. */
async function loadBundle(manifest) {
  let router = null;
  log.info(`loading bundle ${manifest.name}`);

  // If there are panels, then ensure that all of the files that they reference
  // exist and are readable, then create a router and add routes to it for each
  // of the files.

  // If there are overlays, then do the same thing as above, but with different
  // routes; may also need to create the router if there were no panels.

  // If there is an extension file, then load it, pull out the export that is
  // the entry point, and call it, awaiting its return.

  // Return the router for the files in this bundle, if any.
  return router;
}


// =============================================================================


/* This function does all of the work of bundle loading. In particular it will
 * discover all of the bundles that exist in the configured locations, validate
 * that they have a proper package file, that they are compatible with the
 * current version of the application, and ensure that their dependent
 * packages exist as well.
 *
 * Once that is done, each bundle is loaded in appropriate order to ensure that
 * dependencies are satisfied. If a bundle fails to load, its dependents will
 * also not be loaded. */
export async function loadBundles(appManifest) {
  // Discover all bundles that we can load and return a DAG that represents the
  // dependency structure between the bundles.
  const bundles = loadBundleManifests(appManifest);
  // console.dir(bundles, { depth: null });

  // Now that we have a list of bundles that we know all have satisfied, non
  // cyclic dependencies, determine the load order.
  const loadOrder = [];
  getLoadOrder(bundles, loadOrder);

  // Loop over the load order and load each bundle in turn. We track which
  // bundles successfully loaded so that we can verify if we should load a
  // package if any of its dependencies did not load.
  const loadedBundles = [];
  for (const name of loadOrder) {
    try {
      // Check the list of dependencies against the list of loaded bundles; if
      // any are missing, we can't load this bundle.
      const deps = Object.keys(bundles[name].omphalos.deps);
      deps.forEach(depName => {
        if (loadedBundles.includes(depName) === false) {
          throw new BundleLoadError(`cannot load ${name}; dependency ${depName} did not load`)
        }
      });

      // Looks good, load the bundle and capture the router, if any.
      const bundle_router = await loadBundle(bundles[name]);

      // Do something useful with the router, like add it to an overall router
      // or something.

      // This loaded
      loadedBundles.push(name);
    }
    catch (errorObj) {
      log.error(`error while loading ${name}: ${errorObj}`);
      if (errorObj instanceof BundleLoadError === false) {
        log.error(errorObj.stack);
      }
    }
  }
}

// =============================================================================

