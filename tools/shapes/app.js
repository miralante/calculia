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
  var galleryPrev = $('#galleryPrev');
  var galleryNext = $('#galleryNext');
  var realObject = $('#realObject');
  var realShape = $('#realShape');
  var realCaption = $('#realCaption');
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

  function polygonPoints(n, cx, cy, r) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      /* Start at the top so a triangle points up, the way it is drawn
         everywhere else. */
      var a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
    return pts;
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
    var POLY = { triangle: 3, pentagon: 5, hexagon: 6 };
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
      body = '<polygon points="18,38 62,18 108,38 64,58" class="solid-top"/>' +
        '<polygon points="18,38 64,58 64,100 18,80" class="solid-left"/>' +
        '<polygon points="64,58 108,38 108,80 64,100" class="solid-right"/>';
    } else if (id === 'triangularPrism') {
      body = '<polygon points="20,70 45,85 69,45 44,30" class="solid-left"/>' +
        '<polygon points="44,30 69,45 93,85 68,70" class="solid-top"/>' +
        '<polygon points="20,70 68,70 93,85 45,85" class="solid-right"/>' +
        '<polygon points="20,70 44,30 68,70" class="solid-base"/>';
    } else if (id === 'pyramid') {
      body = '<polygon points="20,80 60,60 100,80 60,100" class="solid-base"/>' +
        '<polygon points="60,15 20,80 60,60" class="solid-left"/>' +
        '<polygon points="60,15 60,60 100,80" class="solid-top"/>' +
        '<polygon points="60,15 20,80 60,100" class="solid-right"/>' +
        '<polygon points="60,15 60,100 100,80" class="solid-left"/>';
    } else if (id === 'sphere') {
      body = '<circle cx="60" cy="60" r="45" class="solid-sphere"/>' +
        '<ellipse cx="45" cy="40" rx="12" ry="7" class="solid-highlight"/>';
    } else if (id === 'cylinder') {
      body = '<path d="M20 28v64c0 12 80 12 80 0V28" class="solid-side"/>' +
        '<ellipse cx="60" cy="28" rx="40" ry="13" class="solid-top"/>' +
        '<path d="M20 92c0 12 80 12 80 0" class="solid-bottom"/>';
    } else if (id === 'cone') {
      body = '<path d="M60 16 18 92c0 14 84 14 84 0Z" class="solid-side"/>' +
        '<ellipse cx="60" cy="92" rx="42" ry="13" class="solid-bottom"/>';
    }
    return '<svg viewBox="0 0 120 120" width="160" height="160" aria-hidden="true">' +
      '<g stroke="var(--color-texto)" stroke-width="3" stroke-linejoin="round">' +
      body + '</g></svg>';
  }

  function paintGallery() {
    galleryPrev.setAttribute('aria-label', App.i18n.t('galleryPrevious'));
    galleryNext.setAttribute('aria-label', App.i18n.t('galleryNext'));

    if (galleryIndex === -1) {
      var intro = {
        flatTitle: App.i18n.t('introFlatTitle'),
        flatText: App.i18n.t('introFlatText'),
        introSideText: App.i18n.t('introSideText'),
        introCornerText: App.i18n.t('introCornerText'),
        solidTitle: App.i18n.t('introSolidTitle'),
        solidText: App.i18n.t('introSolidText')
      };
      galleryVisual.removeAttribute('role');
      galleryVisual.removeAttribute('aria-label');
      galleryVisual.classList.add('gallery-intro');
      galleryVisual.textContent = '';

      ['flat', 'solid'].forEach(function (kind) {
        var item = document.createElement('div');
        item.className = 'shape-compare-item shape-compare-' + kind;

        var visual = document.createElement('div');
        visual.className = 'shape-compare-visual';
        visual.setAttribute('aria-hidden', 'true');
        if (kind === 'flat') {
          visual.innerHTML = shapeSvg('triangle', false).replace('</svg>',
            '<line x1="18" y1="86" x2="102" y2="86" class="intro-side-mark"/>' +
            '<circle cx="18" cy="86" r="7" class="intro-corner-mark"/></svg>');
        } else {
          visual.innerHTML = solidSvg('sphere');
        }

        var title = document.createElement('h2');
        title.textContent = intro[kind + 'Title'];

        var description = document.createElement('p');
        description.textContent = intro[kind + 'Text'];

        item.appendChild(visual);
        item.appendChild(title);
        item.appendChild(description);
        if (kind === 'flat') {
          ['Side', 'Corner'].forEach(function (part) {
            var definition = document.createElement('p');
            definition.className = 'intro-part intro-part-' + part.toLowerCase();
            definition.textContent = intro['intro' + part + 'Text'];
            item.appendChild(definition);
          });
        }
        galleryVisual.appendChild(item);
      });
      galleryCaption.classList.add('hidden');
      return;
    }

    var item = DATA.gallery[galleryIndex];
    var name = item.type === 'flat' ? shapeName(item.id) : solidName(item.id);
    galleryVisual.classList.remove('gallery-intro');
    galleryVisual.innerHTML = item.type === 'flat'
      ? '<div class="shape-stage">' + shapeSvg(item.id, false) + '</div>'
      : '<div class="shape-stage">' + solidSvg(item.id) + '</div>';
    galleryVisual.setAttribute('role', 'img');
    galleryVisual.setAttribute('aria-label', name);
    galleryCaption.textContent = App.i18n.t('gallery.' + item.type + '.' + item.id)
      .replace('{name}', name);
    galleryCaption.classList.remove('hidden');
  }

  function paintRealExample() {
    var item = DATA.gallery[realIndex];
    var name = item.type === 'flat' ? shapeName(item.id) : solidName(item.id);
    realObject.textContent = item.object;
    realShape.textContent = App.i18n.t('realShape').replace('{name}', name);
    realCaption.textContent = App.i18n.t('gallery.real.' + item.id);
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

  var GENERATORS = {

    /* How many flat faces a solid has. The net is drawn open, so the faces
       can be counted one by one instead of imagined. */
    solidParts: function (nv) {
      var net = draw(nv.id, DATA.nets);
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
      var net = draw(nv.id, DATA.nets);
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
      var id = draw(nv.id, nv.shapes);
      var others = App.utils.shuffle(nv.shapes.filter(function (s) {
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
      var id = draw(nv.id + nv.count, nv.shapes);
      var counting = nv.count === 'corners';
      return {
        prompt: App.i18n.t(counting ? 'gen.cornersPrompt' : 'gen.sidesPrompt'),
        visual: '<div class="shape-stage">' + shapeSvg(id, true) + '</div>' +
          '<p class="hint">' + App.i18n.t(counting ? 'gen.cornersHint' : 'gen.sidesHint') + '</p>',
        visualAria: shapeName(id),
        options: buildCounts(DATA.sides[id][nv.count])
      };
    },

    /* Solids, always through an object you could pick up: "cilindro"
       means something before it becomes a word. New solids enter in
       later levels so the first round remains familiar. */
    solidName: function (nv) {
      var solidPool = nv.solids ? DATA.solids.filter(function (s) {
        return nv.solids.indexOf(s.id) !== -1;
      }) : DATA.solids;
      var solid = draw(nv.id, solidPool);
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

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    startRound(levelFromProgress(id));
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
    question = fixed || GENERATORS[level.tipo](level, index);
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
  $('#btnRepeat').addEventListener('click', function () {
    startRound(levelFromProgress(activity.id));
  });
  $('#btnMenu').addEventListener('click', function () { show(screenMenu); });
  $('#btnOtherActivity').addEventListener('click', function () { show(screenMenu); });

  function moveGallery(step) {
    var slideCount = DATA.gallery.length + 1;
    galleryIndex = (galleryIndex + 1 + step + slideCount) % slideCount - 1;
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
