---
title: Graphics
---

This page would discuss graphics, which are simple `html` pages that you write
that Omphalos will serve out to your stream software (e.g. `obs`) and can
display anything you like.

There is a section in the manifest that controls graphics; probably talk about
that more here and have the manifest page only briefly cover the options and
link here or whatever.

When the HTML for graphics loads, it has default CSS rules applied for simple
consistency; you are of course free to override any and all style rules as you
see fit; the defaults are just to give a base to work from.

```css
body {
    background: darkorchid;
    color: white;
    font-size: 32px;
}
```

When graphics load, `window.omphalosConfig` is set to the configuration under
which omphalos is currently running. This is the same configuration as is loaded
from the configuration files.

In addition, an API is set up via a load of `/omphalos-api.js`; this file is
currently empty and so it does nothing, but one day it will have the code that
provides the API that lets graphics talk to other parts of the system.