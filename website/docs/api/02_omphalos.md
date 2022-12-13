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
