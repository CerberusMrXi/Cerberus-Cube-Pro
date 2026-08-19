/* Cerberus Cube Pro — Instrument Panel page: a composed, mobile-first path from optics to a verified solve. */
import { useState } from "react";
import Cube from "cubejs";
import { Aperture, ArrowUpRight, Camera, Check, Cpu, LockKeyhole, ScanLine, ShieldCheck } from "lucide-react";
import CubeScanner from "@/components/CubeScanner";
import FaceReview from "@/components/FaceReview";
import SolvePlan from "@/components/SolvePlan";
import { classifyCapturedFaces, FACE_ORDER, faceletsFromFaces, sampleCubeFaces, type CapturedFace, type CubeFaces, type RawFaces, type ScanClassification } from "@/lib/cubeScan";

type AppStage = "home" | "scan" | "review" | "solve";
let solverReady = false;

export default function Home() {
  const [stage, setStage] = useState<AppStage>("home");
  const [scanStep, setScanStep] = useState(0);
  const [rawFaces, setRawFaces] = useState<RawFaces>({});
  const [faces, setFaces] = useState<CubeFaces | null>(null);
  const [classification, setClassification] = useState<ScanClassification | null>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [solveError, setSolveError] = useState("");

  const startNewScan = () => { setRawFaces({}); setFaces(null); setClassification(null); setMoves([]); setScanStep(0); setSolveError(""); setStage("scan"); };
  const openSample = () => { setFaces(sampleCubeFaces()); setClassification(null); setRawFaces({}); setMoves([]); setSolveError(""); setStage("review"); };
  const handleCapture = (face: CapturedFace) => {
    const next = { ...rawFaces, [face.face]: face };
    setRawFaces(next);
    if (scanStep === FACE_ORDER.length - 1) { const result = classifyCapturedFaces(next); setFaces(result.faces); setClassification(result); setStage("review"); return; }
    setScanStep((step) => step + 1);
  };
  const buildSolution = async () => {
    if (!faces) return;
    setIsSolving(true); setSolveError("");
    window.setTimeout(() => {
      try {
        if (!solverReady) { Cube.initSolver(); solverReady = true; }
        const cube = Cube.fromString(faceletsFromFaces(faces));
        const solution = String(cube.solve()).trim().split(/\s+/).filter(Boolean);
        setMoves(solution); setStage("solve");
      } catch (error) {
        setSolveError(error instanceof Error ? error.message : "The captured stickers do not form a solvable cube. Recheck the highlighted face order and any uncertain stickers.");
      } finally { setIsSolving(false); }
    }, 24);
  };

  if (stage === "scan") return <CubeScanner stepIndex={scanStep} capturedFaces={new Set(Object.keys(rawFaces))} onCapture={handleCapture} onBack={() => setStage("home")} onUseSample={openSample} />;
  if (stage === "review" && faces) return <FaceReview faces={faces} classification={classification} onChange={setFaces} onBack={startNewScan} onSolve={buildSolution} solveError={solveError} isSolving={isSolving} />;
  if (stage === "solve") return <SolvePlan moves={moves} onRestart={startNewScan} />;

  return (
    <main className="home-shell">
      <header className="app-header"><a className="brand" href="/"><img src="/manus-storage/cerberus-cube-mark_49120b58.png" alt="Cerberus Cube Pro" /><span><strong>CERBERUS</strong><small>CUBE PRO</small></span></a><div className="header-status"><span><ShieldCheck size={15} />Local processing</span><span className="desktop-only">v2.0 optical scan</span></div></header>
      <section className="home-hero"><div className="hero-copy"><div className="hero-kicker"><span className="live-dot" />Camera-first cube solving</div><h1>Your cube, read <em>with confidence.</em></h1><p>Six guided captures. Center-led color calibration. A clear, browser-local solve plan that does not guess when the scan is uncertain.</p><div className="hero-actions"><button className="primary-action" onClick={startNewScan}><Camera size={18} />Open camera scanner<ArrowUpRight size={18} /></button><button className="secondary-action" onClick={openSample}>View a sample scan</button></div><div className="hero-proof"><span><Check size={14} />No random sticker fill</span><span><Check size={14} />Manual correction</span><span><Check size={14} />Works on phone</span></div></div><div className="hero-art"><img src="/manus-storage/cerberus-cube-hero_7784f8eb.jpg" alt="A Rubik's Cube shown through the Cerberus optical scan interface" /><div className="hero-aperture" aria-hidden="true"><i /><i /><i /><i /><div className="hero-detection-grid">{Array.from({ length: 9 }, (_, index) => <b key={index} className={index === 4 ? "is-confirmed" : ""} />)}</div><div className="hero-scan-line" /></div><div className="hero-telemetry"><span>FACE 01 / U</span><strong><i />98.6% STABLE</strong><small>Center calibration locked</small></div><div className="hero-face-ledger" aria-label="Six-face scan progress"><span className="is-confirmed">U</span><span>R</span><span>F</span><span>D</span><span>L</span><span>B</span></div><div className="art-readout"><span>OPTICS / 03</span><strong>Cube state reader</strong><i /></div></div></section>
      <section className="protocol-strip"><div className="protocol-title"><span className="eyebrow">How it holds the line</span><strong>Made for real-world lighting, not a perfect demo.</strong><div className="protocol-meter" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div></div><div className="protocol-item"><Aperture /><div><strong>1. Stabilise</strong><span>Wait for repeatable frames</span></div></div><div className="protocol-item"><ScanLine /><div><strong>2. Calibrate</strong><span>Map colors from your centers</span></div></div><div className="protocol-item"><Cpu /><div><strong>3. Validate</strong><span>Check color balance before solve</span></div></div><div className="protocol-item"><LockKeyhole /><div><strong>4. Protect</strong><span>Keep center orientation fixed</span></div></div></section>
      <section className="guidance-gallery"><div className="gallery-intro"><span className="eyebrow">Scan discipline</span><h2>Small decisions make a clean read.</h2><p>See exactly when to align, rotate, and correct—without a false “AI confidence” score.</p><div className="gallery-readout"><span>LEDGER / 06</span><i /><i /><i /><i /><i /><i /></div></div><article className="guide-panel"><img src="/manus-storage/cerberus-cube-frame-guide_38a22b61.jpg" alt="Cube alignment scan guide" /><span>01</span><h3>Align the face</h3><p>Keep the entire grid inside the aperture.</p></article><article className="guide-panel"><img src="/manus-storage/cerberus-cube-rotation-guide_bdd33bfe.jpg" alt="Cube rotation scanning guide" /><span>02</span><h3>Follow the rotation</h3><p>Each face keeps solver orientation intact.</p></article><article className="guide-panel"><img src="/manus-storage/cerberus-cube-validation-guide_e789588a.jpg" alt="Cube sticker validation guide" /><span>03</span><h3>Correct with context</h3><p>Resolve uncertainty before any solve is built.</p></article></section>
      <footer className="app-footer"><span>Cerberus Cube Pro</span><span>Built for a calmer first solve.</span></footer>
    </main>
  );
}
