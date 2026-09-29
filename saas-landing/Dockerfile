# ---------------------------------------------------------------------------
# Cadence — modern SaaS landing page
#
# There is no build step and no dependencies (see README.md): the site is three
# static files. So this is a single-stage image — nginx plus that content. No
# bundler, no Node/npm toolchain and no node_modules end up in the result.
# ---------------------------------------------------------------------------
FROM nginx:1.30-alpine

# OCI metadata baked into the image.
LABEL org.opencontainers.image.title="Cadence — SaaS landing page" \
      org.opencontainers.image.description="Dependency-free static marketing page served by nginx" \
      org.opencontainers.image.source="https://github.com/moazamyasintips2002/SaaS-Landing-page" \
      org.opencontainers.image.licenses="MIT"

# index.html, styles.css and script.js are shipped exactly as they are in the
# repository. nginx's stock 50x.html is intentionally left in place, because the
# default server block still points `error_page 500 502 503 504 /50x.html` at it.
COPY index.html styles.css script.js /usr/share/nginx/html/

# The default site (conf.d/default.conf) listens on 80 and serves this directory.
# nginx's default `etag on` plus Last-Modified means the CSS/JS are revalidated
# instead of cached forever — correct here, because the filenames carry no
# content hash to bust after an edit. gzip stays at the stock setting (the
# directive is commented out in nginx.conf); README.md shows how to enable it.
EXPOSE 80

# Mark the container unhealthy if the landing page stops being served.
# Only short options are used: BusyBox wget (Alpine) parses but ignores -t/--tries,
# so relying on it would silently change behaviour, while -q/-O are supported by
# both BusyBox and GNU wget.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

# Run nginx in the foreground so it stays PID 1 and still receives signals.
CMD ["nginx", "-g", "daemon off;"]
