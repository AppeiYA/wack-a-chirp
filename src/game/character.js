import { PAL, BODY, TROPHY, FLUTE, CHIN_HAND, BUBBLE } from "./sprites";

const SCALE = 2;
const ORIGIN = { x: 10, y: 114 }; // lower-left of the canvas
const FOOT_ROW = 28; // rows from here down don't bob

function blit(ctx, rows, gx, gy, lift = 0) {
  for (let y = 0; y < rows.length; y++) {
    const gridY = gy + y;
    const drawY = gridY < FOOT_ROW ? gridY - lift : gridY;
    for (let x = 0; x < rows[y].length; x++) {
      const c = rows[y][x];
      if (c === ".") continue;
      ctx.fillStyle = PAL[c];
      ctx.fillRect(
        ORIGIN.x + (gx + x) * SCALE,
        ORIGIN.y + drawY * SCALE,
        SCALE,
        SCALE
      );
    }
  }
}

export function drawCharacter(ctx, pose, elapsed, now) {
  const lift = Math.floor(now / 450) % 2; // idle bob

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(ORIGIN.x + 3 * SCALE, ORIGIN.y + 31 * SCALE, 18 * SCALE, 2);

  blit(ctx, BODY, 0, 0, lift);

  if (pose === "idle") {
    blit(ctx, TROPHY.rows, TROPHY.x, TROPHY.y, lift);
  }

  if (pose === "success") {
    const t = Math.min(elapsed / 700, 1); // raise the glass
    const fx = Math.round(21 - 5 * t);
    const fy = Math.round(9 - 5 * t);
    blit(ctx, FLUTE.rows, fx, fy, lift);
    if (t >= 1) {
      const a = Math.floor(now / 120) % 2 === 0;
      blit(ctx, ["B"], a ? fx + 4 : fx - 2, a ? fy : fy + 2, lift);
    }
  }

  if (pose === "miss") {
    blit(ctx, CHIN_HAND.rows, CHIN_HAND.x, CHIN_HAND.y, lift);
    if (elapsed > 150) blit(ctx, BUBBLE.rows, BUBBLE.x, BUBBLE.y, lift);
  }
}