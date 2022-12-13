"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[252],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>c});var l=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);t&&(l=l.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,l)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function r(e,t){if(null==e)return{};var n,l,a=function(e,t){if(null==e)return{};var n,l,a={},i=Object.keys(e);for(l=0;l<i.length;l++)n=i[l],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(l=0;l<i.length;l++)n=i[l],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var u=l.createContext({}),s=function(e){var t=l.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=s(e.components);return l.createElement(u.Provider,{value:t},e.children)},d="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return l.createElement(l.Fragment,{},t)}},g=l.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,u=e.parentName,p=r(e,["components","mdxType","originalType","parentName"]),d=s(n),g=a,c=d["".concat(u,".").concat(g)]||d[g]||m[g]||i;return n?l.createElement(c,o(o({ref:t},p),{},{components:n})):l.createElement(c,o({ref:t},p))}));function c(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=g;var r={};for(var u in t)hasOwnProperty.call(t,u)&&(r[u]=t[u]);r.originalType=e,r[d]="string"==typeof e?e:a,o[1]=r;for(var s=2;s<i;s++)o[s]=n[s];return l.createElement.apply(null,o)}return l.createElement.apply(null,n)}g.displayName="MDXCreateElement"},1788:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>o,default:()=>d,frontMatter:()=>i,metadata:()=>r,toc:()=>s});var l=n(7462),a=(n(7294),n(3905));const i={title:"Configuration"},o=void 0,r={unversionedId:"guides/configuration",id:"guides/configuration",title:"Configuration",description:"This page would talk about the configuration file in more detail. It should",source:"@site/docs/guides/06_configuration.md",sourceDirName:"guides",slug:"/guides/configuration",permalink:"/docs/guides/configuration",draft:!1,tags:[],version:"current",sidebarPosition:6,frontMatter:{title:"Configuration"},sidebar:"tutorialSidebar",previous:{title:"Extensions",permalink:"/docs/guides/extensions"},next:{title:"Logging",permalink:"/docs/guides/logging"}},u={},s=[{value:"port",id:"port",level:2},{value:"bundles",id:"bundles",level:2},{value:"additional",id:"additional",level:3},{value:"ignore",id:"ignore",level:3},{value:"logging",id:"logging",level:2},{value:"level",id:"level",level:3},{value:"timestamp",id:"timestamp",level:3},{value:"console",id:"console",level:3},{value:"file",id:"file",level:3}],p={toc:s};function d(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,l.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"This page would talk about the configuration file in more detail. It should\ninclude all of the configuration options, their default values, and how you can\nset them in either the configuration file OR via environment variables."),(0,a.kt)("p",null,"The current configuration keys are:"),(0,a.kt)("h2",{id:"port"},"port"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"environment variable: ",(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("em",{parentName:"strong"},"PORT"))),(0,a.kt)("li",{parentName:"ul"},"default: ",(0,a.kt)("inlineCode",{parentName:"li"},"3000"))),(0,a.kt)("p",null,"The port that the internal server listens on."),(0,a.kt)("h2",{id:"bundles"},"bundles"),(0,a.kt)("p",null,"The options in this section control bundles; extra locations to load a bundle\nfrom and bundles which should be ignored and not loaded if they are found."),(0,a.kt)("h3",{id:"additional"},"additional"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"environment variable: ",(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("em",{parentName:"strong"},"ADDITIONAL_BUNDLES"))),(0,a.kt)("li",{parentName:"ul"},"default: ",(0,a.kt)("inlineCode",{parentName:"li"},"[]"))),(0,a.kt)("p",null,"A list of extra paths that contain bundles to load. This should be either a list\nof absolute paths, or paths that are relative to the installation location of\nOmphalos."),(0,a.kt)("h3",{id:"ignore"},"ignore"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"environment variable: ",(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("em",{parentName:"strong"},"IGNORE_BUNDLES"))),(0,a.kt)("li",{parentName:"ul"},"default: ",(0,a.kt)("inlineCode",{parentName:"li"},"[]"))),(0,a.kt)("p",null,"A list of bundle ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("em",{parentName:"strong"},"names"))," that should not be loaded if they are seen."),(0,a.kt)("h2",{id:"logging"},"logging"),(0,a.kt)("p",null,"The options here control logging in the application; when it happens and where\nit gets sent."),(0,a.kt)("h3",{id:"level"},"level"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"environment variable: ",(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("em",{parentName:"strong"},"LOG_LEVEL"))),(0,a.kt)("li",{parentName:"ul"},"default: ",(0,a.kt)("inlineCode",{parentName:"li"},"info"))),(0,a.kt)("p",null,"Controls the level of log details that are sent to the log output. When logging\nat a level, all logs at that level and below are logged and anything above is\nignored."),(0,a.kt)("p",null,"For example, ",(0,a.kt)("inlineCode",{parentName:"p"},"silly")," logs everything and ",(0,a.kt)("inlineCode",{parentName:"p"},"info")," will not log ",(0,a.kt)("inlineCode",{parentName:"p"},"debug")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"silly"),",\nand so on."),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("inlineCode",{parentName:"li"},"error")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("inlineCode",{parentName:"li"},"warn")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("inlineCode",{parentName:"li"},"info")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("inlineCode",{parentName:"li"},"debug")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("inlineCode",{parentName:"li"},"silly"))),(0,a.kt)("h3",{id:"timestamp"},"timestamp"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"environment variable: ",(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("em",{parentName:"strong"},"LOG_TIMESTAMP"))),(0,a.kt)("li",{parentName:"ul"},"default: ",(0,a.kt)("inlineCode",{parentName:"li"},"YYYY-MM-DD HH:mm:ss.SSS"))),(0,a.kt)("p",null,"All generated logs are timestamped; this configuration option allows you to\nspecify the format and detail of the timestamps used."),(0,a.kt)("h3",{id:"console"},"console"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"environment variable: ",(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("em",{parentName:"strong"},"LOG_TO_CONSOLE"))),(0,a.kt)("li",{parentName:"ul"},"default: ",(0,a.kt)("inlineCode",{parentName:"li"},"true"))),(0,a.kt)("p",null,"When logging, send log output to the console. This is handiest when running\nOmphalos during development or from the command line and less so when launching\nit as a GUI application."),(0,a.kt)("h3",{id:"file"},"file"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"environment variable: ",(0,a.kt)("strong",{parentName:"li"},(0,a.kt)("em",{parentName:"strong"},"LOG_FILENAME"))),(0,a.kt)("li",{parentName:"ul"},"default: ",(0,a.kt)("inlineCode",{parentName:"li"},"''"))),(0,a.kt)("p",null,"Controls whether log output is sent to a file or not, and if so, what the\nfilename template for the file is. The filename can be anything you like;\ninclude ",(0,a.kt)("inlineCode",{parentName:"p"},"%DATE%")," to insert the current date into the filename."))}d.isMDXComponent=!0}}]);