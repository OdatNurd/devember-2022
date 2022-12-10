import { config } from '#core/config';
import { logger } from '#core/logger';

import { discoverBundles, getBundleLoadOrder } from '#core/bundle_resolver';
import { resolve, basename } from 'path';

import express from 'express';

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
  // console.dir(manifest, { depth: null });

  // If there are any panels, we need to set up a router for that.
  if (manifest.omphalos.panels !== undefined) {
    const panelPath = manifest.omphalos.panelPath;

    // Validate that the panelPath is actually a folder that exists and is a
    // directory. Should we also verify that the panel file exists at its path
    // too, or no?

    // Create a router if we haven't already done so.
    router ??= express.Router({ caseSensitive: true });

    // NOTE: Currently the resolver code is making the panel path absolute at
    // load time; we should do that here OR trim the base path off in order to
    // have a relative path for our needs here so that things make more sense.
    //
    // ALSO, add /bundles/ to the path at the root so that no files from here
    // can conflict with the main app routes.

    // Add in indidivudal routes for each of the panel files so that they
    // take precedence; this allows us to handle them specially.
    // TODO: Does this work if the panel as a relative path? How relative is
    //       relative? is .. allowed?
    for (const panel of manifest.omphalos.panels) {
      const staticFileName = resolve(panelPath, panel.file);
      log.info(`serving panel file: /${manifest.name}/panels/${panel.file} -> ${staticFileName}`);
      router.get(`/${manifest.name}/panels/${panel.file}`, (req, res) => serveStaticFile(req, res, staticFileName))
    }

    // Add in a static route now that catches all of the other panel files.
    log.info(`serving static content: /${manifest.name}/panels/ -> ${panelPath}`)
    router.use(`/${manifest.name}/panels/`, express.static(panelPath));
  }

  // Listen for specific files first, then serve the static directory second; if
  // you do that then you can serve the content of specific files separately from
  // the directory as a whole.
  // app.get("/bundle1/file3.txt", (req, res) => res.send('I am a random string of poop'));
  // app.use("/bundle1/", express.static('/tmp/bob/poop/static/'));

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
      const bundle_router = await loadBundle(bundles[name]);
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

