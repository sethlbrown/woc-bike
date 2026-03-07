---
id: 8
group: "eleventy-setup"
dependencies: [7]
status: "pending"
created: "2026-03-06"
skills: ["ci-cd", "deployment"]
---
# Configure Netlify and Update GitHub Actions

## Objective
Create `netlify.toml` to configure Netlify hosting. Rename and update the GitHub Actions workflow from Firebase+Ruby to Node 22-only build+test. The Netlify account itself requires human setup before this task can be fully validated — the task produces the correct configuration files regardless.

## Skills Required
- `ci-cd`: GitHub Actions workflow authoring, secrets management
- `deployment`: Netlify configuration (`netlify.toml`)

## Acceptance Criteria
- [ ] `netlify.toml` created at project root with `command = "npm run build:production"` and `publish = "_site"` with `NODE_VERSION = "22"`
- [ ] `.github/workflows/firebase-deploy.yml` renamed to `.github/workflows/ci.yml`
- [ ] `ci.yml` removes: Ruby setup, Bundler install, ImageMagick apt packages, Firebase CLI install, Firebase deploy action
- [ ] `ci.yml` retains: Node 22 setup (`node-version: '22'`), `npm ci`, webhook config injection step (generates `_data/webhook_config.yml` from `WEBHOOK_URL` secret — still needed for Google Sheets form)
- [ ] `ci.yml` adds: `npx playwright install --with-deps chromium` step and `npm test` step
- [ ] `ci.yml` triggers on push to `main` and `workflow_dispatch`
- [ ] Human intervention documented as comments in `netlify.toml` or in a PR description

## Technical Requirements
- Netlify free plan supports Node 22 via `NODE_VERSION` environment variable in `netlify.toml`
- GitHub Actions `ubuntu-latest` has Chromium available; `npx playwright install --with-deps chromium` installs the browser and its OS dependencies in one step
- The `WEBHOOK_URL` secret must remain configured in GitHub repository settings — do not remove it
- Firebase `FIREBASE_*` secrets can be left in GitHub settings (they're harmless) but are no longer referenced in the workflow
- The `actions/checkout@v3` and `actions/setup-node@v3` actions should be updated to `@v4` for Node 22 compatibility

## Input Dependencies
- Task 7: Build scripts finalized in `package.json` — `npm run build:production` and `npm test` commands are defined

## Output Artifacts
- `netlify.toml` at project root
- `.github/workflows/ci.yml` (renamed and updated workflow)
- `.github/workflows/firebase-deploy.yml` deleted

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**`netlify.toml`:**
```toml
[build]
  command = "npm run build:production"
  publish = "_site"

[build.environment]
  NODE_VERSION = "22"

# Human setup required:
# 1. Create a Netlify account at netlify.com (free plan)
# 2. Connect this GitHub repository via "New site from Git"
# 3. Netlify will auto-detect this netlify.toml and use it for builds
# 4. After Phase 1 PR merges, switch DNS on Namecheap to Netlify's provided values
# 5. Netlify auto-provisions SSL via Let's Encrypt
```

**`.github/workflows/ci.yml`** (replace the existing firebase-deploy.yml content):
```yaml
name: Build and Test
on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build_and_test:
    name: Build and Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Update Webhook Config
        run: |
          cat > _data/webhook_config.yml << EOL
          webhook_url: '${{ secrets.WEBHOOK_URL }}'
          EOL

      - name: Build site
        run: npm run build:production
        env:
          NODE_ENV: production

      - name: Install Playwright Chromium
        run: npx playwright install --with-deps chromium

      - name: Run Playwright tests
        run: npm test
```

**Steps to perform:**
1. Create `netlify.toml` as above
2. `git mv .github/workflows/firebase-deploy.yml .github/workflows/ci.yml`
3. Replace `ci.yml` content with the new workflow above

**Note on Playwright CI**: The `npm test` command runs `playwright test`. By default, Playwright runs all browsers configured in `playwright.config.js`. Ensure the config specifies Chromium only for CI (or uses the `--project=chromium` flag): `npm test -- --project=chromium` if needed.

**Human intervention reminder** (note for PR description):
- Before merging this PR, create a Netlify account and connect the GitHub repo
- After merging, Netlify will auto-deploy; verify the production deploy
- Then switch Namecheap DNS to Netlify's provided values (A record or CNAME)
- Firebase Hosting decommissioned manually via Firebase console after DNS propagates
</details>
