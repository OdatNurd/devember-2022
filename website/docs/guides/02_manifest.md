---
title: Bundle Manifests
toc_max_heading_level: 4
---

This would talk about the contents of the `package.json` and include information
on the fields that can be present and what they're for. This would also have to
link to the documentation in the other sections as appropriate.

This either needs to talk about dependencies, or we need another page for it;
decide when you write this one.

## omphalos

The manifest must include an `omphalos` key to indicate to the application that
this package is intended to be a bundle.

### compatibleRange

* required

```json
    "compatibleRange": "~0.7.0",
```

A standard `semver` version range; targets the specific version(s) of Omphalos
that this bundle is intended to work with. If this is not satisfied by the
current version of the app. the bundle won't load.

### deps

* optional

```json
    "deps": {
      "other-bundle": "^1.2.1"
    },
```

A set of key-value pairs that specifies other bundles that must exist and what
versions are required. Omphalos ***DOES NOT*** install these dependencies, it
just ensures that bundles will only load if all of their dependencies are found
and load successfully.


### extension

* optional

```json
    "extension": "my_extension_code/index.js",
```

If given, this is a relative path to the entry point of server side extension
code; this must export the appropriate [lifecycle](/docs/api/lifecycle) symbols.

### panelPath

* optional (defaults to `'panels'` if not specified)

```json
    "panelPath": "panels",
```

When using panels, this specifies the folder inside of the bundle layout that
all of the panel files should be relative to.

### panels

* optional

```json
    "panels": [
      {
        "file": "panels/sample-panel.html",
        "name": "sample-one",
        "title": "My sample panel",
        "locked": false,
        "size": {
          "width": 2,
          "height": 4,
        },
        "minSize": {
          "width": 2,
          "height": 3,
        },
        "maxSize": {
          "width": 4,
          "height": 6,
        },
        "workspace": "initial",
        "fullbleed": false,
      },
    ],
```

If given this specifies the details on all of the panels that this bundle
exposes to the dashboard.

#### file

* required

The HTML file that provides the content for this panel.

#### name

* required

The internal name for this panel.

#### title

* required

The title of the dashboard panel that contains this item.

#### locked

* optional

If `true`, this panel can only be moved manually; it will not move if the user
manipulates the panel layout at runtime (it will not move out of the way of
siblings on its own).

#### size

* required

Specifies the initial dimensions of the panel, in rows and columns.

#### minSize

* optional

If given, specifies the minimum size that the panel can be sized to.

#### maxSize

* optional

If given, specifies the maximum size that the panel can be sized to.

#### workspace

* optional

Specifies the workspace this panel belongs to; all panels in the same workspace
are displayed together. Any number of workspaces is possible.

#### fullbleed

* optional

If true, this panel should fill the entire dashboard. This requires that the
panel be in a workspace alone since it is the only thing that can display
there.

### graphicPath

* optional (defaults to `'graphics'` if not specified)

```json
    "graphicsPath": "graphics",
```

When using graphics, this specifies the folder inside of the bundle layout that
all of the graphic files should be relative to.

### graphics

* optional

```json
    "graphics": [
      {
        "file": "index.html",
        "size": {
          "width": 1280,
          "height": 720,
        },
        "singleInstance": false
      }
    ]

```

If given this specifies the details on all of the graphics that this bundle
exposes to the dashboard.

#### file

* required

The HTML file that provides the content for this graphic.

#### size

* required

The size of this graphic; this is purely informational and is displayed in the
dashboard only.

#### singleInstance

* optional

If this is set to `true`, the system, will only allow a single instance of this
overlay to be served; other attempts will fail.
