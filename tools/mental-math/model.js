/* ============================================================
   Calculia — mental-math: the model (no page in it).
   The questions, the numbers and the drawings as HTML text. Nothing here
   touches the page, so it can be checked on its own. The page and the flow
   are in app.js, which reads these names from App.mentalMathModel.
   ============================================================ */
(function () {
  'use strict';


  var rint = App.utils.rint;


  var POS_CLASS = ['digit-u', 'digit-d', 'digit-c'];

  var thousandsSeparator = App.utils.thousandsSeparator;


  function legendPos() {
    return '<span class="digit-u">' + App.i18n.t('leyendaUnidadesTxt') + '</span> · ' +
      '<span class="digit-d">' + App.i18n.t('leyendaDecenasTxt') + '</span> · ' +
      '<span class="digit-c">' + App.i18n.t('leyendaCentenasTxt') + '</span>';
  }

  function digits(n, highlight) {
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
      html += body;
    }
    return html;
  }

  function paintNumber(n, opts) {
    opts = opts || {};
    return '<span class="num-color">' + digits(n, opts.highlight) + '</span>';
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

  function dotsGroup(n, cls) {
    return '<span class="dot-group">' + repeat('<span class="dot ' + cls + '"></span>', n) + '</span>';
  }

  /* Dots to subtract: the last "remove" ones get an X. */
  function dotsGroupSubtract(total, remove) {
    var s = '';
    for (var i = 0; i < total; i++) {
      var cls = i >= (total - remove) ? 'dot removed' : 'dot';
      s += '<span class="' + cls + '"></span>';
    }
    return '<span class="dot-group">' + s + '</span>';
  }

  function unitDots(n, cls) {
    return repeat('<span class="dot ' + (cls || '') + '"></span>', n);
  }

  function baseTen(n, remove) {
    var bars = Math.floor(n / 10);
    var units = n % 10;
    var removedBars = 0, removedUnits = 0;
    if (remove) {
      if (remove % 10 === 0) removedBars = remove / 10;
      else removedUnits = remove;
    }
    var html = '';
    for (var b = 0; b < bars; b++) {
      var barCls = (b >= bars - removedBars) ? 'removed' : '';
      html += '<span class="ten-bar">' + unitDots(10, barCls) + '</span>';
    }
    if (units) {
      var u = '';
      for (var i = 0; i < units; i++) {
        u += '<span class="dot ' + (i >= units - removedUnits ? 'removed' : '') + '"></span>';
      }
      html += '<span class="unit-group">' + u + '</span>';
    }
    return html;
  }

  function addedPieces(step) {
    if (step === 10) return '<span class="ten-bar">' + unitDots(10, 'pb') + '</span>';
    return '<span class="unit-group">' + unitDots(step, 'pb') + '</span>';
  }

  function anchorStart(nv) {
    var step = nv.step;
    var adding = nv.op === 'add';
    var tens = rint(0, Math.floor(nv.max / 10));
    var units;
    if (step === 10) {
      units = rint(0, 9);
      if (!adding && tens === 0) tens = 1;
    } else if (adding) {
      units = rint(0, 9 - step);
    } else {
      units = rint(step, 9);
    }
    var a = tens * 10 + units;
    return a === 0 ? step : a;
  }

  function baseTenBorrow(n, remove) {
    var bars = Math.floor(n / 10) - 1;
    var brokenUnits = (n % 10) + 10;
    var html = '';
    for (var b = 0; b < bars; b++) {
      html += '<span class="ten-bar">' + unitDots(10, '') + '</span>';
    }
    var u = '';
    for (var i = 0; i < brokenUnits; i++) {
      u += '<span class="dot ' + (i >= brokenUnits - remove ? 'removed' : '') + '"></span>';
    }
    html += '<span class="unit-group">' + u + '</span>';
    return html;
  }

  function carryStart() {
    var tens = rint(1, 8);
    var units = rint(5, 9);
    var b = rint(Math.max(1, 10 - units), 9);
    return { a: tens * 10 + units, b: b };
  }

  function borrowStart() {
    var tens = rint(2, 8);
    var units = rint(0, 4);
    var b = rint(units + 1, 9);
    return { a: tens * 10 + units, b: b };
  }

  var GENERATORS = {

    /* +1 / -1, +10 / -10, +5 / -5 on a base-ten picture. */
    anchor: function (nv) {
      var step = nv.step;
      var adding = nv.op === 'add';
      var a = anchorStart(nv);
      var correct = adding ? a + step : a - step;
      var hintKey = step === 1 ? 'anchorHintOne' : (step === 5 ? 'anchorHintFive' : 'anchorHintTen');
      return {
        prompt: App.i18n.t(adding ? 'gen.anchorAddPrompt' : 'gen.anchorSubtractPrompt')
          .replace('{a}', a).replace('{step}', step),
        visual: '<div class="expression">' + paintNumber(a) +
          paintSign(adding ? '+' : '−') + paintNumber(step) + paintSign('=') +
          '<span class="num-box empty">?</span></div>' +
          '<div class="dot-array" aria-hidden="true">' +
            baseTen(a, adding ? 0 : step) +
            (adding ? paintSign('+') + addedPieces(step) : '') +
          '</div>' +
          '<p class="hint">' + App.i18n.t('gen.' + hintKey) + '</p>',
        hint: App.i18n.t('gen.socraticAnchor'),
        options: buildOptions(correct,
          /* Near misses that a real mistake would produce: moving by one
             instead of by the anchor, or by the anchor twice. */
          [adding ? a + 1 : a - 1, adding ? correct + step : correct - step, a],
          function (v) { return paintNumber(v); })
      };
    },

    /* Loose units joined to whole tens (30 + 4), or taken off again
       (47 - 7). Nothing crosses a ten, so the tens bar never changes. */
    placeValue: function (nv) {
      var adding = nv.op === 'add';
      var tens = rint(1, 6);
      var units = rint(1, 9);
      var whole = tens * 10;
      if (adding) {
        var sum = whole + units;
        return {
          prompt: App.i18n.t('gen.placeValueAddPrompt').replace('{a}', whole).replace('{b}', units),
          visual: '<div class="expression">' + paintNumber(whole) + paintSign('+') +
            paintNumber(units) + paintSign('=') + '<span class="num-box empty">?</span></div>' +
            '<div class="dot-array" aria-hidden="true">' + baseTen(whole) +
            paintSign('+') + '<span class="unit-group">' + unitDots(units, 'pb') + '</span></div>' +
            '<p class="hint">' + App.i18n.t('gen.placeValueAddHint') + '</p>',
          legend: legendPos(),
          hint: App.i18n.t('gen.socraticPlaceAdd'),
          /* tens + units is the classic slip: adding the digits instead
             of joining tens and units. */
          options: buildOptions(sum, [tens + units, sum + 1, whole],
            function (v) { return paintNumber(v); })
        };
      }
      var start = whole + units;
      return {
        prompt: App.i18n.t('gen.placeValueSubtractPrompt').replace('{a}', start).replace('{b}', units),
        visual: '<div class="expression">' + paintNumber(start) + paintSign('−') +
          paintNumber(units) + paintSign('=') + '<span class="num-box empty">?</span></div>' +
          '<div class="dot-array" aria-hidden="true">' + baseTen(start, units) + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.placeValueSubtractHint') + '</p>',
        legend: legendPos(),
        hint: App.i18n.t('gen.socraticPlaceSub'),
        options: buildOptions(whole, [start, whole - units, whole + units],
          function (v) { return paintNumber(v); })
      };
    },

    /* Addition that crosses a ten: ten loose units regroup into a new
       bar. The only new idea versus placeValue is the crossing itself —
       the picture still shows bars + loose dots, nothing new to read. */
    carry: function () {
      var start = carryStart();
      var a = start.a, b = start.b;
      var correct = a + b;
      var unitsA = a % 10;
      /* Classic slip: write (unitsA + b) % 10 in the units place but
         forget to carry the extra ten into the tens place. */
      var forgotCarry = Math.floor(a / 10) * 10 + (unitsA + b) % 10;
      return {
        prompt: App.i18n.t('gen.carryAddPrompt').replace('{a}', a).replace('{b}', b),
        visual: '<div class="expression">' + paintNumber(a) + paintSign('+') +
          paintNumber(b) + paintSign('=') + '<span class="num-box empty">?</span></div>' +
          '<div class="dot-array" aria-hidden="true">' + baseTen(a) +
          paintSign('+') + '<span class="unit-group">' + unitDots(b, 'pb') + '</span></div>' +
          '<p class="hint">' + App.i18n.t('gen.carryAddHint') + '</p>',
        hint: App.i18n.t('gen.socraticCarry'),
        options: buildOptions(correct, [forgotCarry, correct + 10, a],
          function (v) { return paintNumber(v); })
      };
    },

    /* Subtraction that needs a borrow: one bar breaks into ten loose
       dots so there is enough to take away. Same picture family as
       placeValue's removal, just with the broken bar shown up front. */
    borrow: function () {
      var start = borrowStart();
      var a = start.a, b = start.b;
      var correct = a - b;
      var unitsA = a % 10;
      /* Classic slip: subtract the smaller digit from the larger one
         regardless of order, leaving the tens untouched. */
      var flipped = Math.floor(a / 10) * 10 + Math.abs(unitsA - b);
      return {
        prompt: App.i18n.t('gen.borrowSubtractPrompt').replace('{a}', a).replace('{b}', b),
        visual: '<div class="expression">' + paintNumber(a) + paintSign('−') +
          paintNumber(b) + paintSign('=') + '<span class="num-box empty">?</span></div>' +
          '<div class="dot-array" aria-hidden="true">' + baseTenBorrow(a, b) + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.borrowSubtractHint').replace('{b}', b) + '</p>',
        hint: App.i18n.t('gen.socraticBorrow'),
        options: buildOptions(correct, [flipped, correct - 10, a],
          function (v) { return paintNumber(v); })
      };
    },

    restar: function (nv) {
      var a = rint(nv.a[0], nv.a[1]);
      var b = rint(1, Math.min(nv.maxB, a));
      var correct = a - b;
      return {
        prompt: App.i18n.t('gen.restarEnunciado').replace('{a}', a).replace('{b}', b),
        visual: '<div class="expression">' + paintNumber(a) + paintSign('−') + paintNumber(b) +
          paintSign('=') + '<span class="num-box empty">?</span></div>' +
          '<div class="dot-array" aria-hidden="true">' + dotsGroupSubtract(a, b) + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.restarPista').replace('{b}', b) + '</p>',
        hint: App.i18n.t('gen.socraticRestar'),
        options: buildOptions(correct, [correct - 1, correct + 1, a],
          function (v) { return paintNumber(v); })
      };
    },

    doubles: function () {
      var a = rint(2, 12);
      return {
        prompt: App.i18n.t('gen.doblesEnunciado').replace(/\{a\}/g, a),
        visual: '<div class="expression">' + paintNumber(a) + paintSign('+') + paintNumber(a) +
          paintSign('=') + '<span class="num-box empty">?</span></div>' +
          '<div class="dot-array" aria-hidden="true">' + dotsGroup(a, 'pa') +
          paintSign('+') + dotsGroup(a, 'pb') + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.doblesPista') + '</p>',
        hint: App.i18n.t('gen.socraticDoubles'),
        options: buildOptions(2 * a, [2 * a - 1, 2 * a + 2, 2 * a + 1],
          function (v) { return paintNumber(v); })
      };
    },

    sumLarge: function (nv) {
      var n, highlight, hint;
      if (nv.suma === 10) {
        n = rint(1, 8) * 10 + rint(1, 9);
        if (Math.random() < 0.4) n += rint(1, 4) * 100;
        highlight = 1;
        hint = App.i18n.t('gen.hintDecenas');
      } else if (nv.suma === 100) {
        n = rint(1, 8) * 100 + rint(0, 99);
        highlight = 2;
        hint = App.i18n.t('gen.hintCentenas');
      } else {
        n = rint(1, 8) * 1000 + rint(0, 999);
        highlight = 3;
        hint = App.i18n.t('gen.hintMiles');
      }
      var correct = n + nv.suma;
      return {
        prompt: App.i18n.t('gen.sumaGrandeEnunciado').replace('{n}', n).replace('{suma}', nv.suma),
        visual: '<div class="expression">' + paintNumber(n, { highlight: highlight }) +
          paintSign('+') + paintNumber(nv.suma) + paintSign('=') +
          '<span class="num-box empty">?</span></div>' +
          '<p class="hint">' + hint + '</p>',
        legend: legendPos(),
        hint: App.i18n.t('gen.socraticSumLarge'),
        options: buildOptions(correct,
          App.utils.shuffle([n + 1, n + nv.suma * 2, correct + nv.suma / 10]),
          function (v) { return paintNumber(v); })
      };
    },

    subtractLarge: function (nv) {
      var n, highlight, hint;
      if (nv.resta === 10) {
        n = rint(1, 8) * 10 + rint(1, 9);
        if (Math.random() < 0.4) n += rint(1, 4) * 100;
        highlight = 1;
        hint = App.i18n.t('gen.hintDecenas');
      } else if (nv.resta === 100) {
        n = rint(1, 8) * 100 + rint(0, 99);
        highlight = 2;
        hint = App.i18n.t('gen.hintCentenas');
      } else {
        n = rint(1, 8) * 1000 + rint(0, 999);
        highlight = 3;
        hint = App.i18n.t('gen.hintMiles');
      }
      var correct = n - nv.resta;
      return {
        prompt: App.i18n.t('gen.restaGrandeEnunciado').replace('{n}', n).replace('{resta}', nv.resta),
        visual: '<div class="expression">' + paintNumber(n, { highlight: highlight }) +
          paintSign('−') + paintNumber(nv.resta) + paintSign('=') +
          '<span class="num-box empty">?</span></div>' +
          '<p class="hint">' + hint + '</p>',
        legend: legendPos(),
        hint: App.i18n.t('gen.socraticSubtractLarge'),
        options: buildOptions(correct,
          App.utils.shuffle([n - 1, correct - nv.resta, n + nv.resta]),
          function (v) { return paintNumber(v); })
      };
    },

    multiplyLarge: function (nv) {
      var n = rint(2, 99);
      var correct = n * nv.factor;
      var zeros = App.i18n.t(nv.factor === 10 ? 'gen.cerosUno' : 'gen.cerosDos');
      var distractors = nv.factor === 10 ?
        [n, n * 100, correct + 1] :
        [n, n * 10, correct + 10];
      return {
        prompt: App.i18n.t('gen.multiplicaGrandeEnunciado').replace('{n}', n).replace('{factor}', nv.factor),
        visual: '<div class="expression">' + paintNumber(n) + paintSign('×') + paintNumber(nv.factor) +
          paintSign('=') + '<span class="num-box empty">?</span></div>' +
          '<p class="hint">' + App.i18n.t('gen.multiplicaGrandePista').replace('{ceros}', zeros).replace('{n}', n) + '</p>',
        hint: App.i18n.t('gen.socraticMultiplyLarge'),
        options: buildOptions(correct, App.utils.shuffle(distractors),
          function (v) { return paintNumber(v); })
      };
    }
  };

  function groupsT(key) {
    return (typeof App !== 'undefined' && App.i18n && App.i18n.t) ? App.i18n.t(key) : key;
  }

  function groupsFormat(n) {
    var sep = App.i18n.locale() === 'en' ? ',' : '.';
    var s = String(Math.abs(Math.round(n)));
    var out = '';
    while (s.length > 3) {
      out = sep + s.slice(s.length - 3) + out;
      s = s.slice(0, s.length - 3);
    }
    out = s + out;
    return n < 0 ? '−' + out : out;
  }

  var RULE_EXAMPLES = [
    { count: 3, group: 'ten' },
    { count: 4, group: 'hundred' },
    { count: 5, group: 'ten' }
  ];
  var DOZEN_EXAMPLES = [
    { count: 2, group: 'dozen' },
    { count: 3, group: 'halfDozen' },
    { count: 2, group: 'ten' }
  ];

  function groupsEntryKey(entry) {
    return entry.mode + '|' + entry.groupId + '|' + entry.count + '|' + entry.digit;
  }

  function groupsTakeTwo(pool, correct) {
    var out = [];
    pool.forEach(function (v) {
      if (out.length < 2 && v !== correct && out.indexOf(v) === -1) out.push(v);
    });
    /* Fallback when the pool was too small (only possible with a
       group of size 1). Fill from the other groups' sizes. */
    var extra = [6, 10, 12, 100, 1000];
    var k = 0;
    while (out.length < 2 && k < extra.length) {
      if (extra[k] !== correct && out.indexOf(extra[k]) === -1) out.push(extra[k]);
      k += 1;
    }
    return out;
  }

  var GROUPS_DIGIT_CLASSES = ['grp-unit', 'grp-ten', 'grp-hundred', 'grp-thousand'];
  function groupsColoredDigits(n) {
    var s = String(Math.abs(n));
    var sep = App.i18n.locale() === 'en' ? ',' : '.';
    var groups = [];
    for (var i = s.length; i > 0; i -= 3) groups.unshift(s.slice(Math.max(0, i - 3), i));
    var html = '';
    for (var g = 0; g < groups.length; g++) {
      var body = '';
      for (var j = 0; j < groups[g].length; j++) {
        var posAbs = (groups.length - 1 - g) * 3 + (groups[g].length - 1 - j);
        var cls = GROUPS_DIGIT_CLASSES[posAbs] || 'grp-dozen';
        body += '<span class="' + cls + '">' + groups[g][j] + '</span>';
      }
      if (g > 0) html += '<span class="digit-sep">' + sep + '</span>';
      html += body;
    }
    return '<span class="num-color">' + html + '</span>';
  }

  function groupsPickHint(entry) {
    if (entry.mode === 'digitValue') {
      return groupsT('hintDigitValue');
    }
    if (entry.mode === 'numberToGroup' || entry.mode === 'numberToDozen') {
      return groupsT('hintWhichGroup');
    }
    if (entry.groupId === 'dozen' || entry.groupId === 'halfDozen') {
      return groupsT('hintDozen');
    }
    return groupsT('hintHowMany');
  }


  App.mentalMathModel = {
    POS_CLASS: POS_CLASS,
    thousandsSeparator: thousandsSeparator,
    legendPos: legendPos,
    digits: digits,
    paintNumber: paintNumber,
    paintSign: paintSign,
    buildOptions: buildOptions,
    repeat: repeat,
    dotsGroup: dotsGroup,
    dotsGroupSubtract: dotsGroupSubtract,
    unitDots: unitDots,
    baseTen: baseTen,
    addedPieces: addedPieces,
    anchorStart: anchorStart,
    baseTenBorrow: baseTenBorrow,
    carryStart: carryStart,
    borrowStart: borrowStart,
    GENERATORS: GENERATORS,
    groupsT: groupsT,
    groupsFormat: groupsFormat,
    RULE_EXAMPLES: RULE_EXAMPLES,
    DOZEN_EXAMPLES: DOZEN_EXAMPLES,
    groupsEntryKey: groupsEntryKey,
    groupsTakeTwo: groupsTakeTwo,
    GROUPS_DIGIT_CLASSES: GROUPS_DIGIT_CLASSES,
    groupsColoredDigits: groupsColoredDigits,
    groupsPickHint: groupsPickHint
  };
})();
