/* Cerberus Instrument Panel: calibrated color science, constrained cube-state assignment, and explicit confidence. */
import Cube from "cubejs";

export type FaceKey = "U" | "R" | "F" | "D" | "L" | "B";
export type Sticker = "W" | "R" | "G" | "Y" | "O" | "B";
export type Lab = [number, number, number];

export interface FaceSpec {
  key: FaceKey;
  center: Sticker;
  label: string;
  instruction: string;
  rotationHint: string;
}

export interface CaptureDiagnostics {
  stability: number;
  sharpness: number;
  brightness: number;
  glare: number;
  spread: number;
  sampling: { x: number; y: number; scale: number };
}

export interface CapturedFace {
  face: FaceKey;
  samples: Lab[];
  preview: string;
  quality: number;
  diagnostics: CaptureDiagnostics;
}

export interface StickerConfidence {
  face: FaceKey;
  index: number;
  assigned: Sticker;
  suggested: Sticker;
  confidence: number;
  margin: number;
}

export interface ScanClassification {
  faces: CubeFaces;
  stickers: StickerConfidence[];
  averageConfidence: number;
  uncertainCount: number;
}

export type CubeFaces = Record<FaceKey, Sticker[]>;
export type RawFaces = Partial<Record<FaceKey, CapturedFace>>;

export const FACE_ORDER: FaceSpec[] = [
  { key: "U", center: "W", label: "White", instruction: "Keep green facing you. Scan the white face on top.", rotationHint: "Face 1 · reference face" },
  { key: "R", center: "R", label: "Red", instruction: "Keep white on top, then turn the cube left to reveal red.", rotationHint: "Face 2 · rotate left" },
  { key: "F", center: "G", label: "Green", instruction: "Return green to the camera with white still on top.", rotationHint: "Face 3 · front face" },
  { key: "D", center: "Y", label: "Yellow", instruction: "Turn the cube over. Keep green toward the camera.", rotationHint: "Face 4 · turn over" },
  { key: "L", center: "O", label: "Orange", instruction: "Keep white on top, then turn the cube right to reveal orange.", rotationHint: "Face 5 · rotate right" },
  { key: "B", center: "B", label: "Blue", instruction: "Keep white on top, then rotate fully around to blue.", rotationHint: "Face 6 · rear face" },
];

export const STICKER_META: Record<Sticker, { name: string; css: string; text: string }> = {
  W: { name: "White", css: "#f1ede2", text: "#1a1b18" },
  Y: { name: "Yellow", css: "#f4cc3c", text: "#1a1b18" },
  G: { name: "Green", css: "#4da866", text: "#f9faf5" },
  B: { name: "Blue", css: "#396cb2", text: "#f9faf5" },
  R: { name: "Red", css: "#c9534b", text: "#f9faf5" },
  O: { name: "Orange", css: "#dd8236", text: "#1a1b18" },
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function rgbToLab(r: number, g: number, b: number): Lab {
  const pivot = (value: number) => (value > 0.04045 ? ((value + 0.055) / 1.055) ** 2.4 : value / 12.92);
  const red = pivot(r / 255);
  const green = pivot(g / 255);
  const blue = pivot(b / 255);
  const x = (red * 0.4124 + green * 0.3576 + blue * 0.1805) / 0.95047;
  const y = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  const z = (red * 0.0193 + green * 0.1192 + blue * 0.9505) / 1.08883;
  const f = (value: number) => (value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function labToCss([l, a, b]: Lab) {
  const y = (l + 16) / 116;
  const x = a / 500 + y;
  const z = y - b / 200;
  const inverse = (value: number) => {
    const cube = value ** 3;
    return cube > 0.008856 ? cube : (value - 16 / 116) / 7.787;
  };
  const xx = 0.95047 * inverse(x);
  const yy = inverse(y);
  const zz = 1.08883 * inverse(z);
  const linear = [
    xx * 3.2406 + yy * -1.5372 + zz * -0.4986,
    xx * -0.9689 + yy * 1.8758 + zz * 0.0415,
    xx * 0.0557 + yy * -0.204 + zz * 1.057,
  ].map((value) => (value > 0.0031308 ? 1.055 * value ** (1 / 2.4) - 0.055 : 12.92 * value));
  const rgb = linear.map((value) => Math.round(clamp(value) * 255));
  return `rgb(${rgb.join(",")})`;
}

export function distance(a: Lab, b: Lab) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** Gives chroma priority over brightness, because automatic exposure varies much more than sticker hue. */
export function calibratedDistance(a: Lab, b: Lab) {
  return Math.hypot((a[0] - b[0]) * 0.42, a[1] - b[1], a[2] - b[2]);
}

function hungarian(cost: number[][]) {
  const n = cost.length;
  const u = Array<number>(n + 1).fill(0);
  const v = Array<number>(n + 1).fill(0);
  const p = Array<number>(n + 1).fill(0);
  const way = Array<number>(n + 1).fill(0);
  for (let row = 1; row <= n; row += 1) {
    p[0] = row;
    let column0 = 0;
    const minValue = Array<number>(n + 1).fill(Number.POSITIVE_INFINITY);
    const used = Array<boolean>(n + 1).fill(false);
    do {
      used[column0] = true;
      const row0 = p[column0];
      let delta = Number.POSITIVE_INFINITY;
      let column1 = 0;
      for (let column = 1; column <= n; column += 1) {
        if (used[column]) continue;
        const current = cost[row0 - 1][column - 1] - u[row0] - v[column];
        if (current < minValue[column]) { minValue[column] = current; way[column] = column0; }
        if (minValue[column] < delta) { delta = minValue[column]; column1 = column; }
      }
      for (let column = 0; column <= n; column += 1) {
        if (used[column]) { u[p[column]] += delta; v[column] -= delta; } else { minValue[column] -= delta; }
      }
      column0 = column1;
    } while (p[column0] !== 0);
    do {
      const column1 = way[column0];
      p[column0] = p[column1];
      column0 = column1;
    } while (column0 !== 0);
  }
  const assignment = Array<number>(n).fill(-1);
  for (let column = 1; column <= n; column += 1) assignment[p[column] - 1] = column - 1;
  return assignment;
}

function fallbackFaces(): CubeFaces {
  return FACE_ORDER.reduce((result, face) => { result[face.key] = Array<Sticker>(9).fill(face.center); return result; }, {} as CubeFaces);
}

/**
 * Assigns every non-centre sticker to a globally limited colour slot. Six centres reserve one slot each,
 * leaving exactly eight slots per colour. This avoids the common nearest-neighbour failure where red/orange
 * or white/yellow are over-counted under warm or uneven light.
 */
export function classifyCapturedFaces(captured: RawFaces): ScanClassification {
  const references = FACE_ORDER.map((spec) => ({ color: spec.center, lab: captured[spec.key]?.samples[4] })).filter((entry): entry is { color: Sticker; lab: Lab } => Boolean(entry.lab));
  if (references.length !== FACE_ORDER.length) return { faces: fallbackFaces(), stickers: [], averageConfidence: 0, uncertainCount: 48 };

  const entries = FACE_ORDER.flatMap((face) => (captured[face.key]?.samples ?? []).map((sample, index) => ({ face: face.key, index, sample })).filter((entry) => entry.index !== 4));
  const slots = (Object.keys(STICKER_META) as Sticker[]).flatMap((color) => Array<Sticker>(8).fill(color));
  const candidates = entries.map((entry) => references.map((reference) => ({ color: reference.color, score: calibratedDistance(entry.sample, reference.lab) })).sort((a, b) => a.score - b.score));
  const costs = candidates.map((ranked) => slots.map((slot) => ranked.find((candidate) => candidate.color === slot)?.score ?? 9999));
  const assignment = hungarian(costs);
  const faces = fallbackFaces();
  const stickers: StickerConfidence[] = entries.map((entry, index) => {
    const ranked = candidates[index];
    const assigned = slots[assignment[index]];
    const best = ranked[0].score;
    const runnerUp = ranked[1]?.score ?? best + 1;
    const margin = clamp((runnerUp - best) / Math.max(runnerUp, 1));
    const confidence = clamp(0.34 + margin * 0.42 + clamp(1 - best / 68) * 0.34);
    faces[entry.face][entry.index] = assigned;
    return { face: entry.face, index: entry.index, assigned, suggested: ranked[0].color, confidence, margin };
  });
  FACE_ORDER.forEach((face) => { faces[face.key][4] = face.center; });
  const averageConfidence = stickers.reduce((sum, sticker) => sum + sticker.confidence, 0) / Math.max(1, stickers.length);
  return { faces, stickers, averageConfidence, uncertainCount: stickers.filter((sticker) => sticker.confidence < 0.58).length };
}

export function faceletsFromFaces(faces: CubeFaces) {
  const colorToFace = FACE_ORDER.reduce((result, face) => { result[face.center] = face.key; return result; }, {} as Record<Sticker, FaceKey>);
  return FACE_ORDER.flatMap((face) => faces[face.key].map((sticker) => colorToFace[sticker])).join("");
}

export function validateFaces(faces: CubeFaces) {
  const counts = Object.keys(STICKER_META).reduce((result, color) => { result[color as Sticker] = 0; return result; }, {} as Record<Sticker, number>);
  let centersCorrect = true;
  FACE_ORDER.forEach((face) => {
    if (faces[face.key]?.[4] !== face.center) centersCorrect = false;
    faces[face.key]?.forEach((sticker) => { counts[sticker] += 1; });
  });
  const colorBalance = Object.values(counts).every((count) => count === 9);
  return {
    counts,
    isBalanced: colorBalance && centersCorrect,
    message: !centersCorrect
      ? "A center color changed. Centers are fixed so the solve orientation remains reliable."
      : !colorBalance
        ? "Each of the six colors must appear exactly nine times before solving."
        : "Color balance verified. Your cube is ready for a solve check.",
  };
}

export function sampleCubeFaces(): CubeFaces {
  const cube = new Cube();
  cube.move("R U R' U' F2 D L2 U' B R2");
  const string = cube.asString() as string;
  let pointer = 0;
  const faceToColor = FACE_ORDER.reduce((result, face) => { result[face.key] = face.center; return result; }, {} as Record<FaceKey, Sticker>);
  return FACE_ORDER.reduce((result, face) => {
    result[face.key] = string.slice(pointer, pointer + 9).split("").map((facelet) => faceToColor[facelet as FaceKey]);
    pointer += 9;
    return result;
  }, {} as CubeFaces);
}

export function friendlyMove(move: string) {
  const faceName: Record<string, string> = { U: "top", R: "right", F: "front", D: "bottom", L: "left", B: "back" };
  const face = faceName[move[0]] ?? "selected";
  if (move.includes("2")) return `Turn the ${face} face twice`;
  return `Turn the ${face} face ${move.includes("'") ? "counter-clockwise" : "clockwise"}`;
}
