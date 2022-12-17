---
title: Omphalos Object
---

The object that gets passed to lifecycle events when they are invoked is given
an instance of an API object as a parameter, which exposes the internals of the
application API to the bundle.


## log

A handle to a bundle specific logger. Has methods `info`, `debug`, `warn`,
`error` and `silly` to send output of varying levels. The configuration
specifies which levels get logged and which get ignored.


## bundleInfo

A reference to the bundle [manifest](/docs/guides/manifest) for this bundle.


## require(bundleName)

A function that can be used to load symbols from other bundles; these symbols
come from the list of explicitly exported symbols for sharing from the bundle.

When used at load time, this can only pull symbols from bundles that loaded
prior to the calling bundle. However, once all loads are done, this will have
access to the bundles that loaded after.

If important, set up a dependency between modules in order to assure the load
order.
