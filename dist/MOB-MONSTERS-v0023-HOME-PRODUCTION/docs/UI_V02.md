# MOB MONSTERS v0.2 UI 本番化

## 目的

v0.1 COREのゲームロジック、データ、保存互換を維持したまま、スマホ縦画面を前提に主要画面の情報設計と視認性を本番向けに更新する。

## v0.2で更新した範囲

- 専用トップヘッダー：G / SOUL所持数を常時表示
- HOME：メインビジュアル、現在ミッション、所持数/平均Lv/MASTER数、主要導線
- PARTY：4 MAIN + 2 SUPER SUB + 4 SUBを色・ラベル・役割で明確化
- MONSTERS：ランクフィルタ、詳細ヒーロー、7能力+MP、固有パッシブ、属性/状態耐性、RECORD進捗、習得技
- STORY：SEASONカード、現在地、周回、FLOOR/AREAノードを一画面で把握できる構造
- SOUL：所持SOUL、FUSION LAB、固定/系譜/通常候補の視認性を改善
- SOUL FUSION：候補選択後に誕生専用演出を表示
- SOUL RECORD：Lv / REXP / MASTER / 10マイルストーンの進捗表示を整理
- ARENA：現在ランク、3勝→昇格戦、CREW BATTLE 10vs10の進行をカード化
- BATTLE HUD：敵/味方、HP/MP、SUPER/SUB、ログ、6コマンドをスマホ向けに再構成
- 下部ナビ：絵文字依存をやめ、CSS描画のアイコンへ変更
- 370px以下・低い画面向けの追加レスポンシブ調整

## 画像差し替えスロット

`assets/ui/` に以下のPNGを置くだけで主要背景を交換できる。

- `home_bg.png`
- `story_bg.png`
- `battle_bg.png`

画像が存在しない場合でもCSSのフォールバック背景でUIは動作する。

モンスター画像は従来どおり `js/data.js` の `image` 相対パス（例: `enemy/01.png`）を使用する。画像が未配置なら文字シンボルへフォールバックする。

## 互換性

- localStorageキーは `mob_monsters_core_v001` のまま維持
- セーブデータversionは1のまま維持
- `js/data.js` のCOREデータは変更しない
- 戦闘計算、FUSIONルール、RECORDルール、SEASON進行、ARENA解放条件はv0.1 COREを維持
- 未確定仕様（MOB化詳細、探索イベント、経済、薔薇の国内部など）は固定していない

## 検証

- `node --check js/game.js`
- `node --check js/data.js`
- `node tests/smoke.js`
- `node tests/ui_runtime_smoke.js`

`tests/smoke.js` は213体 / 30パッシブ / 120 RECORD / 固定FUSION 91 / RECORD FUSION 20 / SEASON 10 / 9エリアを検証する。


## v0.2.1 REBUILD
前回v0.2 UIは破棄。MOB QUEST v171をベンチマークにUI層を再構築。詳細は MOB_QUEST_V171_BENCHMARK.md を参照。
