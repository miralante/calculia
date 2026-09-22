/* ============================================================
   Calculia — Sitios y tamaños
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'places';
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

  /* ---- Data invariants ----
     Every comparison pair needs a bigger and a smaller side, and every
     relation needs exactly two opposite words. A bad data row must be
     loud here rather than produce a question with no right answer. */
  Object.keys(DATA.relations).forEach(function (key) {
    if (DATA.relations[key].ids.length !== 2) {
      throw new Error('places: relation "' + key + '" is not a pair');
    }
  });
  Object.keys(DATA.pairs).forEach(function (dim) {
    DATA.pairs[dim].forEach(function (p) {
      if (!p.more || !p.less || p.more.id === p.less.id) {
        throw new Error('places: pair in "' + dim + '" has no bigger and smaller side');
      }
    });
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

  function posName(id) { return App.i18n.t('pos.' + id); }
  function posPhrase(id) { return App.i18n.t('phrase.' + id); }
  function thingName(id) { return App.i18n.t('thing.' + id); }
  function objectName(id) { return App.i18n.t('object.' + id); }
  function dimWord(dim, side) { return App.i18n.t('dim.' + dim + '.' + side); }

  /* ---- The scenes ----
     The position is drawn, never described: the object is really inside
     the box or really beside it, so the answer is in the picture. */
  function token(obj) {
    return '<span class="place-token">' + obj.picto + '</span>';
  }

  function scene(relationKey, obj, posId, size) {
    var rel = DATA.relations[relationKey];
    var cls = 'scene scene-' + rel.shape + (size === 'small' ? ' is-small' : '');
    var anchor = '<span class="anchor" aria-hidden="true">' + rel.anchor + '</span>';

    if (rel.shape === 'box') {
      /* The box is a real drawn container, so "inside" and "outside" are
         a fact about the picture and not a convention to remember. */
      return '<div class="' + cls + '">' +
        '<div class="box-frame">' + (posId === 'inside' ? token(obj) : '') + anchor + '</div>' +
        (posId === 'outside' ? token(obj) : '') +
        '</div>';
    }
    if (rel.shape === 'line') {
      /* A seat with a line for the floor: above it or below it. */
      return '<div class="' + cls + '">' +
        '<div class="line-slot">' + (posId === 'above' ? token(obj) : '') + '</div>' +
        '<div class="surface-line">' + anchor + '</div>' +
        '<div class="line-slot">' + (posId === 'below' ? token(obj) : '') + '</div>' +
        '</div>';
    }
    return '<div class="' + cls + '">' +
      '<div class="side-slot">' + (posId === 'left' ? token(obj) : '') + '</div>' +
      anchor +
      '<div class="side-slot">' + (posId === 'right' ? token(obj) : '') + '</div>' +
      '</div>';
  }

  function sceneAria(obj, posId) {
    return App.i18n.t('gen.sceneAria')
      .replace(/\{thing\}/g, objectName(obj.id))
      .replace(/\{phrase\}/g, posPhrase(posId));
  }

  /* Two things side by side, both the same size on screen: the answer
     comes from knowing what the things are, not from how big they are
     drawn. Drawing one bigger would give the answer away for free. */
  function comparePair(first, second) {
    return '<div class="compare-stage">' +
      '<span class="compare-thing">' + first.picto + '</span>' +
      '<span class="compare-thing">' + second.picto + '</span>' +
      '</div>';
  }

  var GENERATORS = {

    /* Where is it? Two opposite words, and the picture settles it. */
    whereIs: function (nv) {
      var rel = DATA.relations[nv.relation];
      var obj = draw(nv.id + 'obj', DATA.objects);
      var posId = draw(nv.id + 'pos', rel.ids);
      return {
        prompt: App.i18n.t('gen.where.' + nv.relation)
          .replace(/\{thing\}/g, objectName(obj.id)),
        visual: scene(nv.relation, obj, posId, null),
        visualAria: sceneAria(obj, posId),
        options: App.utils.shuffle(rel.ids.map(function (id) {
          return {
            html: '<span class="pos-name">' + posName(id) + '</span>',
            aria: posName(id),
            correct: id === posId
          };
        })),
        inline: true
      };
    },

    /* The other way round: the word is given and the picture has to be
       found. Same knowledge, read in the opposite direction. */
    findWhere: function (nv) {
      var relationKey = draw(nv.id + 'rel', Object.keys(DATA.relations));
      var rel = DATA.relations[relationKey];
      var obj = draw(nv.id + 'obj', DATA.objects);
      var posId = draw(nv.id + 'pos' + relationKey, rel.ids);
      var other = rel.ids.filter(function (id) { return id !== posId; })[0];
      return {
        prompt: App.i18n.t('gen.findWhere')
          .replace(/\{thing\}/g, objectName(obj.id))
          .replace(/\{phrase\}/g, posPhrase(posId)),
        options: App.utils.shuffle([
          { html: scene(relationKey, obj, posId, 'small'),
            aria: posPhrase(posId), correct: true },
          { html: scene(relationKey, obj, other, 'small'),
            aria: posPhrase(other), correct: false }
        ]),
        inline: true
      };
    },

    /* Which one is bigger — or smaller. Both words of the pair come up
       inside the same level, alternating by question: they are the two
       sides of one idea, and only asking "more" would leave "shorter",
       "lighter" and "holds less" untaught. */
    compare: function (nv, idx) {
      var pair = draw(nv.id, DATA.pairs[nv.dim]);
      var side = (idx || 0) % 2 === 0 ? 'more' : 'less';
      var shown = App.utils.shuffle([pair.more, pair.less]);
      return {
        prompt: App.i18n.t('gen.whichIs').replace(/\{word\}/g, dimWord(nv.dim, side)),
        visual: comparePair(shown[0], shown[1]),
        visualAria: App.i18n.t('gen.compareAria')
          .replace(/\{a\}/g, thingName(shown[0].id))
          .replace(/\{b\}/g, thingName(shown[1].id)),
        options: shown.map(function (thing) {
          return {
            html: '<span class="opt-picto" aria-hidden="true">' + thing.picto + '</span>' +
              '<span class="opt-name">' + thingName(thing.id) + '</span>',
            aria: thingName(thing.id),
            correct: thing.id === pair[side].id
          };
        }),
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
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    /* A picture option has no words of its own, so the explanation uses
       its aria text: saying nothing would be worse than saying it twice. */
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
      if (attempts === 1) showHint();
      else showExplanation(false);
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap);
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
