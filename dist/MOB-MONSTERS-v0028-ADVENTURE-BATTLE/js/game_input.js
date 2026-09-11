/* Suppress browser gestures on game surfaces while keeping menus scrollable. */
(()=>{
  'use strict';
  const editable=target=>target instanceof Element&&!!target.closest('input,textarea,select,[contenteditable="true"]');
  const gameSurface=target=>target instanceof Element&&!!target.closest('#app,#modal,#assetLoading,.encounter-overlay');
  const cancel=e=>{if(gameSurface(e.target)&&!editable(e.target)&&e.cancelable)e.preventDefault();};
  for(const type of ['contextmenu','selectstart','dragstart','dblclick'])document.addEventListener(type,cancel,{capture:true,passive:false});
  // Safari uses gesture events for pinch zoom even when the viewport forbids scaling.
  for(const type of ['gesturestart','gesturechange','gestureend'])document.addEventListener(type,e=>{if(gameSurface(e.target)&&e.cancelable)e.preventDefault();},{passive:false});
  for(const type of ['touchstart','touchmove'])document.addEventListener(type,e=>{if(gameSurface(e.target)&&e.touches.length>1&&e.cancelable)e.preventDefault();},{passive:false});
})();
