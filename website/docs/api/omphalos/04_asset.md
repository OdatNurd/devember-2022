---
title: asset
---

:::warning Client only

This item is only present in the API object in `panels` and `graphics`; it is
not present in the API that is given to the `extension`.

:::

This object is a copy of the asset configuration of the asset to which this copy
of the API belongs.

For a `panel` this is the object from the manifest that describes the panel,
while for a `graphic` this is the object that defines the graphic.

A key named `type` is added to this object, with a value that indicates what
type of asset this is; `graphic` or `panel`.