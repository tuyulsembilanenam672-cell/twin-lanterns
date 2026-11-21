// Twin Lanterns — shared tuning for the whole game.
// One place for every number the other modules read: panel size, time,
// scoring, hints and the scene list. Nothing here draws anything.

export const PANEL_W = 640;
export const PANEL_H = 480;

// Time allowed for one scene, in seconds. The bar drains; at zero the
// scene is lost and the player may retry it.
export const SCENE_SECONDS = 150;

// Points for a found difference. A find made right after another find
// (no miss in between) adds the combo step, up to the combo cap.
export const FIND_POINTS = 100;
export const COMBO_STEP = 25;
export const COMBO_CAP = 100;

// A wrong click costs points and seconds. A hint costs points and is
// limited per scene; it rings a difference the player has not found yet.
export const MISS_POINTS = 10;
export const MISS_SECONDS = 3;
export const HINT_POINTS = 30;
export const HINTS_PER_SCENE = 3;
export const HINT_RING_MS = 4000;

// Finishing a scene pays the seconds left, times this, as a bonus.
export const TIME_BONUS_PER_SECOND = 5;

// How close a click must land to a difference centre to count, in panel
// pixels, added to the difference's own radius.
export const CLICK_SLOP = 12;

// The three scenes, in campaign order. Each scene module registers its
// own draw function and its list of differences; this list only names
// them for the HUD and the scene picker.
export const SCENES = [
  { id: 'market', name: 'Lantern Market', tag: 'Night market, paper lanterns and one sleepy cat' },
  { id: 'greenhouse', name: 'The Old Greenhouse', tag: 'Morning light, seedlings and a butterfly' },
  { id: 'cove', name: 'Lighthouse Cove', tag: 'Dusk at the cove, gulls over the boats' },
];

// Stars on the win screen: total score thresholds out of the perfect
// run (3 scenes x 7 finds x 100, plus combos and time bonuses).
export const STAR_CUTS = [1800, 2600, 3400];
