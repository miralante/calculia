/* ============================================================
   Calculia — roman-numerals: the model (no page in it).
   The questions, the numbers and the drawings as HTML text. Nothing here
   touches the page, so it can be checked on its own. The page and the flow
   are in app.js, which reads these names from App.romanNumeralsModel.
   ============================================================ */
(function () {
  'use strict';

  function t(key) { return App.i18n.t(key); }

  var CAROUSEL_ORDER = ['i', 'v', 'x', 'vi', 'xi', 'iv', 'ix'];
  function wrapRomanLetters(raw) {
    if (!raw) return '';
    return raw.split('').map(function (ch, i, arr) {
      if (ch === 'I' || ch === 'V' || ch === 'X') {
        var subtract = ch === 'I' && i + 1 < arr.length && (arr[i + 1] === 'V' || arr[i + 1] === 'X');
        var cls = 'letter-' + ch.toLowerCase() + (subtract ? ' letter-subtract' : '');
        return '<span aria-hidden="true" class="' + cls + '">' + ch + '</span>';
      }
      return ch;
    }).join('');
  }

  function wrapTrailingRoman(label) {
    if (!label) return '';
    var suffixStart = label.length;
    while (suffixStart > 0) {
      var ch = label.charAt(suffixStart - 1);
      if (ch === 'I' || ch === 'V' || ch === 'X') {
        suffixStart -= 1;
      } else {
        break;
      }
    }
    if (suffixStart === label.length) return label; /* no I/V/X at all */
    var head = label.slice(0, suffixStart);
    var tail = label.slice(suffixStart);
    var coloredTail = wrapRomanLetters(tail);
    return head + coloredTail;
  }

  function applyRomanPlaceholders(raw, isSubtract) {
    if (!raw) return '';
    var iClass = 'letter-i' + (isSubtract ? ' letter-subtract' : '');
    return raw
      .replace(/\{V\}/g, '<span aria-hidden="true" class="letter-v">V</span>')
      .replace(/\{X\}/g, '<span aria-hidden="true" class="letter-x">X</span>')
      .replace(/\{I\}/g, '<span aria-hidden="true" class="' + iClass + '">I</span>')
      .replace(/\{v\}/g, '<span aria-hidden="true" class="letter-v">5</span>')
      .replace(/\{x\}/g, '<span aria-hidden="true" class="letter-x">10</span>')
      .replace(/\{i\}/g, '<span aria-hidden="true" class="' + iClass + '">1</span>')
      .replace(/\{i4\}/g, '<span aria-hidden="true" class="' + iClass + '">4</span>')
      .replace(/\{i6\}/g, '<span aria-hidden="true" class="' + iClass + '">6</span>')
      .replace(/\{i9\}/g, '<span aria-hidden="true" class="' + iClass + '">9</span>')
      .replace(/\{i11\}/g, '<span aria-hidden="true" class="' + iClass + '">11</span>')
      .replace(/\{i19\}/g, '<span aria-hidden="true" class="' + iClass + '">19</span>');
  }

  function coloredCaption(key, raw) {
    var isSubtract = key === 'iv' || key === 'ix';
    return applyRomanPlaceholders(raw, isSubtract);
  }

  function paintFamousPhrase(roman, raw) {
    var deco = DATA.decompose(roman);
    var hasSubtract = deco.tokens.some(function (tok) { return tok.sign === '-'; });
    return applyRomanPlaceholders(raw, hasSubtract);
  }

  function famousFor() {
    var locale = App.i18n.locale();
    return DATA.famousRomans.filter(function (f) { return !f.locale || f.locale === locale; });
  }

  function totalColorClass(deco) {
    if (deco.mode === 'subtract') return 'letter-i letter-subtract';
    return 'letter-' + deco.chunks[0].letters[0].toLowerCase();
  }

  function speakForQuiz(entry) {
    var mode = entry.mode;
    var item = entry.item;
    if (mode === 'romanToNumber') {
      /* Stimulus to read: the letters as-is. */
      return item.roman;
    }
    if (mode === 'centuryToNumber') {
      /* "Twentieth century" → "Twentieth " + ordinal(item.n) */
      return t('centuryRomanLabel').split('{roman}')[0] + ordinalFor(item.n);
    }
    if (mode === 'numberToRoman') {
      /* The decimal number is shown: read as cardinal, not as ordinal
         (TTS for "nineteen" sounds natural; for "nineteenth" it
         would sound obscure for a number that appears alone on
         screen). */
      return cardinalFor(item.n);
    }
    /* monarchToNumber: monarch name + ordinal ("Felipe sixth",
       "Henry eighth"). The name already comes in the active locale
       (es/en) from DATA.monarchs. */
    return item.name + ' ' + ordinalFor(item.n);
  }

  function ordinalFor(n) {
    var text = t('ordinales.' + n);
    /* t() returns the key itself when missing; in that case we fall
       back to the cardinal so we don't stay silent. */
    if (text === 'ordinales.' + n) return cardinalFor(n);
    return text;
  }

  function cardinalFor(n) {
    var text = t('cardinales.' + n);
    if (text === 'cardinales.' + n) return String(n);
    return text;
  }

  function letterClass(letter) { return 'letter-' + letter.toLowerCase(); }

  function romanFor(n) {
    var found = DATA.numbers.filter(function (x) { return x.n === n; })[0];
    return found ? found.roman : '';
  }

  function sourcePool(level) {
    if (level.pool === 'monarchs') {
      return DATA.monarchs[App.i18n.locale()] || DATA.monarchs.es;
    }
    return DATA.numbers.filter(function (x) { return x.n >= level.min && x.n <= level.max; });
  }

  function baseLevels() {
    var out = [];
    DATA.levels.forEach(function (n) {
      if (n.pool === 'group') {
        if (n.sublevels) out = out.concat(n.sublevels);
      } else if (n.pool !== 'random' && n.mode !== 'random') {
        out.push(n);
      }
    });
    return out;
  }

  function entryKey(entry) {
    var item = entry.item || {};
    return (item.id || item.n) + '|' + entry.mode;
  }

  function itemsForLevel(level) {
    if (level.pool === 'random' || level.mode === 'random') {
      var modes = baseLevels();
      var out = [];
      for (var i = 0; i < DATA.perRound; i++) {
        /* Redraw if the pick repeats the previous question, for the same
           reason as spreadRepeats above. */
        var entry, tries = 0;
        do {
          var baseLevel = modes[Math.floor(Math.random() * modes.length)];
          var basePool = sourcePool(baseLevel);
          entry = { item: App.utils.shuffle(basePool)[0], mode: baseLevel.mode };
          tries += 1;
        } while (out.length && tries < 10 &&
                 entryKey(entry) === entryKey(out[out.length - 1]));
        out.push(entry);
      }
      return out;
    }
    var pool = sourcePool(level);
    var reps = DATA.repetitions || 1;
    var picked = App.utils.shuffle(pool).slice(0, DATA.perRound).map(function (item) {
      return { item: item, mode: level.mode };
    });
    var repeated = [];
    for (var r = 0; r < reps; r++) {
      repeated = repeated.concat(picked);
    }
    return App.utils.spreadRepeats(repeated, entryKey);
  }

  function realContext(key) {
    var text = t(key);
    return text !== key ? text : '';
  }

  function pickHint(roman) {
    if (!roman) return t('pistaGeneral');
    if (roman.indexOf('IX') !== -1) return t('pistaIX');
    if (roman.indexOf('IV') !== -1) return t('pistaIV');
    if (roman.indexOf('XI') !== -1) return t('pistaXI');
    if (roman.indexOf('X') !== -1) return t('pistaX');
    if (roman.indexOf('V') !== -1) return t('pistaV');
    if (roman.indexOf('I') !== -1) return t('pistaI');
    return t('pistaGeneral');
  }


  App.romanNumeralsModel = {
    t: t,
    CAROUSEL_ORDER: CAROUSEL_ORDER,
    wrapRomanLetters: wrapRomanLetters,
    wrapTrailingRoman: wrapTrailingRoman,
    applyRomanPlaceholders: applyRomanPlaceholders,
    coloredCaption: coloredCaption,
    paintFamousPhrase: paintFamousPhrase,
    famousFor: famousFor,
    totalColorClass: totalColorClass,
    speakForQuiz: speakForQuiz,
    ordinalFor: ordinalFor,
    cardinalFor: cardinalFor,
    letterClass: letterClass,
    romanFor: romanFor,
    sourcePool: sourcePool,
    baseLevels: baseLevels,
    entryKey: entryKey,
    itemsForLevel: itemsForLevel,
    realContext: realContext,
    pickHint: pickHint
  };
})();
