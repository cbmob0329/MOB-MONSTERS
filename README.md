# MOB MONSTERS v0.2.1 — MOB STORY UI REBUILD

前回の v0.2 UI を破棄し、ユーザー提供の `MOB-QUEST-v171-TEST-LEVEL200-QUEST-LOCK-FIX.zip` を画面設計のベンチマークとして、MOB MONSTERS の UI 層を再構築した修正版です。

## 今回の基準

MOB QUEST v171 の以下の設計を基準にしました。

- 全画面背景＋ゲーム専用HUDという構成
- HOMEを「メニュー一覧」ではなくゲームのメインステージとして見せる
- キャラクター画像を大きく使う
- 画面別に見た目と情報階層を変える
- BATTLE は敵フィールド / 味方HUD / 行動バナー / コマンド領域を明確に分離
- 戦闘終了直後に画面遷移せず、専用 RESULT → NEXT を挟む
- ボタンを文字だけで済ませず、専用アイコンと状態表現を持たせる
- スマホ縦画面で片手操作しやすい下部コマンド設計

## v0.2.1 で再構築した画面

- HOME：4体の編成モンスターを主役にしたステージ型メイン画面
- PARTY：MAIN 4 / SUPER SUB 2 / SUB 4 を役割別に大きく表示
- MONSTERS：コレクションカード＋専用 MONSTER DOSSIER 詳細
- STORY：SEASONレール＋FLOOR/AREAのルート表示＋BATTLE/WARP MAPLE
- SOUL BANK：SOULをカードコレクションとして表示
- SOUL FUSION：2ソケット＋REACTOR型の専用融合画面、候補カード、誕生演出
- SOUL RECORD：RECORD専用カード、Lv30/Lv70ルール、10マイルストーンのタイムライン
- ARENA：F→MOBのランクロード、3勝ゲージ、昇格戦10vs10表示
- BATTLE：全画面戦闘ステージ、敵4体、味方4体HUD、SUPER/SUB、ターゲット選択、専用コマンドアイコン、ダメージ演出
- RESULT：VICTORY / DEFEAT、4体表示、TURN/ALLY/EXP/SOUL、報酬、NEXT
- SYSTEM：右上歯車からテストSOUL追加 / セーブ初期化

## COREは維持

ゲームデータは v0.1 から変更していません。

- `js/data.js` SHA-256: `aa548fd9ae5fa0c7543052485bd53ca90ae16665bc225e83c7ddfc7725d4be90`
- v0.1 CORE の `js/data.js` と完全一致
- セーブキー `mob_monsters_core_v001` を維持
- 213 monsters / 30 passives / 120 records / 91 fixed fusions / 20 record fusions / 10 seasons / 9 areas

探索経済・MOB化詳細など、引き継ぎ書で未確定の項目は今回も勝手に確定していません。

## 画像素材について重要

提供された MOB QUEST v171 ZIP は HTML/CSS/JS 本体が中心で、コード内で参照される `back/`, `enemy/`, `boss/`, `icon/`, `mqicon/`, `play/` 等の実画像フォルダ自体は ZIP に含まれていません。

MOB MONSTERS のモンスターデータにも既存MOB STORY系の相対画像パスが入っているため、実素材を同じ相対パスへ配置すればキャラクター画像へ切り替わります。素材が無い場合は名前由来のフォールバックを表示します。

今回のZIPには UI 用の交換可能なSVGプレースホルダーと戦闘コマンドSVGを同梱しています。最終的に本物の背景・メニュー画像を追加する場合も、COREロジックを書き換えず差し替えられる構造です。

## 起動

`index.html` を直接開くか、ローカルサーバーで起動してください。

```bash
python -m http.server 8000
```

## 検証

```bash
node --check js/data.js
node --check js/game.js
node tests/smoke.js
node tests/ui_runtime_smoke.js
```

上記を納品前に実行しています。
