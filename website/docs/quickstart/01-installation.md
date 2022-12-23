---
title: Installation
---

In this document, we would discuss how you can download and install your own
copy of Omphalos to start using it.

This should also emphasize the fact that this is an application meant to be run
locally by you, **not** on a public facing network. That is to say, at least
for the foreseeable future it will not have authentication or be hardened
against attacks.

The purpose is for you to be able to control your streams and stream content
locally.

When it comes to actually doing the installation, there are two ways in which
this can be accomplished.

## Server Mode

In this mode, you would install the application as a standard NodeJS type
application and execute it in a terminal (possibly via [PM2][1]).

When running in this mode, you would open the dashboard in your web browser of
choice and work from there.

## Application Mode

Since not everyone is a developer (or wants to be), the plan is to bundle the
entire application up into an [Electron][2] application or possibly an
[NW.js][3] application (although currently it seems incredibly unstable on
Linux which is a deal breaker).

In this mode you would install the application as per usual, and running it
would present the dashboard to you directly. You would also be able to minimize
to the tray on OS's that support that, allowing you to keep the application in
the background when not needed, or at least out of your taskbar.

  [1]: https://pm2.keymetrics.io/
  [2]: https://www.electronjs.org/
  [3]: https://nwjs.io/