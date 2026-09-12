(()=>{
'use strict';
const RAW_BASES=[
  'https://raw.githubusercontent.com/cbmob0329/MOB-QUEST/main/',
  'https://cbmob0329.github.io/MOB-QUEST/',
  'https://raw.githubusercontent.com/cbmob0329/MOB-QUEST/master/'
];
const FORBIDDEN=/^(?:fig(?:ene|boss)?|eventfig|wepon|weapon|bogu)\//i;
// Remember the successful host for each path during this visit.
const resolved=new Map();
function clean(path){return String(path||'').replace(/^\.\//,'').replace(/^\//,'');}
function allowed(path){path=clean(path);return !!path&&!FORBIDDEN.test(path);}
function candidates(path){
  path=clean(path);if(!allowed(path))return [];
  if(path.startsWith('battle/'))return [...new Set([path,...(path==='battle/sabaku1.png'?['battle/sabaku.png']:[]),...RAW_BASES.map(b=>b+path)])];
  return [path,...RAW_BASES.map(b=>b+path)];
}
function first(path){return resolved.get(clean(path))||candidates(path)[0]||'';}
function loaded(img){const path=img?.dataset?.mobAsset;if(path)resolved.set(path,img.getAttribute('src'));img?.classList.remove('asset-waiting','failed');}
function fail(img){
  const path=img?.dataset?.mobAsset||'';
  const list=candidates(path);
  let i=Number(img?.dataset?.mobAssetTry||0)+1;
  if(!img||i>=list.length){if(img){img.classList.add('failed');img.removeAttribute('onerror');}return;}
  img.dataset.mobAssetTry=String(i);img.src=list[i];
}
function markup(path,alt='',cls=''){
  path=clean(path);if(!allowed(path))return '';
  const src=first(path),attempt=Math.max(0,candidates(path).indexOf(src));
  return `<img class="${String(cls||'').replace(/"/g,'&quot;')}" src="${src}" decoding="async" data-mob-asset="${path}" data-mob-asset-try="${attempt}" onload="MOBMON_ASSETS.loaded(this)" onerror="MOBMON_ASSETS.fail(this)" alt="${String(alt||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}">`;
}
window.MOBMON_ASSETS={RAW_BASES,allowed,candidates,first,fail,loaded,markup};
})();
