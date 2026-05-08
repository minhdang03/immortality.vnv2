const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HomePage-ObDjyrCq.js","assets/ArticleCard-D89lRkAd.js","assets/ShareButtons-83w4c0WX.js","assets/SearchPage-C0RKfLaP.js","assets/ArticlesPage-eiwjLxGe.js","assets/ArticleDetail-Cw_hnHdL.js","assets/ReadingHelpers-D0uZPJL1.js","assets/TopicPage-DlWKsX5u.js","assets/StoriesPage-BohR3_Ga.js","assets/stories-CUXWDmSa.js","assets/KhaiTriPage-58sNu1z9.js","assets/AdminPanel-BimfJWdM.js"])))=>i.map(i=>d[i]);
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();function lI(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var Yy={exports:{}},mu={},Jy={exports:{}},ne={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ea=Symbol.for("react.element"),uI=Symbol.for("react.portal"),cI=Symbol.for("react.fragment"),hI=Symbol.for("react.strict_mode"),dI=Symbol.for("react.profiler"),fI=Symbol.for("react.provider"),pI=Symbol.for("react.context"),mI=Symbol.for("react.forward_ref"),gI=Symbol.for("react.suspense"),yI=Symbol.for("react.memo"),_I=Symbol.for("react.lazy"),em=Symbol.iterator;function vI(t){return t===null||typeof t!="object"?null:(t=em&&t[em]||t["@@iterator"],typeof t=="function"?t:null)}var Xy={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Zy=Object.assign,e_={};function gs(t,e,n){this.props=t,this.context=e,this.refs=e_,this.updater=n||Xy}gs.prototype.isReactComponent={};gs.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};gs.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function t_(){}t_.prototype=gs.prototype;function wd(t,e,n){this.props=t,this.context=e,this.refs=e_,this.updater=n||Xy}var Id=wd.prototype=new t_;Id.constructor=wd;Zy(Id,gs.prototype);Id.isPureReactComponent=!0;var tm=Array.isArray,n_=Object.prototype.hasOwnProperty,Sd={current:null},r_={key:!0,ref:!0,__self:!0,__source:!0};function i_(t,e,n){var r,i={},s=null,o=null;if(e!=null)for(r in e.ref!==void 0&&(o=e.ref),e.key!==void 0&&(s=""+e.key),e)n_.call(e,r)&&!r_.hasOwnProperty(r)&&(i[r]=e[r]);var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){for(var u=Array(l),h=0;h<l;h++)u[h]=arguments[h+2];i.children=u}if(t&&t.defaultProps)for(r in l=t.defaultProps,l)i[r]===void 0&&(i[r]=l[r]);return{$$typeof:ea,type:t,key:s,ref:o,props:i,_owner:Sd.current}}function EI(t,e){return{$$typeof:ea,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function Ad(t){return typeof t=="object"&&t!==null&&t.$$typeof===ea}function TI(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var nm=/\/+/g;function Ec(t,e){return typeof t=="object"&&t!==null&&t.key!=null?TI(""+t.key):e.toString(36)}function sl(t,e,n,r,i){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var o=!1;if(t===null)o=!0;else switch(s){case"string":case"number":o=!0;break;case"object":switch(t.$$typeof){case ea:case uI:o=!0}}if(o)return o=t,i=i(o),t=r===""?"."+Ec(o,0):r,tm(i)?(n="",t!=null&&(n=t.replace(nm,"$&/")+"/"),sl(i,e,n,"",function(h){return h})):i!=null&&(Ad(i)&&(i=EI(i,n+(!i.key||o&&o.key===i.key?"":(""+i.key).replace(nm,"$&/")+"/")+t)),e.push(i)),1;if(o=0,r=r===""?".":r+":",tm(t))for(var l=0;l<t.length;l++){s=t[l];var u=r+Ec(s,l);o+=sl(s,e,n,u,i)}else if(u=vI(t),typeof u=="function")for(t=u.call(t),l=0;!(s=t.next()).done;)s=s.value,u=r+Ec(s,l++),o+=sl(s,e,n,u,i);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return o}function Ma(t,e,n){if(t==null)return t;var r=[],i=0;return sl(t,r,"","",function(s){return e.call(n,s,i++)}),r}function wI(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var ht={current:null},ol={transition:null},II={ReactCurrentDispatcher:ht,ReactCurrentBatchConfig:ol,ReactCurrentOwner:Sd};function s_(){throw Error("act(...) is not supported in production builds of React.")}ne.Children={map:Ma,forEach:function(t,e,n){Ma(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Ma(t,function(){e++}),e},toArray:function(t){return Ma(t,function(e){return e})||[]},only:function(t){if(!Ad(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};ne.Component=gs;ne.Fragment=cI;ne.Profiler=dI;ne.PureComponent=wd;ne.StrictMode=hI;ne.Suspense=gI;ne.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=II;ne.act=s_;ne.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var r=Zy({},t.props),i=t.key,s=t.ref,o=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,o=Sd.current),e.key!==void 0&&(i=""+e.key),t.type&&t.type.defaultProps)var l=t.type.defaultProps;for(u in e)n_.call(e,u)&&!r_.hasOwnProperty(u)&&(r[u]=e[u]===void 0&&l!==void 0?l[u]:e[u])}var u=arguments.length-2;if(u===1)r.children=n;else if(1<u){l=Array(u);for(var h=0;h<u;h++)l[h]=arguments[h+2];r.children=l}return{$$typeof:ea,type:t.type,key:i,ref:s,props:r,_owner:o}};ne.createContext=function(t){return t={$$typeof:pI,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:fI,_context:t},t.Consumer=t};ne.createElement=i_;ne.createFactory=function(t){var e=i_.bind(null,t);return e.type=t,e};ne.createRef=function(){return{current:null}};ne.forwardRef=function(t){return{$$typeof:mI,render:t}};ne.isValidElement=Ad;ne.lazy=function(t){return{$$typeof:_I,_payload:{_status:-1,_result:t},_init:wI}};ne.memo=function(t,e){return{$$typeof:yI,type:t,compare:e===void 0?null:e}};ne.startTransition=function(t){var e=ol.transition;ol.transition={};try{t()}finally{ol.transition=e}};ne.unstable_act=s_;ne.useCallback=function(t,e){return ht.current.useCallback(t,e)};ne.useContext=function(t){return ht.current.useContext(t)};ne.useDebugValue=function(){};ne.useDeferredValue=function(t){return ht.current.useDeferredValue(t)};ne.useEffect=function(t,e){return ht.current.useEffect(t,e)};ne.useId=function(){return ht.current.useId()};ne.useImperativeHandle=function(t,e,n){return ht.current.useImperativeHandle(t,e,n)};ne.useInsertionEffect=function(t,e){return ht.current.useInsertionEffect(t,e)};ne.useLayoutEffect=function(t,e){return ht.current.useLayoutEffect(t,e)};ne.useMemo=function(t,e){return ht.current.useMemo(t,e)};ne.useReducer=function(t,e,n){return ht.current.useReducer(t,e,n)};ne.useRef=function(t){return ht.current.useRef(t)};ne.useState=function(t){return ht.current.useState(t)};ne.useSyncExternalStore=function(t,e,n){return ht.current.useSyncExternalStore(t,e,n)};ne.useTransition=function(){return ht.current.useTransition()};ne.version="18.3.1";Jy.exports=ne;var q=Jy.exports;const SI=lI(q);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var AI=q,CI=Symbol.for("react.element"),RI=Symbol.for("react.fragment"),PI=Object.prototype.hasOwnProperty,kI=AI.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,NI={key:!0,ref:!0,__self:!0,__source:!0};function o_(t,e,n){var r,i={},s=null,o=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(o=e.ref);for(r in e)PI.call(e,r)&&!NI.hasOwnProperty(r)&&(i[r]=e[r]);if(t&&t.defaultProps)for(r in e=t.defaultProps,e)i[r]===void 0&&(i[r]=e[r]);return{$$typeof:CI,type:t,key:s,ref:o,props:i,_owner:kI.current}}mu.Fragment=RI;mu.jsx=o_;mu.jsxs=o_;Yy.exports=mu;var D=Yy.exports,ih={},a_={exports:{}},Nt={},l_={exports:{}},u_={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(B,K){var Z=B.length;B.push(K);e:for(;0<Z;){var he=Z-1>>>1,ve=B[he];if(0<i(ve,K))B[he]=K,B[Z]=ve,Z=he;else break e}}function n(B){return B.length===0?null:B[0]}function r(B){if(B.length===0)return null;var K=B[0],Z=B.pop();if(Z!==K){B[0]=Z;e:for(var he=0,ve=B.length,nn=ve>>>1;he<nn;){var ft=2*(he+1)-1,yn=B[ft],Tt=ft+1,Je=B[Tt];if(0>i(yn,Z))Tt<ve&&0>i(Je,yn)?(B[he]=Je,B[Tt]=Z,he=Tt):(B[he]=yn,B[ft]=Z,he=ft);else if(Tt<ve&&0>i(Je,Z))B[he]=Je,B[Tt]=Z,he=Tt;else break e}}return K}function i(B,K){var Z=B.sortIndex-K.sortIndex;return Z!==0?Z:B.id-K.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var o=Date,l=o.now();t.unstable_now=function(){return o.now()-l}}var u=[],h=[],f=1,p=null,m=3,A=!1,R=!1,V=!1,b=typeof setTimeout=="function"?setTimeout:null,I=typeof clearTimeout=="function"?clearTimeout:null,v=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function C(B){for(var K=n(h);K!==null;){if(K.callback===null)r(h);else if(K.startTime<=B)r(h),K.sortIndex=K.expirationTime,e(u,K);else break;K=n(h)}}function L(B){if(V=!1,C(B),!R)if(n(u)!==null)R=!0,jr(F);else{var K=n(h);K!==null&&Un(L,K.startTime-B)}}function F(B,K){R=!1,V&&(V=!1,I(y),y=-1),A=!0;var Z=m;try{for(C(K),p=n(u);p!==null&&(!(p.expirationTime>K)||B&&!S());){var he=p.callback;if(typeof he=="function"){p.callback=null,m=p.priorityLevel;var ve=he(p.expirationTime<=K);K=t.unstable_now(),typeof ve=="function"?p.callback=ve:p===n(u)&&r(u),C(K)}else r(u);p=n(u)}if(p!==null)var nn=!0;else{var ft=n(h);ft!==null&&Un(L,ft.startTime-K),nn=!1}return nn}finally{p=null,m=Z,A=!1}}var j=!1,_=null,y=-1,E=5,w=-1;function S(){return!(t.unstable_now()-w<E)}function P(){if(_!==null){var B=t.unstable_now();w=B;var K=!0;try{K=_(!0,B)}finally{K?T():(j=!1,_=null)}}else j=!1}var T;if(typeof v=="function")T=function(){v(P)};else if(typeof MessageChannel<"u"){var Le=new MessageChannel,xt=Le.port2;Le.port1.onmessage=P,T=function(){xt.postMessage(null)}}else T=function(){b(P,0)};function jr(B){_=B,j||(j=!0,T())}function Un(B,K){y=b(function(){B(t.unstable_now())},K)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(B){B.callback=null},t.unstable_continueExecution=function(){R||A||(R=!0,jr(F))},t.unstable_forceFrameRate=function(B){0>B||125<B?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):E=0<B?Math.floor(1e3/B):5},t.unstable_getCurrentPriorityLevel=function(){return m},t.unstable_getFirstCallbackNode=function(){return n(u)},t.unstable_next=function(B){switch(m){case 1:case 2:case 3:var K=3;break;default:K=m}var Z=m;m=K;try{return B()}finally{m=Z}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(B,K){switch(B){case 1:case 2:case 3:case 4:case 5:break;default:B=3}var Z=m;m=B;try{return K()}finally{m=Z}},t.unstable_scheduleCallback=function(B,K,Z){var he=t.unstable_now();switch(typeof Z=="object"&&Z!==null?(Z=Z.delay,Z=typeof Z=="number"&&0<Z?he+Z:he):Z=he,B){case 1:var ve=-1;break;case 2:ve=250;break;case 5:ve=1073741823;break;case 4:ve=1e4;break;default:ve=5e3}return ve=Z+ve,B={id:f++,callback:K,priorityLevel:B,startTime:Z,expirationTime:ve,sortIndex:-1},Z>he?(B.sortIndex=Z,e(h,B),n(u)===null&&B===n(h)&&(V?(I(y),y=-1):V=!0,Un(L,Z-he))):(B.sortIndex=ve,e(u,B),R||A||(R=!0,jr(F))),B},t.unstable_shouldYield=S,t.unstable_wrapCallback=function(B){var K=m;return function(){var Z=m;m=K;try{return B.apply(this,arguments)}finally{m=Z}}}})(u_);l_.exports=u_;var VI=l_.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var DI=q,kt=VI;function M(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var c_=new Set,Ro={};function fi(t,e){es(t,e),es(t+"Capture",e)}function es(t,e){for(Ro[t]=e,t=0;t<e.length;t++)c_.add(e[t])}var Rn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),sh=Object.prototype.hasOwnProperty,xI=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,rm={},im={};function OI(t){return sh.call(im,t)?!0:sh.call(rm,t)?!1:xI.test(t)?im[t]=!0:(rm[t]=!0,!1)}function LI(t,e,n,r){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function MI(t,e,n,r){if(e===null||typeof e>"u"||LI(t,e,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function dt(t,e,n,r,i,s,o){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=r,this.attributeNamespace=i,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=o}var Ye={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){Ye[t]=new dt(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];Ye[e]=new dt(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){Ye[t]=new dt(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){Ye[t]=new dt(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){Ye[t]=new dt(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){Ye[t]=new dt(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){Ye[t]=new dt(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){Ye[t]=new dt(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){Ye[t]=new dt(t,5,!1,t.toLowerCase(),null,!1,!1)});var Cd=/[\-:]([a-z])/g;function Rd(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(Cd,Rd);Ye[e]=new dt(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(Cd,Rd);Ye[e]=new dt(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(Cd,Rd);Ye[e]=new dt(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){Ye[t]=new dt(t,1,!1,t.toLowerCase(),null,!1,!1)});Ye.xlinkHref=new dt("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){Ye[t]=new dt(t,1,!1,t.toLowerCase(),null,!0,!0)});function Pd(t,e,n,r){var i=Ye.hasOwnProperty(e)?Ye[e]:null;(i!==null?i.type!==0:r||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(MI(e,n,i,r)&&(n=null),r||i===null?OI(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):i.mustUseProperty?t[i.propertyName]=n===null?i.type===3?!1:"":n:(e=i.attributeName,r=i.attributeNamespace,n===null?t.removeAttribute(e):(i=i.type,n=i===3||i===4&&n===!0?"":""+n,r?t.setAttributeNS(r,e,n):t.setAttribute(e,n))))}var Mn=DI.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,ba=Symbol.for("react.element"),ki=Symbol.for("react.portal"),Ni=Symbol.for("react.fragment"),kd=Symbol.for("react.strict_mode"),oh=Symbol.for("react.profiler"),h_=Symbol.for("react.provider"),d_=Symbol.for("react.context"),Nd=Symbol.for("react.forward_ref"),ah=Symbol.for("react.suspense"),lh=Symbol.for("react.suspense_list"),Vd=Symbol.for("react.memo"),Jn=Symbol.for("react.lazy"),f_=Symbol.for("react.offscreen"),sm=Symbol.iterator;function qs(t){return t===null||typeof t!="object"?null:(t=sm&&t[sm]||t["@@iterator"],typeof t=="function"?t:null)}var Ie=Object.assign,Tc;function to(t){if(Tc===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Tc=e&&e[1]||""}return`
`+Tc+t}var wc=!1;function Ic(t,e){if(!t||wc)return"";wc=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(h){var r=h}Reflect.construct(t,[],e)}else{try{e.call()}catch(h){r=h}t.call(e.prototype)}else{try{throw Error()}catch(h){r=h}t()}}catch(h){if(h&&r&&typeof h.stack=="string"){for(var i=h.stack.split(`
`),s=r.stack.split(`
`),o=i.length-1,l=s.length-1;1<=o&&0<=l&&i[o]!==s[l];)l--;for(;1<=o&&0<=l;o--,l--)if(i[o]!==s[l]){if(o!==1||l!==1)do if(o--,l--,0>l||i[o]!==s[l]){var u=`
`+i[o].replace(" at new "," at ");return t.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",t.displayName)),u}while(1<=o&&0<=l);break}}}finally{wc=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?to(t):""}function bI(t){switch(t.tag){case 5:return to(t.type);case 16:return to("Lazy");case 13:return to("Suspense");case 19:return to("SuspenseList");case 0:case 2:case 15:return t=Ic(t.type,!1),t;case 11:return t=Ic(t.type.render,!1),t;case 1:return t=Ic(t.type,!0),t;default:return""}}function uh(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Ni:return"Fragment";case ki:return"Portal";case oh:return"Profiler";case kd:return"StrictMode";case ah:return"Suspense";case lh:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case d_:return(t.displayName||"Context")+".Consumer";case h_:return(t._context.displayName||"Context")+".Provider";case Nd:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Vd:return e=t.displayName||null,e!==null?e:uh(t.type)||"Memo";case Jn:e=t._payload,t=t._init;try{return uh(t(e))}catch{}}return null}function FI(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return uh(e);case 8:return e===kd?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function wr(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function p_(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function UI(t){var e=p_(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),r=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var i=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return i.call(this)},set:function(o){r=""+o,s.call(this,o)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(o){r=""+o},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Fa(t){t._valueTracker||(t._valueTracker=UI(t))}function m_(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),r="";return t&&(r=p_(t)?t.checked?"true":"false":t.value),t=r,t!==n?(e.setValue(t),!0):!1}function Cl(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function ch(t,e){var n=e.checked;return Ie({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function om(t,e){var n=e.defaultValue==null?"":e.defaultValue,r=e.checked!=null?e.checked:e.defaultChecked;n=wr(e.value!=null?e.value:n),t._wrapperState={initialChecked:r,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function g_(t,e){e=e.checked,e!=null&&Pd(t,"checked",e,!1)}function hh(t,e){g_(t,e);var n=wr(e.value),r=e.type;if(n!=null)r==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(r==="submit"||r==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?dh(t,e.type,n):e.hasOwnProperty("defaultValue")&&dh(t,e.type,wr(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function am(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var r=e.type;if(!(r!=="submit"&&r!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function dh(t,e,n){(e!=="number"||Cl(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var no=Array.isArray;function $i(t,e,n,r){if(t=t.options,e){e={};for(var i=0;i<n.length;i++)e["$"+n[i]]=!0;for(n=0;n<t.length;n++)i=e.hasOwnProperty("$"+t[n].value),t[n].selected!==i&&(t[n].selected=i),i&&r&&(t[n].defaultSelected=!0)}else{for(n=""+wr(n),e=null,i=0;i<t.length;i++){if(t[i].value===n){t[i].selected=!0,r&&(t[i].defaultSelected=!0);return}e!==null||t[i].disabled||(e=t[i])}e!==null&&(e.selected=!0)}}function fh(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(M(91));return Ie({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function lm(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(M(92));if(no(n)){if(1<n.length)throw Error(M(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:wr(n)}}function y_(t,e){var n=wr(e.value),r=wr(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),r!=null&&(t.defaultValue=""+r)}function um(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function __(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function ph(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?__(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Ua,v_=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,r,i){MSApp.execUnsafeLocalFunction(function(){return t(e,n,r,i)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(Ua=Ua||document.createElement("div"),Ua.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=Ua.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function Po(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var co={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},jI=["Webkit","ms","Moz","O"];Object.keys(co).forEach(function(t){jI.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),co[e]=co[t]})});function E_(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||co.hasOwnProperty(t)&&co[t]?(""+e).trim():e+"px"}function T_(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var r=n.indexOf("--")===0,i=E_(n,e[n],r);n==="float"&&(n="cssFloat"),r?t.setProperty(n,i):t[n]=i}}var BI=Ie({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function mh(t,e){if(e){if(BI[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(M(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(M(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(M(61))}if(e.style!=null&&typeof e.style!="object")throw Error(M(62))}}function gh(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var yh=null;function Dd(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var _h=null,Hi=null,Wi=null;function cm(t){if(t=ra(t)){if(typeof _h!="function")throw Error(M(280));var e=t.stateNode;e&&(e=Eu(e),_h(t.stateNode,t.type,e))}}function w_(t){Hi?Wi?Wi.push(t):Wi=[t]:Hi=t}function I_(){if(Hi){var t=Hi,e=Wi;if(Wi=Hi=null,cm(t),e)for(t=0;t<e.length;t++)cm(e[t])}}function S_(t,e){return t(e)}function A_(){}var Sc=!1;function C_(t,e,n){if(Sc)return t(e,n);Sc=!0;try{return S_(t,e,n)}finally{Sc=!1,(Hi!==null||Wi!==null)&&(A_(),I_())}}function ko(t,e){var n=t.stateNode;if(n===null)return null;var r=Eu(n);if(r===null)return null;n=r[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(t=t.type,r=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!r;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(M(231,e,typeof n));return n}var vh=!1;if(Rn)try{var Ks={};Object.defineProperty(Ks,"passive",{get:function(){vh=!0}}),window.addEventListener("test",Ks,Ks),window.removeEventListener("test",Ks,Ks)}catch{vh=!1}function zI(t,e,n,r,i,s,o,l,u){var h=Array.prototype.slice.call(arguments,3);try{e.apply(n,h)}catch(f){this.onError(f)}}var ho=!1,Rl=null,Pl=!1,Eh=null,$I={onError:function(t){ho=!0,Rl=t}};function HI(t,e,n,r,i,s,o,l,u){ho=!1,Rl=null,zI.apply($I,arguments)}function WI(t,e,n,r,i,s,o,l,u){if(HI.apply(this,arguments),ho){if(ho){var h=Rl;ho=!1,Rl=null}else throw Error(M(198));Pl||(Pl=!0,Eh=h)}}function pi(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function R_(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function hm(t){if(pi(t)!==t)throw Error(M(188))}function qI(t){var e=t.alternate;if(!e){if(e=pi(t),e===null)throw Error(M(188));return e!==t?null:t}for(var n=t,r=e;;){var i=n.return;if(i===null)break;var s=i.alternate;if(s===null){if(r=i.return,r!==null){n=r;continue}break}if(i.child===s.child){for(s=i.child;s;){if(s===n)return hm(i),t;if(s===r)return hm(i),e;s=s.sibling}throw Error(M(188))}if(n.return!==r.return)n=i,r=s;else{for(var o=!1,l=i.child;l;){if(l===n){o=!0,n=i,r=s;break}if(l===r){o=!0,r=i,n=s;break}l=l.sibling}if(!o){for(l=s.child;l;){if(l===n){o=!0,n=s,r=i;break}if(l===r){o=!0,r=s,n=i;break}l=l.sibling}if(!o)throw Error(M(189))}}if(n.alternate!==r)throw Error(M(190))}if(n.tag!==3)throw Error(M(188));return n.stateNode.current===n?t:e}function P_(t){return t=qI(t),t!==null?k_(t):null}function k_(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=k_(t);if(e!==null)return e;t=t.sibling}return null}var N_=kt.unstable_scheduleCallback,dm=kt.unstable_cancelCallback,KI=kt.unstable_shouldYield,GI=kt.unstable_requestPaint,ke=kt.unstable_now,QI=kt.unstable_getCurrentPriorityLevel,xd=kt.unstable_ImmediatePriority,V_=kt.unstable_UserBlockingPriority,kl=kt.unstable_NormalPriority,YI=kt.unstable_LowPriority,D_=kt.unstable_IdlePriority,gu=null,cn=null;function JI(t){if(cn&&typeof cn.onCommitFiberRoot=="function")try{cn.onCommitFiberRoot(gu,t,void 0,(t.current.flags&128)===128)}catch{}}var Qt=Math.clz32?Math.clz32:e0,XI=Math.log,ZI=Math.LN2;function e0(t){return t>>>=0,t===0?32:31-(XI(t)/ZI|0)|0}var ja=64,Ba=4194304;function ro(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function Nl(t,e){var n=t.pendingLanes;if(n===0)return 0;var r=0,i=t.suspendedLanes,s=t.pingedLanes,o=n&268435455;if(o!==0){var l=o&~i;l!==0?r=ro(l):(s&=o,s!==0&&(r=ro(s)))}else o=n&~i,o!==0?r=ro(o):s!==0&&(r=ro(s));if(r===0)return 0;if(e!==0&&e!==r&&!(e&i)&&(i=r&-r,s=e&-e,i>=s||i===16&&(s&4194240)!==0))return e;if(r&4&&(r|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=r;0<e;)n=31-Qt(e),i=1<<n,r|=t[n],e&=~i;return r}function t0(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function n0(t,e){for(var n=t.suspendedLanes,r=t.pingedLanes,i=t.expirationTimes,s=t.pendingLanes;0<s;){var o=31-Qt(s),l=1<<o,u=i[o];u===-1?(!(l&n)||l&r)&&(i[o]=t0(l,e)):u<=e&&(t.expiredLanes|=l),s&=~l}}function Th(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function x_(){var t=ja;return ja<<=1,!(ja&4194240)&&(ja=64),t}function Ac(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function ta(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-Qt(e),t[e]=n}function r0(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var r=t.eventTimes;for(t=t.expirationTimes;0<n;){var i=31-Qt(n),s=1<<i;e[i]=0,r[i]=-1,t[i]=-1,n&=~s}}function Od(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var r=31-Qt(n),i=1<<r;i&e|t[r]&e&&(t[r]|=e),n&=~i}}var ue=0;function O_(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var L_,Ld,M_,b_,F_,wh=!1,za=[],lr=null,ur=null,cr=null,No=new Map,Vo=new Map,Zn=[],i0="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function fm(t,e){switch(t){case"focusin":case"focusout":lr=null;break;case"dragenter":case"dragleave":ur=null;break;case"mouseover":case"mouseout":cr=null;break;case"pointerover":case"pointerout":No.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Vo.delete(e.pointerId)}}function Gs(t,e,n,r,i,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:r,nativeEvent:s,targetContainers:[i]},e!==null&&(e=ra(e),e!==null&&Ld(e)),t):(t.eventSystemFlags|=r,e=t.targetContainers,i!==null&&e.indexOf(i)===-1&&e.push(i),t)}function s0(t,e,n,r,i){switch(e){case"focusin":return lr=Gs(lr,t,e,n,r,i),!0;case"dragenter":return ur=Gs(ur,t,e,n,r,i),!0;case"mouseover":return cr=Gs(cr,t,e,n,r,i),!0;case"pointerover":var s=i.pointerId;return No.set(s,Gs(No.get(s)||null,t,e,n,r,i)),!0;case"gotpointercapture":return s=i.pointerId,Vo.set(s,Gs(Vo.get(s)||null,t,e,n,r,i)),!0}return!1}function U_(t){var e=Qr(t.target);if(e!==null){var n=pi(e);if(n!==null){if(e=n.tag,e===13){if(e=R_(n),e!==null){t.blockedOn=e,F_(t.priority,function(){M_(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function al(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Ih(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var r=new n.constructor(n.type,n);yh=r,n.target.dispatchEvent(r),yh=null}else return e=ra(n),e!==null&&Ld(e),t.blockedOn=n,!1;e.shift()}return!0}function pm(t,e,n){al(t)&&n.delete(e)}function o0(){wh=!1,lr!==null&&al(lr)&&(lr=null),ur!==null&&al(ur)&&(ur=null),cr!==null&&al(cr)&&(cr=null),No.forEach(pm),Vo.forEach(pm)}function Qs(t,e){t.blockedOn===e&&(t.blockedOn=null,wh||(wh=!0,kt.unstable_scheduleCallback(kt.unstable_NormalPriority,o0)))}function Do(t){function e(i){return Qs(i,t)}if(0<za.length){Qs(za[0],t);for(var n=1;n<za.length;n++){var r=za[n];r.blockedOn===t&&(r.blockedOn=null)}}for(lr!==null&&Qs(lr,t),ur!==null&&Qs(ur,t),cr!==null&&Qs(cr,t),No.forEach(e),Vo.forEach(e),n=0;n<Zn.length;n++)r=Zn[n],r.blockedOn===t&&(r.blockedOn=null);for(;0<Zn.length&&(n=Zn[0],n.blockedOn===null);)U_(n),n.blockedOn===null&&Zn.shift()}var qi=Mn.ReactCurrentBatchConfig,Vl=!0;function a0(t,e,n,r){var i=ue,s=qi.transition;qi.transition=null;try{ue=1,Md(t,e,n,r)}finally{ue=i,qi.transition=s}}function l0(t,e,n,r){var i=ue,s=qi.transition;qi.transition=null;try{ue=4,Md(t,e,n,r)}finally{ue=i,qi.transition=s}}function Md(t,e,n,r){if(Vl){var i=Ih(t,e,n,r);if(i===null)Lc(t,e,r,Dl,n),fm(t,r);else if(s0(i,t,e,n,r))r.stopPropagation();else if(fm(t,r),e&4&&-1<i0.indexOf(t)){for(;i!==null;){var s=ra(i);if(s!==null&&L_(s),s=Ih(t,e,n,r),s===null&&Lc(t,e,r,Dl,n),s===i)break;i=s}i!==null&&r.stopPropagation()}else Lc(t,e,r,null,n)}}var Dl=null;function Ih(t,e,n,r){if(Dl=null,t=Dd(r),t=Qr(t),t!==null)if(e=pi(t),e===null)t=null;else if(n=e.tag,n===13){if(t=R_(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return Dl=t,null}function j_(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(QI()){case xd:return 1;case V_:return 4;case kl:case YI:return 16;case D_:return 536870912;default:return 16}default:return 16}}var sr=null,bd=null,ll=null;function B_(){if(ll)return ll;var t,e=bd,n=e.length,r,i="value"in sr?sr.value:sr.textContent,s=i.length;for(t=0;t<n&&e[t]===i[t];t++);var o=n-t;for(r=1;r<=o&&e[n-r]===i[s-r];r++);return ll=i.slice(t,1<r?1-r:void 0)}function ul(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function $a(){return!0}function mm(){return!1}function Vt(t){function e(n,r,i,s,o){this._reactName=n,this._targetInst=i,this.type=r,this.nativeEvent=s,this.target=o,this.currentTarget=null;for(var l in t)t.hasOwnProperty(l)&&(n=t[l],this[l]=n?n(s):s[l]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?$a:mm,this.isPropagationStopped=mm,this}return Ie(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=$a)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=$a)},persist:function(){},isPersistent:$a}),e}var ys={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Fd=Vt(ys),na=Ie({},ys,{view:0,detail:0}),u0=Vt(na),Cc,Rc,Ys,yu=Ie({},na,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Ud,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Ys&&(Ys&&t.type==="mousemove"?(Cc=t.screenX-Ys.screenX,Rc=t.screenY-Ys.screenY):Rc=Cc=0,Ys=t),Cc)},movementY:function(t){return"movementY"in t?t.movementY:Rc}}),gm=Vt(yu),c0=Ie({},yu,{dataTransfer:0}),h0=Vt(c0),d0=Ie({},na,{relatedTarget:0}),Pc=Vt(d0),f0=Ie({},ys,{animationName:0,elapsedTime:0,pseudoElement:0}),p0=Vt(f0),m0=Ie({},ys,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),g0=Vt(m0),y0=Ie({},ys,{data:0}),ym=Vt(y0),_0={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},v0={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},E0={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function T0(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=E0[t])?!!e[t]:!1}function Ud(){return T0}var w0=Ie({},na,{key:function(t){if(t.key){var e=_0[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=ul(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?v0[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Ud,charCode:function(t){return t.type==="keypress"?ul(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?ul(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),I0=Vt(w0),S0=Ie({},yu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),_m=Vt(S0),A0=Ie({},na,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Ud}),C0=Vt(A0),R0=Ie({},ys,{propertyName:0,elapsedTime:0,pseudoElement:0}),P0=Vt(R0),k0=Ie({},yu,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),N0=Vt(k0),V0=[9,13,27,32],jd=Rn&&"CompositionEvent"in window,fo=null;Rn&&"documentMode"in document&&(fo=document.documentMode);var D0=Rn&&"TextEvent"in window&&!fo,z_=Rn&&(!jd||fo&&8<fo&&11>=fo),vm=" ",Em=!1;function $_(t,e){switch(t){case"keyup":return V0.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function H_(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Vi=!1;function x0(t,e){switch(t){case"compositionend":return H_(e);case"keypress":return e.which!==32?null:(Em=!0,vm);case"textInput":return t=e.data,t===vm&&Em?null:t;default:return null}}function O0(t,e){if(Vi)return t==="compositionend"||!jd&&$_(t,e)?(t=B_(),ll=bd=sr=null,Vi=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return z_&&e.locale!=="ko"?null:e.data;default:return null}}var L0={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Tm(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!L0[t.type]:e==="textarea"}function W_(t,e,n,r){w_(r),e=xl(e,"onChange"),0<e.length&&(n=new Fd("onChange","change",null,n,r),t.push({event:n,listeners:e}))}var po=null,xo=null;function M0(t){nv(t,0)}function _u(t){var e=Oi(t);if(m_(e))return t}function b0(t,e){if(t==="change")return e}var q_=!1;if(Rn){var kc;if(Rn){var Nc="oninput"in document;if(!Nc){var wm=document.createElement("div");wm.setAttribute("oninput","return;"),Nc=typeof wm.oninput=="function"}kc=Nc}else kc=!1;q_=kc&&(!document.documentMode||9<document.documentMode)}function Im(){po&&(po.detachEvent("onpropertychange",K_),xo=po=null)}function K_(t){if(t.propertyName==="value"&&_u(xo)){var e=[];W_(e,xo,t,Dd(t)),C_(M0,e)}}function F0(t,e,n){t==="focusin"?(Im(),po=e,xo=n,po.attachEvent("onpropertychange",K_)):t==="focusout"&&Im()}function U0(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return _u(xo)}function j0(t,e){if(t==="click")return _u(e)}function B0(t,e){if(t==="input"||t==="change")return _u(e)}function z0(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Zt=typeof Object.is=="function"?Object.is:z0;function Oo(t,e){if(Zt(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),r=Object.keys(e);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!sh.call(e,i)||!Zt(t[i],e[i]))return!1}return!0}function Sm(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Am(t,e){var n=Sm(t);t=0;for(var r;n;){if(n.nodeType===3){if(r=t+n.textContent.length,t<=e&&r>=e)return{node:n,offset:e-t};t=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Sm(n)}}function G_(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?G_(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function Q_(){for(var t=window,e=Cl();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=Cl(t.document)}return e}function Bd(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function $0(t){var e=Q_(),n=t.focusedElem,r=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&G_(n.ownerDocument.documentElement,n)){if(r!==null&&Bd(n)){if(e=r.start,t=r.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var i=n.textContent.length,s=Math.min(r.start,i);r=r.end===void 0?s:Math.min(r.end,i),!t.extend&&s>r&&(i=r,r=s,s=i),i=Am(n,s);var o=Am(n,r);i&&o&&(t.rangeCount!==1||t.anchorNode!==i.node||t.anchorOffset!==i.offset||t.focusNode!==o.node||t.focusOffset!==o.offset)&&(e=e.createRange(),e.setStart(i.node,i.offset),t.removeAllRanges(),s>r?(t.addRange(e),t.extend(o.node,o.offset)):(e.setEnd(o.node,o.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var H0=Rn&&"documentMode"in document&&11>=document.documentMode,Di=null,Sh=null,mo=null,Ah=!1;function Cm(t,e,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Ah||Di==null||Di!==Cl(r)||(r=Di,"selectionStart"in r&&Bd(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),mo&&Oo(mo,r)||(mo=r,r=xl(Sh,"onSelect"),0<r.length&&(e=new Fd("onSelect","select",null,e,n),t.push({event:e,listeners:r}),e.target=Di)))}function Ha(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var xi={animationend:Ha("Animation","AnimationEnd"),animationiteration:Ha("Animation","AnimationIteration"),animationstart:Ha("Animation","AnimationStart"),transitionend:Ha("Transition","TransitionEnd")},Vc={},Y_={};Rn&&(Y_=document.createElement("div").style,"AnimationEvent"in window||(delete xi.animationend.animation,delete xi.animationiteration.animation,delete xi.animationstart.animation),"TransitionEvent"in window||delete xi.transitionend.transition);function vu(t){if(Vc[t])return Vc[t];if(!xi[t])return t;var e=xi[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in Y_)return Vc[t]=e[n];return t}var J_=vu("animationend"),X_=vu("animationiteration"),Z_=vu("animationstart"),ev=vu("transitionend"),tv=new Map,Rm="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function xr(t,e){tv.set(t,e),fi(e,[t])}for(var Dc=0;Dc<Rm.length;Dc++){var xc=Rm[Dc],W0=xc.toLowerCase(),q0=xc[0].toUpperCase()+xc.slice(1);xr(W0,"on"+q0)}xr(J_,"onAnimationEnd");xr(X_,"onAnimationIteration");xr(Z_,"onAnimationStart");xr("dblclick","onDoubleClick");xr("focusin","onFocus");xr("focusout","onBlur");xr(ev,"onTransitionEnd");es("onMouseEnter",["mouseout","mouseover"]);es("onMouseLeave",["mouseout","mouseover"]);es("onPointerEnter",["pointerout","pointerover"]);es("onPointerLeave",["pointerout","pointerover"]);fi("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));fi("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));fi("onBeforeInput",["compositionend","keypress","textInput","paste"]);fi("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));fi("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));fi("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var io="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),K0=new Set("cancel close invalid load scroll toggle".split(" ").concat(io));function Pm(t,e,n){var r=t.type||"unknown-event";t.currentTarget=n,WI(r,e,void 0,t),t.currentTarget=null}function nv(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var r=t[n],i=r.event;r=r.listeners;e:{var s=void 0;if(e)for(var o=r.length-1;0<=o;o--){var l=r[o],u=l.instance,h=l.currentTarget;if(l=l.listener,u!==s&&i.isPropagationStopped())break e;Pm(i,l,h),s=u}else for(o=0;o<r.length;o++){if(l=r[o],u=l.instance,h=l.currentTarget,l=l.listener,u!==s&&i.isPropagationStopped())break e;Pm(i,l,h),s=u}}}if(Pl)throw t=Eh,Pl=!1,Eh=null,t}function ge(t,e){var n=e[Nh];n===void 0&&(n=e[Nh]=new Set);var r=t+"__bubble";n.has(r)||(rv(e,t,2,!1),n.add(r))}function Oc(t,e,n){var r=0;e&&(r|=4),rv(n,t,r,e)}var Wa="_reactListening"+Math.random().toString(36).slice(2);function Lo(t){if(!t[Wa]){t[Wa]=!0,c_.forEach(function(n){n!=="selectionchange"&&(K0.has(n)||Oc(n,!1,t),Oc(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Wa]||(e[Wa]=!0,Oc("selectionchange",!1,e))}}function rv(t,e,n,r){switch(j_(e)){case 1:var i=a0;break;case 4:i=l0;break;default:i=Md}n=i.bind(null,e,n,t),i=void 0,!vh||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(i=!0),r?i!==void 0?t.addEventListener(e,n,{capture:!0,passive:i}):t.addEventListener(e,n,!0):i!==void 0?t.addEventListener(e,n,{passive:i}):t.addEventListener(e,n,!1)}function Lc(t,e,n,r,i){var s=r;if(!(e&1)&&!(e&2)&&r!==null)e:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var l=r.stateNode.containerInfo;if(l===i||l.nodeType===8&&l.parentNode===i)break;if(o===4)for(o=r.return;o!==null;){var u=o.tag;if((u===3||u===4)&&(u=o.stateNode.containerInfo,u===i||u.nodeType===8&&u.parentNode===i))return;o=o.return}for(;l!==null;){if(o=Qr(l),o===null)return;if(u=o.tag,u===5||u===6){r=s=o;continue e}l=l.parentNode}}r=r.return}C_(function(){var h=s,f=Dd(n),p=[];e:{var m=tv.get(t);if(m!==void 0){var A=Fd,R=t;switch(t){case"keypress":if(ul(n)===0)break e;case"keydown":case"keyup":A=I0;break;case"focusin":R="focus",A=Pc;break;case"focusout":R="blur",A=Pc;break;case"beforeblur":case"afterblur":A=Pc;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":A=gm;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":A=h0;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":A=C0;break;case J_:case X_:case Z_:A=p0;break;case ev:A=P0;break;case"scroll":A=u0;break;case"wheel":A=N0;break;case"copy":case"cut":case"paste":A=g0;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":A=_m}var V=(e&4)!==0,b=!V&&t==="scroll",I=V?m!==null?m+"Capture":null:m;V=[];for(var v=h,C;v!==null;){C=v;var L=C.stateNode;if(C.tag===5&&L!==null&&(C=L,I!==null&&(L=ko(v,I),L!=null&&V.push(Mo(v,L,C)))),b)break;v=v.return}0<V.length&&(m=new A(m,R,null,n,f),p.push({event:m,listeners:V}))}}if(!(e&7)){e:{if(m=t==="mouseover"||t==="pointerover",A=t==="mouseout"||t==="pointerout",m&&n!==yh&&(R=n.relatedTarget||n.fromElement)&&(Qr(R)||R[Pn]))break e;if((A||m)&&(m=f.window===f?f:(m=f.ownerDocument)?m.defaultView||m.parentWindow:window,A?(R=n.relatedTarget||n.toElement,A=h,R=R?Qr(R):null,R!==null&&(b=pi(R),R!==b||R.tag!==5&&R.tag!==6)&&(R=null)):(A=null,R=h),A!==R)){if(V=gm,L="onMouseLeave",I="onMouseEnter",v="mouse",(t==="pointerout"||t==="pointerover")&&(V=_m,L="onPointerLeave",I="onPointerEnter",v="pointer"),b=A==null?m:Oi(A),C=R==null?m:Oi(R),m=new V(L,v+"leave",A,n,f),m.target=b,m.relatedTarget=C,L=null,Qr(f)===h&&(V=new V(I,v+"enter",R,n,f),V.target=C,V.relatedTarget=b,L=V),b=L,A&&R)t:{for(V=A,I=R,v=0,C=V;C;C=Si(C))v++;for(C=0,L=I;L;L=Si(L))C++;for(;0<v-C;)V=Si(V),v--;for(;0<C-v;)I=Si(I),C--;for(;v--;){if(V===I||I!==null&&V===I.alternate)break t;V=Si(V),I=Si(I)}V=null}else V=null;A!==null&&km(p,m,A,V,!1),R!==null&&b!==null&&km(p,b,R,V,!0)}}e:{if(m=h?Oi(h):window,A=m.nodeName&&m.nodeName.toLowerCase(),A==="select"||A==="input"&&m.type==="file")var F=b0;else if(Tm(m))if(q_)F=B0;else{F=U0;var j=F0}else(A=m.nodeName)&&A.toLowerCase()==="input"&&(m.type==="checkbox"||m.type==="radio")&&(F=j0);if(F&&(F=F(t,h))){W_(p,F,n,f);break e}j&&j(t,m,h),t==="focusout"&&(j=m._wrapperState)&&j.controlled&&m.type==="number"&&dh(m,"number",m.value)}switch(j=h?Oi(h):window,t){case"focusin":(Tm(j)||j.contentEditable==="true")&&(Di=j,Sh=h,mo=null);break;case"focusout":mo=Sh=Di=null;break;case"mousedown":Ah=!0;break;case"contextmenu":case"mouseup":case"dragend":Ah=!1,Cm(p,n,f);break;case"selectionchange":if(H0)break;case"keydown":case"keyup":Cm(p,n,f)}var _;if(jd)e:{switch(t){case"compositionstart":var y="onCompositionStart";break e;case"compositionend":y="onCompositionEnd";break e;case"compositionupdate":y="onCompositionUpdate";break e}y=void 0}else Vi?$_(t,n)&&(y="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(y="onCompositionStart");y&&(z_&&n.locale!=="ko"&&(Vi||y!=="onCompositionStart"?y==="onCompositionEnd"&&Vi&&(_=B_()):(sr=f,bd="value"in sr?sr.value:sr.textContent,Vi=!0)),j=xl(h,y),0<j.length&&(y=new ym(y,t,null,n,f),p.push({event:y,listeners:j}),_?y.data=_:(_=H_(n),_!==null&&(y.data=_)))),(_=D0?x0(t,n):O0(t,n))&&(h=xl(h,"onBeforeInput"),0<h.length&&(f=new ym("onBeforeInput","beforeinput",null,n,f),p.push({event:f,listeners:h}),f.data=_))}nv(p,e)})}function Mo(t,e,n){return{instance:t,listener:e,currentTarget:n}}function xl(t,e){for(var n=e+"Capture",r=[];t!==null;){var i=t,s=i.stateNode;i.tag===5&&s!==null&&(i=s,s=ko(t,n),s!=null&&r.unshift(Mo(t,s,i)),s=ko(t,e),s!=null&&r.push(Mo(t,s,i))),t=t.return}return r}function Si(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function km(t,e,n,r,i){for(var s=e._reactName,o=[];n!==null&&n!==r;){var l=n,u=l.alternate,h=l.stateNode;if(u!==null&&u===r)break;l.tag===5&&h!==null&&(l=h,i?(u=ko(n,s),u!=null&&o.unshift(Mo(n,u,l))):i||(u=ko(n,s),u!=null&&o.push(Mo(n,u,l)))),n=n.return}o.length!==0&&t.push({event:e,listeners:o})}var G0=/\r\n?/g,Q0=/\u0000|\uFFFD/g;function Nm(t){return(typeof t=="string"?t:""+t).replace(G0,`
`).replace(Q0,"")}function qa(t,e,n){if(e=Nm(e),Nm(t)!==e&&n)throw Error(M(425))}function Ol(){}var Ch=null,Rh=null;function Ph(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var kh=typeof setTimeout=="function"?setTimeout:void 0,Y0=typeof clearTimeout=="function"?clearTimeout:void 0,Vm=typeof Promise=="function"?Promise:void 0,J0=typeof queueMicrotask=="function"?queueMicrotask:typeof Vm<"u"?function(t){return Vm.resolve(null).then(t).catch(X0)}:kh;function X0(t){setTimeout(function(){throw t})}function Mc(t,e){var n=e,r=0;do{var i=n.nextSibling;if(t.removeChild(n),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(r===0){t.removeChild(i),Do(e);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=i}while(n);Do(e)}function hr(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function Dm(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var _s=Math.random().toString(36).slice(2),un="__reactFiber$"+_s,bo="__reactProps$"+_s,Pn="__reactContainer$"+_s,Nh="__reactEvents$"+_s,Z0="__reactListeners$"+_s,eS="__reactHandles$"+_s;function Qr(t){var e=t[un];if(e)return e;for(var n=t.parentNode;n;){if(e=n[Pn]||n[un]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=Dm(t);t!==null;){if(n=t[un])return n;t=Dm(t)}return e}t=n,n=t.parentNode}return null}function ra(t){return t=t[un]||t[Pn],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function Oi(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(M(33))}function Eu(t){return t[bo]||null}var Vh=[],Li=-1;function Or(t){return{current:t}}function ye(t){0>Li||(t.current=Vh[Li],Vh[Li]=null,Li--)}function pe(t,e){Li++,Vh[Li]=t.current,t.current=e}var Ir={},st=Or(Ir),_t=Or(!1),ri=Ir;function ts(t,e){var n=t.type.contextTypes;if(!n)return Ir;var r=t.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===e)return r.__reactInternalMemoizedMaskedChildContext;var i={},s;for(s in n)i[s]=e[s];return r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=i),i}function vt(t){return t=t.childContextTypes,t!=null}function Ll(){ye(_t),ye(st)}function xm(t,e,n){if(st.current!==Ir)throw Error(M(168));pe(st,e),pe(_t,n)}function iv(t,e,n){var r=t.stateNode;if(e=e.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var i in r)if(!(i in e))throw Error(M(108,FI(t)||"Unknown",i));return Ie({},n,r)}function Ml(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||Ir,ri=st.current,pe(st,t),pe(_t,_t.current),!0}function Om(t,e,n){var r=t.stateNode;if(!r)throw Error(M(169));n?(t=iv(t,e,ri),r.__reactInternalMemoizedMergedChildContext=t,ye(_t),ye(st),pe(st,t)):ye(_t),pe(_t,n)}var En=null,Tu=!1,bc=!1;function sv(t){En===null?En=[t]:En.push(t)}function tS(t){Tu=!0,sv(t)}function Lr(){if(!bc&&En!==null){bc=!0;var t=0,e=ue;try{var n=En;for(ue=1;t<n.length;t++){var r=n[t];do r=r(!0);while(r!==null)}En=null,Tu=!1}catch(i){throw En!==null&&(En=En.slice(t+1)),N_(xd,Lr),i}finally{ue=e,bc=!1}}return null}var Mi=[],bi=0,bl=null,Fl=0,Lt=[],Mt=0,ii=null,Tn=1,wn="";function qr(t,e){Mi[bi++]=Fl,Mi[bi++]=bl,bl=t,Fl=e}function ov(t,e,n){Lt[Mt++]=Tn,Lt[Mt++]=wn,Lt[Mt++]=ii,ii=t;var r=Tn;t=wn;var i=32-Qt(r)-1;r&=~(1<<i),n+=1;var s=32-Qt(e)+i;if(30<s){var o=i-i%5;s=(r&(1<<o)-1).toString(32),r>>=o,i-=o,Tn=1<<32-Qt(e)+i|n<<i|r,wn=s+t}else Tn=1<<s|n<<i|r,wn=t}function zd(t){t.return!==null&&(qr(t,1),ov(t,1,0))}function $d(t){for(;t===bl;)bl=Mi[--bi],Mi[bi]=null,Fl=Mi[--bi],Mi[bi]=null;for(;t===ii;)ii=Lt[--Mt],Lt[Mt]=null,wn=Lt[--Mt],Lt[Mt]=null,Tn=Lt[--Mt],Lt[Mt]=null}var Pt=null,Ct=null,_e=!1,qt=null;function av(t,e){var n=bt(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function Lm(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,Pt=t,Ct=hr(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,Pt=t,Ct=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=ii!==null?{id:Tn,overflow:wn}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=bt(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,Pt=t,Ct=null,!0):!1;default:return!1}}function Dh(t){return(t.mode&1)!==0&&(t.flags&128)===0}function xh(t){if(_e){var e=Ct;if(e){var n=e;if(!Lm(t,e)){if(Dh(t))throw Error(M(418));e=hr(n.nextSibling);var r=Pt;e&&Lm(t,e)?av(r,n):(t.flags=t.flags&-4097|2,_e=!1,Pt=t)}}else{if(Dh(t))throw Error(M(418));t.flags=t.flags&-4097|2,_e=!1,Pt=t}}}function Mm(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;Pt=t}function Ka(t){if(t!==Pt)return!1;if(!_e)return Mm(t),_e=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!Ph(t.type,t.memoizedProps)),e&&(e=Ct)){if(Dh(t))throw lv(),Error(M(418));for(;e;)av(t,e),e=hr(e.nextSibling)}if(Mm(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(M(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){Ct=hr(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}Ct=null}}else Ct=Pt?hr(t.stateNode.nextSibling):null;return!0}function lv(){for(var t=Ct;t;)t=hr(t.nextSibling)}function ns(){Ct=Pt=null,_e=!1}function Hd(t){qt===null?qt=[t]:qt.push(t)}var nS=Mn.ReactCurrentBatchConfig;function Js(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(M(309));var r=n.stateNode}if(!r)throw Error(M(147,t));var i=r,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(o){var l=i.refs;o===null?delete l[s]:l[s]=o},e._stringRef=s,e)}if(typeof t!="string")throw Error(M(284));if(!n._owner)throw Error(M(290,t))}return t}function Ga(t,e){throw t=Object.prototype.toString.call(e),Error(M(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function bm(t){var e=t._init;return e(t._payload)}function uv(t){function e(I,v){if(t){var C=I.deletions;C===null?(I.deletions=[v],I.flags|=16):C.push(v)}}function n(I,v){if(!t)return null;for(;v!==null;)e(I,v),v=v.sibling;return null}function r(I,v){for(I=new Map;v!==null;)v.key!==null?I.set(v.key,v):I.set(v.index,v),v=v.sibling;return I}function i(I,v){return I=mr(I,v),I.index=0,I.sibling=null,I}function s(I,v,C){return I.index=C,t?(C=I.alternate,C!==null?(C=C.index,C<v?(I.flags|=2,v):C):(I.flags|=2,v)):(I.flags|=1048576,v)}function o(I){return t&&I.alternate===null&&(I.flags|=2),I}function l(I,v,C,L){return v===null||v.tag!==6?(v=Hc(C,I.mode,L),v.return=I,v):(v=i(v,C),v.return=I,v)}function u(I,v,C,L){var F=C.type;return F===Ni?f(I,v,C.props.children,L,C.key):v!==null&&(v.elementType===F||typeof F=="object"&&F!==null&&F.$$typeof===Jn&&bm(F)===v.type)?(L=i(v,C.props),L.ref=Js(I,v,C),L.return=I,L):(L=gl(C.type,C.key,C.props,null,I.mode,L),L.ref=Js(I,v,C),L.return=I,L)}function h(I,v,C,L){return v===null||v.tag!==4||v.stateNode.containerInfo!==C.containerInfo||v.stateNode.implementation!==C.implementation?(v=Wc(C,I.mode,L),v.return=I,v):(v=i(v,C.children||[]),v.return=I,v)}function f(I,v,C,L,F){return v===null||v.tag!==7?(v=ei(C,I.mode,L,F),v.return=I,v):(v=i(v,C),v.return=I,v)}function p(I,v,C){if(typeof v=="string"&&v!==""||typeof v=="number")return v=Hc(""+v,I.mode,C),v.return=I,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case ba:return C=gl(v.type,v.key,v.props,null,I.mode,C),C.ref=Js(I,null,v),C.return=I,C;case ki:return v=Wc(v,I.mode,C),v.return=I,v;case Jn:var L=v._init;return p(I,L(v._payload),C)}if(no(v)||qs(v))return v=ei(v,I.mode,C,null),v.return=I,v;Ga(I,v)}return null}function m(I,v,C,L){var F=v!==null?v.key:null;if(typeof C=="string"&&C!==""||typeof C=="number")return F!==null?null:l(I,v,""+C,L);if(typeof C=="object"&&C!==null){switch(C.$$typeof){case ba:return C.key===F?u(I,v,C,L):null;case ki:return C.key===F?h(I,v,C,L):null;case Jn:return F=C._init,m(I,v,F(C._payload),L)}if(no(C)||qs(C))return F!==null?null:f(I,v,C,L,null);Ga(I,C)}return null}function A(I,v,C,L,F){if(typeof L=="string"&&L!==""||typeof L=="number")return I=I.get(C)||null,l(v,I,""+L,F);if(typeof L=="object"&&L!==null){switch(L.$$typeof){case ba:return I=I.get(L.key===null?C:L.key)||null,u(v,I,L,F);case ki:return I=I.get(L.key===null?C:L.key)||null,h(v,I,L,F);case Jn:var j=L._init;return A(I,v,C,j(L._payload),F)}if(no(L)||qs(L))return I=I.get(C)||null,f(v,I,L,F,null);Ga(v,L)}return null}function R(I,v,C,L){for(var F=null,j=null,_=v,y=v=0,E=null;_!==null&&y<C.length;y++){_.index>y?(E=_,_=null):E=_.sibling;var w=m(I,_,C[y],L);if(w===null){_===null&&(_=E);break}t&&_&&w.alternate===null&&e(I,_),v=s(w,v,y),j===null?F=w:j.sibling=w,j=w,_=E}if(y===C.length)return n(I,_),_e&&qr(I,y),F;if(_===null){for(;y<C.length;y++)_=p(I,C[y],L),_!==null&&(v=s(_,v,y),j===null?F=_:j.sibling=_,j=_);return _e&&qr(I,y),F}for(_=r(I,_);y<C.length;y++)E=A(_,I,y,C[y],L),E!==null&&(t&&E.alternate!==null&&_.delete(E.key===null?y:E.key),v=s(E,v,y),j===null?F=E:j.sibling=E,j=E);return t&&_.forEach(function(S){return e(I,S)}),_e&&qr(I,y),F}function V(I,v,C,L){var F=qs(C);if(typeof F!="function")throw Error(M(150));if(C=F.call(C),C==null)throw Error(M(151));for(var j=F=null,_=v,y=v=0,E=null,w=C.next();_!==null&&!w.done;y++,w=C.next()){_.index>y?(E=_,_=null):E=_.sibling;var S=m(I,_,w.value,L);if(S===null){_===null&&(_=E);break}t&&_&&S.alternate===null&&e(I,_),v=s(S,v,y),j===null?F=S:j.sibling=S,j=S,_=E}if(w.done)return n(I,_),_e&&qr(I,y),F;if(_===null){for(;!w.done;y++,w=C.next())w=p(I,w.value,L),w!==null&&(v=s(w,v,y),j===null?F=w:j.sibling=w,j=w);return _e&&qr(I,y),F}for(_=r(I,_);!w.done;y++,w=C.next())w=A(_,I,y,w.value,L),w!==null&&(t&&w.alternate!==null&&_.delete(w.key===null?y:w.key),v=s(w,v,y),j===null?F=w:j.sibling=w,j=w);return t&&_.forEach(function(P){return e(I,P)}),_e&&qr(I,y),F}function b(I,v,C,L){if(typeof C=="object"&&C!==null&&C.type===Ni&&C.key===null&&(C=C.props.children),typeof C=="object"&&C!==null){switch(C.$$typeof){case ba:e:{for(var F=C.key,j=v;j!==null;){if(j.key===F){if(F=C.type,F===Ni){if(j.tag===7){n(I,j.sibling),v=i(j,C.props.children),v.return=I,I=v;break e}}else if(j.elementType===F||typeof F=="object"&&F!==null&&F.$$typeof===Jn&&bm(F)===j.type){n(I,j.sibling),v=i(j,C.props),v.ref=Js(I,j,C),v.return=I,I=v;break e}n(I,j);break}else e(I,j);j=j.sibling}C.type===Ni?(v=ei(C.props.children,I.mode,L,C.key),v.return=I,I=v):(L=gl(C.type,C.key,C.props,null,I.mode,L),L.ref=Js(I,v,C),L.return=I,I=L)}return o(I);case ki:e:{for(j=C.key;v!==null;){if(v.key===j)if(v.tag===4&&v.stateNode.containerInfo===C.containerInfo&&v.stateNode.implementation===C.implementation){n(I,v.sibling),v=i(v,C.children||[]),v.return=I,I=v;break e}else{n(I,v);break}else e(I,v);v=v.sibling}v=Wc(C,I.mode,L),v.return=I,I=v}return o(I);case Jn:return j=C._init,b(I,v,j(C._payload),L)}if(no(C))return R(I,v,C,L);if(qs(C))return V(I,v,C,L);Ga(I,C)}return typeof C=="string"&&C!==""||typeof C=="number"?(C=""+C,v!==null&&v.tag===6?(n(I,v.sibling),v=i(v,C),v.return=I,I=v):(n(I,v),v=Hc(C,I.mode,L),v.return=I,I=v),o(I)):n(I,v)}return b}var rs=uv(!0),cv=uv(!1),Ul=Or(null),jl=null,Fi=null,Wd=null;function qd(){Wd=Fi=jl=null}function Kd(t){var e=Ul.current;ye(Ul),t._currentValue=e}function Oh(t,e,n){for(;t!==null;){var r=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,r!==null&&(r.childLanes|=e)):r!==null&&(r.childLanes&e)!==e&&(r.childLanes|=e),t===n)break;t=t.return}}function Ki(t,e){jl=t,Wd=Fi=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(yt=!0),t.firstContext=null)}function Bt(t){var e=t._currentValue;if(Wd!==t)if(t={context:t,memoizedValue:e,next:null},Fi===null){if(jl===null)throw Error(M(308));Fi=t,jl.dependencies={lanes:0,firstContext:t}}else Fi=Fi.next=t;return e}var Yr=null;function Gd(t){Yr===null?Yr=[t]:Yr.push(t)}function hv(t,e,n,r){var i=e.interleaved;return i===null?(n.next=n,Gd(e)):(n.next=i.next,i.next=n),e.interleaved=n,kn(t,r)}function kn(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var Xn=!1;function Qd(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function dv(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function An(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function dr(t,e,n){var r=t.updateQueue;if(r===null)return null;if(r=r.shared,ae&2){var i=r.pending;return i===null?e.next=e:(e.next=i.next,i.next=e),r.pending=e,kn(t,n)}return i=r.interleaved,i===null?(e.next=e,Gd(r)):(e.next=i.next,i.next=e),r.interleaved=e,kn(t,n)}function cl(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,Od(t,n)}}function Fm(t,e){var n=t.updateQueue,r=t.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var o={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?i=s=o:s=s.next=o,n=n.next}while(n!==null);s===null?i=s=e:s=s.next=e}else i=s=e;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:s,shared:r.shared,effects:r.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function Bl(t,e,n,r){var i=t.updateQueue;Xn=!1;var s=i.firstBaseUpdate,o=i.lastBaseUpdate,l=i.shared.pending;if(l!==null){i.shared.pending=null;var u=l,h=u.next;u.next=null,o===null?s=h:o.next=h,o=u;var f=t.alternate;f!==null&&(f=f.updateQueue,l=f.lastBaseUpdate,l!==o&&(l===null?f.firstBaseUpdate=h:l.next=h,f.lastBaseUpdate=u))}if(s!==null){var p=i.baseState;o=0,f=h=u=null,l=s;do{var m=l.lane,A=l.eventTime;if((r&m)===m){f!==null&&(f=f.next={eventTime:A,lane:0,tag:l.tag,payload:l.payload,callback:l.callback,next:null});e:{var R=t,V=l;switch(m=e,A=n,V.tag){case 1:if(R=V.payload,typeof R=="function"){p=R.call(A,p,m);break e}p=R;break e;case 3:R.flags=R.flags&-65537|128;case 0:if(R=V.payload,m=typeof R=="function"?R.call(A,p,m):R,m==null)break e;p=Ie({},p,m);break e;case 2:Xn=!0}}l.callback!==null&&l.lane!==0&&(t.flags|=64,m=i.effects,m===null?i.effects=[l]:m.push(l))}else A={eventTime:A,lane:m,tag:l.tag,payload:l.payload,callback:l.callback,next:null},f===null?(h=f=A,u=p):f=f.next=A,o|=m;if(l=l.next,l===null){if(l=i.shared.pending,l===null)break;m=l,l=m.next,m.next=null,i.lastBaseUpdate=m,i.shared.pending=null}}while(!0);if(f===null&&(u=p),i.baseState=u,i.firstBaseUpdate=h,i.lastBaseUpdate=f,e=i.shared.interleaved,e!==null){i=e;do o|=i.lane,i=i.next;while(i!==e)}else s===null&&(i.shared.lanes=0);oi|=o,t.lanes=o,t.memoizedState=p}}function Um(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var r=t[e],i=r.callback;if(i!==null){if(r.callback=null,r=n,typeof i!="function")throw Error(M(191,i));i.call(r)}}}var ia={},hn=Or(ia),Fo=Or(ia),Uo=Or(ia);function Jr(t){if(t===ia)throw Error(M(174));return t}function Yd(t,e){switch(pe(Uo,e),pe(Fo,t),pe(hn,ia),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:ph(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=ph(e,t)}ye(hn),pe(hn,e)}function is(){ye(hn),ye(Fo),ye(Uo)}function fv(t){Jr(Uo.current);var e=Jr(hn.current),n=ph(e,t.type);e!==n&&(pe(Fo,t),pe(hn,n))}function Jd(t){Fo.current===t&&(ye(hn),ye(Fo))}var Te=Or(0);function zl(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var Fc=[];function Xd(){for(var t=0;t<Fc.length;t++)Fc[t]._workInProgressVersionPrimary=null;Fc.length=0}var hl=Mn.ReactCurrentDispatcher,Uc=Mn.ReactCurrentBatchConfig,si=0,we=null,be=null,$e=null,$l=!1,go=!1,jo=0,rS=0;function Ze(){throw Error(M(321))}function Zd(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Zt(t[n],e[n]))return!1;return!0}function ef(t,e,n,r,i,s){if(si=s,we=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,hl.current=t===null||t.memoizedState===null?aS:lS,t=n(r,i),go){s=0;do{if(go=!1,jo=0,25<=s)throw Error(M(301));s+=1,$e=be=null,e.updateQueue=null,hl.current=uS,t=n(r,i)}while(go)}if(hl.current=Hl,e=be!==null&&be.next!==null,si=0,$e=be=we=null,$l=!1,e)throw Error(M(300));return t}function tf(){var t=jo!==0;return jo=0,t}function an(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return $e===null?we.memoizedState=$e=t:$e=$e.next=t,$e}function zt(){if(be===null){var t=we.alternate;t=t!==null?t.memoizedState:null}else t=be.next;var e=$e===null?we.memoizedState:$e.next;if(e!==null)$e=e,be=t;else{if(t===null)throw Error(M(310));be=t,t={memoizedState:be.memoizedState,baseState:be.baseState,baseQueue:be.baseQueue,queue:be.queue,next:null},$e===null?we.memoizedState=$e=t:$e=$e.next=t}return $e}function Bo(t,e){return typeof e=="function"?e(t):e}function jc(t){var e=zt(),n=e.queue;if(n===null)throw Error(M(311));n.lastRenderedReducer=t;var r=be,i=r.baseQueue,s=n.pending;if(s!==null){if(i!==null){var o=i.next;i.next=s.next,s.next=o}r.baseQueue=i=s,n.pending=null}if(i!==null){s=i.next,r=r.baseState;var l=o=null,u=null,h=s;do{var f=h.lane;if((si&f)===f)u!==null&&(u=u.next={lane:0,action:h.action,hasEagerState:h.hasEagerState,eagerState:h.eagerState,next:null}),r=h.hasEagerState?h.eagerState:t(r,h.action);else{var p={lane:f,action:h.action,hasEagerState:h.hasEagerState,eagerState:h.eagerState,next:null};u===null?(l=u=p,o=r):u=u.next=p,we.lanes|=f,oi|=f}h=h.next}while(h!==null&&h!==s);u===null?o=r:u.next=l,Zt(r,e.memoizedState)||(yt=!0),e.memoizedState=r,e.baseState=o,e.baseQueue=u,n.lastRenderedState=r}if(t=n.interleaved,t!==null){i=t;do s=i.lane,we.lanes|=s,oi|=s,i=i.next;while(i!==t)}else i===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function Bc(t){var e=zt(),n=e.queue;if(n===null)throw Error(M(311));n.lastRenderedReducer=t;var r=n.dispatch,i=n.pending,s=e.memoizedState;if(i!==null){n.pending=null;var o=i=i.next;do s=t(s,o.action),o=o.next;while(o!==i);Zt(s,e.memoizedState)||(yt=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,r]}function pv(){}function mv(t,e){var n=we,r=zt(),i=e(),s=!Zt(r.memoizedState,i);if(s&&(r.memoizedState=i,yt=!0),r=r.queue,nf(_v.bind(null,n,r,t),[t]),r.getSnapshot!==e||s||$e!==null&&$e.memoizedState.tag&1){if(n.flags|=2048,zo(9,yv.bind(null,n,r,i,e),void 0,null),We===null)throw Error(M(349));si&30||gv(n,e,i)}return i}function gv(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=we.updateQueue,e===null?(e={lastEffect:null,stores:null},we.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function yv(t,e,n,r){e.value=n,e.getSnapshot=r,vv(e)&&Ev(t)}function _v(t,e,n){return n(function(){vv(e)&&Ev(t)})}function vv(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Zt(t,n)}catch{return!0}}function Ev(t){var e=kn(t,1);e!==null&&Yt(e,t,1,-1)}function jm(t){var e=an();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Bo,lastRenderedState:t},e.queue=t,t=t.dispatch=oS.bind(null,we,t),[e.memoizedState,t]}function zo(t,e,n,r){return t={tag:t,create:e,destroy:n,deps:r,next:null},e=we.updateQueue,e===null?(e={lastEffect:null,stores:null},we.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(r=n.next,n.next=t,t.next=r,e.lastEffect=t)),t}function Tv(){return zt().memoizedState}function dl(t,e,n,r){var i=an();we.flags|=t,i.memoizedState=zo(1|e,n,void 0,r===void 0?null:r)}function wu(t,e,n,r){var i=zt();r=r===void 0?null:r;var s=void 0;if(be!==null){var o=be.memoizedState;if(s=o.destroy,r!==null&&Zd(r,o.deps)){i.memoizedState=zo(e,n,s,r);return}}we.flags|=t,i.memoizedState=zo(1|e,n,s,r)}function Bm(t,e){return dl(8390656,8,t,e)}function nf(t,e){return wu(2048,8,t,e)}function wv(t,e){return wu(4,2,t,e)}function Iv(t,e){return wu(4,4,t,e)}function Sv(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Av(t,e,n){return n=n!=null?n.concat([t]):null,wu(4,4,Sv.bind(null,e,t),n)}function rf(){}function Cv(t,e){var n=zt();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&Zd(e,r[1])?r[0]:(n.memoizedState=[t,e],t)}function Rv(t,e){var n=zt();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&Zd(e,r[1])?r[0]:(t=t(),n.memoizedState=[t,e],t)}function Pv(t,e,n){return si&21?(Zt(n,e)||(n=x_(),we.lanes|=n,oi|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,yt=!0),t.memoizedState=n)}function iS(t,e){var n=ue;ue=n!==0&&4>n?n:4,t(!0);var r=Uc.transition;Uc.transition={};try{t(!1),e()}finally{ue=n,Uc.transition=r}}function kv(){return zt().memoizedState}function sS(t,e,n){var r=pr(t);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},Nv(t))Vv(e,n);else if(n=hv(t,e,n,r),n!==null){var i=ut();Yt(n,t,r,i),Dv(n,e,r)}}function oS(t,e,n){var r=pr(t),i={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(Nv(t))Vv(e,i);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var o=e.lastRenderedState,l=s(o,n);if(i.hasEagerState=!0,i.eagerState=l,Zt(l,o)){var u=e.interleaved;u===null?(i.next=i,Gd(e)):(i.next=u.next,u.next=i),e.interleaved=i;return}}catch{}finally{}n=hv(t,e,i,r),n!==null&&(i=ut(),Yt(n,t,r,i),Dv(n,e,r))}}function Nv(t){var e=t.alternate;return t===we||e!==null&&e===we}function Vv(t,e){go=$l=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function Dv(t,e,n){if(n&4194240){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,Od(t,n)}}var Hl={readContext:Bt,useCallback:Ze,useContext:Ze,useEffect:Ze,useImperativeHandle:Ze,useInsertionEffect:Ze,useLayoutEffect:Ze,useMemo:Ze,useReducer:Ze,useRef:Ze,useState:Ze,useDebugValue:Ze,useDeferredValue:Ze,useTransition:Ze,useMutableSource:Ze,useSyncExternalStore:Ze,useId:Ze,unstable_isNewReconciler:!1},aS={readContext:Bt,useCallback:function(t,e){return an().memoizedState=[t,e===void 0?null:e],t},useContext:Bt,useEffect:Bm,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,dl(4194308,4,Sv.bind(null,e,t),n)},useLayoutEffect:function(t,e){return dl(4194308,4,t,e)},useInsertionEffect:function(t,e){return dl(4,2,t,e)},useMemo:function(t,e){var n=an();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var r=an();return e=n!==void 0?n(e):e,r.memoizedState=r.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},r.queue=t,t=t.dispatch=sS.bind(null,we,t),[r.memoizedState,t]},useRef:function(t){var e=an();return t={current:t},e.memoizedState=t},useState:jm,useDebugValue:rf,useDeferredValue:function(t){return an().memoizedState=t},useTransition:function(){var t=jm(!1),e=t[0];return t=iS.bind(null,t[1]),an().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var r=we,i=an();if(_e){if(n===void 0)throw Error(M(407));n=n()}else{if(n=e(),We===null)throw Error(M(349));si&30||gv(r,e,n)}i.memoizedState=n;var s={value:n,getSnapshot:e};return i.queue=s,Bm(_v.bind(null,r,s,t),[t]),r.flags|=2048,zo(9,yv.bind(null,r,s,n,e),void 0,null),n},useId:function(){var t=an(),e=We.identifierPrefix;if(_e){var n=wn,r=Tn;n=(r&~(1<<32-Qt(r)-1)).toString(32)+n,e=":"+e+"R"+n,n=jo++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=rS++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},lS={readContext:Bt,useCallback:Cv,useContext:Bt,useEffect:nf,useImperativeHandle:Av,useInsertionEffect:wv,useLayoutEffect:Iv,useMemo:Rv,useReducer:jc,useRef:Tv,useState:function(){return jc(Bo)},useDebugValue:rf,useDeferredValue:function(t){var e=zt();return Pv(e,be.memoizedState,t)},useTransition:function(){var t=jc(Bo)[0],e=zt().memoizedState;return[t,e]},useMutableSource:pv,useSyncExternalStore:mv,useId:kv,unstable_isNewReconciler:!1},uS={readContext:Bt,useCallback:Cv,useContext:Bt,useEffect:nf,useImperativeHandle:Av,useInsertionEffect:wv,useLayoutEffect:Iv,useMemo:Rv,useReducer:Bc,useRef:Tv,useState:function(){return Bc(Bo)},useDebugValue:rf,useDeferredValue:function(t){var e=zt();return be===null?e.memoizedState=t:Pv(e,be.memoizedState,t)},useTransition:function(){var t=Bc(Bo)[0],e=zt().memoizedState;return[t,e]},useMutableSource:pv,useSyncExternalStore:mv,useId:kv,unstable_isNewReconciler:!1};function Ht(t,e){if(t&&t.defaultProps){e=Ie({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function Lh(t,e,n,r){e=t.memoizedState,n=n(r,e),n=n==null?e:Ie({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Iu={isMounted:function(t){return(t=t._reactInternals)?pi(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var r=ut(),i=pr(t),s=An(r,i);s.payload=e,n!=null&&(s.callback=n),e=dr(t,s,i),e!==null&&(Yt(e,t,i,r),cl(e,t,i))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var r=ut(),i=pr(t),s=An(r,i);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=dr(t,s,i),e!==null&&(Yt(e,t,i,r),cl(e,t,i))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=ut(),r=pr(t),i=An(n,r);i.tag=2,e!=null&&(i.callback=e),e=dr(t,i,r),e!==null&&(Yt(e,t,r,n),cl(e,t,r))}};function zm(t,e,n,r,i,s,o){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(r,s,o):e.prototype&&e.prototype.isPureReactComponent?!Oo(n,r)||!Oo(i,s):!0}function xv(t,e,n){var r=!1,i=Ir,s=e.contextType;return typeof s=="object"&&s!==null?s=Bt(s):(i=vt(e)?ri:st.current,r=e.contextTypes,s=(r=r!=null)?ts(t,i):Ir),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=Iu,t.stateNode=e,e._reactInternals=t,r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=i,t.__reactInternalMemoizedMaskedChildContext=s),e}function $m(t,e,n,r){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,r),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,r),e.state!==t&&Iu.enqueueReplaceState(e,e.state,null)}function Mh(t,e,n,r){var i=t.stateNode;i.props=n,i.state=t.memoizedState,i.refs={},Qd(t);var s=e.contextType;typeof s=="object"&&s!==null?i.context=Bt(s):(s=vt(e)?ri:st.current,i.context=ts(t,s)),i.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(Lh(t,e,s,n),i.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(e=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),e!==i.state&&Iu.enqueueReplaceState(i,i.state,null),Bl(t,n,i,r),i.state=t.memoizedState),typeof i.componentDidMount=="function"&&(t.flags|=4194308)}function ss(t,e){try{var n="",r=e;do n+=bI(r),r=r.return;while(r);var i=n}catch(s){i=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:i,digest:null}}function zc(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function bh(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var cS=typeof WeakMap=="function"?WeakMap:Map;function Ov(t,e,n){n=An(-1,n),n.tag=3,n.payload={element:null};var r=e.value;return n.callback=function(){ql||(ql=!0,Kh=r),bh(t,e)},n}function Lv(t,e,n){n=An(-1,n),n.tag=3;var r=t.type.getDerivedStateFromError;if(typeof r=="function"){var i=e.value;n.payload=function(){return r(i)},n.callback=function(){bh(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){bh(t,e),typeof r!="function"&&(fr===null?fr=new Set([this]):fr.add(this));var o=e.stack;this.componentDidCatch(e.value,{componentStack:o!==null?o:""})}),n}function Hm(t,e,n){var r=t.pingCache;if(r===null){r=t.pingCache=new cS;var i=new Set;r.set(e,i)}else i=r.get(e),i===void 0&&(i=new Set,r.set(e,i));i.has(n)||(i.add(n),t=SS.bind(null,t,e,n),e.then(t,t))}function Wm(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function qm(t,e,n,r,i){return t.mode&1?(t.flags|=65536,t.lanes=i,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=An(-1,1),e.tag=2,dr(n,e,1))),n.lanes|=1),t)}var hS=Mn.ReactCurrentOwner,yt=!1;function lt(t,e,n,r){e.child=t===null?cv(e,null,n,r):rs(e,t.child,n,r)}function Km(t,e,n,r,i){n=n.render;var s=e.ref;return Ki(e,i),r=ef(t,e,n,r,s,i),n=tf(),t!==null&&!yt?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i,Nn(t,e,i)):(_e&&n&&zd(e),e.flags|=1,lt(t,e,r,i),e.child)}function Gm(t,e,n,r,i){if(t===null){var s=n.type;return typeof s=="function"&&!df(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,Mv(t,e,s,r,i)):(t=gl(n.type,null,r,e,e.mode,i),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&i)){var o=s.memoizedProps;if(n=n.compare,n=n!==null?n:Oo,n(o,r)&&t.ref===e.ref)return Nn(t,e,i)}return e.flags|=1,t=mr(s,r),t.ref=e.ref,t.return=e,e.child=t}function Mv(t,e,n,r,i){if(t!==null){var s=t.memoizedProps;if(Oo(s,r)&&t.ref===e.ref)if(yt=!1,e.pendingProps=r=s,(t.lanes&i)!==0)t.flags&131072&&(yt=!0);else return e.lanes=t.lanes,Nn(t,e,i)}return Fh(t,e,n,r,i)}function bv(t,e,n){var r=e.pendingProps,i=r.children,s=t!==null?t.memoizedState:null;if(r.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},pe(ji,St),St|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,pe(ji,St),St|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=s!==null?s.baseLanes:n,pe(ji,St),St|=r}else s!==null?(r=s.baseLanes|n,e.memoizedState=null):r=n,pe(ji,St),St|=r;return lt(t,e,i,n),e.child}function Fv(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function Fh(t,e,n,r,i){var s=vt(n)?ri:st.current;return s=ts(e,s),Ki(e,i),n=ef(t,e,n,r,s,i),r=tf(),t!==null&&!yt?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i,Nn(t,e,i)):(_e&&r&&zd(e),e.flags|=1,lt(t,e,n,i),e.child)}function Qm(t,e,n,r,i){if(vt(n)){var s=!0;Ml(e)}else s=!1;if(Ki(e,i),e.stateNode===null)fl(t,e),xv(e,n,r),Mh(e,n,r,i),r=!0;else if(t===null){var o=e.stateNode,l=e.memoizedProps;o.props=l;var u=o.context,h=n.contextType;typeof h=="object"&&h!==null?h=Bt(h):(h=vt(n)?ri:st.current,h=ts(e,h));var f=n.getDerivedStateFromProps,p=typeof f=="function"||typeof o.getSnapshotBeforeUpdate=="function";p||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==r||u!==h)&&$m(e,o,r,h),Xn=!1;var m=e.memoizedState;o.state=m,Bl(e,r,o,i),u=e.memoizedState,l!==r||m!==u||_t.current||Xn?(typeof f=="function"&&(Lh(e,n,f,r),u=e.memoizedState),(l=Xn||zm(e,n,l,r,m,u,h))?(p||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(e.flags|=4194308)):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=r,e.memoizedState=u),o.props=r,o.state=u,o.context=h,r=l):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),r=!1)}else{o=e.stateNode,dv(t,e),l=e.memoizedProps,h=e.type===e.elementType?l:Ht(e.type,l),o.props=h,p=e.pendingProps,m=o.context,u=n.contextType,typeof u=="object"&&u!==null?u=Bt(u):(u=vt(n)?ri:st.current,u=ts(e,u));var A=n.getDerivedStateFromProps;(f=typeof A=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==p||m!==u)&&$m(e,o,r,u),Xn=!1,m=e.memoizedState,o.state=m,Bl(e,r,o,i);var R=e.memoizedState;l!==p||m!==R||_t.current||Xn?(typeof A=="function"&&(Lh(e,n,A,r),R=e.memoizedState),(h=Xn||zm(e,n,h,r,m,R,u)||!1)?(f||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(r,R,u),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(r,R,u)),typeof o.componentDidUpdate=="function"&&(e.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),e.memoizedProps=r,e.memoizedState=R),o.props=r,o.state=R,o.context=u,r=h):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),r=!1)}return Uh(t,e,n,r,s,i)}function Uh(t,e,n,r,i,s){Fv(t,e);var o=(e.flags&128)!==0;if(!r&&!o)return i&&Om(e,n,!1),Nn(t,e,s);r=e.stateNode,hS.current=e;var l=o&&typeof n.getDerivedStateFromError!="function"?null:r.render();return e.flags|=1,t!==null&&o?(e.child=rs(e,t.child,null,s),e.child=rs(e,null,l,s)):lt(t,e,l,s),e.memoizedState=r.state,i&&Om(e,n,!0),e.child}function Uv(t){var e=t.stateNode;e.pendingContext?xm(t,e.pendingContext,e.pendingContext!==e.context):e.context&&xm(t,e.context,!1),Yd(t,e.containerInfo)}function Ym(t,e,n,r,i){return ns(),Hd(i),e.flags|=256,lt(t,e,n,r),e.child}var jh={dehydrated:null,treeContext:null,retryLane:0};function Bh(t){return{baseLanes:t,cachePool:null,transitions:null}}function jv(t,e,n){var r=e.pendingProps,i=Te.current,s=!1,o=(e.flags&128)!==0,l;if((l=o)||(l=t!==null&&t.memoizedState===null?!1:(i&2)!==0),l?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(i|=1),pe(Te,i&1),t===null)return xh(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(o=r.children,t=r.fallback,s?(r=e.mode,s=e.child,o={mode:"hidden",children:o},!(r&1)&&s!==null?(s.childLanes=0,s.pendingProps=o):s=Cu(o,r,0,null),t=ei(t,r,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=Bh(n),e.memoizedState=jh,t):sf(e,o));if(i=t.memoizedState,i!==null&&(l=i.dehydrated,l!==null))return dS(t,e,o,r,l,i,n);if(s){s=r.fallback,o=e.mode,i=t.child,l=i.sibling;var u={mode:"hidden",children:r.children};return!(o&1)&&e.child!==i?(r=e.child,r.childLanes=0,r.pendingProps=u,e.deletions=null):(r=mr(i,u),r.subtreeFlags=i.subtreeFlags&14680064),l!==null?s=mr(l,s):(s=ei(s,o,n,null),s.flags|=2),s.return=e,r.return=e,r.sibling=s,e.child=r,r=s,s=e.child,o=t.child.memoizedState,o=o===null?Bh(n):{baseLanes:o.baseLanes|n,cachePool:null,transitions:o.transitions},s.memoizedState=o,s.childLanes=t.childLanes&~n,e.memoizedState=jh,r}return s=t.child,t=s.sibling,r=mr(s,{mode:"visible",children:r.children}),!(e.mode&1)&&(r.lanes=n),r.return=e,r.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=r,e.memoizedState=null,r}function sf(t,e){return e=Cu({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function Qa(t,e,n,r){return r!==null&&Hd(r),rs(e,t.child,null,n),t=sf(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function dS(t,e,n,r,i,s,o){if(n)return e.flags&256?(e.flags&=-257,r=zc(Error(M(422))),Qa(t,e,o,r)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=r.fallback,i=e.mode,r=Cu({mode:"visible",children:r.children},i,0,null),s=ei(s,i,o,null),s.flags|=2,r.return=e,s.return=e,r.sibling=s,e.child=r,e.mode&1&&rs(e,t.child,null,o),e.child.memoizedState=Bh(o),e.memoizedState=jh,s);if(!(e.mode&1))return Qa(t,e,o,null);if(i.data==="$!"){if(r=i.nextSibling&&i.nextSibling.dataset,r)var l=r.dgst;return r=l,s=Error(M(419)),r=zc(s,r,void 0),Qa(t,e,o,r)}if(l=(o&t.childLanes)!==0,yt||l){if(r=We,r!==null){switch(o&-o){case 4:i=2;break;case 16:i=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:i=32;break;case 536870912:i=268435456;break;default:i=0}i=i&(r.suspendedLanes|o)?0:i,i!==0&&i!==s.retryLane&&(s.retryLane=i,kn(t,i),Yt(r,t,i,-1))}return hf(),r=zc(Error(M(421))),Qa(t,e,o,r)}return i.data==="$?"?(e.flags|=128,e.child=t.child,e=AS.bind(null,t),i._reactRetry=e,null):(t=s.treeContext,Ct=hr(i.nextSibling),Pt=e,_e=!0,qt=null,t!==null&&(Lt[Mt++]=Tn,Lt[Mt++]=wn,Lt[Mt++]=ii,Tn=t.id,wn=t.overflow,ii=e),e=sf(e,r.children),e.flags|=4096,e)}function Jm(t,e,n){t.lanes|=e;var r=t.alternate;r!==null&&(r.lanes|=e),Oh(t.return,e,n)}function $c(t,e,n,r,i){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=r,s.tail=n,s.tailMode=i)}function Bv(t,e,n){var r=e.pendingProps,i=r.revealOrder,s=r.tail;if(lt(t,e,r.children,n),r=Te.current,r&2)r=r&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Jm(t,n,e);else if(t.tag===19)Jm(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}r&=1}if(pe(Te,r),!(e.mode&1))e.memoizedState=null;else switch(i){case"forwards":for(n=e.child,i=null;n!==null;)t=n.alternate,t!==null&&zl(t)===null&&(i=n),n=n.sibling;n=i,n===null?(i=e.child,e.child=null):(i=n.sibling,n.sibling=null),$c(e,!1,i,n,s);break;case"backwards":for(n=null,i=e.child,e.child=null;i!==null;){if(t=i.alternate,t!==null&&zl(t)===null){e.child=i;break}t=i.sibling,i.sibling=n,n=i,i=t}$c(e,!0,n,null,s);break;case"together":$c(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function fl(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function Nn(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),oi|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(M(153));if(e.child!==null){for(t=e.child,n=mr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=mr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function fS(t,e,n){switch(e.tag){case 3:Uv(e),ns();break;case 5:fv(e);break;case 1:vt(e.type)&&Ml(e);break;case 4:Yd(e,e.stateNode.containerInfo);break;case 10:var r=e.type._context,i=e.memoizedProps.value;pe(Ul,r._currentValue),r._currentValue=i;break;case 13:if(r=e.memoizedState,r!==null)return r.dehydrated!==null?(pe(Te,Te.current&1),e.flags|=128,null):n&e.child.childLanes?jv(t,e,n):(pe(Te,Te.current&1),t=Nn(t,e,n),t!==null?t.sibling:null);pe(Te,Te.current&1);break;case 19:if(r=(n&e.childLanes)!==0,t.flags&128){if(r)return Bv(t,e,n);e.flags|=128}if(i=e.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),pe(Te,Te.current),r)break;return null;case 22:case 23:return e.lanes=0,bv(t,e,n)}return Nn(t,e,n)}var zv,zh,$v,Hv;zv=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};zh=function(){};$v=function(t,e,n,r){var i=t.memoizedProps;if(i!==r){t=e.stateNode,Jr(hn.current);var s=null;switch(n){case"input":i=ch(t,i),r=ch(t,r),s=[];break;case"select":i=Ie({},i,{value:void 0}),r=Ie({},r,{value:void 0}),s=[];break;case"textarea":i=fh(t,i),r=fh(t,r),s=[];break;default:typeof i.onClick!="function"&&typeof r.onClick=="function"&&(t.onclick=Ol)}mh(n,r);var o;n=null;for(h in i)if(!r.hasOwnProperty(h)&&i.hasOwnProperty(h)&&i[h]!=null)if(h==="style"){var l=i[h];for(o in l)l.hasOwnProperty(o)&&(n||(n={}),n[o]="")}else h!=="dangerouslySetInnerHTML"&&h!=="children"&&h!=="suppressContentEditableWarning"&&h!=="suppressHydrationWarning"&&h!=="autoFocus"&&(Ro.hasOwnProperty(h)?s||(s=[]):(s=s||[]).push(h,null));for(h in r){var u=r[h];if(l=i!=null?i[h]:void 0,r.hasOwnProperty(h)&&u!==l&&(u!=null||l!=null))if(h==="style")if(l){for(o in l)!l.hasOwnProperty(o)||u&&u.hasOwnProperty(o)||(n||(n={}),n[o]="");for(o in u)u.hasOwnProperty(o)&&l[o]!==u[o]&&(n||(n={}),n[o]=u[o])}else n||(s||(s=[]),s.push(h,n)),n=u;else h==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,l=l?l.__html:void 0,u!=null&&l!==u&&(s=s||[]).push(h,u)):h==="children"?typeof u!="string"&&typeof u!="number"||(s=s||[]).push(h,""+u):h!=="suppressContentEditableWarning"&&h!=="suppressHydrationWarning"&&(Ro.hasOwnProperty(h)?(u!=null&&h==="onScroll"&&ge("scroll",t),s||l===u||(s=[])):(s=s||[]).push(h,u))}n&&(s=s||[]).push("style",n);var h=s;(e.updateQueue=h)&&(e.flags|=4)}};Hv=function(t,e,n,r){n!==r&&(e.flags|=4)};function Xs(t,e){if(!_e)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:r.sibling=null}}function et(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,r=0;if(e)for(var i=t.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&14680064,r|=i.flags&14680064,i.return=t,i=i.sibling;else for(i=t.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=t,i=i.sibling;return t.subtreeFlags|=r,t.childLanes=n,e}function pS(t,e,n){var r=e.pendingProps;switch($d(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return et(e),null;case 1:return vt(e.type)&&Ll(),et(e),null;case 3:return r=e.stateNode,is(),ye(_t),ye(st),Xd(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(t===null||t.child===null)&&(Ka(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,qt!==null&&(Yh(qt),qt=null))),zh(t,e),et(e),null;case 5:Jd(e);var i=Jr(Uo.current);if(n=e.type,t!==null&&e.stateNode!=null)$v(t,e,n,r,i),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!r){if(e.stateNode===null)throw Error(M(166));return et(e),null}if(t=Jr(hn.current),Ka(e)){r=e.stateNode,n=e.type;var s=e.memoizedProps;switch(r[un]=e,r[bo]=s,t=(e.mode&1)!==0,n){case"dialog":ge("cancel",r),ge("close",r);break;case"iframe":case"object":case"embed":ge("load",r);break;case"video":case"audio":for(i=0;i<io.length;i++)ge(io[i],r);break;case"source":ge("error",r);break;case"img":case"image":case"link":ge("error",r),ge("load",r);break;case"details":ge("toggle",r);break;case"input":om(r,s),ge("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!s.multiple},ge("invalid",r);break;case"textarea":lm(r,s),ge("invalid",r)}mh(n,s),i=null;for(var o in s)if(s.hasOwnProperty(o)){var l=s[o];o==="children"?typeof l=="string"?r.textContent!==l&&(s.suppressHydrationWarning!==!0&&qa(r.textContent,l,t),i=["children",l]):typeof l=="number"&&r.textContent!==""+l&&(s.suppressHydrationWarning!==!0&&qa(r.textContent,l,t),i=["children",""+l]):Ro.hasOwnProperty(o)&&l!=null&&o==="onScroll"&&ge("scroll",r)}switch(n){case"input":Fa(r),am(r,s,!0);break;case"textarea":Fa(r),um(r);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(r.onclick=Ol)}r=i,e.updateQueue=r,r!==null&&(e.flags|=4)}else{o=i.nodeType===9?i:i.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=__(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=o.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof r.is=="string"?t=o.createElement(n,{is:r.is}):(t=o.createElement(n),n==="select"&&(o=t,r.multiple?o.multiple=!0:r.size&&(o.size=r.size))):t=o.createElementNS(t,n),t[un]=e,t[bo]=r,zv(t,e,!1,!1),e.stateNode=t;e:{switch(o=gh(n,r),n){case"dialog":ge("cancel",t),ge("close",t),i=r;break;case"iframe":case"object":case"embed":ge("load",t),i=r;break;case"video":case"audio":for(i=0;i<io.length;i++)ge(io[i],t);i=r;break;case"source":ge("error",t),i=r;break;case"img":case"image":case"link":ge("error",t),ge("load",t),i=r;break;case"details":ge("toggle",t),i=r;break;case"input":om(t,r),i=ch(t,r),ge("invalid",t);break;case"option":i=r;break;case"select":t._wrapperState={wasMultiple:!!r.multiple},i=Ie({},r,{value:void 0}),ge("invalid",t);break;case"textarea":lm(t,r),i=fh(t,r),ge("invalid",t);break;default:i=r}mh(n,i),l=i;for(s in l)if(l.hasOwnProperty(s)){var u=l[s];s==="style"?T_(t,u):s==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,u!=null&&v_(t,u)):s==="children"?typeof u=="string"?(n!=="textarea"||u!=="")&&Po(t,u):typeof u=="number"&&Po(t,""+u):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(Ro.hasOwnProperty(s)?u!=null&&s==="onScroll"&&ge("scroll",t):u!=null&&Pd(t,s,u,o))}switch(n){case"input":Fa(t),am(t,r,!1);break;case"textarea":Fa(t),um(t);break;case"option":r.value!=null&&t.setAttribute("value",""+wr(r.value));break;case"select":t.multiple=!!r.multiple,s=r.value,s!=null?$i(t,!!r.multiple,s,!1):r.defaultValue!=null&&$i(t,!!r.multiple,r.defaultValue,!0);break;default:typeof i.onClick=="function"&&(t.onclick=Ol)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return et(e),null;case 6:if(t&&e.stateNode!=null)Hv(t,e,t.memoizedProps,r);else{if(typeof r!="string"&&e.stateNode===null)throw Error(M(166));if(n=Jr(Uo.current),Jr(hn.current),Ka(e)){if(r=e.stateNode,n=e.memoizedProps,r[un]=e,(s=r.nodeValue!==n)&&(t=Pt,t!==null))switch(t.tag){case 3:qa(r.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&qa(r.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[un]=e,e.stateNode=r}return et(e),null;case 13:if(ye(Te),r=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(_e&&Ct!==null&&e.mode&1&&!(e.flags&128))lv(),ns(),e.flags|=98560,s=!1;else if(s=Ka(e),r!==null&&r.dehydrated!==null){if(t===null){if(!s)throw Error(M(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(M(317));s[un]=e}else ns(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;et(e),s=!1}else qt!==null&&(Yh(qt),qt=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(r=r!==null,r!==(t!==null&&t.memoizedState!==null)&&r&&(e.child.flags|=8192,e.mode&1&&(t===null||Te.current&1?Fe===0&&(Fe=3):hf())),e.updateQueue!==null&&(e.flags|=4),et(e),null);case 4:return is(),zh(t,e),t===null&&Lo(e.stateNode.containerInfo),et(e),null;case 10:return Kd(e.type._context),et(e),null;case 17:return vt(e.type)&&Ll(),et(e),null;case 19:if(ye(Te),s=e.memoizedState,s===null)return et(e),null;if(r=(e.flags&128)!==0,o=s.rendering,o===null)if(r)Xs(s,!1);else{if(Fe!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(o=zl(t),o!==null){for(e.flags|=128,Xs(s,!1),r=o.updateQueue,r!==null&&(e.updateQueue=r,e.flags|=4),e.subtreeFlags=0,r=n,n=e.child;n!==null;)s=n,t=r,s.flags&=14680066,o=s.alternate,o===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=o.childLanes,s.lanes=o.lanes,s.child=o.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=o.memoizedProps,s.memoizedState=o.memoizedState,s.updateQueue=o.updateQueue,s.type=o.type,t=o.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return pe(Te,Te.current&1|2),e.child}t=t.sibling}s.tail!==null&&ke()>os&&(e.flags|=128,r=!0,Xs(s,!1),e.lanes=4194304)}else{if(!r)if(t=zl(o),t!==null){if(e.flags|=128,r=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),Xs(s,!0),s.tail===null&&s.tailMode==="hidden"&&!o.alternate&&!_e)return et(e),null}else 2*ke()-s.renderingStartTime>os&&n!==1073741824&&(e.flags|=128,r=!0,Xs(s,!1),e.lanes=4194304);s.isBackwards?(o.sibling=e.child,e.child=o):(n=s.last,n!==null?n.sibling=o:e.child=o,s.last=o)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=ke(),e.sibling=null,n=Te.current,pe(Te,r?n&1|2:n&1),e):(et(e),null);case 22:case 23:return cf(),r=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==r&&(e.flags|=8192),r&&e.mode&1?St&1073741824&&(et(e),e.subtreeFlags&6&&(e.flags|=8192)):et(e),null;case 24:return null;case 25:return null}throw Error(M(156,e.tag))}function mS(t,e){switch($d(e),e.tag){case 1:return vt(e.type)&&Ll(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return is(),ye(_t),ye(st),Xd(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return Jd(e),null;case 13:if(ye(Te),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(M(340));ns()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return ye(Te),null;case 4:return is(),null;case 10:return Kd(e.type._context),null;case 22:case 23:return cf(),null;case 24:return null;default:return null}}var Ya=!1,rt=!1,gS=typeof WeakSet=="function"?WeakSet:Set,H=null;function Ui(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){Ce(t,e,r)}else n.current=null}function $h(t,e,n){try{n()}catch(r){Ce(t,e,r)}}var Xm=!1;function yS(t,e){if(Ch=Vl,t=Q_(),Bd(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var i=r.anchorOffset,s=r.focusNode;r=r.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var o=0,l=-1,u=-1,h=0,f=0,p=t,m=null;t:for(;;){for(var A;p!==n||i!==0&&p.nodeType!==3||(l=o+i),p!==s||r!==0&&p.nodeType!==3||(u=o+r),p.nodeType===3&&(o+=p.nodeValue.length),(A=p.firstChild)!==null;)m=p,p=A;for(;;){if(p===t)break t;if(m===n&&++h===i&&(l=o),m===s&&++f===r&&(u=o),(A=p.nextSibling)!==null)break;p=m,m=p.parentNode}p=A}n=l===-1||u===-1?null:{start:l,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(Rh={focusedElem:t,selectionRange:n},Vl=!1,H=e;H!==null;)if(e=H,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,H=t;else for(;H!==null;){e=H;try{var R=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(R!==null){var V=R.memoizedProps,b=R.memoizedState,I=e.stateNode,v=I.getSnapshotBeforeUpdate(e.elementType===e.type?V:Ht(e.type,V),b);I.__reactInternalSnapshotBeforeUpdate=v}break;case 3:var C=e.stateNode.containerInfo;C.nodeType===1?C.textContent="":C.nodeType===9&&C.documentElement&&C.removeChild(C.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(M(163))}}catch(L){Ce(e,e.return,L)}if(t=e.sibling,t!==null){t.return=e.return,H=t;break}H=e.return}return R=Xm,Xm=!1,R}function yo(t,e,n){var r=e.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var i=r=r.next;do{if((i.tag&t)===t){var s=i.destroy;i.destroy=void 0,s!==void 0&&$h(e,n,s)}i=i.next}while(i!==r)}}function Su(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var r=n.create;n.destroy=r()}n=n.next}while(n!==e)}}function Hh(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function Wv(t){var e=t.alternate;e!==null&&(t.alternate=null,Wv(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[un],delete e[bo],delete e[Nh],delete e[Z0],delete e[eS])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function qv(t){return t.tag===5||t.tag===3||t.tag===4}function Zm(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||qv(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Wh(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=Ol));else if(r!==4&&(t=t.child,t!==null))for(Wh(t,e,n),t=t.sibling;t!==null;)Wh(t,e,n),t=t.sibling}function qh(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(r!==4&&(t=t.child,t!==null))for(qh(t,e,n),t=t.sibling;t!==null;)qh(t,e,n),t=t.sibling}var Ke=null,Wt=!1;function Qn(t,e,n){for(n=n.child;n!==null;)Kv(t,e,n),n=n.sibling}function Kv(t,e,n){if(cn&&typeof cn.onCommitFiberUnmount=="function")try{cn.onCommitFiberUnmount(gu,n)}catch{}switch(n.tag){case 5:rt||Ui(n,e);case 6:var r=Ke,i=Wt;Ke=null,Qn(t,e,n),Ke=r,Wt=i,Ke!==null&&(Wt?(t=Ke,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):Ke.removeChild(n.stateNode));break;case 18:Ke!==null&&(Wt?(t=Ke,n=n.stateNode,t.nodeType===8?Mc(t.parentNode,n):t.nodeType===1&&Mc(t,n),Do(t)):Mc(Ke,n.stateNode));break;case 4:r=Ke,i=Wt,Ke=n.stateNode.containerInfo,Wt=!0,Qn(t,e,n),Ke=r,Wt=i;break;case 0:case 11:case 14:case 15:if(!rt&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){i=r=r.next;do{var s=i,o=s.destroy;s=s.tag,o!==void 0&&(s&2||s&4)&&$h(n,e,o),i=i.next}while(i!==r)}Qn(t,e,n);break;case 1:if(!rt&&(Ui(n,e),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(l){Ce(n,e,l)}Qn(t,e,n);break;case 21:Qn(t,e,n);break;case 22:n.mode&1?(rt=(r=rt)||n.memoizedState!==null,Qn(t,e,n),rt=r):Qn(t,e,n);break;default:Qn(t,e,n)}}function eg(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new gS),e.forEach(function(r){var i=CS.bind(null,t,r);n.has(r)||(n.add(r),r.then(i,i))})}}function $t(t,e){var n=e.deletions;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];try{var s=t,o=e,l=o;e:for(;l!==null;){switch(l.tag){case 5:Ke=l.stateNode,Wt=!1;break e;case 3:Ke=l.stateNode.containerInfo,Wt=!0;break e;case 4:Ke=l.stateNode.containerInfo,Wt=!0;break e}l=l.return}if(Ke===null)throw Error(M(160));Kv(s,o,i),Ke=null,Wt=!1;var u=i.alternate;u!==null&&(u.return=null),i.return=null}catch(h){Ce(i,e,h)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)Gv(e,t),e=e.sibling}function Gv(t,e){var n=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if($t(e,t),on(t),r&4){try{yo(3,t,t.return),Su(3,t)}catch(V){Ce(t,t.return,V)}try{yo(5,t,t.return)}catch(V){Ce(t,t.return,V)}}break;case 1:$t(e,t),on(t),r&512&&n!==null&&Ui(n,n.return);break;case 5:if($t(e,t),on(t),r&512&&n!==null&&Ui(n,n.return),t.flags&32){var i=t.stateNode;try{Po(i,"")}catch(V){Ce(t,t.return,V)}}if(r&4&&(i=t.stateNode,i!=null)){var s=t.memoizedProps,o=n!==null?n.memoizedProps:s,l=t.type,u=t.updateQueue;if(t.updateQueue=null,u!==null)try{l==="input"&&s.type==="radio"&&s.name!=null&&g_(i,s),gh(l,o);var h=gh(l,s);for(o=0;o<u.length;o+=2){var f=u[o],p=u[o+1];f==="style"?T_(i,p):f==="dangerouslySetInnerHTML"?v_(i,p):f==="children"?Po(i,p):Pd(i,f,p,h)}switch(l){case"input":hh(i,s);break;case"textarea":y_(i,s);break;case"select":var m=i._wrapperState.wasMultiple;i._wrapperState.wasMultiple=!!s.multiple;var A=s.value;A!=null?$i(i,!!s.multiple,A,!1):m!==!!s.multiple&&(s.defaultValue!=null?$i(i,!!s.multiple,s.defaultValue,!0):$i(i,!!s.multiple,s.multiple?[]:"",!1))}i[bo]=s}catch(V){Ce(t,t.return,V)}}break;case 6:if($t(e,t),on(t),r&4){if(t.stateNode===null)throw Error(M(162));i=t.stateNode,s=t.memoizedProps;try{i.nodeValue=s}catch(V){Ce(t,t.return,V)}}break;case 3:if($t(e,t),on(t),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Do(e.containerInfo)}catch(V){Ce(t,t.return,V)}break;case 4:$t(e,t),on(t);break;case 13:$t(e,t),on(t),i=t.child,i.flags&8192&&(s=i.memoizedState!==null,i.stateNode.isHidden=s,!s||i.alternate!==null&&i.alternate.memoizedState!==null||(lf=ke())),r&4&&eg(t);break;case 22:if(f=n!==null&&n.memoizedState!==null,t.mode&1?(rt=(h=rt)||f,$t(e,t),rt=h):$t(e,t),on(t),r&8192){if(h=t.memoizedState!==null,(t.stateNode.isHidden=h)&&!f&&t.mode&1)for(H=t,f=t.child;f!==null;){for(p=H=f;H!==null;){switch(m=H,A=m.child,m.tag){case 0:case 11:case 14:case 15:yo(4,m,m.return);break;case 1:Ui(m,m.return);var R=m.stateNode;if(typeof R.componentWillUnmount=="function"){r=m,n=m.return;try{e=r,R.props=e.memoizedProps,R.state=e.memoizedState,R.componentWillUnmount()}catch(V){Ce(r,n,V)}}break;case 5:Ui(m,m.return);break;case 22:if(m.memoizedState!==null){ng(p);continue}}A!==null?(A.return=m,H=A):ng(p)}f=f.sibling}e:for(f=null,p=t;;){if(p.tag===5){if(f===null){f=p;try{i=p.stateNode,h?(s=i.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(l=p.stateNode,u=p.memoizedProps.style,o=u!=null&&u.hasOwnProperty("display")?u.display:null,l.style.display=E_("display",o))}catch(V){Ce(t,t.return,V)}}}else if(p.tag===6){if(f===null)try{p.stateNode.nodeValue=h?"":p.memoizedProps}catch(V){Ce(t,t.return,V)}}else if((p.tag!==22&&p.tag!==23||p.memoizedState===null||p===t)&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===t)break e;for(;p.sibling===null;){if(p.return===null||p.return===t)break e;f===p&&(f=null),p=p.return}f===p&&(f=null),p.sibling.return=p.return,p=p.sibling}}break;case 19:$t(e,t),on(t),r&4&&eg(t);break;case 21:break;default:$t(e,t),on(t)}}function on(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(qv(n)){var r=n;break e}n=n.return}throw Error(M(160))}switch(r.tag){case 5:var i=r.stateNode;r.flags&32&&(Po(i,""),r.flags&=-33);var s=Zm(t);qh(t,s,i);break;case 3:case 4:var o=r.stateNode.containerInfo,l=Zm(t);Wh(t,l,o);break;default:throw Error(M(161))}}catch(u){Ce(t,t.return,u)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function _S(t,e,n){H=t,Qv(t)}function Qv(t,e,n){for(var r=(t.mode&1)!==0;H!==null;){var i=H,s=i.child;if(i.tag===22&&r){var o=i.memoizedState!==null||Ya;if(!o){var l=i.alternate,u=l!==null&&l.memoizedState!==null||rt;l=Ya;var h=rt;if(Ya=o,(rt=u)&&!h)for(H=i;H!==null;)o=H,u=o.child,o.tag===22&&o.memoizedState!==null?rg(i):u!==null?(u.return=o,H=u):rg(i);for(;s!==null;)H=s,Qv(s),s=s.sibling;H=i,Ya=l,rt=h}tg(t)}else i.subtreeFlags&8772&&s!==null?(s.return=i,H=s):tg(t)}}function tg(t){for(;H!==null;){var e=H;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:rt||Su(5,e);break;case 1:var r=e.stateNode;if(e.flags&4&&!rt)if(n===null)r.componentDidMount();else{var i=e.elementType===e.type?n.memoizedProps:Ht(e.type,n.memoizedProps);r.componentDidUpdate(i,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&Um(e,s,r);break;case 3:var o=e.updateQueue;if(o!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}Um(e,o,n)}break;case 5:var l=e.stateNode;if(n===null&&e.flags&4){n=l;var u=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":u.autoFocus&&n.focus();break;case"img":u.src&&(n.src=u.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var h=e.alternate;if(h!==null){var f=h.memoizedState;if(f!==null){var p=f.dehydrated;p!==null&&Do(p)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(M(163))}rt||e.flags&512&&Hh(e)}catch(m){Ce(e,e.return,m)}}if(e===t){H=null;break}if(n=e.sibling,n!==null){n.return=e.return,H=n;break}H=e.return}}function ng(t){for(;H!==null;){var e=H;if(e===t){H=null;break}var n=e.sibling;if(n!==null){n.return=e.return,H=n;break}H=e.return}}function rg(t){for(;H!==null;){var e=H;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{Su(4,e)}catch(u){Ce(e,n,u)}break;case 1:var r=e.stateNode;if(typeof r.componentDidMount=="function"){var i=e.return;try{r.componentDidMount()}catch(u){Ce(e,i,u)}}var s=e.return;try{Hh(e)}catch(u){Ce(e,s,u)}break;case 5:var o=e.return;try{Hh(e)}catch(u){Ce(e,o,u)}}}catch(u){Ce(e,e.return,u)}if(e===t){H=null;break}var l=e.sibling;if(l!==null){l.return=e.return,H=l;break}H=e.return}}var vS=Math.ceil,Wl=Mn.ReactCurrentDispatcher,of=Mn.ReactCurrentOwner,Ft=Mn.ReactCurrentBatchConfig,ae=0,We=null,De=null,Qe=0,St=0,ji=Or(0),Fe=0,$o=null,oi=0,Au=0,af=0,_o=null,mt=null,lf=0,os=1/0,vn=null,ql=!1,Kh=null,fr=null,Ja=!1,or=null,Kl=0,vo=0,Gh=null,pl=-1,ml=0;function ut(){return ae&6?ke():pl!==-1?pl:pl=ke()}function pr(t){return t.mode&1?ae&2&&Qe!==0?Qe&-Qe:nS.transition!==null?(ml===0&&(ml=x_()),ml):(t=ue,t!==0||(t=window.event,t=t===void 0?16:j_(t.type)),t):1}function Yt(t,e,n,r){if(50<vo)throw vo=0,Gh=null,Error(M(185));ta(t,n,r),(!(ae&2)||t!==We)&&(t===We&&(!(ae&2)&&(Au|=n),Fe===4&&er(t,Qe)),Et(t,r),n===1&&ae===0&&!(e.mode&1)&&(os=ke()+500,Tu&&Lr()))}function Et(t,e){var n=t.callbackNode;n0(t,e);var r=Nl(t,t===We?Qe:0);if(r===0)n!==null&&dm(n),t.callbackNode=null,t.callbackPriority=0;else if(e=r&-r,t.callbackPriority!==e){if(n!=null&&dm(n),e===1)t.tag===0?tS(ig.bind(null,t)):sv(ig.bind(null,t)),J0(function(){!(ae&6)&&Lr()}),n=null;else{switch(O_(r)){case 1:n=xd;break;case 4:n=V_;break;case 16:n=kl;break;case 536870912:n=D_;break;default:n=kl}n=rE(n,Yv.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function Yv(t,e){if(pl=-1,ml=0,ae&6)throw Error(M(327));var n=t.callbackNode;if(Gi()&&t.callbackNode!==n)return null;var r=Nl(t,t===We?Qe:0);if(r===0)return null;if(r&30||r&t.expiredLanes||e)e=Gl(t,r);else{e=r;var i=ae;ae|=2;var s=Xv();(We!==t||Qe!==e)&&(vn=null,os=ke()+500,Zr(t,e));do try{wS();break}catch(l){Jv(t,l)}while(!0);qd(),Wl.current=s,ae=i,De!==null?e=0:(We=null,Qe=0,e=Fe)}if(e!==0){if(e===2&&(i=Th(t),i!==0&&(r=i,e=Qh(t,i))),e===1)throw n=$o,Zr(t,0),er(t,r),Et(t,ke()),n;if(e===6)er(t,r);else{if(i=t.current.alternate,!(r&30)&&!ES(i)&&(e=Gl(t,r),e===2&&(s=Th(t),s!==0&&(r=s,e=Qh(t,s))),e===1))throw n=$o,Zr(t,0),er(t,r),Et(t,ke()),n;switch(t.finishedWork=i,t.finishedLanes=r,e){case 0:case 1:throw Error(M(345));case 2:Kr(t,mt,vn);break;case 3:if(er(t,r),(r&130023424)===r&&(e=lf+500-ke(),10<e)){if(Nl(t,0)!==0)break;if(i=t.suspendedLanes,(i&r)!==r){ut(),t.pingedLanes|=t.suspendedLanes&i;break}t.timeoutHandle=kh(Kr.bind(null,t,mt,vn),e);break}Kr(t,mt,vn);break;case 4:if(er(t,r),(r&4194240)===r)break;for(e=t.eventTimes,i=-1;0<r;){var o=31-Qt(r);s=1<<o,o=e[o],o>i&&(i=o),r&=~s}if(r=i,r=ke()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*vS(r/1960))-r,10<r){t.timeoutHandle=kh(Kr.bind(null,t,mt,vn),r);break}Kr(t,mt,vn);break;case 5:Kr(t,mt,vn);break;default:throw Error(M(329))}}}return Et(t,ke()),t.callbackNode===n?Yv.bind(null,t):null}function Qh(t,e){var n=_o;return t.current.memoizedState.isDehydrated&&(Zr(t,e).flags|=256),t=Gl(t,e),t!==2&&(e=mt,mt=n,e!==null&&Yh(e)),t}function Yh(t){mt===null?mt=t:mt.push.apply(mt,t)}function ES(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var i=n[r],s=i.getSnapshot;i=i.value;try{if(!Zt(s(),i))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function er(t,e){for(e&=~af,e&=~Au,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-Qt(e),r=1<<n;t[n]=-1,e&=~r}}function ig(t){if(ae&6)throw Error(M(327));Gi();var e=Nl(t,0);if(!(e&1))return Et(t,ke()),null;var n=Gl(t,e);if(t.tag!==0&&n===2){var r=Th(t);r!==0&&(e=r,n=Qh(t,r))}if(n===1)throw n=$o,Zr(t,0),er(t,e),Et(t,ke()),n;if(n===6)throw Error(M(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,Kr(t,mt,vn),Et(t,ke()),null}function uf(t,e){var n=ae;ae|=1;try{return t(e)}finally{ae=n,ae===0&&(os=ke()+500,Tu&&Lr())}}function ai(t){or!==null&&or.tag===0&&!(ae&6)&&Gi();var e=ae;ae|=1;var n=Ft.transition,r=ue;try{if(Ft.transition=null,ue=1,t)return t()}finally{ue=r,Ft.transition=n,ae=e,!(ae&6)&&Lr()}}function cf(){St=ji.current,ye(ji)}function Zr(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,Y0(n)),De!==null)for(n=De.return;n!==null;){var r=n;switch($d(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&Ll();break;case 3:is(),ye(_t),ye(st),Xd();break;case 5:Jd(r);break;case 4:is();break;case 13:ye(Te);break;case 19:ye(Te);break;case 10:Kd(r.type._context);break;case 22:case 23:cf()}n=n.return}if(We=t,De=t=mr(t.current,null),Qe=St=e,Fe=0,$o=null,af=Au=oi=0,mt=_o=null,Yr!==null){for(e=0;e<Yr.length;e++)if(n=Yr[e],r=n.interleaved,r!==null){n.interleaved=null;var i=r.next,s=n.pending;if(s!==null){var o=s.next;s.next=i,r.next=o}n.pending=r}Yr=null}return t}function Jv(t,e){do{var n=De;try{if(qd(),hl.current=Hl,$l){for(var r=we.memoizedState;r!==null;){var i=r.queue;i!==null&&(i.pending=null),r=r.next}$l=!1}if(si=0,$e=be=we=null,go=!1,jo=0,of.current=null,n===null||n.return===null){Fe=1,$o=e,De=null;break}e:{var s=t,o=n.return,l=n,u=e;if(e=Qe,l.flags|=32768,u!==null&&typeof u=="object"&&typeof u.then=="function"){var h=u,f=l,p=f.tag;if(!(f.mode&1)&&(p===0||p===11||p===15)){var m=f.alternate;m?(f.updateQueue=m.updateQueue,f.memoizedState=m.memoizedState,f.lanes=m.lanes):(f.updateQueue=null,f.memoizedState=null)}var A=Wm(o);if(A!==null){A.flags&=-257,qm(A,o,l,s,e),A.mode&1&&Hm(s,h,e),e=A,u=h;var R=e.updateQueue;if(R===null){var V=new Set;V.add(u),e.updateQueue=V}else R.add(u);break e}else{if(!(e&1)){Hm(s,h,e),hf();break e}u=Error(M(426))}}else if(_e&&l.mode&1){var b=Wm(o);if(b!==null){!(b.flags&65536)&&(b.flags|=256),qm(b,o,l,s,e),Hd(ss(u,l));break e}}s=u=ss(u,l),Fe!==4&&(Fe=2),_o===null?_o=[s]:_o.push(s),s=o;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var I=Ov(s,u,e);Fm(s,I);break e;case 1:l=u;var v=s.type,C=s.stateNode;if(!(s.flags&128)&&(typeof v.getDerivedStateFromError=="function"||C!==null&&typeof C.componentDidCatch=="function"&&(fr===null||!fr.has(C)))){s.flags|=65536,e&=-e,s.lanes|=e;var L=Lv(s,l,e);Fm(s,L);break e}}s=s.return}while(s!==null)}eE(n)}catch(F){e=F,De===n&&n!==null&&(De=n=n.return);continue}break}while(!0)}function Xv(){var t=Wl.current;return Wl.current=Hl,t===null?Hl:t}function hf(){(Fe===0||Fe===3||Fe===2)&&(Fe=4),We===null||!(oi&268435455)&&!(Au&268435455)||er(We,Qe)}function Gl(t,e){var n=ae;ae|=2;var r=Xv();(We!==t||Qe!==e)&&(vn=null,Zr(t,e));do try{TS();break}catch(i){Jv(t,i)}while(!0);if(qd(),ae=n,Wl.current=r,De!==null)throw Error(M(261));return We=null,Qe=0,Fe}function TS(){for(;De!==null;)Zv(De)}function wS(){for(;De!==null&&!KI();)Zv(De)}function Zv(t){var e=nE(t.alternate,t,St);t.memoizedProps=t.pendingProps,e===null?eE(t):De=e,of.current=null}function eE(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=mS(n,e),n!==null){n.flags&=32767,De=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{Fe=6,De=null;return}}else if(n=pS(n,e,St),n!==null){De=n;return}if(e=e.sibling,e!==null){De=e;return}De=e=t}while(e!==null);Fe===0&&(Fe=5)}function Kr(t,e,n){var r=ue,i=Ft.transition;try{Ft.transition=null,ue=1,IS(t,e,n,r)}finally{Ft.transition=i,ue=r}return null}function IS(t,e,n,r){do Gi();while(or!==null);if(ae&6)throw Error(M(327));n=t.finishedWork;var i=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(M(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(r0(t,s),t===We&&(De=We=null,Qe=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Ja||(Ja=!0,rE(kl,function(){return Gi(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=Ft.transition,Ft.transition=null;var o=ue;ue=1;var l=ae;ae|=4,of.current=null,yS(t,n),Gv(n,t),$0(Rh),Vl=!!Ch,Rh=Ch=null,t.current=n,_S(n),GI(),ae=l,ue=o,Ft.transition=s}else t.current=n;if(Ja&&(Ja=!1,or=t,Kl=i),s=t.pendingLanes,s===0&&(fr=null),JI(n.stateNode),Et(t,ke()),e!==null)for(r=t.onRecoverableError,n=0;n<e.length;n++)i=e[n],r(i.value,{componentStack:i.stack,digest:i.digest});if(ql)throw ql=!1,t=Kh,Kh=null,t;return Kl&1&&t.tag!==0&&Gi(),s=t.pendingLanes,s&1?t===Gh?vo++:(vo=0,Gh=t):vo=0,Lr(),null}function Gi(){if(or!==null){var t=O_(Kl),e=Ft.transition,n=ue;try{if(Ft.transition=null,ue=16>t?16:t,or===null)var r=!1;else{if(t=or,or=null,Kl=0,ae&6)throw Error(M(331));var i=ae;for(ae|=4,H=t.current;H!==null;){var s=H,o=s.child;if(H.flags&16){var l=s.deletions;if(l!==null){for(var u=0;u<l.length;u++){var h=l[u];for(H=h;H!==null;){var f=H;switch(f.tag){case 0:case 11:case 15:yo(8,f,s)}var p=f.child;if(p!==null)p.return=f,H=p;else for(;H!==null;){f=H;var m=f.sibling,A=f.return;if(Wv(f),f===h){H=null;break}if(m!==null){m.return=A,H=m;break}H=A}}}var R=s.alternate;if(R!==null){var V=R.child;if(V!==null){R.child=null;do{var b=V.sibling;V.sibling=null,V=b}while(V!==null)}}H=s}}if(s.subtreeFlags&2064&&o!==null)o.return=s,H=o;else e:for(;H!==null;){if(s=H,s.flags&2048)switch(s.tag){case 0:case 11:case 15:yo(9,s,s.return)}var I=s.sibling;if(I!==null){I.return=s.return,H=I;break e}H=s.return}}var v=t.current;for(H=v;H!==null;){o=H;var C=o.child;if(o.subtreeFlags&2064&&C!==null)C.return=o,H=C;else e:for(o=v;H!==null;){if(l=H,l.flags&2048)try{switch(l.tag){case 0:case 11:case 15:Su(9,l)}}catch(F){Ce(l,l.return,F)}if(l===o){H=null;break e}var L=l.sibling;if(L!==null){L.return=l.return,H=L;break e}H=l.return}}if(ae=i,Lr(),cn&&typeof cn.onPostCommitFiberRoot=="function")try{cn.onPostCommitFiberRoot(gu,t)}catch{}r=!0}return r}finally{ue=n,Ft.transition=e}}return!1}function sg(t,e,n){e=ss(n,e),e=Ov(t,e,1),t=dr(t,e,1),e=ut(),t!==null&&(ta(t,1,e),Et(t,e))}function Ce(t,e,n){if(t.tag===3)sg(t,t,n);else for(;e!==null;){if(e.tag===3){sg(e,t,n);break}else if(e.tag===1){var r=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(fr===null||!fr.has(r))){t=ss(n,t),t=Lv(e,t,1),e=dr(e,t,1),t=ut(),e!==null&&(ta(e,1,t),Et(e,t));break}}e=e.return}}function SS(t,e,n){var r=t.pingCache;r!==null&&r.delete(e),e=ut(),t.pingedLanes|=t.suspendedLanes&n,We===t&&(Qe&n)===n&&(Fe===4||Fe===3&&(Qe&130023424)===Qe&&500>ke()-lf?Zr(t,0):af|=n),Et(t,e)}function tE(t,e){e===0&&(t.mode&1?(e=Ba,Ba<<=1,!(Ba&130023424)&&(Ba=4194304)):e=1);var n=ut();t=kn(t,e),t!==null&&(ta(t,e,n),Et(t,n))}function AS(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),tE(t,n)}function CS(t,e){var n=0;switch(t.tag){case 13:var r=t.stateNode,i=t.memoizedState;i!==null&&(n=i.retryLane);break;case 19:r=t.stateNode;break;default:throw Error(M(314))}r!==null&&r.delete(e),tE(t,n)}var nE;nE=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||_t.current)yt=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return yt=!1,fS(t,e,n);yt=!!(t.flags&131072)}else yt=!1,_e&&e.flags&1048576&&ov(e,Fl,e.index);switch(e.lanes=0,e.tag){case 2:var r=e.type;fl(t,e),t=e.pendingProps;var i=ts(e,st.current);Ki(e,n),i=ef(null,e,r,t,i,n);var s=tf();return e.flags|=1,typeof i=="object"&&i!==null&&typeof i.render=="function"&&i.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,vt(r)?(s=!0,Ml(e)):s=!1,e.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,Qd(e),i.updater=Iu,e.stateNode=i,i._reactInternals=e,Mh(e,r,t,n),e=Uh(null,e,r,!0,s,n)):(e.tag=0,_e&&s&&zd(e),lt(null,e,i,n),e=e.child),e;case 16:r=e.elementType;e:{switch(fl(t,e),t=e.pendingProps,i=r._init,r=i(r._payload),e.type=r,i=e.tag=PS(r),t=Ht(r,t),i){case 0:e=Fh(null,e,r,t,n);break e;case 1:e=Qm(null,e,r,t,n);break e;case 11:e=Km(null,e,r,t,n);break e;case 14:e=Gm(null,e,r,Ht(r.type,t),n);break e}throw Error(M(306,r,""))}return e;case 0:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:Ht(r,i),Fh(t,e,r,i,n);case 1:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:Ht(r,i),Qm(t,e,r,i,n);case 3:e:{if(Uv(e),t===null)throw Error(M(387));r=e.pendingProps,s=e.memoizedState,i=s.element,dv(t,e),Bl(e,r,null,n);var o=e.memoizedState;if(r=o.element,s.isDehydrated)if(s={element:r,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){i=ss(Error(M(423)),e),e=Ym(t,e,r,n,i);break e}else if(r!==i){i=ss(Error(M(424)),e),e=Ym(t,e,r,n,i);break e}else for(Ct=hr(e.stateNode.containerInfo.firstChild),Pt=e,_e=!0,qt=null,n=cv(e,null,r,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(ns(),r===i){e=Nn(t,e,n);break e}lt(t,e,r,n)}e=e.child}return e;case 5:return fv(e),t===null&&xh(e),r=e.type,i=e.pendingProps,s=t!==null?t.memoizedProps:null,o=i.children,Ph(r,i)?o=null:s!==null&&Ph(r,s)&&(e.flags|=32),Fv(t,e),lt(t,e,o,n),e.child;case 6:return t===null&&xh(e),null;case 13:return jv(t,e,n);case 4:return Yd(e,e.stateNode.containerInfo),r=e.pendingProps,t===null?e.child=rs(e,null,r,n):lt(t,e,r,n),e.child;case 11:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:Ht(r,i),Km(t,e,r,i,n);case 7:return lt(t,e,e.pendingProps,n),e.child;case 8:return lt(t,e,e.pendingProps.children,n),e.child;case 12:return lt(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(r=e.type._context,i=e.pendingProps,s=e.memoizedProps,o=i.value,pe(Ul,r._currentValue),r._currentValue=o,s!==null)if(Zt(s.value,o)){if(s.children===i.children&&!_t.current){e=Nn(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var l=s.dependencies;if(l!==null){o=s.child;for(var u=l.firstContext;u!==null;){if(u.context===r){if(s.tag===1){u=An(-1,n&-n),u.tag=2;var h=s.updateQueue;if(h!==null){h=h.shared;var f=h.pending;f===null?u.next=u:(u.next=f.next,f.next=u),h.pending=u}}s.lanes|=n,u=s.alternate,u!==null&&(u.lanes|=n),Oh(s.return,n,e),l.lanes|=n;break}u=u.next}}else if(s.tag===10)o=s.type===e.type?null:s.child;else if(s.tag===18){if(o=s.return,o===null)throw Error(M(341));o.lanes|=n,l=o.alternate,l!==null&&(l.lanes|=n),Oh(o,n,e),o=s.sibling}else o=s.child;if(o!==null)o.return=s;else for(o=s;o!==null;){if(o===e){o=null;break}if(s=o.sibling,s!==null){s.return=o.return,o=s;break}o=o.return}s=o}lt(t,e,i.children,n),e=e.child}return e;case 9:return i=e.type,r=e.pendingProps.children,Ki(e,n),i=Bt(i),r=r(i),e.flags|=1,lt(t,e,r,n),e.child;case 14:return r=e.type,i=Ht(r,e.pendingProps),i=Ht(r.type,i),Gm(t,e,r,i,n);case 15:return Mv(t,e,e.type,e.pendingProps,n);case 17:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:Ht(r,i),fl(t,e),e.tag=1,vt(r)?(t=!0,Ml(e)):t=!1,Ki(e,n),xv(e,r,i),Mh(e,r,i,n),Uh(null,e,r,!0,t,n);case 19:return Bv(t,e,n);case 22:return bv(t,e,n)}throw Error(M(156,e.tag))};function rE(t,e){return N_(t,e)}function RS(t,e,n,r){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function bt(t,e,n,r){return new RS(t,e,n,r)}function df(t){return t=t.prototype,!(!t||!t.isReactComponent)}function PS(t){if(typeof t=="function")return df(t)?1:0;if(t!=null){if(t=t.$$typeof,t===Nd)return 11;if(t===Vd)return 14}return 2}function mr(t,e){var n=t.alternate;return n===null?(n=bt(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function gl(t,e,n,r,i,s){var o=2;if(r=t,typeof t=="function")df(t)&&(o=1);else if(typeof t=="string")o=5;else e:switch(t){case Ni:return ei(n.children,i,s,e);case kd:o=8,i|=8;break;case oh:return t=bt(12,n,e,i|2),t.elementType=oh,t.lanes=s,t;case ah:return t=bt(13,n,e,i),t.elementType=ah,t.lanes=s,t;case lh:return t=bt(19,n,e,i),t.elementType=lh,t.lanes=s,t;case f_:return Cu(n,i,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case h_:o=10;break e;case d_:o=9;break e;case Nd:o=11;break e;case Vd:o=14;break e;case Jn:o=16,r=null;break e}throw Error(M(130,t==null?t:typeof t,""))}return e=bt(o,n,e,i),e.elementType=t,e.type=r,e.lanes=s,e}function ei(t,e,n,r){return t=bt(7,t,r,e),t.lanes=n,t}function Cu(t,e,n,r){return t=bt(22,t,r,e),t.elementType=f_,t.lanes=n,t.stateNode={isHidden:!1},t}function Hc(t,e,n){return t=bt(6,t,null,e),t.lanes=n,t}function Wc(t,e,n){return e=bt(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function kS(t,e,n,r,i){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Ac(0),this.expirationTimes=Ac(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ac(0),this.identifierPrefix=r,this.onRecoverableError=i,this.mutableSourceEagerHydrationData=null}function ff(t,e,n,r,i,s,o,l,u){return t=new kS(t,e,n,l,u),e===1?(e=1,s===!0&&(e|=8)):e=0,s=bt(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Qd(s),t}function NS(t,e,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ki,key:r==null?null:""+r,children:t,containerInfo:e,implementation:n}}function iE(t){if(!t)return Ir;t=t._reactInternals;e:{if(pi(t)!==t||t.tag!==1)throw Error(M(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(vt(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(M(171))}if(t.tag===1){var n=t.type;if(vt(n))return iv(t,n,e)}return e}function sE(t,e,n,r,i,s,o,l,u){return t=ff(n,r,!0,t,i,s,o,l,u),t.context=iE(null),n=t.current,r=ut(),i=pr(n),s=An(r,i),s.callback=e??null,dr(n,s,i),t.current.lanes=i,ta(t,i,r),Et(t,r),t}function Ru(t,e,n,r){var i=e.current,s=ut(),o=pr(i);return n=iE(n),e.context===null?e.context=n:e.pendingContext=n,e=An(s,o),e.payload={element:t},r=r===void 0?null:r,r!==null&&(e.callback=r),t=dr(i,e,o),t!==null&&(Yt(t,i,o,s),cl(t,i,o)),o}function Ql(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function og(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function pf(t,e){og(t,e),(t=t.alternate)&&og(t,e)}function VS(){return null}var oE=typeof reportError=="function"?reportError:function(t){console.error(t)};function mf(t){this._internalRoot=t}Pu.prototype.render=mf.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(M(409));Ru(t,e,null,null)};Pu.prototype.unmount=mf.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;ai(function(){Ru(null,t,null,null)}),e[Pn]=null}};function Pu(t){this._internalRoot=t}Pu.prototype.unstable_scheduleHydration=function(t){if(t){var e=b_();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Zn.length&&e!==0&&e<Zn[n].priority;n++);Zn.splice(n,0,t),n===0&&U_(t)}};function gf(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function ku(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function ag(){}function DS(t,e,n,r,i){if(i){if(typeof r=="function"){var s=r;r=function(){var h=Ql(o);s.call(h)}}var o=sE(e,r,t,0,null,!1,!1,"",ag);return t._reactRootContainer=o,t[Pn]=o.current,Lo(t.nodeType===8?t.parentNode:t),ai(),o}for(;i=t.lastChild;)t.removeChild(i);if(typeof r=="function"){var l=r;r=function(){var h=Ql(u);l.call(h)}}var u=ff(t,0,!1,null,null,!1,!1,"",ag);return t._reactRootContainer=u,t[Pn]=u.current,Lo(t.nodeType===8?t.parentNode:t),ai(function(){Ru(e,u,n,r)}),u}function Nu(t,e,n,r,i){var s=n._reactRootContainer;if(s){var o=s;if(typeof i=="function"){var l=i;i=function(){var u=Ql(o);l.call(u)}}Ru(e,o,t,i)}else o=DS(n,e,t,i,r);return Ql(o)}L_=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=ro(e.pendingLanes);n!==0&&(Od(e,n|1),Et(e,ke()),!(ae&6)&&(os=ke()+500,Lr()))}break;case 13:ai(function(){var r=kn(t,1);if(r!==null){var i=ut();Yt(r,t,1,i)}}),pf(t,1)}};Ld=function(t){if(t.tag===13){var e=kn(t,134217728);if(e!==null){var n=ut();Yt(e,t,134217728,n)}pf(t,134217728)}};M_=function(t){if(t.tag===13){var e=pr(t),n=kn(t,e);if(n!==null){var r=ut();Yt(n,t,e,r)}pf(t,e)}};b_=function(){return ue};F_=function(t,e){var n=ue;try{return ue=t,e()}finally{ue=n}};_h=function(t,e,n){switch(e){case"input":if(hh(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var r=n[e];if(r!==t&&r.form===t.form){var i=Eu(r);if(!i)throw Error(M(90));m_(r),hh(r,i)}}}break;case"textarea":y_(t,n);break;case"select":e=n.value,e!=null&&$i(t,!!n.multiple,e,!1)}};S_=uf;A_=ai;var xS={usingClientEntryPoint:!1,Events:[ra,Oi,Eu,w_,I_,uf]},Zs={findFiberByHostInstance:Qr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},OS={bundleType:Zs.bundleType,version:Zs.version,rendererPackageName:Zs.rendererPackageName,rendererConfig:Zs.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Mn.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=P_(t),t===null?null:t.stateNode},findFiberByHostInstance:Zs.findFiberByHostInstance||VS,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Xa=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Xa.isDisabled&&Xa.supportsFiber)try{gu=Xa.inject(OS),cn=Xa}catch{}}Nt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=xS;Nt.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!gf(e))throw Error(M(200));return NS(t,e,null,n)};Nt.createRoot=function(t,e){if(!gf(t))throw Error(M(299));var n=!1,r="",i=oE;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(r=e.identifierPrefix),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=ff(t,1,!1,null,null,n,!1,r,i),t[Pn]=e.current,Lo(t.nodeType===8?t.parentNode:t),new mf(e)};Nt.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(M(188)):(t=Object.keys(t).join(","),Error(M(268,t)));return t=P_(e),t=t===null?null:t.stateNode,t};Nt.flushSync=function(t){return ai(t)};Nt.hydrate=function(t,e,n){if(!ku(e))throw Error(M(200));return Nu(null,t,e,!0,n)};Nt.hydrateRoot=function(t,e,n){if(!gf(t))throw Error(M(405));var r=n!=null&&n.hydratedSources||null,i=!1,s="",o=oE;if(n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(o=n.onRecoverableError)),e=sE(e,null,t,1,n??null,i,!1,s,o),t[Pn]=e.current,Lo(t),r)for(t=0;t<r.length;t++)n=r[t],i=n._getVersion,i=i(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,i]:e.mutableSourceEagerHydrationData.push(n,i);return new Pu(e)};Nt.render=function(t,e,n){if(!ku(e))throw Error(M(200));return Nu(null,t,e,!1,n)};Nt.unmountComponentAtNode=function(t){if(!ku(t))throw Error(M(40));return t._reactRootContainer?(ai(function(){Nu(null,null,t,!1,function(){t._reactRootContainer=null,t[Pn]=null})}),!0):!1};Nt.unstable_batchedUpdates=uf;Nt.unstable_renderSubtreeIntoContainer=function(t,e,n,r){if(!ku(n))throw Error(M(200));if(t==null||t._reactInternals===void 0)throw Error(M(38));return Nu(t,e,n,!1,r)};Nt.version="18.3.1-next-f1338f8080-20240426";function aE(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(aE)}catch(t){console.error(t)}}aE(),a_.exports=Nt;var LS=a_.exports,lg=LS;ih.createRoot=lg.createRoot,ih.hydrateRoot=lg.hydrateRoot;const MS="modulepreload",bS=function(t){return"/"+t},ug={},Dt=function(e,n,r){let i=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),l=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));i=Promise.allSettled(n.map(u=>{if(u=bS(u),u in ug)return;ug[u]=!0;const h=u.endsWith(".css"),f=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${f}`))return;const p=document.createElement("link");if(p.rel=h?"stylesheet":MS,h||(p.as="script"),p.crossOrigin="",p.href=u,l&&p.setAttribute("nonce",l),document.head.appendChild(p),h)return new Promise((m,A)=>{p.addEventListener("load",m),p.addEventListener("error",()=>A(new Error(`Unable to preload CSS for ${u}`)))})}))}function s(o){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=o,window.dispatchEvent(l),!l.defaultPrevented)throw o}return i.then(o=>{for(const l of o||[])l.status==="rejected"&&s(l.reason);return e().catch(s)})},FS=()=>{};var cg={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lE=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let i=t.charCodeAt(r);i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=i&63|128):(i&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=i&63|128):(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=i&63|128)}return e},US=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const i=t[n++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[n++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[n++],o=t[n++],l=t[n++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const s=t[n++],o=t[n++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},uE={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,l=o?t[i+1]:0,u=i+2<t.length,h=u?t[i+2]:0,f=s>>2,p=(s&3)<<4|l>>4;let m=(l&15)<<2|h>>6,A=h&63;u||(A=64,o||(m=64)),r.push(n[f],n[p],n[m],n[A])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(lE(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):US(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<t.length;){const s=n[t.charAt(i++)],l=i<t.length?n[t.charAt(i)]:0;++i;const h=i<t.length?n[t.charAt(i)]:64;++i;const p=i<t.length?n[t.charAt(i)]:64;if(++i,s==null||l==null||h==null||p==null)throw new jS;const m=s<<2|l>>4;if(r.push(m),h!==64){const A=l<<4&240|h>>2;if(r.push(A),p!==64){const R=h<<6&192|p;r.push(R)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class jS extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const BS=function(t){const e=lE(t);return uE.encodeByteArray(e,!0)},Yl=function(t){return BS(t).replace(/\./g,"")},cE=function(t){try{return uE.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zS(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $S=()=>zS().__FIREBASE_DEFAULTS__,HS=()=>{if(typeof process>"u"||typeof cg>"u")return;const t=cg.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},WS=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&cE(t[1]);return e&&JSON.parse(e)},Vu=()=>{try{return FS()||$S()||HS()||WS()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},hE=t=>{var e,n;return(n=(e=Vu())==null?void 0:e.emulatorHosts)==null?void 0:n[t]},qS=t=>{const e=hE(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},dE=()=>{var t;return(t=Vu())==null?void 0:t.config},fE=t=>{var e;return(e=Vu())==null?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KS{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vs(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function pE(t){return(await fetch(t,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GS(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",i=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...t};return[Yl(JSON.stringify(n)),Yl(JSON.stringify(o)),""].join(".")}const Eo={};function QS(){const t={prod:[],emulator:[]};for(const e of Object.keys(Eo))Eo[e]?t.emulator.push(e):t.prod.push(e);return t}function YS(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}let hg=!1;function mE(t,e){if(typeof window>"u"||typeof document>"u"||!vs(window.location.host)||Eo[t]===e||Eo[t]||hg)return;Eo[t]=e;function n(m){return`__firebase__banner__${m}`}const r="__firebase__banner",s=QS().prod.length>0;function o(){const m=document.getElementById(r);m&&m.remove()}function l(m){m.style.display="flex",m.style.background="#7faaf0",m.style.position="fixed",m.style.bottom="5px",m.style.left="5px",m.style.padding=".5em",m.style.borderRadius="5px",m.style.alignItems="center"}function u(m,A){m.setAttribute("width","24"),m.setAttribute("id",A),m.setAttribute("height","24"),m.setAttribute("viewBox","0 0 24 24"),m.setAttribute("fill","none"),m.style.marginLeft="-6px"}function h(){const m=document.createElement("span");return m.style.cursor="pointer",m.style.marginLeft="16px",m.style.fontSize="24px",m.innerHTML=" &times;",m.onclick=()=>{hg=!0,o()},m}function f(m,A){m.setAttribute("id",A),m.innerText="Learn more",m.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",m.setAttribute("target","__blank"),m.style.paddingLeft="5px",m.style.textDecoration="underline"}function p(){const m=YS(r),A=n("text"),R=document.getElementById(A)||document.createElement("span"),V=n("learnmore"),b=document.getElementById(V)||document.createElement("a"),I=n("preprendIcon"),v=document.getElementById(I)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(m.created){const C=m.element;l(C),f(b,V);const L=h();u(v,I),C.append(v,R,b,L),document.body.appendChild(C)}s?(R.innerText="Preview backend disconnected.",v.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(v.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,R.innerText="Preview backend running in this workspace."),R.setAttribute("id",A)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",p):p()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ot(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function JS(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ot())}function XS(){var e;const t=(e=Vu())==null?void 0:e.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function ZS(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function e1(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function t1(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function n1(){const t=ot();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function r1(){return!XS()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function i1(){try{return typeof indexedDB=="object"}catch{return!1}}function s1(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const o1="FirebaseError";class bn extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=o1,Object.setPrototypeOf(this,bn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,sa.prototype.create)}}class sa{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?a1(s,r):"Error",l=`${this.serviceName}: ${o} (${i}).`;return new bn(i,l,r)}}function a1(t,e){return t.replace(l1,(n,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const l1=/\{\$([^}]+)}/g;function u1(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function li(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const i of n){if(!r.includes(i))return!1;const s=t[i],o=e[i];if(dg(s)&&dg(o)){if(!li(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!n.includes(i))return!1;return!0}function dg(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oa(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function so(t){const e={};return t.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function oo(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function c1(t,e){const n=new h1(t,e);return n.subscribe.bind(n)}class h1{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let i;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");d1(e,["next","error","complete"])?i=e:i={next:e,error:n,complete:r},i.next===void 0&&(i.next=qc),i.error===void 0&&(i.error=qc),i.complete===void 0&&(i.complete=qc);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function d1(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function qc(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function je(t){return t&&t._delegate?t._delegate:t}class ui{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gr="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f1{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new KS;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:n});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(m1(e))try{this.getOrInitializeService({instanceIdentifier:Gr})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(n);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=Gr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Gr){return this.instances.has(e)}getOptions(e=Gr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[s,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(s);r===l&&o.resolve(i)}return i}onInit(e,n){const r=this.normalizeInstanceIdentifier(n),i=this.onInitCallbacks.get(r)??new Set;i.add(e),this.onInitCallbacks.set(r,i);const s=this.instances.get(r);return s&&e(s,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const i of r)try{i(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:p1(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Gr){return this.component?this.component.multipleInstances?e:Gr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function p1(t){return t===Gr?void 0:t}function m1(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class g1{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new f1(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var re;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(re||(re={}));const y1={debug:re.DEBUG,verbose:re.VERBOSE,info:re.INFO,warn:re.WARN,error:re.ERROR,silent:re.SILENT},_1=re.INFO,v1={[re.DEBUG]:"log",[re.VERBOSE]:"log",[re.INFO]:"info",[re.WARN]:"warn",[re.ERROR]:"error"},E1=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),i=v1[e];if(i)console[i](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class yf{constructor(e){this.name=e,this._logLevel=_1,this._logHandler=E1,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in re))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?y1[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,re.DEBUG,...e),this._logHandler(this,re.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,re.VERBOSE,...e),this._logHandler(this,re.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,re.INFO,...e),this._logHandler(this,re.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,re.WARN,...e),this._logHandler(this,re.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,re.ERROR,...e),this._logHandler(this,re.ERROR,...e)}}const T1=(t,e)=>e.some(n=>t instanceof n);let fg,pg;function w1(){return fg||(fg=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function I1(){return pg||(pg=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const gE=new WeakMap,Jh=new WeakMap,yE=new WeakMap,Kc=new WeakMap,_f=new WeakMap;function S1(t){const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{n(gr(t.result)),i()},o=()=>{r(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&gE.set(n,t)}).catch(()=>{}),_f.set(e,t),e}function A1(t){if(Jh.has(t))return;const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{n(),i()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});Jh.set(t,e)}let Xh={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return Jh.get(t);if(e==="objectStoreNames")return t.objectStoreNames||yE.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return gr(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function C1(t){Xh=t(Xh)}function R1(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(Gc(this),e,...n);return yE.set(r,e.sort?e.sort():[e]),gr(r)}:I1().includes(t)?function(...e){return t.apply(Gc(this),e),gr(gE.get(this))}:function(...e){return gr(t.apply(Gc(this),e))}}function P1(t){return typeof t=="function"?R1(t):(t instanceof IDBTransaction&&A1(t),T1(t,w1())?new Proxy(t,Xh):t)}function gr(t){if(t instanceof IDBRequest)return S1(t);if(Kc.has(t))return Kc.get(t);const e=P1(t);return e!==t&&(Kc.set(t,e),_f.set(e,t)),e}const Gc=t=>_f.get(t);function k1(t,e,{blocked:n,upgrade:r,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),l=gr(o);return r&&o.addEventListener("upgradeneeded",u=>{r(gr(o.result),u.oldVersion,u.newVersion,gr(o.transaction),u)}),n&&o.addEventListener("blocked",u=>n(u.oldVersion,u.newVersion,u)),l.then(u=>{s&&u.addEventListener("close",()=>s()),i&&u.addEventListener("versionchange",h=>i(h.oldVersion,h.newVersion,h))}).catch(()=>{}),l}const N1=["get","getKey","getAll","getAllKeys","count"],V1=["put","add","delete","clear"],Qc=new Map;function mg(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Qc.get(e))return Qc.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,i=V1.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(i||N1.includes(n)))return;const s=async function(o,...l){const u=this.transaction(o,i?"readwrite":"readonly");let h=u.store;return r&&(h=h.index(l.shift())),(await Promise.all([h[n](...l),i&&u.done]))[0]};return Qc.set(e,s),s}C1(t=>({...t,get:(e,n,r)=>mg(e,n)||t.get(e,n,r),has:(e,n)=>!!mg(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class D1{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(x1(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function x1(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Zh="@firebase/app",gg="0.14.9";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vn=new yf("@firebase/app"),O1="@firebase/app-compat",L1="@firebase/analytics-compat",M1="@firebase/analytics",b1="@firebase/app-check-compat",F1="@firebase/app-check",U1="@firebase/auth",j1="@firebase/auth-compat",B1="@firebase/database",z1="@firebase/data-connect",$1="@firebase/database-compat",H1="@firebase/functions",W1="@firebase/functions-compat",q1="@firebase/installations",K1="@firebase/installations-compat",G1="@firebase/messaging",Q1="@firebase/messaging-compat",Y1="@firebase/performance",J1="@firebase/performance-compat",X1="@firebase/remote-config",Z1="@firebase/remote-config-compat",eA="@firebase/storage",tA="@firebase/storage-compat",nA="@firebase/firestore",rA="@firebase/ai",iA="@firebase/firestore-compat",sA="firebase",oA="12.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ed="[DEFAULT]",aA={[Zh]:"fire-core",[O1]:"fire-core-compat",[M1]:"fire-analytics",[L1]:"fire-analytics-compat",[F1]:"fire-app-check",[b1]:"fire-app-check-compat",[U1]:"fire-auth",[j1]:"fire-auth-compat",[B1]:"fire-rtdb",[z1]:"fire-data-connect",[$1]:"fire-rtdb-compat",[H1]:"fire-fn",[W1]:"fire-fn-compat",[q1]:"fire-iid",[K1]:"fire-iid-compat",[G1]:"fire-fcm",[Q1]:"fire-fcm-compat",[Y1]:"fire-perf",[J1]:"fire-perf-compat",[X1]:"fire-rc",[Z1]:"fire-rc-compat",[eA]:"fire-gcs",[tA]:"fire-gcs-compat",[nA]:"fire-fst",[iA]:"fire-fst-compat",[rA]:"fire-vertex","fire-js":"fire-js",[sA]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jl=new Map,lA=new Map,td=new Map;function yg(t,e){try{t.container.addComponent(e)}catch(n){Vn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function as(t){const e=t.name;if(td.has(e))return Vn.debug(`There were multiple attempts to register component ${e}.`),!1;td.set(e,t);for(const n of Jl.values())yg(n,t);for(const n of lA.values())yg(n,t);return!0}function vf(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Kt(t){return t==null?!1:t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uA={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},yr=new sa("app","Firebase",uA);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cA{constructor(e,n,r){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new ui("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw yr.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Es=oA;function _E(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r={name:ed,automaticDataCollectionEnabled:!0,...e},i=r.name;if(typeof i!="string"||!i)throw yr.create("bad-app-name",{appName:String(i)});if(n||(n=dE()),!n)throw yr.create("no-options");const s=Jl.get(i);if(s){if(li(n,s.options)&&li(r,s.config))return s;throw yr.create("duplicate-app",{appName:i})}const o=new g1(i);for(const u of td.values())o.addComponent(u);const l=new cA(n,r,o);return Jl.set(i,l),l}function vE(t=ed){const e=Jl.get(t);if(!e&&t===ed&&dE())return _E();if(!e)throw yr.create("no-app",{appName:t});return e}function _r(t,e,n){let r=aA[t]??t;n&&(r+=`-${n}`);const i=r.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const o=[`Unable to register library "${r}" with version "${e}":`];i&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Vn.warn(o.join(" "));return}as(new ui(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hA="firebase-heartbeat-database",dA=1,Ho="firebase-heartbeat-store";let Yc=null;function EE(){return Yc||(Yc=k1(hA,dA,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Ho)}catch(n){console.warn(n)}}}}).catch(t=>{throw yr.create("idb-open",{originalErrorMessage:t.message})})),Yc}async function fA(t){try{const n=(await EE()).transaction(Ho),r=await n.objectStore(Ho).get(TE(t));return await n.done,r}catch(e){if(e instanceof bn)Vn.warn(e.message);else{const n=yr.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Vn.warn(n.message)}}}async function _g(t,e){try{const r=(await EE()).transaction(Ho,"readwrite");await r.objectStore(Ho).put(e,TE(t)),await r.done}catch(n){if(n instanceof bn)Vn.warn(n.message);else{const r=yr.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Vn.warn(r.message)}}}function TE(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pA=1024,mA=30;class gA{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new _A(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=vg();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>mA){const o=vA(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Vn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=vg(),{heartbeatsToSend:r,unsentEntries:i}=yA(this._heartbeatsCache.heartbeats),s=Yl(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(n){return Vn.warn(n),""}}}function vg(){return new Date().toISOString().substring(0,10)}function yA(t,e=pA){const n=[];let r=t.slice();for(const i of t){const s=n.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),Eg(n)>e){s.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),Eg(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class _A{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return i1()?s1().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await fA(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return _g(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return _g(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Eg(t){return Yl(JSON.stringify({version:2,heartbeats:t})).length}function vA(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function EA(t){as(new ui("platform-logger",e=>new D1(e),"PRIVATE")),as(new ui("heartbeat",e=>new gA(e),"PRIVATE")),_r(Zh,gg,t),_r(Zh,gg,"esm2020"),_r("fire-js","")}EA("");function wE(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const TA=wE,IE=new sa("auth","Firebase",wE());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xl=new yf("@firebase/auth");function wA(t,...e){Xl.logLevel<=re.WARN&&Xl.warn(`Auth (${Es}): ${t}`,...e)}function yl(t,...e){Xl.logLevel<=re.ERROR&&Xl.error(`Auth (${Es}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function en(t,...e){throw Ef(t,...e)}function dn(t,...e){return Ef(t,...e)}function SE(t,e,n){const r={...TA(),[e]:n};return new sa("auth","Firebase",r).create(e,{appName:t.name})}function vr(t){return SE(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Ef(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return IE.create(t,...e)}function G(t,e,...n){if(!t)throw Ef(e,...n)}function In(t){const e="INTERNAL ASSERTION FAILED: "+t;throw yl(e),new Error(e)}function Dn(t,e){t||In(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nd(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function IA(){return Tg()==="http:"||Tg()==="https:"}function Tg(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function SA(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(IA()||e1()||"connection"in navigator)?navigator.onLine:!0}function AA(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aa{constructor(e,n){this.shortDelay=e,this.longDelay=n,Dn(n>e,"Short delay should be less than long delay!"),this.isMobile=JS()||t1()}get(){return SA()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tf(t,e){Dn(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AE{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;In("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;In("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;In("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CA={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RA=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],PA=new aa(3e4,6e4);function mi(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function Mr(t,e,n,r,i={}){return CE(t,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const l=oa({key:t.config.apiKey,...o}).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const h={method:e,headers:u,...s};return ZS()||(h.referrerPolicy="no-referrer"),t.emulatorConfig&&vs(t.emulatorConfig.host)&&(h.credentials="include"),AE.fetch()(await RE(t,t.config.apiHost,n,l),h)})}async function CE(t,e,n){t._canInitEmulator=!1;const r={...CA,...e};try{const i=new NA(t),s=await Promise.race([n(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw Za(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const l=s.ok?o.errorMessage:o.error.message,[u,h]=l.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Za(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw Za(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw Za(t,"user-disabled",o);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw SE(t,f,h);en(t,f)}}catch(i){if(i instanceof bn)throw i;en(t,"network-request-failed",{message:String(i)})}}async function Du(t,e,n,r,i={}){const s=await Mr(t,e,n,r,i);return"mfaPendingCredential"in s&&en(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function RE(t,e,n,r){const i=`${e}${n}?${r}`,s=t,o=s.config.emulator?Tf(t.config,i):`${t.config.apiScheme}://${i}`;return RA.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}function kA(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class NA{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(dn(this.auth,"network-request-failed")),PA.get())})}}function Za(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const i=dn(t,e,r);return i.customData._tokenResponse=n,i}function wg(t){return t!==void 0&&t.enterprise!==void 0}class VA{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return kA(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function DA(t,e){return Mr(t,"GET","/v2/recaptchaConfig",mi(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xA(t,e){return Mr(t,"POST","/v1/accounts:delete",e)}async function Zl(t,e){return Mr(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function To(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function OA(t,e=!1){const n=je(t),r=await n.getIdToken(e),i=wf(r);G(i&&i.exp&&i.auth_time&&i.iat,n.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:To(Jc(i.auth_time)),issuedAtTime:To(Jc(i.iat)),expirationTime:To(Jc(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Jc(t){return Number(t)*1e3}function wf(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return yl("JWT malformed, contained fewer than 3 sections"),null;try{const i=cE(n);return i?JSON.parse(i):(yl("Failed to decode base64 JWT payload"),null)}catch(i){return yl("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function Ig(t){const e=wf(t);return G(e,"internal-error"),G(typeof e.exp<"u","internal-error"),G(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Wo(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof bn&&LA(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function LA({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class MA{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rd{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=To(this.lastLoginAt),this.creationTime=To(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eu(t){var p;const e=t.auth,n=await t.getIdToken(),r=await Wo(t,Zl(e,{idToken:n}));G(r==null?void 0:r.users.length,e,"internal-error");const i=r.users[0];t._notifyReloadListener(i);const s=(p=i.providerUserInfo)!=null&&p.length?PE(i.providerUserInfo):[],o=FA(t.providerData,s),l=t.isAnonymous,u=!(t.email&&i.passwordHash)&&!(o!=null&&o.length),h=l?u:!1,f={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new rd(i.createdAt,i.lastLoginAt),isAnonymous:h};Object.assign(t,f)}async function bA(t){const e=je(t);await eu(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function FA(t,e){return[...t.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function PE(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function UA(t,e){const n=await CE(t,{},async()=>{const r=oa({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=await RE(t,i,"/v1/token",`key=${s}`),l=await t._getAdditionalHeaders();l["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:l,body:r};return t.emulatorConfig&&vs(t.emulatorConfig.host)&&(u.credentials="include"),AE.fetch()(o,u)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function jA(t,e){return Mr(t,"POST","/v2/accounts:revokeToken",mi(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qi{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){G(e.idToken,"internal-error"),G(typeof e.idToken<"u","internal-error"),G(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Ig(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){G(e.length!==0,"internal-error");const n=Ig(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(G(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:i,expiresIn:s}=await UA(e,n);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:i,expirationTime:s}=n,o=new Qi;return r&&(G(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(G(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(G(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Qi,this.toJSON())}_performRefresh(){return In("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yn(t,e){G(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class Gt{constructor({uid:e,auth:n,stsTokenManager:r,...i}){this.providerId="firebase",this.proactiveRefresh=new MA(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new rd(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const n=await Wo(this,this.stsTokenManager.getToken(this.auth,e));return G(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return OA(this,e)}reload(){return bA(this)}_assign(e){this!==e&&(G(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new Gt({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){G(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await eu(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Kt(this.auth.app))return Promise.reject(vr(this.auth));const e=await this.getIdToken();return await Wo(this,xA(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){const r=n.displayName??void 0,i=n.email??void 0,s=n.phoneNumber??void 0,o=n.photoURL??void 0,l=n.tenantId??void 0,u=n._redirectEventId??void 0,h=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:p,emailVerified:m,isAnonymous:A,providerData:R,stsTokenManager:V}=n;G(p&&V,e,"internal-error");const b=Qi.fromJSON(this.name,V);G(typeof p=="string",e,"internal-error"),Yn(r,e.name),Yn(i,e.name),G(typeof m=="boolean",e,"internal-error"),G(typeof A=="boolean",e,"internal-error"),Yn(s,e.name),Yn(o,e.name),Yn(l,e.name),Yn(u,e.name),Yn(h,e.name),Yn(f,e.name);const I=new Gt({uid:p,auth:e,email:i,emailVerified:m,displayName:r,isAnonymous:A,photoURL:o,phoneNumber:s,tenantId:l,stsTokenManager:b,createdAt:h,lastLoginAt:f});return R&&Array.isArray(R)&&(I.providerData=R.map(v=>({...v}))),u&&(I._redirectEventId=u),I}static async _fromIdTokenResponse(e,n,r=!1){const i=new Qi;i.updateFromServerResponse(n);const s=new Gt({uid:n.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await eu(s),s}static async _fromGetAccountInfoResponse(e,n,r){const i=n.users[0];G(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?PE(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),l=new Qi;l.updateFromIdToken(r);const u=new Gt({uid:i.localId,auth:e,stsTokenManager:l,isAnonymous:o}),h={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new rd(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,h),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sg=new Map;function Sn(t){Dn(t instanceof Function,"Expected a class definition");let e=Sg.get(t);return e?(Dn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Sg.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kE{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}kE.type="NONE";const Ag=kE;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _l(t,e,n){return`firebase:${t}:${e}:${n}`}class Yi{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=_l(this.userKey,i.apiKey,s),this.fullPersistenceKey=_l("persistence",i.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await Zl(this.auth,{idToken:e}).catch(()=>{});return n?Gt._fromGetAccountInfoResponse(this.auth,n,e):null}return Gt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Yi(Sn(Ag),e,r);const i=(await Promise.all(n.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let s=i[0]||Sn(Ag);const o=_l(r,e.config.apiKey,e.name);let l=null;for(const h of n)try{const f=await h._get(o);if(f){let p;if(typeof f=="string"){const m=await Zl(e,{idToken:f}).catch(()=>{});if(!m)break;p=await Gt._fromGetAccountInfoResponse(e,m,f)}else p=Gt._fromJSON(e,f);h!==s&&(l=p),s=h;break}}catch{}const u=i.filter(h=>h._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new Yi(s,e,r):(s=u[0],l&&await s._set(o,l.toJSON()),await Promise.all(n.map(async h=>{if(h!==s)try{await h._remove(o)}catch{}})),new Yi(s,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cg(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(xE(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(NE(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(LE(e))return"Blackberry";if(ME(e))return"Webos";if(VE(e))return"Safari";if((e.includes("chrome/")||DE(e))&&!e.includes("edge/"))return"Chrome";if(OE(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function NE(t=ot()){return/firefox\//i.test(t)}function VE(t=ot()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function DE(t=ot()){return/crios\//i.test(t)}function xE(t=ot()){return/iemobile/i.test(t)}function OE(t=ot()){return/android/i.test(t)}function LE(t=ot()){return/blackberry/i.test(t)}function ME(t=ot()){return/webos/i.test(t)}function If(t=ot()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function BA(t=ot()){var e;return If(t)&&!!((e=window.navigator)!=null&&e.standalone)}function zA(){return n1()&&document.documentMode===10}function bE(t=ot()){return If(t)||OE(t)||ME(t)||LE(t)||/windows phone/i.test(t)||xE(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function FE(t,e=[]){let n;switch(t){case"Browser":n=Cg(ot());break;case"Worker":n=`${Cg(ot())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Es}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $A{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=s=>new Promise((o,l)=>{try{const u=e(s);o(u)}catch(u){l(u)}});r.onAbort=n,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const i of n)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function HA(t,e={}){return Mr(t,"GET","/v2/passwordPolicy",mi(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WA=6;class qA{constructor(e){var r;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??WA,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),i&&(n.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KA{constructor(e,n,r,i){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Rg(this),this.idTokenSubscription=new Rg(this),this.beforeStateQueue=new $A(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=IE,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Sn(n)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted&&(this.persistenceManager=await Yi.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Zl(this,{idToken:e}),r=await Gt._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(Kt(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let r=n,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,l=r==null?void 0:r._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===l)&&(u!=null&&u.user)&&(r=u.user,i=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return G(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await eu(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=AA()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Kt(this.app))return Promise.reject(vr(this));const n=e?je(e):null;return n&&G(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&G(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Kt(this.app)?Promise.reject(vr(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Kt(this.app)?Promise.reject(vr(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Sn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await HA(this),n=new qA(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new sa("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await jA(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&Sn(e)||this._popupRedirectResolver;G(n,this,"argument-error"),this.redirectPersistenceManager=await Yi.create(this,[Sn(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)==null?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((n=this.currentUser)==null?void 0:n.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,i){if(this._deleted)return()=>{};const s=typeof n=="function"?n:n.next.bind(n);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(G(l,this,"internal-error"),l.then(()=>{o||s(this.currentUser)}),typeof n=="function"){const u=e.addObserver(n,r,i);return()=>{o=!0,u()}}else{const u=e.addObserver(n);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return G(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=FE(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const n=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());n&&(e["X-Firebase-Client"]=n);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var n;if(Kt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((n=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:n.getToken());return e!=null&&e.error&&wA(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Ts(t){return je(t)}class Rg{constructor(e){this.auth=e,this.observer=null,this.addObserver=c1(n=>this.observer=n)}get next(){return G(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let xu={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function GA(t){xu=t}function UE(t){return xu.loadJS(t)}function QA(){return xu.recaptchaEnterpriseScript}function YA(){return xu.gapiScript}function JA(t){return`__${t}${Math.floor(Math.random()*1e6)}`}class XA{constructor(){this.enterprise=new ZA}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class ZA{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}const eC="recaptcha-enterprise",jE="NO_RECAPTCHA";class tC{constructor(e){this.type=eC,this.auth=Ts(e)}async verify(e="verify",n=!1){async function r(s){if(!n){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(o,l)=>{DA(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)l(new Error("recaptcha Enterprise site key undefined"));else{const h=new VA(u);return s.tenantId==null?s._agentRecaptchaConfig=h:s._tenantRecaptchaConfigs[s.tenantId]=h,o(h.siteKey)}}).catch(u=>{l(u)})})}function i(s,o,l){const u=window.grecaptcha;wg(u)?u.enterprise.ready(()=>{u.enterprise.execute(s,{action:e}).then(h=>{o(h)}).catch(()=>{o(jE)})}):l(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new XA().execute("siteKey",{action:"verify"}):new Promise((s,o)=>{r(this.auth).then(l=>{if(!n&&wg(window.grecaptcha))i(l,s,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=QA();u.length!==0&&(u+=l),UE(u).then(()=>{i(l,s,o)}).catch(h=>{o(h)})}}).catch(l=>{o(l)})})}}async function Pg(t,e,n,r=!1,i=!1){const s=new tC(t);let o;if(i)o=jE;else try{o=await s.verify(n)}catch{o=await s.verify(n,!0)}const l={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in l){const u=l.phoneEnrollmentInfo.phoneNumber,h=l.phoneEnrollmentInfo.recaptchaToken;Object.assign(l,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:h,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in l){const u=l.phoneSignInInfo.recaptchaToken;Object.assign(l,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return l}return r?Object.assign(l,{captchaResp:o}):Object.assign(l,{captchaResponse:o}),Object.assign(l,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(l,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),l}async function kg(t,e,n,r,i){var s;if((s=t._getRecaptchaConfig())!=null&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await Pg(t,e,n,n==="getOobCode");return r(t,o)}else return r(t,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const l=await Pg(t,e,n,n==="getOobCode");return r(t,l)}else return Promise.reject(o)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nC(t,e){const n=vf(t,"auth");if(n.isInitialized()){const i=n.getImmediate(),s=n.getOptions();if(li(s,e??{}))return i;en(i,"already-initialized")}return n.initialize({options:e})}function rC(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(Sn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function iC(t,e,n){const r=Ts(t);G(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=BE(e),{host:o,port:l}=sC(e),u=l===null?"":`:${l}`,h={url:`${s}//${o}${u}/`},f=Object.freeze({host:o,port:l,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){G(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),G(li(h,r.config.emulator)&&li(f,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=h,r.emulatorConfig=f,r.settings.appVerificationDisabledForTesting=!0,vs(o)?(pE(`${s}//${o}${u}`),mE("Auth",!0)):oC()}function BE(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function sC(t){const e=BE(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:Ng(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:Ng(o)}}}function Ng(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function oC(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sf{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return In("not implemented")}_getIdTokenResponse(e){return In("not implemented")}_linkToIdToken(e,n){return In("not implemented")}_getReauthenticationResolver(e){return In("not implemented")}}async function aC(t,e){return Mr(t,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function lC(t,e){return Du(t,"POST","/v1/accounts:signInWithPassword",mi(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function uC(t,e){return Du(t,"POST","/v1/accounts:signInWithEmailLink",mi(t,e))}async function cC(t,e){return Du(t,"POST","/v1/accounts:signInWithEmailLink",mi(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qo extends Sf{constructor(e,n,r,i=null){super("password",r),this._email=e,this._password=n,this._tenantId=i}static _fromEmailAndPassword(e,n){return new qo(e,n,"password")}static _fromEmailAndCode(e,n,r=null){return new qo(e,n,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return kg(e,n,"signInWithPassword",lC);case"emailLink":return uC(e,{email:this._email,oobCode:this._password});default:en(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const r={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return kg(e,r,"signUpPassword",aC);case"emailLink":return cC(e,{idToken:n,email:this._email,oobCode:this._password});default:en(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ji(t,e){return Du(t,"POST","/v1/accounts:signInWithIdp",mi(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hC="http://localhost";class ci extends Sf{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new ci(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):en("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,...s}=n;if(!r||!i)return null;const o=new ci(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Ji(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,Ji(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Ji(e,n)}buildRequest(){const e={requestUri:hC,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=oa(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dC(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function fC(t){const e=so(oo(t)).link,n=e?so(oo(e)).deep_link_id:null,r=so(oo(t)).deep_link_id;return(r?so(oo(r)).link:null)||r||n||e||t}class Af{constructor(e){const n=so(oo(e)),r=n.apiKey??null,i=n.oobCode??null,s=dC(n.mode??null);G(r&&i&&s,"argument-error"),this.apiKey=r,this.operation=s,this.code=i,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){const n=fC(e);try{return new Af(n)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ws{constructor(){this.providerId=ws.PROVIDER_ID}static credential(e,n){return qo._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const r=Af.parseLink(n);return G(r,"argument-error"),qo._fromEmailAndCode(e,r.code,r.tenantId)}}ws.PROVIDER_ID="password";ws.EMAIL_PASSWORD_SIGN_IN_METHOD="password";ws.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zE{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class la extends zE{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tr extends la{constructor(){super("facebook.com")}static credential(e){return ci._fromParams({providerId:tr.PROVIDER_ID,signInMethod:tr.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return tr.credentialFromTaggedObject(e)}static credentialFromError(e){return tr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return tr.credential(e.oauthAccessToken)}catch{return null}}}tr.FACEBOOK_SIGN_IN_METHOD="facebook.com";tr.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nr extends la{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return ci._fromParams({providerId:nr.PROVIDER_ID,signInMethod:nr.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return nr.credentialFromTaggedObject(e)}static credentialFromError(e){return nr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return nr.credential(n,r)}catch{return null}}}nr.GOOGLE_SIGN_IN_METHOD="google.com";nr.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rr extends la{constructor(){super("github.com")}static credential(e){return ci._fromParams({providerId:rr.PROVIDER_ID,signInMethod:rr.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return rr.credentialFromTaggedObject(e)}static credentialFromError(e){return rr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return rr.credential(e.oauthAccessToken)}catch{return null}}}rr.GITHUB_SIGN_IN_METHOD="github.com";rr.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ir extends la{constructor(){super("twitter.com")}static credential(e,n){return ci._fromParams({providerId:ir.PROVIDER_ID,signInMethod:ir.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return ir.credentialFromTaggedObject(e)}static credentialFromError(e){return ir.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return ir.credential(n,r)}catch{return null}}}ir.TWITTER_SIGN_IN_METHOD="twitter.com";ir.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ls{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,i=!1){const s=await Gt._fromIdTokenResponse(e,r,i),o=Vg(r);return new ls({user:s,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const i=Vg(r);return new ls({user:e,providerId:i,_tokenResponse:r,operationType:n})}}function Vg(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tu extends bn{constructor(e,n,r,i){super(n.code,n.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,tu.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,i){return new tu(e,n,r,i)}}function $E(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?tu._fromErrorAndOperation(t,s,e,r):s})}async function pC(t,e,n=!1){const r=await Wo(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return ls._forOperation(t,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mC(t,e,n=!1){const{auth:r}=t;if(Kt(r.app))return Promise.reject(vr(r));const i="reauthenticate";try{const s=await Wo(t,$E(r,i,e,t),n);G(s.idToken,r,"internal-error");const o=wf(s.idToken);G(o,r,"internal-error");const{sub:l}=o;return G(t.uid===l,r,"user-mismatch"),ls._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&en(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function HE(t,e,n=!1){if(Kt(t.app))return Promise.reject(vr(t));const r="signIn",i=await $E(t,r,e),s=await ls._fromIdTokenResponse(t,r,i);return n||await t._updateCurrentUser(s.user),s}async function gC(t,e){return HE(Ts(t),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yC(t){const e=Ts(t);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}function xN(t,e,n){return Kt(t.app)?Promise.reject(vr(t)):gC(je(t),ws.credential(e,n)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&yC(t),r})}function _C(t,e,n,r){return je(t).onIdTokenChanged(e,n,r)}function vC(t,e,n){return je(t).beforeAuthStateChanged(e,n)}function EC(t,e,n,r){return je(t).onAuthStateChanged(e,n,r)}function ON(t){return je(t).signOut()}const nu="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WE{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(nu,"1"),this.storage.removeItem(nu),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TC=1e3,wC=10;class qE extends WE{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=bE(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),i=this.localCache[n];r!==i&&e(n,i,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,l,u)=>{this.notifyListeners(o,u)});return}const r=e.key;n?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);zA()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,wC):i()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},TC)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}qE.type="LOCAL";const IC=qE;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KE extends WE{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}KE.type="SESSION";const GE=KE;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function SC(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ou{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(i=>i.isListeningto(e));if(n)return n;const r=new Ou(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:i,data:s}=n.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const l=Array.from(o).map(async h=>h(n.origin,s)),u=await SC(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:u})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Ou.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cf(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AC{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((l,u)=>{const h=Cf("",20);i.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(p){const m=p;if(m.data.eventId===h)switch(m.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),l(m.data.response);break;default:clearTimeout(f),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:n},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fn(){return window}function CC(t){fn().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QE(){return typeof fn().WorkerGlobalScope<"u"&&typeof fn().importScripts=="function"}async function RC(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function PC(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function kC(){return QE()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const YE="firebaseLocalStorageDb",NC=1,ru="firebaseLocalStorage",JE="fbase_key";class ua{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function Lu(t,e){return t.transaction([ru],e?"readwrite":"readonly").objectStore(ru)}function VC(){const t=indexedDB.deleteDatabase(YE);return new ua(t).toPromise()}function id(){const t=indexedDB.open(YE,NC);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(ru,{keyPath:JE})}catch(i){n(i)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(ru)?e(r):(r.close(),await VC(),e(await id()))})})}async function Dg(t,e,n){const r=Lu(t,!0).put({[JE]:e,value:n});return new ua(r).toPromise()}async function DC(t,e){const n=Lu(t,!1).get(e),r=await new ua(n).toPromise();return r===void 0?null:r.value}function xg(t,e){const n=Lu(t,!0).delete(e);return new ua(n).toPromise()}const xC=800,OC=3;class XE{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await id(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>OC)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return QE()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ou._getInstance(kC()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var n,r;if(this.activeServiceWorker=await RC(),!this.activeServiceWorker)return;this.sender=new AC(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(n=e[0])!=null&&n.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||PC()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await id();return await Dg(e,nu,"1"),await xg(e,nu),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>Dg(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>DC(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>xg(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=Lu(i,!1).getAll();return new ua(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),n.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),n.push(i));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),xC)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}XE.type="LOCAL";const LC=XE;new aa(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function MC(t,e){return e?Sn(e):(G(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rf extends Sf{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Ji(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Ji(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Ji(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function bC(t){return HE(t.auth,new Rf(t),t.bypassAuthState)}function FC(t){const{auth:e,user:n}=t;return G(n,e,"internal-error"),mC(n,new Rf(t),t.bypassAuthState)}async function UC(t){const{auth:e,user:n}=t;return G(n,e,"internal-error"),pC(n,new Rf(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZE{constructor(e,n,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:i,tenantId:s,error:o,type:l}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:n,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(u))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return bC;case"linkViaPopup":case"linkViaRedirect":return UC;case"reauthViaPopup":case"reauthViaRedirect":return FC;default:en(this.auth,"internal-error")}}resolve(e){Dn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Dn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jC=new aa(2e3,1e4);class Bi extends ZE{constructor(e,n,r,i,s){super(e,n,i,s),this.provider=r,this.authWindow=null,this.pollId=null,Bi.currentPopupAction&&Bi.currentPopupAction.cancel(),Bi.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return G(e,this.auth,"internal-error"),e}async onExecution(){Dn(this.filter.length===1,"Popup operations only handle one event");const e=Cf();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(dn(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(dn(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Bi.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if((r=(n=this.authWindow)==null?void 0:n.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(dn(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,jC.get())};e()}}Bi.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BC="pendingRedirect",vl=new Map;class zC extends ZE{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=vl.get(this.auth._key());if(!e){try{const r=await $C(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}vl.set(this.auth._key(),e)}return this.bypassAuthState||vl.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function $C(t,e){const n=qC(e),r=WC(t);if(!await r._isAvailable())return!1;const i=await r._get(n)==="true";return await r._remove(n),i}function HC(t,e){vl.set(t._key(),e)}function WC(t){return Sn(t._redirectPersistence)}function qC(t){return _l(BC,t.config.apiKey,t.name)}async function KC(t,e,n=!1){if(Kt(t.app))return Promise.reject(vr(t));const r=Ts(t),i=MC(r,e),o=await new zC(r,i,n).execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const GC=10*60*1e3;class QC{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!YC(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!eT(e)){const i=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";n.onError(dn(this.auth,i))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=GC&&this.cachedEventUids.clear(),this.cachedEventUids.has(Og(e))}saveEventToCache(e){this.cachedEventUids.add(Og(e)),this.lastProcessedEventTime=Date.now()}}function Og(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function eT({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function YC(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return eT(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function JC(t,e={}){return Mr(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const XC=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,ZC=/^https?/;async function eR(t){if(t.config.emulator)return;const{authorizedDomains:e}=await JC(t);for(const n of e)try{if(tR(n))return}catch{}en(t,"unauthorized-domain")}function tR(t){const e=nd(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===r}if(!ZC.test(n))return!1;if(XC.test(t))return r===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nR=new aa(3e4,6e4);function Lg(){const t=fn().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function rR(t){return new Promise((e,n)=>{var i,s,o;function r(){Lg(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Lg(),n(dn(t,"network-request-failed"))},timeout:nR.get()})}if((s=(i=fn().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=fn().gapi)!=null&&o.load)r();else{const l=JA("iframefcb");return fn()[l]=()=>{gapi.load?r():n(dn(t,"network-request-failed"))},UE(`${YA()}?onload=${l}`).catch(u=>n(u))}}).catch(e=>{throw El=null,e})}let El=null;function iR(t){return El=El||rR(t),El}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sR=new aa(5e3,15e3),oR="__/auth/iframe",aR="emulator/auth/iframe",lR={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},uR=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function cR(t){const e=t.config;G(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Tf(e,aR):`https://${t.config.authDomain}/${oR}`,r={apiKey:e.apiKey,appName:t.name,v:Es},i=uR.get(t.config.apiHost);i&&(r.eid=i);const s=t._getFrameworks();return s.length&&(r.fw=s.join(",")),`${n}?${oa(r).slice(1)}`}async function hR(t){const e=await iR(t),n=fn().gapi;return G(n,t,"internal-error"),e.open({where:document.body,url:cR(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:lR,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=dn(t,"network-request-failed"),l=fn().setTimeout(()=>{s(o)},sR.get());function u(){fn().clearTimeout(l),i(r)}r.ping(u).then(u,()=>{s(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dR={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},fR=500,pR=600,mR="_blank",gR="http://localhost";class Mg{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function yR(t,e,n,r=fR,i=pR){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const u={...dR,width:r.toString(),height:i.toString(),top:s,left:o},h=ot().toLowerCase();n&&(l=DE(h)?mR:n),NE(h)&&(e=e||gR,u.scrollbars="yes");const f=Object.entries(u).reduce((m,[A,R])=>`${m}${A}=${R},`,"");if(BA(h)&&l!=="_self")return _R(e||"",l),new Mg(null);const p=window.open(e||"",l,f);G(p,t,"popup-blocked");try{p.focus()}catch{}return new Mg(p)}function _R(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vR="__/auth/handler",ER="emulator/auth/handler",TR=encodeURIComponent("fac");async function bg(t,e,n,r,i,s){G(t.config.authDomain,t,"auth-domain-config-required"),G(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:Es,eventId:i};if(e instanceof zE){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",u1(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,p]of Object.entries({}))o[f]=p}if(e instanceof la){const f=e.getScopes().filter(p=>p!=="");f.length>0&&(o.scopes=f.join(","))}t.tenantId&&(o.tid=t.tenantId);const l=o;for(const f of Object.keys(l))l[f]===void 0&&delete l[f];const u=await t._getAppCheckToken(),h=u?`#${TR}=${encodeURIComponent(u)}`:"";return`${wR(t)}?${oa(l).slice(1)}${h}`}function wR({config:t}){return t.emulator?Tf(t,ER):`https://${t.authDomain}/${vR}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xc="webStorageSupport";class IR{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=GE,this._completeRedirectFn=KC,this._overrideRedirectResult=HC}async _openPopup(e,n,r,i){var o;Dn((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await bg(e,n,r,nd(),i);return yR(e,s,Cf())}async _openRedirect(e,n,r,i){await this._originValidation(e);const s=await bg(e,n,r,nd(),i);return CC(s),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:i,promise:s}=this.eventManagers[n];return i?Promise.resolve(i):(Dn(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await hR(e),r=new QC(e);return n.register("authEvent",i=>(G(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(Xc,{type:Xc},i=>{var o;const s=(o=i==null?void 0:i[0])==null?void 0:o[Xc];s!==void 0&&n(!!s),en(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=eR(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return bE()||VE()||If()}}const SR=IR;var Fg="@firebase/auth",Ug="1.12.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AR{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){G(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CR(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function RR(t){as(new ui("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=r.options;G(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:FE(t)},h=new KA(r,i,s,u);return rC(h,n),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),as(new ui("auth-internal",e=>{const n=Ts(e.getProvider("auth").getImmediate());return(r=>new AR(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),_r(Fg,Ug,CR(t)),_r(Fg,Ug,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const PR=5*60,kR=fE("authIdTokenMaxAge")||PR;let jg=null;const NR=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>kR)return;const i=n==null?void 0:n.token;jg!==i&&(jg=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function VR(t=vE()){const e=vf(t,"auth");if(e.isInitialized())return e.getImmediate();const n=nC(t,{popupRedirectResolver:SR,persistence:[LC,IC,GE]}),r=fE("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const o=NR(s.toString());vC(n,o,()=>o(n.currentUser)),_C(n,l=>o(l))}}const i=hE("auth");return i&&iC(n,`http://${i}`),n}function DR(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}GA({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=i=>{const s=dn("internal-error");s.customData=i,n(s)},r.type="text/javascript",r.charset="UTF-8",DR().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});RR("Browser");var xR="firebase",OR="12.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */_r(xR,OR,"app");var Bg=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Er,tT;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(_,y){function E(){}E.prototype=y.prototype,_.F=y.prototype,_.prototype=new E,_.prototype.constructor=_,_.D=function(w,S,P){for(var T=Array(arguments.length-2),Le=2;Le<arguments.length;Le++)T[Le-2]=arguments[Le];return y.prototype[S].apply(w,T)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,n),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(_,y,E){E||(E=0);const w=Array(16);if(typeof y=="string")for(var S=0;S<16;++S)w[S]=y.charCodeAt(E++)|y.charCodeAt(E++)<<8|y.charCodeAt(E++)<<16|y.charCodeAt(E++)<<24;else for(S=0;S<16;++S)w[S]=y[E++]|y[E++]<<8|y[E++]<<16|y[E++]<<24;y=_.g[0],E=_.g[1],S=_.g[2];let P=_.g[3],T;T=y+(P^E&(S^P))+w[0]+3614090360&4294967295,y=E+(T<<7&4294967295|T>>>25),T=P+(S^y&(E^S))+w[1]+3905402710&4294967295,P=y+(T<<12&4294967295|T>>>20),T=S+(E^P&(y^E))+w[2]+606105819&4294967295,S=P+(T<<17&4294967295|T>>>15),T=E+(y^S&(P^y))+w[3]+3250441966&4294967295,E=S+(T<<22&4294967295|T>>>10),T=y+(P^E&(S^P))+w[4]+4118548399&4294967295,y=E+(T<<7&4294967295|T>>>25),T=P+(S^y&(E^S))+w[5]+1200080426&4294967295,P=y+(T<<12&4294967295|T>>>20),T=S+(E^P&(y^E))+w[6]+2821735955&4294967295,S=P+(T<<17&4294967295|T>>>15),T=E+(y^S&(P^y))+w[7]+4249261313&4294967295,E=S+(T<<22&4294967295|T>>>10),T=y+(P^E&(S^P))+w[8]+1770035416&4294967295,y=E+(T<<7&4294967295|T>>>25),T=P+(S^y&(E^S))+w[9]+2336552879&4294967295,P=y+(T<<12&4294967295|T>>>20),T=S+(E^P&(y^E))+w[10]+4294925233&4294967295,S=P+(T<<17&4294967295|T>>>15),T=E+(y^S&(P^y))+w[11]+2304563134&4294967295,E=S+(T<<22&4294967295|T>>>10),T=y+(P^E&(S^P))+w[12]+1804603682&4294967295,y=E+(T<<7&4294967295|T>>>25),T=P+(S^y&(E^S))+w[13]+4254626195&4294967295,P=y+(T<<12&4294967295|T>>>20),T=S+(E^P&(y^E))+w[14]+2792965006&4294967295,S=P+(T<<17&4294967295|T>>>15),T=E+(y^S&(P^y))+w[15]+1236535329&4294967295,E=S+(T<<22&4294967295|T>>>10),T=y+(S^P&(E^S))+w[1]+4129170786&4294967295,y=E+(T<<5&4294967295|T>>>27),T=P+(E^S&(y^E))+w[6]+3225465664&4294967295,P=y+(T<<9&4294967295|T>>>23),T=S+(y^E&(P^y))+w[11]+643717713&4294967295,S=P+(T<<14&4294967295|T>>>18),T=E+(P^y&(S^P))+w[0]+3921069994&4294967295,E=S+(T<<20&4294967295|T>>>12),T=y+(S^P&(E^S))+w[5]+3593408605&4294967295,y=E+(T<<5&4294967295|T>>>27),T=P+(E^S&(y^E))+w[10]+38016083&4294967295,P=y+(T<<9&4294967295|T>>>23),T=S+(y^E&(P^y))+w[15]+3634488961&4294967295,S=P+(T<<14&4294967295|T>>>18),T=E+(P^y&(S^P))+w[4]+3889429448&4294967295,E=S+(T<<20&4294967295|T>>>12),T=y+(S^P&(E^S))+w[9]+568446438&4294967295,y=E+(T<<5&4294967295|T>>>27),T=P+(E^S&(y^E))+w[14]+3275163606&4294967295,P=y+(T<<9&4294967295|T>>>23),T=S+(y^E&(P^y))+w[3]+4107603335&4294967295,S=P+(T<<14&4294967295|T>>>18),T=E+(P^y&(S^P))+w[8]+1163531501&4294967295,E=S+(T<<20&4294967295|T>>>12),T=y+(S^P&(E^S))+w[13]+2850285829&4294967295,y=E+(T<<5&4294967295|T>>>27),T=P+(E^S&(y^E))+w[2]+4243563512&4294967295,P=y+(T<<9&4294967295|T>>>23),T=S+(y^E&(P^y))+w[7]+1735328473&4294967295,S=P+(T<<14&4294967295|T>>>18),T=E+(P^y&(S^P))+w[12]+2368359562&4294967295,E=S+(T<<20&4294967295|T>>>12),T=y+(E^S^P)+w[5]+4294588738&4294967295,y=E+(T<<4&4294967295|T>>>28),T=P+(y^E^S)+w[8]+2272392833&4294967295,P=y+(T<<11&4294967295|T>>>21),T=S+(P^y^E)+w[11]+1839030562&4294967295,S=P+(T<<16&4294967295|T>>>16),T=E+(S^P^y)+w[14]+4259657740&4294967295,E=S+(T<<23&4294967295|T>>>9),T=y+(E^S^P)+w[1]+2763975236&4294967295,y=E+(T<<4&4294967295|T>>>28),T=P+(y^E^S)+w[4]+1272893353&4294967295,P=y+(T<<11&4294967295|T>>>21),T=S+(P^y^E)+w[7]+4139469664&4294967295,S=P+(T<<16&4294967295|T>>>16),T=E+(S^P^y)+w[10]+3200236656&4294967295,E=S+(T<<23&4294967295|T>>>9),T=y+(E^S^P)+w[13]+681279174&4294967295,y=E+(T<<4&4294967295|T>>>28),T=P+(y^E^S)+w[0]+3936430074&4294967295,P=y+(T<<11&4294967295|T>>>21),T=S+(P^y^E)+w[3]+3572445317&4294967295,S=P+(T<<16&4294967295|T>>>16),T=E+(S^P^y)+w[6]+76029189&4294967295,E=S+(T<<23&4294967295|T>>>9),T=y+(E^S^P)+w[9]+3654602809&4294967295,y=E+(T<<4&4294967295|T>>>28),T=P+(y^E^S)+w[12]+3873151461&4294967295,P=y+(T<<11&4294967295|T>>>21),T=S+(P^y^E)+w[15]+530742520&4294967295,S=P+(T<<16&4294967295|T>>>16),T=E+(S^P^y)+w[2]+3299628645&4294967295,E=S+(T<<23&4294967295|T>>>9),T=y+(S^(E|~P))+w[0]+4096336452&4294967295,y=E+(T<<6&4294967295|T>>>26),T=P+(E^(y|~S))+w[7]+1126891415&4294967295,P=y+(T<<10&4294967295|T>>>22),T=S+(y^(P|~E))+w[14]+2878612391&4294967295,S=P+(T<<15&4294967295|T>>>17),T=E+(P^(S|~y))+w[5]+4237533241&4294967295,E=S+(T<<21&4294967295|T>>>11),T=y+(S^(E|~P))+w[12]+1700485571&4294967295,y=E+(T<<6&4294967295|T>>>26),T=P+(E^(y|~S))+w[3]+2399980690&4294967295,P=y+(T<<10&4294967295|T>>>22),T=S+(y^(P|~E))+w[10]+4293915773&4294967295,S=P+(T<<15&4294967295|T>>>17),T=E+(P^(S|~y))+w[1]+2240044497&4294967295,E=S+(T<<21&4294967295|T>>>11),T=y+(S^(E|~P))+w[8]+1873313359&4294967295,y=E+(T<<6&4294967295|T>>>26),T=P+(E^(y|~S))+w[15]+4264355552&4294967295,P=y+(T<<10&4294967295|T>>>22),T=S+(y^(P|~E))+w[6]+2734768916&4294967295,S=P+(T<<15&4294967295|T>>>17),T=E+(P^(S|~y))+w[13]+1309151649&4294967295,E=S+(T<<21&4294967295|T>>>11),T=y+(S^(E|~P))+w[4]+4149444226&4294967295,y=E+(T<<6&4294967295|T>>>26),T=P+(E^(y|~S))+w[11]+3174756917&4294967295,P=y+(T<<10&4294967295|T>>>22),T=S+(y^(P|~E))+w[2]+718787259&4294967295,S=P+(T<<15&4294967295|T>>>17),T=E+(P^(S|~y))+w[9]+3951481745&4294967295,_.g[0]=_.g[0]+y&4294967295,_.g[1]=_.g[1]+(S+(T<<21&4294967295|T>>>11))&4294967295,_.g[2]=_.g[2]+S&4294967295,_.g[3]=_.g[3]+P&4294967295}r.prototype.v=function(_,y){y===void 0&&(y=_.length);const E=y-this.blockSize,w=this.C;let S=this.h,P=0;for(;P<y;){if(S==0)for(;P<=E;)i(this,_,P),P+=this.blockSize;if(typeof _=="string"){for(;P<y;)if(w[S++]=_.charCodeAt(P++),S==this.blockSize){i(this,w),S=0;break}}else for(;P<y;)if(w[S++]=_[P++],S==this.blockSize){i(this,w),S=0;break}}this.h=S,this.o+=y},r.prototype.A=function(){var _=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);_[0]=128;for(var y=1;y<_.length-8;++y)_[y]=0;y=this.o*8;for(var E=_.length-8;E<_.length;++E)_[E]=y&255,y/=256;for(this.v(_),_=Array(16),y=0,E=0;E<4;++E)for(let w=0;w<32;w+=8)_[y++]=this.g[E]>>>w&255;return _};function s(_,y){var E=l;return Object.prototype.hasOwnProperty.call(E,_)?E[_]:E[_]=y(_)}function o(_,y){this.h=y;const E=[];let w=!0;for(let S=_.length-1;S>=0;S--){const P=_[S]|0;w&&P==y||(E[S]=P,w=!1)}this.g=E}var l={};function u(_){return-128<=_&&_<128?s(_,function(y){return new o([y|0],y<0?-1:0)}):new o([_|0],_<0?-1:0)}function h(_){if(isNaN(_)||!isFinite(_))return p;if(_<0)return b(h(-_));const y=[];let E=1;for(let w=0;_>=E;w++)y[w]=_/E|0,E*=4294967296;return new o(y,0)}function f(_,y){if(_.length==0)throw Error("number format error: empty string");if(y=y||10,y<2||36<y)throw Error("radix out of range: "+y);if(_.charAt(0)=="-")return b(f(_.substring(1),y));if(_.indexOf("-")>=0)throw Error('number format error: interior "-" character');const E=h(Math.pow(y,8));let w=p;for(let P=0;P<_.length;P+=8){var S=Math.min(8,_.length-P);const T=parseInt(_.substring(P,P+S),y);S<8?(S=h(Math.pow(y,S)),w=w.j(S).add(h(T))):(w=w.j(E),w=w.add(h(T)))}return w}var p=u(0),m=u(1),A=u(16777216);t=o.prototype,t.m=function(){if(V(this))return-b(this).m();let _=0,y=1;for(let E=0;E<this.g.length;E++){const w=this.i(E);_+=(w>=0?w:4294967296+w)*y,y*=4294967296}return _},t.toString=function(_){if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(R(this))return"0";if(V(this))return"-"+b(this).toString(_);const y=h(Math.pow(_,6));var E=this;let w="";for(;;){const S=L(E,y).g;E=I(E,S.j(y));let P=((E.g.length>0?E.g[0]:E.h)>>>0).toString(_);if(E=S,R(E))return P+w;for(;P.length<6;)P="0"+P;w=P+w}},t.i=function(_){return _<0?0:_<this.g.length?this.g[_]:this.h};function R(_){if(_.h!=0)return!1;for(let y=0;y<_.g.length;y++)if(_.g[y]!=0)return!1;return!0}function V(_){return _.h==-1}t.l=function(_){return _=I(this,_),V(_)?-1:R(_)?0:1};function b(_){const y=_.g.length,E=[];for(let w=0;w<y;w++)E[w]=~_.g[w];return new o(E,~_.h).add(m)}t.abs=function(){return V(this)?b(this):this},t.add=function(_){const y=Math.max(this.g.length,_.g.length),E=[];let w=0;for(let S=0;S<=y;S++){let P=w+(this.i(S)&65535)+(_.i(S)&65535),T=(P>>>16)+(this.i(S)>>>16)+(_.i(S)>>>16);w=T>>>16,P&=65535,T&=65535,E[S]=T<<16|P}return new o(E,E[E.length-1]&-2147483648?-1:0)};function I(_,y){return _.add(b(y))}t.j=function(_){if(R(this)||R(_))return p;if(V(this))return V(_)?b(this).j(b(_)):b(b(this).j(_));if(V(_))return b(this.j(b(_)));if(this.l(A)<0&&_.l(A)<0)return h(this.m()*_.m());const y=this.g.length+_.g.length,E=[];for(var w=0;w<2*y;w++)E[w]=0;for(w=0;w<this.g.length;w++)for(let S=0;S<_.g.length;S++){const P=this.i(w)>>>16,T=this.i(w)&65535,Le=_.i(S)>>>16,xt=_.i(S)&65535;E[2*w+2*S]+=T*xt,v(E,2*w+2*S),E[2*w+2*S+1]+=P*xt,v(E,2*w+2*S+1),E[2*w+2*S+1]+=T*Le,v(E,2*w+2*S+1),E[2*w+2*S+2]+=P*Le,v(E,2*w+2*S+2)}for(_=0;_<y;_++)E[_]=E[2*_+1]<<16|E[2*_];for(_=y;_<2*y;_++)E[_]=0;return new o(E,0)};function v(_,y){for(;(_[y]&65535)!=_[y];)_[y+1]+=_[y]>>>16,_[y]&=65535,y++}function C(_,y){this.g=_,this.h=y}function L(_,y){if(R(y))throw Error("division by zero");if(R(_))return new C(p,p);if(V(_))return y=L(b(_),y),new C(b(y.g),b(y.h));if(V(y))return y=L(_,b(y)),new C(b(y.g),y.h);if(_.g.length>30){if(V(_)||V(y))throw Error("slowDivide_ only works with positive integers.");for(var E=m,w=y;w.l(_)<=0;)E=F(E),w=F(w);var S=j(E,1),P=j(w,1);for(w=j(w,2),E=j(E,2);!R(w);){var T=P.add(w);T.l(_)<=0&&(S=S.add(E),P=T),w=j(w,1),E=j(E,1)}return y=I(_,S.j(y)),new C(S,y)}for(S=p;_.l(y)>=0;){for(E=Math.max(1,Math.floor(_.m()/y.m())),w=Math.ceil(Math.log(E)/Math.LN2),w=w<=48?1:Math.pow(2,w-48),P=h(E),T=P.j(y);V(T)||T.l(_)>0;)E-=w,P=h(E),T=P.j(y);R(P)&&(P=m),S=S.add(P),_=I(_,T)}return new C(S,_)}t.B=function(_){return L(this,_).h},t.and=function(_){const y=Math.max(this.g.length,_.g.length),E=[];for(let w=0;w<y;w++)E[w]=this.i(w)&_.i(w);return new o(E,this.h&_.h)},t.or=function(_){const y=Math.max(this.g.length,_.g.length),E=[];for(let w=0;w<y;w++)E[w]=this.i(w)|_.i(w);return new o(E,this.h|_.h)},t.xor=function(_){const y=Math.max(this.g.length,_.g.length),E=[];for(let w=0;w<y;w++)E[w]=this.i(w)^_.i(w);return new o(E,this.h^_.h)};function F(_){const y=_.g.length+1,E=[];for(let w=0;w<y;w++)E[w]=_.i(w)<<1|_.i(w-1)>>>31;return new o(E,_.h)}function j(_,y){const E=y>>5;y%=32;const w=_.g.length-E,S=[];for(let P=0;P<w;P++)S[P]=y>0?_.i(P+E)>>>y|_.i(P+E+1)<<32-y:_.i(P+E);return new o(S,_.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,tT=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=f,Er=o}).apply(typeof Bg<"u"?Bg:typeof self<"u"?self:typeof window<"u"?window:{});var el=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var nT,ao,rT,Tl,sd,iT,sT,oT;(function(){var t,e=Object.defineProperty;function n(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof el=="object"&&el];for(var c=0;c<a.length;++c){var d=a[c];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=n(this);function i(a,c){if(c)e:{var d=r;a=a.split(".");for(var g=0;g<a.length-1;g++){var k=a[g];if(!(k in d))break e;d=d[k]}a=a[a.length-1],g=d[a],c=c(g),c!=g&&c!=null&&e(d,a,{configurable:!0,writable:!0,value:c})}}i("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),i("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),i("Object.entries",function(a){return a||function(c){var d=[],g;for(g in c)Object.prototype.hasOwnProperty.call(c,g)&&d.push([g,c[g]]);return d}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var s=s||{},o=this||self;function l(a){var c=typeof a;return c=="object"&&a!=null||c=="function"}function u(a,c,d){return a.call.apply(a.bind,arguments)}function h(a,c,d){return h=u,h.apply(null,arguments)}function f(a,c){var d=Array.prototype.slice.call(arguments,1);return function(){var g=d.slice();return g.push.apply(g,arguments),a.apply(this,g)}}function p(a,c){function d(){}d.prototype=c.prototype,a.Z=c.prototype,a.prototype=new d,a.prototype.constructor=a,a.Ob=function(g,k,N){for(var U=Array(arguments.length-2),te=2;te<arguments.length;te++)U[te-2]=arguments[te];return c.prototype[k].apply(g,U)}}var m=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function A(a){const c=a.length;if(c>0){const d=Array(c);for(let g=0;g<c;g++)d[g]=a[g];return d}return[]}function R(a,c){for(let g=1;g<arguments.length;g++){const k=arguments[g];var d=typeof k;if(d=d!="object"?d:k?Array.isArray(k)?"array":d:"null",d=="array"||d=="object"&&typeof k.length=="number"){d=a.length||0;const N=k.length||0;a.length=d+N;for(let U=0;U<N;U++)a[d+U]=k[U]}else a.push(k)}}class V{constructor(c,d){this.i=c,this.j=d,this.h=0,this.g=null}get(){let c;return this.h>0?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function b(a){o.setTimeout(()=>{throw a},0)}function I(){var a=_;let c=null;return a.g&&(c=a.g,a.g=a.g.next,a.g||(a.h=null),c.next=null),c}class v{constructor(){this.h=this.g=null}add(c,d){const g=C.get();g.set(c,d),this.h?this.h.next=g:this.g=g,this.h=g}}var C=new V(()=>new L,a=>a.reset());class L{constructor(){this.next=this.g=this.h=null}set(c,d){this.h=c,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let F,j=!1,_=new v,y=()=>{const a=Promise.resolve(void 0);F=()=>{a.then(E)}};function E(){for(var a;a=I();){try{a.h.call(a.g)}catch(d){b(d)}var c=C;c.j(a),c.h<100&&(c.h++,a.next=c.g,c.g=a)}j=!1}function w(){this.u=this.u,this.C=this.C}w.prototype.u=!1,w.prototype.dispose=function(){this.u||(this.u=!0,this.N())},w.prototype[Symbol.dispose]=function(){this.dispose()},w.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function S(a,c){this.type=a,this.g=this.target=c,this.defaultPrevented=!1}S.prototype.h=function(){this.defaultPrevented=!0};var P=function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,c=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};o.addEventListener("test",d,c),o.removeEventListener("test",d,c)}catch{}return a}();function T(a){return/^[\s\xa0]*$/.test(a)}function Le(a,c){S.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,c)}p(Le,S),Le.prototype.init=function(a,c){const d=this.type=a.type,g=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=c,c=a.relatedTarget,c||(d=="mouseover"?c=a.fromElement:d=="mouseout"&&(c=a.toElement)),this.relatedTarget=c,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&Le.Z.h.call(this)},Le.prototype.h=function(){Le.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var xt="closure_listenable_"+(Math.random()*1e6|0),jr=0;function Un(a,c,d,g,k){this.listener=a,this.proxy=null,this.src=c,this.type=d,this.capture=!!g,this.ha=k,this.key=++jr,this.da=this.fa=!1}function B(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function K(a,c,d){for(const g in a)c.call(d,a[g],g,a)}function Z(a,c){for(const d in a)c.call(void 0,a[d],d,a)}function he(a){const c={};for(const d in a)c[d]=a[d];return c}const ve="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function nn(a,c){let d,g;for(let k=1;k<arguments.length;k++){g=arguments[k];for(d in g)a[d]=g[d];for(let N=0;N<ve.length;N++)d=ve[N],Object.prototype.hasOwnProperty.call(g,d)&&(a[d]=g[d])}}function ft(a){this.src=a,this.g={},this.h=0}ft.prototype.add=function(a,c,d,g,k){const N=a.toString();a=this.g[N],a||(a=this.g[N]=[],this.h++);const U=Tt(a,c,g,k);return U>-1?(c=a[U],d||(c.fa=!1)):(c=new Un(c,this.src,N,!!g,k),c.fa=d,a.push(c)),c};function yn(a,c){const d=c.type;if(d in a.g){var g=a.g[d],k=Array.prototype.indexOf.call(g,c,void 0),N;(N=k>=0)&&Array.prototype.splice.call(g,k,1),N&&(B(c),a.g[d].length==0&&(delete a.g[d],a.h--))}}function Tt(a,c,d,g){for(let k=0;k<a.length;++k){const N=a[k];if(!N.da&&N.listener==c&&N.capture==!!d&&N.ha==g)return k}return-1}var Je="closure_lm_"+(Math.random()*1e6|0),Ps={};function _i(a,c,d,g,k){if(Array.isArray(c)){for(let N=0;N<c.length;N++)_i(a,c[N],d,g,k);return null}return d=Ot(d),a&&a[xt]?a.J(c,d,l(g)?!!g.capture:!1,k):ks(a,c,d,!1,g,k)}function ks(a,c,d,g,k,N){if(!c)throw Error("Invalid event type");const U=l(k)?!!k.capture:!!k;let te=Ei(a);if(te||(a[Je]=te=new ft(a)),d=te.add(c,d,g,U,N),d.proxy)return d;if(g=Ns(),d.proxy=g,g.src=a,g.listener=d,a.addEventListener)P||(k=U),k===void 0&&(k=!1),a.addEventListener(c.toString(),g,k);else if(a.attachEvent)a.attachEvent(wt(c.toString()),g);else if(a.addListener&&a.removeListener)a.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return d}function Ns(){function a(d){return c.call(a.src,a.listener,d)}const c=Ia;return a}function vi(a,c,d,g,k){if(Array.isArray(c))for(var N=0;N<c.length;N++)vi(a,c[N],d,g,k);else g=l(g)?!!g.capture:!!g,d=Ot(d),a&&a[xt]?(a=a.i,N=String(c).toString(),N in a.g&&(c=a.g[N],d=Tt(c,d,g,k),d>-1&&(B(c[d]),Array.prototype.splice.call(c,d,1),c.length==0&&(delete a.g[N],a.h--)))):a&&(a=Ei(a))&&(c=a.g[c.toString()],a=-1,c&&(a=Tt(c,d,g,k)),(d=a>-1?c[a]:null)&&Ee(d))}function Ee(a){if(typeof a!="number"&&a&&!a.da){var c=a.src;if(c&&c[xt])yn(c.i,a);else{var d=a.type,g=a.proxy;c.removeEventListener?c.removeEventListener(d,g,a.capture):c.detachEvent?c.detachEvent(wt(d),g):c.addListener&&c.removeListener&&c.removeListener(g),(d=Ei(c))?(yn(d,a),d.h==0&&(d.src=null,c[Je]=null)):B(a)}}}function wt(a){return a in Ps?Ps[a]:Ps[a]="on"+a}function Ia(a,c){if(a.da)a=!0;else{c=new Le(c,this);const d=a.listener,g=a.ha||a.src;a.fa&&Ee(a),a=d.call(g,c)}return a}function Ei(a){return a=a[Je],a instanceof ft?a:null}var jn="__closure_events_fn_"+(Math.random()*1e9>>>0);function Ot(a){return typeof a=="function"?a:(a[jn]||(a[jn]=function(c){return a.handleEvent(c)}),a[jn])}function Y(){w.call(this),this.i=new ft(this),this.M=this,this.G=null}p(Y,w),Y.prototype[xt]=!0,Y.prototype.removeEventListener=function(a,c,d,g){vi(this,a,c,d,g)};function ee(a,c){var d,g=a.G;if(g)for(d=[];g;g=g.G)d.push(g);if(a=a.M,g=c.type||c,typeof c=="string")c=new S(c,a);else if(c instanceof S)c.target=c.target||a;else{var k=c;c=new S(g,a),nn(c,k)}k=!0;let N,U;if(d)for(U=d.length-1;U>=0;U--)N=c.g=d[U],k=Xe(N,g,!0,c)&&k;if(N=c.g=a,k=Xe(N,g,!0,c)&&k,k=Xe(N,g,!1,c)&&k,d)for(U=0;U<d.length;U++)N=c.g=d[U],k=Xe(N,g,!1,c)&&k}Y.prototype.N=function(){if(Y.Z.N.call(this),this.i){var a=this.i;for(const c in a.g){const d=a.g[c];for(let g=0;g<d.length;g++)B(d[g]);delete a.g[c],a.h--}}this.G=null},Y.prototype.J=function(a,c,d,g){return this.i.add(String(a),c,!1,d,g)},Y.prototype.K=function(a,c,d,g){return this.i.add(String(a),c,!0,d,g)};function Xe(a,c,d,g){if(c=a.i.g[String(c)],!c)return!0;c=c.concat();let k=!0;for(let N=0;N<c.length;++N){const U=c[N];if(U&&!U.da&&U.capture==d){const te=U.listener,Me=U.ha||U.src;U.fa&&yn(a.i,U),k=te.call(Me,g)!==!1&&k}}return k&&!g.defaultPrevented}function _n(a,c){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=h(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(c)>2147483647?-1:o.setTimeout(a,c||0)}function Bn(a){a.g=_n(()=>{a.g=null,a.i&&(a.i=!1,Bn(a))},a.l);const c=a.h;a.h=null,a.m.apply(null,c)}class Sa extends w{constructor(c,d){super(),this.m=c,this.l=d,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:Bn(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function zn(a){w.call(this),this.h=a,this.g={}}p(zn,w);var ap=[];function lp(a){K(a.g,function(c,d){this.g.hasOwnProperty(d)&&Ee(c)},a),a.g={}}zn.prototype.N=function(){zn.Z.N.call(this),lp(this)},zn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var rc=o.JSON.stringify,Fw=o.JSON.parse,Uw=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function up(){}function cp(){}var Vs={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function ic(){S.call(this,"d")}p(ic,S);function sc(){S.call(this,"c")}p(sc,S);var Br={},hp=null;function Aa(){return hp=hp||new Y}Br.Ia="serverreachability";function dp(a){S.call(this,Br.Ia,a)}p(dp,S);function Ds(a){const c=Aa();ee(c,new dp(c))}Br.STAT_EVENT="statevent";function fp(a,c){S.call(this,Br.STAT_EVENT,a),this.stat=c}p(fp,S);function at(a){const c=Aa();ee(c,new fp(c,a))}Br.Ja="timingevent";function pp(a,c){S.call(this,Br.Ja,a),this.size=c}p(pp,S);function xs(a,c){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},c)}function Os(){this.g=!0}Os.prototype.ua=function(){this.g=!1};function jw(a,c,d,g,k,N){a.info(function(){if(a.g)if(N){var U="",te=N.split("&");for(let ce=0;ce<te.length;ce++){var Me=te[ce].split("=");if(Me.length>1){const Be=Me[0];Me=Me[1];const sn=Be.split("_");U=sn.length>=2&&sn[1]=="type"?U+(Be+"="+Me+"&"):U+(Be+"=redacted&")}}}else U=null;else U=N;return"XMLHTTP REQ ("+g+") [attempt "+k+"]: "+c+`
`+d+`
`+U})}function Bw(a,c,d,g,k,N,U){a.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+k+"]: "+c+`
`+d+`
`+N+" "+U})}function Ti(a,c,d,g){a.info(function(){return"XMLHTTP TEXT ("+c+"): "+$w(a,d)+(g?" "+g:"")})}function zw(a,c){a.info(function(){return"TIMEOUT: "+c})}Os.prototype.info=function(){};function $w(a,c){if(!a.g)return c;if(!c)return null;try{const N=JSON.parse(c);if(N){for(a=0;a<N.length;a++)if(Array.isArray(N[a])){var d=N[a];if(!(d.length<2)){var g=d[1];if(Array.isArray(g)&&!(g.length<1)){var k=g[0];if(k!="noop"&&k!="stop"&&k!="close")for(let U=1;U<g.length;U++)g[U]=""}}}}return rc(N)}catch{return c}}var Ca={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},mp={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},gp;function oc(){}p(oc,up),oc.prototype.g=function(){return new XMLHttpRequest},gp=new oc;function Ls(a){return encodeURIComponent(String(a))}function Hw(a){var c=1;a=a.split(":");const d=[];for(;c>0&&a.length;)d.push(a.shift()),c--;return a.length&&d.push(a.join(":")),d}function $n(a,c,d,g){this.j=a,this.i=c,this.l=d,this.S=g||1,this.V=new zn(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new yp}function yp(){this.i=null,this.g="",this.h=!1}var _p={},ac={};function lc(a,c,d){a.M=1,a.A=Pa(rn(c)),a.u=d,a.R=!0,vp(a,null)}function vp(a,c){a.F=Date.now(),Ra(a),a.B=rn(a.A);var d=a.B,g=a.S;Array.isArray(g)||(g=[String(g)]),Dp(d.i,"t",g),a.C=0,d=a.j.L,a.h=new yp,a.g=Yp(a.j,d?c:null,!a.u),a.P>0&&(a.O=new Sa(h(a.Y,a,a.g),a.P)),c=a.V,d=a.g,g=a.ba;var k="readystatechange";Array.isArray(k)||(k&&(ap[0]=k.toString()),k=ap);for(let N=0;N<k.length;N++){const U=_i(d,k[N],g||c.handleEvent,!1,c.h||c);if(!U)break;c.g[U.key]=U}c=a.J?he(a.J):{},a.u?(a.v||(a.v="POST"),c["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,c)):(a.v="GET",a.g.ea(a.B,a.v,null,c)),Ds(),jw(a.i,a.v,a.B,a.l,a.S,a.u)}$n.prototype.ba=function(a){a=a.target;const c=this.O;c&&qn(a)==3?c.j():this.Y(a)},$n.prototype.Y=function(a){try{if(a==this.g)e:{const te=qn(this.g),Me=this.g.ya(),ce=this.g.ca();if(!(te<3)&&(te!=3||this.g&&(this.h.h||this.g.la()||Up(this.g)))){this.K||te!=4||Me==7||(Me==8||ce<=0?Ds(3):Ds(2)),uc(this);var c=this.g.ca();this.X=c;var d=Ww(this);if(this.o=c==200,Bw(this.i,this.v,this.B,this.l,this.S,te,c),this.o){if(this.U&&!this.L){t:{if(this.g){var g,k=this.g;if((g=k.g?k.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!T(g)){var N=g;break t}}N=null}if(a=N)Ti(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,cc(this,a);else{this.o=!1,this.m=3,at(12),zr(this),Ms(this);break e}}if(this.R){a=!0;let Be;for(;!this.K&&this.C<d.length;)if(Be=qw(this,d),Be==ac){te==4&&(this.m=4,at(14),a=!1),Ti(this.i,this.l,null,"[Incomplete Response]");break}else if(Be==_p){this.m=4,at(15),Ti(this.i,this.l,d,"[Invalid Chunk]"),a=!1;break}else Ti(this.i,this.l,Be,null),cc(this,Be);if(Ep(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),te!=4||d.length!=0||this.h.h||(this.m=1,at(16),a=!1),this.o=this.o&&a,!a)Ti(this.i,this.l,d,"[Invalid Chunked Response]"),zr(this),Ms(this);else if(d.length>0&&!this.W){this.W=!0;var U=this.j;U.g==this&&U.aa&&!U.P&&(U.j.info("Great, no buffering proxy detected. Bytes received: "+d.length),_c(U),U.P=!0,at(11))}}else Ti(this.i,this.l,d,null),cc(this,d);te==4&&zr(this),this.o&&!this.K&&(te==4?qp(this.j,this):(this.o=!1,Ra(this)))}else oI(this.g),c==400&&d.indexOf("Unknown SID")>0?(this.m=3,at(12)):(this.m=0,at(13)),zr(this),Ms(this)}}}catch{}finally{}};function Ww(a){if(!Ep(a))return a.g.la();const c=Up(a.g);if(c==="")return"";let d="";const g=c.length,k=qn(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return zr(a),Ms(a),"";a.h.i=new o.TextDecoder}for(let N=0;N<g;N++)a.h.h=!0,d+=a.h.i.decode(c[N],{stream:!(k&&N==g-1)});return c.length=0,a.h.g+=d,a.C=0,a.h.g}function Ep(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function qw(a,c){var d=a.C,g=c.indexOf(`
`,d);return g==-1?ac:(d=Number(c.substring(d,g)),isNaN(d)?_p:(g+=1,g+d>c.length?ac:(c=c.slice(g,g+d),a.C=g+d,c)))}$n.prototype.cancel=function(){this.K=!0,zr(this)};function Ra(a){a.T=Date.now()+a.H,Tp(a,a.H)}function Tp(a,c){if(a.D!=null)throw Error("WatchDog timer not null");a.D=xs(h(a.aa,a),c)}function uc(a){a.D&&(o.clearTimeout(a.D),a.D=null)}$n.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(zw(this.i,this.B),this.M!=2&&(Ds(),at(17)),zr(this),this.m=2,Ms(this)):Tp(this,this.T-a)};function Ms(a){a.j.I==0||a.K||qp(a.j,a)}function zr(a){uc(a);var c=a.O;c&&typeof c.dispose=="function"&&c.dispose(),a.O=null,lp(a.V),a.g&&(c=a.g,a.g=null,c.abort(),c.dispose())}function cc(a,c){try{var d=a.j;if(d.I!=0&&(d.g==a||hc(d.h,a))){if(!a.L&&hc(d.h,a)&&d.I==3){try{var g=d.Ba.g.parse(c)}catch{g=null}if(Array.isArray(g)&&g.length==3){var k=g;if(k[0]==0){e:if(!d.v){if(d.g)if(d.g.F+3e3<a.F)xa(d),Va(d);else break e;yc(d),at(18)}}else d.xa=k[1],0<d.xa-d.K&&k[2]<37500&&d.F&&d.A==0&&!d.C&&(d.C=xs(h(d.Va,d),6e3));Sp(d.h)<=1&&d.ta&&(d.ta=void 0)}else Hr(d,11)}else if((a.L||d.g==a)&&xa(d),!T(c))for(k=d.Ba.g.parse(c),c=0;c<k.length;c++){let ce=k[c];const Be=ce[0];if(!(Be<=d.K))if(d.K=Be,ce=ce[1],d.I==2)if(ce[0]=="c"){d.M=ce[1],d.ba=ce[2];const sn=ce[3];sn!=null&&(d.ka=sn,d.j.info("VER="+d.ka));const Wr=ce[4];Wr!=null&&(d.za=Wr,d.j.info("SVER="+d.za));const Kn=ce[5];Kn!=null&&typeof Kn=="number"&&Kn>0&&(g=1.5*Kn,d.O=g,d.j.info("backChannelRequestTimeoutMs_="+g)),g=d;const Gn=a.g;if(Gn){const La=Gn.g?Gn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(La){var N=g.h;N.g||La.indexOf("spdy")==-1&&La.indexOf("quic")==-1&&La.indexOf("h2")==-1||(N.j=N.l,N.g=new Set,N.h&&(dc(N,N.h),N.h=null))}if(g.G){const vc=Gn.g?Gn.g.getResponseHeader("X-HTTP-Session-Id"):null;vc&&(g.wa=vc,me(g.J,g.G,vc))}}d.I=3,d.l&&d.l.ra(),d.aa&&(d.T=Date.now()-a.F,d.j.info("Handshake RTT: "+d.T+"ms")),g=d;var U=a;if(g.na=Qp(g,g.L?g.ba:null,g.W),U.L){Ap(g.h,U);var te=U,Me=g.O;Me&&(te.H=Me),te.D&&(uc(te),Ra(te)),g.g=U}else Hp(g);d.i.length>0&&Da(d)}else ce[0]!="stop"&&ce[0]!="close"||Hr(d,7);else d.I==3&&(ce[0]=="stop"||ce[0]=="close"?ce[0]=="stop"?Hr(d,7):gc(d):ce[0]!="noop"&&d.l&&d.l.qa(ce),d.A=0)}}Ds(4)}catch{}}var Kw=class{constructor(a,c){this.g=a,this.map=c}};function wp(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Ip(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Sp(a){return a.h?1:a.g?a.g.size:0}function hc(a,c){return a.h?a.h==c:a.g?a.g.has(c):!1}function dc(a,c){a.g?a.g.add(c):a.h=c}function Ap(a,c){a.h&&a.h==c?a.h=null:a.g&&a.g.has(c)&&a.g.delete(c)}wp.prototype.cancel=function(){if(this.i=Cp(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function Cp(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let c=a.i;for(const d of a.g.values())c=c.concat(d.G);return c}return A(a.i)}var Rp=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Gw(a,c){if(a){a=a.split("&");for(let d=0;d<a.length;d++){const g=a[d].indexOf("=");let k,N=null;g>=0?(k=a[d].substring(0,g),N=a[d].substring(g+1)):k=a[d],c(k,N?decodeURIComponent(N.replace(/\+/g," ")):"")}}}function Hn(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let c;a instanceof Hn?(this.l=a.l,bs(this,a.j),this.o=a.o,this.g=a.g,Fs(this,a.u),this.h=a.h,fc(this,xp(a.i)),this.m=a.m):a&&(c=String(a).match(Rp))?(this.l=!1,bs(this,c[1]||"",!0),this.o=Us(c[2]||""),this.g=Us(c[3]||"",!0),Fs(this,c[4]),this.h=Us(c[5]||"",!0),fc(this,c[6]||"",!0),this.m=Us(c[7]||"")):(this.l=!1,this.i=new Bs(null,this.l))}Hn.prototype.toString=function(){const a=[];var c=this.j;c&&a.push(js(c,Pp,!0),":");var d=this.g;return(d||c=="file")&&(a.push("//"),(c=this.o)&&a.push(js(c,Pp,!0),"@"),a.push(Ls(d).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.u,d!=null&&a.push(":",String(d))),(d=this.h)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(js(d,d.charAt(0)=="/"?Jw:Yw,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",js(d,Zw)),a.join("")},Hn.prototype.resolve=function(a){const c=rn(this);let d=!!a.j;d?bs(c,a.j):d=!!a.o,d?c.o=a.o:d=!!a.g,d?c.g=a.g:d=a.u!=null;var g=a.h;if(d)Fs(c,a.u);else if(d=!!a.h){if(g.charAt(0)!="/")if(this.g&&!this.h)g="/"+g;else{var k=c.h.lastIndexOf("/");k!=-1&&(g=c.h.slice(0,k+1)+g)}if(k=g,k==".."||k==".")g="";else if(k.indexOf("./")!=-1||k.indexOf("/.")!=-1){g=k.lastIndexOf("/",0)==0,k=k.split("/");const N=[];for(let U=0;U<k.length;){const te=k[U++];te=="."?g&&U==k.length&&N.push(""):te==".."?((N.length>1||N.length==1&&N[0]!="")&&N.pop(),g&&U==k.length&&N.push("")):(N.push(te),g=!0)}g=N.join("/")}else g=k}return d?c.h=g:d=a.i.toString()!=="",d?fc(c,xp(a.i)):d=!!a.m,d&&(c.m=a.m),c};function rn(a){return new Hn(a)}function bs(a,c,d){a.j=d?Us(c,!0):c,a.j&&(a.j=a.j.replace(/:$/,""))}function Fs(a,c){if(c){if(c=Number(c),isNaN(c)||c<0)throw Error("Bad port number "+c);a.u=c}else a.u=null}function fc(a,c,d){c instanceof Bs?(a.i=c,eI(a.i,a.l)):(d||(c=js(c,Xw)),a.i=new Bs(c,a.l))}function me(a,c,d){a.i.set(c,d)}function Pa(a){return me(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function Us(a,c){return a?c?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function js(a,c,d){return typeof a=="string"?(a=encodeURI(a).replace(c,Qw),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Qw(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Pp=/[#\/\?@]/g,Yw=/[#\?:]/g,Jw=/[#\?]/g,Xw=/[#\?@]/g,Zw=/#/g;function Bs(a,c){this.h=this.g=null,this.i=a||null,this.j=!!c}function $r(a){a.g||(a.g=new Map,a.h=0,a.i&&Gw(a.i,function(c,d){a.add(decodeURIComponent(c.replace(/\+/g," ")),d)}))}t=Bs.prototype,t.add=function(a,c){$r(this),this.i=null,a=wi(this,a);let d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(c),this.h+=1,this};function kp(a,c){$r(a),c=wi(a,c),a.g.has(c)&&(a.i=null,a.h-=a.g.get(c).length,a.g.delete(c))}function Np(a,c){return $r(a),c=wi(a,c),a.g.has(c)}t.forEach=function(a,c){$r(this),this.g.forEach(function(d,g){d.forEach(function(k){a.call(c,k,g,this)},this)},this)};function Vp(a,c){$r(a);let d=[];if(typeof c=="string")Np(a,c)&&(d=d.concat(a.g.get(wi(a,c))));else for(a=Array.from(a.g.values()),c=0;c<a.length;c++)d=d.concat(a[c]);return d}t.set=function(a,c){return $r(this),this.i=null,a=wi(this,a),Np(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[c]),this.h+=1,this},t.get=function(a,c){return a?(a=Vp(this,a),a.length>0?String(a[0]):c):c};function Dp(a,c,d){kp(a,c),d.length>0&&(a.i=null,a.g.set(wi(a,c),A(d)),a.h+=d.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],c=Array.from(this.g.keys());for(let g=0;g<c.length;g++){var d=c[g];const k=Ls(d);d=Vp(this,d);for(let N=0;N<d.length;N++){let U=k;d[N]!==""&&(U+="="+Ls(d[N])),a.push(U)}}return this.i=a.join("&")};function xp(a){const c=new Bs;return c.i=a.i,a.g&&(c.g=new Map(a.g),c.h=a.h),c}function wi(a,c){return c=String(c),a.j&&(c=c.toLowerCase()),c}function eI(a,c){c&&!a.j&&($r(a),a.i=null,a.g.forEach(function(d,g){const k=g.toLowerCase();g!=k&&(kp(this,g),Dp(this,k,d))},a)),a.j=c}function tI(a,c){const d=new Os;if(o.Image){const g=new Image;g.onload=f(Wn,d,"TestLoadImage: loaded",!0,c,g),g.onerror=f(Wn,d,"TestLoadImage: error",!1,c,g),g.onabort=f(Wn,d,"TestLoadImage: abort",!1,c,g),g.ontimeout=f(Wn,d,"TestLoadImage: timeout",!1,c,g),o.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=a}else c(!1)}function nI(a,c){const d=new Os,g=new AbortController,k=setTimeout(()=>{g.abort(),Wn(d,"TestPingServer: timeout",!1,c)},1e4);fetch(a,{signal:g.signal}).then(N=>{clearTimeout(k),N.ok?Wn(d,"TestPingServer: ok",!0,c):Wn(d,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(k),Wn(d,"TestPingServer: error",!1,c)})}function Wn(a,c,d,g,k){try{k&&(k.onload=null,k.onerror=null,k.onabort=null,k.ontimeout=null),g(d)}catch{}}function rI(){this.g=new Uw}function pc(a){this.i=a.Sb||null,this.h=a.ab||!1}p(pc,up),pc.prototype.g=function(){return new ka(this.i,this.h)};function ka(a,c){Y.call(this),this.H=a,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(ka,Y),t=ka.prototype,t.open=function(a,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=c,this.readyState=1,$s(this)},t.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const c={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(c.body=a),(this.H||o).fetch(new Request(this.D,c)).then(this.Pa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,zs(this)),this.readyState=0},t.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,$s(this)),this.g&&(this.readyState=3,$s(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Op(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function Op(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}t.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var c=a.value?a.value:new Uint8Array(0);(c=this.B.decode(c,{stream:!a.done}))&&(this.response=this.responseText+=c)}a.done?zs(this):$s(this),this.readyState==3&&Op(this)}},t.Oa=function(a){this.g&&(this.response=this.responseText=a,zs(this))},t.Na=function(a){this.g&&(this.response=a,zs(this))},t.ga=function(){this.g&&zs(this)};function zs(a){a.readyState=4,a.l=null,a.j=null,a.B=null,$s(a)}t.setRequestHeader=function(a,c){this.A.append(a,c)},t.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],c=this.h.entries();for(var d=c.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=c.next();return a.join(`\r
`)};function $s(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(ka.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function Lp(a){let c="";return K(a,function(d,g){c+=g,c+=":",c+=d,c+=`\r
`}),c}function mc(a,c,d){e:{for(g in d){var g=!1;break e}g=!0}g||(d=Lp(d),typeof a=="string"?d!=null&&Ls(d):me(a,c,d))}function Ae(a){Y.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(Ae,Y);var iI=/^https?$/i,sI=["POST","PUT"];t=Ae.prototype,t.Fa=function(a){this.H=a},t.ea=function(a,c,d,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);c=c?c.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():gp.g(),this.g.onreadystatechange=m(h(this.Ca,this));try{this.B=!0,this.g.open(c,String(a),!0),this.B=!1}catch(N){Mp(this,N);return}if(a=d||"",d=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var k in g)d.set(k,g[k]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const N of g.keys())d.set(N,g.get(N));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(d.keys()).find(N=>N.toLowerCase()=="content-type"),k=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(sI,c,void 0)>=0)||g||k||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[N,U]of d)this.g.setRequestHeader(N,U);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(N){Mp(this,N)}};function Mp(a,c){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=c,a.o=5,bp(a),Na(a)}function bp(a){a.A||(a.A=!0,ee(a,"complete"),ee(a,"error"))}t.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,ee(this,"complete"),ee(this,"abort"),Na(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Na(this,!0)),Ae.Z.N.call(this)},t.Ca=function(){this.u||(this.B||this.v||this.j?Fp(this):this.Xa())},t.Xa=function(){Fp(this)};function Fp(a){if(a.h&&typeof s<"u"){if(a.v&&qn(a)==4)setTimeout(a.Ca.bind(a),0);else if(ee(a,"readystatechange"),qn(a)==4){a.h=!1;try{const N=a.ca();e:switch(N){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break e;default:c=!1}var d;if(!(d=c)){var g;if(g=N===0){let U=String(a.D).match(Rp)[1]||null;!U&&o.self&&o.self.location&&(U=o.self.location.protocol.slice(0,-1)),g=!iI.test(U?U.toLowerCase():"")}d=g}if(d)ee(a,"complete"),ee(a,"success");else{a.o=6;try{var k=qn(a)>2?a.g.statusText:""}catch{k=""}a.l=k+" ["+a.ca()+"]",bp(a)}}finally{Na(a)}}}}function Na(a,c){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const d=a.g;a.g=null,c||ee(a,"ready");try{d.onreadystatechange=null}catch{}}}t.isActive=function(){return!!this.g};function qn(a){return a.g?a.g.readyState:0}t.ca=function(){try{return qn(this)>2?this.g.status:-1}catch{return-1}},t.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.La=function(a){if(this.g){var c=this.g.responseText;return a&&c.indexOf(a)==0&&(c=c.substring(a.length)),Fw(c)}};function Up(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function oI(a){const c={};a=(a.g&&qn(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<a.length;g++){if(T(a[g]))continue;var d=Hw(a[g]);const k=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const N=c[k]||[];c[k]=N,N.push(d)}Z(c,function(g){return g.join(", ")})}t.ya=function(){return this.o},t.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Hs(a,c,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||c}function jp(a){this.za=0,this.i=[],this.j=new Os,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Hs("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Hs("baseRetryDelayMs",5e3,a),this.Za=Hs("retryDelaySeedMs",1e4,a),this.Ta=Hs("forwardChannelMaxRetries",2,a),this.va=Hs("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new wp(a&&a.concurrentRequestLimit),this.Ba=new rI,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}t=jp.prototype,t.ka=8,t.I=1,t.connect=function(a,c,d,g){at(0),this.W=a,this.H=c||{},d&&g!==void 0&&(this.H.OSID=d,this.H.OAID=g),this.F=this.X,this.J=Qp(this,null,this.W),Da(this)};function gc(a){if(Bp(a),a.I==3){var c=a.V++,d=rn(a.J);if(me(d,"SID",a.M),me(d,"RID",c),me(d,"TYPE","terminate"),Ws(a,d),c=new $n(a,a.j,c),c.M=2,c.A=Pa(rn(d)),d=!1,o.navigator&&o.navigator.sendBeacon)try{d=o.navigator.sendBeacon(c.A.toString(),"")}catch{}!d&&o.Image&&(new Image().src=c.A,d=!0),d||(c.g=Yp(c.j,null),c.g.ea(c.A)),c.F=Date.now(),Ra(c)}Gp(a)}function Va(a){a.g&&(_c(a),a.g.cancel(),a.g=null)}function Bp(a){Va(a),a.v&&(o.clearTimeout(a.v),a.v=null),xa(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function Da(a){if(!Ip(a.h)&&!a.m){a.m=!0;var c=a.Ea;F||y(),j||(F(),j=!0),_.add(c,a),a.D=0}}function aI(a,c){return Sp(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=c.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=xs(h(a.Ea,a,c),Kp(a,a.D)),a.D++,!0)}t.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const k=new $n(this,this.j,a);let N=this.o;if(this.U&&(N?(N=he(N),nn(N,this.U)):N=this.U),this.u!==null||this.R||(k.J=N,N=null),this.S)e:{for(var c=0,d=0;d<this.i.length;d++){t:{var g=this.i[d];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(c+=g,c>4096){c=d;break e}if(c===4096||d===this.i.length-1){c=d+1;break e}}c=1e3}else c=1e3;c=$p(this,k,c),d=rn(this.J),me(d,"RID",a),me(d,"CVER",22),this.G&&me(d,"X-HTTP-Session-Id",this.G),Ws(this,d),N&&(this.R?c="headers="+Ls(Lp(N))+"&"+c:this.u&&mc(d,this.u,N)),dc(this.h,k),this.Ra&&me(d,"TYPE","init"),this.S?(me(d,"$req",c),me(d,"SID","null"),k.U=!0,lc(k,d,null)):lc(k,d,c),this.I=2}}else this.I==3&&(a?zp(this,a):this.i.length==0||Ip(this.h)||zp(this))};function zp(a,c){var d;c?d=c.l:d=a.V++;const g=rn(a.J);me(g,"SID",a.M),me(g,"RID",d),me(g,"AID",a.K),Ws(a,g),a.u&&a.o&&mc(g,a.u,a.o),d=new $n(a,a.j,d,a.D+1),a.u===null&&(d.J=a.o),c&&(a.i=c.G.concat(a.i)),c=$p(a,d,1e3),d.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),dc(a.h,d),lc(d,g,c)}function Ws(a,c){a.H&&K(a.H,function(d,g){me(c,g,d)}),a.l&&K({},function(d,g){me(c,g,d)})}function $p(a,c,d){d=Math.min(a.i.length,d);const g=a.l?h(a.l.Ka,a.l,a):null;e:{var k=a.i;let te=-1;for(;;){const Me=["count="+d];te==-1?d>0?(te=k[0].g,Me.push("ofs="+te)):te=0:Me.push("ofs="+te);let ce=!0;for(let Be=0;Be<d;Be++){var N=k[Be].g;const sn=k[Be].map;if(N-=te,N<0)te=Math.max(0,k[Be].g-100),ce=!1;else try{N="req"+N+"_"||"";try{var U=sn instanceof Map?sn:Object.entries(sn);for(const[Wr,Kn]of U){let Gn=Kn;l(Kn)&&(Gn=rc(Kn)),Me.push(N+Wr+"="+encodeURIComponent(Gn))}}catch(Wr){throw Me.push(N+"type="+encodeURIComponent("_badmap")),Wr}}catch{g&&g(sn)}}if(ce){U=Me.join("&");break e}}U=void 0}return a=a.i.splice(0,d),c.G=a,U}function Hp(a){if(!a.g&&!a.v){a.Y=1;var c=a.Da;F||y(),j||(F(),j=!0),_.add(c,a),a.A=0}}function yc(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=xs(h(a.Da,a),Kp(a,a.A)),a.A++,!0)}t.Da=function(){if(this.v=null,Wp(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=xs(h(this.Wa,this),a)}},t.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,at(10),Va(this),Wp(this))};function _c(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function Wp(a){a.g=new $n(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var c=rn(a.na);me(c,"RID","rpc"),me(c,"SID",a.M),me(c,"AID",a.K),me(c,"CI",a.F?"0":"1"),!a.F&&a.ia&&me(c,"TO",a.ia),me(c,"TYPE","xmlhttp"),Ws(a,c),a.u&&a.o&&mc(c,a.u,a.o),a.O&&(a.g.H=a.O);var d=a.g;a=a.ba,d.M=1,d.A=Pa(rn(c)),d.u=null,d.R=!0,vp(d,a)}t.Va=function(){this.C!=null&&(this.C=null,Va(this),yc(this),at(19))};function xa(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function qp(a,c){var d=null;if(a.g==c){xa(a),_c(a),a.g=null;var g=2}else if(hc(a.h,c))d=c.G,Ap(a.h,c),g=1;else return;if(a.I!=0){if(c.o)if(g==1){d=c.u?c.u.length:0,c=Date.now()-c.F;var k=a.D;g=Aa(),ee(g,new pp(g,d)),Da(a)}else Hp(a);else if(k=c.m,k==3||k==0&&c.X>0||!(g==1&&aI(a,c)||g==2&&yc(a)))switch(d&&d.length>0&&(c=a.h,c.i=c.i.concat(d)),k){case 1:Hr(a,5);break;case 4:Hr(a,10);break;case 3:Hr(a,6);break;default:Hr(a,2)}}}function Kp(a,c){let d=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(d*=2),d*c}function Hr(a,c){if(a.j.info("Error code "+c),c==2){var d=h(a.bb,a),g=a.Ua;const k=!g;g=new Hn(g||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||bs(g,"https"),Pa(g),k?tI(g.toString(),d):nI(g.toString(),d)}else at(2);a.I=0,a.l&&a.l.pa(c),Gp(a),Bp(a)}t.bb=function(a){a?(this.j.info("Successfully pinged google.com"),at(2)):(this.j.info("Failed to ping google.com"),at(1))};function Gp(a){if(a.I=0,a.ja=[],a.l){const c=Cp(a.h);(c.length!=0||a.i.length!=0)&&(R(a.ja,c),R(a.ja,a.i),a.h.i.length=0,A(a.i),a.i.length=0),a.l.oa()}}function Qp(a,c,d){var g=d instanceof Hn?rn(d):new Hn(d);if(g.g!="")c&&(g.g=c+"."+g.g),Fs(g,g.u);else{var k=o.location;g=k.protocol,c=c?c+"."+k.hostname:k.hostname,k=+k.port;const N=new Hn(null);g&&bs(N,g),c&&(N.g=c),k&&Fs(N,k),d&&(N.h=d),g=N}return d=a.G,c=a.wa,d&&c&&me(g,d,c),me(g,"VER",a.ka),Ws(a,g),g}function Yp(a,c,d){if(c&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return c=a.Aa&&!a.ma?new Ae(new pc({ab:d})):new Ae(a.ma),c.Fa(a.L),c}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function Jp(){}t=Jp.prototype,t.ra=function(){},t.qa=function(){},t.pa=function(){},t.oa=function(){},t.isActive=function(){return!0},t.Ka=function(){};function Oa(){}Oa.prototype.g=function(a,c){return new It(a,c)};function It(a,c){Y.call(this),this.g=new jp(c),this.l=a,this.h=c&&c.messageUrlParams||null,a=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(a?a["X-WebChannel-Content-Type"]=c.messageContentType:a={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.sa&&(a?a["X-WebChannel-Client-Profile"]=c.sa:a={"X-WebChannel-Client-Profile":c.sa}),this.g.U=a,(a=c&&c.Qb)&&!T(a)&&(this.g.u=a),this.A=c&&c.supportsCrossDomainXhr||!1,this.v=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!T(c)&&(this.g.G=c,a=this.h,a!==null&&c in a&&(a=this.h,c in a&&delete a[c])),this.j=new Ii(this)}p(It,Y),It.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},It.prototype.close=function(){gc(this.g)},It.prototype.o=function(a){var c=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.v&&(d={},d.__data__=rc(a),a=d);c.i.push(new Kw(c.Ya++,a)),c.I==3&&Da(c)},It.prototype.N=function(){this.g.l=null,delete this.j,gc(this.g),delete this.g,It.Z.N.call(this)};function Xp(a){ic.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var c=a.__sm__;if(c){e:{for(const d in c){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,c=c!==null&&a in c?c[a]:void 0),this.data=c}else this.data=a}p(Xp,ic);function Zp(){sc.call(this),this.status=1}p(Zp,sc);function Ii(a){this.g=a}p(Ii,Jp),Ii.prototype.ra=function(){ee(this.g,"a")},Ii.prototype.qa=function(a){ee(this.g,new Xp(a))},Ii.prototype.pa=function(a){ee(this.g,new Zp)},Ii.prototype.oa=function(){ee(this.g,"b")},Oa.prototype.createWebChannel=Oa.prototype.g,It.prototype.send=It.prototype.o,It.prototype.open=It.prototype.m,It.prototype.close=It.prototype.close,oT=function(){return new Oa},sT=function(){return Aa()},iT=Br,sd={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Ca.NO_ERROR=0,Ca.TIMEOUT=8,Ca.HTTP_ERROR=6,Tl=Ca,mp.COMPLETE="complete",rT=mp,cp.EventType=Vs,Vs.OPEN="a",Vs.CLOSE="b",Vs.ERROR="c",Vs.MESSAGE="d",Y.prototype.listen=Y.prototype.J,ao=cp,Ae.prototype.listenOnce=Ae.prototype.K,Ae.prototype.getLastError=Ae.prototype.Ha,Ae.prototype.getLastErrorCode=Ae.prototype.ya,Ae.prototype.getStatus=Ae.prototype.ca,Ae.prototype.getResponseJson=Ae.prototype.La,Ae.prototype.getResponseText=Ae.prototype.la,Ae.prototype.send=Ae.prototype.ea,Ae.prototype.setWithCredentials=Ae.prototype.Fa,nT=Ae}).apply(typeof el<"u"?el:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nt{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}nt.UNAUTHENTICATED=new nt(null),nt.GOOGLE_CREDENTIALS=new nt("google-credentials-uid"),nt.FIRST_PARTY=new nt("first-party-uid"),nt.MOCK_USER=new nt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Is="12.10.0";function LR(t){Is=t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hi=new yf("@firebase/firestore");function Ai(){return hi.logLevel}function $(t,...e){if(hi.logLevel<=re.DEBUG){const n=e.map(Pf);hi.debug(`Firestore (${Is}): ${t}`,...n)}}function xn(t,...e){if(hi.logLevel<=re.ERROR){const n=e.map(Pf);hi.error(`Firestore (${Is}): ${t}`,...n)}}function Sr(t,...e){if(hi.logLevel<=re.WARN){const n=e.map(Pf);hi.warn(`Firestore (${Is}): ${t}`,...n)}}function Pf(t){if(typeof t=="string")return t;try{return function(n){return JSON.stringify(n)}(t)}catch{return t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Q(t,e,n){let r="Unexpected state";typeof e=="string"?r=e:n=e,aT(t,r,n)}function aT(t,e,n){let r=`FIRESTORE (${Is}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{r+=" CONTEXT: "+JSON.stringify(n)}catch{r+=" CONTEXT: "+n}throw xn(r),new Error(r)}function le(t,e,n,r){let i="Unexpected state";typeof n=="string"?i=n:r=n,t||aT(e,i,r)}function X(t,e){return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const x={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class z extends bn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ti{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lT{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class uT{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(nt.UNAUTHENTICATED))}shutdown(){}}class MR{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class bR{constructor(e){this.t=e,this.currentUser=nt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){le(this.o===void 0,42304);let r=this.i;const i=u=>this.i!==r?(r=this.i,n(u)):Promise.resolve();let s=new ti;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new ti,e.enqueueRetryable(()=>i(this.currentUser))};const o=()=>{const u=s;e.enqueueRetryable(async()=>{await u.promise,await i(this.currentUser)})},l=u=>{$("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(u=>l(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?l(u):($("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new ti)}},0),o()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?($("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(le(typeof r.accessToken=="string",31837,{l:r}),new lT(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return le(e===null||typeof e=="string",2055,{h:e}),new nt(e)}}class FR{constructor(e,n,r){this.P=e,this.T=n,this.I=r,this.type="FirstParty",this.user=nt.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);const e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}}class UR{constructor(e,n,r){this.P=e,this.T=n,this.I=r}getToken(){return Promise.resolve(new FR(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(nt.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class zg{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class jR{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Kt(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){le(this.o===void 0,3512);const r=s=>{s.error!=null&&$("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const o=s.token!==this.m;return this.m=s.token,$("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?n(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{$("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.V.getImmediate({optional:!0});s?i(s):$("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new zg(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(le(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new zg(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function BR(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mu{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=BR(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<n&&(r+=e.charAt(i[s]%62))}return r}}function ie(t,e){return t<e?-1:t>e?1:0}function od(t,e){const n=Math.min(t.length,e.length);for(let r=0;r<n;r++){const i=t.charAt(r),s=e.charAt(r);if(i!==s)return Zc(i)===Zc(s)?ie(i,s):Zc(i)?1:-1}return ie(t.length,e.length)}const zR=55296,$R=57343;function Zc(t){const e=t.charCodeAt(0);return e>=zR&&e<=$R}function us(t,e,n){return t.length===e.length&&t.every((r,i)=>n(r,e[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $g="__name__";class ln{constructor(e,n,r){n===void 0?n=0:n>e.length&&Q(637,{offset:n,range:e.length}),r===void 0?r=e.length-n:r>e.length-n&&Q(1746,{length:r,range:e.length-n}),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return ln.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof ln?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let i=0;i<r;i++){const s=ln.compareSegments(e.get(i),n.get(i));if(s!==0)return s}return ie(e.length,n.length)}static compareSegments(e,n){const r=ln.isNumericId(e),i=ln.isNumericId(n);return r&&!i?-1:!r&&i?1:r&&i?ln.extractNumericId(e).compare(ln.extractNumericId(n)):od(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Er.fromString(e.substring(4,e.length-2))}}class de extends ln{construct(e,n,r){return new de(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new z(x.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(i=>i.length>0))}return new de(n)}static emptyPath(){return new de([])}}const HR=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class He extends ln{construct(e,n,r){return new He(e,n,r)}static isValidIdentifier(e){return HR.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),He.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===$g}static keyField(){return new He([$g])}static fromServerFormat(e){const n=[];let r="",i=0;const s=()=>{if(r.length===0)throw new z(x.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let o=!1;for(;i<e.length;){const l=e[i];if(l==="\\"){if(i+1===e.length)throw new z(x.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[i+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new z(x.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,i+=2}else l==="`"?(o=!o,i++):l!=="."||o?(r+=l,i++):(s(),i++)}if(s(),o)throw new z(x.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new He(n)}static emptyPath(){return new He([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W{constructor(e){this.path=e}static fromPath(e){return new W(de.fromString(e))}static fromName(e){return new W(de.fromString(e).popFirst(5))}static empty(){return new W(de.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&de.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return de.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new W(new de(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cT(t,e,n){if(!n)throw new z(x.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function hT(t,e,n,r){if(e===!0&&r===!0)throw new z(x.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function Hg(t){if(!W.isDocumentKey(t))throw new z(x.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function Wg(t){if(W.isDocumentKey(t))throw new z(x.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function dT(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function bu(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":Q(12329,{type:typeof t})}function Jt(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new z(x.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=bu(t);throw new z(x.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oe(t,e){const n={typeString:t};return e&&(n.value=e),n}function ca(t,e){if(!dT(t))throw new z(x.INVALID_ARGUMENT,"JSON must be an object");let n;for(const r in e)if(e[r]){const i=e[r].typeString,s="value"in e[r]?{value:e[r].value}:void 0;if(!(r in t)){n=`JSON missing required field: '${r}'`;break}const o=t[r];if(i&&typeof o!==i){n=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&o!==s.value){n=`Expected '${r}' field to equal '${s.value}'`;break}}if(n)throw new z(x.INVALID_ARGUMENT,n);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qg=-62135596800,Kg=1e6;class fe{static now(){return fe.fromMillis(Date.now())}static fromDate(e){return fe.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor((e-1e3*n)*Kg);return new fe(n,r)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new z(x.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new z(x.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<qg)throw new z(x.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new z(x.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Kg}_compareTo(e){return this.seconds===e.seconds?ie(this.nanoseconds,e.nanoseconds):ie(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:fe._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(ca(e,fe._jsonSchema))return new fe(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-qg;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}fe._jsonSchemaVersion="firestore/timestamp/1.0",fe._jsonSchema={type:Oe("string",fe._jsonSchemaVersion),seconds:Oe("number"),nanoseconds:Oe("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J{static fromTimestamp(e){return new J(e)}static min(){return new J(new fe(0,0))}static max(){return new J(new fe(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ko=-1;function WR(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,i=J.fromTimestamp(r===1e9?new fe(n+1,0):new fe(n,r));return new Ar(i,W.empty(),e)}function qR(t){return new Ar(t.readTime,t.key,Ko)}class Ar{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new Ar(J.min(),W.empty(),Ko)}static max(){return new Ar(J.max(),W.empty(),Ko)}}function KR(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=W.comparator(t.documentKey,e.documentKey),n!==0?n:ie(t.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const GR="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class QR{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ss(t){if(t.code!==x.FAILED_PRECONDITION||t.message!==GR)throw t;$("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&Q(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new O((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(n,s).next(r,i)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof O?n:O.resolve(n)}catch(n){return O.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):O.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):O.reject(n)}static resolve(e){return new O((n,r)=>{n(e)})}static reject(e){return new O((n,r)=>{r(e)})}static waitFor(e){return new O((n,r)=>{let i=0,s=0,o=!1;e.forEach(l=>{++i,l.next(()=>{++s,o&&s===i&&n()},u=>r(u))}),o=!0,s===i&&n()})}static or(e){let n=O.resolve(!1);for(const r of e)n=n.next(i=>i?O.resolve(i):r());return n}static forEach(e,n){const r=[];return e.forEach((i,s)=>{r.push(n.call(this,i,s))}),this.waitFor(r)}static mapArray(e,n){return new O((r,i)=>{const s=e.length,o=new Array(s);let l=0;for(let u=0;u<s;u++){const h=u;n(e[h]).next(f=>{o[h]=f,++l,l===s&&r(o)},f=>i(f))}})}static doWhile(e,n){return new O((r,i)=>{const s=()=>{e()===!0?n().next(()=>{s()},i):r()};s()})}}function YR(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function As(t){return t.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fu{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this.ae(r),this.ue=r=>n.writeSequenceNumber(r))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}Fu.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kf=-1;function Uu(t){return t==null}function iu(t){return t===0&&1/t==-1/0}function JR(t){return typeof t=="number"&&Number.isInteger(t)&&!iu(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fT="";function XR(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=Gg(e)),e=ZR(t.get(n),e);return Gg(e)}function ZR(t,e){let n=e;const r=t.length;for(let i=0;i<r;i++){const s=t.charAt(i);switch(s){case"\0":n+="";break;case fT:n+="";break;default:n+=s}}return n}function Gg(t){return t+fT+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qg(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function br(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function pT(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Se{constructor(e,n){this.comparator=e,this.root=n||Ge.EMPTY}insert(e,n){return new Se(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,Ge.BLACK,null,null))}remove(e){return new Se(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ge.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return n.value;r<0?n=n.left:r>0&&(n=n.right)}return null}indexOf(e){let n=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return n+r.left.size;i<0?r=r.left:(n+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,r)=>(e(n,r),!1))}toString(){const e=[];return this.inorderTraversal((n,r)=>(e.push(`${n}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new tl(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new tl(this.root,e,this.comparator,!1)}getReverseIterator(){return new tl(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new tl(this.root,e,this.comparator,!0)}}class tl{constructor(e,n,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=n?r(e.key,n):1,n&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Ge{constructor(e,n,r,i,s){this.key=e,this.value=n,this.color=r??Ge.RED,this.left=i??Ge.EMPTY,this.right=s??Ge.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,r,i,s){return new Ge(e??this.key,n??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,n,r),null):s===0?i.copy(null,n,null,null,null):i.copy(null,null,null,null,i.right.insert(e,n,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return Ge.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let r,i=this;if(n(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,n),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),n(e,i.key)===0){if(i.right.isEmpty())return Ge.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,n))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Ge.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Ge.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw Q(43730,{key:this.key,value:this.value});if(this.right.isRed())throw Q(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw Q(27949);return e+(this.isRed()?0:1)}}Ge.EMPTY=null,Ge.RED=!0,Ge.BLACK=!1;Ge.EMPTY=new class{constructor(){this.size=0}get key(){throw Q(57766)}get value(){throw Q(16141)}get color(){throw Q(16727)}get left(){throw Q(29726)}get right(){throw Q(36894)}copy(e,n,r,i,s){return this}insert(e,n,r){return new Ge(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ue{constructor(e){this.comparator=e,this.data=new Se(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;n(i.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new Yg(this.data.getIterator())}getIteratorFrom(e){return new Yg(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof Ue)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const i=n.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new Ue(this.comparator);return n.data=e,n}}class Yg{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(e){this.fields=e,e.sort(He.comparator)}static empty(){return new Rt([])}unionWith(e){let n=new Ue(He.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new Rt(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return us(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mT extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qe{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new mT("Invalid base64 string: "+s):s}}(e);return new qe(n)}static fromUint8Array(e){const n=function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s}(e);return new qe(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let i=0;i<n.length;i++)r[i]=n.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return ie(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}qe.EMPTY_BYTE_STRING=new qe("");const eP=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Cr(t){if(le(!!t,39018),typeof t=="string"){let e=0;const n=eP.exec(t);if(le(!!n,46558,{timestamp:t}),n[1]){let i=n[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Pe(t.seconds),nanos:Pe(t.nanos)}}function Pe(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Rr(t){return typeof t=="string"?qe.fromBase64String(t):qe.fromUint8Array(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gT="server_timestamp",yT="__type__",_T="__previous_value__",vT="__local_write_time__";function Nf(t){var n,r;return((r=(((n=t==null?void 0:t.mapValue)==null?void 0:n.fields)||{})[yT])==null?void 0:r.stringValue)===gT}function ju(t){const e=t.mapValue.fields[_T];return Nf(e)?ju(e):e}function Go(t){const e=Cr(t.mapValue.fields[vT].timestampValue);return new fe(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tP{constructor(e,n,r,i,s,o,l,u,h,f,p){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=l,this.longPollingOptions=u,this.useFetchStreams=h,this.isUsingEmulator=f,this.apiKey=p}}const su="(default)";class cs{constructor(e,n){this.projectId=e,this.database=n||su}static empty(){return new cs("","")}get isDefaultDatabase(){return this.database===su}isEqual(e){return e instanceof cs&&e.projectId===this.projectId&&e.database===this.database}}function nP(t,e){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new z(x.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new cs(t.options.projectId,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ET="__type__",rP="__max__",nl={mapValue:{}},TT="__vector__",ou="value";function Pr(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?Nf(t)?4:sP(t)?9007199254740991:iP(t)?10:11:Q(28295,{value:t})}function gn(t,e){if(t===e)return!0;const n=Pr(t);if(n!==Pr(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Go(t).isEqual(Go(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const o=Cr(i.timestampValue),l=Cr(s.timestampValue);return o.seconds===l.seconds&&o.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(i,s){return Rr(i.bytesValue).isEqual(Rr(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(i,s){return Pe(i.geoPointValue.latitude)===Pe(s.geoPointValue.latitude)&&Pe(i.geoPointValue.longitude)===Pe(s.geoPointValue.longitude)}(t,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return Pe(i.integerValue)===Pe(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const o=Pe(i.doubleValue),l=Pe(s.doubleValue);return o===l?iu(o)===iu(l):isNaN(o)&&isNaN(l)}return!1}(t,e);case 9:return us(t.arrayValue.values||[],e.arrayValue.values||[],gn);case 10:case 11:return function(i,s){const o=i.mapValue.fields||{},l=s.mapValue.fields||{};if(Qg(o)!==Qg(l))return!1;for(const u in o)if(o.hasOwnProperty(u)&&(l[u]===void 0||!gn(o[u],l[u])))return!1;return!0}(t,e);default:return Q(52216,{left:t})}}function Qo(t,e){return(t.values||[]).find(n=>gn(n,e))!==void 0}function hs(t,e){if(t===e)return 0;const n=Pr(t),r=Pr(e);if(n!==r)return ie(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return ie(t.booleanValue,e.booleanValue);case 2:return function(s,o){const l=Pe(s.integerValue||s.doubleValue),u=Pe(o.integerValue||o.doubleValue);return l<u?-1:l>u?1:l===u?0:isNaN(l)?isNaN(u)?0:-1:1}(t,e);case 3:return Jg(t.timestampValue,e.timestampValue);case 4:return Jg(Go(t),Go(e));case 5:return od(t.stringValue,e.stringValue);case 6:return function(s,o){const l=Rr(s),u=Rr(o);return l.compareTo(u)}(t.bytesValue,e.bytesValue);case 7:return function(s,o){const l=s.split("/"),u=o.split("/");for(let h=0;h<l.length&&h<u.length;h++){const f=ie(l[h],u[h]);if(f!==0)return f}return ie(l.length,u.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,o){const l=ie(Pe(s.latitude),Pe(o.latitude));return l!==0?l:ie(Pe(s.longitude),Pe(o.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return Xg(t.arrayValue,e.arrayValue);case 10:return function(s,o){var m,A,R,V;const l=s.fields||{},u=o.fields||{},h=(m=l[ou])==null?void 0:m.arrayValue,f=(A=u[ou])==null?void 0:A.arrayValue,p=ie(((R=h==null?void 0:h.values)==null?void 0:R.length)||0,((V=f==null?void 0:f.values)==null?void 0:V.length)||0);return p!==0?p:Xg(h,f)}(t.mapValue,e.mapValue);case 11:return function(s,o){if(s===nl.mapValue&&o===nl.mapValue)return 0;if(s===nl.mapValue)return 1;if(o===nl.mapValue)return-1;const l=s.fields||{},u=Object.keys(l),h=o.fields||{},f=Object.keys(h);u.sort(),f.sort();for(let p=0;p<u.length&&p<f.length;++p){const m=od(u[p],f[p]);if(m!==0)return m;const A=hs(l[u[p]],h[f[p]]);if(A!==0)return A}return ie(u.length,f.length)}(t.mapValue,e.mapValue);default:throw Q(23264,{he:n})}}function Jg(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return ie(t,e);const n=Cr(t),r=Cr(e),i=ie(n.seconds,r.seconds);return i!==0?i:ie(n.nanos,r.nanos)}function Xg(t,e){const n=t.values||[],r=e.values||[];for(let i=0;i<n.length&&i<r.length;++i){const s=hs(n[i],r[i]);if(s)return s}return ie(n.length,r.length)}function ds(t){return ad(t)}function ad(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=Cr(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Rr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return W.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",i=!0;for(const s of n.values||[])i?i=!1:r+=",",r+=ad(s);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let i="{",s=!0;for(const o of r)s?s=!1:i+=",",i+=`${o}:${ad(n.fields[o])}`;return i+"}"}(t.mapValue):Q(61005,{value:t})}function wl(t){switch(Pr(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=ju(t);return e?16+wl(e):16;case 5:return 2*t.stringValue.length;case 6:return Rr(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((i,s)=>i+wl(s),0)}(t.arrayValue);case 10:case 11:return function(r){let i=0;return br(r.fields,(s,o)=>{i+=s.length+wl(o)}),i}(t.mapValue);default:throw Q(13486,{value:t})}}function Zg(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function ld(t){return!!t&&"integerValue"in t}function Vf(t){return!!t&&"arrayValue"in t}function ey(t){return!!t&&"nullValue"in t}function ty(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function Il(t){return!!t&&"mapValue"in t}function iP(t){var n,r;return((r=(((n=t==null?void 0:t.mapValue)==null?void 0:n.fields)||{})[ET])==null?void 0:r.stringValue)===TT}function wo(t){if(t.geoPointValue)return{geoPointValue:{...t.geoPointValue}};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:{...t.timestampValue}};if(t.mapValue){const e={mapValue:{fields:{}}};return br(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=wo(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=wo(t.arrayValue.values[n]);return e}return{...t}}function sP(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===rP}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gt{constructor(e){this.value=e}static empty(){return new gt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!Il(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=wo(n)}setAll(e){let n=He.emptyPath(),r={},i=[];e.forEach((o,l)=>{if(!n.isImmediateParentOf(l)){const u=this.getFieldsMap(n);this.applyChanges(u,r,i),r={},i=[],n=l.popLast()}o?r[l.lastSegment()]=wo(o):i.push(l.lastSegment())});const s=this.getFieldsMap(n);this.applyChanges(s,r,i)}delete(e){const n=this.field(e.popLast());Il(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return gn(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=n.mapValue.fields[e.get(r)];Il(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=i),n=i}return n.mapValue.fields}applyChanges(e,n,r){br(n,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new gt(wo(this.value))}}function wT(t){const e=[];return br(t.fields,(n,r)=>{const i=new He([n]);if(Il(r)){const s=wT(r.mapValue).fields;if(s.length===0)e.push(i);else for(const o of s)e.push(i.child(o))}else e.push(i)}),new Rt(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it{constructor(e,n,r,i,s,o,l){this.key=e,this.documentType=n,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=l}static newInvalidDocument(e){return new it(e,0,J.min(),J.min(),J.min(),gt.empty(),0)}static newFoundDocument(e,n,r,i){return new it(e,1,n,J.min(),r,i,0)}static newNoDocument(e,n){return new it(e,2,n,J.min(),J.min(),gt.empty(),0)}static newUnknownDocument(e,n){return new it(e,3,n,J.min(),J.min(),gt.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(J.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=gt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=gt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=J.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof it&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new it(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class au{constructor(e,n){this.position=e,this.inclusive=n}}function ny(t,e,n){let r=0;for(let i=0;i<t.position.length;i++){const s=e[i],o=t.position[i];if(s.field.isKeyField()?r=W.comparator(W.fromName(o.referenceValue),n.key):r=hs(o,n.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function ry(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!gn(t.position[n],e.position[n]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yo{constructor(e,n="asc"){this.field=e,this.dir=n}}function oP(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class IT{}class xe extends IT{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new lP(e,n,r):n==="array-contains"?new hP(e,r):n==="in"?new dP(e,r):n==="not-in"?new fP(e,r):n==="array-contains-any"?new pP(e,r):new xe(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new uP(e,r):new cP(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(hs(n,this.value)):n!==null&&Pr(this.value)===Pr(n)&&this.matchesComparison(hs(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return Q(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class tn extends IT{constructor(e,n){super(),this.filters=e,this.op=n,this.Pe=null}static create(e,n){return new tn(e,n)}matches(e){return ST(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function ST(t){return t.op==="and"}function AT(t){return aP(t)&&ST(t)}function aP(t){for(const e of t.filters)if(e instanceof tn)return!1;return!0}function ud(t){if(t instanceof xe)return t.field.canonicalString()+t.op.toString()+ds(t.value);if(AT(t))return t.filters.map(e=>ud(e)).join(",");{const e=t.filters.map(n=>ud(n)).join(",");return`${t.op}(${e})`}}function CT(t,e){return t instanceof xe?function(r,i){return i instanceof xe&&r.op===i.op&&r.field.isEqual(i.field)&&gn(r.value,i.value)}(t,e):t instanceof tn?function(r,i){return i instanceof tn&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,o,l)=>s&&CT(o,i.filters[l]),!0):!1}(t,e):void Q(19439)}function RT(t){return t instanceof xe?function(n){return`${n.field.canonicalString()} ${n.op} ${ds(n.value)}`}(t):t instanceof tn?function(n){return n.op.toString()+" {"+n.getFilters().map(RT).join(" ,")+"}"}(t):"Filter"}class lP extends xe{constructor(e,n,r){super(e,n,r),this.key=W.fromName(r.referenceValue)}matches(e){const n=W.comparator(e.key,this.key);return this.matchesComparison(n)}}class uP extends xe{constructor(e,n){super(e,"in",n),this.keys=PT("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class cP extends xe{constructor(e,n){super(e,"not-in",n),this.keys=PT("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function PT(t,e){var n;return(((n=e.arrayValue)==null?void 0:n.values)||[]).map(r=>W.fromName(r.referenceValue))}class hP extends xe{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return Vf(n)&&Qo(n.arrayValue,this.value)}}class dP extends xe{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&Qo(this.value.arrayValue,n)}}class fP extends xe{constructor(e,n){super(e,"not-in",n)}matches(e){if(Qo(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!Qo(this.value.arrayValue,n)}}class pP extends xe{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!Vf(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>Qo(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mP{constructor(e,n=null,r=[],i=[],s=null,o=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=o,this.endAt=l,this.Te=null}}function iy(t,e=null,n=[],r=[],i=null,s=null,o=null){return new mP(t,e,n,r,i,s,o)}function Df(t){const e=X(t);if(e.Te===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>ud(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),Uu(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>ds(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>ds(r)).join(",")),e.Te=n}return e.Te}function xf(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!oP(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!CT(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!ry(t.startAt,e.startAt)&&ry(t.endAt,e.endAt)}function cd(t){return W.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cs{constructor(e,n=null,r=[],i=[],s=null,o="F",l=null,u=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=l,this.endAt=u,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}}function gP(t,e,n,r,i,s,o,l){return new Cs(t,e,n,r,i,s,o,l)}function Of(t){return new Cs(t)}function sy(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function yP(t){return W.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}function kT(t){return t.collectionGroup!==null}function Io(t){const e=X(t);if(e.Ie===null){e.Ie=[];const n=new Set;for(const s of e.explicitOrderBy)e.Ie.push(s),n.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let l=new Ue(He.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(h=>{h.isInequality()&&(l=l.add(h.field))})}),l})(e).forEach(s=>{n.has(s.canonicalString())||s.isKeyField()||e.Ie.push(new Yo(s,r))}),n.has(He.keyField().canonicalString())||e.Ie.push(new Yo(He.keyField(),r))}return e.Ie}function pn(t){const e=X(t);return e.Ee||(e.Ee=_P(e,Io(t))),e.Ee}function _P(t,e){if(t.limitType==="F")return iy(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new Yo(i.field,s)});const n=t.endAt?new au(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new au(t.startAt.position,t.startAt.inclusive):null;return iy(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function hd(t,e){const n=t.filters.concat([e]);return new Cs(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function vP(t,e){const n=t.explicitOrderBy.concat([e]);return new Cs(t.path,t.collectionGroup,n,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}function dd(t,e,n){return new Cs(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function Bu(t,e){return xf(pn(t),pn(e))&&t.limitType===e.limitType}function NT(t){return`${Df(pn(t))}|lt:${t.limitType}`}function Ci(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(i=>RT(i)).join(", ")}]`),Uu(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(i=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(i)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(i=>ds(i)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(i=>ds(i)).join(",")),`Target(${r})`}(pn(t))}; limitType=${t.limitType})`}function zu(t,e){return e.isFoundDocument()&&function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):W.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(t,e)&&function(r,i){for(const s of Io(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(t,e)&&function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0}(t,e)&&function(r,i){return!(r.startAt&&!function(o,l,u){const h=ny(o,l,u);return o.inclusive?h<=0:h<0}(r.startAt,Io(r),i)||r.endAt&&!function(o,l,u){const h=ny(o,l,u);return o.inclusive?h>=0:h>0}(r.endAt,Io(r),i))}(t,e)}function EP(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function VT(t){return(e,n)=>{let r=!1;for(const i of Io(t)){const s=TP(i,e,n);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function TP(t,e,n){const r=t.field.isKeyField()?W.comparator(e.key,n.key):function(s,o,l){const u=o.data.field(s),h=l.data.field(s);return u!==null&&h!==null?hs(u,h):Q(42886)}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return Q(19790,{direction:t.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gi{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,n]);i.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[n]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){br(this.inner,(n,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return pT(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wP=new Se(W.comparator);function On(){return wP}const DT=new Se(W.comparator);function lo(...t){let e=DT;for(const n of t)e=e.insert(n.key,n);return e}function xT(t){let e=DT;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function Xr(){return So()}function OT(){return So()}function So(){return new gi(t=>t.toString(),(t,e)=>t.isEqual(e))}const IP=new Se(W.comparator),SP=new Ue(W.comparator);function se(...t){let e=SP;for(const n of t)e=e.add(n);return e}const AP=new Ue(ie);function CP(){return AP}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lf(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:iu(e)?"-0":e}}function LT(t){return{integerValue:""+t}}function RP(t,e){return JR(e)?LT(e):Lf(t,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $u{constructor(){this._=void 0}}function PP(t,e,n){return t instanceof Jo?function(i,s){const o={fields:{[yT]:{stringValue:gT},[vT]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&Nf(s)&&(s=ju(s)),s&&(o.fields[_T]=s),{mapValue:o}}(n,e):t instanceof Xo?bT(t,e):t instanceof Zo?FT(t,e):function(i,s){const o=MT(i,s),l=oy(o)+oy(i.Ae);return ld(o)&&ld(i.Ae)?LT(l):Lf(i.serializer,l)}(t,e)}function kP(t,e,n){return t instanceof Xo?bT(t,e):t instanceof Zo?FT(t,e):n}function MT(t,e){return t instanceof lu?function(r){return ld(r)||function(s){return!!s&&"doubleValue"in s}(r)}(e)?e:{integerValue:0}:null}class Jo extends $u{}class Xo extends $u{constructor(e){super(),this.elements=e}}function bT(t,e){const n=UT(e);for(const r of t.elements)n.some(i=>gn(i,r))||n.push(r);return{arrayValue:{values:n}}}class Zo extends $u{constructor(e){super(),this.elements=e}}function FT(t,e){let n=UT(e);for(const r of t.elements)n=n.filter(i=>!gn(i,r));return{arrayValue:{values:n}}}class lu extends $u{constructor(e,n){super(),this.serializer=e,this.Ae=n}}function oy(t){return Pe(t.integerValue||t.doubleValue)}function UT(t){return Vf(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NP{constructor(e,n){this.field=e,this.transform=n}}function VP(t,e){return t.field.isEqual(e.field)&&function(r,i){return r instanceof Xo&&i instanceof Xo||r instanceof Zo&&i instanceof Zo?us(r.elements,i.elements,gn):r instanceof lu&&i instanceof lu?gn(r.Ae,i.Ae):r instanceof Jo&&i instanceof Jo}(t.transform,e.transform)}class DP{constructor(e,n){this.version=e,this.transformResults=n}}class Ut{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new Ut}static exists(e){return new Ut(void 0,e)}static updateTime(e){return new Ut(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Sl(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class Hu{}function jT(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new Mf(t.key,Ut.none()):new ha(t.key,t.data,Ut.none());{const n=t.data,r=gt.empty();let i=new Ue(He.comparator);for(let s of e.fields)if(!i.has(s)){let o=n.field(s);o===null&&s.length>1&&(s=s.popLast(),o=n.field(s)),o===null?r.delete(s):r.set(s,o),i=i.add(s)}return new Fr(t.key,r,new Rt(i.toArray()),Ut.none())}}function xP(t,e,n){t instanceof ha?function(i,s,o){const l=i.value.clone(),u=ly(i.fieldTransforms,s,o.transformResults);l.setAll(u),s.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(t,e,n):t instanceof Fr?function(i,s,o){if(!Sl(i.precondition,s))return void s.convertToUnknownDocument(o.version);const l=ly(i.fieldTransforms,s,o.transformResults),u=s.data;u.setAll(BT(i)),u.setAll(l),s.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(t,e,n):function(i,s,o){s.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,n)}function Ao(t,e,n,r){return t instanceof ha?function(s,o,l,u){if(!Sl(s.precondition,o))return l;const h=s.value.clone(),f=uy(s.fieldTransforms,u,o);return h.setAll(f),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null}(t,e,n,r):t instanceof Fr?function(s,o,l,u){if(!Sl(s.precondition,o))return l;const h=uy(s.fieldTransforms,u,o),f=o.data;return f.setAll(BT(s)),f.setAll(h),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),l===null?null:l.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(p=>p.field))}(t,e,n,r):function(s,o,l){return Sl(s.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):l}(t,e,n)}function OP(t,e){let n=null;for(const r of t.fieldTransforms){const i=e.data.field(r.field),s=MT(r.transform,i||null);s!=null&&(n===null&&(n=gt.empty()),n.set(r.field,s))}return n||null}function ay(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&us(r,i,(s,o)=>VP(s,o))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class ha extends Hu{constructor(e,n,r,i=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class Fr extends Hu{constructor(e,n,r,i,s=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function BT(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function ly(t,e,n){const r=new Map;le(t.length===n.length,32656,{Ve:n.length,de:t.length});for(let i=0;i<n.length;i++){const s=t[i],o=s.transform,l=e.data.field(s.field);r.set(s.field,kP(o,l,n[i]))}return r}function uy(t,e,n){const r=new Map;for(const i of t){const s=i.transform,o=n.data.field(i.field);r.set(i.field,PP(s,o,e))}return r}class Mf extends Hu{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class LP extends Hu{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class MP{constructor(e,n,r,i){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&xP(s,e,r[i])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=Ao(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=Ao(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=OT();return this.mutations.forEach(i=>{const s=e.get(i.key),o=s.overlayedDocument;let l=this.applyToLocalView(o,s.mutatedFields);l=n.has(i.key)?null:l;const u=jT(o,l);u!==null&&r.set(i.key,u),o.isValidDocument()||o.convertToNoDocument(J.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),se())}isEqual(e){return this.batchId===e.batchId&&us(this.mutations,e.mutations,(n,r)=>ay(n,r))&&us(this.baseMutations,e.baseMutations,(n,r)=>ay(n,r))}}class bf{constructor(e,n,r,i){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=i}static from(e,n,r){le(e.mutations.length===r.length,58842,{me:e.mutations.length,fe:r.length});let i=function(){return IP}();const s=e.mutations;for(let o=0;o<s.length;o++)i=i.insert(s[o].key,r[o].version);return new bf(e,n,r,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bP{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FP{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ve,oe;function UP(t){switch(t){case x.OK:return Q(64938);case x.CANCELLED:case x.UNKNOWN:case x.DEADLINE_EXCEEDED:case x.RESOURCE_EXHAUSTED:case x.INTERNAL:case x.UNAVAILABLE:case x.UNAUTHENTICATED:return!1;case x.INVALID_ARGUMENT:case x.NOT_FOUND:case x.ALREADY_EXISTS:case x.PERMISSION_DENIED:case x.FAILED_PRECONDITION:case x.ABORTED:case x.OUT_OF_RANGE:case x.UNIMPLEMENTED:case x.DATA_LOSS:return!0;default:return Q(15467,{code:t})}}function zT(t){if(t===void 0)return xn("GRPC error has no .code"),x.UNKNOWN;switch(t){case Ve.OK:return x.OK;case Ve.CANCELLED:return x.CANCELLED;case Ve.UNKNOWN:return x.UNKNOWN;case Ve.DEADLINE_EXCEEDED:return x.DEADLINE_EXCEEDED;case Ve.RESOURCE_EXHAUSTED:return x.RESOURCE_EXHAUSTED;case Ve.INTERNAL:return x.INTERNAL;case Ve.UNAVAILABLE:return x.UNAVAILABLE;case Ve.UNAUTHENTICATED:return x.UNAUTHENTICATED;case Ve.INVALID_ARGUMENT:return x.INVALID_ARGUMENT;case Ve.NOT_FOUND:return x.NOT_FOUND;case Ve.ALREADY_EXISTS:return x.ALREADY_EXISTS;case Ve.PERMISSION_DENIED:return x.PERMISSION_DENIED;case Ve.FAILED_PRECONDITION:return x.FAILED_PRECONDITION;case Ve.ABORTED:return x.ABORTED;case Ve.OUT_OF_RANGE:return x.OUT_OF_RANGE;case Ve.UNIMPLEMENTED:return x.UNIMPLEMENTED;case Ve.DATA_LOSS:return x.DATA_LOSS;default:return Q(39323,{code:t})}}(oe=Ve||(Ve={}))[oe.OK=0]="OK",oe[oe.CANCELLED=1]="CANCELLED",oe[oe.UNKNOWN=2]="UNKNOWN",oe[oe.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",oe[oe.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",oe[oe.NOT_FOUND=5]="NOT_FOUND",oe[oe.ALREADY_EXISTS=6]="ALREADY_EXISTS",oe[oe.PERMISSION_DENIED=7]="PERMISSION_DENIED",oe[oe.UNAUTHENTICATED=16]="UNAUTHENTICATED",oe[oe.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",oe[oe.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",oe[oe.ABORTED=10]="ABORTED",oe[oe.OUT_OF_RANGE=11]="OUT_OF_RANGE",oe[oe.UNIMPLEMENTED=12]="UNIMPLEMENTED",oe[oe.INTERNAL=13]="INTERNAL",oe[oe.UNAVAILABLE=14]="UNAVAILABLE",oe[oe.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jP(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BP=new Er([4294967295,4294967295],0);function cy(t){const e=jP().encode(t),n=new tT;return n.update(e),new Uint8Array(n.digest())}function hy(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new Er([n,r],0),new Er([i,s],0)]}class Ff{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new uo(`Invalid padding: ${n}`);if(r<0)throw new uo(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new uo(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new uo(`Invalid padding when bitmap length is 0: ${n}`);this.ge=8*e.length-n,this.pe=Er.fromNumber(this.ge)}ye(e,n,r){let i=e.add(n.multiply(Er.fromNumber(r)));return i.compare(BP)===1&&(i=new Er([i.getBits(0),i.getBits(1)],0)),i.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const n=cy(e),[r,i]=hy(n);for(let s=0;s<this.hashCount;s++){const o=this.ye(r,i,s);if(!this.we(o))return!1}return!0}static create(e,n,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),o=new Ff(s,i,n);return r.forEach(l=>o.insert(l)),o}insert(e){if(this.ge===0)return;const n=cy(e),[r,i]=hy(n);for(let s=0;s<this.hashCount;s++){const o=this.ye(r,i,s);this.be(o)}}be(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class uo extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wu{constructor(e,n,r,i,s){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const i=new Map;return i.set(e,da.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new Wu(J.min(),i,new Se(ie),On(),se())}}class da{constructor(e,n,r,i,s){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new da(r,n,se(),se(),se())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Al{constructor(e,n,r,i){this.Se=e,this.removedTargetIds=n,this.key=r,this.De=i}}class $T{constructor(e,n){this.targetId=e,this.Ce=n}}class HT{constructor(e,n,r=qe.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=i}}class dy{constructor(){this.ve=0,this.Fe=fy(),this.Me=qe.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=se(),n=se(),r=se();return this.Fe.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:n=n.add(i);break;case 1:r=r.add(i);break;default:Q(38017,{changeType:s})}}),new da(this.Me,this.xe,e,n,r)}Ke(){this.Oe=!1,this.Fe=fy()}qe(e,n){this.Oe=!0,this.Fe=this.Fe.insert(e,n)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,le(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}}class zP{constructor(e){this.Ge=e,this.ze=new Map,this.je=On(),this.He=rl(),this.Je=rl(),this.Ze=new Se(ie)}Xe(e){for(const n of e.Se)e.De&&e.De.isFoundDocument()?this.Ye(n,e.De):this.et(n,e.key,e.De);for(const n of e.removedTargetIds)this.et(n,e.key,e.De)}tt(e){this.forEachTarget(e,n=>{const r=this.nt(n);switch(e.state){case 0:this.rt(n)&&r.Le(e.resumeToken);break;case 1:r.We(),r.Ne||r.Ke(),r.Le(e.resumeToken);break;case 2:r.We(),r.Ne||this.removeTarget(n);break;case 3:this.rt(n)&&(r.Qe(),r.Le(e.resumeToken));break;case 4:this.rt(n)&&(this.it(n),r.Le(e.resumeToken));break;default:Q(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.ze.forEach((r,i)=>{this.rt(i)&&n(i)})}st(e){const n=e.targetId,r=e.Ce.count,i=this.ot(n);if(i){const s=i.target;if(cd(s))if(r===0){const o=new W(s.path);this.et(n,o,it.newNoDocument(o,J.min()))}else le(r===1,20013,{expectedCount:r});else{const o=this._t(n);if(o!==r){const l=this.ut(e),u=l?this.ct(l,e,o):1;if(u!==0){this.it(n);const h=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(n,h)}}}}}ut(e){const n=e.Ce.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=n;let o,l;try{o=Rr(r).toUint8Array()}catch(u){if(u instanceof mT)return Sr("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{l=new Ff(o,i,s)}catch(u){return Sr(u instanceof uo?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return l.ge===0?null:l}ct(e,n,r){return n.Ce.count===r-this.Pt(e,n.targetId)?0:2}Pt(e,n){const r=this.Ge.getRemoteKeysForTarget(n);let i=0;return r.forEach(s=>{const o=this.Ge.ht(),l=`projects/${o.projectId}/databases/${o.database}/documents/${s.path.canonicalString()}`;e.mightContain(l)||(this.et(n,s,null),i++)}),i}Tt(e){const n=new Map;this.ze.forEach((s,o)=>{const l=this.ot(o);if(l){if(s.current&&cd(l.target)){const u=new W(l.target.path);this.It(u).has(o)||this.Et(o,u)||this.et(o,u,it.newNoDocument(u,e))}s.Be&&(n.set(o,s.ke()),s.Ke())}});let r=se();this.Je.forEach((s,o)=>{let l=!0;o.forEachWhile(u=>{const h=this.ot(u);return!h||h.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(s))}),this.je.forEach((s,o)=>o.setReadTime(e));const i=new Wu(e,n,this.Ze,this.je,r);return this.je=On(),this.He=rl(),this.Je=rl(),this.Ze=new Se(ie),i}Ye(e,n){if(!this.rt(e))return;const r=this.Et(e,n.key)?2:0;this.nt(e).qe(n.key,r),this.je=this.je.insert(n.key,n),this.He=this.He.insert(n.key,this.It(n.key).add(e)),this.Je=this.Je.insert(n.key,this.Rt(n.key).add(e))}et(e,n,r){if(!this.rt(e))return;const i=this.nt(e);this.Et(e,n)?i.qe(n,1):i.Ue(n),this.Je=this.Je.insert(n,this.Rt(n).delete(e)),this.Je=this.Je.insert(n,this.Rt(n).add(e)),r&&(this.je=this.je.insert(n,r))}removeTarget(e){this.ze.delete(e)}_t(e){const n=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let n=this.ze.get(e);return n||(n=new dy,this.ze.set(e,n)),n}Rt(e){let n=this.Je.get(e);return n||(n=new Ue(ie),this.Je=this.Je.insert(e,n)),n}It(e){let n=this.He.get(e);return n||(n=new Ue(ie),this.He=this.He.insert(e,n)),n}rt(e){const n=this.ot(e)!==null;return n||$("WatchChangeAggregator","Detected inactive target",e),n}ot(e){const n=this.ze.get(e);return n&&n.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new dy),this.Ge.getRemoteKeysForTarget(e).forEach(n=>{this.et(e,n,null)})}Et(e,n){return this.Ge.getRemoteKeysForTarget(e).has(n)}}function rl(){return new Se(W.comparator)}function fy(){return new Se(W.comparator)}const $P={asc:"ASCENDING",desc:"DESCENDING"},HP={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},WP={and:"AND",or:"OR"};class qP{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function fd(t,e){return t.useProto3Json||Uu(e)?e:{value:e}}function uu(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function WT(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function KP(t,e){return uu(t,e.toTimestamp())}function mn(t){return le(!!t,49232),J.fromTimestamp(function(n){const r=Cr(n);return new fe(r.seconds,r.nanos)}(t))}function Uf(t,e){return pd(t,e).canonicalString()}function pd(t,e){const n=function(i){return new de(["projects",i.projectId,"databases",i.database])}(t).child("documents");return e===void 0?n:n.child(e)}function qT(t){const e=de.fromString(t);return le(JT(e),10190,{key:e.toString()}),e}function md(t,e){return Uf(t.databaseId,e.path)}function eh(t,e){const n=qT(e);if(n.get(1)!==t.databaseId.projectId)throw new z(x.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new z(x.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new W(GT(n))}function KT(t,e){return Uf(t.databaseId,e)}function GP(t){const e=qT(t);return e.length===4?de.emptyPath():GT(e)}function gd(t){return new de(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function GT(t){return le(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function py(t,e,n){return{name:md(t,e),fields:n.value.mapValue.fields}}function QP(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:Q(39313,{state:h})}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(h,f){return h.useProto3Json?(le(f===void 0||typeof f=="string",58123),qe.fromBase64String(f||"")):(le(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),qe.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),o=e.targetChange.cause,l=o&&function(h){const f=h.code===void 0?x.UNKNOWN:zT(h.code);return new z(f,h.message||"")}(o);n=new HT(r,i,s,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=eh(t,r.document.name),s=mn(r.document.updateTime),o=r.document.createTime?mn(r.document.createTime):J.min(),l=new gt({mapValue:{fields:r.document.fields}}),u=it.newFoundDocument(i,s,o,l),h=r.targetIds||[],f=r.removedTargetIds||[];n=new Al(h,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=eh(t,r.document),s=r.readTime?mn(r.readTime):J.min(),o=it.newNoDocument(i,s),l=r.removedTargetIds||[];n=new Al([],l,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=eh(t,r.document),s=r.removedTargetIds||[];n=new Al([],s,i,null)}else{if(!("filter"in e))return Q(11601,{Vt:e});{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,o=new FP(i,s),l=r.targetId;n=new $T(l,o)}}return n}function YP(t,e){let n;if(e instanceof ha)n={update:py(t,e.key,e.value)};else if(e instanceof Mf)n={delete:md(t,e.key)};else if(e instanceof Fr)n={update:py(t,e.key,e.data),updateMask:sk(e.fieldMask)};else{if(!(e instanceof LP))return Q(16599,{dt:e.type});n={verify:md(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(s,o){const l=o.transform;if(l instanceof Jo)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof Xo)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof Zo)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof lu)return{fieldPath:o.field.canonicalString(),increment:l.Ae};throw Q(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(n.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:KP(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:Q(27497)}(t,e.precondition)),n}function JP(t,e){return t&&t.length>0?(le(e!==void 0,14353),t.map(n=>function(i,s){let o=i.updateTime?mn(i.updateTime):mn(s);return o.isEqual(J.min())&&(o=mn(s)),new DP(o,i.transformResults||[])}(n,e))):[]}function XP(t,e){return{documents:[KT(t,e.path)]}}function ZP(t,e){const n={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=KT(t,i);const s=function(h){if(h.length!==0)return YT(tn.create(h,"and"))}(e.filters);s&&(n.structuredQuery.where=s);const o=function(h){if(h.length!==0)return h.map(f=>function(m){return{field:Ri(m.field),direction:nk(m.dir)}}(f))}(e.orderBy);o&&(n.structuredQuery.orderBy=o);const l=fd(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{ft:n,parent:i}}function ek(t){let e=GP(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let i=null;if(r>0){le(r===1,65062);const f=n.from[0];f.allDescendants?i=f.collectionId:e=e.child(f.collectionId)}let s=[];n.where&&(s=function(p){const m=QT(p);return m instanceof tn&&AT(m)?m.getFilters():[m]}(n.where));let o=[];n.orderBy&&(o=function(p){return p.map(m=>function(R){return new Yo(Pi(R.field),function(b){switch(b){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(R.direction))}(m))}(n.orderBy));let l=null;n.limit&&(l=function(p){let m;return m=typeof p=="object"?p.value:p,Uu(m)?null:m}(n.limit));let u=null;n.startAt&&(u=function(p){const m=!!p.before,A=p.values||[];return new au(A,m)}(n.startAt));let h=null;return n.endAt&&(h=function(p){const m=!p.before,A=p.values||[];return new au(A,m)}(n.endAt)),gP(e,i,o,s,l,"F",u,h)}function tk(t,e){const n=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Q(28987,{purpose:i})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function QT(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=Pi(n.unaryFilter.field);return xe.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=Pi(n.unaryFilter.field);return xe.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=Pi(n.unaryFilter.field);return xe.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Pi(n.unaryFilter.field);return xe.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return Q(61313);default:return Q(60726)}}(t):t.fieldFilter!==void 0?function(n){return xe.create(Pi(n.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return Q(58110);default:return Q(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return tn.create(n.compositeFilter.filters.map(r=>QT(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return Q(1026)}}(n.compositeFilter.op))}(t):Q(30097,{filter:t})}function nk(t){return $P[t]}function rk(t){return HP[t]}function ik(t){return WP[t]}function Ri(t){return{fieldPath:t.canonicalString()}}function Pi(t){return He.fromServerFormat(t.fieldPath)}function YT(t){return t instanceof xe?function(n){if(n.op==="=="){if(ty(n.value))return{unaryFilter:{field:Ri(n.field),op:"IS_NAN"}};if(ey(n.value))return{unaryFilter:{field:Ri(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(ty(n.value))return{unaryFilter:{field:Ri(n.field),op:"IS_NOT_NAN"}};if(ey(n.value))return{unaryFilter:{field:Ri(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ri(n.field),op:rk(n.op),value:n.value}}}(t):t instanceof tn?function(n){const r=n.getFilters().map(i=>YT(i));return r.length===1?r[0]:{compositeFilter:{op:ik(n.op),filters:r}}}(t):Q(54877,{filter:t})}function sk(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function JT(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}function XT(t){return!!t&&typeof t._toProto=="function"&&t._protoValueType==="ProtoValue"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ar{constructor(e,n,r,i,s=J.min(),o=J.min(),l=qe.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=n,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=l,this.expectedCount=u}withSequenceNumber(e){return new ar(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new ar(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new ar(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new ar(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ok{constructor(e){this.yt=e}}function ak(t){const e=ek({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?dd(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lk{constructor(){this.Sn=new uk}addToCollectionParentIndex(e,n){return this.Sn.add(n),O.resolve()}getCollectionParents(e,n){return O.resolve(this.Sn.getEntries(n))}addFieldIndex(e,n){return O.resolve()}deleteFieldIndex(e,n){return O.resolve()}deleteAllFieldIndexes(e){return O.resolve()}createTargetIndexes(e,n){return O.resolve()}getDocumentsMatchingTarget(e,n){return O.resolve(null)}getIndexType(e,n){return O.resolve(0)}getFieldIndexes(e,n){return O.resolve([])}getNextCollectionGroupToUpdate(e){return O.resolve(null)}getMinOffset(e,n){return O.resolve(Ar.min())}getMinOffsetFromCollectionGroup(e,n){return O.resolve(Ar.min())}updateCollectionGroup(e,n,r){return O.resolve()}updateIndexEntries(e,n){return O.resolve()}}class uk{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),i=this.index[n]||new Ue(de.comparator),s=!i.has(r);return this.index[n]=i.add(r),s}has(e){const n=e.lastSegment(),r=e.popLast(),i=this.index[n];return i&&i.has(r)}getEntries(e){return(this.index[e]||new Ue(de.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const my={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},ZT=41943040;class pt{static withCacheSize(e){return new pt(e,pt.DEFAULT_COLLECTION_PERCENTILE,pt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */pt.DEFAULT_COLLECTION_PERCENTILE=10,pt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,pt.DEFAULT=new pt(ZT,pt.DEFAULT_COLLECTION_PERCENTILE,pt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),pt.DISABLED=new pt(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fs{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new fs(0)}static ar(){return new fs(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gy="LruGarbageCollector",ck=1048576;function yy([t,e],[n,r]){const i=ie(t,n);return i===0?ie(e,r):i}class hk{constructor(e){this.Pr=e,this.buffer=new Ue(yy),this.Tr=0}Ir(){return++this.Tr}Er(e){const n=[e,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(n);else{const r=this.buffer.last();yy(n,r)<0&&(this.buffer=this.buffer.delete(r).add(n))}}get maxValue(){return this.buffer.last()[0]}}class dk{constructor(e,n,r){this.garbageCollector=e,this.asyncQueue=n,this.localStore=r,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){$(gy,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){As(n)?$(gy,"Ignoring IndexedDB error during garbage collection: ",n):await Ss(n)}await this.Ar(3e5)})}}class fk{constructor(e,n){this.Vr=e,this.params=n}calculateTargetCount(e,n){return this.Vr.dr(e).next(r=>Math.floor(n/100*r))}nthSequenceNumber(e,n){if(n===0)return O.resolve(Fu.ce);const r=new hk(n);return this.Vr.forEachTarget(e,i=>r.Er(i.sequenceNumber)).next(()=>this.Vr.mr(e,i=>r.Er(i))).next(()=>r.maxValue)}removeTargets(e,n,r){return this.Vr.removeTargets(e,n,r)}removeOrphanedDocuments(e,n){return this.Vr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?($("LruGarbageCollector","Garbage collection skipped; disabled"),O.resolve(my)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?($("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),my):this.gr(e,n))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,n){let r,i,s,o,l,u,h;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?($("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),i=this.params.maximumSequenceNumbersToCollect):i=p,o=Date.now(),this.nthSequenceNumber(e,i))).next(p=>(r=p,l=Date.now(),this.removeTargets(e,r,n))).next(p=>(s=p,u=Date.now(),this.removeOrphanedDocuments(e,r))).next(p=>(h=Date.now(),Ai()<=re.DEBUG&&$("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${i} in `+(l-o)+`ms
	Removed ${s} targets in `+(u-l)+`ms
	Removed ${p} documents in `+(h-u)+`ms
Total Duration: ${h-f}ms`),O.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:p})))}}function pk(t,e){return new fk(t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mk{constructor(){this.changes=new gi(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,it.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?O.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gk{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yk{constructor(e,n,r,i){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,n))).next(i=>(r!==null&&Ao(r.mutation,i,Rt.empty(),fe.now()),i))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,se()).next(()=>r))}getLocalViewOfDocuments(e,n,r=se()){const i=Xr();return this.populateOverlays(e,i,n).next(()=>this.computeViews(e,n,i,r).next(s=>{let o=lo();return s.forEach((l,u)=>{o=o.insert(l,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,n){const r=Xr();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,se()))}populateOverlays(e,n,r){const i=[];return r.forEach(s=>{n.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((o,l)=>{n.set(o,l)})})}computeViews(e,n,r,i){let s=On();const o=So(),l=function(){return So()}();return n.forEach((u,h)=>{const f=r.get(h.key);i.has(h.key)&&(f===void 0||f.mutation instanceof Fr)?s=s.insert(h.key,h):f!==void 0?(o.set(h.key,f.mutation.getFieldMask()),Ao(f.mutation,h,f.mutation.getFieldMask(),fe.now())):o.set(h.key,Rt.empty())}),this.recalculateAndSaveOverlays(e,s).next(u=>(u.forEach((h,f)=>o.set(h,f)),n.forEach((h,f)=>l.set(h,new gk(f,o.get(h)??null))),l))}recalculateAndSaveOverlays(e,n){const r=So();let i=new Se((o,l)=>o-l),s=se();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(o=>{for(const l of o)l.keys().forEach(u=>{const h=n.get(u);if(h===null)return;let f=r.get(u)||Rt.empty();f=l.applyToLocalView(h,f),r.set(u,f);const p=(i.get(l.batchId)||se()).add(u);i=i.insert(l.batchId,p)})}).next(()=>{const o=[],l=i.getReverseIterator();for(;l.hasNext();){const u=l.getNext(),h=u.key,f=u.value,p=OT();f.forEach(m=>{if(!s.has(m)){const A=jT(n.get(m),r.get(m));A!==null&&p.set(m,A),s=s.add(m)}}),o.push(this.documentOverlayCache.saveOverlays(e,h,p))}return O.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,i){return yP(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):kT(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,i):this.getDocumentsMatchingCollectionQuery(e,n,r,i)}getNextDocuments(e,n,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,i).next(s=>{const o=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,i-s.size):O.resolve(Xr());let l=Ko,u=s;return o.next(h=>O.forEach(h,(f,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),s.get(f)?O.resolve():this.remoteDocumentCache.getEntry(e,f).next(m=>{u=u.insert(f,m)}))).next(()=>this.populateOverlays(e,h,s)).next(()=>this.computeViews(e,u,h,se())).next(f=>({batchId:l,changes:xT(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new W(n)).next(r=>{let i=lo();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,n,r,i){const s=n.collectionGroup;let o=lo();return this.indexManager.getCollectionParents(e,s).next(l=>O.forEach(l,u=>{const h=function(p,m){return new Cs(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,u.child(s));return this.getDocumentsMatchingCollectionQuery(e,h,r,i).next(f=>{f.forEach((p,m)=>{o=o.insert(p,m)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,n,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(o=>(s=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,s,i))).next(o=>{s.forEach((u,h)=>{const f=h.getKey();o.get(f)===null&&(o=o.insert(f,it.newInvalidDocument(f)))});let l=lo();return o.forEach((u,h)=>{const f=s.get(u);f!==void 0&&Ao(f.mutation,h,Rt.empty(),fe.now()),zu(n,h)&&(l=l.insert(u,h))}),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _k{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,n){return O.resolve(this.Nr.get(n))}saveBundleMetadata(e,n){return this.Nr.set(n.id,function(i){return{id:i.id,version:i.version,createTime:mn(i.createTime)}}(n)),O.resolve()}getNamedQuery(e,n){return O.resolve(this.Br.get(n))}saveNamedQuery(e,n){return this.Br.set(n.name,function(i){return{name:i.name,query:ak(i.bundledQuery),readTime:mn(i.readTime)}}(n)),O.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vk{constructor(){this.overlays=new Se(W.comparator),this.Lr=new Map}getOverlay(e,n){return O.resolve(this.overlays.get(n))}getOverlays(e,n){const r=Xr();return O.forEach(n,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((i,s)=>{this.bt(e,n,s)}),O.resolve()}removeOverlaysForBatchId(e,n,r){const i=this.Lr.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.Lr.delete(r)),O.resolve()}getOverlaysForCollection(e,n,r){const i=Xr(),s=n.length+1,o=new W(n.child("")),l=this.overlays.getIteratorFrom(o);for(;l.hasNext();){const u=l.getNext().value,h=u.getKey();if(!n.isPrefixOf(h.path))break;h.path.length===s&&u.largestBatchId>r&&i.set(u.getKey(),u)}return O.resolve(i)}getOverlaysForCollectionGroup(e,n,r,i){let s=new Se((h,f)=>h-f);const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===n&&h.largestBatchId>r){let f=s.get(h.largestBatchId);f===null&&(f=Xr(),s=s.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const l=Xr(),u=s.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((h,f)=>l.set(h,f)),!(l.size()>=i)););return O.resolve(l)}bt(e,n,r){const i=this.overlays.get(r.key);if(i!==null){const o=this.Lr.get(i.largestBatchId).delete(r.key);this.Lr.set(i.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new bP(n,r));let s=this.Lr.get(n);s===void 0&&(s=se(),this.Lr.set(n,s)),this.Lr.set(n,s.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ek{constructor(){this.sessionToken=qe.EMPTY_BYTE_STRING}getSessionToken(e){return O.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,O.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jf{constructor(){this.kr=new Ue(ze.Kr),this.qr=new Ue(ze.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,n){const r=new ze(e,n);this.kr=this.kr.add(r),this.qr=this.qr.add(r)}$r(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.Wr(new ze(e,n))}Qr(e,n){e.forEach(r=>this.removeReference(r,n))}Gr(e){const n=new W(new de([])),r=new ze(n,e),i=new ze(n,e+1),s=[];return this.qr.forEachInRange([r,i],o=>{this.Wr(o),s.push(o.key)}),s}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.qr=this.qr.delete(e)}jr(e){const n=new W(new de([])),r=new ze(n,e),i=new ze(n,e+1);let s=se();return this.qr.forEachInRange([r,i],o=>{s=s.add(o.key)}),s}containsKey(e){const n=new ze(e,0),r=this.kr.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class ze{constructor(e,n){this.key=e,this.Hr=n}static Kr(e,n){return W.comparator(e.key,n.key)||ie(e.Hr,n.Hr)}static Ur(e,n){return ie(e.Hr,n.Hr)||W.comparator(e.key,n.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tk{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Yn=1,this.Jr=new Ue(ze.Kr)}checkEmpty(e){return O.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,i){const s=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new MP(s,n,r,i);this.mutationQueue.push(o);for(const l of i)this.Jr=this.Jr.add(new ze(l.key,s)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return O.resolve(o)}lookupMutationBatch(e,n){return O.resolve(this.Zr(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,i=this.Xr(r),s=i<0?0:i;return O.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return O.resolve(this.mutationQueue.length===0?kf:this.Yn-1)}getAllMutationBatches(e){return O.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new ze(n,0),i=new ze(n,Number.POSITIVE_INFINITY),s=[];return this.Jr.forEachInRange([r,i],o=>{const l=this.Zr(o.Hr);s.push(l)}),O.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new Ue(ie);return n.forEach(i=>{const s=new ze(i,0),o=new ze(i,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([s,o],l=>{r=r.add(l.Hr)})}),O.resolve(this.Yr(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,i=r.length+1;let s=r;W.isDocumentKey(s)||(s=s.child(""));const o=new ze(new W(s),0);let l=new Ue(ie);return this.Jr.forEachWhile(u=>{const h=u.key.path;return!!r.isPrefixOf(h)&&(h.length===i&&(l=l.add(u.Hr)),!0)},o),O.resolve(this.Yr(l))}Yr(e){const n=[];return e.forEach(r=>{const i=this.Zr(r);i!==null&&n.push(i)}),n}removeMutationBatch(e,n){le(this.ei(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Jr;return O.forEach(n.mutations,i=>{const s=new ze(i.key,n.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.Jr=r})}nr(e){}containsKey(e,n){const r=new ze(n,0),i=this.Jr.firstAfterOrEqual(r);return O.resolve(n.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,O.resolve()}ei(e,n){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const n=this.Xr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wk{constructor(e){this.ti=e,this.docs=function(){return new Se(W.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,i=this.docs.get(r),s=i?i.size:0,o=this.ti(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:o}),this.size+=o-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return O.resolve(r?r.document.mutableCopy():it.newInvalidDocument(n))}getEntries(e,n){let r=On();return n.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():it.newInvalidDocument(i))}),O.resolve(r)}getDocumentsMatchingQuery(e,n,r,i){let s=On();const o=n.path,l=new W(o.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(l);for(;u.hasNext();){const{key:h,value:{document:f}}=u.getNext();if(!o.isPrefixOf(h.path))break;h.path.length>o.length+1||KR(qR(f),r)<=0||(i.has(f.key)||zu(n,f))&&(s=s.insert(f.key,f.mutableCopy()))}return O.resolve(s)}getAllFromCollectionGroup(e,n,r,i){Q(9500)}ni(e,n){return O.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new Ik(this)}getSize(e){return O.resolve(this.size)}}class Ik extends mk{constructor(e){super(),this.Mr=e}applyChanges(e){const n=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?n.push(this.Mr.addEntry(e,i)):this.Mr.removeEntry(r)}),O.waitFor(n)}getFromCache(e,n){return this.Mr.getEntry(e,n)}getAllFromCache(e,n){return this.Mr.getEntries(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sk{constructor(e){this.persistence=e,this.ri=new gi(n=>Df(n),xf),this.lastRemoteSnapshotVersion=J.min(),this.highestTargetId=0,this.ii=0,this.si=new jf,this.targetCount=0,this.oi=fs._r()}forEachTarget(e,n){return this.ri.forEach((r,i)=>n(i)),O.resolve()}getLastRemoteSnapshotVersion(e){return O.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return O.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),O.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this.ii&&(this.ii=n),O.resolve()}lr(e){this.ri.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this.oi=new fs(n),this.highestTargetId=n),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,n){return this.lr(n),this.targetCount+=1,O.resolve()}updateTargetData(e,n){return this.lr(n),O.resolve()}removeTargetData(e,n){return this.ri.delete(n.target),this.si.Gr(n.targetId),this.targetCount-=1,O.resolve()}removeTargets(e,n,r){let i=0;const s=[];return this.ri.forEach((o,l)=>{l.sequenceNumber<=n&&r.get(l.targetId)===null&&(this.ri.delete(o),s.push(this.removeMatchingKeysForTargetId(e,l.targetId)),i++)}),O.waitFor(s).next(()=>i)}getTargetCount(e){return O.resolve(this.targetCount)}getTargetData(e,n){const r=this.ri.get(n)||null;return O.resolve(r)}addMatchingKeys(e,n,r){return this.si.$r(n,r),O.resolve()}removeMatchingKeys(e,n,r){this.si.Qr(n,r);const i=this.persistence.referenceDelegate,s=[];return i&&n.forEach(o=>{s.push(i.markPotentiallyOrphaned(e,o))}),O.waitFor(s)}removeMatchingKeysForTargetId(e,n){return this.si.Gr(n),O.resolve()}getMatchingKeysForTargetId(e,n){const r=this.si.jr(n);return O.resolve(r)}containsKey(e,n){return O.resolve(this.si.containsKey(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ew{constructor(e,n){this._i={},this.overlays={},this.ai=new Fu(0),this.ui=!1,this.ui=!0,this.ci=new Ek,this.referenceDelegate=e(this),this.li=new Sk(this),this.indexManager=new lk,this.remoteDocumentCache=function(i){return new wk(i)}(r=>this.referenceDelegate.hi(r)),this.serializer=new ok(n),this.Pi=new _k(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new vk,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this._i[e.toKey()];return r||(r=new Tk(n,this.referenceDelegate),this._i[e.toKey()]=r),r}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,n,r){$("MemoryPersistence","Starting transaction:",e);const i=new Ak(this.ai.next());return this.referenceDelegate.Ti(),r(i).next(s=>this.referenceDelegate.Ii(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Ei(e,n){return O.or(Object.values(this._i).map(r=>()=>r.containsKey(e,n)))}}class Ak extends QR{constructor(e){super(),this.currentSequenceNumber=e}}class Bf{constructor(e){this.persistence=e,this.Ri=new jf,this.Ai=null}static Vi(e){return new Bf(e)}get di(){if(this.Ai)return this.Ai;throw Q(60996)}addReference(e,n,r){return this.Ri.addReference(r,n),this.di.delete(r.toString()),O.resolve()}removeReference(e,n,r){return this.Ri.removeReference(r,n),this.di.add(r.toString()),O.resolve()}markPotentiallyOrphaned(e,n){return this.di.add(n.toString()),O.resolve()}removeTarget(e,n){this.Ri.Gr(n.targetId).forEach(i=>this.di.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(i=>{i.forEach(s=>this.di.add(s.toString()))}).next(()=>r.removeTargetData(e,n))}Ti(){this.Ai=new Set}Ii(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return O.forEach(this.di,r=>{const i=W.fromPath(r);return this.mi(e,i).next(s=>{s||n.removeEntry(i,J.min())})}).next(()=>(this.Ai=null,n.apply(e)))}updateLimboDocument(e,n){return this.mi(e,n).next(r=>{r?this.di.delete(n.toString()):this.di.add(n.toString())})}hi(e){return 0}mi(e,n){return O.or([()=>O.resolve(this.Ri.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ei(e,n)])}}class cu{constructor(e,n){this.persistence=e,this.fi=new gi(r=>XR(r.path),(r,i)=>r.isEqual(i)),this.garbageCollector=pk(this,n)}static Vi(e,n){return new cu(e,n)}Ti(){}Ii(e){return O.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}dr(e){const n=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>n.next(i=>r+i))}pr(e){let n=0;return this.mr(e,r=>{n++}).next(()=>n)}mr(e,n){return O.forEach(this.fi,(r,i)=>this.wr(e,r,i).next(s=>s?O.resolve():n(i)))}removeTargets(e,n,r){return this.persistence.getTargetCache().removeTargets(e,n,r)}removeOrphanedDocuments(e,n){let r=0;const i=this.persistence.getRemoteDocumentCache(),s=i.newChangeBuffer();return i.ni(e,o=>this.wr(e,o,n).next(l=>{l||(r++,s.removeEntry(o,J.min()))})).next(()=>s.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,n){return this.fi.set(n,e.currentSequenceNumber),O.resolve()}removeTarget(e,n){const r=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,n,r){return this.fi.set(r,e.currentSequenceNumber),O.resolve()}removeReference(e,n,r){return this.fi.set(r,e.currentSequenceNumber),O.resolve()}updateLimboDocument(e,n){return this.fi.set(n,e.currentSequenceNumber),O.resolve()}hi(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=wl(e.data.value)),n}wr(e,n,r){return O.or([()=>this.persistence.Ei(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{const i=this.fi.get(n);return O.resolve(i!==void 0&&i>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zf{constructor(e,n,r,i){this.targetId=e,this.fromCache=n,this.Ts=r,this.Is=i}static Es(e,n){let r=se(),i=se();for(const s of n.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new zf(e,n.fromCache,r,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ck{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rk{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return r1()?8:YR(ot())>0?6:4}()}initialize(e,n){this.fs=e,this.indexManager=n,this.Rs=!0}getDocumentsMatchingQuery(e,n,r,i){const s={result:null};return this.gs(e,n).next(o=>{s.result=o}).next(()=>{if(!s.result)return this.ps(e,n,i,r).next(o=>{s.result=o})}).next(()=>{if(s.result)return;const o=new Ck;return this.ys(e,n,o).next(l=>{if(s.result=l,this.As)return this.ws(e,n,o,l.size)})}).next(()=>s.result)}ws(e,n,r,i){return r.documentReadCount<this.Vs?(Ai()<=re.DEBUG&&$("QueryEngine","SDK will not create cache indexes for query:",Ci(n),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),O.resolve()):(Ai()<=re.DEBUG&&$("QueryEngine","Query:",Ci(n),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.ds*i?(Ai()<=re.DEBUG&&$("QueryEngine","The SDK decides to create cache indexes for query:",Ci(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,pn(n))):O.resolve())}gs(e,n){if(sy(n))return O.resolve(null);let r=pn(n);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(n.limit!==null&&i===1&&(n=dd(n,null,"F"),r=pn(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{const o=se(...s);return this.fs.getDocuments(e,o).next(l=>this.indexManager.getMinOffset(e,r).next(u=>{const h=this.bs(n,l);return this.Ss(n,h,o,u.readTime)?this.gs(e,dd(n,null,"F")):this.Ds(e,h,n,u)}))})))}ps(e,n,r,i){return sy(n)||i.isEqual(J.min())?O.resolve(null):this.fs.getDocuments(e,r).next(s=>{const o=this.bs(n,s);return this.Ss(n,o,r,i)?O.resolve(null):(Ai()<=re.DEBUG&&$("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Ci(n)),this.Ds(e,o,n,WR(i,Ko)).next(l=>l))})}bs(e,n){let r=new Ue(VT(e));return n.forEach((i,s)=>{zu(e,s)&&(r=r.add(s))}),r}Ss(e,n,r,i){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const s=e.limitType==="F"?n.last():n.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}ys(e,n,r){return Ai()<=re.DEBUG&&$("QueryEngine","Using full collection scan to execute query:",Ci(n)),this.fs.getDocumentsMatchingQuery(e,n,Ar.min(),r)}Ds(e,n,r,i){return this.fs.getDocumentsMatchingQuery(e,r,i).next(s=>(n.forEach(o=>{s=s.insert(o.key,o)}),s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $f="LocalStore",Pk=3e8;class kk{constructor(e,n,r,i){this.persistence=e,this.Cs=n,this.serializer=i,this.vs=new Se(ie),this.Fs=new gi(s=>Df(s),xf),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(r)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new yk(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.vs))}}function Nk(t,e,n,r){return new kk(t,e,n,r)}async function tw(t,e){const n=X(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let i;return n.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,n.Os(e),n.mutationQueue.getAllMutationBatches(r))).next(s=>{const o=[],l=[];let u=se();for(const h of i){o.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}for(const h of s){l.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}return n.localDocuments.getDocuments(r,u).next(h=>({Ns:h,removedBatchIds:o,addedBatchIds:l}))})})}function Vk(t,e){const n=X(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=n.xs.newChangeBuffer({trackRemovals:!0});return function(l,u,h,f){const p=h.batch,m=p.keys();let A=O.resolve();return m.forEach(R=>{A=A.next(()=>f.getEntry(u,R)).next(V=>{const b=h.docVersions.get(R);le(b!==null,48541),V.version.compareTo(b)<0&&(p.applyToRemoteDocument(V,h),V.isValidDocument()&&(V.setReadTime(h.commitVersion),f.addEntry(V)))})}),A.next(()=>l.mutationQueue.removeMutationBatch(u,p))}(n,r,e,s).next(()=>s.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let u=se();for(let h=0;h<l.mutationResults.length;++h)l.mutationResults[h].transformResults.length>0&&(u=u.add(l.batch.mutations[h].key));return u}(e))).next(()=>n.localDocuments.getDocuments(r,i))})}function nw(t){const e=X(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.li.getLastRemoteSnapshotVersion(n))}function Dk(t,e){const n=X(t),r=e.snapshotVersion;let i=n.vs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const o=n.xs.newChangeBuffer({trackRemovals:!0});i=n.vs;const l=[];e.targetChanges.forEach((f,p)=>{const m=i.get(p);if(!m)return;l.push(n.li.removeMatchingKeys(s,f.removedDocuments,p).next(()=>n.li.addMatchingKeys(s,f.addedDocuments,p)));let A=m.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?A=A.withResumeToken(qe.EMPTY_BYTE_STRING,J.min()).withLastLimboFreeSnapshotVersion(J.min()):f.resumeToken.approximateByteSize()>0&&(A=A.withResumeToken(f.resumeToken,r)),i=i.insert(p,A),function(V,b,I){return V.resumeToken.approximateByteSize()===0||b.snapshotVersion.toMicroseconds()-V.snapshotVersion.toMicroseconds()>=Pk?!0:I.addedDocuments.size+I.modifiedDocuments.size+I.removedDocuments.size>0}(m,A,f)&&l.push(n.li.updateTargetData(s,A))});let u=On(),h=se();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(s,f))}),l.push(xk(s,o,e.documentUpdates).next(f=>{u=f.Bs,h=f.Ls})),!r.isEqual(J.min())){const f=n.li.getLastRemoteSnapshotVersion(s).next(p=>n.li.setTargetsMetadata(s,s.currentSequenceNumber,r));l.push(f)}return O.waitFor(l).next(()=>o.apply(s)).next(()=>n.localDocuments.getLocalViewOfDocuments(s,u,h)).next(()=>u)}).then(s=>(n.vs=i,s))}function xk(t,e,n){let r=se(),i=se();return n.forEach(s=>r=r.add(s)),e.getEntries(t,r).next(s=>{let o=On();return n.forEach((l,u)=>{const h=s.get(l);u.isFoundDocument()!==h.isFoundDocument()&&(i=i.add(l)),u.isNoDocument()&&u.version.isEqual(J.min())?(e.removeEntry(l,u.readTime),o=o.insert(l,u)):!h.isValidDocument()||u.version.compareTo(h.version)>0||u.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(u),o=o.insert(l,u)):$($f,"Ignoring outdated watch update for ",l,". Current version:",h.version," Watch version:",u.version)}),{Bs:o,Ls:i}})}function Ok(t,e){const n=X(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=kf),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function Lk(t,e){const n=X(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return n.li.getTargetData(r,e).next(s=>s?(i=s,O.resolve(i)):n.li.allocateTargetId(r).next(o=>(i=new ar(e,o,"TargetPurposeListen",r.currentSequenceNumber),n.li.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=n.vs.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(n.vs=n.vs.insert(r.targetId,r),n.Fs.set(e,r.targetId)),r})}async function yd(t,e,n){const r=X(t),i=r.vs.get(e),s=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",s,o=>r.persistence.referenceDelegate.removeTarget(o,i))}catch(o){if(!As(o))throw o;$($f,`Failed to update sequence numbers for target ${e}: ${o}`)}r.vs=r.vs.remove(e),r.Fs.delete(i.target)}function _y(t,e,n){const r=X(t);let i=J.min(),s=se();return r.persistence.runTransaction("Execute query","readwrite",o=>function(u,h,f){const p=X(u),m=p.Fs.get(f);return m!==void 0?O.resolve(p.vs.get(m)):p.li.getTargetData(h,f)}(r,o,pn(e)).next(l=>{if(l)return i=l.lastLimboFreeSnapshotVersion,r.li.getMatchingKeysForTargetId(o,l.targetId).next(u=>{s=u})}).next(()=>r.Cs.getDocumentsMatchingQuery(o,e,n?i:J.min(),n?s:se())).next(l=>(Mk(r,EP(e),l),{documents:l,ks:s})))}function Mk(t,e,n){let r=t.Ms.get(e)||J.min();n.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),t.Ms.set(e,r)}class vy{constructor(){this.activeTargetIds=CP()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class bk{constructor(){this.vo=new vy,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,n,r){this.Fo[e]=n}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new vy,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fk{Mo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ey="ConnectivityMonitor";class Ty{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){$(Ey,"Network connectivity changed: AVAILABLE");for(const e of this.Lo)e(0)}Bo(){$(Ey,"Network connectivity changed: UNAVAILABLE");for(const e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let il=null;function _d(){return il===null?il=function(){return 268435456+Math.round(2147483648*Math.random())}():il++,"0x"+il.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const th="RestConnection",Uk={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class jk{get Ko(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const n=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.qo=n+"://"+e.host,this.Uo=`projects/${r}/databases/${i}`,this.$o=this.databaseId.database===su?`project_id=${r}`:`project_id=${r}&database_id=${i}`}Wo(e,n,r,i,s){const o=_d(),l=this.Qo(e,n.toUriEncodedString());$(th,`Sending RPC '${e}' ${o}:`,l,r);const u={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(u,i,s);const{host:h}=new URL(l),f=vs(h);return this.zo(e,l,u,r,f).then(p=>($(th,`Received RPC '${e}' ${o}: `,p),p),p=>{throw Sr(th,`RPC '${e}' ${o} failed with error: `,p,"url: ",l,"request:",r),p})}jo(e,n,r,i,s,o){return this.Wo(e,n,r,i,s)}Go(e,n,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Is}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((i,s)=>e[s]=i),r&&r.headers.forEach((i,s)=>e[s]=i)}Qo(e,n){const r=Uk[e];let i=`${this.qo}/v1/${n}:${r}`;return this.databaseInfo.apiKey&&(i=`${i}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),i}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bk{constructor(e){this.Ho=e.Ho,this.Jo=e.Jo}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Jo()}send(e){this.Ho(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tt="WebChannelConnection",eo=(t,e,n)=>{t.listen(e,r=>{try{n(r)}catch(i){setTimeout(()=>{throw i},0)}})};class Xi extends jk{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!Xi.c_){const e=sT();eo(e,iT.STAT_EVENT,n=>{n.stat===sd.PROXY?$(tt,"STAT_EVENT: detected buffering proxy"):n.stat===sd.NOPROXY&&$(tt,"STAT_EVENT: detected no buffering proxy")}),Xi.c_=!0}}zo(e,n,r,i,s){const o=_d();return new Promise((l,u)=>{const h=new nT;h.setWithCredentials(!0),h.listenOnce(rT.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case Tl.NO_ERROR:const p=h.getResponseJson();$(tt,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),l(p);break;case Tl.TIMEOUT:$(tt,`RPC '${e}' ${o} timed out`),u(new z(x.DEADLINE_EXCEEDED,"Request time out"));break;case Tl.HTTP_ERROR:const m=h.getStatus();if($(tt,`RPC '${e}' ${o} failed with status:`,m,"response text:",h.getResponseText()),m>0){let A=h.getResponseJson();Array.isArray(A)&&(A=A[0]);const R=A==null?void 0:A.error;if(R&&R.status&&R.message){const V=function(I){const v=I.toLowerCase().replace(/_/g,"-");return Object.values(x).indexOf(v)>=0?v:x.UNKNOWN}(R.status);u(new z(V,R.message))}else u(new z(x.UNKNOWN,"Server responded with status "+h.getStatus()))}else u(new z(x.UNAVAILABLE,"Connection failed."));break;default:Q(9055,{l_:e,streamId:o,h_:h.getLastErrorCode(),P_:h.getLastError()})}}finally{$(tt,`RPC '${e}' ${o} completed.`)}});const f=JSON.stringify(i);$(tt,`RPC '${e}' ${o} sending request:`,i),h.send(n,"POST",f,r,15)})}T_(e,n,r){const i=_d(),s=[this.qo,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),l={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(l.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(l.useFetchStreams=!0),this.Go(l.initMessageHeaders,n,r),l.encodeInitMessageHeaders=!0;const h=s.join("");$(tt,`Creating RPC '${e}' stream ${i}: ${h}`,l);const f=o.createWebChannel(h,l);this.I_(f);let p=!1,m=!1;const A=new Bk({Ho:R=>{m?$(tt,`Not sending because RPC '${e}' stream ${i} is closed:`,R):(p||($(tt,`Opening RPC '${e}' stream ${i} transport.`),f.open(),p=!0),$(tt,`RPC '${e}' stream ${i} sending:`,R),f.send(R))},Jo:()=>f.close()});return eo(f,ao.EventType.OPEN,()=>{m||($(tt,`RPC '${e}' stream ${i} transport opened.`),A.i_())}),eo(f,ao.EventType.CLOSE,()=>{m||(m=!0,$(tt,`RPC '${e}' stream ${i} transport closed`),A.o_(),this.E_(f))}),eo(f,ao.EventType.ERROR,R=>{m||(m=!0,Sr(tt,`RPC '${e}' stream ${i} transport errored. Name:`,R.name,"Message:",R.message),A.o_(new z(x.UNAVAILABLE,"The operation could not be completed")))}),eo(f,ao.EventType.MESSAGE,R=>{var V;if(!m){const b=R.data[0];le(!!b,16349);const I=b,v=(I==null?void 0:I.error)||((V=I[0])==null?void 0:V.error);if(v){$(tt,`RPC '${e}' stream ${i} received error:`,v);const C=v.status;let L=function(_){const y=Ve[_];if(y!==void 0)return zT(y)}(C),F=v.message;C==="NOT_FOUND"&&F.includes("database")&&F.includes("does not exist")&&F.includes(this.databaseId.database)&&Sr(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),L===void 0&&(L=x.INTERNAL,F="Unknown error status: "+C+" with message "+v.message),m=!0,A.o_(new z(L,F)),f.close()}else $(tt,`RPC '${e}' stream ${i} received:`,b),A.__(b)}}),Xi.u_(),setTimeout(()=>{A.s_()},0),A}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}I_(e){this.a_.push(e)}E_(e){this.a_=this.a_.filter(n=>n===e)}Go(e,n,r){super.Go(e,n,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return oT()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zk(t){return new Xi(t)}function nh(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qu(t){return new qP(t,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Xi.c_=!1;class rw{constructor(e,n,r=1e3,i=1.5,s=6e4){this.Ci=e,this.timerId=n,this.R_=r,this.A_=i,this.V_=s,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();const n=Math.floor(this.d_+this.y_()),r=Math.max(0,Date.now()-this.f_),i=Math.max(0,n-r);i>0&&$("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.d_} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,i,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wy="PersistentStream";class iw{constructor(e,n,r,i,s,o,l,u){this.Ci=e,this.b_=r,this.S_=i,this.connection=s,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=l,this.listener=u,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new rw(e,n)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.b_,6e4,()=>this.k_()))}K_(e){this.q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():n&&n.code===x.RESOURCE_EXHAUSTED?(xn(n.toString()),xn("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):n&&n.code===x.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(n)}W_(){}auth(){this.state=1;const e=this.Q_(this.D_),n=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.D_===n&&this.G_(r,i)},r=>{e(()=>{const i=new z(x.UNKNOWN,"Fetching auth token failed: "+r.message);return this.z_(i)})})}G_(e,n){const r=this.Q_(this.D_);this.stream=this.j_(e,n),this.stream.Zo(()=>{r(()=>this.listener.Zo())}),this.stream.Yo(()=>{r(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.S_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(i=>{r(()=>this.z_(i))}),this.stream.onMessage(i=>{r(()=>++this.F_==1?this.H_(i):this.onNext(i))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return $(wy,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return n=>{this.Ci.enqueueAndForget(()=>this.D_===e?n():($(wy,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class $k extends iw{constructor(e,n,r,i,s,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,i,o),this.serializer=s}j_(e,n){return this.connection.T_("Listen",e,n)}H_(e){return this.onNext(e)}onNext(e){this.M_.reset();const n=QP(this.serializer,e),r=function(s){if(!("targetChange"in s))return J.min();const o=s.targetChange;return o.targetIds&&o.targetIds.length?J.min():o.readTime?mn(o.readTime):J.min()}(e);return this.listener.J_(n,r)}Z_(e){const n={};n.database=gd(this.serializer),n.addTarget=function(s,o){let l;const u=o.target;if(l=cd(u)?{documents:XP(s,u)}:{query:ZP(s,u).ft},l.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){l.resumeToken=WT(s,o.resumeToken);const h=fd(s,o.expectedCount);h!==null&&(l.expectedCount=h)}else if(o.snapshotVersion.compareTo(J.min())>0){l.readTime=uu(s,o.snapshotVersion.toTimestamp());const h=fd(s,o.expectedCount);h!==null&&(l.expectedCount=h)}return l}(this.serializer,e);const r=tk(this.serializer,e);r&&(n.labels=r),this.K_(n)}X_(e){const n={};n.database=gd(this.serializer),n.removeTarget=e,this.K_(n)}}class Hk extends iw{constructor(e,n,r,i,s,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,i,o),this.serializer=s}get Y_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}W_(){this.Y_&&this.ea([])}j_(e,n){return this.connection.T_("Write",e,n)}H_(e){return le(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,le(!e.writeResults||e.writeResults.length===0,55816),this.listener.ta()}onNext(e){le(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.M_.reset();const n=JP(e.writeResults,e.commitTime),r=mn(e.commitTime);return this.listener.na(r,n)}ra(){const e={};e.database=gd(this.serializer),this.K_(e)}ea(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>YP(this.serializer,r))};this.K_(n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wk{}class qk extends Wk{constructor(e,n,r,i){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=i,this.ia=!1}sa(){if(this.ia)throw new z(x.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,n,r,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,o])=>this.connection.Wo(e,pd(n,r),i,s,o)).catch(s=>{throw s.name==="FirebaseError"?(s.code===x.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new z(x.UNKNOWN,s.toString())})}jo(e,n,r,i,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,l])=>this.connection.jo(e,pd(n,r),i,o,l,s)).catch(o=>{throw o.name==="FirebaseError"?(o.code===x.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new z(x.UNKNOWN,o.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}function Kk(t,e,n,r){return new qk(t,e,n,r)}class Gk{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(xn(n),this.aa=!1):$("OnlineStateTracker",n)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const di="RemoteStore";class Qk{constructor(e,n,r,i,s){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.Ra=[],this.Aa=s,this.Aa.Mo(o=>{r.enqueueAndForget(async()=>{yi(this)&&($(di,"Restarting streams for network reachability change."),await async function(u){const h=X(u);h.Ea.add(4),await fa(h),h.Va.set("Unknown"),h.Ea.delete(4),await Ku(h)}(this))})}),this.Va=new Gk(r,i)}}async function Ku(t){if(yi(t))for(const e of t.Ra)await e(!0)}async function fa(t){for(const e of t.Ra)await e(!1)}function sw(t,e){const n=X(t);n.Ia.has(e.targetId)||(n.Ia.set(e.targetId,e),Kf(n)?qf(n):Rs(n).O_()&&Wf(n,e))}function Hf(t,e){const n=X(t),r=Rs(n);n.Ia.delete(e),r.O_()&&ow(n,e),n.Ia.size===0&&(r.O_()?r.L_():yi(n)&&n.Va.set("Unknown"))}function Wf(t,e){if(t.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(J.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}Rs(t).Z_(e)}function ow(t,e){t.da.$e(e),Rs(t).X_(e)}function qf(t){t.da=new zP({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),At:e=>t.Ia.get(e)||null,ht:()=>t.datastore.serializer.databaseId}),Rs(t).start(),t.Va.ua()}function Kf(t){return yi(t)&&!Rs(t).x_()&&t.Ia.size>0}function yi(t){return X(t).Ea.size===0}function aw(t){t.da=void 0}async function Yk(t){t.Va.set("Online")}async function Jk(t){t.Ia.forEach((e,n)=>{Wf(t,e)})}async function Xk(t,e){aw(t),Kf(t)?(t.Va.ha(e),qf(t)):t.Va.set("Unknown")}async function Zk(t,e,n){if(t.Va.set("Online"),e instanceof HT&&e.state===2&&e.cause)try{await async function(i,s){const o=s.cause;for(const l of s.targetIds)i.Ia.has(l)&&(await i.remoteSyncer.rejectListen(l,o),i.Ia.delete(l),i.da.removeTarget(l))}(t,e)}catch(r){$(di,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await hu(t,r)}else if(e instanceof Al?t.da.Xe(e):e instanceof $T?t.da.st(e):t.da.tt(e),!n.isEqual(J.min()))try{const r=await nw(t.localStore);n.compareTo(r)>=0&&await function(s,o){const l=s.da.Tt(o);return l.targetChanges.forEach((u,h)=>{if(u.resumeToken.approximateByteSize()>0){const f=s.Ia.get(h);f&&s.Ia.set(h,f.withResumeToken(u.resumeToken,o))}}),l.targetMismatches.forEach((u,h)=>{const f=s.Ia.get(u);if(!f)return;s.Ia.set(u,f.withResumeToken(qe.EMPTY_BYTE_STRING,f.snapshotVersion)),ow(s,u);const p=new ar(f.target,u,h,f.sequenceNumber);Wf(s,p)}),s.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(r){$(di,"Failed to raise snapshot:",r),await hu(t,r)}}async function hu(t,e,n){if(!As(e))throw e;t.Ea.add(1),await fa(t),t.Va.set("Offline"),n||(n=()=>nw(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{$(di,"Retrying IndexedDB access"),await n(),t.Ea.delete(1),await Ku(t)})}function lw(t,e){return e().catch(n=>hu(t,n,e))}async function Gu(t){const e=X(t),n=kr(e);let r=e.Ta.length>0?e.Ta[e.Ta.length-1].batchId:kf;for(;e2(e);)try{const i=await Ok(e.localStore,r);if(i===null){e.Ta.length===0&&n.L_();break}r=i.batchId,t2(e,i)}catch(i){await hu(e,i)}uw(e)&&cw(e)}function e2(t){return yi(t)&&t.Ta.length<10}function t2(t,e){t.Ta.push(e);const n=kr(t);n.O_()&&n.Y_&&n.ea(e.mutations)}function uw(t){return yi(t)&&!kr(t).x_()&&t.Ta.length>0}function cw(t){kr(t).start()}async function n2(t){kr(t).ra()}async function r2(t){const e=kr(t);for(const n of t.Ta)e.ea(n.mutations)}async function i2(t,e,n){const r=t.Ta.shift(),i=bf.from(r,e,n);await lw(t,()=>t.remoteSyncer.applySuccessfulWrite(i)),await Gu(t)}async function s2(t,e){e&&kr(t).Y_&&await async function(r,i){if(function(o){return UP(o)&&o!==x.ABORTED}(i.code)){const s=r.Ta.shift();kr(r).B_(),await lw(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),await Gu(r)}}(t,e),uw(t)&&cw(t)}async function Iy(t,e){const n=X(t);n.asyncQueue.verifyOperationInProgress(),$(di,"RemoteStore received new credentials");const r=yi(n);n.Ea.add(3),await fa(n),r&&n.Va.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ea.delete(3),await Ku(n)}async function o2(t,e){const n=X(t);e?(n.Ea.delete(2),await Ku(n)):e||(n.Ea.add(2),await fa(n),n.Va.set("Unknown"))}function Rs(t){return t.ma||(t.ma=function(n,r,i){const s=X(n);return s.sa(),new $k(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(t.datastore,t.asyncQueue,{Zo:Yk.bind(null,t),Yo:Jk.bind(null,t),t_:Xk.bind(null,t),J_:Zk.bind(null,t)}),t.Ra.push(async e=>{e?(t.ma.B_(),Kf(t)?qf(t):t.Va.set("Unknown")):(await t.ma.stop(),aw(t))})),t.ma}function kr(t){return t.fa||(t.fa=function(n,r,i){const s=X(n);return s.sa(),new Hk(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(t.datastore,t.asyncQueue,{Zo:()=>Promise.resolve(),Yo:n2.bind(null,t),t_:s2.bind(null,t),ta:r2.bind(null,t),na:i2.bind(null,t)}),t.Ra.push(async e=>{e?(t.fa.B_(),await Gu(t)):(await t.fa.stop(),t.Ta.length>0&&($(di,`Stopping write stream with ${t.Ta.length} pending writes`),t.Ta=[]))})),t.fa}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gf{constructor(e,n,r,i,s){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new ti,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,i,s){const o=Date.now()+r,l=new Gf(e,n,o,i,s);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new z(x.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Qf(t,e){if(xn("AsyncQueue",`${e}: ${t}`),As(t))return new z(x.UNAVAILABLE,`${e}: ${t}`);throw t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zi{static emptySet(e){return new Zi(e.comparator)}constructor(e){this.comparator=e?(n,r)=>e(n,r)||W.comparator(n.key,r.key):(n,r)=>W.comparator(n.key,r.key),this.keyedMap=lo(),this.sortedSet=new Se(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof Zi)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const i=n.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){const r=new Zi;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=n,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sy{constructor(){this.ga=new Se(W.comparator)}track(e){const n=e.doc.key,r=this.ga.get(n);r?e.type!==0&&r.type===3?this.ga=this.ga.insert(n,e):e.type===3&&r.type!==1?this.ga=this.ga.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.ga=this.ga.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.ga=this.ga.remove(n):e.type===1&&r.type===2?this.ga=this.ga.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):Q(63341,{Vt:e,pa:r}):this.ga=this.ga.insert(n,e)}ya(){const e=[];return this.ga.inorderTraversal((n,r)=>{e.push(r)}),e}}class ps{constructor(e,n,r,i,s,o,l,u,h){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=o,this.syncStateChanged=l,this.excludesMetadataChanges=u,this.hasCachedResults=h}static fromInitialDocuments(e,n,r,i,s){const o=[];return n.forEach(l=>{o.push({type:0,doc:l})}),new ps(e,n,Zi.emptySet(n),o,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Bu(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let i=0;i<n.length;i++)if(n[i].type!==r[i].type||!n[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a2{constructor(){this.wa=void 0,this.ba=[]}Sa(){return this.ba.some(e=>e.Da())}}class l2{constructor(){this.queries=Ay(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(n,r){const i=X(n),s=i.queries;i.queries=Ay(),s.forEach((o,l)=>{for(const u of l.ba)u.onError(r)})})(this,new z(x.ABORTED,"Firestore shutting down"))}}function Ay(){return new gi(t=>NT(t),Bu)}async function u2(t,e){const n=X(t);let r=3;const i=e.query;let s=n.queries.get(i);s?!s.Sa()&&e.Da()&&(r=2):(s=new a2,r=e.Da()?0:1);try{switch(r){case 0:s.wa=await n.onListen(i,!0);break;case 1:s.wa=await n.onListen(i,!1);break;case 2:await n.onFirstRemoteStoreListen(i)}}catch(o){const l=Qf(o,`Initialization of query '${Ci(e.query)}' failed`);return void e.onError(l)}n.queries.set(i,s),s.ba.push(e),e.va(n.onlineState),s.wa&&e.Fa(s.wa)&&Yf(n)}async function c2(t,e){const n=X(t),r=e.query;let i=3;const s=n.queries.get(r);if(s){const o=s.ba.indexOf(e);o>=0&&(s.ba.splice(o,1),s.ba.length===0?i=e.Da()?0:1:!s.Sa()&&e.Da()&&(i=2))}switch(i){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function h2(t,e){const n=X(t);let r=!1;for(const i of e){const s=i.query,o=n.queries.get(s);if(o){for(const l of o.ba)l.Fa(i)&&(r=!0);o.wa=i}}r&&Yf(n)}function d2(t,e,n){const r=X(t),i=r.queries.get(e);if(i)for(const s of i.ba)s.onError(n);r.queries.delete(e)}function Yf(t){t.Ca.forEach(e=>{e.next()})}var vd,Cy;(Cy=vd||(vd={})).Ma="default",Cy.Cache="cache";class f2{constructor(e,n,r){this.query=e,this.xa=n,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=r||{}}Fa(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new ps(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),n=!0):this.La(e,this.onlineState)&&(this.ka(e),n=!0),this.Na=e,n}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let n=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),n=!0),n}La(e,n){if(!e.fromCache||!this.Da())return!0;const r=n!=="Offline";return(!this.options.Ka||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;const n=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}ka(e){e=ps.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==vd.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hw{constructor(e){this.key=e}}class dw{constructor(e){this.key=e}}class p2{constructor(e,n){this.query=e,this.Za=n,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=se(),this.mutatedKeys=se(),this.eu=VT(e),this.tu=new Zi(this.eu)}get nu(){return this.Za}ru(e,n){const r=n?n.iu:new Sy,i=n?n.tu:this.tu;let s=n?n.mutatedKeys:this.mutatedKeys,o=i,l=!1;const u=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,h=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((f,p)=>{const m=i.get(f),A=zu(this.query,p)?p:null,R=!!m&&this.mutatedKeys.has(m.key),V=!!A&&(A.hasLocalMutations||this.mutatedKeys.has(A.key)&&A.hasCommittedMutations);let b=!1;m&&A?m.data.isEqual(A.data)?R!==V&&(r.track({type:3,doc:A}),b=!0):this.su(m,A)||(r.track({type:2,doc:A}),b=!0,(u&&this.eu(A,u)>0||h&&this.eu(A,h)<0)&&(l=!0)):!m&&A?(r.track({type:0,doc:A}),b=!0):m&&!A&&(r.track({type:1,doc:m}),b=!0,(u||h)&&(l=!0)),b&&(A?(o=o.add(A),s=V?s.add(f):s.delete(f)):(o=o.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),s=s.delete(f.key),r.track({type:1,doc:f})}return{tu:o,iu:r,Ss:l,mutatedKeys:s}}su(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,i){const s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;const o=e.iu.ya();o.sort((f,p)=>function(A,R){const V=b=>{switch(b){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Q(20277,{Vt:b})}};return V(A)-V(R)}(f.type,p.type)||this.eu(f.doc,p.doc)),this.ou(r),i=i??!1;const l=n&&!i?this._u():[],u=this.Ya.size===0&&this.current&&!i?1:0,h=u!==this.Xa;return this.Xa=u,o.length!==0||h?{snapshot:new ps(this.query,e.tu,s,o,e.mutatedKeys,u===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),au:l}:{au:l}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Sy,mutatedKeys:this.mutatedKeys,Ss:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(n=>this.Za=this.Za.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Za=this.Za.delete(n)),this.current=e.current)}_u(){if(!this.current)return[];const e=this.Ya;this.Ya=se(),this.tu.forEach(r=>{this.uu(r.key)&&(this.Ya=this.Ya.add(r.key))});const n=[];return e.forEach(r=>{this.Ya.has(r)||n.push(new dw(r))}),this.Ya.forEach(r=>{e.has(r)||n.push(new hw(r))}),n}cu(e){this.Za=e.ks,this.Ya=se();const n=this.ru(e.documents);return this.applyChanges(n,!0)}lu(){return ps.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}}const Jf="SyncEngine";class m2{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class g2{constructor(e){this.key=e,this.hu=!1}}class y2{constructor(e,n,r,i,s,o){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=o,this.Pu={},this.Tu=new gi(l=>NT(l),Bu),this.Iu=new Map,this.Eu=new Set,this.Ru=new Se(W.comparator),this.Au=new Map,this.Vu=new jf,this.du={},this.mu=new Map,this.fu=fs.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function _2(t,e,n=!0){const r=_w(t);let i;const s=r.Tu.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.lu()):i=await fw(r,e,n,!0),i}async function v2(t,e){const n=_w(t);await fw(n,e,!0,!1)}async function fw(t,e,n,r){const i=await Lk(t.localStore,pn(e)),s=i.targetId,o=t.sharedClientState.addLocalQueryTarget(s,n);let l;return r&&(l=await E2(t,e,s,o==="current",i.resumeToken)),t.isPrimaryClient&&n&&sw(t.remoteStore,i),l}async function E2(t,e,n,r,i){t.pu=(p,m,A)=>async function(V,b,I,v){let C=b.view.ru(I);C.Ss&&(C=await _y(V.localStore,b.query,!1).then(({documents:_})=>b.view.ru(_,C)));const L=v&&v.targetChanges.get(b.targetId),F=v&&v.targetMismatches.get(b.targetId)!=null,j=b.view.applyChanges(C,V.isPrimaryClient,L,F);return Py(V,b.targetId,j.au),j.snapshot}(t,p,m,A);const s=await _y(t.localStore,e,!0),o=new p2(e,s.ks),l=o.ru(s.documents),u=da.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",i),h=o.applyChanges(l,t.isPrimaryClient,u);Py(t,n,h.au);const f=new m2(e,n,o);return t.Tu.set(e,f),t.Iu.has(n)?t.Iu.get(n).push(e):t.Iu.set(n,[e]),h.snapshot}async function T2(t,e,n){const r=X(t),i=r.Tu.get(e),s=r.Iu.get(i.targetId);if(s.length>1)return r.Iu.set(i.targetId,s.filter(o=>!Bu(o,e))),void r.Tu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await yd(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),n&&Hf(r.remoteStore,i.targetId),Ed(r,i.targetId)}).catch(Ss)):(Ed(r,i.targetId),await yd(r.localStore,i.targetId,!0))}async function w2(t,e){const n=X(t),r=n.Tu.get(e),i=n.Iu.get(r.targetId);n.isPrimaryClient&&i.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),Hf(n.remoteStore,r.targetId))}async function I2(t,e,n){const r=N2(t);try{const i=await function(o,l){const u=X(o),h=fe.now(),f=l.reduce((A,R)=>A.add(R.key),se());let p,m;return u.persistence.runTransaction("Locally write mutations","readwrite",A=>{let R=On(),V=se();return u.xs.getEntries(A,f).next(b=>{R=b,R.forEach((I,v)=>{v.isValidDocument()||(V=V.add(I))})}).next(()=>u.localDocuments.getOverlayedDocuments(A,R)).next(b=>{p=b;const I=[];for(const v of l){const C=OP(v,p.get(v.key).overlayedDocument);C!=null&&I.push(new Fr(v.key,C,wT(C.value.mapValue),Ut.exists(!0)))}return u.mutationQueue.addMutationBatch(A,h,I,l)}).next(b=>{m=b;const I=b.applyToLocalDocumentSet(p,V);return u.documentOverlayCache.saveOverlays(A,b.batchId,I)})}).then(()=>({batchId:m.batchId,changes:xT(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(o,l,u){let h=o.du[o.currentUser.toKey()];h||(h=new Se(ie)),h=h.insert(l,u),o.du[o.currentUser.toKey()]=h}(r,i.batchId,n),await pa(r,i.changes),await Gu(r.remoteStore)}catch(i){const s=Qf(i,"Failed to persist write");n.reject(s)}}async function pw(t,e){const n=X(t);try{const r=await Dk(n.localStore,e);e.targetChanges.forEach((i,s)=>{const o=n.Au.get(s);o&&(le(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1,22616),i.addedDocuments.size>0?o.hu=!0:i.modifiedDocuments.size>0?le(o.hu,14607):i.removedDocuments.size>0&&(le(o.hu,42227),o.hu=!1))}),await pa(n,r,e)}catch(r){await Ss(r)}}function Ry(t,e,n){const r=X(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const i=[];r.Tu.forEach((s,o)=>{const l=o.view.va(e);l.snapshot&&i.push(l.snapshot)}),function(o,l){const u=X(o);u.onlineState=l;let h=!1;u.queries.forEach((f,p)=>{for(const m of p.ba)m.va(l)&&(h=!0)}),h&&Yf(u)}(r.eventManager,e),i.length&&r.Pu.J_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function S2(t,e,n){const r=X(t);r.sharedClientState.updateQueryState(e,"rejected",n);const i=r.Au.get(e),s=i&&i.key;if(s){let o=new Se(W.comparator);o=o.insert(s,it.newNoDocument(s,J.min()));const l=se().add(s),u=new Wu(J.min(),new Map,new Se(ie),o,l);await pw(r,u),r.Ru=r.Ru.remove(s),r.Au.delete(e),Xf(r)}else await yd(r.localStore,e,!1).then(()=>Ed(r,e,n)).catch(Ss)}async function A2(t,e){const n=X(t),r=e.batch.batchId;try{const i=await Vk(n.localStore,e);gw(n,r,null),mw(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await pa(n,i)}catch(i){await Ss(i)}}async function C2(t,e,n){const r=X(t);try{const i=await function(o,l){const u=X(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let f;return u.mutationQueue.lookupMutationBatch(h,l).next(p=>(le(p!==null,37113),f=p.keys(),u.mutationQueue.removeMutationBatch(h,p))).next(()=>u.mutationQueue.performConsistencyCheck(h)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(h,f,l)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f)).next(()=>u.localDocuments.getDocuments(h,f))})}(r.localStore,e);gw(r,e,n),mw(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await pa(r,i)}catch(i){await Ss(i)}}function mw(t,e){(t.mu.get(e)||[]).forEach(n=>{n.resolve()}),t.mu.delete(e)}function gw(t,e,n){const r=X(t);let i=r.du[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(n?s.reject(n):s.resolve(),i=i.remove(e)),r.du[r.currentUser.toKey()]=i}}function Ed(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Iu.get(e))t.Tu.delete(r),n&&t.Pu.yu(r,n);t.Iu.delete(e),t.isPrimaryClient&&t.Vu.Gr(e).forEach(r=>{t.Vu.containsKey(r)||yw(t,r)})}function yw(t,e){t.Eu.delete(e.path.canonicalString());const n=t.Ru.get(e);n!==null&&(Hf(t.remoteStore,n),t.Ru=t.Ru.remove(e),t.Au.delete(n),Xf(t))}function Py(t,e,n){for(const r of n)r instanceof hw?(t.Vu.addReference(r.key,e),R2(t,r)):r instanceof dw?($(Jf,"Document no longer in limbo: "+r.key),t.Vu.removeReference(r.key,e),t.Vu.containsKey(r.key)||yw(t,r.key)):Q(19791,{wu:r})}function R2(t,e){const n=e.key,r=n.path.canonicalString();t.Ru.get(n)||t.Eu.has(r)||($(Jf,"New document in limbo: "+n),t.Eu.add(r),Xf(t))}function Xf(t){for(;t.Eu.size>0&&t.Ru.size<t.maxConcurrentLimboResolutions;){const e=t.Eu.values().next().value;t.Eu.delete(e);const n=new W(de.fromString(e)),r=t.fu.next();t.Au.set(r,new g2(n)),t.Ru=t.Ru.insert(n,r),sw(t.remoteStore,new ar(pn(Of(n.path)),r,"TargetPurposeLimboResolution",Fu.ce))}}async function pa(t,e,n){const r=X(t),i=[],s=[],o=[];r.Tu.isEmpty()||(r.Tu.forEach((l,u)=>{o.push(r.pu(u,e,n).then(h=>{var f;if((h||n)&&r.isPrimaryClient){const p=h?!h.fromCache:(f=n==null?void 0:n.targetChanges.get(u.targetId))==null?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,p?"current":"not-current")}if(h){i.push(h);const p=zf.Es(u.targetId,h);s.push(p)}}))}),await Promise.all(o),r.Pu.J_(i),await async function(u,h){const f=X(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>O.forEach(h,m=>O.forEach(m.Ts,A=>f.persistence.referenceDelegate.addReference(p,m.targetId,A)).next(()=>O.forEach(m.Is,A=>f.persistence.referenceDelegate.removeReference(p,m.targetId,A)))))}catch(p){if(!As(p))throw p;$($f,"Failed to update sequence numbers: "+p)}for(const p of h){const m=p.targetId;if(!p.fromCache){const A=f.vs.get(m),R=A.snapshotVersion,V=A.withLastLimboFreeSnapshotVersion(R);f.vs=f.vs.insert(m,V)}}}(r.localStore,s))}async function P2(t,e){const n=X(t);if(!n.currentUser.isEqual(e)){$(Jf,"User change. New user:",e.toKey());const r=await tw(n.localStore,e);n.currentUser=e,function(s,o){s.mu.forEach(l=>{l.forEach(u=>{u.reject(new z(x.CANCELLED,o))})}),s.mu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await pa(n,r.Ns)}}function k2(t,e){const n=X(t),r=n.Au.get(e);if(r&&r.hu)return se().add(r.key);{let i=se();const s=n.Iu.get(e);if(!s)return i;for(const o of s){const l=n.Tu.get(o);i=i.unionWith(l.view.nu)}return i}}function _w(t){const e=X(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=pw.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=k2.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=S2.bind(null,e),e.Pu.J_=h2.bind(null,e.eventManager),e.Pu.yu=d2.bind(null,e.eventManager),e}function N2(t){const e=X(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=A2.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=C2.bind(null,e),e}class du{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=qu(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,n){return null}Mu(e,n){return null}vu(e){return Nk(this.persistence,new Rk,e.initialUser,this.serializer)}Cu(e){return new ew(Bf.Vi,this.serializer)}Du(e){return new bk}async terminate(){var e,n;(e=this.gcScheduler)==null||e.stop(),(n=this.indexBackfillerScheduler)==null||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}du.provider={build:()=>new du};class V2 extends du{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,n){le(this.persistence.referenceDelegate instanceof cu,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new dk(r,e.asyncQueue,n)}Cu(e){const n=this.cacheSizeBytes!==void 0?pt.withCacheSize(this.cacheSizeBytes):pt.DEFAULT;return new ew(r=>cu.Vi(r,n),this.serializer)}}class Td{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Ry(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=P2.bind(null,this.syncEngine),await o2(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new l2}()}createDatastore(e){const n=qu(e.databaseInfo.databaseId),r=zk(e.databaseInfo);return Kk(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,i,s,o,l){return new Qk(r,i,s,o,l)}(this.localStore,this.datastore,e.asyncQueue,n=>Ry(this.syncEngine,n,0),function(){return Ty.v()?new Ty:new Fk}())}createSyncEngine(e,n){return function(i,s,o,l,u,h,f){const p=new y2(i,s,o,l,u,h);return f&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(i){const s=X(i);$(di,"RemoteStore shutting down."),s.Ea.add(5),await fa(s),s.Aa.shutdown(),s.Va.set("Unknown")}(this.remoteStore),(e=this.datastore)==null||e.terminate(),(n=this.eventManager)==null||n.terminate()}}Td.provider={build:()=>new Td};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class D2{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):xn("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nr="FirestoreClient";class x2{constructor(e,n,r,i,s){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this._databaseInfo=i,this.user=nt.UNAUTHENTICATED,this.clientId=Mu.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async o=>{$(Nr,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>($(Nr,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new ti;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=Qf(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function rh(t,e){t.asyncQueue.verifyOperationInProgress(),$(Nr,"Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async i=>{r.isEqual(i)||(await tw(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function ky(t,e){t.asyncQueue.verifyOperationInProgress();const n=await O2(t);$(Nr,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>Iy(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,i)=>Iy(e.remoteStore,i)),t._onlineComponents=e}async function O2(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){$(Nr,"Using user provided OfflineComponentProvider");try{await rh(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(i){return i.name==="FirebaseError"?i.code===x.FAILED_PRECONDITION||i.code===x.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(n))throw n;Sr("Error using user provided cache. Falling back to memory cache: "+n),await rh(t,new du)}}else $(Nr,"Using default OfflineComponentProvider"),await rh(t,new V2(void 0));return t._offlineComponents}async function vw(t){return t._onlineComponents||(t._uninitializedComponentsProvider?($(Nr,"Using user provided OnlineComponentProvider"),await ky(t,t._uninitializedComponentsProvider._online)):($(Nr,"Using default OnlineComponentProvider"),await ky(t,new Td))),t._onlineComponents}function L2(t){return vw(t).then(e=>e.syncEngine)}async function Ny(t){const e=await vw(t),n=e.eventManager;return n.onListen=_2.bind(null,e.syncEngine),n.onUnlisten=T2.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=v2.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=w2.bind(null,e.syncEngine),n}function M2(t,e,n,r){const i=new D2(r),s=new f2(e,i,n);return t.asyncQueue.enqueueAndForget(async()=>u2(await Ny(t),s)),()=>{i.Nu(),t.asyncQueue.enqueueAndForget(async()=>c2(await Ny(t),s))}}function b2(t,e){const n=new ti;return t.asyncQueue.enqueueAndForget(async()=>I2(await L2(t),e,n)),n.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ew(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F2="ComponentProvider",Vy=new Map;function U2(t,e,n,r,i){return new tP(t,e,n,i.host,i.ssl,i.experimentalForceLongPolling,i.experimentalAutoDetectLongPolling,Ew(i.experimentalLongPollingOptions),i.useFetchStreams,i.isUsingEmulator,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tw="firestore.googleapis.com",Dy=!0;class xy{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new z(x.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Tw,this.ssl=Dy}else this.host=e.host,this.ssl=e.ssl??Dy;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=ZT;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<ck)throw new z(x.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}hT("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Ew(e.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new z(x.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new z(x.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new z(x.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Qu{constructor(e,n,r,i){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new xy({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new z(x.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new z(x.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new xy(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new uT;switch(r.type){case"firstParty":return new UR(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new z(x.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=Vy.get(n);r&&($(F2,"Removing Datastore"),Vy.delete(n),r.terminate())}(this),Promise.resolve()}}function ww(t,e,n,r={}){var h;t=Jt(t,Qu);const i=vs(e),s=t._getSettings(),o={...s,emulatorOptions:t._getEmulatorOptions()},l=`${e}:${n}`;i&&(pE(`https://${l}`),mE("Firestore",!0)),s.host!==Tw&&s.host!==l&&Sr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u={...s,host:l,ssl:i,emulatorOptions:r};if(!li(u,o)&&(t._setSettings(u),r.mockUserToken)){let f,p;if(typeof r.mockUserToken=="string")f=r.mockUserToken,p=nt.MOCK_USER;else{f=GS(r.mockUserToken,(h=t._app)==null?void 0:h.options.projectId);const m=r.mockUserToken.sub||r.mockUserToken.user_id;if(!m)throw new z(x.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new nt(m)}t._authCredentials=new MR(new lT(f,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ur{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Ur(this.firestore,e,this._query)}}class Re{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Cn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Re(this.firestore,e,this._key)}toJSON(){return{type:Re._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,r){if(ca(n,Re._jsonSchema))return new Re(e,r||null,new W(de.fromString(n.referencePath)))}}Re._jsonSchemaVersion="firestore/documentReference/1.0",Re._jsonSchema={type:Oe("string",Re._jsonSchemaVersion),referencePath:Oe("string")};class Cn extends Ur{constructor(e,n,r){super(e,n,Of(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Re(this.firestore,null,new W(e))}withConverter(e){return new Cn(this.firestore,e,this._path)}}function Ln(t,e,...n){if(t=je(t),cT("collection","path",e),t instanceof Qu){const r=de.fromString(e,...n);return Wg(r),new Cn(t,null,r)}{if(!(t instanceof Re||t instanceof Cn))throw new z(x.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(de.fromString(e,...n));return Wg(r),new Cn(t.firestore,null,r)}}function ct(t,e,...n){if(t=je(t),arguments.length===1&&(e=Mu.newId()),cT("doc","path",e),t instanceof Qu){const r=de.fromString(e,...n);return Hg(r),new Re(t,null,new W(r))}{if(!(t instanceof Re||t instanceof Cn))throw new z(x.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(de.fromString(e,...n));return Hg(r),new Re(t.firestore,t instanceof Cn?t.converter:null,new W(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oy="AsyncQueue";class Ly{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new rw(this,"async_queue_retry"),this._c=()=>{const r=nh();r&&$(Oy,"Visibility state changed to "+r.visibilityState),this.M_.w_()},this.ac=e;const n=nh();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const n=nh();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});const n=new ti;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!As(e))throw e;$(Oy,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){const n=this.ac.then(()=>(this.rc=!0,e().catch(r=>{throw this.nc=r,this.rc=!1,xn("INTERNAL UNHANDLED ERROR: ",My(r)),r}).then(r=>(this.rc=!1,r))));return this.ac=n,n}enqueueAfterDelay(e,n,r){this.uc(),this.oc.indexOf(e)>-1&&(n=0);const i=Gf.createAndSchedule(this,e,n,r,s=>this.hc(s));return this.tc.push(i),i}uc(){this.nc&&Q(47125,{Pc:My(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(const n of this.tc)if(n.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.tc)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){const n=this.tc.indexOf(e);this.tc.splice(n,1)}}function My(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}class Vr extends Qu{constructor(e,n,r,i){super(e,n,r,i),this.type="firestore",this._queue=new Ly,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Ly(e),this._firestoreClient=void 0,await e}}}function Iw(t,e){const n=typeof t=="object"?t:vE(),r=typeof t=="string"?t:su,i=vf(n,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=qS("firestore");s&&ww(i,...s)}return i}function Zf(t){if(t._terminated)throw new z(x.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||j2(t),t._firestoreClient}function j2(t){var r,i,s,o;const e=t._freezeSettings(),n=U2(t._databaseId,((r=t._app)==null?void 0:r.options.appId)||"",t._persistenceKey,(i=t._app)==null?void 0:i.options.apiKey,e);t._componentsProvider||(s=e.localCache)!=null&&s._offlineComponentProvider&&((o=e.localCache)!=null&&o._onlineComponentProvider)&&(t._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),t._firestoreClient=new x2(t._authCredentials,t._appCheckCredentials,t._queue,n,t._componentsProvider&&function(u){const h=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(h),_online:h}}(t._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At{constructor(e){this._byteString=e}static fromBase64String(e){try{return new At(qe.fromBase64String(e))}catch(n){throw new z(x.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new At(qe.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:At._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(ca(e,At._jsonSchema))return At.fromBase64String(e.bytes)}}At._jsonSchemaVersion="firestore/bytes/1.0",At._jsonSchema={type:Oe("string",At._jsonSchemaVersion),bytes:Oe("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yu{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new z(x.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new He(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ma{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xt{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new z(x.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new z(x.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return ie(this._lat,e._lat)||ie(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Xt._jsonSchemaVersion}}static fromJSON(e){if(ca(e,Xt._jsonSchema))return new Xt(e.latitude,e.longitude)}}Xt._jsonSchemaVersion="firestore/geoPoint/1.0",Xt._jsonSchema={type:Oe("string",Xt._jsonSchemaVersion),latitude:Oe("number"),longitude:Oe("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jt{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:jt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(ca(e,jt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new jt(e.vectorValues);throw new z(x.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}jt._jsonSchemaVersion="firestore/vectorValue/1.0",jt._jsonSchema={type:Oe("string",jt._jsonSchemaVersion),vectorValues:Oe("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const B2=/^__.*__$/;class z2{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new Fr(e,this.data,this.fieldMask,n,this.fieldTransforms):new ha(e,this.data,n,this.fieldTransforms)}}class Sw{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new Fr(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function Aw(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Q(40011,{dataSource:t})}}class ep{constructor(e,n,r,i,s,o){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new ep({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var i;const n=(i=this.path)==null?void 0:i.child(e),r=this.contextWith({path:n,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){var i;const n=(i=this.path)==null?void 0:i.child(e),r=this.contextWith({path:n,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return fu(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(Aw(this.dataSource)&&B2.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class $2{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||qu(e)}createContext(e,n,r,i=!1){return new ep({dataSource:e,methodName:n,targetDoc:r,path:He.emptyPath(),arrayElement:!1,hasConverter:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Ju(t){const e=t._freezeSettings(),n=qu(t._databaseId);return new $2(t._databaseId,!!e.ignoreUndefinedProperties,n)}function Cw(t,e,n,r,i,s={}){const o=t.createContext(s.merge||s.mergeFields?2:0,e,n,i);np("Data must be an object, but it was:",o,r);const l=Rw(r,o);let u,h;if(s.merge)u=new Rt(o.fieldMask),h=o.fieldTransforms;else if(s.mergeFields){const f=[];for(const p of s.mergeFields){const m=ms(e,p,n);if(!o.contains(m))throw new z(x.INVALID_ARGUMENT,`Field '${m}' is specified in your field mask but missing from your input data.`);Nw(f,m)||f.push(m)}u=new Rt(f),h=o.fieldTransforms.filter(p=>u.covers(p.field))}else u=null,h=o.fieldTransforms;return new z2(new gt(l),u,h)}class Xu extends ma{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Xu}}class tp extends ma{_toFieldTransform(e){return new NP(e.path,new Jo)}isEqual(e){return e instanceof tp}}function H2(t,e,n,r){const i=t.createContext(1,e,n);np("Data must be an object, but it was:",i,r);const s=[],o=gt.empty();br(r,(u,h)=>{const f=kw(e,u,n);h=je(h);const p=i.childContextForFieldPath(f);if(h instanceof Xu)s.push(f);else{const m=ga(h,p);m!=null&&(s.push(f),o.set(f,m))}});const l=new Rt(s);return new Sw(o,l,i.fieldTransforms)}function W2(t,e,n,r,i,s){const o=t.createContext(1,e,n),l=[ms(e,r,n)],u=[i];if(s.length%2!=0)throw new z(x.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let m=0;m<s.length;m+=2)l.push(ms(e,s[m])),u.push(s[m+1]);const h=[],f=gt.empty();for(let m=l.length-1;m>=0;--m)if(!Nw(h,l[m])){const A=l[m];let R=u[m];R=je(R);const V=o.childContextForFieldPath(A);if(R instanceof Xu)h.push(A);else{const b=ga(R,V);b!=null&&(h.push(A),f.set(A,b))}}const p=new Rt(h);return new Sw(f,p,o.fieldTransforms)}function q2(t,e,n,r=!1){return ga(n,t.createContext(r?4:3,e))}function ga(t,e){if(Pw(t=je(t)))return np("Unsupported field value:",e,t),Rw(t,e);if(t instanceof ma)return function(r,i){if(!Aw(i.dataSource))throw i.createError(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(r,i){const s=[];let o=0;for(const l of r){let u=ga(l,i.childContextForArray(o));u==null&&(u={nullValue:"NULL_VALUE"}),s.push(u),o++}return{arrayValue:{values:s}}}(t,e)}return function(r,i){if((r=je(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return RP(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=fe.fromDate(r);return{timestampValue:uu(i.serializer,s)}}if(r instanceof fe){const s=new fe(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:uu(i.serializer,s)}}if(r instanceof Xt)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof At)return{bytesValue:WT(i.serializer,r._byteString)};if(r instanceof Re){const s=i.databaseId,o=r.firestore._databaseId;if(!o.isEqual(s))throw i.createError(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:Uf(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof jt)return function(o,l){const u=o instanceof jt?o.toArray():o;return{mapValue:{fields:{[ET]:{stringValue:TT},[ou]:{arrayValue:{values:u.map(f=>{if(typeof f!="number")throw l.createError("VectorValues must only contain numeric values.");return Lf(l.serializer,f)})}}}}}}(r,i);if(XT(r))return r._toProto(i.serializer);throw i.createError(`Unsupported field value: ${bu(r)}`)}(t,e)}function Rw(t,e){const n={};return pT(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):br(t,(r,i)=>{const s=ga(i,e.childContextForField(r));s!=null&&(n[r]=s)}),{mapValue:{fields:n}}}function Pw(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof fe||t instanceof Xt||t instanceof At||t instanceof Re||t instanceof ma||t instanceof jt||XT(t))}function np(t,e,n){if(!Pw(n)||!dT(n)){const r=bu(n);throw r==="an object"?e.createError(t+" a custom object"):e.createError(t+" "+r)}}function ms(t,e,n){if((e=je(e))instanceof Yu)return e._internalPath;if(typeof e=="string")return kw(t,e);throw fu("Field path arguments must be of type string or ",t,!1,void 0,n)}const K2=new RegExp("[~\\*/\\[\\]]");function kw(t,e,n){if(e.search(K2)>=0)throw fu(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new Yu(...e.split("."))._internalPath}catch{throw fu(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function fu(t,e,n,r,i){const s=r&&!r.isEmpty(),o=i!==void 0;let l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let u="";return(s||o)&&(u+=" (found",s&&(u+=` in field ${r}`),o&&(u+=` in document ${i}`),u+=")"),new z(x.INVALID_ARGUMENT,l+t+u)}function Nw(t,e){return t.some(n=>n.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vw{convertValue(e,n="none"){switch(Pr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Pe(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Rr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw Q(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return br(e,(i,s)=>{r[i]=this.convertValue(s,n)}),r}convertVectorValue(e){var r,i,s;const n=(s=(i=(r=e.fields)==null?void 0:r[ou].arrayValue)==null?void 0:i.values)==null?void 0:s.map(o=>Pe(o.doubleValue));return new jt(n)}convertGeoPoint(e){return new Xt(Pe(e.latitude),Pe(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=ju(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(Go(e));default:return null}}convertTimestamp(e){const n=Cr(e);return new fe(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=de.fromString(e);le(JT(r),9688,{name:e});const i=new cs(r.get(1),r.get(3)),s=new W(r.popFirst(5));return i.isEqual(n)||xn(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),s}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dw extends Vw{constructor(e){super(),this.firestore=e}convertBytes(e){return new At(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new Re(this.firestore,null,n)}}function Zu(){return new tp("serverTimestamp")}const by="@firebase/firestore",Fy="4.12.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uy(t){return function(n,r){if(typeof n!="object"||n===null)return!1;const i=n;for(const s of r)if(s in i&&typeof i[s]=="function")return!0;return!1}(t,["next","error","complete"])}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xw{constructor(e,n,r,i,s){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Re(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new G2(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const n=this._document.data.field(ms("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class G2 extends xw{data(){return super.data()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Q2(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new z(x.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class rp{}class ip extends rp{}function ya(t,e,...n){let r=[];e instanceof rp&&r.push(e),r=r.concat(n),function(s){const o=s.filter(u=>u instanceof tc).length,l=s.filter(u=>u instanceof ec).length;if(o>1||o>0&&l>0)throw new z(x.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)t=i._apply(t);return t}class ec extends ip{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new ec(e,n,r)}_apply(e){const n=this._parse(e);return Ow(e._query,n),new Ur(e.firestore,e.converter,hd(e._query,n))}_parse(e){const n=Ju(e.firestore);return function(s,o,l,u,h,f,p){let m;if(h.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new z(x.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){By(p,f);const R=[];for(const V of p)R.push(jy(u,s,V));m={arrayValue:{values:R}}}else m=jy(u,s,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||By(p,f),m=q2(l,o,p,f==="in"||f==="not-in");return xe.create(h,f,m)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}class tc extends rp{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new tc(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:tn.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(i,s){let o=i;const l=s.getFlattenedFilters();for(const u of l)Ow(o,u),o=hd(o,u)}(e._query,n),new Ur(e.firestore,e.converter,hd(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class nc extends ip{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new nc(e,n)}_apply(e){const n=function(i,s,o){if(i.startAt!==null)throw new z(x.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new z(x.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Yo(s,o)}(e._query,this._field,this._direction);return new Ur(e.firestore,e.converter,vP(e._query,n))}}function _a(t,e="asc"){const n=e,r=ms("orderBy",t);return nc._create(r,n)}function jy(t,e,n){if(typeof(n=je(n))=="string"){if(n==="")throw new z(x.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!kT(e)&&n.indexOf("/")!==-1)throw new z(x.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(de.fromString(n));if(!W.isDocumentKey(r))throw new z(x.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Zg(t,new W(r))}if(n instanceof Re)return Zg(t,n._key);throw new z(x.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${bu(n)}.`)}function By(t,e){if(!Array.isArray(t)||t.length===0)throw new z(x.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Ow(t,e){const n=function(i,s){for(const o of i)for(const l of o.getFlattenedFilters())if(s.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new z(x.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new z(x.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}function Lw(t,e,n){let r;return r=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,r}class zi{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Tr extends xw{constructor(e,n,r,i,s,o){super(e,n,r,i,o),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new Co(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field(ms("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new z(x.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,n={};return n.type=Tr._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}}Tr._jsonSchemaVersion="firestore/documentSnapshot/1.0",Tr._jsonSchema={type:Oe("string",Tr._jsonSchemaVersion),bundleSource:Oe("string","DocumentSnapshot"),bundleName:Oe("string"),bundle:Oe("string")};class Co extends Tr{data(e={}){return super.data(e)}}class ni{constructor(e,n,r,i){this._firestore=e,this._userDataWriter=n,this._snapshot=i,this.metadata=new zi(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new Co(this._firestore,this._userDataWriter,r.key,r,new zi(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new z(x.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let o=0;return i._snapshot.docChanges.map(l=>{const u=new Co(i._firestore,i._userDataWriter,l.doc.key,l.doc,new zi(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);return l.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(l=>s||l.type!==3).map(l=>{const u=new Co(i._firestore,i._userDataWriter,l.doc.key,l.doc,new zi(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);let h=-1,f=-1;return l.type!==0&&(h=o.indexOf(l.doc.key),o=o.delete(l.doc.key)),l.type!==1&&(o=o.add(l.doc),f=o.indexOf(l.doc.key)),{type:Y2(l.type),doc:u,oldIndex:h,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new z(x.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=ni._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Mu.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const n=[],r=[],i=[];return this.docs.forEach(s=>{s._document!==null&&(n.push(s._document),r.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),i.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Y2(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Q(61501,{type:t})}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ni._jsonSchemaVersion="firestore/querySnapshot/1.0",ni._jsonSchema={type:Oe("string",ni._jsonSchemaVersion),bundleSource:Oe("string","QuerySnapshot"),bundleName:Oe("string"),bundle:Oe("string")};function J2(t,e,n){t=Jt(t,Re);const r=Jt(t.firestore,Vr),i=Lw(t.converter,e,n),s=Ju(r);return wa(r,[Cw(s,"setDoc",t._key,i,t.converter!==null,n).toMutation(t._key,Ut.none())])}function va(t,e,n,...r){t=Jt(t,Re);const i=Jt(t.firestore,Vr),s=Ju(i);let o;return o=typeof(e=je(e))=="string"||e instanceof Yu?W2(s,"updateDoc",t._key,e,n,r):H2(s,"updateDoc",t._key,e),wa(i,[o.toMutation(t._key,Ut.exists(!0))])}function Ea(t){return wa(Jt(t.firestore,Vr),[new Mf(t._key,Ut.none())])}function Ta(t,e){const n=Jt(t.firestore,Vr),r=ct(t),i=Lw(t.converter,e),s=Ju(t.firestore);return wa(n,[Cw(s,"addDoc",r._key,i,t.converter!==null,{}).toMutation(r._key,Ut.exists(!1))]).then(()=>r)}function Dr(t,...e){var h,f,p;t=je(t);let n={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||Uy(e[r])||(n=e[r++]);const i={includeMetadataChanges:n.includeMetadataChanges,source:n.source};if(Uy(e[r])){const m=e[r];e[r]=(h=m.next)==null?void 0:h.bind(m),e[r+1]=(f=m.error)==null?void 0:f.bind(m),e[r+2]=(p=m.complete)==null?void 0:p.bind(m)}let s,o,l;if(t instanceof Re)o=Jt(t.firestore,Vr),l=Of(t._key.path),s={next:m=>{e[r]&&e[r](X2(o,t,m))},error:e[r+1],complete:e[r+2]};else{const m=Jt(t,Ur);o=Jt(m.firestore,Vr),l=m._query;const A=new Dw(o);s={next:R=>{e[r]&&e[r](new ni(o,A,m,R))},error:e[r+1],complete:e[r+2]},Q2(t._query)}const u=Zf(o);return M2(u,l,i,s)}function wa(t,e){const n=Zf(t);return b2(n,e)}function X2(t,e,n){const r=n.docs.get(e._key),i=new Dw(t);return new Tr(t,i,e._key,r,new zi(n.hasPendingWrites,n.fromCache),e.converter)}(function(e,n=!0){LR(Es),as(new ui("firestore",(r,{instanceIdentifier:i,options:s})=>{const o=r.getProvider("app").getImmediate(),l=new Vr(new bR(r.getProvider("auth-internal")),new jR(o,r.getProvider("app-check-internal")),nP(o,i),o);return s={useFetchStreams:n,...s},l._setSettings(s),l},"PUBLIC").setMultipleInstances(!0)),_r(by,Fy,e),_r(by,Fy,"esm2020")})();const Mw=Object.freeze(Object.defineProperty({__proto__:null,AbstractUserDataWriter:Vw,Bytes:At,CollectionReference:Cn,DocumentReference:Re,DocumentSnapshot:Tr,FieldPath:Yu,FieldValue:ma,Firestore:Vr,FirestoreError:z,GeoPoint:Xt,Query:Ur,QueryCompositeFilterConstraint:tc,QueryConstraint:ip,QueryDocumentSnapshot:Co,QueryFieldFilterConstraint:ec,QueryOrderByConstraint:nc,QuerySnapshot:ni,SnapshotMetadata:zi,Timestamp:fe,VectorValue:jt,_AutoId:Mu,_ByteString:qe,_DatabaseId:cs,_DocumentKey:W,_EmptyAuthCredentialsProvider:uT,_FieldPath:He,_cast:Jt,_logWarn:Sr,_validateIsNotUsedTogether:hT,addDoc:Ta,collection:Ln,connectFirestoreEmulator:ww,deleteDoc:Ea,doc:ct,ensureFirestoreConfigured:Zf,executeWrite:wa,getFirestore:Iw,onSnapshot:Dr,orderBy:_a,query:ya,serverTimestamp:Zu,setDoc:J2,updateDoc:va},Symbol.toStringTag,{value:"Module"})),Z2={apiKey:"AIzaSyAqORIPOvrGoBjFTelJcZQZtJutCS2p0rc",authDomain:"immortalityvn.firebaseapp.com",projectId:"immortalityvn",storageBucket:"immortalityvn.firebasestorage.app",messagingSenderId:"204809901558",appId:"1:204809901558:web:169a7b3168a9d3d3a623d7",measurementId:"G-NZ6ZX0RN4L"},bw=_E(Z2),Ne=Iw(bw),eN=VR(bw);function tN(){const[t,e]=q.useState(()=>{const r=localStorage.getItem("theme");return r?r==="dark":!0});return q.useEffect(()=>{localStorage.setItem("theme",t?"dark":"light"),document.documentElement.setAttribute("data-theme",t?"dark":"light")},[t]),{dark:t,toggle:()=>e(r=>!r)}}function nN(){const[t,e]=q.useState(()=>{try{return JSON.parse(localStorage.getItem("cached_articles"))||[]}catch{return[]}}),[n,r]=q.useState(()=>!localStorage.getItem("cached_articles"));return q.useEffect(()=>{try{const l=ya(Ln(Ne,"articles"),_a("date","desc"));return Dr(l,h=>{const f=h.docs.map(p=>({id:p.id,...p.data()}));e(f),r(!1);try{localStorage.setItem("cached_articles",JSON.stringify(f))}catch{}},()=>{r(!1)})}catch{r(!1)}},[]),{firestoreArticles:t,loading:n,addArticle:async l=>{await Ta(Ln(Ne,"articles"),{...l,createdAt:Zu()})},updateArticle:async(l,u)=>{await va(ct(Ne,"articles",l),u)},deleteArticle:async l=>{await Ea(ct(Ne,"articles",l))}}}const rN={vi:{siteName:"Bất Tử Đạo",siteTagline:"Trí Tuệ Người Việt Nam",heroTitle:"Phi Thuyền Trí Tuệ",heroSub:"Khám phá ánh sáng bên trong bạn — hành trình chữa lành từ trí tuệ Việt Nam ngàn đời",heroCta:"Khám Phá Ngay",topicsTitle:"Chủ Đề",articlesTitle:"Bài Viết Mới",articles:"bài viết",readMore:"Đọc tiếp",watchVideo:"Xem video",back:"← Quay lại",videoPlaceholder:"Video sẽ được cập nhật",searchTitle:"Tìm Kiếm",searchPlaceholder:"Tìm theo tiêu đề, câu hỏi...",noResults:"Không tìm thấy kết quả",contactTitle:"Liên Hệ",contactName:"Họ và tên",contactEmail:"Email",contactMsg:"Nội dung tin nhắn",contactSend:"Gửi Tin Nhắn",contactThanks:"Cảm ơn bạn! Tin nhắn đã được gửi.",footer:"© 2026 Bất Tử Đạo. Nội dung mang tính chia sẻ cá nhân, không thay thế tư vấn y khoa chuyên nghiệp.",navHome:"Trang chủ",navAbout:"Giới thiệu",navTopics:"Chủ đề",navSearch:"Tìm kiếm",navContact:"Liên hệ",menuOpen:"Menu",share:"Chia sẻ",copyLink:"Sao chép link",copied:"Đã sao chép!",comments:"Bình luận",commentName:"Tên của bạn",commentText:"Viết bình luận...",commentSend:"Gửi",commentEmpty:"Chưa có bình luận nào. Hãy là người đầu tiên!",adminTitle:"Quản Lý Bài Viết",adminLogin:"Đăng nhập Admin",adminEmail:"Email",adminPassword:"Mật khẩu",adminSignIn:"Đăng nhập",adminSignOut:"Đăng xuất",adminAdd:"Thêm bài viết",adminEdit:"Sửa",adminDelete:"Xoá",adminSave:"Lưu",adminCancel:"Huỷ",adminTopic:"Chủ đề",adminTag:"Tag",adminDate:"Ngày",adminTitleVi:"Tiêu đề (VI)",adminTitleEn:"Tiêu đề (EN)",adminQuestionVi:"Câu hỏi (VI)",adminQuestionEn:"Câu hỏi (EN)",adminSummaryVi:"Tóm tắt (VI)",adminSummaryEn:"Tóm tắt (EN)",adminBodyVi:"Nội dung (VI)",adminBodyEn:"Nội dung (EN)",adminTagVi:"Tag (VI)",adminTagEn:"Tag (EN)",adminConfirmDelete:"Bạn có chắc muốn xoá bài viết này?",rss:"RSS Feed",darkMode:"Chế độ tối",lightMode:"Chế độ sáng",loading:"Đang tải...",loginError:"Email hoặc mật khẩu không đúng"},en:{siteName:"Immortality",siteTagline:"Vietnamese Wisdom",heroTitle:"Spaceship of Wisdom",heroSub:"Discover the light within you — a healing journey from timeless Vietnamese wisdom",heroCta:"Explore Now",topicsTitle:"Topics",articlesTitle:"Latest Articles",articles:"articles",readMore:"Read more",watchVideo:"Watch video",back:"← Go back",videoPlaceholder:"Video coming soon",searchTitle:"Search",searchPlaceholder:"Search by title, question...",noResults:"No results found",contactTitle:"Contact",contactName:"Full name",contactEmail:"Email",contactMsg:"Message",contactSend:"Send Message",contactThanks:"Thank you! Your message has been sent.",footer:"© 2026 Immortality. Content is personal sharing and does not replace professional medical advice.",navHome:"Home",navAbout:"About",navTopics:"Topics",navSearch:"Search",navContact:"Contact",menuOpen:"Menu",share:"Share",copyLink:"Copy link",copied:"Copied!",comments:"Comments",commentName:"Your name",commentText:"Write a comment...",commentSend:"Send",commentEmpty:"No comments yet. Be the first!",adminTitle:"Manage Articles",adminLogin:"Admin Login",adminEmail:"Email",adminPassword:"Password",adminSignIn:"Sign In",adminSignOut:"Sign Out",adminAdd:"Add article",adminEdit:"Edit",adminDelete:"Delete",adminSave:"Save",adminCancel:"Cancel",adminTopic:"Topic",adminTag:"Tag",adminDate:"Date",adminTitleVi:"Title (VI)",adminTitleEn:"Title (EN)",adminQuestionVi:"Question (VI)",adminQuestionEn:"Question (EN)",adminSummaryVi:"Summary (VI)",adminSummaryEn:"Summary (EN)",adminBodyVi:"Body (VI)",adminBodyEn:"Body (EN)",adminTagVi:"Tag (VI)",adminTagEn:"Tag (EN)",adminConfirmDelete:"Are you sure you want to delete this article?",rss:"RSS Feed",darkMode:"Dark mode",lightMode:"Light mode",loading:"Loading...",loginError:"Invalid email or password"}},MN=[{id:"site",label:"Trang chủ / Site",keys:["siteName","siteTagline","heroTitle","heroSub","heroCta","footer"]},{id:"nav",label:"Điều hướng / Navigation",keys:["navHome","navAbout","navTopics","navSearch","navContact","menuOpen"]},{id:"content",label:"Nội dung / Content",keys:["topicsTitle","articlesTitle","articles","readMore","watchVideo","back","videoPlaceholder"]},{id:"search",label:"Tìm kiếm / Search",keys:["searchTitle","searchPlaceholder","noResults"]},{id:"contact",label:"Liên hệ / Contact",keys:["contactTitle","contactName","contactEmail","contactMsg","contactSend","contactThanks"]},{id:"social",label:"Chia sẻ & Bình luận",keys:["share","copyLink","copied","comments","commentName","commentText","commentSend","commentEmpty"]},{id:"admin",label:"Admin Panel",keys:["adminTitle","adminLogin","adminEmail","adminPassword","adminSignIn","adminSignOut","adminAdd","adminEdit","adminDelete","adminSave","adminCancel","adminConfirmDelete"]},{id:"admin2",label:"Admin Fields",keys:["adminTopic","adminTag","adminDate","adminTitleVi","adminTitleEn","adminQuestionVi","adminQuestionEn","adminSummaryVi","adminSummaryEn","adminBodyVi","adminBodyEn","adminTagVi","adminTagEn"]},{id:"other",label:"Khác / Other",keys:["rss","darkMode","lightMode","loading","loginError"]}];function iN(){const[t,e]=q.useState(null),[n,r]=q.useState(null),[i,s]=q.useState(!0);return q.useEffect(()=>{let u=0;const h=()=>{++u>=2&&s(!1)};try{const f=Dr(ct(Ne,"translations","vi"),m=>{m.exists()&&e(m.data()),h()},()=>h()),p=Dr(ct(Ne,"translations","en"),m=>{m.exists()&&r(m.data()),h()},()=>h());return()=>{f(),p()}}catch{s(!1)}},[]),{getT:u=>({...rN[u],...u==="vi"?t:n}),firestoreVi:t,firestoreEn:n,loading:i,updateTranslations:async(u,h)=>{const{setDoc:f}=await Dt(async()=>{const{setDoc:p}=await Promise.resolve().then(()=>Mw);return{setDoc:p}},void 0);await f(ct(Ne,"translations",u),h,{merge:!0})}}}function sN(){const[t,e]=q.useState(()=>{try{return JSON.parse(localStorage.getItem("cached_topics"))||[]}catch{return[]}}),[n,r]=q.useState(()=>!localStorage.getItem("cached_topics"));return q.useEffect(()=>{try{const l=ya(Ln(Ne,"topics"),_a("order","asc"));return Dr(l,h=>{const f=h.docs.map(p=>({id:p.id,...p.data()}));e(f),r(!1);try{localStorage.setItem("cached_topics",JSON.stringify(f))}catch{}},()=>{r(!1)})}catch{r(!1)}},[]),{topics:t,loading:n,addTopic:async l=>{await Ta(Ln(Ne,"topics"),l)},updateTopic:async(l,u)=>{await va(ct(Ne,"topics",l),u)},deleteTopic:async l=>{await Ea(ct(Ne,"topics",l))}}}function oN(){const[t,e]=q.useState(()=>{try{return JSON.parse(localStorage.getItem("cached_stories"))||[]}catch{return[]}}),[n,r]=q.useState(()=>!localStorage.getItem("cached_stories"));return q.useEffect(()=>{try{const l=ya(Ln(Ne,"stories"),_a("order","asc"));return Dr(l,h=>{const f=h.docs.map(p=>({id:p.id,...p.data()}));e(f),r(!1);try{localStorage.setItem("cached_stories",JSON.stringify(f))}catch{}},()=>{r(!1)})}catch{r(!1)}},[]),{stories:t,loading:n,addStory:async l=>{await Ta(Ln(Ne,"stories"),{...l,createdAt:Zu()})},updateStory:async(l,u)=>{await va(ct(Ne,"stories",l),u)},deleteStory:async l=>{await Ea(ct(Ne,"stories",l))}}}function sp(t,e="order"){const[n,r]=q.useState(()=>{try{return JSON.parse(localStorage.getItem(`cached_${t}`))||[]}catch{return[]}}),[i,s]=q.useState(()=>!localStorage.getItem(`cached_${t}`));return q.useEffect(()=>{try{const h=ya(Ln(Ne,t),_a(e,"asc"));return Dr(h,p=>{const m=p.docs.map(A=>({id:A.id,...A.data()}));r(m),s(!1);try{localStorage.setItem(`cached_${t}`,JSON.stringify(m))}catch{}},()=>{s(!1)})}catch{s(!1)}},[]),{items:n,loading:i,add:async h=>{await Ta(Ln(Ne,t),{...h,createdAt:Zu()})},update:async(h,f)=>{await va(ct(Ne,t,h),f)},remove:async h=>{await Ea(ct(Ne,t,h))}}}function aN(){const{items:t,loading:e,add:n,update:r,remove:i}=sp("khaitri");return{khaitri:t,loading:e,addKhaiTri:n,updateKhaiTri:r,deleteKhaiTri:i}}function lN(){const{items:t,loading:e,add:n,update:r,remove:i}=sp("teachings");return{teachings:t,loading:e,addTeaching:n,updateTeaching:r,deleteTeaching:i}}function uN(){const{items:t,loading:e,add:n,update:r,remove:i}=sp("practices");return{practices:t,loading:e,addPractice:n,updatePractice:r,deletePractice:i}}const Fn=[{id:"home",path:"",labelVi:"Trang Chủ",labelEn:"Home",icon:"🏠",navDefault:{visible:!0,showInBottom:!0}},{id:"articles",path:"articles",labelVi:"Bài Viết",labelEn:"Articles",titleVi:"Bài Viết",titleEn:"Articles",descVi:"Tất cả bài viết về tâm linh, sức khỏe và bất tử.",descEn:"All articles on spirituality, health and immortality.",icon:"📝",navDefault:{visible:!1,showInBottom:!1},adminTab:{vi:"Bài viết",en:"Articles"}},{id:"stories",path:"stories",aliases:["story/"],labelVi:"37 Chuyện",labelEn:"Stories",titleVi:"37 Câu Chuyện",titleEn:"37 Stories",descVi:"Những câu chuyện thật về hành trình chữa lành và giác ngộ tâm linh.",descEn:"True stories of healing and spiritual awakening.",icon:"📖",navDefault:{visible:!0,showInBottom:!0},adminTab:{vi:"Câu chuyện",en:"Stories"},homeCard:{icon:"book",descVi:"Hành trình tu luyện siêu trí tuệ qua những câu chuyện có thật",descEn:"The journey of super-intelligence cultivation through true stories"}},{id:"khaitri",path:"khaitri",aliases:["khaitri/"],redirectFrom:["revelations"],labelVi:"Khai Trí",labelEn:"Khai Trí",titleVi:"Khai Trí",titleEn:"Khai Trí",descVi:"Hỏi đáp trí tuệ — giải đáp những câu hỏi về tâm linh, sức khỏe và bất tử.",descEn:"Q&A wisdom — answers on spirituality, health, and immortality.",icon:"💡",navDefault:{visible:!0,showInBottom:!0},adminTab:{vi:"Khai Trí",en:"Khai Trí"},homeCard:{icon:"layers",descVi:"Hỏi đáp với Người Bất Tử về chân lý cuộc sống",descEn:"Q&A with the Immortal about life truths"}},{id:"about",path:"about",labelVi:"Giới Thiệu",labelEn:"About",titleVi:"Giới Thiệu",titleEn:"About",descVi:"Tìm hiểu về Bất Tử Đạo và phương pháp năng lượng Mặt Trời.",descEn:"Learn about the Path of Immortality and the Solar Energy method.",icon:"ℹ️",navDefault:{visible:!0,showInBottom:!1},homeCard:{icon:"info",descVi:"Lý thuyết nền tảng về siêu trí tuệ và con đường bất tử",descEn:"Foundational theory of super-intelligence and the path to immortality"}},{id:"practice",path:"practice",labelVi:"Thái Dương Quyền",labelEn:"Solar Fist",titleVi:"Thái Dương Quyền",titleEn:"Solar Fist",descVi:"Học Thái Dương Quyền — bài tập năng lượng mặt trời cho sức khỏe và trí tuệ.",descEn:"Learn Solar Fist — sun energy exercises for health and wisdom.",icon:"☀️",navDefault:{visible:!0,showInBottom:!0},adminTab:{vi:"Thái Dương Quyền",en:"Solar Fist"},homeCard:{icon:"sun",descVi:"10 chiêu thức luyện năng lượng mặt trời",descEn:"10 movements of solar energy cultivation"}},{id:"contact",path:"contact",labelVi:"Liên Hệ",labelEn:"Contact",titleVi:"Liên Hệ",titleEn:"Contact",descVi:"Liên hệ với chúng tôi để được hỗ trợ và tư vấn.",descEn:"Contact us for support and guidance.",icon:"✉️",navDefault:{visible:!0,showInBottom:!0}},{id:"search",path:"search",labelVi:"Tìm Kiếm",labelEn:"Search",titleVi:"Tìm Kiếm",titleEn:"Search",descVi:"Tìm kiếm bài viết, câu chuyện và nội dung trên Bất Tử Đạo.",descEn:"Search articles, stories and content on Immortality.",icon:"🔍"},{id:"admin",path:"admin",labelVi:"Quản Trị",labelEn:"Admin",titleVi:"Quản Trị",titleEn:"Admin",descVi:"Trang quản trị nội dung Bất Tử Đạo.",descEn:"Immortality content management panel.",icon:"⚙️"}];Object.fromEntries(Fn.map(t=>[t.id,t]));const cN=Fn.filter(t=>t.navDefault||t.id==="search"||t.id==="articles").map(t=>({id:t.id,labelVi:t.labelVi,labelEn:t.labelEn})),bN=Object.fromEntries(Fn.filter(t=>t.icon).map(t=>[t.id,t.icon])),pu=Fn.filter(t=>t.navDefault).map(t=>({id:t.id,labelVi:t.labelVi,labelEn:t.labelEn,...t.navDefault})),zy=Fn.filter(t=>t.homeCard).map(t=>({id:t.id,icon:t.homeCard.icon,labelVi:t.titleVi||t.labelVi,labelEn:t.titleEn||t.labelEn,descVi:t.homeCard.descVi,descEn:t.homeCard.descEn,visible:!0})),$y=Object.fromEntries(Fn.filter(t=>t.titleVi).map(t=>[t.id,{vi:t.titleVi,en:t.titleEn}])),hN=Object.fromEntries(Fn.filter(t=>t.descVi).map(t=>[t.id,{vi:t.descVi,en:t.descEn}])),FN=cN.map(t=>({id:t.id,vi:t.labelVi,en:t.labelEn})),UN=[...Fn.filter(t=>t.adminTab).map(t=>({id:t.id,icon:t.icon,vi:t.adminTab.vi,en:t.adminTab.en})),{id:"teachings",icon:"ℹ️",vi:"Giới Thiệu",en:"Teachings"},{id:"topics",icon:"🏷️",vi:"Chủ đề",en:"Topics"},{id:"translations",icon:"🌐",vi:"Ngôn ngữ",en:"Translations"},{id:"homepage",icon:"🏠",vi:"Trang chủ",en:"Home Page"},{id:"settings",icon:"⚙️",vi:"Cài đặt",en:"Settings"}];function dN(t){var n,r;const e=t.replace(/^\//,"");if(!e)return{id:"home"};for(const i of Fn)if(i.path){if(e===i.path)return{id:i.id};if((n=i.aliases)!=null&&n.some(s=>s.endsWith("/")?e.startsWith(s):e===s))return{id:i.id};if((r=i.redirectFrom)!=null&&r.includes(e))return{id:i.id,redirect:`/${i.path}`}}return null}const Hy={showSun:!0,showTitle:!0,showSubtitle:!0,showCtaPrimary:!0,showCtaSecondary:!0,ctaPrimaryVi:"Khám Phá Câu Chuyện",ctaPrimaryEn:"Explore Stories",ctaPrimaryLink:"stories",ctaSecondaryVi:"",ctaSecondaryEn:"",ctaSecondaryLink:"search"};function Wy(t){if(!t)return t;const e={...t};return e.navItems&&(e.navItems=e.navItems.map(n=>n.id==="revelations"?{...n,id:"khaitri",labelVi:n.labelVi==="Khai Thị"?"Khai Trí":n.labelVi,labelEn:n.labelEn==="Revelations"?"Khai Trí":n.labelEn}:n)),e.homeCards&&(e.homeCards=e.homeCards.map(n=>n.id==="revelations"?{...n,id:"khaitri",labelVi:n.labelVi==="Khai Thị"?"Khai Trí":n.labelVi,labelEn:n.labelEn==="Revelations"?"Enlightenment Q&A":n.labelEn}:n)),e}function fN(){const[t,e]=q.useState(()=>{try{const s=JSON.parse(localStorage.getItem("cached_site_settings"));return s?Wy(s):{navItems:pu,homeCards:zy,hero:Hy}}catch{return{navItems:pu,homeCards:zy,hero:Hy}}}),[n,r]=q.useState(!0);return q.useEffect(()=>{try{return Dr(ct(Ne,"settings","site"),o=>{if(o.exists()){const l=Wy(o.data());e(l);try{localStorage.setItem("cached_site_settings",JSON.stringify(l))}catch{}}r(!1)},()=>{r(!1)})}catch{r(!1)}},[]),{settings:t,loading:n,updateSettings:async s=>{const{setDoc:o}=await Dt(async()=>{const{setDoc:l}=await Promise.resolve().then(()=>Mw);return{setDoc:l}},void 0);await o(ct(Ne,"settings","site"),s,{merge:!0})}}}function pN(t){const[e,n]=q.useState(()=>{const o=localStorage.getItem("fontSize");return o?parseInt(o,10):t||100});return q.useEffect(()=>{t&&!localStorage.getItem("fontSize")&&n(t)},[t]),q.useEffect(()=>{localStorage.setItem("fontSize",String(e)),document.documentElement.style.setProperty("--reader-scale",e/100)},[e]),{fontSize:e,increase:()=>n(o=>Math.min(o+10,150)),decrease:()=>n(o=>Math.max(o-10,80)),reset:()=>{localStorage.removeItem("fontSize"),n(t||100)}}}const mN={à:"a",á:"a",ạ:"a",ả:"a",ã:"a",â:"a",ầ:"a",ấ:"a",ậ:"a",ẩ:"a",ẫ:"a",ă:"a",ằ:"a",ắ:"a",ặ:"a",ẳ:"a",ẵ:"a",è:"e",é:"e",ẹ:"e",ẻ:"e",ẽ:"e",ê:"e",ề:"e",ế:"e",ệ:"e",ể:"e",ễ:"e",ì:"i",í:"i",ị:"i",ỉ:"i",ĩ:"i",ò:"o",ó:"o",ọ:"o",ỏ:"o",õ:"o",ô:"o",ồ:"o",ố:"o",ộ:"o",ổ:"o",ỗ:"o",ơ:"o",ờ:"o",ớ:"o",ợ:"o",ở:"o",ỡ:"o",ù:"u",ú:"u",ụ:"u",ủ:"u",ũ:"u",ư:"u",ừ:"u",ứ:"u",ự:"u",ử:"u",ữ:"u",ỳ:"y",ý:"y",ỵ:"y",ỷ:"y",ỹ:"y",đ:"d"};function op(t){return t?t.toLowerCase().split("").map(e=>mN[e]||e).join("").replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,""):""}function qy(t){var n,r;const e=((n=t==null?void 0:t.vi)==null?void 0:n.title)||((r=t==null?void 0:t.en)==null?void 0:r.title)||"";return op(e)||t.id}function jN(t){const e=String(t.order||1).padStart(2,"0"),n=t.titleVi||t.titleEn||"",r=op(n);return r?`${e}-${r}`:e}function BN(t){var i,s;const e=String(t.order||1).padStart(2,"0"),n=((i=t.vi)==null?void 0:i.title)||((s=t.en)==null?void 0:s.title)||"",r=op(n);return r?`${e}-${r}`:e}function gN(){return D.jsxs(D.Fragment,{children:[D.jsx("div",{className:"ambient"}),D.jsx("div",{className:"light-rays",children:[10,25,45,65,85].map((t,e)=>D.jsx("div",{className:"light-ray",style:{left:`${t}%`,animationDelay:`${e*1.5}s`,transform:`rotate(${-30+e*15}deg)`}},e))}),D.jsx("div",{className:"particles",children:Array.from({length:15}).map((t,e)=>D.jsx("div",{className:"particle",style:{left:`${Math.random()*100}%`,width:`${2+Math.random()*3}px`,height:`${2+Math.random()*3}px`,animationDuration:`${6+Math.random()*8}s`,animationDelay:`${Math.random()*8}s`}},e))})]})}function yN({size:t=28}){return D.jsxs("svg",{viewBox:"0 0 100 100",width:t,height:t,className:"sun-icon","aria-hidden":"true",children:[D.jsx("defs",{children:D.jsxs("radialGradient",{id:`sg${t}`,cx:"50%",cy:"50%",r:"50%",children:[D.jsx("stop",{offset:"0%",stopColor:"#e4c78a"}),D.jsx("stop",{offset:"100%",stopColor:"#c9a86c"})]})}),D.jsx("circle",{cx:"50",cy:"50",r:"30",fill:"none",stroke:"#c9a86c",strokeWidth:"0.8",opacity:"0.25",className:"sun-glow"}),D.jsx("circle",{cx:"50",cy:"50",r:"18",fill:`url(#sg${t})`}),Array.from({length:12}).map((e,n)=>{const r=n*30*Math.PI/180,i=50+Math.cos(r)*24,s=50+Math.sin(r)*24,o=50+Math.cos(r)*38,l=50+Math.sin(r)*38;return D.jsx("line",{x1:i,y1:s,x2:o,y2:l,stroke:"#c9a86c",strokeWidth:"2",strokeLinecap:"round",className:"sun-ray",style:{animationDelay:`${n*.15}s`}},n)})]})}const Ky=["contact"];function _N({t,lang:e,dark:n,page:r,menuOpen:i,navigate:s,toggleTheme:o,setLang:l,setMenuOpen:u,user:h,navItems:f}){const p=(f||pu).filter(R=>R.visible),m=p.filter(R=>!Ky.includes(R.id)),A=p.filter(R=>Ky.includes(R.id));return D.jsxs(D.Fragment,{children:[D.jsx("header",{className:"header",children:D.jsxs("div",{className:"header-inner",children:[D.jsxs("div",{className:"logo",onClick:()=>s("home"),children:[D.jsx(yN,{size:28}),D.jsx("span",{className:"logo-text",children:t.siteName})]}),D.jsx("div",{className:"desktop-nav",children:m.map(R=>D.jsx("button",{className:r===R.id?"active":"",onClick:()=>s(R.id),children:e==="vi"?R.labelVi:R.labelEn},R.id))}),D.jsxs("div",{className:"header-actions",children:[A.map(R=>D.jsx("button",{className:`header-action-nav ${r===R.id?"active":""}`,onClick:()=>s(R.id),children:e==="vi"?R.labelVi:R.labelEn},R.id)),D.jsx("button",{className:`login-btn ${r==="admin"?"active":""}`,onClick:()=>s("admin"),title:h?"Admin":e==="vi"?"Đăng nhập":"Sign in",children:D.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:h?D.jsxs(D.Fragment,{children:[D.jsx("circle",{cx:"12",cy:"12",r:"3"}),D.jsx("path",{d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"})]}):D.jsxs(D.Fragment,{children:[D.jsx("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),D.jsx("circle",{cx:"12",cy:"7",r:"4"})]})})}),D.jsx("button",{className:"theme-btn",onClick:o,title:n?t.lightMode:t.darkMode,children:n?"☀":"☾"}),D.jsx("button",{className:"lang-btn",onClick:()=>l(R=>R==="vi"?"en":"vi"),children:e==="vi"?"EN":"VI"}),D.jsxs("button",{className:`hamburger ${i?"open":""}`,onClick:()=>u(R=>!R),"aria-label":t.menuOpen,children:[D.jsx("span",{}),D.jsx("span",{}),D.jsx("span",{})]})]})]})}),D.jsxs("div",{className:`overlay-nav ${i?"open":""}`,children:[D.jsx("button",{className:"overlay-close",onClick:()=>u(!1),"aria-label":"Close",children:"✕"}),D.jsxs("nav",{className:"overlay-links",children:[p.map(R=>D.jsx("button",{className:r===R.id?"active":"",onClick:()=>s(R.id),children:e==="vi"?R.labelVi:R.labelEn},R.id)),D.jsx("div",{className:"overlay-divider"}),D.jsx("button",{className:`overlay-login ${r==="admin"?"active":""}`,onClick:()=>s("admin"),children:h?e==="vi"?"Quản trị":"Admin":e==="vi"?"Đăng nhập":"Sign in"})]})]})]})}const Gy={home:D.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[D.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),D.jsx("polyline",{points:"9 22 9 12 15 12 15 22"})]}),articles:D.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[D.jsx("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),D.jsx("polyline",{points:"14 2 14 8 20 8"}),D.jsx("line",{x1:"16",y1:"13",x2:"8",y2:"13"}),D.jsx("line",{x1:"16",y1:"17",x2:"8",y2:"17"}),D.jsx("polyline",{points:"10 9 9 9 8 9"})]}),stories:D.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[D.jsx("path",{d:"M4 19.5A2.5 2.5 0 0 1 6.5 17H20"}),D.jsx("path",{d:"M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"})]}),khaitri:D.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[D.jsx("path",{d:"M12 2L2 7l10 5 10-5-10-5z"}),D.jsx("path",{d:"M2 17l10 5 10-5"}),D.jsx("path",{d:"M2 12l10 5 10-5"})]}),about:D.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[D.jsx("circle",{cx:"12",cy:"12",r:"10"}),D.jsx("line",{x1:"12",y1:"16",x2:"12",y2:"12"}),D.jsx("line",{x1:"12",y1:"8",x2:"12.01",y2:"8"})]}),practice:D.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[D.jsx("circle",{cx:"12",cy:"12",r:"5"}),D.jsx("line",{x1:"12",y1:"1",x2:"12",y2:"3"}),D.jsx("line",{x1:"12",y1:"21",x2:"12",y2:"23"}),D.jsx("line",{x1:"4.22",y1:"4.22",x2:"5.64",y2:"5.64"}),D.jsx("line",{x1:"18.36",y1:"18.36",x2:"19.78",y2:"19.78"}),D.jsx("line",{x1:"1",y1:"12",x2:"3",y2:"12"}),D.jsx("line",{x1:"21",y1:"12",x2:"23",y2:"12"}),D.jsx("line",{x1:"4.22",y1:"19.78",x2:"5.64",y2:"18.36"}),D.jsx("line",{x1:"18.36",y1:"5.64",x2:"19.78",y2:"4.22"})]}),contact:D.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[D.jsx("path",{d:"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"}),D.jsx("polyline",{points:"22,6 12,13 2,6"})]}),search:D.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[D.jsx("circle",{cx:"11",cy:"11",r:"8"}),D.jsx("line",{x1:"21",y1:"21",x2:"16.65",y2:"16.65"})]})};function vN({t,lang:e,page:n,navigate:r,navItems:i}){const s=(i||pu).filter(o=>o.visible&&o.showInBottom).slice(0,5);return D.jsx("nav",{className:"bottom-nav",children:s.map(o=>D.jsxs("button",{className:n===o.id?"active":"",onClick:()=>r(o.id),children:[Gy[o.id]||Gy.home,e==="vi"?o.labelVi:o.labelEn]},o.id))})}function EN({articles:t,lang:e}){const n=()=>{const r=window.location.origin,i=e==="vi"?"Bất Tử Đạo":"Immortality",s=e==="vi"?"Trí Tuệ Người Việt Nam":"Vietnamese Wisdom",o=t.map(f=>{const p=f[e];return p?`
    <item>
      <title>${Qy(p.title)}</title>
      <description>${Qy(p.summary)}</description>
      <link>${r}/#article-${f.id}</link>
      <pubDate>${new Date(f.date).toUTCString()}</pubDate>
      <guid>${r}/#article-${f.id}</guid>
    </item>`:""}).join(""),l=`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${i}</title>
    <link>${r}</link>
    <description>${s}</description>
    <language>${e}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${r}/rss.xml" rel="self" type="application/rss+xml"/>${o}
  </channel>
</rss>`,u=new Blob([l],{type:"application/rss+xml"}),h=URL.createObjectURL(u);window.open(h,"_blank"),setTimeout(()=>URL.revokeObjectURL(h),1e4)};return D.jsxs("button",{className:"rss-btn",onClick:n,title:"RSS Feed",children:[D.jsxs("svg",{viewBox:"0 0 24 24",width:"16",height:"16",fill:"currentColor",children:[D.jsx("circle",{cx:"6.18",cy:"17.82",r:"2.18"}),D.jsx("path",{d:"M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"})]}),"RSS"]})}function Qy(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}const TN=q.lazy(()=>Dt(()=>import("./HomePage-ObDjyrCq.js"),__vite__mapDeps([0,1,2]))),wN=q.lazy(()=>Dt(()=>import("./SearchPage-C0RKfLaP.js"),__vite__mapDeps([3,1,2]))),IN=q.lazy(()=>Dt(()=>import("./ArticlesPage-eiwjLxGe.js"),__vite__mapDeps([4,1,2]))),SN=q.lazy(()=>Dt(()=>import("./ArticleDetail-Cw_hnHdL.js"),__vite__mapDeps([5,2,1,6]))),AN=q.lazy(()=>Dt(()=>import("./TopicPage-DlWKsX5u.js"),__vite__mapDeps([7,1,2]))),CN=q.lazy(()=>Dt(()=>import("./StoriesPage-BohR3_Ga.js"),__vite__mapDeps([8,9,2,6]))),RN=q.lazy(()=>Dt(()=>import("./KhaiTriPage-58sNu1z9.js"),__vite__mapDeps([10,2,6]))),PN=q.lazy(()=>Dt(()=>import("./AboutPage-zfvK-u5P.js"),[])),kN=q.lazy(()=>Dt(()=>import("./ContactPage-S4kpzVFv.js"),[])),NN=q.lazy(()=>Dt(()=>import("./PracticePage-BVyNOr63.js"),[])),VN=q.lazy(()=>Dt(()=>import("./AdminPanel-BimfJWdM.js"),__vite__mapDeps([11,9])));function DN(){const[t,e]=q.useState("vi"),[n,r]=q.useState("home"),[i,s]=q.useState(null),[o,l]=q.useState(null),[u,h]=q.useState(!1),[f,p]=q.useState(null),{dark:m,toggle:A}=tN(),{firestoreArticles:R,loading:V,addArticle:b,updateArticle:I,deleteArticle:v}=nN(),{getT:C,firestoreVi:L,firestoreEn:F,updateTranslations:j}=iN(),{topics:_,addTopic:y,updateTopic:E,deleteTopic:w}=sN(),{stories:S,addStory:P,updateStory:T,deleteStory:Le}=oN(),{khaitri:xt,addKhaiTri:jr,updateKhaiTri:Un,deleteKhaiTri:B}=aN(),{teachings:K,addTeaching:Z,updateTeaching:he,deleteTeaching:ve}=lN(),{practices:nn,addPractice:ft,updatePractice:yn,deletePractice:Tt}=uN(),{settings:Je,updateSettings:Ps}=fN(),{fontSize:_i,increase:ks,decrease:Ns,reset:vi}=pN(Je==null?void 0:Je.defaultFontSize),Ee=C(t),wt=R;q.useEffect(()=>{try{return EC(eN,p)}catch{}},[]);const Ia=()=>{const Y=window.location.pathname;if(!Y||Y==="/"){r("home");return}if(Y.startsWith("/topic/")){s(Y.slice(7)),r("topic");return}if(Y.startsWith("/article/")){const Xe=Y.slice(9),_n=wt.find(Bn=>qy(Bn)===Xe||String(Bn.id)===Xe);_n&&(l(_n),r("article"));return}const ee=dN(Y);ee&&(r(ee.id),ee.redirect&&history.replaceState({},"",ee.redirect))},Ei=q.useRef(!1);q.useEffect(()=>{if(Ei.current)return;const Y=window.location.pathname;Y!=null&&Y.startsWith("/article/")&&wt.length===0||(Ia(),Ei.current=!0)},[wt.length]),q.useEffect(()=>{const Y=()=>Ia();return window.addEventListener("popstate",Y),()=>window.removeEventListener("popstate",Y)}),q.useEffect(()=>{window.scrollTo(0,0)},[n,o]);const jn=(Y,ee)=>{var Xe,_n,Bn,Sa,zn;document.title=Y,(Xe=document.querySelector('meta[name="description"]'))==null||Xe.setAttribute("content",ee),(_n=document.querySelector('meta[property="og:title"]'))==null||_n.setAttribute("content",Y),(Bn=document.querySelector('meta[property="og:description"]'))==null||Bn.setAttribute("content",ee),(Sa=document.querySelector('meta[name="twitter:title"]'))==null||Sa.setAttribute("content",Y),(zn=document.querySelector('meta[name="twitter:description"]'))==null||zn.setAttribute("content",ee)};q.useEffect(()=>{const Y=t==="vi"?"Khám phá ánh sáng bên trong bạn — hành trình chữa lành từ trí tuệ Việt Nam ngàn đời.":"Discover the light within — a healing journey from ancient Vietnamese wisdom.";if(n==="article"&&o){const ee=o[t];ee&&jn(`${ee.title} | ${Ee.siteName}`,ee.summary||Y)}else if(n==="topic"&&i){const ee=_.find(_n=>_n.id===i),Xe=ee?t==="vi"?ee.vi:ee.en:i;jn(`${Xe} | ${Ee.siteName}`,Y)}else if($y[n]){const ee=$y[n],Xe=hN[n];jn(`${t==="vi"?ee.vi:ee.en} | ${Ee.siteName}`,Xe?t==="vi"?Xe.vi:Xe.en:Y)}else jn(`${Ee.siteName} - ${Ee.siteTagline}`,Y)},[n,o,i,t]);const Ot=(Y,ee)=>{h(!1),Y==="topic"?(s(ee),r("topic"),history.pushState({},"",`/topic/${ee}`)):Y==="article"?(l(ee),r("article"),history.pushState({},"",`/article/${qy(ee)}`)):(r(Y),history.pushState({},"",Y==="home"?"/":`/${Y}`))};return D.jsxs(D.Fragment,{children:[D.jsx(gN,{}),D.jsxs("div",{className:"app-wrap",children:[D.jsx(_N,{t:Ee,lang:t,dark:m,page:n,menuOpen:u,navigate:Ot,toggleTheme:A,setLang:e,setMenuOpen:h,user:f,navItems:Je.navItems}),D.jsx("main",{className:"container",children:D.jsxs(q.Suspense,{fallback:D.jsx("div",{style:{textAlign:"center",padding:40,color:"var(--text-dim)"},children:"Đang tải..."}),children:[n==="home"&&D.jsx(TN,{t:Ee,lang:t,topics:_,articles:wt,stories:S,loading:V,navigate:Ot,siteSettings:Je}),n==="topic"&&D.jsx(AN,{t:Ee,lang:t,topics:_,articles:wt,selectedTopic:i,navigate:Ot}),n==="article"&&o&&D.jsx(SN,{t:Ee,lang:t,article:o,navigate:Ot,articles:wt,topics:_,fontSize:_i,onFontIncrease:ks,onFontDecrease:Ns,onFontReset:vi,user:f,onUpdateArticle:I}),n==="search"&&D.jsx(wN,{t:Ee,lang:t,articles:wt,navigate:Ot}),n==="about"&&D.jsx(PN,{t:Ee,lang:t,teachings:K}),n==="articles"&&D.jsx(IN,{t:Ee,lang:t,articles:wt,topics:_,navigate:Ot}),n==="stories"&&D.jsx(CN,{t:Ee,lang:t,firestoreStories:S,navigate:Ot,fontSize:_i,onFontIncrease:ks,onFontDecrease:Ns,onFontReset:vi,user:f,onUpdateStory:T}),n==="practice"&&D.jsx(NN,{t:Ee,lang:t,practices:nn}),n==="khaitri"&&D.jsx(RN,{t:Ee,lang:t,items:xt,navigate:Ot,fontSize:_i,onFontIncrease:ks,onFontDecrease:Ns,onFontReset:vi,user:f,onUpdateKhaiTri:Un}),n==="contact"&&D.jsx(kN,{t:Ee}),n==="admin"&&D.jsx(VN,{t:Ee,lang:t,user:f,articles:wt,topics:_,stories:S,khaitri:xt,teachings:K,practices:nn,firestoreVi:L,firestoreEn:F,onAddArticle:b,onUpdateArticle:I,onDeleteArticle:v,onAddTopic:y,onUpdateTopic:E,onDeleteTopic:w,onAddStory:P,onUpdateStory:T,onDeleteStory:Le,onAddKhaiTri:jr,onUpdateKhaiTri:Un,onDeleteKhaiTri:B,onAddTeaching:Z,onUpdateTeaching:he,onDeleteTeaching:ve,onAddPractice:ft,onUpdatePractice:yn,onDeletePractice:Tt,onUpdateTranslations:j,siteSettings:Je,onUpdateSettings:Ps})]})}),D.jsxs("footer",{className:"footer",children:[D.jsx("div",{className:"footer-links",children:D.jsx(EN,{articles:wt,lang:t})}),Ee.footer]}),D.jsx(vN,{t:Ee,lang:t,page:n,navigate:Ot,navItems:Je.navItems})]})]})}ih.createRoot(document.getElementById("root")).render(D.jsx(SI.StrictMode,{children:D.jsx(DN,{})}));export{cN as A,rN as D,bN as N,FN as P,yN as S,MN as T,qy as a,LS as b,Ln as c,Ne as d,Dr as e,Ea as f,ct as g,Ta as h,jN as i,D as j,BN as k,pu as l,zy as m,Hy as n,_a as o,UN as p,ya as q,q as r,Zu as s,ON as t,va as u,xN as v,eN as w};
