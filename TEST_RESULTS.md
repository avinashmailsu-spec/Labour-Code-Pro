# LabourCode Pro Web 1.2.0 — Validation Report

## Automated integrity and source preservation

- **PASS**: All original uploaded PDF binaries match the bundled PDFs by SHA-256.
- **PASS**: Original Gazette pages: 29 (Wages), 56 (Industrial Relations), 116 (Social Security) and 86 (OSH) — **287 pages total**.
- **PASS**: Search indexes contain the original 480 statutory sections.
- **PASS**: All required web resources exist and the app scripts parse.
- **PASS**: New `modern-studio-v12.css` and `modern-studio-v12.js` are loaded after earlier compatibility layers.
- **PASS**: Both newly introduced assets are in the PWA service worker's precache list.

## Contained Chromium browser tests

Because this execution environment blocks browser navigation to localhost, browser tests used a self-contained page containing the site's CSS/JavaScript and embedded artwork, with a fixture for the bundled search indexes. These are **simulated browser-interface tests**, not live GitHub Pages tests.

| Browser viewport | Horizontal overflow | JavaScript errors | Navigation and interactions |
|---|---:|---:|---|
| 320 × 760 | 0 px | 0 | Passed |
| 360 × 800 | 0 px | 0 | Passed |
| 390 × 844 | 0 px | 0 | Passed |
| 768 × 1000 | 0 px | 0 | Passed |
| 1280 × 900 | 0 px | 0 | Passed |
| 1440 × 900 | 0 px | 0 | Passed |

Interactions tested: mobile More menu, study challenge answers and feedback, next question, Day/Night theme switch, full-text legal Search, opening all four Gazette library cards and the eight visual learning modules.

## Still to verify after deployment

- Actual GitHub Pages deployment and HTTPS PWA installation.
- Real offline reload after the first service-worker cache installation.
- Real PDF toolbar behaviour across Safari, Firefox and Android/iOS browser implementations.
- User acceptance on physical phones, tablets and desktops.

The app is an educational reference. Original enactments are not automatically updated consolidations of operative law.
