/* ==========================================================================
   Calculia — achievements catalogue ("logros").

   The policy is the suite's (apptonomia/doc/es/spec.md §2.6): milestones
   computed from saved progress, no streaks, no timers, no losses. Shown once
   as a neutral notice when the round that earns them is finished. Never on the
   "About the app" page. The mechanism lives in ./achievements-engine.js
   (identical in every app); this file holds Calculia's rules and texts.

   Storage: 'calculia:achievements' → { <id>: <timestamp of first unlock> }
   (listed in storage.js NON_TOOL_KEYS, so it never counts as an activity;
   /config/ "reset the whole app" deletes it).

   Public API (window.App.achievements):
     list                   the catalogue
     unlocked()             { id: timestamp }
     sync()                 check every rule against the saved progress now;
                            saves the new ones silently; returns their ids

   How achievements unlock:
     - sync() runs on every page that loads this file, so people who played
       before achievements existed get them the first time they open the app,
       with no announcement.
     - When a round finishes ('calculia:progress' with a finished round), the
       new ones are announced once in #achievement-notice. A round finished
       with no mistake counts as a perfect round; the mistake count comes from
       'calculia:mistake' events fired by feedback.js.

   Texts are registered here because every activity page loads this file.
   ========================================================================== */
(function () {
  'use strict';

  window.App = window.App || {};

  /* Mirrors the level ids of tools/roman-numerals/data.js (DATA.levels:
     the five base sub-levels plus the mixed test). Keep in sync if the
     levels change. */
  var ROMAN_TOOL = 'roman-numerals';
  var ROMAN_LEVELS = ['level1', 'level2', 'level3', 'level4', 'level5', 'test'];

  App.i18n.register({
    achievementNew: 'Nuevo logro: {name}',
    achievementFirstStar: 'Primera estrella',
    achievementFirstStarDesc: 'Consigue tu primera estrella.',
    achievementTenStars: 'Diez estrellas',
    achievementTenStarsDesc: 'Consigue diez estrellas en total.',
    achievementAllLevels: 'Todos los niveles',
    achievementAllLevelsDesc: 'Termina todos los niveles de Números Romanos.',
    achievementTenRounds: 'Diez rondas',
    achievementTenRoundsDesc: 'Termina diez rondas.',
    achievementPerfectRound: 'Ronda perfecta',
    achievementPerfectRoundDesc: 'Termina una ronda sin ningún fallo.'
  }, 'es');

  App.i18n.register({
    achievementNew: 'New achievement: {name}',
    achievementFirstStar: 'First star',
    achievementFirstStarDesc: 'Get your first star.',
    achievementTenStars: 'Ten stars',
    achievementTenStarsDesc: 'Get ten stars in total.',
    achievementAllLevels: 'All levels',
    achievementAllLevelsDesc: 'Finish all the levels of Roman Numerals.',
    achievementTenRounds: 'Ten rounds',
    achievementTenRoundsDesc: 'Finish ten rounds.',
    achievementPerfectRound: 'Perfect round',
    achievementPerfectRoundDesc: 'Finish a round without a single mistake.'
  }, 'en');

  /* Rounds finished in one activity's saved progress. Most activities
     count them in completedRounds; Roman Numerals counts them per level
     in completed { levelId: n }. */
  function roundsOf(data) {
    var total = (data && typeof data.completedRounds === 'number') ? data.completedRounds : 0;
    var done = data && data.completed;
    if (done && typeof done === 'object') {
      Object.keys(done).forEach(function (k) {
        if (typeof done[k] === 'number') total += done[k];
      });
    }
    return total;
  }

  function starsOf(data) {
    return (data && typeof data.stars === 'number') ? data.stars : 0;
  }

  var CATALOG = [
    { id: 'firstStar', icon: '⭐', nameKey: 'achievementFirstStar', descKey: 'achievementFirstStarDesc',
      test: function (p) { return p.stars >= 1; } },
    { id: 'tenStars', icon: '🌟', nameKey: 'achievementTenStars', descKey: 'achievementTenStarsDesc',
      test: function (p) { return p.stars >= 10; } },
    { id: 'tenRounds', icon: '🧮', nameKey: 'achievementTenRounds', descKey: 'achievementTenRoundsDesc',
      test: function (p) { return p.rounds >= 10; } },
    { id: 'allLevels', icon: '🏛️', nameKey: 'achievementAllLevels', descKey: 'achievementAllLevelsDesc',
      test: function (p) { return ROMAN_LEVELS.every(function (id) { return p.roman[id]; }); } },
    { id: 'perfectRound', icon: '💯', nameKey: 'achievementPerfectRound', descKey: 'achievementPerfectRoundDesc',
      test: function (p) { return p.perfect === true; } }
  ];

  var board = window.ApptonomiaAchievements.create({
    storageKey: 'calculia:achievements',
    catalog: CATALOG,
    t: function (key) { return App.i18n.t(key); }
  });

  /** Snapshot of the saved progress. `extra.perfect` is set only by the
      round-finished event, because a perfect round cannot be rebuilt later. */
  function snapshot(extra) {
    var rounds = 0;
    App.storage.toolIds().forEach(function (id) {
      rounds += roundsOf(App.storage.get(id));
    });
    return {
      stars: App.storage.totalStars(),
      rounds: rounds,
      roman: App.storage.get(ROMAN_TOOL).completed || {},
      perfect: !!(extra && extra.perfect)
    };
  }

  function sync(extra) {
    return board.evaluate(snapshot(extra));
  }

  /** Neutral notice shown once when a round finishes. The element is created
      on first use so every activity page works without markup of its own. */
  function announce(ids) {
    if (!ids || !ids.length) return;
    var el = document.getElementById('achievement-notice');
    if (!el) {
      el = document.createElement('p');
      el.id = 'achievement-notice';
      el.className = 'achievement-notice';
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    board.notify(el, ids);
  }

  /* ---------- Live events (activity pages) ---------- */
  /* Stars and mistakes since the last finished round on this page. */
  var roundStars = 0;
  var roundMistakes = 0;

  document.addEventListener('calculia:mistake', function () {
    roundMistakes += 1;
  });

  document.addEventListener('calculia:progress', function (e) {
    var detail = e.detail || {};
    var gained = starsOf(detail.after) - starsOf(detail.before);
    var finished = roundsOf(detail.after) - roundsOf(detail.before);
    if (gained > 0) roundStars += gained;
    if (finished > 0) {
      var perfect = roundStars > 0 && roundMistakes === 0;
      roundStars = 0;
      roundMistakes = 0;
      announce(sync({ perfect: perfect }));
    } else {
      announce(sync());
    }
  });

  window.App.achievements = {
    list: CATALOG,
    unlocked: board.unlocked,
    sync: sync
  };

  /* Retroactive credit from progress saved before this page loaded: silent. */
  try { announce(sync()); } catch (err) { /* never block the page over a badge */ }
})();
