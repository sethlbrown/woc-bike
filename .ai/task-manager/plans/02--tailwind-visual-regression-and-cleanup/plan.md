---
id: 2
summary: "Add Playwright visual regression tests at three breakpoints, then refactor Tailwind classes (remove redundant, sort via Prettier) with snapshot verification to confirm zero visual deviation"
created: 2026-03-09
---

# Plan: Tailwind Visual Regression Testing & Class Cleanup

## Original Work Order

> I've decided to stick with Tailwind. What I'd like to do is create Playwright tests at three breakpoints (mobile, tablet, and desktop) that will compare a build against screenshots and test whether there's a pixel variance of greater than 2%. With this testing in place, I'd like to then go through and work on refactoring and cleaning up the existing Tailwind classes in use. I'd like to delete or eliminate unused classes, if there are any. For instance those that might not be showing up or that are getting overridden. I'd like to make sure all my classes are alphabetized. We'd do this but then test the new build using Playwright to make sure we haven't deviated from the current design.

## Plan Clarifications

| Question | Answer |
|---|---|
| Viewport widths | Mobile 375px, Tablet 768px, Desktop 1280px |
| Class sorting tool | Prettier with prettier-plugin-tailwindcss (already installed) |
| "Unused" class definition | Visually redundant or overridden classes in HTML markup (not CSS purge — Tailwind v4 handles that automatically) |
| Pages in scope | All 5 pages × 3 viewports = 15 snapshots |
| CI integration | Yes — ongoing check in GitHub Actions; override by updating baselines locally and committing |
| Cross-platform snapshot strategy | Option A: platform-neutral filenames via `snapshotPathTemplate` in `playwright.config.js`; baselines generated on macOS; one-time Linux re-baseline via `workflow_dispatch` if CI font rendering exceeds 2% |

## Executive Summary

The Carbondale Bike Project site is stable on Eleventy + Tailwind CSS v4 with Netlify hosting and a working GitHub Actions CI pipeline. This plan adds visual regression protection and cleans up the Tailwind markup — two independent but sequenced concerns that depend on each other in a specific order.

The visual regression suite must be established first, before any markup changes, so that the current rendered output becomes a verified baseline. Only then is it safe to refactor Tailwind classes: sorting them via Prettier and removing visually redundant ones. The snapshot tests then serve as the automated proof that refactoring produced no visible change.

The result is a tighter codebase with alphabetized, non-redundant Tailwind classes and a permanent visual regression guard that runs on every push to `main` — with a clear, low-friction path to intentionally update baselines when visual changes are wanted.

## Context

### Current State vs Target State

| Aspect | Current State | Target State | Why |
|---|---|---|---|
| Visual regression testing | No snapshot tests; only functional Playwright tests | 15 snapshot tests (5 pages × 3 breakpoints) running in CI | Catch accidental visual regressions on every push |
| Tailwind class order | Unordered, hand-written class strings | Alphabetically sorted via Prettier + prettier-plugin-tailwindcss | Consistency, readability, easier diffs |
| Redundant markup classes | Unknown number of conflicting/overridden class combinations | All conflicts resolved; each class on an element has visible effect | Reduce confusion, eliminate dead weight in markup |
| CI pipeline | Runs functional Playwright tests only | Also runs visual snapshot comparison; fails on >2% pixel deviation | Automated design integrity check |
| Snapshot update workflow | N/A | Update locally with `--update-snapshots`, commit PNGs; CI passes | Intentional visual changes are easy and explicit |
| Prettier config | `prettier-plugin-tailwindcss` installed, no `.prettierrc` | `.prettierrc` configured with plugin; `npm run format` script added | Enable automated class sorting across all templates |
| Snapshot filenames | N/A | Platform-neutral (OS stripped from filename via `snapshotPathTemplate`) | Baselines generated on macOS are usable in Linux CI |

### Background

The site has 5 pages and three meaningful layout breakpoints that correspond to Tailwind's `sm` (640px), `md` (768px), and `lg` (1024px+) prefixes. The chosen snapshot viewports — 375px, 768px, 1280px — represent a realistic phone, a tablet, and a typical desktop, covering all three layout tiers.

`prettier-plugin-tailwindcss` is already in `devDependencies` but there is no `.prettierrc` and no format script. It requires a Prettier config to activate the Tailwind class sorting behavior. A `.prettierignore` file scopes formatting to HTML template files only, leaving JS, JSON, and config files untouched — this keeps the diff focused on Tailwind class attributes and nothing else.

Tailwind v4 automatically purges classes not found in scanned templates, so there are no "unused" classes in the compiled CSS output. The cleanup target is the HTML markup itself: class attributes where two utilities set the same CSS property on the same element (e.g. `text-sm text-base` — last one wins, first is dead), or classes whose effect is entirely masked by specificity or a later sibling class.

The existing `ci.yml` GitHub Actions workflow already installs Playwright and runs `npm test`. Snapshot tests will slot directly into this pipeline with no workflow changes required. The override workflow is simple: run `npx playwright test tests/e2e/snapshots.spec.js --update-snapshots` locally, review the diff visually, commit the updated PNGs.

External widgets (PayPal campaign card, Google reCAPTCHA badge) render non-deterministically across runs. These regions must be masked in snapshot tests to prevent flaky failures unrelated to CSS changes.

By default Playwright appends the OS platform to snapshot filenames (`-darwin`, `-linux`). This means macOS-generated baselines are invisible to the Linux CI runner — it looks for `-linux` variants and finds none, then fails trying to create them in a read-only context. Configuring `snapshotPathTemplate` to strip the platform name produces OS-neutral filenames that work across both environments. *(See clarification: cross-platform snapshot strategy.)*

## Architectural Approach

```mermaid
flowchart TD
    A[Current site on main] --> B[Configure Prettier + .prettierrc\n+ .prettierignore]
    B --> C[Configure playwright.config.js\nsnapshotPathTemplate]
    C --> D[Capture 15 baseline snapshots\nfrom current Tailwind site]
    D --> E[Commit baselines to repo]
    E --> F[Refactor pass 1: sort classes\nvia Prettier — commit]
    F --> G[Refactor pass 2: remove redundant\nclasses manually — commit]
    G --> H[Run all 15 snapshot tests\nagainst refactored build]
    H --> I{All 15 pass\n≤2% deviation?}
    I -- Yes --> J[Done: refactored markup\n+ permanent visual CI guard]
    I -- No --> K[Fix markup until\nsnapshots pass]
    K --> H
```

### Prettier Configuration

**Objective**: Enable automated Tailwind class sorting across all HTML templates using the already-installed `prettier-plugin-tailwindcss`, scoped tightly to template files.

A `.prettierrc` file is added to the project root declaring `prettier-plugin-tailwindcss` as a plugin, with `"tailwindStylesheet": "./src/stylev3.css"` so the plugin resolves the Tailwind v4 CSS-based config rather than looking for a `tailwind.config.js`. A `.prettierignore` file excludes everything except `_includes/**/*.html`, `_includes/layouts/**/*.html`, and the root-level content pages — this keeps the format pass focused solely on Tailwind class attributes and prevents unintended changes to JS, JSON, or config files.

A `format` npm script is added that runs Prettier over the scoped file set. The format script runs once as part of the refactor; it is not wired into the build or dev server. Class sorting is a developer-side operation, not a build step.

### Playwright Configuration Update

**Objective**: Configure platform-neutral snapshot filenames so macOS-generated baselines are valid in the Linux GitHub Actions runner.

`playwright.config.js` gains a `snapshotPathTemplate` setting that places all snapshots under `tests/e2e/__snapshots__/` with a filename of `{arg}{ext}` — stripping the default `{platform}` and `{projectName}` segments. This means a baseline generated on macOS as `home-mobile.png` is the same file the Linux CI runner looks for, so no re-generation is needed in the common case.

If cross-platform font rendering pushes a snapshot above the 2% threshold, the fix is a one-time local re-generation: check out the repo on a Linux machine (or trigger a `workflow_dispatch` run that runs `--update-snapshots` and commits the results), then commit the Linux-rendered PNGs. This is a one-time setup cost, not a recurring workflow burden.

### Visual Baseline Capture

**Objective**: Photograph the current site at all 15 viewport/page combinations before any markup changes, establishing an authoritative pixel-level reference.

A new `tests/e2e/snapshots.spec.js` file defines tests for all 5 pages at all 3 viewports. Each test navigates to the page, waits for network idle, masks the PayPal and reCAPTCHA regions, then asserts `toHaveScreenshot()` with `fullPage: true` and `maxDiffPixelRatio: 0.02`. The 15 generated PNG files are committed to `tests/e2e/__snapshots__/`.

Baselines are always captured against the live dev server (`npm run dev`) to ensure PostCSS-compiled CSS is in effect. The `playwright.config.js` already configures `webServer` to start the dev server before tests, so no additional config is needed to run snapshot tests locally.

The 15 PNG files are committed to `main` before any refactor work begins. They become the immutable reference for the refactor phase.

### Tailwind Class Refactor

**Objective**: Produce clean, sorted, non-redundant Tailwind class strings across all templates without changing visual output.

**Sorting pass (automated)**: Run `npm run format`. Prettier reorders class strings according to the official Tailwind sort order — it never adds or removes classes. This pass is committed in isolation before any manual cleanup begins, keeping the two types of changes (order vs. removal) separated in git history for easier review.

**Redundancy pass (manual)**: Audit class strings for conflicts where two utilities target the same CSS property on the same element. Common patterns to check:
- Conflicting text size utilities (`text-sm text-base`)
- Conflicting color utilities on the same property (`text-gray-700 text-gray-900`)
- Padding/margin pairs where a responsive variant overrides the base at all breakpoints
- Mutually exclusive display utilities (`hidden block`)

Because Tailwind v4 uses cascade layers and last-class-wins within the same utility group, identifying conflicts requires reading class strings in context. There is no fully automated tool for this; the audit is a careful manual pass per template file.

Dynamically added classes in JavaScript (e.g. the contact form validation classes added via `classList.add()` in `30-contact.html`) are not in HTML attributes and Prettier does not touch them. These class names must be identified upfront via a grep for `classList.add` / `classList.remove` across all JS and inline scripts, and placed on a do-not-remove list before the redundancy pass begins.

### CI Integration

**Objective**: Make snapshot tests a permanent gate on `main` that fails the build if visual output deviates by more than 2%.

The existing `ci.yml` already runs `npm test` after building the site. Once `snapshots.spec.js` exists and baseline PNGs are committed, snapshot tests run automatically in CI with no workflow changes required.

The override path for intentional visual changes:
1. Make the visual change locally
2. Run `npx playwright test tests/e2e/snapshots.spec.js --update-snapshots`
3. Review the updated PNGs visually to confirm they match intent
4. Commit the updated PNG files alongside the code change
5. Push — CI passes because committed PNGs are the new baseline

This approach keeps overrides explicit (a deliberate commit of new PNGs) and traceable in git history. There is no flag or environment variable that silently bypasses the check.

## Risk Considerations and Mitigation Strategies

<details>
<summary>Technical Risks</summary>

- **Flaky snapshots from external widgets**: PayPal campaign card and reCAPTCHA badge load asynchronously and may render inconsistently between runs.
  - **Mitigation**: Mask these regions in every snapshot test using Playwright's `mask` option targeting their DOM locators.

- **Cross-platform font rendering exceeds 2% threshold**: Even with platform-neutral filenames, macOS and Linux may render subpixel fonts differently enough to fail the threshold.
  - **Mitigation**: If CI fails on font rendering, do a one-time re-baseline: trigger `workflow_dispatch` on GitHub Actions with `--update-snapshots` (or push from a Linux machine) and commit the Linux-rendered PNGs. After that, CI and local dev will share the same Linux-rendered baseline. The `maxDiffPixelRatio` of 0.02 typically absorbs minor subpixel variance; only persistent failures warrant a re-baseline.

- **Prettier not recognizing Tailwind v4 CSS entry point**: `prettier-plugin-tailwindcss` may fail to sort classes if it can't locate the Tailwind config.
  - **Mitigation**: Set `"tailwindStylesheet": "./src/stylev3.css"` in `.prettierrc`. Verify sort output on a single file before running across all templates.
</details>

<details>
<summary>Implementation Risks</summary>

- **Redundancy audit misses a conflict**: A manually overlooked redundant class is removed and causes a subtle visual change that the 2% threshold doesn't catch.
  - **Mitigation**: Commit the sorting pass and redundancy pass as separate commits. Run the full 15-snapshot suite after each commit individually, not just at the end.

- **JS-managed class names removed during audit**: Dynamically toggled classes (validation states in `30-contact.html`) look "unused" in HTML but are added at runtime.
  - **Mitigation**: Before the redundancy pass, grep for class names used in `classList.add/remove` and maintain a do-not-remove list. Verify contact form validation visually after refactor.

- **`.prettierignore` scope too narrow or too wide**: If the ignore file misconfigures scope, Prettier may reformat JS/JSON files or miss some HTML includes.
  - **Mitigation**: Verify the format script output on a dry run (`--check` flag) before committing, and review the diff to confirm only HTML class attributes changed.
</details>

## Success Criteria

### Primary Success Criteria
1. 15 Playwright snapshot tests exist covering all 5 pages at 375px, 768px, and 1280px widths, with platform-neutral baseline PNGs committed to `tests/e2e/__snapshots__/`
2. `npm test` passes locally and in GitHub Actions CI including all snapshot comparisons
3. All Tailwind class strings across all templates are sorted by `prettier-plugin-tailwindcss` and no redundant/conflicting class pairs remain
4. The refactored build produces ≤2% pixel deviation from the pre-refactor baselines across all 15 snapshots
5. The path to intentionally update baselines is documented and requires a deliberate commit of updated PNGs

## Documentation

- Update `CLAUDE.md`: document the `.prettierrc` config, `npm run format` script, and snapshot update instructions in the Feature Branch Workflow section
- Add a brief comment block to `tests/e2e/snapshots.spec.js` explaining the override workflow and cross-platform re-baseline procedure for future contributors

## Resource Requirements

### Development Skills
- Playwright visual testing (`toHaveScreenshot`, `mask`, `--update-snapshots`, `snapshotPathTemplate`)
- Prettier configuration with `prettier-plugin-tailwindcss`
- Tailwind CSS utility class knowledge sufficient to identify conflicting utilities

### Technical Infrastructure
- `prettier-plugin-tailwindcss` (already in devDependencies)
- `@playwright/test` (already in devDependencies, Chromium already installed in CI)
- GitHub Actions CI (already configured in `.github/workflows/ci.yml`)

## Notes

### Change Log
- 2026-03-09: Initial plan created
- 2026-03-09: Refinement — added cross-platform snapshot strategy (Option A: platform-neutral filenames via `snapshotPathTemplate`); fixed mermaid diagram contradiction (CI Integration requires no workflow changes); added `.prettierignore` scoping to prevent formatting non-HTML files; expanded redundancy pass to include upfront grep for JS-managed class names; added `.prettierignore` scope risk to Implementation Risks
- 2026-03-09: Tasks generated (6 tasks across 3 phases)

## Execution Blueprint

**Validation Gates:**
- Reference: `/config/hooks/POST_PHASE.md`

### Dependency Diagram

```mermaid
graph TD
    1["Task 01: Configure Prettier"] --> 4["Task 04: Sort Tailwind Classes"]
    2["Task 02: Configure Playwright Snapshots"] --> 3["Task 03: Capture Baselines"]
    3 --> 4
    3 --> 6["Task 06: Update CLAUDE.md"]
    1 --> 6
    2 --> 6
    4 --> 5["Task 05: Remove Redundant Classes"]
```

### Phase 1: Setup (Parallel)
**Parallel Tasks:**
- Task 01: Configure Prettier — `.prettierrc`, `.prettierignore`, `format` script
- Task 02: Configure Playwright — `snapshotPathTemplate` in `playwright.config.js`

### Phase 2: Baseline Capture
**Parallel Tasks:**
- Task 03: Create snapshot tests and capture 15 baseline PNGs (depends on: 02)

### Phase 3: Refactor + Docs (Parallel)
**Parallel Tasks:**
- Task 04: Sort Tailwind classes via Prettier (depends on: 01, 03)
- Task 06: Update CLAUDE.md (depends on: 01, 02, 03)

### Phase 4: Redundancy Cleanup
**Parallel Tasks:**
- Task 05: Remove redundant and overridden Tailwind classes (depends on: 04)

### Execution Summary
- Total Phases: 4
- Total Tasks: 6
- Maximum Parallelism: 2 tasks (Phase 1 and Phase 3)
- Critical Path Length: 4 phases (01 → 03 → 04 → 05)
