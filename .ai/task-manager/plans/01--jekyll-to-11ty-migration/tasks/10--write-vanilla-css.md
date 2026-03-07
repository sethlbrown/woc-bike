---
id: 10
group: "vanilla-css"
dependencies: [9]
status: "pending"
created: "2026-03-06"
skills: ["css"]
---
# Write Vanilla CSS with Custom Properties

## Objective
Create `src/style.css` — a hand-written vanilla CSS file that replicates the visual design of the Tailwind CSS site using CSS custom properties. This is the foundation for Phase 2: the CSS must be complete before Tailwind classes are removed from templates (Task 11).

## Skills Required
- `css`: CSS custom properties, flexbox, CSS Grid, `@media` queries, responsive design patterns

## Acceptance Criteria
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
- Begin by grepping all `class="..."` attributes across all HTML files to produce a complete Tailwind class inventory before writing CSS: `grep -h 'class="' **/*.html _includes/**/*.html _layouts/**/*.html 2>/dev/null | sort -u`
- Use semantic class names, not Tailwind utility names
- Custom property names follow the existing `--color-*`, `--spacing-*` pattern from `src/stylev3.css`
- This task produces CSS only — no template changes yet (Task 11 does that)
- The CSS file is passthrough-copied by Eleventy once Tailwind is removed (Task 12 updates `.eleventy.js`)

## Input Dependencies
- Task 9: Phase 1 complete — the site is working and visual design is confirmed; the complete set of UI components is known

## Output Artifacts
- `src/style.css` — complete vanilla CSS file
- (No template changes in this task)

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**Step 1: Inventory Tailwind classes**
```bash
# Get all class attributes across all HTML/Liquid templates
grep -rh 'class="' . --include="*.html" --include="*.md" \
  --exclude-dir=node_modules --exclude-dir=_site \
  | grep -oP 'class="[^"]*"' | sort -u > /tmp/class-inventory.txt
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
Note: These use escaped Tailwind class selectors. In Phase 2 (Task 11), these will be replaced with semantic class selectors. For now, they're included as-is for accuracy.

**The CSS does not need to be applied yet** — Task 11 will replace Tailwind classes in templates and update the `<link>` tag to reference `style.css`. This task only creates the CSS file.
</details>
