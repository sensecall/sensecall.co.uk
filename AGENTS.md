# Repository Guidelines

## Project Structure & Module Organization
- Source lives in `src/` with Nunjucks templates under `src/pages`, shared partials in `src/_includes`, and long-form content in `src/writing` and `src/projects`.
- Static assets are in `src/assets` and client scripts in `src/js`; styles come from `src/scss/main.scss`, compiled into `_site/css/`.
- The production build outputs to `_site/`; avoid editing files there directly because they are generated.
- Global configuration sits at the repo root (`package.json`, `netlify.toml`, `tailwind.config.js`).

## Build, Test, and Development Commands
- `npm start` — run Eleventy with BrowserSync and watch Sass/Tailwind; primary local dev loop.
- `npm run dev:11ty` — Eleventy dev server only (useful when CSS is prebuilt).
- `npm run dev:css` — watch Sass and pipe through Tailwind into `_site/css/styles.min.css`.
- `npm run build` — production build (Eleventy + compressed Sass/Tailwind); mirrors the Netlify pipeline.
- `npm run build:11ty` / `npm run build:css` — build steps split for debugging CSS or template issues.

## Coding Style & Naming Conventions
- Use 2-space indentation for Nunjucks, HTML, JS, and SCSS.
- Favor semantic HTML with Tailwind utility classes for layout/spacing; keep custom SCSS scoped and minimal.
- Name assets and includes descriptively in lowercase with hyphens (e.g., `case-studies.njk`, `service-design.jpg`).
- Keep inline scripts lightweight; prefer `src/js` modules when behavior grows.
- Match the existing tone of voice: concise, plain English, and user-centred; reuse established headings and CTA patterns to stay consistent across pages.

## Testing Guidelines
- No automated test suite exists; use `npm run build` as the pre-PR smoke test and confirm `_site/` renders correctly.
- Before pushing UI changes, spot-check key pages (`/`, `/writing/`, `/projects/`) in light/dark themes and on mobile widths.
- Always verify accessibility basics: heading order, focus states, color contrast, and ARIA labels for interactive elements introduced or changed.

## Commit & Pull Request Guidelines
- Follow the existing Git history: short, present-tense commit subjects (e.g., `adjust hero spacing`, `fix nav contrast`).
- For PRs, include a concise summary of changes, screenshots for visual updates, and references to related issues or briefs.
- Note any manual checks performed (build, browser checks) and call out follow-up tasks if scope was trimmed.

## Deployment & Configuration Notes
- Netlify builds run `npm run build`; ensure new dependencies are added to `package.json` only.
- Do not commit `_site/` artifacts; rely on CI/Netlify to generate them.
- When adding fonts or third-party scripts, document the source and consider privacy/accessibility impacts in the PR description.
