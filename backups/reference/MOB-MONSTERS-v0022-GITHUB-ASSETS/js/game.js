(()=>{
'use strict';
const D=window.MOBMON_DATA;
const SAVE_KEY='mob_monsters_core_v001';
const VERSION='v0.2.2 GITHUB ASSETS';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const rint=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Math.round(Number(n)||0).toLocaleString();
const rankIndex=r=>D.rankOrder.indexOf(r);
const rankClass=r=>`rank rank-${String(r).replace(/[^A-Z]/g,'')||r}`;
const monsterByName=new Map(D.monsters.map(m=>[m.name,m]));
const recordByName=new Map(D.records.map(r=>[r.name,r]));
const passiveByName=new Map(D.passives.map(p=>[p['パッシブ'],p]));
const statusJa={poison:'毒',burn:'やけど',paralyze:'マヒ',sleep:'眠り',stun:'ひるみ',confuse:'混乱'};
const attrList=['無','火','水','雷','地','風','光','闇'];
const statusKeys=['poison','burn','paralyze','sleep','stun','confuse'];
const gradeToStatusKey={毒:'poison',やけど:'burn',マヒ:'paralyze',眠り:'sleep',ひるみ:'stun',混乱:'confuse'};
const AS=window.MOBMON_ASSETS||null;
const AM=window.MOBMON_ASSET_MAP||{};
function monsterImage(m){return (m&&AM.monsterOverrides&&AM.monsterOverrides[m.name])||m?.image||'';}
function assetImgMarkup(path,alt='',cls=''){
  path=String(path||'');if(!path)return '';
  if(AS?.markup)return AS.markup(path,alt,cls);
  return `<img class="${esc(cls)}" src="${esc(path)}" alt="${esc(alt)}">`;
}
function sceneBgMarkup(mode='home',area='',floor=1){
  let path='';
  if(mode==='home')path=AM.home||'back/rpgmain.png';
  else if(mode==='arena')path=AM.arena||'back/metal.png';
  else if(mode==='soul')path=AM.soul||'back/matrix4.png';
  else if(AM.areaAsset)path=AM.areaAsset(area,mode==='battle'?'battle':mode==='floor'?'floor':'field',floor);
  return path?`<div class="live-scene-bg-v5">${assetImgMarkup(path,'','live-scene-img-v5')}</div>`:'';
}
function battleArea(){return battle?.area||state.story?.current?.area||'草原';}


function uid(){return 'm_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9)}
function defaultState(){
  return{
    version:1,gold:1200,screen:'home',owned:[],party:[],souls:{},
    inventory:{little_music:5,soul_boost_07:3,soul_boost_12:2,soul_boost_20:1,anti_paralyze:3},
    soulBoost:0,
    story:{completedNodes:{},completedAreas:{},completedSeasons:{},current:{season:1,area:'草原',floor:1,areaNo:1},resume:null,roseUnlocked:false},
    arena:{progress:{},currentRank:'F'},
    flags:{demoSeeded:false},settings:{battleSpeed:1},
  };
}
let state=load();
let battle=null;
let toastTimer=null;
let partyReplaceIndex=null;

function load(){try{const x=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');return x&&x.version===1?normalizeState(x):defaultState();}catch{return defaultState();}}
function normalizeState(s){
  const d=defaultState();s={...d,...s};s.story={...d.story,...s.story};s.story.current={...d.story.current,...(s.story.current||{})};s.arena={...d.arena,...s.arena};s.inventory={...d.inventory,...s.inventory};s.owned=Array.isArray(s.owned)?s.owned:[];s.party=Array.isArray(s.party)?s.party.slice(0,10):[];s.souls=s.souls||{};return s;
}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(state));updateTop();}
function toast(msg,ms=1800){const el=$('#toast');el.textContent=msg;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,ms);}
function updateTop(){const total=Object.values(state.souls||{}).reduce((n,a)=>n+(Array.isArray(a)?a.length:0),0);$('#topGold').textContent=fmt(state.gold);$('#topSoul').textContent=fmt(total);$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.go===state.screen));}
function showModal(title,html){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;$('#modal').hidden=false;}
function closeModal(){if(battle?.choiceLock)return;$('#modal').hidden=true;$('#modalBody').innerHTML='';}
$('#modalClose').onclick=closeModal;$('#systemBtn').onclick=()=>{if(!battle)systemModal();};$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal();});
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b&&!battle){go(b.dataset.go);}});

function avatarMarkup(m,cls=''){const symbol=esc(m?.sourceSymbol||m?.name?.replace(/^モブ/,'').slice(0,1)||'M'),img=monsterImage(m);return `<span class="avatar ${cls}">${img?assetImgMarkup(img,m?.name||'', 'mob-asset-img-v5'):''}<i>${symbol}</i></span>`;}
function artSymbol(m){return esc(m?.sourceSymbol||m?.name?.replace(/^モブ/,'').slice(0,1)||'M');}
function stageArtMarkup(m,extra=''){if(!m)return `<span class="stage-art-v3 ${extra}"><i>＋</i></span>`;const img=monsterImage(m);return `<span class="stage-art-v3 ${extra}">${img?assetImgMarkup(img,m.name,'mob-asset-img-v5'):''}<i>${artSymbol(m)}</i></span>`;}
function slotArtMarkup(m){if(!m)return `<span class="slot-art-v3"><i>＋</i></span>`;const img=monsterImage(m);return `<span class="slot-art-v3">${img?assetImgMarkup(img,m.name,'mob-asset-img-v5'):''}<i>${artSymbol(m)}</i></span>`;}
function cardArtMarkup(m){const img=monsterImage(m);return `<span class="monster-card-art-v3">${img?assetImgMarkup(img,m?.name||'','mob-asset-img-v5'):''}<i>${artSymbol(m)}</i></span>`;}
function battleArtMarkup(m,cls){const img=monsterImage(m);return `<span class="${cls}">${img?assetImgMarkup(img,m?.name||'','mob-asset-img-v5'):''}<i>${artSymbol(m)}</i></span>`;}

function monsterTags(m){return `<span class="tag">${esc(m.species)}</span><span class="tag soul">${esc(m.attribute)}</span>`;}
function recordProgressMarkup(r){const need=r.level<70?nextRecordExp(r.level):0,pct=r.level>=70?100:Math.min(100,(r.exp||0)/need*100);return `<div class="progress"><i style="width:${pct}%"></i></div>`;}
function roleLabel(i){return i<4?'MAIN':i<6?'SUPER':'SUB';}
function ownedByUid(id){return state.owned.find(x=>x.uid===id)||null;}
function monsterDef(inst){return monsterByName.get(inst?.name)||null;}
function currentParty(){return state.party.map(ownedByUid).filter(Boolean);}
function seedDemo(){
  if(state.flags.demoSeeded)return;
  const starters=['モブスライム','モブロック','モブジョーロ','モブテンデビ','モブバード','モブピヨミドリ','モブピヨレッド','モブビーバー','モブアックス','モブイワキリ'];
  starters.forEach((name,i)=>{const inst=createInstance(name,i<8?5:7,true);state.owned.push(inst);state.party.push(inst.uid);});
  ['モブスライム','モブロック','モブジョーロ','モブフレイム','モブブリザード'].forEach(name=>{if(monsterByName.has(name)){addSoul(name);addSoul(name);}});
  state.flags.demoSeeded=true;save();
}
function createInstance(name,level=1,demo=false){
  const m=monsterByName.get(name);if(!m)throw new Error(`Unknown monster: ${name}`);
  const recs=(m.nativeRecords||[]).map(n=>({name:n,level:demo?Math.min(5,70):1,exp:0}));
  return{uid:uid(),name,level:clamp(level,1,99),exp:0,records:recs,activeRecord:recs[0]?.name||'',lineage:[],createdAt:Date.now()};
}
function soulToken(name,meta={}){const m=monsterByName.get(name);return{id:'s_'+uid(),name,records:meta.records||((m?.nativeRecords||[]).map(n=>({name:n,level:1}))),passives:meta.passives||[...(m?.passives||[])],lineage:meta.lineage||[],source:meta.source||'wild',createdAt:Date.now()};}
function addSoul(name,meta={}){if(!state.souls[name])state.souls[name]=[];state.souls[name].push(soulToken(name,meta));}
function bestSoulIndex(name,predicate=null){const a=state.souls[name]||[];let best=-1,score=-1;a.forEach((s,i)=>{if(predicate&&!predicate(s))return;const v=(s.records||[]).reduce((n,r)=>n+(r.level||1),0)+(s.lineage||[]).length*5;if(v>score){score=v;best=i;}});return best;}
function peekBestSoul(name,predicate=null){const i=bestSoulIndex(name,predicate);return i>=0?(state.souls[name]||[])[i]:null;}
function takeBestSoul(name,predicate=null){const a=state.souls[name]||[],i=bestSoulIndex(name,predicate);return i>=0?a.splice(i,1)[0]:null;}

function go(screen){state.screen=screen;save();render();}
function render(){
  const shell=$('#app'),root=$('#screen');
  if(battle){shell?.classList.add('battle-mode');return renderBattle();}
  shell?.classList.remove('battle-mode');updateTop();root.className='screen';
  if(!state.flags.demoSeeded)return renderWelcome(root);
  switch(state.screen){case'home':return renderHome(root);case'story':return renderStory(root);case'party':return renderParty(root);case'monsters':return renderMonsterList(root);case'soul':return renderSoul(root);case'arena':return renderArena(root);default:return renderHome(root);}
}

function renderWelcome(root){
  root.className='screen home-screen-v3';
  root.innerHTML=`<div class="home-mission-v3"><span><small>WELCOME TO</small><b>MOB MONSTERS</b></span><em>${VERSION}</em></div><div class="home-stage-v3">${sceneBgMarkup('home')}<div class="home-stage-shadow-v3"></div><div class="home-party-v3"><div class="home-monster-v3">${stageArtMarkup(monsterByName.get('モブスライム'))}<b>SOUL COLLECTION RPG</b></div></div></div><div class="home-ui-v3"><button id="seedBtn" class="home-primary-v3" type="button"><span class="home-icon-v3">◆</span><span><b>ゲームを開始</b><small>スターターCOREデータでMOB MONSTERSを開始</small></span><strong>›</strong></button><div class="home-grid-v3"><button class="home-menu-card-v3" type="button" disabled><span class="home-icon-v3">⚔</span><b>STORY</b><small>ADVENTURE</small></button><button class="home-menu-card-v3" type="button" disabled><span class="home-icon-v3">♟</span><b>PARTY</b><small>4 + 2 + 4</small></button><button class="home-menu-card-v3 soul" type="button" disabled><span class="home-icon-v3">◎</span><b>SOUL</b><small>FUSION</small></button><button class="home-menu-card-v3 arena" type="button" disabled><span class="home-icon-v3">♛</span><b>ARENA</b><small>RANK BATTLE</small></button></div></div>`;
  $('#seedBtn').onclick=()=>{seedDemo();render();};
}

function renderHome(root){
  root.className='screen home-screen-v3';
  const c=currentParty(),avg=c.length?Math.round(c.reduce((n,x)=>n+x.level,0)/c.length):0,masterCount=state.owned.reduce((n,x)=>n+(x.records||[]).filter(r=>r.level>=70).length,0);
  const cur=state.story.current,resume=!!state.story.resume,mission=state.story.roseUnlocked?'薔薇の国 / LAST DUNGEON':`${esc(cur.area)} ${cur.floor}F / AREA ${cur.areaNo}`;
  const stage=c.slice(0,4).map((inst,i)=>{const m=monsterDef(inst);return `<div class="home-monster-v3">${stageArtMarkup(m)}<b>${esc(inst.name)} / Lv${inst.level}</b></div>`;}).join('');
  root.innerHTML=`<div class="home-mission-v3"><span><small>CURRENT ADVENTURE</small><b>${mission}</b></span><em>${resume?'RESUME':`S${cur.season}`}</em></div><div class="home-stage-v3">${sceneBgMarkup('home')}<div class="home-stage-shadow-v3"></div><div class="home-party-v3">${stage||`<div class="home-monster-v3">${stageArtMarkup(monsterByName.get('モブスライム'))}<b>PARTY EMPTY</b></div>`}</div></div><div class="home-meta-v3"><span>OWNED ${state.owned.length}</span><span>AVG Lv${avg}</span><span>MASTER ${masterCount}</span><span>${VERSION}</span></div><div class="home-ui-v3"><button class="home-primary-v3" data-go="story" type="button"><span class="home-icon-v3">⚔</span><span><b>${resume?'冒険再開':'STORY / 冒険'}</b><small>SEASON 1–10　${mission}</small></span><strong>›</strong></button><div class="home-grid-v3"><button class="home-menu-card-v3" data-go="party" type="button"><span class="home-icon-v3">♟</span><b>PARTY</b><small>4 + 2 + 4</small></button><button class="home-menu-card-v3" data-go="monsters" type="button"><span class="home-icon-v3">◉</span><b>MONSTERS</b><small>${state.owned.length} OWNED</small></button><button class="home-menu-card-v3 soul" data-go="soul" type="button"><span class="home-icon-v3">◎</span><b>SOUL LAB</b><small>RECORD / FUSION</small></button><button class="home-menu-card-v3 arena" data-go="arena" type="button"><span class="home-icon-v3">♛</span><b>ARENA</b><small>${esc(state.arena.currentRank||'F')} RANK</small></button></div></div>`;
}
function systemModal(){showModal('SYSTEM',`<section class="panel"><h3>現在のCORE仕様</h3><p class="panel-note" style="margin-top:7px">探索内容・MOBランク化・ショップ経済は未確定のため、本ビルドでは最終仕様として固定していません。</p></section><div class="button-row"><button class="ghost-btn" id="grantTest">テストSOUL追加</button><button class="danger-btn" id="resetSave">セーブ初期化</button></div>`);$('#grantTest').onclick=()=>{['モブフレイム','モブブリザード','モブホーク','ミラモブ'].forEach(n=>{if(monsterByName.has(n))addSoul(n)});save();toast('テストSOULを追加しました');closeModal();};$('#resetSave').onclick=()=>{if(confirm('MOB MONSTERS COREのセーブを初期化しますか？')){localStorage.removeItem(SAVE_KEY);state=defaultState();closeModal();render();}};}

/* ===== STATS / RECORD ===== */
const rankMul={F:.75,E:.90,D:1.05,C:1.20,B:1.38,A:1.60,S:1.90,SS:2.15,MOB:2.45};
const roleMods={
 '守護者':{hp:1.15,def:1.30,spd:.85},'パワームーバー':{hp:1.08,atk:1.28,spd:.86},'魔法使い':{mp:1.25,mag:1.28,mnd:1.08},
 'ヘッドスピナー':{mp:1.22,mag:1.25,mnd:1.12},'疾走':{hp:.92,spd:1.28},'フットワーカー':{atk:1.08,spd:1.24},
 'フリーズ':{mp:1.15,mag:1.10,mnd:1.18},'JUDGE':{mag:1.12,mnd:1.08},'IGL':{hp:1.08,def:1.08,mnd:1.08},
 'BBOY':{hp:1.08,atk:1.08,def:1.06},'戦士':{hp:1.07,atk:1.14},'回復術':{mp:1.18,mag:1.12,mnd:1.18},'MC':{mp:1.12,mag:1.16},
 'DJ':{spd:1.08,mnd:1.12},'トップロッカー':{hp:1.04,atk:1.04,def:1.04,mag:1.04,mnd:1.04,spd:1.04},
 'トリック&コンボ':{atk:1.05,mag:1.05,spd:1.08}
};
function recordBonuses(inst){const out={hp:0,mp:0,atk:0,def:0,spd:0,mag:0,mnd:0,crit:0,magicCrit:0,damage:0,elementDamage:{},statusResist:{},elementResist:{}};
  for(const rr of inst.records||[]){const def=recordByName.get(rr.name);if(!def)continue;for(const ms of def.milestones||[]){if(ms.level>rr.level)continue;const t=ms.reward||'';let m;const statMap={HP:'hp',MP:'mp',ATK:'atk',DEF:'def',SPD:'spd',MAG:'mag',MND:'mnd',MENTAL:'mnd'};for(const [label,key] of Object.entries(statMap)){const re=new RegExp(label+'\\+(\\d+(?:\\.\\d+)?)','g');while((m=re.exec(t)))out[key]+=Number(m[1]);}if((m=t.match(/全基礎ステータス\+(\d+(?:\.\d+)?)/)))for(const k of ['atk','def','spd','mag','mnd'])out[k]+=Number(m[1]);if((m=t.match(/会心率\+(\d+(?:\.\d+)?)%/)))out.crit+=Number(m[1])/100;if((m=t.match(/魔法会心率\+(\d+(?:\.\d+)?)%/)))out.magicCrit+=Number(m[1])/100;if((m=t.match(/与ダメージ\+(\d+(?:\.\d+)?)%/)))out.damage+=Number(m[1])/100;for(const a of attrList){if((m=t.match(new RegExp(a+'属性(?:技)?(?:威力|与ダメージ)\\+(\\d+(?:\\.\\d+)?)%'))))out.elementDamage[a]=(out.elementDamage[a]||0)+Number(m[1])/100;if((m=t.match(new RegExp(a+'(?:属性)?耐性\\+(\\d+(?:\\.\\d+)?)%'))))out.elementResist[a]=(out.elementResist[a]||0)+Number(m[1])/100;}}
    }
  return out;
}
function monsterStats(inst){const m=monsterDef(inst),lv=clamp(inst.level,1,99),rm=rankMul[m.rank]||1,role=roleMods[m.recordType]||{},src=m.sourceMods||{};const B={hp:70+lv*12,mp:18+lv*1.55,atk:12+lv*2.05,mag:12+lv*2.0,def:10+lv*1.55,mnd:10+lv*1.55,spd:10+lv*1.35};const rb=recordBonuses(inst);for(const k of Object.keys(B))B[k]*=rm*(role[k]||1)*(Number(src[k==='mnd'?'res':k])||1);for(const k of ['hp','mp','atk','mag','def','mnd','spd'])B[k]+=rb[k]||0;const ps=m.passives||[];if(ps.includes('タフボディ'))B.hp*=1.15;if(ps.includes('ハードボディ'))B.def*=1.15;if(ps.includes('マジックボディ'))B.mag*=1.15;if(ps.includes('スピードボディ'))B.spd*=1.15;if(ps.includes('ソウルボディ'))B.mnd*=1.15;if(ps.includes('攻撃本能'))B.atk*=1.15;if(ps.includes('メタルボディ')){B.hp*=.28;B.def*=2.6;B.mnd*=1.7;}for(const k of Object.keys(B))B[k]=Math.max(1,Math.round(B[k]));return B;}
function nextMonsterExp(lv){return Math.round(30+8*lv+1.6*lv*lv)}
function nextRecordExp(lv){return Math.round(20+5*lv+1.2*lv*lv)}
function gainMonsterExp(inst,amount){if(inst.level>=99)return 0;let ups=0;inst.exp+=(amount||0);while(inst.level<99&&inst.exp>=nextMonsterExp(inst.level)){inst.exp-=nextMonsterExp(inst.level);inst.level++;ups++;}if(inst.level>=99)inst.exp=0;return ups;}
function activeRecord(inst){return(inst.records||[]).find(r=>r.name===inst.activeRecord)||(inst.records||[])[0]||null;}
function gainRecordExp(inst,amount){const r=activeRecord(inst);if(!r||r.level>=70)return 0;let ups=0;r.exp=(r.exp||0)+(amount||0);while(r.level<70&&r.exp>=nextRecordExp(r.level)){r.exp-=nextRecordExp(r.level);r.level++;ups++;}if(r.level>=70)r.exp=0;return ups;}
function learnedSkills(inst){const out=[];const seen=new Set();for(const rr of inst.records||[]){const rd=recordByName.get(rr.name);if(!rd)continue;for(const ms of rd.milestones||[]){if(ms.level<=rr.level&&ms.type==='SKILL'&&ms.reward&&!seen.has(ms.reward)){seen.add(ms.reward);out.push(ms.reward);}}}return out;}
function resistanceOf(name){return D.resistances[name]||{element:Object.fromEntries(attrList.map(a=>[a,'C'])),status:{毒:'C',やけど:'C',マヒ:'C',眠り:'C',ひるみ:'C',混乱:'C'}};}

/* ===== PARTY / MONSTERS ===== */
function renderParty(root){
  root.className='screen party-screen-v3';
  root.innerHTML=`<section class="formation-hero-v3"><small>MONSTER FORMATION / 10</small><h1>PARTY</h1><p>MAIN 4体が前線。SUPER SUB 2体は自動援護、SUB 4体は交代要員。カード全体をタップして入れ替えます。</p></section><div id="partyZonesV3"></div>`;
  const z=$('#partyZonesV3');
  for(const group of [{name:'MAIN',from:0,to:4,cls:'main',note:'FRONT / 戦闘開始'},{name:'SUPER SUB',from:4,to:6,cls:'super',note:'AUTO SUPPORT / 2～5TURN'},{name:'SUB',from:6,to:10,cls:'reserve',note:'RESERVE / 交代'}]){
    let h=`<section class="formation-group-v3"><div class="formation-group-head-v3"><b>${group.name}</b><small>${group.note}</small></div><div class="formation-grid-v3 ${group.cls}">`;
    for(let i=group.from;i<group.to;i++){
      const inst=ownedByUid(state.party[i]),m=monsterDef(inst);
      if(inst&&m)h+=`<button class="formation-slot-v3 ${group.cls}" data-party-slot="${i}" type="button">${slotArtMarkup(m)}<span class="slot-copy-v3"><small>${group.name} ${i-group.from+1} / ${m.rank} RANK</small><h3>${esc(inst.name)}</h3><p>Lv${inst.level}<br>${esc(inst.activeRecord||'-')}<br>${esc((m.passives||[]).slice(0,2).join('・'))}</p></span><span class="slot-number-v3">TAP TO CHANGE</span></button>`;
      else h+=`<button class="formation-slot-v3 ${group.cls} empty-v3" data-party-slot="${i}" type="button"><span><b>＋</b><small>${group.name} ${i-group.from+1}</small></span></button>`;
    }
    h+='</div></section>';z.insertAdjacentHTML('beforeend',h);
  }
  $$('[data-party-slot]').forEach(b=>b.onclick=()=>openPartyPicker(Number(b.dataset.partySlot)));
}
function openPartyPicker(index){partyReplaceIndex=index;const current=state.party[index];const rows=state.owned.map(inst=>{const m=monsterDef(inst),pi=state.party.indexOf(inst.uid);return `<button class="row-btn" data-pick-owned="${inst.uid}">${avatarMarkup(m)}<span class="grow"><b>${esc(inst.name)} / Lv${inst.level}</b><small>${pi>=0?`${roleLabel(pi)} ${pi+1}`:'未編成'} / ${esc((m.passives||[]).join('・'))}</small></span><strong>${m.rank}</strong></button>`;}).join('');showModal(`SLOT ${index+1} 入替`,`<div class="list">${rows}</div>`);$$('[data-pick-owned]').forEach(b=>b.onclick=()=>{const uid=b.dataset.pickOwned,other=state.party.indexOf(uid),old=state.party[index];if(other>=0){state.party[other]=old;state.party[index]=uid;}else state.party[index]=uid;state.party=state.party.filter(Boolean).slice(0,10);save();closeModal();renderParty($('#screen'));});}
function renderMonsterList(root){
  root.className='screen monsters-screen-v3';
  root.innerHTML=`<div class="collection-header-v3"><div><small>MONSTER COLLECTION</small><h1>MONSTERS</h1></div><span class="pill">${state.owned.length} OWNED</span></div><div class="tabs">${D.rankOrder.map(r=>`<button data-filter-rank="${r}">${r}</button>`).join('')}<button data-filter-rank="ALL" class="active">ALL</button></div><div id="monsterListV3" class="monster-grid-v3"></div>`;
  let filter='ALL';
  const draw=()=>{const host=$('#monsterListV3');host.innerHTML=state.owned.filter(i=>filter==='ALL'||monsterDef(i).rank===filter).sort((a,b)=>b.level-a.level||monsterDef(a).no-monsterDef(b).no).map(inst=>{const m=monsterDef(inst);return `<button class="monster-card-v3" data-monster-detail="${inst.uid}" type="button"><span class="${rankClass(m.rank)}">${m.rank}</span>${cardArtMarkup(m)}<span class="monster-card-copy-v3"><h3>${esc(inst.name)}</h3><p>${esc(m.species)} / ${esc(m.attribute)} / No.${m.no}</p><strong>Lv${inst.level}　${esc(inst.activeRecord||'-')}</strong></span></button>`;}).join('')||'<section class="panel"><p class="panel-note">該当モンスターはいません。</p></section>';$$('[data-monster-detail]').forEach(b=>b.onclick=()=>openMonsterDetail(b.dataset.monsterDetail));};
  $$('[data-filter-rank]').forEach(b=>b.onclick=()=>{filter=b.dataset.filterRank;$$('[data-filter-rank]').forEach(x=>x.classList.toggle('active',x===b));draw();});draw();
}
function monsterRow(inst){const m=monsterDef(inst),st=monsterStats(inst),ar=activeRecord(inst);return `<button class="row-btn" data-monster-detail="${inst.uid}">${avatarMarkup(m)}<span class="grow"><b>${esc(inst.name)} / Lv${inst.level}</b><span class="monster-meta-line">${monsterTags(m)}<span class="tag">HP ${st.hp}</span><span class="tag">ATK ${st.atk}</span></span><small>RECORD ${ar?`${esc(ar.name)} Lv${ar.level}`:'なし'} / ${esc((m.passives||[]).join('・'))}</small></span><strong class="${rankClass(m.rank)}">${m.rank}</strong></button>`;}
function openMonsterDetail(id){
  const inst=ownedByUid(id);if(!inst)return;const m=monsterDef(inst),st=monsterStats(inst),res=resistanceOf(m.name),skills=learnedSkills(inst);
  const stats=[['HP',st.hp],['MP',st.mp],['ATK',st.atk],['DEF',st.def],['SPD',st.spd],['MAG',st.mag],['MND',st.mnd]];
  const maxStat=Math.max(...stats.map(x=>x[1]));
  const passive=(m.passives||[]).map(x=>{const pd=passiveByName.get(x);return `<article class="dossier-passive-v4"><span>PASSIVE</span><b>${esc(x)}</b><p>${esc(pd?.['効果']||'固有パッシブ')}</p></article>`}).join('');
  const recs=(inst.records||[]).map(r=>{const rd=recordByName.get(r.name),need=r.level<70?nextRecordExp(r.level):0,pct=r.level>=70?100:Math.min(100,(r.exp||0)/need*100);return `<button class="dossier-record-v4 ${inst.activeRecord===r.name?'active':''}" data-active-record="${esc(r.name)}" type="button"><span class="record-disk-v4">R</span><span><small>${inst.activeRecord===r.name?'ACTIVE RECORD':'SOUL RECORD'}</small><b>${esc(r.name)}</b><em>${esc(rd?.category||'')} / Lv${r.level}${r.level>=70?' MASTER':''}</em><i><u style="width:${pct}%"></u></i></span><strong>${r.level>=70?'★':'›'}</strong></button>`;}).join('');
  const elem=attrList.map(a=>`<span class="res-chip-v4"><small>${a}</small><b class="grade-${res.element?.[a]||'C'}">${res.element?.[a]||'C'}</b></span>`).join('');
  const sts=Object.keys(gradeToStatusKey).map(a=>`<span class="res-chip-v4"><small>${a}</small><b class="grade-${res.status?.[a]||'C'}">${res.status?.[a]||'C'}</b></span>`).join('');
  showModal(inst.name,`<div class="monster-dossier-v4"><section class="dossier-stage-v4"><div class="dossier-rank-v4 ${rankClass(m.rank)}"><small>RANK</small><b>${m.rank}</b></div>${stageArtMarkup(m,'dossier-art-v4')}<div class="dossier-title-v4"><small>MONSTER No.${String(m.no||'').padStart(3,'0')} / ${esc(m.species)} / ${esc(m.attribute)}</small><h2>${esc(inst.name)}</h2><p>LEVEL <b>${inst.level}</b>　${esc(inst.activeRecord||'NO RECORD')}</p></div></section><section class="dossier-stats-v4">${stats.map(([k,v])=>`<div><span><small>${k}</small><b>${v}</b></span><i><u style="width:${Math.max(8,v/maxStat*100)}%"></u></i></div>`).join('')}</section><section class="dossier-section-v4"><header><small>UNIQUE ABILITY</small><h3>PASSIVE</h3></header><div class="dossier-passive-grid-v4">${passive||'<p>なし</p>'}</div></section><section class="dossier-section-v4"><header><small>GROWTH ROUTE</small><h3>SOUL RECORD</h3></header>${recs||'<p class="panel-note">RECORDなし</p>'}</section><section class="dossier-section-v4"><header><small>BATTLE DATA</small><h3>RESISTANCE</h3></header><div class="res-row-v4"><b>ELEMENT</b>${elem}</div><div class="res-row-v4"><b>STATUS</b>${sts}</div></section><section class="dossier-section-v4"><header><small>LEARNED ACTION</small><h3>SKILLS <em>${skills.length}</em></h3></header><div class="skill-chip-grid-v4">${skills.length?skills.map(x=>`<span><b>${esc(x)}</b><small>${esc(describeSkill(x,inst))}</small></span>`).join(''):'<p class="panel-note">まだ技を習得していません。</p>'}</div></section><button class="danger-btn dossier-convert-v4" id="toSoulBtn" ${state.party.includes(inst.uid)?'disabled':''}>このモンスターをSOULへ戻す</button></div>`);
  $$('[data-active-record]').forEach(b=>b.onclick=()=>{inst.activeRecord=b.dataset.activeRecord;save();closeModal();openMonsterDetail(id);});
  $('#toSoulBtn').onclick=()=>{if(state.party.includes(inst.uid))return;if(!confirm(`${inst.name}をSOULへ戻しますか？`))return;addSoul(inst.name,{source:'converted',records:(inst.records||[]).map(r=>({name:r.name,level:r.level})),passives:[...m.passives],lineage:[...(inst.lineage||[])]});state.owned=state.owned.filter(x=>x.uid!==inst.uid);save();closeModal();render();toast('SOULへ変換しました');};
}

/* ===== STORY ===== */
function seasonDef(n){return D.seasons.find(s=>s.season===n)}
function seasonUnlocked(n){if(n===1)return true;if(n<=5)return !!state.story.completedSeasons[n-1];if(n===6)return !!state.story.completedSeasons[5];return !!state.story.completedSeasons[n-1];}
function areaKey(season,area){return `S${season}|${area}`}
function nodeKey(season,area,floor,areaNo){return `${areaKey(season,area)}|F${floor}|A${areaNo}`}
function nodesForArea(season,area){const loop=seasonDef(season)?.loop||1,out=[];const maxF=loop===1?2:4;for(let f=1;f<=maxF;f++)for(let a=1;a<=4;a++)out.push({season,area,floor:f,areaNo:a,pass:loop===2&&f<=2,boss:(loop===1&&f===2&&a===4)||(loop===2&&f===4&&a===4)});return out;}
function areaCompleted(season,area){return !!state.story.completedAreas[areaKey(season,area)]}
function firstIncompleteNode(season,area){return nodesForArea(season,area).find(n=>!state.story.completedNodes[nodeKey(n.season,n.area,n.floor,n.areaNo)])||null;}
function setCurrentNode(n){if(n)state.story.current={season:n.season,area:n.area,floor:n.floor,areaNo:n.areaNo};}
function firstAvailableStoryNode(){for(const s of D.seasons){if(!seasonUnlocked(s.season))break;for(const a of s.areas){if(!areaCompleted(s.season,a)){return firstIncompleteNode(s.season,a);}}}return null;}
function renderStory(root){
  if(firstAvailableStoryNode()&&!state.story.resume)setCurrentNode(firstAvailableStoryNode());
  const cur=state.story.current;
  root.className='screen story-screen-v3';
  root.innerHTML=`<section class="page-scene-v3 story">${sceneBgMarkup('floor',cur.area,cur.floor)}<div class="page-scene-badge-v3"><small>CURRENT</small><b>S${cur.season}</b></div><div class="page-scene-copy-v3"><small>STORY / SEASON 1–10</small><h1>${esc(cur.area)}</h1><p>${cur.floor}F / AREA ${cur.areaNo}　${state.story.resume?'冒険地点を保持中':'新しい冒険を開始できます'}</p></div></section><div class="section-head"><div><small>SEASON ROAD</small><h2>ADVENTURE</h2></div><span class="pill">${state.story.roseUnlocked?'ROSE OPEN':`LOOP ${seasonDef(cur.season)?.loop||1}`}</span></div><div class="season-rail-v3">${D.seasons.map(s=>{const un=seasonUnlocked(s.season),current=s.season===cur.season,done=!!state.story.completedSeasons[s.season];return `<button class="season-chip-v3 ${current?'current':''}" data-season-focus="${s.season}" ${un?'':'disabled'} type="button"><small>${done?'CLEAR':'SEASON'}</small><b>SEASON ${s.season}</b><small>${s.areas.join(' / ')}</small></button>`;}).join('')}</div><div id="storyCurrent" class="story-current-shell-v3"></div>`;
  renderStoryCurrent($('#storyCurrent'));
  $$('[data-season-focus]').forEach(b=>b.onclick=()=>{const sn=Number(b.dataset.seasonFocus),s=seasonDef(sn);if(!s||!seasonUnlocked(sn))return;const area=s.areas.find(a=>!areaCompleted(sn,a))||s.areas[0],x=firstIncompleteNode(sn,area);if(x){setCurrentNode(x);state.story.resume=true;save();renderStory($('#screen'));}});
}
function seasonCard(s,cur){const unlocked=seasonUnlocked(s.season),done=!!state.story.completedSeasons[s.season],current=cur.season===s.season;return `<section class="season-card ${unlocked?'':'locked'} ${current?'current-season':''}"><div class="season-head"><b>SEASON ${s.season}</b><span>${s.loop===1?'1ST LOOP':'2ND LOOP'} ${done?' / CLEAR':''}</span></div><div class="area-chip-wrap">${s.areas.map(a=>{const d=areaCompleted(s.season,a),c=cur.season===s.season&&cur.area===a&&!d;return `<button class="area-chip ${d?'done':''} ${c?'current':''}" data-story-area="${s.season}::${esc(a)}" ${!unlocked||d?'disabled':''}>${esc(a)}${d?' ✓':''}</button>`;}).join('')}</div></section>`;}
function renderStoryCurrent(host){
  const c=state.story.current,sn=seasonDef(c.season);if(!sn||areaCompleted(c.season,c.area)){host.innerHTML='';return;}const loop=sn.loop,n=firstIncompleteNode(c.season,c.area)||{...c};setCurrentNode(n);
  const nodes=nodesForArea(c.season,c.area);const done=nodes.filter(x=>state.story.completedNodes[nodeKey(x.season,x.area,x.floor,x.areaNo)]).length;
  const floorRows=[];for(let f=1;f<=(loop===1?2:4);f++){
    const ns=nodes.filter(x=>x.floor===f);floorRows.push(`<section class="story-floor-v4 ${loop===2&&f<=2?'passed':''}"><header><span><small>FLOOR</small><b>${f}F</b></span><em>${loop===2&&f<=2?'PASSED':`AREA ${ns.filter(x=>state.story.completedNodes[nodeKey(x.season,x.area,x.floor,x.areaNo)]).length}/4`}</em></header><div class="story-node-line-v4">${ns.map(x=>{const key=nodeKey(x.season,x.area,x.floor,x.areaNo),isDone=!!state.story.completedNodes[key],current=x.floor===n.floor&&x.areaNo===n.areaNo;return `<span class="story-node-v4 ${isDone?'done':''} ${current?'current':''} ${x.boss?'boss':''}"><i>${x.boss?'B':x.areaNo}</i><small>${x.boss?'BOSS':`A${x.areaNo}`}</small></span>`}).join('<u class="story-link-v4"></u>')}</div></section>`)}
  host.innerHTML=`<section class="story-area-card-v4"><div class="story-area-art-v4"><span class="story-area-number-v4">${String(c.season).padStart(2,'0')}</span><div><small>SEASON ${c.season} / ${loop===1?'FIRST':'SECOND'} LOOP</small><h2>${esc(c.area)}</h2><p>${n.floor}F AREA ${n.areaNo}${n.boss?' / BOSS':''}</p></div><strong>${done}/${nodes.length}</strong></div><div class="story-route-v4">${floorRows.join('')}</div><div class="story-actions-v4"><button id="storyBattle" class="story-battle-btn-v4" type="button"><span>⚔</span><b>${n.boss?'BOSS BATTLE':'BATTLE'}</b><small>${esc(c.area)} ${n.floor}F / AREA ${n.areaNo}</small></button><button id="warpMaple" class="story-camp-btn-v4" type="button"><span>⌂</span><b>WARP MAPLE</b><small>現在地点を保存してHOMEへ</small></button></div></section>`;
  $('#storyBattle').onclick=()=>startStoryBattle();$('#warpMaple').onclick=()=>{state.story.resume={...state.story.current};save();go('home');toast('ワープメープルでHOMEへ帰還');};
}
function startStoryBattle(){
  let guard=0,n=null;
  while(guard++<10){const c=state.story.current;n=firstIncompleteNode(c.season,c.area)||{...c};if(!n?.pass)break;completeStoryNode(n);}
  if(!n)return toast('このエリアは攻略済みです');
  advanceStoryNode(n);
}
function advanceStoryNode(n){if(n.pass){completeStoryNode(n);renderStory($('#screen'));return;}const enemies=n.boss?[buildStoryBoss(n)]:buildStoryEncounter(n);startBattle({mode:'story',area:n.area,floor:n.floor,title:`${n.area} ${n.floor}F Area ${n.areaNo}${n.boss?' / BOSS':''}`,enemyRoster:enemies,useFullParty:true,soulDrop:true,onWin:()=>{completeStoryNode(n);},onLose:()=>{state.story.resume=true;save();}});}
function completeStoryNode(n){state.story.completedNodes[nodeKey(n.season,n.area,n.floor,n.areaNo)]=true;const next=firstIncompleteNode(n.season,n.area);if(next){setCurrentNode(next);}else{state.story.completedAreas[areaKey(n.season,n.area)]=true;const s=seasonDef(n.season);if(s.areas.every(a=>areaCompleted(n.season,a))){state.story.completedSeasons[n.season]=true;if(n.season===10)state.story.roseUnlocked=true;}const x=firstAvailableStoryNode();if(x)setCurrentNode(x);}state.story.resume=true;save();}
function areaPool(area,loop=1){return D.monsters.filter(m=>String(m.firstArea||'').startsWith(area)&&m.species!=='ボス'&&m.sourceCategory!=='event').filter(m=>loop===1?rankIndex(m.rank)<=5:rankIndex(m.rank)>=3);}
function targetRankForNode(n){const s=seasonDef(n.season),loop=s.loop,base=loop===1?(n.season-1)+(n.floor-1)+(n.areaNo>=3?1:0):4+(n.season-6)+(n.floor-3)+(n.areaNo>=3?1:0);return D.rankOrder[clamp(base,0,loop===1?5:7)];}
function levelForStoryNode(n){const loop=seasonDef(n.season).loop;if(loop===1)return clamp(2+(n.season-1)*10+(n.floor-1)*5+(n.areaNo-1)*2,1,58);return clamp(58+(n.season-6)*7+(n.floor-3)*6+(n.areaNo-1)*2,55,99);}
function buildStoryEncounter(n){let pool=areaPool(n.area,seasonDef(n.season).loop),tr=targetRankForNode(n);if(!pool.length)pool=D.monsters.filter(m=>m.species!=='ボス');pool=pool.sort((a,b)=>Math.abs(rankIndex(a.rank)-rankIndex(tr))-Math.abs(rankIndex(b.rank)-rankIndex(tr))||a.no-b.no).slice(0,Math.max(5,Math.min(18,pool.length)));const count=clamp(1+Math.floor((n.areaNo-1)/2),1,3),lv=levelForStoryNode(n);return Array.from({length:count},(_,i)=>({name:pick(pool).name,level:clamp(lv+rint(-2,2),1,99)}));}
function buildStoryBoss(n){const name=D.areaBoss[n.area]?.[String(seasonDef(n.season).loop)]||null,m=monsterByName.get(name)||D.monsters.filter(x=>x.species==='ボス').sort((a,b)=>rankIndex(b.rank)-rankIndex(a.rank))[0];return[{name:m.name,level:levelForStoryNode(n)+4}];}

/* ===== SOUL / FUSION / RECORD ===== */
function renderSoul(root){
  const total=Object.values(state.souls).reduce((n,a)=>n+(a?.length||0),0);
  root.className='screen soul-screen-v3';
  root.innerHTML=`<section class="page-scene-v3 soul">${sceneBgMarkup('soul')}<div class="page-scene-badge-v3"><small>SOUL</small><b>${total}</b></div><div class="page-scene-copy-v3"><small>SOUL / RECORD / FUSION</small><h1>SOUL LAB</h1><p>SOULを集め、RECORDを育て、正史の系譜をFUSIONでつなぐ。</p></div></section><div class="soul-tabs-v3"><button class="soul-tab-v3 active" data-soul-tab="inventory" type="button"><span>◎</span><b>SOUL</b><small>COLLECTION</small></button><button class="soul-tab-v3" data-soul-tab="record" type="button"><span>◫</span><b>RECORD</b><small>GROWTH</small></button><button class="soul-tab-v3" data-soul-tab="fusion" type="button"><span>◆</span><b>FUSION</b><small>CREATE</small></button></div><div id="soulBody"></div>`;
  let tab='inventory';const draw=()=>{if(tab==='inventory')renderSoulInventory($('#soulBody'));if(tab==='fusion')renderFusion($('#soulBody'));if(tab==='record')renderRecordLibrary($('#soulBody'));};
  $$('[data-soul-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.soulTab;$$('[data-soul-tab]').forEach(x=>x.classList.toggle('active',x===b));draw();});draw();
}
function renderSoulInventory(host){
  const rows=Object.entries(state.souls).filter(([,a])=>a?.length).sort((a,b)=>rankIndex(monsterByName.get(b[0])?.rank)-rankIndex(monsterByName.get(a[0])?.rank)||a[0].localeCompare(b[0],'ja'));
  const total=rows.reduce((n,[,a])=>n+a.length,0);
  host.innerHTML=`<section class="soul-bank-head-v4"><div><small>SOUL STORAGE</small><h2>SOUL BANK</h2><p>撃破・イベント・変換で獲得したSOUL。FUSIONの素材になります。</p></div><strong>${total}<small>SOUL</small></strong></section><section class="soul-boost-v4"><header><b>DROP BOOST</b><em>ACTIVE +${(state.soulBoost*100).toFixed(1)}pt</em></header><div>${D.soulBoostItems.map(it=>`<button data-use-boost="${it.id}" ${(state.inventory[it.id]||0)<=0?'disabled':''}><span>♪</span><b>${esc(it.name)}</b><small>+${it.add*100}% / ×${state.inventory[it.id]||0}</small></button>`).join('')}</div></section><section class="soul-rates-v4">${['F','C','A','S','SS','MOB'].map(r=>`<span><small>${r}</small><b>${((D.rankDropRates[r]||0)*100).toFixed((D.rankDropRates[r]||0)<.01?2:1)}%</b></span>`).join('')}</section><div class="soul-card-grid-v4">${rows.length?rows.map(([name,a])=>{const m=monsterByName.get(name),best=Math.max(...a.map(x=>Math.max(1,...(x.records||[]).map(r=>r.level||1))));return `<article class="soul-card-v4"><span class="${rankClass(m.rank)}">${m.rank}</span>${cardArtMarkup(m)}<div><small>${esc(m.species)} / ${esc(m.attribute)}</small><b>${esc(name)}</b><em>BEST RECORD Lv${best}</em></div><strong>×${a.length}</strong></article>`;}).join(''):'<section class="empty-stage-v4"><b>NO SOUL</b><small>STORYでモンスターを倒してSOULを集めよう</small></section>'}</div>`;
  $$('[data-use-boost]').forEach(b=>b.onclick=()=>{const id=b.dataset.useBoost,it=D.soulBoostItems.find(x=>x.id===id);if(!it||!(state.inventory[id]>0))return;state.inventory[id]--;state.soulBoost+=it.add;save();renderSoulInventory(host);toast(`SOULドロップ率 +${it.add*100}%`);});
}
function soulOptions(){return Object.entries(state.souls).filter(([,a])=>a?.length).map(([name,a])=>`<option value="${esc(name)}">${esc(name)} ×${a.length} / ${monsterByName.get(name)?.rank||'?'}</option>`).join('');}
function renderFusion(host){
  const opts=soulOptions();
  host.innerHTML=`<section class="fusion-lab-v4"><header><small>SOUL RECOMBINATION SYSTEM</small><h2>SOUL FUSION</h2><p>2つのSOULを選択。固定・SECRET・系譜FUSIONを通常判定より優先します。</p></header><div class="fusion-machine-v4"><label class="fusion-socket-v4"><span class="fusion-core-v4">A</span><b>SOUL A</b><select id="fusionA"><option value="">SELECT SOUL</option>${opts}</select></label><div class="fusion-reactor-v4"><i></i><b>×</b><i></i><small>FUSION</small></div><label class="fusion-socket-v4"><span class="fusion-core-v4">B</span><b>SOUL B</b><select id="fusionB"><option value="">SELECT SOUL</option>${opts}</select></label></div><button id="fusionSearch" class="fusion-scan-v4" type="button"><span>◇</span><b>FUSION SCAN</b><small>生成候補を解析</small></button><div class="fusion-rule-v4"><span><b>Lv1</b><small>融合後LEVEL</small></span><span><b>Lv30</b><small>RECORD継承候補</small></span><span><b>Lv70</b><small>RECORD MASTER</small></span><span><b>NO</b><small>PASSIVE通常継承</small></span></div></section><div id="fusionResults"></div>`;
  $('#fusionSearch').onclick=()=>{const a=$('#fusionA').value,b=$('#fusionB').value;if(!a||!b)return toast('SOULを2つ選んでください');if(a===b&&(state.souls[a]?.length||0)<2)return toast('同じSOULが2つ必要です');drawFusionResults(a,b,$('#fusionResults'));};
}
function soulHasLineage(s,tag){return !!s&&(s.lineage||[]).includes(tag);}
function recipeSoulPair(a,b,r){const A=state.souls[a]||[],B=state.souls[b]||[];if(!A.length||!B.length)return null;const req=String(r.requiredLineage||'').trim();for(let ia=0;ia<A.length;ia++)for(let ib=0;ib<B.length;ib++){if(a===b&&ia===ib)continue;const sa=A[ia],sb=B[ib];let ok=false;if(!req){ok=(r.a===a&&r.b===b)||(r.a===b&&r.b===a);}else if(req.includes(' + ')){const [x,y]=req.split(' + ').map(v=>v.trim());ok=(soulHasLineage(sa,x)&&soulHasLineage(sb,y))||(soulHasLineage(sa,y)&&soulHasLineage(sb,x));}else{const literalA=monsterByName.has(r.a)?r.a:null,literalB=monsterByName.has(r.b)?r.b:null;if(literalA)ok=(a===literalA&&soulHasLineage(sb,req))||(b===literalA&&soulHasLineage(sa,req));if(!ok&&literalB)ok=(a===literalB&&soulHasLineage(sb,req))||(b===literalB&&soulHasLineage(sa,req));}if(ok)return{ia,ib,sa,sb};}return null;}
function fixedFusionMatch(a,b,recipeNo=null){if(recipeNo!=null)return D.fixedFusions.find(r=>String(r.no)===String(recipeNo))||null;return D.fixedFusions.find(r=>recipeSoulPair(a,b,r));}
function recipeResults(r,a,b){if(monsterByName.has(r.result))return[r.result];if(r.result==='親Aまたは親B')return[a,b].filter(n=>monsterByName.has(n));if(r.result.includes(' または '))return r.result.split(' または ').map(x=>x.trim()).filter(n=>monsterByName.has(n));if(r.result.includes('四人衆4体'))return['モブミラカラミ','モブミラアース','モブミラナイト','モブミラタイム'].filter(n=>monsterByName.has(n));if(r.result.includes('四姉妹4体'))return['モブヘルリリス','モブキリンリリス','モブクフリリス','モブリヴァリリス'].filter(n=>monsterByName.has(n));return[];}
function fusionTargetRank(a,b){const ia=rankIndex(monsterByName.get(a)?.rank),ib=rankIndex(monsterByName.get(b)?.rank);return D.rankOrder[clamp(Math.round((ia+ib)/2)+1,0,7)];}
function hashPair(a,b,n){let h=2166136261;for(const c of [a,b,n].join('|')){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function fusionCandidates(a,b){if(a===b)return[{name:a,kind:'SAME',note:'同SOUL融合',recipeNo:''}];const fixed=fixedFusionMatch(a,b);if(fixed){const results=recipeResults(fixed,a,b);if(results.length)return results.map(n=>({name:n,kind:fixed.type||'FIXED',note:fixed.reason||fixed.method,recipeNo:fixed.no}));}const ma=monsterByName.get(a),mb=monsterByName.get(b),tr=fusionTargetRank(a,b),pool=D.monsters.filter(m=>m.rank===tr&&m.species!=='ボス');if(!pool.length)return[];const scored=pool.map(m=>{let s=0;if(m.species===ma.species)s+=4;if(m.species===mb.species)s+=4;if(m.attribute===ma.attribute)s+=3;if(m.attribute===mb.attribute)s+=3;if(String(m.firstArea).startsWith(String(ma.firstArea).replace('Ⅱ','')))s+=1;if(String(m.firstArea).startsWith(String(mb.firstArea).replace('Ⅱ','')))s+=1;s+=(hashPair(a,b,m.name)%1000)/10000;return{m,s};}).sort((x,y)=>y.s-x.s||x.m.no-y.m.no).slice(0,3);return scored.map((x,i)=>({name:x.m.name,kind:'NORMAL',note:`基本結果 ${tr} / 候補${i+1}`,recipeNo:''}));}
function drawFusionResults(a,b,host){
  const c=fusionCandidates(a,b);host.innerHTML=`<section class="fusion-result-zone-v4"><header><div><small>ANALYSIS COMPLETE</small><h2>FUSION RESULT</h2></div><em>${c.length} CANDIDATE</em></header><div class="fusion-result-grid-v4">${c.length?c.map((x,i)=>{const m=monsterByName.get(x.name);return `<button class="fusion-result-card-v4 ${i===0?'recommended':''}" data-fuse-result="${esc(x.name)}" data-recipe-no="${x.recipeNo||''}" type="button"><span class="fusion-rec-v4">${i===0?'RECOMMENDED':esc(x.kind)}</span>${stageArtMarkup(m,'fusion-result-art-v4')}<div><span class="${rankClass(m.rank)}">${m.rank}</span><small>${esc(m.species)} / ${esc(m.attribute)}</small><h3>${esc(x.name)}</h3><p>${esc(x.note)}</p></div><strong>FUSE ›</strong></button>`;}).join(''):'<div class="empty-stage-v4"><b>NO RESULT</b><small>現在のデータでは候補がありません。</small></div>'}</div></section>`;$$('[data-fuse-result]').forEach(btn=>btn.onclick=()=>executeFusion(a,b,btn.dataset.fuseResult,btn.dataset.recipeNo||null));
}
function takeSoulPairForRecipe(a,b,r){if(!r)return{sa:takeBestSoul(a),sb:takeBestSoul(b)};const pair=recipeSoulPair(a,b,r);if(!pair)return{sa:null,sb:null};if(a===b){const hi=Math.max(pair.ia,pair.ib),lo=Math.min(pair.ia,pair.ib),arr=state.souls[a];const sHi=arr.splice(hi,1)[0],sLo=arr.splice(lo,1)[0];return pair.ia>pair.ib?{sa:sHi,sb:sLo}:{sa:sLo,sb:sHi};}const sa=(state.souls[a]||[]).splice(pair.ia,1)[0],sb=(state.souls[b]||[]).splice(pair.ib,1)[0];return{sa,sb};}
function executeFusion(a,b,result,recipeNo=null){if(a===b&&(state.souls[a]?.length||0)<2)return toast('SOUL不足');if((state.souls[a]?.length||0)<1||(state.souls[b]?.length||0)<1)return toast('SOUL不足');const ff=recipeNo?fixedFusionMatch(a,b,recipeNo):null;if(ff&&!recipeSoulPair(a,b,ff))return toast('必要な系譜SOULがありません');if(!confirm(`${a} + ${b}\n→ ${result}\nSOULを消費して融合しますか？`))return;const pair=takeSoulPairForRecipe(a,b,ff),sa=pair.sa,sb=pair.sb;if(!sa||!sb)return toast('SOUL不足');const child=createInstance(result,1,false);const inherited=new Set(child.records.map(r=>r.name));for(const s of [sa,sb])for(const r of s.records||[])if((r.level||1)>=30&&!inherited.has(r.name)){child.records.push({name:r.name,level:1,exp:0});inherited.add(r.name);}for(const rf of D.recordFusions){const has=(s,n)=>(s.records||[]).some(r=>r.name===n&&(r.level||1)>=70);if((has(sa,rf.a)&&has(sb,rf.b))||(has(sa,rf.b)&&has(sb,rf.a))){if(!inherited.has(rf.result)){child.records.push({name:rf.result,level:1,exp:0});inherited.add(rf.result);}}}child.lineage=[...(sa.lineage||[]),...(sb.lineage||[])];if(ff?.grantLineage&&!child.lineage.includes(ff.grantLineage))child.lineage.push(ff.grantLineage);state.owned.push(child);save();const born=monsterByName(result);showModal('SOUL FUSION COMPLETE',`<section class="fusion-stage fusion-birth"><span class="fusion-orb">SOUL</span><div class="fusion-result-avatar">${born?avatarMarkup(born,'xl'):'<b>SOUL</b>'}</div><span class="eyebrow">NEW MONSTER</span><h2>${result}</h2><p>Lv1で誕生しました。継承条件を満たしたSOUL RECORDのみ引き継がれます。</p></section><button id="fusionDone" class="primary" type="button">SOUL LABへ</button>`);$('#fusionDone').onclick=()=>{closeModal();renderSoul($('#screen'));toast(`${result}が誕生！ Lv1`);};}
function renderRecordLibrary(host){
  const cat=collectionsBy(D.records,r=>r.category);host.innerHTML=`<section class="record-guide-v4"><span class="record-big-disk-v4">R</span><div><small>MONSTER GROWTH SYSTEM</small><h2>SOUL RECORD</h2><p>育成中RECORDを1つACTIVE化。Lv30でFUSION継承候補、Lv70でMASTER。</p></div></section>${Object.entries(cat).map(([k,arr])=>`<section class="record-category-v4"><header><div><small>RECORD CATEGORY</small><h3>${esc(k)}</h3></div><em>${arr.length}</em></header><div class="record-library-grid-v4">${arr.map((r,i)=>`<button class="record-library-v4" data-record-view="${esc(r.name)}" type="button"><span class="record-emblem-v4">${String(i+1).padStart(2,'0')}</span><span><small>${esc(r.attribute)} / ${esc(r.theme)}</small><b>${esc(r.name)}</b><em>10 MILESTONES / MASTER Lv70</em></span><strong>›</strong></button>`).join('')}</div></section>`).join('')}`;$$('[data-record-view]').forEach(b=>b.onclick=()=>openRecordView(b.dataset.recordView));
}
function collectionsBy(arr,fn){return arr.reduce((o,x)=>{const k=fn(x);(o[k]||(o[k]=[])).push(x);return o;},{});}
function openRecordView(name){
  const r=recordByName.get(name);if(!r)return;showModal(name,`<div class="record-detail-v4"><section class="record-detail-head-v4"><span class="record-big-disk-v4">R</span><div><small>SOUL RECORD / ${esc(r.category)}</small><h2>${esc(r.name)}</h2><p>${esc(r.theme)} / ${esc(r.attribute)}</p></div></section><div class="record-level-rule-v4"><span><b>30</b><small>INHERIT</small></span><i></i><span><b>70</b><small>MASTER</small></span></div><section class="record-timeline-v4">${(r.milestones||[]).map((m,i)=>`<article class="record-step-v4 ${m.type==='SKILL'?'skill':''}"><span><small>STEP ${String(i+1).padStart(2,'0')}</small><b>Lv${m.level}</b></span><i></i><div><small>${esc(m.type)}</small><b>${esc(m.reward)}</b></div></article>`).join('')}</section></div>`);
}

/* ===== ARENA ===== */
function arenaState(r){return state.arena.progress[r]||(state.arena.progress[r]={wins:0,cleared:false});}
function highestSeasonCleared(){let n=0;for(let i=1;i<=10;i++){if(state.story.completedSeasons[i])n=i;else break;}return n;}
function arenaUnlocked(r){if(r==='F')return true;const idx=D.arena.ranks.indexOf(r),prev=D.arena.ranks[idx-1];if(r==='MOB')return !!arenaState('SS').cleared;const req=D.arena.unlock[r]||0;return !!arenaState(prev).cleared&&highestSeasonCleared()>=req;}
function renderArena(root){
  root.className='screen arena-screen-v3';
  root.innerHTML=`<section class="page-scene-v3 arena">${sceneBgMarkup('arena')}<div class="page-scene-badge-v3"><small>RANK</small><b>${esc(state.arena.currentRank||'F')}</b></div><div class="page-scene-copy-v3"><small>RANKED MONSTER BATTLE</small><h1>ARENA</h1><p>4 vs 4を3勝して昇格戦へ。昇格戦は10 vs 10 CREW BATTLE。</p></div></section><div class="section-head"><div><small>RANK ROAD</small><h2>CHALLENGE</h2></div><span class="pill">STORY S${highestSeasonCleared()}</span></div><div>${D.arena.ranks.map(r=>arenaRankCard(r)).join('')}</div>`;
  $$('[data-arena-fight]').forEach(b=>b.onclick=()=>startArena(b.dataset.arenaFight,b.dataset.kind));
}
function arenaRankCard(r){
  const st=arenaState(r),un=arenaUnlocked(r),isMob=r==='MOB',promotion=!isMob&&st.wins>=3&&!st.cleared,idx=D.arena.ranks.indexOf(r);
  let cond=r==='F'?'最初から':r==='MOB'?'SSまで全闘技場クリア':r==='SS'?'Sクリア + SEASON 10':`${D.arena.ranks[idx-1]}クリア${(D.arena.unlock[r]||0)?` + SEASON ${D.arena.unlock[r]}`:''}`;
  return `<article class="arena-rank-v4 ${un?'unlocked':'locked'} ${st.cleared?'cleared':''} ${promotion?'promotion':''}"><div class="arena-rank-medal-v4 ${rankClass(r)}"><small>RANK</small><b>${r}</b></div><div class="arena-rank-copy-v4"><span>${st.cleared?'COMPLETE':promotion?'PROMOTION READY':un?'CHALLENGE':'LOCKED'}</span><h3>${r} RANK</h3><p>${cond}</p>${!isMob?`<div class="arena-win-pips-v4">${[0,1,2].map(i=>`<i class="${i<st.wins?'on':''}"></i>`).join('')}<small>NORMAL WIN ${Math.min(3,st.wins)}/3</small></div>`:'<div class="arena-win-pips-v4 final"><small>FINAL CHALLENGE</small></div>'}</div>${un&&!st.cleared?`<button class="arena-fight-v4" data-arena-fight="${r}" data-kind="${promotion?'promotion':'normal'}" type="button"><small>${promotion?'10 vs 10':'4 vs 4'}</small><b>${promotion?'CREW BATTLE':'BATTLE'}</b><span>›</span></button>`:`<span class="arena-state-v4">${st.cleared?'✓':'🔒'}</span>`}</article>`;
}
function rankPool(r){const idx=rankIndex(r);return D.monsters.filter(m=>m.species!=='ボス'&&Math.abs(rankIndex(m.rank)-idx)<=1);}
function startArena(r,kind){if(!arenaUnlocked(r))return;const crew=kind==='promotion',count=crew?10:4,pool=rankPool(r),player=crew?state.party.slice(0,10):state.party.slice(0,4);if(player.map(ownedByUid).filter(Boolean).length<(crew?10:4))return toast(`${crew?'10':'4'}体編成してください`);const levelBase=clamp(6+rankIndex(r)*12,5,99),enemies=Array.from({length:count},()=>({name:pick(pool).name,level:clamp(levelBase+rint(-3,3),1,99)}));startBattle({mode:'arena',background:AM.arena||'back/metal.png',title:`ARENA ${r} / ${crew?'CREW BATTLE':'4 vs 4'}`,enemyRoster:enemies,useFullParty:crew,playerParty:player,soulDrop:false,onWin:()=>{const st=arenaState(r);if(r==='MOB'){st.cleared=true;}else if(crew){st.cleared=true;}else st.wins=Math.min(3,st.wins+1);save();},onLose:()=>{save();}});}

/* ===== SKILLS ===== */
function describeSkill(name,inst){const s=skillDef(name,inst);return `${s.element} / ${s.target==='all'?'全体':'単体'} / MP ${s.cost}${s.status?` / ${statusJa[s.status]||s.status}`:''}${s.heal?' / 回復':''}`;}
function skillDef(name,inst){const raw=D.skills[name]||{name,element:'無',info:''};if(raw._normalized)return raw;let element=raw.element||'無',target=raw.target||'single',kind=raw.kind||'signature',power=Number(raw.power)||0,cost=Number(raw.cost)||0,info=raw.info||'';if(/全体/.test(info))target='all';let heal=/回復/.test(info),status='';for(const [jp,key] of Object.entries(gradeToStatusKey))if(info.includes(jp)){status=key;break;}let statusChance=.20,m=info.match(/(\d+)%[^。]*(毒|やけど|マヒ|眠り|ひるみ|混乱)/);if(m)statusChance=Number(m[1])/100;if(!power){if(/極大/.test(info))power=2.65;else if(/大/.test(info))power=2.10;else if(/中/.test(info))power=1.60;else if(/小/.test(info))power=1.15;else if(heal&&!/ダメージ/.test(info))power=0;else power=1.75;}if(!cost)cost=Math.max(4,Math.round(5+power*8+(target==='all'?4:0)));const type=kind==='magic'?'magic':kind==='slash'||kind==='physical'||kind==='blow'?'physical':(inst&&monsterStats(inst).mag>=monsterStats(inst).atk?'magic':'physical');const frames=(Array.isArray(raw.frames)&&raw.frames.length?raw.frames:Array.isArray(raw.attackFrames)&&raw.attackFrames.length?raw.attackFrames:(AM.skillFrames?AM.skillFrames(name,element):[]));return{name,element,target,kind,type,power,cost,heal,status,statusChance,info,hits:Number(raw.hits)||1,frames,_normalized:true};}

/* ===== BATTLE ENGINE ===== */
function buildRuntimeAlly(inst,slot){const m=monsterDef(inst),st=monsterStats(inst);return{side:'ally',uid:inst.uid,inst,m,name:m.name,level:inst.level,slot,hasBeenMain:slot<4,base:{...st},maxHp:st.hp,maxMp:st.mp,hp:st.hp,mp:st.mp,atk:st.atk,mag:st.mag,def:st.def,mnd:st.mnd,spd:st.spd,status:{},guard:0,pinchUsed:false,unyieldingUsed:false,nextSuper:rint(2,5),buff:{atk:0,def:0,mag:0,mnd:0,spd:0,turns:0}};}
function buildRuntimeEnemy(row,slot){const m=monsterByName.get(row.name),inst=createInstance(m.name,clamp(row.level||m.sourceLevelMin||5,1,99),false);const st=monsterStats(inst),scale=m.species==='ボス'?1.35:1;return{side:'enemy',uid:'e_'+uid(),inst,m,name:m.name,level:inst.level,slot,base:{...st},maxHp:Math.round(st.hp*scale),maxMp:st.mp,hp:Math.round(st.hp*scale),mp:st.mp,atk:Math.round(st.atk*(m.species==='ボス'?1.12:1)),mag:Math.round(st.mag*(m.species==='ボス'?1.12:1)),def:st.def,mnd:st.mnd,spd:st.spd,status:{},guard:0,pinchUsed:false,unyieldingUsed:false,buff:{atk:0,def:0,mag:0,mnd:0,spd:0,turns:0}};}
function startBattle(cfg){if(battle)return;cfg={...cfg,area:cfg.area||(cfg.mode==='story'?state.story.current.area:''),floor:cfg.floor||(cfg.mode==='story'?state.story.current.floor:1)};const pids=cfg.playerParty||state.party.slice(0,cfg.useFullParty?10:4),allies=pids.map(ownedByUid).filter(Boolean).map((x,i)=>buildRuntimeAlly(x,i));const enemies=cfg.enemyRoster.map((x,i)=>buildRuntimeEnemy(x,i));battle={...cfg,allies,enemies,round:0,log:[],activeActor:null,choiceResolve:null,choiceLock:false,targetResolve:null,targetSide:null,finished:false,defeated:[],fled:false};applyOpeningPassives();state.screen='battle';$('#app')?.classList.add('battle-mode');updateTop();renderBattle();runBattle();}
function activeAllies(){return battle.allies.filter(a=>a.slot<4&&a.hp>0)}
function superAllies(){return battle.allies.filter(a=>a.slot>=4&&a.slot<6&&a.hp>0)}
function reserveAllies(){return battle.allies.filter(a=>a.slot>=6&&a.hp>0)}
function livingAllies(){return battle.allies.filter(a=>a.hp>0)}
function activeEnemies(){return battle.enemies.filter(e=>e.slot<4&&e.hp>0)}
function reserveEnemies(){return battle.enemies.filter(e=>e.slot>=4&&e.hp>0)}
function logBattle(msg){battle.log.push(msg);if(battle.log.length>80)battle.log.shift();renderBattle();const el=$('.battle-log');if(el)el.scrollTop=el.scrollHeight;}
function applyOpeningPassives(){for(const side of [battle.allies,battle.enemies]){const leaders=side.filter(x=>x.m.passives.includes('リーダーシップ')&&x.hp>0);if(leaders.length){for(const x of side){x.atk=Math.round(x.atk*1.03);x.def=Math.round(x.def*1.03);} }}}
async function runBattle(){logBattle(`▶ ${battle.title}`);while(!battle.finished){refillEnemyFront();await ensureAllyFront();if(!activeAllies().length){return finishBattle(false);}if(!activeEnemies().length&&!reserveEnemies().length){return finishBattle(true);}battle.round++;logBattle(`— TURN ${battle.round} —`);const actors=[...activeAllies(),...activeEnemies()].sort((a,b)=>effectiveSpeed(b)-effectiveSpeed(a)||Math.random()-.5);for(const actor of actors){if(battle.finished)break;if(actor.hp<=0)continue;if(actor.side==='ally'&&actor.slot>=4)continue;if(actor.side==='enemy'&&actor.slot>=4)continue;battle.activeActor=actor;renderBattle();if(await skipForStatus(actor)){await endActorTurn(actor);continue;}if(actor.side==='ally')await playerTurn(actor);else await enemyTurn(actor);await endActorTurn(actor);refillEnemyFront();await ensureAllyFront();if(!activeEnemies().length&&!reserveEnemies().length){finishBattle(true);break;}if(!activeAllies().length&&!livingAllies().length){finishBattle(false);break;}}if(battle.finished)break;await runSuperSubs();battle.activeActor=null;renderBattle();await sleep(180);} }
function effectiveSpeed(x){let v=x.spd*(1+(x.buff.spd||0));if(x.m.passives.includes('先手必勝')&&battle.round<=1)v*=1.3;return v;}
async function skipForStatus(a){if(a.status.sleep>0){a.status.sleep--;logBattle(`${a.name}は眠っている…`);return true;}if(a.status.stun>0){a.status.stun--;logBattle(`${a.name}はひるんで動けない！`);return true;}if(a.status.paralyze>0){if(a.side==='enemy'){a.status.paralyze--;logBattle(`${a.name}はマヒして動けない！`);}else logBattle(`${a.name}はマヒして動けない！`);return true;}if(a.status.confuse>0&&Math.random()<.35){a.status.confuse--;logBattle(`${a.name}は混乱している！`);if(a.side==='ally'){const t=pick(activeAllies());if(t)await dealDamage(a,t,{type:'physical',power:.75,element:'無',name:'混乱攻撃'});}else{const t=pick(activeEnemies());if(t)await dealDamage(a,t,{type:'physical',power:.75,element:'無',name:'混乱攻撃'});}return true;}return false;}
async function endActorTurn(a){if(a.hp<=0)return;if(a.status.poison>0){const d=Math.max(1,Math.floor(a.maxHp*.05));a.hp=Math.max(0,a.hp-d);logBattle(`${a.name}は毒で${d}ダメージ。`);}if(a.status.burn>0){const d=Math.max(1,Math.floor(a.maxHp*.04));a.hp=Math.max(0,a.hp-d);logBattle(`${a.name}はやけどで${d}ダメージ。`);}if(a.m.passives.includes('オートヒール')&&a.hp>0){const h=Math.max(1,Math.round(a.maxHp*.03));a.hp=Math.min(a.maxHp,a.hp+h);logBattle(`${a.name}のオートヒール +${h}`);}if(a.m.passives.includes('オートMP')&&a.hp>0){a.mp=Math.min(a.maxMp,a.mp+Math.max(1,Math.round(a.maxMp*.03)));}for(const k of ['poison','burn','confuse'])if(a.status[k]>0)a.status[k]--;if(a.buff.turns>0){a.buff.turns--;if(a.buff.turns<=0)a.buff={atk:0,def:0,mag:0,mnd:0,spd:0,turns:0};}a.guard=0;checkPinch(a);}
function checkPinch(a){if(a.hp>0&&a.hp/a.maxHp<=.30&&a.m.passives.includes('ピンチヒーラー')&&!a.pinchUsed){a.pinchUsed=true;const h=Math.round(a.maxHp*.20);a.hp=Math.min(a.maxHp,a.hp+h);logBattle(`${a.name}のピンチヒーラー！ HP+${h}`);}}
function playerTurn(a){return new Promise(resolve=>{battle.choiceResolve=resolve;battle.choiceLock=false;renderBattle();});}
function resolveChoice(){const r=battle.choiceResolve;battle.choiceResolve=null;if(r)r();}
async function chooseTarget(side='enemy'){
  const list=side==='enemy'?activeEnemies():activeAllies();if(list.length<=1)return Promise.resolve(list[0]||null);
  return new Promise(resolve=>{battle.choiceLock=true;battle.targetSide=side;battle.targetResolve=resolve;renderBattle();});
}

function battleEnemyUnit(e){
  const selectable=!!battle?.targetResolve&&battle.targetSide==='enemy'&&e.hp>0;
  return `<button class="enemy-unit-v3 ${battle.activeActor===e?'active':''} ${e.hp<=0?'dead':''} ${selectable?'selectable':''}" data-combat-uid="${e.uid}" ${selectable?`data-battle-target="${e.uid}"`:''} type="button">${battleArtMarkup(e.m,'enemy-art-v3')}<span class="enemy-nameplate-v3"><span class="line"><b>${esc(e.name)}</b><small>${e.m.rank} / Lv${e.level}</small></span><span class="mini-gauge-v3"><i style="width:${hpPct(e)}%"></i></span><span class="enemy-status-v3">${esc(statusText(e)||`${e.m.species} / ${e.m.attribute}`)}</span></span></button>`;
}
function battleAllyFieldUnit(a){return `<div class="ally-field-unit-v5 ${battle.activeActor===a?'active':''} ${a.hp<=0?'dead':''}" data-combat-uid="${a.uid}">${battleArtMarkup(a.m,'ally-field-art-v5')}</div>`;}
function battleAllyHud(a){
  const selectable=!!battle?.targetResolve&&battle.targetSide==='ally'&&a.hp>0;
  return `<button class="ally-hud-v3 ${battle.activeActor===a?'active':''} ${a.hp<=0?'dead':''} ${selectable?'selectable':''}" data-combat-uid="${a.uid}" ${selectable?`data-battle-target="${a.uid}"`:''} type="button">${battleArtMarkup(a.m,'ally-hud-art-v3')}<b>${esc(a.name)}</b><small>Lv${a.level} / ${esc(statusText(a)||a.m.attribute)}</small><span class="hud-gauge-v3 hp"><i style="width:${hpPct(a)}%"></i></span><span class="hud-gauge-v3 mp"><i style="width:${mpPct(a)}%"></i></span><span class="hud-numbers-v3"><em>${Math.max(0,Math.round(a.hp))}</em><em>MP ${Math.round(a.mp)}</em></span></button>`;
}
function actorBarMarkup(a){if(!a)return `<div class="battle-idle-v3"><span><b>BATTLE FLOW</b><small>SPD順で行動しています</small></span></div>`;return `<div class="actor-bar-v3">${battleArtMarkup(a.m,'actor-mini-v3')}<span><small>COMMAND / SPD ${Math.round(effectiveSpeed(a))}</small><b>${esc(a.name)}</b></span><em>HP ${Math.max(0,Math.round(a.hp))} / MP ${Math.round(a.mp)}</em></div>${commandMarkup(a)}`;}
function bindBattleTargetsV3(){
  $$('[data-battle-target]').forEach(el=>el.onclick=()=>{if(!battle?.targetResolve)return;const side=battle.targetSide,list=side==='enemy'?activeEnemies():activeAllies(),target=list.find(x=>x.uid===el.dataset.battleTarget);if(!target)return;const resolve=battle.targetResolve;battle.targetResolve=null;battle.targetSide=null;battle.choiceLock=false;renderBattle();resolve(target);});
}
async function battleActionBeat(text,tone='ally',ms=430){const el=$('#battleMessageV3');if(!el)return;el.textContent=text;el.className=`battle-message-v3 ${tone}`;void el.offsetWidth;el.classList.add('play');await sleep(ms);}
async function playSkillEffect(skill,target=null,tone='ally'){
  const frames=(skill?.frames?.length?skill.frames:(AM.skillFrames?AM.skillFrames(skill?.name,skill?.element):[]))||[];
  const layer=$('#battleSkillFxV5')||$('#battleFxV3');if(!layer||!frames.length)return;
  const wrap=document.createElement('div');wrap.className=`skill-fx-sequence-v5 ${tone}`;
  const img=document.createElement('img');wrap.appendChild(img);layer.appendChild(wrap);
  const setFrame=(path)=>{img.dataset.mobAsset=path;img.dataset.mobAssetTry='0';img.onerror=()=>AS?.fail?AS.fail(img):img.classList.add('failed');img.src=AS?.first?AS.first(path):path;};
  if(target){const unit=$(`[data-combat-uid="${target.uid}"]`),sr=$('#screen')?.getBoundingClientRect();if(unit&&sr){const ur=unit.getBoundingClientRect();wrap.style.left=(ur.left-sr.left+ur.width*.5)+'px';wrap.style.top=(ur.top-sr.top+ur.height*.42)+'px';}}
  else{wrap.classList.add('center-stage');}
  for(const f of frames){setFrame(f);void wrap.offsetWidth;wrap.classList.add('pulse');await sleep(Math.max(55,90/(state.settings.battleSpeed||1)));wrap.classList.remove('pulse');}
  wrap.classList.add('finish');await sleep(90);wrap.remove();
}
async function battleVisualHit(target,amount,isCrit=false,isWeak=false){
  const unit=$(`[data-combat-uid="${target.uid}"]`),layer=$('#battleFxV3');if(!unit||!layer){await sleep(100);return;}
  unit.classList.remove('hit');void unit.offsetWidth;unit.classList.add('hit');
  const ur=unit.getBoundingClientRect(),sr=$('#screen').getBoundingClientRect(),x=ur.left-sr.left+ur.width*.5,y=ur.top-sr.top+ur.height*.42;
  const ring=document.createElement('i');ring.className='impact-ring-v3';ring.style.left=x+'px';ring.style.top=y+'px';layer.appendChild(ring);
  const f=document.createElement('b');f.className=`damage-float-v3 ${isCrit?'crit':''} ${isWeak&&!isCrit?'weak':''}`;f.textContent=Math.round(amount);f.style.left=x+'px';f.style.top=y+'px';layer.appendChild(f);
  setTimeout(()=>{ring.remove();f.remove();},900);await sleep(260);
}

function renderBattle(){
  if(!battle)return;$('#app')?.classList.add('battle-mode');updateTop();
  if(battle.result){return renderBattleResult();}
  const root=$('#screen'),actor=battle.activeActor,front=activeEnemies();root.className='screen battle-screen-v3';
  const logs=battle.log.slice(-2);
  root.innerHTML=`${battle.background?`<div class="live-scene-bg-v5 battle-live-bg-v5">${assetImgMarkup(battle.background,'','live-scene-img-v5')}</div>`:sceneBgMarkup('battle',battleArea(),battle.floor||1)}<header class="battle-top-v3"><div><small>${battle.mode==='arena'?'ARENA BATTLE':'STORY BATTLE'}</small><b>${esc(battle.title)}</b></div><div class="battle-turn-v3"><span>${battle.mode.toUpperCase()}</span><strong>T${battle.round}</strong></div></header><section class="enemy-stage-v3 enemy-count-${Math.max(1,front.length)}">${front.map(battleEnemyUnit).join('')||'<div class="battle-target-hint-v3">ENEMY DOWN</div>'}</section><section class="ally-stage-v5">${battle.allies.filter(a=>a.slot<4).sort((a,b)=>a.slot-b.slot).map(battleAllyFieldUnit).join('')}</section>${battle.enemies.some(e=>e.slot>=4&&e.hp>0)?`<div class="enemy-reserve-v3">${battle.enemies.filter(e=>e.slot>=4&&e.hp>0).slice(0,6).map(e=>`<span>${esc(e.name)} / Lv${e.level}</span>`).join('')}</div>`:''}<div id="battleFxV3" class="battle-fx-v3"></div><div id="battleSkillFxV5" class="battle-skill-fx-v5"></div><div id="battleMessageV3" class="battle-message-v3"></div>${battle.targetResolve?`<div class="battle-target-hint-v3">${battle.targetSide==='enemy'?'攻撃する敵をタップ':'対象の味方をタップ'}</div>`:''}<div class="battle-log-v3">${logs.map(x=>`<div>${esc(x)}</div>`).join('')}</div><section class="battle-party-v3"><div class="ally-grid-v3">${battle.allies.filter(a=>a.slot<4).sort((a,b)=>a.slot-b.slot).map(battleAllyHud).join('')}</div><div class="battle-bench-v3">${battle.allies.filter(a=>a.slot>=4).sort((a,b)=>a.slot-b.slot).map(a=>`<span class="${a.slot<6?'super':''} ${a.hp<=0?'dead':''}">${a.slot<6?'SUPER':'SUB'} / ${esc(a.name)} / HP ${Math.max(0,Math.round(a.hp))}</span>`).join('')}</div></section><section class="battle-command-v3">${actor?.side==='ally'&&battle.choiceResolve?actorBarMarkup(actor):`<div class="actor-bar-v3">${actor?battleArtMarkup(actor.m,'actor-mini-v3'):'<span class="actor-mini-v3"><i>◆</i></span>'}<span><small>${actor?.side==='enemy'?'ENEMY ACTION':'BATTLE FLOW'}</small><b>${esc(actor?.name||'SPD順で行動中')}</b></span><em>${actor?'ACTION...':'WAIT'}</em></div><div class="battle-idle-v3"><span><b>${battle.finished?'BATTLE END':'ACTION...'}</b><small>${battle.finished?'RESULTを処理しています':'次の行動を待っています'}</small></span></div>`}</section>`;
  if(actor?.side==='ally'&&battle.choiceResolve)bindCommands(actor);bindBattleTargetsV3();
}
function renderBattleResult(){
  const root=$('#screen'),r=battle.result;root.className='screen battle-result-screen-v4';
  const alive=battle.allies.filter(a=>a.hp>0).length,total=battle.allies.length;
  root.innerHTML=`<section class="battle-result-v4 ${r.win?'win':'lose'}"><div class="result-rays-v4"></div><div class="result-title-v4"><small>${battle.mode==='arena'?'ARENA RESULT':'STORY RESULT'}</small><h1>${r.win?'VICTORY':'DEFEAT'}</h1><p>${esc(battle.title)}</p></div><div class="result-party-v4">${battle.allies.slice(0,4).map(a=>`<div class="result-unit-v4 ${a.hp<=0?'down':''}">${stageArtMarkup(a.m,'result-art-v4')}<b>${esc(a.name)}</b><small>Lv${a.inst.level}${a.hp<=0?' / DOWN':''}</small></div>`).join('')}</div><section class="result-board-v4"><div><small>TURN</small><b>${battle.round}</b></div><div><small>ALLY</small><b>${alive}/${total}</b></div><div><small>EXP</small><b>${r.exp||0}</b></div><div><small>SOUL</small><b>${r.souls?.length||0}</b></div></section>${r.win?`<section class="result-reward-v4"><header><small>BATTLE REWARD</small><h2>RESULT</h2></header>${r.souls?.length?`<div class="result-soul-v4">${r.souls.map(n=>`<span>◎ <b>${esc(n)}</b> SOUL</span>`).join('')}</div>`:'<p>SOUL DROPなし</p>'}<p>${esc((r.messages||[]).slice(0,4).join(' / ')||'EXPを獲得しました')}</p></section>`:'<section class="result-reward-v4"><header><small>RETRY</small><h2>PARTYを整えて再挑戦</h2></header><p>敗北時もCOREの進行ルールは変更していません。</p></section>'}<button id="battleResultNext" class="result-next-v4" type="button"><b>NEXT</b><span>›</span></button></section>`;
  $('#battleResultNext').onclick=()=>endBattleToScreen(r.win,false);
}

function hpPct(x){return clamp(x.hp/x.maxHp*100,0,100)}function mpPct(x){return clamp(x.mp/x.maxMp*100,0,100)}
function statusText(x){return Object.entries(x.status).filter(([,v])=>v>0).map(([k])=>statusJa[k]).join('・')||'';}
function enemyCard(e){return `<div class="enemy-card ${battle.activeActor===e?'active':''} ${e.hp<=0?'dead':''}"><div class="combat-topline">${avatarMarkup(e.m,'combat-avatar')}<div class="combat-name"><h3>${esc(e.name)}</h3><small>${e.m.species} / ${e.m.attribute} / Lv${e.level}</small></div><span class="${rankClass(e.m.rank)}">${e.m.rank}</span></div><div class="hpbar"><i style="width:${hpPct(e)}%"></i></div><div class="stats">HP ${Math.max(0,Math.round(e.hp))}/${e.maxHp}</div><div class="status-line">${esc(statusText(e))}</div></div>`;}
function allyCard(a){return `<div class="ally-card ${battle.activeActor===a?'active':''} ${a.hp<=0?'dead':''}"><div class="combat-topline">${avatarMarkup(a.m,'combat-avatar')}<div class="combat-name"><h3>${esc(a.name)}</h3><small>Lv${a.level} / ${esc(a.m.attribute)}</small></div></div><div class="hpbar"><i style="width:${hpPct(a)}%"></i></div><div class="mpbar"><i style="width:${mpPct(a)}%"></i></div><div class="stats">HP ${Math.max(0,Math.round(a.hp))}/${a.maxHp} / MP ${Math.round(a.mp)}/${a.maxMp}</div><div class="status-line">${esc(statusText(a))}</div></div>`;}
function commandMarkup(a){return `<div class="command-grid-v3"><button class="cmd-v3 attack" data-cmd="attack" type="button"><img src="assets/ui/icons/attack.svg" alt=""><b>ATTACK</b><small>攻撃</small></button><button class="cmd-v3 skill" data-cmd="skill" type="button"><img src="assets/ui/icons/skill.svg" alt=""><b>SKILL</b><small>技・魔法</small></button><button class="cmd-v3 guard" data-cmd="guard" type="button"><img src="assets/ui/icons/guard.svg" alt=""><b>GUARD</b><small>防御</small></button><button class="cmd-v3 item" data-cmd="item" type="button"><img src="assets/ui/icons/item.svg" alt=""><b>ITEM</b><small>アイテム</small></button><button class="cmd-v3 swap" data-cmd="swap" type="button"><img src="assets/ui/icons/swap.svg" alt=""><b>SWAP</b><small>入替</small></button><button class="cmd-v3 flee" data-cmd="flee" ${battle.mode!=='story'?'disabled':''} type="button"><img src="assets/ui/icons/flee.svg" alt=""><b>FLEE</b><small>逃げる</small></button></div>`;}
function bindCommands(a){
  $$('[data-cmd]').forEach(b=>b.onclick=async()=>{if(!battle.choiceResolve||battle.choiceLock)return;const c=b.dataset.cmd;
    if(c==='attack'){const t=await chooseTarget('enemy');if(!t)return;await battleActionBeat(`${a.name}の攻撃！`,'ally');await dealDamage(a,t,{name:'通常攻撃',type:'physical',power:1,element:a.m.attribute});resolveChoice();}
    else if(c==='skill'){openSkillPicker(a);}
    else if(c==='guard'){await battleActionBeat(`${a.name}は防御の構え！`,'ally');a.guard=.50;logBattle(`${a.name}は防御の構え！`);resolveChoice();}
    else if(c==='swap'){openBattleSwap(a);}
    else if(c==='item'){openBattleItems(a);}
    else if(c==='flee'){if(battle.enemyRoster.length===1&&battle.enemies[0].m.species==='ボス')return toast('ボス戦からは逃げられません');await battleActionBeat('戦闘から離脱！','ally');battle.fled=true;battle.finished=true;logBattle('戦闘から離脱した。');resolveChoice();setTimeout(()=>endBattleToScreen(false,true),250);}
  });
}
function openSkillPicker(a){
  const skills=learnedSkills(a.inst);showModal('技・魔法',`<div class="skill-list">${skills.length?skills.map(name=>{const s=skillDef(name,a.inst);return `<button class="skill-btn" data-battle-skill="${esc(name)}" ${a.mp<s.cost?'disabled':''}><span><b>${esc(name)}</b><small>${esc(describeSkill(name,a.inst))}</small></span><em>MP ${s.cost}</em></button>`;}).join(''):'<p class="panel-note">まだ技を習得していません。</p>'}</div>`);
  $$('[data-battle-skill]').forEach(b=>b.onclick=async()=>{const s=skillDef(b.dataset.battleSkill,a.inst);if(a.mp<s.cost)return;a.mp-=s.cost;$('#modal').hidden=true;
    if(s.heal&&!/ダメージ/.test(s.info||'')&&s.power===0){const targets=s.target==='all'?activeAllies():[await chooseTarget('ally')];await battleActionBeat(`${a.name} / ${s.name}`,'skill');await playSkillEffect(s,targets.filter(Boolean)[0]||a,'ally');for(const t of targets.filter(Boolean)){const h=Math.round((a.mag*1.4+t.maxHp*.10)*(a.m.passives.includes('サポートマスター')?1.10:1));t.hp=Math.min(t.maxHp,t.hp+h);logBattle(`${a.name}の${s.name}！ ${t.name} HP+${h}`);}resolveChoice();return;}
    const targets=s.target==='all'?[...activeEnemies()]:[await chooseTarget('enemy')];await battleActionBeat(`${a.name} / ${s.name}`,'skill');await playSkillEffect(s,s.target==='all'?null:targets.filter(Boolean)[0],'ally');for(const t of targets.filter(Boolean)){await dealDamage(a,t,s);if(s.status&&t.hp>0)tryStatus(a,t,s.status,s.statusChance||.2);}if(s.heal){const h=Math.round(a.maxHp*.12);a.hp=Math.min(a.maxHp,a.hp+h);}resolveChoice();
  });
}
function openBattleSwap(a){const candidates=battle.allies.filter(x=>x.slot>=4&&x.hp>0);showModal('入れ替える',`<div class="list">${candidates.length?candidates.map(x=>`<button class="row-btn" data-swap-uid="${x.uid}"><span class="grow"><b>${esc(x.name)}</b><small>${x.slot<6?'SUPER SUB':'SUB'} / HP ${Math.round(x.hp)}/${x.maxHp}</small></span></button>`).join(''):'<p class="panel-note">交代できるモンスターがいません。</p>'}</div>`);$$('[data-swap-uid]').forEach(b=>b.onclick=()=>{const x=battle.allies.find(y=>y.uid===b.dataset.swapUid),slot=a.slot;a.slot=x.slot;x.slot=slot;x.hasBeenMain=true;$('#modal').hidden=true;logBattle(`${a.name}と${x.name}を入れ替えた！`);resolveChoice();});}
function openBattleItems(a){showModal('アイテム',`<div class="list"><button class="row-btn" id="antiPara" ${(state.inventory.anti_paralyze||0)<=0?'disabled':''}><span class="grow"><b>アンチマヒカプセル</b><small>マヒ解除 / CORE所持 ${state.inventory.anti_paralyze||0}</small></span></button></div><p class="panel-note" style="margin-top:8px">ショップ・戦闘アイテム経済は今後確定。ここではMOB STORY由来のマヒ対策だけCORE確認用に実装しています。</p>`);$('#antiPara').onclick=async()=>{const paralyzed=battle.allies.filter(x=>x.hp>0&&x.status.paralyze>0);if(!paralyzed.length)return toast('マヒしている味方がいません');battle.choiceLock=true;showModal('マヒ解除',`<div class="list">${paralyzed.map(x=>`<button class="row-btn" data-cure-uid="${x.uid}"><span class="grow"><b>${esc(x.name)}</b></span></button>`).join('')}</div>`);$$('[data-cure-uid]').forEach(b=>b.onclick=()=>{const t=paralyzed.find(x=>x.uid===b.dataset.cureUid);state.inventory.anti_paralyze--;t.status.paralyze=0;save();battle.choiceLock=false;$('#modal').hidden=true;logBattle(`${t.name}のマヒが治った！`);resolveChoice();});};}
async function enemyTurn(e){
  if(e.hp<=0)return;const skills=e.m.sourceSkills||[];
  if(skills.length&&Math.random()<.42){const sk=pick(skills),name=sk.special||sk.name||'スキル',s={name,element:sk.skillElement||e.m.attribute,type:sk.skillType==='magic'?'magic':'physical',power:Number(sk.power)||1.15,target:/aoe|all/i.test(sk.kind||'')?'all':'single',hits:Array.isArray(sk.hits)?rint(sk.hits[0],sk.hits[1]):Number(sk.hits)||1,status:kindToStatus(sk.kind),statusChance:Number(sk.chance)||.18};s.frames=AM.skillFrames?AM.skillFrames(name,s.element):[];logBattle(`${e.name}の${name}！`);await battleActionBeat(`${e.name} / ${name}`,'enemy');await playSkillEffect(s,s.target==='all'?null:pick(activeAllies()),'enemy');await enemyUseSkill(e,s);}
  else{const t=pick(activeAllies());if(t){logBattle(`${e.name}の攻撃！`);await battleActionBeat(`${e.name}の攻撃！`,'enemy');await dealDamage(e,t,{name:'攻撃',type:'physical',power:1,element:e.m.attribute});}}
  if(e.hp>0&&e.m.passives.includes('ボスモンスター')&&Math.random()<D.battle.bossSecondActionChance){logBattle(`${e.name}はもう一度行動する！`);await battleActionBeat(`${e.name} / 追加行動`,'enemy');const t=pick(activeAllies());if(t)await dealDamage(e,t,{name:'追加行動',type:'physical',power:.92,element:e.m.attribute});}
}
function kindToStatus(kind=''){if(/poison/i.test(kind))return'poison';if(/burn/i.test(kind))return'burn';if(/paralyze/i.test(kind))return'paralyze';if(/sleep/i.test(kind))return'sleep';if(/stun/i.test(kind))return'stun';if(/confuse/i.test(kind))return'confuse';return'';}
async function enemyUseSkill(e,s){if(s.target==='all'){for(const t of [...activeAllies()])if(t.hp>0){await dealDamage(e,t,s);if(s.status&&t.hp>0)tryStatus(e,t,s.status,s.statusChance);}for(const t of superAllies())if(t.hp>0){await dealDamage(e,t,{...s,power:s.power*D.party.superAoeDamageRate,superHit:true});if(s.status&&t.hp>0)tryStatus(e,t,s.status,s.statusChance*.5);}}else{const t=pick(activeAllies());if(t){for(let i=0;i<(s.hits||1);i++)if(t.hp>0)await dealDamage(e,t,{...s,power:s.power/(s.hits||1)});if(s.status&&t.hp>0)tryStatus(e,t,s.status,s.statusChance);}}}
function critRate(attacker,s){let c=D.battle.critRate+recordBonuses(attacker.inst).crit;if(attacker.m.passives.includes('立ちはだかる強敵'))c+=.05;if(attacker.m.passives.includes('会心職人'))c+=.08;if(s.type==='magic'){c+=recordBonuses(attacker.inst).magicCrit;if(attacker.m.passives.includes('魔法会心'))c+=.08;}return clamp(c,0,.75);}
function attackStat(a,type){return(type==='magic'?a.mag*(1+(a.buff.mag||0)):a.atk*(1+(a.buff.atk||0)));}
function defenseStat(t,type){let v=(type==='magic'?t.mnd*(1+(t.buff.mnd||0)):t.def*(1+(t.buff.def||0)));if(t.m.passives.includes('逆境魂')&&t.hp/t.maxHp<=.30)v*=1.15;return v;}
function elementMultiplier(element,target){const r=resistanceOf(target.m.name),g=r.element?.[element]||'C';return D.gradeRates.element[g]||1;}
function hasWeak(element,target){return elementMultiplier(element,target)>1.001;}
async function dealDamage(a,t,s){
  if(!a||!t||a.hp<=0||t.hp<=0)return 0;const isCrit=Math.random()<critRate(a,s),source=attackStat(a,s.type),def=defenseStat(t,s.type);let d=Math.max(1,source*(s.power||1)-def*(a.side==='ally'?0.45:0.30))*(.91+Math.random()*.18);const em=elementMultiplier(s.element||a.m.attribute,t);d*=em;const aps=a.m.passives||[];
  if(aps.includes('属性の達人')&&(s.element||a.m.attribute)===a.m.attribute)d*=1.10;if(aps.includes('弱点キラー')&&em>1)d*=1.15;if(aps.includes('連撃マスター')&&(s.hits||1)>=2)d*=1.10;if(aps.includes('大技マスター')&&(s.power||1)>=2)d*=1.10;if(aps.includes('最後の一撃')&&a.hp/a.maxHp<=.25)d*=1.15;d*=1+recordBonuses(a.inst).damage+(recordBonuses(a.inst).elementDamage[s.element]||0);if(isCrit)d*=D.battle.critPower;if(t.guard)d*=1-t.guard;
  if(t.m.passives.includes('オートガード')&&Math.random()<.10){d*=.5;logBattle(`${t.name}のオートガード！`);}if(t.m.passives.includes('メタルボディ')){if(s.type==='magic'){logBattle(`${t.name}のメタルボディ！ 魔法無効`);await battleActionBeat('メタルボディ / 魔法無効','enemy');return 0;}if(!isCrit)d*=.10;else logBattle(`会心がメタルボディを貫いた！`);}d=Math.max(1,Math.round(d));let newHp=t.hp-d;if(newHp<=0&&t.m.passives.includes('不屈のソウル')&&!t.unyieldingUsed){t.unyieldingUsed=true;newHp=1;logBattle(`${t.name}は不屈のソウルで踏みとどまった！`);}t.hp=Math.max(0,newHp);
  logBattle(`${t.name}に${d}${isCrit?'【会心】':''}${em>1?'【弱点】':''}ダメージ`);await battleVisualHit(t,d,isCrit,em>1);
  if(t.status.sleep>0&&Math.random()<.70){t.status.sleep=0;logBattle(`${t.name}は眠りから覚めた！`);}if(t.hp<=0){logBattle(`▼ ${t.name} DOWN`);if(t.side==='enemy')battle.defeated.push(t);}else checkPinch(t);
  if(t.hp>0&&a.hp>0){if(s.type==='physical'&&t.m.passives.includes('カウンター')&&Math.random()<.10){logBattle(`${t.name}のカウンター！`);await counterDamage(t,a,false);}if(s.type==='magic'&&t.m.passives.includes('マジックカウンター')&&Math.random()<.10){logBattle(`${t.name}のマジックカウンター！`);await counterDamage(t,a,true);}}
  renderBattle();await sleep(80);return d;
}
async function counterDamage(a,t,magic){if(t.hp<=0)return;const source=magic?a.mag:a.atk,def=magic?t.mnd:t.def,d=Math.max(1,Math.round((source-def*.25)*(.85+Math.random()*.15)));t.hp=Math.max(0,t.hp-d);logBattle(`${t.name}に反撃 ${d}ダメージ`);if(t.hp<=0)logBattle(`▼ ${t.name} DOWN`);}
function tryStatus(a,t,kind,baseChance){const grade=resistanceOf(t.m.name).status?.[Object.keys(gradeToStatusKey).find(k=>gradeToStatusKey[k]===kind)]||'C';let chance=(baseChance||.2)*(D.gradeRates.status[grade]||1);if(a.m.passives.includes('状態異常の達人'))chance+=.10;if(a.m.passives.includes('ジャマーマスター'))chance+=.08;if(t.m.passives.includes('状態異常ガード'))chance*=.80;if(Math.random()>=clamp(chance,0,.95))return false;let turns=kind==='stun'?1:rint(3,5);if(t.side==='enemy'&&t.m.species==='ボス')turns=Math.min(turns,rint(1,2));if(kind==='paralyze'&&t.side==='ally')turns=99;t.status[kind]=Math.max(t.status[kind]||0,turns);logBattle(`${t.name}は${statusJa[kind]}になった！`);return true;}
function refillEnemyFront(){const liveFront=activeEnemies().length;if(liveFront>=4)return;const empty=[0,1,2,3].filter(s=>!battle.enemies.some(e=>e.slot===s&&e.hp>0));const bench=reserveEnemies().sort((a,b)=>a.slot-b.slot);for(const slot of empty){const x=bench.shift();if(!x)break;const old=x.slot;x.slot=slot;logBattle(`${x.name}が前に出た！`);const dead=battle.enemies.find(e=>e.slot===slot&&e.hp<=0);if(dead)dead.slot=old;}}
async function ensureAllyFront(){while(activeAllies().length<Math.min(4,livingAllies().length)){const empty=[0,1,2,3].find(s=>!battle.allies.some(a=>a.slot===s&&a.hp>0));if(empty==null)break;const candidates=battle.allies.filter(a=>a.slot>=4&&a.hp>0);if(!candidates.length)break;const x=await chooseReplacement(empty,candidates);if(!x)break;const dead=battle.allies.find(a=>a.slot===empty&&a.hp<=0),old=x.slot;x.slot=empty;x.hasBeenMain=true;if(dead)dead.slot=old;logBattle(`${x.name}がMAINへ！`);}}
function chooseReplacement(slot,candidates){if(battle.mode==='arena'&&!battle.useFullParty)return Promise.resolve(null);return new Promise(resolve=>{battle.choiceLock=true;showModal('MAIN交代',`<p class="panel-note" style="margin-bottom:8px">MAIN ${slot+1} がダウン。交代するモンスターを選択。</p><div class="list">${candidates.map(x=>`<button class="row-btn" data-replace-uid="${x.uid}"><span class="grow"><b>${esc(x.name)}</b><small>${x.slot<6?'SUPER SUB':'SUB'} / HP ${Math.round(x.hp)}</small></span></button>`).join('')}</div>`);$$('[data-replace-uid]').forEach(b=>b.onclick=()=>{const x=candidates.find(y=>y.uid===b.dataset.replaceUid);battle.choiceLock=false;$('#modal').hidden=true;resolve(x);});});}
async function runSuperSubs(){for(const s of superAllies()){if(battle.round<s.nextSuper)continue;s.nextSuper=battle.round+rint(2,5);if(await skipForStatus(s)){await endActorTurn(s);continue;}const t=pick(activeEnemies());if(!t)continue;logBattle(`SUPER SUB ${s.name}が自動行動！`);const skills=learnedSkills(s.inst),healSkill=skills.map(n=>skillDef(n,s.inst)).find(x=>x.heal&&x.power===0);if(healSkill&&activeAllies().some(a=>a.hp/a.maxHp<.45)&&Math.random()<.55){const low=[...activeAllies()].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],h=Math.round(s.mag*1.2+low.maxHp*.08);low.hp=Math.min(low.maxHp,low.hp+h);logBattle(`${low.name} HP+${h}`);}else await dealDamage(s,t,{name:'SUPER SUPPORT',type:s.mag>s.atk?'magic':'physical',power:.82,element:s.m.attribute});await endActorTurn(s);}}
async function finishBattle(win){
  if(battle.finished)return;battle.finished=true;battle.activeActor=null;let rewards={exp:0,souls:[],messages:[]};
  if(win){logBattle('★ WIN ★');rewards=awardBattleRewards()||rewards;if(typeof battle.onWin==='function')battle.onWin();}else{logBattle('GAME OVER');if(typeof battle.onLose==='function')battle.onLose();}
  battle.result={win,...rewards};save();renderBattle();
}
function awardBattleRewards(){
  const defeated=battle.defeated.length?battle.defeated:battle.enemies.filter(e=>e.hp<=0),baseExp=defeated.reduce((n,e)=>n+Math.round((12+e.level*e.level*1.35)*(rankMul[e.m.rank]||1)),0);const messages=[],souls=[];
  for(const a of battle.allies){const rate=a.hasBeenMain?1:(a.slot<6?D.exp.superRate:D.exp.reserveRate),gain=Math.round(baseExp*rate),u1=gainMonsterExp(a.inst,gain),u2=gainRecordExp(a.inst,Math.round(gain*.70));if(gain)messages.push(`${a.name}+${gain}EXP${u1?` Lv+${u1}`:''}${u2?` Record+${u2}`:''}`);}if(messages.length)logBattle(messages.slice(0,4).join(' / ')+(messages.length>4?' …':''));
  if(battle.soulDrop){for(const e of defeated){const rate=clamp((D.rankDropRates[e.m.rank]||0)+state.soulBoost,0,1);if(Math.random()<rate){addSoul(e.m.name,{source:'drop'});souls.push(e.m.name);logBattle(`◎ ${e.m.name} SOULを獲得！ (${(rate*100).toFixed(rate<.01?2:1)}%)`);}}state.soulBoost=0;}
  return{exp:baseExp,souls,messages};
}
function endBattleToScreen(win,fled){const mode=battle.mode;battle=null;$('#app')?.classList.remove('battle-mode');$('#modal').hidden=true;state.screen=mode==='arena'?'arena':'story';save();render();if(fled)toast('戦闘から離脱しました');else toast(win?'勝利！':'敗北…');}

render();
})();
