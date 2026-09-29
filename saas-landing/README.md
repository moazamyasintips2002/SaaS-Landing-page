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

# option 3: build and run the container (see "Docker" below)
docker build -t cadence-landing .
docker run --rm -p 5173:80 cadence-landing
```

## Files

| File            | Purpose                                                              |
| --------------- | -------------------------------------------------------------------- |
| `index.html`    | All markup and copy (semantic sections, ARIA where it matters)        |
| `styles.css`    | Design tokens first, then layout/components, then responsive queries  |
| `script.js`     | Progressive enhancement: theme, nav, billing toggle, form, reveal      |
| `README.md`     | This file                                                             |
| `Dockerfile`    | Single-stage nginx image that serves the static files on port 80      |
| `.dockerignore` | Build-context exclusions (git, IDE files, docs) out of the image      |

## Docker

The `Dockerfile` is deliberately a single stage with no build step: there is nothing to
compile, so `index.html`, `styles.css` and `script.js` are copied verbatim into an
`nginx:1.30-alpine` image that serves them on port 80. No Node/npm toolchain and no
`node_modules` are pulled into the image.

```powershell
docker build -t cadence-landing .            # build the image
docker run --rm -p 5173:80 cadence-landing   # → http://localhost:5173
```

Notes:

- Map the container's port 80 to any free host port; `-p 5173:80` keeps the URL identical to
  option 2 above (`-p 8080:80` works just as well).
- The `HEALTHCHECK` fetches `GET /`, so `docker ps` reports the container as `healthy` once
  nginx is answering the landing page.
- nginx's stock site config is used unchanged. It serves `/usr/share/nginx/html` on port 80 and
  relies on `ETag` + `Last-Modified` revalidation, which is what you want while the CSS/JS
  filenames carry no content hash — long-lived caching would otherwise go stale after an edit.
- gzip is left at the stock setting (the directive is commented out in `nginx.conf`, so responses
  are sent uncompressed). The page is ~60 KB of text, so it is not worth extra config for a
  demo; to turn it on, add a `conf.d` file and rebuild:

  ```dockerfile
  RUN printf '%s\n' 'gzip on;' \
      'gzip_types text/css application/javascript text/html;' \
      > /etc/nginx/conf.d/gzip.conf
  ```
- No `try_files` fallback to `index.html` is needed — this is a single document, not a
  client-side-routed SPA. Static assets are served straight from disk with a `404` for
  anything missing.
- The base is pinned to `nginx:1.30-alpine` (the stable channel, currently 1.30.5) so builds are
  reproducible; the OCI `org.opencontainers.image.*` labels are baked in for registry tooling.

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
