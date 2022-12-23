---
title: Configuring Omphalos
---

Omphalos can be configured via environment variables, a configuration file, or
both. Upon installation a base configuration is in place, which can be modified
to suit your own needs. See the detailed configuration page for more
information.


## Configuration Area

When executing Omphalos for the first time, it will generate a configuration
area, which is the location in which the configuration information is kept,
logs are stored, and the base location where content bundles will be stored.

The location of this  folder depends on your operating system.


### Linux

Under Linux, the configuration directory is `~/.config/omphalos`, or the
location specified by the environment variable `$XDG_CONFIG_HOME` if you have
set that to change where configuration items go.


### Windows

Under Windows, the configuration folder is `%APPDATA%\omphalos`, as is standard
for the platform.


### MacOS

Under MacOS, the configuration folder can be found at `~/Library/Application
Support/omphalos`


## Sample Configuration

The configuration folder contains a sample configuration file named
`omphalos.json.example`, which also outlines the default values that are in
place if there is no configuration set.

To configure Ompahlos, rename this to `omphalos.json` and refer to the
configuration section for the available configuration options you can set and
their values.


### Configuration File Format

The configuration file uses `JSONC`, which is a more forgiving `JSON` format
and allows trailing commas and comments.


## Logging

The configuration folder contains a `logs` folder inside of which all
application logs will be saved as Omphalos runs; this is a good place to look
if things don't seem to be working as you would expect.


## Bundles

When installing bundles, the primary location to store installed bundles is
in the `bundles` folder of the configuration area, although as outlined in the
configuration section, you can configure alternate places where bundles are
stored should you want to store them elsewhere.
