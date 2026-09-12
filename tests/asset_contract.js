const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto');
const root=path.join(__dirname,'..');
const context={window:{},console};context.window.window=context.window;vm.createContext(context);
for(const f of ['js/assets.js','js/asset_map.js','js/data.js']) vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});
const A=context.window.MOBMON_ASSETS,M=context.window.MOBMON_ASSET_MAP,D=context.window.MOBMON_DATA;
const bad=p=>!A.allowed(p);
if(D.monsters.length!==213)throw Error(`monster count ${D.monsters.length}`);
for(const m of D.monsters) if(m.image&&bad(m.image))throw Error(`forbidden monster image ${m.name}: ${m.image}`);
for(const [n,p] of Object.entries(M.monsterOverrides)) if(bad(p))throw Error(`forbidden override ${n}: ${p}`);
for(const [n,v] of Object.entries(D.skills)){
  const frames=v.frames||v.attackFrames||[];
  for(const f of frames){if(bad(f))throw Error(`forbidden skill frame ${n}: ${f}`);if(!/^skill2?\//.test(f))throw Error(`non-skill frame ${n}: ${f}`);}
  const fallback=M.skillFrames(n,v.element||'無');for(const f of fallback)if(!/^skill2?\//.test(f)||bad(f))throw Error(`bad fallback skill frame ${n}: ${f}`);
}
for(const [name,a] of Object.entries(M.area))for(const p of [a.field,a.battle,...a.floors])if(bad(p)||!/^back\//.test(p))throw Error(`bad area asset ${name}: ${p}`);
if(A.candidates('enemy/01.png')[0]!=='enemy/01.png'||!A.candidates('enemy/01.png').some(p=>p.includes('cbmob0329/MOB-QUEST/main/enemy/01.png')))throw Error('Local-first assets must retain GitHub fallback');
const game=fs.readFileSync(path.join(root,'js/game.js'),'utf8');if(!game.includes('function startStoryBattle()'))throw Error('story battle entry missing');if(!game.includes('playSkillEffect'))throw Error('skill animation hook missing');
const original='/mnt/data/MOB-MONSTERS-v0021-MOBSTORY-UI-REBUILD/js/data.js';
if(fs.existsSync(original)){
 const sha=x=>crypto.createHash('sha256').update(fs.readFileSync(x)).digest('hex');
 if(sha(path.join(root,'js/data.js'))!==sha(original))throw Error('data.js changed from previous validated core');
}
console.log('MOB MONSTERS v0.2.2 GitHub asset contract: OK');
console.log({monsters:D.monsters.length,monsterOverrides:Object.keys(M.monsterOverrides).length,skills:Object.keys(D.skills).length,areaBackgrounds:Object.keys(M.area).length,assetBase:A.RAW_BASES[0]});
