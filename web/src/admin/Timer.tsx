"use client";
import { useEffect, useState } from "react";

/** En lugn 15-minuterstimer för veckans ekonomistund. Ingen stress: den säger bara till när tiden är slut. */
export function Timer({ minutes = 15 }: { minutes?: number }) {
  const [left, setLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((s) => {
      if (s <= 1) { setRunning(false); try { navigator.vibrate?.(300); } catch {} return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [running]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  return (
    <div className="a-row">
      <span className="timer" aria-live="polite">{left === 0 ? "Klart!" : `${mm}:${ss}`}</span>
      <button type="button" className="a-btn a-btn--ghost" onClick={() => { if (left === 0) setLeft(minutes * 60); setRunning(!running); }}>
        {running ? "Pausa" : left === minutes * 60 ? `Starta ${minutes} min` : left === 0 ? "Igen" : "Fortsätt"}
      </button>
      {left !== minutes * 60 && !running ? <button type="button" className="a-btn a-btn--quiet" onClick={() => setLeft(minutes * 60)}>Nollställ</button> : null}
    </div>
  );
}
