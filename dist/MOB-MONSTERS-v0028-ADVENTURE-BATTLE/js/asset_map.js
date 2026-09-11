(()=>{
'use strict';
const area={
  '草原':{field:'back/sougen.png',battle:'back/sougen4.png',floors:['back/sougen.png','back/sougen2.png','back/sougen3.png','back/sougen4.png']},
  '砂漠':{field:'back/sabaku.png',battle:'back/sabaku4.png',floors:['back/sabaku.png','back/sabaku2.png','back/sabaku3.png','back/sabaku4.png']},
  '田舎町':{field:'back/inaka.png',battle:'back/inaka4.png',floors:['back/inaka.png','back/inaka2.png','back/inaka3.png','back/inaka4.png']},
  'ネオン街':{field:'back/neon.png',battle:'back/neon4.png',floors:['back/neon.png','back/neon2.png','back/neon3.png','back/neon4.png']},
  '海底':{field:'back/sea.png',battle:'back/sea4.png',floors:['back/sea.png','back/sea2.png','back/sea3.png','back/sea4.png']},
  '部族村':{field:'back/buzok4.png',battle:'back/buzok4.png',floors:['back/buzok4.png','back/buzok4.png','back/buzok4.png','back/buzok4.png']},
  'マグマ':{field:'back/magma.png',battle:'back/magma4.png',floors:['back/magma.png','back/magma2.png','back/magma3.png','back/magma4.png']},
  '魔王城':{field:'back/maojo.png',battle:'back/maojo4.png',floors:['back/maojo.png','back/maojo2.png','back/maojo3.png','back/maojo4.png']},
  '読みかけの本':{field:'back/yomi1.png',battle:'back/yomi4.png',floors:['back/yomi1.png','back/yomi2.png','back/yomi3.png','back/yomi4.png']},
  '薔薇の国':{field:'back/maojo3.png',battle:'back/maojo4.png',floors:['back/maojo.png','back/maojo2.png','back/maojo3.png','back/maojo4.png']}
};
const monsterOverrides={
  'モブビリオン':'spenemy/020.png','モブカネドール':'spenemy/023.png','モブゼノン':'spenemy/021.png','モブサイキック':'spenemy/26.png',
  'モブマリンソルジャー':'spenemy/022.png','モブリーフガード':'spenemy/027.png','モブスカルソード':'spenemy/028.png','モブポーション':'spenemy/29.png',
  'モブバブルボール':'spenemy/30.png','モブレッドバード':'spenemy/15.png','モブブルーバード':'spenemy/16.png','モブミラスイーツ':'spenemy/31.png',
  'モブデーモン':'spenemy/32.png','モブ魔王スライム':'spenemy/34.png','モブカネドールⅡ':'spenemy/024.png','モブネオマスター幻影':'boss/18.png',
  'モブスライムキング':'play/007.png'
};
const exactSkillFrames={
  'ホノ':['skill/01.png','skill/02.png','skill/03.png','skill/04.png'],
  'ホノマ':['skill/05.png','skill/06.png','skill/07.png','skill/08.png'],
  'ホノマグマ':['skill/09.png','skill/10.png','skill/11.png','skill/12.png'],
  'ネプ':['skill/13.png','skill/14.png','skill/15.png','skill/16.png'],
  'ネプマ':['skill/17.png','skill/18.png','skill/19.png','skill/17.png'],
  'ネプマチューン':['skill/20.png','skill/21.png','skill/22.png','skill/23.png'],
  'トル':['skill/24.png','skill/25.png','skill/26.png','skill/27.png'],
  'トルマ':['skill/29.png','skill/30.png','skill/31.png'],
  'トルマデン':['skill/32.png','skill/33.png','skill/34.png','skill/30.png'],
  'ゴレ':['skill/35.png','skill/36.png','skill/37.png','skill/38.png'],
  'ゴレマ':['skill/39.png','skill/40.png','skill/41.png','skill/42.png'],
  'ゴレマガーディ':['skill/43.png','skill/40.png','skill/41.png','skill/42.png','skill/44.png'],
  'ホク':['skill/45.png','skill/46.png','skill/47.png','skill/48.png'],
  'ホクマ':['skill/49.png','skill/50.png','skill/51.png','skill/52.png'],
  'ホクマウィング':['skill/51.png','skill/53.png','skill/52.png'],
  'ネオ':['skill/54.png','skill/55.png','skill/56.png'],
  'ネオマ':['skill/54.png','skill/55.png','skill/57.png','skill/58.png','skill/56.png'],
  'ネオマニプール':['skill/55.png','skill/57.png','skill/58.png','skill/59.png','skill/60.png'],
  'ミラ':['skill/61.png','skill/62.png','skill/63.png','skill/64.png'],
  'ミラマ':['skill/65.png','skill/66.png','skill/67.png','skill/68.png'],
  'ミラマゾーン':['skill/69.png','skill/70.png','skill/71.png','skill/72.png'],
  'マグソード':['skill/73.png','skill/74.png','skill/75.png','skill/76.png'],
  'マグマソード':['skill/77.png','skill/78.png','skill/79.png','skill/80.png'],
  'ネプソード':['skill/81.png','skill/82.png','skill/83.png','skill/84.png'],
  'ネプマソード':['skill/81.png','skill/82.png','skill/85.png','skill/86.png'],
  'トルソード':['skill/87.png','skill/88.png','skill/89.png','skill/90.png'],
  'トルマソード':['skill/91.png','skill/92.png','skill/93.png','skill/94.png'],
  'アノソード':['skill/95.png','skill/96.png','skill/97.png','skill/98.png'],
  'アノマソード':['skill/99.png','skill/100.png','skill/101.png','skill/102.png'],
  'ミラソード':['skill/103.png','skill/104.png','skill/105.png','skill/106.png'],
  'ミラマソード':['skill/108.png','skill/109.png','skill/110.png','skill/111.png'],
  'ネオソード':['skill/112.png','skill/113.png','skill/114.png','skill/115.png'],
  'ネオマソード':['skill/116.png','skill/117.png','skill/118.png','skill/119.png'],
  'ゴレソード':['skill/120.png','skill/121.png','skill/122.png','skill/123.png'],
  'ゴレマソード':['skill/124.png','skill/125.png','skill/126.png','skill/123.png'],
  'アノマ':['skill/127.png','skill/130.png'],
  'アノマウン':['skill/131.png','skill/134.png'],
  'ノイズスクラッチ':['skill/46.png'],'チルローファイ':['skill/48.png'],'ファストビート':['skill/76.png'],'リピートイントロ':['skill/103.png'],
  'ロングスクラッチ':['skill/27.png','skill/28.png','skill/27.png','skill/28.png']
};
const genericSkillFrames={
  '火':['skill/05.png','skill/06.png','skill/07.png','skill/08.png'],
  '水':['skill/17.png','skill/18.png','skill/19.png'],
  '雷':['skill/29.png','skill/30.png','skill/31.png'],
  '地':['skill/39.png','skill/40.png','skill/41.png','skill/42.png'],
  '風':['skill/49.png','skill/50.png','skill/51.png','skill/52.png'],
  '光':['skill/54.png','skill/55.png','skill/57.png','skill/58.png'],
  '闇':['skill/65.png','skill/66.png','skill/67.png','skill/68.png'],
  '無':['skill/127.png','skill/130.png']
};
function skillFrames(name,element='無'){
  if(exactSkillFrames[name])return exactSkillFrames[name];
  const key=Object.keys(exactSkillFrames).sort((a,b)=>b.length-a.length).find(k=>String(name||'').startsWith(k));
  return key?exactSkillFrames[key]:(genericSkillFrames[element]||genericSkillFrames['無']);
}
function areaAsset(name,mode='field',floor=1){const a=area[name]||area['草原'];if(mode==='floor')return a.floors[Math.max(0,Math.min(3,(Number(floor)||1)-1))]||a.field;return a[mode]||a.field;}
const battleScenes={
 '草原':['sougen','sougen2','sougen4'],'砂漠':['sabaku1','sabaku2','sabaku4'],
 '田舎町':['inaka','inaka2','inaka3'],'ネオン街':['neon','neon2','neon4'],
 '海底':['kaitei','kaitei','kaitei'],'部族村':['buzok','buzok','buzok'],
 'マグマ':['magma','magma2','magma4'],'魔王城':['maojo','maojo2','maojo3'],
 '読みかけの本':['yomi1','yomi2','yomi3']};
function battleAsset(area,kind='normal'){const list=battleScenes[area]||battleScenes['草原'];return 'battle/'+list[kind==='boss'?2:kind==='elite'?1:0]+'.png';}
window.MOBMON_ASSET_MAP={battleScenes,battleAsset,home:'back/rpgmain.png',soul:'back/matrix4.png',arena:'back/metal.png',area,areaAsset,monsterOverrides,exactSkillFrames,genericSkillFrames,skillFrames};
})();
