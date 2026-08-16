/* ============================================================
   Calculia — Service Worker
   Cache-first strategy for the app shell (works offline).
   When adding new files: add them to ARCHIVOS and bump VERSION.
   ============================================================ */
var VERSION = 'calculia-v36';

var ARCHIVOS = [
  './index.html',
  './404.html',
  './manifest.json',
  './site/index.html',
  './site/app.js',
  './site/styles.css',
  './site/strings.es.js',
  './site/strings.en.js',
  './settings/index.html',
  './settings/app.js',
  './settings/styles.css',
  './settings/strings.es.js',
  './settings/strings.en.js',
  './legal/index.html',
  './legal/app.js',
  './legal/styles.css',
  './legal/strings.es.js',
  './legal/strings.en.js',
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/css/components.css',
  './assets/fonts/atkinson-hyperlegible-400.woff2',
  './assets/fonts/atkinson-hyperlegible-700.woff2',
  './assets/fonts/nunito-variable.woff2',
  './assets/js/utils.js',
  './assets/js/i18n.js',
  './assets/js/tts.js',
  './assets/js/storage.js',
  './assets/js/feedback.js',
  './assets/js/dinero.js',
  './assets/js/sw-register.js',
  './assets/img/icono.svg',
  './tools/clock/index.html',
  './tools/clock/app.js',
  './tools/clock/data.js',
  './tools/clock/strings.es.js',
  './tools/clock/strings.en.js',
  './tools/clock/styles.css',
  './tools/fractions-measures/index.html',
  './tools/fractions-measures/app.js',
  './tools/fractions-measures/data.js',
  './tools/fractions-measures/strings.es.js',
  './tools/fractions-measures/strings.en.js',
  './tools/fractions-measures/styles.css',
  './tools/math-tables/index.html',
  './tools/math-tables/app.js',
  './tools/math-tables/data.js',
  './tools/math-tables/strings.es.js',
  './tools/math-tables/strings.en.js',
  './tools/math-tables/styles.css',
  './tools/mental-math/index.html',
  './tools/mental-math/app.js',
  './tools/mental-math/data.js',
  './tools/mental-math/strings.es.js',
  './tools/mental-math/strings.en.js',
  './tools/mental-math/styles.css',
  './tools/money/index.html',
  './tools/money/app.js',
  './tools/money/data.js',
  './tools/money/strings.es.js',
  './tools/money/strings.en.js',
  './tools/money/styles.css',
  './tools/numbers/index.html',
  './tools/numbers/app.js',
  './tools/numbers/data.js',
  './tools/numbers/strings.es.js',
  './tools/numbers/strings.en.js',
  './tools/numbers/styles.css',
  './tools/odd-one-out/index.html',
  './tools/odd-one-out/app.js',
  './tools/odd-one-out/data.js',
  './tools/odd-one-out/strings.es.js',
  './tools/odd-one-out/strings.en.js',
  './tools/odd-one-out/styles.css',
  './tools/patterns/index.html',
  './tools/patterns/app.js',
  './tools/patterns/data.js',
  './tools/patterns/strings.es.js',
  './tools/patterns/strings.en.js',
  './tools/patterns/styles.css',
  './tools/puzzle/index.html',
  './tools/puzzle/app.js',
  './tools/puzzle/data.js',
  './tools/puzzle/strings.es.js',
  './tools/puzzle/strings.en.js',
  './tools/puzzle/styles.css',
  './tools/quantities/index.html',
  './tools/quantities/app.js',
  './tools/quantities/data.js',
  './tools/quantities/strings.es.js',
  './tools/quantities/strings.en.js',
  './tools/quantities/styles.css',
  './tools/riddles/index.html',
  './tools/riddles/app.js',
  './tools/riddles/data.js',
  './tools/riddles/strings.es.js',
  './tools/riddles/strings.en.js',
  './tools/riddles/styles.css',
  './tools/roman-numerals/index.html',
  './tools/roman-numerals/app.js',
  './tools/roman-numerals/data.js',
  './tools/roman-numerals/strings.es.js',
  './tools/roman-numerals/strings.en.js',
  './tools/roman-numerals/styles.css',
  './tools/stories/index.html',
  './tools/stories/app.js',
  './tools/stories/data.js',
  './tools/stories/strings.es.js',
  './tools/stories/strings.en.js',
  './tools/stories/styles.css',
  './tools/wallet/index.html',
  './tools/wallet/app.js',
  './tools/wallet/data.js',
  './tools/wallet/strings.es.js',
  './tools/wallet/strings.en.js',
  './tools/wallet/styles.css'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      /* cache: 'reload' avoids storing stale copies from the browser's HTTP cache */
      var requests = ARCHIVOS.map(function (a) {
        return new Request(a, { cache: 'reload' });
      });
      return cache.addAll(requests);
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
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) return response;
      return fetch(event.request).then(function (r) {
        /* Also cache new same-origin resources — but never cache a
           redirect. Safari (and the Fetch spec) rejects a top-level
           navigation served by the SW that carries a Location header
           ("Response served by service worker has redirections"), so we
           follow the redirect and cache only the final 200. */
        if (r.status === 200) {
          var copia = r.clone();
          caches.open(VERSION).then(function (cache) {
            cache.put(event.request, copia);
          });
        }
        return r;
      }).catch(function () {
        /* Offline / network failure: don't serve site/index.html here,
           its relative paths only resolve correctly under /site/. Reply
           with a tiny inline HTML that stays at the current URL. */
        return new Response(
          '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
          '<meta name="viewport" content="width=device-width,initial-scale=1">' +
          '<title>Sin conexión</title><style>body{font-family:system-ui,sans-serif;' +
          'margin:2rem auto;max-width:32rem;padding:0 1rem;line-height:1.5}' +
          'a{color:#1d4ed8}</style></head><body>' +
          '<h1>Sin conexión</h1>' +
          '<p>No hemos podido cargar esta página. Comprueba tu conexión a ' +
          'Internet y vuelve a intentarlo.</p>' +
          '<p><a href="./site/index.html">Volver a la portada</a></p>' +
          '</body></html>',
          { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      });
    })
  );
});
