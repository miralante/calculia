/* ============================================================
   Calculia — Three-stage activity flow: the 'gallery' mode.

   A set of slides only, with no test: one card at a time, with ← and →. On the
   last slide the button of the activity (config.finishKey) ends it. The closing
   screen gives one star the first time in the page (as a round gives one), and
   one button back to the start.

   Options of the activity, besides the core ones (see activity-flow.js):
     finishKey       i18n key of the button of the last slide (optional; default ui.finish)
     endSummaryKey   i18n key of the closing summary, with {stars} (optional; default ui.galleryEnd)
     endNotes        [{ key, cls }] i18n texts shown on the closing screen before its button (optional)
     backHref        where the closing button goes (optional; default the landing)

   Texts: ui.finish, ui.galleryEnd, core.roundComplete, btnMenu.

   Exposes window.App.activityFlow.modes.gallery.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;
  var fill = App.utils.fill;

  function t(key) { return App.i18n.t(key); }

  /* The activity is over: one star for the page (not for every return to the closing screen). */
  function finish(ctx) {
    var s = ctx.mode_state;
    var progress = ctx.progress;
    if (!s.awarded) {
      progress.stars += 1;
      progress.completedRounds = (progress.completedRounds || 0) + 1;
      s.awarded = true;
      ctx.save();
    }
    ctx.paintStars();
    $('#endSummary').textContent = fill(t(ctx.config.endSummaryKey || 'ui.galleryEnd'), { stars: progress.stars });
    ctx.show('#screenEnd');
    if (App.feedback && App.feedback.celebrate) App.feedback.celebrate(t('core.roundComplete'));
  }

  App.activityFlow.modes.gallery = {
    screens: function () {
      return ['#screenIntro', '#screenEnd'];
    },

    /* The closing screen: a summary, the texts the activity asks for, and one button. */
    markup: function (ctx) {
      var notes = (ctx.config.endNotes || []).map(function (note) {
        return '  <p class="' + note.cls + '" data-i18n="' + note.key + '"></p>';
      });
      return [
        '<section id="screenEnd" class="hidden stack centered" aria-live="polite">',
        '  <div class="emoji-large" aria-hidden="true">🎉</div>',
        '  <h2 data-i18n="core.roundComplete">¡Ronda completada!</h2>',
        '  <p id="endSummary"></p>'
      ].concat(notes, [
        '  <button type="button" class="btn" id="endBackToStart" data-i18n="btnMenu">Volver al inicio</button>',
        '</section>'
      ]).join('\n');
    },

    /* The last slide carries the button that ends the activity; the others carry the arrows only. */
    paintIntro: function (ctx) {
      var last = ctx.state.intro === ctx.config.intro.length - 1;
      var button = $('#introContinue');
      button.textContent = t(ctx.config.finishKey || 'ui.finish');
      button.className = 'btn';
      button.classList.toggle('hidden', !last);
    },

    bind: function (ctx) {
      $('#endBackToStart').addEventListener('click', function () {
        location.href = ctx.config.backHref || '../../';
      });
    },

    /* The slides are the whole activity: their button finishes it. */
    introContinue: function (ctx) {
      finish(ctx);
      return true;
    }
  };
})();
