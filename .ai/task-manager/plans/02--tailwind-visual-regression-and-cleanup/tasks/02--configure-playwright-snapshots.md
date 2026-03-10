---
id: 2
group: "setup"
dependencies: []
status: "completed"
created: "2026-03-09"
skills:
  - playwright
---
# Configure Playwright for Platform-Neutral Snapshot Filenames

## Objective
Update `playwright.config.js` with a `snapshotPathTemplate` that strips the OS platform from snapshot filenames, so baselines generated on macOS work in the Linux GitHub Actions runner without requiring separate platform-specific files.

## Skills Required
- `playwright`: `playwright.config.js` configuration, `snapshotPathTemplate` option

## Acceptance Criteria
- [ ] `playwright.config.js` has a `snapshotPathTemplate` that places snapshots under `tests/e2e/__snapshots__/` with filenames in the form `{arg}{ext}` (no platform or project name segment)
- [ ] Running `npx playwright test --list` shows no config errors
- [ ] `tests/e2e/__snapshots__/` is NOT listed in `.gitignore` (snapshots must be committed)

## Technical Requirements
- `snapshotPathTemplate` is a top-level `defineConfig` option in Playwright
- Target template: `'tests/e2e/__snapshots__/{arg}{ext}'`
- This strips the default `{platform}`, `{projectName}`, and `{snapshotSuffix}` segments that Playwright appends by default
- Verify `.gitignore` — currently it contains `test-results/` and `playwright-report/` entries but NOT `tests/e2e/__snapshots__/`; no change needed if already unignored

## Input Dependencies
- None — this is a pure config change

## Output Artifacts
- Updated `playwright.config.js` — `snapshotPathTemplate` added

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**Current `playwright.config.js`** already has:
```javascript
module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { ... },
  projects: [ ... ],
  webServer: { ... },
});
```

**Add `snapshotPathTemplate` at the top level** of the config object:
```javascript
module.exports = defineConfig({
  testDir: "./tests/e2e",
  snapshotPathTemplate: "tests/e2e/__snapshots__/{arg}{ext}",
  // ... rest of config unchanged
});
```

**Why this works**: By default Playwright generates `{testDir}/__snapshots__/{testFilePath}/{arg}-{projectName}-{platform}{ext}`. Replacing with `{arg}{ext}` only produces filenames like `home-mobile.png` — identical on macOS and Linux.

**Verify**: Run `npx playwright test --list` to confirm no config syntax errors. The `__snapshots__/` directory will be created on first snapshot capture (Task 3).
</details>
