/* ============================================================
   Calculia — Service Worker
   Network-first strategy with a cache fallback (works offline).
   The server copy wins whenever the device is online, so a deploy
   reaches installed PWAs without anyone bumping VERSION by hand.
   When adding new files: add them to ARCHIVOS and bump VERSION (the
   precache still needs the list for offline use).

   Canonical URLs only. List "./about/", never "./about/":
   Cloudflare answers the index.html form with a 307 to the directory.
   cache.addAll() follows that redirect and stores the final response
   under the ORIGINAL key with `redirected: true`, and a redirected
   response may not be handed to a top-level navigation — Chrome kills
   the load with net::ERR_FAILED ("No se puede acceder a este sitio")
   on every activity link. Reproduced with
   scripts/one-off/probe-redirect-isolated.js against production.
   ============================================================ */
var VERSION = 'calculia-v229';

var FILES = [
  './',
  './404.html',
  './manifest.json',
  './about/',
  './about/styles.css',
  './about/strings.es.js',
  './about/strings.en.js',
  './team/',
  './team/styles.css',
  './team/strings.es.js',
  './team/strings.en.js',
  './styles.css',
  './app.js',
  './strings.es.js',
  './strings.en.js',
  './config/',
  './config/app.js',
  './config/styles.css',
  './config/strings.es.js',
  './config/strings.en.js',
  './legal/',
  './legal/styles.css',
  './legal/strings.es.js',
  './legal/strings.en.js',
  './assets/css/tokens.css',
  './assets/css/locale-picker.css',
  './assets/js/locale-picker.js',
  './assets/css/base.css',
  './assets/css/components.css',
  './assets/css/number-sort.css',
  './assets/fonts/atkinson-hyperlegible-400.woff2',
  './assets/fonts/atkinson-hyperlegible-700.woff2',
  './assets/fonts/nunito-variable.woff2',
  './assets/js/utils.js',
  './assets/js/i18n.js',
  './assets/js/tts.js',
  './assets/js/storage.js',
  './assets/js/feedback.js',
  './assets/js/number-sort.js',
  './assets/js/dinero.js',
  './assets/js/sw-register.js',
  /* External script that used to be inline on about/ and team/: the CSP is
     `script-src 'self'`, so those pages had dead language buttons. */
  './assets/js/locale-picker-config.js',
  './assets/img/icono.svg',
  './tools/algebra/',
  './tools/algebra/app.js',
  './tools/algebra/data.js',
  './tools/algebra/strings.es.js',
  './tools/algebra/strings.en.js',
  './tools/algebra/styles.css',
  './tools/charts/',
  './tools/charts/app.js',
  './tools/charts/data.js',
  './tools/charts/strings.es.js',
  './tools/charts/strings.en.js',
  './tools/charts/styles.css',
  './tools/calendar/',
  './tools/calendar/app.js',
  './tools/calendar/data.js',
  './tools/calendar/strings.es.js',
  './tools/calendar/strings.en.js',
  './tools/calendar/styles.css',
  './tools/clock/',
  './tools/clock/app.js',
  './tools/clock/data.js',
  './tools/clock/strings.es.js',
  './tools/clock/strings.en.js',
  './tools/clock/styles.css',
  './tools/similar/',
  './tools/similar/app.js',
  './tools/similar/data.js',
  './tools/similar/strings.es.js',
  './tools/similar/strings.en.js',
  './tools/similar/styles.css',
  './tools/fractions-measures/',
  './tools/fractions-measures/app.js',
  './tools/fractions-measures/data.js',
  './tools/fractions-measures/strings.es.js',
  './tools/fractions-measures/strings.en.js',
  './tools/fractions-measures/styles.css',
  './tools/shapes/',
  './tools/shapes/app.js',
  './tools/shapes/data.js',
  './tools/shapes/strings.es.js',
  './tools/shapes/strings.en.js',
  './tools/shapes/styles.css',
  './tools/trigonometry/',
  './tools/trigonometry/app.js',
  './tools/trigonometry/data.js',
  './tools/trigonometry/strings.es.js',
  './tools/trigonometry/strings.en.js',
  './tools/trigonometry/styles.css',
  './tools/scale/',
  './tools/scale/app.js',
  './tools/scale/data.js',
  './tools/scale/strings.es.js',
  './tools/scale/strings.en.js',
  './tools/scale/styles.css',
  './tools/measures/',
  './tools/measures/app.js',
  './tools/measures/data.js',
  './tools/measures/strings.es.js',
  './tools/measures/strings.en.js',
  './tools/measures/styles.css',
  './tools/math-tables/',
  './tools/math-tables/app.js',
  './tools/math-tables/data.js',
  './tools/math-tables/strings.es.js',
  './tools/math-tables/strings.en.js',
  './tools/math-tables/styles.css',
  './tools/head-math/',
  './tools/head-math/app.js',
  './tools/head-math/data.js',
  './tools/head-math/strings.es.js',
  './tools/head-math/strings.en.js',
  './tools/head-math/styles.css',
  './tools/mental-math/',
  './tools/mental-math/app.js',
  './tools/mental-math/data.js',
  './tools/mental-math/strings.es.js',
  './tools/mental-math/strings.en.js',
  './tools/mental-math/styles.css',
  './tools/parity/',
  './tools/parity/app.js',
  './tools/parity/data.js',
  './tools/parity/strings.es.js',
  './tools/parity/strings.en.js',
  './tools/parity/styles.css',
  './tools/percent/',
  './tools/percent/app.js',
  './tools/percent/data.js',
  './tools/percent/strings.es.js',
  './tools/percent/strings.en.js',
  './tools/percent/styles.css',
  './tools/money/',
  './tools/money/app.js',
  './tools/money/data.js',
  './tools/money/strings.es.js',
  './tools/money/strings.en.js',
  './tools/money/styles.css',
  './tools/geometry/',
  './tools/geometry/app.js',
  './tools/geometry/data.js',
  './tools/geometry/strings.es.js',
  './tools/geometry/strings.en.js',
  './tools/geometry/styles.css',
  './tools/los-numeros/',
  './tools/los-numeros/app.js',
  './tools/los-numeros/data.js',
  './tools/los-numeros/strings.es.js',
  './tools/los-numeros/strings.en.js',
  './tools/los-numeros/styles.css',
  './tools/numbers/',
  './tools/numbers/app.js',
  './tools/numbers/data.js',
  './tools/numbers/strings.es.js',
  './tools/numbers/strings.en.js',
  './tools/numbers/styles.css',
  './tools/odd-one-out/',
  './tools/odd-one-out/app.js',
  './tools/odd-one-out/data.js',
  './tools/odd-one-out/strings.es.js',
  './tools/odd-one-out/strings.en.js',
  './tools/odd-one-out/styles.css',
  './tools/patterns/',
  './tools/patterns/app.js',
  './tools/patterns/data.js',
  './tools/patterns/strings.es.js',
  './tools/patterns/strings.en.js',
  './tools/patterns/styles.css',
  './tools/puzzle/',
  './tools/puzzle/app.js',
  './tools/puzzle/data.js',
  './tools/puzzle/strings.es.js',
  './tools/puzzle/strings.en.js',
  './tools/puzzle/styles.css',
  './tools/divisibility/',
  './tools/divisibility/app.js',
  './tools/divisibility/data.js',
  './tools/divisibility/strings.es.js',
  './tools/divisibility/strings.en.js',
  './tools/divisibility/styles.css',
  './tools/operations/',
  './tools/operations/app.js',
  './tools/operations/data.js',
  './tools/operations/strings.es.js',
  './tools/operations/strings.en.js',
  './tools/operations/styles.css',
  './tools/ordinals/',
  './tools/ordinals/app.js',
  './tools/ordinals/data.js',
  './tools/ordinals/strings.es.js',
  './tools/ordinals/strings.en.js',
  './tools/ordinals/styles.css',
  './tools/quantities/',
  './tools/quantities/app.js',
  './tools/quantities/data.js',
  './tools/quantities/strings.es.js',
  './tools/quantities/strings.en.js',
  './tools/quantities/styles.css',
  './tools/order-numbers/',
  './tools/order-numbers/app.js',
  './tools/order-numbers/data.js',
  './tools/order-numbers/strings.es.js',
  './tools/order-numbers/strings.en.js',
  './tools/order-numbers/styles.css',
  './tools/order-positives/',
  './tools/order-positives/app.js',
  './tools/order-positives/data.js',
  './tools/order-positives/strings.es.js',
  './tools/order-positives/strings.en.js',
  './tools/order-positives/styles.css',
  './tools/order-negatives/',
  './tools/order-negatives/app.js',
  './tools/order-negatives/data.js',
  './tools/order-negatives/strings.es.js',
  './tools/order-negatives/strings.en.js',
  './tools/order-negatives/styles.css',
  './tools/order-decimals/',
  './tools/order-decimals/app.js',
  './tools/order-decimals/data.js',
  './tools/order-decimals/strings.es.js',
  './tools/order-decimals/strings.en.js',
  './tools/order-decimals/styles.css',
  './tools/number-challenge/',
  './tools/number-challenge/app.js',
  './tools/number-challenge/data.js',
  './tools/number-challenge/strings.es.js',
  './tools/number-challenge/strings.en.js',
  './tools/number-challenge/styles.css',
  './tools/riddles/',
  './tools/riddles/app.js',
  './tools/riddles/data.js',
  './tools/riddles/strings.es.js',
  './tools/riddles/strings.en.js',
  './tools/riddles/styles.css',
  './tools/roman-numerals/',
  './tools/roman-numerals/app.js',
  './tools/roman-numerals/data.js',
  './tools/roman-numerals/strings.es.js',
  './tools/roman-numerals/strings.en.js',
  './tools/roman-numerals/styles.css',
  './tools/stories/',
  './tools/stories/app.js',
  './tools/stories/data.js',
  './tools/stories/strings.es.js',
  './tools/stories/strings.en.js',
  './tools/stories/styles.css',
  './tools/problems/',
  './tools/problems/app.js',
  './tools/problems/data.js',
  './tools/problems/strings.es.js',
  './tools/problems/strings.en.js',
  './tools/problems/styles.css',
  './tools/temperature/',
  './tools/temperature/app.js',
  './tools/temperature/data.js',
  './tools/temperature/strings.es.js',
  './tools/temperature/strings.en.js',
  './tools/temperature/styles.css',
  './tools/wallet/',
  './tools/wallet/app.js',
  './tools/wallet/data.js',
  './tools/wallet/strings.es.js',
  './tools/wallet/strings.en.js',
  './tools/wallet/styles.css'
];

/* Cloudflare answers EVERY "/x.html" URL with a 307 to its extensionless form
   (/index.html -> /, /404.html -> /404, /offline.html -> /offline,
   /legal/privacidad.html -> /legal/privacidad). Following that redirect yields
   a response with `redirected === true`, and the Cache API PRESERVES that flag
   across a store/load round trip, so cache.addAll() silently poisons the entry
   under its original key. Chrome refuses to hand such a response to a top-level
   navigation ("Response served by service worker has redirections"), so a Back
   button that lands on a cached .html entry aborts the whole navigation.

   Rebuilding the response produces a brand-new object whose flag is false while
   keeping body, status and headers, which is what the navigation needs. */
function deRedirect(res) {
  if (!res || !res.redirected) return res;
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers
  });
}

/* addAll() stores the followed response as-is, so precache entry by entry and
   sanitise. Not all-or-nothing: a listed file that is missing on the server
   must not fail install, because a failed install leaves every client on its
   old worker and no deploy would reach them. A file that cannot be fetched
   here is fetched on demand later. */
function precache(cache, files) {
  return Promise.all(files.map(function (file) {
    /* cache: 'reload' avoids storing stale copies from the browser HTTP cache */
    return fetch(new Request(file, { cache: 'reload' })).then(function (res) {
      if (!res || !res.ok) return;
      return cache.put(file, deRedirect(res));
    }).catch(function () {});
  }));
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return precache(cache, FILES);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (c) { return c !== VERSION; })
          .map(function (c) { return caches.delete(c); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  /* Network-first, cache fallback. Cache-first pinned installed clients to
     the first copy of every file, so deploys stayed invisible until the
     site data was cleared. The cache answers only when the network is
     unreachable. */
  event.respondWith(
    fetch(event.request).then(function (r) {
      /* Cache same-origin resources, but never a redirect. Following one
         still yields status 200 with redirected === true, which is exactly
         the poisoned entry the precache comment above describes. */
      if (r.status === 200) {
        caches.open(VERSION).then(function (cache) {
          cache.put(event.request, deRedirect(r.clone()));
        });
      }
      return deRedirect(r);
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        /* A cached copy can come from a precache written by an older worker,
           so it is sanitised here too rather than trusted. */
        if (cached) return deRedirect(cached);
        /* Offline and not cached: don't serve the landing page here, its
           relative paths only resolve correctly at the site root, and the
           URL we are answering may be a deep activity path. Reply with a
           tiny inline HTML that stays at the current URL. */
        return new Response(
          '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
          '<meta name="viewport" content="width=device-width,initial-scale=1">' +
          '<title>Sin conexión</title><style>body{font-family:system-ui,sans-serif;' +
          'margin:2rem auto;max-width:32rem;padding:0 1rem;line-height:1.5}' +
          'a{color:#1d4ed8}</style></head><body>' +
          '<h1>Sin conexión</h1>' +
          '<p>No hemos podido cargar esta página. Comprueba tu conexión a ' +
          'Internet y vuelve a intentarlo.</p>' +
          '<p><a href="./">Volver a la portada</a></p>' +
          '</body></html>',
          { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      });
    })
  );
});
