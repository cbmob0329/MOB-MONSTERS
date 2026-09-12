/* World units: 100 x 100 visible, 300 x 300 exploration, 150 x 150 cave, 100 x 100 boss arena. */
(()=>{
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const choose=a=>a[Math.floor(Math.random()*a.length)];
const image=(src,alt='')=>`<img src="${src}" alt="${alt}" draggable="false">`;
// Region landmarks are fixed; edit name/entrance/exclusive here to customize a location.
const REGION_SITES={
 '草原':{name:'洞窟',entrance:{x:100,y:260},exclusive:'モブイノリ'},
 '砂漠':{name:'洞窟',entrance:{x:200,y:260},exclusive:'モブギミック'},
 '田舎町':{name:'洞窟',entrance:{x:100,y:160},exclusive:'モブプルフ'},
 'ネオン街':{name:'洞窟',entrance:{x:200,y:160},exclusive:'モブネオントカゲ'},
 '海底':{name:'洞窟',entrance:{x:100,y:60},exclusive:'モブミスト'},
 '部族村':{name:'洞窟',entrance:{x:200,y:60},exclusive:'モブジュコン'},
 'マグマ':{name:'洞窟',entrance:{x:100,y:260},exclusive:'モブマグトカゲ'},
 '魔王城':{name:'洞窟',entrance:{x:200,y:260},exclusive:'モブミニブック'},
 '読みかけの本':{name:'洞窟',entrance:{x:100,y:160},exclusive:'モブ怪人幹部青'}
};
const ROBO_SPEED=30; // ~30% faster, still independent of frame rate and diagonal direction.
window.MOBMON_EXPLORATION=function(api){
  const {data:D,esc,ask,save,toast}=api;const campaign=window.MOBMON_CAMPAIGN;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const areas=D.seasons.filter(s=>s.loop===1).flatMap(s=>s.areas);
  let selectedArea=0,view=null,mainField=null,caveField=null;
  const modal=document.querySelector('#modal');
  let field=null,frame=0,last=0,keys=new Set(),direction='002',busy=false,resizeObserver=null;
  let stick={x:0,y:0,pointer:null};
  const percent=n=>n/(field?.size||100)*100;
  function resetStick(){stick={x:0,y:0,pointer:null};const knob=document.querySelector('#joystickKnob');if(knob)knob.style.transform='translate(0,0)';}
  function progress(){const s=api.state();return s.exploration||(s.exploration={cleared:{}});}
  const key=(area,deep)=>`${area}|${deep?'deep':'normal'}`;
  function cleared(area,deep){return !!progress().cleared[key(area,deep)]||!!api.state().story.completedAreas[`S${D.seasons.find(s=>s.loop===(deep?2:1)&&s.areas.includes(area)).season}|${area}`];}
  function unlocked(area,deep=false){return campaign.unlocked(area,deep,cleared,api.state().settings.testMode);}
  function deepUnlocked(){return unlocked('草原',true);}
  function stop(){cancelAnimationFrame(frame);frame=0;keys.clear();resetStick();last=0;resizeObserver?.disconnect();resizeObserver=null;}
  function leave(){stop();field=null;mainField=null;caveField=null;busy=false;view=null;}
  function selector(root){
    stop();root.className='screen expedition-select';root.scrollTop=0;
    root.innerHTML=api.heading('冒険','CHOOSE YOUR DESTINATION')+`<p class="expedition-note">左右にスワイプして行き先を選択。<br>仲間と一緒に、新しいソウルを探しに行こう。</p><div class="destination-carousel" aria-label="冒険エリア">${areas.map((a,i)=>`<button data-destination="${i}" class="destination-card ${i===selectedArea?'selected':''} ${unlocked(a)||unlocked(a,true)?'':'locked'}" aria-label="${esc(a)}${unlocked(a)||unlocked(a,true)?'':' 未開放'}" aria-disabled="${!unlocked(a)&&!unlocked(a,true)}">${window.MOBMON_ASSETS.markup(window.MOBMON_ASSET_MAP.battleAsset(a),a)}<span><small>SEASON ${campaign.entry(a).season} / ${!unlocked(a)&&!unlocked(a,true)?'LOCKED':cleared(a,false)?'CLEAR':'EXPLORE'}</small><b>${esc(a)}</b></span>${unlocked(a)||unlocked(a,true)?'':'<em>未開放</em>'}</button>`).join('')}</div><div class="carousel-controls"><button id="areaPrevious" aria-label="前のエリア">‹</button><p id="areaCaption"></p><button id="areaNext" aria-label="次のエリア">›</button></div><p class="expedition-note">通常シーズンを進めると次の地域が開放されます。</p>`;
    const rail=root.querySelector('.destination-carousel'),cards=[...root.querySelectorAll('[data-destination]')];
    const update=()=>{if(root.querySelector('.destination-carousel')!==rail)return;const box=rail.getBoundingClientRect(),center=box.left+box.width/2;selectedArea=cards.reduce((best,c,i)=>Math.abs(c.getBoundingClientRect().left+c.offsetWidth/2-center)<Math.abs(cards[best].getBoundingClientRect().left+cards[best].offsetWidth/2-center)?i:best,0);cards.forEach((c,i)=>c.classList.toggle('selected',i===selectedArea));root.querySelector('#areaCaption').textContent=`${areas[selectedArea]} · ${selectedArea+1} / ${areas.length}`;root.querySelector('#areaPrevious').disabled=selectedArea===0;root.querySelector('#areaNext').disabled=selectedArea===cards.length-1;};
    const focus=(index,smooth=true)=>{const c=cards[clamp(index,0,cards.length-1)];rail.scrollTo({left:c.offsetLeft-rail.offsetLeft-(rail.clientWidth-c.offsetWidth)/2,behavior:smooth&&!reducedMotion.matches?'smooth':'auto'});};
    rail.addEventListener('scroll',update,{passive:true});root.querySelector('#areaPrevious').onclick=()=>focus(selectedArea-1);root.querySelector('#areaNext').onclick=()=>focus(selectedArea+1);requestAnimationFrame(()=>{focus(selectedArea,false);update();});
    cards.forEach((b,i)=>b.onclick=()=>{if(!unlocked(areas[i])&&!unlocked(areas[i],true))return toast('前のシーズンをクリアすると開放されます');selectedArea=i;focus(i);const a=areas[i];api.modal(a,`<p>探索する深さを選んでください。</p><div class="depth-options"><button id="normalDepth" class="primary" ${unlocked(a)?'':'disabled'}>${esc(a)}${cleared(a,false)?' ✓':''}</button><button id="deepDepth" class="primary" ${unlocked(a,true)?'':'disabled'}>${esc(a)}深層${cleared(a,true)?' ✓':''}</button></div><p class="panel-note">${unlocked(a,true)?'深層へ出発できます。':'深層は対応するシーズンの開放が必要です。'}</p>`);document.querySelector('#normalDepth').onclick=()=>depart(a,false);document.querySelector('#deepDepth').onclick=()=>depart(a,true);});
  }

  async function warp(label,fn,paths=[]){busy=true;stop();api.lock(true);try{await window.MOBMON_PRESENT.transition(label,paths,()=>{api.lock(false);fn();if(field)render(document.querySelector('#screen'));});}finally{api.lock(false);api.close();busy=false;}}
  async function depart(area,deep){
    if(!unlocked(area,deep))return toast('このシーズンはまだ開放されていません');
    if(!api.party().length)return toast('先にパーティーに仲間を編成してください');
    if(!await ask(`${area}${deep?'深層':''}へ出発しますか？`,'ロボに乗って探索します。'))return;
    const next=generate(area,deep,1);
    await warp('ロボに乗って出発！',()=>{mainField=null;caveField=null;field=next;const s=api.state();s.screen='story';s.story.current={season:campaign.entry(area,deep).season,area,floor:deep?2:1,areaNo:1};save();},fieldAssets(next));
  }
  function fieldAssets(f){return ['robo/001.png','robo/002.png','robo/003.png','robo/004.png',...f.obstacles.map(o=>'stage/00'+o.type+'.png'),...f.entities.map(e=>e.src).filter(Boolean),'takara/001.png','takara/002.png','takara/003.png','takara/004.png'];}
  function site(area){return REGION_SITES[area];}
  function pool(area,deep,inside=false){
    const regional=D.monsters.filter(m=>String(m.firstArea).startsWith(area)&&m.species!=='ボス');
    const normals=regional.filter(m=>m.sourceCategory==='normal');
    const source=normals.length?normals:regional.filter(m=>m.sourceCategory==='elite');
    const allowed=source.filter(m=>deep||D.rankOrder.indexOf(m.rank)<=5);
    const list=allowed.length?allowed:source;
    return inside?list:list.filter(m=>m.name!==site(area)?.exclusive);
  }
  function elitePool(area){return D.monsters.filter(m=>String(m.firstArea).startsWith(area)&&m.sourceCategory==='elite'&&m.name!==site(area)?.exclusive);}
  function hitsWall(w,p,r){return Math.abs(w.x-p.x)<w.size/2+r&&Math.abs(w.y-p.y)<w.size/2+r;}
  function valid(f,p,r=4){return p.x>=r&&p.x<=f.size-r&&p.y>=r&&p.y<=f.size-r&&!(f.walls||[]).some(w=>hitsWall(w,p,r))&&!f.obstacles.some(o=>Math.abs(o.x-p.x)<o.r+r&&Math.abs(o.y-p.y)<o.r+r&&(o.x-p.x)**2+(o.y-p.y)**2<(o.r+r)**2);}
  function fixedWalls(area){const n=Math.max(0,areas.indexOf(area)),offset=(n%3)*5;return [{x:43+offset,y:52,size:38},{x:248-offset,y:62,size:42},{x:48,y:162+offset,size:44},{x:247,y:157-offset,size:38},{x:47+offset,y:245,size:40},{x:247-offset,y:245,size:42}];}
  function position(f,r=5){for(let i=0;i<400;i++){const p={x:8+Math.random()*(f.size-16),y:12+Math.random()*(f.size-30)};if(valid(f,p,r)&&distance(p,f.player)>13&&f.entities.every(e=>distance(e,p)>r+5))return p;}for(let y=8;y<f.size-8;y+=8)for(let x=8;x<f.size-8;x+=8){const p={x,y};if(valid(f,p,r)&&distance(p,f.player)>13&&f.entities.every(e=>distance(e,p)>r+5))return p;}throw new Error("探索マップに配置できる空間がありません");}
  function monster(f,kind='enemy',p=null){let m=choose(pool(f.area,f.deep,f.inside));if(kind==='elite')m=f.area==='草原'?choose(D.monsters.filter(m=>['enemy/10.png','enemy/13.png'].includes(m.image))):choose(elitePool(f.area).length?elitePool(f.area):pool(f.area,f.deep));if(kind==='boss')m=D.monsters.find(m=>m.name===D.areaBoss[f.area]?.[f.deep?'2':'1']);return{...p||position(f),id:globalThis.crypto?.randomUUID?.()||('entity_'+Date.now().toString(36)+Math.random().toString(36).slice(2)),kind,level:campaign.level(f.area,f.deep,f.floor,kind,f.inside),name:m.name,src:m.image,angle:Math.random()*Math.PI*2,age:0};}
  function chest(f,p){return{...p||position(f),id:globalThis.crypto?.randomUUID?.()||('entity_'+Date.now().toString(36)+Math.random().toString(36).slice(2)),kind:'chest',rare:Math.random()<.1,opened:false,age:0};}
  function generate(area,deep,floor){
    const size=floor===4?100:300;
    const f={area,deep,floor,size,camera:{x:0,y:0},player:{x:size/2,y:size-8},walls:[],obstacles:[],entities:[],respawns:[],elapsed:0,portalPrompt:false};
    if(floor===4){if(!cleared(area,deep))f.entities.push(monster(f,'boss',{x:50,y:40}));else f.entities.push({id:'portal',kind:'portal',x:50,y:16,age:1});return f;}
    f.walls=fixedWalls(area);
    // Keep a connected central road and horizontal lanes; decorations never block these routes.
    for(let row=0;row<3;row++)for(let col=0;col<3;col++){
      // Every sector has a lake, a grove, and a rock cluster. Central lanes remain clear.
      const ox=col*100,oy=row*100;
      f.obstacles.push({x:ox+23,y:oy+29,r:13,type:3});
      for(const [x,y]of [[72,23],[83,31],[72,40]])f.obstacles.push({x:ox+x,y:oy+y,r:5,type:4});
      for(const [x,y,t]of [[20,70,2],[30,75,1],[16,81,1]])f.obstacles.push({x:ox+x,y:oy+y,r:4,type:t});
      f.obstacles.push({x:ox+77,y:oy+76,r:6,type:4});
    }
    // Clear the complete visual footprint, not just the obstacle collision circle.
    f.obstacles=f.obstacles.filter(o=>!f.walls.some(w=>hitsWall(w,o,o.r+7))&&distance(o,site(area).entrance)>o.r+14);
    f.entities.push({id:'portal',kind:'portal',x:150,y:8,age:1});
    if(floor<=3)f.entities.push({id:'cave-entry',kind:'cave',...site(area).entrance,name:site(area).name,age:1});
    if(floor===2)f.entities.push(monster(f,'elite',{x:f.entities[0].x,y:22}));
    // One nearby encounter invites movement; the others occupy separate parts of the world.
    const sectors=[7,0,2,3,5,6,8];
    for(let i=0;i<(floor===2?6:7);i++){const sector=sectors[i],e=monster(f);const p={x:(sector%3)*100+50+(Math.random()-.5)*10,y:Math.floor(sector/3)*100+48+(Math.random()-.5)*12};if(valid(f,p,5)&&f.entities.every(other=>distance(other,p)>10))Object.assign(e,p);f.entities.push(e);}
    const count=1+(Math.random()<.5?1:0)+(Math.random()<.3?1:0);
    for(let i=0;i<count;i++)f.entities.push(chest(f));return f;
  }
  function generateCave(area,deep,floor=1){
    const f={area,deep,floor,inside:true,size:150,camera:{x:0,y:0},player:{x:75,y:136},walls:[],obstacles:[],entities:[],respawns:[],elapsed:0,portalPrompt:false};
    for(const [x,y,r] of [[25,28,7],[42,38,5],[112,28,8],[125,50,5],[26,82,7],[45,107,5],[113,88,7],[125,119,5]])f.obstacles.push({x,y,r,type:1});
    f.entities.push({id:'cave-exit',kind:'cave-exit',x:75,y:144,name:'外へ戻る',age:1});
    f.entities.push(chest(f,{x:75,y:23}),chest(f,{x:105,y:60}));
    const unique=D.monsters.find(m=>m.name===site(area).exclusive),first=monster(f);Object.assign(first,{name:unique.name,src:unique.image});f.entities.push(first);
    for(let i=0;i<3;i++)f.entities.push(monster(f));return f;
  }
  function target(){if(!field)return null;return field.entities.filter(e=>!e.opened&&distance(e,field.player)<(e.kind==='boss'?15:11)).sort((a,b)=>distance(a,field.player)-distance(b,field.player))[0]||null;}
  function animateMonster(e,f,dt){
    if(!['enemy','elite','boss'].includes(e.kind))return;
    if(!e.motion){e.motion=Math.random()<.3?'rest':'hop';e.motionLeft=.8+Math.random()*2;e.hopPhase=Math.random();}
    e.motionLeft-=dt;
    if(e.motionLeft<=0){e.motion=e.motion==='rest'?(Math.random()<.7?'hop':'walk'):'rest';e.motionLeft=e.motion==='rest'?1+Math.random()*1.5:1.8+Math.random()*2;e.angle+=(Math.random()-.5)*2.2;e.hopPhase=0;}
    if(e.motion==='hop')e.hopPhase=(e.hopPhase+dt/ .55)%1;
    const bounce=e.motion==='hop'?Math.max(0,Math.sin(e.hopPhase*Math.PI)):0;
    e.hop=reducedMotion.matches?0:bounce*(e.kind==='boss'?5:20);
    if(e.kind!=='enemy'||e.motion==='rest')return;
    const speed=e.motion==='hop'?2.2:1.4,next={x:e.x+Math.cos(e.angle)*dt*speed,y:e.y+Math.sin(e.angle)*dt*speed};
    if(valid(f,next,4)&&next.y<f.size-14){e.x=next.x;e.y=next.y;}else{e.angle+=Math.PI*.7;e.motion='rest';e.motionLeft=.7;e.hop=0;}
  }
  async function encounter(e,roster){
    await window.MOBMON_PRESENT.preload([e.src,...roster.map(r=>D.monsters.find(m=>m.name===r.name)?.image),window.MOBMON_ASSET_MAP.battleAsset(field.area,e.kind)]);
    const boss=e.kind==='boss',elite=e.kind==='elite',duration=reducedMotion.matches?400:boss?1650:1200;
    const overlay=document.createElement('div');overlay.className=`encounter-overlay ${boss?'boss-encounter':elite?'elite-encounter':''}`;
    overlay.style.setProperty('--encounter-duration',duration+'ms');overlay.setAttribute('role','status');overlay.setAttribute('aria-live','assertive');
    overlay.innerHTML=`<div class="encounter-speedlines"></div><div class="encounter-ring"></div><div class="encounter-cut top"></div><div class="encounter-cut bottom"></div><section class="encounter-banner"><small>${boss?'WARNING · BOSS APPROACHING':elite?'WARNING · ELITE MONSTER':'ENEMY DETECTED'}</small><div class="encounter-portrait">${image(e.src,esc(e.name))}</div><h2>${boss?'BOSS BATTLE':elite?'強敵出現！':'ENCOUNTER'}</h2><p>${esc(e.name)}${roster.length>1?` ほか ${roster.length-1}体`:''}</p><span>ロボ、バトルモードへ！</span></section><div class="encounter-shutter"></div>`;
    const app=document.querySelector('#app'),wasInert=app.inert;app.inert=true;api.lock(true);document.body.appendChild(overlay);
    try{await new Promise(resolve=>setTimeout(resolve,duration));}finally{overlay.remove();app.inert=wasInert;api.lock(false);}
  }
  function markup(e){const src=e.kind==='chest'?`takara/00${e.rare?(e.opened?4:3):(e.opened?2:1)}.png`:e.src;return `<div class="map-entity ${e.kind} ${e.opened?'opened':''}" data-entity="${e.id}" style="left:${percent(e.x)}%;top:${percent(e.y)}%">${e.kind==='portal'?'<span class="portal-vortex"></span>':e.kind==='cave'||e.kind==='cave-exit'?`<span class="cave-mouth"><i></i></span><small>${esc(e.name)}</small>`:image(src,e.name||'宝箱')}${e.level?`<span class="field-nameplate">${esc(e.name)}<b>Lv ${e.level}${e.kind==='elite'?' · 中ボス':e.kind==='boss'?' · BOSS':''}</b></span>`:''}</div>`;}
  function render(root){
    if(!field)return selector(root);stop();const f=field;api.state().story.current.areaNo=f.floor;save();
    root.className='screen exploration-screen';
    root.scrollTop=0;
    root.innerHTML=`<header class="explore-heading"><div><small>ROBO EXPEDITION</small><h1>${esc(f.area)}${f.deep?'深層':''} <span>${f.inside?esc(site(f.area).name):`AREA ${f.floor}/4`}</span></h1></div><button id="leaveField" class="ghost-btn">帰還</button></header><div class="field-slot"><div class="field-map ${f.floor===4?'boss-map':''} ${f.inside?'cave-map':''}" style="--world-scale:${f.size/100};--terrain:${['#375e43','#776540','#576554','#344861','#24536c','#4c5640','#6b403a','#423c59','#435362'][areas.indexOf(f.area)]}" role="img" aria-label="${esc(f.area)}の探索マップ"><div id="fieldWorld" class="field-world"><div class="field-road"></div>${(f.walls||[]).map(w=>`<div class="field-wall" style="left:${percent(w.x)}%;top:${percent(w.y)}%;width:${percent(w.size)}%;height:${percent(w.size)}%" aria-label="通れない壁"></div>`).join('')}${f.obstacles.map(o=>`<div class="obstacle obstacle-${o.type}" style="left:${percent(o.x)}%;top:${percent(o.y)}%;width:${percent(o.r*2+5)}%">${image(`stage/00${o.type}.png`)}</div>`).join('')}<div id="fieldEntities">${f.entities.map(markup).join('')}</div><div id="fieldRobot" class="field-robot">${image(`robo/${direction}.png`,'操作ロボ')}</div></div><span class="map-north">N ↑</span><span class="map-sector" id="mapSector"></span></div></div><p class="field-hint" id="fieldHint" role="status">近づくとレーダーが反応します</p><div class="robo-console"><span class="joystick-guide">ドラッグ<br>で移動</span><button id="joystickPad" class="joystick-pad" type="button" aria-label="バーチャルパッド：ドラッグして移動"><span id="joystickKnob" class="joystick-knob"></span></button><button id="radarAction" class="radar" disabled><span class="radar-sweep"></span><b>探索中</b><small>RADAR</small></button></div>`;
    view={root,robot:root.querySelector('#fieldRobot'),world:root.querySelector('#fieldWorld'),sector:root.querySelector('#mapSector'),radar:root.querySelector('#radarAction'),hint:root.querySelector('#fieldHint'),entities:root.querySelector('#fieldEntities'),nodes:new Map(),obstacles:[...root.querySelectorAll('.obstacle')],unit:1,lastCullX:-999,lastCullY:-999,radarKey:''};
    view.robot.style.left='0';view.robot.style.top='0';view.robotImage=view.robot.querySelector('img');view.radarLabel=view.radar.querySelector('b');for(const el of view.entities.children)view.nodes.set(el.dataset.entity,el);
    root.querySelector('#leaveField').onclick=async()=>{if(await ask('エリアから帰還しますか？','現在の探索マップはリセットされます。獲得した報酬は保持されます。')){leave();api.go('home');}};
    root.querySelector('#radarAction').onclick=interact;
    const pad=root.querySelector('#joystickPad');
    const move=e=>{if(stick.pointer!==e.pointerId)return;e.preventDefault();const r=pad.getBoundingClientRect(),radius=r.width*.30;let x=(e.clientX-r.left-r.width/2)/radius,y=(e.clientY-r.top-r.height/2)/radius;const length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}stick.x=Math.abs(x)<.12?0:x;stick.y=Math.abs(y)<.12?0:y;root.querySelector('#joystickKnob').style.transform=`translate(${x*radius}px,${y*radius}px)`;};
    pad.onpointerdown=e=>{if(stick.pointer!==null||busy||!modal.hidden)return;stick.pointer=e.pointerId;pad.setPointerCapture(e.pointerId);move(e);};pad.onpointermove=move;
    pad.onpointerup=pad.onpointercancel=pad.onlostpointercapture=e=>{if(stick.pointer===e.pointerId)resetStick();};
    const slot=root.querySelector('.field-slot'),map=root.querySelector('.field-map');
    const fit=()=>{const r=slot.getBoundingClientRect(),size=Math.max(1,Math.floor(Math.min(r.width,r.height)));map.style.width=size+'px';map.style.height=size+'px';if(view)view.unit=size/100;};
    fit();if(window.ResizeObserver){resizeObserver=new ResizeObserver(fit);resizeObserver.observe(slot);}
    draw();frame=requestAnimationFrame(tick);
  }
  function draw(){if(!field||!view||!view.robot.isConnected)return;const f=field,v=view,u=v.unit;
    f.camera.x=clamp(f.player.x-50,0,f.size-100);f.camera.y=clamp(f.player.y-50,0,f.size-100);
    v.robot.style.transform=`translate3d(${(f.player.x*u).toFixed(2)}px,${(f.player.y*u).toFixed(2)}px,0) translate(-50%,-50%)`;
    v.world.style.transform=`translate3d(${(-f.camera.x*u).toFixed(2)}px,${(-f.camera.y*u).toFixed(2)}px,0)`;
    const sector=f.inside?site(f.area).name:f.floor===4?'BOSS AREA':`SECTOR ${Math.min(2,Math.floor(f.player.x/100))+1} / ${Math.min(2,Math.floor(f.player.y/100))+1}`;if(v.sector.textContent!==sector)v.sector.textContent=sector;
    if(v.direction!==direction){v.direction=direction;v.robotImage.src=`robo/${direction}.png`;}
    const visible=(x,y,r=18)=>x+r>f.camera.x&&x-r<f.camera.x+100&&y+r>f.camera.y&&y-r<f.camera.y+100;
    if(Math.abs(f.camera.x-v.lastCullX)>2||Math.abs(f.camera.y-v.lastCullY)>2){f.obstacles.forEach((o,i)=>{const hidden=!visible(o.x,o.y,o.r+5);if(v.obstacles[i].hidden!==hidden)v.obstacles[i].hidden=hidden;});v.lastCullX=f.camera.x;v.lastCullY=f.camera.y;}
    const t=target();for(const e of f.entities){let el=v.nodes.get(e.id);if(!el||!el.isConnected){el=v.entities.querySelector(`[data-entity="${e.id}"]`);if(!el)continue;v.nodes.set(e.id,el);}const hidden=!visible(e.x,e.y,e.kind==='boss'?28:18);if(el.hidden!==hidden)el.hidden=hidden;if(hidden)continue;
      if(!el.dataset.positioned){el.style.left='0';el.style.top='0';el.dataset.positioned='true';}const transform=`translate3d(${(e.x*u).toFixed(2)}px,${(e.y*u).toFixed(2)}px,0) translate(-50%,-50%)`;if(el.style.transform!==transform)el.style.transform=transform;if(e.age<1||el.style.opacity!=='1')el.style.opacity=Math.min(1,e.age/.8);
      const inRange=e===t;if(el.classList.contains('in-range')!==inRange)el.classList.toggle('in-range',inRange);const hop=(e.hop||0).toFixed(1)+'%';if(el._hop!==hop){el._hop=hop;el.style.setProperty('--monster-hop',hop);}if(el.dataset.motion!==(e.motion||''))el.dataset.motion=e.motion||'';
    }
    const radarKey=(t?.id||'none')+'|'+busy;if(v.radarKey!==radarKey){v.radarKey=radarKey;v.radar.disabled=!t||busy;v.radar.classList.toggle('detected',!!t);v.radarLabel.textContent=!t?'探索中':t.kind==='cave'?`${site(f.area).name}へ入る`:t.kind==='cave-exit'?'外へ戻る':t.kind==='portal'?(f.floor===4?'エリアから出る':'次の階へ'):t.kind==='chest'?'開ける！':'バトル！';v.hint.textContent=t?(t.name||(t.kind==='chest'?'宝箱を発見！':'ワープホールを発見！')):'光る対象に近づいて、レーダーでアクション';}
  }
  function tick(now){if(!field)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!busy&&modal.hidden&&!document.hidden){const f=field;f.elapsed+=dt;let dx=Number(keys.has('right'))-Number(keys.has('left'))+stick.x,dy=Number(keys.has('down'))-Number(keys.has('up'))+stick.y;if(dx||dy){direction=Math.abs(dy)>=Math.abs(dx)?(dy<0?'001':'002'):(dx<0?'003':'004');const length=Math.max(1,Math.hypot(dx,dy));dx=dx/length*dt*ROBO_SPEED;dy=dy/length*dt*ROBO_SPEED;const px={x:clamp(f.player.x+dx,4,f.size-4),y:f.player.y};if(valid(f,px,3))f.player.x=px.x;const py={x:f.player.x,y:clamp(f.player.y+dy,4,f.size-4)};if(valid(f,py,3))f.player.y=py.y;}
      for(const e of f.entities){e.age+=dt;animateMonster(e,f,dt);}
      const ready=f.respawns.filter(t=>t<=f.elapsed);f.respawns=f.respawns.filter(t=>t>f.elapsed);for(const t of ready){const e=monster(f);f.entities.push(e);document.querySelector('#fieldEntities').insertAdjacentHTML('beforeend',markup(e));}
      draw();const portal=f.entities.find(e=>e.kind==='portal');if(portal&&distance(portal,f.player)<5&&!f.portalPrompt){f.portalPrompt=true;interact(portal);}if(portal&&distance(portal,f.player)>8)f.portalPrompt=false;
    }frame=requestAnimationFrame(tick);}
  async function interact(explicit){if(busy||!field)return;const e=explicit?.kind?explicit:target();if(!e)return;keys.clear();resetStick();
    if(e.kind==='cave'||e.kind==='cave-exit'){
      const entering=e.kind==='cave';busy=true;
      const yes=await ask(entering?site(field.area).name+'へ入りますか？':'外へ戻りますか？','宝箱の取得状態は、この地域から帰還するまで保持されます。');busy=false;if(!yes)return;
      if(entering){mainField=field;caveField=caveField||generateCave(field.area,field.deep,field.floor);caveField.player={x:75,y:132};await warp(site(field.area).name+'へ',()=>{field=caveField;},fieldAssets(caveField));}
      else{await warp('外のエリアへ',()=>{field=mainField;},fieldAssets(mainField));}return;
    }
    if(e.kind==='portal'){busy=true;const yes=await ask(field.floor===4?'エリアから出ますか？':'次の階に進みますか？',field.floor===4?'獲得したソウルと一緒に帰還します。':`AREA ${field.floor+1}へワープします。`);busy=false;if(!yes)return;if(field.floor===4){await warp('エリアから帰還！',()=>{leave();api.go('home');});}else {const next=generate(field.area,field.deep,field.floor+1);await warp('次のAREAへ！',()=>{mainField=null;caveField=null;field=next;},fieldAssets(next));}return;}
    if(e.kind==='chest'){if(e.opened)return;e.opened=true;const s=api.state(),item=e.rare?D.soulBoostItems[D.soulBoostItems.length-1]:D.soulBoostItems[0];s.inventory[item.id]=(s.inventory[item.id]||0)+1;save();document.querySelector(`[data-entity="${e.id}"]`).outerHTML=markup(e);draw();api.modal(e.rare?'RARE ITEM GET!':'ITEM GET!',`<div class="treasure-result ${e.rare?'rare':''}"><span class="treasure-rays"></span>${image(`takara/00${e.rare?4:2}.png`)}<span class="treasure-item">♫</span><h2>${esc(item.name)}</h2><p>×1 獲得しました！</p><button id="treasureDone" class="primary full">探索を続ける</button></div>`);document.querySelector('#treasureDone').onclick=api.close;return;}
    stop();busy=true;const f=field;const roster=[{name:e.name,level:e.level}];if(e.kind==='enemy')for(let i=1,n=1+Math.floor(Math.random()*4);i<n;i++)roster.push({name:choose(pool(f.area,f.deep,f.inside)).name,level:campaign.level(f.area,f.deep,f.floor,'enemy',f.inside)});
    try{await encounter(e,roster);}catch(error){busy=false;render(document.querySelector('#screen'));toast('戦闘の準備をやり直してください');return;}
    if(field!==f)return;
    api.battle({mode:'exploration',encounterKind:e.kind,background:window.MOBMON_ASSET_MAP.battleAsset(f.area,e.kind),area:f.area,floor:f.floor,title:`${f.area}${f.deep?'深層':''} ${f.inside?site(f.area).name:'AREA '+f.floor}`,enemyRoster:roster,useFullParty:true,soulDrop:true,guaranteedSoul:e.kind==='boss'?e.name:null,onWin:()=>{if(e.kind==='elite'){(api.state().quests||={}).eliteGrass=api.state().quests.eliteGrass||f.area==='草原';save();}if(e.kind==='boss'){progress().cleared[key(f.area,f.deep)]=true;api.complete(f.area,f.deep);save();}},onReturn:(win,fled)=>{
      busy=false;if(!win&&!fled){leave();return false;}if(win||e.kind==='enemy'){f.entities=f.entities.filter(x=>x.id!==e.id);if(e.kind==='enemy')f.respawns.push(f.elapsed+15);if(e.kind==='boss'){f.entities.push(chest(f,{x:33,y:22}),chest(f,{x:67,y:22}),{id:'portal',kind:'portal',x:50,y:12,age:1});}}
      return true;
    }});
  }
  const keyNames={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
  document.addEventListener('keydown',e=>{if(!field||busy||!modal.hidden||api.state().screen!=='story')return;const k=keyNames[e.key];if(k){e.preventDefault();keys.add(k);}if(e.code==='Space'){e.preventDefault();interact();}});
  document.addEventListener('keyup',e=>keys.delete(keyNames[e.key]));window.addEventListener('blur',()=>{keys.clear();resetStick();});document.addEventListener('visibilitychange',()=>{keys.clear();resetStick();last=0;});
  return{render,leave,stop,selector,generate,valid,deepUnlocked,active:()=>!!field};
};
})();
