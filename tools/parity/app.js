/* ============================================================
   Calculia — Pares e impares
   Three stages, in the flow of the test: 1. the explanation (the numbers 0 to
   10 as balls in pairs, and the review), 2. the real-life examples, 3. the
   reminder of the rule, and the test, one question at a time, with a closing
   screen. The stages are built by assets/js/activity-flow.js; this file has the
   drawings (balls and real-life pictures) and the questions. The data is in
   data.js and the texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;
  var fill = App.utils.fill;
  var rint = App.utils.rint;

  function isEven(n) { return n % 2 === 0; }
  function wordFor(n) { return t(isEven(n) ? 'wordEven' : 'wordOdd'); }
  function format(n) { return n.toLocaleString(App.i18n.locale() === 'en' ? 'en-US' : 'es-ES'); }

  /* ---- Balls ----
     n balls numbered 1..n, as HTML. Each pair is a column: the ball with the lower number sits on
     top, the one above it below, so "1 con 2" reads as one pair. Both balls of a pair share its
     colour, and each pair has a colour of its own. The leftover ball (odd n) stands alone in the
     leftover colour. The pairing shape IS the answer. */
  function ballHtml(number, color, leftover) {
    return '<span class="' + (leftover ? 'parity-ball parity-leftover' : 'parity-ball parity-pair') +
      '" style="background-color:' + color + '">' + number + '</span>';
  }

  function dotsHtml(n) {
    var pairs = Math.floor(n / 2);
    var html = '';
    for (var i = 0; i < pairs; i += 1) {
      var color = DATA.pairColors[i % DATA.pairColors.length];
      html += '<div class="parity-ball-pair">' + ballHtml(2 * i + 1, color, false) + ballHtml(2 * i + 2, color, false) + '</div>';
    }
    if (n % 2) html += '<div class="parity-ball-pair">' + ballHtml(n, DATA.leftoverColor, true) + '</div>';
    var label = pairs + ' ' + t('pairsWord') + (n % 2 ? ', ' + t('oneLeftWord') : '');
    return '<div class="parity-dots" role="img" aria-label="' + label + '">' + html + '</div>';
  }

  /* ---- Explanation slides: 0 to 10, and the review ---- */
  var SEQ_MAX = 10;
  var SEQ_LAST = SEQ_MAX + 1;

  function seqCaptionFor(n) {
    var p = wordFor(n);
    if (n === 0) return fill(t('seqZero'), { p: p });
    if (n === 1) return fill(t('seqOne'), { p: p });
    if (isEven(n)) return fill(t('seqEven'), { n: n, p: p });
    return fill(t('seqOdd'), { n: n, p: p });
  }

  /* The review: the two lists side by side, and the rule in one line. */
  function reviewHtml() {
    var evens = [], odds = [];
    for (var k = 0; k <= SEQ_MAX; k += 1) (isEven(k) ? evens : odds).push(String(k));
    return '<div class="parity-review">' +
      '<p class="parity-review-rule">' + t('reviewRule') + '</p>' +
      '<p class="parity-review-line">' + fill(t('reviewEven'), { list: evens.join(', ') }) + '</p>' +
      '<p class="parity-review-line">' + fill(t('reviewOdd'), { list: odds.join(', ') }) + '</p>' +
      '</div>';
  }

  function slideVisual(n) {
    if (n === SEQ_LAST) return reviewHtml();
    /* 0 has no balls: the words «0 = par» stand in their place. */
    if (n === 0) return '<span class="parity-zero-text">' + t('zeroLabel') + '</span>';
    return dotsHtml(n);
  }

  /* ---- Real-life examples ---- */
  /* Turns an SVG string into a node. */
  function svgFrom(markup) {
    var wrap = document.createElement('div');
    wrap.innerHTML = markup;
    return wrap.firstElementChild;
  }

  /* One wheel as SVG: a dark tyre, a coloured rim (the colour says
     whether the wheel is part of the pair or the one left alone),
     eight spokes and a hub. */
  function wheelMarkup(cx, cy, r, rim) {
    var spokes = '';
    for (var i = 0; i < 8; i += 1) {
      var a = (Math.PI * 2 * i) / 8;
      var x = cx + (r - 5) * Math.cos(a);
      var y = cy + (r - 5) * Math.sin(a);
      spokes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) +
        '" y2="' + y.toFixed(1) + '" stroke="#CFD8DC" stroke-width="1.5"/>';
    }
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#263238"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 3) + '" fill="none" stroke="' + rim + '" stroke-width="4"/>' +
      spokes +
      '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#90A4AE"/>';
  }

  /* One clover leaf: a heart with its notch outwards and its point
     towards the centre, turned by "rotation" degrees. The light vein
     makes it read as a real leaf. */
  function leafMarkup(cx, cy, rotation, fill) {
    return '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + rotation + ') scale(0.62)">' +
      '<path d="M0,-20 C-12,-38 -40,-22 -38,2 C-36,22 -14,34 0,46 C14,34 36,22 38,2 C40,-22 12,-38 0,-20 Z" fill="' + fill + '"/>' +
      '<path d="M0,-12 L0,30" stroke="#fff" stroke-opacity="0.35" stroke-width="3" stroke-linecap="round"/>' +
      '</g>';
  }

  /* Each drawing shows exactly the number its text names. Pairs are
     drawn in the pair colour; the one left alone is drawn in the
     leftover colour, so the odd example is visible at a glance. */

  /* An emoji ringed in the leftover colour: the one that is left alone. */
  function leftoverEmoji(emoji) {
    var span = document.createElement('span');
    span.className = 'parity-real-emoji parity-real-leftover';
    span.textContent = emoji;
    span.style.boxShadow = '0 0 0 4px ' + DATA.leftoverColor;
    return span;
  }

  /* Shoes: two shoes, one pair (even). Or one shoe alone, ringed in
     the leftover colour (odd). */
  function shoesDrawing(single) {
    var box = document.createElement('div');
    box.className = 'parity-real-visual parity-real-row';
    if (single) {
      box.appendChild(leftoverEmoji('👟'));
      return box;
    }
    for (var i = 0; i < 2; i += 1) {
      var shoe = document.createElement('span');
      shoe.className = 'parity-real-emoji';
      shoe.textContent = '👟';
      box.appendChild(shoe);
    }
    return box;
  }

  /* Half a dozen eggs: two rows of three, so each column of the
     carton is a pair of eggs (even). With one more egg (odd), that
     egg stands alone below, ringed in the leftover colour. */
  function eggsDrawing(extra) {
    var box = document.createElement('div');
    box.className = 'parity-real-visual parity-real-column';
    var grid = document.createElement('div');
    grid.className = 'parity-real-eggs';
    for (var i = 0; i < 6; i += 1) {
      var egg = document.createElement('span');
      egg.className = 'parity-real-emoji';
      egg.textContent = '🥚';
      grid.appendChild(egg);
    }
    box.appendChild(grid);
    if (extra) box.appendChild(leftoverEmoji('🥚'));
    return box;
  }

  /* Tricycle: two back wheels (a pair) and one front wheel alone,
     in the leftover colour. Three wheels: odd. */
  function trikeDrawing() {
    var markup =
      '<svg viewBox="0 0 240 180" class="parity-real-svg" focusable="false">' +
      '<ellipse cx="120" cy="170" rx="100" ry="6" fill="#000" opacity="0.12"/>' +
      /* Frame (red): seat stay, top tube, fork and the pedal tube. */
      '<path d="M60 132 L116 80 L166 104 L176 136 M116 80 L104 120" stroke="#C62828" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
      /* Seat post, saddle and backrest. */
      '<line x1="116" y1="80" x2="116" y2="64" stroke="#455A64" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="104" y="60" width="30" height="9" rx="4.5" fill="#4E342E"/>' +
      '<rect x="100" y="42" width="8" height="22" rx="4" fill="#6D4C41"/>' +
      /* Handlebar: stem from the fork and a bar with a grip. */
      '<line x1="166" y1="104" x2="170" y2="60" stroke="#455A64" stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="162" y1="60" x2="190" y2="60" stroke="#455A64" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="186" y="55" width="10" height="10" rx="4" fill="#212121"/>' +
      /* Pedal crank at the seat tube. */
      '<circle cx="104" cy="122" r="5" fill="#607D8B"/>' +
      '<line x1="96" y1="122" x2="112" y2="122" stroke="#455A64" stroke-width="4" stroke-linecap="round"/>' +
      /* Back wheels: the far one peeks out behind the near one, both in
         the pair colour. Front wheel alone, in the leftover colour. */
      wheelMarkup(82, 122, 28, DATA.pairColor) +
      wheelMarkup(60, 132, 30, DATA.pairColor) +
      wheelMarkup(176, 136, 26, DATA.leftoverColor) +
      '</svg>';
    return svgFrom(markup);
  }

  /* Clover: two leaves below (a pair) and one leaf on top alone, in
     the leftover colour. Three leaves: odd. */
  function cloverDrawing() {
    var markup =
      '<svg viewBox="0 0 200 210" class="parity-real-svg" focusable="false">' +
      '<defs>' +
        '<linearGradient id="parity-leaf-green" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#7CB342"/><stop offset="1" stop-color="#2E7D32"/>' +
        '</linearGradient>' +
        '<linearGradient id="parity-leaf-odd" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#FFB74D"/><stop offset="1" stop-color="' + DATA.leftoverColor + '"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path d="M100 96 C104 140 96 170 102 204" stroke="#33691E" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      leafMarkup(70.6, 107, 240, 'url(#parity-leaf-green)') +
      leafMarkup(129.4, 107, 120, 'url(#parity-leaf-green)') +
      leafMarkup(100, 56, 0, 'url(#parity-leaf-odd)') +
      '</svg>';
    return svgFrom(markup);
  }

  function drawingFor(id) {
    if (id === 'shoes') return shoesDrawing(false);
    if (id === 'shoe') return shoesDrawing(true);
    if (id === 'eggs') return eggsDrawing(false);
    if (id === 'eggs-odd') return eggsDrawing(true);
    if (id === 'trike') return trikeDrawing();
    return cloverDrawing();
  }

  /* ---- Test ---- */
  /* Each block asks its own kind of number; the blocks come in the order of DATA.blocks and the
     values do not repeat inside a block. */
  function makeRound() {
    var out = [];
    DATA.blocks.forEach(function (block) {
      var taken = {};
      for (var i = 0; i < block.count; i += 1) {
        var value;
        do { value = rint(block.min, block.max); } while (taken[value]);
        taken[value] = true;
        out.push({ block: block, a: value });
      }
    });
    return out;
  }

  function explanationFor(item) {
    var n = item.a;
    if (item.block.kind === 'dots') return fill(t('explainParity'), { a: n });
    if (item.block.id === 'big') {
      return fill(t('explainLast'), { a: format(n), d: n % 10, p: wordFor(n) });
    }
    return fill(t(isEven(n) ? 'explainPairsEven' : 'explainPairsOdd'), { a: format(n), d: n % 10 });
  }

  function question(item) {
    return {
      prompt: fill(t('parityPrompt'), { a: format(item.a) }),
      legend: t('blocks.' + item.block.id + '.label'),
      hint: t('blocks.' + item.block.id + '.rule'),
      visual: item.block.kind === 'dots' ? dotsHtml(item.a) : '',
      visualAria: item.block.kind === 'dots' ? String(item.a) : '',
      explanation: explanationFor(item),
      options: App.utils.shuffle([
        { value: true, label: t('evenLabel') },
        { value: false, label: t('oddLabel') }
      ]).map(function (choice) {
        return {
          html: '<span class="answer-text">' + choice.label + '</span>',
          aria: choice.label,
          correct: isEven(item.a) === choice.value
        };
      })
    };
  }

  /* ---- Reminder: the rule, read once more before the test ---- */
  function reminderHtml() {
    return '<p class="reference-text">' + t('reminderPairs') + '</p>' +
      '<p class="parity-last-title">' + t('reminderLastDigit') + '</p>' +
      '<p class="parity-last-line"><span class="parity-chip parity-chip-even">0 · 2 · 4 · 6 · 8</span> → <strong>' + t('evenLabel') + '</strong></p>' +
      '<p class="parity-last-line"><span class="parity-chip parity-chip-odd">1 · 3 · 5 · 7 · 9</span> → <strong>' + t('oddLabel') + '</strong></p>' +
      '<p class="reference-text">' + t('reminderExample') + '</p>';
  }

  App.activityFlow.setup({
    toolId: 'parity',
    test: 'options',
    review: 'rule',
    testVisuals: true,
    introHeading: function () { return t('instruction'); },
    introCard: function () { return { title: t('introTitle'), text: t('introText') }; },
    intro: Array.apply(null, Array(SEQ_LAST + 1)).map(function (_, n) { return { visual: n }; }),
    visualHtml: slideVisual,
    introCopy: function (n) {
      if (n === SEQ_LAST) return { title: t('reviewCaption'), text: '' };
      return { title: String(n), text: seqCaptionFor(n) };
    },
    real: DATA.examples.map(function (id, i) { return { visual: { id: id, i: i } }; }),
    realText: function (i) { return t('real.' + i + '.text'); },
    realVisualHtml: function (spec) {
      return drawingFor(spec.id).outerHTML +
        '<p class="parity-real-title">' + t('real.' + spec.i + '.title') + '</p>';
    },
    reminder: {
      title: function () { return t('reminderTitle'); },
      html: reminderHtml,
      next: function () { return t('reminderNext'); }
    },
    buildRound: makeRound,
    makeQuestion: function (item) { return question(item); },
    endNotes: [{ key: 'parityTransfer', cls: 'transfer' }]
  });
})();
