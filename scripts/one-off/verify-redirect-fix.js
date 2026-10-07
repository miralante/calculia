'use strict';
/* One-off verification: does the fix actually stop net::ERR_FAILED?
   The repo's own test servers serve "dir/index.html" directly and never
   emit the 307 that production emits for "/x/index.html". A gate run
   against them therefore CANNOT catch this class of bug, which is exactly
   why it reached production. This harness reproduces Cloudflare's
   behaviour faithfully, then walks the real site with the service worker
   enabled the way a phone does.

   Run: node scripts/one-off/verify-redirect-fix.js            (fails loudly if broken)
        node scripts/one-off/verify-redirect-fix.js --baseline (reintroduce the old
                                                              links in memory, to prove
                                                              the harness detects the bug) */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const BASELINE = process.argv.includes('--baseline');
const PORT = 8791;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon',
};

/* Serve the repo, but answer "/x/index.html" with the same 307 to "/x/"
   that Cloudflare Workers static assets returns. */
function serveRoot() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);

    if (pathname.endsWith('/index.html')) {
      res.writeHead(307, { Location: pathname.slice(0, -'index.html'.length) });
      res.end();
      return;
    }
    if (pathname.endsWith('/')) pathname += 'index.html';

    const filePath = path.join(ROOT, pathname.replace(/^\/+/, ''));
    if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* The baseline reproduces the pre-fix site in memory: every canonical
   ".../" link becomes the redirecting ".../index.html" form, so the
   harness must FAIL here and PASS on the real files. Same handler as
   serveRoot(), with the 307 pointed at the index.html form instead. */
function serveBaseline() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);

    /* Only the directory form redirects. "/index.html" is left alone,
       otherwise "/" -> "/index.html" -> "/" would loop forever. */
    if (pathname.endsWith('/')) {
      res.writeHead(307, { Location: pathname + 'index.html' });
      res.end();
      return;
    }
    const filePath = path.join(ROOT, pathname.replace(/^\/+/, ''));
    if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

async function crawl() {
  const base = `http://127.0.0.1:${PORT}`;
  const browser = await chromium.launch();
  const context = await browser.newContext({ ...devices['Pixel 7'], serviceWorkers: 'allow' });
  const page = await context.newPage();

  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 25000 });

  const swState = await page.evaluate(async () => {
    const keys = await caches.keys();
    const out = { keys, entries: {} };
    for (const k of keys) { out.entries[k] = (await (await caches.open(k)).keys()).length; }
    return out;
  });

  // Collect every same-origin link reachable from the pages we can reach.
  const seen = new Set(['/']);
  const queue = ['/'];
  const failures = [];
  const visited = new Set();

  while (queue.length) {
    const route = queue.shift();
    if (visited.has(route)) continue;
    visited.add(route);
    let resp;
    try {
      resp = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (err) {
      failures.push({ route, error: err.message.split('\n')[0] });
      continue;
    }
    if (!resp || !resp.ok()) { failures.push({ route, error: `status ${resp && resp.status()}` }); continue; }

    const links = await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href'))).catch(() => []);
    for (const href of links) {
      if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('#')) continue;
      let abs;
      try { abs = new URL(href, base + route); } catch { continue; }
      if (abs.origin !== base) continue;
      if (seen.has(abs.pathname)) continue;
      seen.add(abs.pathname);
      queue.push(abs.pathname);
    }
  }

  await browser.close();
  return { swState, visited: [...visited], failures };
}

(async () => {
  const server = (BASELINE ? serveBaseline() : serveRoot()).listen(PORT, '127.0.0.1');
  try {
    const { swState, visited, failures } = await crawl();
    console.log(`\n=== ${BASELINE ? 'BASELINE (old links, must FAIL)' : 'FIXED (canonical links)'} ===`);
    console.log(`cache: ${JSON.stringify(swState)}`);
    console.log(`routes visited: ${visited.length}`);
    console.log(`failures: ${failures.length}`);
    for (const f of failures) console.log(`  FAIL ${f.route}  ${f.error}`);

    if (BASELINE && failures.length === 0) {
      console.log('\nUNEXPECTED: baseline passed — the harness would not have caught the bug.');
      process.exitCode = 1;
    } else if (!BASELINE && failures.length > 0) {
      console.log('\nSTILL BROKEN.');
      process.exitCode = 1;
    } else {
      console.log(`\n${BASELINE ? 'harness detects the bug as expected' : 'all reachable routes load with the service worker active'}`);
    }
  } finally {
    server.close();
  }
})();