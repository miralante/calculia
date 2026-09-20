/* ============================================================
   Calculia — Patterns (reasoning)
   Data in data.js (DATA.levels). Shared modules in assets/js/.
   Mechanic: a series is shown with a blank and 3 options.
   Round of 8 series per level. Errors are never punished.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'patterns';
  var PER_ROUND = 8;
  var $ = App.utils.$;

  /* Spoken names of the symbols, for the audio button (per language) */
  var NOMBRES = {
    es: {
      '🔵': 'círculo azul', '🔴': 'círculo rojo', '🟢': 'círculo verde',
      '🟡': 'círculo amarillo', '🟣': 'círculo morado', '🟠': 'círculo naranja',
      '⭐': 'estrella', '🌙': 'luna', '☀️': 'sol', '☁️': 'nube',
      '🍎': 'manzana', '🍌': 'plátano', '🍇': 'uvas', '🍉': 'sandía',
      '🐱': 'gato', '🐶': 'perro', '🐰': 'conejo',
      '🔺': 'triángulo hacia arriba', '🔻': 'triángulo hacia abajo', '🔶': 'rombo',
      '🐟': 'pez', '🦋': 'mariposa', '🐝': 'abeja',
      '🌸': 'flor', '🍀': 'trébol', '🌵': 'cactus',
      '⚪': 'círculo pequeño', '🔘': 'círculo mediano', '⚫': 'círculo grande',
      '🎈': 'globo', '🧦': 'calcetín', '🎲': 'dado', '🐢': 'tortuga', '🦴': 'hueso', '🥕': 'zanahoria'
    },
    en: {
      '🔵': 'blue circle', '🔴': 'red circle', '🟢': 'green circle',
      '🟡': 'yellow circle', '🟣': 'purple circle', '🟠': 'orange circle',
      '⭐': 'star', '🌙': 'moon', '☀️': 'sun', '☁️': 'cloud',
      '🍎': 'apple', '🍌': 'banana', '🍇': 'grapes', '🍉': 'watermelon',
      '🐱': 'cat', '🐶': 'dog', '🐰': 'rabbit',
      '🔺': 'triangle pointing up', '🔻': 'triangle pointing down', '🔶': 'diamond',
      '🐟': 'fish', '🦋': 'butterfly', '🐝': 'bee',
      '🌸': 'flower', '🍀': 'clover', '🌵': 'cactus',
      '⚪': 'small circle', '🔘': 'medium circle', '⚫': 'large circle',
      '🎈': 'balloon', '🧦': 'sock', '🎲': 'dice', '🐢': 'turtle', '🦴': 'bone', '🥕': 'carrot'
    }
  };

  var screenStart = $('#screenStart');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var seriesEl = $('#series');
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
  var level = null;
  var items = [];
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var resolved = false;
  /* Refuerzo: ver core en assets/js/feedback.js (App.reinforce).
     currentItem permite reutilizar render() con un item externo
     (el del refuerzo); si es null, render() toma items[idx]. */
  var currentItem = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  var reinforceTotal = 0;

  function save() { App.storage.set(TOOL_ID, progress); }

  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  function readableText(symbol) {
    var loc = App.i18n.locale();
    var names = NOMBRES[loc] || NOMBRES.es;
    return names[symbol] || symbol;
  }

  function seriesText(pattern) {
    return pattern.map(function (s) {
      return s === '❓' ? App.i18n.t('queSigueAudio') : readableText(s);
    }).join(', ');
  }

  /* ---- Initial screen ---- */
  /* Determina el nivel según el progress: cada ronda completada, sube un nivel. */
  function levelFromProgress() {
    var data = DATA[App.i18n.locale()] || DATA.es;
    var idxN = Math.min(progress.completedRounds || 0, data.levels.length - 1);
    return data.levels[idxN];
  }

  function startRound(n) {
    level = n;
    items = App.utils.shuffle(level.series).slice(0, PER_ROUND);
    index = 0;
    roundCorrect = 0;
    inReinforce = false;
    currentItem = null;
    reinforceList = [];
    reinforceIndex = 0;
    App.reinforce.banner.hide();
    App.reinforce.start(function (failures) { startReinforce(failures); });
    screenStart.classList.add('hidden');
    screenEnd.classList.add('hidden');
    screenGame.classList.remove('hidden');
    render();
  }

  function startReinforce(failures) {
    reinforceList = failures.map(function (f) { return f.payload; });
    reinforceTotal = reinforceList.length;
    reinforceIndex = 0;
    inReinforce = true;
    App.reinforce.banner.set(
      App.i18n.t('refuerzoTitulo') + ' — ' +
      App.i18n.t('refuerzoIntro').replace('{n}', reinforceTotal)
    );
    currentItem = reinforceList[0];
    paintReinforceProgress();
    render();
  }

  function paintReinforceProgress() {
    progressFill.style.width = (((reinforceIndex + 1) / reinforceTotal) * 100) + '%';
    progressText.textContent = '';
  }

  function paintProgress() {
    progressFill.style.width = ((index / PER_ROUND) * 100) + '%';
    progressText.textContent = '';
  }

  function render() {
    var item = currentItem || items[index];
    currentItem = null;
    resolved = false;
    attempts = 0;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');
    optionsEl.innerHTML = '';

    seriesEl.innerHTML = '';
    item.pattern.forEach(function (symbol) {
      var span = document.createElement('span');
      span.className = 'symbol' + (symbol === '❓' ? ' empty' : '');
      span.textContent = symbol;
      seriesEl.appendChild(span);
    });

    var options = App.utils.shuffle(item.options.map(function (opt, i) {
      return { text: opt, isCorrect: i === item.correct };
    }));

    options.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn option-symbol';
      btn.textContent = op.text;
      btn.addEventListener('click', function () {
        answer(btn, op.isCorrect, item);
      });
      optionsEl.appendChild(btn);
    });

    paintProgress();
    paintStars();
  }

  function showExplanation(isCorrect, item) {
    var answer = readableText(item.options[item.correct]);
    var text = isCorrect
      ? App.i18n.t('explicacionCorrecta') + answer + '.'
      : App.i18n.t('explicacionIncorrectaA') + answer + '.';
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look at the sequence again. Only on
     the second mistake is the correct answer explained
     (showExplanation). */
  function showHint() {
    explanationEl.textContent = App.i18n.t('pista');
    explanationWrap.classList.remove('hidden');
  }

  function answer(btn, isCorrect, item) {
    if (resolved) return;
    if (isCorrect) {
      showExplanation(isCorrect, item);
      resolved = true;
      btn.classList.add('correct');
      App.utils.$$('#options .option-btn').forEach(function (b) {
        b.disabled = true;
      });
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      attempts += 1;
      if (attempts === 1) App.reinforce.add(level.id + ':' + index, item);
      if (attempts === 1) {
        showHint();
      } else {
        showExplanation(isCorrect, item);
      }
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap);
    }
  }

  function goNext() {
    if (inReinforce) {
      reinforceIndex += 1;
      if (reinforceIndex >= reinforceTotal) {
        inReinforce = false;
        App.reinforce.clear();
        App.reinforce.banner.hide();
        endRound();
        return;
      }
      currentItem = reinforceList[reinforceIndex];
      paintReinforceProgress();
      render();
      return;
    }
    index += 1;
    if (index >= PER_ROUND) {
      var consume = App.reinforce.consume();
      if (consume.length === 0) endRound();
      return;
    }
    render();
  }

  function endRound() {
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    save();
    screenGame.classList.add('hidden');
    screenEnd.classList.remove('hidden');
    $('#endSummary').textContent = '';
    $('#explanation').textContent = '';
    $('#transfer').textContent = '';
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* Events */
  $('#btnRepeat').addEventListener('click', function () { startRound(levelFromProgress()); });
  $('#btnMenu').addEventListener('click', function () {
    screenEnd.classList.add('hidden');
    screenStart.classList.remove('hidden');
  });

  paintStars();
})();

