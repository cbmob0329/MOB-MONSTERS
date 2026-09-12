(()=>{
window.MOBMON_LAB_EXCHANGE=function(api){
 const {esc,art,ask,save,modal,close,toast}=api;
 async function effect(name,kind,amount){
  api.lock(true);window.MOBMON_LOADING?.suspend();
  try{modal(kind==='monster'?'SOUL RELEASE':'RUBY REFINING',`<div class="exchange-effect ${kind}"><div class="exchange-orbit"></div><div class="exchange-source">${art(name)}</div><div class="exchange-gem">${kind==='monster'?'✦':'◆'}</div><h2>${kind==='monster'?'ソウルへ、還る。':'ルビーに、新しい輝きを。'}</h2></div>`);await new Promise(r=>setTimeout(r,900));}
  finally{api.lock(false);window.MOBMON_LOADING?.resume();}
  modal('変換完了',`<div class="exchange-result"><span>${kind==='monster'?'✦':'◆'}</span><h2>${kind==='monster'?esc(name)+'のソウルを獲得！':amount+' ルビーを獲得！'}</h2><p>${kind==='monster'?'レコード・系譜・カセットの記録を引き継ぎました。':'所持ルビー '+api.state().rubies}</p><button id="exchangeDone" class="primary full">ソウルラボへ戻る</button></div>`);
  document.querySelector('#exchangeDone').onclick=()=>{close();api.go('soul');};
 }
 function render(root,kind){
  let page=0,query='';const size=24;
  root.className='screen exchange-screen';root.scrollTop=0;
  root.innerHTML=`<header class="page-heading"><button data-go="soul" class="back-v6">‹</button><div><small>SOUL LABORATORY</small><h1>${kind==='monster'?'モンスター → ソウル':'ソウル → ルビー'}</h1></div></header><p class="instruction-v6">${kind==='monster'?'編成から外したモンスターをソウルに戻します。育成レコード・系譜・カセットを引き継ぎます。':'選んだソウル1個を消費してルビーに交換します。交換数を確認してから実行できます。'}</p><p class="ruby-balance">◆ 所持ルビー <b>${api.state().rubies||0}</b></p><label class="exchange-search">名前で探す<input id="exchangeSearch" type="search" maxlength="40" placeholder="モンスター名"></label><div id="exchangeGrid" class="exchange-grid"></div><div id="exchangePager" class="soul-pager"></div>`;
  function draw(){
   const s=api.state(),list=(kind==='monster'?s.owned:Object.values(s.souls).flat()).filter(x=>x.name.includes(query));const pages=Math.max(1,Math.ceil(list.length/size));page=Math.min(page,pages-1);
   document.querySelector('#exchangeGrid').innerHTML=list.slice(page*size,(page+1)*size).map((x,i)=>`<button class="exchange-card" data-exchange="${page*size+i}" ${kind==='monster'&&s.party.includes(x.uid)?'disabled':''}>${art(x.name)}<b>${esc(x.name)}</b><small>${kind==='monster'?`Lv ${x.level}${s.party.includes(x.uid)?' · 編成中':''}`:`◆ ${api.rubyValue(x)} ルビー`}</small></button>`).join('')||'<p>対象がありません。</p>';
   document.querySelector('#exchangePager').innerHTML=`<button id="exchangePrev" ${page===0?'disabled':''}>前へ</button><span>${page+1} / ${pages}</span><button id="exchangeNext" ${page+1>=pages?'disabled':''}>次へ</button>`;
   document.querySelector('#exchangePrev').onclick=()=>{page--;draw();root.scrollTop=0;};document.querySelector('#exchangeNext').onclick=()=>{page++;draw();root.scrollTop=0;};
   root.querySelectorAll('[data-exchange]').forEach(b=>b.onclick=async()=>{
    const x=list[Number(b.dataset.exchange)],amount=kind==='monster'?1:api.rubyValue(x);
    if(!await ask(`${x.name}を${kind==='monster'?'ソウル':'ルビー'}へ変換しますか？`,kind==='monster'?'モンスター1体を消費してソウル1個に戻します。':`このソウル1個を消費し、${amount}ルビーを獲得します。元には戻せません。`))return;
    if(kind==='monster'){
     if(!s.owned.some(m=>m.uid===x.uid)||s.party.includes(x.uid))return toast('編成を外してから選び直してください');
     api.addSoul(x);s.owned=s.owned.filter(m=>m.uid!==x.uid);
    }else{
     if(api.selected(x.id))return toast('フュージョンで選択中のソウルです');
     const tokens=s.souls[x.name]||[],index=tokens.findIndex(t=>t.id===x.id);if(index<0)return toast('ソウルを選び直してください');tokens.splice(index,1);s.rubies=(Number(s.rubies)||0)+amount;
    }
    save();draw();await effect(x.name,kind,amount);
   });
  }
  document.querySelector('#exchangeSearch').oninput=e=>{query=e.target.value.trim();page=0;draw();};draw();
 }
 return {render};
};
})();
