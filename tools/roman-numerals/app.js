/* ============================================================
   Apptonomia — Números Romanos (razonamiento: leer números
   romanos y aplicarlos a reconocer siglos)
   Datos en data.js (DATA.symbols, DATA.numbers, DATA.niveles).
   4 niveles con el motor de quiz de 3 opciones (como Señales):
   1) romanToNumber 1-10: símbolos básicos I, V, X.
   2) romanToNumber 11-21: combina X con I y V.
   3) centuryToNumber: ver "Siglo {roman}" y elegir el número.
   4) numberToCentury: ver "Siglo {n}" y elegir el número romano.
   Progresión gradual (regla 13): cada nivel cambia una sola
   variable respecto al anterior. El error nunca se castiga;
   pista en el primer fallo, explicación en el segundo.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'roman-numerals';
  var $ = App.utils.$;

  var startScreen = $('#startScreen');
  var quizScreen = $('#quizScreen');
  var endScreen = $('#endScreen');
  var levelsEl = $('#levels');
  var referenceSymbols = $('#referenceSymbols');
  var starsEl = $('#stars');

  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var numeralDisplay = $('#numeralDisplay');
  var listenBtn = $('#listenBtn');
  var questionText = $('#questionText');
  var optionsEl = $('#options');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var nextBtn = $('#nextBtn');

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.estrellas !== 'number') progress.estrellas = 0;
  if (!progress.completed) progress.completed = {};

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.estrellas; }
  function t(key) { return App.i18n.t(key); }

  function show(screen) {
    [startScreen, quizScreen, endScreen].forEach(function (s) {
      s.classList.toggle('oculto', s !== screen);
    });
  }

  /* ---------- Pantalla inicial: referencia + niveles ---------- */

  function paintReference() {
    referenceSymbols.innerHTML = '';
    DATA.symbols.forEach(function (s) {
      var chip = document.createElement('span');
      chip.className = 'symbol-chip';
      chip.textContent = s.roman + ' = ' + s.value;
      referenceSymbols.appendChild(chip);
    });
  }

  function referenceSpeech() {
    return t('referenceTitle') + '. ' + t('referenceText');
  }

  function paintLevels() {
    levelsEl.innerHTML = '';
    DATA.niveles.forEach(function (nivel) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-level';
      var done = progress.completed[nivel.id] ? ' ' + t('done') : '';
      btn.innerHTML = t(nivel.id) + done +
        '<span class="level-info">' + t(nivel.id + 'Info') + '</span>';
      btn.addEventListener('click', function () { startLevel(nivel); });
      levelsEl.appendChild(btn);
    });
  }

  /* ---------- Ronda de quiz ---------- */
  var currentLevel = null;
  var pool = [];
  var items = [];
  var idx = 0;
  var correctCount = 0;
  var resolved = false;
  var attempts = 0;

  function startLevel(nivel) {
    currentLevel = nivel;
    pool = DATA.numbers.filter(function (x) { return x.n >= nivel.min && x.n <= nivel.max; });
    items = App.utils.shuffle(pool).slice(0, DATA.porRonda);
    idx = 0;
    correctCount = 0;
    App.tts.stop();
    show(quizScreen);
    render();
  }

  function paintProgress() {
    var total = DATA.porRonda;
    progressFill.style.width = ((idx / total) * 100) + '%';
    progressText.textContent = idx + ' / ' + total;
  }

  /* Builds what's shown, the question, and the 3 options based on the
     level's mode. 'key' indicates whether comparing/ordering is done
     by number (n) or by roman text (roman). */
  function buildRound(item) {
    var mode = currentLevel.mode;
    var shown, question, correctValue, key;
    if (mode === 'romanToNumber') {
      shown = item.roman;
      question = t('whichNumber');
      correctValue = item.n;
      key = 'n';
    } else if (mode === 'centuryToNumber') {
      shown = t('centuryRomanLabel').replace('{roman}', item.roman);
      question = t('whichCenturyNumber');
      correctValue = item.n;
      key = 'n';
    } else {
      shown = t('centuryNumberLabel').replace('{n}', item.n);
      question = t('whichRoman');
      correctValue = item.roman;
      key = 'roman';
    }
    var distractors = App.utils.shuffle(pool.filter(function (x) { return x[key] !== correctValue; })).slice(0, 2);
    var values = distractors.map(function (x) { return x[key]; });
    values.push(correctValue);
    return { shown: shown, question: question, correctValue: correctValue, options: App.utils.shuffle(values) };
  }

  function render() {
    var item = items[idx];
    resolved = false;
    attempts = 0;
    var round = buildRound(item);
    numeralDisplay.textContent = round.shown;
    questionText.textContent = round.question;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('oculto');
    explanationEl.textContent = '';
    nextBtn.classList.add('oculto');
    optionsEl.innerHTML = '';

    round.options.forEach(function (value) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-opcion';
      btn.textContent = value;
      btn.addEventListener('click', function () { answer(btn, value === round.correctValue, round); });
      optionsEl.appendChild(btn);
    });

    paintProgress();
    paintStars();
  }

  function showExplanation(round) {
    explanationEl.textContent = t('correctExplanation');
    explanationWrap.classList.remove('oculto');
  }

  function answer(btn, esCorrecta, round) {
    if (resolved) return;
    if (esCorrecta) {
      showExplanation(round);
      resolved = true;
      btn.classList.add('correcta');
      App.utils.$$('#options .btn-opcion').forEach(function (b) { b.disabled = true; });
      App.feedback.success(feedbackEl);
      progress.estrellas += 1;
      correctCount += 1;
      save();
      paintStars();
      nextBtn.classList.remove('oculto');
      nextBtn.focus();
    } else {
      attempts += 1;
      if (attempts === 1) {
        explanationEl.textContent = t('hint') + '"' + round.shown + '"';
        explanationWrap.classList.remove('oculto');
      } else {
        explanationEl.textContent = t('wrongExplanationPrefix') + round.correctValue;
        explanationWrap.classList.remove('oculto');
      }
      btn.classList.add('animo');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .btn-opcion'), explanationWrap);
    }
  }

  function next() {
    idx += 1;
    App.tts.stop();
    if (idx >= DATA.porRonda) {
      finish();
    } else {
      render();
    }
  }

  function finish() {
    progress.completed[currentLevel.id] = (progress.completed[currentLevel.id] || 0) + 1;
    save();
    show(endScreen);
    $('#finalSummary').textContent = t('finalSummary')
      .replace('{n}', correctCount).replace('{total}', progress.estrellas);
$('#transferencia').textContent = App.i18n.t('transferencia');
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* ---------- Eventos ---------- */

  $('#referenceListenBtn').addEventListener('click', function () {
    App.tts.speak(referenceSpeech());
  });
  $('#backLevelsBtn').addEventListener('click', function () {
    App.tts.stop();
    paintLevels();
    show(startScreen);
  });
  listenBtn.addEventListener('click', function () {
    App.tts.speak(numeralDisplay.textContent + '. ' + questionText.textContent);
  });
  nextBtn.addEventListener('click', next);
  $('#explanationListenBtn').addEventListener('click', function () {
    App.tts.speak(explanationEl.textContent);
  });
  $('#replayBtn').addEventListener('click', function () { startLevel(currentLevel); });
  $('#otherLevelBtn').addEventListener('click', function () {
    paintLevels();
    show(startScreen);
  });

  function init() {
    App.i18n.apply();
    paintStars();
    paintReference();
    paintLevels();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
