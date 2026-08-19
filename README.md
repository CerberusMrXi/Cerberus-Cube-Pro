# Cerberus Cube Pro

> **A mobile-first Rubik’s Cube scanner that measures, validates, and explains a cube state before generating a solve plan.**

Cerberus Cube Pro is a browser-based cube-scanning application designed as a deliberate, transparent alternative to colour-guessing demos. It guides users through all six faces of a Rubik’s Cube, compares sticker readings against calibrated centre colours, identifies uncertain measurements, and provides a focused review step before producing a browser-local solution plan.

The application is built around one core principle:

> **Evidence before automation.**A cube state should be measured, checked, and reviewed before it is sent to a solver.

---

## Contents

- [Overview](#overview)

- [Key Features](#key-features)

- [How It Works](#how-it-works)

- [Technology](#technology)

- [Requirements](#requirements)

- [Run Locally](#run-locally)

- [Use the Scanner](#use-the-scanner)

- [Camera and Lighting Guidance](#camera-and-lighting-guidance)

- [Phone Testing](#phone-testing)

- [Project Structure](#project-structure)

- [Asset Delivery](#asset-delivery)

- [Available Commands](#available-commands)

- [Validation Rules](#validation-rules)

- [Troubleshooting](#troubleshooting)

- [Privacy and Security](#privacy-and-security)

- [Development Guidelines](#development-guidelines)

- [Contributing](#contributing)

- [Known Limitations](#known-limitations)

- [Author](#author)

- [References](#references)

---

## 📸 Screenshots

### Main Interface

<div align="center">
  <img src="https://github.com/user-attachments/assets/b0ba6418-0dac-42c3-ba6e-983b71f0aaa9" alt="Main Interface" width="95%">
</div>

### Scanner Interface

<div align="center">
  <img src="https://github.com/user-attachments/assets/9b037b9e-661c-47e7-9c6f-40debd7e900d" alt="Scanner Interface" width="95%">
</div>

---

## Overview

Cerberus Cube Pro combines a guided camera workflow with local cube-state validation and solving. Instead of trusting one camera frame, it collects repeatable evidence while the user keeps the cube aligned. The six centre stickers establish the colour identity and orientation of the cube; other stickers are then classified relative to those calibrated colours.

The scanner intentionally exposes uncertainty. Glare, shadows, poor framing, damaged stickers, dark rooms, and similar-looking colours can all produce unreliable readings. When that happens, the interface highlights the affected stickers and lets the user correct or recapture them before the solve plan is created.

| Project attribute | Detail |
| --- | --- |
| **Project** | Cerberus Cube Pro |
| **Author** | **Sudeepa Waniagarathna** |
| **Application type** | React and Vite browser application |
| **Primary workflow** | Guided six-face capture → quality review → local solve plan |
| **Scanner principle** | Centre-led calibration with multi-frame evidence |
| **Solver location** | Browser-local; no external cube-solving service is required |
| **Package manager** | pnpm 10.4.1 |
| **Primary target** | Desktop and mobile browsers with camera access |

## Key Features

| Feature | Purpose |
| --- | --- |
| **Guided face ledger** | Leads the user through a consistent six-face capture order so cube orientation is preserved. |
| **Centre-led calibration** | Uses the six centre stickers as the colour reference for the complete cube. |
| **Multi-frame consensus** | Waits for repeatable camera evidence instead of relying on a single arbitrary frame. |
| **Adjustable 3×3 sampling frame** | Allows the measurement grid to be moved and resized to match the physical sticker boundaries. |
| **Live diagnostics** | Reports camera permission, stream status, stability, lighting, glare, and alignment conditions. |
| **Low-confidence review** | Highlights uncertain non-centre stickers for targeted correction. |
| **Cube integrity validation** | Confirms that the completed state contains exactly nine stickers of each colour. |
| **Local solution plan** | Generates a step-by-step move list inside the browser. |
| **Mobile-first workflow** | Provides a camera-oriented interface suitable for supported phone browsers. |
| **Privacy-conscious operation** | Performs normal scanning, validation, and solving locally in the browser. |

## How It Works

The scanning workflow has four stages:

### 1. Calibrate the cube

The application captures the six centre stickers and uses them to establish the colour identity of each face. Centres remain fixed because they define the cube’s orientation and colour scheme.

### 2. Capture each face

The user follows the face ledger and presents one complete face inside the visible 3×3 sampling guide. The interface evaluates the camera stream for alignment and stability before capture.

### 3. Review the measurements

After all six faces are captured, the application displays the reconstructed cube state. Uncertain sticker readings are highlighted so the user can recapture or correct only the affected non-centre stickers.

### 4. Validate and solve

The application checks the final cube state, including the requirement that every colour appears exactly nine times. Once the state is valid, the browser creates a local solution plan.

```
Camera permission
       ↓
Centre calibration
       ↓
Guided six-face capture
       ↓
Multi-frame evidence and diagnostics
       ↓
Low-confidence review
       ↓
Cube integrity validation
       ↓
Browser-local solution plan
```

## Technology

| Layer | Technology or approach |
| --- | --- |
| **Frontend** | React with Vite |
| **Language** | TypeScript |
| **Development server** | Vite |
| **Package management** | pnpm 10.4.1 |
| **Camera input** | Browser Media Capture and Streams API |
| **Scanning logic** | Centre-relative colour classification and multi-frame evidence |
| **Validation** | Client-side cube-state integrity checks |
| **Solving** | Browser-local solve-plan generation |
| **Storage-backed assets** | Managed File Storage paths under `/manus-storage/...` |

The camera workflow relies on the browser’s `MediaDevices.getUserMedia()` capability. Camera access is permission-controlled by the browser and requires an appropriate secure context for most non-localhost use cases.[1]

## Requirements

Use a current Node.js installation and PowerShell on Windows. The repository is configured for **pnpm**, so `npm install` should not be used as the primary installation path.

| Requirement | Recommended configuration |
| --- | --- |
| **Node.js** | Current LTS or a current Node 22 release |
| **Package manager** | pnpm 10.4.1 through Corepack |
| **Desktop browser** | Current Chrome, Edge, or Firefox with webcam access |
| **Android browser** | Current Chrome with camera permission enabled |
| **iPhone browser** | Current Safari with camera permission enabled |
| **Lighting** | Bright, even, indirect light with minimal sticker reflection |
| **Cube** | A standard, fully assembled 3×3 Rubik’s Cube |

## Run Locally

### Windows with PowerShell

Open PowerShell in the project directory and run:

```
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install
pnpm dev
```

Open the local address printed by Vite. The development server normally uses:

```
http://localhost:3000
```

### If Corepack is unavailable

Install the required pnpm version globally, close and reopen PowerShell, and then start the project:

```
npm install -g pnpm@10.4.1
pnpm install
pnpm dev
```

If PowerShell cannot resolve `pnpm` after installation, use the Windows command shim for that session:

```
pnpm.cmd install
pnpm.cmd dev
```

### Development server notes

Use the project’s normal development command rather than starting Vite as an isolated static server. The full application may depend on the project server for managed storage paths and other full-stack behavior.

## Use the Scanner

1. Select **Open camera scanner** and grant camera permission when prompted.

1. Follow the face ledger in the order shown by the interface.

1. Present one complete cube face inside the visible 3×3 guide.

1. Keep the cube still while the evidence readout becomes stable.

1. Adjust the sampling frame’s position and size whenever it does not align with the physical sticker boundaries.

1. Capture the face only when all nine stickers are visible and correctly framed.

1. Repeat the process for all six faces without randomly changing the cube orientation.

1. Inspect the review screen after the sixth face is captured.

1. Rescan or correct highlighted non-centre stickers when necessary.

1. Confirm that every colour appears exactly nine times.

1. Create the local solve plan and follow the generated move list.

The face order matters. Randomly rotating the cube between captures can produce a state that looks visually complete but cannot be interpreted correctly by the solver.

## Camera and Lighting Guidance

Camera recognition is sensitive to the physical environment. A strong direct reflection may change the apparent colour of a sticker, while shadows or uneven lighting can make two colours appear artificially similar.

| Condition | Recommended response |
| --- | --- |
| **A direct light reflects in a sticker** | Move away from the light source or tilt the cube slightly. |
| **White and yellow appear similar** | Use brighter, indirect light and recapture the affected face. |
| **The grid does not match the face** | Adjust the sampling-frame position and scale before capturing. |
| **A sticker is partly outside the guide** | Reframe the cube so all nine stickers are fully visible. |
| **The cube moves during evidence collection** | Hold it still until the stability indicator becomes acceptable. |
| **One or more stickers are uncertain** | Improve the lighting and framing, then rescan before using manual correction. |
| **A sticker is damaged or unusually dirty** | Treat the reading as low-confidence and verify it carefully during review. |

For the most reliable results, use indirect light, avoid reflective surfaces behind the cube, keep the camera lens clean, and hold the cube at a comfortable distance from the camera.

## Phone Testing

The browser camera API generally requires a secure context. `http://localhost` is valid when the browser runs on the same computer, but a phone usually needs an HTTPS address. Most mobile browsers block camera access from a plain local-network URL such as `http://192.168.x.x`.[1]

| Device scenario | Correct setup |
| --- | --- |
| **Desktop test** | Run `pnpm dev` and open `http://localhost:3000`. |
| **Phone test** | Use a published HTTPS site and allow camera permission. |
| **Permission was previously blocked** | Remove the block in the browser’s site-permission settings and reload. |
| **Another app holds the camera** | Close the other app, then retry the camera stream. |
| **The phone shows a blank or blocked preview** | Confirm HTTPS, camera permission, browser compatibility, and lens access. |

## Project Structure

The following structure reflects the application’s main responsibilities:

```
cerberus-cube-pro/
├── client/
│   └── src/
│       ├── components/      # Scanner, review, diagnostics, and solve views
│       ├── lib/
│       │   └── cubeScan.ts  # Colour classification and cube-state validation
│       └── pages/
│           └── Home.tsx     # Main workflow orchestration
├── server/
│   ├── storage.ts           # Managed File Storage helper
│   └── routers.ts           # Typed full-stack API router
├── CAMERA_SETUP.md          # Practical camera and lighting advice
├── LOCAL_RUN.md             # Concise Windows run instructions
├── todo.md                  # Implementation checklist
├── package.json             # Scripts and dependency metadata
└── README.md                # Project documentation
```

The exact file layout may evolve as the application grows. New scanner logic should remain separate from page-level orchestration, and storage-specific behavior should remain isolated in the server storage layer.

## Asset Delivery

The current project configuration uses **managed File Storage** for the five Cerberus visual assets. This keeps large media outside the source tree while preserving the product imagery in development and deployed environments.

| Asset | Managed path |
| --- | --- |
| **Brand mark** | `/manus-storage/cerberus-cube-mark_49120b58.png` |
| **Hero image** | `/manus-storage/cerberus-cube-hero_7784f8eb.jpg` |
| **Alignment guide** | `/manus-storage/cerberus-cube-frame-guide_38a22b61.jpg` |
| **Rotation guide** | `/manus-storage/cerberus-cube-rotation-guide_bdd33bfe.jpg` |
| **Validation guide** | `/manus-storage/cerberus-cube-validation-guide_e789588a.jpg` |

Use the project’s File Storage panel when replacing these assets. Keep the resulting `/manus-storage/...` path in the frontend rather than copying large images into `client/public` or `client/src/assets`.

### Offline asset variant

Some downloaded versions of the project may contain an offline image package instead of managed storage. In that variant, the files are located at:

```
client/public/images/
├── cerberus-cube-hero.jpg
├── cerberus-cube-frame-guide.jpg
├── cerberus-cube-rotation-guide.jpg
├── cerberus-cube-validation-guide.jpg
└── cerberus-cube-mark.png
```

Vite serves files in `public` from the site root and copies them unchanged into the production output.[2] For an offline package, frontend references should therefore use paths such as `/images/cerberus-cube-hero.jpg`.

Do not mix the two asset strategies accidentally. If an image is missing, first confirm whether the project references `/manus-storage/...` or `/images/...`, then verify that the corresponding asset exists in the configured storage location.

## Available Commands

Run the following commands from the project root:

| Command | Purpose |
| --- | --- |
| `pnpm install` | Installs project dependencies from the pnpm lockfile. |
| `pnpm dev` | Starts the local development environment. |
| `pnpm check` | Runs the TypeScript and project checks configured by the repository. |
| `pnpm build` | Produces the browser and full-stack production build. |

Before sharing changes or producing a release build, run:

```
pnpm check
pnpm build
```

A successful build should include the application assets and preserve the configured storage or public-image routes.

## Validation Rules

The scanner should not create a solve plan until the reconstructed cube state is internally consistent.

| Validation area | Expected result |
| --- | --- |
| **Face completeness** | Six faces have been captured or otherwise supplied. |
| **Sticker completeness** | Each face contains nine sticker readings. |
| **Colour counts** | Every cube colour appears exactly nine times. |
| **Centre integrity** | Centre colours remain consistent with the captured orientation. |
| **Review status** | Low-confidence readings have been inspected and resolved. |
| **Solver input** | The final state uses one consistent face order and orientation. |

A colour-count check alone cannot guarantee that every arbitrary arrangement is mechanically solvable, so future solver validation should also consider cubie orientation and permutation constraints where appropriate.

## Troubleshooting

### The camera does not start

Confirm that the browser has camera permission, that another application is not using the camera, and that the development server is running through the normal project command. If permission was denied previously, remove the block from the browser’s site settings and reload the page.

### The camera works on desktop but not on a phone

Use an HTTPS deployment for phone testing. A plain local-network HTTP address is commonly rejected by mobile browsers because camera access requires a secure context. Also verify that the browser is current and that the operating system has granted camera access to the browser.

### The scanner reports unstable evidence

Place the cube on a stable surface or hold it firmly, improve the lighting, clean the camera lens, and avoid moving the sampling guide while evidence is being collected. Recapture the face after the stability indicator improves.

### Colours are being classified incorrectly

Avoid direct glare and coloured lighting. Use bright, even, indirect illumination and ensure that the 3×3 sampling frame is aligned with the sticker boundaries rather than the outer edge of the cube.

### The sampling grid is misaligned

Use the on-screen position and size controls before capturing. Each sample should be taken from the interior of a sticker, not from the border between two stickers.

### An image does not appear

First determine which asset strategy the project uses. For managed storage, confirm that the referenced `/manus-storage/...` path is valid and that the full-stack development server is running. For the offline variant, confirm that the five files remain under `client/public/images/`, restart the development server, and perform a hard refresh with `Ctrl+F5`.

### The solve plan cannot be created

Review every highlighted sticker, verify the face order, confirm that centre stickers were not incorrectly changed, and check that every colour appears exactly nine times. If the state still fails validation, recapture all uncertain faces under better lighting.

## Privacy and Security

The normal scanning, validation, and solving workflow runs in the browser. Camera access is explicitly controlled by the user’s browser permission model.

For safer use:

- Grant camera access only to the expected application origin.

- Revoke camera permission when the scanner is no longer needed.

- Avoid running the development server on an untrusted public network.

- Do not capture people, documents, or surroundings unnecessarily.

- Review any future telemetry or upload feature carefully before enabling it.

- Keep dependencies updated and review changes that affect camera access or storage.

Cerberus Cube Pro does not require an external cube-solving service for its normal solve workflow.

## Development Guidelines

### Preserve the workflow contract

Changes should maintain the sequence of calibration, capture, review, validation, and solve. Avoid bypassing the review step merely to make the happy path shorter; review is a core product feature rather than an error state.

### Keep uncertainty visible

Scanner confidence, camera state, alignment, glare, and stability should be communicated clearly. If a reading is uncertain, expose that uncertainty and provide a practical recovery action.

### Treat centre stickers as orientation data

Centre stickers establish the cube’s colour identity and face orientation. New correction controls should not allow centre values to be edited casually.

### Test with real camera conditions

Unit checks are useful for classification and validation, but camera behavior should also be tested with different lighting conditions, reflective stickers, dark rooms, partial framing, and mobile browsers.

### Validate before shipping

Run the type checks and production build before opening a pull request or distributing a local copy:

```
pnpm check
pnpm build
```

## Contributing

Contributions are welcome when they improve scan reliability, explain uncertainty more clearly, strengthen validation, or make the experience more accessible.

Before submitting a change, describe the user problem it solves, explain any impact on cube orientation or solver input, and include the verification steps you performed. For camera-related changes, test both a desktop webcam and a supported mobile browser whenever possible.

A practical contribution workflow is:

```
git checkout -b feature/your-change
pnpm install
pnpm check
pnpm build
```

Then commit the focused change, open a pull request, and include screenshots or a short reproduction description when the change affects scanner behavior or visual layout.

## Known Limitations

The scanner’s accuracy depends on camera quality, lighting, sticker condition, cube alignment, and user stability. No colour classifier can reliably recover information that is hidden by glare, occlusion, or severe blur.

Phone camera access depends on browser security rules and generally requires HTTPS outside `localhost`. Performance and camera behavior can also vary by browser, operating system, device hardware, and active permissions.

The interface is designed to support targeted human correction, but users remain responsible for confirming that the cube is physically represented correctly before following a generated solution.

## Author

**Sudeepa Waniagarathna**

## References

[1]: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia "MDN Web Docs: MediaDevices.getUserMedia( )"

[2]: https://vite.dev/guide/assets.html#the-public-directory "Vite: Static Asset Handling — The public Directory"

---

**Cerberus Cube Pro** turns cube scanning into a measurable, reviewable workflow: calibrate carefully, capture consistently, inspect uncertainty, validate the state, and only then solve.

© Sudeepa Waniagarathna. Documentation prepared for the Cerberus Cube Pro project.

