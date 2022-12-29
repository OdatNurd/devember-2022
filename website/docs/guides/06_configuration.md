---
title: Configuration
---

This page would talk about the configuration file in more detail. It should
include all of the configuration options, their default values, and how you can
set them in either the configuration file OR via environment variables.

The current configuration keys are:

## port

* environment variable: ***PORT***
* default: `3000`

The port that the internal server listens on.

## bundles

The options in this section control bundles; extra locations to load a bundle
from and bundles which should be ignored and not loaded if they are found.

### additional

* environment variable: ***ADDITIONAL_BUNDLES***
* default: `[]`

A list of extra paths that contain bundles to load. This should be either a list
of absolute paths, or paths that are relative to the installation location of
Omphalos.

### ignore

* environment variable: ***IGNORE_BUNDLES***
* default: `[]`

A list of bundle ***names*** that should not be loaded if they are seen.

## logging

The options here control logging in the application; when it happens and where
it gets sent.

:::warning A transport is needed!

When configuring logging, you can choose to send logs either to the console, to
a log file, or both. You should always configure at least one of the two; if
you don't want to log to the console, log to a file.

Diagnosing errors should they happen will be much easier.

:::


### level

* environment variable: ***LOG_LEVEL***
* default: `info`

Controls the level of log details that are sent to the log output. When logging
at a level, all logs at that level and below are logged and anything above is
ignored.

For example, `silly` logs everything and `info` will not log `debug` and `silly`,
and so on.

  1. `error`
  2. `warn`
  3. `info`
  4. `debug`
  5. `silly`

### timestamp

* environment variable: ***LOG_TIMESTAMP***
* default: `YYYY-MM-DD HH:mm:ss.SSS`

All generated logs are timestamped; this configuration option allows you to
specify the format and detail of the timestamps used.

### console

* environment variable: ***LOG_TO_CONSOLE***
* default: `true`

When logging, send log output to the console. This is handiest when running
Omphalos during development or from the command line and less so when launching
it as a GUI application.

### file

* environment variable: ***LOG_FILENAME***
* default: `''`

Controls whether log output is sent to a file or not, and if so, what the
filename template for the file is. The filename can be anything you like;
include `%DATE%` to insert the current date into the filename.

## cors

The options here control `CORS`; from [MDN][1]:

> Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that
allows a server to indicate any origins (domain, scheme, or port) other than
its own from which a browser should permit loading resources.


### origin

* environment variable: ***CORS_ORIGIN***
* default: `[]`

This contains a list of extra origins to allow requests from; items in the
list are regular strings unless they start and end with a `/` character, in
which case they are treated as regular expressions.

```json
"cors": {
  "origin": [
    "/chrome-extension:\/\/.*/",
    "https://hoppscotch.io"
  ]
}
```

## developerMode

* environment variable: ***DEVELOPER_MODE***
* default: `false`

Controls whether developer mode is enabled or not. Generally speaking, you
probably don't need to have this turned on unless you are having issues and a
developer asks you to turn it on.

With this turned on:
  * Dashboard panels have reload buttons to individually reload them.

:::warning

This option is primarily for use while developing Omphalos; if you are an
advanced user you may also find it useful as well, so long as you keep in mind
that the user experience will be different as a result of turning this on.

:::



  [1]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS