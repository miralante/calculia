/* ============================================================
   Calculia — El Calendario
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'calendar';
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
  var fixedQuestion = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

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

  function dayName(id) { return App.i18n.t('day.' + id); }
  function monthName(id) { return App.i18n.t('month.' + id); }
  function seasonName(id) { return App.i18n.t('season.' + id); }

  /* One step around the circle. The week and the year both come back to
     the start, so the step wraps instead of stopping at the end. */
  function step(list, id, dir) {
    var i = list.indexOf(id);
    var n = list.length;
    return list[(i + (dir === 'prev' ? -1 : 1) + n) % n];
  }

  function seasonOf(monthId) {
    for (var i = 0; i < DATA.seasons.length; i++) {
      if (DATA.seasons[i].months.indexOf(monthId) !== -1) return DATA.seasons[i];
    }
    return null;
  }

  /* ---- The calendar strips ----
     The strip is the calendar itself: the answer can be reached by
     looking at it, which is the real-life skill this activity is for.
     `markId` gets an arrow (never colour alone, WCAG 1.4.1) and `gapId`
     is blanked out with a question mark. */
  function strip(kind, list, nameOf, markId, gapId) {
    var html = '<div class="' + kind + '-strip">';
    list.forEach(function (id) {
      var classes = ['cal-cell'];
      if (id === markId) classes.push('is-ref');
      if (id === gapId) classes.push('is-gap');
      /* The blank cell carries no marks: marking it as weekend would hand
         over part of the answer. */
      if (kind === 'week' && id !== gapId && DATA.weekend.indexOf(id) !== -1) {
        classes.push('is-weekend');
      }
      html += '<span class="' + classes.join(' ') + '">' +
        (id === markId ? '<span class="cell-mark" aria-hidden="true">👉</span>' : '') +
        '<span class="cell-name">' +
        (id === gapId ? '?' : nameOf(id)) +
        '</span></span>';
    });
    return html + '</div>';
  }

  /* The strip that holds the answer. `markFirst` singles out one cell, so
     "a week is longer than a day" is something you can see: the day is one
     of the seven boxes. */
  function unitStrip(kind, markFirst) {
    if (kind === 'week') {
      return strip('week', DATA.days, dayName, markFirst ? DATA.days[0] : null, null);
    }
    if (kind === 'year') {
      return strip('year', DATA.months, monthName, markFirst ? DATA.months[0] : null, null);
    }
    var html = '<div class="season-strip">';
    DATA.seasons.forEach(function (s) {
      html += '<span class="cal-cell"><span class="cell-mark" aria-hidden="true">' + s.icon +
        '</span><span class="cell-name">' + seasonName(s.id) + '</span></span>';
    });
    return html + '</div>';
  }

  /* Three counts around the right one. Being out by one is the mistake
     counting a strip actually produces. */
  function countOptions(value) {
    var values = [value, value - 1, value + 1].filter(function (v) { return v > 0; });
    var extra = value + 2;
    while (values.length < 3) { values.push(extra); extra += 1; }
    return App.utils.shuffle(values.slice(0, 3)).map(function (v) {
      return { html: String(v), correct: v === value };
    });
  }

  /* Three options: the right one and two of its own neighbours. Being out
     by one step is the mistake this activity actually produces. */
  function neighbourOptions(list, answerId, nameOf) {
    var i = list.indexOf(answerId);
    var n = list.length;
    var near = [list[(i - 1 + n) % n], list[(i + 1) % n]].filter(function (d) {
      return d !== answerId;
    });
    var wrong = App.utils.shuffle(near).slice(0, 2);
    while (wrong.length < 2) {
      var extra = list[Math.floor(Math.random() * n)];
      if (extra !== answerId && wrong.indexOf(extra) === -1) wrong.push(extra);
    }
    return App.utils.shuffle(
      [{ html: nameOf(answerId), correct: true }].concat(
        wrong.map(function (d) { return { html: nameOf(d), correct: false }; })
      ));
  }

  var GENERATORS = {

    /* Which day comes after / before this one. The whole week stays on
       screen with the day in question marked. */
    daySeq: function (nv) {
      var id = draw(nv.id, DATA.days);
      var answer = step(DATA.days, id, nv.dir);
      return {
        prompt: App.i18n.t(nv.dir === 'prev' ? 'gen.dayBefore' : 'gen.dayAfter')
          .replace(/\{day\}/g, dayName(id)),
        visual: strip('week', DATA.days, dayName, id, null),
        visualAria: App.i18n.t('gen.weekAria').replace(/\{day\}/g, dayName(id)),
        options: neighbourOptions(DATA.days, answer, dayName)
      };
    },

    /* The support is removed: the day is missing from the strip. */
    dayGap: function (nv) {
      var id = draw(nv.id, DATA.days);
      return {
        prompt: App.i18n.t('gen.dayGap'),
        visual: strip('week', DATA.days, dayName, null, id),
        visualAria: App.i18n.t('gen.weekGapAria'),
        options: neighbourOptions(DATA.days, id, dayName)
      };
    },

    monthSeq: function (nv) {
      var id = draw(nv.id, DATA.months);
      var answer = step(DATA.months, id, nv.dir);
      return {
        prompt: App.i18n.t(nv.dir === 'prev' ? 'gen.monthBefore' : 'gen.monthAfter')
          .replace(/\{month\}/g, monthName(id)),
        visual: strip('year', DATA.months, monthName, id, null),
        visualAria: App.i18n.t('gen.yearAria').replace(/\{month\}/g, monthName(id)),
        options: neighbourOptions(DATA.months, answer, monthName)
      };
    },

    monthGap: function (nv) {
      var id = draw(nv.id, DATA.months);
      return {
        prompt: App.i18n.t('gen.monthGap'),
        visual: strip('year', DATA.months, monthName, null, id),
        visualAria: App.i18n.t('gen.yearGapAria'),
        options: neighbourOptions(DATA.months, id, monthName)
      };
    },

    /* Which season a month falls in. Only whole months are asked (see
       DATA.seasons), so there is never a half-right answer. */
    season: function (nv) {
      var s = draw(nv.id, DATA.seasons);
      var month = App.utils.shuffle(s.months)[0];
      var others = App.utils.shuffle(DATA.seasons.filter(function (o) {
        return o.id !== s.id;
      })).slice(0, 2);
      var label = function (o) {
        return '<span class="season-icon" aria-hidden="true">' + o.icon + '</span>' +
          '<span class="season-name">' + seasonName(o.id) + '</span>';
      };
      return {
        prompt: App.i18n.t('gen.seasonOf').replace(/\{month\}/g, monthName(month)),
        visual: '<div class="month-card"><span class="month-big">' +
          monthName(month) + '</span></div>',
        visualAria: monthName(month),
        options: App.utils.shuffle(
          [{ html: label(s), aria: seasonName(s.id), correct: true }].concat(
            others.map(function (o) {
              return { html: label(o), aria: seasonName(o.id), correct: false };
            })
          )),
        inline: true
      };
    },

    /* How many of one thing fit in the other. The answer is counted on
       the strip, so nothing has to be remembered. */
    howManyIn: function (nv) {
      var unit = draw(nv.id, DATA.units);
      return {
        prompt: App.i18n.t('gen.howManyIn.' + unit.id),
        visual: unitStrip(unit.kind),
        visualAria: App.i18n.t('gen.unitAria')
          .replace(/\{n\}/g, unit.n)
          .replace(/\{what\}/g, App.i18n.t('gen.unitName.' + unit.id)),
        legend: App.i18n.t('gen.countThem'),
        options: countOptions(unit.n)
      };
    },

    /* Which of the two lasts longer. Only pairs where one really contains
       the other, with the smaller one marked inside the bigger. */
    longerUnit: function (nv) {
      var pair = draw(nv.id, DATA.unitPairs);
      var askLonger = draw(nv.id + 'dir', [true, false]);
      var answer = askLonger ? pair.big : pair.small;
      return {
        prompt: App.i18n.t(askLonger ? 'gen.whichLonger' : 'gen.whichShorter')
          .replace(/\{a\}/g, App.i18n.t('unit.' + pair.small))
          .replace(/\{b\}/g, App.i18n.t('unit.' + pair.big)),
        visual: unitStrip(pair.kind, true),
        visualAria: App.i18n.t('gen.pairAria')
          .replace(/\{small\}/g, App.i18n.t('unit.' + pair.small))
          .replace(/\{big\}/g, App.i18n.t('unit.' + pair.big)),
        legend: App.i18n.t('gen.containsHint'),
        options: App.utils.shuffle([pair.small, pair.big].map(function (u) {
          return {
            html: '<span class="unit-name">' + App.i18n.t('unit.' + u) + '</span>',
            aria: App.i18n.t('unit.' + u),
            correct: u === answer
          };
        })),
        inline: true
      };
    },

    /* The other way round: a season is named, and one of the months
       belongs to it. */
    seasonMonth: function (nv) {
      var s = draw(nv.id, DATA.seasons);
      var answer = App.utils.shuffle(s.months)[0];
      var wrong = App.utils.shuffle(DATA.seasons.filter(function (o) {
        return o.id !== s.id;
      })).slice(0, 2).map(function (o) { return App.utils.shuffle(o.months)[0]; });
      return {
        prompt: App.i18n.t('gen.monthOfSeason').replace(/\{season\}/g, seasonName(s.id)),
        visual: '<div class="month-card"><span class="season-big" aria-hidden="true">' +
          s.icon + '</span><span class="season-name">' + seasonName(s.id) + '</span></div>',
        visualAria: seasonName(s.id),
        options: App.utils.shuffle(
          [{ html: monthName(answer), correct: true }].concat(
            wrong.map(function (m) {
              return { html: monthName(m), correct: false };
            })
          ))
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
    fixedQuestion = null;
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

  function render() { paintQuestion(fixedQuestion); }

  /* Visible text of an option (its html may wrap spans). */
  function plainText(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
  }

  function showExplanation(isCorrect) {
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
