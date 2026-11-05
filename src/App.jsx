import { useState } from "react";
import GameCanvas from "./components/GameCanvas";
import Hud from "./components/Hud";
import { MenuOverlay, GameOverOverlay } from "./components/Overlays";
import { useHighScore } from "./hooks/useHighScore";
import { ROUND_SECONDS } from "./game/config";
import RotateHint from "./components/RotateHint";
import { isMuted, setMuted, unlock, sfx } from "./game/audio";

export default function App() {
  const [screen, setScreen] = useState("menu"); // menu | playing | over
  const [holes, setHoles] = useState(3);
  const [session, setSession] = useState(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState({ streak: 0, mult: 1 });
  const [secs, setSecs] = useState(ROUND_SECONDS);
  const [result, setResult] = useState(null);
  const [muted, setMutedState] = useState(isMuted);
  const { best, submit, reset } = useHighScore();

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) sfx.tick();
  };

  const start = () => {
    unlock();
    setScore(0);
    setCombo({ streak: 0, mult: 1 });
    setSecs(ROUND_SECONDS);
    setResult(null);
    setScreen("playing");
    setSession({ id: performance.now(), holes });
  };

  const handleEnd = (r) => {
    const isNew = submit(r.score);
    setResult({ ...r, isNew });
    setScreen("over");
  };

  return (
    <main className="app">
      <h1>WackAChirp</h1>
      <Hud
        score={score}
        best={best}
        secs={secs}
        combo={combo}
        muted={muted}
        onToggleMute={toggleMute}
      />
      <RotateHint />
      <div className={`stage ${screen === "playing" ? "playing" : ""}`}>
        <GameCanvas
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
        {screen === "over" && result && (
          <GameOverOverlay
            result={result}
            best={Math.max(best, result.score)}
            holes={holes}
            onHoles={setHoles}
            onAgain={start}
          />
        )}
      </div>
    </main>
  );
}