const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);for(const file of ['data.js','story_sync.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),ctx);const d=ctx.window.MOBMON_DATA,p=d.storySync;
assert.equal(d.monsters.length,262);assert.equal(new Set(d.monsters.map(x=>x.name)).size,d.monsters.length);assert.equal(new Set(d.records.map(x=>x.name)).size,d.records.length);const names=new Set(d.monsters.map(x=>x.name)),recs=new Set(d.records.map(x=>x.name));
for(const m of d.monsters){assert(d.rankOrder.includes(m.rank),m.name);if(p.monsters.includes(m))assert(m.image,m.name);assert(m.nativeRecords.length,m.name);for(const r of m.nativeRecords)assert(recs.has(r),m.name+': '+r);}
for(const r of p.records){assert.equal(r.milestones.length,10,r.name);const learned=r.milestones.filter(x=>x.type==='SKILL');assert.equal(new Set(learned.map(x=>x.reward)).size,learned.length,r.name);for(const ms of learned)assert(d.skills[ms.reward],ms.reward);}
for(const r of p.recipes){assert(names.has(r.a)&&names.has(r.b)&&names.has(r.result),r.result);}
const reachable=new Set(d.monsters.filter(m=>!p.monsters.some(x=>x.name===m.name)).map(x=>x.name));for(let i=0;i<p.monsters.length;i++)for(const r of p.recipes)if(reachable.has(r.a)&&reachable.has(r.b))reachable.add(r.result);assert(p.monsters.every(m=>reachable.has(m.name)),'unreachable new monster');
for(const [name,s] of Object.entries(p.skills)){assert(Number.isFinite(s.power)&&s.power>=0,name);assert(Number.isFinite(s.cost)&&s.cost>0,name);assert(['single','all','self'].includes(s.target),name);assert(['physical','magic'].includes(s.type),name);if(s.power===0)assert(s.heal||s.buff||s.guard||s.revive||s.status,name);}
console.log(JSON.stringify({monsters:d.monsters.length,records:d.records.length,fusions:d.fixedFusions.length,skills:Object.keys(p.skills).length,newReachable:p.monsters.length}));
assert(d.skills['フル・ドラゴンフレイム'].power>0&&d.skills['フル・ドラゴンフレイム'].selfBuff.atk>0);
assert(d.skills['バブルネオン'].power>0&&d.skills['バブルネオン'].selfHeal>0);
assert.equal(d.skills['マイナスオーラ'].debuff,undefined);assert.equal(d.skills['マイナスオーラ'].power,0);
assert.equal(d.skills['キャンディ'].healRate,.22);assert.equal(d.skills['キャンディ'].side,'ally');
for(const r of p.recordFusions)assert(recs.has(r.a)&&recs.has(r.b)&&recs.has(r.result));
