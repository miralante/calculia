/* ============================================================
   Calculia — Trigonometría
   Data and levels in data.js. Shared modules in assets/js/.
   Every question is generated on the fly from the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'trigonometry';
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

  /* Every level needs something to ask about: a pool that cannot be
     drawn would show an empty option. */
  DATA.activities.lados.levels.forEach(function (nv) {
    if (ALL_SIDES.indexOf(sideFor(DATA.triangles[0], nv.tipo === 'whichOpposite' ? 'opposite' : 'adjacent', nv.corner || 'B')) === -1) {
      throw new Error('trigonometry: level ' + nv.id + ' has no side to look for');
    }
  });
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

    if (!o.small) {
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

  /* ---- Question pieces ---- */

  /* "3 for every 4", with the two numbers that make it go wrong: the
     other way round (the real confusion) and each one off by one (the
     error counting a grid actually produces). */
  function ratioOptions(t) {
    /* Build the right answer FIRST and never drop it. An earlier version
       shuffled all four candidates and then cut to three, which quietly
       removed the correct answer from one question in four — the page
       then had no right answer at all, and clicking any option threw
       while trying to explain itself. Taking the correct one first and
       filling the rest makes that impossible. */
    var seen = {};
    var right = { up: t.up, along: t.along };
    seen[right.up + ':' + right.along] = true;
    var wrongs = [];
    [
      { up: t.along, along: t.up },
      { up: t.up + 1, along: t.along },
      { up: t.up, along: t.along + 1 }
    ].forEach(function (c) {
      var key = c.up + ':' + c.along;
      if (seen[key]) return;
      seen[key] = true;
      wrongs.push(c);
    });
    /* A triangle whose legs differ by one loses both "off by one"
       distractors to each other, but the swapped one is always there,
       so there are always two. */
    var out = [{ text: ratioText(right.up, right.along), correct: true }];
    wrongs.slice(0, 2).forEach(function (c) {
      out.push({ text: ratioText(c.up, c.along), correct: false });
    });
    return App.utils.shuffle(out);
  }

  function triAria(t) {
    return App.i18n.t('gen.triAria')
      .replace(/\{up\}/g, t.up)
      .replace(/\{along\}/g, t.along);
  }

  var GENERATORS = {

    /* Which side is the slanted one — the longest. Every option is the
       same triangle with a different side drawn heavier, so the answer
       is which marked side reaches furthest: counting and looking, not
       remembering a word. */
    whichHypotenuse: function (nv) {
      var t = draw(nv.id, DATA.triangles);
      /* The answer is "the longest side", so check that the side this
         question points at really is the longest one in the drawing that
         goes with it. Nothing else catches this: an edit that moved
         `correct` onto another side would leave the code perfectly
         well-formed, every string registered and every structural gate
         green, while marking a plainly wrong picture as right. */
      var options = ALL_SIDES.map(function (side) {
        return { side: side, correct: side === 'hyp' };
      });
      var right = options.filter(function (o) { return o.correct; });
      if (right.length !== 1) {
        throw new Error('trigonometry: level "' + nv.id + '" offers ' +
          right.length + ' hypotenuses');
      }
      var lens = { up: t.up, along: t.along, hyp: hyp(t) };
      var longest = ALL_SIDES.slice().sort(function (a, b) {
        return lens[b] - lens[a];
      })[0];
      if (right[0].side !== longest) {
        throw new Error('trigonometry: level "' + nv.id + '" calls "' +
          right[0].side + '" the hypotenuse of "' + t.id +
          '", but "' + longest + '" is the longest side of it');
      }
      return {
        prompt: App.i18n.t('gen.whichHypotenuse'),
        visual: '<div class="tri-stage">' + triangleSvg(t, {}) + '</div>',
        visualAria: triAria(t),
        legend: App.i18n.t('gen.hypHint'),
        options: App.utils.shuffle(ALL_SIDES.map(function (side) {
          return {
            html: sideOptionHtml(t, side),
            aria: App.i18n.t('gen.sideMarked').replace(/\{side\}/g, sideName(side)),
            correct: side === 'hyp'
          };
        })),
        inline: true
      };
    },

    /* The two sides that depend on where the angle is. The angle is drawn
       in every option too, so which side it "looks at" is visible and not
       something to recall.
       The wording has to rule the hypotenuse out explicitly. "Which side
       touches that angle?" would have TWO right answers, because the
       slanted side touches it too — and a question with two right
       answers is not something the person can get wrong, only something
       the activity looks broken doing. */
    whichSideByAngle: function (nv) {
      var role = nv.tipo === 'whichOpposite' ? 'opposite' : 'adjacent';
      var corner = nv.corner || 'B';
      var t = draw(nv.id, DATA.triangles);
      var wanted = sideFor(t, role, corner);
      if (wanted === 'hyp') {
        throw new Error('trigonometry: level "' + nv.id + '" asks for the "' +
          role + '" side and got the hypotenuse, which touches every angle');
      }
      return {
        prompt: App.i18n.t(role === 'opposite' ? 'gen.whichOpposite' : 'gen.whichAdjacent')
          .replace(/\{where\}/g, App.i18n.t('gen.corner' + corner)),
        visual: '<div class="tri-stage">' + triangleSvg(t, { angleAt: corner }) + '</div>',
        visualAria: triAria(t),
        legend: App.i18n.t(role === 'opposite' ? 'gen.oppositeHint' : 'gen.adjacentHint'),
        options: App.utils.shuffle(ALL_SIDES.map(function (side) {
          return {
            html: sideOptionHtml(t, side, { angleAt: corner }),
            aria: App.i18n.t('gen.sideMarked').replace(/\{side\}/g, sideName(side)),
            correct: side === wanted
          };
        })),
        inline: true
      };
    },

    /* How many up for every along. Counted off the grid, so the number is
       read, not computed. */
    countReason: function (nv) {
      var t = draw(nv.id, DATA.triangles);
      return {
        prompt: App.i18n.t('gen.countReason'),
        visual: '<div class="tri-stage">' + triangleSvg(t, {}) + '</div>',
        visualAria: triAria(t),
        legend: App.i18n.t('gen.reasonHint')
          .replace(/\{up\}/g, t.up)
          .replace(/\{along\}/g, t.along),
        options: App.utils.shuffle(ratioOptions(t).map(function (o) {
          return { html: '<span class="reason-name">' + o.text + '</span>', aria: o.text, correct: o.correct };
        }))
      };
    },

    /* Do these two share the reason? Same lean, different size: counting
       both shows the two numbers keep their proportion. */
    sameReasonJudge: function (nv) {
      var pair = draw(nv.id, DATA.reasonPairs);
      var wantSame = draw(nv.id + 'same', [true, false]);
      var other = draw(nv.id + 'other',
        DATA.triangles.filter(function (t) { return !sameReason(t, pair); }));
      var right = wantSame ? doubled(pair) : other;
      var yes = sameReason(pair, right);
      return {
        prompt: App.i18n.t('gen.sameReason'),
        visual: '<div class="tri-stage pair-stage">' +
          triangleSvg(pair, {}) + triangleSvg(right, {}) + '</div>',
        visualAria: App.i18n.t('gen.twoAria')
          .replace(/\{a\}/g, pair.up).replace(/\{b\}/g, pair.along)
          .replace(/\{c\}/g, right.up).replace(/\{d\}/g, right.along),
        legend: App.i18n.t('gen.sameReasonHint'),
        options: App.utils.shuffle([true, false].map(function (v) {
          return {
            html: '<span class="reason-name">' + App.i18n.t(v ? 'answer.yes' : 'answer.no') + '</span>',
            aria: App.i18n.t(v ? 'answer.yes' : 'answer.no'),
            correct: v === yes
          };
        })),
        inline: true
      };
    },

    /* Which one of the three shares it. One step on from judging: the
       same comparison, but out loud. */
    whichSameReason: function (nv) {
      var pair = draw(nv.id, DATA.reasonPairs);
      var right = doubled(pair);
      var wrongs = [];
      var seenReason = {};
      seenReason[reasonOf(right)] = true;
      App.utils.shuffle(DATA.triangles.filter(function (t) {
        return !sameReason(t, pair);
      })).forEach(function (t) {
        var key = reasonOf(t);
        if (seenReason[key]) return;
        seenReason[key] = true;
        wrongs.push(t);
      });
      wrongs = wrongs.slice(0, 2);
      /* Never pad with the right answer. The start-up invariant already
         guarantees two distinct wrong reasons exist, so falling back to
         `doubled(pair)` here could only have produced a second correct
         option — a question nobody can get wrong. Fail loudly instead. */
      if (wrongs.length < 2) {
        throw new Error('trigonometry: level "' + nv.id + '" could only offer ' +
          wrongs.length + ' wrong answer(s) for pair "' + pair.id + '"');
      }
      return {
        prompt: App.i18n.t('gen.whichSameReason')
          .replace(/\{up\}/g, pair.up)
          .replace(/\{along\}/g, pair.along),
        visual: '<div class="tri-stage">' + triangleSvg(pair, {}) + '</div>',
        visualAria: App.i18n.t('gen.triAria')
          .replace(/\{up\}/g, pair.up).replace(/\{along\}/g, pair.along),
        legend: App.i18n.t('gen.whichSameReasonHint'),
        options: App.utils.shuffle([right].concat(wrongs).map(function (t) {
          return {
            html: triangleSvg(t, { small: true }),
            aria: App.i18n.t('gen.reasonOf').replace(/\{up\}/g, t.up).replace(/\{along\}/g, t.along),
            correct: sameReason(t, pair)
          };
        })),
        inline: true
      };
    },

    /* The ladder against the wall. Which of the three is the slanted one?
       Answerable by looking: two of them stand straight up, one leans. */
    ladderSide: function (nv) {
      var l = draw(nv.id, DATA.ladders.filter(function (x) { return x.run > 0; }));
      return {
        prompt: App.i18n.t('gen.ladderSide'),
        visual: '<div class="tri-stage">' + laddersSvg([l], {}) + '</div>',
        visualAria: App.i18n.t('gen.ladderAria'),
        legend: App.i18n.t('gen.ladderSideHint'),
        options: App.utils.shuffle(['ladder', 'wall', 'floor'].map(function (k) {
          return {
            html: '<span class="kind-name">' + App.i18n.t('ladderPart.' + k + '.name') + '</span>' +
              '<span class="kind-gloss">' + App.i18n.t('ladderPart.' + k + '.gloss') + '</span>',
            aria: App.i18n.t('ladderPart.' + k + '.name') + ', ' + App.i18n.t('ladderPart.' + k + '.gloss'),
            correct: k === 'ladder'
          };
        })),
        inline: true
      };
    },

    /* The same ladder, three ways of standing it up. Which reaches
       highest? More upright, higher — and all three are exactly the same
       length, so nothing else is being compared.
       Each is named by a letter drawn on it, and the letters are handed
       out in a different order every question: if the letters followed
       the lean, the right answer would always be the same one. */
    ladderTaller: function (nv) {
      var all = DATA.ladders;
      var tallest = Math.max.apply(null, all.map(function (l) { return l.rise; }));
      /* Shuffled, not drawn from the bag. `draw()` hands out ONE item of a
         list, so calling it here returned a single letter — and then
         `letters[1]` and `letters[2]` were undefined, which put "La
         escalera undefined" on two of the three answers. */
      var letters = App.utils.shuffle(App.i18n.t('gen.ladderLetters').split(''));
      var byRun = all.slice().sort(function (a, b) { return a.run - b.run; });
      var named = byRun.map(function (l, i) {
        return { ladder: l, letter: letters[i] };
      });
      if (named.some(function (n) { return !n.letter; })) {
        throw new Error('trigonometry: level "' + nv.id + '" ran out of ladder letters');
      }
      return {
        prompt: App.i18n.t('gen.ladderTaller'),
        visual: '<div class="tri-stage">' + laddersSvg(byRun, {
          labels: named.map(function (n) { return n.letter; }),
          guide: true
        }) + '</div>',
        visualAria: App.i18n.t('gen.ladderAllAria')
          .replace(/\{a\}/g, named[0].letter)
          .replace(/\{b\}/g, named[1].letter)
          .replace(/\{c\}/g, named[2].letter),
        legend: App.i18n.t('gen.ladderTallerHint'),
        options: App.utils.shuffle(named.map(function (n) {
          var text = App.i18n.t('gen.ladderOption').replace(/\{x\}/g, n.letter);
          return {
            html: '<span class="kind-name">' + text + '</span>' +
              '<span class="kind-gloss">' + App.i18n.t('gen.ladderOptionHint') + '</span>',
            aria: text,
            correct: n.ladder.rise === tallest
          };
        })),
        inline: true
      };
    }
  };

  /* Levels whose type differs only in which role they ask for share one
     generator; the rest are looked up by their own type. */
  var GENERATOR_FOR = {
    whichHypotenuse: GENERATORS.whichHypotenuse,
    whichOpposite: GENERATORS.whichSideByAngle,
    whichAdjacent: GENERATORS.whichSideByAngle,
    countReason: GENERATORS.countReason,
    sameReasonJudge: GENERATORS.sameReasonJudge,
    whichSameReason: GENERATORS.whichSameReason,
    ladderSide: GENERATORS.ladderSide,
    ladderTaller: GENERATORS.ladderTaller
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
    question = fixed || GENERATOR_FOR[level.tipo](level, index);
    /* Every question must have exactly ONE right answer, and the answer
       list must be something the screen can hold. This is the guard that
       catches a generator quietly dropping its own correct option: the
       page would otherwise accept nothing at all, and the explanation
       code below would throw on `undefined` while trying to explain a
       question that has no answer. */
    var right = question.options.filter(function (o) { return o.correct; });
    if (right.length !== 1 || question.options.length < 2) {
      throw new Error('trigonometry: level "' + level.id + '" built a question with ' +
        right.length + ' correct answer(s) out of ' + question.options.length);
    }
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

  /* Visible text of an option (its html may wrap spans, or be a drawing
     with no words at all). */
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