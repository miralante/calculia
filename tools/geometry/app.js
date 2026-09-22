/* ============================================================
   Calculia — Geometría
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'geometry';
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
     The kind of an angle comes from its degrees, the perimeter and the
     area from the sides, and whether a figure is symmetrical from folding
     it. So the drawing and the right answer cannot drift apart: they are
     computed from the same number. */
  function angleKind(deg) {
    return deg === 90 ? 'right' : (deg < 90 ? 'acute' : 'obtuse');
  }
  function perimeterOf(r) { return 2 * (r.w + r.h); }
  function areaOf(r) { return r.w * r.h; }

  /* Folding along a vertical line: every row must read the same
     backwards. This is literally what the person is asked to imagine. */
  function isSymmetric(figure) {
    return figure.rows.every(function (row) {
      return row === row.split('').reverse().join('');
    });
  }

  /* ---- Data invariants, loud at start-up rather than wrong on screen ---- */
  DATA.figures.forEach(function (f) {
    var width = f.rows[0].length;
    f.rows.forEach(function (row) {
      if (row.length !== width) {
        throw new Error('geometry: figure "' + f.id + '" has rows of different width');
      }
      if (/[^#.]/.test(row)) {
        throw new Error('geometry: figure "' + f.id + '" has a cell that is not # or .');
      }
    });
    /* The fold line is drawn down the middle of the grid, so an empty
       first or last column would put it off-centre from the figure the
       person actually sees — and folding along the wrong line teaches
       the wrong thing. */
    var usesEdges = f.rows.some(function (row) { return row[0] === '#'; }) &&
      f.rows.some(function (row) { return row[width - 1] === '#'; });
    if (!usesEdges) {
      throw new Error('geometry: figure "' + f.id + '" leaves an outer column empty');
    }
  });
  ['right', 'acute', 'obtuse'].forEach(function (kind) {
    if (!DATA.angles.some(function (a) { return angleKind(a.deg) === kind; })) {
      throw new Error('geometry: no angle of kind "' + kind + '"');
    }
  });
  /* Two angles of the same degrees draw exactly the same picture, so one
     after the other reads as a "Siguiente" button that does nothing. */
  DATA.angles.forEach(function (a, i) {
    DATA.angles.slice(i + 1).forEach(function (b) {
      if (a.deg === b.deg) {
        throw new Error('geometry: "' + a.id + '" and "' + b.id + '" draw the same angle');
      }
    });
  });
  [true, false].forEach(function (want) {
    if (!DATA.figures.some(function (f) { return isSymmetric(f) === want; })) {
      throw new Error('geometry: no figure that is ' + (want ? '' : 'not ') + 'symmetric');
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

  /* The real name is what the angle is called everywhere else, so it is
     what gets taught — with its plain-words gloss next to it, never
     instead of it. */
  function range(from, to) {
    var list = [];
    for (var v = from; v <= to; v++) list.push(v);
    return list;
  }

  function kindName(kind) { return App.i18n.t('angle.' + kind + '.name'); }
  function kindGloss(kind) { return App.i18n.t('angle.' + kind + '.gloss'); }

  /* Three numbers around the right one. Being out by one is the mistake
     counting squares actually produces. */
  function numberOptions(value) {
    var values = [value, value - 1, value + 1].filter(function (v) { return v > 0; });
    var extra = value + 2;
    while (values.length < 3) { values.push(extra); extra += 1; }
    return App.utils.shuffle(values.slice(0, 3)).map(function (v) {
      return { html: String(v), correct: v === value };
    });
  }

  /* ---- The angle ----
     Every angle is drawn with the same faint square-corner guide, the way
     you would hold the corner of a sheet of paper against it. The guide
     is what makes the question answerable by looking; it is identical in
     every question, so it gives nothing away about this one. */
  var VX = 100, VY = 130, RAY = 95;

  function angleSvg(deg) {
    var rad = (deg * Math.PI) / 180;
    var x = VX + RAY * Math.cos(rad);
    var y = VY - RAY * Math.sin(rad);
    return '<svg viewBox="0 0 200 150" width="220" height="165" aria-hidden="true">' +
      /* The corner guide: straight up from the vertex, plus its little
         square, exactly where a right angle would fall. */
      '<line x1="' + VX + '" y1="' + VY + '" x2="' + VX + '" y2="' + (VY - RAY) +
      '" class="angle-guide"/>' +
      '<polyline points="' + VX + ',' + (VY - 26) + ' ' + (VX + 26) + ',' + (VY - 26) +
      ' ' + (VX + 26) + ',' + VY + '" class="angle-guide"/>' +
      '<line x1="' + VX + '" y1="' + VY + '" x2="' + (VX + RAY) + '" y2="' + VY +
      '" class="angle-ray"/>' +
      '<line x1="' + VX + '" y1="' + VY + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) +
      '" class="angle-ray"/>' +
      '<circle cx="' + VX + '" cy="' + VY + '" r="5" class="angle-vertex"/>' +
      '</svg>';
  }

  /* ---- The grid figures ----
     Everything is drawn square by square, so the perimeter can be walked
     and the area counted without working anything out. */
  var CELL = 22;

  function gridSvg(cells, cols, rows, opts) {
    var o = opts || {};
    var w = cols * CELL;
    var h = rows * CELL;
    var body = '';
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (cells[r][c]) {
          body += '<rect x="' + (c * CELL) + '" y="' + (r * CELL) + '" width="' + CELL +
            '" height="' + CELL + '" class="grid-cell"/>';
        }
      }
    }
    if (o.axis) {
      body += '<line x1="' + (w / 2) + '" y1="-6" x2="' + (w / 2) + '" y2="' + (h + 6) +
        '" class="fold-line"/>';
    }
    var size = o.small ? { w: Math.round(w * 0.62), h: Math.round(h * 0.62) } : { w: w, h: h };
    return '<svg viewBox="-8 -8 ' + (w + 16) + ' ' + (h + 16) + '" width="' + size.w +
      '" height="' + size.h + '" class="grid-svg" aria-hidden="true">' + body +
      (o.outline
        ? '<rect x="0" y="0" width="' + w + '" height="' + h + '" class="grid-border"/>'
        : '') +
      '</svg>';
  }

  function rectSvg(rect, outline) {
    var cells = [];
    for (var r = 0; r < rect.h; r++) {
      cells.push([]);
      for (var c = 0; c < rect.w; c++) cells[r].push(true);
    }
    return gridSvg(cells, rect.w, rect.h, { outline: outline });
  }

  function figureSvg(figure, opts) {
    var cells = figure.rows.map(function (row) {
      return row.split('').map(function (ch) { return ch === '#'; });
    });
    var o = opts || {};
    o.axis = true;
    return gridSvg(cells, figure.rows[0].length, figure.rows.length, o);
  }

  /* ---- Figures given by their corners ----
     The side lengths are measured off the points, so the tick marks, the
     name and the right answer all come from the same place and cannot
     disagree. */
  function sideLengths(points) {
    return points.map(function (p, i) {
      var q = points[(i + 1) % points.length];
      return Math.sqrt(Math.pow(q[0] - p[0], 2) + Math.pow(q[1] - p[1], 2));
    });
  }

  /* Sides within a whisker of each other count as equal: the drawing is in
     pixels, so exact equality would depend on rounding. */
  function equalGroups(points) {
    var lengths = sideLengths(points);
    var groups = [];
    lengths.forEach(function (len, i) {
      var g = groups.filter(function (x) { return Math.abs(x.len - len) < 1.5; })[0];
      if (g) g.sides.push(i);
      else groups.push({ len: len, sides: [i] });
    });
    return groups;
  }

  function equalSideCount(points) {
    var biggest = 0;
    equalGroups(points).forEach(function (g) {
      if (g.sides.length > 1 && g.sides.length > biggest) biggest = g.sides.length;
    });
    return biggest;
  }

  /* Standard notation: sides with the same marks are the same length, and a
     side on its own gets none. That is what makes the count possible by
     looking instead of measuring. */
  function tickMarks(points) {
    var html = '';
    var groups = equalGroups(points).filter(function (g) { return g.sides.length > 1; });
    groups.forEach(function (g, gi) {
      g.sides.forEach(function (i) {
        var p = points[i];
        var q = points[(i + 1) % points.length];
        var mx = (p[0] + q[0]) / 2;
        var my = (p[1] + q[1]) / 2;
        var len = Math.sqrt(Math.pow(q[0] - p[0], 2) + Math.pow(q[1] - p[1], 2)) || 1;
        /* Along the side, and across it. */
        var ax = (q[0] - p[0]) / len;
        var ay = (q[1] - p[1]) / len;
        for (var t = 0; t <= gi; t++) {
          var off = (t - gi / 2) * 7;
          var cx = mx + ax * off;
          var cy = my + ay * off;
          html += '<line x1="' + (cx - ay * 7).toFixed(1) + '" y1="' + (cy + ax * 7).toFixed(1) +
            '" x2="' + (cx + ay * 7).toFixed(1) + '" y2="' + (cy - ax * 7).toFixed(1) +
            '" class="side-tick"/>';
        }
      });
    });
    return html;
  }

  function figureSvgByPoints(points, marks) {
    return '<svg viewBox="0 0 120 120" width="180" height="180" aria-hidden="true">' +
      '<polygon points="' + points.map(function (p) {
        return p[0] + ',' + p[1];
      }).join(' ') + '" class="figure-shape"/>' +
      (marks ? tickMarks(points) : '') + '</svg>';
  }

  function figureName(id) { return App.i18n.t('figure.' + id + '.name'); }
  function figureGloss(id) { return App.i18n.t('figure.' + id + '.gloss'); }

  /* ---- The coordinate grid ----
     The numbers are written along the edges, so a cell is read off the
     drawing rather than worked out. */
  function coordGrid(col, row) {
    var cols = DATA.grid.cols;
    var rows = DATA.grid.rows;
    var w = cols * CELL;
    var h = rows * CELL;
    var body = '';
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        body += '<rect x="' + (c * CELL) + '" y="' + (r * CELL) + '" width="' + CELL +
          '" height="' + CELL + '" class="coord-cell"/>';
      }
    }
    /* Rows are numbered from the bottom up, the way a graph is read. */
    var cy = (rows - row) * CELL + CELL / 2;
    body += '<circle cx="' + ((col - 1) * CELL + CELL / 2) + '" cy="' + cy +
      '" r="7" class="coord-dot"/>';
    for (var i = 1; i <= cols; i++) {
      body += '<text x="' + ((i - 1) * CELL + CELL / 2) + '" y="' + (h + 14) +
        '" class="coord-label">' + i + '</text>';
    }
    for (var j = 1; j <= rows; j++) {
      body += '<text x="-8" y="' + ((rows - j) * CELL + CELL / 2 + 5) +
        '" class="coord-label">' + j + '</text>';
    }
    return '<svg viewBox="-20 -6 ' + (w + 28) + ' ' + (h + 26) + '" width="' + (w + 40) +
      '" height="' + (h + 34) + '" class="coord-svg" aria-hidden="true">' + body + '</svg>';
  }

  /* Squares near this one, to offer as the wrong answers. The swapped pair
     comes first because saying the two numbers the other way round is the
     mistake this activity is about — but only when that really is another
     square, which it is not on the diagonal. Every candidate is checked to
     be on the grid and different, so a corner square never ends up offering
     itself twice. */
  function neighbourSquares(col, row, howMany) {
    var candidates = [{ c: row, r: col },
      { c: col + 1, r: row }, { c: col - 1, r: row },
      { c: col, r: row + 1 }, { c: col, r: row - 1 }];
    var seenPair = {};
    seenPair[col + ',' + row] = true;
    var out = [];
    candidates.forEach(function (o) {
      var key = o.c + ',' + o.r;
      if (o.c < 1 || o.c > DATA.grid.cols || o.r < 1 || o.r > DATA.grid.rows) return;
      if (seenPair[key] || out.length >= howMany) return;
      seenPair[key] = true;
      out.push(o);
    });
    return out;
  }

  function coordLabel(col, row) {
    return App.i18n.t('gen.coordLabel').replace(/\{col\}/g, col).replace(/\{row\}/g, row);
  }

  /* ---- The circle ----
     Measured the way it really is measured: the border laid out against
     what the circle measures across, and the inside counted in whole
     squares. Both are approximations, and the wording says so. */
  var ACROSS_TIMES = 3;

  function circleAcross(d) { return d * ACROSS_TIMES; }

  /* Whole grid squares fully inside a circle of this diameter. Counted,
     not from a formula, because counting is what the level asks for. */
  function wholeSquaresIn(d) {
    var r = d / 2;
    var n = 0;
    for (var y = 0; y < d; y++) {
      for (var x = 0; x < d; x++) {
        /* The far corner of the square decides: if it is inside, all of
           the square is. */
        var dx = Math.max(Math.abs(x - r), Math.abs(x + 1 - r));
        var dy = Math.max(Math.abs(y - r), Math.abs(y + 1 - r));
        if (Math.sqrt(dx * dx + dy * dy) <= r) n += 1;
      }
    }
    return n;
  }

  function circleSvg(d, withGrid) {
    var size = 132;
    var cell = size / d;
    var body = '';
    if (withGrid) {
      for (var y = 0; y < d; y++) {
        for (var x = 0; x < d; x++) {
          var r = d / 2;
          var dx = Math.max(Math.abs(x - r), Math.abs(x + 1 - r));
          var dy = Math.max(Math.abs(y - r), Math.abs(y + 1 - r));
          var inside = Math.sqrt(dx * dx + dy * dy) <= r;
          body += '<rect x="' + (x * cell).toFixed(1) + '" y="' + (y * cell).toFixed(1) +
            '" width="' + cell.toFixed(1) + '" height="' + cell.toFixed(1) +
            '" class="circle-cell' + (inside ? ' is-in' : '') + '"/>';
        }
      }
    }
    body += '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + (size / 2 - 2) +
      '" class="circle-outline"/>';
    if (!withGrid) {
      /* The line across, which is what the border is compared against. */
      body += '<line x1="2" y1="' + (size / 2) + '" x2="' + (size - 2) + '" y2="' + (size / 2) +
        '" class="across-line"/>';
    }
    return '<svg viewBox="-3 -3 ' + (size + 6) + ' ' + (size + 6) + '" width="180" height="180" ' +
      'aria-hidden="true">' + body + '</svg>';
  }

  /* ---- The box ----
     Drawn as its layers, one under the other, so the cubes inside can be
     counted instead of multiplied. */
  function boxLayers(box) {
    var html = '<div class="layer-stack">';
    for (var layer = 0; layer < box.d; layer++) {
      html += '<span class="layer">';
      for (var r = 0; r < box.h; r++) {
        html += '<span class="layer-row">';
        for (var c = 0; c < box.w; c++) html += '<span class="cube"></span>';
        html += '</span>';
      }
      html += '</span>';
    }
    return html + '</div>';
  }

  /* ---- Moving and turning ----
     A figure turned a quarter of the way round is the transpose of its
     rows, reversed. Computing it means the options cannot drift from what
     the question claims. */
  function turned(rows) {
    var h = rows.length;
    var w = rows[0].length;
    var out = [];
    for (var x = 0; x < w; x++) {
      var line = '';
      for (var y = h - 1; y >= 0; y--) line += rows[y][x];
      out.push(line);
    }
    return out;
  }

  function mirrored(rows) {
    return rows.map(function (row) { return row.split('').reverse().join(''); });
  }

  function sameRows(a, b) { return a.join('|') === b.join('|'); }

  /* A figure whose turn looks like itself would make "moved" and "turned"
     the same picture, and then the question would have two right answers. */
  DATA.movedFigures.forEach(function (f) {
    if (sameRows(turned(f.rows), f.rows) || sameRows(mirrored(f.rows), f.rows)) {
      throw new Error('geometry: figure "' + f.id + '" looks the same turned or mirrored');
    }
  });
  DATA.circles.forEach(function (d) {
    if (wholeSquaresIn(d) < 1) {
      throw new Error('geometry: a circle of ' + d + ' has no whole square inside it');
    }
  });

  /* The same figure drawn in a padded grid, so a moved copy really sits
     somewhere else on the page. */
  function paddedFigure(rows, shiftX, shiftY, small) {
    var w = rows[0].length + 1;
    var h = rows.length + 1;
    var cells = [];
    for (var r = 0; r < h; r++) {
      cells.push([]);
      for (var c = 0; c < w; c++) cells[r].push(false);
    }
    rows.forEach(function (row, r) {
      row.split('').forEach(function (ch, c) {
        if (ch === '#') cells[r + shiftY][c + shiftX] = true;
      });
    });
    return gridSvg(cells, w, h, { small: small });
  }

  /* ---- Degrees ----
     A protractor with a tick every ten degrees and a number every thirty:
     the angle is read off the scale by counting ticks, never estimated.
     Only angles that land on a numbered mark are asked about, so the
     reading is exact. */
  var DEG_STEP = 10;
  var DEG_LABEL = 30;

  function protractorSvg(deg) {
    var arc = 78;
    var body = '';
    for (var t = 0; t <= 180; t += DEG_STEP) {
      var rad = (t * Math.PI) / 180;
      var inner = (t % DEG_LABEL === 0) ? arc - 12 : arc - 6;
      body += '<line x1="' + (VX + inner * Math.cos(rad)).toFixed(1) +
        '" y1="' + (VY - inner * Math.sin(rad)).toFixed(1) +
        '" x2="' + (VX + arc * Math.cos(rad)).toFixed(1) +
        '" y2="' + (VY - arc * Math.sin(rad)).toFixed(1) +
        '" class="deg-tick' + (t % DEG_LABEL === 0 ? ' is-named' : '') + '"/>';
      if (t % DEG_LABEL === 0) {
        body += '<text x="' + (VX + (arc + 11) * Math.cos(rad)).toFixed(1) +
          '" y="' + (VY - (arc + 8) * Math.sin(rad)).toFixed(1) +
          '" class="deg-label">' + t + '</text>';
      }
    }
    var rad2 = (deg * Math.PI) / 180;
    return '<svg viewBox="-6 10 212 132" width="220" height="150" aria-hidden="true">' +
      body +
      '<line x1="' + VX + '" y1="' + VY + '" x2="' + (VX + RAY) + '" y2="' + VY +
      '" class="angle-ray"/>' +
      '<line x1="' + VX + '" y1="' + VY + '" x2="' + (VX + RAY * Math.cos(rad2)).toFixed(1) +
      '" y2="' + (VY - RAY * Math.sin(rad2)).toFixed(1) + '" class="angle-ray"/>' +
      '<circle cx="' + VX + '" cy="' + VY + '" r="5" class="angle-vertex"/>' +
      '</svg>';
  }

  /* What one gap between two hour marks is worth. Not stored: the whole
     turn and the number of marks are, and this comes out of them. */
  function degreesPerMark() { return DATA.fullTurn / DATA.clockMarks; }

  /* The short way round between two hour marks, in marks. */
  function marksApart(from, to) {
    var d = Math.abs(from - to) % DATA.clockMarks;
    return Math.min(d, DATA.clockMarks - d);
  }

  function clockSvg(from, to) {
    var cx = 75, cy = 75, r = 58;
    var at = function (mark, len) {
      /* Twelve at the top, going round clockwise, like a real clock. */
      var a = ((mark % DATA.clockMarks) / DATA.clockMarks) * 2 * Math.PI - Math.PI / 2;
      return [cx + len * Math.cos(a), cy + len * Math.sin(a)];
    };
    var body = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="clock-face"/>';
    for (var m = 1; m <= DATA.clockMarks; m++) {
      var p = at(m, r - 14);
      body += '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 4).toFixed(1) +
        '" class="clock-num">' + m + '</text>';
      var a = at(m, r - 4), b = at(m, r);
      body += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) +
        '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" class="clock-tick"/>';
    }
    [from, to].forEach(function (mark) {
      var p = at(mark, r - 22);
      body += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) +
        '" y2="' + p[1].toFixed(1) + '" class="clock-hand"/>';
    });
    body += '<circle cx="' + cx + '" cy="' + cy + '" r="4" class="angle-vertex"/>';
    return '<svg viewBox="0 0 150 150" width="180" height="180" aria-hidden="true">' +
      body + '</svg>';
  }

  /* ---- Two lines ----
     Which pair it is comes out of the drawing: the slopes of the two lines
     decide it, so the picture and the answer cannot disagree. */
  function slopeOf(line) {
    var dx = line[1][0] - line[0][0];
    var dy = line[1][1] - line[0][1];
    return dx === 0 ? null : dy / dx;
  }

  function pairKind(pair) {
    var sa = slopeOf(pair.a);
    var sb = slopeOf(pair.b);
    var close = function (x, y) { return Math.abs(x - y) < 0.01; };
    if (sa === null && sb === null) return 'parallel';
    if (sa === null) return close(sb, 0) ? 'perpendicular' : 'crossing';
    if (sb === null) return close(sa, 0) ? 'perpendicular' : 'crossing';
    if (close(sa, sb)) return 'parallel';
    return close(sa * sb, -1) ? 'perpendicular' : 'crossing';
  }

  DATA.linePairs.forEach(function (pair) {
    if (pairKind(pair) !== pair.kind) {
      throw new Error('geometry: lines "' + pair.id + '" are ' + pairKind(pair) +
        ', not ' + pair.kind);
    }
  });
  ['parallel', 'perpendicular', 'crossing'].forEach(function (k) {
    if (!DATA.linePairs.some(function (p) { return p.kind === k; })) {
      throw new Error('geometry: no pair of lines that is "' + k + '"');
    }
  });

  function linesSvg(pair) {
    var line = function (l, cls) {
      return '<line x1="' + l[0][0] + '" y1="' + l[0][1] + '" x2="' + l[1][0] +
        '" y2="' + l[1][1] + '" class="' + cls + '"/>';
    };
    /* The two lines differ by stroke pattern as well as colour, so they are
       still two lines without any colour at all (WCAG 1.4.1). */
    return '<svg viewBox="0 0 120 120" width="190" height="190" aria-hidden="true">' +
      '<rect x="0" y="0" width="120" height="120" class="line-box"/>' +
      line(pair.a, 'pair-line is-first') + line(pair.b, 'pair-line is-second') +
      '</svg>';
  }

  /* ---- A triangle, drawn inside the rectangle it is half of ----
     The rectangle is drawn in dashes behind it, so "half of it" is a thing
     you see rather than a formula you are given. */
  DATA.triangles.forEach(function (t) {
    if ((t.w * t.h) % 2 !== 0) {
      throw new Error('geometry: a triangle of ' + t.w + 'x' + t.h + ' has no whole area');
    }
  });

  function triangleSvg(t) {
    var w = t.w * CELL;
    var h = t.h * CELL;
    var body = '';
    for (var r = 0; r < t.h; r++) {
      for (var c = 0; c < t.w; c++) {
        body += '<rect x="' + (c * CELL) + '" y="' + (r * CELL) + '" width="' + CELL +
          '" height="' + CELL + '" class="coord-cell"/>';
      }
    }
    body += '<rect x="0" y="0" width="' + w + '" height="' + h + '" class="half-box"/>';
    body += '<polygon points="0,' + h + ' ' + w + ',' + h + ' 0,0" class="tri-fill"/>';
    return '<svg viewBox="-2 -2 ' + (w + 4) + ' ' + (h + 4) + '" width="' + (w + 8) +
      '" height="' + (h + 8) + '" aria-hidden="true">' + body + '</svg>';
  }

  /* ---- A box opened out ----
     The six faces side by side, each one squared, so the outside of the box
     is counted the same way its inside was. */
  function faceHtml(cols, rows) {
    var html = '<span class="face">';
    for (var r = 0; r < rows; r++) {
      html += '<span class="face-row">';
      for (var c = 0; c < cols; c++) html += '<span class="face-cell"></span>';
      html += '</span>';
    }
    return html + '</span>';
  }

  function netHtml(box) {
    var html = '<div class="net">';
    [[box.w, box.h], [box.w, box.h], [box.w, box.d], [box.w, box.d],
      [box.d, box.h], [box.d, box.h]].forEach(function (f) {
      html += faceHtml(f[0], f[1]);
    });
    return html + '</div>';
  }

  function surfaceOf(box) {
    return 2 * (box.w * box.h + box.w * box.d + box.d * box.h);
  }

  /* ---- Points in a straight line ----
     The points that line up are built from the rule, so they really do line
     up; the odd one out is checked at start-up not to. */
  function pointsFromRule(rule) {
    var out = [];
    for (var i = 0; i < rule.n; i++) {
      out.push([rule.from[0] + rule.step[0] * i, rule.from[1] + rule.step[1] * i]);
    }
    return out;
  }

  function onSameLine(a, b, p) {
    return (b[0] - a[0]) * (p[1] - a[1]) === (b[1] - a[1]) * (p[0] - a[0]);
  }

  DATA.lineRules.forEach(function (rule) {
    var pts = pointsFromRule(rule).concat([rule.off]);
    pts.forEach(function (p) {
      if (p[0] < 1 || p[0] > DATA.grid.cols || p[1] < 1 || p[1] > DATA.grid.rows) {
        throw new Error('geometry: point ' + p.join(',') + ' falls off the grid');
      }
    });
    var line = pointsFromRule(rule);
    if (onSameLine(line[0], line[1], rule.off)) {
      throw new Error('geometry: the odd point ' + rule.off.join(',') + ' is on the line');
    }
    /* Two points are always in a line, so three are the fewest that can
       show one; more than three would not fit the four answers. */
    if (rule.n !== 3) {
      throw new Error('geometry: a line rule has to lay down exactly three points');
    }
  });

  function manyPointsSvg(points, labelled) {
    var cols = DATA.grid.cols;
    var rows = DATA.grid.rows;
    var w = cols * CELL;
    var h = rows * CELL;
    var body = '';
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        body += '<rect x="' + (c * CELL) + '" y="' + (r * CELL) + '" width="' + CELL +
          '" height="' + CELL + '" class="coord-cell"/>';
      }
    }
    points.forEach(function (p, i) {
      var x = (p[0] - 1) * CELL + CELL / 2;
      var y = (rows - p[1]) * CELL + CELL / 2;
      body += '<circle cx="' + x + '" cy="' + y + '" r="8" class="coord-dot"/>';
      if (labelled) {
        body += '<text x="' + x + '" y="' + (y + 4) + '" class="dot-letter">' +
          labelled[i] + '</text>';
      }
    });
    for (var i = 1; i <= cols; i++) {
      body += '<text x="' + ((i - 1) * CELL + CELL / 2) + '" y="' + (h + 14) +
        '" class="coord-label">' + i + '</text>';
    }
    for (var j = 1; j <= rows; j++) {
      body += '<text x="-8" y="' + ((rows - j) * CELL + CELL / 2 + 5) +
        '" class="coord-label">' + j + '</text>';
    }
    return '<svg viewBox="-20 -6 ' + (w + 28) + ' ' + (h + 26) + '" width="' + (w + 40) +
      '" height="' + (h + 34) + '" class="coord-svg" aria-hidden="true">' + body + '</svg>';
  }

  /* Three distinct numbers, the answer first, then the given confusions.
     `step` is how far apart the padding may be: a question read off a
     scale needs its wrong answers on the scale too. */
  function threeNumbers(correct, candidates, suffix, step) {
    var d = step || 1;
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.concat([correct + d, correct + 2 * d, correct + 3 * d]).forEach(function (v) {
      if (v > 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    return App.utils.shuffle(list).map(function (v) {
      var text = suffix ? suffix.replace(/\{n\}/g, v) : String(v);
      return { html: text, aria: text, correct: v === correct };
    });
  }

  var GENERATORS = {

    /* The angle in degrees, read off a protractor. The ticks are every ten
       and the numbers every thirty, so it is counted off the scale. */
    measureAngle: function (nv) {
      /* Only angles that land on a numbered mark: one that fell between
         two marks could not be read exactly, only guessed. */
      var angle = draw(nv.id, DATA.angles.filter(function (a) {
        return a.deg % DEG_LABEL === 0;
      }));
      return {
        prompt: App.i18n.t('gen.measureAngle'),
        visual: '<div class="angle-stage">' + protractorSvg(angle.deg) + '</div>',
        visualAria: App.i18n.t('gen.protractorAria').replace(/\{n\}/g, angle.deg),
        legend: App.i18n.t('gen.protractorHint').replace(/\{step\}/g, DEG_STEP),
        /* Reading the scale from the wrong end is what really goes wrong
           with a protractor, so 180 minus the angle is on offer. Every
           wrong answer lands on a numbered mark too: one that did not
           could be ruled out without reading the scale at all. */
        options: threeNumbers(angle.deg,
          [180 - angle.deg, angle.deg + DEG_LABEL, angle.deg - DEG_LABEL],
          App.i18n.t('gen.degrees'), DEG_LABEL)
      };
    },

    /* The same degrees on a clock face: a whole turn is 360 and the twelve
       marks cut it into equal pieces, so one hour is a piece of it. That is
       the base-sixty system standing where it can be seen. */
    clockAngle: function (nv) {
      var pair = draw(nv.id, DATA.clockPairs);
      var marks = marksApart(pair.from, pair.to);
      var answer = marks * degreesPerMark();
      return {
        prompt: App.i18n.t('gen.clockAngle')
          .replace(/\{a\}/g, pair.from).replace(/\{b\}/g, pair.to),
        visual: '<div class="angle-stage">' + clockSvg(pair.from, pair.to) + '</div>',
        visualAria: App.i18n.t('gen.clockAria')
          .replace(/\{a\}/g, pair.from).replace(/\{b\}/g, pair.to),
        legend: App.i18n.t('gen.clockHint')
          .replace(/\{turn\}/g, DATA.fullTurn)
          .replace(/\{marks\}/g, DATA.clockMarks)
          .replace(/\{each\}/g, degreesPerMark()),
        /* Answering with the hours instead of the degrees, and counting the
           long way round, are the two real confusions. */
        options: threeNumbers(answer,
          [marks, DATA.fullTurn - answer, answer + degreesPerMark()],
          App.i18n.t('gen.degrees'))
      };
    },

    /* Two lines: never touching, crossing, or crossing square. */
    linePair: function (nv) {
      var pair = draw(nv.id, DATA.linePairs);
      var kind = pairKind(pair);
      return {
        prompt: App.i18n.t('gen.linePair'),
        visual: '<div class="grid-stage">' + linesSvg(pair) + '</div>',
        visualAria: App.i18n.t('gen.linesAria'),
        legend: App.i18n.t('gen.linesHint'),
        options: App.utils.shuffle(['parallel', 'perpendicular', 'crossing']
          .map(function (k) {
            return {
              html: '<span class="answer-name">' + App.i18n.t('lines.' + k) + '</span>',
              aria: App.i18n.t('lines.' + k),
              correct: k === kind
            };
          })),
        inline: true
      };
    },

    /* The area of a triangle, seen as half of its rectangle. */
    triangleArea: function (nv) {
      var t = draw(nv.id, DATA.triangles);
      var whole = t.w * t.h;
      var answer = whole / 2;
      return {
        prompt: App.i18n.t('gen.triangleArea'),
        visual: '<div class="grid-stage">' + triangleSvg(t) + '</div>',
        visualAria: App.i18n.t('gen.triangleAria')
          .replace(/\{w\}/g, t.w).replace(/\{h\}/g, t.h),
        legend: App.i18n.t('gen.triangleHint'),
        /* Counting the whole rectangle, and adding the two sides instead of
           multiplying them, are the two mistakes this produces. */
        options: threeNumbers(answer, [whole, t.w + t.h])
      };
    },

    /* The outside of a box, counted on its six faces opened out. */
    surface: function (nv) {
      var box = draw(nv.id, DATA.boxes);
      var answer = surfaceOf(box);
      return {
        prompt: App.i18n.t('gen.surface'),
        visual: netHtml(box),
        visualAria: App.i18n.t('gen.netAria')
          .replace(/\{w\}/g, box.w).replace(/\{h\}/g, box.h).replace(/\{d\}/g, box.d),
        legend: App.i18n.t('gen.surfaceHint'),
        /* Counting the cubes inside instead of the squares outside is the
           confusion between the two levels, so it is on offer. */
        options: threeNumbers(answer, [box.w * box.h * box.d, answer / 2])
      };
    },

    /* Several points at once: three of them line up and one does not. That
       line is the line of analytic geometry, without an equation in sight. */
    offTheLine: function (nv) {
      var rule = draw(nv.id, DATA.lineRules);
      var inLine = pointsFromRule(rule);
      var letters = App.i18n.t('gen.dotLetters').split('');
      /* Where the odd one sits among the others changes from question to
         question, so the answer is never always the last dot. */
      var slot = draw(nv.id + 'slot', [0, 1, 2, 3]);
      var points = inLine.slice();
      points.splice(slot, 0, rule.off);
      return {
        prompt: App.i18n.t('gen.offTheLine'),
        visual: '<div class="grid-stage">' + manyPointsSvg(points, letters) + '</div>',
        visualAria: App.i18n.t('gen.pointsAria').replace(/\{n\}/g, points.length),
        legend: App.i18n.t('gen.lineUpHint'),
        options: App.utils.shuffle(points.map(function (p, i) {
          return {
            html: '<span class="answer-name">' + letters[i] + '</span>',
            aria: letters[i],
            correct: p === rule.off
          };
        })),
        inline: true
      };
    },

    /* How long is the border, roughly. It is a bit more than three times
       what the circle measures across, and the question asks for the
       "about", which is the honest version of that idea. */
    circleEdge: function (nv) {
      var d = draw(nv.id, DATA.circles);
      var about = circleAcross(d);
      return {
        prompt: App.i18n.t('gen.circleEdge').replace(/\{d\}/g, d),
        visual: '<div class="grid-stage">' + circleSvg(d, false) + '</div>',
        visualAria: App.i18n.t('gen.circleAria').replace(/\{d\}/g, d),
        legend: App.i18n.t('gen.circleHint').replace(/\{d\}/g, d),
        /* Doubling instead of tripling, and four times instead of three,
           are the two mistakes this actually produces. */
        options: App.utils.shuffle([about, d * 2, d * 4].map(function (v) {
          return {
            html: App.i18n.t('gen.about').replace(/\{n\}/g, v),
            aria: App.i18n.t('gen.about').replace(/\{n\}/g, v),
            correct: v === about
          };
        }))
      };
    },

    /* How much fits inside, counted in whole squares. */
    circleArea: function (nv) {
      var d = draw(nv.id, DATA.circles.filter(function (x) { return x <= 8; }));
      var whole = wholeSquaresIn(d);
      return {
        prompt: App.i18n.t('gen.circleArea'),
        visual: '<div class="grid-stage">' + circleSvg(d, true) + '</div>',
        visualAria: App.i18n.t('gen.circleGridAria').replace(/\{n\}/g, whole),
        legend: App.i18n.t('gen.circleAreaHint'),
        options: numberOptions(whole)
      };
    },

    /* How many cubes fit in the box. The layers are drawn, so this is
       counting, not a formula. */
    volume: function (nv) {
      var box = draw(nv.id, DATA.boxes);
      var cubes = box.w * box.h * box.d;
      var perLayer = box.w * box.h;
      return {
        prompt: App.i18n.t('gen.volume'),
        visual: boxLayers(box),
        visualAria: App.i18n.t('gen.boxAria')
          .replace(/\{layers\}/g, box.d).replace(/\{per\}/g, perLayer),
        legend: App.i18n.t('gen.volumeHint')
          .replace(/\{per\}/g, perLayer).replace(/\{layers\}/g, box.d),
        /* Counting only one layer, or adding the three measurements, are
           the two mistakes a box actually produces. */
        options: App.utils.shuffle([cubes, perLayer, box.w + box.h + box.d]
          .filter(function (v, i, list) { return list.indexOf(v) === i; })
          .slice(0, 3).map(function (v) {
            return { html: String(v), correct: v === cubes };
          }))
      };
    },

    /* Moved, or turned? A figure that has only been moved is still facing
       the same way; a turned one is not. */
    movedOrTurned: function (nv) {
      var fig = draw(nv.id, DATA.movedFigures);
      var moved = paddedFigure(fig.rows, 1, 1, true);
      var spun = paddedFigure(turned(fig.rows), 0, 1, true);
      var flipped = paddedFigure(mirrored(fig.rows), 1, 0, true);
      return {
        prompt: App.i18n.t('gen.whichMoved'),
        visual: '<div class="grid-stage">' + paddedFigure(fig.rows, 0, 0, false) + '</div>',
        visualAria: App.i18n.t('gen.movedAria'),
        legend: App.i18n.t('gen.movedHint'),
        options: App.utils.shuffle([
          { html: moved, aria: App.i18n.t('gen.ariaMoved'), correct: true },
          { html: spun, aria: App.i18n.t('gen.ariaTurned'), correct: false },
          { html: flipped, aria: App.i18n.t('gen.ariaFlipped'), correct: false }
        ]),
        inline: true
      };
    },


    /* What kind of angle is it. The guide corner stands in for the sheet
       of paper you would hold against it. */
    angleKind: function (nv) {
      var kinds = nv.against === 'all'
        ? ['right', 'acute', 'obtuse']
        : ['right', nv.against];
      var pool = DATA.angles.filter(function (a) {
        return kinds.indexOf(angleKind(a.deg)) !== -1;
      });
      var angle = draw(nv.id, pool);
      var kind = angleKind(angle.deg);
      return {
        prompt: App.i18n.t('gen.whichAngle'),
        visual: '<div class="angle-stage">' + angleSvg(angle.deg) + '</div>',
        visualAria: kindName(kind),
        legend: App.i18n.t('gen.angleHint'),
        options: App.utils.shuffle(kinds.map(function (k) {
          return {
            html: '<span class="kind-name">' + kindName(k) + '</span>' +
              '<span class="kind-gloss">' + kindGloss(k) + '</span>',
            aria: kindName(k) + ', ' + kindGloss(k),
            correct: k === kind
          };
        })),
        inline: true
      };
    },

    /* How long is the edge all the way round, in squares. */
    perimeter: function (nv) {
      var rect = draw(nv.id, DATA.rects[nv.shape]);
      return {
        prompt: App.i18n.t('gen.perimeter'),
        visual: '<div class="grid-stage">' + rectSvg(rect, true) + '</div>',
        visualAria: App.i18n.t('gen.rectAria')
          .replace(/\{w\}/g, rect.w).replace(/\{h\}/g, rect.h),
        legend: App.i18n.t('gen.perimeterHint'),
        options: numberOptions(perimeterOf(rect))
      };
    },

    /* How many squares fit inside. */
    area: function (nv) {
      var rect = draw(nv.id, DATA.rects[nv.shape]);
      return {
        prompt: App.i18n.t('gen.area'),
        visual: '<div class="grid-stage">' + rectSvg(rect, false) + '</div>',
        visualAria: App.i18n.t('gen.rectAria')
          .replace(/\{w\}/g, rect.w).replace(/\{h\}/g, rect.h),
        legend: App.i18n.t('gen.areaHint'),
        options: numberOptions(areaOf(rect))
      };
    },

    /* Does it match when you fold it along the line? */
    symmetry: function (nv) {
      var figure = draw(nv.id, DATA.figures);
      var yes = isSymmetric(figure);
      return {
        prompt: App.i18n.t('gen.isSymmetric'),
        visual: '<div class="grid-stage">' + figureSvg(figure, {}) + '</div>',
        visualAria: App.i18n.t(yes ? 'gen.ariaSymmetric' : 'gen.ariaNotSymmetric'),
        legend: App.i18n.t('gen.symmetryHint'),
        options: App.utils.shuffle([true, false].map(function (v) {
          return {
            html: '<span class="kind-name">' + App.i18n.t(v ? 'answer.yes' : 'answer.no') + '</span>',
            aria: App.i18n.t(v ? 'answer.yes' : 'answer.no'),
            correct: v === yes
          };
        })),
        inline: true
      };
    },

    /* How many sides are the same. The marks are on the drawing, so this
       is counting, not remembering. */
    equalSides: function (nv) {
      var all = DATA.figuresByName.triangles.concat(DATA.figuresByName.quads);
      var fig = draw(nv.id, all);
      var n = equalSideCount(fig.points);
      /* The three answers a figure can give: all of them, some of them, or
         none. They are always the same three, because that is the whole
         classification. */
      var choices = [fig.points.length, 2, 0];
      if (choices.indexOf(n) === -1) choices[0] = n;
      var seenChoice = {};
      var unique = choices.filter(function (v) {
        if (seenChoice[v]) return false;
        seenChoice[v] = true;
        return true;
      });
      return {
        prompt: App.i18n.t('gen.howManyEqual'),
        visual: '<div class="grid-stage">' + figureSvgByPoints(fig.points, true) + '</div>',
        visualAria: App.i18n.t('gen.equalAria').replace(/\{n\}/g, n),
        legend: App.i18n.t('gen.equalHint'),
        options: App.utils.shuffle(unique.map(function (v) {
          return { html: String(v), correct: v === n };
        }))
      };
    },

    /* And now its name, with the plain-words explanation beside it: the
       word is taught, not hidden. */
    nameFigure: function (nv) {
      var pool = DATA.figuresByName[nv.group];
      var fig = draw(nv.id, pool);
      return {
        prompt: App.i18n.t('gen.whichFigure'),
        visual: '<div class="grid-stage">' + figureSvgByPoints(fig.points, true) + '</div>',
        visualAria: figureName(fig.id),
        legend: App.i18n.t('gen.equalHint'),
        options: App.utils.shuffle(pool.map(function (f) {
          return {
            html: '<span class="kind-name">' + figureName(f.id) + '</span>' +
              '<span class="kind-gloss">' + figureGloss(f.id) + '</span>',
            aria: figureName(f.id) + ', ' + figureGloss(f.id),
            correct: f.id === fig.id
          };
        })),
        inline: true
      };
    },

    /* Which square is the dot on. Two numbers, column first. */
    readCoord: function (nv) {
      var col = draw(nv.id + 'c', range(1, DATA.grid.cols));
      var row = draw(nv.id + 'r', range(1, DATA.grid.rows));
      var picked = neighbourSquares(col, row, 2);
      return {
        prompt: App.i18n.t('gen.whichSquare'),
        visual: '<div class="grid-stage">' + coordGrid(col, row) + '</div>',
        visualAria: coordLabel(col, row),
        legend: App.i18n.t('gen.coordHint'),
        options: App.utils.shuffle(
          [{ html: coordLabel(col, row), aria: coordLabel(col, row), correct: true }].concat(
            picked.map(function (o) {
              return { html: coordLabel(o.c, o.r), aria: coordLabel(o.c, o.r), correct: false };
            })
          )),
        inline: true
      };
    },

    /* The other way round: the square is named and the grid has to be
       found. */
    pickCoord: function (nv) {
      var col = draw(nv.id + 'c', range(1, DATA.grid.cols));
      var row = draw(nv.id + 'r', range(1, DATA.grid.rows));
      var other = neighbourSquares(col, row, 1)[0];
      return {
        prompt: App.i18n.t('gen.findSquare').replace(/\{where\}/g, coordLabel(col, row)),
        legend: App.i18n.t('gen.coordHint'),
        options: App.utils.shuffle([
          { html: coordGrid(col, row), aria: coordLabel(col, row), correct: true },
          { html: coordGrid(other.c, other.r), aria: coordLabel(other.c, other.r), correct: false }
        ]),
        inline: true
      };
    },

    /* The other way round: which of the two folds and matches. */
    symmetryPick: function (nv) {
      var good = draw(nv.id + 'yes', DATA.figures.filter(isSymmetric));
      var bad = draw(nv.id + 'no', DATA.figures.filter(function (f) {
        return !isSymmetric(f);
      }));
      return {
        prompt: App.i18n.t('gen.pickSymmetric'),
        legend: App.i18n.t('gen.symmetryHint'),
        options: App.utils.shuffle([
          { html: figureSvg(good, { small: true }),
            aria: App.i18n.t('gen.ariaSymmetric'), correct: true },
          { html: figureSvg(bad, { small: true }),
            aria: App.i18n.t('gen.ariaNotSymmetric'), correct: false }
        ]),
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
    /* A picture option has no words of its own, so the explanation falls
       back to its aria text rather than saying nothing. */
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
