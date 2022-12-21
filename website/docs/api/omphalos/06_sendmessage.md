---
title: sendMessage
---

```js
function sendMessage(event, data)
```

Send a named event message to all assets in the current `bundle`; `data` can be
any desired value.

The message will be transmitted to all `graphics`, `panels` and `extension`
listeners in the current bundle, ***except*** for the sender.
