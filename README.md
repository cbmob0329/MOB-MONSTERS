# MOB MONSTERS v0.1.0 CORE

MOB STORY / MOB QUEST の戦闘思想を土台にした、MOB MONSTERS の最初のプレイアブル・コアです。

## 起動

最短：`index.html` をブラウザで開いてください。

ローカルサーバーを使う場合（Python がある環境）：

```bash
python -m http.server 8000
```

その後 `http://localhost:8000/` を開きます。

GitHub Pages に置く場合も、そのまま静的サイトとして動く構成です。

## この CORE に入っているもの

- モンスター 213 体のデータ
- 10 種族（新規「ボス」含む）
- 30 種パッシブと全モンスターへの割当
- F～B=1枠 / A～SS=2枠 / MOB=3枠
- MOB STORY型 4 MAIN + 2 SUPER SUB + 4 SUB
- SPD順ターン制戦闘
- HP / MP / ATK / DEF / SPD / MAG / MND
- SUPER SUB の 2～5 ターンごとの自動行動
- SUPER SUB の敵全体攻撃被ダメージ 50%
- モンスター Lv1～99 / SOUL RECORD Lv1～70
- MAIN 100% / SUPER SUB 70% / SUB 30% の EXP・RECORD EXP 分配
- SOUL ドロップ（F 40% ～ SS 0.1%、MOB 0.03% は暫定）
- リトルミュージック +3pt と、名称未定の +7 / +12 / +20pt 加算枠
- SOUL → モンスター、モンスター → SOUL
- SOUL FUSION（同SOUL、固定、SECRET、系譜、通常候補）
- 通常FUSIONは既存モンスター候補・最大SS・ボス種族/MOBを通常生成しない
- Record Lv30 以上の継承候補
- 両Record MASTERによる RECORD FUSION
- 技の所持・使用数制限なし
- SOUL RECORD のマイルストーンは SKILL / STAT / PASSIVE / 耐性系などを混在可能
- SEASON 1～10
- 9エリア、各F Area1～4
- 1周目：1F～2F、2F Area4 BOSS
- 2周目：1F/2Fも通過（探索不要）→3F/4F、4F Area4 BOSS
- SEASON 10 クリアで薔薇の国解放フラグ
- キャンプ / ワープメープルで HOME 帰還 → 冒険再開
- 闘技場 F～SS + MOB Challenge
- 4vs4 を3勝 → 昇格戦 CREW BATTLE 10vs10
- 昇格戦は敗北しても再挑戦可能

## 画像について

MOB QUEST v170 と同様に、この CORE ZIP はゲームロジック中心です。`enemy/...` など既存MOB STORYの相対画像パスを参照します。
画像が無い状態でも、名前由来のフォールバック表示で操作確認できます。
既存素材フォルダを同じ相対パスへ追加すれば画像表示へ切り替わります。

## セーブ

`localStorage` のキー `mob_monsters_core_v001` を使用します。
MOB STORY のセーブキーとは別なので、同じブラウザでもMOB STORYの進行を上書きしません。

## まだ正式実装していないもの

ユーザー指示どおり、以下は現時点では最終仕様に固定していません。

- クリア後の詳細な「任意モンスターMOBランク化」UI・必要素材・コスト
- Area探索そのもののイベント/宝箱/キャンプ配置など
- ショップ・通貨・報酬経済の完成版
- 薔薇の国の内部探索構成
- +7 / +12 / +20% SOULドロップアイテムの正式名称

CORE TEST の初期10体、テストSOUL、テスト用所持アイテムは動作確認用で正式な初期配布ではありません。

## 暫定値

次の値は、明示仕様がまだないためコード上の調整値です。

- ボスモンスターの追加行動確率：35%
- 継承されたSOUL RECORDの開始Lv：1
- エリアごとの1周目/2周目ボス割当：既存MOB STORYとv0.8データを基にしたCORE用仮割当
- MOBランクSOUL自然ドロップ：0.03%

## 構成

- `index.html` - エントリー
- `css/style.css` - スマホ縦画面UI
- `js/data.js` - 213体 / 30パッシブ / RECORD / 耐性 / FUSION / 進行データ
- `js/game.js` - セーブ、育成、戦闘、SOUL、FUSION、ストーリー、闘技場
- `docs/CURRENT_SPEC.md` - 現行仕様の要約
- `docs/IMPLEMENTATION_NOTES.md` - 実装上の確定/暫定/保留
- `docs/MOB_MONSTERS_design_master_v08.xlsx` - 実装元データマスター
- `tests/smoke.js` - データ整合性スモークテスト
