export const ROUND_SECONDS = 60;
export const HOLE_OPTIONS = [3, 6, 9];
export const MULT = { 3: 1, 6: 2, 9: 3 }; // points multiplier per hole count
export const POINTS_BASE = 10;

// Difficulty ramps with the number of hits, up to rampHits
export const DIFF = {
  startInterval: 900, // ms between spawns at the start
  endInterval: 330,
  startUp: 1100, // ms a mole stays up
  endUp: 450,
  rampHits: 40,
};

export const TIMING = { rise: 140, sink: 140, hit: 200, depth: 26, swing: 240 };

const COLS = [153, 215, 277];
const row = (y) => COLS.map((x) => [x, y]);

export const LAYOUTS = {
  3: row(120),
  6: [...row(100), ...row(142)],
  9: [...row(90), ...row(124), ...row(158)],
};

export const COMBO_TIERS = [
  { at: 0, mult: 1 },
  { at: 5, mult: 2 },
  { at: 10, mult: 3 },
  { at: 20, mult: 4 },
];
export const COMBO_BREAK_POPUP = 3; // show "COMBO LOST" for streaks this long or longer

export const comboTier = (streak) => {
  let tier = 0;
  COMBO_TIERS.forEach((t, i) => {
    if (streak >= t.at) tier = i;
  });
  return tier;
};

export const SHAKE = { hit: 2, tierUp: 4, ms: 160 };
export const DEFAULT_MUTED = true;