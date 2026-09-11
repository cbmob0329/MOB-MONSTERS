# MOB QUEST v171 UI BENCHMARK

今回のUI再構築で参照した実装上の差です。

## MOB QUEST v171

- 19 screen sections
- 約430 static buttons
- 約214 image elements
- 約170 animation/keyframe definitions
- HOME / ADVENTURE / BATTLE 等がそれぞれ専用の画面構造を持つ
- BATTLE は背景、敵フィールド、FX、カットイン、味方HUD、コマンド、RESULTを分離

## 前回の MOB MONSTERS v0.2 の問題

- 1つの dynamic shell へ汎用パネルを差し替える比率が高かった
- 背景・キャラクター・情報パネルのレイヤー設計が弱かった
- コマンドが文字/記号主体だった
- 画面固有の演出が不足していた
- 戦闘 RESULT が独立画面ではなく短時間で遷移していた
- MOB QUEST の完成度を「CSSの見た目」だけで捉えてしまっていた

## v0.2.1 方針

MOB QUEST のコードをそのまま移植するのではなく、MOB MONSTERS の既存COREと保存互換を保ちながら、ゲーム画面としての情報階層と演出構造を合わせる。
