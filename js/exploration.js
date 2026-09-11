/* Walking adventure. Coordinates are percentages of a square, independent of device size. */
(()=>{
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const choose=a=>a[Math.floor(Math.random()*a.length)];
const image=(src,alt='')=>`<img src="${src}" alt="${alt}" draggable="false">`;
window.MOBMON_EXPLORATION=function(api){
  const {data:D,esc,ask,save,toast}=api;
  const areas=D.seasons.filter(s=>s.loop===1).flatMap(s=>s.areas);
  let field=null,frame=0,last=0,keys=new Set(),direction='002',busy=false;
  function progress(){const s=api.state();return s.exploration||(s.exploration={cleared:{}});}
  const key=(area,deep)=>`${area}|${deep?'deep':'normal'}`;
  function cleared(area,deep){return !!progress().cleared[key(area,deep)]||!!api.state().story.completedAreas[`S${D.seasons.find(s=>s.loop===(deep?2:1)&&s.areas.includes(area)).season}|${area}`];}
  function deepUnlocked(){return areas.slice(0,areas.indexOf('魔王城')+1).every(a=>cleared(a,false));}
  function stop(){cancelAnimationFrame(frame);frame=0;keys.clear();last=0;}
  function leave(){stop();field=null;busy=false;}
  function selector(root){
    stop();root.className='screen expedition-select';
    root.innerHTML=api.heading('冒険','CHOOSE YOUR DESTINATION')+`<p class="expedition-note">ロボに乗って、未知のソウルを探しに。<br>各エリアは AREA 1〜4。魔王城まで踏破すると深層が開放されます。</p><div class="destination-list">${areas.map((a,i)=>`<button data-destination="${i}" class="destination"><span>${String(i+1).padStart(2,'0')}</span><div><small>${cleared(a,false)?'CLEAR':'EXPLORE'}</small><b>${esc(a)}</b></div><em>›</em></button>`).join('')}</div>`;
    root.querySelectorAll('[data-destination]').forEach(b=>b.onclick=()=>{
      const a=areas[Number(b.dataset.destination)];api.modal(a,`<p>探索する深さを選んでください。</p><div class="depth-options"><button id="normalDepth" class="primary">${esc(a)}${cleared(a,false)?' ✓':''}</button><button id="deepDepth" class="primary" ${deepUnlocked()?'':'disabled'}>${esc(a)}深層${cleared(a,true)?' ✓':''}</button></div><p class="panel-note">${deepUnlocked()?'深層が開放されています。':'深層：草原から魔王城までのボスを倒すと開放'}</p>`);
      document.querySelector('#normalDepth').onclick=()=>depart(a,false);
      document.querySelector('#deepDepth').onclick=()=>{if(deepUnlocked())depart(a,true);};
    });
  }
  async function warp(label,fn){busy=true;stop();api.modal('WARP',`<div class="warp-scene"><div class="warp-tunnel"></div>${image('robo/001.png')}<h2>${esc(label)}</h2><p>ソウルの座標へ接続中…</p></div>`);api.lock(true);try{await new Promise(r=>setTimeout(r,1100));api.lock(false);fn();}finally{api.lock(false);api.close();busy=false;}if(field)render(document.querySelector('#screen'));}
  async function depart(area,deep){
    if(!api.party().length)return toast('先にパーティーに仲間を編成してください');
    if(!await ask(`${area}${deep?'深層':''}へ出発しますか？`,'ロボに乗って探索します。'))return;
    await warp('ロボに乗って出発！',()=>{field=generate(area,deep,1);const s=api.state();s.screen='story';s.story.current={season:D.seasons.find(s=>s.loop===(deep?2:1)&&s.areas.includes(area)).season,area,floor:deep?2:1,areaNo:1};save();});
  }
  function pool(area,deep){const list=D.monsters.filter(m=>String(m.firstArea).startsWith(area)&&m.species!=='ボス'&&m.sourceCategory!=='event'&&(deep||D.rankOrder.indexOf(m.rank)<=5));return list.length?list:D.monsters.filter(m=>m.firstArea==='草原'&&m.species!=='ボス');}
  function valid(f,p,r=4){return p.x>=r&&p.x<=100-r&&p.y>=r&&p.y<=100-r&&!f.obstacles.some(o=>distance(o,p)<o.r+r);}
  function position(f,r=5){for(let i=0;i<400;i++){const p={x:8+Math.random()*84,y:12+Math.random()*70};if(valid(f,p,r)&&distance(p,f.player)>13&&f.entities.every(e=>distance(e,p)>r+5))return p;}return{x:50,y:25};}
  function monster(f,kind='enemy',p=null){let m=choose(pool(f.area,f.deep));if(kind==='elite')m=f.area==='草原'?choose(D.monsters.filter(m=>['enemy/10.png','enemy/13.png'].includes(m.image))):choose(pool(f.area,f.deep).filter(m=>m.sourceCategory==='elite').length?pool(f.area,f.deep).filter(m=>m.sourceCategory==='elite'):pool(f.area,f.deep));if(kind==='boss')m=D.monsters.find(m=>m.name===D.areaBoss[f.area]?.[f.deep?'2':'1']);return{...p||position(f),id:crypto.randomUUID(),kind,name:m.name,src:m.image,angle:Math.random()*Math.PI*2,age:0};}
  function chest(f,p){return{...p||position(f),id:crypto.randomUUID(),kind:'chest',rare:Math.random()<.1,opened:false,age:0};}
  function generate(area,deep,floor){
    const f={area,deep,floor,player:{x:50,y:92},obstacles:[],entities:[],respawns:[],elapsed:0,portalPrompt:false};
    if(floor===4){if(!cleared(area,deep))f.entities.push(monster(f,'boss',{x:50,y:40}));else f.entities.push({id:'portal',kind:'portal',x:50,y:16,age:1});return f;}
    // Keep a connected central road and horizontal lanes; decorations never block these routes.
    for(const y of [24,48,70])for(const x of [20,80]){const type=1+Math.floor(Math.random()*4),r=[0,5,6,9,6][type];f.obstacles.push({x:x+(Math.random()-.5)*8,y:y+(Math.random()-.5)*6,r,type});}
    f.entities.push({id:'portal',kind:'portal',x:42+Math.random()*16,y:8,age:1});
    if(floor===2)f.entities.push(monster(f,'elite',{x:f.entities[0].x,y:22}));
    for(let i=0;i<(floor===2?6:7);i++)f.entities.push(monster(f));
    const count=1+(Math.random()<.5?1:0)+(Math.random()<.3?1:0);
    for(let i=0;i<count;i++)f.entities.push(chest(f));return f;
  }
  function target(){if(!field)return null;return field.entities.filter(e=>!e.opened&&distance(e,field.player)<(e.kind==='boss'?15:11)).sort((a,b)=>distance(a,field.player)-distance(b,field.player))[0]||null;}
  function markup(e){const src=e.kind==='chest'?`takara/00${e.rare?(e.opened?4:3):(e.opened?2:1)}.png`:e.src;return `<div class="map-entity ${e.kind} ${e.opened?'opened':''}" data-entity="${e.id}" style="left:${e.x}%;top:${e.y}%">${e.kind==='portal'?'<span class="portal-vortex"></span>':image(src,e.name||'宝箱')}${e.kind==='elite'?'<small>中ボス</small>':e.kind==='boss'?'<small>BOSS</small>':''}</div>`;}
  function render(root){
    if(!field)return selector(root);stop();const f=field;api.state().story.current.areaNo=f.floor;save();
    root.className='screen exploration-screen';
    root.innerHTML=`<header class="explore-heading"><div><small>${f.deep?'DEEP EXPLORATION':'ROBO EXPEDITION'}</small><h1>${esc(f.area)}${f.deep?'深層':''} <span>AREA ${f.floor}/4</span></h1></div><button id="leaveField" class="ghost-btn">帰還</button></header><div class="field-map ${f.floor===4?'boss-map':''}" style="--terrain:${['#375e43','#776540','#576554','#344861','#24536c','#4c5640','#6b403a','#423c59','#435362'][areas.indexOf(f.area)]}" role="img" aria-label="${esc(f.area)}の探索マップ"><div class="field-road"></div><span class="map-north">N ↑</span>${f.obstacles.map(o=>`<div class="obstacle obstacle-${o.type}" style="left:${o.x}%;top:${o.y}%;width:${o.r*2+5}%">${image(`stage/00${o.type}.png`)}</div>`).join('')}<div id="fieldEntities">${f.entities.map(markup).join('')}</div><div id="fieldRobot" class="field-robot" style="left:50%;top:92%">${image(`robo/${direction}.png`,'操作ロボ')}</div></div><p class="field-hint" id="fieldHint" role="status">光る対象に近づいて、レーダーでアクション</p><div class="robo-console"><div class="dpad" aria-label="ロボの移動"><button data-direction="up" aria-label="上へ移動">▲</button><button data-direction="left" aria-label="左へ移動">◀</button><span>✦</span><button data-direction="right" aria-label="右へ移動">▶</button><button data-direction="down" aria-label="下へ移動">▼</button></div><button id="radarAction" class="radar" disabled><span class="radar-sweep"></span><b>探索中</b><small>RADAR</small></button></div><p class="console-note">方向キー / WASDでも移動 · Spaceでアクション</p>`;
    root.querySelector('#leaveField').onclick=async()=>{if(await ask('エリアから帰還しますか？','現在の探索マップはリセットされます。獲得した報酬は保持されます。')){leave();api.go('home');}};
    root.querySelector('#radarAction').onclick=interact;
    root.querySelectorAll('[data-direction]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();keys.add(b.dataset.direction);b.setPointerCapture(e.pointerId);};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(b.dataset.direction);});
    draw();frame=requestAnimationFrame(tick);
  }
  function draw(){if(!field)return;const root=document.querySelector('#screen'),robot=root.querySelector('#fieldRobot');if(!robot)return;robot.style.left=field.player.x+'%';robot.style.top=field.player.y+'%';const img=robot.querySelector('img');if(!img.getAttribute('src').endsWith(direction+'.png'))img.src=`robo/${direction}.png`;
    const t=target();for(const e of field.entities){const el=root.querySelector(`[data-entity="${e.id}"]`);if(!el)continue;el.style.left=e.x+'%';el.style.top=e.y+'%';el.style.opacity=Math.min(1,e.age/.8);el.classList.toggle('in-range',e===t);}
    const radar=root.querySelector('#radarAction');radar.disabled=!t||busy;radar.classList.toggle('detected',!!t);radar.querySelector('b').textContent=!t?'探索中':t.kind==='portal'?(field.floor===4?'エリアから出る':'次の階へ'):t.kind==='chest'?'開ける！':'バトル！';root.querySelector('#fieldHint').textContent=t?(t.name|| (t.kind==='chest'?'宝箱を発見！':'ワープホールを発見！')):'光る対象に近づいて、レーダーでアクション';
  }
  function tick(now){if(!field)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!busy&&document.querySelector('#modal').hidden&&!document.hidden){const f=field;f.elapsed+=dt;let dx=Number(keys.has('right'))-Number(keys.has('left')),dy=Number(keys.has('down'))-Number(keys.has('up'));if(dx||dy){direction=dy<0?'001':dy>0?'002':dx<0?'003':'004';const length=Math.hypot(dx,dy);dx=dx/length*dt*23;dy=dy/length*dt*23;const px={x:clamp(f.player.x+dx,4,96),y:f.player.y};if(valid(f,px,3))f.player.x=px.x;const py={x:f.player.x,y:clamp(f.player.y+dy,4,96)};if(valid(f,py,3))f.player.y=py.y;}
      for(const e of f.entities){e.age+=dt;if(e.kind!=='enemy')continue;const next={x:e.x+Math.cos(e.angle)*dt*1.4,y:e.y+Math.sin(e.angle)*dt*1.4};if(valid(f,next,4)&&next.y<86){e.x=next.x;e.y=next.y;}else e.angle+=Math.PI*.7;}
      const ready=f.respawns.filter(t=>t<=f.elapsed);f.respawns=f.respawns.filter(t=>t>f.elapsed);for(const t of ready){const e=monster(f);f.entities.push(e);document.querySelector('#fieldEntities').insertAdjacentHTML('beforeend',markup(e));}
      draw();const portal=f.entities.find(e=>e.kind==='portal');if(portal&&distance(portal,f.player)<5&&!f.portalPrompt){f.portalPrompt=true;interact(portal);}if(portal&&distance(portal,f.player)>8)f.portalPrompt=false;
    }frame=requestAnimationFrame(tick);}
  async function interact(explicit){if(busy||!field)return;const e=explicit?.kind?explicit:target();if(!e)return;keys.clear();
    if(e.kind==='portal'){busy=true;const yes=await ask(field.floor===4?'エリアから出ますか？':'次の階に進みますか？',field.floor===4?'獲得したソウルと一緒に帰還します。':`AREA ${field.floor+1}へワープします。`);busy=false;if(!yes)return;if(field.floor===4){await warp('エリアから帰還！',()=>{leave();api.go('home');});}else await warp('次のAREAへ！',()=>{field=generate(field.area,field.deep,field.floor+1);});return;}
    if(e.kind==='chest'){if(e.opened)return;e.opened=true;const s=api.state(),item=e.rare?D.soulBoostItems[D.soulBoostItems.length-1]:D.soulBoostItems[0];s.inventory[item.id]=(s.inventory[item.id]||0)+1;save();document.querySelector(`[data-entity="${e.id}"]`).outerHTML=markup(e);draw();api.modal(e.rare?'RARE ITEM GET!':'ITEM GET!',`<div class="treasure-result ${e.rare?'rare':''}"><span class="treasure-rays"></span>${image(`takara/00${e.rare?4:2}.png`)}<span class="treasure-item">♫</span><h2>${esc(item.name)}</h2><p>×1 獲得しました！</p><button id="treasureDone" class="primary full">探索を続ける</button></div>`);document.querySelector('#treasureDone').onclick=api.close;return;}
    stop();busy=true;const f=field;const level=clamp(2+areas.indexOf(f.area)*6+(f.floor-1)*2+(f.deep?45:0),1,99);const roster=[{name:e.name,level:level+(e.kind==='boss'?2:0)}];if(e.kind==='enemy')for(let i=1,n=1+Math.floor(Math.random()*4);i<n;i++)roster.push({name:choose(pool(f.area,f.deep)).name,level});
    api.battle({mode:'exploration',area:f.area,floor:f.floor,title:`${f.area}${f.deep?'深層':''} AREA ${f.floor}`,enemyRoster:roster,useFullParty:true,soulDrop:true,guaranteedSoul:e.kind==='boss'?e.name:null,onWin:()=>{if(e.kind==='boss'){progress().cleared[key(f.area,f.deep)]=true;api.complete(f.area,f.deep);save();}},onReturn:(win,fled)=>{
      busy=false;if(!win&&!fled){leave();return false;}if(win||e.kind==='enemy'){f.entities=f.entities.filter(x=>x.id!==e.id);if(e.kind==='enemy')f.respawns.push(f.elapsed+15);if(e.kind==='boss'){f.entities.push(chest(f,{x:33,y:22}),chest(f,{x:67,y:22}),{id:'portal',kind:'portal',x:50,y:12,age:1});}}
      return true;
    }});
  }
  const keyNames={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
  document.addEventListener('keydown',e=>{if(!field||busy||!document.querySelector('#modal').hidden)return;const k=keyNames[e.key];if(k){e.preventDefault();keys.add(k);}if(e.code==='Space'){e.preventDefault();interact();}});
  document.addEventListener('keyup',e=>keys.delete(keyNames[e.key]));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{keys.clear();last=0;});
  return{render,leave,stop,selector,generate,valid,deepUnlocked};
};
})();
