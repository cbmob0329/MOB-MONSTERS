const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];
 page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
 // Private test instrumentation is injected into responses, never shipped in the game.
 await page.route('**/js/exploration.js*',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync('js/exploration.js','utf8').replace('return{render,leave,stop,selector,generate,valid,deepUnlocked};','return{render,leave,stop,selector,generate,valid,deepUnlocked,field:()=>field,interact};')}));
 await page.route('**/js/game.js*',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync('js/game.js','utf8').replace('renderBattle();runBattle();','renderBattle();if(!window.__skipBattleLoop)runBattle();').replace('applyTestV6();\nrender();','window.__test={exploration,state:()=>state,battle:()=>battle,awardBattleRewards,endBattleToScreen,finishBattle,startBattle};\napplyTestV6();\nrender();')}));
 await page.goto('http://127.0.0.1:4173');
 assert.equal(await page.locator('.title-menu button').count(),3);assert(await page.locator('#continueGame').isDisabled());
 await page.waitForTimeout(1200);await page.screenshot({path:'tests/screenshots/025-title.png'});
 await page.locator('#titleSettings').click();assert(await page.locator('[data-setting="testMode"]').isVisible());await page.locator('#returnTitle').click();
 await page.locator('#seedBtn').click();assert.equal(await page.locator('[data-home-mon]').count(),10);
 await page.locator('.facility.shop').click();await page.locator('#meetMerchant').click();assert.equal(await page.locator('[data-shop]').count(),4);await page.locator('.bottom-nav [data-go=home]').click();
 await page.locator('[data-home-mon]').first().click();await page.locator('[data-active-record]').first().click();assert(await page.locator('.record-timeline-v4').isVisible());await page.locator('#modalClose').click();
 await page.locator('.facility.story').click();await page.locator('[data-destination]').first().click();assert(await page.locator('#deepDepth').isDisabled());await page.locator('#normalDepth').click();await page.locator('#answerNo').click();assert.equal(await page.locator('.field-map').count(),0);
 await page.locator('[data-destination]').first().click();await page.locator('#normalDepth').click();await page.locator('#answerYes').click();await page.waitForTimeout(1400);
 assert.equal(await page.locator('.map-entity.enemy').count(),7);
 assert.equal(await page.locator('.obstacle').count(),6);
 await page.waitForTimeout(900);await page.screenshot({path:'tests/screenshots/025-field.png'});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const before=await page.evaluate(()=>window.__test.exploration.field().player.y);await page.keyboard.down('ArrowUp');await page.waitForTimeout(300);await page.keyboard.up('ArrowUp');assert(await page.evaluate(()=>window.__test.exploration.field().player.y)<before);
 const reward=await page.evaluate(()=>{const t=window.__test,e=t.exploration.field().entities.find(e=>e.kind==='chest');return {e:e.id,total:Object.values(t.state().inventory).reduce((a,b)=>a+b,0)};});
 await page.evaluate(()=>{const x=window.__test.exploration,f=x.field(),e=f.entities.find(e=>e.kind==='chest');f.player={x:e.x,y:e.y};x.interact();});await page.locator('#treasureDone').click();
 assert.equal(await page.evaluate(()=>Object.values(window.__test.state().inventory).reduce((a,b)=>a+b,0)),reward.total+1);
 await page.evaluate(id=>{const x=window.__test.exploration;x.interact(x.field().entities.find(e=>e.id===id));},reward.e);assert.equal(await page.evaluate(()=>Object.values(window.__test.state().inventory).reduce((a,b)=>a+b,0)),reward.total+1);
 // Full battle entry and flee cleanup.
 const contactName=await page.evaluate(()=>{const x=window.__test.exploration,f=x.field(),e=f.entities.find(e=>e.kind==='enemy');f.player={x:e.x,y:e.y};x.interact();return e.name;});
 assert.equal(await page.evaluate(()=>window.__test.battle().enemyRoster[0].name),contactName);
 await page.locator('[data-cmd="flee"]').click();await page.waitForTimeout(1300);
 assert.equal(await page.locator('.map-entity.enemy').count(),6);
 await page.evaluate(()=>{const f=window.__test.exploration.field();f.respawns=[f.elapsed];});await page.waitForTimeout(100);assert.equal(await page.locator('.map-entity.enemy').count(),7);
 const next=async()=>{await page.evaluate(()=>{const x=window.__test.exploration;x.interact(x.field().entities.find(e=>e.kind==='portal'));});await page.locator('#answerYes').click();await page.waitForTimeout(1250);};
 await next();assert.equal(await page.locator('.map-entity.elite').count(),1);assert.equal(await page.locator('.map-entity.enemy').count(),6);
 await next();await next();assert.equal(await page.locator('.map-entity.boss').count(),1);assert.equal(await page.locator('.map-entity.portal').count(),0);assert.equal(await page.locator('.map-entity.chest').count(),0);
 await page.screenshot({path:'tests/screenshots/025-boss.png'});
 await page.evaluate(()=>{window.__skipBattleLoop=true;const x=window.__test.exploration;x.interact(x.field().entities.find(e=>e.kind==='boss'));});
 const bossName=await page.evaluate(()=>window.__test.battle().enemyRoster[0].name);
 await page.evaluate(async()=>{const t=window.__test,b=t.battle();b.enemies.forEach(e=>e.hp=0);await t.finishBattle(true);});
 assert(await page.evaluate(name=>window.__test.state().souls[name].length>0,bossName));
 await page.locator('#battleResultNext').click();
 assert.equal(await page.locator('.map-entity.boss').count(),0);assert.equal(await page.locator('.map-entity.chest').count(),2);assert.equal(await page.locator('.map-entity.portal').count(),1);
 assert.equal(await page.evaluate(()=>window.__test.exploration.generate('草原',false,4).entities.filter(e=>e.kind==='boss').length),0);
 assert(await page.evaluate(()=>{const t=window.__test,s=t.state(),old=JSON.stringify(s.exploration.cleared);for(const a of ['草原','砂漠','田舎町','ネオン街','海底','部族村','マグマ','魔王城'])s.exploration.cleared[a+'|normal']=true;const unlocked=t.exploration.deepUnlocked();s.exploration.cleared=JSON.parse(old);return unlocked;}));
 await page.screenshot({path:'tests/screenshots/025-boss-clear.png'});
 // Seed a reward-only battle in a fresh page to verify drop rules without an active turn loop.
 const checks=await page.evaluate(()=>{const t=window.__test,x=t.exploration;let layouts=0;for(let i=0;i<150;i++){const f=x.generate('草原',false,2);if(f.entities.filter(e=>e.kind==='chest').length<1||f.entities.filter(e=>e.kind==='chest').length>3)throw Error('chest count');for(let y=8;y<=92;y++)if(!x.valid(f,{x:50,y},3))throw Error('blocked main road');layouts++;}return layouts;});assert.equal(checks,150);
 await next();assert.equal(await page.locator('[data-home-mon]').count(),10);
 const drops=await page.evaluate(()=>{const t=window.__test;t.state().soulBoost=1;t.startBattle({mode:'exploration',area:'草原',title:'drop test',enemyRoster:Array.from({length:4},()=>({name:'モブスライム',level:1})),soulDrop:true});const b=t.battle();b.enemies.forEach(e=>e.hp=0);const random=Math.random;Math.random=()=>.99;try{return t.awardBattleRewards().souls.length;}finally{Math.random=random;t.endBattleToScreen(true,false);}});assert.equal(drops,1);
 await page.reload();await page.locator('#continueGame').click();assert.equal(await page.locator('[data-home-mon]').count(),10);
 assert.deepEqual(errors,[]);console.log('Exploration browser: title, settings, continue, shop, records, departure, movement, chest, encounter, flee, respawn, elite bypass, boss, 150 map layouts OK');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
