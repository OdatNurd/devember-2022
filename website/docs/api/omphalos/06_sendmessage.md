---
title: sendMessage
---

```js
function sendMessage(event, data)
```

:::info server side use

Be careful of invoking this from server side code immediately at startup;
messages can only be sent to connected assets, and at the time the bundles load
the front end has not initialized yet.

:::

Send a named event message to all assets in the current `bundle`; `data` can be
any desired value.

The message will be transmitted to all `graphics`, `panels` and `extension`
listeners in the current bundle, ***except*** for the sender.
