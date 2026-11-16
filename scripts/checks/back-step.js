'use strict';
/* Checks: a page whose activity has a step before its game (an activity menu, a start,
   intro, learn, tables or level screen) defines App.backStep in its app.js. The header
   "← Volver" then goes one step up on the page, and not straight to the hub. The shared
   suite-chrome.js calls App.backStep before it follows the link's href. Runs with the
   shared context of scripts/check.js. */
module.exports = function (ctx) {
  var fs = ctx.fs, path = ctx.path, ROOT = ctx.ROOT;
  var failures = ctx.failures, rel = ctx.rel;

  /* Screens that come before the game of an activity. A page with one of them has a
     level above the game, so its back link must step to that level. */
  var STEP_BEFORE_GAME = /<[a-z]+\b[^>]*\bid="(screenMenu|screenStart|screenPick|screenTables|screenIntro|screenLearn|screenLevels|screenGroupsIntro)"/;

  var toolsDir = path.join(ROOT, 'tools');
  fs.readdirSync(toolsDir, { withFileTypes: true }).forEach(function (entry) {
    if (!entry.isDirectory()) return;
    var dir = path.join(toolsDir, entry.name);
    var page = path.join(dir, 'index.html');
    if (!fs.existsSync(page)) return;
    if (!STEP_BEFORE_GAME.test(fs.readFileSync(page, 'utf8'))) return;
    ctx.checks += 1;
    var appJs = path.join(dir, 'app.js');
    var src = fs.existsSync(appJs) ? fs.readFileSync(appJs, 'utf8') : '';
    if (!/App\.backStep\s*=/.test(src)) {
      failures.push(rel(page) + ': tiene un paso anterior al juego pero su app.js no define App.backStep (el «← Volver» de la cabecera saltaría al hub)');
    }
  });
};
