/* ==========================================================================
   Calculia — Progress in localStorage
   Exposes window.App.storage.get(toolId) / .set(toolId, data) / .remove(toolId)
   Internal key: 'calculia:<toolId>'. No personal data.
   Always fault-tolerant (private mode can throw exceptions).
   ========================================================================== */
(function () {
  'use strict';

  window.App = window.App || {};

  var PREFIX = 'calculia:';

  /* Keys under 'calculia:*' that are NOT an activity's progress:
     'locale' (language) and 'prefs' (font size, sounds — see
     /settings/). Excluded from totalStars() and listaToolIds(). */
  var NON_TOOL_KEYS = ['locale', 'prefs'];

  /* Applies right away the font-size preference saved in /settings/
     (rule: only once in the shared core, never per tool — storage.js
     is loaded in site/ and in every activity before anything is
     painted). --escala-texto defaults to 1 (tokens.css), so anyone
     who hasn't touched the preference sees no change. */
  (function applyFontSize() {
    try {
      var raw = localStorage.getItem(PREFIX + 'prefs');
      var prefs = raw ? JSON.parse(raw) : {};
      var SCALE = { normal: 1, grande: 1.15, muygrande: 1.3 };
      var scale = SCALE[prefs.fontSize] || 1;
      document.documentElement.style.setProperty('--escala-texto', scale);
    } catch (e) { /* silent: keeps the default size */ }
  })();

  /**
   * Reads a tool's saved progress.
   * @param {string} toolId - tool slug, e.g. 'parejas'
   * @returns {object} saved progress, or {} if there is none / on error
   */
  function get(toolId) {
    try {
      var raw = localStorage.getItem(PREFIX + toolId);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Saves a tool's progress.
   * @param {string} toolId
   * @param {object} data - JSON-serializable object
   * @returns {boolean} true if it was saved
   */
  function set(toolId, data) {
    try {
      localStorage.setItem(PREFIX + toolId, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  /** Deletes a tool's progress. */
  function remove(toolId) {
    try {
      localStorage.removeItem(PREFIX + toolId);
      return true;
    } catch (e) {
      return false;
    }
  }

  /** Sum of stars across all tools (for the menu).
      Fixed bug: the try/catch used to wrap the WHOLE loop, so a single
      non-JSON key in between (e.g. 'calculia:locale', which stores a
      plain string like 'en', not JSON) cut the sum short for the rest
      of the tools that came later in localStorage's iteration order
      (not insertion order). Each key is now processed in its own
      try/catch. */
  function totalStars() {
    var total = 0;
    for (var i = 0; i < localStorage.length; i++) {
      try {
        var key = localStorage.key(i);
        if (!key || key.indexOf(PREFIX) !== 0) continue;
        if (NON_TOOL_KEYS.indexOf(key.slice(PREFIX.length)) !== -1) continue;
        var data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data && typeof data.stars === 'number') {
          total += data.stars;
        }
      } catch (e) { /* individual key corrupt or non-JSON: keep going with the rest */ }
    }
    return total;
  }

  /**
   * Ids of every tool with something saved (without the prefix,
   * and without the NON_TOOL_KEYS keys). Used by /settings/ to show
   * status and for the full reset.
   * @returns {string[]}
   */
  function listaToolIds() {
    var out = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key || key.indexOf(PREFIX) !== 0) continue;
        var id = key.slice(PREFIX.length);
        if (NON_TOOL_KEYS.indexOf(id) === -1) out.push(id);
      }
    } catch (e) { /* ignore */ }
    return out;
  }

  window.App.storage = {
    get: get,
    set: set,
    remove: remove,
    totalStars: totalStars,
    listaToolIds: listaToolIds
  };
})();
