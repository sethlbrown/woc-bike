# Carbondale Bike Project

## Built on Jekyll Starter Tailwind (with Alpinejs)

A starter kit for using [Tailwind](https://tailwindcss.com) with [Jekyll](https://jekyllrb.com/) that includes:

- A barebones Jekyll starter theme
- A Gulpfile that does the following:
  - Compiles Tailwind
  - Runs [Autoprefixer](https://github.com/postcss/autoprefixer)
  - Minifies your CSS
  - Compiles Jekyll
  - Runs [Browsersync](https://www.browsersync.io/) for local development

## What is Tailwind?

> "Tailwind is a utility-first CSS framework for rapidly building custom user interfaces."
> –[Tailwind](https://tailwindcss.com)

## What is Jekyll?

> "Jekyll is a simple, blog-aware, static site generator perfect for personal, project, or organization sites. Think of it like a file-based CMS, without all the complexity. Jekyll takes your content, renders Markdown and Liquid templates, and spits out a complete, static website ready to be served by Apache, Nginx or another web server."
> –[Jekyll](https://jekyllrb.com/)

## Requirements

- [Bundler](http://bundler.io/)
- [Jekyll](https://jekyllrb.com/)
- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [Ruby](https://www.ruby-lang.org/en/)

## Get started

- `bundle install` to install Ruby gems
- `npm ci` to install npm packages listed in `package-lock.json`
- `npm run start` or `npm run dev` to compile the site with development settings and run BrowserSync

## Build your site

- `npm run build:dev` to compile the site with development settings
- `npm run build:production` or `npm run build` to compile the site for production

## Image Optimization

This site uses WebP images for better performance. The WebP versions of images should be generated locally and committed to the repository:

1. **Adding new images**:
   - Add original JPG/PNG images to the `/assets/img/` directory
   - Run `npm run webp` to generate WebP versions
   - Commit both original and WebP versions to git

2. **Build scripts**:
   - `npm run build:production` - Standard production build (used in CI/CD)
   - `npm run build:production:webp` - Production build + WebP conversion (only use locally when adding new images)

This approach ensures that WebP conversion happens once locally rather than on every CI/CD build, improving build times and consistency.

## Deploy Production (Firebase)

This site is currently hosted on Google's Firebase Hosting.

https://firebase.google.com/docs/hosting/deploying

`$> firebase serve --only hosting`

After you've tested the changes locally. To deploy:

`$> firebase deploy --only hosting`

## Busting the Cache

Firebase Spark hosting caches the CSS file for 3600 seconds or 60 minutes. I've tried setting the Cache-Control header to no-cache. That doesn't work. The caching happens at the edge. I also tried appending a time stamp at build time to the style.css file but that didn't bust the cache either. Instead it's necessary to change the name of the css file in three places: rename the file to stylev{versionNumber}.css, then change the gulp file and the head.html include to reflect the new file name. This appears to be the only way to bust the cache.

## License

[MIT](https://github.com/taylorbryant/jekyll-starter-tailwind/blob/master/LICENSE.md)

## How you can help

Enjoying Jekyll Starter Tailwind and want to help? You can:

- [Create an issue](https://github.com/taylorbryant/jekyll-starter-tailwind/issues/new) with some constructive criticism
- [Submit a pull request](https://github.com/taylorbryant/jekyll-starter-tailwind/compare) with some improvements to the project
