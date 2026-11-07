/* ============================================================
   Calculia — Quantities: the digits and the reading of numbers in words (es / en).
   ============================================================ */
(function () {
  'use strict';

  function t(key) { return App.i18n.t(key); }
  /* ----------- Number formatting ----------- */

  /* Project rule: below 10.000 NO separator is used; from 10.000 up
     it is. This is the only place in the activity that encodes it. */
  function separator() { return App.i18n.locale() === 'en' ? ',' : '.'; }

  function format(n) {
    var negative = n < 0;
    var abs = Math.abs(n);
    var s = String(abs);
    var sep = separator();
    var parts = [];
    while (s.length > 3) {
      parts.unshift(s.slice(s.length - 3));
      s = s.slice(0, s.length - 3);
    }
    parts.unshift(s);
    var out = parts.join(sep);
    return negative ? '−' + out : out;
  }

  /* ----------- Colour by group -----------
     One colour per group of three digits. The groups are the ones the
     separator (dot in Spanish, comma in English) makes: units,
     thousands, millions... Every digit of a group shares its colour
     and the next group changes it, so the colour says which group a
     digit belongs to. Classes: dot-group-0..3 in styles.css. */
  var GROUP_CLASS = ['dot-group-0', 'dot-group-1', 'dot-group-2', 'dot-group-3'];

  function coloredDigits(n) {
    var s = String(Math.abs(n));
    var sep = separator();
    var htmlOut = '';
    for (var i = 0; i < s.length; i++) {
      var fromRight = s.length - 1 - i;
      /* The separator goes in front of the first digit of each new group. */
      if (i > 0 && fromRight % 3 === 2) htmlOut += '<span class="digit-sep">' + sep + '</span>';
      var group = Math.floor(fromRight / 3);
      htmlOut += '<span class="' + GROUP_CLASS[group % GROUP_CLASS.length] + '">' + s.charAt(i) + '</span>';
    }
    if (n < 0) htmlOut = '<span class="sign">−</span>' + htmlOut;
    return htmlOut;
  }

  /* ----------- Reading in words (es / en, up to 10⁹) -----------
     Custom algorithm. Handles the two large groups: thousands (10³
     separator) and millions (10⁶ separator). The top range
     (999,999,999) stays inside "thousand millions" in Spanish and
     "one billion" in English, never touching "trillion" etc. */
  var UNITS_ES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  var UNITS_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  var TENS_ES = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  var TENS_EN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  /* Special 11-19 (es): diez, once, doce, trece, catorce, quince,
     dieciséis, diecisiete, dieciocho, diecinueve. Kept here as data so
     the algorithm below can read them directly; they are not a
     comment translation. */
  var TEENS_ES = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  var TEENS_EN = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  /* Hundreds (es): 100 cien, 200 doscientos, ..., 900 novecientos
     (apocopated). Hundreds (en): no apocope. */
  var HUNDREDS_ES = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  var HUNDREDS_EN = ['', 'one hundred', 'two hundred', 'three hundred', 'four hundred', 'five hundred', 'six hundred', 'seven hundred', 'eight hundred', 'nine hundred'];

  function threeDigits(n, locale) {
    /* n in [0, 999]. Returns a string in the requested language. */
    if (locale === 'en') {
      if (n === 0) return 'zero';
      if (n === 100) return 'one hundred';
      var parts = [];
      var c = Math.floor(n / 100);
      var rest = n % 100;
      if (c) parts.push(HUNDREDS_EN[c]);
      if (rest < 10) {
        if (rest) parts.push(UNITS_EN[rest]);
      } else if (rest < 20) {
        parts.push(TEENS_EN[rest - 10]);
      } else {
        var d = Math.floor(rest / 10);
        var u = rest % 10;
        var txt = TENS_EN[d];
        if (u) txt += '-' + UNITS_EN[u];
        parts.push(txt);
      }
      return parts.join(' ');
    }
    /* ES */
    if (n === 0) return 'cero';
    if (n === 100) return 'cien';
    var partsES = [];
    var cES = Math.floor(n / 100);
    var restES = n % 100;
    if (cES) partsES.push(HUNDREDS_ES[cES]);
    if (restES < 10) {
      if (restES) partsES.push(UNITS_ES[restES]);
    } else if (restES < 20) {
      partsES.push(TEENS_ES[restES - 10]);
    } else if (restES < 30) {
      /* 21-29: veinti + uno/dos/... (with accent on 22-29) */
      var uES = restES - 20;
      var txtES = 'veinti';
      if (uES === 0) txtES = 'veinte';
      else if (uES === 1) txtES += 'uno';
      else if (uES === 2) txtES += 'dós';
      else if (uES === 3) txtES += 'trés';
      else if (uES === 4) txtES += 'cuatro';
      else if (uES === 5) txtES += 'cinco';
      else if (uES === 6) txtES += 'séis';
      else if (uES === 7) txtES += 'siete';
      else if (uES === 8) txtES += 'ocho';
      else if (uES === 9) txtES += 'nueve';
      partsES.push(txtES);
    } else {
      var dES = Math.floor(restES / 10);
      var uuES = restES % 10;
      var tES = TENS_ES[dES];
      if (uuES) tES += ' y ' + UNITS_ES[uuES];
      partsES.push(tES);
    }
    return partsES.join(' ');
  }

  /* Apocope (es): a number that ends in "uno" loses the "o" before a
     masculine noun (mil, millón, millones): "veintiún mil", "treinta y
     un millones". The written form is what the person must type, so
     it follows the spelling rules, not the spoken shortcut. */
  function apocopeES(txt) {
    if (/veintiuno$/.test(txt)) return txt.replace(/veintiuno$/, 'veintiún');
    return txt.replace(/\buno$/, 'un');
  }

  /* Words are compared without case, spaces, hyphens, commas or dots:
     "Veinte-y-dos" and "veinte y dos" are the same answer. Accents are
     NOT ignored: they are part of the spelling being practised. */
  function normaliseWords(s) {
    return s.toLowerCase().replace(/[-,.]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function readGroup(n, locale, singular, plural) {
    if (n === 1) return locale === 'en' ? 'one ' + singular : 'un ' + singular;
    var num = locale === 'en' ? threeDigits(n, 'en') : apocopeES(threeDigits(n, 'es'));
    return num + ' ' + plural;
  }

  function readNumber(n, locale) {
    if (n === 0) return locale === 'en' ? 'zero' : 'cero';
    var negative = n < 0;
    var abs = Math.abs(n);
    if (abs >= 1000000000) {
      /* Billions: "X mil millones" in Spanish, "X billion" in English.
         What is left under a billion is read by the rules below. */
      var bn = Math.floor(abs / 1000000000);
      var restBn = abs % 1000000000;
      var headBn = locale === 'en'
        ? (bn === 1 ? 'one' : threeDigits(bn, 'en')) + ' billion'
        : (bn === 1 ? '' : threeDigits(bn, 'es') + ' ') + 'mil millones';
      var outBn = restBn ? headBn + ' ' + readNumber(restBn, locale) : headBn;
      return negative ? (locale === 'en' ? 'negative ' : 'menos ') + outBn : outBn;
    }
    if (locale === 'en') {
      var millionsEN = Math.floor(abs / 1000000);
      var restEN = abs % 1000000;
      var thousandsEN = Math.floor(restEN / 1000);
      var unitsEN = restEN % 1000;
      var parts = [];
      if (millionsEN) {
        parts.push(readGroup(millionsEN, 'en', 'million', 'million'));
        if (thousandsEN || unitsEN) {
          var restFullEN = '';
          if (thousandsEN) {
            restFullEN += (thousandsEN === 1 ? 'one thousand' : threeDigits(thousandsEN, 'en') + ' thousand');
          }
          if (unitsEN) {
            if (thousandsEN) restFullEN += ' ';
            restFullEN += threeDigits(unitsEN, 'en');
          }
          parts.push(restFullEN);
        }
      } else if (thousandsEN) {
        parts.push(thousandsEN === 1 ? 'one thousand' : threeDigits(thousandsEN, 'en') + ' thousand');
        if (unitsEN) parts.push(threeDigits(unitsEN, 'en'));
      } else {
        parts.push(threeDigits(unitsEN, 'en'));
      }
      var out = parts.join(' ');
      return negative ? 'negative ' + out : out;
    }
    /* ES */
    var millionsES = Math.floor(abs / 1000000);
    var restES = abs % 1000000;
    var thousandsES = Math.floor(restES / 1000);
    var unitsES = restES % 1000;
    var partsES = [];
    if (millionsES) {
      partsES.push(readGroup(millionsES, 'es', 'millón', 'millones'));
      var restFullES = '';
      if (thousandsES) {
        restFullES += (thousandsES === 1 ? 'mil' : apocopeES(threeDigits(thousandsES, 'es')) + ' mil');
      }
      if (unitsES) {
        if (thousandsES) restFullES += ' ';
        restFullES += threeDigits(unitsES, 'es');
      }
      if (restFullES) partsES.push(restFullES);
    } else if (thousandsES) {
      partsES.push(thousandsES === 1 ? 'mil' : apocopeES(threeDigits(thousandsES, 'es')) + ' mil');
      if (unitsES) partsES.push(threeDigits(unitsES, 'es'));
    } else {
      partsES.push(threeDigits(unitsES, 'es'));
    }
    var outES = partsES.join(' ');
    return negative ? 'menos ' + outES : outES;
  }

  App.QuantitiesWords = {
    t: t,
    separator: separator,
    format: format,
    coloredDigits: coloredDigits,
    normaliseWords: normaliseWords,
    readNumber: readNumber
  };
})();
