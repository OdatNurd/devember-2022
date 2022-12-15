import { config } from '#core/config';
import { logger } from '#core/logger';

import { discoverBundles, getBundleLoadOrder } from '#core/bundle_resolver';
import { resolve, basename } from 'path';

import express from 'express';
import jetpack from 'fs-jetpack';


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


/* Handle serving static files from a given folder

/* This function will respond to a express route request by serving the content
 * of the static file provided. The filename must be an absolute path for the
 * serve to work.
 *
 * This can be used to transmit any file, although it is primarily intended for
 * serving panel and overlay pages. */
// Incoming file must be an absolute filename
function serveStaticFile(req, res, staticFile) {
  const log = logger('express');
  log.debug(`serving ${staticFile}`);

  const options = {
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
      'x-item-filename': basename(staticFile)
    }
  };

  res.sendFile(staticFile, options, err => {
    if (err) {
      log.error(`error sending ${staticFile}: ${err}`);
      res.status(404).send('error sending file');
    }
  });
}


// =============================================================================


/* This function sets up all of the routes needed to serve:
 *   - all panel files
 *   - all graphic files
 *   - the loose assets from both panels and graphics
 *
 * In particular, we serve the panel and graphic files with specific routes so
 * that we can modify the content of the file on the fly as we send it to the
 * browser, and the remainder of the assets are served as static files.
 *
 * The function needs to be given the package.json manifest of the bundle, the
 * key that represents what assets are being exposed ('panels' or 'graphics'),
 * the path for those assets, and a potential router object to add the routes
 * to.
 *
 * If the given router is null then this will create a new one to use, allowing
 * the call point to only get new routers when needed.
 *
 * The return value is a potential router; this will be null if there was no
 * router given and none is needed, a new router if we were given null and we
 * needed a router, or the router passed in if it existed. */
function setupAssetRoutes(manifest, bundleName, assetKey, assetPath, router) {
  const fullAssetPath = resolve(manifest.omphalos.location, assetPath);

  log.info(`setting up routes for '${bundleName}' ${assetKey}`);

  // If the manifest doesn't have any entries for the asset key that we are
  // trying to serve, then we don't need to do anything else.
  const assets = manifest.omphalos[assetKey];
  if (assets === undefined || assets.length === 0) {
    log.warn(`bundle '${bundleName}' has no ${assetKey}; skipping setup`);
    return router;
  }

  // All of the assets of this type are going to be served out of a specific
  // folder in the package, which needs to exist and be a folder or we can't
  // serve anything.
  if (jetpack.exists(fullAssetPath) !== 'dir') {
    log.error(`bundle '${bundleName}' has a ${assetKey} path that does not exist: ${assetPath}`);
    return router;
  }

  // All of the URL's that we are going to add to the router are based on this
  const baseUrl = `/bundles/${bundleName}/${assetKey}`;

  // If we were not given a router, then create one now.
  router ??= express.Router({ caseSensitive: true });

  // Add in a route for each of the specifically designated assets.
  for (const asset of assets) {
    // Get the full path to the static file that we want to serve and the URL
    // that it will be known by internally
    const staticFile = resolve(fullAssetPath, asset.file);
    const staticUrl = `${baseUrl}/${asset.file}`

    // Verify that the static file that we're going to serve actually exists;
    // if not, skip adding a route for it.
    log.debug(`${staticUrl} maps to ${assetPath}/${asset.file}`);
    if (jetpack.exists(staticFile) !== 'file') {
      log.error(`file does not exist: ${staticFile}`)
      continue;
    }

    // If the static file is not rooted in the asset path, then a relative path
    // is trying to escape; log an error and don't add a static route.
    //
    // Note: this file could still be served if its relative path ends it inside
    // the panel or graphic folders, since those are served wholesale.
    if (staticFile.startsWith(fullAssetPath) === false) {
      log.error(`file is not contained within the appropriate asset path`);
      continue;
    }

    // Add in a route for it to serve this specific static file.
    router.get(staticUrl, (req, res) => serveStaticFile(req, res, staticFile));
  }

  // Now that we're done with the individual files, set up a route to serve the
  // rest of the content of the panels in this bundle.
  log.debug(`serving static content: ${baseUrl} -> ${assetPath}`);
  router.use(baseUrl, express.static(fullAssetPath));

  return router;
}


// =============================================================================


/* Check the bundle manfest given to see if it contains any extension code or
 * not. If it does, then the file will be loaded, its internal extension point
 * will be gathered, and then executed.
 *
 * If any error occurs while loading the bundle, an exception will be thrown to
 * signal that error condition; otherwise we return normally.
 *
 * It is not considered an error for there to be no extension. */
async function loadBundleExtension(api, manifest, bundleName) {
  log.info(`loading code extensions for '${bundleName}'`);

  // If the manifest doesn't include an extension endpoint, then there is
  // nothing for us to do, so we can leave.
  const extensionFile = manifest.omphalos.extension;
  if (extensionFile === undefined) {
    log.warn(`bundle '${bundleName}' has no extensions; skipping setup`);
    return;
  }

  // Get the path to the full extension file entry point.
  const fullExtensionFile = resolve(manifest.omphalos.location, extensionFile);

  log.debug(`${extensionFile} maps to ${fullExtensionFile}`);
  if (jetpack.exists(fullExtensionFile) !== 'file') {
    log.error(`file does not exist: ${fullExtensionFile}`)
    throw new BundleLoadError(`unable to find extension file ${extensionFile}`)
  }

  // Import the module from the bundle location; the extension file needs to
  // be made explicitly relative to bundle.
  const extension = await import(fullExtensionFile);
  if (extension.main === undefined) {
    throw new BundleLoadError(`the extension endoint does not export the symbol 'main'`);
  }

  // Set up a bundle specific version of the API; this is the global API but
  // with some fields swapped out for bundle specific items.
  const bundle_api = {
    ...api,
    log: logger(bundleName),
    bundleInfo: manifest
  }

  // Invoke the entrypoint to initialize the module
  await extension.main(bundle_api);
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
async function loadBundle(api, manifest) {
  let router = null;

  // Alias the name of the bundle for simplicity.
  const bundleName = manifest.name;
  log.info(`loading bundle ${bundleName}`);

  // console.dir(manifest, { depth: null });

  // TODO: Do we want to allow graphics and panels to serve from the same place?
  //       If so, we need to take special care, like making only one router for
  //       both paths, and so on.
  //
  // TODO: Should we use only a single router for all bundles instead of 1 per?
  //       We could refactor so that this call gets a router argument insted of
  //       having a local, and alter the call point, and then there would be a
  //       single router for all bundles core files. Is this a speed or space
  //       enhancement of any kind?

  // If this bundle has an extension, then load it now. If there is an extension
  // but there is some issue with it, this will raise an exception, which will
  // be caught by the loader.
  await loadBundleExtension(api, manifest, bundleName);

  // Set up the panel and graphic routes as needed. These don't signal an error
  // back because it's not as catastrophic if a panel or graphic is missing;
  // this could be done on purpose as development of the bundle progresses.
  router = setupAssetRoutes(manifest, bundleName, 'panels', manifest.omphalos.panelPath, router);
  router = setupAssetRoutes(manifest, bundleName, 'graphics', manifest.omphalos.graphicPath, router);

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
export async function loadBundles(api, appManifest) {
  // Discover all bundles that we can load and return a DAG that represents the
  // dependency structure between the bundles.
  const bundles = discoverBundles(appManifest);

  // Now that we have a list of bundles that we know all have satisfied, non
  // cyclic dependencies, determine the load order.
  const loadOrder = getBundleLoadOrder(bundles);

  // As we laod bundles, if they need to serve any content they give us back a
  // router object; we capture them here so that they can be applied to the
  // server.
  const bundleRouters = [];

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
      const bundle_router = await loadBundle(api, bundles[name]);
      if (bundle_router !== null) {
        bundleRouters.push(bundle_router);
      }

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

  return bundleRouters;
}


// =============================================================================

