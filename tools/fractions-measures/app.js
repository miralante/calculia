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

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;

  /* Round state */
  var activity = null;
  var level = null;
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var resolved = false;
  var attempts = 0;
  var question = null;
  var pools = {};
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

  /* Takes elements from a list without repeating within the round. */
  function draw(key, list) {
    var p = pools[key];
    if (!p || p.i >= p.orden.length) {
      var fresh = App.utils.shuffle(list);
      /* When the bag is refilled, its first item must not be the one just
         handed out: two identical questions in a row read as a "Siguiente"
         button that does nothing. */
      if (p && fresh.length > 1 && fresh[0] === p.last) {
        var swap = fresh[1];
        fresh[1] = fresh[0];
        fresh[0] = swap;
      }
      p = pools[key] = { orden: fresh, i: 0, last: p ? p.last : null };
    }
    p.last = p.orden[p.i];
    return p.orden[p.i++];
  }

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

  /* A fraction written as a decimal. The number of decimal places comes
     from the denominator, so the text is always exact: tenths (and
     halves, fifths) need one place, quarters need two. */
  function decimalText(f) {
    var places = (10 % f[1] === 0) ? 1 : 2;
    return (f[0] / f[1]).toFixed(places).replace('.', decimalSeparator());
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

  var GENERATORS = {

    /* Adding and subtracting fractions whose slices are NOT the same size.
       The trick is always the same one: the bigger slices are cut so both
       fractions are counted in the same slices. Both pies stay on screen,
       so what changes is visible rather than asserted.
       `casos` is [denA, numA, denB, numB] with denB a multiple of denA. */
    mixFrac: function (nv) {
      var item = draw(nv.id, nv.casos);
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

      /* Adding the tops and the bottoms straight across is THE mistake
         here, so it is offered with its own pie. */
      var naive = [a[0] + b[0], a[1] + b[1]];
      var offBy = [resultNum + (resultNum + 1 <= den ? 1 : -1), den];
      var wrong = [naive, offBy].filter(function (f) {
        return f[0] > 0 && f[1] > 0 && !sameAmount(f, result);
      });

      return {
        prompt: App.i18n.t(adding ? 'gen.mixFracAdd' : 'gen.mixFracSub'),
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
      var item = draw(nv.id, nv.casos);
      var den = item[0];
      var total = item[1];
      var each = total / den;
      var thing = draw(nv.id + 'thing', nv.things);

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
      var item = draw(nv.id, nv.casos);
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
        prompt: App.i18n.t(adding ? 'gen.mixedAdd' : 'gen.mixedSub')
          .replace('{a}', htmlFraccion(frac))
          .replace('{b}', decimalText([tenths, 10])),
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
      var item = draw(nv.id, nv.casos);
      var frac = item[0];
      var tenths = item[1];
      var fracTenths = (frac[0] * 10) / frac[1];
      var fracWins = fracTenths > tenths;
      return {
        prompt: App.i18n.t('gen.whichIsMore'),
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
      var item = draw(nv.id, nv.casos);
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
      var f = draw(nv.id, nv.fracs);
      var otros = App.utils.shuffle(nv.fracs.filter(function (o) {
        return o[0] * f[1] !== o[1] * f[0]; /* remove fracciones equivalentes */
      })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.fraccionesEnunciado'),
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
      var par = App.utils.shuffle(draw(nv.id, nv.pares));
      var greater = (par[0][0] / par[0][1] > par[1][0] / par[1][1]) ? par[0] : par[1];
      return {
        prompt: App.i18n.t('gen.comparaFracEnunciado'),
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
      var pair = draw(nv.id, nv.pares);
      var base = pair[0];
      var answer = pair[1];
      /* Alternatives must NOT be equivalent to the answer, or there would
         be two right choices. */
      var wrong = App.utils.shuffle(nv.distractores.filter(function (f) {
        return !sameAmount(f, answer);
      })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.equivalentesEnunciado'),
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
      var item = draw(nv.id, nv.casos);
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
      var f = draw(nv.id, nv.fracs);
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
    [screenMenu, screenGame, screenEnd].forEach(function (p) {
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

  /* The level rises one step per completed round, capped at the last
     one, so a person who comes back continues where they were. */
  function levelFromProgress() {
    var levels = activity.levels;
    return levels[Math.min(progress.completedRounds || 0, levels.length - 1)];
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    startRound(levelFromProgress());
  }

  /* ---- Game ---- */

  function startRound(nv) {
    level = nv;
    index = 0;
    roundCorrect = 0;
    pools = {};
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
    progressText.textContent = '';
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
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    explanationEl.textContent =
      (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      plainText(correct.html) + '.';
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: the first mistake does not give the answer away,
     it invites another look. Only the second one explains it. */
  function showHint() {
    explanationEl.textContent = App.i18n.t('hint');
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
      if (attempts === 1) showHint();
      else showExplanation(false);
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap);
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

    var idxN = activity.levels.indexOf(level);
    var nextLevel = (roundCorrect === DATA.perRound && idxN !== -1 && idxN + 1 < activity.levels.length)
      ? activity.levels[idxN + 1] : null;
    var btnHarder = $('#btnHarder');
    if (nextLevel) {
      btnHarder.textContent = App.i18n.t('btnHarder').replace('{name}', App.i18n.t('level.' + nextLevel.id));
      btnHarder.classList.remove('hidden');
      btnHarder.onclick = function () { startRound(nextLevel); };
    } else {
      btnHarder.classList.add('hidden');
    }
  }

  /* ---- Events ---- */

  var elBtnBackToMenu = $('#btnBackToMenu');
  if (elBtnBackToMenu) elBtnBackToMenu.addEventListener('click', function () { show(screenMenu); });
  $('#btnNext').addEventListener('click', next);
  $('#btnRepeat').addEventListener('click', function () { startRound(levelFromProgress()); });
  $('#btnMenu').addEventListener('click', function () { show(screenMenu); });
  $('#btnOtherActivity').addEventListener('click', function () { show(screenMenu); });

  paintMenu();
  paintStars();
})();
