/* Cerberus Instrument Panel: a phone-first optical capture console that keeps control and evidence visible. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Aperture, ArrowLeft, Camera, Check, CircleAlert, Focus, Lightbulb, LockKeyhole, Move, RefreshCw, SlidersHorizontal } from "lucide-react";
import { calibratedDistance, FACE_ORDER, labToCss, rgbToLab, type CapturedFace, type Lab } from "@/lib/cubeScan";

type CameraStatus = "idle" | "requesting" | "active" | "blocked" | "unsupported";

interface Props {
  stepIndex: number;
  capturedFaces: Set<string>;
  onCapture: (data: CapturedFace) => void;
  onBack: () => void;
  onUseSample: () => void;
}

interface FrameAnalysis {
  samples: Lab[];
  brightness: number;
  glare: number;
  sharpness: number;
  stability: number;
  spread: number;
}

interface SamplingWindow { x: number; y: number; scale: number }

const FRAME_SIZE = 480;
const HISTORY_SIZE = 6;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const median = (values: number[]) => { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)] ?? 0; };

function averagedPatch(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const pixels = context.getImageData(x, y, size, size).data;
  const swatches: Array<[number, number, number]> = [];
  let luma = 0;
  let clipped = 0;
  for (let row = 2; row < size - 2; row += 5) {
    for (let column = 2; column < size - 2; column += 5) {
      const point = (row * size + column) * 4;
      const red = pixels[point]; const green = pixels[point + 1]; const blue = pixels[point + 2];
      swatches.push([red, green, blue]);
      luma += red * 0.2126 + green * 0.7152 + blue * 0.0722;
      if (Math.max(red, green, blue) > 248 || Math.min(red, green, blue) < 12) clipped += 1;
    }
  }
  const center: [number, number, number] = [median(swatches.map((entry) => entry[0])), median(swatches.map((entry) => entry[1])), median(swatches.map((entry) => entry[2]))];
  const clean = swatches.filter((entry) => Math.hypot(entry[0] - center[0], entry[1] - center[1], entry[2] - center[2]) < 78);
  const source = clean.length > 10 ? clean : swatches;
  const average: [number, number, number] = [0, 1, 2].map((channel) => source.reduce((sum, entry) => sum + entry[channel], 0) / source.length) as [number, number, number];
  const variance = source.reduce((sum, entry) => sum + Math.hypot(entry[0] - average[0], entry[1] - average[1], entry[2] - average[2]), 0) / source.length;
  return { lab: rgbToLab(...average), brightness: luma / Math.max(swatches.length, 1), glare: clipped / Math.max(swatches.length, 1), spread: variance };
}

function sampleFrame(context: CanvasRenderingContext2D, window: SamplingWindow, previous: FrameAnalysis | null, historyLength: number): FrameAnalysis {
  const size = FRAME_SIZE * window.scale;
  const left = clamp(FRAME_SIZE * window.x - size / 2, 0, FRAME_SIZE - size);
  const top = clamp(FRAME_SIZE * window.y - size / 2, 0, FRAME_SIZE - size);
  const cell = size / 3;
  const samples: Lab[] = [];
  const metrics = Array.from({ length: 9 }, (_, index) => {
    const row = Math.floor(index / 3); const column = index % 3;
    const patch = Math.round(cell * 0.48);
    const x = Math.round(left + column * cell + (cell - patch) / 2);
    const y = Math.round(top + row * cell + (cell - patch) / 2);
    return averagedPatch(context, x, y, patch);
  });
  metrics.forEach((metric) => samples.push(metric.lab));
  const movement = previous ? samples.reduce((sum, sample, index) => sum + calibratedDistance(sample, previous.samples[index]), 0) / samples.length : 99;
  const stability = historyLength < 3 ? 0 : clamp(100 - movement * 11, 0, 100);
  const brightness = metrics.reduce((sum, metric) => sum + metric.brightness, 0) / metrics.length;
  const glare = metrics.reduce((sum, metric) => sum + metric.glare, 0) / metrics.length;
  const spread = metrics.reduce((sum, metric) => sum + metric.spread, 0) / metrics.length;
  const sharpness = clamp((spread - 7) * 7.5, 0, 100);
  return { samples, brightness, glare, sharpness, stability, spread };
}

function consensus(history: FrameAnalysis[]) {
  const recent = history.slice(-HISTORY_SIZE);
  return Array.from({ length: 9 }, (_, index) => [0, 1, 2].map((channel) => median(recent.map((frame) => frame.samples[index][channel]))) as Lab);
}

export default function CubeScanner({ stepIndex, capturedFaces, onCapture, onBack, onUseSample }: Props) {
  const target = FACE_ORDER[stepIndex];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisFrameRef = useRef<number | null>(null);
  const sessionRef = useRef(0);
  const latestRef = useRef<FrameAnalysis | null>(null);
  const historyRef = useRef<FrameAnalysis[]>([]);
  const lastAnalysisRef = useRef(0);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [frame, setFrame] = useState<FrameAnalysis | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [sampling, setSampling] = useState<SamplingWindow>({ x: 0.5, y: 0.5, scale: 0.66 });

  const stopCamera = useCallback(() => {
    if (analysisFrameRef.current) window.cancelAnimationFrame(analysisFrameRef.current);
    analysisFrameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    const session = ++sessionRef.current;
    setCameraStatus("requesting");
    setErrorMessage("");
    setFrame(null);
    latestRef.current = null;
    historyRef.current = [];
    stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unsupported");
      setErrorMessage("Camera access needs a secure browser page. Open Cerberus using HTTPS or localhost, then try again.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 }, frameRate: { ideal: 30, min: 15 } }, audio: false });
      if (session !== sessionRef.current) { stream.getTracks().forEach((track) => track.stop()); return; }
      streamRef.current = stream;
      stream.getVideoTracks()[0]?.addEventListener("ended", () => { if (session === sessionRef.current) { setCameraStatus("blocked"); setErrorMessage("The camera stream stopped. Reopen it to continue scanning."); } });
      const video = videoRef.current;
      if (!video) throw new Error("Camera preview was not ready.");
      video.srcObject = stream;
      await new Promise<void>((resolve) => { if (video.readyState >= HTMLMediaElement.HAVE_METADATA) resolve(); else video.onloadedmetadata = () => resolve(); });
      await video.play();
      if (session === sessionRef.current) setCameraStatus("active");
    } catch (error) {
      if (session !== sessionRef.current) return;
      setCameraStatus("blocked");
      const domError = error instanceof DOMException ? error.name : "";
      setErrorMessage(domError === "NotAllowedError" ? "Camera permission is off. Allow camera access in your browser settings, then reopen it." : domError === "NotFoundError" ? "No usable camera was found on this device." : "The camera could not start. Close any other app using it, then try again.");
    }
  }, [stopCamera]);

  const inspectFrame = useCallback((timestamp: number) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (cameraStatus !== "active" || !video || !canvas) return;
    if (timestamp - lastAnalysisRef.current >= 125 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
      lastAnalysisRef.current = timestamp;
      canvas.width = FRAME_SIZE; canvas.height = FRAME_SIZE;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (context) {
        const crop = Math.min(video.videoWidth, video.videoHeight);
        context.drawImage(video, (video.videoWidth - crop) / 2, (video.videoHeight - crop) / 2, crop, crop, 0, 0, FRAME_SIZE, FRAME_SIZE);
        const analysis = sampleFrame(context, sampling, latestRef.current, historyRef.current.length);
        latestRef.current = analysis;
        historyRef.current = [...historyRef.current.slice(-(HISTORY_SIZE - 1)), analysis];
        setFrame(analysis);
      }
    }
    analysisFrameRef.current = window.requestAnimationFrame(inspectFrame);
  }, [cameraStatus, sampling]);

  useEffect(() => { startCamera(); return () => { sessionRef.current += 1; stopCamera(); }; }, [startCamera, stopCamera]);
  useEffect(() => { if (cameraStatus === "active") analysisFrameRef.current = window.requestAnimationFrame(inspectFrame); return () => { if (analysisFrameRef.current) window.cancelAnimationFrame(analysisFrameRef.current); }; }, [cameraStatus, inspectFrame]);
  useEffect(() => { latestRef.current = null; historyRef.current = []; setFrame(null); }, [stepIndex]);

  const metrics = useMemo(() => {
    if (!frame) return { stability: 0, brightness: 0, glare: 100, sharpness: 0, quality: 0, recommended: false };
    const brightness = clamp(100 - Math.abs(frame.brightness - 148) * 0.82, 0, 100);
    const glare = clamp(100 - frame.glare * 340, 0, 100);
    const quality = Math.round(frame.stability * 0.46 + brightness * 0.24 + glare * 0.18 + frame.sharpness * 0.12);
    return { stability: Math.round(frame.stability), brightness: Math.round(brightness), glare: Math.round(glare), sharpness: Math.round(frame.sharpness), quality, recommended: frame.stability >= 72 && brightness >= 48 && glare >= 62 && frame.sharpness >= 24 && historyRef.current.length >= 4 };
  }, [frame]);

  const adjustSampling = (axis: keyof SamplingWindow, delta: number) => setSampling((current) => ({ ...current, [axis]: axis === "scale" ? clamp(current.scale + delta, 0.5, 0.82) : clamp(current[axis] + delta, 0.28, 0.72) }));
  const canCapture = cameraStatus === "active" && Boolean(latestRef.current) && !capturing;
  const captureMessage = cameraStatus !== "active" ? "Camera required to capture" : metrics.recommended ? "Capture validated face" : frame ? "Capture & review quality" : "Reading camera feed";

  const handleCapture = () => {
    if (!canCapture || !latestRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCapturing(true);
    const activeFrame = latestRef.current;
    const samples = historyRef.current.length >= 3 ? consensus(historyRef.current) : activeFrame.samples;
    const preview = canvas.toDataURL("image/jpeg", 0.78);
    window.setTimeout(() => {
      onCapture({ face: target.key, samples, preview, quality: metrics.quality, diagnostics: { stability: metrics.stability, sharpness: metrics.sharpness, brightness: metrics.brightness, glare: 100 - metrics.glare, spread: activeFrame.spread, sampling } });
      setCapturing(false);
    }, 145);
  };

  const calibrationStyle = { left: `${sampling.x * 100}%`, top: `${sampling.y * 100}%`, width: `${sampling.scale * 100}%` };

  return (
    <main className="scan-layout">
      <section className="scan-workbench" aria-label="Cube camera scanner">
        <div className="scanner-topline"><button className="icon-button" onClick={onBack} aria-label="Exit scanner"><ArrowLeft size={18} /></button><div className="scan-heading"><span className="eyebrow">Capture protocol</span><h1>Scan face {stepIndex + 1}<span>/6</span></h1></div><div className="readout-chip"><span className="live-dot" />{cameraStatus === "active" ? "LIVE" : "SETUP"}</div></div>
        <div className="instruction-band"><div className="face-color-dot" style={{ background: `var(--cube-${target.center.toLowerCase()})` }} /><div><span>{target.rotationHint}</span><strong>{target.instruction}</strong></div><Lightbulb size={18} aria-hidden="true" /></div>
        <div className={`camera-stage ${capturing ? "is-capturing" : ""}`}>
          <video ref={videoRef} className="camera-feed" muted playsInline autoPlay /><canvas ref={canvasRef} className="hidden-canvas" /><div className="camera-scrim" />
          <div className="aperture-frame" style={calibrationStyle} aria-hidden="true"><i /><i /><i /><i /><div className="grid-lines"><b /><b /><b /><b /></div><div className="scan-trace" /></div>
          {cameraStatus === "requesting" && <div className="camera-message"><Aperture size={26} /><strong>Opening the rear camera</strong><p>Waiting for a real video frame before scanner controls unlock.</p></div>}
          {(cameraStatus === "blocked" || cameraStatus === "unsupported") && <div className="camera-message camera-error"><CircleAlert size={26} /><strong>{errorMessage}</strong><p>On a phone, use Chrome or Safari over HTTPS and allow camera permission. The scanner will activate immediately once a video feed is available.</p><button onClick={startCamera}><RefreshCw size={15} /> Reopen camera</button><button className="text-action" onClick={onUseSample}>Open a sample cube instead</button></div>}
          {cameraStatus === "active" && <div className="camera-inset"><span>{metrics.recommended ? <Check size={14} /> : <Focus size={14} />}{metrics.recommended ? "Validated frame" : "Reading optical frame"}</span><span>{metrics.quality}% evidence</span></div>}
        </div>
        <section className="scan-console" aria-label="Scanner diagnostics and capture action" aria-live="polite">
          <div className="diagnostic-grid"><div className="diagnostic-copy"><span className="eyebrow">Evidence readout</span><strong>{metrics.recommended ? "Ready to lock" : frame ? "Capture permitted — review advised" : "Waiting for live evidence"}</strong><p>{metrics.recommended ? "Multiple frames agree and the calibrated colour windows are within range." : frame ? "Use the on-screen nudge controls if the cube does not match the guide. You can still capture for a flagged review." : "Keep the cube inside the guide while the camera stream begins."}</p></div><div className="live-grid" aria-label="Live sticker samples">{frame ? frame.samples.map((sample, index) => <i key={index} style={{ background: labToCss(sample) }} />) : Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div><div className="confidence-meter" aria-label={`${metrics.quality}% optical evidence`}><span style={{ width: `${metrics.quality}%` }} /></div></div>
          <div className="metric-strip" aria-label="Live scan checks"><span><i className={metrics.stability >= 72 ? "is-good" : ""} />Stable {metrics.stability}%</span><span><i className={metrics.brightness >= 48 ? "is-good" : ""} />Light {metrics.brightness}%</span><span><i className={metrics.glare >= 62 ? "is-good" : ""} />Glare safe {metrics.glare}%</span></div>
          <div className="calibration-controls"><div><SlidersHorizontal size={15} /><span><strong>Align sampling grid</strong> Match the guide to the face before you read. Controls activate once a camera feed is available.</span></div><div className="calibration-actions"><button disabled={cameraStatus !== "active"} onClick={() => adjustSampling("x", -0.025)} aria-label="Move sampling grid left">←</button><button disabled={cameraStatus !== "active"} onClick={() => adjustSampling("y", -0.025)} aria-label="Move sampling grid up">↑</button><button disabled={cameraStatus !== "active"} onClick={() => adjustSampling("y", 0.025)} aria-label="Move sampling grid down">↓</button><button disabled={cameraStatus !== "active"} onClick={() => adjustSampling("x", 0.025)} aria-label="Move sampling grid right">→</button><button disabled={cameraStatus !== "active"} onClick={() => adjustSampling("scale", -0.04)} aria-label="Make sampling grid smaller">−</button><button disabled={cameraStatus !== "active"} onClick={() => adjustSampling("scale", 0.04)} aria-label="Make sampling grid larger">+</button></div></div>
          <button className="capture-button" onClick={handleCapture} disabled={!canCapture}><span className="capture-ring"><Camera size={22} /></span><span>{capturing ? "Locking face" : captureMessage}</span></button>
        </section>
      </section>
      <aside className="scan-rail" aria-label="Scan progress"><div className="rail-header"><span className="eyebrow">Face ledger</span><LockKeyhole size={16} /></div><div className="face-ledger">{FACE_ORDER.map((face, index) => { const done = capturedFaces.has(face.key); const active = index === stepIndex; return <div className={`ledger-item ${done ? "is-done" : ""} ${active ? "is-active" : ""}`} key={face.key}><div className="ledger-index">{done ? <Check size={13} /> : index + 1}</div><div><strong>{face.label}</strong><span>{done ? "captured" : active ? "in frame" : "queued"}</span></div><div className="mini-face" aria-hidden="true">{Array.from({ length: 9 }, (_, gridIndex) => <i key={gridIndex} style={{ background: gridIndex === 4 ? `var(--cube-${face.center.toLowerCase()})` : undefined }} />)}</div></div>; })}</div><div className="rail-note"><img src="/manus-storage/cerberus-cube-frame-guide_38a22b61.jpg" alt="Cube aligned inside an optical scan frame" /><p><strong>Evidence-based read</strong>Every color is compared to your six captured center stickers in the same lighting.</p></div></aside>
    </main>
  );
}
