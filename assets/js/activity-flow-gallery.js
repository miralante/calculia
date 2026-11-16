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
    /* No end screen: the achievement screen (celebrate.js) closes the activity on its last slide. */
    App.feedback.celebrate(t('core.roundComplete'), null, App.feedback.starsGoal(progress.stars));
  }

  App.activityFlow.modes.gallery = {
    screens: function () {
      return ['#screenIntro'];
    },

    markup: function () {
      return '';
    },

    /* The last slide carries the button that ends the activity; the others carry the arrows only. */
    paintIntro: function (ctx) {
      var last = ctx.state.intro === ctx.config.intro.length - 1;
      var button = $('#introContinue');
      button.textContent = t(ctx.config.finishKey || 'ui.finish');
      button.className = 'btn';
      button.classList.toggle('hidden', !last);
    },

    bind: function () {
    },

    /* The slides are the whole activity: their button finishes it. */
    introContinue: function (ctx) {
      finish(ctx);
      return true;
    }
  };
})();
