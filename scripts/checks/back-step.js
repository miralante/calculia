'use strict';
/* Checks: no activity defines App.backStep in its app.js. The header "← Volver" always
   goes straight to the hub (the link's href), and never steps back inside the page. The
   shared suite-chrome.js only calls App.backStep when a page defines it, so a page that
   defines it would step inside instead of going to the hub. Runs with the shared context
   of scripts/check.js. */
module.exports = function (ctx) {
  var fs = ctx.fs, path = ctx.path, ROOT = ctx.ROOT;
  var failures = ctx.failures, rel = ctx.rel;

  var toolsDir = path.join(ROOT, 'tools');
  fs.readdirSync(toolsDir, { withFileTypes: true }).forEach(function (entry) {
    if (!entry.isDirectory()) return;
    var appJs = path.join(toolsDir, entry.name, 'app.js');
    if (!fs.existsSync(appJs)) return;
    ctx.checks += 1;
    var src = fs.readFileSync(appJs, 'utf8');
    if (/App\.backStep\s*=/.test(src)) {
      failures.push(rel(appJs) + ': define App.backStep; «← Volver» debe ir directo al hub (quítalo)');
    }
  });
};
