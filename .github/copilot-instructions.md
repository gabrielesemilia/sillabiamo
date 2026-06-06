# Copilot Instructions — Sillabiamo!

## Project overview

**Sillabiamo!** is a static, no-build, vanilla web app for children to look up Italian words and hear their syllables spoken aloud. Open `index.html` directly in a browser (or deploy to GitHub Pages as-is — no build step required).

## Architecture

Four files, no framework, no bundler, no package manager:

| File | Role |
|---|---|
| `index.html` | Two `<section>` elements: `#setupScreen` (theme + difficulty picker) and `#gameScreen` (search + syllables). Only one visible at a time via the `hidden` attribute. |
| `style.css` | Mobile-first styles. CSS custom properties on `:root` (default purple), `[data-tema="maschio"]` (blue), `[data-tema="femmina"]` (pink) control the theme. |
| `app.js` | All runtime logic. No imports/exports — reads `parole` as a global. |
| `parole.js` | Static data — declares `const parole` (500 Italian words). Must load **before** `app.js`. |

## Data format (`parole.js`)

```js
{ parola: "farfalla", sillabe: ["far", "fal", "la"] }
```

Words are grouped by syllable count. The difficulty→syllable mapping is `{ facile: 2, medio: 3, difficile: 4 }` defined in `app.js` as `DIFF_SILLABE`.

## Key conventions

- **Italian throughout** — all user-visible strings, comments, and identifiers are in Italian (`parola`, `sillabe`, `renderSillabe`, `closeDropdown`, etc.).
- **Theme applied via `data-tema` on `<html>`** — JS sets `document.documentElement.dataset.tema = tema`. All themed colors cascade from CSS custom properties on `[data-tema="maschio"]` / `[data-tema="femmina"]`.
- **Settings persisted in `sessionStorage`** under key `sillabiamo_settings` as `{ tema, difficolta }` JSON. On load, if valid settings exist, setup is skipped and the game starts directly.
- **All event listeners are bound once** at parse time (not re-bound on screen transitions). `showSetup()` / `showGame()` only toggle visibility and reset UI state.
- **`gamePool`** is the filtered subset of `parole` for the current difficulty. Both autocomplete and the random-word button operate on `gamePool`, never on the full `parole` array.
- **`pointerdown` instead of `click`** on dropdown `<li>` items — prevents the input's `blur` from firing before the selection is registered (`e.preventDefault()` inside the handler).
- **Syllable box colours** use `:nth-child(1–4)` selectors in CSS (not inline styles). The first box uses dark text (`#3D2800`) because its yellow background is light.
- **SVG decorations** — four inline SVG constants (`SVG_CAR`, `SVG_TRAIN`, `SVG_UNICORN`, `SVG_STAR`) in `app.js` are injected via `innerHTML` into `#headerDecoLeft`, `#headerDecoRight`, `#floatLeft`, `#floatRight` when the game screen is shown. Setup-screen SVGs are embedded directly in the HTML.
- **TTS** — `speakText()` always calls `speechSynthesis.cancel()` first. Voice selection is deferred if `getVoices()` returns an empty array (Chrome/Android async loading). iOS Safari's user-gesture requirement is satisfied because `speakText` is only called from click/touch event handlers.

