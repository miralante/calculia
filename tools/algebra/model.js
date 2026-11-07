/* ============================================================
   Calculia — Algebra: the data checks, the balance, graph, growth and pieces drawings.
   ============================================================ */
(function () {
  'use strict';

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

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

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

  App.AlgebraModel = {
    tileText: tileText,
    tileAria: tileAria,
    tilePile: tilePile,
    threeWritten: threeWritten,
    sidePlus: sidePlus,
    tileRect: tileRect,
    balance: balance,
    bags: bags,
    boxes: boxes,
    weights: weights,
    threeOf: threeOf,
    isSteady: isSteady,
    growthGraph: growthGraph,
    bagWeight: bagWeight,
    graph: graph
  };
})();
