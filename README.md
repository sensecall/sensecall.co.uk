# sensecall.co.uk

Static site built with Eleventy, Sass, and Tailwind CSS. This repo contains the source for sensecall.co.uk; all generated output lives under `_site/`.

## Getting Started
- Prereqs: Node 18+ and npm.
- Install dependencies: `npm install`

## Development
- Primary dev loop: `npm start` (runs Eleventy with BrowserSync and watches Sass/Tailwind).
- If you only want templates: `npm run dev:11ty`
- If you only want styles: `npm run dev:css`
- During development, edit files in `src/`—never `_site/`.

## Building for Production
- `npm run build` builds templates and compiles/minifies CSS. This mirrors the Netlify build.
- Individual steps: `npm run build:11ty` and `npm run build:css`

## Project Structure
- `src/pages` — page templates (Nunjucks).
- `src/_includes` — shared layouts/partials.
- `src/scss` — Sass entrypoint (`main.scss`) feeding Tailwind.
- `src/js` — client-side scripts.
- `src/assets` — images and other static assets.
- `_site` — generated output (not committed).

## Notes
- Netlify deploys run `npm run build`; ensure new dependencies land in `package.json`.
- Check both light/dark themes and mobile widths before shipping visual changes.***
