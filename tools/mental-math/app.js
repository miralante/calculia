/* ============================================================
   Calculia — Restar y Cálculo Mental
   The flow of the activity, built by assets/js/activity-flow.js. The menu has
   six entries, each one a test of its own:
     • anchors, restar and cabeza: no slides; each has levels that rise with the
       rounds completed in it (see model.js for the questions);
     • "Contar en grupos" in three entries (learn, use and all). Each one shows
       its own slides (the carousel of the groups, the real-life examples and
       the reminder). Learn and use are chains of steps; all is one round of
       random questions (see groups.js).
   The drawings and the questions are in model.js and groups.js; the data is in
   data.js and the texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;
  var fill = App.utils.fill;
  var plainText = App.utils.plainText;
  var M = App.mentalMathModel;
  var G = App.mentalMathGroups;

  /* ---- The menu ---- */

  /* The flat activities: a menu entry with its levels, and no slides of its own. */
  var FLAT_ORDER = ['anchors', 'restar', 'cabeza'];

  function flatEntry(id) {
    var a = DATA.activities[id];
    return {
      id: id,
      picto: a.picto,
      levels: a.levels,
      name: function () { return t('activity.' + id + '.name'); },
      detail: function () { return t('activity.' + id + '.detail'); }
    };
  }

  /* ---- "Contar en grupos": the slides, the examples, the reminder ---- */

  /* The carousel: the group's name, its colour, how many it holds, and its caption. */
  function carouselHtml(id) {
    var g = groupById(id);
    var name = t('group.' + id + 'Name');
    var value = M.groupsFormat(g.size);
    return '<div class="carousel-display" role="img" aria-label="' + name + ': ' + value + '">' +
      '<span class="carousel-name ' + g.cls + '">' + name + '</span>' +
      '<span class="carousel-value">' + value + '</span></div>' +
      '<p class="carousel-caption">' + t('group.' + id + 'Caption') + '</p>';
  }

  /* A real-life situation: the group, its count, and the sentence that goes with it. */
  function famousHtml(item) {
    var g = groupById(item.group);
    var name = t('group.' + item.group + 'Name');
    var value = M.groupsFormat(g.size);
    return '<div class="famoso-ejemplo" role="img" aria-label="' + name + ': ' + value + '">' +
      '<span class="famoso-group ' + g.cls + '">' + name + '</span>' +
      '<span class="famoso-value"><span class="famoso-equals">=</span>' +
      '<span class="famoso-number">' + value + '</span></span></div>' +
      '<p class="famous-text">' + t('famous.' + item.factKey) + '</p>';
  }

  /* The worked example: "3 decenas = 3 × 10 = 30". The count, the multiplier and the total keep
     the group's colour, so the eye can pair "decenas" with the number that multiplies. */
  function exampleFormula(example) {
    var g = groupById(example.group);
    var total = example.count * g.size;
    return '<span class="ex-phrase ' + g.cls + '">' + groupPhrase(example.count, example.group).text + '</span>' +
      '<span class="ex-op"> = </span>' +
      '<span class="ex-count ' + g.cls + '">' + example.count + '</span>' +
      '<span class="ex-op"> × </span>' +
      '<span class="ex-size ' + g.cls + '">' + M.groupsFormat(g.size) + '</span>' +
      '<span class="ex-op"> = </span>' +
      '<span class="ex-total">' + M.groupsFormat(total) + '</span>';
  }

  /* The reminder: the colour table with the value of each group, then the two rules with their examples. */
  function reminderHtml() {
    var row = GROUPS_DATA.carousel.map(function (id) {
      var g = groupById(id);
      return '<div class="group-chip"><span class="group-chip-name ' + g.cls + '">' + t('group.' + id + 'Name') +
        '</span><span class="group-chip-size">' + M.groupsFormat(g.size) + '</span></div>';
    }).join('');
    var multiply = M.RULE_EXAMPLES.map(function (ex) {
      return '<div class="rule-example">' + exampleFormula(ex) + '</div>';
    }).join('');
    var dozen = M.DOZEN_EXAMPLES.map(function (ex) {
      return '<div class="rule-example">' + exampleFormula(ex) + '</div>';
    }).join('');
    return '<p class="reference-text">' + t('groupsReminderText') + '</p>' +
      '<div class="groups-row">' + row + '</div>' +
      '<p class="rule-title">' + t('ruleMultiplyTitle') + '</p>' + multiply +
      '<p class="rule-title">' + t('ruleDozenTitle') + '</p>' + dozen;
  }

  var GROUP_SLIDES = GROUPS_DATA.carousel.map(function (id) { return { visual: id }; });
  var GROUP_REAL = GROUPS_DATA.famous.map(function (item) { return { visual: item }; });

  /* The three groups of the walkthrough (learn, use and all), each one a menu entry with its own
     slides. A group of steps is a chain: each sub-level is a step, and the steps carry the slides
     too, so the activity can show them from the menu entry. The test is one round of random questions. */
  function groupEntry(level) {
    var entry = {
      id: 'groups-' + level.id,
      picto: level.icon,
      name: function () { return t('level.' + level.id + 'Name'); },
      detail: function () { return t('level.' + level.id + 'Detail'); },
      intro: GROUP_SLIDES,
      real: GROUP_REAL
    };
    if (level.sublevels) {
      entry.steps = level.sublevels.map(function (sub) {
        return Object.assign({}, sub, {
          picto: entry.picto,
          name: entry.name,
          detail: entry.detail,
          intro: GROUP_SLIDES,
          real: GROUP_REAL
        });
      });
    } else {
      entry.pool = level.pool;
      entry.mode = level.mode;
      entry.stars = level.stars;
    }
    return entry;
  }

  var MENU = FLAT_ORDER.map(flatEntry).concat(GROUPS_DATA.levels.map(groupEntry));

  /* ---- Questions ---- */

  /* A question of a flat activity: one of its generators, with the answer as text. */
  function flatQuestion(level, index) {
    var q = M.GENERATORS[level.tipo](level, index);
    var correct = q.options.filter(function (o) { return o.correct; })[0];
    return {
      prompt: q.prompt,
      visual: q.visual,
      legend: plainText(q.legend || ''),
      hint: q.hint,
      explanation: fill(t('answerIs'), { answer: plainText(correct.html) }),
      options: q.options.map(function (o) {
        return { html: o.html, aria: plainText(o.html), correct: o.correct };
      })
    };
  }

  /* A question of a group step: the number or the group, the context line, the options and the hint. */
  function groupQuestion(entry) {
    var r = G.roundFor(entry);
    return {
      prompt: r.question,
      visual: '<div class="quiz-shown' + (r.isPhrase ? ' quiz-shown--phrase' : '') + '" role="img" aria-label="' +
        r.plainShown + '">' + r.shown + '</div>',
      legend: r.context,
      hint: r.hint,
      explanation: fill(t('answerIs'), { answer: plainText(String(r.correctValue)) }),
      options: r.values.map(function (v) {
        var text = String(v);
        /* A phrase ("4 decenas") is smaller than a figure, so it fits three columns at 375px. */
        var word = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(text);
        return {
          html: word ? '<span class="option-word">' + text + '</span>' : text,
          aria: text,
          correct: v === r.correctValue
        };
      })
    };
  }

  /* The round: the questions of a flat level (all of it at that level), or the entries of a group step. */
  function buildRound(def, level) {
    if (level) {
      var same = [];
      for (var i = 0; i < DATA.perRound; i++) same.push(level);
      return same;
    }
    return G.items(def);
  }

  function makeQuestion(type, index) {
    return type.tipo ? flatQuestion(type, index) : groupQuestion(type);
  }

  App.activityFlow.setup({
    toolId: 'mental-math',
    test: 'options',
    socratic: true,
    reinforce: true,
    review: 'none',
    testVisuals: true,
    testVisualClass: 'visual',
    introCard: function () { return { title: t('groupsIntroTitle'), text: t('groupsIntroText') }; },
    intro: GROUP_SLIDES,
    visualHtml: carouselHtml,
    introCopy: function () { return { title: null, text: null }; },
    real: GROUP_REAL,
    realVisualHtml: famousHtml,
    realText: function () { return ''; },
    reminder: {
      title: function () { return t('groupsReminderTitle'); },
      html: reminderHtml,
      next: function () { return t('groupsStart'); }
    },
    activities: MENU,
    buildRound: buildRound,
    makeQuestion: makeQuestion,
    endNotes: [{ key: 'transfer', cls: 'transfer' }]
  });
})();
