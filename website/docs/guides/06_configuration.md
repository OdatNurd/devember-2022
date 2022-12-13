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