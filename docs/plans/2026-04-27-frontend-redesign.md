# Frontend Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the CNN 3D Visualizer frontend from a functional prototype to a $150k-agency-level scientific interface — without breaking the Three.js visualizer or backend integration.

**Architecture:** Targeted CSS rewrite + surgical HTML/JS enhancements. No framework migration. No new dependencies. Vanilla HTML/CSS/JS only (per `@redesign-existing-projects`: "Work with the existing tech stack").

**Tech Stack:** HTML5, CSS3 (custom properties, grid, animations, `backdrop-filter`), Vanilla JS, Three.js (existing, untouched), Google Fonts

---

## Skills Used

| Skill | Role | Key Contributions |
|---|---|---|
| `@redesign-existing-projects` | **Primary** | Audit-then-fix workflow, fix-priority order, vanilla CSS compatibility |
| `@high-end-visual-design` | Surface & Motion | Double-Bezel containers, Ethereal Glass vibe, spotlight borders, grain overlays, custom cubic-bezier |
| `@design-taste-frontend` | Quality Gate | DESIGN_VARIANCE=8, MOTION_INTENSITY=6, VISUAL_DENSITY=4, anti-emoji policy, Liquid Glass refraction |
| `@gpt-taste` | Typography | 2-line iron rule, wide containers, spacing discipline |

---

## Design Audit (15 Violations Found)

| # | Problem | Skill Rule Violated | Fix |
|---|---|---|---|
| 1 | Uses `Inter` font | Typography §1 — Inter banned | Swap to `Space Grotesk` + `IBM Plex Mono` |
| 2 | Pure `#000` canvas background | Color §1 — pure black banned | Use off-black `#0a0a0f` |
| 3 | Generic `box-shadow` | Color §6 | Tinted shadows matching background hue |
| 4 | Flat design, zero texture | Color §7 | Subtle grain overlay (fixed, pointer-events-none) |
| 5 | Symmetrical 3-column grid | Layout §1 | Asymmetric grid: `320px 1fr 260px` |
| 6 | No hover states on Clear button | Interactivity §1 | Scale + background shift on hover |
| 7 | No active/pressed feedback | Interactivity §2 | `scale(0.98)` on active |
| 8 | Instant transitions, zero duration | Interactivity §4 | Custom cubic-bezier transitions |
| 9 | No loading states | Interactivity §5 | Skeleton shimmer before first prediction |
| 10 | No empty state design | Interactivity §6 | Composed "gambar untuk mulai" view |
| 11 | Emoji in Clear button (🗑) | `@design-taste-frontend` §2 ANTI-EMOJI | Replace with SVG icon |
| 12 | Emoji in backend status (✅/❌/⏳) | `@design-taste-frontend` §2 ANTI-EMOJI | Styled dot indicators |
| 13 | Generic card borders everywhere | Component §1 | Remove borders, use glass surfaces |
| 14 | Div soup (no semantic HTML) | Code Quality §1 | Proper `<nav>`, `<main>`, `<article>` |
| 15 | No favicon | Iconography §5 | Add favicon |

---

## Design System

### Typography

```
Display:  Space Grotesk (600, 700) — geometric, technical, memorable
Mono:     IBM Plex Mono (400, 500) — data/code contexts
```

- Headlines: `letter-spacing: -0.02em; line-height: 1`
- Body: `line-height: 1.6; max-width: 65ch`
- Numbers: `font-variant-numeric: tabular-nums`

### Color Palette

```css
/* Surfaces */
--void:             #0a0a0f;
--surface:          #12141c;
--surface-elevated: #1a1d28;
--surface-glass:    rgba(18,20,28,0.72);

/* Single accent — Electric Cyan (saturation <80%) */
--accent:           #00d4ff;
--accent-muted:     rgba(0,212,255,0.25);
--accent-glow:      rgba(0,212,255,0.08);

/* Warm secondary for prediction emphasis */
--amber:            #f0a050;
--amber-muted:      rgba(240,160,80,0.2);

/* Text */
--text-primary:     #e2e8f0;
--text-secondary:   rgba(226,232,240,0.55);
--text-tertiary:    rgba(226,232,240,0.3);

/* Status */
--status-ok:        #4ade80;
--status-err:       #f87171;

/* Shadows — tinted, not pure black */
--shadow-card:      0 8px 32px rgba(0,212,255,0.04), 0 2px 8px rgba(0,0,0,0.3);
--shadow-glow:      0 0 24px rgba(0,212,255,0.12);
```

### Motion

- Easing: `cubic-bezier(0.32, 0.72, 0, 1)` — no `linear` or `ease-in-out`
- Entrance: staggered `fadeSlideUp` per panel (800ms+)
- Hover: scale + background shift
- Active: `scale(0.98)` press feedback
- Data: confidence bars animate width with spring-like easing
- Drawing: canvas border pulse glow
- **Rule:** All animations use ONLY `transform` and `opacity`

### Spacing (VISUAL_DENSITY=4)

- Base unit: `8px`
- Panel padding: `24px`
- Section gaps: `16px`
- Grid: `320px 1fr 260px` (asymmetric, DESIGN_VARIANCE=8)

---

## Tasks (Fix Priority Order)

### Task 1: Font swap + HTML restructure

**Files:**
- Modify: `frontend/index.html`

**Step 1: Replace Google Fonts import**

Replace:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

With:
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Step 2: Add favicon and improve meta**

Add after the viewport meta:
```html
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0a0f'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='20' font-weight='700' fill='%2300d4ff'>7</text></svg>">
```

**Step 3: Add grain overlay div before closing `</body>`**

```html
<div id="grain-overlay" aria-hidden="true"></div>
```

**Step 4: Replace all emoji in HTML**

Replace `🗑 Clear` with:
```html
<button id="clear-btn">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
  Hapus
</button>
```

Replace `🖱 Drag untuk rotasi · Scroll untuk zoom` with:
```html
<p id="viz-hint">Drag untuk rotasi · Scroll untuk zoom</p>
```

Replace backend status text (emojis removed, handled via CSS classes):
```html
<div id="backend-status">
  <span class="status-dot"></span>
  <span class="status-text">Menghubungkan ke backend...</span>
</div>
```

Replace canvas hint:
```html
<div id="canvas-hint">Gambar angka 0-9 di sini</div>
```

Replace confidence placeholder:
```html
<p id="conf-placeholder">Gambar angka untuk melihat prediksi</p>
```

**Step 5: Verify in browser**

Open: `http://localhost:8000`
Expected: Page loads, fonts changed, no emoji visible, no console errors.

**Step 6: Commit**

```bash
git add frontend/index.html
git commit -m "feat(ui): swap fonts to Space Grotesk + IBM Plex Mono, remove all emoji, add semantic HTML"
```

---

### Task 2: Complete CSS rewrite (color palette + layout + surfaces + motion)

**Files:**
- Modify: `frontend/style.css` (full rewrite)

**Step 1: Write the new style.css**

The new CSS implements:

1. **CSS Reset + Custom Properties** — Full design token system from the Design System section above
2. **Grain overlay** — Fixed, full-viewport noise texture via SVG data URI, `pointer-events: none`, `opacity: 0.03`
3. **Header** — Glassmorphic bar: `backdrop-filter: blur(16px)`, inner refraction border (`1px solid rgba(255,255,255,0.06)`), inner shadow (`inset 0 1px 0 rgba(255,255,255,0.05)`)
4. **Main grid** — `grid-template-columns: 320px 1fr 260px`, `gap: 0`
5. **Draw panel** — Double-Bezel (Doppelrand) technique:
   - Outer shell: `bg: surface-elevated`, `border: 1px solid accent-muted`, `padding: 6px`, `border-radius: 16px`
   - Inner canvas: own dark bg, calculated smaller radius `calc(16px - 6px)`
6. **3D Viz panel** — Full-bleed dark, vignette: `box-shadow: inset 0 0 120px rgba(0,0,0,0.4)`
7. **Prediction panel** — Glassmorphic digit card with `backdrop-blur`, oversized digit with `font-size: 6rem`
8. **Confidence bars** — Gradient accent fill, staggered `animation-delay: calc(var(--i) * 60ms)`
9. **Buttons** — `scale(0.98)` on `:active`, background shift with `cubic-bezier(0.32, 0.72, 0, 1)`
10. **Status indicator** — Dot + text, `.ok` = green dot pulse, `.error` = red dot
11. **Entrance animation** — `@keyframes fadeSlideUp`: `translate(0, 20px) opacity(0)` → `translate(0, 0) opacity(1)`, staggered per panel
12. **Canvas glow** — `.is-drawing` class triggers `box-shadow` pulse on canvas wrapper
13. **Responsive** — Below `900px`: single-column stack, `padding: 16px`, full-width panels
14. **Scrollbar** — Thin, accent-tinted

**Step 2: Verify in browser**

Open: `http://localhost:8000`
Expected: Dark Ethereal Glass aesthetic, asymmetric layout, grain overlay visible, smooth transitions, no layout breaks.

**Step 3: Commit**

```bash
git add frontend/style.css
git commit -m "feat(ui): complete CSS rewrite — Ethereal Glass aesthetic, Double-Bezel canvas, glassmorphic panels"
```

---

### Task 3: JavaScript enhancements (states + interactions)

**Files:**
- Modify: `frontend/main.js`

**Step 1: Update checkBackend()**

Replace emoji status text with CSS class toggling:
```javascript
async function checkBackend() {
  const statusEl = document.getElementById('backend-status');
  try {
    const res = await fetch(`${BACKEND_URL}/`);
    const data = await res.json();
    statusEl.querySelector('.status-text').textContent = 'Backend terhubung';
    statusEl.className = 'ok';
  } catch {
    statusEl.querySelector('.status-text').textContent = 'Backend tidak terhubung';
    statusEl.className = 'error';
  }
}
```

**Step 2: Update clear button handler**

Replace emoji in programmatic clear:
```javascript
document.getElementById('clear-btn').addEventListener('click', () => {
  resetCanvas(ctx, canvas);
  document.getElementById('predicted-digit').textContent = '?';
  document.getElementById('confidence-bars').innerHTML =
    '<p id="conf-placeholder">Gambar angka untuk melihat prediksi</p>';
});
```

**Step 3: Add canvas drawing glow**

Toggle `.is-drawing` class on the canvas wrapper:
```javascript
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  document.getElementById('canvas-wrapper').classList.add('is-drawing');
  // ... existing code
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
  document.getElementById('canvas-wrapper').classList.remove('is-drawing');
  // ... existing code
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
  document.getElementById('canvas-wrapper').classList.remove('is-drawing');
});
```

**Step 4: Update updatePredictionPanel() — add stagger index**

```javascript
function updatePredictionPanel(data) {
  document.getElementById('predicted-digit').textContent = data.prediction;
  
  // Color the digit based on confidence
  const maxConf = Math.max(...data.confidence);
  const digitEl = document.getElementById('predicted-digit');
  digitEl.style.color = maxConf > 0.8 ? 'var(--amber)' : 'var(--accent)';

  const barsEl = document.getElementById('confidence-bars');
  barsEl.innerHTML = '';

  data.confidence.forEach((conf, i) => {
    const percent = (conf * 100).toFixed(1);
    const isMax = (i === data.prediction);

    const row = document.createElement('div');
    row.className = 'conf-row' + (isMax ? ' conf-max' : '');
    row.style.setProperty('--i', i);

    row.innerHTML = `
      <span class="conf-label">${i}</span>
      <div class="conf-bar-bg">
        <div class="conf-bar" style="width: ${percent}%"></div>
      </div>
      <span class="conf-pct">${percent}%</span>
    `;

    barsEl.appendChild(row);
  });
}
```

**Step 5: Add entrance animation trigger**

At the end of DOMContentLoaded:
```javascript
// Trigger entrance animations
document.querySelectorAll('#draw-panel, #viz-panel, #predict-panel').forEach((el, i) => {
  el.style.setProperty('--entrance-delay', `${i * 120}ms`);
  el.classList.add('panel-enter');
});
```

**Step 6: Update touch events for glow**

Add `.is-drawing` toggling to touch events:
```javascript
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isDrawing = true;
  document.getElementById('canvas-wrapper').classList.add('is-drawing');
  // ... existing code
}, { passive: false });

canvas.addEventListener('touchend', () => {
  isDrawing = false;
  document.getElementById('canvas-wrapper').classList.remove('is-drawing');
});
```

**Step 7: Verify in browser**

Open: `http://localhost:8000`
Expected: Draw a digit → glow effect on canvas → prediction appears with animated bars → digit color changes with confidence.

**Step 8: Commit**

```bash
git add frontend/main.js
git commit -m "feat(ui): add canvas glow, staggered bars, entrance animations, remove emoji from JS"
```

---

### Task 4: Visual verification + responsive test

**Step 1: Full browser test at desktop width**
- Open `http://localhost:8000`
- Verify 3-panel layout renders
- Draw a digit, verify prediction
- Verify 3D visualizer works
- Verify entrance animations play

**Step 2: Responsive test at 800px width**
- Resize browser to 800px
- Verify single-column stack
- Verify canvas and panels are full-width

**Step 3: Screenshot comparison**
- Take before/after screenshots for the walkthrough

---

## Quality Gate Checklist

Before final commit, verify:

- [ ] No banned fonts (Inter, Roboto, Arial)
- [ ] No pure `#000000` anywhere
- [ ] No emojis in code or markup
- [ ] No generic `box-shadow` (all tinted)
- [ ] No `ease-in-out` or `linear` transitions
- [ ] Active/hover/empty states present
- [ ] Asymmetric layout (DESIGN_VARIANCE=8)
- [ ] All animations use only `transform` and `opacity`
- [ ] `backdrop-blur` only on elevated panels, not scrolling content
- [ ] Mobile collapse below 900px to single-column
- [ ] Grain overlay is `pointer-events: none` and `position: fixed`
- [ ] Double-Bezel technique on canvas container
- [ ] Custom `cubic-bezier` on all transitions
- [ ] `font-variant-numeric: tabular-nums` on data
- [ ] Indonesian labels preserved
