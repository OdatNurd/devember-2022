---
title: listenFor
---

```js
function listenFor(event, listener)
function listenFor(event, bundle, listener)
```

Listen for a given event to arrive and, when it does, invoke the listener with
the payload of the event as an argument.

By default the event is listened for in the current bundle; to listen for
events that were sent to some other bundle, pass that as the second argument to
the function.

:::note variable arguments

With only two arguments, the `bundle` is inferred to be the current bundle;
thus you only need to include it in the argument list when you want to listen
for outside events.

:::

:::info reserved names

Event names that start with `__sys` are reserved by Omphalos for system events;
you should not use them in your own events.

:::
