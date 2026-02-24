import browserSync from "browser-sync";
import spawn from "cross-spawn";
import { dest, series, src, task, watch, parallel } from "gulp";
import postcss from "gulp-postcss";
import sourcemaps from "gulp-sourcemaps";
import terser from "gulp-terser";
import tailwindcss from "@tailwindcss/postcss";

const SITE_ROOT = "./_site";
const POST_BUILD_STYLESHEET = `${SITE_ROOT}/assets/css/`;
const PRE_BUILD_STYLESHEET = "./src/stylev3.css";
const PRE_BUILD_JS = "./src/js/**/*.js";
const POST_BUILD_JS = `${SITE_ROOT}/assets/js/`;
const TAILWIND_CONFIG = "./tailwind.config.js";
const IMAGE_SOURCES = "./assets/img/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}";
const IMAGE_DESTINATION = `${SITE_ROOT}/assets/img/`;

// Fix for Windows compatibility
const jekyll = process.platform === "win32" ? "jekyll.bat" : "jekyll";

const isDevelopmentBuild = process.env.NODE_ENV === "development";

task("buildJekyll", () => {
  browserSync.notify("Building Jekyll site...");

  const args = ["exec", jekyll, "build"];

  if (isDevelopmentBuild) {
    args.push("--incremental");
  }
  
  // Check if additional args were passed to gulp
  const gulpArgs = process.argv.slice(3);
  const configIndex = gulpArgs.indexOf('--config');
  
  if (configIndex !== -1 && gulpArgs[configIndex + 1]) {
    args.push('--config');
    args.push(gulpArgs[configIndex + 1]);
  }

  return spawn("bundle", args, { stdio: "inherit" });
});

task("processStyles", () => {
  browserSync.notify("Compiling styles...");

  if (isDevelopmentBuild) {
    return src(PRE_BUILD_STYLESHEET)
      .pipe(sourcemaps.init())
      .pipe(
        postcss([
          tailwindcss()
        ])
      )
      .pipe(sourcemaps.write('.'))
      .pipe(dest(POST_BUILD_STYLESHEET));
  } else {
    return src(PRE_BUILD_STYLESHEET)
      .pipe(
        postcss([
          tailwindcss()
        ])
      )
      .pipe(dest(POST_BUILD_STYLESHEET));
  }
});

task("processScripts", () => {
  browserSync.notify("Processing scripts...");
  
  if (isDevelopmentBuild) {
    // Development mode: generate sourcemaps
    return src(PRE_BUILD_JS)
      .pipe(sourcemaps.init())
      .pipe(sourcemaps.write('.'))
      .pipe(dest(POST_BUILD_JS));
  } else {
    // Production mode: minify JS
    return src(PRE_BUILD_JS)
      .pipe(terser({
        // Terser options
        compress: {
          drop_console: true,    // Remove console.log statements
          drop_debugger: true    // Remove debugger statements
        },
        mangle: {
          toplevel: true         // Mangle top-level variables
        },
        output: {
          beautify: false,       // Minified output
          comments: false        // Remove comments
        }
      }))
      .pipe(dest(POST_BUILD_JS));
  }
});

// Images task - we'll handle WebP conversion using Jekyll's responsive_image plugin instead
task("processImages", () => {
  browserSync.notify("Processing images...");
  // For now, we'll rely on the Jekyll responsive_image plugin
  // which already generates different image sizes. WebP conversion will be handled by a script.
  return Promise.resolve();
});

task("startServer", () => {
  browserSync.init({
    files: [SITE_ROOT + "/**"],
    open: "local",
    port: 4000,
    server: {
      baseDir: SITE_ROOT,
      serveStaticOptions: {
        extensions: ["html"],
      },
    },
  });

  watch(
    [
      "**/*.css",
      "**/*.html",
      "**/*.js",
      "**/*.md",
      "**/*.markdown",
      "!_site/**/*",
      "!node_modules/**/*",
    ],
    { interval: 500 },
    buildSite
  );
  
  // Watch for image changes
  watch(
    [IMAGE_SOURCES],
    { interval: 500 },
    series("processImages")
  );
});

const buildSite = series("buildJekyll", parallel("processStyles", "processScripts", "processImages"));

exports.serve = series(buildSite, "startServer");
exports.default = series(buildSite);
exports.images = series("processImages"); // Add a dedicated task for images only
