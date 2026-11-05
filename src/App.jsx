import { useState, useRef, useEffect, useCallback } from "react";
import GameCanvas from "./components/GameCanvas";
import Hud from "./components/Hud";
import { MenuOverlay, GameOverOverlay, PauseOverlay } from "./components/Overlays";
import { useHighScore } from "./hooks/useHighScore";
import { ROUND_SECONDS } from "./game/config";
import { isMuted, setMuted, unlock, sfx } from "./game/audio";

export default function App() {
  const [screen, setScreen] = useState("menu"); // menu | playing | paused | over
  const [holes, setHoles] = useState(3);
  const [session, setSession] = useState(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState({ streak: 0, mult: 1 });
  const [secs, setSecs] = useState(ROUND_SECONDS);
  const [result, setResult] = useState(null);
  const [muted, setMutedState] = useState(isMuted);
  const canvasHandleRef = useRef(null);
  const { best, submit, reset } = useHighScore();

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) sfx.tick();
  };

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Fullscreen permission denied or unsupported
    }

    try {
      if (window.screen?.orientation?.lock) {
        await window.screen.orientation.lock("landscape");
      }
    } catch {
      // Orientation lock not permitted without user gesture or unsupported
    }
  }, []);

  const start = useCallback(() => {
    unlock();
    try {
      if (window.screen?.orientation?.lock) {
        window.screen.orientation.lock("landscape").catch(() => {});
      }
    } catch {
      // Screen orientation not supported
    }
    setScore(0);
    setCombo({ streak: 0, mult: 1 });
    setSecs(ROUND_SECONDS);
    setResult(null);
    setScreen("playing");
    setSession({ id: performance.now(), holes });
  }, [holes]);

  const handlePause = useCallback(() => {
    if (screen === "playing") {
      canvasHandleRef.current?.pause();
      setScreen("paused");
    }
  }, [screen]);

  const handleResume = useCallback(() => {
    if (screen === "paused") {
      canvasHandleRef.current?.resume();
      setScreen("playing");
    }
  }, [screen]);

  const handleStop = useCallback(() => {
    if (screen === "playing" || screen === "paused") {
      canvasHandleRef.current?.stop();
    }
  }, [screen]);

  const handleBackToMenu = useCallback(() => {
    if (screen === "playing" || screen === "paused") {
      const ok = window.confirm("Quit current game and return to main menu?");
      if (!ok) return;
      canvasHandleRef.current?.cancel();
    }
    setScreen("menu");
  }, [screen]);

  const handleRestart = useCallback(() => {
    start();
  }, [start]);

  const handleEnd = (r) => {
    const isNew = submit(r.score);
    setResult({ ...r, isNew });
    setScreen("over");
  };

  // Keyboard shortcut: Escape or 'p' to toggle pause
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        if (screen === "playing") {
          handlePause();
        } else if (screen === "paused") {
          handleResume();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen, handlePause, handleResume]);

  return (
    <main className={`app screen-${screen}`}>
      <Hud
        score={score}
        best={best}
        secs={secs}
        combo={combo}
        muted={muted}
        onToggleMute={toggleMute}
        screen={screen}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        onBack={handleBackToMenu}
        onToggleFullscreen={toggleFullscreen}
      />

      <div className={`stage ${screen === "playing" ? "playing" : ""}`}>
        <GameCanvas
          ref={canvasHandleRef}
          session={session}
          onScore={setScore}
          onCombo={setCombo}
          onTick={setSecs}
          onEnd={handleEnd}
        />

        {screen === "menu" && (
          <MenuOverlay
            holes={holes}
            onHoles={setHoles}
            onStart={start}
            best={best}
            onReset={reset}
            muted={muted}
          />
        )}

        {screen === "paused" && (
          <PauseOverlay
            score={score}
            secs={secs}
            onResume={handleResume}
            onRestart={handleRestart}
            onStop={handleStop}
            onMenu={handleBackToMenu}
          />
        )}

        {screen === "over" && result && (
          <GameOverOverlay
            result={result}
            best={Math.max(best, result.score)}
            holes={holes}
            onHoles={setHoles}
            onAgain={start}
            onMenu={handleBackToMenu}
          />
        )}
      </div>
    </main>
  );
}
