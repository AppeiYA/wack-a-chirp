export const PAL = {
  K: "#1b1714", S: "#8c5a3a", s: "#6b4128", G: "#2447c9", g: "#8fb0ff",
  J: "#4b4f48", W: "#f3f2ee", w: "#c8c7c0", R: "#c4262e", r: "#8a1a20",
  Y: "#cfcfcf", L: "#101012", l: "#45454a", P: "#202026", p: "#14141a",
  C: "#d6ecff", D: "#f2c14e", d: "#c8922a", B: "#ffd84a",
};

// 24 x 31 grid. "." is transparent.
export const BODY = [
  ".......KKKKKKKKKK.......",
  ".......KKKKKKKKKK.......",
  ".......SSSSSSSSSS.......",
  ".......SSSSSSSSSS.......",
  ".......GgGGSSGgGG.......",
  ".......GGGGSSGGGG.......",
  ".......SSSSssSSSS.......",
  ".......KSSKKKKSSK.......",
  ".......KKKSSSSKKK.......",
  ".......KKKKKKKKKK.......",
  "..JJJJJJJJJJJJJJJJJJJJ..",
  "..JJJJJJWWWWWWWWJJJJJJ..",
  "..JJJJJJWwWWWWwWJJJJJJ..",
  "..JJJJJJWWWWWWWWJJJJJJ..",
  "..JJJJJJWWWWWWWWJJJJJJ..",
  "..JJJJJJWWWWWWWWJJJJJJ..",
  "..JJJJJJWWWWWWWWJJJJJJ..",
  "..JJJJJJWWWWWWWWJJJJJJ..",
  "..WWWWJJWWWWWWWWJJYYYY..",
  "..SSSSJJLLLLLLLLJJSSSS..",
  "......PPPPPppPPPPP......",
  "......PPPPPppPPPPP......",
  "......PPPPPppPPPPP......",
  "......PPPPPppPPPPP......",
  "......PPPPPppPPPPP......",
  "......PPPPPppPPPPP......",
  "......PPPPPppPPPPP......",
  "......PPPPPppPPPPP......",
  ".....LLLLLLLLLLLLLL.....",
  ".....LlLLLLLLLLLLlL.....",
  ".....KKKKKKKKKKKKKK.....",
].map((r) => {
  if (import.meta.env.DEV && r.length !== 24) console.warn("Bad sprite row:", r);
  return r.padEnd(24, ".").slice(0, 24);
});

// Overlays, positioned in sprite-grid coordinates
export const TROPHY = { x: 10, y: 14, rows: ["RRRR", ".RR.", "SSSS", ".rr."] };

export const FLUTE = {
  rows: ["CDC", "CDC", "CdC", "SSS", ".C.", ".C.", "CCC"],
};

export const CHIN_HAND = { x: 10, y: 9, rows: ["SSSS", "SsSS"] };

export const BUBBLE = {
  x: 18,
  y: 0,
  rows: [
    ".WWWWW.",
    "WWKKKWW",
    "WWWWKWW",
    "WWWKWWW",
    "WWWWWWW",
    "WWWKWWW",
    ".WWWWW.",
  ],
};