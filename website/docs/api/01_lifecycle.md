---
title: API Lifecycle
---

This would talk about the extension functions that your bundle extension point
(if you have one) should export.

* ***main*** is invoked with a handle to the API when the bundle is initially
  loaded.

```
export function main(omphalos) {
    omphalos.log.info(`I am the entry point for ${omphalos.bundleInfo.name}`);
}
```