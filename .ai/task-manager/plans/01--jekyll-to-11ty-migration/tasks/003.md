---
id: 3
group: "eleventy-setup"
dependencies: [2]
status: "pending"
created: "2026-03-06"
skills: ["eleventy", "liquid"]
---
# Rebuild Navigation with Static Data File

## Objective
Replace the Jekyll-specific navigation generation in both nav templates with a simpler `_data/nav.js` static data file. While `where_exp` is available in modern LiquidJS (v10.12.0+), the real incompatibility is the data model: Jekyll's `site.pages` does not exist in Eleventy (use `collections.all`), and page front matter properties live under `item.data.*` in Eleventy rather than directly on `item.*`. Given that this site has exactly five known nav items, a static data file is the simplest and most maintainable approach.

## Skills Required
- `eleventy`: Eleventy data cascade, `_data/` global data loading, collections
- `liquid`: Liquid template rewriting, `{% for %}` iteration

## Acceptance Criteria
- [ ] `_data/nav.js` created with the five navigation items in correct display order
- [ ] `_includes/nav-lg.html` updated to iterate over `{{ nav }}` instead of `site.pages | sort:"name" | where_exp`
- [ ] `_includes/nav-mobile.html` updated similarly
- [ ] Active page highlighting preserved using `page.url` (works identically in Eleventy Liquid)
- [ ] Navigation renders correctly in both mobile and desktop viewports at correct URLs
- [ ] No Jekyll `site.pages` reference remains in nav templates

## Technical Requirements
- `_data/nav.js` exports an array of objects with `title` and `url` fields
- Eleventy auto-loads `_data/nav.js` making it available as `{{ nav }}` globally
- `page.url` in Eleventy Liquid returns the output URL of the current page (same semantics as Jekyll)
- The Calendar page special-case in `nav-mobile.html` (redirect to `/#open-shop-time`, shown as "Shop Hours") is dropped since `.25-calendar.html` was removed in Task 1

**Alternative if static data is not desired**: Eleventy collections could be used with `collections.all | where_exp: "item", "item.data.title != nil and item.data.exclude != true"` — this works in LiquidJS 10.12.0+, but requires `sort` to also be applied. The static data file is preferred for clarity and control.

## Input Dependencies
- Task 2: Eleventy initialized; `_data/` directory and data cascade working

## Output Artifacts
- `_data/nav.js` — static navigation data file
- Updated `_includes/nav-lg.html`
- Updated `_includes/nav-mobile.html`

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**`_data/nav.js`:**
```javascript
module.exports = [
  { title: "Home", url: "/" },
  { title: "About", url: "/about/" },
  { title: "Programs", url: "/programs/" },
  { title: "How Can I Help", url: "/how-can-i-help/" },
  { title: "Contact", url: "/contact/" }
];
```

**Updated `_includes/nav-lg.html`** (key loop section):
```liquid
{% for item in nav %}
<div class="flex items-center h-16 border-l border-gray-200{% if forloop.last %} border-r border-gray-200{% endif %}">
  <div class="w-full h-full flex items-center border-t-4 border-transparent border-solid hover:border-teal-400 hover:bg-gray-200 transition duration-150 ease-in-out">
    <a href="{{ item.url }}"
       class="px-4 text-base font-bold leading-5 xl:text-lg text-gray-800 focus:text-black focus:outline-none {% if item.url == page.url %}active{% endif %}">
      {{ item.title }}
    </a>
  </div>
</div>
{% endfor %}
```

**Updated `_includes/nav-mobile.html`** (key loop section):
```liquid
{% for item in nav %}
<a href="{{ item.url }}"
   class="mt-2 block px-3 py-2 rounded-md text-xl font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus:text-white focus:bg-gray-900 transition duration-150 ease-in-out">
  {{ item.title }}
</a>
{% endfor %}
```

**Why not use `collections.all`?**
The Eleventy collections approach would require:
```liquid
{% assign nav_pages = collections.all | where_exp: "item", "item.data.title != nil and item.data.exclude != true" | sort: "data.title" %}
```
This is more complex, harder to control ordering, and requires setting `exclude: true` in front matter for pages that should not appear in nav (the .txt files, 404, etc.). The static file is simpler for a 5-item nav that changes rarely.
</details>
