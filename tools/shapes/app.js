/* ============================================================
   Calculia — Shapes
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'shapes';
  var $ = App.utils.$;

  var screenIntro = $('#screenIntro');
  var screenReal = $('#screenReal');
  var screenMenu = $('#screenMenu');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var galleryVisual = $('#galleryVisual');
  var galleryCaption = $('#galleryCaption');
  var galleryNote = $('#galleryNote');
  var galleryPrev = $('#galleryPrev');
  var galleryNext = $('#galleryNext');
  var realObject = $('#realObject');
  var realCaption = $('#realCaption');
  var realNote = $('#realNote');
  var realPrev = $('#realPrev');
  var realNext = $('#realNext');
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
  if (!progress.roundsByActivity || typeof progress.roundsByActivity !== 'object' ||
      Array.isArray(progress.roundsByActivity)) progress.roundsByActivity = {};

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
  var roundQuestions = [];
  var galleryIndex = -1;
  var realIndex = 0;
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

  /* ---- Drawing the shapes ----
     Regular polygons are generated from their vertex count, so the picture
     and DATA.sides can never drift apart. The square and the rectangle are
     drawn explicitly instead: a 4-sided regular polygon comes out as a
     diamond, which is not what a square should look like. */
  var SHAPE_FILL = 'var(--mod-razonamiento)';

  /* Regular polygons, so the drawing and the caption can never disagree on
     how many sides a shape has. `phase` rotates the first vertex for the
     shapes that are only right side-on: a stop sign has a flat top edge, so
     its octagon starts a quarter step further round. */
  function polygonPoints(n, cx, cy, r, phase) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      /* Start at the top so a triangle points up, the way it is drawn
         everywhere else. */
      var a = -Math.PI / 2 + (phase || 0) + (i * 2 * Math.PI) / n;
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
    return pts;
  }

  function pointsAttr(points) {
    return points.map(function (p) {
      return p.x.toFixed(1) + ',' + p.y.toFixed(1);
    }).join(' ');
  }

  /* The same list of points, as the `d` of a path. */
  function pathFromPoints(points, close) {
    return points.map(function (p, index) {
      return (index === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
    }).join('') + (close ? 'Z' : '');
  }

  /* A star: `spikes` points out at `outer` radius, one point in between at
     `inner`. It is a path and not a polygon on purpose: the number of
     polygons in a drawing is what proves the shape on screen has the sides
     the caption claims, and a badge built out of polygons would quietly
     make that count lie. */
  function starPath(spikes, cx, cy, outer, inner, phase) {
    var pts = [];
    for (var i = 0; i < spikes * 2; i++) {
      var r = i % 2 === 0 ? outer : inner;
      var a = -Math.PI / 2 + (phase || 0) + (i * Math.PI) / spikes;
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
    return pathFromPoints(pts, true);
  }

  function cornerDots(points) {
    return points.map(function (p) {
      return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) +
        '" r="7" class="corner-dot"/>';
    }).join('');
  }

  /* `marks` puts a dot on every corner, so corners can be counted by
     looking instead of from memory. */
  function shapeSvg(id, marks) {
    var POLY = { triangle: 3, pentagon: 5, hexagon: 6, octagon: 8 };
    var body = '';
    var dots = '';

    if (id === 'circle') {
      body = '<circle cx="60" cy="60" r="46" fill="' + SHAPE_FILL +
        '" stroke="var(--color-texto)" stroke-width="4"/>';
    } else if (id === 'square') {
      body = '<rect x="18" y="18" width="84" height="84" fill="' + SHAPE_FILL +
        '" stroke="var(--color-texto)" stroke-width="4"/>';
      if (marks) {
        dots = cornerDots([{ x: 18, y: 18 }, { x: 102, y: 18 },
          { x: 102, y: 102 }, { x: 18, y: 102 }]);
      }
    } else if (id === 'rectangle') {
      body = '<rect x="8" y="32" width="104" height="56" fill="' + SHAPE_FILL +
        '" stroke="var(--color-texto)" stroke-width="4"/>';
      if (marks) {
        dots = cornerDots([{ x: 8, y: 32 }, { x: 112, y: 32 },
          { x: 112, y: 88 }, { x: 8, y: 88 }]);
      }
    } else if (id === 'rhombus' || id === 'trapezoid') {
      var quad = id === 'rhombus'
        ? [{ x: 60, y: 10 }, { x: 97, y: 60 }, { x: 60, y: 110 }, { x: 23, y: 60 }]
        : [{ x: 30, y: 16 }, { x: 90, y: 16 }, { x: 110, y: 104 }, { x: 10, y: 104 }];
      body = '<polygon points="' + quad.map(function (p) {
        return p.x + ',' + p.y;
      }).join(' ') + '" fill="' + SHAPE_FILL +
        '" stroke="var(--color-texto)" stroke-width="4"/>';
      if (marks) dots = cornerDots(quad);
    } else {
      var pts = polygonPoints(POLY[id], 60, 62, 48);
      body = '<polygon points="' + pts.map(function (p) {
        return p.x.toFixed(1) + ',' + p.y.toFixed(1);
      }).join(' ') + '" fill="' + SHAPE_FILL +
        '" stroke="var(--color-texto)" stroke-width="4"/>';
      if (marks) dots = cornerDots(pts);
    }
    return '<svg viewBox="0 0 120 120" width="160" height="160" aria-hidden="true">' +
      body + dots + '</svg>';
  }

  function shapeName(id) { return App.i18n.t('shape.' + id); }
  function solidName(id) { return App.i18n.t('solid.' + id); }

  function solidSvg(id) {
    var body = '';
    if (id === 'cube') {
      body = '<polygon points="25,35 65,15 105,35 65,55" class="solid-top"/>' +
        '<polygon points="25,35 65,55 65,105 25,85" class="solid-left"/>' +
        '<polygon points="65,55 105,35 105,85 65,105" class="solid-right"/>';
    } else if (id === 'rectangularPrism') {
      body = '<polygon points="10,42 32,28 110,28 88,42" class="solid-top"/>' +
        '<polygon points="10,42 88,42 88,102 10,102" class="solid-left"/>' +
        '<polygon points="88,42 110,28 110,88 88,102" class="solid-right"/>';
    } else if (id === 'triangularPrism') {
      body = '<polygon points="20,70 45,85 69,45 44,30" class="solid-left"/>' +
        '<polygon points="44,30 69,45 93,85 68,70" class="solid-top"/>' +
        '<polygon points="20,70 68,70 93,85 45,85" class="solid-right"/>' +
        '<polygon points="20,70 44,30 68,70" class="solid-base"/>';
    } else if (id === 'pyramid') {
      body = '<polygon points="20,82 60,60 100,82 60,104" class="solid-base"/>' +
        '<polygon points="60,18 20,82 60,60" class="solid-left"/>' +
        '<polygon points="60,18 60,60 100,82" class="solid-top"/>' +
        '<polygon points="60,18 100,82 60,104" class="solid-right"/>' +
        '<polygon points="60,18 60,104 20,82" class="solid-left"/>';
    } else if (id === 'sphere') {
      body = '<circle cx="60" cy="60" r="45" class="solid-sphere"/>' +
        '<ellipse cx="45" cy="40" rx="12" ry="7" class="solid-highlight"/>';
    } else if (id === 'cylinder') {
      body = '<rect x="20" y="28" width="80" height="64" class="solid-side"/>' +
        '<ellipse cx="60" cy="92" rx="40" ry="13" class="solid-cylinder-base"/>' +
        '<path d="M20 92a40 13 0 0 1 80 0" class="solid-cylinder-back"/>' +
        '<path d="M20 92a40 13 0 0 0 80 0" class="solid-cylinder-front"/>' +
        '<ellipse cx="60" cy="28" rx="40" ry="13" class="solid-top"/>';
    } else if (id === 'cone') {
      body = '<path d="M60 16 18 92c0 14 84 14 84 0Z" class="solid-side"/>' +
        '<ellipse cx="60" cy="92" rx="42" ry="13" class="solid-bottom"/>';
    }
    return '<svg viewBox="0 0 120 120" width="160" height="160" aria-hidden="true">' +
      '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
      body + '</g></svg>';
  }

  /* The everyday objects below are drawn, not left to the object's emoji.
     The emoji were wrong in a way only a picture shows: the shield is a
     rounded heater shield with no pentagon in it, the stop sign comes
     without the word inside, and a cardboard parcel is not a cereal box.
     Anything drawn with a fixed colour (a yellow sign, a red stop sign)
     keeps its own ink instead of following --color-texto, because the
     background it sits on does not change with the theme either. */
  function realObjectSvg(id) {
    if (id === 'square') {
      /* A window with four panes. It used to be left to the 🪟 emoji, and
         that emoji is a tall narrow strip: on the carousel it read as a
         scratch on the card rather than as a window, which is a poor way to
         introduce the square when the very next slide says "the door is a
         rectangle".
         The frame is a real square, 84 by 84, so the panes are square too,
         and it is a polygon because the count below is what proves it.
         The mullions are lines and never extra polygons, for the same
         reason the sheriff's star is a path: every polygon in this drawing
         is a side of the window. */
      return '<svg viewBox="0 0 120 110" aria-hidden="true">' +
        '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
        '<polygon points="18,13 102,13 102,97 18,97" class="solid-left"/>' +
        '<rect x="27" y="22" width="66" height="66" fill="var(--color-superficie)" ' +
        'stroke="none"/>' +
        '<line x1="60" y1="22" x2="60" y2="88" stroke-width="2.5"/>' +
        '<line x1="27" y1="55" x2="93" y2="55" stroke-width="2.5"/>' +
        '</g></svg>';
    }
    if (id === 'triangle') {
      var sign = polygonPoints(3, 60, 58, 46);
      return '<svg viewBox="0 0 120 110" aria-hidden="true">' +
        '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
        '<polygon points="' + pointsAttr(sign) + '" fill="#F4C95D"/></g>' +
        '<text x="60" y="72" text-anchor="middle" font-size="38" font-weight="700" ' +
        'fill="#1E1A12" stroke="none">!</text></svg>';
    }
    if (id === 'pentagon') {
      /* A sheriff's badge: flat top, two straight flanks and two more
         flanks meeting at the bottom point. Five straight sides, so the
         pentagon in the caption is visible and countable.
         The mark in the middle is the star of a sheriff of the old west,
         which is the one thing that says "badge" without a word. It is a
         path and a circle, never polygons: the polygon count above is what
         proves the badge has five sides, and a star drawn out of polygons
         would make that check meaningless. */
      return '<svg viewBox="0 0 120 110" aria-hidden="true">' +
        '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
        '<polygon points="26,16 94,16 102,52 60,100 18,52" class="solid-left"/>' +
        '<polygon points="37,27 83,27 88,52 60,86 32,52" class="solid-highlight" ' +
        'stroke="none"/>' +
        '<path d="' + starPath(6, 60, 52, 23, 9.5) + '" class="solid-right" ' +
        'stroke-width="2.5"/>' +
        '<circle cx="60" cy="52" r="7" fill="var(--color-superficie)" stroke="none"/>' +
        '</g></svg>';
    }
    if (id === 'octagon') {
      /* Red and white like every stop sign on the road, so the octagon is
         eight sides with the word inside it — not a blank red octagon. */
      var stop = polygonPoints(8, 60, 58, 46, Math.PI / 8);
      return '<svg viewBox="0 0 120 110" aria-hidden="true">' +
        '<polygon points="' + pointsAttr(stop) + '" fill="#C62828" ' +
        'stroke="#FFFFFF" stroke-width="6" stroke-linejoin="round"/>' +
        '<text x="60" y="66" text-anchor="middle" font-size="21" font-weight="700" ' +
        'letter-spacing="1" fill="#FFFFFF" stroke="none">STOP</text></svg>';
    }
    if (id === 'rectangularPrism') {
      /* The same prism the gallery draws, standing upright instead of on
         its side: a cereal box is taller than it is wide, and the caption
         promises a cereal box. The gallery keeps the long face square to
         the viewer on purpose — that is the rectangular face the activity
         is about — so the two drawings differ in proportion and agree in
         shape.
         Both proportions come off a real box, about 19 x 27 x 6 cm: the
         front is a bit over half as wide as it is tall, and the thickness
         is a third of the width. Drawn deeper than that it stops being a
         cereal box and becomes a crate — which is what the earlier
         version was, with a thickness near half the width.
         The label and the bowl of cereal are on the front panel: a bare
         carton could be any box. */
      return '<svg viewBox="0 0 120 110" aria-hidden="true">' +
        '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
        '<polygon points="24,26 40,16 95,16 79,26" class="solid-top"/>' +
        '<polygon points="24,26 79,26 79,104 24,104" class="solid-left"/>' +
        '<polygon points="79,26 95,16 95,94 79,104" class="solid-right"/>' +
        '<rect x="31" y="40" width="41" height="48" rx="4" fill="#F4C95D" ' +
        'stroke-width="2.5"/>' +
        '<circle cx="44" cy="65" r="3" class="solid-right" stroke="none"/>' +
        '<circle cx="52" cy="62" r="3.8" class="solid-right" stroke="none"/>' +
        '<circle cx="61" cy="66" r="3" class="solid-right" stroke="none"/>' +
        '<path d="M37 72h29a14.5 9 0 0 1-29 0Z" class="solid-right" stroke-width="2.5"/>' +
        '<path d="M37 72h29" fill="none" stroke-width="2.5"/>' +
        '</g></svg>';
    }
    if (id === 'trapezoid') {
      return '<svg viewBox="0 0 120 110" aria-hidden="true">' +
        '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
        '<path d="M35 36Q60 4 85 36" fill="none"/>' +
        '<polygon points="24,34 96,34 84,92 36,92" fill="#7CC8C3"/>' +
        '<ellipse cx="60" cy="34" rx="36" ry="8" fill="#B6E2DC"/>' +
        '<path d="M36 92Q60 100 84 92" fill="none"/></g></svg>';
    }
    if (id === 'hexagon') {
      /* The comb sits on the left of a wider canvas and the bee flies
         beside it, not inside it. The bee used to sit in the middle cell,
         which hid the one cell the caption is about: seven cells, each
         visibly a hexagon. Beside the comb it still says "this is where
         bees live" without covering the thing being counted. */
      var cells = [
        { x: 20, y: 30 }, { x: 44, y: 44 }, { x: 68, y: 30 },
        { x: 20, y: 58 }, { x: 44, y: 72 }, { x: 68, y: 58 },
        { x: 44, y: 16 }
      ];
      var offsets = [[16, 0], [8, 14], [-8, 14], [-16, 0], [-8, -14], [8, -14]];
      var cellsSvg = cells.map(function (cell, index) {
        var points = offsets.map(function (offset) {
          return (cell.x + offset[0]) + ',' + (cell.y + offset[1]);
        }).join(' ');
        var fill = index % 2 ? '#EFBF47' : '#F4C95D';
        return '<polygon points="' + points + '" fill="' + fill + '"/>';
      }).join('');
      /* The bee keeps the wax yellow and the ink of the theme, the same
         split the comb uses. Its body cannot be the surface colour any
         more: outside the comb that is the colour of the card, so the bee
         would disappear into the background instead of into a cell. The
         outline is what carries it against a light card.
         Drawn with ellipses and circles, not polygons, so the hexagon
         cell count stays at 7. The gap to the comb is deliberately wide:
         the smoke measures the bee's box, and a rotated wing reports a box
         wider than the wing. */
      var bee =
        '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
        '<ellipse cx="107" cy="38" rx="11" ry="6" fill="var(--color-superficie)" ' +
        'transform="rotate(-35 107 38)"/>' +
        '<ellipse cx="135" cy="38" rx="11" ry="6" fill="var(--color-superficie)" ' +
        'transform="rotate(35 135 38)"/>' +
        '<ellipse cx="121" cy="53" rx="15" ry="11" fill="#F4C95D"/>' +
        '<path d="M112 44v18M121 42.5v21M130 44v18" fill="none" stroke-width="2.5"/>' +
        '<circle cx="121" cy="35" r="7.5" fill="#1E1A12"/>' +
        '<circle cx="118.5" cy="34" r="1.6" fill="#F4C95D" stroke="none"/>' +
        '<circle cx="123.5" cy="34" r="1.6" fill="#F4C95D" stroke="none"/>' +
        '</g>';
      return '<svg viewBox="0 0 156 100" aria-hidden="true">' +
        '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
        cellsSvg + '</g>' + bee + '</svg>';
    }
    if (id === 'triangularPrism') {
      /* A tent: the triangular gable at the front, the ridge running back
         to the right, and the door open. Drawn as a prism with its length
         visible on purpose — a flat triangle would read as the flat shape,
         not as the solid the caption names.
         The front gable is the pale one and the long side is the dark one.
         With both faces in the same pale colour the tent does not read as
         a tent at all: the side turns into a blank panel and the whole
         thing looks like a folded card standing up.
         No ground line: the tent ends on its own feet, and a horizontal
         rule under it reads as a bar of the layout, not as grass. */
      return '<svg viewBox="0 0 120 110" aria-hidden="true">' +
        '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
        '<polygon points="46,28 82,16 100,72 74,90" class="solid-right"/>' +
        '<polygon points="18,90 46,28 74,90" class="solid-top"/>' +
        '<polygon points="38,90 46,56 54,90" class="solid-left"/>' +
        '</g></svg>';
    }
    if (id === 'pyramid') {
      /* Corner-on, the way a pyramid is photographed: two triangular faces
         meeting at the front edge, standing on a square base.
         The proportions are the point. The Great Pyramid of Giza is 230 m
         on a side and 146 m tall, so each face leans at about 52° and the
         whole thing reads as a broad mass. The previous drawing leaned at
         65°, which is a ridge tent, not a pyramid: narrow and steep was
         the one shape nobody mistakes for Giza.
         The masonry is what makes it something people built rather than
         something somebody pitched: the courses of stone run level all the
         way round, so every joint bends down at the front corner exactly
         the way the base does. They are generated from the corners rather
         than written out one by one, so they cannot drift away from the
         outline if the drawing is ever resized. Three courses and not four:
         at this size a fourth turns the face into a grid instead of a wall,
         and the point is stone, not scaffolding.
         The two faces are limestone, lit and in shade, and the joints are
         the brown of the mortar between the blocks. Fixed ink, like the
         yellow of the warning sign: a teal pyramid is a piece of glass, and
         this one is supposed to be Giza.
         Two faces only — the back edges would have to cross the front
         ones to be drawn, which no solid does.
         No ground line: the mass ends on its own footprint, and a
         horizontal rule under it reads as a bar of the layout, not as
         sand. */
      var APEX = { x: 60, y: 42 };
      var NEAR = { x: 60, y: 104 };
      var LEFT = { x: 12, y: 94 };
      var RIGHT = { x: 108, y: 94 };
      function towards(edge, t) {
        return {
          x: APEX.x + (edge.x - APEX.x) * t,
          y: APEX.y + (edge.y - APEX.y) * t
        };
      }
      function downCourse(t, edge, at) {
        var from = towards(edge, t);
        var to = towards(NEAR, t);
        return {
          x: from.x + (to.x - from.x) * at,
          y: from.y + (to.y - from.y) * at
        };
      }
      var STEPS = [0.25, 0.5, 0.75];
      var masonry = STEPS.map(function (t) {
        var points = [towards(LEFT, t), towards(NEAR, t), towards(RIGHT, t)];
        return '<polyline points="' + pointsAttr(points) + '" fill="none" ' +
          'stroke="#8A7346" stroke-width="1.8"/>';
      }).join('');
      /* One upright joint per course, staggered on the two faces so the
         stones do not line up in a column up the middle. */
      STEPS.slice(1).forEach(function (t, index) {
        var above = STEPS[index];
        [[LEFT, 0.34], [RIGHT, 0.66]].forEach(function (face) {
          var low = downCourse(t, face[0], face[1]);
          var high = downCourse(above, face[0], face[1]);
          masonry += '<line x1="' + low.x.toFixed(1) + '" y1="' + low.y.toFixed(1) +
            '" x2="' + high.x.toFixed(1) + '" y2="' + high.y.toFixed(1) +
            '" stroke="#8A7346" stroke-width="1.8"/>';
        });
      });
      return '<svg viewBox="0 0 120 110" aria-hidden="true">' +
        '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
        '<polygon points="60,42 12,94 60,104" fill="#E3D3AC"/>' +
        '<polygon points="60,42 60,104 108,94" fill="#BFA274"/>' +
        masonry +
        '</g></svg>';
    }
    if (id === 'cone') {
      /* A cucurucho, drawn the way you actually see one.
         The ice cream is a swirl and not a pile of balls: circles with a
         curl on them read as two spheres resting on the rim, which is the
         drawing this replaced. Stacked coils tapering to a tip read as
         ice cream from across the room, and the little drip over the front
         edge is what says it is soft and not carved. Each coil is lighter
         than the one below it, because the light comes from above and a
         swirl drawn in one flat colour reads as a stack of rings.
         The cone keeps its bowed sides and its rolled rim, and the wafer
         is scored in a diamond lattice — the ridges of a real waffle run
         across the cone, not up to the tip, and the earlier radial version
         looked like a basket. The lattice is clipped to the cone so it
         follows its curve instead of hanging over the card.
         The waffle colour is literal, like the yellow sign and the red
         stop sign, because a cone that is teal is not a cone. The outline
         still follows the theme, so it does not vanish on a light card.

         ORDER IS WHAT MAKES THE LATTICE VISIBLE. The clipped group sits
         directly on top of the body fill and before every ice cream
         shape: a full-size "inside of the cone" path drawn after it
         covers the whole silhouette, and the lattice is then in the DOM,
         correctly clipped, correctly coloured — and invisible, because
         it is simply painted over. Nothing in the markup says which
         layer wins; the same markup in another order shows the waffle
         perfectly. The mouth is now an ellipse and the front rim an arc,
         so neither of them can cover the wafer.

         The wafer is two families of parallel diagonals, the way a cone is
         actually pressed, and not a handful of lines that happen to
         cross: too few ridges and it reads as scratches on a plain cone.
         The ends run past the cone on purpose — the clip is what cuts
         them, so the lattice follows the bowed sides instead of stopping
         short of them. */
      var CONE = 'M35 52Q41 82 60 106Q79 82 85 52A25 9 0 0 1 35 52Z';
      var waffle = '';
      var i;
      for (i = -4; i <= 6; i += 1) {
        waffle += '<path d="M20 ' + (20 + i * 13) + 'L100 ' + (100 + i * 13) + '"/>';
      }
      for (i = 6; i <= 15; i += 1) {
        waffle += '<path d="M20 ' + (i * 13 - 20) + 'L100 ' + (i * 13 - 100) + '"/>';
      }
      /* The swirl. Each turn is a rope of cream: the same arc stroked
         twice, a fat one in the outline colour and a thinner one in the
         cream over it. Stacked ellipses and full rings were both tried and
         both read as a beehive or a stack of pancakes; what says "soft" is a
         line that curls, and a curl is a stroked arc. Each turn is narrower
         and higher than the one below it, so the stack tapers into a tip
         instead of repeating. The mound underneath joins the turns into one
         mass — without it they are a pile of separate rings. */
      var turns = ['M40 47Q60 62 80 47', 'M45 38.5Q60 50 75 38.5',
        'M50 31Q60 40 70 31', 'M55 24Q60 31 65 24'];
      var turnsWide = [9, 7.5, 6, 4.5];
      var swirl = turns.map(function (d, k) {
        return '<path d="' + d + '" fill="none" stroke="var(--color-texto)" ' +
          'stroke-width="' + (turnsWide[k] + 2.4) + '" stroke-linecap="round"/>' +
          '<path d="' + d + '" fill="none" stroke="#FCF0D6" stroke-width="' +
          turnsWide[k] + '" stroke-linecap="round"/>';
      }).join('');
      return '<svg viewBox="0 0 120 110" aria-hidden="true">' +
        '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
        '<path d="' + CONE + '" fill="#D99A2E"/>' +
        '<defs><clipPath id="cucuruchoWaffle"><path d="' + CONE + '"/></clipPath></defs>' +
        '<g clip-path="url(#cucuruchoWaffle)" stroke="#7A4E12" stroke-width="2" ' +
        'opacity="0.45" fill="none">' + waffle + '</g>' +
        /* The mouth of the cone, seen from a little above. Its top edge is
           the same arc as the outline, so it reads as the opening and not
           as a stripe painted across the cone. */
        '<ellipse cx="60" cy="52" rx="25" ry="9" fill="#E8AE4A" stroke="none"/>' +
        '<path d="M40 52Q42 40 48 33 54 27 57 20 60 14 63 20 66 27 72 33 78 40 80 52Z" ' +
        'fill="#F7E7C0" stroke="none"/>' +
        swirl +
        /* The near rim, drawn over the swirl: it is what makes the ice
           cream sit inside the cone instead of balancing on it. It is an
           open path on purpose, so only the curve is outlined and no
           straight line is drawn across the mouth. */
        '<path d="M35 52A25 9 0 0 0 85 52" fill="#D99A2E" stroke-width="2.5"/>' +
        /* And the drip that runs down the front of it: a neck that comes off
           the swirl and a round drop at the end. A closed blob with no neck
           reads as an egg lying on the rim. */
        '<path d="M44.6 49C44.6 53 42.8 54 42.8 57A3.2 3.2 0 0 0 49.2 57' +
        'C49.2 54 47.4 53 47.4 49Z" fill="#F7E7C0" stroke-width="2"/>' +
        '</g></svg>';
    }
    return '';
  }

  /* The clarification that goes under the name in the gallery: how many
     sides and vertices a flat shape has, or how many faces a solid has and
     what they are shaped like. It is a footnote under the name, so it
     lives in its own element and never in the caption.
     A flat shape takes its numbers from DATA.sides, the same source its
     drawing and its counting questions use, so the note cannot contradict
     the test. The circle is not in DATA.sides: it has no straight side and
     no vertex, and "0 lados" would ask to count something that is not
     there. */
  function shapeNote(item) {
    if (item.type === 'flat') {
      var sides = DATA.sides[item.id];
      /* Two {n}-like slots in one string, so both have to be replaced
         globally: a single replace() would leave the second one printed
         as "{n}". */
      return sides
        ? App.i18n.t('note.sides')
            .replace(/\{n\}/g, sides.sides)
            .replace(/\{corners\}/g, sides.corners)
        : App.i18n.t('note.sidesNone');
    }
    return App.i18n.t('note.solid.' + item.id);
  }

  /* What the everyday example adds under its caption: the concepts, counted
     on the object that is actually on screen. It does not define them again
     — the concept slides do that — it applies them.
     A flat figure gets its edges (sides, vertices), the perimeter along
     them, and the area inside; a solid gets the volume, because "the space
     inside" is what a body occupies and a flat drawing never does. */
  function realNoteFor(item) {
    if (item.type === 'solid') return App.i18n.t('realNote.solid');
    var sides = DATA.sides[item.id];
    return sides
      ? App.i18n.t('realNote.polygon')
          .replace(/\{sides\}/g, sides.sides)
          .replace(/\{corners\}/g, sides.corners)
      : App.i18n.t('realNote.circle');
  }

    /* ---- Concept slides ----
     More than one, and the number is CONCEPT_SLIDES: both the carousel
     arithmetic and the smoke read it from here, so adding a concept slide is
     adding one entry and nothing else. The count is arithmetic, not data —
     it has to match the branches below or the carousel wraps into a
     gallery slide it should never show. */
  var CONCEPT_SLIDES = 4;

  /* The fold line of the symmetry slide: from the top vertex of the
     triangle to the middle of its base, which are two of its own three
     points, so the line cannot drift away from the figure it marks.
     It stops at the edge on purpose. A line that ran out past the figure
     would be drawn on the card as well as on the shape, and there is no
     single colour that reads on both: the shape's fill is dark teal in
     light and pale teal in dark, so a mark that suits one is invisible on
     the other. --color-superficie is the one that works on the fill in all
     three themes (the perimeter mark measures the same), and on the card it
     is simply the card, so the line is only ever seen on the figure. */
  function triangleAxisMark() {
    var pts = polygonPoints(3, 60, 62, 48);
    return axisMark(pts[0].x, pts[0].y, (pts[1].x + pts[2].x) / 2, (pts[1].y + pts[2].y) / 2);
  }

  /* A dashed fold line through the figure. Used by symmetry, and by nothing
     else: the perimeter is the edge of the shape, not a line through it. */
  function axisMark(x1, y1, x2, y2) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
      '" class="intro-axis-mark"/>';
  }

  /* The area: the inside, covered. Diagonal hatching clipped to the shape,
     so the fill can only ever be inside it. The clip path is a fixed id
     because exactly one area card exists in the document at a time. */
  function areaSvg() {
    var pts = polygonPoints(3, 60, 62, 48);
    var hatch = [];
    for (var i = -60; i < 200; i += 16) {
      hatch.push('<line x1="' + i + '" y1="0" x2="' + (i + 120) + '" y2="120"/>');
    }
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' +
      '<defs><clipPath id="shapesAreaClip"><polygon points="' +
      pointsAttr(pts) + '"/></clipPath></defs>' +
      '<polygon points="' + pointsAttr(pts) + '" fill="var(--mod-razonamiento)" ' +
      'stroke="var(--color-texto)" stroke-width="4" stroke-linejoin="round"/>' +
      '<g clip-path="url(#shapesAreaClip)" class="area-hatch">' + hatch.join('') + '</g>' +
      '</svg>';
  }

  /* The volume: the space inside. A solid drawn inside a dashed outline of
     the whole space it would fill, so "there is room inside" is the thing
     on screen and not a word in the caption. */
  function volumeSvg() {
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' +
      '<rect x="8" y="8" width="104" height="104" rx="8" class="intro-space-mark"/>' +
      '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
      '<polygon points="28,42 64,24 96,42 60,60" class="solid-top"/>' +
      '<polygon points="28,42 60,60 60,96 28,78" class="solid-left"/>' +
      '<polygon points="60,60 96,42 96,78 60,96" class="solid-right"/>' +
      '</g></svg>';
  }

  /* Similarity: the same figure at two sizes, side by side. Both are
     equilateral triangles from the same helper, so they differ in size and
     in nothing else — which is the whole point of the concept. */
  function similaritySvg() {
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' +
      '<polygon points="' + pointsAttr(polygonPoints(3, 36, 62, 32)) +
      '" fill="var(--mod-razonamiento)" stroke="var(--color-texto)" stroke-width="4" ' +
      'stroke-linejoin="round"/>' +
      '<polygon points="' + pointsAttr(polygonPoints(3, 90, 62, 19)) +
      '" fill="var(--mod-razonamiento)" stroke="var(--color-texto)" stroke-width="4" ' +
      'stroke-linejoin="round"/></svg>';
  }

  /* One card of a concept slide. `wide` cards take the whole row: a concept
     that is built out of the others goes underneath them instead of sitting
     beside them. */
  function conceptCard(card) {
    var item = document.createElement('div');
    item.className = 'shape-part-item shape-part-' + card.id +
      (card.wide ? ' shape-part-wide' : '');
    var visual = document.createElement('div');
    visual.className = 'shape-part-visual';
    visual.setAttribute('aria-hidden', 'true');
    visual.innerHTML = card.html;
    var title = document.createElement('h2');
    title.textContent = App.i18n.t(card.title);
    var description = document.createElement('p');
    description.textContent = App.i18n.t(card.text);
    item.appendChild(visual);
    item.appendChild(title);
    item.appendChild(description);
    return item;
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
       about how many sides it has, so they close the concepts. */
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

  function paintConcept(n) {
    var slide = conceptCards(n);
    galleryVisual.removeAttribute('role');
    galleryVisual.removeAttribute('aria-label');
    galleryVisual.classList.add('gallery-intro');
    /* The grid itself lives in .gallery-intro; .gallery-part-intro only
       stretches the cards. Taking the first one off the parts slides left
       them in a plain block, and a card told to span the whole row simply
       did not, because there was no row to span. */
    galleryVisual.classList.toggle('gallery-part-intro', slide.layout === 'parts');
    galleryVisual.textContent = '';

    if (slide.layout === 'compare') {
      slide.cards.forEach(function (card) {
        var item = document.createElement('div');
        item.className = 'shape-compare-item shape-compare-' + card.kind;
        var visual = document.createElement('div');
        visual.className = 'shape-compare-visual';
        visual.setAttribute('aria-hidden', 'true');
        visual.innerHTML = card.html;
        var title = document.createElement('h2');
        title.textContent = App.i18n.t(card.title);
        var description = document.createElement('p');
        description.textContent = App.i18n.t(card.text);
        item.appendChild(visual);
        item.appendChild(title);
        item.appendChild(description);
        galleryVisual.appendChild(item);
      });
    } else {
      slide.cards.forEach(function (card) {
        galleryVisual.appendChild(conceptCard(card));
      });
    }
    galleryCaption.classList.add('hidden');
    galleryNote.classList.add('hidden');
  }


  function paintGallery() {
    galleryPrev.setAttribute('aria-label', App.i18n.t('galleryPrevious'));
    galleryNext.setAttribute('aria-label', App.i18n.t('galleryNext'));

    /* The concept slides count backwards from -1, so -1 is the opening one
       and -CONCEPT_SLIDES the last. Anything else is a gallery shape. */
    if (galleryIndex < 0) {
      paintConcept(-1 - galleryIndex);
      return;
    }

    var item = DATA.gallery[galleryIndex];
    var name = item.type === 'flat' ? shapeName(item.id) : solidName(item.id);
    galleryVisual.classList.remove('gallery-intro', 'gallery-part-intro');
    galleryVisual.innerHTML = item.type === 'flat'
      ? '<div class="shape-stage">' + shapeSvg(item.id, false) + '</div>'
      : '<div class="shape-stage">' + solidSvg(item.id) + '</div>';
    galleryVisual.setAttribute('role', 'img');
    galleryVisual.setAttribute('aria-label', name);
    galleryCaption.textContent = App.i18n.t('gallery.' + item.type + '.' + item.id)
      .replace('{name}', name);
    galleryCaption.classList.remove('hidden');
    galleryNote.textContent = shapeNote(item);
    galleryNote.classList.remove('hidden');
  }

  function paintRealExample() {
    var item = DATA.gallery[realIndex];
    var illustration = realObjectSvg(item.id);
    if (illustration) realObject.innerHTML = illustration;
    else realObject.textContent = item.object;
    realCaption.textContent = App.i18n.t('gallery.real.' + item.id);
    var note = realNoteFor(item);
    realNote.textContent = note;
    realNote.classList.toggle('hidden', !note);
    realPrev.setAttribute('aria-label', App.i18n.t('galleryPrevious'));
    realNext.setAttribute('aria-label', App.i18n.t('galleryNext'));
  }

  /* Three counts around the right one: one fewer, the answer, one more.
     Being out by one is the mistake this level actually produces, not
     picking a wild number. */
  function buildCounts(value) {
    var values = [value, value - 1, value + 1].filter(function (v) { return v > 0; });
    var extra = value + 2;
    while (values.length < 3) { values.push(extra); extra += 1; }
    return App.utils.shuffle(values.slice(0, 3)).map(function (v) {
      return { html: String(v), correct: v === value };
    });
  }

  /* The perimeter options. The mistake this question produces is not a wild
     number: it is leaving the last side out, or counting one twice. So the
     two wrong answers are exactly one side short and one side long — the
     same "out by one" the counting questions produce, one level up. */
  function perimeterOptions(total, side) {
    return App.utils.shuffle([total - side, total, total + side].map(function (v) {
      return { html: String(v), correct: v === total };
    }));
  }

  /* ---- Nets ----
     A net is drawn open, piece by piece, so the faces of a solid can be
     counted instead of imagined. Each letter of a row is one piece. */
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

  /* The pieces drawn have to be exactly as many as the faces claimed, or
     counting them would give the wrong answer. */
  DATA.nets.forEach(function (net) {
    var pieces = netPieces(net).length;
    if (pieces !== net.faces) {
      throw new Error('shapes: net "' + net.id + '" draws ' + pieces +
        ' pieces for ' + net.faces + ' faces');
    }
  });

  /* The clarification of the gallery states the number of faces as text,
     while the net states it as data, and for a solid that has a net both
     end up on screen: the note promises a count and the test asks it.
     They are compared here so that changing one without the other fails
     loudly instead of quietly teaching a number and asking another.
     The note must therefore start with the number of faces, in both
     languages. A solid without a net (the sphere, the cylinder, the cone)
     is not checked: its faces are never asked about in the test. */
  DATA.nets.forEach(function (net) {
    if (!net.solid) return;
    var stated = parseInt(shapeNote({ type: 'solid', id: net.solid }), 10);
    if (stated !== net.faces) {
      throw new Error('shapes: the note for "' + net.solid + '" says ' +
        (isNaN(stated) ? 'no number of faces' : stated) +
        ' faces, its net has ' + net.faces);
    }
  });

  /* The perimeter is only asked of shapes whose sides are all the same
     length. "Each side is 3 cm" about a rectangle or a trapezoid would be
     teaching something false: their sides come in two different lengths,
     so one number cannot describe them.
     Checked at start-up for the same reason the nets are: a question added
     later without noticing must fail loudly, not quietly teach a lie. */
  var REGULAR_SIDES = ['triangle', 'square', 'rhombus', 'pentagon', 'hexagon', 'octagon'];

  /* The symmetry question offers three fold lines and only one can be
     right, so it may only be asked of figures with exactly one vertical fold
     and no horizontal or diagonal one. A square or a hexagon has all three
     and the question would have no answer; the circle has every line and is
     worse. Which figures those are is decided here, once, instead of being
     a habit everybody has to remember. */
  var SYMMETRY_SHAPES = ['triangle', 'pentagon', 'trapezoid'];

  /* One big option and two small ones, and all three different: with two
     big options the question has no answer, and with the same body twice
     the child could answer from the drawing alone. */
  Object.keys(DATA.activities).forEach(function (activityId) {
    DATA.activities[activityId].levels.forEach(function (level) {
      if (level.tipo !== 'mixed' || !level.questions) return;
      level.questions.forEach(function (q) {
        if (q.tipo === 'shapePerimeter' &&
            (!DATA.sides[q.shape] || REGULAR_SIDES.indexOf(q.shape) === -1)) {
          throw new Error('shapes: the perimeter question "' + q.id + '" asks about "' +
            q.shape + '", whose sides are not all the same length');
        }
        if (q.tipo === 'shapeSymmetry' && SYMMETRY_SHAPES.indexOf(q.shape) === -1) {
          throw new Error('shapes: the symmetry question "' + q.id + '" asks about "' +
            q.shape + '", which does not have exactly one vertical fold line');
        }
        if (q.tipo === 'solidVolume') {
          var names = [q.solid].concat(q.against || []);
          if (names.length !== 3 || new Set(names).size !== 3 || (q.against || []).length !== 2) {
            throw new Error('shapes: the volume question "' + q.id +
              '" needs one big body and two different small ones');
          }
        }
        if (q.tipo === 'shapeSimilar' && (q.against || []).length !== 2) {
          throw new Error('shapes: the similarity question "' + q.id +
            '" needs two figures that are not the same shape');
        }
      });
    });
  });

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

  /* The face counts the solids here actually have, so the options are the
     real confusions and never a random number. */
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

  /* Small figures for the answer buttons. They reuse the very same drawing
     code as the question and the gallery, at a smaller size, so an option
     can never show a shape the activity would not draw elsewhere. */
  function shapeThumb(id, extra) {
    return '<span class="thumb">' +
      shapeSvg(id, false).replace('</svg>', (extra || '') + '</svg>') + '</span>';
  }

  function solidThumb(id, big) {
    return '<span class="thumb' + (big ? ' thumb-big' : '') + '">' + solidSvg(id) + '</span>';
  }

  /* Three axes for a figure that has exactly one: straight up, straight
     across, and at an angle. Every shape this question is asked of has one
     vertical fold line and neither of the other two, so exactly one option
     can be right — a square would have all three and the question would
     have no answer. app.js checks that at start-up. */
  var AXES = {
    vertical: '<line x1="60" y1="4" x2="60" y2="116" class="axis-mark"/>',
    horizontal: '<line x1="4" y1="62" x2="116" y2="62" class="axis-mark"/>',
    diagonal: '<line x1="8" y1="112" x2="112" y2="8" class="axis-mark"/>'
  };

  var GENERATORS = {

    /* How many flat faces a solid has. The net is drawn open, so the faces
       can be counted one by one instead of imagined. */
    solidParts: function (nv) {
      var net = nv.net
        ? DATA.nets.find(function (item) { return item.id === nv.net; })
        : draw(nv.id, DATA.nets);
      return {
        prompt: App.i18n.t('gen.howManyFaces').replace(/\{name\}/g, netName(net.id)),
        visual: netSvg(net),
        visualAria: App.i18n.t('gen.netAria')
          .replace(/\{n\}/g, net.faces).replace(/\{name\}/g, netName(net.id)),
        legend: App.i18n.t('gen.facesHint'),
        options: faceOptions(net.faces)
      };
    },

    /* And which solid it makes when folded. Every net is on screen and the
       three solids are named with their own shapes, so the answer comes
       from looking at the pieces, not from remembering a list. */
    fromNet: function (nv) {
      var net = nv.net
        ? DATA.nets.find(function (item) { return item.id === nv.net; })
        : draw(nv.id, DATA.nets);
      return {
        prompt: App.i18n.t('gen.fromNet'),
        visual: netSvg(net),
        visualAria: App.i18n.t('gen.netPiecesAria').replace(/\{n\}/g, net.faces),
        legend: App.i18n.t('gen.netHint'),
        options: App.utils.shuffle(DATA.nets.map(function (o) {
          return {
            html: '<span class="solid-name">' + netName(o.id) + '</span>' +
              '<span class="solid-gloss">' + netGloss(o.id) + '</span>',
            aria: netName(o.id),
            correct: o.id === net.id
          };
        })),
        inline: true
      };
    },


    /* Name the flat shape. The alternatives are the other shapes of this
       same level, so the confusion on offer is the real one (a square
       against a rectangle), never a random word. */
    shapeName: function (nv) {
      var shapes = nv.shapes || DATA.gallery.filter(function (item) {
        return item.type === 'flat';
      }).map(function (item) { return item.id; });
      var id = nv.shape || draw(nv.id, shapes);
      var others = App.utils.shuffle(shapes.filter(function (s) {
        return s !== id;
      })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.shapeNamePrompt'),
        visual: '<div class="shape-stage">' + shapeSvg(id, false) + '</div>',
        visualAria: shapeName(id),
        options: App.utils.shuffle(
          [{ html: shapeName(id), correct: true }].concat(
            others.map(function (s) {
              return { html: shapeName(s), correct: false };
            })
          ))
      };
    },

    /* Count the sides or the corners. Every corner carries a dot, so the
       answer can be reached by counting what is on screen. */
    shapeCount: function (nv) {
      var id = nv.shape || draw(nv.id + nv.count, nv.shapes);
      var counting = nv.count === 'corners';
      return {
        prompt: App.i18n.t(counting ? 'gen.cornersPrompt' : 'gen.sidesPrompt'),
        visual: '<div class="shape-stage">' + shapeSvg(id, true) + '</div>' +
          '<p class="hint">' + App.i18n.t(counting ? 'gen.cornersHint' : 'gen.sidesHint') + '</p>',
        visualAria: shapeName(id),
        options: buildCounts(DATA.sides[id][nv.count])
      };
    },

    /* The perimeter: going all the way round the shape. The answer is
       never stored — it is the length of a side times the number of sides,
       read from the same DATA.sides the drawing and the counting questions
       use, so the picture, the caption and the right answer cannot drift
       apart. The side length travels in the question (it is the one number
       given, like the shape), the total is worked out here. */
    shapePerimeter: function (nv) {
      var total = DATA.sides[nv.shape].sides * nv.side;
      return {
        prompt: App.i18n.t('gen.perimeterPrompt').replace(/\{side\}/g, nv.side),
        visual: '<div class="shape-stage">' + shapeSvg(nv.shape, false) + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.perimeterHint') + '</p>',
        /* The shape name only, like the counting questions: the drawing is
           a role="img", so its label replaces the hint inside it, and the
           length of a side is already in the prompt, which is read out
           on its own. */
        visualAria: shapeName(nv.shape),
        options: perimeterOptions(total, nv.side)
      };
    },

    /* The area: not a number yet, the other half of the perimeter. The
       question is which part of a flat figure is its area, and the two wrong
       answers are the two things a child actually confuses it with: the
       outline it has just been counting, and the corners on it. Counting
       the area is `geometry`'s job, not this one's. */
    shapeArea: function () {
      return {
        prompt: App.i18n.t('gen.areaPrompt'),
        visual: '<div class="shape-stage">' + areaSvg() + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.areaHint') + '</p>',
        visualAria: App.i18n.t('gen.areaAria'),
        options: App.utils.shuffle([
          { html: App.i18n.t('gen.areaEdge'), correct: false },
          { html: App.i18n.t('gen.areaInside'), correct: true },
          { html: App.i18n.t('gen.areaCorners'), correct: false }
        ])
      };
    },

    /* The volume, in its plainest form: the thing that takes up more room
       has more of it. The big one is drawn bigger on purpose, so the answer
       and the picture cannot disagree; counting the cubes inside is
       `geometry`'s job. */
    solidVolume: function (nv) {
      var others = nv.against.map(function (id) {
        return {
          html: solidThumb(id),
          aria: App.i18n.t('solid.' + id),
          correct: false
        };
      });
      return {
        prompt: App.i18n.t('gen.volumePrompt'),
        visual: '<p class="hint">' + App.i18n.t('gen.volumeHint') + '</p>',
        visualAria: App.i18n.t('gen.volumeAria').replace(/\{name\}/g, solidName(nv.solid)),
        options: App.utils.shuffle(others.concat([{
          html: solidThumb(nv.solid, true),
          aria: App.i18n.t('solid.' + nv.solid),
          correct: true
        }])),
        inline: true
      };
    },

    /* Symmetry: which fold line makes the two halves match. The three
       options are the three candidate lines on the same figure, so the
       answer comes from folding in your head rather than from knowing a
       list of symmetric shapes. */
    shapeSymmetry: function (nv) {
      var keys = App.utils.shuffle(['vertical', 'horizontal', 'diagonal']);
      return {
        prompt: App.i18n.t('gen.symmetryPrompt').replace(/\{name\}/g, shapeName(nv.shape)),
        visual: '<div class="shape-stage">' + shapeSvg(nv.shape, false) + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.symmetryHint') + '</p>',
        visualAria: shapeName(nv.shape),
        options: keys.map(function (key) {
          return {
            html: shapeThumb(nv.shape, AXES[key]),
            aria: App.i18n.t('gen.axis.' + key) + '. ' + shapeName(nv.shape),
            correct: key === 'vertical'
          };
        }),
        inline: true
      };
    },

    /* Similarity: the same shape at another size. All three options are
       drawn at the same small size, so only the shape tells them apart —
       picking the biggest or the smallest would be a different question. */
    shapeSimilar: function (nv) {
      return {
        prompt: App.i18n.t('gen.similarPrompt').replace(/\{name\}/g, shapeName(nv.shape)),
        visual: '<div class="shape-stage">' + shapeSvg(nv.shape, false) + '</div>' +
          '<p class="hint">' + App.i18n.t('gen.similarHint') + '</p>',
        visualAria: shapeName(nv.shape),
        options: App.utils.shuffle(
          [{ id: nv.shape, correct: true }].concat(nv.against.map(function (id) {
            return { id: id, correct: false };
          })).map(function (option) {
            return {
              html: shapeThumb(option.id),
              aria: shapeName(option.id),
              correct: option.correct
            };
          })
        ),
        inline: true
      };
    },

    /* Solids, always through an object you could pick up: "cilindro"
       means something before it becomes a word. New solids enter in
       later levels so the first round remains familiar. */
    solidName: function (nv) {
      var solidPool = nv.solids ? DATA.solids.filter(function (s) {
        return nv.solids.indexOf(s.id) !== -1;
      }) : DATA.solids;
      var solid = nv.solid
        ? solidPool.find(function (item) { return item.id === nv.solid; })
        : draw(nv.id, solidPool);
      var object = App.utils.shuffle(solid.objects)[0];
      var others = App.utils.shuffle(solidPool.filter(function (s) {
        return s.id !== solid.id;
      })).slice(0, 2);
      var nameOf = function (s) { return App.i18n.t('solid.' + s.id); };

      if (nv.dir === 'toObject') {
        return {
          prompt: App.i18n.t('gen.solidToObjectPrompt').replace('{name}', nameOf(solid)),
          visual: '<p class="hint">' + App.i18n.t('gen.solidHint') + '</p>',
          visualAria: nameOf(solid),
          options: App.utils.shuffle(
            [{ html: '<span class="solid-object">' + object + '</span>',
               aria: nameOf(solid), correct: true }].concat(
              others.map(function (s) {
                return {
                  html: '<span class="solid-object">' + App.utils.shuffle(s.objects)[0] + '</span>',
                  aria: nameOf(s), correct: false
                };
              })
            )),
          inline: true
        };
      }
      return {
        prompt: App.i18n.t('gen.solidToNamePrompt'),
        visual: '<div class="shape-stage"><span class="solid-object solid-big">' +
          object + '</span></div>',
        visualAria: nameOf(solid),
        options: App.utils.shuffle(
          [{ html: nameOf(solid), correct: true }].concat(
            others.map(function (s) {
              return { html: nameOf(s), correct: false };
            })
          ))
      };
    }
  };

  /* ============================================================
     Screens and flow
     ============================================================ */

  function show(screen) {
    [screenIntro, screenReal, screenMenu, screenGame, screenEnd].forEach(function (p) {
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
  function levelFromProgress(activityId) {
    var levels = activity.levels;
    var completed = progress.roundsByActivity[activityId];
    if (typeof completed !== 'number' || completed < 0) completed = 0;
    return levels[Math.min(Math.floor(completed), levels.length - 1)];
  }

  function roundLength() {
    return level.tipo === 'mixed' ? level.questions.length : DATA.perRound;
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    startRound(levelFromProgress(id));
  }

  /* ---- Game ---- */

  function startRound(nv) {
    level = nv;
    roundQuestions = level.tipo === 'mixed'
      ? App.utils.shuffle(level.questions.slice())
      : [];
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
    var questionLevel = level;
    if (!fixed && level.tipo === 'mixed') {
      questionLevel = roundQuestions[index];
    }
    question = fixed || GENERATORS[questionLevel.tipo](questionLevel, index);
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
      : (index / roundLength())) * 100 + '%';
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
    if (isCorrect && inReinforce) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
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
      /* The reinforcement mini-round replays questions this round already
         asked, so counting it here reported more correct answers than the
         round has — "Has resuelto 11 preguntas" for a 6-question round —
         and pushed `roundCorrect` past DATA.perRound, which is the exact
         value endRound() compares against to offer the next level. The
         button therefore vanished for anyone who had to repeat a question,
         which is precisely the person who should be moving up. Stars move
         with the score so the two numbers stay consistent. */
      if (!inReinforce) {
        progress.stars += 1;
        roundCorrect += 1;
      }
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
    if (index >= roundLength()) {
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
    progress.roundsByActivity[activity.id] =
      (progress.roundsByActivity[activity.id] || 0) + 1;
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
    var nextLevel = (roundCorrect === roundLength() && idxN !== -1 && idxN + 1 < activity.levels.length)
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
  $('#btnRepeat').addEventListener('click', function () {
    startRound(levelFromProgress(activity.id));
  });
  $('#btnMenu').addEventListener('click', function () { show(screenMenu); });
  $('#btnOtherActivity').addEventListener('click', function () { show(screenMenu); });

  function moveGallery(step) {
    /* The carousel is a ring of CONCEPT_SLIDES + gallery stops, but the
       index is not a ring: the concept slides count backwards from -1 and
       the gallery items count up from 0, so -1 and 0 are neighbours in the
       ring and nothing like each other in the index. Walking the ring with
       one offset put the wrap in the wrong place — it jumped from the last
       gallery item to the LAST concept slide instead of back to the
       opening. Converting through a linear position is the only way to get
       both ends right. */
    var stops = CONCEPT_SLIDES + DATA.gallery.length;
    var position = galleryIndex < 0
      ? -1 - galleryIndex
      : CONCEPT_SLIDES + galleryIndex;
    position = (position + step + stops) % stops;
    galleryIndex = position < CONCEPT_SLIDES ? -1 - position : position - CONCEPT_SLIDES;
    paintGallery();
  }

  $('#galleryPrev').addEventListener('click', function () {
    moveGallery(-1);
  });
  $('#galleryNext').addEventListener('click', function () {
    moveGallery(1);
  });
  $('#realPrev').addEventListener('click', function () {
    realIndex = (realIndex + DATA.gallery.length - 1) % DATA.gallery.length;
    paintRealExample();
  });
  $('#realNext').addEventListener('click', function () {
    realIndex = (realIndex + 1) % DATA.gallery.length;
    paintRealExample();
  });
  $('#introContinue').addEventListener('click', function () { show(screenReal); });
  $('#realBack').addEventListener('click', function () { show(screenIntro); });
  $('#realContinue').addEventListener('click', function () { show(screenMenu); });
  $('#menuBack').addEventListener('click', function () { show(screenReal); });

  paintGallery();
  paintRealExample();
  paintMenu();
  paintStars();
})();
