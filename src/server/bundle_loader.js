import 'dotenv/config';

import joker from '@axel669/joker';


// =============================================================================


/* For any folder that might contain a bundle it must have a package.json with
 * a manifest that includes an omphalos key with the following structure; if
 * not it will not be considered as a valid bundle and will not be loaded. */
const manifestSchema = joker.validator({
  itemName: 'omphalos',
  root: {
    // What versions of omphalos are compatible with this bundle? If the version
    // of omphalos is not compatible, this bundle won't load.
    "compatibleRange": "string",

    // Bundles that must exist and be loaded in order for this bundle to load.
    // If present, a bundle with the given name and compatible version will be
    // loaded prior to this bundle loading; if any dependencies fail to load,
    // this bundle will also not load.
    "?deps{}": {
      "name": "string"
    },

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


