!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=16)}([function(e,t){e.exports=require("electron")},function(e,t){e.exports=require("fs-jetpack")},function(e){e.exports={name:"production",description:"Add here any environment specific stuff you like."}},function(e,t){e.exports=require("path")},,,function(e,t){e.exports=require("url")},,,,,,,,,,function(e,t,n){"use strict";n.r(t);var o=n(3),r=n.n(o),i=n(6),s=n.n(i),a=n(0),u=n(1),c=n.n(u),l=(e,t)=>{const n=c.a.cwd(a.app.getPath("userData")),o=`window-state-${e}.json`,r={width:t.width,height:t.height};let i,s={};return s=(e=>{return a.screen.getAllDisplays().some(t=>((e,t)=>e.x>=t.x&&e.y>=t.y&&e.x+e.width<=t.x+t.width&&e.y+e.height<=t.y+t.height)(e,t.bounds))?e:(()=>{const e=a.screen.getPrimaryDisplay().bounds;return Object.assign({},r,{x:(e.width-r.width)/2,y:(e.height-r.height)/2})})()})((()=>{let e={};try{e=n.read(o,"json")}catch(e){}return Object.assign({},r,e)})()),(i=new a.BrowserWindow(Object.assign({},t,s))).on("close",()=>{i.isMinimized()||i.isMaximized()||Object.assign(s,(()=>{const e=i.getPosition(),t=i.getSize();return{x:e[0],y:e[1],width:t[0],height:t[1]}})()),n.write(o,s,{atomic:!0})}),i},d=n(2);if("production"!==d.name){const e=a.app.getPath("userData");a.app.setPath("userData",`${e} (${d.name})`)}a.app.on("ready",()=>{const e=l("main",{width:1e3,height:600});e.loadURL(s.a.format({pathname:r.a.join(__dirname,"app.html"),protocol:"file:",slashes:!0})),"development"===d.name&&e.openDevTools(),a.globalShortcut.register("f5",function(){console.log("f5 is pressed"),e.reload()}),a.globalShortcut.register("f6",function(){console.log("f6 is pressed"),e.toggleDevTools()}),a.globalShortcut.register("CommandOrControl+R",function(){console.log("CommandOrControl+R is pressed"),e.reload()})}),a.app.on("window-all-closed",()=>{a.app.quit()})}]);
//# sourceMappingURL=background.js.map