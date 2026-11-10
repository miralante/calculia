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
     activity():  the current activity definition (needs .levels and .id);
                  only read when the summary names {activity}
     roundCorrect(): correct answers in the round that just ended,
     screenEnd(): the end-of-round screen element,
     show(el):    shows one screen and hides the others
   }

   endRound(options) takes what differs between activities, all optional:
     summaryKey:   the summary string (default 'endSummary'),
     celebrateKey: the title of the celebration (default 'core.roundComplete'),
     values:       more {placeholders} for the summary, { name: value }.
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

    // Closes a round: counts it, saves, shows the end screen with its summary.
    function endRound(options) {
      var opts = options || {};
      var progress = host.progress();
      progress.completedRounds = (progress.completedRounds || 0) + 1;
      save();
      host.show(host.screenEnd());
      var summaryEl = $('#endSummary');
      if (summaryEl) {
        var text = App.i18n.t(opts.summaryKey || 'endSummary');
        if (text.indexOf('{n}') !== -1) text = text.replace('{n}', host.roundCorrect()).replace('{nWord}', App.i18n.starsWord(host.roundCorrect()));
        text = text.replace('{stars}', progress.stars).replace('{starsWord}', App.i18n.starsWord(progress.stars));
        Object.keys(opts.values || {}).forEach(function (name) {
          text = text.replace('{' + name + '}', opts.values[name]);
        });
        if (text.indexOf('{activity}') !== -1) {
          text = text.replace('{activity}', App.i18n.t('activity.' + host.activity().id + '.name'));
        }
        App.feedback.paintReward(summaryEl, progress.stars, text);
      }
      App.feedback.celebrate(App.i18n.t(opts.celebrateKey || 'core.roundComplete'));
    }

    return {
      save: save,
      paintStars: paintStars,
      levelFromProgress: levelFromProgress,
      endRound: endRound
    };
  };
})();
