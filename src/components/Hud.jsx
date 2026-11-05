export default function Hud({ score, best, secs, combo, muted, onToggleMute }) {
  return (
    <div className="hud">
      <div><span>Score</span><b>{score}</b></div>
      <div><span>Time</span><b>{secs}s</b></div>
      <div className={combo.mult > 1 ? "hot" : ""}>
        <span>Combo</span>
        <b>{combo.streak}</b>
        {combo.mult > 1 && <small>x{combo.mult} points</small>}
      </div>
      <div><span>Best</span><b>{Math.max(best, score)}</b></div>
      <button
        className="mute"
        onClick={onToggleMute}
        aria-label={muted ? "Turn sound on" : "Turn sound off"}
      >
        Sound: {muted ? "off" : "on"}
      </button>
    </div>
  );
}