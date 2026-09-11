# MOB MONSTERS v0.2.8 — 冒険・戦闘演出とモブカセットテープ

背景付きスワイプ式エリア選択、探索マップ拡大、戦闘表示、技アニメーション、ワープ・闘技場演出を更新しました。背景・技・探索用画像を同梱した置き換え用フルパッケージです。変更点・計算仕様・検証結果は [v0.2.8リリース資料](docs/RELEASE_v0028.md) を参照してください。

以下は過去の更新履歴です。

# MOB MONSTERS v0.2.7 — タッチ操作と接敵演出

長押し・ズーム抑制、探索速度アップ、モンスターの跳躍と停止、戦闘開始の専用演出を追加しました。[変更点と検証](docs/RELEASE_v0027.md)。

スマホで画面と中央のバーチャルパッドが同時に収まる配置に変更。通常エリアは表示範囲の3×3、AREA 4は1画面サイズです。[変更点と検証](docs/RELEASE_v0026.md)。

タイトル画面とロボ操作によるAREA探索を追加しました。実装内容・仮設定・検証方法は [v0.2.5リリース資料](docs/RELEASE_v0025.md) を参照してください。

以下はv0.2.4までの履歴です。

ポップアップ位置と画像ロードを改善しました。[v0.2.4の変更・検証結果](docs/RELEASE_v0024.md)。

スマホ縦画面向けのHOME・パーティー編成・ソウルラボ・育成UIを更新したフル実装です。

- HOMEに4メイン・2スーパーサブ・4控え。右側の5施設と、下部HOME／編成／設定。
- 編成のタップ交換・長押し移動、5列一覧、4種類ソート、追加後のスクロール保持。
- ソウルの個別選択・確認、未発見候補、継承選択、合体・誕生演出。
- モンスター詳細からSP育成。設定に7種類のテストトグル。

**導入・変更点・素材差し替え・検証・残課題は [v0.2.3リリース資料](docs/RELEASE_v0023.md) を参照してください。**

フォルダー内を既存サイトへ丸ごとコピーして置き換えます。ビルド不要。`node tools/preview.cjs` でプレビューできます。
セーブキーは `mob_monsters_core_v001` のままです。背景を同梱し、モンスター／技は既存GitHub素材を読み込みます。

---

以下は引き継いだv0.2.2の履歴です。現行仕様は上記のリリース資料を優先してください。

This build replaces the v0.2.1 placeholder-background direction with live MOB QUEST GitHub artwork while preserving the MOB MONSTERS CORE data/save format.

## v0.2.2 changes
- HOME uses the actual `back/rpgmain.png` source and real party monster art.
- STORY uses the actual area/floor `back/` artwork.
- ARENA and SOUL use existing MOB QUEST background assets instead of local placeholder scenes.
- Battle uses actual field backgrounds and actual monster art for both enemy and ally field presentation.
- The active ally steps forward in the battle field presentation.
- Technique execution now plays original source animation frames from `skill/` / `skill2/` when defined in the data.
- Skills without source frames fall back to an element-appropriate `skill/` animation.
- Missing event monster art paths were filled only where an exact MOB QUEST non-figure source path was verified.
- `startStoryBattle()` was restored so the STORY battle button has a valid runtime entry point.
- Figure, weapon and armor art are excluded from the runtime asset resolver.

## Asset behavior
Artwork is not duplicated into this ZIP. `js/assets.js` resolves image paths against the existing MOB QUEST GitHub repository. See `docs/GITHUB_ASSET_POLICY.md`.

## Save compatibility
The save key remains `mob_monsters_core_v001`.

## Validation
- `node --check js/assets.js`
- `node --check js/asset_map.js`
- `node --check js/game.js`
- `node tests/smoke.js`
- `node tests/asset_contract.js`
- `node tests/ui_runtime_smoke.js`

Expected core counts: 213 monsters / 30 passives / 120 records / 91 fixed fusions / 20 record fusions / 10 seasons / 9 standard story areas.
