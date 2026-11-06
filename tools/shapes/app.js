/* ============================================================
   Calculia — Formas
   Two sheets with levels (Formas, and Doblar por la mitad, data in data.js).
   The stages (explanation, real life, the menu and the test sheet) are built
   by assets/js/activity-flow.js. This file has the drawings, the generators of
   the questions, and the adapters that give the engine its slides, examples
   and sheets. The texts are in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var M = App.shapesModel;
  var SHAPE_FILL = M.SHAPE_FILL, polygonPoints = M.polygonPoints, pointsAttr = M.pointsAttr, CELL_OFFSETS = M.CELL_OFFSETS, cellPoints = M.cellPoints, pathFromPoints = M.pathFromPoints;
  var starPath = M.starPath, cornerDots = M.cornerDots, shapeSvg = M.shapeSvg, shapeName = M.shapeName, solidName = M.solidName, solidSvg = M.solidSvg;
  var realObjectSvg = M.realObjectSvg, CONCEPT_SLIDES = M.CONCEPT_SLIDES, triangleAxisMark = M.triangleAxisMark, axisMark = M.axisMark, areaSvg = M.areaSvg, TRIANGLE_KINDS = M.TRIANGLE_KINDS;
  var TRIANGLE_CORNERS = M.TRIANGLE_CORNERS, TRIANGLE_TICKS = M.TRIANGLE_TICKS, AREA_SHAPES = M.AREA_SHAPES, sideTicks = M.sideTicks, triangleKindSvg = M.triangleKindSvg, countSvg = M.countSvg;
  var AREA_UNIT = M.AREA_UNIT, turnedLabel = M.turnedLabel, flatLabel = M.flatLabel, areaCalcSvg = M.areaCalcSvg, volumeSvg = M.volumeSvg, similaritySvg = M.similaritySvg;
  var triangleWith = M.triangleWith, conceptCards = M.conceptCards, buildCounts = M.buildCounts, perimeterOptions = M.perimeterOptions, PIECE = M.PIECE, netPieces = M.netPieces;
  var REGULAR_SIDES = M.REGULAR_SIDES, SYMMETRY_SHAPES = M.SYMMETRY_SHAPES, netSvg = M.netSvg, netName = M.netName, netGloss = M.netGloss, faceOptions = M.faceOptions;
  var shapeThumb = M.shapeThumb, solidThumb = M.solidThumb, foldCells = M.foldCells, isSymmetricRows = M.isSymmetricRows, turnedRows = M.turnedRows, mirroredRows = M.mirroredRows;
  var sameRows = M.sameRows, paddedCells = M.paddedCells, gridFigureSvg = M.gridFigureSvg, AXES = M.AXES, GENERATORS = M.GENERATORS, t = M.t;
  var galleryName = M.galleryName, galleryDrawing = M.galleryDrawing, INTRO = M.INTRO, introCopy = M.introCopy, introVisualAria = M.introVisualAria, realVisualHtml = M.realVisualHtml;
  var SHEETS = M.SHEETS, makeQuestion = M.makeQuestion;

  /* ---- Utilidades ---- */

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  /* ---- Drawing the shapes ----
     Regular polygons are generated from their vertex count, so the picture
     and DATA.sides can never drift apart. The square and the rectangle are
     drawn explicitly instead: a 4-sided regular polygon comes out as a
     diamond, which is not what a square should look like. */
  /* Regular polygons, so the drawing and the caption can never disagree on
     how many sides a shape has. `phase` rotates the first vertex for the
     shapes that are only right side-on: a stop sign has a flat top edge, so
     its octagon starts a quarter step further round. */
  /* One cell of the honeycomb, from the same six offsets every time it is
     drawn. The comb and the cell drawn on its own are the same polygon this
     way, so the one that answers "this is the hexagon" cannot quietly drift
     into a different shape than the one the caption is about. */
  /* A star: `spikes` points out at `outer` radius, one point in between at
     `inner`. It is a path and not a polygon on purpose: the number of
     polygons in a drawing is what proves the shape on screen has the sides
     the caption claims, and a badge built out of polygons would quietly
     make that count lie. */
  /* `marks` puts a dot on every corner, so corners can be counted by
     looking instead of from memory. `thin` swaps the 4px outline for a
     1.5px one, which is what the perimeter question needs: the shape
     must be visible, but the four corners must not look like "painted
     vertices" sitting on top of the figure. The default 4px stroke is
     what the rest of the test wants. */
  /* The everyday objects below are drawn, not left to the object's emoji.
     The emoji were wrong in a way only a picture shows: the shield is a
     rounded heater shield with no pentagon in it, the stop sign comes
     without the word inside, and a cardboard parcel is not a cereal box.
     Anything drawn with a fixed colour (a yellow sign, a red stop sign)
     keeps its own ink instead of following --color-texto, because the
     background it sits on does not change with the theme either. */
  /* ---- Concept slides ----
     More than one, and the number is CONCEPT_SLIDES: both the carousel
     arithmetic and the smoke read it from here, so adding a concept slide is
     adding one entry and nothing else. The count is arithmetic, not data —
     it has to match the branches below or the carousel wraps into a
     gallery slide it should never show. */
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
  /* A dashed fold line through the figure. Used by symmetry, and by nothing
     else: the perimeter is the edge of the shape, not a line through it. */
  /* The area: the inside, covered. Diagonal hatching clipped to the shape,
     so the fill can only ever be inside it. The clip path is a fixed id
     because exactly one area card exists in the document at a time. */
  /* ---- Triangles and the area by formula ----
     Each kind of triangle is three corners, fixed here once. The marks that
     say which sides are equal, and the square that says which corner is a
     right angle, are drawn from those same corners, so they cannot come
     loose from the triangle they describe. */
  /* Tick marks per side, in the order the corners are listed: side 0 runs
     from corner 0 to corner 1, and so on. Sides with the same number of
     ticks are the same length. */
  /* The area counted: a figure over its grid of little squares. The squares
     are lines drawn over the fill, so each one can be pointed at. The
     triangle is the half of a square that the diagonal leaves. */
  /* An area drawn to scale: each measure is a fixed number of drawing units,
     so the picture and the numbers written on it agree. `withNumbers` writes
     the measures for a question; the formula slide leaves them out and only
     names the parts, so its drawing does not give the answer away. */
  /* `halo` outlines the text in the card colour, for a label that sits on
     the dark fill of the triangle: the text stays readable in both themes. */
  /* The volume: the space inside. A solid drawn inside a dashed outline of
     the whole space it would fill, so "there is room inside" is the thing
     on screen and not a word in the caption. */
  /* Similarity: the same figure at two sizes, side by side. Both are
     equilateral triangles from the same helper, so they differ in size and
     in nothing else — which is the whole point of the concept. */
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

  /* Three counts around the right one: one fewer, the answer, one more.
     Being out by one is the mistake this level actually produces, not
     picking a wild number. */
  /* The perimeter options. The mistake this question produces is not a wild
     number: it is leaving the last side out, or counting one twice. So the
     two wrong answers are exactly one side short and one side long — the
     same "out by one" the counting questions produce, one level up. */
  /* ---- Nets ----
     A net is drawn open, piece by piece, so the faces of a solid can be
     counted instead of imagined. Each letter of a row is one piece. */
  /* The pieces drawn have to be exactly as many as the faces claimed, or
     counting them would give the wrong answer. */
  DATA.nets.forEach(function (net) {
    var pieces = netPieces(net).length;
    if (pieces !== net.faces) {
      throw new Error('shapes: net "' + net.id + '" draws ' + pieces +
        ' pieces for ' + net.faces + ' faces');
    }
  });

  /* The perimeter is only asked of shapes whose sides are all the same
     length. "Each side is 3 cm" about a rectangle or a trapezoid would be
     teaching something false: their sides come in two different lengths,
     so one number cannot describe them.
     Checked at start-up for the same reason the nets are: a question added
     later without noticing must fail loudly, not quietly teach a lie. */
  /* The symmetry question offers three fold lines and only one can be
     right, so it may only be asked of figures with exactly one vertical fold
     and no horizontal or diagonal one. A square or a hexagon has all three
     and the question would have no answer; the circle has every line and is
     worse. Which figures those are is decided here, once, instead of being
     a habit everybody has to remember. */
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
        if (q.tipo === 'triangleKind' && !TRIANGLE_KINDS[q.basis]) {
          throw new Error('shapes: the triangle question "' + q.id + '" asks by "' +
            q.basis + '", which is neither sides nor angles');
        }
        if (q.tipo === 'shapeAreaCalc' && AREA_SHAPES.indexOf(q.shape) === -1) {
          throw new Error('shapes: the area question "' + q.id + '" asks about "' +
            q.shape + '", which has no area formula here');
        }
        if (q.tipo === 'shapeSimilar' && (q.against || []).length !== 2) {
          throw new Error('shapes: the similarity question "' + q.id +
            '" needs two figures that are not the same shape');
        }
      });
    });
  });

  /* The face counts the solids here actually have, so the options are the
     real confusions and never a random number. */
  /* Small figures for the answer buttons. They reuse the very same drawing
     code as the question and the gallery, at a smaller size, so an option
     can never show a shape the activity would not draw elsewhere. */
  /* ---- Folding in half ----
     A figure drawn square by square, with the fold line down its middle when
     the question asks about it. Whether a figure folds exactly in half is
     worked out from its rows (every row reads the same backwards), never
     stored, so the drawing and the answer cannot drift apart. */
  /* A figure turned a quarter of the way round is the transpose of its rows,
     reversed, so the options cannot drift from what the question claims. */
  /* The same figure in a grid with one free row and column, so a moved copy
     really sits somewhere else on the card. */
  /* The cells drawn inside a 120-unit square, the cell size chosen so the
     whole grid fits. `axis` puts the fold line down the middle; `size` is the
     width and height of the drawing on screen. */
  /* Checked at start-up: the fold question needs a figure of each kind, the
     figures must be drawn square, and a moved figure must not look the same
     turned or mirrored, or "moved" and "turned" would have two answers. */
  [true, false].forEach(function (want) {
    if (!DATA.folds.some(function (f) { return isSymmetricRows(f.rows) === want; })) {
      throw new Error('shapes: no fold figure that is ' + (want ? '' : 'not ') + 'symmetric');
    }
  });
  DATA.folds.forEach(function (f) {
    var width = f.rows[0].length;
    f.rows.forEach(function (row) {
      if (row.length !== width) {
        throw new Error('shapes: fold figure "' + f.id + '" has rows of different width');
      }
      if (/[^#.]/.test(row)) {
        throw new Error('shapes: fold figure "' + f.id + '" has a cell that is not # or .');
      }
    });
    /* The fold line is drawn down the middle, so an empty outer column would
       put it off-centre from the figure the person sees. */
    var usesEdges = f.rows.some(function (row) { return row[0] === '#'; }) &&
      f.rows.some(function (row) { return row[width - 1] === '#'; });
    if (!usesEdges) {
      throw new Error('shapes: fold figure "' + f.id + '" leaves an outer column empty');
    }
  });
  DATA.movedFigures.forEach(function (f) {
    if (sameRows(turnedRows(f.rows), f.rows) || sameRows(mirroredRows(f.rows), f.rows)) {
      throw new Error('shapes: moved figure "' + f.id + '" looks the same turned or mirrored');
    }
  });

  /* Three axes for a figure that has exactly one: straight up, straight
     across, and at an angle. Every shape this question is asked of has one
     vertical fold line and neither of the other two, so exactly one option
     can be right — a square would have all three and the question would
     have no answer. app.js checks that at start-up. */
  /* ============================================================
     Adapters: the stages and the sheets come from the shared engine
     ============================================================ */

  /* One concept slide: its cards (the layout of the slide decides how they sit).
     The cards are built as before, into a holder, and handed to the engine as HTML. */
  function conceptSlideHtml(n) {
    var slide = conceptCards(n);
    var holder = document.createElement('div');
    holder.className = 'gallery-intro' + (slide.layout === 'parts' ? ' gallery-part-intro' : '');
    if (slide.layout === 'compare') {
      slide.cards.forEach(function (card) {
        var item = document.createElement('div');
        item.className = 'shape-compare-item shape-compare-' + card.kind;
        var visual = document.createElement('div');
        visual.className = 'shape-compare-visual';
        visual.setAttribute('aria-hidden', 'true');
        visual.innerHTML = card.html;
        var title = document.createElement('h2');
        title.textContent = t(card.title);
        var description = document.createElement('p');
        description.textContent = t(card.text);
        item.appendChild(visual);
        item.appendChild(title);
        item.appendChild(description);
        holder.appendChild(item);
      });
    } else {
      slide.cards.forEach(function (card) { holder.appendChild(conceptCard(card)); });
    }
    return holder.outerHTML;
  }

  /* The explanation: the concept slides first, then the figures of the gallery. A
     concept slide carries its own text in its cards, so it has no title of its own. */
  for (var c = 0; c < CONCEPT_SLIDES; c += 1) INTRO.push({ visual: { concept: c } });
  DATA.gallery.forEach(function (item) { INTRO.push({ visual: { gallery: item } }); });

  function visualHtml(spec) {
    if (spec.concept !== undefined) return conceptSlideHtml(spec.concept);
    return galleryDrawing(spec.gallery);
  }

  /* The two sheets of the activity, with their levels. Each level is a list of
     questions; the round shuffles them, and each one is generated when it starts. */
  App.activityFlow.setup({
    toolId: 'shapes',
    test: 'sheet',
    slideProgress: false,
    intro: INTRO,
    real: DATA.gallery.map(function (item) { return { visual: item }; }),
    introHeading: function () { return t('instructionIntro'); },
    introCopy: introCopy,
    introVisualAria: introVisualAria,
    realText: function (i) { return t('gallery.real.' + DATA.gallery[i].id); },
    visualHtml: visualHtml,
    realVisualHtml: realVisualHtml,
    activities: SHEETS,
    makeQuestion: makeQuestion
  });
})();
