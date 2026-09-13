(()=>{'use strict';
 function type(node,text,done=()=>{}){
  const chars=[...text],reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let index=0,timer=0,complete=false;
  node.textContent='';node.classList.add('typing');
  function reveal(){if(complete)return;clearTimeout(timer);node.textContent=text;complete=true;node.classList.remove('typing');done();}
  function tick(){if(!node.isConnected){clearTimeout(timer);return;}node.textContent=chars.slice(0,++index).join('');if(index>=chars.length)return reveal();timer=setTimeout(tick,/[、。！？\n]/.test(chars[index-1])?160:32);}
  if(reduced||!chars.length)reveal();else tick();
  return {reveal,cancel:()=>clearTimeout(timer),get complete(){return complete;}};
 }
 function show(api,pages){
  let index=0,writer;
  function draw(){
   writer?.cancel();const page=pages[index],spoken=!!page.speaker;
   api.modal(spoken?page.speaker:'ナレーション',`<section class="dialogue-scene ${spoken?'spoken':'narrated'}">${spoken?`<div class="dialogue-portrait">${api.art()}</div>`:''}<div class="dialogue-box"><small>${api.esc(page.speaker||'ナレーション')}</small><p id="dialogueText"></p></div><button id="dialogueNext" class="primary full">タップして全文表示</button><small class="dialogue-page">${index+1} / ${pages.length}</small></section>`);
   const button=document.querySelector('#dialogueNext');writer=type(document.querySelector('#dialogueText'),page.text,()=>button.textContent=index+1<pages.length?'次へ ▸':'会話を終える');
   const next=()=>{if(!writer.complete)return writer.reveal();if(++index>=pages.length)return api.close();draw();};
   button.onclick=next;document.querySelector('#dialogueText').onclick=()=>writer.reveal();
  }draw();
 }
 function ambient(root){root.querySelectorAll('.speech p').forEach(node=>{const writer=type(node,node.textContent);node.onclick=()=>writer.reveal();});}
 window.MOBMON_DIALOGUE={type,show,ambient};
})();
