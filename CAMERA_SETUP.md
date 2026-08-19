# Cerberus Cube Pro: Phone Camera Setup

Cerberus works entirely in the browser, but phone cameras can only be accessed from a **secure context**. Use a published HTTPS site or `http://localhost` on the same computer. Do not open the app from a plain `http://192.168.x.x` address on your phone; mobile Chrome and Safari normally block camera access there.

| Item | Recommended setup |
|---|---|
| Browser | Current Chrome on Android or Safari on iPhone |
| Connection | Published HTTPS URL; use project preview for testing |
| Permissions | Allow camera access when prompted; remove an earlier “blocked” permission in browser site settings before retrying |
| Lighting | Bright, diffuse daylight or indoor light; avoid a direct lamp reflecting from stickers |
| Framing | Keep one full face inside the adjustable 3×3 guide; use the on-screen nudge controls if the guide is not aligned |
| Capture | Prefer “validated face”; “capture & review quality” is available only to recover an imperfect-but-readable frame in the manual audit |

The scanner compares all stickers to the six center references captured under the same lighting and uses a globally constrained assignment: every colour is limited to its eight non-center stickers. The final review marks low-confidence reads and rejects a colour count that is not exactly nine of each colour before a solve is created.
