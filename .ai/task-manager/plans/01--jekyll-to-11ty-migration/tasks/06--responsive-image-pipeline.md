---
id: 6
group: "eleventy-setup"
dependencies: [2, 4, 5]
status: "completed"
created: "2026-03-06"
skills: ["eleventy", "nodejs"]
---
# Set Up Responsive Image Pipeline with eleventy-img

## Objective
Register an `@11ty/eleventy-img` shortcode in `.eleventy.js` to replace the `{% responsive_image %}` Jekyll plugin tag used in `15-programs.md`. The shortcode must generate a `<picture>` element with WebP sources and multiple widths, matching the output of the previous `_includes/responsive-image.html` template.

## Skills Required
- `eleventy`: Shortcode registration, `@11ty/eleventy-img` configuration
- `nodejs`: Async shortcode handling, image processing configuration

## Acceptance Criteria
- [ ] `@11ty/eleventy-img` shortcode registered in `.eleventy.js` as `{% image "path", "alt text" %}`
- [ ] Shortcode generates `<picture>` with `<source type="image/webp" srcset="...">` and `<img>` fallback
- [ ] Output widths match current config: 300, 400, 600, 800, 975, 1600px
- [ ] Output path format: `assets/img/{width}/{basename}` (matching current `jekyll-responsive-image` output so existing `<link rel="preload">` and CSS references don't break)
- [ ] `15-programs.md` updated: both `{% responsive_image path: "..." alt: "..." %}` occurrences replaced with `{% image "...", "..." %}`
- [ ] `_includes/responsive-image.html` deleted
- [ ] Images load correctly in the `_site/` output
- [ ] `loading="lazy"` and `decoding="async"` attributes present on generated `<img>`
- [ ] `eleventy` build completes without image-related errors

## Technical Requirements
- `@11ty/eleventy-img` v5+ (compatible with Eleventy v3)
- Shortcode must be `async` (image processing is asynchronous)
- Source images are in `assets/img/`; WebP versions are already committed
- The shortcode should generate images to `_site/assets/img/` maintaining the same path structure
- `formats: ["webp", "jpeg"]` — generate both WebP and original-format fallback
- `widths: [300, 400, 600, 800, 975, 1600]` — match the current responsive_image config
- `sizes` attribute: `"(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 60vw, (max-width: 1280px) 66vw, 60vw"` (from current `_includes/responsive-image.html`)
- CSS class on `<img>`: `w-full block sm:float-right sm:inline sm:p-4 sm:w-1/2 md:w-3/5 lg:w-2/3 xl:w-3/5` (preserved from the current template; will be converted to semantic class in Phase 2)

## Input Dependencies
- Task 2: `@11ty/eleventy-img` installed, `.eleventy.js` exists for shortcode registration
- Task 4: `_includes/responsive-image.html` available to delete
- Task 5: `15-programs.md` verified building (even with stubbed tag)

## Output Artifacts
- Updated `.eleventy.js` with `image` async shortcode
- Updated `15-programs.md` with shortcode syntax
- Deleted `_includes/responsive-image.html`
- Generated responsive images in `_site/assets/img/`

## Implementation Notes

<details>
<summary>Detailed implementation guide</summary>

**In `.eleventy.js`, add the image shortcode:**
```javascript
const Image = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {
  // ... existing config ...

  // Responsive image shortcode
  eleventyConfig.addShortcode("image", async function(src, alt) {
    if (!alt) throw new Error(`Missing alt text for image: ${src}`);

    let metadata = await Image(src, {
      widths: [300, 400, 600, 800, 975, 1600],
      formats: ["webp", "jpeg"],
      outputDir: "./_site/assets/img/",
      urlPath: "/assets/img/",
      filenameFormat: function(id, src, width, format) {
        const ext = path.extname(src);
        const name = path.basename(src, ext);
        return `${width}/${name}.${format}`;
      }
    });

    let imageAttributes = {
      alt,
      sizes: "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 60vw, (max-width: 1280px) 66vw, 60vw",
      loading: "lazy",
      decoding: "async",
      class: "w-full block sm:float-right sm:inline sm:p-4 sm:w-1/2 md:w-3/5 lg:w-2/3 xl:w-3/5"
    };

    return Image.generateHTML(metadata, imageAttributes);
  });

  // ... rest of config ...
};
```

Add `const path = require("path");` at the top of `.eleventy.js`.

**Update `15-programs.md`:** Replace both `{% responsive_image path: "assets/img/bike_project_in_action.jpg" alt: "Kids working at the bike project" %}` occurrences:
```liquid
{% image "assets/img/bike_project_in_action.jpg", "Kids working at the bike project" %}
{% image "assets/img/IMG_0119.jpg", "Sometimes an unexpected treasure..." %}
```

**Note on image paths**: The `src` argument to `Image()` is relative to the project root (where `.eleventy.js` is). The path `"assets/img/filename.jpg"` should resolve correctly.

**`filenameFormat` note**: The current `jekyll-responsive-image` output path format is `assets/img/{width}/{basename}`. The `filenameFormat` function above replicates this. Verify the output directory structure matches.

**Build time**: Image processing adds build time. For development, consider adding `dryRun` or `sharpOptions` to reduce processing. The images are already in WebP format in the repo; Eleventy-img will still regenerate them, but they'll be cached after the first run.
</details>
