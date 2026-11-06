/* MOB LAB: catalog, save migration, adventure-only effects and vector robot art. */
(()=>{
'use strict';
const catalog=[
 {id:'stock',kind:'body',name:'モブロボ',price:0,note:'リルリリスから借りた、最初の相棒。'},
 {id:'hopper',kind:'body',name:'ポップホッパー',price:1800,note:'長いアンテナと大きなブーツ。軽快な探検家。'},
 {id:'shell',kind:'body',name:'シェルキャリア',price:2400,note:'丸いシェルとキャタピラー。頼れる運び屋。'},
 {id:'ume',kind:'parts',name:'ウメのネジ',price:180,icon:'✣',effects:{item:.01,first:.02}},
 {id:'soul_lens',kind:'parts',name:'ソウルレンズ',price:260,icon:'◉',effects:{soul:.02}},
 {id:'star_radar',kind:'parts',name:'星見のレーダー',price:320,icon:'✦',effects:{rare:.02}},
 {id:'trade_bell',kind:'parts',name:'旅商人のベル',price:220,icon:'♧',effects:{merchant:.03}},
 {id:'lucky_gear',kind:'parts',name:'幸運のギア',price:280,icon:'⚙',effects:{item:.02}},
 {id:'dawn_sensor',kind:'parts',name:'夜明けのセンサー',price:300,icon:'◈',effects:{first:.03}},
 {id:'moon_coil',kind:'parts',name:'月灯りのコイル',price:380,icon:'☾',effects:{soul:.01,rare:.01}},
 {id:'trail_compass',kind:'parts',name:'道しるべコンパス',price:340,icon:'⌖',effects:{merchant:.02,item:.01}},
 {id:'yuki',kind:'motors',name:'ユキのモーター',price:360,icon:'▣',effects:{speed:.007,def:1}},
 {id:'akane',kind:'motors',name:'アカネのモーター',price:420,icon:'▣',effects:{speed:.01,atk:1}},
 {id:'sora',kind:'motors',name:'ソラのモーター',price:480,icon:'▣',effects:{speed:.015,mag:1}},
 {id:'mori',kind:'motors',name:'モリのモーター',price:440,icon:'▣',effects:{speed:.005,hp:5,mnd:1}}
];
const labels={item:'アイテムドロップ率',soul:'ソウルドロップ率',rare:'レア敵遭遇率',first:'先制攻撃率',merchant:'商人遭遇率',speed:'移動スピード',def:'DEF',atk:'ATK',mag:'MAG',hp:'HP',mnd:'MND'};
const rates=new Set(['item','soul','rare','first','merchant','speed']);
const byId=id=>catalog.find(x=>x.id===id);
const trial=s=>!!(s.settings?.testMode&&s.settings?.robotAll);
const owned=(s,id)=>id==='stock'||trial(s)||!!s.robotLab?.owned?.includes(id);
function normalize(s){
 const r=s.robotLab&&typeof s.robotLab==='object'?s.robotLab:{};s.robotLab=r;
 r.owned=[...new Set(['stock',...(Array.isArray(r.owned)?r.owned:[]).filter(id=>byId(id))])];
 r.body=byId(r.body)?.kind==='body'&&owned(s,r.body)?r.body:'stock';
 for(const [kind,count]of [['parts',4],['motors',2]]){const used=new Set(),slots=Array.isArray(r[kind])?r[kind]:[];r[kind]=Array.from({length:count},(_,i)=>{const id=slots[i];if(byId(id)?.kind!==kind||!owned(s,id)||used.has(id))return null;used.add(id);return id;});}return r;
}
function bonuses(s){const r=normalize(s),out={item:0,soul:0,rare:0,first:0,merchant:0,speed:0,hp:0,atk:0,def:0,mag:0,mnd:0};for(const id of [...r.parts,...r.motors])for(const [k,v]of Object.entries(byId(id)?.effects||{}))out[k]+=v;return out;}
function describe(item){return Object.entries(item.effects||{}).map(([k,v])=>`${labels[k]} +${rates.has(k)?Number((v*100).toFixed(2))+'%':v}`).join(' / ')||item.note;}
function robotMarkup(s,direction='002'){
 const id=normalize(s).body,path=window.MOBMON_UI_ASSETS?.robotBodies?.[id]?.[direction];
 if(path)return window.MOBMON_ASSETS.markup(path,byId(id).name,'lab-robot-image');
 if(id==='stock')return `<img class="lab-robot-image" src="robo/${direction}.png" alt="モブロボ" draggable="false">`;
 const shell=id==='shell',paint=shell?'#f2bd64':'#80dfc4',dark=shell?'#bd7943':'#3b9a98';
 return `<svg class="lab-robot-vector ${id}" data-facing="${direction}" viewBox="0 0 240 240" role="img" aria-label="${byId(id).name}"><ellipse cx="120" cy="215" rx="77" ry="13" fill="#102b3b" opacity=".25"/><g stroke="#173442" stroke-width="6" stroke-linejoin="round">${shell?'<rect x="38" y="167" width="164" height="42" rx="21" fill="#314e59"/><path d="M57 187h126" stroke="#88a7a4" stroke-dasharray="9 8"/>':'<path d="M87 66L73 21Q81 11 90 20L107 63M135 63l16-43q10-7 17 2l-16 45" fill="#edf1d5"/><path d="M77 165l-18 35q-4 12 30 11l18-37m30 0 15 37q33 0 30-12l-19-34" fill="#f0d581"/>'}<path d="M61 114q-39 4-28 47l26 5m122-52q38 4 27 47l-26 5" fill="${dark}"/><path d="M59 107q0-47 61-47t61 47v55q0 33-61 33t-61-33z" fill="${paint}"/><path d="M62 151q58 34 116 0v15q-4 27-58 27t-58-27z" fill="${dark}" stroke="none"/><path d="M72 89q46-30 94 0" fill="none" stroke="#fff6cb" stroke-width="8" opacity=".65"/><g class="robot-face"><rect x="77" y="104" width="86" height="44" rx="20" fill="#193c49"/><path d="M95 120v11m49-11v11" stroke="#a7ffdd" stroke-linecap="round"/><path d="M111 139q9 5 18 0" stroke="#77c9c2" stroke-width="3" fill="none"/></g><g class="robot-back"><path d="M93 107h54v43H93z" fill="${dark}"/><path d="M102 118h36m-36 12h36m-36 12h36" stroke-width="3"/></g><circle cx="120" cy="173" r="10" fill="#ffedaf" stroke-width="4"/>${shell?'<path d="M77 63V44h86v19" fill="#eef0d3"/><path d="M94 48V30h52v18" fill="#80b9b2"/>':''}</g></svg>`;
}
window.MOBMON_LAB={catalog,byId,normalize,bonuses,owned,describe,robotMarkup};
window.MOBMON_LAB.create=function(api){
 const {esc}=api;let tab='parts',working=false;
 const itemCard=item=>`<span class="lab-item-icon">${item.icon||'▣'}</span><span><b>${esc(item.name)}</b><small>${esc(describe(item))}</small></span>`;
 function ownedLabel(item){return owned(api.state(),item.id)?'所持済み':`${item.price.toLocaleString()} G`;}
 function shopMarkup(){return `<div class="lab-store">${catalog.filter(x=>x.id!=='stock').map(item=>`<button class="lab-store-item" data-lab-buy="${item.id}" ${owned(api.state(),item.id)?'disabled':''}>${itemCard(item)}<em>${ownedLabel(item)}</em></button>`).join('')}</div>`;}
 function bindShop(root,refresh){root.querySelectorAll('[data-lab-buy]').forEach(b=>b.onclick=async()=>{if(working)return;const item=byId(b.dataset.labBuy),s=api.state();if(owned(s,item.id))return;if(s.gold<item.price)return api.toast('コインが足りません');working=true;try{if(!await api.ask(`${item.name}を購入しますか？`,`${describe(item)} / ${item.price} G`)){refresh();return;}if(!owned(s,item.id)&&s.gold>=item.price){normalize(s).owned.push(item.id);s.gold-=item.price;api.save();api.toast(`${item.name}を購入しました`);}refresh();}finally{working=false;}});}
 function shopModal(){api.modal('旅商人の整備ショップ',`<p>所持 ${api.state().gold.toLocaleString()} G</p>${shopMarkup()}`);bindShop(document.querySelector('#modalBody'),shopModal);}
 async function change(kind,index,id){
  if(working)return;const s=api.state(),r=normalize(s),old=kind==='body'?r.body:r[kind][index],item=byId(id);
  if(id===old)return;if(id&&(!owned(s,id)||item?.kind!==kind))return;
  if(id&&kind!=='body'&&r[kind].includes(id))return api.toast('同じ装備は同時に2つ装着できません');
  working=true;try{const action=id?(old?'入れ替え':'装着'):'取り外し';if(!await api.ask(`${id?item.name:byId(old)?.name}を${action}しますか？`,id?describe(item):'装備は所持品に戻ります。')){choose(kind,index);return;}
   if(kind==='body')r.body=id;else r[kind][index]=id;api.save();api.close();api.lock(true);
   const stage=document.querySelector('.mob-lab-stage');stage?.classList.add(id?'lab-fitting':'lab-removing');
   const badge=document.createElement('div');badge.className='lab-work-notice';badge.setAttribute('role','status');badge.textContent=`${action}完了！`;stage?.append(badge);
   try{await new Promise(resolve=>setTimeout(resolve,window.matchMedia('(prefers-reduced-motion: reduce)').matches?200:650));}finally{api.lock(false);}
   if(api.state().screen==='moblab')render(document.querySelector('#screen'));api.toast(`${id?item.name:byId(old)?.name}を${action}しました`);
  }finally{working=false;}
 }
 function choose(kind,index=0){const r=normalize(api.state()),current=kind==='body'?r.body:r[kind][index];api.modal(kind==='body'?'機体デザインを選択':`${kind==='parts'?'パーツ':'モーター'} ${index+1}`,`<p class="lab-note">${kind==='body'?'機体デザインによる性能差はありません。':'同じ装備は1つまで。効果は冒険中に適用されます。'}</p><div class="lab-store">${catalog.filter(x=>x.kind===kind).map(item=>`<button class="lab-store-item" data-lab-equip="${item.id}" ${!owned(api.state(),item.id)||current===item.id||kind!=='body'&&r[kind].includes(item.id)?'disabled':''}>${itemCard(item)}<em>${current===item.id?'装着中':ownedLabel(item)}</em></button>`).join('')}</div>${kind!=='body'&&current?'<button id="labUnequip" class="ghost-btn full">取り外す</button>':''}`);document.querySelectorAll('[data-lab-equip]').forEach(b=>b.onclick=()=>change(kind,index,b.dataset.labEquip));const remove=document.querySelector('#labUnequip');if(remove)remove.onclick=()=>change(kind,index,null);}
 function render(root){const scroll=root.scrollTop,s=api.state(),r=normalize(s),b=bonuses(s);root.className='screen mob-lab-screen';root.innerHTML=api.heading('MOB LAB','BUILD YOUR NEXT ADVENTURE')+`<section class="mob-lab-stage"><div class="lab-window"><i></i><i></i><i></i></div><div class="lab-pipes"></div><div class="lab-toolboard"><i>✣</i><i>⌁</i><i>⚙</i></div><span class="lab-hanging-light"></span><div class="lab-floor"></div><div class="lab-platform"></div><div class="lab-central-robot">${robotMarkup(s)}</div><div class="lab-stage-name"><small>YOUR EXPLORER</small><b>${esc(byId(r.body).name)}</b></div><button id="labBody" class="lab-paint-button">機体デザイン変更</button></section><div class="lab-guide">${api.guide?api.guide():'<span>✦</span>'}<p><b>リルリリス</b>「小さなネジにも、冒険を変える力があるんだ。準備ができたら出発しよう！」</p></div><div class="lab-tabs" role="tablist">${[['parts','パーツ'],['motors','モーター'],['shop','ショップ']].map(([id,name])=>`<button role="tab" aria-selected="${tab===id}" data-lab-tab="${id}">${name}</button>`).join('')}</div>${tab==='shop'?`<p class="lab-note">所持 ${s.gold.toLocaleString()} G · 初期からすべて購入可能</p>${shopMarkup()}`:`<section class="lab-loadout"><header><b>${tab==='parts'?'PARTS · 4 SLOTS':'MOTORS · 2 SLOTS'}</b><span>${r[tab].filter(Boolean).length} / ${r[tab].length}</span></header><div class="lab-slots">${r[tab].map((id,i)=>`<button data-lab-slot="${i}" class="lab-slot ${id?'filled':''}"><em>${String(i+1).padStart(2,'0')}</em>${id?itemCard(byId(id)):'<span class="lab-empty">＋</span><span><b>装着する</b><small>所持品から選択</small></span>'}</button>`).join('')}</div></section>`}<section class="lab-effects"><h3>冒険中の合計効果</h3><div>${Object.entries(b).filter(([,v])=>v).map(([k,v])=>`<span>${labels[k]}<b>+${rates.has(k)?Number((v*100).toFixed(2))+'%':v}</b></span>`).join('')||'<p>装備を選ぶと効果がここに表示されます。</p>'}</div><small>確率は加算。モーター補正は冒険のみ／闘技場には適用されません。</small></section><button class="primary full lab-launch" data-go="story">ロボで冒険へ出発　›</button>`;
 root.querySelector('#labBody').onclick=()=>choose('body');root.querySelectorAll('[data-lab-tab]').forEach(el=>el.onclick=()=>{tab=el.dataset.labTab;render(root);});root.querySelectorAll('[data-lab-slot]').forEach(el=>el.onclick=()=>choose(tab,Number(el.dataset.labSlot)));if(tab==='shop')bindShop(root,()=>render(root));root.scrollTop=scroll;}
 return {render,shopMarkup,bindShop,shopModal};
};
})();
