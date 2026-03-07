---
id: 4
group: "eleventy-setup"
dependencies: [2, 3]
status: "completed"
created: "2026-03-06"
skills: ["eleventy", "liquid"]
---

# Migrate Layouts and Includes to Eleventy

## Objective

Move the two layout files from `_layouts/` to `_includes/layouts/`, update all includes to use Eleventy's data paths, replace the `{% seo %}` Jekyll plugin tag with inline meta tags, add RSS `<link>` tag, and update `30-contact.html` to use Eleventy's flattened data reference for the webhook URL. Remove `firebase-init.html` reference from the default layout.

## Skills Required

- `eleventy`: Eleventy data access patterns, layout system, include variable scoping
- `liquid`: Liquid template syntax, filter usage in Eleventy's liquidjs

## Acceptance Criteria

- [ ] `_includes/layouts/` directory created
- [ ] `_layouts/default.html` copied to `_includes/layouts/default.html` (original `_layouts/` directory removed — it will be unused)
- [ ] `_layouts/markdown-content.html` copied to `_includes/layouts/markdown-content.html`
- [ ] `{% include firebase-init.html %}` line removed from `_includes/layouts/default.html`
- [ ] `{% seo %}` tag in `_includes/head.html` replaced with explicit `<meta>` tags (title, description, canonical, Open Graph, theme-color)
- [ ] RSS `<link rel="alternate">` added to `_includes/head.html`
- [ ] `{{ site.data.webhook_config.webhook_url }}` in `30-contact.html` updated to `{{ webhook_config.webhook_url }}`
- [ ] All `site.data.*` references across all includes updated to Eleventy's flattened path (e.g., `{{ testimonials }}`, `{{ site.title }}`)
- [ ] `{{ site.baseurl }}` references simplified or removed (baseurl is empty)
- [ ] `eleventy --dryrun` passes without template errors

## Technical Requirements

- Layout aliases defined in Task 2's `.eleventy.js` map `"default"` → `"layouts/default.html"` and `"markdown-content"` → `"layouts/markdown-content.html"` — these paths resolve relative to `_includes/`
- Eleventy flattens `_data/`: `site.data.testimonials` → `testimonials`, `site.data.webhook_config.webhook_url` → `webhook_config.webhook_url`
- `{{ site.title }}` works because `_data/site.js` exports `{ title: "..." }` and Eleventy makes it available as `site` in templates
- `{% include head.html %}` in layouts passes the current page's data through; `page.title`, `page.banner_type` etc. are available in included files
- The `{% feed_meta %}` Jekyll tag (if present) is replaced with `<link rel="alternate" type="application/rss+xml" title="{{ site.title }}" href="/feed.xml">`
- SEO meta tags needed: `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta property="og:*">`, `<meta name="theme-color">`

## Input Dependencies

- Task 2: Eleventy config with layout aliases and `_data/site.js`
- Task 3: Navigation templates updated (nav is an include, confirms include loading works)

## Output Artifacts

- `_includes/layouts/default.html` — main layout (Firebase init removed)
- `_includes/layouts/markdown-content.html` — markdown layout
- Updated `_includes/head.html` — inline SEO meta, RSS link
- Updated `30-contact.html` — flattened data path for webhook URL
- Updated all other includes with corrected data references

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**Step 1: Create layouts directory and move files**

```bash
mkdir -p _includes/layouts
cp _layouts/default.html _includes/layouts/default.html
cp _layouts/markdown-content.html _includes/layouts/markdown-content.html
# Remove _layouts/ directory
rm -rf _layouts/
```

**Step 2: Update `_includes/layouts/default.html`**

- Remove `{% include firebase-init.html %}` from the bottom of `<body>`
- Layout already uses `{{ content }}` which works identically in Eleventy Liquid

**Step 3: Replace `{% seo %}` in `_includes/head.html`**

Replace the `{% seo %}` tag with:

```html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<title>
  {%- if title -%} {{ title }} | {{ site.title }} {%- else -%} {{ site.title }}
  {%- endif -%}
</title>

<meta
  name="description"
  content="{{ description | default: site.description }}"
/>
<link
  rel="canonical"
  href="{{ canonical_url | default: site.url | append: page.url }}"
/>
<meta property="og:type" content="website" />
<meta property="og:url" content="{{ site.url }}{{ page.url }}" />
<meta property="og:title" content="{{ title | default: site.title }}" />
<meta
  property="og:description"
  content="{{ description | default: site.description }}"
/>
{% if og_image %}
<meta property="og:image" content="{{ site.url }}{{ og_image }}" />
{% endif %}

<meta name="theme-color" content="#25A2AA" />

<link
  rel="alternate"
  type="application/rss+xml"
  title="{{ site.title }}"
  href="/feed.xml"
/>
```

Note: In Eleventy Liquid, front matter variables are available directly (no `page.` prefix needed for `title`, `canonical_url`, etc. in layouts and includes — they come through the data cascade). However, `page.url` and `page.inputPath` use the `page` object. Check Eleventy docs for exact variable availability.

**Step 4: Data path updates across includes**

- `{{ site.data.testimonials }}` → `{{ testimonials }}` (in `_includes/testimonials.html`)
- `{{ site.data.images }}` → `{{ images }}` (if used)
- `{{ site.data.videos }}` → `{{ videos }}` (if used)
- `{{ site.data.webhook_config.webhook_url }}` → `{{ webhook_config.webhook_url }}` (in `30-contact.html` script)
- `{{ site.title }}`, `{{ site.description }}`, `{{ site.phone }}` etc. — these work via `_data/site.js` without change

**Step 5: Review `{{ "/feed.xml" | prepend: site.baseurl }}` pattern**
Since `baseurl` is empty (`""`), replace with static `/feed.xml`.

**Step 6: RSS feed template**
Create `feed.liquid` (or `feed.xml.liquid`) at project root using `@11ty/eleventy-plugin-rss` macros. The plugin was registered in Task 2's `.eleventy.js`. Refer to the eleventy-plugin-rss documentation for the feed template pattern.

**Common liquidjs vs Jekyll Liquid differences to watch:**

- `| date: "%Y"` format: liquidjs uses the same strftime format, should work
- `| prepend:` / `| append:` — identical
- `| where:` — available in liquidjs
- `| sort:` — available in liquidjs
- `| where_exp:` — available in LiquidJS 10.12.0+, but `site.pages` (Jekyll) does not exist in Eleventy; nav uses `_data/nav.js` instead (see Task 3)
</details>
