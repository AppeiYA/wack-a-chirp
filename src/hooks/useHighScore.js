import { useState } from "react";

const KEY = "wackachirp:highscore:v1";

const read = () => {
  try {
    const v = Number(window.localStorage.getItem(KEY));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0; // storage blocked
  }
};

const write = (v) => {
  try {
    window.localStorage.setItem(KEY, String(v));
  } catch {
    // storage blocked: the best score just lives in memory
  }
};

export function useHighScore() {
  const [best, setBest] = useState(read);

  // returns true when the score beats the stored best
  const submit = (score) => {
    const prev = Math.max(read(), best);
    if (score > prev) {
      write(score);
      setBest(score);
      return true;
    }
    return false;
  };

  const reset = () => {
    write(0);
    setBest(0);
  };

  return { best, submit, reset };
}