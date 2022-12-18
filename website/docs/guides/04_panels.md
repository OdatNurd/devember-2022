---
title: Panels
---

This page would discuss panels, which are simple `html` pages that you write
that Omphalos will serve as a part of it's internal control panel.

Panels allow you to send messages to overlays or extensions, allowing you full
control to get status information or take actions throughout your stream
layout.

When the HTML for panels loads, it has default CSS rules applied for simple
consistency; you are of course free to override any and all style rules as you
see fit; the defaults are just to give a base to work from.

```css
body {
    background: darkseagreen;
    color: darkslateblue;
    font-size: 32px;
}
```

When graphics load, `window.omphalosConfig` is set to the configuration under
which omphalos is currently running. This is the same configuration as is loaded
from the configuration files.

In addition, an API is set up via a load of `/omphalos-api.js`; this file is
currently empty and so it does nothing, but one day it will have the code that
provides the API that lets panels talk to other parts of the system.