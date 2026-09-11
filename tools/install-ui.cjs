// Build the complete, directly deployable game.js from the backed-up v0022 core.
const fs=require('fs');
let s=fs.readFileSync('backups/reference/MOB-MONSTERS-v0022-GITHUB-ASSETS/js/game.js','utf8');
s=s.replace("const VERSION='v0.2.2 GITHUB ASSETS'", "const VERSION='v0.2.3 HOME'");
s=s.replace('setTimeout(r,ms)', 'setTimeout(r,battle ? ms / (state.settings.battleSpeed||1) : ms)');
s=s.replace("function go(screen){state.screen=screen;save();render();}","function go(screen){if(uiBusy)return;closeModal();state.screen=screen;save();render();$('#screen').scrollTop=0;}");
s=s.replace("if(battle?.choiceLock)return;$('#modal').hidden=true;", "if(battle?.choiceLock||uiBusy)return;if(modalCancel){const done=modalCancel;modalCancel=null;done(false);}$('#modal').hidden=true;");
s=s.replace('return renderHome(root)', 'return homeV6(root)').replace('return renderParty(root)', 'return partyV6(root)').replace('return renderSoul(root)', 'return labV6(root)');
s=s.replace("default:return renderHome(root)", "case'settings':return settingsV6(root);case'castle':return castleV6(root);case'shop':return shopV6(root);case'gacha':return gachaV6(root);default:return homeV6(root)");
s=s.replace('if(!battle)systemModal()',"if(!battle)go('settings')");
s=s.replace("showModal(inst.name,`<div", "showModal(inst.name,`<div");
s=s.replace('<section class="dossier-stats-v4">', '<div class="detail-actions"><button class="record-circle" id="trainRecord">✦<small>ソウル<br>レコード</small></button><button class="primary" id="addParty">パーティーに加える</button></div><section class="dossier-stats-v4">');
s=s.replace("  $$('[data-active-record]').forEach", ()=>"  $('#trainRecord').onclick=()=>trainingV6(id);$('#addParty').onclick=()=>assignV6(id);\n  $$('[data-active-record]').forEach");
s=s.replace("$('#toSoulBtn').onclick=()=>", "$('#toSoulBtn').onclick=async()=>");
s=s.replace("if(!confirm(`${inst.name}をSOULへ戻しますか？`))return;", "if(!await askV6(`${inst.name}をソウルへ戻しますか？`,'モンスターは所持一覧からなくなります。'))return;");
s=s.replace("function buildRuntimeEnemy(row,slot){", "function buildRuntimeEnemy(row,slot){state.seen[row.name]=true;");
s=s.replace('save();const born=monsterByName(result);', 'save();const born=monsterByName.get(result);');
s=s.replace("Math.max(55,90/(state.settings.battleSpeed||1))", '90');
s=s.replace('state.gold+=', 'state.gold+=');
s=s.replace('function save(){localStorage', 'function save(){state.owned.forEach(m=>state.seen[m.name]=true);applyTestV6();localStorage');
s=s.replace("スターターCOREデータでMOB MONSTERSを開始", "10体の仲間と、新しい冒険へ");
s=s.replace('allies=pids.map(ownedByUid).filter(Boolean).map((x,i)=>buildRuntimeAlly(x,i))','allies=pids.map((id,i)=>{const x=ownedByUid(id);return x?buildRuntimeAlly(x,i):null;}).filter(Boolean)');
s=s.replace('n.boss?[buildStoryBoss(n)]:buildStoryEncounter(n)', 'n.boss?buildStoryBoss(n):buildStoryEncounter(n)');
s=s.replace('<div id="storyCurrent" class="story-current-shell-v3"></div>', '<div class="area-choices-v6">${seasonDef(cur.season).areas.map(a=>`<button data-area-choice="${esc(a)}" class="${cur.area===a?\'active\':\'\'}" ${areaCompleted(cur.season,a)?\'disabled\':\'\'}>${esc(a)}${areaCompleted(cur.season,a)?\' ✓\':\'\'}</button>`).join(\'\')}</div><div id="storyCurrent" class="story-current-shell-v3"></div>');
s=s.replace("  renderStoryCurrent($('#storyCurrent'));", ()=>"  renderStoryCurrent($('#storyCurrent'));\n  $$('[data-area-choice]').forEach(b=>b.onclick=()=>{const n=firstIncompleteNode(cur.season,b.dataset.areaChoice);if(!n)return;setCurrentNode(n);state.story.resume={...n};save();renderStory(root);});");
s=s.replace('return{exp:baseExp,souls,messages};', 'state.soulPoints+=Math.round(baseExp*.7);return{exp:baseExp,souls,messages};');
// Retire obsolete UI and its immediate-mutation fusion path. Keep the core candidate rules.
for(const [from,to] of [['function renderHome(','/* ===== STATS / RECORD ===== */'],['function renderParty(','function renderMonsterList('],['function renderSoul(','function soulHasLineage('],['function drawFusionResults(','function renderRecordLibrary(']]){const start=s.indexOf(from),end=s.indexOf(to,start);if(start<0||end<0)throw Error('Missing core boundary '+from);s=s.slice(0,start)+s.slice(end);}
s=s.replace(/\nrender\(\);\s*\}\)\(\);\s*$/, ()=>'\n'+fs.readFileSync('tools/production-ui.js','utf8')+'\nrender();\n})();\n');
// Keep all configurable scene paths in ui_assets.js.
s=s.replace("const uiAssets={lilith:","const uiAssets={home:'assets/scenes/king1.png',lab:'assets/scenes/maojo3.png',castle:'assets/scenes/maojo3.png',lilith:");
s=s.replace('<div class="home-world">','<div class="home-world" style="--scene:url(\'${esc(uiAssets.home)}\')">');
s=s.replace('<section class="lilith-scene lab">','<section class="lilith-scene lab" style="--scene:url(\'${esc(uiAssets.lab)}\')">');
s=s.replace('<section class="lilith-scene castle">','<section class="lilith-scene castle" style="--scene:url(\'${esc(uiAssets.castle)}\')">');
s=s.replace('<section class="fusion-sanctum ${ui.fusion.every(Boolean)?\'ready\':\'\'}">','<section class="fusion-sanctum ${ui.fusion.every(Boolean)?\'ready\':\'\'}" style="--scene:url(\'${esc(uiAssets.lab)}\')">');
s=s.replace('state.settings[key]=value;applyTestV6();',"state.settings[key]=value;if(key==='testMode'&&!value)for(const [flag]of testSettingsV6)state.settings[flag]=false;applyTestV6();");
s=s.replace("$$('[data-slot]').forEach(b=>{b.onclick=()=>{const n=",()=>"$$('[data-slot]').forEach(b=>{let swallowClick=false;b.onclick=()=>{if(swallowClick){swallowClick=false;return;}const n=");
s=s.replace('b.onpointerdown=e=>{if(e.pointerType', 'b.ondragstart=e=>e.preventDefault();b.onpointerdown=e=>{swallowClick=false;if(e.pointerType');
s=s.replace('b.onclick=null;','swallowClick=true;');
s=s.replace("const m=monsterByName.get(s.name);return `<button class=\"square-mon soul-tile\"", "const original=monsterByName.get(s.name),override=uiAssets.soulOverrides?.[s.name],m=override?{...original,image:override,name:s.name}:original;return `<button class=\"square-mon soul-tile\"");
s=s.replace("function monsterImage(m){return", "function monsterImage(m){if(m?.soulImage)return m.soulImage;return");
s=s.replace('image:override,name:s.name','image:override,soulImage:override,name:s.name');
s=s.replaceAll('esc(uiAssets.home)',"esc('../'+uiAssets.home)").replaceAll('esc(uiAssets.lab)',"esc('../'+uiAssets.lab)").replaceAll('esc(uiAssets.castle)',"esc('../'+uiAssets.castle)");
s=s.replace("uiBusy=false;showModal('新しい仲間が誕生！'", "uiBusy=false;ui.fusion=[null,null];fusionV6($('#screen'));showModal('新しい仲間が誕生！'");
fs.writeFileSync('js/game.js',s);
