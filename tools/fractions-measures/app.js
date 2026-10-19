/* ============================================================
   Calculia — Fractions
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'fractions-measures';
  var $ = App.utils.$;

  var screenMenu = $('#screenMenu');
  var screenLevels = $('#screenLevels');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var screenComma = $('#screenComma');
  var promptEl = $('#prompt');
  var visualEl = $('#visual');
  var legendEl = $('#legend');
  var optionsEl = $('#options');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var btnNext = $('#btnNext');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');
  var screenIntro = $('#screenIntro');
  var screenReal = $('#screenReal');
  var introVisual = $('#introVisual');
  var introCaption = $('#introCaption');
  var realObject = $('#realObject');
  var realCaption = $('#realCaption');
  var introIdx = 0;
  var realIdx = 0;

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;
  /* Rounds per activity. Fractions and decimals share this saved object,
     so the old single counter carried a fractions round over to decimals. */
  if (!progress.rounds) progress.rounds = { fracciones: progress.completedRounds };

  /* Round state */
  var activity = null;
  var level = null;
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var resolved = false;
  var attempts = 0;
  var question = null;
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce).
     fixedQuestion allows reusing render() with an external question
     (the reinforcement one); if null, render() generates a new one
     as before. inReinforce controls the mini-round flow. */
  var fixedQuestion = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  var reinforceTotal = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Utilidades ---- */

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  function leyendaFrac() {
    return '<span class="digit-u">' + App.i18n.t('leyendaPartesPintadasTxt') + '</span> · ' +
      '<span class="digit-d">' + App.i18n.t('leyendaPartesTotalTxt') + '</span>';
  }

  /* ---- Fracciones (SVG) ---- */

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

  /* An answer option showing the pie and the notation together, so the
     amount can be judged by looking and not only by reading digits. */
  function fracOption(f) {
    return '<span class="op-frac">' + svgFraccion(f[0], f[1], 120) + htmlFraccion(f) + '</span>';
  }

  function fracAria(f) {
    return App.i18n.t('gen.fraccionAria').replace('{num}', f[0]).replace('{den}', f[1]);
  }

  /* Two fractions are the same amount when a/b == c/d, compared by
     cross-multiplying so no rounding is involved. */
  function sameAmount(a, b) {
    return a[0] * b[1] === b[0] * a[1];
  }

  /* Spanish writes 0,5 and English 0.5. Same per-tool convention as
     thousandsSeparator() in tools/numbers and DECIMAL_SEP in
     assets/js/dinero.js (see doc/es/i18n.md §4). */
  function decimalSeparator() {
    return App.i18n.locale() === 'en' ? '.' : ',';
  }

  /* A fraction written as a decimal, with the fewest places that make it
     exact: tenths and halves need one place, quarters two, eighths three.
     It never rounds: a fraction with no exact decimal is a bad question. */
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

  /* ============================================================
     Question generators (one per level type)
     Return: prompt, visual (html), legend,
     options[{html, correcta, aria?}], hint?, enFila?, visualAria?
     ============================================================ */

  /* Three distinct number options: the right one first, then the given
     confusions, and finally neighbours to pad if any of them collided with
     the answer. Two buttons showing the same number would make one of them
     wrong for no reason the person could see. */
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

  /* ---- Data invariants, loud at start-up ----
     A fraction that did not come out in whole tenths could not be drawn
     next to a decimal and added to it, and two amounts that were equal
     would leave "which is more" with no answer. */
  Object.keys(DATA.activities).forEach(function (actId) {
    DATA.activities[actId].levels.forEach(function (nv) {
      if (nv.tipo !== 'mixedOp' && nv.tipo !== 'fracOrDecimal') return;
      nv.casos.forEach(function (item) {
        var frac = item[0];
        var tenths = item[1];
        if ((frac[0] * 10) % frac[1] !== 0) {
          throw new Error('fractions: ' + nv.id + ' has ' + frac.join('/') +
            ', which is not a whole number of tenths');
        }
        var fracTenths = (frac[0] * 10) / frac[1];
        if (tenths < 1 || tenths > 10 || fracTenths < 1 || fracTenths > 10) {
          throw new Error('fractions: ' + nv.id + ' goes outside one whole pie');
        }
        if (nv.tipo === 'fracOrDecimal') {
          if (fracTenths === tenths) {
            throw new Error('fractions: ' + nv.id + ' compares two equal amounts');
          }
          return;
        }
        var result = nv.op === 'add' ? fracTenths + tenths : fracTenths - tenths;
        if (result < 1 || result > 10) {
          throw new Error('fractions: ' + nv.id + ' gives ' + result +
            ' tenths, which is outside one pie');
        }
      });
    });
  });

  /* The comparison levels shuffle each pair before showing it, so the
     order stored is not part of the question: two pairs holding the same
     two fractions would be the same question twice, and drawing them one
     after the other reads as a "Next" button that did nothing. Equal
     fractions would leave the question with no greater one at all. */
  Object.keys(DATA.activities).forEach(function (actId) {
    DATA.activities[actId].levels.forEach(function (nv) {
      if (nv.tipo !== 'comparaFrac') return;
      var seen = {};
      nv.pares.forEach(function (par) {
        if (par[0][0] * par[1][1] === par[1][0] * par[0][1]) {
          throw new Error('fractions: ' + nv.id + ' compares two equal fractions');
        }
        var key = [par[0], par[1]].map(function (f) { return f.join('/'); })
          .sort().join(' ');
        if (seen[key]) {
          throw new Error('fractions: ' + nv.id + ' repeats the pair ' + key);
        }
        seen[key] = true;
      });
    });
  });

  /* Three distinct answers in tenths, all inside one pie. The given
     confusions come first; the padding after them only runs when one of
     them collapsed onto the answer or fell outside the pie, which is what
     used to leave a question with two buttons instead of three. */
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

  /* Up to two wrong fractions, each one a real confusion: both parts above
     zero, inside one pie, different from each other and from the answer.
     The candidates come in priority order, so the padding only runs when
     the first ones do not fit this pair. */
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

  /* ============================================================
     Screens and flow
     ============================================================ */

  function show(screen) {
    [screenMenu, screenIntro, screenReal, screenGame, screenComma, screenEnd].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Activity menu (flat grid, one button per DATA.activities entry) ---- */
  function paintMenu() {
    var cont = $('#activitiesMenu');
    cont.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'menu-grid';
    Object.keys(DATA.activities).forEach(function (id) {
      var act = DATA.activities[id];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-actividad';
      btn.innerHTML = '<span class="picto" aria-hidden="true">' + act.picto + '</span>' +
        '<span>' + App.i18n.t('activity.' + id + '.name') + '</span>' +
        '<span class="detail-card">' + App.i18n.t('activity.' + id + '.detail') + '</span>';
      btn.addEventListener('click', function () { openActivity(id); });
      grid.appendChild(btn);
    });
    cont.appendChild(grid);
  }

  /* The level rises one step per completed round of THIS activity, capped
     at the last one, so a person who comes back continues where they were. */
  function roundsDone(id) {
    return progress.rounds[id] || 0;
  }

  function levelFromProgress() {
    var levels = activity.levels;
    return levels[Math.min(roundsDone(activity.id), levels.length - 1)];
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    if (activity.game === 'comma') { startComma(); return; }
    if (activity.intro) { openIntro(); return; }
    startRound(levelFromProgress());
  }

  /* ---- Intro: what a fraction is, then the same idea in real life ----
     Both are carousels the person can go back through before the first
     round. Each slide is a picture and one short sentence; the sentence
     is what gets read aloud, so the picture never has to carry it alone. */
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
        { key: 'price', picto: '💶' },
        { key: 'milk', picto: '🥛' },
        { key: 'ribbon', picto: '📏' },
        { key: 'candy', picto: '🍬' }
      ]
    }
  };

  /* The texts of the intro and the real-life screens depend on the
     activity, so they are written here rather than through data-i18n. */
  function introText(key) {
    return App.i18n.t('intro.' + activity.id + '.' + key);
  }

  function realText(key) {
    return App.i18n.t('real.' + activity.id + '.' + key);
  }

  function paintIntro() {
    var slide = INTRO[activity.id].slides[introIdx];
    introVisual.innerHTML = slide.visual();
    introCaption.textContent = introText(slide.key);
  }

  function introStep(delta) {
    var count = INTRO[activity.id].slides.length;
    introIdx = (introIdx + delta + count) % count;
    paintIntro();
  }

  function openIntro() {
    $('#introInstruction').textContent = introText('instruction');
    $('#introTitle').textContent = introText('title');
    $('#introText').textContent = introText('text');
    $('#introReal').textContent = introText('toReal');
    $('#introPrev').setAttribute('aria-label', introText('prev'));
    $('#introNext').setAttribute('aria-label', introText('next'));
    introIdx = 0;
    paintIntro();
    show(screenIntro);
  }

  function paintReal() {
    var slide = INTRO[activity.id].real[realIdx];
    realObject.textContent = slide.picto;
    realCaption.textContent = realText(slide.key);
  }

  function realStep(delta) {
    var count = INTRO[activity.id].real.length;
    realIdx = (realIdx + delta + count) % count;
    paintReal();
  }

  function openReal() {
    $('#realTitle').textContent = realText('title');
    $('#realContinue').textContent = realText('continue');
    $('#realPrev').setAttribute('aria-label', realText('prev'));
    $('#realNext').setAttribute('aria-label', realText('next'));
    realIdx = 0;
    paintReal();
    show(screenReal);
  }

  /* ---- Game ---- */

  function startRound(nv) {
    level = nv;
    index = 0;
    roundCorrect = 0;
    App.utils.drawRoundReset();
    reinforceList = [];
    reinforceIndex = 0;
    inReinforce = false;
    App.reinforce.banner.hide();
    /* Registers the callback that runs when the normal round ends with
       pending failures; it mounts the mini-round with just those. */
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    show(screenGame);
    render();
  }

  function startReinforce(fallos) {
    reinforceList = fallos.map(function (f) { return f.payload; });
    reinforceIndex = 0;
    inReinforce = true;
    attempts = 0;
    App.reinforce.banner.set(
      App.i18n.t('reinforceTitle') + ' — ' +
      App.i18n.t('reinforceIntro').replace('{n}', reinforceList.length)
    );
    showReinforceQuestion(reinforceList[0]);
  }

  /* Paints one question. `fixed` replays a question from the reinforce
     queue; without it a new one is generated for the current level. */
  function paintQuestion(fixed) {
    question = fixed || GENERATORS[level.tipo](level, index);
    answered = false;
    attempts = 0;

    promptEl.textContent = question.prompt;
    visualEl.innerHTML = question.visual || '';
    if (question.visualAria) {
      visualEl.setAttribute('role', 'img');
      visualEl.setAttribute('aria-label', question.visualAria);
    } else {
      visualEl.removeAttribute('role');
      visualEl.removeAttribute('aria-label');
    }
    legendEl.innerHTML = question.legend || '';
    legendEl.classList.toggle('hidden', !question.legend);

    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');

    optionsEl.innerHTML = '';
    optionsEl.classList.toggle('options-row', !!question.inline);
    question.options.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.innerHTML = op.html;
      if (op.aria) btn.setAttribute('aria-label', op.aria);
      btn.addEventListener('click', function () { answer(op, btn); });
      optionsEl.appendChild(btn);
    });

    progressFill.style.width = (inReinforce
      ? ((reinforceIndex + 1) / reinforceList.length)
      : (index / DATA.perRound)) * 100 + '%';
    progressText.textContent = inReinforce
      ? (reinforceIndex + 1) + ' / ' + reinforceList.length
      : (index + 1) + ' / ' + DATA.perRound;
    paintStars();
  }

  function showReinforceQuestion(p) { paintQuestion(p); }

  function render() { paintQuestion(null); }

  /* Visible text of an option (its html may wrap spans). */
  function plainText(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
  }

  function showExplanation(isCorrect) {
    if (isCorrect && inReinforce) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    explanationEl.textContent =
      (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      /* Fraction options draw a pie, so their visible text would read
         "12" for 1/2; their aria label says "1 de 2 partes" instead. */
      (correct.aria || plainText(correct.html)) + '.';
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: the first mistake does not give the answer away,
     it invites another look. Only the second one explains it.
     The invitation is the one written for THIS question —which is what
     to do with the figure in front of you— and not the same sentence for
     every question. The generic line is only the fallback, for a question
     that forgot to bring its own. */
  function showHint() {
    explanationEl.textContent = (question && question.hint) || App.i18n.t('hint');
    explanationWrap.classList.remove('hidden');
  }

  function answer(op, btn) {
    if (answered) return;
    if (op.correct) {
      showExplanation(true);
      answered = true;
      btn.classList.add('correct');
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      App.utils.$$('#options .option-btn').forEach(function (b) { b.disabled = true; });
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      attempts += 1;
      App.reinforce.add(level.id + ':' + index, question);
      var respuestaTrasPista = attempts > 1;
      showHint();
      /* Reveal the explanation only after the hint is acknowledged. */
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap, function () { if (respuestaTrasPista) showExplanation(false); });
    }
  }

  function next() {
    if (inReinforce) {
      reinforceIndex += 1;
      if (reinforceIndex >= reinforceList.length) {
        inReinforce = false;
        App.reinforce.clear();
        App.reinforce.banner.hide();
        endRound();
      } else {
        showReinforceQuestion(reinforceList[reinforceIndex]);
      }
      return;
    }
    index += 1;
    if (index >= DATA.perRound) {
      /* consume() returns [] when nothing was failed; otherwise it fires
         the callback that mounts the mini-round, which ends the round
         itself, so endRound must not also run here. */
      if (App.reinforce.consume().length === 0) endRound();
    } else {
      render();
    }
  }

  function endRound() {
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    progress.rounds[activity.id] = roundsDone(activity.id) + 1;
    save();
    show(screenEnd);
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{activity}', App.i18n.t('activity.' + activity.id + '.name'))
        .replace('{stars}', progress.stars);
    }
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));

  }

  /* ---- Poner la coma decimal (activity 'coma') ----
     A whole number is shown with no separator (452567). The person taps the
     gap where the decimal comma goes (452,567). The prompt says how many
     decimal digits the number has, so the comma is found by counting from
     the right. The comma can be dragged from the tray to a gap, or from one
     gap to another; dropped anywhere else it goes back to the tray. A tap
     works too: an empty gap puts the comma there, the comma itself removes
     it. The Escuchar button reads the question and the digits. English shows
     a point. Stars and rounds go to this tool's shared progress,
     like every other activity here. Data in data.js (activities.coma.steps). */
  var comaCase = null;
  var comaPlaced = null;      /* gap the comma sits in, or null */
  var comaWrongGap = null;    /* gap marked ✗ by the last check, or null */
  var comaWaiting = true;
  var comaAttempts = 0;
  var comaFixed = null;       /* reinforcement case to show instead of a new one */
  var comaInReinforce = false;
  var comaReinforceList = [];
  var comaReinforceIndex = 0;
  var comaIndex = 0;

  function comaT(key) { return App.i18n.t('coma.' + key); }

  /* Decimal separator of the locale: comma in Spanish, point in English. */
  function comaSeparator() { return App.i18n.locale() === 'en' ? '.' : ','; }

  /* Spoken numbers: the audio says the whole part as a number and the decimals
     digit by digit ("tres coma cinco", "three point five"). The whole part is
     at most three digits, so only 1 to 999 is needed. */
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

  /* One item: a random number with the step's digit counts. No trailing zero,
     because "2,50" would be heard and read as "2,5". */
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
    /* Read before the comma is placed: the question and the digits one by one.
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
      listen: prompt + ' ' + spokenDigits,
      /* Read after a right answer: the whole number with its comma. */
      audio: comaSpeakWhole(Number(whole), locale) + (locale === 'en' ? ' point ' : ' coma ') + spokenFraction
    };
  }

  function renderComaBoard() {
    var board = $('#commaBoard');
    var digits = String(comaCase.n);
    board.innerHTML = '';
    for (var i = 0; i < digits.length; i++) {
      var digit = document.createElement('span');
      digit.className = 'comma-digit';
      digit.textContent = digits.charAt(i);
      board.appendChild(digit);
      if (i < digits.length - 1) board.appendChild(comaGapButton(i));
    }
  }

  function comaGapButton(i) {
    var isPlaced = comaPlaced === i;
    var isWrong = comaWrongGap === i;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'comma-gap' + (isPlaced ? ' is-placed' : '') + (isWrong ? ' is-wrong' : '');
    btn.setAttribute('data-gap', String(i));
    btn.setAttribute('aria-label', comaT(isPlaced ? 'gapFilledAria' : 'gapEmptyAria'));
    btn.disabled = !comaWaiting;
    if (isPlaced) {
      var point = document.createElement('span');
      point.className = 'comma-point';
      point.textContent = comaSeparator();
      btn.appendChild(point);
    }
    if (isWrong) {
      /* The mark is a shape as well as the colour (WCAG 1.4.1). */
      var mark = document.createElement('span');
      mark.className = 'comma-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = '✗';
      btn.appendChild(mark);
    }
    btn.addEventListener('click', function () { if (!comaJustDragged) comaTapGap(i); });
    return btn;
  }

  /* One chip in the tray while the comma is still to be placed. */
  function renderComaTray() {
    var tray = $('#commaTray');
    tray.innerHTML = '';
    if (comaPlaced !== null) return;
    var chip = document.createElement('span');
    chip.className = 'comma-chip';
    chip.textContent = comaSeparator();
    tray.appendChild(chip);
  }

  function comaTapGap(i) {
    if (!comaWaiting) return;
    /* Tapping the placed comma removes it; tapping another gap moves it. */
    comaPlaced = comaPlaced === i ? null : i;
    comaWrongGap = null;
    $('#comaFeedback').textContent = '';
    renderComaBoard();
    renderComaTray();
    /* Keep the keyboard user's place on the gap they just used. */
    var again = document.querySelector('#commaBoard [data-gap="' + i + '"]');
    if (again) again.focus();
  }

  /* ---- Dragging the comma ----
     The comma can be dragged from the tray to a gap, or from one gap to
     another. Dropped anywhere else, it goes back to the tray (or is removed
     when it was in a gap). Pointer events cover mouse, touch and pen. A
     drag starts only after a few pixels of movement, so a tap is never a
     drag; the click that follows a drop is swallowed (comaJustDragged). */
  var COMA_DRAG_PX = 6;
  var comaDrag = null;          /* { from, ghost, moved, startX, startY } */
  var comaJustDragged = false;

  function comaStartDrag(e, from) {
    if (!comaWaiting || e.button !== 0) return;
    comaDrag = { from: from, ghost: null, moved: false, startX: e.clientX, startY: e.clientY };
    document.addEventListener('pointermove', comaMoveDrag);
    document.addEventListener('pointerup', comaEndDrag);
    document.addEventListener('pointercancel', comaCancelDrag);
  }

  /* The gap under the pointer, or null. */
  function comaGapUnder(x, y) {
    var el = document.elementFromPoint(x, y);
    var gap = el && el.closest ? el.closest('#commaBoard .comma-gap') : null;
    return gap ? Number(gap.getAttribute('data-gap')) : null;
  }

  function comaMoveDrag(e) {
    var d = comaDrag;
    if (!d) return;
    if (!d.moved) {
      if (Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) < COMA_DRAG_PX) return;
      d.moved = true;
      d.ghost = document.createElement('span');
      d.ghost.className = 'comma-ghost';
      d.ghost.setAttribute('aria-hidden', 'true');
      d.ghost.textContent = comaSeparator();
      document.body.appendChild(d.ghost);
    }
    d.ghost.style.left = e.clientX + 'px';
    d.ghost.style.top = e.clientY + 'px';
    var over = comaGapUnder(e.clientX, e.clientY);
    var gaps = document.querySelectorAll('#commaBoard .comma-gap');
    for (var k = 0; k < gaps.length; k++) {
      gaps[k].classList.toggle('is-target', Number(gaps[k].getAttribute('data-gap')) === over && over !== d.from);
    }
  }

  function comaEndDrag(e) {
    var d = comaDrag;
    if (!d) return;
    /* Read the target before comaStopDrag clears the drag state. */
    var target = d.moved ? comaGapUnder(e.clientX, e.clientY) : null;
    comaStopDrag();
    if (!d.moved) return;   /* a tap: the click does the work */
    comaJustDragged = true;
    setTimeout(function () { comaJustDragged = false; }, 300);
    if (target !== null && d.ghost) {
      /* Glide the comma into the gap, then settle it there. */
      comaGlide(d.ghost, comaGapCenter(target), function () { comaDrop(d.from, target); });
    } else {
      if (d.ghost) d.ghost.remove();
      comaDrop(d.from, null);
    }
  }

  /* from: the gap the comma was lifted from, or null when it came from the
     tray. to: the gap it landed on, or null when it was dropped elsewhere. */
  function comaDrop(from, to) {
    if (to !== null) comaPlaced = to;
    else if (from !== null) comaPlaced = null;
    comaWrongGap = null;
    $('#comaFeedback').textContent = '';
    renderComaBoard();
    renderComaTray();
  }

  function comaGapCenter(g) {
    var r = document.querySelector('#commaBoard [data-gap="' + g + '"]').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  /* Moves an element to a point on screen, then runs done(). */
  function comaGlide(el, to, done) {
    el.style.transition = 'left 0.18s ease-out, top 0.18s ease-out';
    el.style.left = to.x + 'px';
    el.style.top = to.y + 'px';
    setTimeout(function () { el.remove(); done(); }, 190);
  }

  function comaCancelDrag() {
    if (comaDrag && comaDrag.ghost) comaDrag.ghost.remove();
    comaStopDrag();
  }

  function comaStopDrag() {
    document.removeEventListener('pointermove', comaMoveDrag);
    document.removeEventListener('pointerup', comaEndDrag);
    document.removeEventListener('pointercancel', comaCancelDrag);
    comaDrag = null;
    var marked = document.querySelectorAll('#commaBoard .is-target');
    for (var k = 0; k < marked.length; k++) marked[k].classList.remove('is-target');
  }

  function comaCheckAnswer() {
    if (!comaWaiting) return;
    var feedbackEl = $('#comaFeedback');
    if (comaPlaced === null) {
      App.feedback.encourage(feedbackEl);
      feedbackEl.textContent = comaT('missing');
      return;
    }
    if (comaPlaced === comaCase.gap) {
      comaCorrect();
      return;
    }
    comaAttempts += 1;
    /* Reinforcement: register the first miss of the item. */
    if (comaAttempts === 1) App.reinforce.add('coma:' + comaCase.correct, comaCase);
    comaWrongGap = comaPlaced;
    /* Socratic hint with the exact move. The comma must have comaCase.decimals
       digits to its right. Each gap moves it one digit, so the number of gaps
       to move is the difference, and the direction follows its sign: too many
       digits to the right means move right, too few means move left. */
    var digitsToRight = String(comaCase.n).length - 1 - comaPlaced;
    var gapsToMove = Math.abs(digitsToRight - comaCase.decimals);
    var moves = gapsToMove === 1 ? comaT('oneGap') : comaT('manyGaps').replace('{n}', gapsToMove);
    var direction = digitsToRight > comaCase.decimals ? comaT('moveRight') : comaT('moveLeft');
    var digits = digitsToRight === 1 ? comaT('oneDigit') : comaT('manyDigits').replace('{n}', digitsToRight);
    App.feedback.encourage(feedbackEl);
    feedbackEl.textContent = comaT('wrongMarked') + ' ' + comaT('wrongHint')
      .replace('{digits}', digits)
      .replace('{d}', comaCase.decimals)
      .replace('{moves}', moves)
      .replace('{direction}', direction);
    renderComaBoard();
  }

  function comaCorrect() {
    var feedbackEl = $('#comaFeedback');
    progress.stars += 1;
    roundCorrect += 1;
    save();
    paintStars();
    App.feedback.success(feedbackEl);
    feedbackEl.textContent += ' ' + comaT('correctFormat').replace('{n}', comaCase.correct);
    comaWaiting = false;
    renderComaBoard();
    $('#comaCheck').classList.add('hidden');
    $('#comaNext').classList.remove('hidden');
    $('#comaNext').focus();
  }

  function comaPaint() {
    /* A reinforcement case replaces the current one for this paint only. */
    if (comaFixed) comaCase = comaFixed;
    comaFixed = null;
    comaWaiting = true;
    comaAttempts = 0;
    comaPlaced = null;
    comaWrongGap = null;
    $('#comaPrompt').textContent = comaCase.prompt;
    $('#comaDetail').textContent = comaT('detailDecimal');
    $('#comaFeedback').textContent = '';
    renderComaBoard();
    renderComaTray();
    $('#comaCheck').classList.remove('hidden');
    $('#comaNext').classList.add('hidden');
    /* Escuchar is there from the start: it reads the question, then the number. */
    $('#comaHear').classList.toggle('hidden', !(App.tts && App.tts.available));
    var fillEl = $('#comaProgressFill');
    var textEl = $('#comaProgressText');
    var current = comaInReinforce ? comaReinforceIndex : comaIndex;
    var total = comaInReinforce ? comaReinforceList.length : activity.steps.length;
    fillEl.style.width = ((current / total) * 100) + '%';
    textEl.textContent = comaT('roundProgress').replace('{current}', current + 1).replace('{total}', total);
  }

  function comaNext() {
    comaWaiting = false;
    if (comaInReinforce) {
      comaReinforceIndex += 1;
      if (comaReinforceIndex >= comaReinforceList.length) {
        comaInReinforce = false;
        App.reinforce.clear();
        App.reinforce.banner.hide();
        endRound();
        return;
      }
      comaFixed = comaReinforceList[comaReinforceIndex];
      comaPaint();
      return;
    }
    comaIndex += 1;
    if (comaIndex < activity.steps.length) {
      comaCase = genComma(activity.steps[comaIndex]);
      comaPaint();
      return;
    }
    /* consume() starts the mini-round if there were misses; otherwise the round ends. */
    if (App.reinforce.consume().length === 0) endRound();
  }

  function startComma() {
    roundCorrect = 0;
    comaIndex = 0;
    comaInReinforce = false;
    comaFixed = null;
    comaReinforceList = [];
    comaReinforceIndex = 0;
    App.reinforce.banner.hide();
    App.reinforce.start(function (fallos) { startComaReinforce(fallos); });
    comaCase = genComma(activity.steps[0]);
    show(screenComma);
    comaPaint();
  }

  function startComaReinforce(fallos) {
    comaReinforceList = fallos.map(function (f) { return f.payload; });
    comaReinforceIndex = 0;
    comaInReinforce = true;
    App.reinforce.banner.set(
      comaT('reinforceTitle') + ' — ' +
      comaT('reinforceIntro').replace('{n}', comaReinforceList.length)
    );
    comaFixed = comaReinforceList[0];
    comaPaint();
  }

  /* ---- Events ---- */

  $('#comaCheck').addEventListener('click', comaCheckAnswer);
  $('#comaNext').addEventListener('click', comaNext);
  $('#comaHear').addEventListener('click', function () {
    if (comaCase && App.tts) App.tts.speak(comaWaiting ? comaCase.listen : comaCase.audio);
  });
  $('#comaBack').addEventListener('click', function () { show(screenMenu); });
  $('#commaBoard').addEventListener('pointerdown', function (e) {
    var gap = e.target.closest ? e.target.closest('.comma-gap.is-placed') : null;
    if (gap) comaStartDrag(e, Number(gap.getAttribute('data-gap')));
  });
  $('#commaTray').addEventListener('pointerdown', function (e) {
    var chip = e.target.closest ? e.target.closest('.comma-chip') : null;
    if (chip) comaStartDrag(e, null);
  });

  $('#btnNext').addEventListener('click', next);

  $('#introPrev').addEventListener('click', function () { introStep(-1); });
  $('#introNext').addEventListener('click', function () { introStep(1); });
  $('#introReal').addEventListener('click', openReal);
  $('#realPrev').addEventListener('click', function () { realStep(-1); });
  $('#realNext').addEventListener('click', function () { realStep(1); });
  $('#realContinue').addEventListener('click', function () { startRound(levelFromProgress()); });



  paintMenu();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
