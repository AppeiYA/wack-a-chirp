export default function Hud({
  score,
  best,
  secs,
  combo,
  muted,
  onToggleMute,
  screen,
  onPause,
  onResume,
  onStop,
  onBack,
}) {
  const isPlaying = screen === "playing";
  const isPaused = screen === "paused";
  const inGame = isPlaying || isPaused;

  return (
    <div className="hud">
      <div className="hud-stats">
        <div className="stat-card">
          <span>Score</span>
          <b>{score}</b>
        </div>
        <div className={`stat-card ${secs <= 5 && inGame ? "time-warning" : ""}`}>
          <span>Time</span>
          <b>{secs}s</b>
        </div>
        <div className={`stat-card ${combo.mult > 1 ? "hot" : ""}`}>
          <span>Combo</span>
          <b>{combo.streak}</b>
          {combo.mult > 1 && <small className="mult-tag">x{combo.mult}</small>}
        </div>
        <div className="stat-card">
          <span>Best</span>
          <b>{Math.max(best, score)}</b>
        </div>
      </div>

      <div className="hud-actions">
        {inGame && (
          <>
            <button
              type="button"
              className="ctrl-btn back-btn"
              onClick={onBack}
              title="Return to Menu"
              aria-label="Back to main menu"
            >
              ← Menu
            </button>
            <button
              type="button"
              className="ctrl-btn stop-btn"
              onClick={onStop}
              title="Stop round and view results"
              aria-label="Stop game round"
            >
              ⏹ Stop
            </button>
            <button
              type="button"
              className={`ctrl-btn pause-btn ${isPaused ? "active" : ""}`}
              onClick={isPaused ? onResume : onPause}
              title={isPaused ? "Resume game" : "Pause game"}
              aria-label={isPaused ? "Resume game" : "Pause game"}
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
          </>
        )}

        <button
          type="button"
          className={`ctrl-btn mute ${muted ? "is-muted" : ""}`}
          onClick={onToggleMute}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          title={muted ? "Turn sound on" : "Turn sound off"}
        >
          {muted ? "🔇 Sound: off" : "🔊 Sound: on"}
        </button>
      </div>
    </div>
  );
}
