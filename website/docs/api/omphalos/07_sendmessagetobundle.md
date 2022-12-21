---
title: sendMessageToBundle
---

```js
function sendMessageToBundle(bundle, event, data)
```

This operates the same as `sendMessage`, but allows you to direct the message
at a specific bundle.

The message will be transmitted to all `graphics`, `panels` and `extension`
listeners in that bundle, ***except*** for the sender (if the sender is a
member of that bundle).
