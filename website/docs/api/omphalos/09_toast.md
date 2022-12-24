---
title: toast
---

```js
function toast(msg, level, timeout_secs)
```

Display a toast in the dashboard that contains the provided message text.

The color and icon in the toast are controlled by the `level` argument &mdash
the possible levels are:

1. `message`
2. `info`
3. `warning`
4. `success`
5. `error`

If no level is provided, it defaults to `message`.

Optionally, a timeout value in seconds can be provided to control how long the
toast remains visible on the screen before it is removed. If not specified a
default of 1 second is used.
