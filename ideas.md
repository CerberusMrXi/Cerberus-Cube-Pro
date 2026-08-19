# Cerberus Cube Pro — Design Directions

## Three stylistic approaches

| Theme Name | Very Brief Intro | Probability |
| --- | --- | --- |
| Instrument Panel | A precision-led mobile utility inspired by premium field equipment, where scanning feels deliberate, stable, and trustworthy. | 0.07 |
| Playful Puzzle Lab | A brighter educational system with tactile blocks and collected cube studies, tuned for first-time solvers. | 0.04 |
| Gallery of Motion | An editorial, art-directed approach that makes each cube face feel like a specimen under careful observation. | 0.09 |

## Chosen approach — Instrument Panel

### Design Movement

**Swiss functionalism meets precision field instruments.** The interface should feel like a capable optical tool rather than a decorative puzzle game: exact hierarchy, compact controls, observable status, and information that earns its place.

### Core Principles

1. **Evidence before action:** show camera readiness, scan confidence, face order, and validation state clearly before the user captures a face.
2. **One-handed clarity:** the primary action stays within thumb reach on phones; essential context remains visible without obscuring the camera.
3. **Progress is physical:** face progress is represented as a tangible six-face strip, not just a percentage.
4. **Correction without punishment:** uncertain stickers surface their confidence and can be corrected individually while immutable center colors keep the cube model coherent.

### Color Philosophy

The palette is dominated by **graphite, warm mineral white, and optic black**, so the cube’s genuine sticker colors remain visually meaningful. A vivid **signal lime** identifies confirmed, stable recognition; muted amber signals a rescan decision without reading as a failure. This avoids decorative rainbow effects competing with the cube itself.

### Layout Paradigm

The mobile layout is a vertical **instrument rail**: a compact status header, a large camera stage, then a thumb-reach action dock. On wider screens, the camera stage remains dominant while a slim diagnostics rail holds face progress and scanning criteria. The interface is intentionally asymmetric and task-driven, never a centered marketing card.

### Signature Elements

1. **The aperture frame:** a rounded-square camera guide with clipped calibration corners and a softly animated scan trace.
2. **The face ledger:** six compact cube-face tiles that change from outlined to confirmed as scanning advances.
3. **Measured confidence:** a small segmented meter and plain-language status such as “Stable capture” rather than vague AI claims.

### Interaction Philosophy

Controls respond like equipment: decisive press states, no ambiguous gestures, always-visible escape routes, and automatic capture only after several consistent readings. Manual capture and manual correction remain available so the user stays in control.

### Animation

Motion is restrained and functional. The scanning trace moves continuously but slowly; successful captures lock in with a 180 ms confirmation ripple; face tiles enter with a 45 ms stagger. Avoid looping celebratory animations during scanning. All non-essential motion is disabled for reduced-motion preferences.

### Typography System

**Space Grotesk** handles headings, device-like labels, and numerical confidence because of its technical geometry. **Manrope** carries instructional copy for calm readability. Headings use strong, compact sentence case; diagnostics are uppercase with wide tracking; body text is short, direct, and never smaller than 13 px on phone.

### Brand Essence

**Cerberus Cube Pro is the calm, camera-first Rubik’s Cube scanning tool for people who want a reliable path from scramble to solution.**

Personality: **precise, composed, encouraging.**

### Brand Voice

Headlines are short and action-led. CTAs describe the result of the action, while microcopy gives a concrete reason when capture is not ready.

> “Hold the cube inside the frame.”

> “Capture when all nine stickers are stable.”

### Wordmark & Logo

The mark is a compact **three-aperture cube**: three overlapping rounded square planes implying the front, top, and right faces of a cube, with a small signal-lime focal point at the shared corner. No text inside the mark. The wordmark pairs a geometric “CERBERUS” with a lighter “CUBE PRO”.

### Signature Brand Color

**Signal Lime — #C8FF38.** It is reserved for confirmed perception, active progress, and the primary capture control.

## Style Decisions

- **Signal Lime** is limited to primary actions, confirmed/progress states, scan traces, key numerals, and small focal points. Hero headline authority stays predominantly warm mineral white.
- Every major home section must carry at least one operational primitive: an aperture frame, face ledger, segmented confidence meter, diagnostic rail, or clipped calibration corner.
- Hero imagery must depict Cerberus actively reading the cube through an interface overlay, rather than presenting an unadorned product still life.
