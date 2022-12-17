---
title: API Lifecycle
---

This would talk about the extension functions that your bundle extension point
(if you have one) should export.

## main(omphalos)

This lifecycle function is invoked with a handle to the API when the bundle is
initially loaded.

```
export function main(omphalos) {
    omphalos.log.info(`I am the entry point for ${omphalos.bundleInfo.name}`);
}
```

## symbols

A bundle can optionally export an object named `symbols`; any items in that
object will be available to other bundles via the `omphalos.require()` API
function.