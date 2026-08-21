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
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  /* Round state */
  var activity = null;
  var level = null;
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var question = null;
  var pools = {};
  /* Refuerzo: ver core en assets/js/feedback.js (App.reinforce).
     fixedQuestion permite reutilizar render() con una question
     externa (la del refuerzo); si es null, render() genera una
     nueva como antes. inReinforce controla el flujo de la mini-
     ronda. */
  var fixedQuestion = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  var reinforceTotal = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Utilidades ---- */

  function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  /* Takes elements from a list without repeating within the round. */
  function draw(key, list) {
    var p = pools[key];
    if (!p || p.i >= p.orden.length) {
      p = pools[key] = { orden: App.utils.shuffle(list), i: 0 };
    }
    return p.orden[p.i++];
  }

  /* Separador decimal (',' es / '.' en). No es solo estilo: intercambiar
     el separador entre idiomas es obligatorio (ver I18N.md §2). */
  function decimalSeparator() { return App.i18n.locale() === 'en' ? '.' : ','; }

  var POS_CLASS = ['cifra-u', 'cifra-d', 'cifra-c'];

  /* Color-coded digits by place value, same convention as the euro/units
     legend below (blue units, green tens, purple hundreds). */
  function digits(n) {
    var s = String(n);
    var html = '';
    for (var j = 0; j < s.length; j++) {
      var pos = s.length - 1 - j;
      var clase = POS_CLASS[pos] || 'cifra-c';
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
      var prod = draw('prod', DATA.productos);
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
      var caso = draw('llegaUno', DATA.llegaUno);
      var prod = draw('prodLlegaUno', DATA.productos);
      var nombreProd = App.i18n.t('producto.' + prod.id);
      var llega = caso.precio <= caso.tiene;
      return {
        prompt: App.i18n.t('gen.llegaUnoEnunciado'),
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
      var caso = draw('llegaDos', DATA.llegaDos);
      var prods = App.utils.shuffle(DATA.productos).slice(0, 2);
      var nombres = prods.map(function (p) { return App.i18n.t('producto.' + p.id); });
      var total = caso.precios[0] + caso.precios[1];
      var llega = total <= caso.tiene;
      return {
        prompt: App.i18n.t('gen.llegaDosEnunciado'),
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
      var caso = draw('cambio_' + levelArg.lista, DATA.cambio[levelArg.lista]);
      var vuelta = caso.billete - caso.precio;
      return {
        prompt: App.i18n.t('gen.cambioEnunciado'),
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
    [screenMenu, screenLevels, screenGame, screenEnd].forEach(function (p) {
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

  /* ---- Levels of an activity ---- */
  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    $('#activityTitle').textContent = activity.picto + ' ' + App.i18n.t('activity.' + id + '.name');
    $('#activityInstruction').textContent = App.i18n.t('activity.' + id + '.instruction');
    var cont = $('#levels');
    cont.innerHTML = '';
    activity.levels.forEach(function (levelArg) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-level';
      btn.innerHTML = App.i18n.t('level.' + levelArg.id);
      btn.addEventListener('click', function () { startRound(levelArg); });
      cont.appendChild(btn);
    });
    show(screenLevels);
  }

  /* ---- Game ---- */
  function startRound(levelArg) {
    level = levelArg;
    index = 0;
    roundCorrect = 0;
    pools = {};
    inReinforce = false;
    fixedQuestion = null;
    reinforceList = [];
    reinforceIndex = 0;
    App.reinforce.banner.hide();
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    show(screenGame);
    render();
  }

  function startReinforce(fallos) {
    reinforceList = fallos.map(function (f) { return f.payload; });
    reinforceTotal = reinforceList.length;
    reinforceIndex = 0;
    inReinforce = true;
    App.reinforce.banner.set(
      App.i18n.t('refuerzoTitulo') + ' — ' +
      App.i18n.t('refuerzoIntro').replace('{n}', reinforceTotal)
    );
    showReinforceQuestion(reinforceList[0]);
  }

  function showReinforceQuestion(p) {
    fixedQuestion = p;
    render();
  }

  function paintReinforceProgress() {
    progressFill.style.width = (((reinforceIndex + 1) / reinforceTotal) * 100) + '%';
    progressText.textContent = (reinforceIndex + 1) + ' / ' + reinforceTotal;
  }

  function render() {
    resolved = false;
    attempts = 0;
    question = fixedQuestion || GENERATORS[level.tipo](level, index);
    fixedQuestion = null;

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

    progressFill.style.width = ((index / DATA.perRound) * 100) + '%';
    progressText.textContent = index + ' / ' + DATA.perRound;
    paintStars();
  }

  /* Extracts the visible text from an option.html (may contain inner <span> elements) */
  function plainText(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
  }

  function showExplanation(isCorrect) {
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    var text = (isCorrect ? App.i18n.t('explicacionCorrecta') : App.i18n.t('explicacionIncorrectaA')) +
      plainText(correct.html) + '.';
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look at the question/visual again.
     Only on the second mistake is the correct answer explained
     (showExplanation). */
  function showHint() {
    explanationEl.textContent = App.i18n.t('hint');
    explanationWrap.classList.remove('hidden');
  }

  function answer(op, btn) {
    if (resolved) return;
    if (op.correct) {
      showExplanation(op.correct);
      resolved = true;
      btn.classList.add('correcta');
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
      if (attempts === 1) App.reinforce.add(level.id + ':' + index, question);
      if (attempts === 1) {
        showHint();
      } else {
        showExplanation(op.correct);
      }
      btn.classList.add('animo');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap);
    }
  }

  function next() {
    if (inReinforce) {
      reinforceIndex += 1;
      if (reinforceIndex >= reinforceTotal) {
        inReinforce = false;
        App.reinforce.clear();
        App.reinforce.banner.hide();
        endRound();
        return;
      }
      showReinforceQuestion(reinforceList[reinforceIndex]);
      paintReinforceProgress();
      return;
    }
    index += 1;
    if (index >= DATA.perRound) {
      var consume = App.reinforce.consume();
      if (consume.length === 0) endRound();
      return;
    }
    render();
  }

  function endRound() {
    save();
    show(screenEnd);
    $('#endSummary').textContent = App.i18n.t('resumenFinal')
      .replace('{n}', roundCorrect)
      .replace('{actividad}', App.i18n.t('activity.' + activity.id + '.name'))
      .replace('{estrellas}', progress.stars);
    $('#transfer').textContent = App.i18n.t('transferencia');
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));

    var idxNivel = activity.levels.indexOf(level);
    var nextLevel = (roundCorrect === DATA.perRound && idxNivel !== -1 && idxNivel + 1 < activity.levels.length)
      ? activity.levels[idxNivel + 1] : null;
    var btnHarder = $('#btnHarder');
    if (nextLevel) {
      btnHarder.textContent = App.i18n.t('btnHarder').replace('{name-card}', App.i18n.t('level.' + nextLevel.id));
      btnHarder.classList.remove('hidden');
      btnHarder.onclick = function () { startRound(nextLevel); };
    } else {
      btnHarder.classList.add('hidden');
    }
  }

  /* ---- Eventos ---- */

  $('#btnBackToMenu').addEventListener('click', function () { show(screenMenu); });
  $('#btnRepeat').addEventListener('click', function () { startRound(level); });
  $('#btnOtherLevel').addEventListener('click', function () { openActivity(activity.id); });
  $('#btnOtherActivity').addEventListener('click', function () { show(screenMenu); });

  $('#noteExtra').innerHTML = App.i18n.t('notaMonedero')
    .replace('{link}', '<a href="../wallet/index.html">' + App.i18n.t('notaMonederoLink') + '</a>');

  paintMenu();
  paintStars();
})();
