/* ============================================================
   One-off probe: tools/trigonometry/ really works in a browser.

   scripts/check.js only proves the layout is well-formed. This drives
   every activity and every level, and checks the one thing the whole
   activity rests on: that the side drawn heavier in the correct option
   really is the side the question asks for. That invariant is claimed
   in app.js ("nothing that can be worked out is stored") and here it is
   measured off the rendered SVG, not trusted.

   Run: node scripts/one-off/probe-trigonometria.js
   ============================================================ */
'use strict';

const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const PORT = 3171;
const BASE = 'http://127.0.0.1:' + PORT;

const failures = [];
function check(cond, label, detail) {
  if (cond) return true;
  failures.push(label + (detail ? ' — ' + detail : ''));
  return false;
}

/* Plain static server, same shape as scripts/ui-smoke.js: the pathname is
   resolved directly against the repo root. scripts/serve.js is NOT used
   here on purpose — it resolves relative paths against the referer, which
   re-anchors "../../assets/..." one level too low and makes every
   activity (geometry included) look broken locally. */
function startServer() {
  const http = require('http');
  const fs = require('fs');
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let pathname;
      try { pathname = decodeURIComponent((req.url || '/').split('?')[0]); }
      catch { res.writeHead(400); res.end('Bad request'); return; }
      let filePath = path.resolve(ROOT, pathname.replace(/^\/+/, '') || 'index.html');
      if (pathname === '/') filePath = path.join(ROOT, 'index.html');
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<!DOCTYPE html><p>404');
        return;
      }
      const ext = path.extname(filePath);
      const type = ext === '.js' ? 'text/javascript; charset=utf-8'
        : ext === '.css' ? 'text/css; charset=utf-8'
        : ext === '.html' ? 'text/html; charset=utf-8'
        : 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

/* Reads the three sides out of one option's rendered SVG. Returns
   {marked, lengths} where `marked` is the index of the line carrying
   the is-marked class, and `lengths` are the three side lengths in
   pixels as drawn. */
async function readOption(page, index) {
  return page.evaluate(function (i) {
    var btn = document.querySelectorAll('#options .option-btn')[i];
    if (!btn) return null;
    var lines = btn.querySelectorAll('line.tri-side');
    if (!lines.length) return { kind: 'text', text: btn.innerText.trim() };
    var lengths = [], marked = -1;
    lines.forEach(function (l, idx) {
      var x1 = parseFloat(l.getAttribute('x1')), y1 = parseFloat(l.getAttribute('y1'));
      var x2 = parseFloat(l.getAttribute('x2')), y2 = parseFloat(l.getAttribute('y2'));
      lengths.push(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
      if (l.classList.contains('is-marked')) marked = idx;
    });
    return { kind: 'tri', marked: marked, lengths: lengths };
  }, index);
}

async function main() {
  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  const badResponses = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  page.on('response', (r) => {
    if (r.status() >= 400) badResponses.push(r.status() + ' ' + r.url());
  });

  await page.goto(BASE + '/tools/trigonometry/', { waitUntil: 'networkidle' });

  /* ---- Menu ---- */
  const menuButtons = await page.locator('.btn-actividad').count();
  check(menuButtons === 3, 'el menú ofrece 3 actividades', 'encontradas ' + menuButtons);

  /* Every visible string must be a real sentence, never a raw i18n key.
     A `t()` that returns the key is the symptom of a missing string and
     a green structure gate will not catch it. */
  const rawKeys = await page.evaluate(function () {
    var out = [];
    document.querySelectorAll('body *').forEach(function (n) {
      if (n.children.length === 0 && /^[a-z]+(\.[A-Za-z]+)+$/.test(n.textContent.trim())) {
        out.push(n.textContent.trim());
      }
    });
    return out;
  });
  check(rawKeys.length === 0, 'no se muestra ninguna clave i18n en crudo', rawKeys.join(', '));

  const activities = await page.locator('.btn-actividad .detail-card').allTextContents();

  /* How many levels each activity has, read from the page's own data.js
     rather than hardcoded here, so adding a level cannot quietly fall
     out of this probe's coverage. */
  const levelCounts = await page.evaluate(function () {
    var out = {};
    Object.keys(DATA.activities).forEach(function (k) {
      out[k] = DATA.activities[k].levels.length;
    });
    return out;
  });
  const activityIds = Object.keys(levelCounts);

  /* ---- Every activity, EVERY level ----
     The level only rises when a round is FINISHED, so an earlier version
     of this probe that just played questions never left level 1 and
     silently covered 3 of the 8 levels. Seeding the finished-round
     counter is how a person reaches the later ones. ---- */
  for (let a = 0; a < activityIds.length; a++) {
    const actId = activityIds[a];
    const nLevels = levelCounts[actId];

    for (let lv = 0; lv < nLevels; lv++) {
      await page.evaluate(function (arg) {
        localStorage.setItem('calculia:' + arg.id,
          JSON.stringify({ stars: 0, completedRounds: arg.n }));
      }, { id: 'trigonometry', n: lv });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#screenMenu:not(.hidden)');
      await page.locator('.btn-actividad').nth(a).click();
      await page.waitForSelector('#screenGame:not(.hidden)');

      const where = actId + ' nivel ' + (lv + 1) + '/' + nLevels;
      process.stdout.write('  ' + where + ' ... ');

      for (let round = 0; round < 2; round++) {
      const n = await page.locator('#options .option-btn').count();
      /* Two or three, never one and never more: the Sí/No judgement level
         offers two on purpose, and SPEC §3.5 caps a screen at 4-6. */
      check(n === 2 || n === 3, where + ' ofrece 2 o 3 respuestas', 'encontradas ' + n);
      let hypoCandidate = -1;

      /* The invariant, measured off the drawing.
         `isHypotenuse` is read from the page's own i18n table, so the
         probe knows which question it is looking at without hardcoding a
         translated sentence. Only the hypotenuse level may point at the
         longest side; the other two point wherever the marked arc is. */
      const isHyp = await page.evaluate(function () {
        return document.getElementById('prompt').textContent.trim() ===
          App.i18n.t('gen.whichHypotenuse');
      });

      /* Only the three "which side" levels mark a side on each option.
         `whichSameReason` also draws triangles, but as plain unmarked
         ones to be compared, so demanding a marked side there would be
         the probe inventing a rule the activity never had. Asked from
         the page's own strings, not hardcoded. */
      const marksSides = await page.evaluate(function () {
        var p = document.getElementById('prompt').textContent.trim();
        return p === App.i18n.t('gen.whichHypotenuse') ||
          p.indexOf(App.i18n.t('gen.whichOpposite').split('{where}')[0]) === 0 ||
          p.indexOf(App.i18n.t('gen.whichAdjacent').split('{where}')[0]) === 0;
      });

      const opts = [];
      for (let i = 0; i < n; i++) opts.push(await readOption(page, i));

      const tri = opts.filter(function (o) { return o && o.kind === 'tri'; });
      if (marksSides && tri.length === n && n === 3) {
        /* every option marks exactly one side */
        tri.forEach(function (o, i) {
          check(o.marked >= 0, where + ': cada opción marca un lado', 'opción ' + i);
        });
        /* and the three options must mark three DIFFERENT sides, else two
           options are the same picture */
        const marks = tri.map(function (o) { return o.marked; }).sort().join(',');
        check(marks === '0,1,2', where + ': las tres opciones marcan lados distintos', 'marcas ' + marks);

        if (isHyp) {
          /* Exactly one option may mark the longest line of its own
             drawing, and that must be the one the app accepts. This is
             the check that makes the gate worth having: pointing
             `correct` at the wrong side still passes every structural
             gate in the repo, and only this catches it. */
          const longestMarked = tri
            .map(function (o, i) {
              return o.marked >= 0 && o.lengths[o.marked] >= Math.max.apply(null, o.lengths)
                ? i : -1;
            })
            .filter(function (i) { return i !== -1; });
          check(longestMarked.length === 1,
            where + ': solo una opción marca el lado más largo',
            'marcan el más largo: ' + longestMarked.join(','));
          hypoCandidate = longestMarked.length === 1 ? longestMarked[0] : -1;
        }
      }

      /* Nothing the person reads may still carry a "{name}" placeholder.
     A missing .replace() on a prompt is invisible to every structural
     gate: the key IS registered, the string IS translated, and the
     layout is fine — the page just says "sube {up} por cada {along}".
     This is the cheapest check in the file and it caught one. */
      const placeholders = await page.evaluate(function () {
        var out = [];
        ['#prompt', '#legend', '#options', '#visual'].forEach(function (sel) {
          var n = document.querySelector(sel);
          if (!n) return;
          var m = n.textContent.match(/\{[a-z]+\}/gi);
          if (m) out.push(sel + ' -> ' + Array.from(new Set(m)).join(' '));
        });
        return out;
      });
      check(placeholders.length === 0,
        where + ': ningún texto visible conserva un {placeholder}', placeholders.join(' | '));

      /* ---- Answer: try each option until one advances. The point is
         that exactly one of them does.
         A wrong answer is NOT an error state to push through: the app
         deliberately locks the remaining options until the reading pause
         ("Entendido") is acknowledged, so the probe has to acknowledge it
         too. Skipping that made this probe report a red that was really
         the feature working. ---- */
      let advanced = 0;
      let accepted = -1;
      for (let i = 0; i < n; i++) {
        let btn = page.locator('#options .option-btn').nth(i);
        if (await btn.isDisabled()) continue;
        await btn.click();
        if (await page.locator('#btnNext').isVisible()) {
          advanced += 1;
          accepted = i;
          await page.locator('#btnNext').click();
          break;
        }
        /* wrong answer: the hint appears and the options lock */
        check(await page.locator('#explanationWrap').isVisible(),
          where + ': fallar enseña una pista', '');
        const ack = page.locator('#explanationWrap .btn-understood');
        if (await ack.count()) {
          await ack.click();
          await page.waitForTimeout(40);
        }
        btn = page.locator('#options .option-btn').nth(i);
        check(await btn.isDisabled(),
          where + ': la respuesta fallada queda bloqueada', '');
      }
      check(advanced === 1, where + ': una sola respuesta avanza la ronda', '');

      /* The answer the app accepts and the longest side the drawing marks
         have to be the same option. */
      if (isHyp && hypoCandidate >= 0) {
        check(accepted === hypoCandidate,
          where + ': la hipotenusa aceptada es el lado más largo del dibujo',
          'acepta la ' + (accepted + 1) + ' y el más largo es la ' + (hypoCandidate + 1));
      }

      await page.waitForTimeout(60);
      }
      process.stdout.write('ok\n');
    }
  }

  check(consoleErrors.length === 0, 'sin errores de consola', consoleErrors.slice(0, 3).join(' | '));
  check(badResponses.length === 0, 'sin respuestas 4xx/5xx', badResponses.slice(0, 5).join(' | '));

  await browser.close();
  server.close();

  console.log('actividades: ' + activities.join(' / '));
  if (failures.length) {
    console.log('\nFALLOS (' + failures.length + '):');
    failures.forEach(function (f) { console.log('  - ' + f); });
    process.exitCode = 1;
  } else {
    console.log('OK — todos los niveles cargan, responden y guardan una única correcta.');
  }
}

main().catch(function (e) { console.error(e); process.exitCode = 1; });