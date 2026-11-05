import { HOLE_OPTIONS, MULT, COMBO_TIERS } from "../game/config";

function HolePicker({ holes, onChange }) {
  return (
    <div className="picker">
      {HOLE_OPTIONS.map((n) => (
        <button key={n} className={n === holes ? "on" : ""} onClick={() => onChange(n)}>
          {n} holes
          <small>x{MULT[n]} points</small>
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
        <p>Wack every mole before it gets away. 60 seconds on the clock.</p>
        <p className="muted">
          Chain hits for combo points: {comboText}. A missed swing or an escaped mole
          breaks the chain.
        </p>
        <HolePicker holes={holes} onChange={onHoles} />
        <button className="primary" onClick={onStart}>Start</button>
        <p className="muted">
          Best on this device: {best}{" "}
          {best > 0 && (
            <a
              href="#reset"
              onClick={(e) => {
                e.preventDefault();
                if (window.confirm("Reset your best score on this device?")) onReset();
              }}
            >
              reset
            </a>
          )}
        </p>
        {muted && <p className="muted">Sound is off. Use the Sound button above to turn it on.</p>}
      </div>
    </div>
  );
}

export function GameOverOverlay({ result, best, holes, onHoles, onAgain }) {
  return (
    <div className="overlay">
      <div className="panel">
        <h2>Time's up!</h2>
        {result.isNew && <p className="flash">New high score!</p>}
        <p className="big">{result.score}</p>
        <p className="muted">
          Best {best} · Best combo {result.bestStreak} · {result.hits} hits ·{" "}
          {result.escaped} got away · {result.whiffs} missed swings
        </p>
        <HolePicker holes={holes} onChange={onHoles} />
        <button className="primary" onClick={onAgain}>Play again</button>
      </div>
    </div>
  );
}