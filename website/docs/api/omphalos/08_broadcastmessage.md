---
title: broadcastMessage
---

```js
function broadcastMessage(event, data)
```

:::info server side use

Be careful of invoking this from server side code immediately at startup;
messages can only be sent to connected assets, and at the time the bundles load
the front end has not initialized yet.

:::

This operates the same as `sendMessage`, except that the message is sent to
every `graphic`, `panel` and `extension` listener in every bundle that is
currently loaded, ***except*** for the sender.
