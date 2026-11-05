import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { W, H } from "../game/constants";
import { createScene } from "../game/scene";
import { drawCharacter } from "../game/character";
import { Game } from "../game/engine";
import { sfx, unlock } from "../game/audio";

const GameCanvas = forwardRef(function GameCanvas(
  { session, onScore, onCombo, onTick, onEnd },
  ref
) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const reaction = useRef({ pose: "idle", at: 0, until: 0 });
  const cb = useRef({});

  useEffect(() => {
    cb.current = { onScore, onCombo, onTick, onEnd };
  });

  useImperativeHandle(ref, () => ({
    pause: () => gameRef.current?.pause(),
    resume: () => gameRef.current?.resume(),
    stop: () => gameRef.current?.stop(),
    cancel: () => gameRef.current?.cancel(),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const scene = createScene();

    const react = (pose, ms) => {
      const n = performance.now();
      reaction.current = { pose, at: n, until: n + ms };
    };

    const triggerHaptic = (pattern) => {
      try {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(pattern);
        }
      } catch {
        // Haptics not allowed or unsupported
      }
    };

    const game = new Game({
      onHit: ({ streak, tierUp }) => {
        react("success", 1400);
        sfx.hit(streak);
        if (tierUp) sfx.tierUp();
        triggerHaptic(tierUp ? [30, 40, 30] : 25);
      },
      onMiss: ({ kind, broke }) => {
        react("miss", 1100);
        if (kind === "escape") sfx.escape();
        else sfx.miss();
        if (broke) sfx.comboBreak();
        triggerHaptic(broke ? [40, 50, 40] : 30);
      },
      onSwing: () => sfx.swing(),
      onScore: (s) => cb.current.onScore?.(s),
      onCombo: (c) => cb.current.onCombo?.(c),
      onTick: (s) => {
        cb.current.onTick?.(s);
        if (s > 0 && s <= 3) sfx.tick();
      },
      onEnd: (r) => {
        sfx.end();
        cb.current.onEnd?.(r);
      },
    });
    gameRef.current = game;

    // Responsive High-DPI canvas resizing using client layout dimensions
    const updateSize = () => {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (cw === 0 || ch === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const targetW = Math.max(W, Math.round(cw * dpr));
      const targetH = Math.max(H, Math.round(ch * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    let last = performance.now();
    let raf;
    const loop = (now) => {
      const dt = Math.min(now - last, 50);
      last = now;
      game.update(dt);

      const [sx, sy] = game.getShake();
      const scaleX = canvas.width / W;
      const scaleY = canvas.height / H;

      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#0b0e13";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(scaleX, scaleY);
      ctx.translate(sx, sy);

      ctx.drawImage(scene, 0, 0, W, H);

      const r = reaction.current;
      if (r.pose !== "idle" && now > r.until) {
        r.pose = "idle";
        r.at = now;
      }
      drawCharacter(ctx, r.pose, now - r.at, now);
      game.draw(ctx, now);

      ctx.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    if (!session || !gameRef.current) return;
    reaction.current = { pose: "idle", at: performance.now(), until: 0 };
    gameRef.current.start(session.holes);
  }, [session]);

  const toXY = (e) => {
    const canvas = e.currentTarget;
    const r = canvas.getBoundingClientRect();
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;

    // Detect if element is rotated 90deg on screen (e.g. mobile portrait auto-landscape)
    const isRotated = Math.abs(r.width - ch) < Math.abs(r.width - cw);

    if (isRotated) {
      // 90deg clockwise rotation:
      // Screen Top-to-Bottom corresponds to Canvas Local X (0..W)
      // Screen Right-to-Left corresponds to Canvas Local Y (0..H)
      const x = (e.clientY - r.top) * (W / r.height);
      const y = (r.right - e.clientX) * (H / r.width);
      return [
        Math.max(0, Math.min(W, x)),
        Math.max(0, Math.min(H, y)),
      ];
    }

    // Standard unrotated:
    const x = (e.clientX - r.left) * (W / r.width);
    const y = (e.clientY - r.top) * (H / r.height);
    return [
      Math.max(0, Math.min(W, x)),
      Math.max(0, Math.min(H, y)),
    ];
  };

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      onPointerMove={(e) => {
        const [x, y] = toXY(e);
        gameRef.current?.pointerMove(x, y);
      }}
      onPointerDown={(e) => {
        unlock();
        const isTouch = e.pointerType === "touch";
        const slop = isTouch ? 14 : 0;
        const [x, y] = toXY(e);
        gameRef.current?.pointerDown(x, y, performance.now(), slop, isTouch);
      }}
    />
  );
});

export default GameCanvas;
