import { useState } from "react";

export default function RotateHint() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="rotate-hint" role="status">
      <span className="phone" aria-hidden="true" />
      <span>Rotate your phone for a bigger playfield</span>
      <button type="button" onClick={() => setOpen(false)}>Got it</button>
    </div>
  );
}