/* ============================================================
   Calculia — Numbers (read, order and place numbers)
   Data and levels in data.js. Shared modules in assets/js/.
   Each digit is painted according to its place: blue units,
   green tens, purple hundreds. The decimal separator, cents and
   signs use orange. Large numbers carry group labels (thousands,
   millions… up to billions).
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'numbers';
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

  /* Reinforce: see core in assets/js/feedback.js (App.reinforce).
     fixedQuestion allows reusing render() with an external question
     (the reinforcement one); if null, render() generates a new one
     as before. inReinforce controls the mini-round flow. */
  var fixedQuestion = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  var reinforceTotal = 0;
  /* Round state */
  var activity = null;
  var level = null;
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var question = null;
  var pools = {};

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

  /* ---- Color-coded digits by place value ---- */

  var POS_CLASS = ['cifra-u', 'cifra-d', 'cifra-c'];

  /* Thousands separator ('.' is / ',' in) and decimal (',' is / '.' in).
     Not only styling: switching the separator between locales is
     mandatory so the paintNumber reads correctly (see I18N.md §2). */
  function thousandsSeparator() { return App.i18n.locale() === 'en' ? ',' : '.'; }

  function legendPos() {
    return '<span class="digit-u">' + App.i18n.t('leyendaUnidadesTxt') + '</span> · ' +
      '<span class="digit-d">' + App.i18n.t('leyendaDecenasTxt') + '</span> · ' +
      '<span class="digit-c">' + App.i18n.t('leyendaCentenasTxt') + '</span>';
  }

  /* html for the digits of n. highlight: place (0=units, 1=tens…)
     that gets underlined. labels: group labels (thousands, millions…). */
  function digits(n, labels, highlight) {
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
      if (g > 0) html += '<span class="digit-sep">' + thousandsSeparator() + '</span>';
      if (labels && groups.length > 1) {
        html += '<span class="group"><span>' + body + '</span>' +
          '<span class="group-label">' + (App.i18n.t('grupoEtq.' + (groups.length - 1 - g)) || '&nbsp;') + '</span></span>';
      } else {
        html += body;
      }
    }
    return html;
  }

  function paintNumber(n, opts) {
    opts = opts || {};
    return '<span class="num-color">' + digits(n, opts.labels, opts.highlight) + '</span>';
  }

  function paintSign(s) { return '<span class="paintSign">' + s + '</span>'; }

  /* ---- Elevator (negative numbers) ---- */

  function floorHTML(n) {
    return n < 0 ? paintSign('−') + paintNumber(Math.abs(n)) : paintNumber(n);
  }

  /* Plain-text floor label (used for 'enunciado', which is set via
     textContent, not innerHTML — no markup allowed there). */
  function floorPlain(n) {
    return (n < 0 ? '−' : '') + Math.abs(n);
  }

  function legendElevator() {
    return '<span class="digit-u">' + App.i18n.t('leyendaPlantaBajaTxt') + '</span> · ' +
      '<span class="digit-pos">' + App.i18n.t('leyendaEscalaPositivaTxt') + '</span> · ' +
      '<span class="digit-comma">' + App.i18n.t('leyendaEscalaNegativaTxt') + '</span>';
  }

  /* Vertical shaft visual (decorative, aria-hidden — the accessible
     description lives in 'visualAria', not here, same as the dot
     visuals below). markers: [{ floor, icon, clase }], one row per
     floor. */
  function shaftHTML(min, max, markers) {
    var porPiso = {};
    markers.forEach(function (m) {
      (porPiso[m.floor] = porPiso[m.floor] || []).push(m);
    });
    var filas = '';
    for (var n = max; n >= min; n--) {
      var clases = 'piso-fila';
      var contenido = '';
      if (n === 0) {
        clases += ' piso-suelo';
        contenido += '<span class="floor-icon">🏠</span>';
      }
      (porPiso[n] || []).forEach(function (m) {
        clases += ' ' + (m.clase || 'piso-marca');
        contenido += '<span class="floor-icon">' + m.icon + '</span>';
      });
      filas += '<div class="' + clases + '">' + contenido + '</div>';
    }
    return '<div class="elevator-shaft" aria-hidden="true">' + filas + '</div>';
  }

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

  /* ============================================================
     Question generators (one per level type)
     Return: enunciado, visual (html), leyenda,
     opciones[{html, correct, aria?}], pista?, enFila?, visualAria?
     ============================================================ */

  var GENERATORS = {

    /* Read the elevator's floor, including floors below ground (negative
       numbers). The visual (shaft) is decorative; 'visualAria' states
       the same fact in words ("N floors up/down from the ground floor")
       so the question is answerable without seeing the shaft. */
    ascensorLeer: function (nv) {
      var floor = randInt(nv.min, nv.max);
      var situacion = floor === 0 ? App.i18n.t('gen.ascensorLeerSituacionSuelo') :
        (floor > 0 ? App.i18n.t('gen.ascensorLeerSituacionArriba').replace('{n}', floor) :
          App.i18n.t('gen.ascensorLeerSituacionAbajo').replace('{n}', Math.abs(floor)));
      var candidates = App.utils.shuffle([floor - 1, floor + 1, floor - 2, floor + 2]
        .filter(function (v) { return v !== floor; }));
      var values = [floor];
      for (var i = 0; i < candidates.length && values.length < 3; i++) {
        if (values.indexOf(candidates[i]) === -1) values.push(candidates[i]);
      }
      return {
        prompt: App.i18n.t('gen.ascensorLeerEnunciado'),
        visual: shaftHTML(nv.min, nv.max, [{ floor: floor, icon: '🛗', clase: 'piso-actual' }]),
        legend: legendElevator(),
        options: App.utils.shuffle(values).map(function (v) {
          return { html: floorHTML(v), correct: v === floor };
        })
      };
    },

    /* Start floor + move up/down N floors = end floor. 'inicio' is kept
       away from both edges so there's always room to move in either
       direction (rule 13: only 'delta'/direction vary per question,
       not the range). */
    ascensorMover: function (nv) {
      var start = randInt(nv.min + 1, nv.max - 1);
      var subir = Math.random() < 0.5;
      var available = subir ? (nv.max - start) : (start - nv.min);
      var delta = randInt(1, Math.max(1, Math.min(4, available)));
      var end = subir ? start + delta : start - delta;
      var keyPrefix = subir ? 'gen.ascensorMoverSube' : 'gen.ascensorMoverBaja';
      var candidates = App.utils.shuffle([end - 1, end + 1, start]
        .filter(function (v) { return v !== end; }));
      var values = [end];
      for (var i = 0; i < candidates.length && values.length < 3; i++) {
        if (values.indexOf(candidates[i]) === -1) values.push(candidates[i]);
      }
      return {
        prompt: App.i18n.t(keyPrefix + 'Enunciado').replace('{inicio}', floorPlain(start)).replace('{delta}', delta),
        visual: shaftHTML(nv.min, nv.max, [{ floor: start, icon: '🛗', clase: 'piso-actual' }]) +
          '<p class="hint-arrow" aria-hidden="true">' + (subir ? '⬆️' : '⬇️') + ' ' + delta + '</p>',
        legend: legendElevator(),
        options: App.utils.shuffle(values).map(function (v) {
          return { html: floorHTML(v), correct: v === end };
        })
      };
    },

    /* Compare two floors: which is lower/higher. Only 2 real candidates
       exist, so opciones has 2 (accessibility rule 11 sets a maximum of
       3, not a fixed count). */
    ascensorComparar: function (nv) {
      var a = randInt(nv.min, nv.max);
      var b;
      do { b = randInt(nv.min, nv.max); } while (b === a);
      var abajo = Math.random() < 0.5;
      var correct = abajo ? Math.min(a, b) : Math.max(a, b);
      var keyPrefix = abajo ? 'gen.ascensorCompararAbajo' : 'gen.ascensorCompararArriba';
      return {
        prompt: App.i18n.t(keyPrefix + 'Enunciado'),
        visual: shaftHTML(nv.min, nv.max, [
          { floor: a, icon: '🛗', clase: 'piso-actual' },
          { floor: b, icon: '🚩', clase: 'piso-marca' }
        ]),
        legend: legendElevator(),
        options: [
          { html: floorHTML(a), correct: a === correct },
          { html: floorHTML(b), correct: b === correct }
        ]
      };
    },

    /* "Place it in its spot": given a floor NUMBER, find which lettered
       spot on the shaft matches it, among 2 nearby decoys. This is the
       inverse of ascensorLeer (there the shaft is given and the paintNumber
       is guessed; here the paintNumber is given and the spot is guessed). */
    ascensorColocar: function (nv) {
      var floor = randInt(nv.min, nv.max);
      var candidates = App.utils.shuffle([floor - 2, floor - 1, floor + 1, floor + 2]
        .filter(function (v) { return v >= nv.min && v <= nv.max && v !== floor; })).slice(0, 2);
      var letters = ['A', 'B', 'C'];
      var markers = App.utils.shuffle([floor].concat(candidates)).map(function (f, i) {
        return { floor: f, icon: letters[i], clase: 'piso-opcion' };
      });
      return {
        prompt: App.i18n.t('gen.ascensorColocarEnunciado').replace('{piso}', floorPlain(floor)),
        visual: shaftHTML(nv.min, nv.max, markers),
        legend: legendElevator(),
        options: markers.map(function (m) {
          return {
            html: m.icon,
            aria: App.i18n.t('gen.ascensorColocarOpcionAria').replace('{l}', m.icon),
            correct: m.floor === floor
          };
        })
      };
    },

    bloques: function (nv) {
      var n = nv.max === 99 ? randInt(11, 99) : randInt(111, 999);
      var c = Math.floor(n / 100);
      var d = Math.floor((n % 100) / 10);
      var u = n % 10;
      var parts = [];
      if (c) parts.push(c + ' ' + App.i18n.t(c === 1 ? 'centenaSingular' : 'centenaPlural'));
      if (d) parts.push(d + ' ' + App.i18n.t(d === 1 ? 'decenaSingular' : 'decenaPlural'));
      if (u) parts.push(u + ' ' + App.i18n.t(u === 1 ? 'unidadSingular' : 'unidadPlural'));
      var conjunction = App.i18n.locale() === 'en' ? ' and $1' : ' y $1';
      var text = parts.join(', ').replace(/, ([^,]+)$/, conjunction);
      var html = '<div class="blocks">';
      if (c) html += '<span class="blocks-group">' + repeat('<span class="block-100">100</span>', c) + '</span>';
      if (d) html += '<span class="blocks-group">' + repeat('<span class="block-10">10</span>', d) + '</span>';
      if (u) html += '<span class="blocks-group">' + repeat('<span class="block-1"></span>', u) + '</span>';
      html += '</div>';
      var swapped = c * 100 + u * 10 + d; /* tens and units swapped */
      return {
        prompt: App.i18n.t('gen.bloquesEnunciado'),
        visual: html,
        visualAria: App.i18n.t('gen.bloquesVisualAria').replace('{text}', text),
        legend: legendPos(),
        options: buildOptions(n,
          App.utils.shuffle([swapped !== n ? swapped : n + 1, n + 10, n - 10, n + 1]),
          function (v) { return paintNumber(v); })
      };
    },

    lectura: function (nv, i) {
      var list = DATA.lecturas[App.i18n.locale()][nv.lista];
      var item = draw(nv.lista, list);
      var others = App.utils.shuffle(list.filter(function (o) { return o.n !== item.n; })).slice(0, 2);
      var note = item.nota ? '<p class="hint">' + item.nota + '</p>' : '';
      if (i % 2 === 0) {
        /* paintNumber → words */
        return {
          prompt: App.i18n.t('gen.lecturaEnunciadoNumASim'),
          visual: '<div class="visual-number">' + paintNumber(item.n, { labels: true }) + '</div>' + note,
          legend: legendPos(),
          options: App.utils.shuffle([{ html: item.palabras, correct: true }].concat(
            others.map(function (o) { return { html: o.palabras, correct: false }; })
          ))
        };
      }
      /* words → paintNumber */
      return {
        prompt: App.i18n.t('gen.lecturaEnunciadoSimANum'),
        visual: '<p class="words-number">' + item.palabras + '</p>' + note,
        legend: legendPos(),
        options: App.utils.shuffle([{ html: paintNumber(item.n), correct: true }].concat(
          others.map(function (o) { return { html: paintNumber(o.n), correct: false }; })
        ))
      };
    },

    /* Place-value exchange: 10 of one kind become 1 of the next
       (units→tens, tens→hundreds, hundreds→thousands). Even questions
       group small blocks into framed tens; odd questions go the other
       way (how many small ones make these big blocks?). */
    canje: function (nv, i) {
      var blocks = [
        '<span class="block-1"></span>',
        '<span class="block-10">10</span>',
        '<span class="block-100">100</span>',
        '<span class="block-1000">1' + thousandsSeparator() + '000</span>'
      ];
      var hint = App.i18n.t('gen.canjePista' + nv.lugar);
      if (i % 2 === 0) {
        /* Big blocks get large fast: fewer groups for bigger places. */
        var k = randInt(2, [5, 4, 3][nv.lugar]);
        var n = k * 10;
        var statement = App.i18n.t('gen.canjeDirecto' + nv.lugar).replace('{n}', n);
        return {
          prompt: statement,
          visual: '<div class="blocks">' +
            repeat('<span class="trade-group">' + repeat(blocks[nv.lugar], 10) + '</span>', k) +
            '</div><p class="hint">' + hint + '</p>',
          visualAria: App.i18n.t('gen.canjeAriaDirecto').replace('{k}', k),
          legend: legendPos(),
          options: buildOptions(k, [n, k + 1, k - 1],
            function (v) { return paintNumber(v); })
        };
      }
      var kInv = randInt(2, 9);
      var statementInv = App.i18n.t('gen.canjeInverso' + nv.lugar).replace('{k}', kInv);
      return {
        prompt: statementInv,
        visual: '<div class="blocks"><span class="blocks-group">' +
          repeat(blocks[nv.lugar + 1], kInv) +
          '</span></div><p class="hint">' + hint + '</p>',
        visualAria: App.i18n.t('gen.canjeAriaInverso').replace('{k}', kInv),
        legend: legendPos(),
        options: buildOptions(kInv * 10, [kInv, kInv * 10 + 10, (kInv - 1) * 10],
          function (v) { return paintNumber(v); })
      };
    },

    /* ×10 ladder: multiplying a power of ten by 10 moves every digit
       one place left, up to 10^12 (un billón / one trillion). The
       exponent range gives exactly 6 rungs per level, so a round
       walks the whole ladder without repeats. */
    escalera: function (nv) {
      var exponents = [];
      for (var e = nv.minExp; e <= nv.maxExp; e++) exponents.push(e);
      var exp = draw('esc' + nv.id, exponents);
      var n = Math.pow(10, exp);
      var correct = n * 10;
      return {
        prompt: App.i18n.t('gen.escaleraEnunciado'),
        visual: '<div class="expression">' + paintNumber(10) + paintSign('×') +
          paintNumber(n, { labels: true }) + paintSign('=') +
          '<span class="num-box empty">?</span></div>' +
          '<p class="hint">' + App.i18n.t('gen.escaleraPista') + '</p>',
        legend: legendPos(),
        options: buildOptions(correct, [n, correct * 10],
          function (v) { return paintNumber(v); })
      };
    },

    /* Previously this mode was audio-only (without showing the paintNumber).
       Now that the activity has no audio, we show the paintNumber with
       coloured digits so the person can read it and choose. */
    dictado: function (nv) {
      var n = randInt(11, nv.max);
      var candidates = App.utils.shuffle(
        [n - 10, n + 10, n - 1, n + 1, n + 2].filter(function (x) { return x > 0 && x !== n; })
      );
      return {
        prompt: App.i18n.t('gen.dictadoEnunciado'),
        visual: '<div class="visual-number">' + paintNumber(n, { labels: true }) + '</div>',
        options: buildOptions(n, candidates, function (v) { return paintNumber(v); })
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
    legendEl.classList.toggle('oculto', !question.legend);

    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('oculto');
    explanationEl.textContent = '';
    btnNext.classList.add('oculto');

    optionsEl.innerHTML = '';
    optionsEl.classList.toggle('opciones-fila', !!question.inline);
    question.options.forEach(function (op) {
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
      App.utils.$$('#opciones .btn-opcion').forEach(function (b) { b.disabled = true; });
      btnNext.classList.remove('oculto');
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
      App.feedback.lockUntilAck(App.utils.$$('#opciones .btn-opcion'), explanationWrap);
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

    var levelIndex = activity.levels.indexOf(level);
    var nextLevel = (roundCorrect === DATA.perRound && levelIndex !== -1 && levelIndex + 1 < activity.levels.length)
      ? activity.levels[levelIndex + 1] : null;
    var btnHarder = $('#btnHarder');
    if (nextLevel) {
      btnHarder.textContent = App.i18n.t('btnHarder').replace('{nombre}', App.i18n.t('level.' + nextLevel.id));
      btnHarder.classList.remove('oculto');
      btnHarder.onclick = function () { startRound(nextLevel); };
    } else {
      btnHarder.classList.add('oculto');
    }
  }

  /* ---- Events ---- */

  $('#btnBackToMenu').addEventListener('click', function () { show(screenMenu); });
  $('#btnRepeat').addEventListener('click', function () { startRound(level); });
  $('#btnOtherLevel').addEventListener('click', function () { openActivity(activity.id); });
  $('#btnOtherActivity').addEventListener('click', function () { show(screenMenu); });

  $('#noteExtra').innerHTML = App.i18n.t('notaTablas')
    .replace('{link}', '<a href="../math-tables/index.html">' + App.i18n.t('notaTablasLink') + '</a>');

  paintMenu();
  paintStars();
})();
