---
id: 2
group: "eleventy-setup"
dependencies: [1]
status: "completed"
created: "2026-03-06"
skills: ["eleventy", "nodejs"]
---

# Initialize Eleventy Project Configuration

## Objective

Bootstrap the Eleventy (11ty) project by creating `.eleventy.js`, updating `package.json` (add Eleventy and related deps, remove Gulp/Babel), updating `.nvmrc` to Node 22, creating `_data/site.js` from `_config.yml`, and configuring passthrough copies and layout aliases. This is the foundation all other Phase 1 tasks depend on.

## Skills Required

- `eleventy`: `.eleventy.js` configuration — input/output dirs, passthrough copies, layout aliases, watch targets, ignore patterns
- `nodejs`: `package.json` dependency management, npm scripts

## Acceptance Criteria

- [ ] `.eleventy.js` created at project root with correct input (`.`), output (`_site`), template formats (`liquid`, `html`, `md`)
- [ ] Layout aliases defined: `"default"` → `"layouts/default.html"`, `"markdown-content"` → `"layouts/markdown-content.html"`
- [ ] Passthrough copies configured: `assets/` and `src/js/navigation.js` → `_site/assets/js/`
- [ ] Watch target added for `src/stylev3.css`
- [ ] `.eleventyignore` created to exclude: `node_modules/`, `.git/`, `src/js/utils/`, `memory-bank/`, `docs/`
- [ ] `_data/site.js` created with all values from `_config.yml` (`title`, `description`, `author`, `email`, `phone`, `hours`, `baseurl`, `url`)
- [ ] `.nvmrc` updated from `20` to `22`
- [ ] `package.json` updated: remove `gulp`, `gulp-postcss`, `gulp-sourcemaps`, `gulp-terser`, `browser-sync`, `@babel/preset-env`, `@babel/register`, `cross-spawn`; add `@11ty/eleventy`, `@11ty/eleventy-img`, `@11ty/eleventy-plugin-rss`, `@playwright/test`, `concurrently`
- [ ] `npm install` runs without errors
- [ ] `npx eleventy --version` confirms Eleventy v3 is installed
- [ ] `eleventy` build runs (even if some templates have errors at this point — the config itself should not error)

## Technical Requirements

- Eleventy v3 (`@11ty/eleventy@^3.0.0`)
- `@11ty/eleventy-img` for responsive image shortcode (configured in Task 6)
- `@11ty/eleventy-plugin-rss` for RSS feed (configured in Task 4)
- Node 22 (`node --version` should output `v22.x.x`)
- `_data/site.js` must export a plain object (not a function) so it's available as `{{ site.title }}` in Liquid templates
- The `_layouts/` directory still exists at this point; layout aliases in `.eleventy.js` tell Eleventy to look in `_includes/layouts/` (Task 4 will move the actual layout files)

## Input Dependencies

- Task 1: Cleanup complete (Gemfile, Firebase files, drafts removed from the branch)

## Output Artifacts

- `.eleventy.js` — core Eleventy config file
- `.eleventyignore` — Eleventy ignore patterns
- `_data/site.js` — global site data replacing `_config.yml` site variables
- Updated `package.json` — with new deps, without Gulp/Babel
- Updated `.nvmrc` — Node 22

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**`.eleventy.js` structure:**

```javascript
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(pluginRss);

  // Layout aliases (layouts will be moved to _includes/layouts/ in Task 4)
  eleventyConfig.addLayoutAlias("default", "layouts/default.html");
  eleventyConfig.addLayoutAlias(
    "markdown-content",
    "layouts/markdown-content.html",
  );

  // Passthrough copies
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy({
    "src/js/navigation.js": "assets/js/navigation.js",
  });

  // Watch CSS source
  eleventyConfig.addWatchTarget("src/stylev3.css");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      layouts: "_includes", // layouts will be in _includes/layouts/
      data: "_data",
    },
    templateFormats: ["liquid", "html", "md"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
  };
};
```

**`_data/site.js`** (values from `_config.yml`):

```javascript
module.exports = {
  title: "Carbondale Bike Project",
  author: "Aaron Taylor",
  email: "carbondalebikeproject@gmail.com",
  phone: "970.505.8434",
  hours: "Sunday noon-6p, Tues. 2-6p, Thurs. 2-6p MT",
  description:
    "The Mission of the Carbondale Bicycle Project is to increase individual, community, environmental, and global health by operating a sustainable, safe, and educational community bicycle shop and bicycle education programs.",
  baseurl: "",
  url: "https://carbondalebikeproject.org",
};
```

**`package.json` scripts** (add now, will be refined in Task 7):

```json
{
  "scripts": {
    "build:css": "postcss src/stylev3.css -o _site/assets/css/stylev3.css",
    "build:production": "npm run build:css && eleventy",
    "dev": "concurrently \"postcss src/stylev3.css -o _site/assets/css/stylev3.css --watch\" \"eleventy --serve\"",
    "start": "npm run dev",
    "test": "playwright test",
    "webp": "node src/js/utils/convert-to-webp.js"
  }
}
```

**`.eleventyignore`:**

```
node_modules/
_site/
.git/
src/js/utils/
memory-bank/
docs/
.ai/
.claude/
.cursor/
```

**Note on `_config.yml`**: Do NOT delete `_config.yml` yet — Eleventy ignores it, but it documents the original config. Can be removed in a cleanup commit after Phase 1 is validated.

</details>
