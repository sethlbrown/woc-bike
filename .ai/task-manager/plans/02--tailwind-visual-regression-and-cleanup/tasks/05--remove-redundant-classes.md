---
id: 5
group: "class-cleanup"
dependencies: [4]
status: "completed"
created: "2026-03-09"
skills:
  - html
---
# Remove Redundant and Overridden Tailwind Classes

## Objective
Manually audit all HTML templates for class attributes containing conflicting or visually overridden Tailwind utilities, remove the ineffective ones, then verify all 15 snapshots still pass to confirm no visible change was introduced.

## Skills Required
- `html`: Template editing, Tailwind utility class semantics, understanding of last-class-wins behavior

## Acceptance Criteria
- [ ] All JS-managed class names are identified and placed on a do-not-remove list before the audit begins
- [ ] All template files audited for conflicting class pairs (same CSS property set twice on same element)
- [ ] All identified redundant classes removed
- [ ] All 15 snapshot tests pass after removal (`npx playwright test tests/e2e/snapshots.spec.js`)
- [ ] Contact form validation behavior is visually verified (error states, field highlighting) after changes
- [ ] Removal changes committed in their own isolated commit (separate from the sort commit in Task 4)

## Technical Requirements
- **Before starting**: grep for all `classList.add` / `classList.remove` / `classList.toggle` calls across all files to build the do-not-remove list
- In Tailwind v4, within the same utility group (e.g. text size), the last class in the attribute string wins — but since classes are now sorted (Task 4), conflicts appear as adjacent pairs in the sorted order, making them easier to spot
- Focus areas for conflicts:
  - Same property set at base and responsive variant where the responsive variant fires at all real-world widths (effectively making the base dead)
  - Duplicate display utilities (`hidden` + `block`, `flex` + `block`)
  - Conflicting text size, color, or spacing utilities on the same element
  - `overflow-hidden` paired with utilities that make it a no-op
- Do NOT remove classes that appear unused if they are referenced in JS `classList` calls

## Input Dependencies
- Task 4: All class attributes sorted — conflicts now appear as adjacent pairs, easier to spot

## Output Artifacts
- Updated HTML template files — redundant classes removed
- Git commit isolating the redundancy-removal change

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**Step 1: Build the do-not-remove list**
```bash
# Find all class names managed via JS across all files
grep -rn "classList\.\(add\|remove\|toggle\)" \
  --include="*.html" --include="*.js" \
  _includes/ _includes/layouts/ *.html assets/js/ \
  | grep -oP "['\"]\K[^'\"]+(?=['\"])" | sort -u
```
Record every class name found. These must not be removed even if they appear redundant in static markup.

**Step 2: Audit templates file by file**

Work through each file looking for class strings with conflicts. After the sort pass (Task 4), conflicting utilities in the same group will appear adjacent, e.g.:
```html
<!-- Before (unsorted): class="text-lg font-bold text-sm" -->
<!-- After sort: class="text-sm text-lg font-bold" -->
<!-- Conflict visible: text-sm and text-lg — remove text-sm (dead, text-lg wins) -->
```

Files to audit (in order):
1. `_includes/head.html`
2. `_includes/nav-lg.html`, `_includes/nav-mobile.html`
3. `_includes/header.html`, `_includes/banner.html`, `_includes/home-banner.html`
4. `_includes/hat.html`
5. `_includes/footer.html`
6. `_includes/donate.html`, `_includes/donate-button.html`
7. `_includes/testimonials.html`, `_includes/city-market.html`
8. `_includes/layouts/default.html`, `_includes/layouts/markdown-content.html`
9. `00-index.html`, `05-about.md`, `15-programs.md`, `22-how-can-i-help.md`, `30-contact.html`, `404.html`

**Step 3: Verify snapshots**
```bash
npx playwright test tests/e2e/snapshots.spec.js
# All 15 must pass — if any fail, the removed class was not redundant; restore it
```

**Step 4: Verify contact form validation visually**
Open the contact form in a browser, trigger validation errors (submit empty, enter invalid email), and confirm error states display correctly. This verifies that JS-managed classes were not accidentally removed.

**Step 5: Commit in isolation**
```bash
git add -A
git commit -m "style: remove redundant and overridden Tailwind classes"
```

**If a snapshot fails**: The diff report in `playwright-report/` will show exactly which pixel region changed. This points to the element that owns the removed class — restore that class and re-run. A failed snapshot means the class was not actually redundant.
</details>
