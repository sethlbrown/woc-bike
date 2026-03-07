const path = require("path");
const yaml = require("js-yaml");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const dateToRfc3339 = require("@11ty/eleventy-plugin-rss/src/dateRfc3339.js");
const getNewestCollectionItemDate = require("@11ty/eleventy-plugin-rss/src/getNewestCollectionItemDate.js");
const convertHtmlToAbsoluteUrls = require("@11ty/eleventy-plugin-rss/src/htmlToAbsoluteUrls.js");
const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  // YAML data file support (Eleventy v3 requires explicit registration)
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  // Plugins
  eleventyConfig.addPlugin(pluginRss);

  // Process .txt files as Liquid templates (for LLM mirror pages)
  eleventyConfig.addExtension("txt", { key: "liquid" });

  // Responsive image shortcode (replaces Jekyll {% responsive_image %})
  eleventyConfig.addShortcode("image", async function (src, alt) {
    if (!alt) throw new Error(`Missing alt text for image: ${src}`);

    let metadata = await Image(src, {
      widths: [300, 400, 600, 800, 975, 1600],
      formats: ["webp", "jpeg"],
      outputDir: "./_site/assets/img/",
      urlPath: "/assets/img/",
      filenameFormat: function (id, src, width, format) {
        const ext = path.extname(src);
        const name = path.basename(src, ext);
        return `${width}/${name}.${format}`;
      },
    });

    let imageAttributes = {
      alt,
      sizes:
        "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 60vw, (max-width: 1280px) 66vw, 60vw",
      loading: "lazy",
      decoding: "async",
      class:
        "w-full block sm:float-right sm:inline sm:p-4 sm:w-1/2 md:w-3/5 lg:w-2/3 xl:w-3/5",
    };

    return Image.generateHTML(metadata, imageAttributes);
  });

  // Register RSS plugin filters for Liquid (plugin only adds Nunjucks filters)
  eleventyConfig.addLiquidFilter("getNewestCollectionItemDate", getNewestCollectionItemDate);
  eleventyConfig.addLiquidFilter("dateToRfc3339", dateToRfc3339);
  eleventyConfig.addLiquidFilter("htmlToAbsoluteUrls", async (htmlContent, base) => {
    if (!htmlContent) return "";
    return convertHtmlToAbsoluteUrls(htmlContent, base);
  });

  // Layout aliases (layouts live in _includes/layouts/)
  eleventyConfig.addLayoutAlias("default", "layouts/default.html");
  eleventyConfig.addLayoutAlias("markdown-content", "layouts/markdown-content.html");

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
    templateFormats: ["liquid", "html", "md", "txt"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
    liquidOptions: {
      dynamicPartials: false, // allows unquoted {% include file.html %} like Jekyll
    },
  };
};
