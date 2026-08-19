/* Cerberus Cube Pro — Instrument Panel component: deliberate, readable turns for a verified local solution. */
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock3, Rotate3D, RotateCcw } from "lucide-react";
import { friendlyMove } from "@/lib/cubeScan";

interface Props { moves: string[]; onRestart: () => void; }

export default function SolvePlan({ moves, onRestart }: Props) {
  const [current, setCurrent] = useState(0);
  const move = moves[current] ?? "✓";
  const finished = current >= moves.length;
  return (
    <main className="solve-layout">
      <section className="solve-main"><div className="solve-top"><div><span className="eyebrow">Verified solve plan</span><h1>{finished ? "Cube solved" : `Move ${String(current + 1).padStart(2, "0")}`}</h1></div><div className="readout-chip"><Clock3 size={14} /> {moves.length} moves</div></div><div className={`move-stage ${finished ? "is-finished" : ""}`}><span className="move-face">{finished ? <Check size={64} /> : move[0]}</span><strong>{finished ? "Great work." : move}</strong><p>{finished ? "Start another scan whenever you are ready." : friendlyMove(move)}</p><div className="move-orientation"><Rotate3D size={18} /> Keep the cube orientation shown while you turn.</div></div><div className="solve-controls"><button className="move-button" onClick={() => setCurrent((index) => Math.max(0, index - 1))} disabled={current === 0}><ChevronLeft />Previous</button>{finished ? <button className="primary-action" onClick={onRestart}><RotateCcw size={17} />Scan another cube</button> : <button className="primary-action" onClick={() => setCurrent((index) => Math.min(moves.length, index + 1))}>I made this move<ChevronRight size={18} /></button>}</div></section><aside className="move-queue"><span className="eyebrow">Move queue</span><div>{moves.map((queuedMove, index) => <button key={`${queuedMove}-${index}`} onClick={() => setCurrent(index)} className={index === current ? "is-current" : index < current ? "is-done" : ""}><span>{index < current ? <Check size={13} /> : String(index + 1).padStart(2, "0")}</span><strong>{queuedMove}</strong><small>{friendlyMove(queuedMove)}</small></button>)}</div></aside>
    </main>
  );
}
