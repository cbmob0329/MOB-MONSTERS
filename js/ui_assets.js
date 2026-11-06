/* Replace individual paths here when dedicated art is ready. No game logic changes needed.
 * home/lab/castle: local image paths. lilith/chibiLilith: MOB QUEST asset paths.
 * soulOverrides: optional dedicated soul images keyed by monster name.
 */
window.MOBMON_UI_ASSETS={
  heroes:{denden:'',pink:''}, // Finished protagonist art can be assigned here.
  lilrilith:'', // Falls back to existing chibi art until supplied.
  robotBodies:{}, // Optional {hopper:{'001':'path',...},shell:{...}} replaces vector art.
  loading:'', // Optional loading-screen background, relative to site root.
  home:'back/002.png',
  lab:'back/003.png',
  castle:'assets/scenes/maojo3.png',
  lilith:'play/14.png',
  chibiLilith:'play/14.png',
  merchant:'play/001.png', // Provisional Mob Mita art; replace when the dedicated image is specified.
  soulOverrides:{}
};
