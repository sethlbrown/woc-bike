# CLAUDE.md - Working with Carbondale Bike Project Website

## Project Overview
This is the website for the Carbondale Bike Project (CBP), a community bicycle shop and educational program in Carbondale, Colorado. The site supports CBP's mission to increase individual, community, environmental, and global health through sustainable cycling programs.

## Tech Stack & Architecture
- **Jekyll**: Static site generator with Liquid templates and Markdown content
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Gulp**: Asset pipeline (compiles Tailwind, minifies CSS, runs Jekyll, serves with Browsersync)
- **Node.js & npm**: JavaScript dependencies and build scripts
- **Ruby & Bundler**: Jekyll and gem dependencies
- **Firebase Hosting**: Production hosting platform

## Build Commands
- `npm run build:production` - Production build
- `npm run build:dev` - Development build
- `npm run dev` - Start development server with browser-sync
- `npm run start` - Alias for dev command

## Development Setup
1. Install Ruby, Bundler, Node.js, and npm
2. `bundle install` - Install Ruby gems
3. `npm ci` - Install npm packages
4. `npm run start` or `npm run dev` - Local development with Browsersync
5. `npm run build:production` - Production build

## Project Structure
- Jekyll-based static site with Tailwind CSS
- Content in Markdown/HTML files at root level
- Templates in `_includes` and `_layouts` directories
- Assets in `assets` directory
- `memory-bank/` - Project context and documentation

## Style Guidelines
- Use Tailwind CSS for styling with utility-first approach
- Maintain responsive design patterns (mobile-first)
- Follow consistent HTML structure in templates
- Use inline SVGs for icons instead of external icon fonts
- Prioritize accessibility and performance
- Maintain clean, semantic HTML markup
- Optimize images (WebP versions committed to repo)

## Key Features & Components
- **Donation Integration**: PayPal embeddable campaign card and Venmo links
- **Progress Tracking**: Visual progress bar for Kickstand Club (120-bike goal)
- **Stories Section**: Latest news and community stories
- **Modular Navigation**: Header and footer as reusable includes
- **Responsive Design**: Mobile-friendly layouts with Tailwind utilities

## Working with Content
- Edit Markdown files for content changes
- Use YAML front matter for page metadata
- Config settings in `_config.yml`
- Site data in `_data` directory
- Update donation progress in relevant data files

## Technical Constraints
- Static site: No server-side code or dynamic backend
- All images must be optimized (WebP versions generated/committed)
- Cache busting for CSS requires manual filename/version changes
- Accessibility and performance are high priorities

## Current Focus Areas
- Homepage layout and UX improvements
- Donation integration styling and functionality
- Responsive design and accessibility enhancements
- Content updates for programs and community stories