/* Wait only for artwork needed now. No whole-collection download or rotating FX. */
(()=>{
  'use strict';
  const screen=document.querySelector('#screen'),modal=document.querySelector('#modal');
  const overlay=document.querySelector('#assetLoading'),progress=document.querySelector('#loadingProgress');
  const status=document.querySelector('#loadingStatus'),skip=document.querySelector('#loadingSkip');
  const backgrounds=new Map();
  const loadingArt=window.MOBMON_UI_ASSETS?.loading;
  if(loadingArt)overlay.style.backgroundImage=`linear-gradient(#10253088,#0d1f2de8),url("${new URL(loadingArt,document.baseURI).href}")`;
  let active=null,first=true,screenKey='',frame=0;
  function background(url){
    if(!backgrounds.has(url)){
      const img=new Image();const entry={img,ready:false};
      entry.promise=new Promise(resolve=>{img.onload=()=>{entry.ready=true;resolve();};img.onerror=()=>{backgrounds.delete(url);resolve();};});
      backgrounds.set(url,entry);img.src=url;
    }
    return backgrounds.get(url);
  }
  function waitImage(img,cleanups){
    if(img.complete&&(img.naturalWidth||img.classList.contains('failed')))return Promise.resolve();
    return new Promise(resolve=>{
      const done=()=>{img.removeEventListener('load',load);img.removeEventListener('error',error);resolve();};
      const load=()=>{if(img.decode)img.decode().catch(()=>{}).then(done);else done();};
      const error=()=>{if(img.classList.contains('failed')||!img.dataset.mobAsset)done();};
      img.addEventListener('load',load);img.addEventListener('error',error);cleanups.push(done);
      // An image may have completed between the first check and listener installation.
      if(img.complete&&img.naturalWidth)load();
    });
  }
  function reveal(){overlay.hidden=true;document.querySelector('#app').inert=false;modal.inert=false;}
  function cancel(){if(active)active.finish();}
  function prepare(host,boot=false){
    cancel();
    const cleanups=[];let ended=false,shown=false,done=0;
    const images=[...host.querySelectorAll('img')].filter(img=>{
      const r=img.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
    }).slice(0,24);
    const jobs=images.filter(img=>!(img.complete&&img.naturalWidth)).map(img=>waitImage(img,cleanups));
    // CSS scene URLs are root-relative config entries, so prefetch against document.baseURI.
    const assets=window.MOBMON_UI_ASSETS||{};
    const scene=host===screen?(screen.classList.contains('home-v6')?'home':screen.classList.contains('castle-v6')?'castle':/lab-v6|fusion-v6/.test(screen.className)?'lab':null):null;
    if(scene&&assets[scene]){const entry=background(new URL(assets[scene],document.baseURI).href);if(!entry.ready)jobs.push(entry.promise);}
    if(!jobs.length){reveal();return;}
    let delay,limit,skipDelay;
    const finish=()=>{
      if(ended)return;ended=true;clearTimeout(delay);clearTimeout(limit);clearTimeout(skipDelay);
      for(const img of images)if(!img.complete&&!img.naturalWidth)img.classList.add('asset-waiting');
      cleanups.forEach(fn=>fn());reveal();if(active?.finish===finish)active=null;
    };
    active={finish};progress.max=jobs.length;progress.value=0;skip.hidden=true;
    status.textContent='仲間たちを呼んでいます…';skip.onclick=finish;
    // Cached/fast images never flash a loading screen.
    delay=setTimeout(()=>{if(ended)return;shown=true;overlay.hidden=false;document.querySelector('#app').inert=true;modal.inert=true;},120);
    skipDelay=setTimeout(()=>{skip.hidden=false;},1000);
    limit=setTimeout(finish,boot?3500:1800);
    for(const job of jobs)job.then(()=>{if(ended)return;done++;progress.value=done;if(shown)status.textContent=`画像を準備しています ${done} / ${jobs.length}`;if(done===jobs.length)finish();});
  }
  function inspect(){
    frame=0;const key=screen.className;
    if(key!==screenKey){screenKey=key;prepare(screen,first);first=false;}
  }
  new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(inspect);}).observe(screen,{attributes:true,attributeFilter:['class'],childList:true});
  new MutationObserver(()=>{
    if(!modal.hidden&&!modal.querySelector('.birth-v6,.level-up'))prepare(modal);
    else if(modal.hidden&&active)cancel();
  }).observe(modal,{attributes:true,attributeFilter:['hidden'],childList:true,subtree:true});
  window.addEventListener('pagehide',cancel);
  requestAnimationFrame(inspect);
})();
