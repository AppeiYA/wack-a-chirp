import { TIMING } from "./config";

const clamp01 = (u) => Math.max(0, Math.min(1, u));
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- holes ---------- */

function ellipse(ctx, col, x, y, rx, ry, dyFrom = -ry, dyTo = ry) {
  ctx.fillStyle = col;
  for (let dy = dyFrom; dy <= dyTo; dy++) {
    const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
    if (half > 0) ctx.fillRect(x - half, y + dy, half * 2, 1);
  }
}

export function drawHole(ctx, x, y) {
  ellipse(ctx, "#6e4a2a", x, y, 17, 8); // dirt ring
  ellipse(ctx, "#2a1a0e", x, y, 14, 6); // dark hole
}

// Front lip, drawn after the mole so it looks like it's coming out of the hole
export function drawHoleFront(ctx, x, y) {
  ellipse(ctx, "#6e4a2a", x, y, 17, 8, 3, 8);
}

/* ---------- moles ---------- */

const MOLE_PAL = { b: "#8b5e3c", N: "#f08aa0", K: "#111111", W: "#ffffff" };

const MOLE = [
  ".bb......bb.",
  ".bbbbbbbbbb.",
  ".bbbbbbbbbb.",
  ".bbKWbbKWbb.",
  ".bbKKbbKKbb.",
  ".bbbbNNbbbb.",
  ".bbbbNNbbbb.",
  ".bbbbWWbbbb.",
  ".bbbbWWbbbb.",
  ".bbbbbbbbbb.",
  ".bbbbbbbbbb.",
  ".bbbbbbbbbb.",
];

const MOLE_HIT = MOLE.map((r, i) =>
  i === 3 ? ".bKbKbbKbKb." : i === 4 ? ".bbKbbbbKbb." : r
);

export function moleOffset(m) {
  if (m.state === "rising") {
    const u = clamp01(m.t / TIMING.rise);
    return TIMING.depth * (1 - u) * (1 - u);
  }
  if (m.state === "sinking") return TIMING.depth * clamp01(m.t / TIMING.sink);
  return 0;
}

export function drawMole(ctx, hx, hy, m) {
  const hit = m.state === "hit";
  const rows = hit ? MOLE_HIT : MOLE;
  const sy = hit ? 1 : 2; // squash when hit
  const top = hy + 2 - 12 * sy + moleOffset(m);

  ctx.save();
  ctx.beginPath();
  ctx.rect(hx - 20, hy - 40, 40, 43); // clip at the hole's middle
  ctx.clip();
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const c = rows[y][x];
      if (c === ".") continue;
      ctx.fillStyle = MOLE_PAL[c];
      ctx.fillRect(hx - 12 + x * 2, top + y * sy, 2, sy);
    }
  }
  ctx.restore();
}

/* ---------- porcupine (hazard) ---------- */

const PORCUPINE_PAL = {
  Y: "#ffd84a", // bright quill tips
  S: "#d4a373", // quill shaft
  b: "#4a3324", // dark bristly body
  N: "#ff4d4d", // red danger nose
  K: "#111111", // eye pupil
  W: "#ffffff", // eye white
};

const PORCUPINE = [
  "Y.S..YY..S.Y",
  ".SSSYYYYSSS.",
  "SYYSbbbbbSYY",
  "SSbbKWbbKWbS",
  ".SbbKKbbKKbS",
  "SYbbbNNbbbYS",
  ".SbbbWWbbbbS",
  "SYSSSSSSSSYS",
  ".SbbbbbbbbS.",
  "SYSSSSSSSSYS",
  ".YYYYYYYYYY.",
  "............",
];

const PORCUPINE_HIT = [
  "Y.Y.YYYY.Y.Y",
  ".SSSYYYYSSS.",
  "SYYSbbbbbSYY",
  "SSbbKKbbKKbS",
  ".SbbKKbbKKbS",
  "SYbbbNNbbbYS",
  ".SbbbWWbbbbS",
  "SYSSSSSSSSYS",
  ".SbbbbbbbbS.",
  "SYSSSSSSSSYS",
  ".YYYYYYYYYY.",
  "............",
];

export function drawPorcupine(ctx, hx, hy, m) {
  const hit = m.state === "hit";
  const rows = hit ? PORCUPINE_HIT : PORCUPINE;
  const sy = hit ? 1 : 2;
  const top = hy + 2 - 12 * sy + moleOffset(m);

  ctx.save();
  ctx.beginPath();
  ctx.rect(hx - 20, hy - 40, 40, 43);
  ctx.clip();
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const c = rows[y][x];
      if (c === ".") continue;
      ctx.fillStyle = PORCUPINE_PAL[c];
      ctx.fillRect(hx - 12 + x * 2, top + y * sy, 2, sy);
    }
  }
  ctx.restore();
}

/* ---------- hammer ---------- */

const HPAL = { k: "#a8743f", H: "#d9a066", h: "#b5651d", D: "#7a3f10" };
const HANDLE = ".".repeat(9) + "kHHH" + ".".repeat(9);
const CAP = ".." + "D".repeat(18) + "..";
const HBODY = "." + "D" + "h".repeat(18) + "D" + ".";
const HAMMER = [...Array(14).fill(HANDLE), CAP, ...Array(6).fill(HBODY), CAP];

let hammerCv = null;
function getHammer() {
  if (hammerCv) return hammerCv;
  hammerCv = document.createElement("canvas");
  hammerCv.width = 22;
  hammerCv.height = HAMMER.length;
  const c = hammerCv.getContext("2d");
  HAMMER.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === ".") continue;
      c.fillStyle = HPAL[row[x]];
      c.fillRect(x, y, 1, 1);
    }
  });
  return hammerCv;
}

const KEYS = [
  { t: 0, a: 35, dx: 0, dy: -14 },
  { t: 0.3, a: 62, dx: 4, dy: -26 }, // wind up
  { t: 0.5, a: 8, dx: 0, dy: -2 }, // slam
  { t: 1, a: 35, dx: 0, dy: -14 }, // back to floating
];

function swingPose(s) {
  for (let i = 1; i < KEYS.length; i++) {
    if (s <= KEYS[i].t) {
      const k0 = KEYS[i - 1];
      const k1 = KEYS[i];
      const u = (s - k0.t) / (k1.t - k0.t);
      return {
        a: lerp(k0.a, k1.a, u),
        dx: lerp(k0.dx, k1.dx, u),
        dy: lerp(k0.dy, k1.dy, u),
      };
    }
  }
  return KEYS[KEYS.length - 1];
}

export function drawHammer(ctx, px, py, swingElapsed, now) {
  const swinging = swingElapsed < TIMING.swing;
  const p = swinging
    ? swingPose(swingElapsed / TIMING.swing)
    : { a: 35, dx: 0, dy: -14 + Math.sin(now / 220) * 1.5 }; // hover bob

  ctx.save();
  ctx.translate(Math.round(px + p.dx), Math.round(py + p.dy));
  ctx.rotate((p.a * Math.PI) / 180);
  ctx.drawImage(getHammer(), -11, -18); // pivot at the center of the head
  ctx.restore();
}