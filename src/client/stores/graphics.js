import { readable } from 'svelte/store';


// =============================================================================


/* Creates and returns a readable store that provides information on all of the
 * graphics that are available across all bundles.
 *
 * The returned object is an array of objects, one object per bundle, which
 * contains the name of the bundle and the graphics objects from inside of it
 * as an array.
 *
 * The array is sorted based on the bundle name. */
function createGraphicsStore() {
  const result = [];

  // Pull out into the result array a list of objects that represent bundles
  // that actually have graphics; the graphic information as contained inside
  // the bundle are already in the form that we want.
  for (const [name, manifest] of Object.entries(omphalos.bundle.omphalos.deps)) {
    const items = manifest.omphalos.graphics;
    if (items !== undefined) {
      items.forEach(item => item.count = 0)
      result.push({ name, graphics: manifest.omphalos.graphics });
    }
  }

  // Ensure that the result is sorted according to bundle name
  result.sort((left, right) => left.name.localeCompare(right.name));
  console.log('graphics store result:', result);

  return readable(result);
}


// =============================================================================


export const graphics = createGraphicsStore();


// =============================================================================
