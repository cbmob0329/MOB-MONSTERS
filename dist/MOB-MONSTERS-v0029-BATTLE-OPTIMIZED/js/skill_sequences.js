/* Authoritative presentation sequences from 技のスプライトシート素材について.txt.
 * Numbers are separate PNG frames (not a tiled atlas). Gameplay balance stays in data.js.
 */
(()=>{'use strict';
const P=(n,dir='skill')=>`${dir}/${String(n).padStart(2,'0')}.png`;
const seq=(a,b,dir='skill')=>Array.from({length:b-a+1},(_,i)=>({path:P(a+i,dir),ms:100}));
const step=(n,ms=100,motion='',dir='skill')=>({path:P(n,dir),ms,motion});
const repeat=(a,b,ms)=>Array.from({length:10},(_,i)=>step(i%2?b:a,ms/10));
const S={};const set=(name,steps)=>S[name]=steps;
for(const [name,a,b]of [['ホノ',1,4],['ネプ',13,16],['トル',24,27],['トルマ',29,31],['ゴレ',35,38],['ゴレマ',39,42],['ホク',45,48],['ホクマ',49,52],['ミラ',61,64],['ミラマ',65,68],['ミラマゾーン',69,72],['マグソード',73,76],['マグマソード',77,80],['ネプソード',81,84],['トルソード',87,90],['トルマソード',91,94],['アノソード',95,98],['アノマソード',99,102],['ミラソード',103,106],['ミラマソード',108,111],['ネオソード',112,115],['ネオマソード',116,119],['ゴレソード',120,123]])set(name,seq(a,b));
set('ホノマ',[...seq(5,8),step(4)]);set('ホノマグマ',[...seq(9,12),step(5),step(6)]);
set('ネプマ',[...seq(17,19),step(17)]);set('ネプマチューン',[...seq(20,23),step(22),step(21)]);
set('トルマデン',[...seq(32,34),step(30),step(28)]);
set('ゴレマガーディ',[step(43,300,'shake'),...seq(40,42),step(44,500,'fade')]);
set('ホクマウィング',[...repeat(51,53,1000),step(52,1000,'fade')]);
set('ネオ',[...repeat(54,55,1000),step(56,1000,'fade')]);
set('ネオマ',[54,55,57,58,56].map(n=>step(n)));
set('ネオマニプール',[step(55,300,'shake'),...seq(57,59),step(60,500,'fade')]);
set('アノマ',[step(127),step(130)]);set('アノマウン',[step(131),step(134)]);
set('ネプマソード',[81,82,85,86].map(n=>step(n)));set('ゴレマソード',[...seq(124,126),step(123)]);
set('ノイズスクラッチ',[step(46,1000,'shake')]);set('チルローファイ',[step(48,1000,'float')]);set('ファストビート',[step(76,350,'pass')]);
set('リピートイントロ',[...seq(103,106),step(103,450,'cross')]);set('ロングスクラッチ',[27,28,27,28,27].map(n=>step(n)));
set('スクラッチソード',[...seq(112,115),step(76,350,'pass')]);set('ローファイスプラッシュ',[...seq(81,84),step(48,1000,'float')]);set('ファストビートスラッシュ',[...seq(73,76),step(46,1000,'shake')]);set('イントロクロス',[...seq(87,90),step(103,450,'cross')]);set('ロングスクラッチカット',[...seq(95,96),...[27,28,27,28,27].map(n=>step(n))]);
// Corrected by the 912-2 memo: these frames live in skill2/.
set('MOB斬り',seq(9,12,'skill2'));set('疾風斬り',seq(13,16,'skill2'));
for(const [name,a,b]of [['ガラガラノタビ',193,196],['クマノコ・ミテイタ・アノベルト',133,136],['ケロノイショウ',110,113],['キズツクキツツキ',201,202],['カカシトコムギ',114,117],['ワタシノミライ',125,128],['クラッシュボム',243,246],['ネオメテオパワー',268,271],['ソウルエネルギー',273,276],['ベストセレクション',121,124],['どら焼きの舞',129,132],['MOBウィンドミル',260,263],['MOBヒーロースター',264,267]])set(name,seq(a,b,'skill2'));
set('レインボー1990',[247,248,249,'249-1'].map(n=>step(n,140,'','skill2')));
set('ミラモブポイズン',[{path:'icon/68.png',ms:1000,motion:'charge'},{path:'icon/68.png',ms:200,motion:'launch'},...seq(66,69)]);
window.MOBMON_SKILL_SEQUENCES=S;
const A=window.MOBMON_ASSET_MAP;if(A)for(const [name,steps]of Object.entries(S))A.exactSkillFrames[name]=steps.map(s=>s.path);
})();
