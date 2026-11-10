# André Monteiro — personal site

Static personal site and CV, served by GitHub Pages at https://andrefbm.github.io.

No build step and no dependencies: plain HTML, CSS and JavaScript. Fonts come from
Google Fonts (Bricolage Grotesque, Instrument Serif, JetBrains Mono).

## Files

- `index.html` — all content
- `styles.css` — design tokens (sugar violet `#9470DB`, vanilla cream `#FFF5D9`,
  cherry red `#E72D49`), light/dark themes, layout
- `script.js` — theme toggle, hero animations, terminal replay, command palette (Ctrl/⌘ K)
- `404.html` — standalone not-found page
- `assets/Andre_Monteiro_CV.pdf` — downloadable CV
- `assets/og-card.png` — 1200×630 social preview image
- `assets/favicon.svg` — favicon

## Editing content

Projects, experience and stack all live in `index.html`. The rotating phrases under the
hero are in `script.js` (`phrases`), and the command palette entries are in `actions`.

## Preview locally

Open `index.html` in a browser, or run `python -m http.server` in this folder and visit
http://localhost:8000.
