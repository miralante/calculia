/* ============================================================
   Calculia — Fractions and Measures
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'fractions-measures';
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
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce).
     fixedQuestion allows reusing render() with an external question
     (the reinforcement one); if null, render() generates a new one
     as before. inReinforce controls the mini-round flow. */
  var fixedQuestion = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  var reinforceTotal = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Utilidades ---- */

  /* Takes elements from a list without repeating within the round. */
  function sacar(clave, lista) {
    var p = pools[clave];
    if (!p || p.i >= p.orden.length) {
      p = pools[clave] = { orden: App.utils.shuffle(lista), i: 0 };
    }
    return p.orden[p.i++];
  }

  function leyendaFrac() {
    return '<span class="cifra-u">' + App.i18n.t('leyendaPartesPintadasTxt') + '</span> · ' +
      '<span class="cifra-d">' + App.i18n.t('leyendaPartesTotalTxt') + '</span>';
  }

  /* ---- Fracciones (SVG) ---- */

  function svgFraccion(num, den, size) {
    var cx = 60, cy = 60, r = 54;
    var paths = '';
    for (var i = 0; i < den; i++) {
      var a0 = -Math.PI / 2 + (i * 2 * Math.PI) / den;
      var a1 = a0 + (2 * Math.PI) / den;
      var x0 = (cx + r * Math.cos(a0)).toFixed(1);
      var y0 = (cy + r * Math.sin(a0)).toFixed(1);
      var x1 = (cx + r * Math.cos(a1)).toFixed(1);
      var y1 = (cy + r * Math.sin(a1)).toFixed(1);
      var fill = i < num ? 'var(--mod-razonamiento)' : 'var(--color-superficie)';
      paths += '<path d="M' + cx + ' ' + cy + ' L' + x0 + ' ' + y0 +
        ' A' + r + ' ' + r + ' 0 0 1 ' + x1 + ' ' + y1 + ' Z" fill="' + fill +
        '" stroke="var(--color-texto)" stroke-width="2"/>';
    }
    return '<svg viewBox="0 0 120 120" width="' + size + '" height="' + size + '" aria-hidden="true">' + paths + '</svg>';
  }

  function htmlFraccion(f) {
    return '<span class="frac" aria-hidden="true"><span class="frac-num">' + f[0] +
      '</span><span class="frac-den">' + f[1] + '</span></span>';
  }

  /* ============================================================
     Question generators (one per level type)
     Return: enunciado, visual (html), leyenda,
     opciones[{html, correcta, aria?}], pista?, enFila?, visualAria?
     ============================================================ */

  var GENERATORS = {

    fracciones: function (nv) {
      var f = sacar(nv.id, nv.fracs);
      var otros = App.utils.shuffle(nv.fracs.filter(function (o) {
        return o[0] * f[1] !== o[1] * f[0]; /* quitar fracciones equivalentes */
      })).slice(0, 2);
      return {
        enunciado: App.i18n.t('gen.fraccionesEnunciado'),
        visual: svgFraccion(f[0], f[1], 170),
        visualAria: App.i18n.t('gen.fraccionesVisualAria').replace('{den}', f[1]).replace('{num}', f[0]),
        leyenda: leyendaFrac(),
        opciones: App.utils.shuffle(
          [{ html: htmlFraccion(f), aria: App.i18n.t('gen.fraccionAria').replace('{num}', f[0]).replace('{den}', f[1]), correct: true }].concat(
            otros.map(function (o) {
              return { html: htmlFraccion(o), aria: App.i18n.t('gen.fraccionAria').replace('{num}', o[0]).replace('{den}', o[1]), correct: false };
            })
          )),
        enFila: true
      };
    },

    comparaFrac: function (nv) {
      var par = App.utils.shuffle(sacar(nv.id, nv.pares));
      var mayor = (par[0][0] / par[0][1] > par[1][0] / par[1][1]) ? par[0] : par[1];
      return {
        enunciado: App.i18n.t('gen.comparaFracEnunciado'),
        visual: '',
        opciones: par.map(function (f) {
          return {
            html: '<span class="op-frac">' + svgFraccion(f[0], f[1], 120) + htmlFraccion(f) + '</span>',
            aria: App.i18n.t('gen.fraccionAria').replace('{num}', f[0]).replace('{den}', f[1]),
            correct: f === mayor
          };
        }),
        enFila: true
      };
    },

    medidas: function (nv) {
      var group = DATA.measures[App.i18n.locale()][nv.lista];
      var item = sacar('med-' + nv.lista, group.items);
      var ej = item.ej ? '<p class="pista">' + item.ej + '</p>' : '';
      return {
        enunciado: item.pregunta,
        visual: '<div class="picto-medida" aria-hidden="true">' + group.picto + '</div>' +
          '<p class="medida-txt">' + item.q + '</p>' + ej,
        opciones: App.utils.shuffle([{ html: item.r, correct: true }].concat(
          item.falsas.map(function (f) { return { html: f, correct: false }; })
        ))
      };
    }
  };

  /* ============================================================
     Screens and flow
     ============================================================ */

  function show(screen) {
    [screenMenu, screenLevels, screenGame, screenEnd].forEach(function (p) {
      p.classList.toggle('oculto', p !== screen);
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
        '<span class="detalle">' + App.i18n.t('activity.' + id + '.detail') + '</span>';
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
    activity.levels.forEach(function (nv) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-nivel';
      btn.innerHTML = App.i18n.t('level.' + nv.id);
      btn.addEventListener('click', function () { startRound(nv); });
      cont.appendChild(btn);
    });
    show(screenLevels);
  }

  /* ---- Game ---- */
  function startRound(nv) {
    level = nv;
    index = 0;
    roundCorrect = 0;
    pools = {};
    inReinforce = false;
    fixedQuestion = null;
    reinforceList = [];
    reinforceIndex = 0;
    App.reinforce.banner.hide();
    /* Reinforcement: the callback is called with the failed questions
       when the normal round ends. startReinforce mounts the mini-
       round with the failed questions.
       If fixedQuestion is set (reinforcement case), we use that one;
       otherwise we generate a new one with Math.random as usual.
       fixedQuestion is cleared at the end of the reinforcement. */
    question = fixedQuestion || GENERATORS[level.tipo](level, index);
    fixedQuestion = null;
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    show(screenGame);
    render();
  }

  /* Launches the mini-round with the failed questions. The bar
     shows the progress inside the reinforcement. */
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

  /* Renders a fixed question (from the reinforcement queue) using
     the same visual flow as render() but without regenerating it
     with Math.random. The progress bar uses reinforceIndex+1/total. */
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
    question = GENERATORS[level.tipo](level, index);

    promptEl.textContent = question.enunciado;
    visualEl.innerHTML = question.visual || '';
    if (question.visualAria) {
      visualEl.setAttribute('role', 'img');
      visualEl.setAttribute('aria-label', question.visualAria);
    } else {
      visualEl.removeAttribute('role');
      visualEl.removeAttribute('aria-label');
    }
    legendEl.innerHTML = question.leyenda || '';
    legendEl.classList.toggle('oculto', !question.leyenda);

    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('oculto');
    explanationEl.textContent = '';
    btnNext.classList.add('oculto');

    optionsEl.innerHTML = '';
    optionsEl.classList.toggle('opciones-fila', !!question.enFila);
    question.opciones.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-opcion';
      btn.innerHTML = op.html;
      if (op.aria) btn.setAttribute('aria-label', op.aria);
      btn.addEventListener('click', function () { answer(op, btn); });
      optionsEl.appendChild(btn);
    });

    progressFill.style.width = ((index / DATA.perRound) * 100) + '%';
    progressText.textContent = index + ' / ' + DATA.perRound;
    paintStars();
  }

  /* Extracts the visible text from an option.html (may contain inner <span>) */
  function plainText(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
  }

  function showExplanation(isCorrect) {
    var correct = question.opciones.filter(function (o) { return o.correct; })[0];
    var text = (isCorrect ? App.i18n.t('explicacionCorrecta') : App.i18n.t('explicacionIncorrectaA')) +
      plainText(correct.html) + '.';
    explanationEl.textContent = text;
    explanationWrap.classList.remove('oculto');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look at the question/visual again.
     Only on the second mistake is the correct answer explained
     (showExplanation). */
  function showHint() {
    explanationEl.textContent = App.i18n.t('pista');
    explanationWrap.classList.remove('oculto');
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
      App.utils.$$('#options .btn-opcion').forEach(function (b) { b.disabled = true; });
      btnNext.classList.remove('oculto');
      btnNext.focus();
    } else {
      attempts += 1;
      /* Reinforcement: registers the first miss of the question. The
         question is the global `question` that render() just assigned
         (fixed or regenerated). */
      if (attempts === 1) App.reinforce.add(level.id + ':' + index, question);
      if (attempts === 1) {
        showHint();
      } else {
        showExplanation(op.correct);
      }
      btn.classList.add('animo');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .btn-opcion'), explanationWrap);
    }
  }

  function next() {
    /* Mini-round: go to the next item or close. */
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
}

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look at the question/visual again.
     Only on the second mistake is the correct answer explained
     (showExplanation). */

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
    var siguienteNivel = (roundCorrect === DATA.perRound && idxNivel !== -1 && idxNivel + 1 < activity.levels.length)
      ? activity.levels[idxNivel + 1] : null;
    var btnHarder = $('#btnHarder');
    if (siguienteNivel) {
      btnHarder.textContent = App.i18n.t('btnHarder').replace('{nombre}', App.i18n.t('level.' + siguienteNivel.id));
      btnHarder.classList.remove('oculto');
      btnHarder.onclick = function () { startRound(siguienteNivel); };
    } else {
      btnHarder.classList.add('oculto');
    }
  }

  /* ---- Events ---- */

  $('#btnBackToMenu').addEventListener('click', function () { show(screenMenu); });
  $('#btnRepeat').addEventListener('click', function () { startRound(level); });
  $('#btnOtherLevel').addEventListener('click', function () { openActivity(activity.id); });
  $('#btnOtherActivity').addEventListener('click', function () { show(screenMenu); });

  paintMenu();
  paintStars();
})();
