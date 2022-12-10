import { config } from '#core/config';
import { logger } from '#core/logger';

import { discoverBundles, getBundleLoadOrder } from '#core/bundle_resolver';

import { resolve } from 'path';


// =============================================================================


/* Get our subsystem logger. */
const log = logger('loader');


/* Exceptions of this class represent errors in loading bundles that are related
 * to files being missing; this does not include any exceptions that might be
 * thrown during the execution of extension code at startup. */
export class BundleLoadError extends Error {
  constructor(message = "", ...args) {
    super(message, ...args);
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
  console.dir(manifest, { depth: null });

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
  const bundles = discoverBundles(appManifest);

  // Now that we have a list of bundles that we know all have satisfied, non
  // cyclic dependencies, determine the load order.
  const loadOrder = getBundleLoadOrder(bundles);

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

      // TODO: Do something useful with the router, like add it to an overall
      //       router or something.

      // Add this bundle as one that loaded.
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

