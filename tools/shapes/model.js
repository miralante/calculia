/* ============================================================
   Calculia — shapes: the model (no page in it).
   The questions, the numbers and the drawings as HTML text. Nothing here
   touches the page, so it can be checked on its own. The page and the flow
   are in app.js, which reads these names from App.shapesModel.
   ============================================================ */
(function () {
  'use strict';

  var D = App.ShapesDrawings;
  var triangleAxisMark = D.triangleAxisMark, axisMark = D.axisMark, areaSvg = D.areaSvg,
      TRIANGLE_KINDS = D.TRIANGLE_KINDS, TRIANGLE_CORNERS = D.TRIANGLE_CORNERS, TRIANGLE_TICKS = D.TRIANGLE_TICKS,
      AREA_SHAPES = D.AREA_SHAPES, sideTicks = D.sideTicks, triangleKindSvg = D.triangleKindSvg, countSvg = D.countSvg,
      AREA_UNIT = D.AREA_UNIT, turnedLabel = D.turnedLabel, flatLabel = D.flatLabel, areaCalcSvg = D.areaCalcSvg,
      volumeSvg = D.volumeSvg, similaritySvg = D.similaritySvg, triangleWith = D.triangleWith,
      conceptCards = D.conceptCards, PIECE = D.PIECE, netPieces = D.netPieces, REGULAR_SIDES = D.REGULAR_SIDES,
      SYMMETRY_SHAPES = D.SYMMETRY_SHAPES, netSvg = D.netSvg, netName = D.netName, netGloss = D.netGloss,
      faceOptions = D.faceOptions, shapeThumb = D.shapeThumb, solidThumb = D.solidThumb, foldCells = D.foldCells,
      isSymmetricRows = D.isSymmetricRows, turnedRows = D.turnedRows, mirroredRows = D.mirroredRows,
      sameRows = D.sameRows, paddedCells = D.paddedCells, gridFigureSvg = D.gridFigureSvg;


  var A = App.shapesArt;
  var SHAPE_FILL = A.SHAPE_FILL,
    polygonPoints = A.polygonPoints,
    pointsAttr = A.pointsAttr,
    CELL_OFFSETS = A.CELL_OFFSETS,
    cellPoints = A.cellPoints,
    pathFromPoints = A.pathFromPoints,
    starPath = A.starPath,
    cornerDots = A.cornerDots,
    shapeSvg = A.shapeSvg,
    shapeName = A.shapeName,
    solidName = A.solidName,
    solidSvg = A.solidSvg,
    realObjectSvg = A.realObjectSvg;
  var CONCEPT_SLIDES = 8;

  function buildCounts(value) {
    var values = [value, value - 1, value + 1].filter(function (v) { return v > 0; });
    var extra = value + 2;
    while (values.length < 3) { values.push(extra); extra += 1; }
    return App.utils.shuffle(values.slice(0, 3)).map(function (v) {
      return { html: String(v), correct: v === value };
    });
  }

  function perimeterOptions(total, side) {
    return App.utils.shuffle([total - side, total, total + side].map(function (v) {
      return { html: String(v), correct: v === total };
    }));
  }

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
        : App.utils.drawRound(nv.id, DATA.nets);
      return {
        prompt: App.i18n.t('gen.howManyFaces').replace(/\{name\}/g, netName(net.id)),
        visual: netSvg(net),
        visualAria: App.i18n.t('gen.netAria')
          .replace(/\{n\}/g, net.faces).replace(/\{name\}/g, netName(net.id)),
        legend: App.i18n.t('gen.facesHint'),
        hint: App.i18n.t('gen.socraticFaces'),
        options: faceOptions(net.faces)
      };
    },

    /* And which solid it makes when folded. Every net is on screen and the
       three solids are named with their own shapes, so the answer comes
       from looking at the pieces, not from remembering a list. */
    fromNet: function (nv) {
      var net = nv.net
        ? DATA.nets.find(function (item) { return item.id === nv.net; })
        : App.utils.drawRound(nv.id, DATA.nets);
      return {
        prompt: App.i18n.t('gen.fromNet'),
        visual: netSvg(net),
        visualAria: App.i18n.t('gen.netPiecesAria').replace(/\{n\}/g, net.faces),
        legend: App.i18n.t('gen.netHint'),
        hint: App.i18n.t('gen.socraticNet'),
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
      var id = nv.shape || App.utils.drawRound(nv.id, shapes);
      var others = App.utils.shuffle(shapes.filter(function (s) {
        return s !== id;
      })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.shapeNamePrompt'),
        visual: '<div class="shape-stage">' + shapeSvg(id, false) + '</div>',
        visualAria: shapeName(id),
        hint: App.i18n.t('gen.socraticName'),
        options: App.utils.shuffle(
          [{ html: shapeName(id), correct: true }].concat(
            others.map(function (s) {
              return { html: shapeName(s), correct: false };
            })
          ))
      };
    },

    /* Count the sides or the corners. Every corner carries a dot, so the
       answer can be reached by counting what is on screen. The "count
       the marked dots" reminder used to live as a `<p class="hint">`
       under the figure, but the dots are already on the drawing, so the
       text was a duplicate of the picture. It moved to the socratic
       hint, which only fires when the answer is wrong, so the screen
       stays clean during the test. */
    shapeCount: function (nv) {
      var id = nv.shape || App.utils.drawRound(nv.id + nv.count, nv.shapes);
      var counting = nv.count === 'corners';
      return {
        prompt: App.i18n.t(counting ? 'gen.cornersPrompt' : 'gen.sidesPrompt'),
        visual: '<div class="shape-stage">' + shapeSvg(id, true) + '</div>',
        visualAria: shapeName(id),
        hint: App.i18n.t(counting ? 'gen.socraticCorners' : 'gen.socraticSides'),
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
        /* The figure is drawn with a thin 1.5px outline (`thin=true`) so the
           four corners of the square, pentagon, etc. don't look like
           painted vertices sitting on top of an already visible figure.
           The visible "sum all the sides" line used to live under the
           drawing; it was a duplicate of the prompt and made the screen
           noisy, so it moved to the socratic hint, which only fires on
           a wrong answer. */
        visual: '<div class="shape-stage">' + shapeSvg(nv.shape, false, true) + '</div>',
        visualAria: shapeName(nv.shape),
        hint: App.i18n.t('gen.socraticPerimeter'),
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
        visual: '<div class="shape-stage">' + areaSvg() + '</div>',
        visualAria: App.i18n.t('gen.areaAria'),
        hint: App.i18n.t('gen.socraticArea'),
        options: App.utils.shuffle([
          { html: App.i18n.t('gen.areaEdge'), correct: false },
          { html: App.i18n.t('gen.areaInside'), correct: true },
          { html: App.i18n.t('gen.areaCorners'), correct: false }
        ])
      };
    },

    /* A triangle named by its sides or by its angles. The drawing is one kind
       and the three kinds of its family are the answers, so every wrong
       option is a real confusion, never a random word. */
    triangleKind: function (nv) {
      var kinds = TRIANGLE_KINDS[nv.basis];
      var id = App.utils.drawRound(nv.id, kinds);
      return {
        prompt: App.i18n.t(nv.basis === 'angles' ? 'gen.triangleAnglesPrompt' : 'gen.triangleSidesPrompt'),
        visual: '<div class="shape-stage">' + triangleKindSvg(id) + '</div>',
        visualAria: App.i18n.t('gen.triangleAria'),
        hint: App.i18n.t(nv.basis === 'angles' ? 'gen.socraticTriangleAngles' : 'gen.socraticTriangleSides'),
        options: App.utils.shuffle(kinds.map(function (kind) {
          return { html: App.i18n.t('triKind.' + kind), correct: kind === id };
        }))
      };
    },

    /* The area by formula. The two wrong answers are the two mistakes this
       formula gets: the perimeter (all the sides added up), and the sum of
       the two measures; for the triangle, the product without halving it. */
    shapeAreaCalc: function (nv) {
      var base = nv.shape === 'square' ? nv.side : nv.base;
      var height = nv.shape === 'square' ? nv.side : nv.height;
      var area = nv.shape === 'triangle' ? base * height / 2 : base * height;
      var wrong = nv.shape === 'triangle'
        ? [base * height, base + height]
        : [2 * (base + height), base + height];
      return {
        prompt: App.i18n.t('gen.areaCalcPrompt').replace(/\{name\}/g, shapeName(nv.shape)),
        visual: '<div class="shape-stage">' + areaCalcSvg(nv.shape, base, height, true) + '</div>',
        visualAria: shapeName(nv.shape),
        hint: App.i18n.t('gen.socraticAreaCalc'),
        options: App.utils.shuffle([area].concat(wrong).map(function (v) {
          return { html: String(v), correct: v === area };
        }))
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
        /* The visible "compare the three solids" reminder used to live
           under the prompt; the three big/mini thumbs are already on
           screen, so the line was repeating the picture. It moved to
           the socratic hint, which only fires on a wrong answer. */
        visualAria: App.i18n.t('gen.volumeAria').replace(/\{name\}/g, solidName(nv.solid)),
        hint: App.i18n.t('gen.socraticVolume'),
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
        visual: '<div class="shape-stage">' + shapeSvg(nv.shape, false) + '</div>',
        visualAria: shapeName(nv.shape),
        hint: App.i18n.t('gen.socraticSymmetry'),
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
        visual: '<div class="shape-stage">' + shapeSvg(nv.shape, false) + '</div>',
        visualAria: shapeName(nv.shape),
        hint: App.i18n.t('gen.socraticSimilar'),
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
        : App.utils.drawRound(nv.id, solidPool);
      var object = App.utils.shuffle(solid.objects)[0];
      var others = App.utils.shuffle(solidPool.filter(function (s) {
        return s.id !== solid.id;
      })).slice(0, 2);
      var nameOf = function (s) { return App.i18n.t('solid.' + s.id); };

      if (nv.dir === 'toObject') {
        return {
          prompt: App.i18n.t('gen.solidToObjectPrompt').replace('{name}', nameOf(solid)),
          /* The visible "think about the shape, not what it's for"
             reminder used to live under the prompt; the three object
             thumbs are already on screen, so the line was repeating
             the picture. It moved to the socratic hint, which only
             fires on a wrong answer. */
          visualAria: nameOf(solid),
          hint: App.i18n.t('gen.socraticSolid'),
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
        /* The pyramid (🏜️ → cactus) and the triangular prism
           (⛺ → camping scene with trees, fire and moon) are drawn
           instead of being left to their emoji: both render on the
           platforms that matter here as something a child can't read
           as a solid. solidSvg() is the same drawing the gallery
           uses, so the test and the carousel agree on what those two
           solids look like. The rest (🎲 cube, ⚽ sphere, 🥫
           cylinder, 📦 prism, 🍦 cone) ride the emoji because those
           read unambiguously. */
        visual: '<div class="shape-stage">' +
          (solid.id === 'pyramid' || solid.id === 'triangularPrism'
            ? solidSvg(solid.id)
            : '<span class="solid-object solid-big">' + object + '</span>') +
          '</div>',
        visualAria: nameOf(solid),
        hint: App.i18n.t('gen.socraticSolid'),
        options: App.utils.shuffle(
          [{ html: nameOf(solid), correct: true }].concat(
            others.map(function (s) {
              return { html: nameOf(s), correct: false };
            })
          ))
      };
    },

    /* Does it match when you fold it along the line? The drawing is the only
       evidence: the fold line is on it, and the answer comes from its rows. */
    foldYesNo: function (nv) {
      var fig = App.utils.drawRound(nv.id, DATA.folds);
      var yes = isSymmetricRows(fig.rows);
      return {
        prompt: App.i18n.t('gen.foldPrompt'),
        hint: App.i18n.t('gen.socraticFold'),
        visual: '<div class="shape-stage">' + gridFigureSvg(foldCells(fig.rows), true, 160) + '</div>',
        /* The aria text does not say yes or no: that would give the answer away. */
        visualAria: App.i18n.t('gen.foldAria'),
        legend: App.i18n.t('gen.foldHint'),
        options: App.utils.shuffle([true, false].map(function (v) {
          return {
            html: '<span class="fold-answer">' + App.i18n.t(v ? 'gen.foldYes' : 'gen.foldNo') + '</span>',
            aria: App.i18n.t(v ? 'gen.foldYes' : 'gen.foldNo'),
            correct: v === yes
          };
        })),
        inline: true
      };
    },

    /* Which of the two folds exactly in half. Both are drawn the same size, so
       only the shape tells them apart. */
    foldPick: function (nv) {
      var good = App.utils.drawRound(nv.id + 'yes', DATA.folds.filter(function (f) {
        return isSymmetricRows(f.rows);
      }));
      var bad = App.utils.drawRound(nv.id + 'no', DATA.folds.filter(function (f) {
        return !isSymmetricRows(f.rows);
      }));
      return {
        prompt: App.i18n.t('gen.foldPickPrompt'),
        hint: App.i18n.t('gen.socraticFoldPick'),
        legend: App.i18n.t('gen.foldHint'),
        options: App.utils.shuffle([
          { html: gridFigureSvg(foldCells(good.rows), true, 110),
            aria: App.i18n.t('gen.foldOption'), correct: true },
          { html: gridFigureSvg(foldCells(bad.rows), true, 110),
            aria: App.i18n.t('gen.foldOption'), correct: false }
        ]),
        inline: true
      };
    },

    /* Moved, or turned? A figure that has only been moved still faces the same
       way; a turned one does not. The three choices come from the same rows. */
    movedOrTurned: function (nv) {
      var fig = App.utils.drawRound(nv.id, DATA.movedFigures);
      return {
        prompt: App.i18n.t('gen.whichMoved'),
        hint: App.i18n.t('gen.socraticMoved'),
        visual: '<div class="shape-stage">' + gridFigureSvg(paddedCells(fig.rows, 0, 0), false, 160) + '</div>',
        visualAria: App.i18n.t('gen.movedAria'),
        legend: App.i18n.t('gen.movedHint'),
        options: App.utils.shuffle([
          { html: gridFigureSvg(paddedCells(fig.rows, 1, 1), false, 110),
            aria: App.i18n.t('gen.ariaMoved'), correct: true },
          { html: gridFigureSvg(paddedCells(turnedRows(fig.rows), 0, 1), false, 110),
            aria: App.i18n.t('gen.ariaTurned'), correct: false },
          { html: gridFigureSvg(paddedCells(mirroredRows(fig.rows), 1, 0), false, 110),
            aria: App.i18n.t('gen.ariaFlipped'), correct: false }
        ]),
        inline: true
      };
    }
  };

  function t(key) { return App.i18n.t(key); }

  function galleryName(item) {
    return item.type === 'flat' ? shapeName(item.id) : solidName(item.id);
  }
  function galleryDrawing(item) {
    return '<div class="shape-stage">' +
      (item.type === 'flat' ? shapeSvg(item.id, false) : solidSvg(item.id)) + '</div>';
  }

  var INTRO = [];
  function introCopy(i) {
    if (i < CONCEPT_SLIDES) return null;
    var item = DATA.gallery[i - CONCEPT_SLIDES];
    return {
      title: t('gallery.' + item.type + '.' + item.id).replace('{name}', galleryName(item)),
      text: ''
    };
  }

  /* A figure of the gallery is labelled with its name; a concept slide keeps the generic label. */
  function introVisualAria(i) {
    if (i < CONCEPT_SLIDES) return null;
    return galleryName(DATA.gallery[i - CONCEPT_SLIDES]);
  }

  /* A real-life example: its picture, or the emoji of the object when there is no drawing. */
  function realVisualHtml(item) {
    var illustration = realObjectSvg(item.id);
    return '<div class="real-object" aria-hidden="true">' + (illustration || item.object) + '</div>';
  }

  var SHEETS = Object.keys(DATA.activities).map(function (id) {
    var act = DATA.activities[id];
    return {
      id: id,
      picto: act.picto,
      levels: act.levels,
      name: function () { return t('activity.' + id + '.name'); },
      detail: function () { return t('activity.' + id + '.detail'); },
      buildRound: function (level) { return App.utils.shuffle(level.questions.slice()); }
    };
  });

  function makeQuestion(entry, index) {
    var q = GENERATORS[entry.tipo](entry, index);
    /* A picture without a label is decoration: the screen reader skips it. */
    if (!q.visualAria) q.visualDecorative = true;
    return q;
  }

  App.shapesModel = {
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
    realObjectSvg: realObjectSvg,
    CONCEPT_SLIDES: CONCEPT_SLIDES,
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
    buildCounts: buildCounts,
    perimeterOptions: perimeterOptions,
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
    gridFigureSvg: gridFigureSvg,
    AXES: AXES,
    GENERATORS: GENERATORS,
    t: t,
    galleryName: galleryName,
    galleryDrawing: galleryDrawing,
    INTRO: INTRO,
    introCopy: introCopy,
    introVisualAria: introVisualAria,
    realVisualHtml: realVisualHtml,
    SHEETS: SHEETS,
    makeQuestion: makeQuestion
  };
})();
