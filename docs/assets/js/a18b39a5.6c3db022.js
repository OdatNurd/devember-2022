"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[531],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),c=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=c(e.components);return r.createElement(s.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),u=c(n),f=o,m=u["".concat(s,".").concat(f)]||u[f]||d[f]||a;return n?r.createElement(m,l(l({ref:t},p),{},{components:n})):r.createElement(m,l({ref:t},p))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,l=new Array(a);l[0]=f;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i[u]="string"==typeof e?e:o,l[1]=i;for(var c=2;c<a;c++)l[c]=n[c];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},1828:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>u,frontMatter:()=>a,metadata:()=>i,toc:()=>c});var r=n(7462),o=(n(7294),n(3905));const a={title:"Omphalos Object"},l=void 0,i={unversionedId:"api/omphalos",id:"api/omphalos",title:"Omphalos Object",description:"The object that gets passed to lifecycle events when they are invoked is given",source:"@site/docs/api/02_omphalos.md",sourceDirName:"api",slug:"/api/omphalos",permalink:"/docs/api/omphalos",draft:!1,tags:[],version:"current",sidebarPosition:2,frontMatter:{title:"Omphalos Object"},sidebar:"tutorialSidebar",previous:{title:"API Lifecycle",permalink:"/docs/api/lifecycle"}},s={},c=[{value:"log",id:"log",level:2},{value:"bundleInfo",id:"bundleinfo",level:2},{value:"require(bundleName)",id:"requirebundlename",level:2}],p={toc:c};function u(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"The object that gets passed to lifecycle events when they are invoked is given\nan instance of an API object as a parameter, which exposes the internals of the\napplication API to the bundle."),(0,o.kt)("h2",{id:"log"},"log"),(0,o.kt)("p",null,"A handle to a bundle specific logger. Has methods ",(0,o.kt)("inlineCode",{parentName:"p"},"info"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"debug"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"warn"),",\n",(0,o.kt)("inlineCode",{parentName:"p"},"error")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"silly")," to send output of varying levels. The configuration\nspecifies which levels get logged and which get ignored."),(0,o.kt)("h2",{id:"bundleinfo"},"bundleInfo"),(0,o.kt)("p",null,"A reference to the bundle ",(0,o.kt)("a",{parentName:"p",href:"/docs/guides/manifest"},"manifest")," for this bundle."),(0,o.kt)("h2",{id:"requirebundlename"},"require(bundleName)"),(0,o.kt)("p",null,"A function that can be used to load symbols from other bundles; these symbols\ncome from the list of explicitly exported symbols for sharing from the bundle."),(0,o.kt)("p",null,"When used at load time, this can only pull symbols from bundles that loaded\nprior to the calling bundle. However, once all loads are done, this will have\naccess to the bundles that loaded after."),(0,o.kt)("p",null,"If important, set up a dependency between modules in order to assure the load\norder."))}u.isMDXComponent=!0}}]);