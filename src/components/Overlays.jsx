import { HOLE_OPTIONS, MULT, COMBO_TIERS } from "../game/config";

function HolePicker({ holes, onChange }) {
  return (
    <div className="picker">
      {HOLE_OPTIONS.map((n) => (
        <button
          key={n}
          type="button"
          className={n === holes ? "on" : ""}
          onClick={() => onChange(n)}
        >
          <span>{n} holes</span>
          <small>x{MULT[n]} pts</small>
        </button>
      ))}
    </div>
  );
}

const comboText = COMBO_TIERS.slice(1)
  .map((t) => `${t.at} hits = x${t.mult}`)
  .join(", ");

export function MenuOverlay({ holes, onHoles, onStart, best, onReset, muted }) {
  return (
    <div className="overlay">
      <div className="panel">
        <h2>WackAChirp</h2>
        <p className="tagline">Wack moles before they escape. 60 seconds on the clock!</p>
        <p className="muted small">
          Chain hits for combo multipliers ({comboText}). Misses break your chain.
        </p>
        <HolePicker holes={holes} onChange={onHoles} />
        <button className="primary main-btn" type="button" onClick={onStart}>
          Start Game
        </button>
        <div className="panel-footer">
          <span className="muted">
            Best on device: <b>{best}</b>
          </span>
          {best > 0 && (
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                if (window.confirm("Reset your best score on this device?")) onReset();
              }}
            >
              Reset
            </button>
          )}
        </div>
        {muted && <p className="muted sound-hint">Sound is muted. Unmute anytime via Sound button.</p>}
      </div>
    </div>
  );
}

export function PauseOverlay({ score, secs, onResume, onRestart, onStop, onMenu }) {
  return (
    <div className="overlay">
      <div className="panel">
        <h2>Game Paused</h2>
        <p className="muted">
          Score: <b>{score}</b> · Time Left: <b>{secs}s</b>
        </p>
        <div className="btn-stack">
          <button className="primary" type="button" onClick={onResume}>
            ▶ Resume Game
          </button>
          <div className="btn-row">
            <button type="button" onClick={onRestart}>
              ↺ Restart
            </button>
            <button type="button" onClick={onStop}>
              ⏹ Stop Round
            </button>
          </div>
          <button type="button" className="secondary" onClick={onMenu}>
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export function GameOverOverlay({ result, best, holes, onHoles, onAgain, onMenu }) {
  return (
    <div className="overlay">
      <div className="panel">
        <h2>Time's up!</h2>
        {result.isNew && <p className="flash">★ New High Score! ★</p>}
        <p className="big">{result.score}</p>
        <p className="muted stats-line">
          Best: {best} · Best Combo: {result.bestStreak} · Hits: {result.hits} · Escaped: {result.escaped} · Misses: {result.whiffs}
        </p>
        <HolePicker holes={holes} onChange={onHoles} />
        <div className="btn-row">
          <button className="primary" type="button" onClick={onAgain}>
            Play again
          </button>
          <button className="secondary" type="button" onClick={onMenu}>
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
