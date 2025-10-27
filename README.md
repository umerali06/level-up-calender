# Level Up Calendly Demo — Responsive Curvy Pack

This repo contains two static pages (`index.html` PT and `index-en.html` EN) with a responsive curved question block, decorative arrows/labels, token liquidity stats, and an icons grid.

## Preview locally

- Option A (quick): Double‑click `index.html` or `index-en.html` to open in your default browser.
- Option B (VS Code): Use the "Live Server" extension and click "Go Live" to serve the folder.

## Screenshot guide

Target sizes:
- Mobile: 375 × 812 (portrait)
- Desktop: 1440 × 900

Use Chrome or Edge DevTools (Windows):
1) Open `index.html` (PT) and `index-en.html` (EN).
2) Press `Ctrl+Shift+I` to open DevTools.
3) Toggle device toolbar with `Ctrl+Shift+M`.

Mobile (375×812):
- In the device toolbar, pick iPhone X/XS (375×812), or set Responsive to Width=375, Height=812, DPR=3.
- Ensure page zoom is 100% and scroll to show the question+arrows and the two‑column icons grid.
- Click the device toolbar "⋯" menu → "Capture screenshot", or press `Ctrl+Shift+P` and run "Capture screenshot".
- Save as `pt-375x812.png` and `en-375x812.png`.

Desktop (1440×900):
- Keep the device toolbar enabled and set Responsive to Width=1440, Height=900, DPR=1 (or 2 for a sharper image).
- Scroll so the question+arrows and the icons grid are visible.
- Capture the screenshot as above.
- Save as `pt-1440x900.png` and `en-1440x900.png`.

Tips:
- If full‑page capture crops oddly, use normal "Capture screenshot" while the section is in view.
- Ensure browser zoom is 100%. Disable any extensions that alter page layout.

## What to verify in the screenshots

- Mobile icons are in 2 columns with 12–16px gaps; rows have equal heights; numbers are right‑aligned.
- Headings "Liquidez do Token" and "Eleva a tua empresa" share typography (uppercase; same size).
- Central question wraps to two balanced lines and stays centered.
- Decorative arrows/labels and the contact curve don’t clip; strokes keep consistent width on resize.
- There is a single vertical scrollbar (root/HTML); no horizontal scrolling.

## Tech notes

- Headings are unified via `--title-size: clamp(20px, 2.9vw, 32px)`, producing ~20–22px on mobile and 28–32px on desktop.
- SVGs use `preserveAspectRatio="xMidYMid meet"` and `vector-effect="non-scaling-stroke"` to prevent distortion and clipping.
- Icons grid maintains two columns on tablet and mobile with equal card heights via `min-height` per breakpoint.

## Troubleshooting

- If the question doesn’t wrap into two lines on your system fonts, tweak the `max-width` of `.curvy-pack .q` (26–28ch) in `styles.css`.
- If any arrow/label appears close to the edges on unusual devices, nudge positions at the nearest breakpoint. The CSS includes grouped breakpoints to follow.
