import { useEffect, useRef } from "react";
import { W, H } from "../game/constants";
import { createScene } from "../game/scene";
import { drawCharacter } from "../game/character";
import { Game } from "../game/engine";
import { sfx, unlock } from "../game/audio";

export default function GameCanvas({ session, onScore, onCombo, onTick, onEnd }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const reaction = useRef({ pose: "idle", at: 0, until: 0 });
  const cb = useRef({});

  useEffect(() => {
    cb.current = { onScore, onCombo, onTick, onEnd };
  });

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const scene = createScene();

    const react = (pose, ms) => {
      const n = performance.now();
      reaction.current = { pose, at: n, until: n + ms };
    };

    const game = new Game({
      onHit: ({ streak, tierUp }) => {
        react("success", 1400);
        sfx.hit(streak);
        if (tierUp) sfx.tierUp();
      },
      onMiss: ({ kind, broke }) => {
        react("miss", 1100);
        if (kind === "escape") sfx.escape();
        else sfx.miss();
        if (broke) sfx.comboBreak();
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

    let last = performance.now();
    let raf;
    const loop = (now) => {
      const dt = Math.min(now - last, 50);
      last = now;
      game.update(dt);

      const [sx, sy] = game.getShake();
      ctx.fillStyle = "#0b0e13";
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(sx, sy);

      ctx.drawImage(scene, 0, 0);

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
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!session || !gameRef.current) return;
    reaction.current = { pose: "idle", at: performance.now(), until: 0 };
    gameRef.current.start(session.holes);
  }, [session]);

  const toXY = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)];
  };

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="game-canvas"
      onPointerMove={(e) => {
        const [x, y] = toXY(e);
        gameRef.current?.pointerMove(x, y);
      }}
      onPointerDown={(e) => {
        unlock();
        const [x, y] = toXY(e);
        gameRef.current?.pointerDown(x, y, performance.now(), e.pointerType === "touch" ? 5 : 0);
      }}
    />
  );
}