---
id: 5
group: "eleventy-setup"
dependencies: [2, 4]
status: "completed"
created: "2026-03-06"
skills: ["eleventy", "liquid"]
---
# Migrate Content Pages and LLM Text Files

## Objective
Verify all five content pages (`00-index.html`, `05-about.md`, `15-programs.md`, `22-how-can-i-help.md`, `30-contact.html`, `404.html`) and the six LLM text mirror files build correctly with Eleventy. Fix any front matter or template issues discovered. Ensure all `permalink` values produce the expected URLs.

## Skills Required
- `eleventy`: Front matter handling, permalink configuration, template data cascade
- `liquid`: Liquid template debugging in Eleventy context

## Acceptance Criteria
- [ ] All five content pages render without errors: `/`, `/about/`, `/programs/`, `/contact/`, `/how-can-i-help/`
- [ ] `404.html` renders correctly
- [ ] LLM text files render with `layout: none` and correct permalinks: `/about.txt`, `/contact.txt`, `/how-can-i-help.txt`, `/index.txt`, `/programs.txt`, `/llms.txt`
- [ ] `layout: default` and `layout: markdown-content` front matter resolves via layout aliases (defined in Task 2)
- [ ] `permalink` values from front matter are honored by Eleventy
- [ ] `page.url` is correctly set in each page (used by nav active-state check)
- [ ] `page.title` / `title` is correctly available in layouts and head.html
- [ ] `page.banner_type`, `page.banner`, `page.canonical_url` front matter fields work in layout conditionals
- [ ] `15-programs.md` builds (the `{% responsive_image %}` tag will be handled in Task 6 — for now, verify the page doesn't crash; comment out or stub the tag temporarily if needed)

## Technical Requirements
- Eleventy v3 treats front matter `layout` key with aliases configured in Task 2
- `permalink` front matter works identically to Jekyll in Eleventy
- Front matter fields are available directly (no `page.` prefix in most Eleventy contexts) but `page.url`, `page.inputPath`, `page.fileSlug` use the `page` object — understand the distinction
- Files prefixed with numbers (`00-index.html`) — Eleventy does not auto-strip numeric prefixes from URLs; the `permalink: /` in `00-index.html`'s front matter ensures the correct URL
- `layout: none` in LLM text files tells Eleventy to use no layout — Eleventy supports this via `layout: false` or the string `none` (check Eleventy v3 docs; may need `layout: false`)
- The `.txt` files use Jekyll's `layout: none` — in Eleventy v3, `layout: false` is the equivalent; update if needed

## Input Dependencies
- Task 2: Eleventy config, `_data/site.js`, layout aliases
- Task 4: Layouts and includes migrated, data references corrected

## Output Artifacts
- All content pages verified building correctly in `_site/`
- Any front matter fixes applied
- `15-programs.md` stubbed or partially working (the `{% responsive_image %}` tag is addressed in Task 6)

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**Verification approach:**
Run `npx eleventy --dryrun 2>&1 | grep -E "error|Error|warn"` to surface template errors without writing files.

**Common issues to fix:**

1. **`layout: none` in .txt files**: Eleventy v3 uses `layout: false` to suppress layouts. If the .txt files use `layout: none`, update them to `layout: false`. Alternatively, create an empty `_includes/layouts/none.html` as a passthrough layout.

2. **`page.title` vs `title` in includes**: In Eleventy Liquid, when a page renders its layout, the page's front matter `title` is available as `title` (direct) in the layout context. But when an include is called from a layout, Eleventy Liquid shares the parent scope — `title` should be available in `_includes/head.html`. Test and verify.

3. **Conditional banner logic in `_includes/layouts/default.html`**:
   ```liquid
   {% if page.banner_type == "home" %}{% include home-banner.html %}
   {% elsif page.banner == false %}<!-- No banner -->
   {% else %}{% include banner.html %}{% endif %}
   ```
   In Eleventy, front matter `banner_type` is available as `banner_type` (not `page.banner_type`) in layout templates. Update to: `{% if banner_type == "home" %}`.

4. **`published: true` front matter**: Jekyll respects `published: false` to exclude pages. Eleventy uses `eleventyExcludeFromCollections: true` or permalink: `false`. The `.txt` files with `published: true` should be fine. Pages with `published: false` (if any) need updating.

5. **Numeric filename prefix handling**: `00-index.html` → Eleventy output path would be `/00-index/index.html` without the `permalink: /` override. The `permalink` front matter overrides this correctly.

6. **`credit` front matter** in several pages (e.g., `banner_type: home`, `credit: "Bike Project Illustration..."`): These are passed to banner includes. Verify the banner includes access `credit` (not `page.credit`) in Eleventy context.

**Run a test build and fix errors iteratively:**
```bash
npx eleventy 2>&1
```
Fix any liquid errors, data path issues, or layout resolution problems before moving to Task 6.
</details>
