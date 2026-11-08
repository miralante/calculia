/* ============================================================
   Calculia — Shapes: the drawings: triangles, areas, volumes, the concept cards, nets and grids (SVG and HTML).
   ============================================================ */
(function () {
  'use strict';

  var A = App.shapesArt;
  var polygonPoints = A.polygonPoints, pointsAttr = A.pointsAttr, SHAPE_FILL = A.SHAPE_FILL, shapeSvg = A.shapeSvg,
      solidSvg = A.solidSvg;
  function triangleAxisMark() {
    var pts = polygonPoints(3, 60, 62, 48);
    return axisMark(pts[0].x, pts[0].y, (pts[1].x + pts[2].x) / 2, (pts[1].y + pts[2].y) / 2);
  }

  function axisMark(x1, y1, x2, y2) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
      '" class="intro-axis-mark"/>';
  }

  function areaSvg() {
    var pts = polygonPoints(3, 60, 62, 48);
    var hatch = [];
    for (var i = -60; i < 200; i += 16) {
      hatch.push('<line x1="' + i + '" y1="0" x2="' + (i + 120) + '" y2="120"/>');
    }
    return '<svg viewBox="0 0 120 120" width="160" height="160" aria-hidden="true">' +
      '<defs><clipPath id="shapesAreaClip"><polygon points="' +
      pointsAttr(pts) + '"/></clipPath></defs>' +
      '<polygon points="' + pointsAttr(pts) + '" fill="var(--mod-razonamiento)" ' +
      'stroke="var(--color-texto)" stroke-width="4" stroke-linejoin="round"/>' +
      '<g clip-path="url(#shapesAreaClip)" class="area-hatch">' + hatch.join('') + '</g>' +
      '</svg>';
  }

  var TRIANGLE_KINDS = {
    sides: ['equilateral', 'isosceles', 'scalene'],
    angles: ['right', 'acute', 'obtuse']
  };

  var TRIANGLE_CORNERS = {
    equilateral: [[60, 14], [101.6, 86], [18.4, 86]],
    isosceles: [[60, 8], [96, 98], [24, 98]],
    scalene: [[12, 98], [110, 96], [34, 16]],
    right: [[20, 98], [104, 98], [20, 22]],
    acute: [[34, 14], [10, 98], [110, 96]],
    obtuse: [[10, 96], [110, 96], [56, 60]]
  };

  var TRIANGLE_TICKS = {
    equilateral: [1, 1, 1],
    isosceles: [2, 0, 2],
    scalene: [0, 0, 0]
  };

  var AREA_SHAPES = ['square', 'rectangle', 'triangle'];

  /* One short stroke across the middle of a side, or several spread along it. */
  function sideTicks(a, b, count) {
    var length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    var ux = (b[0] - a[0]) / length;
    var uy = (b[1] - a[1]) / length;
    var out = '';
    for (var k = 0; k < count; k += 1) {
      var along = (k - (count - 1) / 2) * 7;
      var x = (a[0] + b[0]) / 2 + ux * along;
      var y = (a[1] + b[1]) / 2 + uy * along;
      out += '<line x1="' + (x - uy * 6).toFixed(1) + '" y1="' + (y + ux * 6).toFixed(1) +
        '" x2="' + (x + uy * 6).toFixed(1) + '" y2="' + (y - ux * 6).toFixed(1) + '"/>';
    }
    return out;
  }

  function triangleKindSvg(kind) {
    var corners = TRIANGLE_CORNERS[kind];
    var ticks = TRIANGLE_TICKS[kind] || [0, 0, 0];
    var marks = ticks.map(function (count, i) {
      return sideTicks(corners[i], corners[(i + 1) % 3], count);
    }).join('');
    /* The right angle is the small square in its corner, as on paper. */
    if (kind === 'right') marks += '<polyline points="20,88 30,88 30,98" fill="none"/>';
    return '<svg viewBox="0 0 120 120" width="160" height="160" aria-hidden="true">' +
      '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
      '<polygon points="' + corners.map(function (c) { return c[0] + ',' + c[1]; }).join(' ') +
      '" fill="' + SHAPE_FILL + '" stroke-width="4"/>' + marks + '</g></svg>';
  }

  function countSvg(kind) {
    var cell = 20;
    var cols = kind === 'rectangle' ? 5 : 4;
    var rows = kind === 'rectangle' ? 3 : 4;
    var w = cols * cell;
    var h = rows * cell;
    var left = (120 - w) / 2;
    var top = (120 - h) / 2;
    var fill = kind === 'triangle'
      ? '<polygon points="' + left + ',' + top + ' ' + left + ',' + (top + h) + ' ' +
          (left + w) + ',' + (top + h) + '" fill="' + SHAPE_FILL + '" stroke-width="3"/>'
      : '<rect x="' + left + '" y="' + top + '" width="' + w + '" height="' + h +
          '" fill="' + SHAPE_FILL + '" stroke-width="3"/>';
    var lines = '';
    for (var c = 0; c <= cols; c++) {
      lines += '<line x1="' + (left + c * cell) + '" y1="' + top + '" x2="' + (left + c * cell) +
        '" y2="' + (top + h) + '"/>';
    }
    for (var r = 0; r <= rows; r++) {
      lines += '<line x1="' + left + '" y1="' + (top + r * cell) + '" x2="' + (left + w) +
        '" y2="' + (top + r * cell) + '"/>';
    }
    return '<svg viewBox="0 0 120 120" width="160" height="160" aria-hidden="true">' +
      '<g stroke="var(--color-texto)" stroke-width="1" stroke-linejoin="round">' +
      fill + lines + '</g></svg>';
  }

  var AREA_UNIT = 17;

  function turnedLabel(x, y, text, halo) {
    return '<text x="' + x + '" y="' + y + '" transform="rotate(-90 ' + x + ' ' + y +
      ')" text-anchor="middle" font-size="10" fill="var(--color-texto)" ' +
      (halo ? 'paint-order="stroke" stroke="var(--color-superficie)" stroke-width="3"'
        : 'stroke="none"') + '>' + text + '</text>';
  }

  function flatLabel(x, y, text) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="10" ' +
      'fill="var(--color-texto)" stroke="none">' + text + '</text>';
  }

  function areaCalcSvg(shape, base, height, withNumbers) {
    var w = base * AREA_UNIT;
    var h = height * AREA_UNIT;
    var left = (120 - w) / 2;
    var bottom = 102;
    var top = bottom - h;
    var centre = left + w / 2;
    var middle = (top + bottom) / 2;
    var square = shape === 'square';
    var measure = function (word, value) {
      return App.i18n.t(word) +
        (withNumbers ? ' ' + App.i18n.t('gen.cmValue').replace('{n}', value) : '');
    };
    /* The triangle's height is the dashed line from the top corner down to
       the middle of the base; the rectangles have no line, their sides are
       the height. */
    var body = shape === 'triangle'
      ? '<polygon points="' + left + ',' + bottom + ' ' + (left + w) + ',' + bottom + ' ' +
          centre + ',' + top + '" fill="' + SHAPE_FILL + '" stroke-width="4"/>' +
        '<line x1="' + centre + '" y1="' + top + '" x2="' + centre + '" y2="' + bottom +
          '" class="intro-axis-mark"/>'
      : '<rect x="' + left + '" y="' + top + '" width="' + w + '" height="' + h +
          '" fill="' + SHAPE_FILL + '" stroke-width="4"/>';
    /* The triangle's height is written beside its dashed line, inside the
       fill, with a halo; outside the slope the text would not fit the
       drawing. The rectangles name their side outside the figure. */
    var heightLabel = shape === 'triangle'
      ? turnedLabel(centre + 7, middle, measure('gen.heightLabel', height), true)
      : turnedLabel(left - 7, middle, measure(square ? 'gen.sideLabel' : 'gen.heightLabel', height), false);
    return '<svg viewBox="0 0 120 120" width="160" height="160" aria-hidden="true">' +
      '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' + body + '</g>' +
      flatLabel(centre, bottom + 14, measure(square ? 'gen.sideLabel' : 'gen.baseLabel', base)) +
      heightLabel + '</svg>';
  }

  function volumeSvg() {
    return '<svg viewBox="0 0 120 120" width="160" height="160" aria-hidden="true">' +
      '<rect x="8" y="8" width="104" height="104" rx="8" class="intro-space-mark"/>' +
      '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
      '<polygon points="28,42 64,24 96,42 60,60" class="solid-top"/>' +
      '<polygon points="28,42 60,60 60,96 28,78" class="solid-left"/>' +
      '<polygon points="60,60 96,42 96,78 60,96" class="solid-right"/>' +
      '</g></svg>';
  }

  function similaritySvg() {
    return '<svg viewBox="0 0 120 120" width="160" height="160" aria-hidden="true">' +
      '<polygon points="' + pointsAttr(polygonPoints(3, 36, 62, 32)) +
      '" fill="var(--mod-razonamiento)" stroke="var(--color-texto)" stroke-width="4" ' +
      'stroke-linejoin="round"/>' +
      '<polygon points="' + pointsAttr(polygonPoints(3, 90, 62, 19)) +
      '" fill="var(--mod-razonamiento)" stroke="var(--color-texto)" stroke-width="4" ' +
      'stroke-linejoin="round"/></svg>';
  }

  function triangleWith(mark) {
    return shapeSvg('triangle', false).replace('</svg>', mark + '</svg>');
  }

  function conceptCards(n) {
    if (n === 0) {
      /* The opening: what the two kinds of thing in this activity are. */
      return {
        layout: 'compare',
        cards: [
          { kind: 'flat', title: 'introFlatTitle', text: 'introFlatText',
            html: shapeSvg('triangle', false) },
          { kind: 'solid', title: 'introSolidTitle', text: 'introSolidText',
            html: solidSvg('sphere') }
        ]
      };
    }
    if (n === 1) {
      /* The edges of a flat figure, in the order they build on each other: a
         side, the vertex where two of them meet, and the perimeter, which
         is all the sides added up. The perimeter is not a third thing
         parallel to the other two — it is what they are for — so it takes
         its own row underneath. */
      return {
        layout: 'parts',
        cards: [
          { id: 'side', title: 'introSideTitle', text: 'introSideText',
            html: triangleWith('<line x1="18" y1="86" x2="102" y2="86" class="intro-side-mark"/>') },
          { id: 'corner', title: 'introCornerTitle', text: 'introCornerText',
            html: triangleWith('<circle cx="18" cy="86" r="7" class="intro-corner-mark"/>') },
          { id: 'perimeter', wide: true, title: 'introPerimeterTitle', text: 'introPerimeterText',
            /* The whole way round, not one piece of it: the outline as a
               dashed line just inside the triangle, the way you would walk
               it. Generated from the same centre and radius as the shape,
               only 8 units in, so it can never come loose from the figure
               it is describing. */
            html: triangleWith('<polygon points="' +
              pointsAttr(polygonPoints(3, 60, 62, 40)) + '" class="intro-perimeter-mark"/>') }
        ]
      };
    }
    if (n === 2) {
      /* What is inside, for the two kinds of thing: a flat figure has an
         area and a solid has a volume. Both are "the space it takes up",
         and the pairing is the reason they sit on the same slide. */
      return {
        layout: 'parts',
        cards: [
          { id: 'area', title: 'introAreaTitle', text: 'introAreaText', html: areaSvg() },
          { id: 'volume', title: 'introVolumeTitle', text: 'introVolumeText', html: volumeSvg() }
        ]
      };
    }
    /* Two figures compared: the same shape at another size, and the same
       shape folded onto itself. Both are about what a figure can do, not
       about how many sides it has, so they close the first concepts. */
    if (n === 3) {
      return {
        layout: 'parts',
        cards: [
          { id: 'symmetry', title: 'introSymmetryTitle', text: 'introSymmetryText',
            html: triangleWith(triangleAxisMark()) },
          { id: 'similarity', title: 'introSimilarityTitle', text: 'introSimilarityText',
            html: similaritySvg() }
        ]
      };
    }
    /* The area as the little squares inside, counted. The triangle is wide
       because it covers half of a square, the same idea as its formula. */
    if (n === 4) {
      return {
        layout: 'parts',
        cards: [
          { id: 'count-square', title: 'introCountSquareTitle', text: 'introCountSquareText',
            html: countSvg('square') },
          { id: 'count-rectangle', title: 'introCountRectangleTitle', text: 'introCountRectangleText',
            html: countSvg('rectangle') },
          { id: 'count-triangle', wide: true, title: 'introCountTriangleTitle', text: 'introCountTriangleText',
            html: countSvg('triangle') }
        ]
      };
    }
    /* The area by formula, one figure per shape, with the words of the
       formula on each drawing. The triangle is wide because its formula is
       the other two cut in half, so it goes underneath them. */
    if (n === 5) {
      return {
        layout: 'parts',
        cards: [
          { id: 'area-square', title: 'introAreaSquareTitle', text: 'introAreaSquareText',
            html: areaCalcSvg('square', 5, 5, false) },
          { id: 'area-rectangle', title: 'introAreaRectangleTitle', text: 'introAreaRectangleText',
            html: areaCalcSvg('rectangle', 5, 3, false) },
          { id: 'area-triangle', wide: true, title: 'introAreaTriangleTitle', text: 'introAreaTriangleText',
            html: areaCalcSvg('triangle', 6, 4, false) }
        ]
      };
    }
    /* The triangles by their sides, then by their angles. The scalene and
       the obtuse triangles are the wide cards: they are the ones with no
       pair to show, so they go underneath the other two. */
    if (n === 6) {
      return {
        layout: 'parts',
        cards: [
          { id: 'equilateral', title: 'introEquilateralTitle', text: 'introEquilateralText',
            html: triangleKindSvg('equilateral') },
          { id: 'isosceles', title: 'introIsoscelesTitle', text: 'introIsoscelesText',
            html: triangleKindSvg('isosceles') },
          { id: 'scalene', wide: true, title: 'introScaleneTitle', text: 'introScaleneText',
            html: triangleKindSvg('scalene') }
        ]
      };
    }
    return {
      layout: 'parts',
      cards: [
        { id: 'right', title: 'introRightTitle', text: 'introRightText',
          html: triangleKindSvg('right') },
        { id: 'acute', title: 'introAcuteTitle', text: 'introAcuteText',
          html: triangleKindSvg('acute') },
        { id: 'obtuse', wide: true, title: 'introObtuseTitle', text: 'introObtuseText',
          html: triangleKindSvg('obtuse') }
      ]
    };
  }

  var PIECE = 34;

  function netPieces(net) {
    var out = [];
    net.rows.forEach(function (row, r) {
      row.split('').forEach(function (ch, c) {
        if (ch !== '.') out.push({ kind: ch, r: r, c: c });
      });
    });
    return out;
  }

  var REGULAR_SIDES = ['triangle', 'square', 'rhombus', 'pentagon', 'hexagon', 'octagon'];

  var SYMMETRY_SHAPES = ['triangle', 'pentagon', 'trapezoid'];

  function netSvg(net) {
    var cols = Math.max.apply(Math, net.rows.map(function (r) { return r.length; }));
    var w = cols * PIECE;
    var h = net.rows.length * PIECE;
    var body = '';
    netPieces(net).forEach(function (p) {
      var x = p.c * PIECE;
      var y = p.r * PIECE;
      if (p.kind === 'T') {
        /* A triangle piece, drawn pointing away from the middle of the net
           so the shape reads as a flap that folds up. */
        var up = p.r < net.rows.length / 2;
        body += '<polygon points="' +
          (up ? (x + PIECE / 2) + ',' + y + ' ' + (x + PIECE) + ',' + (y + PIECE) +
                ' ' + x + ',' + (y + PIECE)
              : x + ',' + y + ' ' + (x + PIECE) + ',' + y + ' ' +
                (x + PIECE / 2) + ',' + (y + PIECE)) +
          '" class="net-piece net-tri"/>';
      } else {
        /* A rectangle piece is drawn a little shorter, so a prism's long
           faces do not look like squares. */
        var inset = p.kind === 'R' ? 5 : 0;
        body += '<rect x="' + x + '" y="' + (y + inset) + '" width="' + PIECE +
          '" height="' + (PIECE - inset * 2) + '" class="net-piece net-' +
          (p.kind === 'R' ? 'rect' : 'square') + '"/>';
      }
    });
    return '<div class="net-stage"><svg viewBox="-3 -3 ' + (w + 6) + ' ' + (h + 6) +
      '" width="' + (w + 6) + '" height="' + (h + 6) +
      '" class="net-svg" aria-hidden="true">' + body + '</svg></div>';
  }

  function netName(id) { return App.i18n.t('net.' + id + '.name'); }
  function netGloss(id) { return App.i18n.t('net.' + id + '.gloss'); }

  function faceOptions(correct) {
    var counts = DATA.nets.map(function (n) { return n.faces; });
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    counts.concat([correct + 1, correct - 1]).forEach(function (v) {
      if (v > 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    return App.utils.shuffle(list).map(function (v) {
      return { html: String(v), correct: v === correct };
    });
  }

  function shapeThumb(id, extra) {
    return '<span class="thumb">' +
      shapeSvg(id, false).replace('</svg>', (extra || '') + '</svg>') + '</span>';
  }

  function solidThumb(id, big) {
    return '<span class="thumb' + (big ? ' thumb-big' : '') + '">' + solidSvg(id) + '</span>';
  }

  function foldCells(rows) {
    return rows.map(function (row) {
      return row.split('').map(function (ch) { return ch === '#'; });
    });
  }

  function isSymmetricRows(rows) {
    return rows.every(function (row) {
      return row === row.split('').reverse().join('');
    });
  }

  function turnedRows(rows) {
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

  function mirroredRows(rows) {
    return rows.map(function (row) { return row.split('').reverse().join(''); });
  }

  function sameRows(a, b) { return a.join('|') === b.join('|'); }

  function paddedCells(rows, shiftX, shiftY) {
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
    return cells;
  }

  function gridFigureSvg(cells, axis, size) {
    var rows = cells.length;
    var cols = cells[0].length;
    var cell = Math.floor(100 / Math.max(rows, cols));
    var x0 = (120 - cols * cell) / 2;
    var y0 = (120 - rows * cell) / 2;
    var body = '';
    cells.forEach(function (row, r) {
      row.forEach(function (on, c) {
        if (on) {
          body += '<rect x="' + (x0 + c * cell) + '" y="' + (y0 + r * cell) +
            '" width="' + cell + '" height="' + cell + '"/>';
        }
      });
    });
    if (axis) {
      var mid = x0 + cols * cell / 2;
      var top = y0 - 6;
      var bottom = y0 + rows * cell + 6;
      /* A light band under the dashes. The dark dashes alone disappear on the
         dark fill of the figure; the band is the card colour, so outside the
         figure it does not show at all. */
      body += '<line x1="' + mid + '" y1="' + top + '" x2="' + mid + '" y2="' + bottom +
        '" class="fold-halo"/>' +
        '<line x1="' + mid + '" y1="' + top + '" x2="' + mid + '" y2="' + bottom +
        '" class="fold-line"/>';
    }
    return '<svg viewBox="0 0 120 120" width="' + size + '" height="' + size +
      '" aria-hidden="true"><g fill="' + SHAPE_FILL + '" stroke="var(--color-texto)" ' +
      'stroke-width="2" stroke-linejoin="round">' + body + '</g></svg>';
  }

  App.ShapesDrawings = {
    triangleAxisMark: triangleAxisMark,
    axisMark: axisMark,
    areaSvg: areaSvg,
    TRIANGLE_KINDS: TRIANGLE_KINDS,
    TRIANGLE_CORNERS: TRIANGLE_CORNERS,
    TRIANGLE_TICKS: TRIANGLE_TICKS,
    AREA_SHAPES: AREA_SHAPES,
    sideTicks: sideTicks,
    triangleKindSvg: triangleKindSvg,
    countSvg: countSvg,
    AREA_UNIT: AREA_UNIT,
    turnedLabel: turnedLabel,
    flatLabel: flatLabel,
    areaCalcSvg: areaCalcSvg,
    volumeSvg: volumeSvg,
    similaritySvg: similaritySvg,
    triangleWith: triangleWith,
    conceptCards: conceptCards,
    PIECE: PIECE,
    netPieces: netPieces,
    REGULAR_SIDES: REGULAR_SIDES,
    SYMMETRY_SHAPES: SYMMETRY_SHAPES,
    netSvg: netSvg,
    netName: netName,
    netGloss: netGloss,
    faceOptions: faceOptions,
    shapeThumb: shapeThumb,
    solidThumb: solidThumb,
    foldCells: foldCells,
    isSymmetricRows: isSymmetricRows,
    turnedRows: turnedRows,
    mirroredRows: mirroredRows,
    sameRows: sameRows,
    paddedCells: paddedCells,
    gridFigureSvg: gridFigureSvg
  };
})();
