import { config } from '#core/config';


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
      "width": "int",
      "height": "int",
      "?minWidth": "int",
      "?minHeight": "int",
      "?maxWidth": "int",
      "?maxHeight": "int",
    }
  },

  handler: async (req, res) => {
    // Return a status code of 200; because we're not using res.json() the
    // result will be validated against the schema above.
    return res[200]([
        {
          "title": "The First Panel",
          "content": "panel_one.html",
          "name": "panel-one",
          "width": 4,
          "height": 2,
          "minWidth": 4,
          "maxHeight": 3
        },
        {
          "title": "The Other Panel",
          "content": "other/panel_two.html",
          "name": "panel-two",
          "width": 2,
          "height": 4,
          "minHeight": 4,
          "maxWidth": 3
        },
        {
          "title": "Tree",
          "content": "Locked",
          "name": "panel-three",
          "width": 1,
          "height": 1,
          "minHeight": 1,
          "minwidth": 1,
          "maxHeight": 1,
          "maxWidth": 1,
          "locked": true
        },
      ])
  }
}


// =============================================================================
