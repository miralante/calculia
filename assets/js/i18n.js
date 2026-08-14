/* ==========================================================================
   Calculia — Internationalization (i18n)
   Exposes window.App.i18n. Load AFTER utils.js and BEFORE tts.js/feedback.js.
   Standard order: utils.js -> i18n.js -> tts.js -> storage.js -> feedback.js ->
   conditional load of strings.<locale>.js -> data.js -> app.js.

   Active language: localStorage 'calculia:locale' if supported; otherwise
   detected from navigator.language ('en' prefix -> 'en', anything else -> 'es').

   Multi-file system (recommended):
     - texts split by language: tools/<slug>/strings.es.js, tools/<slug>/strings.en.js
     - only the active locale's file is loaded (saves bandwidth, simpler maintenance)
     - each file calls App.i18n.register({key: 'text', ...}, 'es'|'en')
   ========================================================================== */
(function () {
  'use strict';

  window.App = window.App || {};

  var LOCALE_KEY = 'calculia:locale';
  var SUPPORTED = ['es', 'en'];
  var DEFAULT = 'es';

  var DICT = {
    es: {
      core: {
        back: '← Volver',
        backToMenu: 'Volver al menú',
        playAgain: 'Jugar otra vez',
        next: 'Siguiente →',
        understood: 'Entendido',
        listen: '🔊 Escuchar',
        listenInstructions: 'Escuchar las instrucciones',
        listenText: 'Escuchar el texto',
        loading: 'Cargando…',
        roundComplete: '¡Ronda completada!',
        rest: '¡Llevas un buen rato! Puedes descansar si quieres.',
        dataProtection: 'Calculia no recolecta datos'
      },
      feedback: {
        success: ['¡Muy bien!', '¡Genial!', '¡Lo has conseguido!', '¡Estupendo!', '¡Sigue así!'],
        encourage: ['Casi. ¡Inténtalo otra vez!', 'No pasa nada. ¡Otra vez!', 'Prueba de nuevo. ¡Tú puedes!']
      }
    },
    en: {
      core: {
        back: '← Back',
        backToMenu: 'Back to menu',
        playAgain: 'Play again',
        next: 'Next →',
        understood: 'Got it',
        listen: '🔊 Listen',
        listenInstructions: 'Listen to the instructions',
        listenText: 'Listen to the text',
        loading: 'Loading…',
        roundComplete: 'Round complete!',
        rest: 'You have been playing a while! You can rest if you want.',
        dataProtection: 'Calculia does not collect data'
      },
      feedback: {
        success: ['Well done!', 'Great!', 'You got it!', 'Fantastic!', 'Keep it up!'],
        encourage: ['Almost. Try again!', "That's okay. Try again!", 'Try once more. You can do it!']
      }
    }
  };

  function detect() {
    try {
      var languages = navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || ''];
      for (var i = 0; i < languages.length; i++) {
        var prefix = (languages[i] || '').slice(0, 2).toLowerCase();
        if (SUPPORTED.indexOf(prefix) !== -1) return prefix;
      }
    } catch (e) { /* ignore */ }
    return DEFAULT;
  }

  function locale() {
    try {
      var saved = localStorage.getItem(LOCALE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) { /* ignore */ }
    return detect();
  }

  function setLocale(loc) {
    if (SUPPORTED.indexOf(loc) === -1) return;
    try {
      localStorage.setItem(LOCALE_KEY, loc);
    } catch (e) { /* ignore */ }
    location.reload();
  }

  /* BCP-47 map per supported locale, with fallback to the default
     locale's BCP-47. App.tts.speak() uses this to pick the speechSynthesis
     voice. Add an entry here when adding a new language — see doc/I18N.md
     §4 for the full recipe. */
  var BCP47 = { es: 'es-ES', en: 'en-US' };

  function lang() {
    return BCP47[locale()] || BCP47[DEFAULT];
  }

  /**
   * Merges texts into the internal dictionary.
   *
   * Two backward-compatible signatures:
   *  1. Multi-file (recommended): App.i18n.register(dict, locale)
   *       Loads only the active language. Each strings.<locale>.js registers its texts.
   *         E.g.: App.i18n.register({title: 'Parejas', ...}, 'es');
   *  2. Legacy (single file with both languages): App.i18n.register({es: {...}, en: {...}})
   *       Registers into every locale present in the dict.
   */
  function register(dict, locale) {
    // New signature: (dict, locale)
    if (typeof locale === 'string') {
      if (SUPPORTED.indexOf(locale) === -1) return;
      if (!dict || typeof dict !== 'object') return;
      DICT[locale] = DICT[locale] || {};
      for (var key in dict) {
        if (Object.prototype.hasOwnProperty.call(dict, key)) {
          DICT[locale][key] = dict[key];
        }
      }
      return;
    }
    // Old signature: ({es: {...}, en: {...}})
    SUPPORTED.forEach(function (loc) {
      if (!dict[loc]) return;
      DICT[loc] = DICT[loc] || {};
      for (var key in dict[loc]) {
        if (Object.prototype.hasOwnProperty.call(dict[loc], key)) {
          DICT[loc][key] = dict[loc][key];
        }
      }
    });
  }

  function lookup(dictLoc, key) {
    var parts = key.split('.');
    var current = dictLoc;
    for (var i = 0; i < parts.length; i++) {
      if (current == null) return undefined;
      current = current[parts[i]];
    }
    return current;
  }

  function t(key) {
    var loc = locale();
    var value = lookup(DICT[loc], key);
    if (value === undefined && loc !== DEFAULT) {
      value = lookup(DICT[DEFAULT], key);
    }
    if (value === undefined) return key;
    if (Array.isArray(value)) return value.join(', ');
    return value;
  }

  function pick(key) {
    var loc = locale();
    var value = lookup(DICT[loc], key);
    if (!Array.isArray(value) && loc !== DEFAULT) {
      value = lookup(DICT[DEFAULT], key);
    }
    if (!Array.isArray(value) || !value.length) return '';
    return value[Math.floor(Math.random() * value.length)];
  }

  /**
   * Returns a sub-tree (object/array) for the given key in the active
   * language, falling back to the default locale. Unlike t(), it does
   * NOT flatten arrays — it returns the structure as-is so data trees
   * (escenarios, variantes, pasos...) can be accessed after registering
   * them with App.i18n.register({data: {...}}, locale).
   *
   * Example:
   *   // strings.es.js
   *   App.i18n.register({ data: { escenarios: [{titulo: 'Acoso', ...}] } }, 'es');
   *   // app.js
   *   var DATOS = App.i18n.data('data');
   */
  function data(key) {
    var loc = locale();
    var value = lookup(DICT[loc], key);
    if (value === undefined && loc !== DEFAULT) {
      value = lookup(DICT[DEFAULT], key);
    }
    return value;
  }

  /**
   * Returns the per-locale data tree, split by language: { es: {...}, en: {...} }.
   *
   * Background: legacy tools/<slug>/data.js had the form
   *   const DATA = { es: { escenarios: [...] }, en: { escenarios: [...] } }
   * and app.js accessed `DATA[App.i18n.locale()] || DATA.es` directly.
   *
   * After the i18n refactor, data.js is locale-neutral (only ids/types/flags)
   * and the translated content lives in strings.<locale>.js registered as
   * { data: { escenarios: [...] } }. This function rebuilds the legacy shape
   * on demand by deep-merging the structure (registered via registerStructure,
   * see below) with each locale's text tree, so existing app.js keeps working
   * unchanged.
   *
   * If a tool never called registerStructure, the result is just the
   * registered `data` trees in the legacy {es, en} shape.
   */
  function dataByLocale() {
    var out = {};
    SUPPORTED.forEach(function (loc) {
      var text = (DICT[loc] && DICT[loc].data) || null;
      var structure = DICT[loc] && DICT[loc].__structure__;
      out[loc] = mergeStructureAndText(structure, text);
    });
    return out;
  }

  /**
   * Registers a locale-neutral structure tree (typically loaded from
   * data.js). The structure has ids/types/booleans and no text. The
   * text lives in strings.<locale>.js as a parallel tree registered
   * with register({data: ...}, locale). Together they form the legacy
   * {es, en} shape returned by dataByLocale().
   */
  function registerStructure(structure) {
    /* Bind to every supported locale so dataByLocale() can find it for any of them. */
    SUPPORTED.forEach(function (loc) {
      DICT[loc] = DICT[loc] || {};
      DICT[loc].__structure__ = structure;
    });
  }

  /**
   * Deep-merges two parallel trees: structure (ids/types) + text (strings).
   * For each key:
   *   - if the value is an object/array in both, recurse
   *   - if the key is in TEXT_FIELDS for the structure or appears in
   *     text only, the text value wins
   *   - everything else stays in the structure side
   * Fields registered as text-only (titulo, texto, aviso, avisoSeguro,
   * confirmacion, regla, contacto, relacion) are sourced from the text
   * tree when present, otherwise kept from the structure.
   */
  var TEXT_FIELDS = {
    titulo: 1, texto: 1, aviso: 1, avisoSeguro: 1,
    confirmacion: 1, regla: 1, contacto: 1, relacion: 1
  };
  function mergeStructureAndText(structure, text) {
    if (!structure && !text) return null;
    if (!text) return structure;
    if (!structure) return text;
    if (Array.isArray(structure)) {
      return structure.map(function (item, i) {
        return mergeStructureAndText(item, Array.isArray(text) ? text[i] : null);
      });
    }
    if (typeof structure === 'object') {
      var out = {};
      var keys = new Set();
      Object.keys(structure).forEach(function (k) { keys.add(k); });
      Object.keys(text).forEach(function (k) { keys.add(k); });
      keys.forEach(function (k) {
        var sVal = structure[k];
        var tVal = text[k];
        if (TEXT_FIELDS[k]) {
          out[k] = (tVal !== undefined) ? tVal : sVal;
        } else if (Array.isArray(sVal) || Array.isArray(tVal)) {
          out[k] = mergeStructureAndText(sVal, tVal);
        } else if (sVal && typeof sVal === 'object') {
          out[k] = mergeStructureAndText(sVal, tVal);
        } else {
          out[k] = (tVal !== undefined) ? tVal : sVal;
        }
      });
      return out;
    }
    return text !== undefined ? text : structure;
  }

  function apply(root) {
    root = root || document;
    var nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
    var ariaNodes = root.querySelectorAll('[data-i18n-aria]');
    for (var j = 0; j < ariaNodes.length; j++) {
      ariaNodes[j].setAttribute('aria-label', t(ariaNodes[j].getAttribute('data-i18n-aria')));
    }
    var titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey) {
      document.title = t(titleKey) + ' | Calculia';
    }
  }

  function init() {
    document.documentElement.lang = locale();
    apply(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.App.i18n = {
    SUPPORTED: SUPPORTED,
    DEFAULT: DEFAULT,
    locale: locale,
    setLocale: setLocale,
    lang: lang,
    register: register,
    registerStructure: registerStructure,
    t: t,
    pick: pick,
    data: data,
    dataByLocale: dataByLocale,
    apply: apply
  };
})();
