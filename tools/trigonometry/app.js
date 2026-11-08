/* ============================================================
   Calculia — Trigonometría
   The flow of the activity, built by assets/js/activity-flow.js:
     1. the explanation: two pictures, the ladders (the rise and the run) and the
        ramps (which one rises faster);
     2. real life: a house roof, a ladder and two ramps, each with its angle;
     3. the test: one question at a time (socratic), with reinforcement of the misses.
   This file has the real-life drawings and the wiring. The questions are in
   questions.js, the drawings of the triangles in figures.js, and the data in
   data.js. The texts are in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;
  var plainText = App.utils.plainText;
  var F = App.trigonometryFigures;
  var Q = App.trigonometryQuestions;
  var ACTIVITY = DATA.activities.trigonometria;
  var QUESTIONS = ACTIVITY.levels[0].questions;

  /* The explanation: the ladders first, then the ramps. */
  var LESSON = [{ visual: 'ladders' }, { visual: 'ramps' }];
  /* Real life: the three examples, in order. */
  var REAL = [{ visual: 'ladder' }, { visual: 'roof' }, { visual: 'cars' }];
  var REAL_STEPS = ['first', 'second', 'third'];

  /* ---- The explanation pictures ---- */

  /* Two ladders of the same length: which one rises more and which one runs further. */
  function laddersHtml() {
    var letters = t('gen.ladderLetters').split('');
    var pair = [DATA.ladders[0], DATA.ladders[1]].map(function (ladder, i) {
      return { ladder: ladder, letter: letters[i] };
    }).sort(function (a, b) { return a.ladder.run - b.ladder.run; });
    var aria = t('gen.twoLaddersAria')
      .replace(/\{a\}/g, pair[0].letter).replace(/\{b\}/g, pair[0].ladder.rise)
      .replace(/\{c\}/g, pair[0].ladder.run).replace(/\{d\}/g, pair[1].letter)
      .replace(/\{e\}/g, pair[1].ladder.rise).replace(/\{f\}/g, pair[1].ladder.run);
    return '<div class="tri-stage" role="img" aria-label="' + aria + '">' + F.laddersSvg(pair.map(function (item) {
      return item.ladder;
    }), { labels: pair.map(function (item) { return item.letter; }) }) + '</div>';
  }

  /* Two ramps: the steeper one rises more for each step it runs. */
  function rampsHtml() {
    var ramps = DATA.steeperExample.map(function (tri, i) {
      return { triangle: tri, letter: i === 0 ? 'A' : 'B' };
    });
    return '<div role="img" aria-label="' + Q.rampPairAria(ramps) + '">' + Q.rampPairHtml(ramps) + '</div>';
  }

  function lessonVisual(spec) {
    return spec === 'ladders' ? laddersHtml() : rampsHtml();
  }

  /* ---- Real life ---- */

  /* Small pictures of everyday places where the rise and run matter. The rails and rungs make the
     ladder recognizable; the house and paired ramps keep each example grounded in a familiar object. */
  function realExamplePicture(id) {
    if (id === 'ladder') {
      return '<svg viewBox="0 0 190 170" class="real-life-svg real-ladder-svg" aria-hidden="true">' +
        '<line x1="34" y1="12" x2="34" y2="151" class="real-wall"/>' +
        '<line x1="18" y1="151" x2="174" y2="151" class="real-ground"/>' +
        '<line x1="36" y1="24" x2="119" y2="151" class="real-ladder-rail"/>' +
        '<line x1="48" y1="24" x2="131" y2="151" class="real-ladder-rail"/>' +
        '<path d="M48 42h12 M58 58h12 M68 74h12 M78 90h12 M88 106h12 M98 122h12 M108 138h12" class="real-ladder-rung"/>' +
        '</svg>';
    }
    if (id === 'roof') {
      return '<svg viewBox="0 0 200 170" class="real-life-svg" aria-hidden="true">' +
        '<path d="M42 71v84h116V71" class="real-house"/>' +
        '<path d="M25 73 100 15l75 58-8 8-67-52-67 52Z" class="real-roof"/>' +
        '<path d="M25 73h75V22" class="real-guide"/>' +
        '<path d="M41 73 A16 16 0 0 0 37.7 63.2" class="real-angle-mark"/>' +
        '<rect x="56" y="94" width="26" height="27" rx="2" class="real-window"/>' +
        '<line x1="69" y1="94" x2="69" y2="121" class="real-detail"/>' +
        '<line x1="56" y1="107" x2="82" y2="107" class="real-detail"/>' +
        '<path d="M118 155v-43a14 14 0 0 1 28 0v43Z" class="real-door"/>' +
        '<circle cx="139" cy="135" r="2" class="real-knob"/></svg>';
    }
    var gentle = t('realExampleLabel.gentle');
    var steep = t('realExampleLabel.steep');
    var car = '<path d="M4 23v-6l5-2 6-9h18l9 9 7 2 3 6v4H4Z" class="real-car-body"/>' +
      '<path d="m18 8-5 7h11V8Zm9 0v7h11l-6-7Z" class="real-car-window"/>' +
      '<circle cx="14" cy="27" r="5" class="real-car-wheel"/>' +
      '<circle cx="41" cy="27" r="5" class="real-car-wheel"/>' +
      '<circle cx="14" cy="27" r="2" class="real-wheel-hub"/>' +
      '<circle cx="41" cy="27" r="2" class="real-wheel-hub"/>';
    return '<svg viewBox="0 0 360 180" class="real-life-svg" aria-hidden="true">' +
      '<line x1="8" y1="137" x2="352" y2="137" class="real-ground"/>' +
      '<path d="M16 137 166 109v28Z" class="real-ramp"/>' +
      '<path d="M197 137 337 62v75Z" class="real-ramp"/>' +
      '<path d="M16 137 166 109 M197 137 337 62" class="real-slope"/>' +
      '<g transform="translate(65 99) rotate(-10.6)">' + car + '</g>' +
      '<g transform="translate(231 83.5) rotate(-28.2)">' + car + '</g>' +
      '<path d="M35 137 A19 19 0 0 0 34.65 133.5 M216 137 A19 19 0 0 0 213.75 128" class="real-angle-mark"/>' +
      '<text x="91" y="164" class="real-label">' + gentle + '</text>' +
      '<text x="267" y="164" class="real-label">' + steep + '</text></svg>';
  }

  function realVisual(id) {
    return realExamplePicture(id);
  }

  /* The three steps of an example, read as one text under the picture. */
  function realText(i) {
    return REAL_STEPS.map(function (part) {
      return t('realExampleSteps.' + REAL[i].visual + '.' + part);
    }).join(' ');
  }

  /* ---- The test ---- */

  /* One question of the test, as the engine asks for it. The explanation after a right answer is the
     answer as written, plus what the question adds. */
  function makeQuestion(type, index) {
    var q = Q.GENERATOR_FOR[type.tipo](type, index);
    var right = q.options.filter(function (o) { return o.correct; })[0];
    var said = plainText(right.html).replace(/\s+/g, ' ').trim();
    return {
      prompt: q.prompt,
      visual: q.visual || '',
      visualAria: q.visualAria,
      legend: q.legend || '',
      hint: q.hint,
      explanation: (said || right.aria || '') + '.' + (q.explanation ? ' ' + q.explanation : ''),
      options: q.options.map(function (o) {
        return { html: o.html, aria: o.aria || plainText(o.html) || '', correct: o.correct };
      })
    };
  }

  App.activityFlow.setup({
    toolId: 'trigonometry',
    test: 'options',
    socratic: true,
    reinforce: true,
    testVisuals: true,
    testVisualClass: 'visual',
    introCard: function () {
      return { title: t('activity.trigonometria.name'), text: t('activity.trigonometria.instruction') };
    },
    intro: LESSON,
    visualHtml: lessonVisual,
    introCopy: function (i) {
      return { title: null, text: t(i === 0 ? 'activity.trigonometria.lessonRule' : 'activity.trigonometria.lessonRampRule') };
    },
    real: REAL,
    realVisualHtml: realVisual,
    realText: realText,
    buildRound: function () { return App.utils.shuffle(QUESTIONS.slice()); },
    makeQuestion: makeQuestion,
    endNotes: [{ key: 'transfer', cls: 'transfer' }]
  });
})();
