---
title: sendMessageToBundle
---

```js
function sendMessageToBundle(event, bundle, data)
```

:::info server side use

Be careful of invoking this from server side code immediately at startup;
messages can only be sent to connected assets, and at the time the bundles load
the front end has not initialized yet.

:::

This operates the same as `sendMessage`, but allows you to direct the message
at a specific bundle.

The message will be transmitted to all `graphics`, `panels` and `extension`
listeners in that bundle, ***except*** for the sender (if the sender is a
member of that bundle).
