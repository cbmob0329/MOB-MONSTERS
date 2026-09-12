/* Adventure balance; keep legacy save keys separate from the new campaign order. */
(()=>{
 const rows=[
  ['草原',false,1,13,[[2,4],[3,5],[5,7]],[8,9],[[5,7],[7,9],[9,11]]],
  ['砂漠',false,1,18,[[3,6],[6,9],[7,11]],[13,15],[[7,9],[9,12],[12,14]]],
  ['田舎町',false,1,25,[[5,10],[10,14],[13,17]],[18,20],[[10,13],[14,17],[18,21]]],
  ['ネオン街',false,2,30],['海底',false,2,35],['部族村',false,3,40],['マグマ',false,3,45],
  ['草原',true,4,50],['砂漠',true,4,55],['田舎町',true,4,60],
  ['ネオン街',true,5,65],['海底',true,5,70],['部族村',true,6,75],['マグマ',true,6,80],
  ['魔王城',false,7,85],['読みかけの本',false,8,90],['魔王城',true,9,100],['読みかけの本',true,9,120]
 ];
 const entries=rows.map(([area,deep,season,boss,normal,elite,cave])=>({area,deep,season,boss,
  normal:normal||[[boss-18,boss-14],[boss-14,boss-10],[boss-10,boss-6]],
  elite:elite||[boss-5,boss-3],cave:cave||[[boss-13,boss-10],[boss-9,boss-6],[boss-5,boss-2]]}));
 function entry(area,deep=false){return entries.find(e=>e.area===area&&e.deep===deep);}
 function range(area,deep,floor,kind='enemy',inside=false){const e=entry(area,deep),i=Math.max(0,Math.min(2,floor-1));return kind==='boss'?[e.boss,e.boss]:kind==='elite'?e.elite:inside?e.cave[i]:e.normal[i];}
 function level(area,deep,floor,kind,inside){const [min,max]=range(area,deep,floor,kind,inside);return min+Math.floor(Math.random()*(max-min+1));}
 function unlocked(area,deep,cleared,test=false){const e=entry(area,deep);return !!e&&(test||e.season===1||entries.filter(x=>x.season<e.season).every(x=>cleared(x.area,x.deep)));}
 window.MOBMON_CAMPAIGN={entries,entry,range,level,unlocked};
})();
