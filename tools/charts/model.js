/* ============================================================
   Calculia — Charts: the data checks and the drawing helpers (pictograms, bars, tables, pairs, clouds).
   ============================================================ */
(function () {
  'use strict';

  /* ---- Data invariants ----
     Every "which has most / least" question needs a single winner, and
     every bar has to land exactly on a line of the scale. A bad data row
     must be loud here rather than produce a question with two right
     answers, which would teach that the person was wrong when they were
     not. */
  function counts(set) {
    return set.cats.map(function (c) { return c.n; });
  }
  function uniqueExtreme(list, pick) {
    var best = pick.apply(Math, list);
    return list.filter(function (v) { return v === best; }).length === 1;
  }
  DATA.sets.concat(DATA.barSets).forEach(function (set) {
    var ns = counts(set);
    if (!uniqueExtreme(ns, Math.max) || !uniqueExtreme(ns, Math.min)) {
      throw new Error('charts: set "' + set.id + '" has no single most/least');
    }
  });
  DATA.barSets.forEach(function (set) {
    set.cats.forEach(function (c) {
      if (c.n % DATA.barStep !== 0 || c.n > DATA.barMax) {
        throw new Error('charts: bar "' + set.id + '/' + c.id + '" misses the scale');
      }
    });
  });
  DATA.shareSets.forEach(function (set) {
    var total = counts(set).reduce(function (a, b) { return a + b; }, 0);
    if (total % set.cats.length !== 0) {
      throw new Error('charts: share set "' + set.id + '" does not divide evenly');
    }
  });

  /* ---- Utilities ---- */

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  function catName(id) { return App.i18n.t('cat.' + id); }
  function setTitle(id) { return App.i18n.t('set.' + id); }
  function tokenById(id) {
    return DATA.tokens.filter(function (t) { return t.id === id; })[0];
  }

  function extremeCat(set, which) {
    return set.cats.slice().sort(function (a, b) {
      return which === 'max' ? b.n - a.n : a.n - b.n;
    })[0];
  }

  /* Three numbers around the right one: one less, the answer, one more.
     Being out by one is the mistake reading a chart actually produces. */
  function numberOptions(value, step) {
    var d = step || 1;
    var values = [value, value - d, value + d].filter(function (v) { return v >= 0; });
    var extra = value + 2 * d;
    while (values.length < 3) { values.push(extra); extra += d; }
    return App.utils.shuffle(values.slice(0, 3)).map(function (v) {
      return { html: String(v), correct: v === value };
    });
  }

  /* The categories themselves as options: the confusion on offer is the
     real one (this row against that row), never a random word. */
  function catOptions(set, answerId) {
    return App.utils.shuffle(set.cats.map(function (c) {
      return {
        html: '<span class="opt-picto" aria-hidden="true">' + c.picto + '</span>' +
          '<span class="opt-name">' + catName(c.id) + '</span>',
        aria: catName(c.id),
        correct: c.id === answerId
      };
    }));
  }

  /* ---- The charts ----
     Everything is countable or readable off a labelled scale: the answer
     is always on screen, never held in the head. */
  function tokensHtml(n, picto) {
    var html = '';
    for (var i = 0; i < n; i++) {
      html += '<span class="chart-token">' + picto + '</span>';
    }
    return html;
  }

  function pictogram(set, markId) {
    var html = '<div class="pictogram">';
    set.cats.forEach(function (c) {
      html += '<div class="chart-row' + (c.id === markId ? ' is-asked' : '') + '">' +
        '<span class="row-label">' +
        (c.id === markId ? '<span class="row-mark" aria-hidden="true">👉</span>' : '') +
        catName(c.id) + '</span>' +
        '<span class="row-pictos">' + tokensHtml(c.n, c.picto) + '</span>' +
        '</div>';
    });
    return html + '</div>';
  }

  /* Horizontal bars: at 320px a vertical chart with three labels either
     overflows or shrinks the text, and neither is acceptable. */
  function barChart(set, markId) {
    var html = '<div class="bar-chart">';
    set.cats.forEach(function (c) {
      html += '<div class="bar-row' + (c.id === markId ? ' is-asked' : '') + '">' +
        '<span class="row-label">' +
        (c.id === markId ? '<span class="row-mark" aria-hidden="true">👉</span>' : '') +
        catName(c.id) + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' +
        ((c.n / DATA.barMax) * 100) + '%"></span></span>' +
        '</div>';
    });
    /* The scale is what makes the height readable, so it is part of the
       chart, not decoration. */
    html += '<div class="bar-scale">';
    for (var v = 0; v <= DATA.barMax; v += DATA.barStep * 2) {
      html += '<span class="scale-mark" style="left:' +
        ((v / DATA.barMax) * 100) + '%">' + v + '</span>';
    }
    return html + '</div></div>';
  }

  function frequencyTable(set, markId) {
    var html = '<table class="freq-table"><thead><tr>' +
      '<th>' + App.i18n.t('gen.colThing') + '</th>' +
      '<th>' + App.i18n.t('gen.colHowMany') + '</th>' +
      '</tr></thead><tbody>';
    set.cats.forEach(function (c) {
      html += '<tr class="' + (c.id === markId ? 'is-asked' : '') + '">' +
        '<td>' + catName(c.id) + '</td><td class="cell-n">' + c.n + '</td></tr>';
    });
    return html + '</tbody></table>';
  }

  function shareRows(set) {
    var html = '<div class="share-rows">';
    set.cats.forEach(function (c) {
      html += '<div class="share-row"><span class="row-label">' + catName(c.id) +
        '</span><span class="row-pictos">' + tokensHtml(c.n, c.picto) + '</span></div>';
    });
    return html + '</div>';
  }

  function bagHtml(bag) {
    var html = '<div class="bag">';
    bag.items.forEach(function (it) {
      html += tokensHtml(it.n, tokenById(it.id).picto).replace(/chart-token/g, 'bag-token');
    });
    return html + '</div>';
  }

  function setAria(set) {
    return setTitle(set.id) + '. ' + set.cats.map(function (c) {
      return catName(c.id) + ': ' + c.n;
    }).join('. ') + '.';
  }

  /* Three distinct numbers: the answer first, then the given confusions,
     then neighbours to pad if any of them collided with it. */
  function pickNumbers(correct, candidates) {
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.concat([correct + 1, correct - 1, correct + 2]).forEach(function (v) {
      if (v > 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    return App.utils.shuffle(list).map(function (v) {
      return { html: String(v), correct: v === correct };
    });
  }

  /* A group of measurements marked on one line from 1 to 10, so two
     groups can be compared by how far apart their marks are. */
  function spreadLine(values, label) {
    var html = '<span class="spread-row"><span class="spread-label">' + label + '</span>' +
      '<span class="spread-line">';
    for (var v = 1; v <= 10; v++) {
      var n = values.filter(function (x) { return x === v; }).length;
      html += '<span class="spread-slot">' +
        (n ? '<span class="spread-mark" data-count="' + n + '">' +
          new Array(n + 1).join('●') + '</span>' : '') + '</span>';
    }
    return html + '</span></span>';
  }

  /* Two series over the same columns. Each series carries its own picture
     at the start of its bar and its own outline, so the two are never told
     apart by colour alone (WCAG 1.4.1). */
  function pairChart(set) {
    var html = '<div class="pair-chart"><p class="pair-key">' +
      '<span class="key-item"><span class="key-picto" aria-hidden="true">' +
      tokenOrCatPicto(set.a) + '</span>' + catName(set.a) + '</span>' +
      '<span class="key-item is-b"><span class="key-picto" aria-hidden="true">' +
      tokenOrCatPicto(set.b) + '</span>' + catName(set.b) + '</span></p>';
    set.cats.forEach(function (c) {
      html += '<div class="pair-row"><span class="pair-label">' + catName(c.id) + '</span>' +
        '<span class="pair-bars">' +
        '<span class="pair-track"><span class="pair-fill is-a" style="width:' +
        ((c.an / DATA.barMax) * 100) + '%"></span></span>' +
        '<span class="pair-track"><span class="pair-fill is-b" style="width:' +
        ((c.bn / DATA.barMax) * 100) + '%"></span></span>' +
        '</span></div>';
    });
    html += '<div class="bar-scale">';
    for (var v = 0; v <= DATA.barMax; v += DATA.barStep * 2) {
      html += '<span class="scale-mark" style="left:' +
        ((v / DATA.barMax) * 100) + '%">' + v + '</span>';
    }
    return html + '</div></div>';
  }

  /* The series are named with category ids, which carry their picture in
     whichever set they came from. */
  function tokenOrCatPicto(id) {
    var found = '';
    DATA.sets.concat(DATA.barSets).forEach(function (set) {
      set.cats.forEach(function (c) { if (c.id === id && !found) found = c.picto; });
    });
    return found;
  }

  /* Every pair of series has to have one column each way and one tie, or
     one of the three questions would have no answer, or more than one. */
  DATA.pairSets.forEach(function (set) {
    var wins = function (pick) {
      return set.cats.filter(pick).length;
    };
    if (wins(function (c) { return c.an > c.bn; }) !== 1) {
      throw new Error('charts: pair "' + set.id + '" has no single column where the first wins');
    }
    if (wins(function (c) { return c.bn > c.an; }) !== 1) {
      throw new Error('charts: pair "' + set.id + '" has no single column where the second wins');
    }
    if (wins(function (c) { return c.an === c.bn; }) !== 1) {
      throw new Error('charts: pair "' + set.id + '" has no single tied column');
    }
    /* An odd value would land the bar between two marks of the scale. */
    set.cats.forEach(function (c) {
      if (c.an % DATA.barStep || c.bn % DATA.barStep ||
          c.an > DATA.barMax || c.bn > DATA.barMax) {
        throw new Error('charts: pair "' + set.id + '" has a bar that cannot be read off the scale');
      }
    });
    [set.a, set.b].forEach(function (id) {
      if (!tokenOrCatPicto(id)) {
        throw new Error('charts: series "' + id + '" has no picture of its own');
      }
    });
  });

  /* A group whose lowest and highest are the same has no spread to measure. */
  DATA.spreads.forEach(function (pair) {
    ['tight', 'wide'].forEach(function (k) {
      var values = pair[k];
      if (Math.max.apply(null, values) === Math.min.apply(null, values)) {
        throw new Error('charts: group ' + values.join(',') + ' has no lowest and highest');
      }
    });
  });

  /* Each cloud has to do what it says: the dots must really end higher or
     lower than they started, or the level would teach the opposite. */
  DATA.clouds.forEach(function (c) {
    var goesUp = c.points[c.points.length - 1] > c.points[0];
    if (goesUp !== (c.dir === 'up')) {
      throw new Error('charts: cloud "' + c.id + '" does not go ' + c.dir);
    }
  });
  ['up', 'down'].forEach(function (dir) {
    if (!DATA.clouds.some(function (c) { return c.dir === dir; })) {
      throw new Error('charts: no cloud that goes "' + dir + '"');
    }
  });

  App.ChartsModel = {
    tokensHtml: tokensHtml,
    tokenById: tokenById,
    catName: catName,
    pickNumbers: pickNumbers,
    spreadLine: spreadLine,
    setTitle: setTitle,
    pictogram: pictogram,
    setAria: setAria,
    numberOptions: numberOptions,
    extremeCat: extremeCat,
    catOptions: catOptions,
    barChart: barChart,
    frequencyTable: frequencyTable,
    shareRows: shareRows,
    bagHtml: bagHtml,
    pairChart: pairChart
  };
})();
