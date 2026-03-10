---
id: 6
group: "documentation"
dependencies: [1, 2, 3]
status: "pending"
created: "2026-03-09"
skills:
  - html
---
# Update CLAUDE.md with Prettier and Snapshot Workflow Documentation

## Objective
Update `CLAUDE.md` to document the Prettier class-sorting setup and the snapshot baseline update workflow so future contributors (and AI assistants) understand how to use both tools.

## Skills Required
- `html`: Markdown editing (CLAUDE.md is a Markdown file)

## Acceptance Criteria
- [ ] `CLAUDE.md` documents the `.prettierrc` config and `npm run format` script
- [ ] `CLAUDE.md` Feature Branch Workflow section includes the snapshot override procedure (how to intentionally update baselines)
- [ ] `CLAUDE.md` Build Commands section lists `npm run format`
- [ ] Documentation accurately reflects the configured tools (consistent with Tasks 1–3 outputs)

## Technical Requirements
- CLAUDE.md lives at the project root
- Add `npm run format` to the Build Commands section with a clear description
- In Feature Branch Workflow, add a note after step 6 (run tests) explaining how to update snapshots for intentional visual changes
- Add a new "Prettier / Class Sorting" subsection documenting the `.prettierrc` config and `.prettierignore` scope
- Add a "Visual Regression Tests" subsection documenting the 15-snapshot suite, the `tests/e2e/__snapshots__/` location, and the cross-platform re-baseline procedure

## Input Dependencies
- Task 1: Prettier config finalized (accurate `.prettierrc` details to document)
- Task 2: `snapshotPathTemplate` configured (accurate Playwright config details to document)
- Task 3: Snapshot workflow established (accurate override procedure to document)

## Output Artifacts
- Updated `CLAUDE.md`

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**Build Commands section** — add:
```
- `npm run format` - Sort Tailwind classes in all HTML templates via Prettier
```

**New section: "Prettier / Class Sorting"** — add after Style Guidelines:
```markdown
## Prettier / Class Sorting

`prettier-plugin-tailwindcss` is configured in `.prettierrc` to sort Tailwind class
attributes into the official Tailwind sort order across all HTML templates.

- Config: `.prettierrc` (plugin declared, `tailwindStylesheet` points to `src/stylev3.css`)
- Scope: `.prettierignore` limits formatting to HTML template files only
- Run: `npm run format` — sorts classes in `_includes/**/*.html` and root-level pages
- Not wired into the build — run manually before committing template changes
```

**New section: "Visual Regression Tests"** — add after or within the Playwright Tests section:
```markdown
### Visual Regression Snapshots

15 snapshot tests cover all 5 pages at mobile (375px), tablet (768px), and desktop (1280px).
Baseline PNGs live in `tests/e2e/__snapshots__/` and are committed to the repo.
Snapshots run automatically in CI on every push to `main`.

**To update baselines after an intentional visual change:**
1. Make the visual change
2. `npx playwright test tests/e2e/snapshots.spec.js --update-snapshots`
3. Review the updated PNGs to confirm they match intent
4. Commit the updated PNGs alongside the code change

**If CI fails on font rendering (macOS vs Linux variance):**
Re-run `--update-snapshots` on a Linux machine (or via `workflow_dispatch`) and commit the
Linux-rendered PNGs as a one-time fix.
```

**Feature Branch Workflow** — add after the "Run `npm test`" step:
```markdown
- If your change is intentionally visual, update snapshot baselines:
  `npx playwright test tests/e2e/snapshots.spec.js --update-snapshots`
  then commit the updated PNGs alongside your code change.
```
</details>
