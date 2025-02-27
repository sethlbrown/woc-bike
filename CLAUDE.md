# CLAUDE.md - Working with woc-bike codebase

## Build Commands
- `npm run build:production` - Production build
- `npm run build:dev` - Development build
- `npm run dev` - Start development server with browser-sync
- `npm run start` - Alias for dev command

## Project Structure
- Jekyll-based static site with Tailwind CSS
- Content in Markdown/HTML files at root level
- Templates in `_includes` and `_layouts` directories
- Assets in `assets` directory

## Style Guidelines
- Use Tailwind CSS for styling
- Maintain responsive design patterns (mobile-first)
- Follow consistent HTML structure in templates
- For JavaScript, use ES6+ syntax where possible
- Maintain clean, semantic HTML markup

## Working with Content
- Edit Markdown files for content changes
- Use YAML front matter for page metadata
- Config settings in `_config.yml`
- Site data in `_data` directory