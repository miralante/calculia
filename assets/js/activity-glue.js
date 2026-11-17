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
                  read by the activity's own code
   }
   The "A por más" button of the achievement screen reloads the page: that is the
   entry point of the activity (see navigation-flow.md).

   endRound(options) takes what differs between activities, all optional:
     celebrateKey: the congratulation (default 'core.roundComplete').
   There is no end-of-round screen: the achievement screen closes the round.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;

  /* A screen switch: shows the screen it is given and hides the others of the list.
     The activities call it as App.screenSwitch([screens])(screen). */
  App.screenSwitch = function (screens) {
    return function (screen) {
      screens.forEach(function (p) { p.classList.toggle('hidden', p !== screen); });
    };
  };

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

    // Closes a round: counts it, saves, and shows the achievement screen
    // (celebrate.js): the congratulation, "Ya tienes X · A por las Y" and
    // "A por más". That returns the person to the entry point of the activity:
    // reloading the page shows its first screen, and the progress is saved.
    function endRound(options) {
      var opts = options || {};
      var progress = host.progress();
      progress.completedRounds = (progress.completedRounds || 0) + 1;
      save();
      App.feedback.celebrate(
        App.i18n.t(opts.celebrateKey || 'core.roundComplete'),
        function () { window.location.reload(); },
        App.feedback.starsGoal(progress.stars)
      );
    }

    return {
      save: save,
      paintStars: paintStars,
      levelFromProgress: levelFromProgress,
      endRound: endRound
    };
  };
})();
