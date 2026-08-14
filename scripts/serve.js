// Static file server for local development.
// Used because npx is blocked by the host's PowerShell execution policy.
// Maps URL paths to repo files the way the production Cloudflare worker does:
//   /                       -> site/index.html
//   /styles.css, /app.js,
//   /strings.<locale>.js,
//   /sw.js, /manifest.json   -> repo root when no referer folder matches
//   /assets/...             -> assets/...
//   /tools/<slug>/...       -> tools/<slug>/...
//   /settings/...           -> settings/...
//   /legal/...              -> legal/...
//
// For relative paths (no leading slash, or with `..`), resolve against the
// referer's directory. This makes "../assets/..." from /tools/numbers/index.html
// work, and bare "strings.es.js" from /site/index.html also work (since we
// synthesize a referer of "/" -> site/).

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3000);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.map':  'application/json; charset=utf-8',
};

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, headers);
  res.end(body);
};

const tryFile = (p) => {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch (_) {
    return false;
  }
};

// Decide which folder of the repo a bare pathname (no leading slash or with
// `..`) was authored from, based on the referer URL.
const refererDir = (referer) => {
  if (!referer) return path.join(ROOT, 'site'); // landing page => site/
  try {
    const refUrl = new URL(referer);
    const refPath = decodeURIComponent(refUrl.pathname || '/');
    if (refPath === '/' || refPath === '') return path.join(ROOT, 'site');
    const refFile = path.resolve(ROOT, '.' + refPath);
    return path.dirname(refFile);
  } catch (_) {
    return path.join(ROOT, 'site');
  }
};

const resolveCandidates = (pathname, referer) => {
  if (pathname === '/' || pathname === '') {
    return [path.join(ROOT, 'site', 'index.html')];
  }

  const list = [];
  const dir = refererDir(referer);

  if (pathname.startsWith('..') || pathname.includes('..')) {
    // Resolve `..` segments relative to the referer's folder.
    list.push(path.resolve(dir, pathname));
    list.push(path.join(ROOT, pathname));
  } else {
    // Bare paths like "strings.es.js" or "styles.css": prepend the referer's
    // folder without `path.resolve` (which would treat the leading slash as
    // an absolute path on Windows).
    const stripped = pathname.replace(/^\/+/, '');
    list.push(path.join(dir, stripped));
    list.push(path.join(ROOT, pathname));
  }

  // SPA fallback for extensionless paths
  if (!path.extname(pathname)) list.push(path.join(ROOT, 'site', 'index.html'));

  return list;
};

const serveFile = (filePath, res) => {
  fs.readFile(filePath, (e, data) => {
    if (e) return send(res, 404, 'Not found');
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
  });
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const pathname = decodeURIComponent(parsed.pathname || '/');
  const referer = req.headers.referer;

  for (const candidate of resolveCandidates(pathname, referer)) {
    if (tryFile(candidate)) return serveFile(candidate, res);
  }

  return serveFile(path.join(ROOT, 'site', 'index.html'), res);
});

server.listen(PORT, () => {
  console.log(`Calculia running at http://localhost:${PORT}/`);
});
