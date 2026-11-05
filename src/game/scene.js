import { W, H } from "./constants";

const rect = (c, col, x, y, w, h) => {
  c.fillStyle = col;
  c.fillRect(x, y, w, h);
};

function sky(c) {
  rect(c, "#7ec8f2", 0, 0, W, 56);
  rect(c, "#5db6ec", 0, 0, W, 18);
  rect(c, "#ffffff", 150, 14, 26, 5);
  rect(c, "#ffffff", 156, 10, 14, 5);
  rect(c, "#ffffff", 250, 26, 30, 5);
  rect(c, "#ffffff", 258, 22, 16, 5);
}

function field(c) {
  for (let y = 56; y < H; y += 8) {
    for (let x = 0; x < W; x += 8) {
      rect(c, ((x + y) / 8) % 2 === 0 ? "#4caf50" : "#45a049", x, y, 8, 8);
    }
  }
  rect(c, "#2f8f3a", 0, 56, W, 3);
}

// X logo "engraved": light edge offset by 1px, dark fill on top
function xLogo(c, cx, cy, S) {
  const half = S / 2;
  const strokes = (ox, oy, col) => {
    c.fillStyle = col;
    for (let i = 0; i <= S; i++) {
      const y = cy - half + i + oy;
      c.fillRect(cx - half + i - 4 + ox, y, 9, 1); // thick stroke
      if (Math.abs(i - half) > 7) {
        c.fillRect(cx + half - i - 1 + ox, y, 3, 1); // thin stroke, broken at center
      }
    }
  };
  strokes(1, 1, "#7fd183");
  strokes(0, 0, "#2b7a30");
}

function beach(c) {
  rect(c, "#1f5d27", 0, 82, 114, H - 82); // frame
  rect(c, "#bfe6fb", 0, 84, 112, 22); // sky
  rect(c, "#ffd84a", 86, 88, 6, 10); // sun
  rect(c, "#ffd84a", 84, 90, 10, 6);
  rect(c, "#2d8fd5", 0, 106, 112, 22); // sea
  for (let i = 0; i < 10; i++) {
    rect(c, "#6cc3f5", (i * 23) % 100 + 4, 110 + ((i * 7) % 14), 5, 1);
  }
  rect(c, "#ffffff", 0, 128, 112, 2); // foam
  rect(c, "#f0d9a0", 0, 130, 112, H - 130); // sand
  for (let i = 0; i < 40; i++) {
    rect(c, "#d9bf80", ((i * 37) % 106) + 2, 134 + ((i * 53) % 42), 2, 1);
  }

  // palm tree
  for (let k = 0; k < 30; k++) {
    rect(c, "#8b5a2b", 88 + Math.floor(k / 8), 128 - k, 3, 1);
  }
  const cx = 92;
  const cy = 97;
  const leaf = "#2e9e4a";
  const dark = "#217a38";
  rect(c, leaf, cx - 10, cy - 2, 9, 3);
  rect(c, leaf, cx + 2, cy - 2, 9, 3);
  rect(c, dark, cx - 6, cy - 6, 5, 3);
  rect(c, dark, cx + 2, cy - 6, 5, 3);
  rect(c, leaf, cx - 2, cy - 9, 4, 3);
  rect(c, dark, cx - 9, cy + 1, 4, 3);
  rect(c, dark, cx + 6, cy + 1, 4, 3);
  rect(c, "#5a3a1a", cx - 1, cy + 1, 2, 2);
  rect(c, "#5a3a1a", cx + 2, cy + 1, 2, 2);
}

// Draw once to an offscreen canvas, then blit every frame
export function createScene() {
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d");
  sky(c);
  field(c);
  xLogo(c, 215, 120, 60);
  beach(c);
  return cv;
}