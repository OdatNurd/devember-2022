---
title: require
---

```js
function require(bundlename)
```

A function that can be used to load symbols from other bundles; these symbols
come from the list of explicitly exported symbols for sharing from the bundle.

When used at load time, this can only pull symbols from bundles that loaded
prior to the calling bundle. However, once all loads are done, this will have
access to the bundles that loaded after.

If important, set up a dependency between modules in order to assure the load
order.
