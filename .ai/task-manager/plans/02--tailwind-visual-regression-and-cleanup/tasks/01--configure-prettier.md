---
id: 1
group: "setup"
dependencies: []
status: "completed"
created: "2026-03-09"
skills:
  - nodejs
---
# Configure Prettier with Tailwind Class Sorting

## Objective
Add `.prettierrc`, `.prettierignore`, and an `npm run format` script so that `prettier-plugin-tailwindcss` (already installed) can sort Tailwind class attributes across all HTML templates.

## Skills Required
- `nodejs`: `package.json` script addition, Prettier config file authoring

## Acceptance Criteria
- [ ] `.prettierrc` exists at project root with `prettier-plugin-tailwindcss` declared as a plugin and `tailwindStylesheet` pointing to `./src/stylev3.css`
- [ ] `.prettierignore` exists and limits Prettier's scope to HTML template files only (`_includes/**/*.html`, `_includes/layouts/**/*.html`, `*.html`, `*.md` at root)
- [ ] `package.json` has a `format` script that runs Prettier over the scoped file set
- [ ] Running `npm run format -- --check` on a single HTML file confirms class sorting is active (classes are reordered per the official Tailwind sort order)
- [ ] No JS, JSON, or config files are modified by `npm run format`

## Technical Requirements
- `prettier-plugin-tailwindcss` is already in `devDependencies` — no install needed
- The plugin requires `"tailwindStylesheet"` in Prettier config to locate the Tailwind v4 CSS entry point (`src/stylev3.css`) since there is no `tailwind.config.js`
- `.prettierignore` must be tight enough to exclude `assets/js/`, `*.config.js`, `package.json`, `netlify.toml`, etc.
- The `format` script should target only template files, e.g.: `prettier --write "_includes/**/*.html" "_includes/layouts/**/*.html" "*.html" "*.md"`

## Input Dependencies
- None — this is a pure config task with no code prerequisites

## Output Artifacts
- `.prettierrc` — Prettier config with Tailwind plugin
- `.prettierignore` — scope limiter
- Updated `package.json` — `format` script added

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**`.prettierrc`:**
```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./src/stylev3.css"
}
```

**`.prettierignore`** (add to project root):
```
# Limit Prettier to HTML templates only
assets/
_site/
node_modules/
*.config.js
*.config.cjs
package.json
package-lock.json
netlify.toml
postcss.config.js
tailwind.config.js
.ai/
memory-bank/
docs/
tests/
src/stylev3.css
feed.liquid
```

**`package.json` format script** — add to the `scripts` block:
```json
"format": "prettier --write \"_includes/**/*.html\" \"_includes/layouts/**/*.html\" \"*.html\" \"*.md\""
```

**Verification**: Run `npm run format -- --check` on one file (e.g., `00-index.html`). If classes are already sorted, it passes. If not, it shows a diff. Either way confirms the plugin is working.

**Note on `prettier-plugin-tailwindcss` v0.6+**: The plugin auto-detects `tailwindStylesheet` for v4 projects. If class sorting doesn't activate, double-check that `tailwindStylesheet` path is relative to the project root (where `.prettierrc` lives).
</details>
