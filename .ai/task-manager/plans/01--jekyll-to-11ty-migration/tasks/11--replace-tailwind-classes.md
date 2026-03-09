---
id: 11
group: "vanilla-css"
dependencies: [10]
status: "pending"
created: "2026-03-06"
skills: ["html", "css"]
---
# Replace Tailwind Classes in All Templates

## Objective
Replace every Tailwind utility class across all HTML templates, layouts, and includes with the semantic CSS class names defined in `src/style.css` (Task 10). Update the CSS `<link>` tag in `head.html` to reference `style.css` instead of `stylev3.css`.

## Skills Required
- `html`: Template editing, class attribute updates across many files
- `css`: Verifying semantic class names match CSS rules in `src/style.css`

## Acceptance Criteria
- [ ] All Tailwind utility classes removed from every HTML file: layouts, includes, content pages
- [ ] Each removed class replaced with an equivalent semantic class name that matches a rule in `src/style.css`
- [ ] `_includes/head.html` updated: CSS link changed from `stylev3.css` to `style.css`; preload link updated
- [ ] No `bg-teal-*`, `text-gray-*`, `flex`, `grid`, `px-*`, `py-*`, `sm:`, `md:`, `lg:`, or other Tailwind utility patterns remain in any template (verify with grep)
- [ ] `{% image %}` shortcode's hardcoded Tailwind class string updated to use semantic class
- [ ] `30-contact.html`'s JavaScript form class manipulation (`field.classList.add("ring-red-500")` etc.) updated to use semantic class names
- [ ] Playwright snapshot tests pass against the Task 10 baselines with ≤2% pixel difference across all 10 snapshots

## Technical Requirements
- Work file-by-file through all `_includes/`, `_includes/layouts/`, and content pages
- The form validation JavaScript in `30-contact.html` adds/removes CSS classes dynamically — these Tailwind class names (`ring-red-500`, `ring-gray-300`) must be replaced with semantic equivalents that match CSS rules in `src/style.css`
- After completing all template changes, run `grep -rn "bg-\|text-\|flex\|grid-\|px-\|py-\|sm:\|md:\|lg:\|xl:\|border-\|rounded\|shadow\|ring-\|hover:" --include="*.html" --include="*.md" _includes/ _includes/layouts/ *.html` to verify no Tailwind classes remain
- Inline `style=""` attributes (e.g., on the honeypot field) are NOT Tailwind and should be left as-is
- **Fidelity check**: Run `npx playwright test tests/e2e/snapshots.spec.js` after switching the CSS link — snapshot diffs against the Task 10 baselines are the definitive pass/fail signal; fix any failing pages before proceeding

## Input Dependencies
- Task 10: `src/style.css` complete with all semantic CSS rules defined

## Output Artifacts
- Updated `_includes/head.html` — CSS link to `style.css`
- Updated `_includes/layouts/default.html`, `_includes/layouts/markdown-content.html`
- Updated all 14 include files in `_includes/`
- Updated all 6 content pages
- Updated `.eleventy.js` `{% image %}` shortcode class attribute
- Updated `30-contact.html` JavaScript class name references

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**Recommended approach: file-by-file, bottom-up**

Start with the most granular files (leaf includes) and work up to layouts:

1. `_includes/footer.html`
2. `_includes/donate-button.html`, `_includes/donate.html`
3. `_includes/testimonials.html`
4. `_includes/city-market.html`
5. `_includes/banner.html`, `_includes/home-banner.html`
6. `_includes/hat.html`
7. `_includes/nav-lg.html`, `_includes/nav-mobile.html`
8. `_includes/header.html`
9. `_includes/head.html` (update CSS link here)
10. `_includes/layouts/default.html`, `_includes/layouts/markdown-content.html`
11. Content pages: `00-index.html`, `05-about.md`, `15-programs.md`, `22-how-can-i-help.md`, `30-contact.html`, `404.html`

**`_includes/head.html` CSS link update:**
```html
<!-- Before -->
<link rel="preload" href="/assets/css/stylev3.css" as="style" />
<link rel="stylesheet" href="{{ site.baseurl }}/assets/css/stylev3.css" />

<!-- After -->
<link rel="preload" href="/assets/css/style.css" as="style" />
<link rel="stylesheet" href="/assets/css/style.css" />
```

**`30-contact.html` JS class updates:**
The JavaScript dynamically adds/removes CSS classes for validation state:
- `field.classList.remove("ring-gray-300")` → `field.classList.remove("input-default")`
- `field.classList.add("ring-red-500")` → `field.classList.add("input-error")`
- `field.classList.remove("ring-red-500")` → `field.classList.remove("input-error")`
- `field.classList.add("ring-gray-300")` → `field.classList.add("input-default")`

Ensure `src/style.css` has matching `.input-default` and `.input-error` rules for form field styling.

**`.eleventy.js` image shortcode class update:**
Change the `class` attribute in the shortcode from the Tailwind utility string to a semantic class like `"responsive-image"`. Add the appropriate CSS rule to `src/style.css`.

**Verification grep command** (run after completing all files):
```bash
grep -rn "class=\".*\(bg-\|text-\|flex \|px-\|py-\|sm:\|md:\|lg:\|border-\|rounded\|shadow\)" \
  _includes/ *.html *.md --include="*.html" --include="*.md"
```

**Fidelity verification**: After switching the CSS `<link>` tag to `style.css`, run `npx playwright test tests/e2e/snapshots.spec.js`. The baseline PNGs from Task 10 are the ground truth — any diff above 2% means the vanilla CSS doesn't match the Tailwind output. Fix CSS rules (don't update baselines) until all 10 snapshots pass.
</details>
