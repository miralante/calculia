/* ============================================================
   Calculia — Trigonometry: the figures. The helpers that describe a right
   triangle or a ladder (side names, which ratio a pair of sides gives, the
   data checks at start-up) and the SVG drawings of them. Pure functions: they
   take the figure and return text or markup. The question generators in
   questions.js and the lesson screens in app.js use them.
   ============================================================ */
(function () {
  'use strict';

  /* ---- Nothing that can be worked out is stored ----
     The hypotenuse comes from the two legs, the reason from the two
     legs reduced, and which side is opposite or next to the marked angle
     from where that angle is. So the drawing, the names and the right
     answer cannot drift apart: they are the same numbers read three
     ways. */
  function hypOfParts(a, b) {
    return Math.sqrt(a * a + b * b);
  }

  function hyp(t) {
    return hypOfParts(t.up, t.along);
  }

  /* The ladder length, over the fields a ladder actually has. Reading
     `up`/`along` here returned NaN, and a comparison of NaN is always
     false — so the "all three ladders are the same length" check below
     would have passed no matter what the data said. */
  function ladderLen(l) {
    return hypOfParts(l.rise, l.run);
  }

  function gcd(a, b) {
    while (b) { var r = a % b; a = b; b = r; }
    return a;
  }

  /* "3 for every 4", reduced: 6 for every 8 is still 3 for every 4. Two
     triangles share the reason exactly when this string matches, which is
     the whole claim of the `razon` levels — so it is computed, never
     listed.
     It takes the two numbers rather than the object, because two different
     things are compared with it and they name their legs differently: a
     triangle has `up`/`along`, a ladder has `rise`/`run`. Reading one
     fixed pair of fields made every ladder look identical to every other
     one, which is a silent wrong answer rather than a visible one. */
  function reasonOfParts(rises, goes) {
    var g = gcd(rises, goes);
    if (!g || !isFinite(g)) return rises + ':' + goes;
    return (rises / g) + ':' + (goes / g);
  }

  function reasonOf(t) { return reasonOfParts(t.up, t.along); }

  /* How steep a ladder stands: the same reduction over its own fields. */
  function leanOf(l) { return reasonOfParts(l.rise, l.run); }

  function sameReason(a, b) { return reasonOf(a) === reasonOf(b); }

  /* The same triangle at twice the size. Built from the small one so a
     pair can never disagree about being a pair. */
  function doubled(t) {
    return { id: t.id + 'x2', up: t.up * 2, along: t.along * 2 };
  }

  /* The three sides, always by the same names:
     'up' rises along the wall, 'along' runs along the floor, 'hyp' is the
     slanted one. Corner B is the bottom right, C the top left. */
  /* Which side the marked angle looks at. It depends only on which
     corner the angle is drawn in, so a question cannot claim one side
     and draw another. */
  function sideFor(t, role, corner) {
    if (role === 'hyp') return 'hyp';
    /* Angle in B (bottom right): the wall side is across from it, the
       floor side touches it. Angle in C (top left): the other way round. */
    if (corner === 'B') return role === 'opposite' ? 'up' : 'along';
    return role === 'opposite' ? 'along' : 'up';
  }

  function sideName(side) { return App.i18n.t('side.' + side + '.name'); }
  function sideGloss(side) { return App.i18n.t('side.' + side + '.gloss'); }

  /* A picture option that also says the name of the side it marks, with
     its plain-words gloss underneath — the same shape geometry uses to
     teach right/acute/obtuse. The word is taught beside the drawing it
     belongs to, never instead of it, and never on its own. */
  function sideOptionHtml(t, side, opts) {
    return triangleSvg(t, Object.assign({ mark: side, small: true }, opts || {})) +
      '<span class="reason-name">' + sideName(side) + '</span>' +
      '<span class="reason-gloss">' + sideGloss(side) + '</span>';
  }

  /* ---- Data invariants, loud at start-up rather than wrong on screen ---- */
  var ALL_SIDES = ['up', 'along', 'hyp'];

  DATA.triangles.forEach(function (t) {
    if (t.up < 1 || t.along < 1) {
      throw new Error('trigonometry: triangle "' + t.id + '" has a leg below one square');
    }
    /* "Which side is the hypotenuse" is answerable only if the slanted
       side really is the STRICTLY longest one — an equal match would
       leave that question with no single answer.
       Equal legs are deliberately ALLOWED, though: a triangle with both
       legs the same length is a shape people recognise, and it is the
       clearest case of all, because the hypotenuse is the longest side
       even when the two others match. Nothing else here asks for "the
       longest side": "which side faces the angle" is answered by
       position, from the arc drawn in every option. */
    var h = hyp(t);
    if (h <= t.up || h <= t.along) {
      throw new Error('trigonometry: in triangle "' + t.id + '" the slanted side is not the longest');
    }
  });

  /* The three ladders must really be the same ladder. If one of them were
     longer, "which reaches highest" would be answering about the ladder
     instead of about the lean, which is the wrong question. */
  var ladderLens = DATA.ladders.map(function (l) { return ladderLen(l); });
  if (ladderLens.some(function (len) { return Math.abs(len - ladderLens[0]) > 1e-9; })) {
    throw new Error('trigonometry: the ladders are not all the same length');
  }
  /* And they must be three different leans, otherwise the same drawing
     would be offered twice. */
  if (new Set(DATA.ladders.map(leanOf)).size !== DATA.ladders.length) {
    throw new Error('trigonometry: two ladders lean the same way');
  }

  /* The reason pools need a triangle with a DIFFERENT reason, or the
     "do these two match?" question would only ever have one possible
     answer. Nothing needs the reverse: a pair's own reason does not have
     to appear in DATA.triangles, because the partner that shares it is
     built from the pair itself (see `doubled`). Pair "p12" is 1-for-2
     and no triangle in the bank is 1-for-2, which is perfectly fine. */
  DATA.reasonPairs.forEach(function (p) {
    var different = DATA.triangles.filter(function (t) { return !sameReason(t, p); });
    if (!different.length) {
      throw new Error('trigonometry: pair "' + p.id + '" has nothing to be compared against');
    }
    /* And the two levels that offer the pair against two wrong answers
       need two WRONG answers of their own. */
    var reasons = {};
    DATA.triangles.forEach(function (t) {
      if (!sameReason(t, p)) reasons[reasonOf(t)] = true;
    });
    if (Object.keys(reasons).length < 2) {
      throw new Error('trigonometry: pair "' + p.id + '" cannot offer two different wrong answers');
    }
  });

  /* The lesson's two ramps must lean differently, or "which climbs faster"
     would have no single answer. */
  if (sameReason(DATA.steeperExample[0], DATA.steeperExample[1])) {
    throw new Error('trigonometry: the two example ramps lean the same way');
  }

  /* ---- Utilities ---- */

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  function ratioText(up, along) {
    return App.i18n.t('gen.reason')
      .replace(/\{up\}/g, up)
      .replace(/\{along\}/g, along);
  }

  /* ---- Drawing a right triangle ----
     Drawn square by square on the same grid as the rest of the
     catalogue, so both catetos can be counted with a finger and the
     question is answered by looking rather than by working out. The
     little square in the corner is the same guide `geometry` draws: it
     marks where the right angle is without saying anything about which
     side is being asked for. */
  var CELL = 22;

  function triangleSvg(t, opts) {
    var o = opts || {};
    var cell = o.small ? Math.round(CELL * 0.52) : CELL;
    var pad = 14;
    var w = t.along * cell;
    var h = t.up * cell;
    /* A is the right angle (bottom left), B the bottom right, C the top
       left. y grows downwards, so C sits at the top of the viewBox. */
    var A = [pad, pad + h];
    var B = [pad + w, pad + h];
    var C = [pad, pad];
    var pts = { up: [A, C], along: [A, B], hyp: [C, B] };
    var corners = { B: B, C: C };
    var body = '';

    if (!o.small || o.grid) {
      /* The grid the triangle stands on. It is what makes a leg
         countable, so it is drawn under the triangle and never on top. */
      for (var r = 0; r < t.up; r++) {
        for (var c = 0; c < t.along; c++) {
          body += '<rect x="' + (pad + c * cell) + '" y="' + (pad + r * cell) +
            '" width="' + cell + '" height="' + cell + '" class="tri-cell"/>';
        }
      }
    }

    /* The corner guide: the sheet of paper you would hold against the
       angle. Identical in every question, so it gives nothing away. */
    var q = Math.round(cell * 0.55);
    body += '<polyline points="' + (A[0] + q) + ',' + A[1] + ' ' + (A[0] + q) + ',' +
      (A[1] - q) + ' ' + A[0] + ',' + (A[1] - q) + '" class="tri-corner"/>';

    /* The marked angle: a short arc at the corner the level asks about. */
    if (o.angleAt && corners[o.angleAt]) {
      var c0 = corners[o.angleAt];
      var others = o.angleAt === 'B' ? [A, C] : [A, B];
      body += '<path d="' + arcPath(c0, others[0], others[1], Math.round(cell * 0.8)) +
        '" class="tri-angle"/>';
    }

    /* The three sides. The one being asked about is drawn heavier, and
       the others keep a plain stroke: two of the three options are
       "a triangle with a side on it", so the sides must differ in weight
       and not only in colour (WCAG 1.4.1). */
    ALL_SIDES.forEach(function (side) {
      var p = pts[side];
      body += '<line x1="' + p[0][0] + '" y1="' + p[0][1] + '" x2="' + p[1][0] +
        '" y2="' + p[1][1] + '" class="tri-side' +
        (o.mark === side ? ' is-marked' : '') + '"/>';
    });

    ALL_SIDES.forEach(function (side) {
      var p = pts[side];
      body += '<circle cx="' + p[0][0] + '" cy="' + p[0][1] + '" r="4" class="tri-vertex"/>';
      body += '<circle cx="' + p[1][0] + '" cy="' + p[1][1] + '" r="4" class="tri-vertex"/>';
    });

    return '<svg viewBox="-4 -4 ' + (w + pad * 2 + 8) + ' ' + (h + pad * 2 + 8) +
      '" width="' + (w + pad * 2) + '" height="' + (h + pad * 2) +
      '" class="tri-svg" aria-hidden="true">' + body + '</svg>';
  }

  /* A circular arc between two directions, used for the marked angle. */
  function arcPath(center, p1, p2, r) {
    var a1 = Math.atan2(p1[1] - center[1], p1[0] - center[0]);
    var a2 = Math.atan2(p2[1] - center[1], p2[0] - center[0]);
    var x1 = center[0] + r * Math.cos(a1);
    var y1 = center[1] + r * Math.sin(a1);
    var x2 = center[0] + r * Math.cos(a2);
    var y2 = center[1] + r * Math.sin(a2);
    var large = Math.abs(a2 - a1) > Math.PI ? 1 : 0;
    var sweep = a2 > a1 ? 1 : 0;
    return 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' A' + r + ' ' + r + ' 0 ' +
      large + ' ' + sweep + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
  }

  /* ---- A ladder leaning on a wall ----
     One single scale for BOTH axes, and that is the whole point: the level
     asks which ladder is the most upright, and that can only be seen in
     the drawing if the two axes are drawn to the same scale. Scaling them
     separately flattens or steepens every lean, and the picture would
     then disagree with the answer it is supposed to carry. */
  var LAD_SCALE = 10;

  function laddersSvg(list, opts) {
    var o = opts || {};
    var maxRun = Math.max.apply(null, list.map(function (l) { return l.run; }));
    var maxRise = Math.max.apply(null, list.map(function (l) { return l.rise; }));

    var wallX = 40;
    /* The floor sits BELOW the tallest ladder by exactly its own rise, so
       the top of the highest one lands just inside the frame. Fixing
       `floorY` near the top and deriving the height from it is what keeps
       the drawing from being clipped: the most upright ladder is the
       tallest one, and it is also the answer. */
    var floorY = Math.round(maxRise * LAD_SCALE) + 26;
    var floorW = Math.round(wallX + maxRun * LAD_SCALE + 34);
    var wallH = floorY + 22;
    var body = '';

    /* The wall and the floor are drawn as real surfaces, heavier than
       anything else: they are the two sides that never lean. */
    body += '<line x1="' + wallX + '" y1="4" x2="' + wallX + '" y2="' + (floorY + 6) +
      '" class="lad-wall"/>';
    body += '<line x1="' + (wallX - 24) + '" y1="' + floorY + '" x2="' + floorW +
      '" y2="' + floorY + '" class="lad-floor"/>';

    if (o.guide) {
      /* The height the tallest one reaches, so "which one stands up
         most" is something the drawing says rather than something to be
         believed. */
      var topY = floorY - Math.round(maxRise * LAD_SCALE);
      body += '<line x1="' + (wallX - 8) + '" y1="' + topY + '" x2="' + floorW +
        '" y2="' + topY + '" class="lad-guide"/>';
    }

    /* Each ladder is drawn at its own height AND its own distance: the
       three differ only in how upright they stand, and flattening them to
       one height would draw away the very thing being asked about. */
    list.forEach(function (l, i) {
      var y = floorY - Math.round(l.rise * LAD_SCALE);
      var x = wallX + Math.round(l.run * LAD_SCALE);
      body += '<line x1="' + x + '" y1="' + floorY + '" x2="' + wallX + '" y2="' + y +
        '" class="lad-ladder' + (o.markAt === i ? ' is-marked' : '') + '"/>';
      body += '<circle cx="' + wallX + '" cy="' + y + '" r="5" class="lad-tip"/>';
      if (o.labels && o.labels[i]) {
        /* Nudged to the right of the foot: the most upright ladder has
           its foot ON the wall line, and a letter drawn there would sit
           on top of the wall instead of under its own ladder. */
        body += '<text x="' + (x + 11) + '" y="' + (floorY + 18) +
          '" class="lad-label">' + o.labels[i] + '</text>';
      }
    });

    return '<svg viewBox="-10 -10 ' + (floorW + 20) + ' ' + (wallH + 20) + '" width="' +
      (floorW + 12) + '" height="' + (wallH + 12) + '" class="lad-svg" aria-hidden="true">' +
      body + '</svg>';
  }


  App.trigonometryFigures = {
    hyp: hyp,
    reasonOf: reasonOf,
    sameReason: sameReason,
    doubled: doubled,
    sideFor: sideFor,
    sideName: sideName,
    sideOptionHtml: sideOptionHtml,
    ALL_SIDES: ALL_SIDES,
    ratioText: ratioText,
    triangleSvg: triangleSvg,
    laddersSvg: laddersSvg
  };
})();
