/* ============================================================
   Calculia — Fractions and decimals
   The flow of each activity, built by assets/js/activity-flow.js:
     1. the explanation (slides with a drawing) and the real-life examples;
     2. the test, one question at a time (socratic), with reinforcement of the misses.
   Fractions and decimals share that flow, each with its own slides, examples and levels.
   The comma exercise (activity 'coma') is a drag game with its own screen (comma.js); the
   engine opens it from the menu through the entry's open(), and hosts its screen.
   The questions are in model.js, the data in data.js, the texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;
  var plainText = App.utils.plainText;
  var M = App.fractionsMeasuresModel;
  var GENERATORS = M.GENERATORS;
  var INTRO = M.INTRO;

  /* The menu, in the order of data.js. */
  var ORDER = ['fracciones', 'decimales', 'coma'];

  /* ---- The explanation and the real-life examples: the same shape for both activities ---- */

  function introOf(id) {
    return INTRO[id].slides.map(function (slide, i) { return { visual: { id: id, i: i } }; });
  }

  function realOf(id) {
    return INTRO[id].real.map(function (item) {
      return { visual: { id: id, key: item.key, picto: item.picto } };
    });
  }

  function slideVisual(spec) {
    return INTRO[spec.id].slides[spec.i].visual();
  }

  /* The text of a slide: the general line of the explanation before the first slide, then the slide's own line. */
  function slideCopy(i, src) {
    var id = src.id;
    var key = INTRO[id].slides[i].key;
    var own = t('intro.' + id + '.' + key);
    return {
      title: t('intro.' + id + '.title'),
      text: i === 0 ? t('intro.' + id + '.text') + ' ' + own : own
    };
  }

  function realVisual(spec) {
    return '<div class="real-object" aria-hidden="true">' + spec.picto + '</div>';
  }

  function realCopy(i, src) {
    var item = src.real[i].visual;
    return t('real.' + item.id + '.' + item.key);
  }

  /* ---- The test ---- */

  /* A question of the activity, as the engine asks for it. The explanation after a right answer is
     the answer as written (its aria text for a picture), then a full stop. */
  function toQuestion(q) {
    var right = q.options.filter(function (o) { return o.correct; })[0];
    return {
      prompt: q.prompt,
      visual: q.visual || '',
      visualAria: q.visualAria,
      legend: plainText(q.legend || ''),
      hint: q.hint,
      explanation: (right.aria || plainText(right.html)) + '.',
      options: q.options.map(function (o) {
        return { html: o.html, aria: o.aria || plainText(o.html) || '', correct: o.correct };
      })
    };
  }

  /* One round: the questions of the level, the same kind, one after another. */
  function buildRound(def, level) {
    var out = [];
    for (var i = 0; i < DATA.perRound; i++) out.push(level);
    return out;
  }

  function makeQuestion(level, index) {
    return toQuestion(GENERATORS[level.tipo](level, index));
  }

  /* The rounds of the old saved progress (one counter per activity) count as the rounds of the engine. */
  function prepareProgress(progress) {
    var old = progress.rounds || {};
    Object.keys(old).forEach(function (id) {
      if (typeof progress.roundsByActivity[id] !== 'number') progress.roundsByActivity[id] = old[id];
    });
  }

  /* ---- Menu entries ---- */

  function entryFor(id) {
    var a = DATA.activities[id];
    return {
      id: id,
      picto: a.picto,
      levels: a.levels,
      name: function () { return t('activity.' + id + '.name'); },
      detail: function () { return t('activity.' + id + '.detail'); },
      intro: introOf(id),
      real: realOf(id)
    };
  }

  /* ---- The comma exercise: a game of its own, opened from the menu ---- */

  var comma = null;
  var commaCtx = null;
  var commaCorrect = 0;

  function endComma() {
    var ctx = commaCtx;
    ctx.progress.completedRounds = (ctx.progress.completedRounds || 0) + 1;
    ctx.save();
    ctx.show('#screenEnd');
    document.getElementById('endSummary').textContent = t('endSummary')
      .replace('{n}', commaCorrect)
      .replace('{activity}', t('activity.coma.name'))
      .replace('{stars}', ctx.progress.stars);
    document.getElementById('endNextStep').classList.add('hidden');
    App.feedback.celebrate(t('core.roundComplete'));
  }

  /* The comma module is built on first use: its screen is in the page by then. */
  function openComma(ctx) {
    commaCtx = ctx;
    if (!comma) {
      comma = App.fractionsMeasuresComma({
        progress: ctx.progress,
        save: function () { ctx.save(); },
        paintStars: function () { ctx.paintStars(); },
        steps: function () { return DATA.activities.coma.steps; },
        countCorrect: function () { commaCorrect += 1; },
        resetCorrect: function () { commaCorrect = 0; },
        endRound: endComma,
        showComma: function () { commaCtx.show('#screenComma'); },
        showMenu: function () { commaCtx.openMenu(); }
      });
    }
    comma.start();
  }

  var comaEntry = {
    id: 'coma',
    picto: DATA.activities.coma.picto,
    name: function () { return t('activity.coma.name'); },
    detail: function () { return t('activity.coma.detail'); },
    open: openComma
  };

  var MENU = ORDER.map(function (id) { return id === 'coma' ? comaEntry : entryFor(id); });

  App.activityFlow.setup({
    toolId: 'fractions-measures',
    test: 'options',
    socratic: true,
    reinforce: true,
    testVisuals: true,
    testVisualClass: 'visual',
    prepareProgress: prepareProgress,
    /* The comma screen is part of this page, and the engine shows and hides it with the rest. */
    extraScreens: ['#screenComma'],
    extraMarkup: document.getElementById('commaScreen').innerHTML,
    /* The defaults, for an entry without its own slides (the menu passes its own). */
    intro: introOf('fracciones'),
    visualHtml: slideVisual,
    introCopy: slideCopy,
    real: realOf('fracciones'),
    realVisualHtml: realVisual,
    realText: realCopy,
    activities: MENU,
    buildRound: buildRound,
    makeQuestion: makeQuestion,
    endNotes: [{ key: 'transfer', cls: 'transfer' }]
  });
})();
