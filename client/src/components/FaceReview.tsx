/* Cerberus Cube Pro — Instrument Panel component: hands-on sticker review with protected center calibration. */
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, LockKeyhole, ScanLine, Sparkles } from "lucide-react";
import { FACE_ORDER, STICKER_META, validateFaces, type CubeFaces, type FaceKey, type ScanClassification, type Sticker } from "@/lib/cubeScan";

interface Props {
  faces: CubeFaces;
  classification: ScanClassification | null;
  solveError: string;
  isSolving: boolean;
  onChange: (faces: CubeFaces) => void;
  onBack: () => void;
  onSolve: () => void;
}

export default function FaceReview({ faces, classification, solveError, isSolving, onChange, onBack, onSolve }: Props) {
  const [activeFace, setActiveFace] = useState<FaceKey>("U");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const validation = useMemo(() => validateFaces(faces), [faces]);
  const selectedConfidence = classification?.stickers.find((item) => item.face === activeFace && item.index === selectedIndex);
  const faceUncertain = (face: FaceKey) => classification?.stickers.filter((item) => item.face === face && item.confidence < 0.58) ?? [];
  const updateSticker = (sticker: Sticker) => {
    if (selectedIndex === 4) return;
    onChange({ ...faces, [activeFace]: faces[activeFace].map((value, tileIndex) => tileIndex === selectedIndex ? sticker : value) });
  };

  return (
    <main className="review-layout">
      <header className="review-header"><button className="icon-button" onClick={onBack} aria-label="Scan again"><ArrowLeft size={18} /></button><div><span className="eyebrow">Quality control</span><h1>Review the read</h1></div><div className="readout-chip success"><CheckCircle2 size={14} /> 6 faces</div></header>
      <div className="review-intro"><div><span className="eyebrow">Calibrated colour audit</span><strong>{classification ? classification.uncertainCount > 0 ? `${classification.uncertainCount} stickers need a closer look. Tap the marked tiles to correct them before solving.` : "All 48 non-center stickers achieved a clear calibrated match. Review remains available before solving." : "Tap any uncertain sticker to correct it. Center colors stay locked to protect the scan orientation."}</strong></div><ScanLine size={25} /></div>

      <section className="review-board">
        <aside className="review-ledger"><span className="eyebrow">Face ledger</span>{FACE_ORDER.map((face) => { const uncertain = faceUncertain(face.key); return <button key={face.key} onClick={() => { setActiveFace(face.key); setSelectedIndex(uncertain[0]?.index ?? 0); }} className={`review-face-button ${activeFace === face.key ? "is-active" : ""} ${uncertain.length ? "has-uncertain" : ""}`}><span className="review-face-colors">{faces[face.key].map((sticker, index) => <i key={index} style={{ background: STICKER_META[sticker].css }} />)}</span><span><strong>{face.label}</strong><small>{uncertain.length ? `${uncertain.length} flagged tile${uncertain.length > 1 ? "s" : ""}` : `${face.key} face verified`}</small></span></button>; })}</aside>

        <section className="sticker-editor" aria-label={`${activeFace} face sticker editor`}>
          <div className="editor-heading"><div><span className="eyebrow">Selected face</span><h2>{FACE_ORDER.find((face) => face.key === activeFace)?.label} center</h2></div><span className="center-lock"><LockKeyhole size={13} /> Center locked</span></div>
          <div className="sticker-grid">{faces[activeFace].map((sticker, index) => { const diagnostic = classification?.stickers.find((item) => item.face === activeFace && item.index === index); return <button key={index} onClick={() => index !== 4 && setSelectedIndex(index)} className={`sticker-cell ${index === 4 ? "is-center" : ""} ${selectedIndex === index ? "is-selected" : ""} ${diagnostic && diagnostic.confidence < 0.58 ? "is-uncertain" : ""}`} style={{ background: STICKER_META[sticker].css, color: STICKER_META[sticker].text }} aria-label={`${STICKER_META[sticker].name} sticker ${index + 1}${index === 4 ? ", center locked" : diagnostic && diagnostic.confidence < 0.58 ? ", low confidence, selected for correction" : ", selected for correction"}`}>{index === 4 ? <LockKeyhole size={16} /> : diagnostic && diagnostic.confidence < 0.58 ? <span className="confidence-flag">!</span> : null}</button>; })}</div>
          <div className="palette-label"><span className="eyebrow">Set selected sticker</span><p>{selectedIndex === 4 ? "The centre is locked as the calibration reference." : selectedConfidence ? `Sticker ${selectedIndex + 1}: ${Math.round(selectedConfidence.confidence * 100)}% confidence. Best measured match was ${STICKER_META[selectedConfidence.suggested].name}.` : `Sticker ${selectedIndex + 1} selected. Choose a replacement color below.`}</p></div>
          <div className="sticker-palette">{(Object.keys(STICKER_META) as Sticker[]).map((sticker) => <button key={sticker} onClick={() => updateSticker(sticker)} style={{ background: STICKER_META[sticker].css, color: STICKER_META[sticker].text }} aria-label={`Use ${STICKER_META[sticker].name}`}>{STICKER_META[sticker].name.slice(0, 1)}</button>)}</div>
          <p className="editor-footnote">Select a sticker first, then choose a replacement color. Non-center edits are always reversible.</p>
        </section>

        <aside className="validation-panel"><img src="/manus-storage/cerberus-cube-validation-guide_e789588a.jpg" alt="Rubik's Cube face under validation" /><div className="validation-copy"><span className="eyebrow">State integrity</span><strong>{validation.isBalanced ? "Colour balance locked" : "One more correction needed"}</strong><p>{validation.message}</p>{classification && <small>Mean optical confidence: {Math.round(classification.averageConfidence * 100)}%</small>}</div><div className="color-counts">{(Object.keys(STICKER_META) as Sticker[]).map((sticker) => <span className={validation.counts[sticker] === 9 ? "is-balanced" : ""} key={sticker} style={{ "--sticker": STICKER_META[sticker].css } as React.CSSProperties}><i />{validation.counts[sticker]}/9</span>)}</div></aside>
      </section>

      {solveError && <div className="solver-error"><CircleAlert size={18} /><div><strong>Cube state needs another look</strong><p>{solveError}</p></div></div>}
      <footer className="review-actionbar"><div><Sparkles size={17} /><span>Solver runs directly in your browser.</span></div><button className="primary-action" onClick={onSolve} disabled={!validation.isBalanced || isSolving}>{isSolving ? "Checking cube state…" : "Build solve plan"}<span>→</span></button></footer>
    </main>
  );
}
