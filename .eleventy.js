const pluginRss = require("@11ty/eleventy-plugin-rss");
const dateToRfc3339 = require("@11ty/eleventy-plugin-rss/src/dateRfc3339.js");
const getNewestCollectionItemDate = require("@11ty/eleventy-plugin-rss/src/getNewestCollectionItemDate.js");
const convertHtmlToAbsoluteUrls = require("@11ty/eleventy-plugin-rss/src/htmlToAbsoluteUrls.js");

module.exports = function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(pluginRss);

  // Process .txt files as Liquid templates (for LLM mirror pages)
  eleventyConfig.addExtension("txt", { key: "liquid" });

  // Stub for jekyll-responsive-image tag — replaced in Task 6 with {% image %}
  eleventyConfig.addLiquidTag("responsive_image", function (liquidEngine) {
    return {
      parse(tagToken) {
        this.args = tagToken.args;
      },
      render() {
        // Extract path and alt from args string: path: "..." alt: "..."
        const pathMatch = this.args.match(/path:\s*["']([^"']+)["']/);
        const altMatch = this.args.match(/alt:\s*["']([^"']+)["']/);
        const src = pathMatch ? "/" + pathMatch[1] : "";
        const alt = altMatch ? altMatch[1] : "";
        return Promise.resolve(`<img src="${src}" alt="${alt}" />`);
      },
    };
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
