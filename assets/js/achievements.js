/* ==========================================================================
   Calculia — Achievements ("logros")
   Exposes window.App.achievements.list / .unlocked() / .achieve(id) /
   .sync() / .render(container).
   Load AFTER storage.js (and feedback.js on activity pages).

   Storage (both keys are listed in storage.js NON_TOOL_KEYS, so they
   never count as an activity; /config/ "reset the whole app" deletes
   them explicitly):
     'calculia:achievements' → { <id>: <timestamp of first unlock> }
     'calculia:streak'       → { lastDay: 'YYYY-MM-DD', days: <n> }

   How achievements unlock:
     - Derived from saved progress (stars, rounds, Roman levels): sync()
       re-reads every activity and unlocks what is already earned. It runs
       on every page that loads this file, so people who played before
       achievements existed get them the first time they open the app.
     - Live events: storage.js fires 'calculia:progress' on each activity
       save ({ toolId, before, after }) and feedback.js fires
       'calculia:mistake' on each wrong answer. The day streak and the
       perfect round need those events; they cannot be rebuilt from the
       saved progress, so they only count from now on.

   Texts come from App.i18n (achievement<Name>, achievement<Name>Desc,
   achievementLocked, achievementUnlockedAt) and are registered by the
   page that shows the badges (about-app/).
   ========================================================================== */
(function () {
  'use strict';

  window.App = window.App || {};

  var UNLOCKED_KEY = 'achievements';
  var STREAK_KEY = 'streak';

  /* Mirrors the level ids of tools/roman-numerals/data.js (DATA.levels:
     the five base sub-levels plus the mixed test). Keep in sync if the
     levels change. */
  var ROMAN_TOOL = 'roman-numerals';
  var ROMAN_LEVELS = ['level1', 'level2', 'level3', 'level4', 'level5', 'test'];

  var LIST = [
    { id: 'firstStar',    icon: '⭐', key: 'achievementFirstStar' },
    { id: 'tenStars',     icon: '🌟', key: 'achievementTenStars' },
    { id: 'streak3',      icon: '🔥', key: 'achievementStreak3' },
    { id: 'allLevels',    icon: '🏛️', key: 'achievementAllLevels' },
    { id: 'tenRounds',    icon: '🧮', key: 'achievementTenRounds' },
    { id: 'perfectRound', icon: '💯', key: 'achievementPerfectRound' }
  ];

  /** Unlocked achievements as { id: timestamp }. */
  function unlocked() {
    var data = App.storage.get(UNLOCKED_KEY);
    return (data && typeof data === 'object') ? data : {};
  }

  /** Unlocks `id` once. Idempotent: the first unlock date is kept. */
  function achieve(id) {
    var data = unlocked();
    if (data[id]) return false;
    data[id] = Date.now();
    App.storage.set(UNLOCKED_KEY, data);
    return true;
  }

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

  /** Unlocks everything that the saved progress already proves. */
  function sync() {
    var stars = App.storage.totalStars();
    var rounds = 0;
    App.storage.toolIds().forEach(function (id) {
      rounds += roundsOf(App.storage.get(id));
    });
    if (stars >= 1) achieve('firstStar');
    if (stars >= 10) achieve('tenStars');
    if (rounds >= 10) achieve('tenRounds');
    var roman = App.storage.get(ROMAN_TOOL).completed || {};
    if (ROMAN_LEVELS.every(function (id) { return roman[id]; })) achieve('allLevels');
  }

  /* ---------- Day streak ---------- */
  function dayString(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  /* Called when a star is earned: counts consecutive days with play. */
  function markPracticeDay() {
    var today = dayString(new Date());
    var streak = App.storage.get(STREAK_KEY);
    if (streak.lastDay === today) return;
    var y = new Date();
    y.setDate(y.getDate() - 1);
    var days = (streak.lastDay === dayString(y) && typeof streak.days === 'number') ? streak.days + 1 : 1;
    App.storage.set(STREAK_KEY, { lastDay: today, days: days });
    if (days >= 3) achieve('streak3');
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
    if (gained > 0) {
      roundStars += gained;
      markPracticeDay();
    }
    if (finished > 0) {
      if (roundStars > 0 && roundMistakes === 0) achieve('perfectRound');
      roundStars = 0;
      roundMistakes = 0;
    }
    sync();
  });

  /* ---------- Badge grid (about-app/) ---------- */
  function span(className, text) {
    var el = document.createElement('span');
    el.className = className;
    el.textContent = text;
    return el;
  }

  /** Draws one badge per achievement inside `container`. */
  function render(container) {
    if (!container) return;
    var t = App.i18n.t;
    var done = unlocked();
    container.innerHTML = '';
    LIST.forEach(function (a) {
      var isUnlocked = !!done[a.id];
      var item = document.createElement('li');
      item.className = 'achievement-badge ' + (isUnlocked ? 'unlocked' : 'locked');
      var icon = span('achievement-badge-icon', a.icon);
      icon.setAttribute('aria-hidden', 'true');
      item.appendChild(icon);
      item.appendChild(span('achievement-badge-name', t(a.key)));
      item.appendChild(span('achievement-badge-desc', t(a.key + 'Desc')));
      item.appendChild(span('achievement-badge-status', isUnlocked
        ? t('achievementUnlockedAt').replace('{date}', new Date(done[a.id]).toLocaleDateString(App.i18n.lang()))
        : t('achievementLocked')));
      container.appendChild(item);
    });
  }

  window.App.achievements = {
    list: LIST,
    unlocked: unlocked,
    achieve: achieve,
    sync: sync,
    render: render
  };

  /* Retroactive credit from progress saved before this page loaded. */
  try { sync(); } catch (e) { /* never block the page over a badge */ }
})();
