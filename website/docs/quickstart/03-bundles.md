---
title: Creating Bundles
toc_max_heading_level: 4
---

Omphalos itself is just a ***container*** that allows you free form access to
create your own graphical overlays, control panel pages and server side code,
allowing them all to connect together.

To actually make use of the software, you need to install or create one or more
`bundles`, which add functionality to the app and therefore your stream.

This page has a quick overview of the process of creating a bundle and what is
possible. For more details instructions, refer to the guide section of the
documentation, which goes into more detail.


## Creating your first bundle

A bundle in Omphalos is just a standard NodeJS package, with some key
information stored in the package manifest that describes the bundle and the
content that it provides to the application.

Bundles must be stored either in the bundle area of the configuration folder or
at your option, you can configure Omphalos to look in a specific location for
your bundle.


### Creating the base bundle

In this example we will create a very simple bundle from scratch that shows some
of the key concepts that are used when creating one.

To do this, we must create a simple NodeJS package in the bundle folder; the
location of this folder is [based on your operating system][1].

In your terminal, switch to the bundle folder for your OS, and use your package
manager to choice to initialize a new bundle:

```bash npm2yarn
mkdir my-bundle-name
cd my-bundle-name
npm init
```

The only keys that Omphalos requires in your initial `package.json` are the
`name` and `version` keys. Any other keys you would normally find in the
manifest are fine, but Omphalos will ignore them.

```json title='my-bundle-name/package.json'
{
  "name": "my-bundle-name",
  "version": "1.0.0",
}
```


### Adding Omphalos Metadata

In order to be recognized as a bundle, your package must:

1. Be stored in the `bundles` folder of the configuration area OR have its
   location listed as an additional bundle
1. Have a valid `name` and `version` key
1. Contain an `omphalos` key with the required metadata.

See the documentation on [bundle manifests][2] for complete details on the
available options. The only required key is the one that tells Omphalos what
version of the application is required for the bundle to operate:

```json title='my-bundle-name/package.json'
{
  "name": "my-bundle-name",
  "version": "1.0.0",
  "omphalos": {
    "compatibleRange": "~0.0.1"
  }
}
```

At this point, if you quit and restart Omphalos, the logs should show you that
your bundle was found and loaded without errors:

```bash title='Sample Application Startup'
2022-12-23 11:54:53.746 [info] core: --------------------------------
2022-12-23 11:54:53.751 [info] core: omphalos version 0.0.1 launching
2022-12-23 11:54:53.751 [info] core: --------------------------------
2022-12-23 11:54:53.753 [info] core: no extra CORS origin added
2022-12-23 11:54:53.755 [info] resolver: scanning all bundle folders for installed bundles
2022-12-23 11:54:53.756 [info] resolver: found 1 potential bundle(s)
2022-12-23 11:54:53.757 [info] resolver: loaded bundle manifest for 'my-sample-bundle' from bundles/my-sample-bundle
2022-12-23 11:54:53.760 [info] loader: loading bundle my-sample-bundle
2022-12-23 11:54:53.760 [info] loader: loading code extensions for 'my-sample-bundle'
2022-12-23 11:54:53.760 [warn] loader: bundle 'my-sample-bundle' has no extensions; skipping setup
2022-12-23 11:54:53.760 [info] loader: setting up routes for 'my-sample-bundle' panels
2022-12-23 11:54:53.761 [warn] loader: bundle 'my-sample-bundle' has no panels; skipping setup
2022-12-23 11:54:53.761 [info] loader: setting up routes for 'my-sample-bundle' graphics
2022-12-23 11:54:53.761 [warn] loader: bundle 'my-sample-bundle' has no graphics; skipping setup
2022-12-23 11:54:53.772 [info] core: listening for requests at http://localhost:3000
```

The bundle resolver scans for and finds the bundle, loads and validates the
manifest, verifies that the version of Omphalos is compatible, if so, proceeds
with loading of the bundle.

## Adding content

As seen above, the bundle no content to speak of; no server side `extension`
code, no dashboard `panels` and no overlay `graphics`.

### Adding a Panel

[ steps for adding a simple panel with a screenshot of it in the dashboard ]

### Adding a Graphic

[ steps for adding a graphic; show screenshot of it loaded in a browser ]

This one is problematic because until we come up with the user interface to
view graphics, you need to know urls.

### Adding an Extension

[ sample extension code ; show it starting up ]


## Tying content together

The steps here would walk through the simplistic changes needed to the above
samples so that the panel has a button in it which, when clicked, sends a
message to the back end, which will send a message to the graphic.

The graphic should respond to both messages and display something to show that
it gets both messages and not just one.

This shows the basics of how message sending allows you to tie everything
together.


  [1]: /docs/quickstart/configuration#configuration-area
  [2]: /docs/guides/manifest