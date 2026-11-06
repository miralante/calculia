/* ============================================================
   Calculia — Activity glue: the progress and round helpers that the
   hand-rolled activities repeat in their own app.js.

   An activity asks for them with App.activityGlue(host) and keeps its
   own variables. The host gives getters, not values, because an activity
   may reassign its progress object (numbers does) or declare its screens
   after the glue line. Used by: save, paintStars, levelFromProgress and
   endRound. The activity keeps everything else.

   host: {
     toolId:      the storage key (TOOL_ID),
     progress():  the activity's progress object,
     starsEl():   the element that shows the star count,
     activity():  the current activity definition (needs .levels and .id),
     roundCorrect(): correct answers in the round that just ended,
     screenEnd(): the end-of-round screen element,
     show(el):    shows one screen and hides the others
   }
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;

  App.activityGlue = function (host) {
    function save() {
      App.storage.set(host.toolId, host.progress());
    }

    function paintStars() {
      host.starsEl().textContent = '⭐ ' + host.progress().stars;
    }

    // The level of the current activity, from the rounds completed so far.
    function levelFromProgress() {
      var levels = host.activity().levels;
      return levels[Math.min(host.progress().completedRounds || 0, levels.length - 1)];
    }

    // Closes a round: counts it, saves, shows the end screen with its summary.
    function endRound() {
      var progress = host.progress();
      progress.completedRounds = (progress.completedRounds || 0) + 1;
      save();
      host.show(host.screenEnd());
      var summaryEl = $('#endSummary');
      if (summaryEl) {
        summaryEl.textContent = App.i18n.t('endSummary')
          .replace('{n}', host.roundCorrect())
          .replace('{activity}', App.i18n.t('activity.' + host.activity().id + '.name'))
          .replace('{stars}', progress.stars);
      }
      App.feedback.celebrate(App.i18n.t('core.roundComplete'));
    }

    return {
      save: save,
      paintStars: paintStars,
      levelFromProgress: levelFromProgress,
      endRound: endRound
    };
  };
})();
