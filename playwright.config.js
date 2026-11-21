// playwright.config.js — the Playwright runner of Calculia.
//
// The suite shares one Playwright installation (CLAUDE.md, "Shared
// Playwright installation"): there is no project dependency to import, so
// the config loads the same copy as the specs (tests/playwright.js) and the
// runner and the tests can never end up with two different versions.
//
// The web server is the canonical one of the suite (scripts/serve.js): it
// mimics the Cloudflare static assets, sends the CSP of _headers and answers
// an unknown path with 404.html and the 404 status.
'use strict';

const { defineConfig } = require('./tests/playwright.js');

// 4175 is Calculia's own port: every app of the suite uses a different one,
// so two apps can be tested at the same time without fighting for the port.
const PORT = Number(process.env.PORT) || 4175;
const BASE_URL = `http://127.0.0.1:${PORT}/`;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  retries: 1,
  reporter: 'line',
  use: {
    baseURL: BASE_URL,
    headless: true,
  },
  webServer: {
    command: `node scripts/serve.js ${PORT}`,
    url: BASE_URL,
    timeout: 30000,
    reuseExistingServer: !process.env.CI,
  },
});
