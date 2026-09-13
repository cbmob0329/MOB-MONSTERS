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
 const home=kind==='return',reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 overlay.innerHTML=`<section><div class="journey-horizon"></div><small>${home?'MISSION RETURN':kind==='depart'?'ROBO EXPEDITION':'MOB MONSTERS'}</small><h2></h2><p role="status">${home?'帰還ルートを確保しています…':'ロボ、出発準備中…'}</p><div class="journey-gate"></div><div class="journey-orbits"><i></i><i></i><i></i></div><img class="journey-robo" src="robo/${home?'002':'001'}.png" alt="モブロボ"><div class="journey-streaks"></div><div class="journey-checks"><span>ROBO READY</span><span>SOUL LINK</span><span>${home?'HOME':'GATE OPEN'}</span></div></section>`;
 overlay.querySelector('h2').textContent=label;document.body.appendChild(overlay);const previous=app.inert;window.MOBMON_LOADING?.suspend();app.inert=true;
 try{await preload(['robo/001.png','robo/002.png',...paths]);overlay.querySelector('p').textContent=kind==='arena'?'闘技場、開幕。':home?'集めたソウルと、HOMEへ。':'ロボ起動。ソウルゲート、開放！';overlay.classList.add('playing');await new Promise(r=>setTimeout(r,reduced?180:1100));await change();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));overlay.querySelector('p').textContent=home?'帰還完了。おかえりなさい！':'転送完了。冒険を始めよう！';overlay.classList.add('arriving');await new Promise(r=>setTimeout(r,reduced?180:850));}finally{overlay.remove();app.inert=previous;window.MOBMON_LOADING?.resume();}
}
window.MOBMON_PRESENT={preload,warm,transition,ready:path=>loaded.get(path)};
})();
