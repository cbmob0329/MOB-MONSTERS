/* Shared town presentation. Save data and transactions remain in game.js. */
(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
 castle:'M4 19V8l4 2V4l4 3 4-3v6l4-2v11H4Zm6 0v-5h4v5',
 shop:'M3 9l2-5h14l2 5M4 9v11h16V9M3 9c0 4 5 4 5 0 0 4 8 4 8 0 0 4 5 4 5 0M9 20v-6h6v6',
 soul:'M12 3c6 5 8 8 6 12-1 4-4 6-6 6s-5-2-6-6c-2-4 0-7 6-12Zm0 7c-4 4-3 7 0 8 3-1 4-4 0-8',
 fusion:'m7 3 4 6-4 6-4-6 4-6Zm10 6 4 6-4 6-4-6 4-6M15 3v4m-2-2h4M7 18v4m-2-2h4',
 moblab:'M6 9a6 6 0 0 1 12 0v7H6V9Zm-2 7h16v5H4v-5M9 10h6m-6 3h1m4 0h1M3 8v5m18-5v5M12 3V1',
 party:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6 9v-3a6 6 0 0 1 12 0v3H3Zm14-15a3 3 0 0 1 0 6m2 2a5 5 0 0 1 2 7h-3',
 gacha:'M6 3h12l2 4-2 14H6L4 7l2-4Zm-2 4h16m-8 3 1.6 3.2 3.4.5-2.5 2.4.6 3.4-3.1-1.6-3.1 1.6.6-3.4L7 13.7l3.4-.5L12 10',
 arena:'M8 3H4v5a5 5 0 0 0 5 5m7-10h4v5a5 5 0 0 1-5 5M8 3h8v6a4 4 0 0 1-8 0V3Zm4 10v6m-5 2h10',
 story:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16',
 home:'m3 11 9-8 9 8M5 10v11h14V10m-9 11v-7h4v7',
 settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2-5h4l1 3 3 1 3-1 1 4-2 2 1 3-2 3-3-1-2 3h-4l-1-3-3-1-3 1-1-4 2-2-1-3 2-3 3 1 2-3',
 chest:'M3 10V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v13H3V10Zm0 0h18m-11 0v4h4v-4M7 4v6m10-6v6',
};
function icon(id){return '<svg class="town-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[id]||paths.story)+'"/></svg>';}
const art=(src,cls='')=>'<img class="'+cls+'" src="'+esc(src)+'" alt="" decoding="async" '+(cls==='town-thumb'?'loading="lazy" fetchpriority="low"':'')+' draggable="false">';
function scene(path,label){return '<img class="town-scene-art" src="'+esc(path)+'" alt="'+esc(label)+'" decoding="async"><div class="town-scene-light" aria-hidden="true"></div>';}
function townHome(root){
 const ui=window.MOBMON_UI_ASSETS;
 root.classList.add('town-home');
 const company=root.querySelector('.journey-companions');
 if(company){
  const members=[...company.querySelectorAll('[data-home-mon]')];
  const empty=[...company.querySelectorAll('[data-go="party"]')];
  if(members.length)empty.forEach(e=>e.remove());else empty.slice(1).forEach(e=>e.remove());
  if(!company.children.length)company.innerHTML='<button data-go="party"><span class="journey-empty">＋</span><b>仲間を編成しよう</b><small>ここから冒険の準備</small></button>';
  company.style.gridTemplateColumns='repeat('+Math.max(1,company.children.length)+',minmax(0,1fr))';
 }

 const back=root.querySelector('.journey-home-back');
 if(back)back.innerHTML=art(ui.home,'town-home-art');
 root.querySelectorAll('.journey-link').forEach(b=>{const i=b.querySelector('i');if(i)i.innerHTML=icon(b.dataset.go)});
 const adventure=root.querySelector('.journey-adventure>i');if(adventure)adventure.innerHTML=icon('story');
 const mail=root.querySelector('.journey-mail');if(mail){mail.dataset.go='castle';mail.setAttribute('aria-label','リリスのお城へ');mail.innerHTML=icon('castle');}
 const town=root.querySelector('.journey-town');
 if(town)town.innerHTML='<div class="town-section-heading"><span>街の施設</span><small>ひと休みして、次の冒険へ</small></div><div class="town-facility-grid">'+[
 ['castle','リリスのお城','物語のヒント',ui.castle],
 ['shop','MOB SHOP','旅の道具をそろえる',ui.shop],
 ['soul','ソウルラボ','魂から、新しい仲間へ',ui.lab],
 ['gacha','シールガチャ','一枚ずつ、コレクション',ui.gacha||ui.shop]
 ].map(([id,title,sub,src])=>'<button class="town-facility '+id+'" data-go="'+id+'">'+art(src,'town-thumb')+'<span class="town-facility-copy">'+icon(id)+'<b>'+title+'</b><small>'+sub+'</small></span><em aria-hidden="true">›</em></button>').join('')+'</div><button class="town-arena" data-go="arena">'+icon('arena')+'<span><b>闘技場</b><small>育てた仲間の力を試そう</small></span><em>›</em></button>';
}
function facility(root,kind,state){
 const ui=window.MOBMON_UI_ASSETS;root.classList.add('town-facility-screen','town-'+kind);
 const host=root.querySelector(kind==='shop'?'.merchant-room':'.lilith-scene');
 if(host){host.insertAdjacentHTML('afterbegin',scene(ui[kind==='soul'?'lab':kind],kind==='castle'?'灯りのともるリリスの玉座':kind==='shop'?'旅の道具が並ぶMOB SHOP':'魂の光に包まれたソウルラボ'));host.style.removeProperty('--scene');}
 if(kind==='castle'){
  const claimed=state.quests?.firstClaimed,elite=state.quests?.eliteGrass;
  const task=!claimed?(state.owned.length>=4?'リリスに仲間集めを報告しよう':'ソウルから仲間を増やそう'):elite?'AREA 4のボスを目指そう':'草原の中ボスに挑もう';
  root.querySelector('.lab-exchange-menu').insertAdjacentHTML('beforebegin','<aside class="town-quest-note"><span>'+icon('story')+'</span><div><small>NEXT STORY</small><b>'+task+'</b><p>「お話する」でリリスが案内してくれます。</p></div></aside>');
  root.querySelector('#lilithTalk').innerHTML=icon('castle')+'<span>お話する<small>物語・報告</small></span>';
  root.querySelector('#lilithHelp').innerHTML=icon('story')+'<span>助けてもらう<small>冒険の手引き</small></span>';
 }
 if(kind==='soul'){
  const labels={labViewSouls:['soul','ソウルを確認','集めた魂を並べる'],labFusion:['fusion','ソウルフュージョン','ふたつの魂をつなぐ'],labMonsterSoul:['party','ソウルへ戻す','モンスターを選ぶ'],labSoulRuby:['gacha','ルビーへ交換','ソウルを選ぶ']};
  for(const [id,[glyph,title,sub]]of Object.entries(labels)){const b=root.querySelector('#'+id);if(b)b.innerHTML=icon(glyph)+'<span>'+title+'<small>'+sub+'</small></span>';}
 }
}
function shopCatalog(root,selected,onSelect){
 root.classList.add('town-shop-catalog');
 const intro=root.querySelector('.shop-intro');
 if(intro){intro.querySelector('span').innerHTML=icon('shop');intro.querySelector('h2').textContent='旅じたくを、ここで。';}
 const nav=document.createElement('div');nav.className='town-shop-tabs';nav.setAttribute('aria-label','商品の種類');
 nav.innerHTML=[['items','道具'],['parts','パーツ'],['motors','モーター'],['body','機体']].map(([id,label])=>'<button data-shop-tab="'+id+'" aria-pressed="'+(id===selected)+'">'+label+'</button>').join('');
 intro.after(nav);nav.querySelectorAll('button').forEach(b=>b.onclick=()=>onSelect(b.dataset.shopTab));
 const goods=selected==='items';
 root.querySelector('.shop-list').hidden=!goods;root.querySelector('#useItems').hidden=!goods;
 root.querySelector('.lab-shop-heading').textContent=goods?'':selected==='parts'?'4つのパーツで、自分だけの性能へ':selected==='motors'?'2つのモーターで、冒険を後押し':'相棒のスタイルを選ぼう';
 root.querySelector('.lab-shop-heading').hidden=goods;
 root.querySelector('.lab-store').hidden=goods;
 root.querySelectorAll('[data-lab-buy]').forEach(b=>b.hidden=window.MOBMON_LAB.byId(b.dataset.labBuy).kind!==selected);
 root.querySelectorAll('.shop-item>span').forEach((el,i)=>{el.classList.add('town-item-bottle');el.style.setProperty('--bottle-hue',i*42+'deg');el.innerHTML='<i></i>';});
}
function gacha(root){
 root.classList.add('town-gacha');const stage=root.querySelector('.gacha-stage');
 stage.querySelector('.gacha-gem').outerHTML='<div class="town-sticker-machine" aria-hidden="true">'+art(window.MOBMON_UI_ASSETS.gacha)+'<span class="town-sticker-ticket">'+icon('gacha')+'</span></div>';
 stage.querySelector('h2').textContent='どんな一枚に、出会える？';
 const grid=root.querySelector('.five-grid');if(grid&&!grid.children.length)grid.innerHTML='<p class="town-empty-album">'+icon('gacha')+'<b>最初の一枚を、ここに。</b><span>引いたシールはここに並びます。</span></p>';
}
async function reveal(root){
 const stage=root.querySelector('.gacha-stage');if(!stage)return;
 stage.classList.add('is-drawing');const button=stage.querySelector('button');if(button){button.disabled=true;button.textContent='シールを準備中…';}
 await new Promise(r=>setTimeout(r,matchMedia('(prefers-reduced-motion: reduce)').matches?120:900));
}
function chrome(){
 document.querySelectorAll('.bottom-nav button').forEach(b=>{const i=b.querySelector('i');if(i){i.className='town-nav-icon';i.innerHTML=icon(b.dataset.go);}});
 const system=document.querySelector('#systemBtn');if(system){system.innerHTML=icon('settings');system.setAttribute('aria-label','設定を開く');}
}

/* Passive navigation display; no collision, spawn, or save mutations. */
function terrain(root,f){
 const region=['草原','砂漠','田舎町','ネオン街','海底','部族村','マグマ','魔王城','読みかけの本'].indexOf(f.area);
 root.dataset.region=String(Math.max(0,region));root.classList.toggle('field-inside',!!f.inside);
 const world=root.querySelector('#fieldWorld'),idx=f.inside?7:Math.max(0,region);
 world.insertAdjacentHTML('afterbegin','<div class="field-terrain" aria-hidden="true"><img src="'+esc(window.MOBMON_UI_ASSETS.terrain)+'" style="left:'+(-idx%3*100)+'%;top:'+(-Math.floor(idx/3)*100)+'%" alt="" draggable="false"></div>');
 const overlay=document.createElement('div');overlay.className='field-atmosphere';overlay.setAttribute('aria-hidden','true');root.querySelector('.field-map').append(overlay);
}
function mapPaint(canvas,f,large=false){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const size=canvas.width,pad=large?22:7,scale=(size-pad*2)/f.size;
 const xy=p=>[pad+p.x*scale,pad+p.y*scale];
 ctx.clearRect(0,0,size,size);ctx.fillStyle='#132e39';ctx.fillRect(0,0,size,size);
 ctx.strokeStyle='#668b8260';ctx.lineWidth=1;
 for(let n=0;n<=f.size;n+=50){ctx.beginPath();ctx.moveTo(pad+n*scale,pad);ctx.lineTo(pad+n*scale,size-pad);ctx.stroke();ctx.beginPath();ctx.moveTo(pad,pad+n*scale);ctx.lineTo(size-pad,pad+n*scale);ctx.stroke();}
 ctx.fillStyle='#75908065';
 for(const w of f.walls||[]){ctx.fillRect(pad+(w.x-w.size/2)*scale,pad+(w.y-w.size/2)*scale,w.size*scale,w.size*scale);}
 for(const o of f.obstacles){ctx.beginPath();const [x,y]=xy(o);ctx.arc(x,y,o.r*scale,0,Math.PI*2);ctx.fillStyle=o.type===3?'#497e9670':'#58786d80';ctx.fill();}
 for(const e of f.entities){
  const [x,y]=xy(e),r=large?5:2.8;
  ctx.fillStyle=e.kind==='chest'?(e.opened?'#7b8c8c':'#f3cd75'):e.kind==='portal'?'#c6b2ff':e.kind.startsWith('cave')?'#8ae4d8':e.kind==='merchant'?'#eac0a2':'#e08782';
  if(e.kind==='chest')ctx.fillRect(x-r,y-r,r*2,r*2);
  else if(e.kind==='portal'||e.kind.startsWith('cave')){ctx.beginPath();ctx.moveTo(x,y-r*1.5);ctx.lineTo(x+r*1.4,y);ctx.lineTo(x,y+r*1.5);ctx.lineTo(x-r*1.4,y);ctx.closePath();ctx.fill();}
  else {ctx.beginPath();ctx.arc(x,y,e.kind==='boss'?r*1.6:r,0,Math.PI*2);ctx.fill();}
 }
 if(f.camera){ctx.strokeStyle='#9acec9a0';ctx.lineWidth=large?2:1;ctx.strokeRect(pad+f.camera.x*scale,pad+f.camera.y*scale,Math.min(100,f.size)*scale,Math.min(100,f.size)*scale);}
 const [x,y]=xy(f.player);ctx.fillStyle='#f5fff4';ctx.strokeStyle='#172f38';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,large?7:4,0,Math.PI*2);ctx.fill();ctx.stroke();
 if(large){ctx.fillStyle='#d1e4d4';ctx.font='bold 15px sans-serif';ctx.fillText('N ↑',size-47,18);}
}
function field(root,f,api){
 terrain(root,f);
 const guide=root.querySelector('.joystick-guide');guide.outerHTML='<button id="fieldMapToggle" class="field-mini-button" aria-label="エリア地図を開く"><canvas width="160" height="160" aria-hidden="true"></canvas><span>MAP ＋</span></button>';
 root.querySelector('.field-slot').insertAdjacentHTML('beforebegin','<div class="field-status-strip"><span class="field-goal"></span><span class="field-treasure-count"></span></div>');
 const mini=root.querySelector('#fieldMapToggle'),canvas=mini.querySelector('canvas'),goal=root.querySelector('.field-goal'),treasures=root.querySelector('.field-treasure-count');
 goal.textContent=f.inside?'洞窟を探索しよう':f.floor===4?(f.entities.some(e=>e.kind==='boss')?'エリアのボスに挑もう':'ゲートからHOMEへ帰還'):'北のゲートで、次のAREAへ';
 mini.onclick=()=>{
  api.modal(f.area+(f.inside?' · 洞窟':' · AREA '+f.floor),'<div class="field-chart"><canvas width="600" height="600" role="img" aria-label="地形・現在地・宝箱・洞窟・ゲートの地図"></canvas><div class="field-chart-legend"><span class="you">● 現在地</span><span class="loot">■ 宝箱</span><span class="cave">◆ 洞窟</span><span class="gate">◆ ゲート</span><span class="enemy">● モンスター</span><span class="merchant">● 商人</span></div><p>白い枠は、いま画面に映っている範囲です。<br>宝箱の位置は開封後も残ります。</p><button class="primary full" id="fieldChartClose">探索に戻る</button></div>');
  mapPaint(document.querySelector('.field-chart canvas'),f,true);document.querySelector('#fieldChartClose').onclick=api.close;
 };
 let last=-Infinity,lastCount='';
 return {update(now=performance.now()){
  if(now-last<160)return;last=now;mapPaint(canvas,f);
  const chests=f.entities.filter(e=>e.kind==='chest'),count=chests.filter(e=>e.opened).length+'/'+chests.length;
  if(lastCount!==count){lastCount=count;treasures.innerHTML=icon('chest')+'<b>'+count+'</b>';treasures.setAttribute('aria-label','宝箱回収 '+count);}
 }};
}


function propIndex(f,o){
 if(f.inside)return null;
 if(o.type===3)return f.area==='海底'?7:f.area==='マグマ'?8:null;
 if(o.type!==4)return null;
 return ({'砂漠':0,'ネオン街':1,'海底':2,'部族村':3,'マグマ':4,'魔王城':5,'読みかけの本':6})[f.area]??null;
}
function obstaclePath(f,o){return propIndex(f,o)===null?'stage/00'+o.type+'.png':window.MOBMON_UI_ASSETS.fieldProps;}
function obstacle(f,o){
 const idx=propIndex(f,o);if(idx===null)return '';
 return '<span class="field-prop-crop" aria-hidden="true"><img src="'+esc(window.MOBMON_UI_ASSETS.fieldProps)+'" alt="" draggable="false" style="left:'+(-(idx%3)*100)+'%;top:'+(-Math.floor(idx/3)*100)+'%"></span>';
}

window.MOBMON_TOWN={obstacle,obstaclePath,field,icon,home:townHome,facility,shopCatalog,gacha,reveal,chrome};
})();

