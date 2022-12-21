---
title: broadcastMessage
---

```js
function broadcastMessage(event, data)
```

This operates the same as `sendMessage`, except that the message is sent to
every `graphic`, `panel` and `extension` listener in every bundle that is
currently loaded, ***except*** for the sender.
