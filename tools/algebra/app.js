/* ============================================================
   Calculia — La balanza
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'algebra';
  var $ = App.utils.$;

  var screenMenu = $('#screenMenu');
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
  var attempts = 0;
  var question = null;
  var pools = {};
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce). */
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Nothing that can be worked out is stored ----
     What the bag weighs, what several bags come to, and whether the graph
     goes up or down are all computed from the numbers in data.js, and the
     picture is built from the same ones. */
  function bagWeight(item) {
    if (item.bags) return item.total / item.bags;
    if (item.left !== undefined) return item.right - item.left;
    return item.total - item.add;
  }

  /* ---- Data invariants, loud at start-up ---- */
  DATA.simple.forEach(function (i) {
    if (i.total - i.add < 1) {
      throw new Error('algebra: bag of ' + (i.total - i.add) + ' kilos is not a weight');
    }
  });
  DATA.groups.forEach(function (i) {
    if (i.total % i.bags !== 0) {
      throw new Error('algebra: ' + i.total + ' does not split between ' + i.bags + ' bags');
    }
  });
  DATA.both.forEach(function (i) {
    if (i.right - i.left < 1) {
      throw new Error('algebra: bag of ' + (i.right - i.left) + ' kilos is not a weight');
    }
  });
  var TRENDS = {};
  DATA.series.forEach(function (s) {
    var top = Math.max.apply(Math, s.values);
    var tops = s.values.filter(function (v) { return v === top; }).length;
    /* Two equal highest points would leave "where is it highest" with two
       right answers. */
    if (tops !== 1) {
      throw new Error('algebra: series "' + s.id + '" has ' + tops + ' highest points');
    }
    s.values.forEach(function (v, i) {
      if (i === 0) return;
      TRENDS[v > s.values[i - 1] ? 'up' : (v < s.values[i - 1] ? 'down' : 'same')] = true;
    });
  });
  ['up', 'down', 'same'].forEach(function (k) {
    /* An answer that never comes up is a dead button. */
    if (!TRENDS[k]) {
      throw new Error('algebra: no stretch of any graph goes "' + k + '"');
    }
  });

  /* ---- Utilities ---- */

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

  /* Three distinct numbers: the answer, then the given confusions, then
     neighbours to pad if any of them collided with it. */
  function threeOf(correct, candidates, suffix) {
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.concat([correct + 1, correct - 1, correct + 2]).forEach(function (v) {
      if (v > 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    return App.utils.shuffle(list).map(function (v) {
      return { html: v + (suffix || ''), aria: v + (suffix || ''), correct: v === correct };
    });
  }

  /* ---- The balance ----
     Drawn as two pans that are level, because that is the whole idea: the
     two sides weigh the same, so what the bag weighs is whatever is
     missing. The weights are drawn one by one so they can be counted. */
  function weights(n) {
    var html = '';
    for (var i = 0; i < n; i++) html += '<span class="weight">1</span>';
    return html;
  }

  function bags(n) {
    var html = '';
    for (var i = 0; i < n; i++) html += '<span class="bag">?</span>';
    return html;
  }

  function balance(leftHtml, rightHtml) {
    return '<div class="balance">' +
      '<div class="pan">' + leftHtml + '</div>' +
      '<div class="beam" aria-hidden="true">=</div>' +
      '<div class="pan">' + rightHtml + '</div>' +
      '</div>';
  }

  /* ---- The graph ----
     Bars by the hour, with the hours written underneath, so going up or
     down is something you see rather than something you are told. `mark`
     and `mark2` pick out the hours the question is about. */
  function graph(series, mark, mark2) {
    var top = Math.max.apply(Math, series.values);
    var html = '<div class="graph">';
    series.values.forEach(function (v, i) {
      var hour = series.from + i;
      var marked = (hour === mark || hour === mark2);
      html += '<span class="graph-col' + (marked ? ' is-marked' : '') + '">' +
        '<span class="graph-bar" style="height:' +
        Math.max(2, Math.round((v / top) * 100)) + '%"></span>' +
        '<span class="graph-hour">' + hour + '</span></span>';
    });
    return html + '</div>';
  }

  /* ---- How something grows ----
     Steady growth means every jump from one value to the next is the same.
     That is worked out here, never read off a flag in the data, so the
     picture and the answer always agree. */
  function jumpsOf(values) {
    return values.slice(1).map(function (v, i) { return v - values[i]; });
  }

  function isSteady(values) {
    var jumps = jumpsOf(values);
    return jumps.every(function (j) { return j === jumps[0]; });
  }

  /* Each series has to be what it says it is, or the level would teach the
     opposite of what it means to. */
  DATA.growths.forEach(function (g) {
    if (isSteady(g.values) !== (g.kind === 'same')) {
      throw new Error('algebra: series "' + g.id + '" is not ' + g.kind);
    }
    if (jumpsOf(g.values).some(function (j) { return j <= 0; })) {
      throw new Error('algebra: series "' + g.id + '" does not always grow');
    }
  });
  ['same', 'faster'].forEach(function (kind) {
    if (!DATA.growths.some(function (g) { return g.kind === kind; })) {
      throw new Error('algebra: no series that grows "' + kind + '"');
    }
  });

  /* Bars with the jump between each pair written above them, so "by the
     same each time" is something you read rather than something you feel. */
  function growthGraph(values, small) {
    var top = Math.max.apply(Math, values);
    var jumps = jumpsOf(values);
    var html = '<div class="growth' + (small ? ' is-small' : '') + '">';
    values.forEach(function (v, i) {
      html += '<span class="growth-col">' +
        (i > 0 ? '<span class="growth-jump">+' + jumps[i - 1] + '</span>' : '') +
        '<span class="growth-bar" style="height:' +
        Math.max(3, Math.round((v / top) * 100)) + '%"></span></span>';
    });
    return html + '</div>';
  }

  /* A box is the second unknown, so a system can have two of them. It says
     what it is with its own letter as well as its shape. */
  function boxes(n) {
    var html = '';
    for (var i = 0; i < n; i++) html += '<span class="box">y</span>';
    return html;
  }

  /* Both balances of a system have to be true of the same pair, and that
     pair has to be whole kilos, or there would be nothing to find. */
  DATA.systems.forEach(function (i) {
    var bag = (i.total + i.diff) / 2;
    var box = i.total - bag;
    if (bag % 1 !== 0 || box < 1 || bag < 1) {
      throw new Error('algebra: system ' + i.total + '/' + i.diff + ' has no whole answer');
    }
    if (bag + box !== i.total || bag - box !== i.diff) {
      throw new Error('algebra: system ' + i.total + '/' + i.diff + ' does not hold');
    }
  });
  /* A tilt with equal sides would not be a tilt at all. */
  DATA.tilts.forEach(function (i) {
    if (i.left === i.right) {
      throw new Error('algebra: tilt ' + i.left + '/' + i.right + ' is level');
    }
  });

  /* ---- The pieces ----
     Three shapes and nothing else: a big square whose side is x, a strip
     x long and 1 wide, and a little 1. A pile of them written down is a
     polynomial; a square built out of them is an identity; and looking
     for the missing side of a rectangle is factorising. The writing is
     never stored — it is built here from the counts, and the picture is
     built from the same ones.

     The big square is drawn 2.6 little squares wide on purpose: a whole
     number of them would teach that x is 3. */
  var X_SIZE = 2.6;

  function tile(kind) {
    var label = kind === 'sq' ? 'x<sup>2</sup>' : (kind === 'str' ? 'x' : '1');
    return '<span class="tile is-' + kind + '">' + label + '</span>';
  }

  /* A pile: the pieces loose, so they can be counted one kind at a time. */
  function tilePile(t) {
    var html = '<div class="tile-pile">';
    var add = function (kind, n) {
      for (var i = 0; i < n; i++) html += tile(kind);
    };
    add('sq', t.sq);
    add('str', t.str);
    add('one', t.one);
    return html + '</div>';
  }

  /* The same pile written down. Nothing here is stored in data.js. */
  function tileText(t) {
    var parts = [];
    if (t.sq) parts.push((t.sq > 1 ? t.sq : '') + 'x<sup>2</sup>');
    if (t.str) parts.push((t.str > 1 ? t.str : '') + 'x');
    if (t.one) parts.push(String(t.one));
    return parts.join(' + ');
  }

  function tileAria(t) {
    var parts = [];
    var say = function (n, key) {
      if (n) parts.push(App.i18n.t(key).replace(/\{n\}/g, n));
    };
    say(t.sq, 'gen.ariaSq');
    say(t.str, 'gen.ariaStr');
    say(t.one, 'gen.ariaOne');
    return parts.join(' + ');
  }

  /* Pieces laid out as a rectangle of `cols` and `rows` sides beyond the
     big square: the big one in the corner, strips along the two edges it
     touches, and little ones filling the rest. Assembled like this the
     sides can be read off the picture instead of worked out. */
  function tileRect(cols, rows) {
    /* repeat(0, ...) is not valid CSS, so a side with nothing past the big
       square is just the one track. */
    var tracks = function (n) {
      return X_SIZE + 'fr' + (n > 0 ? ' repeat(' + n + ',1fr)' : '');
    };
    var html = '<div class="tile-grid" style="grid-template-columns:' +
      tracks(cols) + ';grid-template-rows:' + tracks(rows) + '">';
    for (var r = 0; r <= rows; r++) {
      for (var c = 0; c <= cols; c++) {
        html += tile(r === 0 && c === 0 ? 'sq' : (r === 0 || c === 0 ? 'str' : 'one'));
      }
    }
    return html + '</div>';
  }

  /* A side written as x plus so many, and said out loud the same way. */
  function sidePlus(a) {
    return { html: 'x + ' + a, aria: App.i18n.t('gen.ariaSide').replace(/\{n\}/g, a) };
  }

  /* Three distinct written answers. The wrong ones are given first
     because they are the mistakes that actually happen; the padding at
     the end only runs if one of them came out the same as the answer. */
  function threeWritten(right, wrong) {
    var seen = {};
    var list = [right];
    seen[right.html] = true;
    wrong.forEach(function (w) {
      if (w && !seen[w.html] && list.length < 3) { seen[w.html] = true; list.push(w); }
    });
    if (list.length < 3) {
      throw new Error('algebra: only ' + list.length + ' distinct written options');
    }
    return App.utils.shuffle(list).map(function (o) {
      return { html: o.html, aria: o.aria, correct: o === right };
    });
  }

  /* Each pile has to have two kinds of piece at least: with one kind
     there is no sum to write. And two piles that are written the same way
     would be the same question twice. */
  (function () {
    var seen = {};
    DATA.tiles.forEach(function (t) {
      var kinds = ['sq', 'str', 'one'].filter(function (k) { return t[k] > 0; });
      if (kinds.length < 2) {
        throw new Error('algebra: pile "' + t.id + '" has only one kind of piece');
      }
      /* App.i18n is not loaded with a locale yet at start-up, so the check
         is on the writing, which needs no strings. */
      var key = t.sq + '/' + t.str + '/' + t.one;
      if (seen[key]) {
        throw new Error('algebra: piles "' + seen[key] + '" and "' + t.id + '" are the same');
      }
      seen[key] = t.id;
    });
  }());
  DATA.tileSquares.forEach(function (a) {
    if (a < 1) throw new Error('algebra: a square of side x + ' + a + ' is not bigger than x');
  });
  DATA.tileRects.forEach(function (a) {
    /* x + 1 by x would make "x + 1" and "1 more than x" the same as the
       strip count, and the wrong answer "a times x" collapses onto it. */
    if (a < 2) throw new Error('algebra: a rectangle of x by x + ' + a + ' is too thin to read');
  });

  var GENERATORS = {

    /* A pile of pieces, written down. That writing is a polynomial, and
       it says nothing the pile does not already show. */
    readTiles: function (nv) {
      var t = draw(nv.id, DATA.tiles);
      var right = { html: tileText(t), aria: tileAria(t) };
      /* Swapping the strips for the little ones, and losing the square,
         are the two mistakes the writing actually invites. */
      var swapped = { sq: t.sq, str: t.one, one: t.str };
      var noSquare = { sq: 0, str: t.str, one: t.one };
      var oneMore = { sq: t.sq, str: t.str + 1, one: t.one };
      var wrong = [swapped, noSquare, oneMore, { sq: t.sq + 1, str: t.str, one: t.one }]
        .filter(function (w) { return w.sq || w.str || w.one; })
        .map(function (w) { return { html: tileText(w), aria: tileAria(w) }; });
      return {
        prompt: App.i18n.t('gen.readTiles'),
        visual: '<div class="tile-stage">' + tilePile(t) + '</div>',
        visualAria: tileAria(t),
        legend: App.i18n.t('gen.tilesHint'),
        options: threeWritten(right, wrong),
        inline: true
      };
    },

    /* The same pieces put together into a square. Its side is x plus the
       little ones along one edge — which is the identity, seen whole
       instead of remembered. */
    squareSide: function (nv) {
      var a = draw(nv.id, DATA.tileSquares);
      var right = sidePlus(a);
      return {
        prompt: App.i18n.t('gen.squareSide'),
        visual: '<div class="tile-stage">' + tileRect(a, a) + '</div>',
        /* What the picture is made of, so it is not the answer read out. */
        visualAria: tileAria({ sq: 1, str: 2 * a, one: a * a }),
        legend: App.i18n.t('gen.squareSideHint'),
        options: threeWritten(right, [
          { html: '2x', aria: App.i18n.t('gen.ariaTwoX') },
          sidePlus(a + 1),
          sidePlus(a + 2)
        ]),
        inline: true
      };
    },

    /* A rectangle whose height is x. Finding the other side out of the
       pieces is what dividing one of these by x, or factorising it,
       comes down to. */
    otherSide: function (nv) {
      var a = draw(nv.id, DATA.tileRects);
      var right = sidePlus(a);
      return {
        prompt: App.i18n.t('gen.otherSide'),
        visual: '<div class="tile-stage tile-sided">' +
          '<span class="side-label">x</span>' + tileRect(a, 0) + '</div>',
        visualAria: tileAria({ sq: 1, str: a, one: 0 }),
        legend: App.i18n.t('gen.otherSideHint'),
        /* Reading the strips as a multiplier is the mistake: `a` of them
           along the side means x plus a, not a times x. */
        options: threeWritten(right, [
          { html: a + 'x', aria: App.i18n.t('gen.ariaTimesX').replace(/\{n\}/g, a) },
          sidePlus(a + 1),
          sidePlus(a - 1)
        ]),
        inline: true
      };
    },

    /* Two balances at once: that is what a system is. One says what the two
       together weigh, the other how much heavier one is. Both are on screen,
       so the pair that fits them both can be tried out by looking. */
    system: function (nv) {
      var item = draw(nv.id, DATA.systems);
      var bag = (item.total + item.diff) / 2;
      var box = item.total - bag;
      var label = function (a, b) {
        return App.i18n.t('gen.pairLabel')
          .replace(/\{bag\}/g, a).replace(/\{box\}/g, b);
      };
      /* The near-miss pairs are the ones that satisfy ONE of the two
         balances but not the other, which is exactly the mistake a system
         produces. */
      var wrong = [[bag + 1, box - 1], [bag - 1, box + 1], [bag, box + 1]]
        .filter(function (p) {
          return p[0] > 0 && p[1] > 0 &&
            !(p[0] + p[1] === item.total && p[0] - p[1] === item.diff);
        });
      return {
        prompt: App.i18n.t('gen.system'),
        visual: '<div class="two-balances">' +
          balance(bags(1) + boxes(1), weights(item.total)) +
          '<span class="and-also">' + App.i18n.t('gen.andAlso') + '</span>' +
          balance(bags(1), boxes(1) + weights(item.diff)) +
          '</div>',
        visualAria: App.i18n.t('gen.systemAria')
          .replace(/\{total\}/g, item.total).replace(/\{diff\}/g, item.diff),
        legend: App.i18n.t('gen.systemHint'),
        options: App.utils.shuffle(
          [{ html: '<span class="pair-name">' + label(bag, box) + '</span>',
             aria: label(bag, box), correct: true }].concat(
            wrong.slice(0, 2).map(function (p) {
              return {
                html: '<span class="pair-name">' + label(p[0], p[1]) + '</span>',
                aria: label(p[0], p[1]), correct: false
              };
            })
          )),
        inline: true
      };
    },

    /* A balance that does NOT stay level: one side weighs more. That is a
       "greater than", and it is read off the tilt and the weights. */
    tilted: function (nv) {
      var item = draw(nv.id, DATA.tilts);
      var leftHeavier = item.left > item.right;
      var first = App.i18n.t('gen.sideLeft');
      var second = App.i18n.t('gen.sideRight');
      return {
        prompt: App.i18n.t('gen.whichHeavier'),
        visual: '<div class="balance is-tilted-' + (leftHeavier ? 'left' : 'right') + '">' +
          '<div class="pan">' + weights(item.left) + '</div>' +
          '<div class="beam" aria-hidden="true">' + (leftHeavier ? '>' : '<') + '</div>' +
          '<div class="pan">' + weights(item.right) + '</div>' +
          '</div>',
        visualAria: App.i18n.t('gen.tiltAria')
          .replace(/\{left\}/g, item.left).replace(/\{right\}/g, item.right),
        legend: App.i18n.t('gen.tiltHint'),
        options: App.utils.shuffle([
          { html: '<span class="answer-name">' + first + '</span>', aria: first,
            correct: leftHeavier },
          { html: '<span class="answer-name">' + second + '</span>', aria: second,
            correct: !leftHeavier }
        ]),
        inline: true
      };
    },

    /* If x times x makes this many squares, how much is x? That is an
       equation of the second degree, asked as what it is. */
    squareEquation: function (nv) {
      var side = draw(nv.id, DATA.squareSides);
      var total = side * side;
      var html = '<div class="square-stage"><span class="sq-of-x">';
      for (var r = 0; r < side; r++) {
        html += '<span class="sq-row">';
        for (var c = 0; c < side; c++) html += '<span class="sq-cell"></span>';
        html += '</span>';
      }
      return {
        prompt: App.i18n.t('gen.squareEquation').replace(/\{n\}/g, total),
        visual: html + '</span><span class="letter-expr">x × x = ' + total +
          '</span></div>',
        visualAria: App.i18n.t('gen.squareEqAria')
          .replace(/\{n\}/g, total).replace(/\{side\}/g, side),
        legend: App.i18n.t('gen.squareEqHint'),
        /* Answering with the total, or with half of it, are the two real
           confusions. */
        options: threeOf(side, [total, Math.round(total / 2)])
      };
    },


    /* Does it grow by the same each step, or by more each time? The jumps
       are written between the bars, so the answer is read off the picture
       and not recalled. This is the difference between a straight line and
       a curve, without either word. */
    howItGrows: function (nv) {
      var g = draw(nv.id, DATA.growths);
      var steady = isSteady(g.values);
      return {
        prompt: App.i18n.t('gen.howItGrows'),
        visual: growthGraph(g.values),
        visualAria: App.i18n.t('gen.growthAria').replace(/\{n\}/g, g.values.length),
        legend: App.i18n.t('gen.growthHint'),
        options: App.utils.shuffle([true, false].map(function (v) {
          return {
            html: '<span class="trend-name">' +
              App.i18n.t(v ? 'grow.same' : 'grow.faster') + '</span>',
            aria: App.i18n.t(v ? 'grow.same' : 'grow.faster'),
            correct: v === steady
          };
        })),
        inline: true
      };
    },

    /* The other way round: which of the three climbs by the same each
       time. That one is the straight line. */
    pickStraight: function (nv) {
      var good = draw(nv.id + 'yes', DATA.growths.filter(function (g) {
        return isSteady(g.values);
      }));
      var bad = App.utils.shuffle(DATA.growths.filter(function (g) {
        return !isSteady(g.values);
      })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.pickStraight'),
        legend: App.i18n.t('gen.growthHint'),
        options: App.utils.shuffle([good].concat(bad).map(function (g) {
          return {
            html: growthGraph(g.values, true),
            aria: App.i18n.t(isSteady(g.values) ? 'grow.same' : 'grow.faster'),
            correct: g === good
          };
        })),
        inline: true
      };
    },


    /* One bag and some weights on one side, weights on the other. What the
       bag weighs is what is missing. */
    onePlusWeights: function (nv) {
      var item = draw(nv.id, DATA.simple);
      var answer = bagWeight(item);
      return {
        prompt: App.i18n.t('gen.howMuchBag'),
        visual: balance(bags(1) + weights(item.add), weights(item.total)),
        visualAria: App.i18n.t('gen.balanceAria')
          .replace(/\{left\}/g, item.add).replace(/\{right\}/g, item.total),
        legend: App.i18n.t('gen.simpleHint'),
        /* Answering with the whole side, or with the weights that are
           already there, are the two real confusions. */
        options: threeOf(answer, [item.total, item.add], App.i18n.t('gen.kilo'))
      };
    },

    /* Several bags, all the same. What one of them weighs is the total
       shared out between them. */
    manyBags: function (nv) {
      var item = draw(nv.id, DATA.groups);
      var answer = bagWeight(item);
      return {
        prompt: App.i18n.t('gen.howMuchEachBag').replace(/\{bags\}/g, item.bags),
        visual: balance(bags(item.bags), weights(item.total)),
        visualAria: App.i18n.t('gen.manyAria')
          .replace(/\{bags\}/g, item.bags).replace(/\{total\}/g, item.total),
        legend: App.i18n.t('gen.manyHint').replace(/\{bags\}/g, item.bags),
        options: threeOf(answer, [item.total, item.bags], App.i18n.t('gen.kilo'))
      };
    },

    /* Weights on both sides: take the same off each and the bag is left
       alone. That is what solving an equation is, without the word. */
    bothSides: function (nv) {
      var item = draw(nv.id, DATA.both);
      var answer = bagWeight(item);
      return {
        prompt: App.i18n.t('gen.howMuchBag'),
        visual: balance(bags(1) + weights(item.left), weights(item.right)),
        visualAria: App.i18n.t('gen.balanceAria')
          .replace(/\{left\}/g, item.left).replace(/\{right\}/g, item.right),
        legend: App.i18n.t('gen.bothHint'),
        options: threeOf(answer, [item.right, item.left], App.i18n.t('gen.kilo'))
      };
    },

    /* A letter is the name of a number you do not know yet. Give it a
       value and everything else follows. */
    substitute: function (nv) {
      var item = draw(nv.id, DATA.values);
      var answer = item.x * item.times;
      return {
        prompt: App.i18n.t('gen.substitute')
          .replace(/\{x\}/g, item.x).replace(/\{times\}/g, item.times),
        visual: '<div class="letter-stage">' +
          '<span class="letter-key">x = ' + item.x + '</span>' +
          '<span class="letter-expr">' + item.times + 'x</span></div>',
        visualAria: App.i18n.t('gen.substituteAria')
          .replace(/\{times\}/g, item.times).replace(/\{x\}/g, item.x),
        legend: App.i18n.t('gen.substituteHint').replace(/\{times\}/g, item.times),
        /* Adding instead of multiplying, and answering with the letter's
           own value, are the two real confusions. */
        options: threeOf(answer, [item.x + item.times, item.x])
      };
    },

    /* And how it is written down. The notation is the only new thing. */
    writeIt: function (nv) {
      /* Only how many bags there are is shown here, and several rows of
         DATA.values share that number: drawing the rows would hand out
         the very same question twice in a row. */
      var times = draw(nv.id, DATA.values.map(function (v) {
        return v.times;
      }).filter(function (t, i, all) { return all.indexOf(t) === i; }));
      var right = times + 'x';
      var wrong = ['x' + times, 'x + ' + times];
      return {
        prompt: App.i18n.t('gen.writeIt').replace(/\{times\}/g, times),
        visual: '<div class="letter-stage"><span class="letter-expr">' +
          bags(times) + '</span></div>',
        visualAria: App.i18n.t('gen.writeItAria').replace(/\{times\}/g, times),
        legend: App.i18n.t('gen.writeItHint'),
        options: App.utils.shuffle([right].concat(wrong).map(function (s) {
          return {
            html: '<span class="letter-expr">' + s + '</span>',
            aria: s,
            correct: s === right
          };
        })),
        inline: true
      };
    },

    /* Reading a real graph: between these two hours, does it go up, down,
       or stay the same? */
    upOrDown: function (nv) {
      var series = draw(nv.id, DATA.series);
      var i = draw(nv.id + series.id, (function () {
        var list = [];
        for (var k = 1; k < series.values.length; k++) list.push(k);
        return list;
      }()));
      var before = series.values[i - 1];
      var after = series.values[i];
      var trend = after > before ? 'up' : (after < before ? 'down' : 'same');
      return {
        prompt: App.i18n.t('gen.upOrDown')
          .replace(/\{a\}/g, series.from + i - 1).replace(/\{b\}/g, series.from + i)
          .replace(/\{what\}/g, App.i18n.t('series.' + series.id)),
        visual: graph(series, series.from + i - 1, series.from + i),
        visualAria: App.i18n.t('gen.graphAria')
          .replace(/\{what\}/g, App.i18n.t('series.' + series.id)),
        legend: App.i18n.t('gen.trendHint'),
        options: App.utils.shuffle(['up', 'down', 'same'].map(function (k) {
          return {
            html: '<span class="trend-name">' + App.i18n.t('trend.' + k) + '</span>',
            aria: App.i18n.t('trend.' + k),
            correct: k === trend
          };
        })),
        inline: true
      };
    },

    /* And where the highest point is. */
    highestPoint: function (nv) {
      var series = draw(nv.id, DATA.series);
      var top = Math.max.apply(Math, series.values);
      var at = series.from + series.values.indexOf(top);
      var others = App.utils.shuffle(series.values.map(function (v, i) {
        return series.from + i;
      }).filter(function (h) { return h !== at; })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.whenHighest')
          .replace(/\{what\}/g, App.i18n.t('series.' + series.id)),
        visual: graph(series, null, null),
        visualAria: App.i18n.t('gen.graphAria')
          .replace(/\{what\}/g, App.i18n.t('series.' + series.id)),
        legend: App.i18n.t('gen.highestHint'),
        options: App.utils.shuffle([at].concat(others).map(function (h) {
          return {
            html: App.i18n.t('gen.hour').replace(/\{h\}/g, h),
            aria: App.i18n.t('gen.hour').replace(/\{h\}/g, h),
            correct: h === at
          };
        }))
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
    visualEl.classList.toggle('hidden', !question.visual);
    if (question.visualAria) {
      visualEl.setAttribute('role', 'img');
      visualEl.setAttribute('aria-label', question.visualAria);
    } else {
      visualEl.removeAttribute('role');
      visualEl.removeAttribute('aria-label');
    }
    legendEl.textContent = question.legend || '';
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
    var said = plainText(correct.html).replace(/\s+/g, ' ').trim();
    explanationEl.textContent =
      (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      (said || correct.aria || '') + '.';
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
