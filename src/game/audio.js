import { DEFAULT_MUTED } from "./config";

const KEY = "wackachirp:muted:v1";

const readMuted = () => {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === null ? DEFAULT_MUTED : v === "1";
  } catch {
    return DEFAULT_MUTED;
  }
};

let ctx = null;
let muted = readMuted();

export const isMuted = () => muted;

// Must be called from a user gesture (click / tap)
export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
}

export function setMuted(next) {
  muted = next;
  try {
    window.localStorage.setItem(KEY, next ? "1" : "0");
  } catch {
    // storage blocked: the toggle just lives in memory
  }
  if (!next) unlock();
}

function tone({ freq, to, dur = 0.1, type = "square", vol = 0.07, delay = 0 }) {
  if (muted || !ctx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur, vol, delay = 0) {
  if (muted || !ctx) return;
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(g).connect(ctx.destination);
  src.start(ctx.currentTime + delay);
}

export const sfx = {
  swing: () => noise(0.06, 0.03),
  hit: (streak = 0) => {
    const f = 520 + Math.min(streak, 20) * 30; // pitch climbs with the combo
    tone({ freq: 220, to: 110, dur: 0.09, type: "triangle", vol: 0.12 });
    tone({ freq: f, to: f * 1.5, dur: 0.1, delay: 0.03 });
  },
  miss: () => tone({ freq: 200, to: 140, dur: 0.15, type: "sawtooth", vol: 0.05 }),
  porcupine: () => {
    tone({ freq: 140, to: 60, dur: 0.24, type: "sawtooth", vol: 0.15 });
    noise(0.2, 0.08);
  },
  escape: () => tone({ freq: 300, to: 150, dur: 0.18, type: "sine", vol: 0.06 }),
  tierUp: () =>
    [523, 659, 784, 1047].forEach((f, i) =>
      tone({ freq: f, dur: 0.09, delay: 0.08 + i * 0.07, vol: 0.06 })
    ),
  comboBreak: () => tone({ freq: 400, to: 100, dur: 0.3, type: "sawtooth", vol: 0.06 }),
  tick: () => tone({ freq: 880, dur: 0.05, vol: 0.05 }),
  end: () =>
    [784, 659, 523].forEach((f, i) =>
      tone({ freq: f, dur: 0.16, delay: i * 0.14, type: "triangle", vol: 0.09 })
    ),
};