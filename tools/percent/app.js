/* ============================================================
   Calculia — Porcentajes y proporción
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'percent';
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

  /* ---- Nothing that can be worked out is stored ----
     The percentage, the discount, the doubled recipe and the real-world
     measurement are all computed here from the numbers in data.js, and the
     picture is built from the same ones. */
  function partOf(price, percent) { return (price * percent) / 100; }
  function howMany(budget, price) { return Math.floor(budget / price); }
  function leftOver(budget, price) { return budget - howMany(budget, price) * price; }
  /* The same job, shared between more people: the total work does not
     change, so the hours come out of it. */
  function hoursFor(job, people) { return (job.from * job.hours) / people; }

  /* ---- Data invariants, loud at start-up ---- */
  DATA.prices.forEach(function (p) {
    /* A discount with cents in it would be a different topic, and the
       coins could not be drawn one by one. */
    if (partOf(p.price, p.percent) % 1 !== 0) {
      throw new Error('percent: ' + p.percent + '% of ' + p.price + ' is not whole');
    }
  });
  Object.keys(DATA.percents).forEach(function (step) {
    DATA.percents[step].forEach(function (v) {
      if (v <= 0 || v >= 100) {
        throw new Error('percent: ' + v + '% cannot be read off a grid');
      }
      if (v % Number(step) !== 0) {
        throw new Error('percent: ' + v + ' does not fit steps of ' + step);
      }
    });
  });
  DATA.budgets.forEach(function (b) {
    /* Without something left over there is nothing to ask in 'what is
       left', and the point of the level disappears. */
    if (leftOver(b.budget, b.price) === 0) {
      throw new Error('percent: ' + b.id + ' leaves nothing over');
    }
    /* Fewer than two means there is no "keep taking the price off". */
    if (howMany(b.budget, b.price) < 2) {
      throw new Error('percent: ' + b.id + ' only buys one');
    }
  });
  DATA.jobs.forEach(function (j) {
    if (hoursFor(j, j.to) % 1 !== 0) {
      throw new Error('percent: ' + j.id + ' does not come out in whole hours');
    }
    /* Same number of people and the question answers itself. */
    if (j.to === j.from) {
      throw new Error('percent: ' + j.id + ' does not change the people');
    }
    if (hoursFor(j, j.to) < 1) {
      throw new Error('percent: ' + j.id + ' comes out under an hour');
    }
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

  /* Options from candidates, kept distinct and never negative. */
  function pickOptions(correct, candidates, suffix) {
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.forEach(function (v) {
      if (v > 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    var extra = correct + 1;
    while (list.length < 3) {
      if (!seen[extra]) { seen[extra] = true; list.push(extra); }
      extra += 1;
    }
    return App.utils.shuffle(list).map(function (v) {
      return { html: v + (suffix || ''), aria: v + (suffix || ''), correct: v === correct };
    });
  }

  /* ---- The pictures ----
     A percentage is drawn on a hundred squares, because "per cent" means
     "out of a hundred": with the grid in front of you the answer is
     counted, not recalled. */
  function hundredGrid(filled) {
    var html = '<div class="hundred">';
    for (var i = 0; i < 100; i++) {
      html += '<span class="cell' + (i < filled ? ' is-filled' : '') + '"></span>';
    }
    return html + '</div>';
  }

  /* Coins, so a price and the part of it can both be counted. */
  function coins(total, part) {
    var html = '<div class="coin-row">';
    for (var i = 0; i < total; i++) {
      html += '<span class="coin' + (i < part ? ' is-part' : '') + '">€</span>';
    }
    return html + '</div>';
  }

  /* A recipe drawn as repeated servings: "for every 2, one". */
  function servings(recipe, times) {
    var html = '<div class="servings">';
    for (var s = 0; s < times; s++) {
      html += '<span class="serving">';
      for (var i = 0; i < recipe.a; i++) {
        html += '<span class="ing tone-1">' + recipe.pictoA + '</span>';
      }
      html += '<span class="ing-sep" aria-hidden="true">+</span>';
      for (var j = 0; j < recipe.b; j++) {
        html += '<span class="ing tone-2">' + recipe.pictoB + '</span>';
      }
      html += '</span>';
    }
    return html + '</div>';
  }

  /* What there is, and what one costs. The coins are NOT drawn already
     grouped: grouping them is the work. The price is shown as its own
     little pile, so "take the price off again" is something you can see
     yourself doing. */
  function budgetStage(b) {
    var html = '<div class="limit-stage">' + coins(b.budget, 0) +
      '<p class="price-tag"><span class="tag-picto" aria-hidden="true">' +
      b.picto + '</span>';
    for (var i = 0; i < b.price; i++) html += '<span class="coin is-price">€</span>';
    return html + '</p></div>';
  }

  /* The same job in rows: one row per person, one block per hour. The
     blocks are the work, and there are always the same number of them —
     which is why more rows means shorter rows. */
  function workRows(people, hoursEach, picto) {
    var html = '<div class="work-stage">';
    for (var p = 0; p < people; p++) {
      html += '<span class="work-row"><span class="worker" aria-hidden="true">🙂</span>';
      for (var h = 0; h < hoursEach; h++) {
        html += '<span class="hour-block" aria-hidden="true">' + picto + '</span>';
      }
      html += '</span>';
    }
    return html + '</div>';
  }

  /* A plan where every square is worth something real. */
  function plan(squares, unit) {
    var html = '<div class="plan"><div class="plan-row">';
    for (var i = 0; i < squares; i++) html += '<span class="plan-cell"></span>';
    return html + '</div><p class="plan-key">' +
      App.i18n.t('gen.scaleKey').replace(/\{unit\}/g, unit) + '</p></div>';
  }

  var GENERATORS = {

    /* How much of the hundred is coloured in. */
    readPercent: function (nv) {
      var value = draw(nv.id, DATA.percents[nv.step]);
      return {
        prompt: App.i18n.t('gen.whatPercent'),
        visual: hundredGrid(value),
        visualAria: App.i18n.t('gen.gridAria').replace(/\{n\}/g, value),
        legend: App.i18n.t('gen.percentHint'),
        options: pickOptions(value, [value + nv.step, value - nv.step, 100 - value], '%')
      };
    },

    /* The other way round: which grid shows this percentage. */
    pickPercent: function (nv) {
      var value = draw(nv.id, DATA.percents[nv.step]);
      var others = App.utils.shuffle(DATA.percents[nv.step].filter(function (v) {
        return v !== value;
      })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.whichGrid').replace(/\{n\}/g, value),
        legend: App.i18n.t('gen.percentHint'),
        options: App.utils.shuffle([value].concat(others).map(function (v) {
          return {
            html: hundredGrid(v),
            aria: App.i18n.t('gen.gridAria').replace(/\{n\}/g, v),
            correct: v === value
          };
        })),
        inline: true
      };
    },

    /* The percentage applied to money: how much it is, what is left after
       a discount, and what it comes to after a rise. */
    percentOf: function (nv) {
      var item = draw(nv.id, DATA.prices);
      var part = partOf(item.price, item.percent);
      var answer = nv.dir === 'part' ? part
        : (nv.dir === 'less' ? item.price - part : item.price + part);
      var promptKey = nv.dir === 'part' ? 'gen.howMuchPart'
        : (nv.dir === 'less' ? 'gen.afterDiscount' : 'gen.afterRise');
      return {
        prompt: App.i18n.t(promptKey)
          .replace(/\{price\}/g, item.price).replace(/\{percent\}/g, item.percent),
        visual: coins(nv.dir === 'more' ? item.price + part : item.price, part),
        visualAria: App.i18n.t('gen.coinsAria')
          .replace(/\{total\}/g, item.price).replace(/\{part\}/g, part),
        legend: App.i18n.t('gen.moneyHint'),
        /* Answering with the part when the whole price was asked, or the
           other way round, is the real mistake here. */
        options: pickOptions(answer, [part, item.price, item.price - part, answer + 1],
          App.i18n.t('gen.euro'))
      };
    },

    /* For every so much, so much. Doubling the recipe doubles both. */
    ratio: function (nv) {
      var recipe = draw(nv.id, DATA.recipes);
      var answer = recipe.b * nv.times;
      return {
        prompt: App.i18n.t('gen.ratioPrompt')
          .replace(/\{a\}/g, recipe.a).replace(/\{b\}/g, recipe.b)
          .replace(/\{first\}/g, App.i18n.t('ingredient.' + recipe.id + '.a'))
          .replace(/\{second\}/g, App.i18n.t('ingredient.' + recipe.id + '.b'))
          .replace(/\{many\}/g, recipe.a * nv.times),
        visual: servings(recipe, nv.times),
        visualAria: App.i18n.t('gen.servingsAria')
          .replace(/\{times\}/g, nv.times)
          .replace(/\{a\}/g, recipe.a).replace(/\{b\}/g, recipe.b),
        legend: App.i18n.t('gen.ratioHint'),
        /* Forgetting to grow the second thing too is the mistake. */
        options: pickOptions(answer, [recipe.b, answer + 1, answer - 1])
      };
    },

    /* Not every pair grows together: share the same job between more
       people and each one is at it for less time. */
    inverse: function (nv) {
      var job = draw(nv.id, DATA.jobs);
      var answer = hoursFor(job, job.to);
      return {
        prompt: App.i18n.t('gen.inversePrompt')
          .replace(/\{from\}/g, job.from).replace(/\{hours\}/g, job.hours)
          .replace(/\{to\}/g, job.to)
          .replace(/\{job\}/g, App.i18n.t('job.' + job.id)),
        visual: workRows(job.from, job.hours, job.picto),
        visualAria: App.i18n.t('gen.workAria')
          .replace(/\{people\}/g, job.from).replace(/\{hours\}/g, job.hours),
        legend: App.i18n.t('gen.inverseHint').replace(/\{to\}/g, job.to),
        /* Answering with the same hours as before is the whole mistake
           this level exists for; the total work is the other one. */
        options: pickOptions(answer, [job.hours, job.from * job.hours, answer + 1])
      };
    },

    /* You have this much, one costs that much: how many fit inside. */
    howManyFit: function (nv) {
      var b = draw(nv.id, DATA.budgets);
      var answer = howMany(b.budget, b.price);
      return {
        prompt: App.i18n.t('gen.howManyFit')
          .replace(/\{budget\}/g, b.budget).replace(/\{price\}/g, b.price)
          .replace(/\{thing\}/g, App.i18n.t('item.' + b.id)),
        visual: budgetStage(b),
        visualAria: App.i18n.t('gen.budgetAria')
          .replace(/\{budget\}/g, b.budget).replace(/\{price\}/g, b.price),
        legend: App.i18n.t('gen.fitHint'),
        /* Counting the leftover as one more is the mistake here. */
        options: pickOptions(answer, [answer + 1, b.price, answer - 1])
      };
    },

    /* And what the limit leaves over, which is never enough for one more. */
    whatIsLeft: function (nv) {
      var b = draw(nv.id, DATA.budgets);
      var answer = leftOver(b.budget, b.price);
      return {
        prompt: App.i18n.t('gen.whatIsLeft')
          .replace(/\{budget\}/g, b.budget).replace(/\{price\}/g, b.price)
          .replace(/\{thing\}/g, App.i18n.t('item.' + b.id)),
        visual: budgetStage(b),
        visualAria: App.i18n.t('gen.budgetAria')
          .replace(/\{budget\}/g, b.budget).replace(/\{price\}/g, b.price),
        legend: App.i18n.t('gen.leftHint'),
        /* Giving the number bought, or the price, instead of what is
           left is what actually happens. */
        options: pickOptions(answer, [howMany(b.budget, b.price), b.price, answer + 1],
          App.i18n.t('gen.euro'))
      };
    },

    /* On a plan, every square is worth something real. */
    scale: function (nv) {
      var s = draw(nv.id, DATA.scales);
      var answer = s.unit * s.squares;
      return {
        prompt: App.i18n.t('gen.scalePrompt').replace(/\{n\}/g, s.squares),
        visual: plan(s.squares, s.unit),
        visualAria: App.i18n.t('gen.planAria')
          .replace(/\{n\}/g, s.squares).replace(/\{unit\}/g, s.unit),
        legend: App.i18n.t('gen.scaleHint'),
        /* Adding the two numbers instead of multiplying is the mistake a
           plan actually produces. */
        options: pickOptions(answer, [s.squares + s.unit, answer + s.unit, answer - s.unit],
          App.i18n.t('gen.metre'))
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
