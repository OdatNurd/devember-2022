---
title: log
---

```js
omphalos.log.info('this is an informational message');
omphalos.log.debug('this is a debug message');
omphalos.log.warn('this is a warning message');
omphalos.log.error('this is an error message');
omphalos.log.silly('this is a silly message');
```

A handle to a bundle specific logger. Has methods `info`, `debug`, `warn`,
`error` and `silly` to send output of varying levels. The configuration
specifies which levels get logged and which get ignored.
