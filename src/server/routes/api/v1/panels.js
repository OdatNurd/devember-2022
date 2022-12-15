import { config } from '#core/config';


// =============================================================================


/* Given a panel specification from the manifest, conform the shape of the panel
 * object to match what the front end requires.
 *
 * Part of this shape change will drop minimum and maximum dimension constraints
 * if they are identical to the original size, in favor of just marking the
 * panel as not being resizable. */
function conformPanel(panel) {
  // Convert the shape of the incoming panel into the values needed for the
  // outgoing value.
  const out = {
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

  // If the panels min, max and current dimensions are all the same, then remove
  // the constraints and just make the panel unresizable instead.
  if (out.width === out.minWidth && out.width === out.maxWidth &&
      out.height === out.minHeight && out.height === out.maxHeight) {
    // Remove the size constraits and replace them with an explicit instruction
    // instead.
    out.minWidth = out.maxWidth = undefined;
    out.minHeight = out.maxHeight = undefined;
    out.noResize = true;
  }

  return out;
}


// =============================================================================


/* Fetch a conmplete list of every panel in every loaded bundle and return the
 * information for them back.
 *
 * The payload will contain information on titles, sizes and files for all of
 * the panels. This allows the UI code to set up for and fetch the pages for
 * each of the panels that should constitute the UI. */
export const GET = {
  description: 'Obtain a list of all panels in all bundles and their details',

  schema: {
    "root[]": {
      "title": "string",
      "content": "string", // content is file
      "name": "string",
      "?locked": "bool",
      "?noResize": "bool",
      "width": "int",
      "height": "int",
      "?minWidth": "int",
      "?minHeight": "int",
      "?maxWidth": "int",
      "?maxHeight": "int",
    }
  },

  handler: async (req, res) => {
    const panel_list = [];

    // Iterate over all of the bundles and grab out their panels, conforming
    // them to the shape that the UI code requires in order to properly render
    // them.
    for (const [bundle, manifest] of Object.entries(req.bundles)) {
      const bundle_panels = manifest.omphalos.panels ?? [];
      panel_list.push(...bundle_panels.map(panel => conformPanel(panel)))
    }

    // Return a status code of 200; because we're not using res.json() the
    // result will be validated against the schema above.
    return res[200](panel_list)
  }
}


// =============================================================================
