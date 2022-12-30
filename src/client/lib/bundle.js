
// =============================================================================


/* Given the system bundle, gather out all of the panels in all of the bundles
 * and return them back.
 *
 * The returned object is in the shape needed by the client code to create the
 * panels in the dashboard; among other things this means that the fields are
 * changed to be more in line with the component fields. */
function getManifestPanels(sysBundle) {
  const panel_list = [];

  // Iterate over all of the bundles and grab out their panels, conforming
  // them to the shape that the UI code requires in order to properly render
  // them.
  for (const [bundle, manifest] of Object.entries(sysBundle.omphalos.deps)) {
    const bundle_panels = manifest.omphalos.panels ?? [];
    panel_list.push(...bundle_panels.map(panel => {
      return {
        bundle,
        title: panel.title,
        content: panel.file,
        name: panel.name,
        locked: panel.locked ?? false,

        width: panel.size.width,
        height: panel.size.height,

        minWidth: panel.minSize?.width,
        minHeight: panel.minSize?.height,
        maxWidth: panel.maxSize?.width,
        maxHeight: panel.maxSize?.height,
      }
    }));
  }

  return panel_list
}


// =============================================================================


/* Given the gridstack object that tracks a workspace, fetch the state out of
 * it and persist it into local storage for later use.
 *
 * This conforms the incoming data into a format that makes it easier for the
 * loading code to adjust the default state of panel information that comes
 * from the bundle. */
export function saveWorkspaceState(grid, workspace) {
  omphalos.log.silly(`saving workspace '${workspace}' state to local storage`);

  // Fetch from local storage the currently stored workspace state; if there is
  // nothing stored yet, a default object is returned instead.
  const savedDashboardInfo = JSON.parse(localStorage.dashboardState || '{}');

  // Grab the current grid state, conform it to our data shape and store it into
  // the object for the current workspace.
  //
  // The first conform makes the date
  savedDashboardInfo[workspace] = grid.save(false)
    .reduce((result, panel) => {
      // The panel name and bundle come from the associated ID.
      const [ name, bundle ] = panel.id.split('.');

      // Get the object that contains the panels for the bundle and populate it.
      let bundleObj = result[bundle] ?? {};
      bundleObj[name] = {
        "width": panel.w,
        "height": panel.h,
        "x": panel.x,
        "y": panel.y,
        "locked": panel.locked,
        "noMove": panel.noMove,
        "noResize": panel.noResize
      }

      // Store the bundle information back in case we just created it.
      result[bundle] = bundleObj;
      return result
    }, {});

  // Store the new workspace information back.
  localStorage.dashboardState = JSON.stringify(savedDashboardInfo);
}


// =============================================================================


/* Loads the state of a workspace from local storage, merges it with the bundle
 * information in the provided system bundle, and returns back a list of panels
 * for inclusion in the dashboard. */
export function loadWorkspaceState(sysBundle, workspace) {
  omphalos.log.silly(`loading workspace '${workspace}'`);

  // Get the information for this workspace from the saved information in the
  // local storage; the object ends up being empty if there is no saved data
  // yet.
  const savedDashboardInfo = JSON.parse(localStorage.dashboardState || '{}')[workspace] ?? {};

  // Get the panels from the system bundle and augment them with any saved data
  // for this workspace from local storage.
  const panels = getManifestPanels(sysBundle).map(panel => {
    const savedInfo = savedDashboardInfo?.[panel.bundle]?.[panel.name] ?? {};
    return { ...panel, ...savedInfo }
  });

  return panels;
}


// =============================================================================


/* Given the system bundle, gather out all of the graphics in all of the
 * bundles and return them back.
 *
 * The returned object has keys which are the names of the individual bundles
 * and the values are the list of graphics that are in those bundles. */
export function getGraphicsList(sysBundle) {
  const result = [];

  // Pull out into the result array a list of objects that represent bundles
  // that actually have graphics; the graphic information as contained inside
  // the bundle are already in the form that we want.
  for (const [name, manifest] of Object.entries(sysBundle.omphalos.deps)) {
    if (manifest.omphalos.graphics !== undefined) {
      result.push({ name, graphics: manifest.omphalos.graphics });
    }
  }

  // Ensure that the result is sorted according to bundle name
  return result.sort((left, right) => left.name.localeCompare(right.name));
}


// =============================================================================
