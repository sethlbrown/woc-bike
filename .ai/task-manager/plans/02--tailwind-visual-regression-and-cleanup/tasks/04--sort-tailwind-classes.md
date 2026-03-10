---
id: 4
group: "class-cleanup"
dependencies: [1, 3]
status: "completed"
created: "2026-03-09"
skills:
  - html
---
# Sort Tailwind Classes via Prettier

## Objective
Run `npm run format` across all HTML templates to sort every Tailwind class attribute into the official Prettier + prettier-plugin-tailwindcss sort order. Commit this as an isolated change, then verify all 15 snapshots still pass to confirm sorting produced no visual change.

## Skills Required
- `html`: Template file review, understanding of Tailwind class attribute structure

## Acceptance Criteria
- [ ] `npm run format` runs without errors across all scoped template files
- [ ] All class attributes in `_includes/`, `_includes/layouts/`, and root-level content pages are sorted per the official Tailwind order
- [ ] No classes were added or removed — only reordered (verify with `git diff --stat` showing only HTML files changed)
- [ ] All 15 snapshot tests pass after sorting (`npx playwright test tests/e2e/snapshots.spec.js`)
- [ ] The sorting change is committed in its own isolated commit before any removal work begins

## Technical Requirements
- Run `npm run format` (configured in Task 1) — do not manually reorder classes
- After formatting, run `git diff` to review: only whitespace/order changes in class attributes should appear; no functional changes
- The snapshot suite must pass with `maxDiffPixelRatio: 0.02` — class reordering should produce zero visual change since Tailwind v4 output is determined by the CSS, not class order in HTML
- If any snapshot fails after sorting, it indicates a pre-existing rendering variance, not a sorting problem — investigate before proceeding

## Input Dependencies
- Task 1: Prettier + `.prettierrc` + `format` script configured
- Task 3: Baseline snapshots captured and committed

## Output Artifacts
- Updated HTML template files — all Tailwind class attributes sorted
- Git commit isolating the sort-only change

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**Step 1: Run the format pass**
```bash
npm run format
```

**Step 2: Review the diff**
```bash
git diff --stat
# Should show only .html and .md files
# No .js, .json, .css, or config files should appear

git diff
# Review class attribute changes — only order should change within class="..." strings
```

**Step 3: Verify snapshots**
```bash
npx playwright test tests/e2e/snapshots.spec.js
# All 15 should pass — class order in HTML does not affect Tailwind CSS output
```

**Step 4: Commit in isolation**
```bash
git add -A
git commit -m "style: sort Tailwind classes via prettier-plugin-tailwindcss"
```

**If a snapshot fails**: Class reordering should never change visual output in Tailwind v4 (the compiled CSS is the same regardless of class order in HTML). If a snapshot fails, it likely means there was marginal pre-existing rendering variance that the threshold didn't catch previously — document this and adjust `maxDiffPixelRatio` if needed, or investigate the specific diff report in `playwright-report/`.

**Note on inline JS class strings**: Prettier does not modify JavaScript string literals, so `classList.add('...')` calls in `30-contact.html` are untouched by this pass.
</details>
