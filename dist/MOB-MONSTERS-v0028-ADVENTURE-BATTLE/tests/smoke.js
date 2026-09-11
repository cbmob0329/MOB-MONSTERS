'use strict';
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={window:{},console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'js/data.js'),'utf8'),ctx,{filename:'data.js'});
const D=ctx.window.MOBMON_DATA;
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
assert(D,'MOBMON_DATA missing');
assert(D.monsters.length===213,`monster count ${D.monsters.length}`);
assert(D.passives.length===30,`passive count ${D.passives.length}`);
assert(D.records.length===120,`record count ${D.records.length}`);
assert(D.fixedFusions.length===91,`fixed fusion count ${D.fixedFusions.length}`);
assert(D.recordFusions.length===20,`record fusion count ${D.recordFusions.length}`);
assert(D.seasons.length===10,`season count ${D.seasons.length}`);
assert(Object.keys(D.areas).length===9,`area count ${Object.keys(D.areas).length}`);
const names=new Set(D.monsters.map(m=>m.name));
const pnames=new Set(D.passives.map(p=>p['パッシブ']));
const rnames=new Set(D.records.map(r=>r.name));
assert(pnames.size===30,'duplicate passive names');
assert(rnames.size===120,'duplicate record names');
for(const m of D.monsters){
  const expected=m.rank==='MOB'?3:['A','S','SS'].includes(m.rank)?2:1;
  assert(m.passives.length===expected,`${m.name} passive slots ${m.passives.length} expected ${expected}`);
  for(const p of m.passives)assert(pnames.has(p),`${m.name}: unknown passive ${p}`);
  for(const r of m.nativeRecords)assert(rnames.has(r),`${m.name}: unknown record ${r}`);
  if(m.species==='ボス')assert(m.passives.includes('ボスモンスター'),`${m.name}: boss without ボスモンスター`);
}
for(const r of D.records){
  assert(Array.isArray(r.milestones),`${r.name}: milestones missing`);
  for(const m of r.milestones)assert(m.level>=1&&m.level<=70,`${r.name}: invalid milestone Lv${m.level}`);
}
assert(D.rankDropRates.F===0.40,'F drop rate');
assert(D.rankDropRates.SS===0.001,'SS drop rate');
assert(D.party.main===4&&D.party.super===2&&D.party.reserve===4,'party 4/2/4');
assert(D.exp.monsterMaxLevel===99&&D.exp.recordMaxLevel===70,'level caps');
for(const area of Object.keys(D.areaBoss))for(const lap of ['1','2'])assert(names.has(D.areaBoss[area][lap]),`unknown area boss ${area}/${lap}`);
const general=[
'戦士','魔法使い','守護者','回復術','疾走','火の音','火炎の音','水の音','水竜の音','雷の音','雷撃の音','地の音','大地の音','風の音','旋風の音','光の音','閃光の音','闇の音','暗闇の音','無の音','無我の音','DJ','MC','BBOY','フットワーカー','パワームーバー','フリーズ','トリック&コンボ','トップロッカー','JUDGE','IGL','ヘッドスピナー','ネオン'];
const actual=D.records.filter(r=>r.category==='GENERAL').map(r=>r.name);
assert(JSON.stringify(actual)===JSON.stringify(general),'GENERAL record list mismatch');
console.log('MOB MONSTERS smoke test: OK');
console.log({monsters:D.monsters.length,passives:D.passives.length,records:D.records.length,fixedFusions:D.fixedFusions.length,recordFusions:D.recordFusions.length,seasons:D.seasons.length,areas:Object.keys(D.areas).length});
