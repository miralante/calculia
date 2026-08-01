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

  var CLAVE_LOCALE = 'calculia:locale';
  var SOPORTADOS = ['es', 'en'];
  var POR_DEFECTO = 'es';

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

  function detectar() {
    try {
      var idiomas = navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || ''];
      for (var i = 0; i < idiomas.length; i++) {
        var prefijo = (idiomas[i] || '').slice(0, 2).toLowerCase();
        if (SOPORTADOS.indexOf(prefijo) !== -1) return prefijo;
      }
    } catch (e) { /* ignore */ }
    return POR_DEFECTO;
  }

  function locale() {
    try {
      var guardado = localStorage.getItem(CLAVE_LOCALE);
      if (guardado && SOPORTADOS.indexOf(guardado) !== -1) return guardado;
    } catch (e) { /* ignore */ }
    return detectar();
  }

  function setLocale(loc) {
    if (SOPORTADOS.indexOf(loc) === -1) return;
    try {
      localStorage.setItem(CLAVE_LOCALE, loc);
    } catch (e) { /* ignore */ }
    location.reload();
  }

  function lang() {
    return locale() === 'en' ? 'en-US' : 'es-ES';
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
      if (SOPORTADOS.indexOf(locale) === -1) return;
      if (!dict || typeof dict !== 'object') return;
      DICT[locale] = DICT[locale] || {};
      for (var clave in dict) {
        if (Object.prototype.hasOwnProperty.call(dict, clave)) {
          DICT[locale][clave] = dict[clave];
        }
      }
      return;
    }
    // Old signature: ({es: {...}, en: {...}})
    SOPORTADOS.forEach(function (loc) {
      if (!dict[loc]) return;
      DICT[loc] = DICT[loc] || {};
      for (var clave in dict[loc]) {
        if (Object.prototype.hasOwnProperty.call(dict[loc], clave)) {
          DICT[loc][clave] = dict[loc][clave];
        }
      }
    });
  }

  function buscar(dictLoc, key) {
    var partes = key.split('.');
    var actual = dictLoc;
    for (var i = 0; i < partes.length; i++) {
      if (actual == null) return undefined;
      actual = actual[partes[i]];
    }
    return actual;
  }

  function t(key) {
    var loc = locale();
    var valor = buscar(DICT[loc], key);
    if (valor === undefined && loc !== POR_DEFECTO) {
      valor = buscar(DICT[POR_DEFECTO], key);
    }
    if (valor === undefined) return key;
    if (Array.isArray(valor)) return valor.join(', ');
    return valor;
  }

  function pick(key) {
    var loc = locale();
    var valor = buscar(DICT[loc], key);
    if (!Array.isArray(valor) && loc !== POR_DEFECTO) {
      valor = buscar(DICT[POR_DEFECTO], key);
    }
    if (!Array.isArray(valor) || !valor.length) return '';
    return valor[Math.floor(Math.random() * valor.length)];
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
    var valor = buscar(DICT[loc], key);
    if (valor === undefined && loc !== POR_DEFECTO) {
      valor = buscar(DICT[POR_DEFECTO], key);
    }
    return valor;
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
  function datos() {
    var out = {};
    SOPORTADOS.forEach(function (loc) {
      var texto = (DICT[loc] && DICT[loc].data) || null;
      var estructura = DICT[loc] && DICT[loc].__structure__;
      out[loc] = mergeEstructuraTextos(estructura, texto);
    });
    return out;
  }

  /**
   * Registers a locale-neutral structure tree (typically loaded from
   * data.js). The structure has ids/types/booleans and no text. The
   * text lives in strings.<locale>.js as a parallel tree registered
   * with register({data: ...}, locale). Together they form the legacy
   * {es, en} shape returned by datos().
   */
  function registerStructure(structure) {
    /* Bind to every supported locale so datos() can find it for any of them. */
    SOPORTADOS.forEach(function (loc) {
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
  function mergeEstructuraTextos(estructura, texto) {
    if (!estructura && !texto) return null;
    if (!texto) return estructura;
    if (!estructura) return texto;
    if (Array.isArray(estructura)) {
      return estructura.map(function (item, i) {
        return mergeEstructuraTextos(item, Array.isArray(texto) ? texto[i] : null);
      });
    }
    if (typeof estructura === 'object') {
      var out = {};
      var keys = new Set();
      Object.keys(estructura).forEach(function (k) { keys.add(k); });
      Object.keys(texto).forEach(function (k) { keys.add(k); });
      keys.forEach(function (k) {
        var sVal = estructura[k];
        var tVal = texto[k];
        if (TEXT_FIELDS[k]) {
          out[k] = (tVal !== undefined) ? tVal : sVal;
        } else if (Array.isArray(sVal) || Array.isArray(tVal)) {
          out[k] = mergeEstructuraTextos(sVal, tVal);
        } else if (sVal && typeof sVal === 'object') {
          out[k] = mergeEstructuraTextos(sVal, tVal);
        } else {
          out[k] = (tVal !== undefined) ? tVal : sVal;
        }
      });
      return out;
    }
    return texto !== undefined ? texto : estructura;
  }

  function apply(root) {
    root = root || document;
    var nodos = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodos.length; i++) {
      nodos[i].textContent = t(nodos[i].getAttribute('data-i18n'));
    }
    var ariaNodos = root.querySelectorAll('[data-i18n-aria]');
    for (var j = 0; j < ariaNodos.length; j++) {
      ariaNodos[j].setAttribute('aria-label', t(ariaNodos[j].getAttribute('data-i18n-aria')));
    }
    var tituloClave = document.documentElement.getAttribute('data-i18n-title');
    if (tituloClave) {
      document.title = t(tituloClave) + ' | Calculia';
    }
  }

  function inicio() {
    document.documentElement.lang = locale();
    apply(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicio);
  } else {
    inicio();
  }

  window.App.i18n = {
    SOPORTADOS: SOPORTADOS,
    POR_DEFECTO: POR_DEFECTO,
    locale: locale,
    setLocale: setLocale,
    lang: lang,
    register: register,
    registerStructure: registerStructure,
    t: t,
    pick: pick,
    data: data,
    datos: datos,
    apply: apply
  };
})();
