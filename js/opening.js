(()=>{
const narration=['とある世界のお話―','魔王が世界を支配しようとしていた','そこに現れたのは','勇者と勇敢な戦士達','壮絶な戦いの末','魔王の脅威は去った','平和な日々が訪れたのだ','そして月日が流れ','また悪の心を持つ魔物も増えてきた','そんな時','新たな魔王リリスは','ソウルフュージョンを進化させ','悪の心を浄化することに成功','この世界では','より良いソウルのモンスターを育成し','モンスターマスターを目指す者たちがいる','あなたもきっと','その一人'];
const story=[
 ['おや？目が覚めたかい？'],['・・・・・？','unknown'],['君、城の前で倒れてたんだよ'],['名前、覚えてる？'],['プレイヤーの名前を入力してください','playerName'],
 [s=>`なるほど、${s.playerName}っていうんだね\n僕はモブリリス\nよろしくね`],['さて、このまま帰すのもよくないよね\n君、モンスターマスターに興味ある？','question'],
 ['よし！\n僕の代わりにPM2で優勝して欲しい！'],['プロジェクト\nモンスター\nマスターズ'],['PMMこと、、PM2！'],['世界中のモンスターマスターの憧れさ'],['君にはこのモブスライムを預けるよ'],['モブスライム Lv.5が仲間になった！','slime'],['名前を付けてください','nickname'],['これで君もモンスターマスターだね'],['冒険に出るためのロボは貸してあげるよ'],['モブロボを手に入れた！','robot'],['そのロボに乗って自由に冒険してくれ'],['おっと\n大事なことを忘れていた'],['モンスターを倒すことで\nソウルが手に入ることがある'],['2つのソウルを組み合わせることで\nモンスターが生まれるんだ'],['同じモンスターのソウル同士だと\nそのモンスターが生まれる'],['色々な組み合わせを試してみてね'],['まずは、モンスターをあと3体仲間にしてみよう\n話しはそれからだ'],['草原でたくさんソウルを集めてみてね'],['さあ、冒険の始まりです！！','final'],['たくさんソウルフュージョンをして\n色んなモンスターと出会いましょう♪','final'],['目指すは、闘技場制覇です！！','final'],['まずは、草原に行ってみましょう！','final'],['いつでも帰還出来るので\n気軽に冒険しましょうね♪','final'],['最初の冒険はソウルのドロップ率が少しだけ上がっています！\nたくさん仲間にしましょう！','final']];
window.MOBMON_OPENING=async function(api){
 const s=api.state(),root=document.querySelector('#screen'),app=document.querySelector('#app');s.opening||={index:0};app.classList.add('opening-mode');
 let timer=0,waiting=false,writer=null;
 return new Promise(resolve=>{
  function finish(){writer?.cancel();clearTimeout(timer);grant();s.flags.roboOwned=true;s.opening.complete=true;s.playerName||='冒険者';api.save();app.classList.remove('opening-mode');resolve();}
  function grant(){if(s.opening.starterUid)return;const m=api.starter();s.opening.starterUid=m.uid;api.save();}
  function next(){if(writer&&!writer.complete){writer.reveal();return;}if(waiting)return;s.opening.index++;api.save();draw();}
  function draw(){
   writer?.cancel();waiting=false;clearTimeout(timer);const index=s.opening.index;if(index>=narration.length+story.length)return finish();const intro=index<narration.length,[text,type]=intro?[narration[index],'narration']:story[index-narration.length],message=typeof text==='function'?text(s):text;
   const spoken=!intro&&!["slime","robot","final","playerName","nickname","unknown"].includes(type);
   if(type==='slime')grant();if(type==='robot'){s.flags.roboOwned=true;api.save();}
   root.className=`screen opening-screen ${intro?'opening-dark':'opening-castle'} ${type==='final'?'opening-celebrate':''} ${spoken?'opening-spoken':'opening-narrated'}`;root.scrollTop=0;
   root.innerHTML=`${s.settings.testMode?'<button id="openingSkip" class="ghost-btn opening-skip">スキップ</button>':''}<section class="opening-content">${spoken||['slime','nickname','robot'].includes(type)?`<div class="opening-art">${type==='slime'||type==='nickname'?api.art('モブスライム'):type==='robot'?'<img src="robo/001.png" alt="モブロボ">':api.lilith()}</div>`:''}<div class="dialogue-box"><small>${spoken?'モブリリス':type==='unknown'?'あなた':'ナレーション'}</small><p id="openingText"></p></div>${type==='playerName'||type==='nickname'?`<label>${type==='nickname'?'8文字まで':'16文字まで'}<input id="openingName" value="${api.esc(type==='nickname'?'モブスライム':s.playerName||'')}" maxlength="${type==='nickname'?16:32}" autocomplete="off"></label><button id="openingDecide" class="primary">決定</button>`:type==='question'?'<div class="button-row"><button id="openingNo" class="ghost-btn">いいえ</button><button id="openingYes" class="primary">はい</button></div>':'<button id="openingNext" class="opening-next">タップして全文表示</button>'}</section>`;
   writer=window.MOBMON_DIALOGUE.type(document.querySelector('#openingText'),message,()=>{const b=document.querySelector('#openingNext');if(b)b.textContent='タップして次へ ▸';});
   document.querySelector('#openingText').onclick=()=>writer.reveal();
   if(s.settings.testMode)document.querySelector('#openingSkip').onclick=async()=>{if(await api.ask('オープニングをスキップしますか？','モブスライムLv5とロボを受け取り、冒険を始めます。'))finish();};
   if(type==='playerName'||type==='nickname')document.querySelector('#openingDecide').onclick=()=>{const name=document.querySelector('#openingName').value.trim(),max=type==='nickname'?8:16;if(!name||[...name].length>max)return api.toast(`1〜${max}文字で入力してください`);writer.reveal();if(type==='playerName')s.playerName=name;else{grant();const m=s.owned.find(m=>m.uid===s.opening.starterUid);if(m)m.nickname=name;}next();};
   else if(type==='question'){document.querySelector('#openingYes').onclick=()=>{writer.reveal();next();};document.querySelector('#openingNo').onclick=()=>api.toast('興味がわいたら、僕に教えてね。');}
   else {waiting=intro;const button=document.querySelector('#openingNext');button.disabled=waiting;button.onclick=next;if(waiting)timer=setTimeout(()=>{waiting=false;button.disabled=false;},1000);}
  }
  draw();
 });
};
})();
