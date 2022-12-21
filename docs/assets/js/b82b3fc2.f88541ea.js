"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[952],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>f});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),u=p(n),m=a,f=u["".concat(l,".").concat(m)]||u[m]||d[m]||o;return n?r.createElement(f,s(s({ref:t},c),{},{components:n})):r.createElement(f,s({ref:t},c))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,s=new Array(o);s[0]=m;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i[u]="string"==typeof e?e:a,s[1]=i;for(var p=2;p<o;p++)s[p]=n[p];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},4226:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>s,default:()=>u,frontMatter:()=>o,metadata:()=>i,toc:()=>p});var r=n(7462),a=(n(7294),n(3905));const o={title:"sendMessageToBundle"},s=void 0,i={unversionedId:"api/omphalos/sendmessagetobundle",id:"api/omphalos/sendmessagetobundle",title:"sendMessageToBundle",description:"This operates the same as sendMessage, but allows you to direct the message",source:"@site/docs/api/omphalos/07_sendmessagetobundle.md",sourceDirName:"api/omphalos",slug:"/api/omphalos/sendmessagetobundle",permalink:"/docs/api/omphalos/sendmessagetobundle",draft:!1,tags:[],version:"current",sidebarPosition:7,frontMatter:{title:"sendMessageToBundle"},sidebar:"tutorialSidebar",previous:{title:"sendMessage",permalink:"/docs/api/omphalos/sendmessage"},next:{title:"broadcastMessage",permalink:"/docs/api/omphalos/broadcastmessage"}},l={},p=[],c={toc:p};function u(e){let{components:t,...n}=e;return(0,a.kt)("wrapper",(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"function sendMessageToBundle(bundle, event, data)\n")),(0,a.kt)("p",null,"This operates the same as ",(0,a.kt)("inlineCode",{parentName:"p"},"sendMessage"),", but allows you to direct the message\nat a specific bundle."),(0,a.kt)("p",null,"The message will be transmitted to all ",(0,a.kt)("inlineCode",{parentName:"p"},"graphics"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"panels")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"extension"),"\nlisteners in that bundle, ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("em",{parentName:"strong"},"except"))," for the sender (if the sender is a\nmember of that bundle)."))}u.isMDXComponent=!0}}]);