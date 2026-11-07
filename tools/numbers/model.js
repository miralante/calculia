/* ============================================================
   Calculia — numbers: the model (no page in it).
   The questions, the numbers and the drawings as HTML text. Nothing here
   touches the page, so it can be checked on its own. The page and the flow
   are in app.js, which reads these names from App.numbersModel.
   ============================================================ */
(function () {
  'use strict';

  var rint = App.utils.rint;


  var pickRandomInt = App.utils.pickRandomInt;


  var POS_CLASS = ['digit-u', 'digit-d', 'digit-c'];

  var thousandsSeparator = App.utils.thousandsSeparator;


  function legendPos() {
    return '<span class="digit-u">' + App.i18n.t('leyendaUnidadesTxt') + '</span> · ' +
      '<span class="digit-d">' + App.i18n.t('leyendaDecenasTxt') + '</span> · ' +
      '<span class="digit-c">' + App.i18n.t('leyendaCentenasTxt') + '</span>';
  }

  function digits(n, labels, highlight) {
    var s = String(n);
    var groups = [];
    for (var i = s.length; i > 0; i -= 3) groups.unshift(s.slice(Math.max(0, i - 3), i));
    var html = '';
    for (var g = 0; g < groups.length; g++) {
      var body = '';
      for (var j = 0; j < groups[g].length; j++) {
        var pos = groups[g].length - 1 - j;
        var posAbs = (groups.length - 1 - g) * 3 + pos;
        var cls = POS_CLASS[pos];
        if (highlight === posAbs) cls += ' highlight';
        body += '<span class="' + cls + '">' + groups[g][j] + '</span>';
      }
      if (g > 0) html += '<span class="digit-sep">' + thousandsSeparator() + '</span>';
      if (labels && groups.length > 1) {
        html += '<span class="group"><span>' + body + '</span>' +
          '<span class="group-label">' + (App.i18n.t('grupoEtq.' + (groups.length - 1 - g)) || '&nbsp;') + '</span></span>';
      } else {
        html += body;
      }
    }
    return html;
  }

  function paintNumber(n, opts) {
    opts = opts || {};
    return '<span class="num-color">' + digits(n, opts.labels, opts.highlight) + '</span>';
  }

  function paintSign(s) { return '<span class="sign">' + s + '</span>'; }

  function buildOptions(correct, distractors, format) {
    var values = [correct];
    for (var i = 0; i < distractors.length && values.length < 3; i++) {
      var d = distractors[i];
      if (d > 0 && values.indexOf(d) === -1) values.push(d);
    }
    var extra = correct + 2;
    while (values.length < 3) {
      if (values.indexOf(extra) === -1) values.push(extra);
      extra += 3;
    }
    return App.utils.shuffle(values).map(function (v) {
      return { html: format ? format(v) : String(v), correct: v === correct };
    });
  }

  function repeat(html, times) {
    var s = '';
    for (var i = 0; i < times; i++) s += html;
    return s;
  }

  function numberAsBlocks(n) {
    return repeat('<span class="block-100">100</span>', Math.floor(n / 100)) +
      repeat('<span class="block-10">10</span>', Math.floor((n % 100) / 10)) +
      repeat('<span class="block-1"></span>', n % 10);
  }

  var GENERATORS = {

    /* Free-exploration elevator missions (positivos-y-negativos).
       Not a quiz, no prompt/options. Each generator returns a marker
       that render() detects to switch into the elevator UI
       (renderElevator). 'libre' has no target — exit when ready
       (+1 star). 'meta' has a target floor (level.meta); a
       celebration message plays once the user lands on it, then
       exit still grants the star. Same shape as the 'counter'
       generator and the water-temperature missions. */
    ascensorLibre: function (nv) {
      return { tipo: 'elevator', mode: 'libre', min: nv.min, max: nv.max };
    },
    ascensorMeta: function (nv) {
      return {
        tipo: 'elevator',
        mode: 'meta',
        min: nv.min,
        max: nv.max,
        target: nv.meta,
        inicio: (typeof nv.inicio === 'number') ? nv.inicio : 0
      };
    },

    

    

    /* The signs <, > and =. The relation is picked FIRST
       and the pair built to match it, so the three signs come up equally
       often and the answer can never be guessed by always choosing one.
       The rule taught is checkable rather than a mnemonic: the sign opens
       towards the bigger number. */
    comparar: function (nv) {
      var relations = ['lt', 'gt', 'eq'];
      var rel = relations[rint(0, 2)];
      var a = rint(nv.min, nv.max);
      var b;
      if (rel === 'eq') {
        b = a;
      } else {
        do { b = rint(nv.min, nv.max); } while (b === a);
        /* Swap so the pair actually shows the relation that was drawn. */
        if ((rel === 'lt') !== (a < b)) { var swap = a; a = b; b = swap; }
      }
      var sign = rel === 'eq' ? '=' : (a < b ? '<' : '>');

      var blocksHtml = '';
      if (nv.blocks) {
        blocksHtml = '<div class="blocks compare-blocks">' +
          '<span class="blocks-group">' + numberAsBlocks(a) + '</span>' +
          '<span class="blocks-group">' + numberAsBlocks(b) + '</span>' +
          '</div>';
      }

      return {
        prompt: App.i18n.t('gen.compararEnunciado'),
        visual: '<div class="compare-row">' +
          '<span class="compare-side">' + paintNumber(a) + '</span>' +
          '<span class="compare-gap">?</span>' +
          '<span class="compare-side">' + paintNumber(b) + '</span>' +
          '</div>' + blocksHtml +
          '<p class="hint">' + App.i18n.t('gen.compararPista') + '</p>',
        visualAria: App.i18n.t('gen.compararAria').replace('{a}', a).replace('{b}', b),
        hint: App.i18n.t('gen.socraticCompare'),
        options: App.utils.shuffle([
          { html: '<span class="compare-sign">&lt;</span>', aria: App.i18n.t('gen.signLess'), correct: sign === '<' },
          { html: '<span class="compare-sign">&gt;</span>', aria: App.i18n.t('gen.signGreater'), correct: sign === '>' },
          { html: '<span class="compare-sign">=</span>', aria: App.i18n.t('gen.signEqual'), correct: sign === '=' }
        ]),
        inline: true
      };
    },

    bloques: function (nv) {
      var n = nv.max === 99 ? rint(11, 99) : rint(111, 999);
      var c = Math.floor(n / 100);
      var d = Math.floor((n % 100) / 10);
      var u = n % 10;
      var parts = [];
      if (c) parts.push(c + ' ' + App.i18n.t(c === 1 ? 'centenaSingular' : 'centenaPlural'));
      if (d) parts.push(d + ' ' + App.i18n.t(d === 1 ? 'decenaSingular' : 'decenaPlural'));
      if (u) parts.push(u + ' ' + App.i18n.t(u === 1 ? 'unidadSingular' : 'unidadPlural'));
      var conjunction = App.i18n.locale() === 'en' ? ' and $1' : ' y $1';
      var text = parts.join(', ').replace(/, ([^,]+)$/, conjunction);
      var html = '<div class="blocks">';
      if (c) html += '<span class="blocks-group">' + repeat('<span class="block-100">100</span>', c) + '</span>';
      if (d) html += '<span class="blocks-group">' + repeat('<span class="block-10">10</span>', d) + '</span>';
      if (u) html += '<span class="blocks-group">' + repeat('<span class="block-1"></span>', u) + '</span>';
      html += '</div>';
      var swapped = c * 100 + u * 10 + d; /* tens and units swapped */
      return {
        prompt: App.i18n.t('gen.bloquesEnunciado'),
        visual: html,
        visualAria: App.i18n.t('gen.bloquesVisualAria').replace('{text}', text),
        legend: legendPos(),
        hint: App.i18n.t('gen.socraticBlocks'),
        options: buildOptions(n,
          App.utils.shuffle([swapped !== n ? swapped : n + 1, n + 10, n - 10, n + 1]),
          function (v) { return paintNumber(v); })
      };
    },

    /* Place-value exchange: 10 of one kind become 1 of the next
       (units— tens, tens— hundreds, hundreds— thousands). Even questions
       group small blocks into framed tens; odd questions go the other
       way (how many small ones make these big blocks?). */
    canje: function (nv, i) {
      var blocks = [
        '<span class="block-1"></span>',
        '<span class="block-10">10</span>',
        '<span class="block-100">100</span>',
        '<span class="block-1000">1' + thousandsSeparator() + '000</span>'
      ];
      var hint = App.i18n.t('gen.canjePista' + nv.lugar);
      if (i % 2 === 0) {
        /* Big blocks get large fast: fewer groups for bigger places. */
        var k = rint(2, [5, 4, 3][nv.lugar]);
        var n = k * 10;
        var statement = App.i18n.t('gen.canjeDirecto' + nv.lugar).replace('{n}', n);
        return {
          prompt: statement,
          visual: '<div class="blocks">' +
            repeat('<span class="trade-group">' + repeat(blocks[nv.lugar], 10) + '</span>', k) +
            '</div><p class="hint">' + hint + '</p>',
          visualAria: App.i18n.t('gen.canjeAriaDirecto').replace('{k}', k),
          legend: legendPos(),
          hint: App.i18n.t('gen.socraticTradeUp'),
          options: buildOptions(k, [n, k + 1, k - 1],
            function (v) { return paintNumber(v); })
        };
      }
      var kInv = rint(2, 9);
      var statementInv = App.i18n.t('gen.canjeInverso' + nv.lugar).replace('{k}', kInv);
      return {
        prompt: statementInv,
        visual: '<div class="blocks"><span class="blocks-group">' +
          repeat(blocks[nv.lugar + 1], kInv) +
          '</span></div><p class="hint">' + hint + '</p>',
        visualAria: App.i18n.t('gen.canjeAriaInverso').replace('{k}', kInv),
        legend: legendPos(),
        hint: App.i18n.t('gen.socraticTradeDown'),
        options: buildOptions(kInv * 10, [kInv, kInv * 10 + 10, (kInv - 1) * 10],
          function (v) { return paintNumber(v); })
      };
    },

    /* —10 ladder: multiplying a power of ten by 10 moves every digit
       one place left, up to 10^12 (un billón / one trillion). The
       exponent range gives exactly 6 rungs per level, so a round
       walks the whole ladder without repeats. */
    escalera: function (nv) {
      var exponents = [];
      for (var e = nv.minExp; e <= nv.maxExp; e++) exponents.push(e);
      var exp = App.utils.drawRound('esc' + nv.id, exponents);
      var n = Math.pow(10, exp);
      var correct = n * 10;
      return {
        prompt: App.i18n.t('gen.escaleraEnunciado'),
        hint: App.i18n.t('gen.socraticLadder'),
        visual: '<div class="expression">' + paintNumber(10) + paintSign('—') +
          paintNumber(n, { labels: true }) + paintSign('=') +
          '<span class="num-box empty">?</span></div>' +
          '<p class="hint">' + App.i18n.t('gen.escaleraPista') + '</p>',
        legend: legendPos(),
        options: buildOptions(correct, [n, correct * 10],
          function (v) { return paintNumber(v); })
      };
    },



    /* Free-exploration counter: not a quiz, no prompt/options. Returns
       a marker that render() detects to switch into the counter UI
       (see renderCounter below). 'max' bounds the value silently. */
    counter: function (nv) {
      return { tipo: 'counter', max: nv.max || 1000000000000 };
    },

    /* "Leer números" — interactive reading practice. Each question
       asks the user to read a number shown in WORDS and write it
       in numeric form. The number is generated on demand by a
       "Generar" button (a new random pick within the level's digit
       range) so the user controls when the next prompt appears.
       The round's 6 questions are tracked by index; the
       `correct` field is the canonical numeric string to compare
       against. Same digit count per level so progress feels
       coherent. The visual is the number painted in words (so the
       user has to "read" it, not just copy a digit string). */
    lecturaInput: function (nv) {
      var minD = (typeof nv.minDigits === 'number') ? nv.minDigits : 1;
      var maxD = (typeof nv.maxDigits === 'number') ? nv.maxDigits : 10;
      /* One question per round step: the GENERATED number is decided
         up front so the "Comprobar" / "Ver resultado" buttons have
         a stable value to compare against. If the user wants
         another number mid-question they re-click "Generar" (handled
         in paintLecturaInput) and the value is replaced. */
      var digits = rint(minD, maxD);
      var n;
      if (digits === 1) {
        n = rint(1, 9);
      } else {
        /* First digit 1–9 (no leading zero), rest 0–9. */
        var first = rint(1, 9);
        var rest = '';
        for (var k = 1; k < digits; k++) rest += rint(0, 9);
        n = parseInt(first + rest, 10);
      }
      return {
        tipo: 'lecturaInput',
        n: n,
        words: numberToWords(n),
        /* Canonical form: digits only, no thousand separator. The
           number is read aloud without separators ("uno dos tres
           cuatro cinco seis siete ocho nueve cero"), so the
           canonical answer to type matches. */
        correct: String(n),
        prompt: App.i18n.t('gen.lecturaInputPrompt')
      };
    },

    /* "Escribir números" — sibling of lecturaInput: same UI (Generar /
       input / Comprobar / Ver resultado / Siguiente), but instead of
       showing the number in words, the app SPEAKS the number aloud
       via App.tts.speak(numberToWords(n)). No visual representation:
       the user has to listen and write what they heard. A
       "🔊 Reproducir" button is added so the user can replay the
       audio before answering. The canonical answer is the digit
       string, so the comparison is identical to lecturaInput. The
       number is decided up front by the generator so the "Reproducir"
       and "Ver resultado" buttons can replay/reveal the same value. */
    escribirInput: function (nv) {
      var minD = (typeof nv.minDigits === 'number') ? nv.minDigits : 1;
      var maxD = (typeof nv.maxDigits === 'number') ? nv.maxDigits : 10;
      var digits = rint(minD, maxD);
      var n;
      if (digits === 1) {
        n = rint(1, 9);
      } else {
        var first = rint(1, 9);
        var rest = '';
        for (var k = 1; k < digits; k++) rest += rint(0, 9);
        n = parseInt(first + rest, 10);
      }
      return {
        tipo: 'escribirInput',
        n: n,
        words: numberToWords(n),
        correct: String(n),
        prompt: App.i18n.t('gen.escribirInputPrompt')
      };
    }
  };

  function counterSay(n) {
    if (!n) { if (false && App.tts && App.tts.speak) App.tts.speak(App.i18n.locale() === 'en' ? 'zero' : 'cero'); return; }
    var words = DATA.potencias[App.i18n.locale()];
    var exp = -1;
    var v = n;
    while (v >= 10 && v % 10 === 0) { v = v / 10; exp += 1; }
    if (v === 1 && exp >= 0 && exp < words.length) {
      if (false && App.tts && App.tts.speak) App.tts.speak(words[exp]);
      return;
    }
    /* Not a clean power of ten: read the formatted number. The
       thousands separator makes it sound natural for place value
       practice. */
    var sep = thousandsSeparator();
    var s = String(n);
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch >= '0' && ch <= '9') {
        out += (App.i18n.locale() === 'en' ? numberNameEn(ch) : numberNameEs(ch));
      } else if (ch === sep) {
        out += ', ';
      } else {
        out += ch;
      }
      if (i < s.length - 1) out += ' ';
    }
    if (false && App.tts && App.tts.speak) App.tts.speak(out);
  }

  var DIGIT_NAMES_ES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  var DIGIT_NAMES_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  function numberNameEs(d) { return DIGIT_NAMES_ES[+d]; }
  function numberNameEn(d) { return DIGIT_NAMES_EN[+d]; }

  var SMALL_ES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  var TENS_ES = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  var HUNDREDS_ES = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  var SMALL_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS_EN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function under100Es(n) {
    if (n < 20) return SMALL_ES[n];
    if (n < 30) {
      var twenties = ['', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
      return n === 20 ? 'veinte' : twenties[n - 20];
    }
    return n % 10 ? TENS_ES[Math.floor(n / 10)] + ' y ' + SMALL_ES[n % 10] : TENS_ES[Math.floor(n / 10)];
  }

  function under1000Es(n) {
    if (n < 100) return under100Es(n);
    if (n === 100) return 'cien';
    return HUNDREDS_ES[Math.floor(n / 100)] + (n % 100 ? ' ' + under100Es(n % 100) : '');
  }

  function numberToWordsEs(n) {
    if (n < 1000) return under1000Es(n);
    if (n >= 1000000000000) {
      return n === 1000000000000 ? 'un billón' : under1000Es(Math.floor(n / 1000000000000)) + ' billones';
    }
    if (n >= 1000000000) {
      var millionCount = Math.floor(n / 1000000);
      var millionRest = n % 1000000;
      var billionWords = millionCount === 1000 ? 'mil millones' : numberToWordsEs(millionCount) + ' millones';
      return billionWords + (millionRest ? ' ' + numberToWordsEs(millionRest) : '');
    }
    if (n >= 1000000) {
      var millions = Math.floor(n / 1000000);
      var millionRest = n % 1000000;
      return (millions === 1 ? 'un millón' : under1000Es(millions) + ' millones') + (millionRest ? ' ' + numberToWordsEs(millionRest) : '');
    }
    var thousands = Math.floor(n / 1000);
    var thousandRest = n % 1000;
    return (thousands === 1 ? 'mil' : under1000Es(thousands) + ' mil') + (thousandRest ? ' ' + under1000Es(thousandRest) : '');
  }

  function under100En(n) {
    if (n < 20) return SMALL_EN[n];
    return n % 10 ? TENS_EN[Math.floor(n / 10)] + '-' + SMALL_EN[n % 10] : TENS_EN[Math.floor(n / 10)];
  }

  function under1000En(n) {
    if (n < 100) return under100En(n);
    return SMALL_EN[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + under100En(n % 100) : '');
  }

  function numberToWordsEn(n) {
    if (n < 1000) return under1000En(n);
    var scales = [[1000000000000, 'trillion'], [1000000000, 'billion'], [1000000, 'million'], [1000, 'thousand']];
    for (var i = 0; i < scales.length; i++) {
      if (n >= scales[i][0]) {
        var count = Math.floor(n / scales[i][0]);
        var rest = n % scales[i][0];
        return numberToWordsEn(count) + ' ' + scales[i][1] + (rest ? ' ' + numberToWordsEn(rest) : '');
      }
    }
    return String(n);
  }

  function numberToWords(n) {
    return App.i18n.locale() === 'en' ? numberToWordsEn(n) : numberToWordsEs(n);
  }


  App.numbersModel = {
    pickRandomInt: pickRandomInt,
    POS_CLASS: POS_CLASS,
    thousandsSeparator: thousandsSeparator,
    legendPos: legendPos,
    digits: digits,
    paintNumber: paintNumber,
    paintSign: paintSign,
    buildOptions: buildOptions,
    repeat: repeat,
    numberAsBlocks: numberAsBlocks,
    GENERATORS: GENERATORS,
    counterSay: counterSay,
    DIGIT_NAMES_ES: DIGIT_NAMES_ES,
    DIGIT_NAMES_EN: DIGIT_NAMES_EN,
    numberNameEs: numberNameEs,
    numberNameEn: numberNameEn,
    SMALL_ES: SMALL_ES,
    TENS_ES: TENS_ES,
    HUNDREDS_ES: HUNDREDS_ES,
    SMALL_EN: SMALL_EN,
    TENS_EN: TENS_EN,
    under100Es: under100Es,
    under1000Es: under1000Es,
    numberToWordsEs: numberToWordsEs,
    under100En: under100En,
    under1000En: under1000En,
    numberToWordsEn: numberToWordsEn,
    numberToWords: numberToWords
  };
})();
