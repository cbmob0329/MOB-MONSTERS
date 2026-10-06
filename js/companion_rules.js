// MONSTERS companion rules. Keeps all persistent names, IDs and learned milestones.
(()=>{'use strict';const D=window.MOBMON_DATA,attrs=['無','火','水','雷','地','風','光','闇'],jp={poison:'毒',burn:'やけど',paralyze:'マヒ',sleep:'眠り',stun:'ひるみ',confuse:'混乱'};
const edits={
'フレイムマジック':{power:.85,target:'all',cost:12,status:null},'フレイムフラッシュ':{power:1.8,target:'single',cost:17,status:'burn',statusChance:.2},
'マカロン・ノータイム':{power:1.9,statusChance:.15,cost:19},'マカロン・ティータイム':{target:'single',side:'ally',heal:true,healRate:.25,cost:12},
'MOBヒーロースター':{power:1.8,target:'all',cost:25,type:'physical',element:'光'},
'マグマ・ザ・ビッグ':{power:0,side:'ally',target:'self',buff:{atk:.2,def:.15},duration:3,cost:16},
'マグ・オーバーヒート':{power:2.1,type:'physical',cost:20,selfBuff:{atk:.1},duration:2},
'クライマックスチェイス':{power:1.8,splash:.65,status:'paralyze',statusChance:.1,cost:28},
'サンダーロープ':{power:1.4,status:'paralyze',statusChance:.1,cost:13},
'ジャスティス+・スクリューブロー':{power:1.6,target:'all',selfBuff:{spd:.15},duration:3,cost:25},
'プティハードライトニング':{power:1.9,splash:.45,cost:25},
'モブテツ一文字':{power:1.55,target:'all',status:'stun',statusChance:.15,cost:24},
'モブテツ一閃':{power:1.1,target:'all',status:'stun',statusChance:.1,cost:15},
'モブテツ流茄子落とし':{power:1.9,crit:.12,cost:18},'鉄の極意':{power:2.3,selfBuff:{atk:.1},debuff:{def:-.1},duration:3,cost:28},
'サンドドラグーン':{power:1.55,target:'all',debuff:{spd:-.1},duration:3,cost:22},'デザートブラウニー':{power:1.4,selfHeal:.12,cost:17},
'イカシタイカヅチ':{power:0,side:'ally',target:'all',heal:true,healRate:.15,mpHeal:.08,buff:{def:.1},duration:2,cost:30},
'デンデンサンダーボルト':{power:2.05,target:'all',type:'magic',cost:32},'トリック・ザ・デンデン':{power:1.55,target:'all',status:'stun',statusChance:.1,cost:23},
'ジューシーファイア':{power:1.9,status:'burn',statusChance:.2,cost:19},'ヒノフルカヨウ':{power:1.6,target:'all',cost:22},
'マグケロキングダム':{power:1.55,target:'all',partyBuff:{def:.1},duration:2,cost:28},'マグマケロ':{power:1.15,target:'all',status:'burn',statusChance:.1,cost:17},
'ウォーターキル・ザ・ビート':{power:2.5,status:'sleep',statusChance:.1,cost:27},'ネコクージェット':{power:1.5,ignoreEvasion:true,cost:15},'ネコトクジラ':{power:1.9,selfCleanse:true,cost:21},'ネムレナイヨル':{power:1.8,status:'sleep',statusChance:.25,cost:23},
'キングダムソルジャー':{power:1.55,target:'all',partyGuard:.2,duration:2,cost:30},'シールドアタック':{power:1.3,selfGuard:.2,duration:1,cost:14},
'勇者のパートナー':{power:1.1,target:'all',partyGuard:.15,duration:2,cost:24},'癒しのピンクボンボン':{power:0,side:'ally',target:'all',heal:true,healRate:.2,cleanseChance:.5,cost:25},
'マニーズハウス':{power:0,side:'ally',target:'all',heal:true,healRate:.3,guard:.1,duration:2,cost:32},
'マニーフレンズ':{power:0,side:'ally',target:'self',buff:{atk:.15,mag:.15,def:.15,mnd:.15,spd:.15},duration:3,cost:22},
'レッドブルーボム':{power:.7,hits:3,multiElements:['火','水','光'],cost:24},
'レトロミラージュマニー':{power:0,side:'ally',target:'self',heal:true,healRate:.65,partyGuard:.2,duration:1,cost:36},
'リリス四姉妹':{power:.65,hits:4,randomTargets:true,multiElements:['火','雷','光','水'],cost:30},
'ローズ・ウォール・ストリート':{power:0,side:'ally',target:'all',heal:true,healRate:.25,mpHeal:.08,guard:.2,duration:2,cost:40},
'タロ・アンド・リーロ':{power:0,side:'ally',target:'all',heal:true,healRate:.3,cleanseChance:.5,cost:30},
'ディスコスパイラル':{power:1.8,partyBuff:{atk:.1},duration:2,cost:25},'トゥエルラッシュ':{power:.75,hits:2,cost:16},
'リーロ・トゥ・ステイシー':{power:2.3,partyHeal:.2,cost:38},'エピソード・ジューマンジ':{power:1.8,selfBuff:{mag:.15},debuff:{mnd:-.15},duration:3,cost:25},
'ネバー・エンディング・フレイム':{power:2.2,lowHpScale:.3,cost:28},'星降りの一振り':{power:1.5,crit:.1,cost:16},
'特別だと信じる力':{power:0,side:'ally',target:'self',buff:{atk:.2,def:.2,mag:.2,mnd:.2,spd:.2},guard:.1,duration:3,cost:25},
'読みかけの本':{power:0,side:'ally',target:'self',buff:{atk:.2,mag:.2,spd:.15},duration:4,cost:22},
'怪人共闘':{power:0,side:'ally',target:'all',buff:{atk:.12,def:.08},duration:3,cost:22},'紫雷撃（仮）':{power:1.8,type:'magic',element:'雷',status:'paralyze',statusChance:.1,cost:19},
'リビングデッド':{power:0,side:'ally',target:'single',revive:true,healRate:.3,cost:30},
'アビススクリュー':{hits:2,power:.6,cost:12},'アビスブレード':{power:1.3,cost:13,debuff:{def:-.1},duration:2},
'ウォーターグラビディ':{power:1.2,debuff:{spd:-.15},duration:2,cost:15},'ミストラル':{power:1,target:'all',cost:17},
'カッチンドラム':{power:1.15,selfBuff:{def:.1},duration:2,cost:13},'ビッグアックス':{power:1.65,cost:15},
'ツインバイト':{power:.55,hits:2,cost:10},'サバンナダンス':{power:1,selfBuff:{spd:.12},duration:2,cost:12},
'ヤマノタマシイ':{power:1.1,selfHeal:.08,cost:13},'ケロケロファイア':{power:1.1,status:'burn',statusChance:.15,cost:13},
'モリカリブーメラン':{power:.6,hits:2,target:'single',cost:12},'ホークダイブ':{power:.9,target:'all',cost:15},
'海の戦士':{power:1.2,selfGuard:.1,duration:2,cost:14},'ネプチューン・トライデント':{power:.65,hits:3,cost:22},
'タイガーネットワーク':{power:1,debuff:{spd:-.1},duration:2,cost:13},'セキュリティダッシュ':{power:1.2,selfBuff:{spd:.1},duration:2,cost:13},
'ココロノスキマ':{power:1.1,status:'confuse',statusChance:.15,cost:14},'アンコール・ノイズ':{power:.85,target:'all',cost:16}
};
Object.assign(edits,{
'バリオンナックル':{selfBuff:{def:.1},duration:2,cost:21},
'バリオンサンダー':{power:1.15,target:'all',cost:23},
'スライムブレス':{status:'poison',statusChance:.1,cost:14},
'メトロブロウ':{selfBuff:{spd:.1},duration:2,cost:16},
'ダイダルローズ':{debuff:{spd:-.1},duration:2,cost:18},
'サイコソヨカゼ':{selfEvasion:.08,duration:2,cost:17},
'火炎の特技':{status:'burn',statusChance:.1,cost:15}
});
for(const [name,raw] of Object.entries(D.skills)){
 const info=raw.info||'',base=raw._normalized?raw:{name,element:raw.element||'無',type:raw.kind==='magic'?'magic':'physical',target:/敵全体/.test(info)?'all':'single',side:'enemy',power:/極大/.test(info)?2.4:/大/.test(info)?1.9:/中/.test(info)?1.4:1.15,cost:raw.cost||18,hits:1};
 const s={...base,...edits[name],id:raw.id?'skill:'+raw.id:'skill:'+name,name,_normalized:true,synced:true};
 delete s.cooldown;delete s.cooldownAdd;s.description='';s.cost=Math.max(1,s.cost||12);s.customEffect='';
 D.skills[name]=s;
}
// Existing monster names remain save keys. Enemy-only AI traits are retained separately.
const profiles={スライム:['毒','眠り'],ビースト:['ひるみ','混乱'],ネイチャー:['毒','やけど'],アクア:['やけど','毒'],ドラゴン:['やけど','眠り'],デーモン:['混乱','ひるみ'],マシン:['毒','マヒ'],マテリアル:['毒','眠り'],ヒューマノイド:['混乱','マヒ'],ボス:['ひるみ','眠り']};
function motif(m){const n=m.name;if(/メタル/.test(n))return ['メタルボディ','状態異常ガード','不屈のソウル'];if(/マカロン/.test(n))return ['攻撃本能','サポートマスター','スピードボディ'];if(/パッション|ファイト/.test(n))return ['攻撃本能','逆境魂','不屈のソウル'];if(/ミント|カスタード|ポーション|ジョーロ/.test(n))return ['サポートマスター','オートMP','マジックボディ'];if(/マグネット|カセット|コクピット/.test(n))return ['属性の達人','ハードボディ','連撃マスター'];if(/ガーディ|ガード|カッチン/.test(n))return ['オートガード','ハードボディ','カウンター'];if(/ホーク|バード|サバンナ/.test(n))return ['スピードボディ','先手必勝','弱点キラー'];if(/スカル|ソード|閻魔|アックス/.test(n))return ['会心職人','カウンター','攻撃本能'];if(/ミイラ|ポイズン|マッシュ|ヤミ/.test(n))return ['状態異常の達人','ジャマーマスター','ソウルボディ'];if(/リリス|ウィッチ|ソーサラー|魔王/.test(n))return ['マジックボディ','魔法会心','オートMP'];if(m.species==='ドラゴン')return ['大技マスター','タフボディ','属性の達人'];if(m.attribute==='水')return ['オートヒール','ソウルボディ','サポートマスター'];if(m.attribute==='火')return ['属性の達人','攻撃本能','大技マスター'];if(m.species==='ビースト')return ['攻撃本能','スピードボディ','カウンター'];return ['タフボディ','属性の達人','状態異常ガード'];}
for(const m of D.monsters){m.id='monster:'+m.no;m.enemyPassives=[...m.passives];const n=m.rank==='MOB'?3:['A','S','SS'].includes(m.rank)?2:1;m.passives=motif(m).slice(0,n);const [strong,weak]=profiles[m.species]||profiles.ボス;const status=Object.fromEntries(Object.values(jp).map(k=>[k,'C']));status[strong]='A';status[weak]='D';if(m.attribute==='火')status.やけど='A';if(m.attribute==='雷')status.マヒ='B';if(/メタル/.test(m.name))status.毒='S';if(/マカロン/.test(m.name)){status.眠り='D';status.混乱='B';}D.resistances[m.name]={...(D.resistances[m.name]||{}),status};m.sourceSkills=(m.sourceSkills||[]).map(s=>({...s,...D.skills[s.name||s.special]}));}
for(const p of D.passives){if(p.パッシブ==='サポートマスター')p.効果='自分が使用する能力強化・HP回復の量が10%増える。';if(p.パッシブ==='ジャマーマスター')p.効果='自分が使用する能力低下の量が8%増え、状態異常成功率に8ポイント加算。';if(p.パッシブ==='先手必勝')p.効果='第1ターンのSPDが30%上がる。';if(p.パッシブ==='ボスモンスター')p.効果='敵専用。行動後に追加行動することがある。仲間には付与しない。';p['現在の所持枠数']=D.monsters.filter(m=>m.passives.includes(p.パッシブ)).length;}
function describe(s){const scope=s.target==='self'?'自分':(s.side==='ally'?'味方':'敵')+(s.target==='all'?'全体':'1体'),a=[scope];if(s.power>0)a.push(`${s.element}属性の${s.type==='magic'?'魔法':'物理'}で${s.power>=2?'大きな':s.power>=1.4?'強めの':''}ダメージ${s.hits>1?'（'+s.hits+'連撃）':''}`);if(s.status)a.push(`${Math.round((s.statusChance||0)*100)}%で${jp[s.status]}（耐性で変動）`);if(s.heal||s.revive)a.push(`${s.revive?'蘇生し':'HPを'}最大HPの${Math.round((s.healRate??.15)*100)}%回復`);const buffs=[['強化',s.buff],['弱体',s.debuff],['自分を強化',s.selfBuff],['味方全体を強化',s.partyBuff]];for(const [label,b]of buffs)if(b)a.push(`${label}：${Object.entries(b).map(([k,v])=>k.toUpperCase()+(v>0?'+':'')+Math.round(v*100)+'%').join('・')}（${s.duration||3}ラウンド）`);if(s.guard||s.selfGuard||s.partyGuard)a.push(`${s.partyGuard?'味方全体':s.selfGuard?'自分':'対象'}の被ダメージを${Math.round((s.guard||s.selfGuard||s.partyGuard)*100)}%軽減（${s.duration||3}ラウンド）`);if(s.selfHeal||s.partyHeal)a.push(`${s.partyHeal?'味方全体':'自分'}のHPを${Math.round((s.partyHeal||s.selfHeal)*100)}%回復`);if(s.mpHeal)a.push(`MPを${Math.round(s.mpHeal*100)}%回復`);if(s.cleanseChance)a.push(`状態異常を各${Math.round(s.cleanseChance*100)}%で解除`);if(s.selfCleanse)a.push('自分の状態異常を解除');if(s.splash)a.push('追加で敵全体を攻撃');if(s.follow)a.push(`${Math.round(s.follow.chance*100)}%で追撃（最大${s.follow.count||1}回）`);if(s.drain)a.push(`与えたダメージの${Math.round(s.drain*100)}%を吸収`);if(s.evasion||s.selfEvasion)a.push(`回避率+${Math.round((s.evasion||s.selfEvasion)*100)}%（${s.duration||3}ラウンド）`);if(s.elementDown)a.push(`${Object.keys(s.elementDown).join('・')}属性への耐性を下げる（${s.duration||3}ラウンド）`);if(s.crit)a.push(`会心率+${Math.round(s.crit*100)}%`);if(s.ignoreEvasion)a.push('回避されない');if(s.randomTargets)a.push('攻撃対象は各ヒットでランダム');if(s.multiElements)a.push(s.multiElements.join('→')+'の順に攻撃');if(s.lowHpScale)a.push('自分のHPが少ないほどダメージ増加');a.push('MP '+s.cost);return a.join('。')+'。';}
for(const s of Object.values(D.skills))s.description=describe(s);
window.MOBMON_COMPANION={describe,version:39};
})();
