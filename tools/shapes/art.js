/* ============================================================
   Calculia — shapes: the drawings (SVG as text, no page in it).
   The shapes, the solids and the real objects that the questions show.
   They depend only on App.i18n. model.js reads them from App.shapesArt.
   ============================================================ */
(function () {
  'use strict';

  var SHAPE_FILL = 'var(--mod-razonamiento)';

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

  var CELL_OFFSETS = [[16, 0], [8, 14], [-8, 14], [-16, 0], [-8, -14], [8, -14]];
  function cellPoints(cx, cy) {
    return CELL_OFFSETS.map(function (offset) {
      return (cx + offset[0]) + ',' + (cy + offset[1]);
    }).join(' ');
  }

  /* The same list of points, as the `d` of a path. */
  function pathFromPoints(points, close) {
    return points.map(function (p, index) {
      return (index === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
    }).join('') + (close ? 'Z' : '');
  }

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

  function shapeSvg(id, marks, thin) {
    var POLY = { triangle: 3, pentagon: 5, hexagon: 6, octagon: 8 };
    var SW = thin ? '1.5' : '4';
    var body = '';
    var dots = '';

    if (id === 'circle') {
      body = '<circle cx="60" cy="60" r="46" fill="' + SHAPE_FILL +
        '" stroke="var(--color-texto)" stroke-width="' + SW + '"/>';
    } else if (id === 'square') {
      body = '<rect x="18" y="18" width="84" height="84" fill="' + SHAPE_FILL +
        '" stroke="var(--color-texto)" stroke-width="' + SW + '"/>';
      if (marks) {
        dots = cornerDots([{ x: 18, y: 18 }, { x: 102, y: 18 },
          { x: 102, y: 102 }, { x: 18, y: 102 }]);
      }
    } else if (id === 'rectangle') {
      body = '<rect x="8" y="32" width="104" height="56" fill="' + SHAPE_FILL +
        '" stroke="var(--color-texto)" stroke-width="' + SW + '"/>';
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
        '" stroke="var(--color-texto)" stroke-width="' + SW + '"/>';
      if (marks) dots = cornerDots(quad);
    } else {
      var pts = polygonPoints(POLY[id], 60, 62, 48);
      body = '<polygon points="' + pts.map(function (p) {
        return p.x.toFixed(1) + ',' + p.y.toFixed(1);
      }).join(' ') + '" fill="' + SHAPE_FILL +
        '" stroke="var(--color-texto)" stroke-width="' + SW + '"/>';
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
         bees live" without covering the thing being counted.
         And one cell is now drawn on its own, well clear of the comb,
         because that is the question a child really has in front of a
         honeycomb: "which bit of it is the hexagon?". The comb alone
         answers "all of it at once", so the shape never actually gets
         looked at. On its own it can be pointed at and its six sides
         counted. It is the same polygon at the same size, so it is one
         cell of the comb and not some other shape that happens to sit
         nearby; and it sits below the comb and to the right of it, far
         enough that nobody counts eight cells in the comb.
         The canvas grew downwards to make room for it: at 156 x 100 the
         drawing used barely two thirds of the card's height and left
         empty bands above and below, which none of the other drawings
         here have. */
      var cells = [
        { x: 20, y: 30 }, { x: 44, y: 44 }, { x: 68, y: 30 },
        { x: 20, y: 58 }, { x: 44, y: 72 }, { x: 68, y: 58 },
        { x: 44, y: 16 }
      ];
      var cellsSvg = cells.map(function (cell, index) {
        return '<polygon points="' + cellPoints(cell.x, cell.y) + '" fill="' +
          (index % 2 ? '#EFBF47' : '#F4C95D') + '"/>';
      }).join('');
      /* The lone cell: the wax and the outline of the comb, because it is
         one of those cells and nothing more. */
      var looseSvg = '<polygon points="' + cellPoints(118, 116) +
        '" fill="#F4C95D"/>';
      /* The bee keeps the wax yellow and the ink of the theme, the same
         split the comb uses. Its body cannot be the surface colour any
         more: outside the comb that is the colour of the card, so the bee
         would disappear into the background instead of into a cell. The
         outline is what carries it against a light card.
         Drawn with ellipses and circles, not polygons, so the cells stay
         countable: seven in the comb and one on its own. The gap to the
         comb is deliberately wide: the smoke measures the bee's box, and a
         rotated wing reports a box wider than the wing. */
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
      return '<svg viewBox="0 0 156 140" aria-hidden="true">' +
        '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
        cellsSvg + looseSvg + '</g>' + bee + '</svg>';
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


  App.shapesArt = {
    SHAPE_FILL: SHAPE_FILL,
    polygonPoints: polygonPoints,
    pointsAttr: pointsAttr,
    CELL_OFFSETS: CELL_OFFSETS,
    cellPoints: cellPoints,
    pathFromPoints: pathFromPoints,
    starPath: starPath,
    cornerDots: cornerDots,
    shapeSvg: shapeSvg,
    shapeName: shapeName,
    solidName: solidName,
    solidSvg: solidSvg,
    realObjectSvg: realObjectSvg
  };
})();
