/* ==========================================================================
   Calculia — Shared utilities
   Exposes window.App.utils
   Load with: <script src="../../assets/js/utils.js"></script>
   ========================================================================== */
(function () {
  'use strict';

  window.App = window.App || {};

  /**
   * Shuffles a copy of the array (Fisher-Yates).
   * Never use sort(() => Math.random() - 0.5).
   */
  function shuffle(array) {
    var copy = array.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  /* State for drawRound: pools of un-handed-out elements, keyed by the
     string the activity passes. Each activity should pick a key that
     uniquely identifies the round (e.g. '<activity>:<level>:<slot>'),
     so two concurrent rounds of the same activity don't share state. */
  var drawPools = {};

  /**
   * Returns one element from `list` per call, with no repeats within
   * the same round. When the pool is empty, it is reshuffled; the first
   * element of the new pool is swapped with the second if it would be
   * identical to the last element handed out (two identical questions
   * in a row read as a "Siguiente" button that does nothing).
   *
   * The first argument is a string the activity uses to identify the
   * pool; pass a different one for each round so the bag is refilled.
   */
  function drawRound(key, list) {
    var pool = drawPools[key];
    if (!pool || pool.i >= pool.orden.length) {
      var fresh = shuffle(list);
      if (pool && fresh.length > 1 && fresh[0] === pool.last) {
        var swap = fresh[1];
        fresh[1] = fresh[0];
        fresh[0] = swap;
      }
      pool = drawPools[key] = {
        orden: fresh,
        i: 0,
        last: pool ? pool.last : null
      };
    }
    pool.last = pool.orden[pool.i];
    return pool.orden[pool.i++];
  }

  /**
   * Clears every pool tracked by drawRound. Activities call this at the
   * start of each round (or round + reinforce) so the bag is filled
   * fresh from the pool list, instead of carrying state from a previous
   * round.
   */
  function drawRoundReset() {
    drawPools = {};
  }

  /** True if `list` has two adjacent entries with the same keyFn. */
  function hasAdjacentRepeat(list, keyFn) {
    for (var i = 1; i < list.length; i++) {
      if (keyFn(list[i]) === keyFn(list[i - 1])) return true;
    }
    return false;
  }

  /**
   * Shuffles `list` while making sure two entries with the same key
   * never end up side by side. The repetition itself is allowed (the
   * activity may want the same number asked twice); the constraint is
   * only that no two copies of the same entry are adjacent. Two
   * adjacent identical questions make the "Siguiente" button read as
   * dead: the click works but the screen does not change.
   *
   * Reshuffle up to 20 times; if luck is against us, fall back to
   * filling even positions with the most-repeated keys first, then
   * odd ones, so two copies of the same entry cannot sit next to each
   * other. `keyFn(entry)` is the identity of a single question (the
   * same number in the same mode is the same question).
   */
  function spreadRepeats(list, keyFn) {
    for (var attempt = 0; attempt < 20; attempt++) {
      var shuffled = shuffle(list);
      if (!hasAdjacentRepeat(shuffled, keyFn)) return shuffled;
    }
    var byKey = {};
    list.forEach(function (e) {
      var k = keyFn(e);
      (byKey[k] = byKey[k] || []).push(e);
    });
    var flat = [];
    Object.keys(byKey)
      .sort(function (a, b) { return byKey[b].length - byKey[a].length; })
      .forEach(function (k) { flat = flat.concat(byKey[k]); });
    var out = new Array(flat.length);
    var slot = 0;
    for (var i = 0; i < flat.length; i++) {
      out[slot] = flat[i];
      slot += 2;
      if (slot >= flat.length) slot = 1;
    }
    return out;
  }

  /** Shortcut for querySelector. */
  function $(selector) {
    return document.querySelector(selector);
  }

  /** Shortcut for querySelectorAll (returns an Array). */
  function $$(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  /** Today's date as 'YYYY-MM-DD' (for daily routines). */
  function today() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  /** true if the user prefers less animation. */
  function reducedMotion() {
    return window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* Keep the screen awake during the activity (Screen Wake Lock).
     Progressive enhancement: if the browser doesn't support it, nothing
     happens. Requires a user gesture, so it's requested on the first
     tap/click; it's requested again on regaining visibility (the lock
     is released automatically when the tab is hidden). */
  if ('wakeLock' in navigator) {
    var wakeLockSentinel = null;
    var requestWakeLock = function () {
      navigator.wakeLock.request('screen').then(function (sentinel) {
        wakeLockSentinel = sentinel;
      }).catch(function () { /* denied or unavailable: keep going without the lock */ });
    };
    document.addEventListener('pointerdown', function onFirstInteraction() {
      requestWakeLock();
      document.removeEventListener('pointerdown', onFirstInteraction);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && wakeLockSentinel) {
        requestWakeLock();
      }
    });
  }

  /* ---------------------------------------------------------------
    * Shared footer injector.
    *
    * Replaces the 15+ hand-maintained <footer class="pie-app">
    * copies in tools/<slug>/index.html + the root index.html with a
    * single canonical source. Reads <footer data-pie-app> markers
    * and fills them in at load time using App.i18n.t() for the
    * text. Marker attributes mirror the routime convention:
    *   data-pie-base            base path for relative links
    *   data-pie-include-about   unless 'false', starts with a "Sobre la
    *                            app" link (about-app/: achievements),
    *                            always placed before Configuración
    *   data-pie-include-config  if 'true', adds a Configuración link
    *   data-pie-class           extra class added to the <footer> element
    * Idempotent: a footer that already has children is skipped.
    * --------------------------------------------------------------- */
  function injectFooter() {
    if (!window.App || !window.App.i18n) return;
    var pies = document.querySelectorAll('footer[data-pie-app]');
    for (var i = 0; i < pies.length; i++) {
      var pie = pies[i];
      if (pie.childNodes && pie.childNodes.length > 0) continue;
      var base = pie.getAttribute('data-pie-base') || '../../';
      var includeAbout = pie.getAttribute('data-pie-include-about') !== 'false';
      var includeConfig = pie.getAttribute('data-pie-include-config') === 'true';
      var extraClass = pie.getAttribute('data-pie-class');
      if (extraClass) pie.className = (pie.className ? pie.className + ' ' : '') + extraClass;
      var html = '';
      if (includeAbout) {
        html += '<a href="' + base + 'about-app/" class="legal-link" data-i18n="core.aboutApp"></a>';
      }
      if (includeConfig) {
        html += '<a href="' + base + 'config/" class="legal-link" data-i18n="core.config"></a>';
      }
      html += '<a href="' + base + 'legal/" class="legal-link" data-i18n="core.dataProtection"></a>';
      pie.innerHTML = html;
      if (typeof window.App.i18n.apply === 'function') {
        window.App.i18n.apply(pie);
      }
    }
  }

  /* Replaces each {name} in a text with the value given for it. */
  function fill(text, values) {
    var out = text;
    Object.keys(values).forEach(function (k) { out = out.split('{' + k + '}').join(values[k]); });
    return out;
  }
  /* A whole number from min to max, both included. */
  function rint(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
  /* One element of a list, at random. */
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  /* A whole number from min to max, both included, that is not `avoid` when it can be helped. */
  function pickRandomInt(min, max, avoid) {
    if (max <= min) return min;
    var range = max - min + 1;
    for (var i = 0; i < 8; i++) {
      var v = min + Math.floor(Math.random() * range);
      if (v !== avoid) return v;
    }
    return min;
  }
  /* The text of a piece of html (its visible text, not its tags). */
  function plainText(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
  }
  /* The character that separates thousands in the current locale. */
  function thousandsSeparator() { return App.i18n.locale() === 'en' ? ',' : '.'; }
  /* Answer options for a numeric question: the correct value plus up to two of the wrong ones
     (non-negative, no repeats), shuffled. Each option is { html, aria, correct }. */
  function numericOptions(correct, wrongs) {
    var values = [correct];
    wrongs.forEach(function (v) {
      if (values.length < 3 && v >= 0 && values.indexOf(v) === -1) values.push(v);
    });
    return shuffle(values).map(function (v) {
      return { html: String(v), aria: String(v), correct: v === correct };
    });
  }

  /* The end screen's only button, "Volver al inicio": goes back to the Calculia
     landing. Does nothing on pages without the button. */
  function bindEndBackToStart() {
    var el = $('#endBackToStart');
    if (el) el.addEventListener('click', function () { location.href = '../../'; });
  }

  window.App.utils = {
    shuffle: shuffle,
    drawRound: drawRound,
    bindEndBackToStart: bindEndBackToStart,
    drawRoundReset: drawRoundReset,
    spreadRepeats: spreadRepeats,
    $: $,
    $$: $$,
    today: today,
    reducedMotion: reducedMotion,
    injectFooter: injectFooter,
    fill: fill,
    rint: rint,
    pick: pick,
    pickRandomInt: pickRandomInt,
    plainText: plainText,
    thousandsSeparator: thousandsSeparator,
    numericOptions: numericOptions
  };
})();
