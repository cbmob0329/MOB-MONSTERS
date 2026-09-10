# MOB MONSTERS v0.2.2 — GitHub Assets

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
