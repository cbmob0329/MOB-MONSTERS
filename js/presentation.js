/* Shared, bounded preloading and non-rotating transitions. */
(()=>{'use strict';
const cache=new Map(),loaded=new Map();
function warm(path){
 if(cache.has(path))return cache.get(path);
 const task=new Promise(resolve=>{const img=new Image(),urls=[...new Set([path,...(window.MOBMON_ASSETS?.candidates(path)||[])])];let i=0;img.onload=()=>{const finish=()=>{loaded.set(path,img);img.dataset.mobAsset=path;window.MOBMON_ASSETS?.loaded(img);resolve(img);};if(img.decode)img.decode().catch(()=>{}).then(finish);else finish();};img.onerror=()=>{if(++i<urls.length)img.src=urls[i];else{cache.delete(path);resolve(null);}};img.src=urls[0];});cache.set(path,task);return task;
}
async function preload(paths,timeout=3000){const unique=[...new Set(paths.filter(Boolean))];let cursor=0,timer,stopped=false;const work=Promise.all(Array.from({length:Math.min(6,unique.length)},async()=>{while(!stopped&&cursor<unique.length)await warm(unique[cursor++]);}));await Promise.race([work,new Promise(r=>timer=setTimeout(r,timeout))]);stopped=true;clearTimeout(timer);}
async function transition(label,paths,change,kind='warp'){
 const app=document.querySelector('#app'),overlay=document.createElement('div');overlay.className=`journey-overlay ${kind}`;
 overlay.innerHTML='<section><small>MOB MONSTERS</small><h2></h2><p role="status">画像を準備しています…</p><div class="journey-gate"></div><img class="journey-robo" src="robo/001.png" alt=""><div class="journey-streaks"></div></section>';
 overlay.querySelector('h2').textContent=label;document.body.appendChild(overlay);const previous=app.inert;window.MOBMON_LOADING?.suspend();app.inert=true;
 try{await preload(['robo/001.png',...paths]);overlay.querySelector('p').textContent=kind==='arena'?'闘技場、開幕。':'ソウルの道が開く。';overlay.classList.add('playing');await new Promise(r=>setTimeout(r,650));await change();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));overlay.classList.add('arriving');await new Promise(r=>setTimeout(r,650));}finally{overlay.remove();app.inert=previous;window.MOBMON_LOADING?.resume();}
}
window.MOBMON_PRESENT={preload,warm,transition,ready:path=>loaded.get(path)};
})();
