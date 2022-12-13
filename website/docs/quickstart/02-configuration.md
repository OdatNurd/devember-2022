---
title: Configuring Omphalos
---

In this quick start, the configuration portion of this would point out that when
you run Omphalos for the first time, it sets up a configuration area for you,
the location of which depends on your operating system:

* ***linux*** users can find it at `~/.config/omphalos`, or the location specified
  by the environment variable `$XDG_CONFIG_HOME` if the user has set that to
  change where configuration items go.

* ***windows*** users will find the config folder at `%APPDATA%\omphalos`

* ***macos*** users will find the config folder at
  `~/Library/Application Support/omphalos`

The configuration folder contains a sample configuration file named
`omphalos.json.example`; rename this to `omphalos.json` and refer to the
configuration section for the available configuration options you can set and
their values.

The configuration file uses `JSONC`, which is a more forgiving `JSON` format
and allows trailing commas and comments.

The configuration folder also contains a `logs` folder inside of which all
application logs will be saved as Omphalos runs; this is a good place to look if
things don't seem to be working as you would expect.

There is also a `bundles` folder into which bundles can be installed by default.
