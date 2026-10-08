/* Presentation only. Game progression, soul transactions and party rules stay in game.js. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const art=(src,cls='')=>`<img class="${cls}" src="${esc(src)}" alt="" decoding="async" loading="lazy" draggable="false">`;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('journey-paused',document.hidden));
window.MOBMON_JOURNEY=function(api){
 const {state,ui,heading,monster,stage,detail,save,toast}=api;
 const nav=(screen,label,icon,sub='')=>`<button data-go="${screen}" class="journey-link"><i aria-hidden="true">${icon}</i><span><b>${label}</b>${sub?`<small>${sub}</small>`:''}</span><em aria-hidden="true">›</em></button>`;
 function home(root){
  const s=state(),cur=s.story.current,party=s.party.slice(0,4).map(id=>s.owned.find(m=>m.uid===id));
  root.className='screen journey-home';
  root.innerHTML=`<header class="journey-greeting"><div><small>OUR MONSTERS, OUR STORY</small><h1>おかえり、冒険者。</h1></div><button data-go="castle" aria-label="リリスの案内" class="journey-mail">✉</button></header><section class="journey-hero" aria-label="冒険を待つ仲間"><div class="journey-home-back"></div><div class="journey-dust" aria-hidden="true"></div><div class="journey-hero-caption"><span>YOUR COMPANY</span><b>今日も、仲間と。</b></div><div class="journey-companions">${party.map((m,i)=>`<button ${m?`data-home-mon="${m.uid}"`:'data-go="party"'} style="--idle-delay:${i*-1.3}s" aria-label="${esc(m?.name||'仲間を編成')}">${m?stage(monster(m.name)):'<span class="journey-empty">＋</span>'}<b>${esc(m?.nickname||m?.name||'仲間を編成')}</b><small>${m?'Lv '+m.level:'空き枠'}</small></button>`).join('')}</div><div class="journey-hero-footer"><span>編成 ${s.party.filter(Boolean).length}/8</span><span>仲間 ${s.owned.length}体</span></div></section><button class="journey-adventure" data-go="story"><i aria-hidden="true">⚑</i><span><small>${s.story.resume?'旅の続きを、ここから':'次の物語へ'}</small><b>冒険に出かける</b><em>${esc(cur.area)} · AREA ${cur.areaNo}</em></span><strong aria-hidden="true">→</strong></button><div class="journey-shortcuts">${nav('fusion','融合','✦','新しい仲間へ')}${nav('room','自分の部屋','⌂','ひと息つこう')}${nav('party','編成','♟','仲間を整える')}</div><div class="journey-town"><span>街の施設</span><div>${nav('soul','ソウルラボ','◈')}${nav('shop','ショップ','▣')}${nav('gacha','シール','◇')}${nav('arena','闘技場','♜')}</div></div>`;
  $$('[data-home-mon]',root).forEach(b=>b.onclick=()=>detail(b.dataset.homeMon));
 }
 function room(root){
  const s=state(),prefs=s.roomDecor||{},valid=['day','dusk'].includes(prefs.light)?prefs.light:'day';
  const owned=Object.entries(s.stickers||{}).filter(([name,n])=>n>0&&monster(name));
  const pinned=owned.some(([name])=>name===prefs.sticker)?prefs.sticker:null;
  root.className='screen journey-room';root.innerHTML=heading('自分の部屋','A LITTLE PLACE OF YOUR OWN')+`<section class="journey-room-scene ${valid}" aria-label="窓辺のベンチと本棚のある自室">${art('assets/scenes/room-v041.png','journey-room-back')}<div class="journey-room-light" aria-hidden="true"></div><div class="journey-dust" aria-hidden="true"></div>${pinned?`<div class="journey-keepsake">${stage(monster(pinned))}<small>マイシール</small></div>`:''}<p class="journey-room-note">${pinned?esc(pinned)+'のシールを飾っています':'窓から、次の冒険に思いをはせて。'}</p></section><section class="journey-room-controls"><h2>部屋を整える</h2><p>お気に入りの光と、手に入れた一枚。</p><div class="journey-light-choice" role="group" aria-label="部屋の光"><button data-room-light="day" aria-pressed="${valid==='day'}">☀ 昼の光</button><button data-room-light="dusk" aria-pressed="${valid==='dusk'}">☾ 夕暮れ</button></div><label for="roomSticker">飾るシール</label><select id="roomSticker"><option value="">飾らない</option>${owned.map(([name])=>`<option value="${esc(name)}" ${pinned===name?'selected':''}>${esc(name)}</option>`).join('')}</select>${owned.length?'':'<p class="journey-empty-note">まだシールを持っていません。獲得するとここで選べます。</p>'}</section>`;
  const update=next=>{const old=s.roomDecor;s.roomDecor={...prefs,...next};try{save();room(root)}catch{s.roomDecor=old;toast('保存できませんでした。部屋の設定は変更していません。')}};
  $$('[data-room-light]',root).forEach(b=>b.onclick=()=>update({light:b.dataset.roomLight}));$('#roomSticker',root).onchange=e=>update({sticker:e.target.value});
 }
 function fusion(root){
  api.fusion(root);root.classList.add('journey-fusion');
  const scene=$('.fusion-sanctum',root);scene.insertAdjacentHTML('afterbegin',`<div class="journey-fusion-device" aria-hidden="true">${art('assets/scenes/fusion-device-v041.png')}</div><div class="journey-dust" aria-hidden="true"></div>`);
  $('.fusion-intro',root).innerHTML='<small>SOUL FUSION</small><h2>ふたつの魂、新しい物語。</h2><p>まずは素材になるソウルを選ぼう。</p>';
  $('.fusion-footnote',root).textContent='素材は各1個消費。新しい仲間はLv 1で誕生します。';
  $('#scanFusion',root).textContent='誕生する仲間を確認';
  root.insertAdjacentHTML('beforeend','<p class="journey-fusion-help">候補・継承する力を確認したあとに消費を確定します。</p>');
 }
 function party(root){
  api.party(root);root.classList.add('journey-party');
  $('.page-heading small',root).textContent='YOUR COMPANY / MAIN 4 + SUB 4';
  const roster=$('.roster-section',root);roster.insertAdjacentHTML('afterbegin',`<div class="journey-filter"><label>仲間を探す<input id="journeySearch" type="search" placeholder="名前で検索" autocomplete="off" value="${esc(ui.journeySearch||'')}"></label><label>属性<select id="journeyAttribute"><option value="">すべて</option>${[...new Set(state().owned.map(m=>monster(m.name)?.attribute).filter(Boolean))].map(a=>`<option ${ui.journeyAttribute===a?'selected':''}>${esc(a)}</option>`).join('')}</select></label></div>`);
  const input=$('#journeySearch',root);input.oninput=e=>{if(e.isComposing)return;ui.journeySearch=input.value;filterRoster(root)};input.addEventListener('compositionend',()=>{ui.journeySearch=input.value;filterRoster(root)});
  $('#journeyAttribute',root).onchange=e=>{ui.journeyAttribute=e.target.value;filterRoster(root)};
  const formation=$('#formationV6',root),dock=document.createElement('div');dock.className='journey-formation-dock';formation.before(dock);dock.append(formation,$('#partyHint',root),$('#partyCancel',root).parentElement);
  filterRoster(root);
 }
 function filterRoster(root=document){
  const host=$('#rosterV6',root);if(!host)return;let count=0;
  $$('[data-owned]',host).forEach(b=>{const inst=state().owned.find(m=>m.uid===b.dataset.owned),m=monster(inst?.name);b.hidden=!(inst&&(!ui.journeySearch||[inst.name,inst.nickname||''].some(x=>x.toLocaleLowerCase().includes(ui.journeySearch.toLocaleLowerCase())))&&(!ui.journeyAttribute||m?.attribute===ui.journeyAttribute));if(!b.hidden)count++});
  let empty=$('.journey-filter-empty',host);if(!empty){empty=document.createElement('p');empty.className='journey-filter-empty';empty.textContent='条件に合う仲間がいません。';host.append(empty)}empty.hidden=count>0;
 }
 async function birthBeat(a,b){
  const body=$('#modalBody');body.innerHTML=`<div class="journey-birth" role="status"><small>SOUL FUSION</small><h2>ふたつの魂が、ひとつに。</h2><div class="journey-birth-stage"><div class="journey-birth-parent left">${stage(monster(a.name))}</div><div class="journey-birth-parent right">${stage(monster(b.name))}</div>${art('assets/scenes/fusion-device-v041.png','journey-birth-device')}<div class="journey-birth-glow"></div></div><p>新しい仲間を迎えています</p><button id="journeySkip" class="ghost-btn full">演出をスキップ</button></div>`;
  await new Promise(resolve=>{let ended=false,elapsed=0,last=performance.now(),frame=0;const finish=()=>{if(ended)return;ended=true;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);resolve()};const visibility=()=>{last=performance.now()};document.addEventListener('visibilitychange',visibility);$('#journeySkip').onclick=finish;const tick=now=>{if(!document.hidden)elapsed+=Math.min(now-last,80);last=now;if(elapsed>=(reduced()?150:2400))return finish();frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick)});
 }
 return {home,room,fusion,party,filterRoster,birthBeat};
};
window.MOBMON_JOURNEY_MAP=function(root,api){
 const {entries}=window.MOBMON_CAMPAIGN,{unlocked,cleared,depart,heading,state}=api;
 const seasons=[...new Set(entries.map(e=>e.season))],width=660,height=seasons.length*215+180;
 const scenery=seasons.map((s,i)=>[35,580].map((x,j)=>`<img class="journey-map-scenery" src="stage/004.png" alt="" draggable="false" style="left:${x}px;top:${height-185-i*215+j*85}px">`).join('')).join('');
 const points=entries.map(e=>{const group=entries.filter(x=>x.season===e.season),i=group.indexOf(e);return {...e,x:width*(i+1)/(group.length+1),y:height-125-seasons.indexOf(e.season)*215}});
 const edges=[];for(let i=1;i<seasons.length;i++)for(const a of points.filter(e=>e.season===seasons[i-1]))for(const b of points.filter(e=>e.season===seasons[i]))edges.push(`<path d="M${a.x},${a.y} C${a.x},${a.y-100} ${b.x},${b.y+100} ${b.x},${b.y}" class="${cleared(a.area,a.deep)?'traveled':''}"/>`);
 const last=state().story.current;const current=points.find(e=>e.area===last.area&&e.season===last.season&&unlocked(e.area,e.deep))||points.find(e=>unlocked(e.area,e.deep)&&!cleared(e.area,e.deep))||points[0];
 root.className='screen journey-map-screen';root.innerHTML=heading('冒険の地図','EVERY ROAD HAS A STORY')+`<p class="journey-map-instruction">地図を動かして行き先を選択。<br>シーズン内の全地域をクリアすると次へ進めます。</p><section class="journey-map-window" aria-label="冒険の地図：ドラッグ・ピンチで移動と拡大"><div class="journey-map-world" style="width:${width}px;height:${height}px"><svg class="journey-map-roads" viewBox="0 0 ${width} ${height}" aria-hidden="true">${edges.join('')}</svg>${scenery}${seasons.map((s,i)=>`<span class="journey-map-season" style="top:${height-210-i*215}px">SEASON ${s}</span>`).join('')}${points.map((e,i)=>`<button class="journey-map-node ${unlocked(e.area,e.deep)?'':'locked'} ${cleared(e.area,e.deep)?'cleared':''} ${e===current?'current':''}" data-map-entry="${i}" style="left:${e.x}px;top:${e.y}px" aria-label="${esc(e.area)}${e.deep?'深層':''}${unlocked(e.area,e.deep)?'':' 未開放'}" aria-disabled="${!unlocked(e.area,e.deep)}">${art(window.MOBMON_ASSET_MAP.battleAsset(e.area))}<b>${esc(e.area)}${e.deep?'<em>深層</em>':''}</b><small>${cleared(e.area,e.deep)?'✓ CLEAR':unlocked(e.area,e.deep)?'入口を選ぶ':'未開放'}</small></button>`).join('')}<span class="journey-map-start">⌂ 旅のはじまり</span></div><div class="journey-map-tools"><button id="mapZoomOut" aria-label="地図を縮小">−</button><button id="mapZoomIn" aria-label="地図を拡大">＋</button><button id="mapCurrent">◎ 現在地</button></div><span class="journey-compass" aria-hidden="true">N<br>✥</span></section><div class="journey-destination-detail" id="journeyDestination" aria-live="polite"></div>`;
 const win=$('.journey-map-window',root),world=$('.journey-map-world',root),pointers=new Map();let z=.78,x=0,y=0,moved=false,clickBlocked=false,start=null;
 const paint=()=>{x=Math.min(50,Math.max(win.clientWidth-width*z-50,x));y=Math.min(50,Math.max(win.clientHeight-height*z-50,y));world.style.transform=`translate(${x}px,${y}px) scale(${z})`};
 const center=()=>{x=win.clientWidth/2-current.x*z;y=win.clientHeight*.64-current.y*z;paint()};
 const zoom=(next,cx=win.clientWidth/2,cy=win.clientHeight/2)=>{next=Math.max(.6,Math.min(1.3,next));const ratio=next/z;x=cx-(cx-x)*ratio;y=cy-(cy-y)*ratio;z=next;paint()};
 $('#mapZoomOut',root).onclick=()=>zoom(z-.15);$('#mapZoomIn',root).onclick=()=>zoom(z+.15);$('#mapCurrent',root).onclick=center;
 const distance=()=>{const a=[...pointers.values()];return a.length===2?Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y):0};let lastDistance=0;
 win.onpointerdown=e=>{if(e.target.closest('.journey-map-tools'))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});start={x:e.clientX,y:e.clientY};if(pointers.size===1){moved=false;clickBlocked=false}if(pointers.size===2){lastDistance=distance();moved=true;clickBlocked=true}};
 win.onpointermove=e=>{const old=pointers.get(e.pointerId);if(!old)return;const dx=e.clientX-old.x,dy=e.clientY-old.y;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>7||pointers.size>1){moved=true;clickBlocked=true;win.setPointerCapture(e.pointerId)}if(!moved)return;if(pointers.size===2){const d=distance(),a=[...pointers.values()],r=win.getBoundingClientRect();if(lastDistance)zoom(z*d/lastDistance,(a[0].x+a[1].x)/2-r.left,(a[0].y+a[1].y)/2-r.top);lastDistance=d}else{x+=dx;y+=dy;paint()}};
 const end=e=>{pointers.delete(e.pointerId);lastDistance=0;if(e.type==='pointercancel')clickBlocked=true};win.onpointerup=end;win.onpointercancel=end;win.onlostpointercapture=end;
 win.addEventListener('click',e=>{if(clickBlocked&&!e.target.closest('.journey-map-tools')){e.preventDefault();e.stopPropagation();clickBlocked=false}},true);
 $$('[data-map-entry]',root).forEach(b=>b.onclick=()=>select(points[Number(b.dataset.mapEntry)]));
 function select(e){const available=unlocked(e.area,e.deep);$('#journeyDestination',root).innerHTML=`<div><small>SEASON ${e.season} ${cleared(e.area,e.deep)?'· CLEAR':''}</small><h2>${esc(e.area)}${e.deep?'深層':''}</h2><p>${available?'この入口から冒険に出発します。':'前のシーズンの全地域をクリアすると開放されます。'}</p></div><button id="journeyDepart" class="primary" ${available?'':'disabled'}>出発する →</button>`;$('#journeyDepart',root).onclick=()=>depart(e.area,e.deep);$$('[data-map-entry]',root).forEach(b=>b.classList.toggle('selected',points[Number(b.dataset.mapEntry)]===e))}
 center();select(current);
};
})();
