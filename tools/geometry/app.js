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
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce). */
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Nothing that can be worked out is stored ----
     The kind of an angle comes from its degrees, and whether a figure is
     symmetrical from folding it. So the drawing and the right answer cannot
     drift apart: they are computed from the same number. */
  function angleKind(deg) {
    return deg === 90 ? 'right' : (deg < 90 ? 'acute' : 'obtuse');
  }

  /* ---- Data invariants, loud at start-up rather than wrong on screen ---- */
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
  /* ---- Utilities ---- */

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  /* The real name is what the angle is called everywhere else, so it is
     what gets taught — with its plain-words gloss next to it, never
     instead of it. */
  function kindName(kind) { return App.i18n.t('angle.' + kind + '.name'); }
  function kindGloss(kind) { return App.i18n.t('angle.' + kind + '.gloss'); }

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
      var angle = App.utils.drawRound(nv.id, DATA.angles.filter(function (a) {
        return a.deg % DEG_LABEL === 0;
      }));
      return {
        prompt: App.i18n.t('gen.measureAngle'),
        hint: App.i18n.t('gen.socraticProtractor'),
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
      var pair = App.utils.drawRound(nv.id, DATA.clockPairs);
      var marks = marksApart(pair.from, pair.to);
      var answer = marks * degreesPerMark();
      return {
        prompt: App.i18n.t('gen.clockAngle')
          .replace(/\{a\}/g, pair.from).replace(/\{b\}/g, pair.to),
        hint: App.i18n.t('gen.socraticClock'),
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

    /* What kind of angle is it. The guide corner stands in for the sheet
       of paper you would hold against it. */
    angleKind: function (nv) {
      var kinds = nv.against === 'all'
        ? ['right', 'acute', 'obtuse']
        : ['right', nv.against];
      var pool = DATA.angles.filter(function (a) {
        return kinds.indexOf(angleKind(a.deg)) !== -1;
      });
      var angle = App.utils.drawRound(nv.id, pool);
      var kind = angleKind(angle.deg);
      return {
        prompt: App.i18n.t('gen.whichAngle'),
        hint: App.i18n.t('gen.socraticAngleKind'),
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

    /* How many sides are the same. The marks are on the drawing, so this
       is counting, not remembering. */
    equalSides: function (nv) {
      var all = DATA.figuresByName.triangles.concat(DATA.figuresByName.quads);
      var fig = App.utils.drawRound(nv.id, all);
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
        hint: App.i18n.t('gen.socraticEqualSides'),
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
      var fig = App.utils.drawRound(nv.id, pool);
      return {
        prompt: App.i18n.t('gen.whichFigure'),
        hint: App.i18n.t('gen.socraticFigureName'),
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
    App.utils.drawRoundReset();
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
     it invites another look. Only the second one explains it.
     The invitation is the one written for THIS question —which is what
     to do with the figure in front of you— and not the same sentence for
     every question. The generic line is only the fallback, for a question
     that forgot to bring its own. */
  function showHint(op) {
    explanationEl.textContent = App.feedback.hintText(
      (question && question.hint) || App.i18n.t('hint'), op ? plainText(op.html) : '');
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
      showHint(op);
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

  }

  /* ---- Events ---- */

  $('#btnNext').addEventListener('click', next);



  paintMenu();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
