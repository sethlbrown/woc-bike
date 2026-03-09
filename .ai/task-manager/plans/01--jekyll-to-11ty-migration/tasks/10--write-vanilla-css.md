---
id: 10
group: "vanilla-css"
dependencies: [9]
status: "pending"
created: "2026-03-06"
skills: ["css", "playwright"]
---
# Write Vanilla CSS with Custom Properties

## Objective
Before touching any CSS or templates, capture Playwright visual baseline screenshots of the current Tailwind site. These screenshots are the high-fidelity reference that vanilla CSS output (Tasks 11–12) must match. Once baselines are committed, create `src/style.css` — a hand-written vanilla CSS file that replicates the visual design using CSS custom properties.

## Skills Required
- `playwright`: Visual baseline capture using `toHaveScreenshot()` / `--update-snapshots`
- `css`: CSS custom properties, flexbox, CSS Grid, `@media` queries, responsive design patterns

## Acceptance Criteria

### Phase A: Baseline Screenshots
- [ ] `tests/e2e/snapshots.spec.js` created with full-page screenshots of all 5 pages at 375px and 1280px widths
- [ ] Dev server confirmed running with current Tailwind CSS (`npm run dev`) before snapshot capture
- [ ] Snapshots generated with `--update-snapshots` against the live Tailwind site
- [ ] 10 baseline PNG files committed to `tests/e2e/__snapshots__/` (5 pages × 2 viewports)
- [ ] `npm test` passes clean with all snapshots matching

### Phase B: Vanilla CSS
- [ ] `src/style.css` created with all CSS custom properties (`:root`) from `src/stylev3.css`'s `@theme` block
- [ ] Color palette custom properties defined: `--color-teal-100` through `--color-teal-700`, `--color-yellow-800`, `--color-green-800`, `--color-gray-100` through `--color-gray-900`
- [ ] Spacing scale defined as custom properties: `--spacing-1` (4.5px) through `--spacing-64` (288px)
- [ ] Font stack: `--font-sans` and `--font-body`
- [ ] Background image variable: `--background-image-aspens`
- [ ] CSS reset/base styles: box-sizing, font defaults, list reset for navigation
- [ ] Component styles written for: navigation (`.nav`, `.nav-link`, `.nav-active`), page header/banner (`.banner`, `.home-banner`), buttons (`.btn`, `.btn-primary`, `.btn-secondary`), footer (`.footer`), form fields (`.form-field`, `.form-label`, `.form-input`, `.form-error`), progress bar (`.progress-bar`, `.progress-track`, `.progress-fill`, `.progress-marker`), donate section, testimonial cards, stories/news section, contact page layout
- [ ] Responsive breakpoints at 640px, 768px, 1024px, 1280px using `@media (min-width: ...)`
- [ ] Social icon hover colors (3 rules, transferred from `src/stylev3.css`)
- [ ] Prose/typography styles for markdown content pages
- [ ] The three social icon hover CSS rules from current `src/stylev3.css` transferred verbatim

## Technical Requirements
- **Baselines must be captured before any CSS or template changes** — the Tailwind site is the source of truth
- Snapshots use `fullPage: true` and `maxDiffPixelRatio: 0.02` to allow minor rendering variance
- Mask any dynamic/external regions (PayPal widget, reCAPTCHA badge) to prevent flaky snapshots
- Begin CSS authoring by grepping all `class="..."` attributes to produce a complete Tailwind class inventory: `grep -rh 'class="' --include="*.html" _includes/ _includes/layouts/ *.html | sort -u`
- Use semantic class names, not Tailwind utility names
- Custom property names follow the existing `--color-*`, `--spacing-*` pattern from `src/stylev3.css`
- This task produces CSS only — no template changes yet (Task 11 does that)

## Input Dependencies
- Task 9: Phase 1 complete — the site is working and visual design is confirmed; the complete set of UI components is known

## Output Artifacts
- `tests/e2e/snapshots.spec.js` — visual snapshot test file
- `tests/e2e/__snapshots__/` — 10 committed baseline PNG files (Tailwind reference)
- `src/style.css` — complete vanilla CSS file
- (No template changes in this task)

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

### Phase A: Capture Tailwind Baseline Screenshots

**Step 1: Create snapshot test file**

Create `tests/e2e/snapshots.spec.js`:
```javascript
const { test, expect } = require('@playwright/test');

const pages = [
  { url: '/', name: 'home' },
  { url: '/about/', name: 'about' },
  { url: '/programs/', name: 'programs' },
  { url: '/how-can-i-help/', name: 'how-can-i-help' },
  { url: '/contact/', name: 'contact' },
];

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1280, height: 900 },
];

for (const p of pages) {
  for (const vp of viewports) {
    test(`${p.name} at ${vp.name} matches snapshot`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(p.url);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`${p.name}-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        mask: [
          // Mask external widgets that render inconsistently
          page.locator('.paypal-campaign-card, iframe[src*="paypal"]'),
          page.locator('.g-recaptcha, [data-sitekey]'),
        ],
      });
    });
  }
}
```

**Step 2: Generate baselines against the current Tailwind site**
```bash
# Confirm Tailwind dev server is running
npm run dev   # must be up at localhost:8080

# Generate initial baselines (--update-snapshots writes the PNGs)
npx playwright test tests/e2e/snapshots.spec.js --update-snapshots

# Verify 10 files were created
ls tests/e2e/__snapshots__/
# home-mobile.png, home-desktop.png, about-mobile.png, ... (10 total)
```

**Step 3: Verify and commit baselines**
```bash
# Run once more without --update-snapshots to confirm they pass clean
npx playwright test tests/e2e/snapshots.spec.js

# Commit baselines — these are the Tailwind reference
git add tests/e2e/snapshots.spec.js tests/e2e/__snapshots__/
git commit -m "test: add Playwright visual baselines from Tailwind site"
```

---

### Phase B: Write Vanilla CSS

**Step 1: Inventory Tailwind classes**
```bash
grep -rh 'class="' --include="*.html" _includes/ _includes/layouts/ *.html \
  | grep -oP 'class="[^"]*"' | sort -u > /tmp/class-inventory.txt
cat /tmp/class-inventory.txt
```

Use this list to identify every Tailwind utility in use and map it to a semantic CSS rule.

**Step 2: Define CSS custom properties** (direct 1:1 translation of `@theme` block):
```css
:root {
  /* Fonts */
  --font-sans: "Avenir Next", Helvetica, Arial, sans-serif;

  /* Spacing */
  --spacing-1: 4.5px;
  --spacing-2: 9px;
  --spacing-3: 13.5px;
  --spacing-4: 18px;
  --spacing-5: 22.5px;
  --spacing-6: 27px;
  --spacing-8: 36px;
  --spacing-10: 45px;
  --spacing-12: 54px;
  --spacing-16: 72px;
  --spacing-20: 90px;
  --spacing-24: 108px;
  --spacing-32: 144px;
  --spacing-40: 180px;
  --spacing-48: 216px;
  --spacing-56: 252px;
  --spacing-64: 288px;

  /* Colors */
  --color-teal-100: #d4ecee;
  --color-teal-200: #a8dadd;
  --color-teal-300: #7dc7cc;
  --color-teal-400: #46b0b7;
  --color-teal-500: #25a2aa;
  --color-teal-600: #25a2aa;
  --color-teal-700: #1b7c83;
  --color-yellow-800: #867e79;
  --color-green-800: #829260;
  --color-gray-100: #f6f8f9;
  --color-gray-200: #f6f8f9;
  --color-gray-300: #d1d3d4;
  --color-gray-500: #a3a7a9;
  --color-gray-700: #767b7e;
  --color-gray-800: #3c4448;
  --color-gray-900: #1a2328;

  /* Background images */
  --background-image-aspens: url("/assets/img/aspens.webp");
}
```

**Step 3: Write component CSS**

Key components to style based on the Tailwind class inventory:
- **Navigation**: flexbox layout, border-top highlight on active/hover, teal-400 accent color
- **Mobile nav**: hamburger button, slide-down panel with links
- **Page layout**: max-width containers (`max-w-7xl` = 80rem), horizontal padding
- **Buttons**: teal-700 background, white text, hover to gray-900
- **Contact form**: two-column grid layout, dark left panel (gray-900 to gray-800 gradient), white form panel
- **Progress bar**: teal-900 track, white fill, crosshair marker, percentage-based width
- **Footer**: dark background, grid layout for columns
- **Testimonials**: card grid
- **Home banner**: full-height hero with background image, overlay gradient
- **Typography/prose**: headings, body text, link styling, list styles

**Step 4: Transfer social icon hover rules** (exact CSS from `src/stylev3.css`):
```css
a.hover\:text-blue-500:hover svg { color: #3b82f6; }
a.hover\:text-red-500:hover svg { color: #ef4444; }
a.hover\:text-pink-600:hover svg { color: #db2777; }
```
Note: These use escaped Tailwind class selectors. In Phase 2 (Task 11), these will be replaced with semantic class selectors.

**The CSS does not need to be applied yet** — Task 11 will replace Tailwind classes in templates and update the `<link>` tag to reference `style.css`. This task only creates the CSS file.
</details>
