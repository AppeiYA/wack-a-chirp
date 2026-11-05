import { W } from "./constants";
import {
  LAYOUTS, MULT, POINTS_BASE, ROUND_SECONDS, DIFF, TIMING,
  COMBO_TIERS, COMBO_BREAK_POPUP, SHAKE, comboTier,
} from "./config";
import { drawHole, drawHoleFront, drawMole, drawPorcupine, drawHammer, moleOffset } from "./actors";

const lerp = (a, b, t) => a + (b - a) * t;
const POPUP_MS = 600;
const EVENT_POPUP_MS = 900;
const CX = 215; // center of the field
const TIER_COLORS = ["#ffd84a", "#ffb13b", "#ff7a3b", "#ff4a4a"];
const tierColor = (t) => TIER_COLORS[Math.min(t, TIER_COLORS.length - 1)];

export class Game {
  constructor(events) {
    // events: onHit, onMiss, onSwing, onScore, onCombo, onTick, onEnd, onPorcupineHit
    this.ev = events;
    this.running = false;
    this.paused = false;
    this.isTouch = false;
    this.px = W / 2;
    this.py = 90;
    this.swingAt = -1e9;
    this.popups = [];
    this.particles = [];
    this.score = 0;
    this.hits = 0;
    this.whiffs = 0;
    this.escaped = 0;
    this.porcupineHits = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.comboPop = 0;
    this.shakeT = 0;
    this.shakeMag = 0;
    this.reducedMotion =
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    this.configure(3);
  }

  configure(holes) {
    this.holeCount = holes;
    this.holes = LAYOUTS[holes];
    this.mult = MULT[holes];
    this.moles = this.holes.map(() => ({
      state: "hidden", t: 0, upFor: 0, escaped: false, type: "mole",
    }));
  }

  start(holes) {
    this.configure(holes);
    this.score = 0;
    this.hits = 0;
    this.whiffs = 0;
    this.escaped = 0;
    this.porcupineHits = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.comboPop = 0;
    this.shakeT = 0;
    this.timeLeft = ROUND_SECONDS * 1000;
    this.lastSec = ROUND_SECONDS;
    this.spawnIn = 600;
    this.popups = [];
    this.particles = [];
    this.running = true;
    this.paused = false;
    this.ev.onScore(0);
    this.ev.onCombo({ streak: 0, mult: 1 });
    this.ev.onTick(ROUND_SECONDS);
  }

  pause() {
    if (this.running) {
      this.paused = true;
    }
  }

  resume() {
    if (this.running) {
      this.paused = false;
    }
  }

  stop() {
    if (!this.running) return;
    this.finish();
  }

  cancel() {
    this.running = false;
    this.paused = false;
    this.moles.forEach((m) => (m.state = "hidden"));
  }

  finish() {
    this.running = false;
    this.paused = false;
    this.moles.forEach((m) => (m.state = "hidden"));
    this.ev.onEnd({
      score: this.score,
      hits: this.hits,
      whiffs: this.whiffs,
      escaped: this.escaped,
      porcupineHits: this.porcupineHits,
      bestStreak: this.bestStreak,
    });
  }

  /* ---------- effects ---------- */

  kick(mag) {
    if (this.reducedMotion) return;
    this.shakeMag = mag;
    this.shakeT = SHAKE.ms;
  }

  getShake() {
    if (this.shakeT <= 0) return [0, 0];
    const m = this.shakeMag * (this.shakeT / SHAKE.ms);
    return [
      Math.round((Math.random() * 2 - 1) * m),
      Math.round((Math.random() * 2 - 1) * m),
    ];
  }

  burst(x, y, n, gold, quill = false) {
    const cols = quill
      ? ["#ffd84a", "#d4a373", "#382417", "#ff4d4d"]
      : gold
      ? ["#ffd84a", "#ffffff", "#ffb13b"]
      : ["#8b5e3c", "#c89b6d", "#ffd84a"];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 30 + Math.random() * 60;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 30,
        t: 0,
        life: 350 + Math.random() * 250,
        c: cols[Math.floor(Math.random() * cols.length)],
      });
    }
  }

  /* ---------- combo ---------- */

  breakStreak(kind) {
    const had = this.streak;
    const broke = had >= COMBO_BREAK_POPUP;
    if (broke) {
      this.popups.push({
        x: CX, y: 64, t: 0, life: EVENT_POPUP_MS, size: 11,
        text: "COMBO LOST", color: "#ff6b6b",
      });
    }
    this.streak = 0;
    if (had > 0) this.ev.onCombo({ streak: 0, mult: 1 });
    this.ev.onMiss({ kind, broke });
  }

  /* ---------- update ---------- */

  update(dt) {
    if (!this.running || this.paused) return;

    this.timeLeft -= dt;
    const sec = Math.max(0, Math.ceil(this.timeLeft / 1000));
    if (sec !== this.lastSec) {
      this.lastSec = sec;
      this.ev.onTick(sec);
    }

    const lvl = Math.min(this.hits / DIFF.rampHits, 1);
    const upFor = lerp(DIFF.startUp, DIFF.endUp, lvl);
    const interval =
      lerp(DIFF.startInterval, DIFF.endInterval, lvl) * Math.sqrt(3 / this.holeCount);

    this.spawnIn -= dt;
    if (this.spawnIn <= 0) {
      const free = [];
      this.moles.forEach((m, i) => m.state === "hidden" && free.push(i));
      if (free.length) {
        const i = free[Math.floor(Math.random() * free.length)];
        // Porcupines are a lot rarer than moles (~14% chance):
        const isPorcupine = Math.random() < 0.14;
        Object.assign(this.moles[i], {
          state: "rising",
          t: 0,
          upFor,
          escaped: false,
          type: isPorcupine ? "porcupine" : "mole",
        });
      }
      this.spawnIn = interval * (0.7 + Math.random() * 0.6);
    }

    for (const m of this.moles) {
      if (m.state === "hidden") continue;
      m.t += dt;
      if (m.state === "rising" && m.t >= TIMING.rise) {
        m.state = "up";
        m.t = 0;
      } else if (m.state === "up" && m.t >= m.upFor) {
        m.state = "sinking";
        m.t = 0;
        if (m.type === "mole") {
          this.escaped++;
          this.breakStreak("escape");
        }
        // Note: avoiding a porcupine is successful, so no escape penalty or streak break
      } else if (m.state === "sinking" && m.t >= TIMING.sink) {
        m.state = "hidden";
      } else if (m.state === "hit" && m.t >= TIMING.hit) {
        m.state = "sinking";
        m.t = 0;
      }
    }

    this.popups.forEach((p) => (p.t += dt));
    this.popups = this.popups.filter((p) => p.t < p.life);

    for (const p of this.particles) {
      p.t += dt;
      p.vy += 220 * (dt / 1000); // gravity
      p.x += p.vx * (dt / 1000);
      p.y += p.vy * (dt / 1000);
    }
    this.particles = this.particles.filter((p) => p.t < p.life);

    if (this.comboPop > 0) this.comboPop -= dt;
    if (this.shakeT > 0) this.shakeT -= dt;

    if (this.timeLeft <= 0) this.finish();
  }

  /* ---------- input ---------- */

  pointerMove(x, y) {
    if (this.paused) return;
    this.px = x;
    this.py = y;
  }

  pointerDown(x, y, now, slop = 0, isTouch = false) {
    this.px = x;
    this.py = y;
    this.isTouch = isTouch;
    if (!this.running || this.paused) return;
    this.swingAt = now;
    this.ev.onSwing();

    for (let i = this.moles.length - 1; i >= 0; i--) {
      const m = this.moles[i];
      if (m.state !== "rising" && m.state !== "up") continue;
      const off = moleOffset(m);
      if (off > 16) continue;
      const [hx, hy] = this.holes[i];
      if (Math.abs(x - hx) <= 15 + slop && y >= hy - 28 - slop + off && y <= hy + 6 + slop) {
        if (m.type === "porcupine") {
          this.hitPorcupine(m, hx, hy);
        } else {
          this.hitMole(m, hx, hy);
        }
        return;
      }
    }

    // Wrong whack: deduct 10 points
    this.whiffs++;
    const whiffPenalty = 10;
    this.score = Math.max(0, this.score - whiffPenalty);
    this.ev.onScore(this.score);
    this.popups.push({
      x: Math.round(x),
      y: Math.max(26, Math.round(y - 12)),
      t: 0,
      life: POPUP_MS,
      size: 10,
      text: `-${whiffPenalty}`,
      color: "#ff6b6b",
    });
    this.breakStreak("whiff");
  }

  hitPorcupine(m, hx, hy) {
    m.state = "hit";
    m.t = 0;
    this.porcupineHits++;
    const penalty = 20;
    this.score = Math.max(0, this.score - penalty);

    this.popups.push({
      x: hx,
      y: hy - 28,
      t: 0,
      life: EVENT_POPUP_MS,
      size: 11,
      text: `-${penalty} OUCH!`,
      color: "#ff3b3b",
    });

    this.burst(hx, hy - 10, 18, false, true);
    this.kick(SHAKE.hit * 2);
    this.breakStreak("porcupine");

    this.ev.onScore(this.score);
    this.ev.onPorcupineHit?.({ penalty });
  }

  hitMole(m, hx, hy) {
    m.state = "hit";
    m.t = 0;

    const prevTier = comboTier(this.streak);
    this.streak++;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    const tier = comboTier(this.streak);
    const tierUp = tier > prevTier;
    const cMult = COMBO_TIERS[tier].mult;

    const points = POINTS_BASE * this.mult * cMult;
    this.score += points;
    this.hits++;

    this.popups.push({
      x: hx, y: hy - 28, t: 0, life: POPUP_MS, size: 9,
      text: `+${points}`, color: tierColor(tier),
    });
    if (tierUp) {
      this.popups.push({
        x: CX, y: 64, t: 0, life: EVENT_POPUP_MS, size: 11,
        text: `COMBO x${cMult}!`, color: "#ffffff",
      });
    }

    this.burst(hx, hy - 10, tierUp ? 18 : 10, tierUp);
    this.kick(tierUp ? SHAKE.tierUp : SHAKE.hit);
    this.comboPop = 220;

    this.ev.onScore(this.score);
    this.ev.onCombo({ streak: this.streak, mult: cMult });
    this.ev.onHit({ points, streak: this.streak, tierUp });
  }

  /* ---------- draw ---------- */

  drawCombo(ctx) {
    if (!this.running || this.streak < 2) return;
    const tier = comboTier(this.streak);
    const mult = COMBO_TIERS[tier].mult;
    const pop = this.comboPop > 0 ? 3 : 0;

    ctx.textAlign = "center";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#1b1714";
    ctx.font = `bold ${14 + pop}px system-ui, -apple-system, sans-serif`;
    const label = `${this.streak} COMBO`;
    ctx.strokeText(label, CX, 30);
    ctx.fillStyle = tierColor(tier);
    ctx.fillText(label, CX, 30);

    if (mult > 1) {
      ctx.font = "bold 9px system-ui, -apple-system, sans-serif";
      ctx.lineWidth = 1.5;
      ctx.strokeText(`x${mult} points`, CX, 41);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`x${mult} points`, CX, 41);
    }

    const next = COMBO_TIERS[tier + 1];
    if (next) {
      const cur = COMBO_TIERS[tier];
      const f = (this.streak - cur.at) / (next.at - cur.at);
      ctx.fillStyle = "#1b1714";
      ctx.fillRect(CX - 31, 46, 62, 5);
      ctx.fillStyle = tierColor(tier);
      ctx.fillRect(CX - 30, 47, Math.round(60 * f), 3);
    }
  }

  draw(ctx, now) {
    this.holes.forEach(([x, y], i) => {
      drawHole(ctx, x, y);
      const m = this.moles[i];
      if (m.state !== "hidden") {
        if (m.type === "porcupine") {
          drawPorcupine(ctx, x, y, m);
        } else {
          drawMole(ctx, x, y, m);
        }
      }
      drawHoleFront(ctx, x, y);
    });

    this.drawCombo(ctx);

    ctx.textAlign = "center";
    ctx.strokeStyle = "#1b1714";
    for (const p of this.popups) {
      const u = p.t / p.life;
      ctx.globalAlpha = 1 - u * u;
      ctx.font = `bold ${p.size}px system-ui, -apple-system, sans-serif`;
      ctx.lineWidth = p.size >= 11 ? 2 : 1.2;
      ctx.strokeText(p.text, p.x, p.y - u * 16);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y - u * 16);
    }

    for (const p of this.particles) {
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = p.c;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }
    ctx.globalAlpha = 1;

    // Draw hammer: on touch devices only show hammer during/after swing; on mouse hover constantly
    const showHammer = this.running && (!this.isTouch || (now - this.swingAt < TIMING.swing + 160));
    if (showHammer) {
      drawHammer(ctx, this.px, this.py, now - this.swingAt, now);
    }
  }
}