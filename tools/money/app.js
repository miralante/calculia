/* ============================================================
   Calculia — Money (enough money?, change, and prices)
   Data and levels in data.js. Shared modules in assets/js/.
   Amounts use euros and cents, with the decimal separator and
   cents painted in orange. Questions are generated on the fly
   based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'money';
  var $ = App.utils.$;

  var screenMenu = $('#screenMenu');
  var screenLevels = $('#screenLevels');
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
  var progress = App.storage.progressWith(TOOL_ID, { stars: 0, completedRounds: 0 });

  /* Round state */
  var activity = null;
  var answered = false;
  /* Refuerzo: ver core en assets/js/feedback.js (App.reinforce).
     fixedQuestion permite reutilizar render() con una question
     externa (la del refuerzo); si es null, render() genera una
     nueva como antes. reinforcement.active() controla el flujo de la mini-
     ronda. */
  var fixedQuestion = null;
  var reinforcement = App.reinforce.session({
    titleKey: 'refuerzoTitulo',
    introKey: 'refuerzoIntro',
    show: function (p) { showReinforceQuestion(p); paintReinforceProgress(); }
  });

  var glue = App.activityGlue({
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    activity: function () { return activity; },
    roundCorrect: function () { return round.roundCorrect; },
    screenEnd: function () { return screenEnd; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars, levelFromProgress = glue.levelFromProgress, endRound = glue.endRound;

  /* The round state and the shared answer, hint and next step (assets/js/classic-quiz.js). */
  var round = { level: null, index: 0, roundCorrect: 0, answered: false, attempts: 0, question: null };
  var quiz = App.classicQuiz({
    round: round, progress: progress, reinforcement: reinforcement,
    save: function () { save(); }, paintStars: function () { paintStars(); },
    feedback: feedbackEl, explanation: explanationEl, explanationWrap: explanationWrap, btnNext: btnNext,
    perRound: DATA.perRound,
    showExplanation: function (isCorrect) { showExplanation(isCorrect); },
    render: function () { render(); },
    endRound: function () { endRound(); }
  });
  var answer = quiz.answer, showHint = quiz.showHint, next = quiz.next;

  /* ---- Utilidades ---- */

  var randInt = App.utils.rint;


  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  /* Separador decimal (',' es / '.' en). No es solo estilo: intercambiar
     el separador entre idiomas es obligatorio (ver I18N.md §2). */
  function decimalSeparator() { return App.i18n.locale() === 'en' ? '.' : ','; }

  var POS_CLASS = ['digit-u', 'digit-d', 'digit-c'];

  /* Color-coded digits by place value, same convention as the euro/units
     legend below (blue units, green tens, purple hundreds). */
  function digits(n) {
    var s = String(n);
    var html = '';
    for (var j = 0; j < s.length; j++) {
      var pos = s.length - 1 - j;
      var clase = POS_CLASS[pos] || 'digit-c';
      html += '<span class="' + clase + '">' + s[j] + '</span>';
    }
    return html;
  }

  function legendPrice() {
    return '<span class="digit-u">' + App.i18n.t('leyendaEurosTxt') + '</span> · ' +
      '<span class="digit-comma">' + App.i18n.t('leyendaComaTxt') + '</span>';
  }

  function priceHTML(cent) {
    var e = Math.floor(cent / 100);
    var c = cent % 100;
    var cc = (c < 10 ? '0' : '') + c;
    return '<span class="num-color">' + digits(e) +
      '<span class="digit-comma">' + decimalSeparator() + '</span><span class="digit-dec">' + cc + '</span> €</span>';
  }

  function wordsPrice(cent) {
    var e = Math.floor(cent / 100);
    var c = cent % 100;
    var pe = e === 1 ? App.i18n.t('euroUno') : App.i18n.t('euroVarios').replace('{e}', e);
    return c === 0 ? pe : App.i18n.t('precioConCentimos').replace('{euros}', pe).replace('{c}', c);
  }

  /* ============================================================
     Question generators (one per level type)
     Return: prompt, visual (html), legend,
     options[{html, correct, aria?}], hint?, enFila?, visualAria?
     ============================================================ */

  var GENERATORS = {

    precios: function () {
      var prod = App.utils.drawRound('prod', DATA.productos);
      var nombreProd = App.i18n.t('producto.' + prod.id);
      var e = randInt(1, 9);
      var c = [5, 10, 25, 50, 75, 90][randInt(0, 5)];
      var cent = e * 100 + c;
      var mal1 = App.i18n.t('precioConCentimos')
        .replace('{euros}', App.i18n.t('euroVarios').replace('{e}', c === e ? e + 1 : c))
        .replace('{c}', c === e ? c : e);
      var mal2 = String(e) + (c < 10 ? '0' : '') + c + ' euros';
      return {
        prompt: App.i18n.t('gen.preciosEnunciado'),
        visual: '<div class="measure-picto" aria-hidden="true">' + prod.picto + '</div>' +
          '<div class="visual-number">' + priceHTML(cent) + '</div>',
        legend: legendPrice(),
        hint: App.i18n.t('gen.socraticPrice'),
        options: App.utils.shuffle([
          { html: wordsPrice(cent), correct: true },
          { html: mal1, correct: false },
          { html: mal2, correct: false }
        ])
      };
    },

    comparaPrecios: function () {
      var prods = App.utils.shuffle(DATA.productos).slice(0, 2);
      var nombres = prods.map(function (p) { return App.i18n.t('producto.' + p.id); });
      var e = randInt(1, 4);
      var pares = [
        [e * 100 + 5, e * 100 + 50],
        [e * 100 + 90, (e + 1) * 100 + 10],
        [e * 100, e * 100 + 50],
        [e * 100 + 25, e * 100 + 75]
      ];
      var par = App.utils.shuffle(pares[randInt(0, pares.length - 1)]);
      var caro = Math.max(par[0], par[1]);
      return {
        prompt: App.i18n.t('gen.comparaPreciosEnunciado'),
        visual: '',
        legend: legendPrice(),
        hint: App.i18n.t('gen.socraticComparePrices'),
        options: prods.map(function (p, i) {
          return {
            html: '<span class="price-tag"><span class="option-picto">' + p.picto + '</span>' +
              '<span>' + nombres[i] + '</span>' + priceHTML(par[i]) + '</span>',
            aria: nombres[i] + ': ' + wordsPrice(par[i]),
            correct: par[i] === caro
          };
        }),
        inline: true
      };
    },

    llegaUno: function () {
      var caso = App.utils.drawRound('llegaUno', DATA.llegaUno);
      var prod = App.utils.drawRound('prodLlegaUno', DATA.productos);
      var nombreProd = App.i18n.t('producto.' + prod.id);
      var llega = caso.precio <= caso.tiene;
      return {
        prompt: App.i18n.t('gen.llegaUnoEnunciado'),
        hint: App.i18n.t('gen.socraticOneEnough'),
        visual:
          '<div class="llega-caja"><p class="llega-etq">' + App.i18n.t('gen.etqTienes') + '</p>' + priceHTML(caso.tiene) + '</div>' +
          '<div class="llega-caja"><p class="llega-etq">' + prod.picto + ' ' + nombreProd + ':</p>' +
          priceHTML(caso.precio) + '</div>',
        legend: legendPrice(),
        options: App.utils.shuffle([
          { html: App.i18n.t('gen.opcionSi'), correct: llega },
          { html: App.i18n.t('gen.opcionNo'), correct: !llega }
        ]),
        inline: true
      };
    },

    llegaDos: function () {
      var caso = App.utils.drawRound('llegaDos', DATA.llegaDos);
      var prods = App.utils.shuffle(DATA.productos).slice(0, 2);
      var nombres = prods.map(function (p) { return App.i18n.t('producto.' + p.id); });
      var total = caso.precios[0] + caso.precios[1];
      var llega = total <= caso.tiene;
      return {
        prompt: App.i18n.t('gen.llegaDosEnunciado'),
        hint: App.i18n.t('gen.socraticTwoEnough'),
        visual:
          '<div class="llega-caja"><p class="llega-etq">' + App.i18n.t('gen.etqTienes') + '</p>' + priceHTML(caso.tiene) + '</div>' +
          '<div class="llega-row">' +
          '<div class="llega-caja"><p class="llega-etq">' + prods[0].picto + ' ' + nombres[0] + ':</p>' +
          priceHTML(caso.precios[0]) + '</div>' +
          '<div class="llega-caja"><p class="llega-etq">' + prods[1].picto + ' ' + nombres[1] + ':</p>' +
          priceHTML(caso.precios[1]) + '</div>' +
          '</div>',
        legend: legendPrice(),
        options: App.utils.shuffle([
          { html: App.i18n.t('gen.opcionSi'), correct: llega },
          { html: App.i18n.t('gen.opcionNo'), correct: !llega }
        ]),
        inline: true
      };
    },

    cambio: function (levelArg) {
      var caso = App.utils.drawRound('cambio_' + levelArg.lista, DATA.cambio[levelArg.lista]);
      var vuelta = caso.billete - caso.precio;
      return {
        prompt: App.i18n.t('gen.cambioEnunciado'),
        hint: App.i18n.t('gen.socraticChange'),
        visual:
          '<div class="llega-caja"><p class="llega-etq">' + App.i18n.t('gen.etqPagas') + '</p>' + priceHTML(caso.billete) + '</div>' +
          '<div class="llega-caja"><p class="llega-etq">' + App.i18n.t('gen.etqCuesta') + '</p>' + priceHTML(caso.precio) + '</div>',
        legend: legendPrice(),
        options: App.utils.shuffle([
          { html: priceHTML(vuelta), correct: true },
          { html: priceHTML(vuelta + 100), correct: false },
          { html: priceHTML(Math.max(0, vuelta - 100)), correct: false }
        ]),
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
  /* ---- Levels of an activity (now automatic via levelFromProgress) ---- */

  /* ---- Game ---- */
  /* The level rises one step per completed round, capped at the last
     one, so a person who comes back continues where they were. */

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    startRound(levelFromProgress());
  }

  var activityMenu = App.activityMenu({ container: $('#activitiesMenu'), activities: DATA.activities, open: openActivity });

  function startRound(levelArg) {
    round.level = levelArg;
    round.index = 0;
    round.roundCorrect = 0;
    App.utils.drawRoundReset();
    fixedQuestion = null;
    reinforcement.begin();
    show(screenGame);
    render();
  }

  function showReinforceQuestion(p) {
    fixedQuestion = p;
    render();
  }

  function paintReinforceProgress() {
    progressFill.style.width = (((reinforcement.position() + 1) / reinforcement.total()) * 100) + '%';
    progressText.textContent = '';
  }

  function render() {
    round.answered = false;
    round.attempts = 0;
    round.question = fixedQuestion || GENERATORS[round.level.tipo](round.level, round.index);
    fixedQuestion = null;

    promptEl.textContent = round.question.prompt;
    visualEl.innerHTML = round.question.visual || '';
    if (round.question.visualAria) {
      visualEl.setAttribute('role', 'img');
      visualEl.setAttribute('aria-label', round.question.visualAria);
    } else {
      visualEl.removeAttribute('role');
      visualEl.removeAttribute('aria-label');
    }
    legendEl.innerHTML = round.question.legend || '';
    legendEl.classList.toggle('hidden', !round.question.legend);

    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');

    optionsEl.innerHTML = '';
    optionsEl.classList.toggle('options-row', !!round.question.inline);
    round.question.options.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.innerHTML = op.html;
      if (op.aria) btn.setAttribute('aria-label', op.aria);
      btn.addEventListener('click', function () { answer(op, btn); });
      optionsEl.appendChild(btn);
    });

    progressFill.style.width = ((round.index / DATA.perRound) * 100) + '%';
    progressText.textContent = '';
    paintStars();
  }

  /* Extracts the visible text from an option.html (may contain inner <span> elements) */
  var plainText = App.utils.plainText;


  function showExplanation(isCorrect) {
    if (isCorrect && reinforcement.active()) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var correct = round.question.options.filter(function (o) { return o.correct; })[0];
    var text = (isCorrect ? App.i18n.t('explicacionCorrecta') : App.i18n.t('explicacionIncorrectaA')) +
      plainText(correct.html) + '.';
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look at the question/visual again.
     Only on the second mistake is the correct answer explained
     (showExplanation). The invitation is the one written for THIS
     question —which is what to do with the figure in front of you— and
     not the same sentence for every question. The generic line is only
     the fallback, for a question that forgot to bring its own. */

  /* ---- Eventos ---- */

  $('#btnNext').addEventListener('click', next);



  $('#noteExtra').innerHTML = App.i18n.t('notaMonedero')
    .replace('{link}', '<a href="../wallet/">' + App.i18n.t('notaMonederoLink') + '</a>');

  activityMenu.paint();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  App.utils.bindEndBackToStart();

})();
