/* ============================================================
   Calculia — Fractions and measures: the question generators, one per fraction mechanic.
   ============================================================ */
(function () {
  'use strict';

  var H = App.FractionsHelpers;
  var pickWrong = H.pickWrong, htmlFraccion = H.htmlFraccion, svgFraccion = H.svgFraccion, fracOption = H.fracOption,
      fracAria = H.fracAria, threeOf = H.threeOf, decimalText = H.decimalText, tenthOptions = H.tenthOptions,
      leyendaFrac = H.leyendaFrac, sameAmount = H.sameAmount;

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

  App.FractionsGenerators = {
    GENERATORS: GENERATORS
  };
})();
