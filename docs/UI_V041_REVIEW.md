# v041 UI implementation — review candidate

Status: implemented and locally reviewed; **not approved as the entire visual redesign**. Parent visual review is pending. The source thread ID could not be resolved by the messaging tool (`thread not found`). This agent did not execute commit, push, or publication. At final inspection HEAD was ef8e8b3 (`up`) and the implementation files were already tracked with a clean diff; that repository state changed outside this agent's tool calls. The review docs and test scripts were still untracked. D: was not accessed.

## Changes

- Home: existing original brick-wall artwork and unchanged monster sprites, large adventure action, direct fusion / personal room / party links, secondary town facilities below.
- Fusion: new transparent apparatus over the existing room illustration, independent glow and parent layers, explicit selected-material quantities and result on the final confirmation. Existing atomic consumption/save and inheritance rules remain unchanged. Skippable presentation pauses while the document is hidden, and respects reduced motion. Birth already committed before presentation survives reload.
- Personal room: new finished background with simple bench/bookshelf, day/dusk lighting, display of a selected **actually owned** sticker. No interaction/petting system, Soul Record display, invented earned rewards, currency, daily task or growth mechanic. Preferences use an optional `roomDecor` save field; old saves need no migration.
- Party: original main 4 + super-sub 4 rules, persistent formation while browsing on 360px+, tap replacement, existing detail/skills access, name and attribute filters, IME commit support. At 320px the formation scrolls normally to preserve usable roster space.
- Map: all 18 campaign entries and existing season prerequisites determine branch paths and availability. Pan, real two-pointer pinch, zoom controls, current-location reset, select-then-depart flow, and drag-click suppression. Existing field corridors receive visible roads without changing collision, encounters or rewards.
- Deferred loading of new image elements, no background animation after screen removal, document-hidden animation pause, and reduced-motion support.

## Review images

`tests/screenshots/v041/` contains home, room, fusion, party and story at 320 / 360 / 390 / 430px, plus final consumption confirmation and birth result. Look at the 390px images first; review 320px for density.

## Verification

- `tests/journey_v041.cjs`: four widths / five screens, no horizontal overflow or broken images; old-save room defaults and acquired-sticker persistence; party search/swap retains eight unique slots; map graph comes from campaign data; zoom/drag/cancel; duplicate fusion call plus skip consumes exactly two souls and saves one child; reduced motion.
- `tests/journey_lifecycle_v041.cjs`: IME composition, scrolling with visible party formation, real two-pointer pinch, expedition room guard and return, material/result confirmation, simulated document visibility pause, skip, mid-birth reload recovery, reachable room controls.
- `node tests/smoke.js`: passed, 213 monsters / 91 fixed fusions / 120 records.
- `node tests/companion_contract.cjs`: passed, no duplicate/same-record errors.
- Syntax checks passed for game.js, exploration.js and journey-ui.js.

The lifecycle visibility test simulates the document-hidden signal; this is not a claim of physical-device pause/resume coverage. No physical phone / real on-screen keyboard / notched-device safe-area check was available. Insets use the existing safe-area variables plus scoped screen bounds.

## Remaining scope / review decisions

- Parent visual sign-off is still needed. This is a review candidate, not a full-quality completion declaration.
- Home and fusion room backgrounds reuse existing art. The fusion background still contains its original orb behind the new foreground device; a dedicated clean background would improve separation. No additional generation was spent for this.
- The world map uses the existing area art and tree assets on a procedural route layout. It is functional but not a newly illustrated bespoke world map.
- Room walls, floor, bench and shelf are baked into the new background. Individual furniture placement / wall and floor replacement is not implemented. Its editable features are light and owned-sticker display.
- Existing lab/shop/castle/battle screens were not redesigned wholesale. Core combat, progression, training and unlock rules are unchanged.

## Files and recovery

Added `js/journey-ui.js`, `css/journey-ui.css`, two PNG assets, these review notes and two focused test harnesses. `index.html` loads the module; `game.js` uses narrow presentation hooks; `exploration.js` delegates the destination selector while preserving exploration logic.

Before-edit copies of the three existing edited files are preserved in `C:/Users/CB-Me/Documents/Codex/2026-10-08/task-3/before-*`. These contain the existing dirty changes. Do not use Git reset to remove this task's changes.

## Generated assets

Built-in image generation, two calls, no retries, no API CLI or key used. Exact prompts are in `docs/UI_V041_GENERATION.json`.

- `assets/scenes/room-v041.png`: 1024×1536, 2,187,653 bytes. SHA256 `b081f0a65a025f75b32dc5d25b1ffcf0ab1ef971c718fe1c9a494d05bab8f94a`.
- `assets/scenes/fusion-device-v041.png`: 1254×1254, 1,545,113 bytes, transparent. SHA256 `c244e23753b757202aa7411f2be0bf5301916512f2dab25ade19074528cf685a`.

Device/room art was inspected before integration. Original monster sprites were not edited.
