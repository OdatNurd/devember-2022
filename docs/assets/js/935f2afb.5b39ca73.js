"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[53],{1109:e=>{e.exports=JSON.parse('{"pluginId":"default","version":"current","label":"Next","banner":null,"badge":false,"noIndex":false,"className":"docs-version-current","isLast":true,"docsSidebars":{"tutorialSidebar":[{"type":"link","label":"This project is archived!","href":"/docs/readme","docId":"readme"},{"type":"link","label":"What is Omphalos?","href":"/docs/intro","docId":"intro"},{"type":"category","label":"Quick Start","collapsible":true,"collapsed":true,"items":[{"type":"link","label":"Installation","href":"/docs/quickstart/installation","docId":"quickstart/installation"},{"type":"link","label":"Configuring Omphalos","href":"/docs/quickstart/configuration","docId":"quickstart/configuration"},{"type":"link","label":"Creating Bundles","href":"/docs/quickstart/bundles","docId":"quickstart/bundles"}],"href":"/docs/category/quick-start"},{"type":"link","label":"Missing Features","href":"/docs/missing","docId":"missing"},{"type":"category","label":"Guides","collapsible":true,"collapsed":true,"items":[{"type":"link","label":"Concepts and Terminology","href":"/docs/guides/concepts","docId":"guides/concepts"},{"type":"link","label":"Bundle Manifests","href":"/docs/guides/manifest","docId":"guides/manifest"},{"type":"link","label":"Graphics","href":"/docs/guides/graphics","docId":"guides/graphics"},{"type":"link","label":"Panels","href":"/docs/guides/panels","docId":"guides/panels"},{"type":"link","label":"Extensions","href":"/docs/guides/extensions","docId":"guides/extensions"},{"type":"link","label":"Configuration","href":"/docs/guides/configuration","docId":"guides/configuration"},{"type":"link","label":"Logging","href":"/docs/guides/logging","docId":"guides/logging"}],"href":"/docs/category/guides"},{"type":"category","label":"API Reference","collapsible":true,"collapsed":true,"items":[{"type":"link","label":"API Lifecycle","href":"/docs/api/lifecycle","docId":"api/lifecycle"},{"type":"category","label":"Omphalos Object","collapsible":true,"collapsed":true,"items":[{"type":"link","label":"require","href":"/docs/api/omphalos/require","docId":"api/omphalos/require"},{"type":"link","label":"log","href":"/docs/api/omphalos/log","docId":"api/omphalos/log"},{"type":"link","label":"config","href":"/docs/api/omphalos/config","docId":"api/omphalos/config"},{"type":"link","label":"asset","href":"/docs/api/omphalos/asset","docId":"api/omphalos/asset"},{"type":"link","label":"bundle","href":"/docs/api/omphalos/bundle","docId":"api/omphalos/bundle"},{"type":"link","label":"sendMessage","href":"/docs/api/omphalos/sendmessage","docId":"api/omphalos/sendmessage"},{"type":"link","label":"sendMessageToBundle","href":"/docs/api/omphalos/sendmessagetobundle","docId":"api/omphalos/sendmessagetobundle"},{"type":"link","label":"listenFor","href":"/docs/api/omphalos/listenfor","docId":"api/omphalos/listenfor"},{"type":"link","label":"toast","href":"/docs/api/omphalos/toast","docId":"api/omphalos/toast"}],"href":"/docs/category/omphalos-object"}],"href":"/docs/category/api-reference"}]},"docs":{"api/lifecycle":{"id":"api/lifecycle","title":"API Lifecycle","description":"Bundles can contain an optional extension endpoint which allows them have server","sidebar":"tutorialSidebar"},"api/omphalos/asset":{"id":"api/omphalos/asset","title":"asset","description":"This item is only present in the API object in panels and graphics; it is","sidebar":"tutorialSidebar"},"api/omphalos/bundle":{"id":"api/omphalos/bundle","title":"bundle","description":"This object is a copy of the bundle manifest for this","sidebar":"tutorialSidebar"},"api/omphalos/config":{"id":"api/omphalos/config","title":"config","description":"This object is a copy of the full application configuration that the bundle is","sidebar":"tutorialSidebar"},"api/omphalos/listenfor":{"id":"api/omphalos/listenfor","title":"listenFor","description":"Listen for a given event to arrive and, when it does, invoke the listener with","sidebar":"tutorialSidebar"},"api/omphalos/log":{"id":"api/omphalos/log","title":"log","description":"A handle to a bundle specific logger. Has methods info, debug, warn,","sidebar":"tutorialSidebar"},"api/omphalos/require":{"id":"api/omphalos/require","title":"require","description":"This item is only present in the API object given to an extension; it is","sidebar":"tutorialSidebar"},"api/omphalos/sendmessage":{"id":"api/omphalos/sendmessage","title":"sendMessage","description":"Be careful of invoking this from server side code immediately at startup;","sidebar":"tutorialSidebar"},"api/omphalos/sendmessagetobundle":{"id":"api/omphalos/sendmessagetobundle","title":"sendMessageToBundle","description":"Be careful of invoking this from server side code immediately at startup;","sidebar":"tutorialSidebar"},"api/omphalos/toast":{"id":"api/omphalos/toast","title":"toast","description":"Display a toast in the dashboard that contains the provided message text.","sidebar":"tutorialSidebar"},"guides/concepts":{"id":"guides/concepts","title":"Concepts and Terminology","description":"This would outline the basic concepts and terminology in Omphalos and","sidebar":"tutorialSidebar"},"guides/configuration":{"id":"guides/configuration","title":"Configuration","description":"This page would talk about the configuration file in more detail. It should","sidebar":"tutorialSidebar"},"guides/extensions":{"id":"guides/extensions","title":"Extensions","description":"This page would discuss extensions, which are server side code that you can add","sidebar":"tutorialSidebar"},"guides/graphics":{"id":"guides/graphics","title":"Graphics","description":"This page would discuss graphics, which are simple html pages that you write","sidebar":"tutorialSidebar"},"guides/logging":{"id":"guides/logging","title":"Logging","description":"This page would talk about logging, log rolling, levels and provide more details","sidebar":"tutorialSidebar"},"guides/manifest":{"id":"guides/manifest","title":"Bundle Manifests","description":"This would talk about the contents of the package.json and include information","sidebar":"tutorialSidebar"},"guides/panels":{"id":"guides/panels","title":"Panels","description":"This page would discuss panels, which are simple html pages that you write","sidebar":"tutorialSidebar"},"intro":{"id":"intro","title":"What is Omphalos?","description":"Omphalos is a \\"Broadcast Graphics Framework and Application\\"; that description","sidebar":"tutorialSidebar"},"missing":{"id":"missing","title":"Missing Features","description":"There are some features of Omphalos that are planned but are either still in","sidebar":"tutorialSidebar"},"quickstart/bundles":{"id":"quickstart/bundles","title":"Creating Bundles","description":"Omphalos itself is just a container that allows you free form access to","sidebar":"tutorialSidebar"},"quickstart/configuration":{"id":"quickstart/configuration","title":"Configuring Omphalos","description":"Omphalos can be configured via environment variables, a configuration file, or","sidebar":"tutorialSidebar"},"quickstart/installation":{"id":"quickstart/installation","title":"Installation","description":"In this document, we would discuss how you can download and install your own","sidebar":"tutorialSidebar"},"readme":{"id":"readme","title":"This project is archived!","description":"This project originally started as my Devember project for 2022. During","sidebar":"tutorialSidebar"}}}')}}]);