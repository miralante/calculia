'use strict';
/* Checks: every App.backStep (in a tool's app.js or in the shared activity-*.js templates)
   steps back to the activity's menu (screenMenu / openMenu). The header "← Volver" uses it
   from inside an activity and falls back to the hub (the link's href) from the menu.
   Runs with the shared context of scripts/check.js. */
module.exports = function (ctx) {
  var fs = ctx.fs, path = ctx.path, ROOT = ctx.ROOT;
  var failures = ctx.failures, rel = ctx.rel;

  function scan(file) {
    ctx.checks += 1;
    var src = fs.readFileSync(file, 'utf8');
    /* A step-back must go to a menu of the activity (screenMenu, the template's openMenu, the
       practice list of math-tables: screenTables), never into a screen of the activity itself. */
    if (/App\.backStep\s*=/.test(src) && !/screenMenu|screenTables|openMenu|menuBack/.test(src)) {
      failures.push(rel(file) + ': App.backStep debe volver al menú de la actividad (screenMenu / openMenu)');
    }
  }

  var toolsDir = path.join(ROOT, 'tools');
  fs.readdirSync(toolsDir, { withFileTypes: true }).forEach(function (entry) {
    if (!entry.isDirectory()) return;
    var appJs = path.join(toolsDir, entry.name, 'app.js');
    if (fs.existsSync(appJs)) scan(appJs);
  });

  /* The shared templates run activities too: a step-back defined there would reach every
     activity built on them. */
  var sharedDir = path.join(ROOT, 'assets', 'js');
  fs.readdirSync(sharedDir).forEach(function (name) {
    if (/^activity-.*\.js$/.test(name)) scan(path.join(sharedDir, name));
  });
};
