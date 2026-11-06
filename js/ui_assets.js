/* Replace individual paths here when dedicated art is ready. No game logic changes needed.
 * Facility scenes and field atlases are site-relative paths; replace artwork here.
 * lilith/chibiLilith: existing MOB QUEST character asset paths.
 * soulOverrides: optional dedicated soul images keyed by monster name.
 */
window.MOBMON_UI_ASSETS={
  heroes:{denden:'',pink:''}, // Finished protagonist art can be assigned here.
  lilrilith:'', // Falls back to existing chibi art until supplied.
  robotSheets:{hopper:'robo/hopper-mob-v042.png?v=045',shell:'robo/shell-mob-v042.png?v=045'}, // 2x2: front, back, left, right.
  robotBodies:{}, // Optional {hopper:{'001':'path',...},shell:{...}} replaces illustrated art.
  loading:'', // Optional loading-screen background, relative to site root.
  home:'assets/scenes/town-plaza-v046.webp',
  lab:'assets/scenes/soul-lab-v046.webp',
  castle:'assets/scenes/castle-v046.webp',
  shop:'assets/scenes/shop-v046.webp',
  lilith:'play/14.png',
  chibiLilith:'play/14.png',
  merchant:'play/001.png', // Provisional Mob Mita art; replace when the dedicated image is specified.
  gacha:'assets/scenes/sticker-machine-v046.webp',
  arena:'assets/scenes/arena-v046.webp',
  fieldProps:'assets/scenes/field-props-v046.webp', // 3x3: cactus/lamp/coral; totem/basalt/column; books/vent/lava.
  terrain:'assets/scenes/terrain-atlas-v046.webp', // 3x3: meadow/desert/rural; neon/seabed/village; magma/castle/book.
  soulOverrides:{}
};
