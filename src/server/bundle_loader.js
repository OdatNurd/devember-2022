import { config } from '#core/config';
import { logger } from '#core/logger';

import { assert } from '#api/assert';

import { listenFor } from '#core/network';

import { discoverBundles, getBundleLoadOrder } from '#core/bundle_resolver';
import { resolve } from 'path';

import { sendStaticTemplate } from '#core/static';

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


/* This is the error template function for when a panel or a graphic is missing;
 * unlike the main template, this does not try to initialize the API since there
 * is nothing in the page to access it anyway. */
function assetError(manifest, file, assetType) {
  const prefix = resolve(manifest.omphalos.location, '..');
  const shortName = file.substring(prefix.length + 1);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${assetType} missing</title>
      <link rel="stylesheet" type="text/css" href="/defaults/css/${assetType}s.css" >
    </head>
    <body>
      Unable to locate ${assetType} file: <strong>${shortName}</strong>
    </body>
    </html>
  `
}


// =============================================================================


/* This is the page template function for panels and graphics; this injects the
 * code needed to allow the asset to connect to the back end and initialize its
 * API. */
function assetTemplate(dom, manifest, asset, assetType) {
  const content = dom.window.document.createElement('content');
  content.innerHTML = `
    <link rel="stylesheet" type="text/css" href="/defaults/css/${assetType}s.css" >
    <script src="/socket.io/socket.io.js"></script>
    <script src="/omphalos-api.js"></script>
    <script>
      omphalos.__init_api(${JSON.stringify(manifest)}, ${JSON.stringify({ ...asset, type: assetType })}, ${config.toString()})
    </script>
  `;

  // Add the children of the element that we created to the start of the head
  // element in the page when we serve it.
  dom.window.document.querySelector('head').prepend(...content.children);
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
function setupAssetRoutes(manifest, bundleName, assetType, router) {
  // Using the asset type, determine what key in the manifest has our asset
  // list in it, and determine where they're stored.
  const assetKey  = assetType === 'panel' ? 'panels' : 'graphics';
  const assetPath = assetType === 'panel' ? manifest.omphalos.panelPath : manifest.omphalos.graphicPath;

  // Alias the full path to the assets we're serving.
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
  //
  // Unlike missing assets, this is a deal breaker on loading. We allow for
  // missing files but not a broken folder.
  if (jetpack.exists(fullAssetPath) !== 'dir') {
    log.error(`bundle '${bundleName}' has a ${assetKey} path that does not exist: ${assetPath}`);
    throw new BundleLoadError(`${assetKey} path is missing for bundle ${bundleName} (${assetPath})`);
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
    // We still set up a route for it, or when it appears there at runtime it
    // will get sent as a regular asset and not get properly "massaged".
    log.debug(`${staticUrl} maps to ${assetPath}/${asset.file}`);
    if (jetpack.exists(staticFile) !== 'file') {
      log.error(`file does not exist: ${staticFile}`)
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

    // Set up template handlers for expanding out the page.
    const error = () => assetError(manifest, staticFile, assetType);
    const templ = (dom) => assetTemplate(dom, manifest, asset, assetType);

    // Add in a route for it to serve this specific static file.
    router.get(staticUrl, (req, res) => sendStaticTemplate(req, res, staticFile, error, templ));
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
 * It is not considered an error for there to be no extension.
 *
 * The return value is an object that represents the list of symbols that the
 * imported module exported for other bundles to use. This could be an empty
 * object. */
async function loadBundleExtension(omphalos, manifest, bundleName) {
  log.info(`loading code extensions for '${bundleName}'`);

  // If the manifest doesn't include an extension endpoint, then there is
  // nothing for us to do, so we can leave.
  const extensionFile = manifest.omphalos.extension;
  if (extensionFile === undefined) {
    log.warn(`bundle '${bundleName}' has no extensions; skipping setup`);
    return {};
  }

  // Grab a symbol out of a module; looks first in the top level, and if the
  // symbol is not there, grabs it from the default if possible. Will return
  // undefined if the symbol does not appear in either location or if there
  // is no default export list at all when trying to look in it.
  const getSymbol = (mod, sym) => mod[sym] ? mod[sym] :
                                 (mod.default ? mod.default[sym] : undefined);

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
  const entryPoint = getSymbol(extension, 'main');

  if (entryPoint === undefined) {
    throw new BundleLoadError(`the extension endoint does not export the symbol 'main'`);
  }

  // Set up a bundle specific version of the API; this is the global API but
  // with some fields swapped out for bundle specific items.
  const bundle_api = {
    ...omphalos,

    log: logger(bundleName),
    bundleConfig: structuredClone(manifest),

    // Directs a message to all listeners in the current bundle;
    sendMessage: (event, data) => omphalos.sendMessageToBundle(event, bundleName, data),

    // The exposed listenFor needs to do error checking and infer missing
    // bundles; the call into the network code assumes that this has been done
    // and just implements it.
    listenFor: (event, bundle, listener) => {
      assert(event !== undefined, 'message not specified');

      // If there is no listener, the bundle argument is actually the listener and
      // the bundle is inferred; hence we need at least one of the two set or the
      // call is missing too many arguments.
      assert(bundle !== undefined || listener !== undefined, 'no event listener callback supplied');

      // Second argument is optional but listener is required; if the call signature
      // has only two arguments, infer the bundle and use it as the listener.
      if (listener === undefined) {
        listener = bundle;
        bundle = bundleName;
      }

      return listenFor(event, bundle, listener);
    }
  }

  // Invoke the entrypoint to initialize the module
  await entryPoint(bundle_api);

  // Return the list of symbols that this module has declared for export
  return getSymbol(extension, 'symbols') ?? {};
}


// =============================================================================


/* Given a bundle manifest, attempt to load the content. This includes loading
 * the extension module (if any) and invoking the entry point as well as
 * returning a router that will serve the panels and overlays for the bundle
 * as appropriate.
 *
 * The loader expects to get an object with the symbols that were exported from
 * other bundles that loaded before this one. This is keyed on the bundle name,
 * and will have empty objects for bundles that loaded but had no symbols.
 *
 * If the bundle has any panels or graphics that it needs to serve, the manifest
 * will be given a "router" key that gives a router object that knows how to
 * handle the appropriate routes.
 *
 * If there is any error in loading the bundle, such as a missing resource or
 * an error occurs while launching the extension code, this will raise an
 * exception. */
async function loadBundle(omphalos, manifest) {
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
  //
  // The return value (assuming no exception) is an object which contains the
  // symbols this bundle exported, which might be empty/
  const symbols = await loadBundleExtension(omphalos, manifest, bundleName);

  // Set up the panel and graphic routes as needed. These don't signal an error
  // back because it's not as catastrophic if a panel or graphic is missing;
  // this could be done on purpose as development of the bundle progresses.
  router = setupAssetRoutes(manifest, bundleName, 'panel', router);
  router = setupAssetRoutes(manifest, bundleName, 'graphic', router);

  // Return the router and exported symbols back to the caller; may be null.
  return { router, symbols };
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
 * also not be loaded.
 *
 * The return value is an object that keys all of the loaded bundles with their
 * manifest information, an array of router objects that route traffic for
 * bundles, and the complete list of exported symbols. */
export async function loadBundles(omphalos, appManifest) {
  // Discover all bundles that we can load and return a DAG that represents the
  // dependency structure between the bundles.
  const bundles = discoverBundles(appManifest);

  // Now that we have a list of bundles that we know all have satisfied, non
  // cyclic dependencies, determine the load order.
  const loadOrder = getBundleLoadOrder(bundles);

  // Loop over the load order and load each bundle in turn. As each bundle is
  // loaded, we add it's manifest to this loaded bundle list; this allows us to
  // elide any bundles whose dependents did not load. We also store any routers
  // we get for later return.
  const loadedBundles = {};
  const routers = [];
  for (const name of loadOrder) {
    try {
      // Check the list of dependencies against the list of loaded bundles; if
      // any are missing, we can't load this bundle.
      const deps = Object.keys(bundles[name].omphalos.deps);
      deps.forEach(depName => {
        if (loadedBundles[depName] === undefined) {
          throw new BundleLoadError(`cannot load ${name}; dependency ${depName} did not load`)
        }
      });

      // Load the bundle; this will throw an exception if there are any issues.
      // If any routes need to be served, the manifest we pass in will be given
      // a "router" key that includes an appropriate router.
      const { router, symbols } = await loadBundle(omphalos, bundles[name]);
      if (router !== null) {
        routers.push(router);
      }

      // Add this bundle as one that loaded.
      loadedBundles[name] = bundles[name];
      omphalos.exportSymbols[name] = symbols;
    }
    catch (errorObj) {
      log.error(`error while loading ${name}: ${errorObj}`);
      if (errorObj instanceof BundleLoadError === false) {
        log.error(errorObj.stack);
      }
    }
  }

  // Return the array of routers that we created (if any) and the list of
  // loaded bundle manifests.
  return { routers, bundles: loadedBundles };
}


// =============================================================================

