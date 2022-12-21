---
title: API Lifecycle
---

Bundles can contain an optional extension endpoint which allows them have server
side code running. This can be useful, for example, to make requests of a remote
API and distribute results, etc.

There are some symbols that an endpoint ***must*** export from the entry point
in order to tie into the system, and some optional symbols that ***may*** be
exported, if needed.


## main

```js
export function main(omphalos) {
    // Your entry point code here.
    omphalos.log.info(`I am the entry point for ${omphalos.bundleInfo.name}`);
}
```

This lifecycle function is invoked with a handle to the API when the bundle is
initially loaded.


## symbols

Bundles can optionally export symbols that allow other bundles to access their
code. This can be used to create bundles as libraries that can be leveraged by
other bundles, for example.

```js
export const symbols = {
    helper: () => performSomeHelperFunction()
}
```
A bundle can optionally export an object named `symbols`; any items in that
object will be available to other bundles via the `omphalos.require()` API
function.