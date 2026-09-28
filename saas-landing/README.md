# Cadence — modern SaaS landing page

A complete, dependency-free SaaS marketing page: sticky header, animated hero with a
product mock, feature grid, **pricing section with a monthly/annual toggle**, FAQ, and a
**validated contact form**. Light + dark theme included.

## Run it

No build step and no dependencies — any static server (or just double-clicking
`index.html`) works:

```powershell
# option 1: open directly
Start-Process index.html

# option 2: serve locally on http://localhost:5173
npx --yes serve . -l 5173
```

## Files

| File         | Purpose                                                              |
| ------------ | -------------------------------------------------------------------- |
| `index.html` | All markup and copy (semantic sections, ARIA where it matters)        |
| `styles.css` | Design tokens first, then layout/components, then responsive queries  |
| `script.js`  | Progressive enhancement: theme, nav, billing toggle, form, reveal      |
| `README.md`  | This file                                                             |

## What is interactive

- **Mobile nav** — hamburger toggles a panel; closes on link click, `Escape`, or resize to desktop.
- **Theme switch** — sun/moon button, persisted in `localStorage`, follows `prefers-color-scheme`
  on first visit. A tiny inline script in the `<head>` sets the theme before first paint (no flash).
- **Pricing toggle** — Monthly / Annual radios rewrite every price from the `data-monthly` /
  `data-annual` attributes and announce the change through an `aria-live` region.
- **Contact form** — client-side validation with inline messages, `aria-invalid`, focus moved to
  the first invalid field, and a success/error status region.
- **Scroll reveal** — `IntersectionObserver` fades cards in; fully disabled under
  `prefers-reduced-motion: reduce`.

## Customising

- **Brand colours** live in the `:root` token block at the top of `styles.css` (`--brand`,
  `--accent`, surfaces, radii, shadows); the dark palette overrides the same tokens.
- **Prices** are data attributes on the price spans in `index.html`, e.g.
  `<span class="price-value" data-monthly="49" data-annual="39">49</span>`. Add or remove a
  plan by copying a `<li class="plan">` block — the grid reflows automatically.
- **Copy** is plain text in `index.html`; the footer year is set from the system clock.

## Wiring up the contact form

`script.js` deliberately stops short of a network call so the page stays self-contained. In the
`submit` handler, replace the `window.setTimeout(...)` block with a real request:

```js
fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
  .then(() => setStatus("Thanks! We'll be in touch shortly.", "success"))
  .catch(() => setStatus("Something went wrong — email sales@cadence.example.", "error"));
```

The handler already collects a `payload` object from `FormData` and shows a "Sending…" state on
the button, so validation and UI feedback keep working unchanged.

## Notes and limitations

- Content is placeholder copy for a fictional product ("Cadence") — no real backend, analytics,
  cookie banner, or legal pages are included.
- Fonts use a system stack (no external requests), so nothing is blocked by a CSP or privacy
  policy out of the box.
- Built and checked against modern evergreen browsers (Chromium 111+, Firefox 113+, Safari 16.4+),
  which is where `color-mix()` and `matchMedia().addEventListener` are supported.
