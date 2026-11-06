/* ============================================================
   Calculia — fractions-measures: the model (no page in it).
   The questions, the numbers and the drawings as HTML text. Nothing here
   touches the page, so it can be checked on its own. The page and the flow
   are in app.js, which reads these names from App.fractionsMeasuresModel.
   ============================================================ */
(function () {
  'use strict';

  var resolved = false;
  var fixedQuestion = null;
  var reinforceTotal = 0;

  function leyendaFrac() {
    return '<span class="digit-u">' + App.i18n.t('leyendaPartesPintadasTxt') + '</span> · ' +
      '<span class="digit-d">' + App.i18n.t('leyendaPartesTotalTxt') + '</span>';
  }

  function svgFraccion(num, den, size) {
    var cx = 60, cy = 60, r = 54;
    var paths = '';
    for (var i = 0; i < den; i++) {
      var a0 = -Math.PI / 2 + (i * 2 * Math.PI) / den;
      var a1 = a0 + (2 * Math.PI) / den;
      var x0 = (cx + r * Math.cos(a0)).toFixed(1);
      var y0 = (cy + r * Math.sin(a0)).toFixed(1);
      var x1 = (cx + r * Math.cos(a1)).toFixed(1);
      var y1 = (cy + r * Math.sin(a1)).toFixed(1);
      var fill = i < num ? 'var(--mod-razonamiento)' : 'var(--color-superficie)';
      paths += '<path d="M' + cx + ' ' + cy + ' L' + x0 + ' ' + y0 +
        ' A' + r + ' ' + r + ' 0 0 1 ' + x1 + ' ' + y1 + ' Z" fill="' + fill +
        '" stroke="var(--color-texto)" stroke-width="2"/>';
    }
    return '<svg viewBox="0 0 120 120" width="' + size + '" height="' + size + '" aria-hidden="true">' + paths + '</svg>';
  }

  function htmlFraccion(f) {
    return '<span class="frac" aria-hidden="true"><span class="frac-num">' + f[0] +
      '</span><span class="frac-den">' + f[1] + '</span></span>';
  }

  function fracOption(f) {
    return '<span class="op-frac">' + svgFraccion(f[0], f[1], 120) + htmlFraccion(f) + '</span>';
  }

  function fracAria(f) {
    return App.i18n.t('gen.fraccionAria').replace('{num}', f[0]).replace('{den}', f[1]);
  }

  function sameAmount(a, b) {
    return a[0] * b[1] === b[0] * a[1];
  }

  function decimalSeparator() {
    return App.i18n.locale() === 'en' ? '.' : ',';
  }

  function decimalText(f) {
    var places = 1;
    while (places < 6 && (f[0] * Math.pow(10, places)) % f[1] !== 0) places++;
    var scaled = (f[0] * Math.pow(10, places)) / f[1];
    if (scaled % 1 !== 0) throw new Error('fractions: ' + f.join('/') + ' has no exact decimal');
    var digits = String(scaled);
    while (digits.length <= places) digits = '0' + digits;
    return digits.slice(0, digits.length - places) + decimalSeparator() +
      digits.slice(digits.length - places);
  }

  function threeOf(correct, candidates) {
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.concat([correct + 1, correct - 1, correct + 2]).forEach(function (v) {
      if (v > 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    return list.map(function (v) {
      return { html: String(v), correct: v === correct };
    });
  }

  function tenthOptions(resultTenths, candidates) {
    var seen = {};
    var list = [resultTenths];
    seen[resultTenths] = true;
    candidates.concat([resultTenths + 1, resultTenths - 1,
      resultTenths + 2, resultTenths - 2]).forEach(function (v) {
      if (v >= 1 && v <= 10 && !seen[v] && list.length < 3) {
        seen[v] = true;
        list.push(v);
      }
    });
    if (list.length < 3) {
      throw new Error('fractions: only ' + list.length + ' answers fit in one pie');
    }
    return App.utils.shuffle(list).map(function (v) {
      var text = decimalText([v, 10]);
      return {
        html: '<span class="decimal-value">' + text + '</span>',
        aria: text,
        correct: v === resultTenths
      };
    });
  }

  function pickWrong(result, candidates) {
    var picked = [];
    candidates.forEach(function (f) {
      var repeated = picked.some(function (p) { return sameAmount(p, f); });
      if (picked.length < 2 && f[0] > 0 && f[1] > 0 && f[0] <= f[1] &&
          !repeated && !sameAmount(f, result)) {
        picked.push(f);
      }
    });
    return picked;
  }

  var GENERATORS = {

    /* Adding and subtracting fractions whose slices are NOT the same size.
       The trick is always the same one: the bigger slices are cut so both
       fractions are counted in the same slices. Both pies stay on screen,
       so what changes is visible rather than asserted.
       `casos` is [denA, numA, denB, numB] with denB a multiple of denA. */
    mixFrac: function (nv) {
      var item = App.utils.drawRound(nv.id, nv.casos);
      var a = [item[1], item[0]];
      var b = [item[3], item[2]];
      /* The common slice is the bigger denominator, because the other one
         divides it: no new idea beyond "cut the big slices". */
      var den = Math.max(a[1], b[1]);
      var aIn = a[0] * (den / a[1]);
      var bIn = b[0] * (den / b[1]);
      var adding = nv.op === 'add';
      var resultNum = adding ? aIn + bIn : aIn - bIn;
      var result = [resultNum, den];

      /* The mistake is doing the operation across the tops and the bottoms:
         adding them when adding, subtracting them when subtracting. It is
         offered with its own pie, so the person sees why it does not fit. */
      var naive = adding ? [a[0] + b[0], a[1] + b[1]] : [a[0] - b[0], a[1] - b[1]];
      var offBy = [resultNum + (resultNum + 1 <= den ? 1 : -1), den];
      var wrong = pickWrong(result, [naive, offBy, [resultNum + 1, den],
        [resultNum - 1, den], [resultNum + 2, den], [resultNum, den * 2]]);

      return {
        prompt: App.i18n.t(adding ? 'gen.mixFracAdd' : 'gen.mixFracSub'),
        hint: App.i18n.t('gen.socraticMixFrac'),
        visual: '<div class="frac-expression">' +
            htmlFraccion(a) +
            '<span class="frac-sign">' + (adding ? '+' : '−') + '</span>' +
            htmlFraccion(b) +
            '<span class="frac-sign">=</span>' +
            '<span class="frac-gap">?</span>' +
          '</div>' +
          '<div class="frac-visual-row">' +
            svgFraccion(a[0], a[1], 110) +
            '<span class="frac-sign">' + (adding ? '+' : '−') + '</span>' +
            svgFraccion(b[0], b[1], 110) +
          '</div>' +
          '<p class="hint">' + App.i18n.t('gen.mixFracHint')
            .replace(/\{den\}/g, den) + '</p>',
        visualAria: App.i18n.t('gen.mixFracAria')
          .replace('{na}', a[0]).replace('{da}', a[1])
          .replace('{nb}', b[0]).replace('{db}', b[1]),
        options: App.utils.shuffle(
          [{ html: fracOption(result), aria: fracAria(result), correct: true }].concat(
            wrong.map(function (f) {
              return { html: fracOption(f), aria: fracAria(f), correct: false };
            })
          )),
        inline: true
      };
    },

    /* A fraction OF an amount, which is how fractions are actually used:
       half of eight sweets, a quarter of twelve. The amount is drawn in
       groups, one of them marked, so the answer is counted.
       `casos` is [den, total]; the total is always a multiple of den. */
    fracOf: function (nv) {
      var item = App.utils.drawRound(nv.id, nv.casos);
      var den = item[0];
      var total = item[1];
      var each = total / den;
      var thing = App.utils.drawRound(nv.id + 'thing', nv.things);

      var groups = '';
      for (var g = 0; g < den; g++) {
        groups += '<span class="frac-group' + (g === 0 ? ' is-taken' : '') + '">';
        for (var i = 0; i < each; i++) {
          groups += '<span class="frac-token">' + thing.picto + '</span>';
        }
        groups += '</span>';
      }

      return {
        prompt: App.i18n.t('gen.fracOfPrompt')
          .replace(/\{total\}/g, total)
          .replace(/\{thing\}/g, App.i18n.t('thing.' + thing.id))
          .replace(/\{part\}/g, App.i18n.t('part.' + den)),
        hint: App.i18n.t('gen.socraticFracOf'),
        visual: '<div class="frac-groups">' + groups + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.fracOfHint')
            .replace(/\{den\}/g, den) + '</p>',
        visualAria: App.i18n.t('gen.fracOfAria')
          .replace(/\{den\}/g, den).replace(/\{each\}/g, each),
        /* Answering with the whole amount, or with the number of groups,
           are the two real confusions. When one of those happens to equal
           the answer (a quarter of 16 is 4, and there are 4 groups), the
           list is padded so there are always three buttons to choose
           between. */
        options: App.utils.shuffle(threeOf(each, [total, den]))
      };
    },

    /* Adding and taking away decimals, on the same pies as the fractions.
       Only tenths, so every step is one slice and the notation is the only
       thing that is new. `casos` is [tenthsA, tenthsB]. */
    /* A fraction and a decimal in the same sum. Both are drawn as pies, so
       the point lands by itself: they are the same kind of number, only
       written two ways, and once they are in tenths they simply add up. */
    mixedOp: function (nv) {
      var item = App.utils.drawRound(nv.id, nv.casos);
      var frac = item[0];
      var tenths = item[1];
      var fracTenths = (frac[0] * 10) / frac[1];
      var adding = nv.op === 'add';
      var resultTenths = adding ? fracTenths + tenths : fracTenths - tenths;
      var result = [resultTenths, 10];
      /* Doing the other operation, and being one tenth out, are the two
         mistakes a mixed expression actually produces. */
      var otherWay = adding ? fracTenths - tenths : fracTenths + tenths;
      return {
        /* The prompt is set as plain text, so the fraction goes in as 1/2
           and not as markup. */
        prompt: App.i18n.t(adding ? 'gen.mixedAdd' : 'gen.mixedSub')
          .replace('{a}', frac[0] + '/' + frac[1])
          .replace('{b}', decimalText([tenths, 10])),
        hint: App.i18n.t('gen.socraticMixedOp'),
        visual: '<div class="frac-visual-row">' +
            svgFraccion(frac[0], frac[1], 110) +
            '<span class="frac-sign">' + (adding ? '+' : '−') + '</span>' +
            svgFraccion(tenths, 10, 110) +
          '</div>' +
          '<p class="hint">' + App.i18n.t('gen.mixedOpHint') + '</p>',
        visualAria: App.i18n.t('gen.mixedOpAria')
          .replace('{a}', App.i18n.t('gen.fraccionAria')
            .replace('{num}', frac[0]).replace('{den}', frac[1]))
          .replace('{b}', decimalText([tenths, 10])),
        options: tenthOptions(resultTenths, [otherWay, resultTenths + 1]),
        inline: true
      };
    },

    /* Which is more, the fraction or the decimal? Both pies are on screen,
       so the two ways of writing a number are compared as what they are:
       two amounts of the same thing. */
    fracOrDecimal: function (nv) {
      var item = App.utils.drawRound(nv.id, nv.casos);
      var frac = item[0];
      var tenths = item[1];
      var fracTenths = (frac[0] * 10) / frac[1];
      var fracWins = fracTenths > tenths;
      return {
        prompt: App.i18n.t('gen.whichIsMore'),
        hint: App.i18n.t('gen.socraticFracVsDecimal'),
        visual: '<p class="hint">' + App.i18n.t('gen.mixedCompareHint') + '</p>',
        legend: '',
        options: App.utils.shuffle([
          {
            html: '<span class="op-frac">' + svgFraccion(frac[0], frac[1], 120) +
              htmlFraccion(frac) + '</span>',
            aria: App.i18n.t('gen.fraccionAria')
              .replace('{num}', frac[0]).replace('{den}', frac[1]),
            correct: fracWins
          },
          {
            html: '<span class="op-frac">' + svgFraccion(tenths, 10, 120) +
              '<span class="decimal-value">' + decimalText([tenths, 10]) + '</span></span>',
            aria: decimalText([tenths, 10]),
            correct: !fracWins
          }
        ]),
        inline: true
      };
    },

    decimalOp: function (nv) {
      var item = App.utils.drawRound(nv.id, nv.casos);
      var x = item[0];
      var y = item[1];
      var adding = nv.op === 'add';
      var resultTenths = adding ? x + y : x - y;
      var result = [resultTenths, 10];
      /* Doing the other operation is the mistake decimals actually
         produce. The shared helper pads when it collapses onto the answer
         or falls outside the pie, so the question never ends up with two
         buttons instead of three. */
      var otherWay = adding ? Math.abs(x - y) : x + y;

      return {
        prompt: App.i18n.t(adding ? 'gen.decimalAdd' : 'gen.decimalSub')
          .replace('{a}', decimalText([x, 10])).replace('{b}', decimalText([y, 10])),
        hint: App.i18n.t('gen.socraticDecimalOp'),
        visual: '<div class="frac-visual-row">' +
            svgFraccion(x, 10, 110) +
            '<span class="frac-sign">' + (adding ? '+' : '−') + '</span>' +
            svgFraccion(y, 10, 110) +
          '</div>' +
          '<p class="hint">' + App.i18n.t('gen.decimalOpHint') + '</p>',
        visualAria: App.i18n.t('gen.decimalOpAria')
          .replace('{a}', decimalText([x, 10])).replace('{b}', decimalText([y, 10])),
        options: tenthOptions(resultTenths, [otherWay, resultTenths + 1]),
        inline: true
      };
    },


    fracciones: function (nv) {
      var f = App.utils.drawRound(nv.id, nv.fracs);
      var otros = App.utils.shuffle(nv.fracs.filter(function (o) {
        return o[0] * f[1] !== o[1] * f[0]; /* remove fracciones equivalentes */
      })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.fraccionesEnunciado'),
        hint: App.i18n.t('gen.socraticFracciones'),
        visual: svgFraccion(f[0], f[1], 170),
        visualAria: App.i18n.t('gen.fraccionesVisualAria').replace('{den}', f[1]).replace('{num}', f[0]),
        legend: leyendaFrac(),
        options: App.utils.shuffle(
          [{ html: htmlFraccion(f), aria: App.i18n.t('gen.fraccionAria').replace('{num}', f[0]).replace('{den}', f[1]), correct: true }].concat(
            otros.map(function (o) {
              return { html: htmlFraccion(o), aria: App.i18n.t('gen.fraccionAria').replace('{num}', o[0]).replace('{den}', o[1]), correct: false };
            })
          )),
        inline: true
      };
    },

    comparaFrac: function (nv) {
      var par = App.utils.shuffle(App.utils.drawRound(nv.id, nv.pares));
      var greater = (par[0][0] / par[0][1] > par[1][0] / par[1][1]) ? par[0] : par[1];
      return {
        prompt: App.i18n.t('gen.comparaFracEnunciado'),
        hint: App.i18n.t('gen.socraticComparaFrac'),
        visual: '',
        options: par.map(function (f) {
          return { html: fracOption(f), aria: fracAria(f), correct: f === greater };
        }),
        inline: true
      };
    },

    /* Equivalent fractions: different numbers, the same
       amount. Two pies side by side make that visible, which IS the
       insight — the notation on its own hides it. */
    equivalentes: function (nv) {
      var pair = App.utils.drawRound(nv.id, nv.pares);
      var base = pair[0];
      var answer = pair[1];
      /* Alternatives must NOT be equivalent to the answer, or there would
         be two right choices. */
      var wrong = App.utils.shuffle(nv.distractores.filter(function (f) {
        return !sameAmount(f, answer);
      })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.equivalentesEnunciado'),
        hint: App.i18n.t('gen.socraticEquivalentes'),
        visual: '<div class="frac-ref">' + svgFraccion(base[0], base[1], 150) +
          htmlFraccion(base) + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.equivalentesPista') + '</p>',
        visualAria: fracAria(base),
        legend: leyendaFrac(),
        options: App.utils.shuffle(
          [{ html: fracOption(answer), aria: fracAria(answer), correct: true }].concat(
            wrong.map(function (f) {
              return { html: fracOption(f), aria: fracAria(f), correct: false };
            })
          )),
        inline: true
      };
    },

    /* Adding and subtracting fractions with the same denominator
       The slices are already the same size, so the
       denominator never changes — only the count of slices does. */
    sumaFrac: function (nv) {
      var item = App.utils.drawRound(nv.id, nv.casos);
      var den = item[0];
      var x = item[1];
      var y = item[2];
      var adding = nv.op === 'add';
      var resultNum = adding ? x + y : x - y;
      var result = [resultNum, den];

      /* The classic mistake is adding the bottom numbers too, which makes
         the slices smaller. Offering it (with its pie) shows why it is
         wrong instead of just marking it wrong. */
      var addedDenominators = [resultNum, den + den];
      var offByOneNum = resultNum + (resultNum + 1 <= den ? 1 : -1);
      var wrong = [addedDenominators, [offByOneNum, den]].filter(function (f) {
        return f[0] > 0 && f[1] > 0 && !sameAmount(f, result);
      });

      return {
        prompt: App.i18n.t(adding ? 'gen.sumaFracEnunciado' : 'gen.restaFracEnunciado'),
        hint: App.i18n.t('gen.socraticSumaFrac'),
        visual: '<div class="frac-expression">' +
            htmlFraccion([x, den]) +
            '<span class="frac-sign">' + (adding ? '+' : '−') + '</span>' +
            htmlFraccion([y, den]) +
            '<span class="frac-sign">=</span>' +
            '<span class="frac-gap">?</span>' +
          '</div>' +
          '<div class="frac-visual-row">' +
            svgFraccion(x, den, 110) +
            '<span class="frac-sign">' + (adding ? '+' : '−') + '</span>' +
            svgFraccion(y, den, 110) +
          '</div>' +
          '<p class="hint">' + App.i18n.t('gen.sumaFracPista') + '</p>',
        /* {den} appears twice, so it needs a global replace — a plain
           string replace would leave the second one in the spoken text. */
        visualAria: App.i18n.t(adding ? 'gen.sumaFracAria' : 'gen.restaFracAria')
          .replace('{x}', x).replace('{y}', y).replace(/\{den\}/g, den),
        options: App.utils.shuffle(
          [{ html: fracOption(result), aria: fracAria(result), correct: true }].concat(
            wrong.map(function (f) {
              return { html: fracOption(f), aria: fracAria(f), correct: false };
            })
          )),
        inline: true
      };
    },

    /* Decimal numbers, taught as another way of writing the fractions
       already learned —
       same pies, new notation. `dir` picks the direction: read the
       picture and name the decimal, or read the decimal and find the
       picture. The everyday anchor (prices, litres) lives in the
       activity instruction, not in every question. */
    decimalPie: function (nv) {
      var f = App.utils.drawRound(nv.id, nv.fracs);
      var others = App.utils.shuffle(nv.fracs.filter(function (o) {
        return !sameAmount(o, f);
      })).slice(0, 2);
      /* Tenths get the "each part is 0,1" rule; halves and quarters get
         the "look at how much is painted" one, because counting ten
         slices is not what those levels are about. */
      var hint = App.i18n.t(f[1] === 10 ? 'gen.decimalHintTenths' : 'gen.decimalHintParts');

      if (nv.dir === 'toPicture') {
        return {
          prompt: App.i18n.t('gen.decimalToPicturePrompt'),
        hint: App.i18n.t('gen.socraticDecimalToPicture'),
          visual: '<div class="frac-ref"><span class="decimal-value">' +
            decimalText(f) + '</span></div>' +
            '<p class="hint">' + hint + '</p>',
          visualAria: decimalText(f),
          options: App.utils.shuffle(
            [{ html: fracOption(f), aria: fracAria(f), correct: true }].concat(
              others.map(function (o) {
                return { html: fracOption(o), aria: fracAria(o), correct: false };
              })
            )),
          inline: true
        };
      }
      return {
        prompt: App.i18n.t('gen.decimalToNumberPrompt'),
        hint: App.i18n.t('gen.socraticDecimalToNumber'),
        visual: '<div class="frac-ref">' + svgFraccion(f[0], f[1], 150) + '</div>' +
          '<p class="hint">' + hint + '</p>',
        visualAria: fracAria(f),
        legend: leyendaFrac(),
        options: App.utils.shuffle(
          [{ html: '<span class="decimal-value">' + decimalText(f) + '</span>', correct: true }].concat(
            others.map(function (o) {
              return { html: '<span class="decimal-value">' + decimalText(o) + '</span>', correct: false };
            })
          )),
        inline: true
      };
    }
  };

  var INTRO = {
    fracciones: {
      slides: [
        { key: 'parts', visual: function () { return fracOption([3, 4]); } },
        { key: 'notation', visual: function () {
          return '<div class="intro-notation">' + htmlFraccion([3, 4]) + leyendaFrac() + '</div>';
        } },
        { key: 'size', visual: function () {
          return '<div class="intro-compare">' + fracOption([1, 2]) + fracOption([1, 4]) + '</div>';
        } }
      ],
      real: [
        { key: 'pizza', picto: '🍕' },
        { key: 'clock', picto: '⏰' },
        { key: 'money', picto: '💶' },
        { key: 'bottle', picto: '🥤' }
      ]
    },
    decimales: {
      slides: [
        { key: 'whole', visual: function () {
          return '<div class="intro-notation"><span class="decimal-value">' +
            '<span class="digit-u">3</span>' + decimalSeparator() + '47</span></div>';
        } },
        { key: 'decimal', visual: function () {
          return '<div class="intro-notation"><span class="decimal-value">3' + decimalSeparator() +
            '<span class="digit-d">47</span></span></div>';
        } },
        { key: 'tenths', visual: function () {
          return '<div class="intro-notation">' + svgFraccion(3, 10, 170) +
            '<span class="decimal-value">' + decimalText([3, 10]) + '</span></div>';
        } },
        { key: 'point', visual: function () {
          return '<div class="intro-notation"><span class="decimal-value">' +
            '<span class="digit-u">0</span>' + decimalSeparator() +
            '<span class="digit-d">3</span></span></div>';
        } },
        { key: 'half', visual: function () {
          return '<div class="intro-compare">' +
            '<span class="op-frac">' + svgFraccion(1, 2, 120) +
              '<span class="decimal-value">' + decimalText([1, 2]) + '</span></span>' +
            '<span class="op-frac">' + svgFraccion(1, 4, 120) +
              '<span class="decimal-value">' + decimalText([1, 4]) + '</span></span>' +
          '</div>';
        } }
      ],
      real: [
        { key: 'height', picto: '🧍' },
        { key: 'coins', picto: '💰' },
        { key: 'price', picto: '💶' },
        { key: 'milk', picto: '🥛' },
        { key: 'ribbon', picto: '📏' },
        { key: 'candy', picto: '🍬' }
      ]
    }
  };

  function comaT(key) { return App.i18n.t('coma.' + key); }

  /* Decimal separator of the locale: comma in Spanish, point in English. */
  function comaSeparator() { return App.i18n.locale() === 'en' ? '.' : ','; }

  var COMA_WORDS = {
    es: {
      units: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'],
      teens: ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'],
      twenties: ['veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'],
      tens: ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'],
      hundreds: ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']
    },
    en: {
      units: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
      teens: ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
      tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
    }
  };

  function comaSpeakWhole(n, locale) {
    var w = locale === 'en' ? COMA_WORDS.en : COMA_WORDS.es;
    var parts = [];
    var h = Math.floor(n / 100);
    var rest = n % 100;
    if (h) {
      if (locale === 'en') parts.push(w.units[h] + ' hundred');
      else parts.push(h === 1 && rest === 0 ? 'cien' : w.hundreds[h]);
    }
    if (rest) {
      if (rest < 10) {
        parts.push(w.units[rest]);
      } else if (rest < 20) {
        parts.push(w.teens[rest - 10]);
      } else if (locale !== 'en' && rest < 30) {
        parts.push(w.twenties[rest - 20]);
      } else if (locale === 'en') {
        parts.push(w.tens[Math.floor(rest / 10)] + (rest % 10 ? '-' + w.units[rest % 10] : ''));
      } else {
        parts.push(w.tens[Math.floor(rest / 10)] + (rest % 10 ? ' y ' + w.units[rest % 10] : ''));
      }
    }
    return parts.join(' ');
  }

  function comaRandomInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function genComma(step) {
    var total = step.enteras + step.decimales;
    var n;
    do {
      n = comaRandomInt(Math.pow(10, total - 1), Math.pow(10, total) - 1);
    } while (n % 10 === 0);
    var locale = App.i18n.locale();
    var digits = String(n);
    var whole = digits.slice(0, step.enteras);
    var fraction = digits.slice(step.enteras);
    var words = (locale === 'en' ? COMA_WORDS.en : COMA_WORDS.es).units;
    var spokenFraction = fraction.split('').map(function (d) { return words[Number(d)]; }).join(' ');
    /* Read before the comma is placed: the number itself, digit by digit.
       It never says where the comma goes. */
    var spokenDigits = digits.split('').map(function (d) { return words[Number(d)]; }).join(' ');
    var prompt = step.decimales === 1
      ? comaT('promptDecimalOne')
      : comaT('promptDecimal').replace('{count}', step.decimales);
    return {
      n: n,
      gap: step.enteras - 1,
      correct: whole + comaSeparator() + fraction,
      decimals: step.decimales,
      prompt: prompt,
      listen: spokenDigits,
      /* Read after a right answer: the whole number with its comma. */
      audio: comaSpeakWhole(Number(whole), locale) + (locale === 'en' ? ' point ' : ' coma ') + spokenFraction
    };
  }

  var COMA_DRAG_PX = 6;

  App.fractionsMeasuresModel = {
    resolved: resolved,
    fixedQuestion: fixedQuestion,
    reinforceTotal: reinforceTotal,
    leyendaFrac: leyendaFrac,
    svgFraccion: svgFraccion,
    htmlFraccion: htmlFraccion,
    fracOption: fracOption,
    fracAria: fracAria,
    sameAmount: sameAmount,
    decimalSeparator: decimalSeparator,
    decimalText: decimalText,
    threeOf: threeOf,
    tenthOptions: tenthOptions,
    pickWrong: pickWrong,
    GENERATORS: GENERATORS,
    INTRO: INTRO,
    comaT: comaT,
    comaSeparator: comaSeparator,
    COMA_WORDS: COMA_WORDS,
    comaSpeakWhole: comaSpeakWhole,
    comaRandomInt: comaRandomInt,
    genComma: genComma,
    COMA_DRAG_PX: COMA_DRAG_PX
  };
})();
