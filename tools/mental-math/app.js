/* ============================================================
   Calculia — Subtract and Mental Math
   Data and levels live in data.js. Shared modules in assets/js/.
   Each digit is painted according to its place: blue units,
   green tens, purple hundreds. Signs use orange.
   Questions are generated on the fly from the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'mental-math';
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
  var idx = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var question = null;
  /* Reinforce: when the normal round ends and some items were
     failed, a mini-round is mounted using only those. reinforceIdx/
     reinforceList are filled from onRefuerzo; inReinforce prevents
     the mini-round from chaining with another mini-round
     indefinitely. The reinforce banner is created dynamically
     from here so the shared HTML is not touched. */
  var reinforceList = [];
  var reinforceIndex = 0;
  var inReinforce = false;
  var reinforceBanner = null;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Utilities ---- */

  function ri(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  /* ---- Color-coded digits by place value ---- */

  var POS_CLASS = ['cifra-u', 'cifra-d', 'cifra-c'];

  /* Thousands separator ('.' is / ',' in). Not only styling: switching
     the separator between locales is mandatory (see I18N.md §2). */
  function separadorMiles() { return App.i18n.locale() === 'en' ? ',' : '.'; }

  function legendPos() {
    return '<span class="cifra-u">' + App.i18n.t('leyendaUnidadesTxt') + '</span> · ' +
      '<span class="cifra-d">' + App.i18n.t('leyendaDecenasTxt') + '</span> · ' +
      '<span class="cifra-c">' + App.i18n.t('leyendaCentenasTxt') + '</span>';
  }

  /* html for the digits of n, grouped in 3s with a thousands separator.
     highlight: absolute place (0=units, 1=tens, 2=hundreds, 3=thousands…)
     that gets underlined. */
  function digits(n, highlight) {
    var s = String(n);
    var groups = [];
    for (var i = s.length; i > 0; i -= 3) groups.unshift(s.slice(Math.max(0, i - 3), i));
    var html = '';
    for (var g = 0; g < groups.length; g++) {
      var body = '';
      for (var j = 0; j < groups[g].length; j++) {
        var pos = groups[g].length - 1 - j;
        var posAbs = (groups.length - 1 - g) * 3 + pos;
        var cls = POS_CLASS[pos];
        if (highlight === posAbs) cls += ' destacada';
        body += '<span class="' + cls + '">' + groups[g][j] + '</span>';
      }
      if (g > 0) html += '<span class="cifra-sep">' + separadorMiles() + '</span>';
      html += body;
    }
    return html;
  }

  function number(n, opts) {
    opts = opts || {};
    return '<span class="num-color">' + digits(n, opts.highlight) + '</span>';
  }

  function sign(s) { return '<span class="signo">' + s + '</span>'; }

  /* ---- Numeric options (3, unique, shuffled) ---- */

  function buildOptions(correct, distractors, format) {
    var values = [correct];
    for (var i = 0; i < distractors.length && values.length < 3; i++) {
      var d = distractors[i];
      if (d > 0 && values.indexOf(d) === -1) values.push(d);
    }
    var extra = correct + 2;
    while (values.length < 3) {
      if (values.indexOf(extra) === -1) values.push(extra);
      extra += 3;
    }
    return App.utils.shuffle(values).map(function (v) {
      return { html: format ? format(v) : String(v), correct: v === correct };
    });
  }

  function repeat(html, times) {
    var s = '';
    for (var i = 0; i < times; i++) s += html;
    return s;
  }

  function dotsGroup(n, cls) {
    return '<span class="grupo-puntos">' + repeat('<span class="punto ' + cls + '"></span>', n) + '</span>';
  }

  /* Dots to subtract: the last "remove" ones get an X. */
  function dotsGroupSubtract(total, remove) {
    var s = '';
    for (var i = 0; i < total; i++) {
      var cls = i >= (total - remove) ? 'punto quitado' : 'punto';
      s += '<span class="' + cls + '"></span>';
    }
    return '<span class="grupo-puntos">' + s + '</span>';
  }

  /* ============================================================
     Question generators (one per level type)
     Return: enunciado, visual (html), leyenda,
     opciones[{html, correcta, aria?}], pista?, enFila?, visualAria?
     ============================================================ */

  var GENERATORS = {

    restar: function (nv) {
      var a = ri(nv.a[0], nv.a[1]);
      var b = ri(1, Math.min(nv.maxB, a));
      var correct = a - b;
      return {
        enunciado: App.i18n.t('gen.restarEnunciado').replace('{a}', a).replace('{b}', b),
        visual: '<div class="expresion">' + number(a) + sign('−') + number(b) +
          sign('=') + '<span class="caja-num hueco">?</span></div>' +
          '<div class="puntos" aria-hidden="true">' + dotsGroupSubtract(a, b) + '</div>' +
          '<p class="pista">' + App.i18n.t('gen.restarPista').replace('{b}', b) + '</p>',
        opciones: buildOptions(correct, [correct - 1, correct + 1, a],
          function (v) { return number(v); })
      };
    },

    doubles: function () {
      var a = ri(2, 12);
      return {
        enunciado: App.i18n.t('gen.doblesEnunciado').replace(/\{a\}/g, a),
        visual: '<div class="expresion">' + number(a) + sign('+') + number(a) +
          sign('=') + '<span class="caja-num hueco">?</span></div>' +
          '<div class="puntos" aria-hidden="true">' + dotsGroup(a, 'pa') +
          sign('+') + dotsGroup(a, 'pb') + '</div>' +
          '<p class="pista">' + App.i18n.t('gen.doblesPista') + '</p>',
        opciones: buildOptions(2 * a, [2 * a - 1, 2 * a + 2, 2 * a + 1],
          function (v) { return number(v); })
      };
    },

    sumLarge: function (nv) {
      var n, highlight, hint;
      if (nv.suma === 10) {
        n = ri(1, 8) * 10 + ri(1, 9);
        if (Math.random() < 0.4) n += ri(1, 4) * 100;
        highlight = 1;
        hint = App.i18n.t('gen.pistaDecenas');
      } else if (nv.suma === 100) {
        n = ri(1, 8) * 100 + ri(0, 99);
        highlight = 2;
        hint = App.i18n.t('gen.pistaCentenas');
      } else {
        n = ri(1, 8) * 1000 + ri(0, 999);
        highlight = 3;
        hint = App.i18n.t('gen.pistaMiles');
      }
      var correct = n + nv.suma;
      return {
        enunciado: App.i18n.t('gen.sumaGrandeEnunciado').replace('{n}', n).replace('{suma}', nv.suma),
        visual: '<div class="expresion">' + number(n, { highlight: highlight }) +
          sign('+') + number(nv.suma) + sign('=') +
          '<span class="caja-num hueco">?</span></div>' +
          '<p class="pista">' + hint + '</p>',
        leyenda: legendPos(),
        opciones: buildOptions(correct,
          App.utils.shuffle([n + 1, n + nv.suma * 2, correct + nv.suma / 10]),
          function (v) { return number(v); })
      };
    },

    subtractLarge: function (nv) {
      var n, highlight, hint;
      if (nv.resta === 10) {
        n = ri(1, 8) * 10 + ri(1, 9);
        if (Math.random() < 0.4) n += ri(1, 4) * 100;
        highlight = 1;
        hint = App.i18n.t('gen.pistaDecenas');
      } else if (nv.resta === 100) {
        n = ri(1, 8) * 100 + ri(0, 99);
        highlight = 2;
        hint = App.i18n.t('gen.pistaCentenas');
      } else {
        n = ri(1, 8) * 1000 + ri(0, 999);
        highlight = 3;
        hint = App.i18n.t('gen.pistaMiles');
      }
      var correct = n - nv.resta;
      return {
        enunciado: App.i18n.t('gen.restaGrandeEnunciado').replace('{n}', n).replace('{resta}', nv.resta),
        visual: '<div class="expresion">' + number(n, { highlight: highlight }) +
          sign('−') + number(nv.resta) + sign('=') +
          '<span class="caja-num hueco">?</span></div>' +
          '<p class="pista">' + hint + '</p>',
        leyenda: legendPos(),
        opciones: buildOptions(correct,
          App.utils.shuffle([n - 1, correct - nv.resta, n + nv.resta]),
          function (v) { return number(v); })
      };
    },

    multiplyLarge: function (nv) {
      var n = ri(2, 99);
      var correct = n * nv.factor;
      var zeros = App.i18n.t(nv.factor === 10 ? 'gen.cerosUno' : 'gen.cerosDos');
      var distractors = nv.factor === 10 ?
        [n, n * 100, correct + 1] :
        [n, n * 10, correct + 10];
      return {
        enunciado: App.i18n.t('gen.multiplicaGrandeEnunciado').replace('{n}', n).replace('{factor}', nv.factor),
        visual: '<div class="expresion">' + number(n) + sign('×') + number(nv.factor) +
          sign('=') + '<span class="caja-num hueco">?</span></div>' +
          '<p class="pista">' + App.i18n.t('gen.multiplicaGrandePista').replace('{ceros}', zeros).replace('{n}', n) + '</p>',
        opciones: buildOptions(correct, App.utils.shuffle(distractors),
          function (v) { return number(v); })
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

  /* ---- Levels for an activity ---- */
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
    idx = 0;
    roundCorrect = 0;
    reinforceList = [];
    reinforceIndex = 0;
    inReinforce = false;
    App.reinforce.banner.hide();
    /* Reinforce: registers the callback that runs when the
       normal round ends with pending failures. The callback
       launches the mini-round with the failed questions. */
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    show(screenGame);
    render();
  }

  /* Launches the reinforce mini-round with the failed questions.
     Each activity decides how to render the mini-round: here
     we reuse render with the fixed question (instead of
     regenerating it randomly). Stars already earned are not
     taken away; the normal round progress is recorded and
     only reset when the mini-round ends. */
  function startReinforce(fallos) {
    reinforceList = fallos.map(function (f) { return f.payload; });
    reinforceIndex = 0;
    inReinforce = true;
    attempts = 0;
    App.reinforce.banner.set(
      App.i18n.t('refuerzoTitulo') + ' — ' +
      App.i18n.t('refuerzoIntro').replace('{n}', reinforceList.length)
    );
    showReinforceQuestion(reinforceList[0]);
  }

  /* Helper: renders a fixed question (from the reinforce queue)
     using the same visual flow as render() but without
     regenerating it with Math.random. The progress bar uses
     reinforceIndex+1 / length to show how much is left. */
  function showReinforceQuestion(p) {
    question = p;
    answered = false;
    attempts = 0;
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
    progressFill.style.width = (((reinforceIndex + 1) / reinforceList.length) * 100) + '%';
    progressText.textContent = (reinforceIndex + 1) + ' / ' + reinforceList.length;
    paintStars();
  }

  function render() {
    answered = false;
    attempts = 0;
    question = GENERATORS[level.tipo](level, idx);

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

    progressFill.style.width = ((idx / DATA.perRound) * 100) + '%';
    progressText.textContent = idx + ' / ' + DATA.perRound;
    paintStars();
  }

  /* Extracts the visible text from an option.html (may contain inner <span> elements) */
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
    if (answered) return;
    if (op.correct) {
      showExplanation(op.correct);
      answered = true;
      btn.classList.add('correcta');
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      App.utils.$$('#opciones .btn-opcion').forEach(function (b) { b.disabled = true; });
      btnNext.classList.remove('oculto');
      btnNext.focus();
    } else {
      attempts += 1;
      /* Reinforce: registers the failure the first time (retries
         on the same item are not duplicated, see deduplication in
         feedback.js). In mini-round it is also registered, in case
         the same item is failed again within the reinforce. */
      App.reinforce.add(level.id + ':' + idx, question);
      if (attempts === 1) {
        showHint();
      } else {
        showExplanation(op.correct);
      }
      btn.classList.add('animo');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#opciones .btn-opcion'), explanationWrap);
    }
  }

  function next() {
    /* Reinforce: if we are in a mini-round, advance to the next
       reinforce item or close the mini-round and go to the
       endScreen. Stars were already added when each item was
       answered; roundCorrect is not incremented here (it is the
       counter for the normal round). */
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
    idx += 1;
    if (idx >= DATA.perRound) {
      /* consume() returns [] if there are no failures and fires the
         callback (which mounts the mini-round) if there are. If
         consume() fired the callback, we must not end the normal
         round — the callback already handles it. */
      var consumeResult = App.reinforce.consume();
      if (consumeResult.length === 0) endRound();
    } else {
      render();
    }
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
