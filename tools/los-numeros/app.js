/* ============================================================
   Calculia — Los Números
   Flujo:
     1) screenIntro: 4 tarjetas con los tipos de números.
     2) screenGame: 6 preguntas de opción múltiple. Se muestra un
        número y 4 opciones (los 4 tipos). El orden de las
        opciones se baraja para que el correcto no quede siempre
        en la misma posición.
     3) screenEnd: resumen de la ronda.
   Datos: DATA.bank (números/expresiones con su tipo). Los nombres
   de cada tipo viven en App.i18n.t('gen.natural' | 'entero' |
   'decimal' | 'fraccion').
   Persistencia: App.storage (prefijo 'los-numeros'): stars y
   completedRounds. La rampa de dificultad es solo "se repite la
   baraja barajada": no hay sub-niveles — la actividad es de
   presentación y reconocimiento, no de práctica graduada.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'los-numeros';
  var PER_ROUND = 6;
  var TIPOS = ['natural', 'entero', 'decimal', 'fraccion'];
  var $ = App.utils.$;

  /* ---- Pantallas ---- */
  var screenIntro = $('#screenIntro');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');

  /* ---- Elementos del juego ---- */
  var quizNumber = $('#quizNumber');
  var optionsEl = $('#options');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var btnNext = $('#btnNext');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');

  /* ---- Persistencia ---- */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;

  /* ---- Estado de la ronda ---- */
  var items = [];
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var resolved = false;
  var attempts = 0;
  var pistaActual = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  var reinforceTotal = 0;
  /* currentItem deja reutilizar render() con un item del refuerzo;
     si es null, render() toma items[index]. */
  var currentItem = null;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* En ES los decimales se escriben con coma (0,5). En EN con
     punto (0.5). La cadena del banco ya está en formato ES;
     sólo hay que cambiar coma -> punto cuando el locale es EN. */
  function displayFor(item) {
    var loc = App.i18n.locale();
    if (loc === 'en' && item.tipo === 'decimal') {
      return item.display.replace(/,/g, '.');
    }
    return item.display;
  }

  function nombreTipo(tipo) {
    return App.i18n.t('gen.' + tipo) || tipo;
  }

  function pistaPara(item) {
    var key = 'pista' + item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1);
    return App.i18n.t(key) || App.i18n.t('pista');
  }

  /* ---- Construcción de la baraja de la ronda ----
     Asegura que, siempre que se pueda, salgan las 4 categorías
     (con Data.bank las 4 están bien representadas). Si en algún
     PER_ROUND no caben todas, se priorizan las que menos se hayan
     visto en la ronda (un simple round-robin). Aquí la rampa es
     trivial: barajamos el banco y cortamos. */
  function buildItems() {
    var pool = DATA.bank.slice();
    App.utils.shuffle(pool);
    return pool.slice(0, PER_ROUND);
  }

  function shuffleOptions(item) {
    /* Opciones SIEMPRE los 4 tipos, en orden barajado. Así la
       persona tiene que reconocer el tipo, no pulsar el que
       siempre está en la misma posición. */
    var opciones = TIPOS.slice();
    App.utils.shuffle(opciones);
    return opciones.map(function (tipo) {
      return { tipo: tipo, isCorrect: tipo === item.tipo };
    });
  }

  /* ---- Pintado de la pregunta ---- */
  function render() {
    var item = currentItem || items[index];
    currentItem = null;
    pistaActual = pistaPara(item);
    resolved = false;
    attempts = 0;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');
    optionsEl.innerHTML = '';

    quizNumber.textContent = displayFor(item);
    quizNumber.setAttribute('aria-label',
      App.i18n.t('gen.numberAria').replace('{n}', displayFor(item)));

    var opciones = shuffleOptions(item);
    opciones.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn option-tipo option-tipo-' + op.tipo;
      btn.textContent = nombreTipo(op.tipo);
      btn.addEventListener('click', function () { answer(btn, op.isCorrect, item); });
      optionsEl.appendChild(btn);
    });

    paintProgress();
    paintStars();
  }

  function showExplanation(isCorrect, item) {
    if (isCorrect && inReinforce) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var tipo = nombreTipo(item.tipo);
    var text = isCorrect
      ? App.i18n.t('explicacionCorrecta') + tipo + '.'
      : App.i18n.t('explicacionIncorrecta') + tipo + ' (' + displayFor(item) + ').';
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  function showHint() {
    explanationEl.textContent = pistaActual || App.i18n.t('pista');
    explanationWrap.classList.remove('hidden');
  }

  function paintProgress() {
    if (inReinforce) {
      progressFill.style.width = (((reinforceIndex + 1) / reinforceTotal) * 100) + '%';
      progressText.textContent = (reinforceIndex + 1) + ' / ' + reinforceTotal;
    } else {
      progressFill.style.width = ((index / PER_ROUND) * 100) + '%';
      progressText.textContent = index + ' / ' + PER_ROUND;
    }
  }

  function answer(btn, isCorrect, item) {
    if (resolved) return;
    if (isCorrect) {
      showExplanation(true, item);
      resolved = true;
      btn.classList.add('correct');
      App.utils.$$('#options .option-btn').forEach(function (b) { b.disabled = true; });
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      attempts += 1;
      if (attempts === 1) App.reinforce.add(item.id, item);
      showHint();
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap,
        function () { if (attempts > 1) showExplanation(false, item); });
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
      paintProgress();
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
    paintProgress();
    render();
  }

  function startRound() {
    items = buildItems();
    index = 0;
    roundCorrect = 0;
    inReinforce = false;
    currentItem = null;
    reinforceList = [];
    reinforceIndex = 0;
    App.reinforce.banner.hide();
    App.reinforce.start(function (failures) { startReinforce(failures); });
    screenIntro.classList.add('hidden');
    screenEnd.classList.add('hidden');
    screenGame.classList.remove('hidden');
    render();
  }

  function endRound() {
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    save();
    screenGame.classList.add('hidden');
    screenEnd.classList.remove('hidden');
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{total}', PER_ROUND)
        .replace('{stars}', progress.stars);
    }
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  function backToIntro() {
    screenEnd.classList.add('hidden');
    screenGame.classList.add('hidden');
    screenIntro.classList.remove('hidden');
  }

  /* ---- Eventos ---- */
  $('#introContinue').addEventListener('click', startRound);
  $('#btnNext').addEventListener('click', goNext);
  $('#btnRepeat').addEventListener('click', startRound);
  $('#btnMenu').addEventListener('click', backToIntro);

  paintStars();
})();
