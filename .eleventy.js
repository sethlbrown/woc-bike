const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(pluginRss);

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
    templateFormats: ["liquid", "html", "md"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
  };
};
