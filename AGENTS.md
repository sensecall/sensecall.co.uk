# Repository Guidelines

## Project Structure & Module Organization
- Source lives in `src/` with Nunjucks templates under `src/pages`, shared partials in `src/_includes`, and long-form content in `src/writing` and `src/projects`.
- Static assets and client scripts are in `src/assets`; styles come from `src/scss/main.scss`, compiled into `_site/css/`.
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
- Keep inline scripts lightweight; prefer modules under `src/assets/js` when behavior grows.

## Content and Tone of Voice
- Treat the published site as the source of truth for Dan's voice. Before drafting or substantially rewriting copy, read the surrounding page and at least one relevant published article, such as `your-users-dont-care-about-your-scrum.md`, `why-delivery-teams-must-challenge-flawed-briefs.md`, or `side-projects-instead.md`.
- Use UK English, plain language, first person, contractions, and concrete examples. Keep the writing concise, direct, candid, and user-centred.
- Preserve Dan's natural humour, blunt phrasing, opinions, and intentional sentence fragments. Do not smooth everything into polished corporate prose.
- Reuse established heading and CTA patterns where they fit, but do not force every page into the same rhythm or structure.
- Avoid generic scene-setting, corporate filler, inflated claims, keyword stuffing, forced three-part lists, repetitive conclusions, and stock AI constructions such as "in today's landscape", "it's not just X, it's Y", "whether you're...", "delve", or "unlock".
- Never invent outcomes, client details, quotations, dates, opinions, credentials, or personal anecdotes. Ask for missing facts rather than hiding the gap with vague copy.
- Write for people first. Treat SEO and LLM discoverability as a consequence of useful, specific, well-structured content, not a reason to repeat search phrases.
- Edit AI-assisted drafts until they sound recognisably like Dan, not merely grammatically polished. If the draft still reads like generic AI copy, rewrite or remove it.

## Testing Guidelines
- No automated test suite exists; use `npm run build` as the pre-PR smoke test and confirm `_site/` renders correctly.
- Before pushing UI changes, spot-check key pages (`/`, `/writing/`, `/projects/`) in light/dark themes and on mobile widths.
- Always verify accessibility basics: heading order, focus states, color contrast, and ARIA labels for interactive elements introduced or changed.

## Performance Guidelines
- Treat mobile performance as the default constraint: preserve a fast first render and re-check the homepage with Lighthouse/PageSpeed after changing global layout, CSS, fonts, images, analytics, or third-party scripts.
- Use LCP at or below 2.5 seconds, CLS at or below 0.1, and a mobile Lighthouse performance score of at least 90 as review targets; compare the median of repeated runs because lab scores vary.
- Do not serve source-size raster images directly in cards, avatars, or thumbnails. Generate appropriately sized variants, use modern formats where practical, and provide `srcset`/`sizes` when the rendered size varies by breakpoint.
- Give every `<img>` intrinsic `width` and `height` attributes. Keep below-the-fold images lazy-loaded, but do not lazy-load the likely LCP asset.
- Avoid site-wide third-party JavaScript when a page-local script, inline SVG, or native browser feature will do. Defer non-essential analytics and enhancements until after critical content has rendered.
- Keep font requests and weights minimal. Prefer self-hosted subsets or a single non-blocking font-loading path; do not request the same font stylesheet from both HTML and CSS.

## Commit & Pull Request Guidelines
- Follow the existing Git history: short, present-tense commit subjects (e.g., `adjust hero spacing`, `fix nav contrast`).
- For PRs, include a concise summary of changes, screenshots for visual updates, and references to related issues or briefs.
- Note any manual checks performed (build, browser checks) and call out follow-up tasks if scope was trimmed.

## Deployment & Configuration Notes
- Netlify builds run `npm run build`; ensure new dependencies are added to `package.json` only.
- Do not commit `_site/` artifacts; rely on CI/Netlify to generate them.
- When adding fonts or third-party scripts, document the source and consider privacy/accessibility impacts in the PR description.
