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

