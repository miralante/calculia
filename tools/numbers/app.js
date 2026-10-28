/* ============================================================
   Calculia — Numbers (read, order and place numbers)
   Data and levels in data.js. Shared modules in assets/js/.
   Each digit is painted according to its place: blue units,
   green tens, purple hundreds. The decimal separator, cents and
   signs use orange. Large numbers carry group labels (thousands,
   millions⬦ up to billions).
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
  var signedIntroScreen = $('#signedIntroScreen');
  var signedRealScreen = $('#signedRealScreen');
  var signedTempScreen = $('#signedTempScreen');
  /* Generic exposition + real-life screens, reused by the 5 sub-activities
     that flag DATA.<act>.hasExpoReal = true. Content painted from strings
     keyed by the current sub-activity id. */
  var screenExpo = $('#expoScreen');
  var screenReal = $('#realScreen');
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
  var progressBar = $('#progressBar');
  var quizCard = $('#quizCard');
  /* Free-exploration counter level (see data.js: 'counter'). These
     refs are populated for every level; render() hides the whole
     #counterUI block when the level isn't a counter. */
  var counterUI = $('#counterUI');
  var counterNumber = $('#counterNumber');
  var counterSep = $('#counterSep');
  var counterSepLabel = $('#counterSepLabel');
  var counterAudio = $('#counterAudio');
  var counterReset = $('#counterReset');
  var counterExit = $('#counterExit');
  var counterHint = $('#counterHint');
  var counterGroups = $('#counterGroups');
  var counterGroupsLabel = $('#counterGroupsLabel');
  var counterWords = $('#counterWords');
  var counterWordsLabel = $('#counterWordsLabel');
  var counterWritten = $('#counterWritten');
  /* Free-exploration elevator level (see data.js: 'ascensorLibre' /
     'ascensorMeta'). Same mechanic as the water-temperature tool:
     ——10/——1/+1/+10 buttons, the visual reacts on every step. */
  var elevatorUI = $('#elevatorUI');
  var elevatorGoal = $('#elevatorGoal');
  var elevatorShaft = $('#elevatorShaft');
  var elevatorNumber = $('#elevatorNumber');
  var elevatorStateLabel = $('#elevatorStateLabel');
  var elevatorAudio = $('#elevatorAudio');
  var elevatorReset = $('#elevatorReset');
  var elevatorExit = $('#elevatorExit');
  var elevatorHint = $('#elevatorHint');
  /* Interactive "leer números" level (see data.js: 'lecturaInput').
     The flow is: a "Generate" button reveals a number in words;
     the user types the numeric form; "Comprobar" validates, "Ver
     resultado" fills the input with the correct answer (so the
     user can study it or correct from there). Same round shape as
     the other quiz levels: 6 questions, +1 star per correct
     "Comprobar" answer. */
  var lecturaUI = $('#lecturaUI');
  var lecturaWords = $('#lecturaWords');
  var lecturaInput = $('#lecturaInput');
  var lecturaGenerate = $('#lecturaGenerate');
  var lecturaCheck = $('#lecturaCheck');
  var lecturaReveal = $('#lecturaReveal');
  var lecturaNext = $('#lecturaNext');
  var lecturaHint = $('#lecturaHint');
  /* Interactive "escribir números" level (see data.js: 'escribirInput').
     Sibling of #lecturaUI with the same shape: a "Generar" button,
     a wide input, "Comprobar" / "Ver resultado" / "Siguiente". The
     difference is that "Generar" plays the number aloud via Web
     Speech (no visual representation), and a "🔊 Reproducir" button
     replays the audio so the user can hear it again before
     answering. */
  var escribirUI = $('#escribirUI');
  var escribirNumber = $('#escribirNumber');
  var escribirInput = $('#escribirInput');
  var escribirGenerate = $('#escribirGenerate');
  var escribirReplay = $('#escribirReplay');
  var escribirCheck = $('#escribirCheck');
  var escribirReveal = $('#escribirReveal');
  var escribirNext = $('#escribirNext');
  var escribirHint = $('#escribirHint');
  /* Random exploration suggestion. Painted by paintElevatorSuggestion
     on every render (entry, reset, "play again"). Same pattern as
     the temperature tool's #thermoSuggestion. */
  var elevatorSuggestion = $('#elevatorSuggestion');
  var signedNumberline = $('#signedNumberline');
  var signedRealList = $('#signedRealList');
  var signedTempGoal = $('#signedTempGoal');
  var signedTempNumber = $('#signedTempNumber');
  var signedTempSign = $('#signedTempSign');
  var signedTempMercury = $('#signedThermometerMercury');
  var signedTempSuccess = $('#signedTempSuccess');
  var signedTempNext = $('#signedTempNext');
  var signedTempReset = $('#signedTempReset');

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;
  if (typeof progress.signedRounds !== 'number') progress.signedRounds = 0;
  var legacySignedProgress = App.storage.get('posneg');
  if (!progress.signedLegacyMigrated &&
      (typeof legacySignedProgress.stars === 'number' ||
       typeof legacySignedProgress.completedRounds === 'number')) {
    var migratedProgress = Object.assign({}, progress);
    migratedProgress.stars += legacySignedProgress.stars || 0;
    migratedProgress.signedRounds = Math.max(
      migratedProgress.signedRounds,
      legacySignedProgress.completedRounds || 0
    );
    migratedProgress.signedLegacyMigrated = true;
    if (App.storage.set(TOOL_ID, migratedProgress)) {
      progress = migratedProgress;
      App.storage.remove('posneg');
    }
  }

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
  var resolved = false;
  var signedTempLevelIndex = 0;
  var signedTempValue = 0;
  var signedTempMission = null;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Utilidades ---- */

  function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  /* Pick a random integer in [min, max] inclusive, avoiding
     `avoid`. Used by paintElevatorSuggestion to pick a starting
     floor that is not where the elevator already is. Up to 8
     attempts so a near-full range still finds a different value. */
  function pickRandomInt(min, max, avoid) {
    if (max <= min) return min;
    var range = max - min + 1;
    for (var i = 0; i < 8; i++) {
      var v = min + Math.floor(Math.random() * range);
      if (v !== avoid) return v;
    }
    return min;
  }

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  /* ---- Color-coded digits by place value ---- */

  var POS_CLASS = ['digit-u', 'digit-d', 'digit-c'];

  /* Thousands separator ('.' is / ',' in) and decimal (',' is / '.' in).
     Not only styling: switching the separator between locales is
     mandatory so the paintNumber reads correctly (see I18N.md §2). */
  function thousandsSeparator() { return App.i18n.locale() === 'en' ? ',' : '.'; }

  function legendPos() {
    return '<span class="digit-u">' + App.i18n.t('leyendaUnidadesTxt') + '</span> · ' +
      '<span class="digit-d">' + App.i18n.t('leyendaDecenasTxt') + '</span> · ' +
      '<span class="digit-c">' + App.i18n.t('leyendaCentenasTxt') + '</span>';
  }

  /* html for the digits of n. highlight: place (0=units, 1=tens⬦)
     that gets underlined. labels: group labels (thousands, millions⬦). */
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
        if (highlight === posAbs) cls += ' highlight';
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

  function paintSign(s) { return '<span class="sign">' + s + '</span>'; }

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

  /* n drawn with this tool's own place-value blocks (hundred squares, ten
     bars, single units), so two quantities can be compared by looking
     before they are compared as digits. */
  function numberAsBlocks(n) {
    return repeat('<span class="block-100">100</span>', Math.floor(n / 100)) +
      repeat('<span class="block-10">10</span>', Math.floor((n % 100) / 10)) +
      repeat('<span class="block-1"></span>', n % 10);
  }

  /* ============================================================
     Question generators (one per level type)
     Return: prompt, visual (html), legend,
     options[{html, correct, aria?}], hint?, enFila?, visualAria?
     ============================================================ */

  var GENERATORS = {

    /* Free-exploration elevator missions (positivos-y-negativos).
       Not a quiz, no prompt/options. Each generator returns a marker
       that render() detects to switch into the elevator UI
       (renderElevator). 'libre' has no target — exit when ready
       (+1 star). 'meta' has a target floor (level.meta); a
       celebration message plays once the user lands on it, then
       exit still grants the star. Same shape as the 'counter'
       generator and the water-temperature missions. */
    ascensorLibre: function (nv) {
      return { tipo: 'elevator', mode: 'libre', min: nv.min, max: nv.max };
    },
    ascensorMeta: function (nv) {
      return {
        tipo: 'elevator',
        mode: 'meta',
        min: nv.min,
        max: nv.max,
        target: nv.meta,
        inicio: (typeof nv.inicio === 'number') ? nv.inicio : 0
      };
    },

    

    

    /* The signs <, > and =. The relation is picked FIRST
       and the pair built to match it, so the three signs come up equally
       often and the answer can never be guessed by always choosing one.
       The rule taught is checkable rather than a mnemonic: the sign opens
       towards the bigger number. */
    comparar: function (nv) {
      var relations = ['lt', 'gt', 'eq'];
      var rel = relations[randInt(0, 2)];
      var a = randInt(nv.min, nv.max);
      var b;
      if (rel === 'eq') {
        b = a;
      } else {
        do { b = randInt(nv.min, nv.max); } while (b === a);
        /* Swap so the pair actually shows the relation that was drawn. */
        if ((rel === 'lt') !== (a < b)) { var swap = a; a = b; b = swap; }
      }
      var sign = rel === 'eq' ? '=' : (a < b ? '<' : '>');

      var blocksHtml = '';
      if (nv.blocks) {
        blocksHtml = '<div class="blocks compare-blocks">' +
          '<span class="blocks-group">' + numberAsBlocks(a) + '</span>' +
          '<span class="blocks-group">' + numberAsBlocks(b) + '</span>' +
          '</div>';
      }

      return {
        prompt: App.i18n.t('gen.compararEnunciado'),
        visual: '<div class="compare-row">' +
          '<span class="compare-side">' + paintNumber(a) + '</span>' +
          '<span class="compare-gap">?</span>' +
          '<span class="compare-side">' + paintNumber(b) + '</span>' +
          '</div>' + blocksHtml +
          '<p class="hint">' + App.i18n.t('gen.compararPista') + '</p>',
        visualAria: App.i18n.t('gen.compararAria').replace('{a}', a).replace('{b}', b),
        hint: App.i18n.t('gen.socraticCompare'),
        options: App.utils.shuffle([
          { html: '<span class="compare-sign">&lt;</span>', aria: App.i18n.t('gen.signLess'), correct: sign === '<' },
          { html: '<span class="compare-sign">&gt;</span>', aria: App.i18n.t('gen.signGreater'), correct: sign === '>' },
          { html: '<span class="compare-sign">=</span>', aria: App.i18n.t('gen.signEqual'), correct: sign === '=' }
        ]),
        inline: true
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
        hint: App.i18n.t('gen.socraticBlocks'),
        options: buildOptions(n,
          App.utils.shuffle([swapped !== n ? swapped : n + 1, n + 10, n - 10, n + 1]),
          function (v) { return paintNumber(v); })
      };
    },

    /* Place-value exchange: 10 of one kind become 1 of the next
       (units— tens, tens— hundreds, hundreds— thousands). Even questions
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
          hint: App.i18n.t('gen.socraticTradeUp'),
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
        hint: App.i18n.t('gen.socraticTradeDown'),
        options: buildOptions(kInv * 10, [kInv, kInv * 10 + 10, (kInv - 1) * 10],
          function (v) { return paintNumber(v); })
      };
    },

    /* —10 ladder: multiplying a power of ten by 10 moves every digit
       one place left, up to 10^12 (un billón / one trillion). The
       exponent range gives exactly 6 rungs per level, so a round
       walks the whole ladder without repeats. */
    escalera: function (nv) {
      var exponents = [];
      for (var e = nv.minExp; e <= nv.maxExp; e++) exponents.push(e);
      var exp = App.utils.drawRound('esc' + nv.id, exponents);
      var n = Math.pow(10, exp);
      var correct = n * 10;
      return {
        prompt: App.i18n.t('gen.escaleraEnunciado'),
        hint: App.i18n.t('gen.socraticLadder'),
        visual: '<div class="expression">' + paintNumber(10) + paintSign('—') +
          paintNumber(n, { labels: true }) + paintSign('=') +
          '<span class="num-box empty">?</span></div>' +
          '<p class="hint">' + App.i18n.t('gen.escaleraPista') + '</p>',
        legend: legendPos(),
        options: buildOptions(correct, [n, correct * 10],
          function (v) { return paintNumber(v); })
      };
    },



    /* Free-exploration counter: not a quiz, no prompt/options. Returns
       a marker that render() detects to switch into the counter UI
       (see renderCounter below). 'max' bounds the value silently. */
    counter: function (nv) {
      return { tipo: 'counter', max: nv.max || 1000000000000 };
    },

    /* "Leer números" — interactive reading practice. Each question
       asks the user to read a number shown in WORDS and write it
       in numeric form. The number is generated on demand by a
       "Generar" button (a new random pick within the level's digit
       range) so the user controls when the next prompt appears.
       The round's 6 questions are tracked by index; the
       `correct` field is the canonical numeric string to compare
       against. Same digit count per level so progress feels
       coherent. The visual is the number painted in words (so the
       user has to "read" it, not just copy a digit string). */
    lecturaInput: function (nv) {
      var minD = (typeof nv.minDigits === 'number') ? nv.minDigits : 1;
      var maxD = (typeof nv.maxDigits === 'number') ? nv.maxDigits : 10;
      /* One question per round step: the GENERATED number is decided
         up front so the "Comprobar" / "Ver resultado" buttons have
         a stable value to compare against. If the user wants
         another number mid-question they re-click "Generar" (handled
         in paintLecturaInput) and the value is replaced. */
      var digits = randInt(minD, maxD);
      var n;
      if (digits === 1) {
        n = randInt(1, 9);
      } else {
        /* First digit 1–9 (no leading zero), rest 0–9. */
        var first = randInt(1, 9);
        var rest = '';
        for (var k = 1; k < digits; k++) rest += randInt(0, 9);
        n = parseInt(first + rest, 10);
      }
      return {
        tipo: 'lecturaInput',
        n: n,
        words: numberToWords(n),
        /* Canonical form: digits only, no thousand separator. The
           number is read aloud without separators ("uno dos tres
           cuatro cinco seis siete ocho nueve cero"), so the
           canonical answer to type matches. */
        correct: String(n),
        prompt: App.i18n.t('gen.lecturaInputPrompt')
      };
    },

    /* "Escribir números" — sibling of lecturaInput: same UI (Generar /
       input / Comprobar / Ver resultado / Siguiente), but instead of
       showing the number in words, the app SPEAKS the number aloud
       via App.tts.speak(numberToWords(n)). No visual representation:
       the user has to listen and write what they heard. A
       "🔊 Reproducir" button is added so the user can replay the
       audio before answering. The canonical answer is the digit
       string, so the comparison is identical to lecturaInput. The
       number is decided up front by the generator so the "Reproducir"
       and "Ver resultado" buttons can replay/reveal the same value. */
    escribirInput: function (nv) {
      var minD = (typeof nv.minDigits === 'number') ? nv.minDigits : 1;
      var maxD = (typeof nv.maxDigits === 'number') ? nv.maxDigits : 10;
      var digits = randInt(minD, maxD);
      var n;
      if (digits === 1) {
        n = randInt(1, 9);
      } else {
        var first = randInt(1, 9);
        var rest = '';
        for (var k = 1; k < digits; k++) rest += randInt(0, 9);
        n = parseInt(first + rest, 10);
      }
      return {
        tipo: 'escribirInput',
        n: n,
        words: numberToWords(n),
        correct: String(n),
        prompt: App.i18n.t('gen.escribirInputPrompt')
      };
    }
  };

  /* ============================================================
     Screens and flow
     ============================================================ */

  function show(screen) {
    [screenMenu, screenGame, screenEnd, signedIntroScreen, signedRealScreen, signedTempScreen,
     screenExpo, screenReal].forEach(function (p) {
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

  /* ---- Levels of an activity (now automatic via levelFromProgress) ---- */

  /* ---- Game ---- */
  /* The level rises one step per completed round, capped at the last
     one, so a person who comes back continues where they were. */
  function levelFromProgress() {
    var levels = activity.levels;
    var completed = activity.id === 'positivos-y-negativos'
      ? progress.signedRounds
      : progress.completedRounds;
    return levels[Math.min(completed || 0, levels.length - 1)];
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    if (id === 'positivos-y-negativos') {
      startSignedIntro();
      return;
    }
    if (activity.hasExpoReal) {
      startExpoScreen(id);
      return;
    }
    startRound(levelFromProgress());
  }

  /* ---- Exposition + real-life screens for hasExpoReal activities ---- */

  function paintExpo(id) {
    var block = App.i18n.t('expo.' + id);
    if (!block) { show(screenMenu); return; }
    $('#expoTitleEl').textContent = block.title || '';
    $('#expoIntroEl').textContent = block.intro || '';
    var bulletsEl = $('#expoBulletsEl');
    bulletsEl.innerHTML = '';
    (block.bullets || []).forEach(function (b) {
      var li = document.createElement('li');
      li.textContent = b;
      bulletsEl.appendChild(li);
    });
    var noteEl = $('#expoNoteEl');
    if (block.note) {
      noteEl.textContent = '💡 ' + block.note;
      noteEl.classList.remove('hidden');
    } else {
      noteEl.textContent = '';
      noteEl.classList.add('hidden');
    }
    screenExpo.setAttribute('aria-label',
      (block.title || '') + ' — ' + (App.i18n.t('activity.' + id + '.name') || ''));
  }

  function paintReal(id) {
    var block = App.i18n.t('real.' + id);
    if (!block) { show(screenMenu); return; }
    $('#realTitleEl').textContent = block.title || '';
    var listEl = $('#realListEl');
    listEl.innerHTML = '';
    (block.items || []).forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'real-list-item';
      var icon = document.createElement('span');
      icon.className = 'real-list-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = item.icon || '';
      var para = document.createElement('p');
      para.textContent = item.text || '';
      row.appendChild(icon);
      row.appendChild(para);
      listEl.appendChild(row);
    });
    screenReal.setAttribute('aria-label',
      (block.title || '') + ' — ' + (App.i18n.t('activity.' + id + '.name') || ''));
  }

  function startExpoScreen(id) {
    paintExpo(id);
    show(screenExpo);
  }

  function startRealScreen(id) {
    paintReal(id);
    show(screenReal);
  }

  function startSignedIntro() {
    show(signedIntroScreen);
    signedNumberline.innerHTML = '';
    for (var value = -3; value <= 3; value += 1) {
      var tick = document.createElement('span');
      tick.className = 'signed-numberline-tick' + (value === 0 ? ' zero' : '');
      tick.textContent = value < 0 ? '−' + Math.abs(value) : value > 0 ? '+' + value : '0';
      signedNumberline.appendChild(tick);
    }
    signedNumberline.setAttribute('aria-label', App.i18n.t('signed.numberlineAria'));
    paintStars();
  }

  function paintSignedReal() {
    signedRealList.innerHTML = '';
    DATA.signedNumbers.real.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'signed-real-item';
      var icon = document.createElement('span');
      icon.className = 'signed-real-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = item.object;
      var body = document.createElement('div');
      var title = document.createElement('h3');
      title.textContent = App.i18n.t('signed.real.' + item.id + '.title');
      var text = document.createElement('p');
      text.textContent = App.i18n.t('signed.real.' + item.id + '.text');
      body.appendChild(title);
      body.appendChild(text);
      row.appendChild(icon);
      row.appendChild(body);
      signedRealList.appendChild(row);
    });
  }

  function startSignedTemperature() {
    signedTempLevelIndex = 0;
    loadSignedTemperatureMission();
  }

  function loadSignedTemperatureMission() {
    signedTempMission = DATA.signedNumbers.temperature[signedTempLevelIndex];
    signedTempValue = signedTempMission.start;
    signedTempSuccess.classList.add('hidden');
    signedTempNext.classList.add('hidden');
    signedTempGoal.textContent = App.i18n.t('signed.tempGoals.' + signedTempMission.id);
    show(signedTempScreen);
    paintSignedTemperature();
  }

  function signedTemperatureReachedGoal() {
    if (signedTempMission.target === 'negative') return signedTempValue < 0;
    if (signedTempMission.target === 'positive') return signedTempValue > 0;
    return signedTempValue === signedTempMission.target;
  }

  function paintSignedTemperature() {
    var sign = signedTempValue < 0 ? 'negative' : signedTempValue > 0 ? 'positive' : 'zero';
    var shown = signedTempValue < 0 ? '−' + Math.abs(signedTempValue)
      : signedTempValue > 0 ? '+' + signedTempValue : '0';
    signedTempNumber.textContent = shown + ' °C';
    signedTempNumber.className = 'signed-temp-number sign-' + sign;
    signedTempNumber.setAttribute('aria-label',
      App.i18n.t('signed.tempReadout').replace('{value}', shown));
    signedTempSign.textContent = App.i18n.t('signed.sign.' + sign);
    signedTempSign.className = 'signed-temp-sign sign-' + sign;
    signedTempMercury.className = 'signed-thermometer-mercury sign-' + sign;
    signedTempMercury.style.height = Math.abs(signedTempValue) * 5 + '%';
    signedTempMercury.style.top = signedTempValue < 0 ? '50%' : 'auto';
    signedTempMercury.style.bottom = signedTempValue >= 0 ? '50%' : 'auto';
    App.utils.$$('#signedTempScreen .btn-signed-temp[data-step]').forEach(function (button) {
      var nextValue = signedTempValue + parseInt(button.getAttribute('data-step'), 10);
      button.disabled = nextValue < DATA.signedNumbers.min || nextValue > DATA.signedNumbers.max;
    });
    var reached = signedTemperatureReachedGoal();
    signedTempSuccess.classList.toggle('hidden', !reached);
    if (reached) signedTempSuccess.textContent = App.i18n.t('signed.tempSuccess');
    signedTempNext.classList.toggle('hidden', !reached);
  }

  function stepSignedTemperature(step) {
    var nextValue = signedTempValue + step;
    if (nextValue < DATA.signedNumbers.min || nextValue > DATA.signedNumbers.max) return;
    signedTempValue = nextValue;
    paintSignedTemperature();
  }

  function finishSignedTemperatureMission() {
    if (!signedTemperatureReachedGoal()) return;
    signedTempLevelIndex += 1;
    if (signedTempLevelIndex < DATA.signedNumbers.temperature.length) {
      loadSignedTemperatureMission();
      return;
    }
    activity = DATA.activities['positivos-y-negativos'];
    activity.id = 'positivos-y-negativos';
    startRound(levelFromProgress());
  }

  function startRound(nv) {
    level = nv;
    index = 0;
    roundCorrect = 0;
    App.utils.drawRoundReset();
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
      App.i18n.t('refuerzoTitulo') + ' — ' +
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
    progressText.textContent = '';
  }

  function render() {
    resolved = false;
    attempts = 0;
    question = fixedQuestion || GENERATORS[level.tipo](level, index);
    fixedQuestion = null;

    /* The 'counter' level isn't a quiz: it returns a marker, not a
       question, and render() hands off to renderCounter() which
       hides everything else and shows the free-exploration UI. */
    if (question.tipo === 'counter') {
      renderCounter(question);
      return;
    }

    /* The 'elevator' missions ('ascensorLibre', 'ascensorMeta') are
       also not a quiz: the generator returns a marker, and
       render() hands off to renderElevator() which hides the quiz
       parts and shows the free-exploration UI. */
    if (question.tipo === 'elevator') {
      renderElevator(question);
      return;
    }

    /* The interactive "leer números" level: also a quiz, but with
       a typed input + "Comprobar" / "Ver resultado" instead of
       multiple-choice options. Hands off to renderLecturaInput
       which owns its own UI. */
    if (question.tipo === 'lecturaInput') {
      renderLecturaInput(question);
      return;
    }

    /* The interactive "escribir números" level: same shape as
       lecturaInput (typed input + "Comprobar" / "Ver resultado")
       but the number is played as AUDIO when "Generar" is
       clicked, with no visual representation. Hands off to
       renderEscribirInput. */
    if (question.tipo === 'escribirInput') {
      renderEscribirInput(question);
      return;
    }

    /* Quiz mode: show the standard parts, hide the counter UI. */
    progressBar.classList.remove('hidden');
    quizCard.classList.remove('hidden');
    optionsEl.classList.remove('hidden');
    counterUI.classList.add('hidden');
    elevatorUI.classList.add('hidden');
    lecturaUI.classList.add('hidden');
    escribirUI.classList.add('hidden');

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
    progressText.textContent = '';
    paintStars();
  }

  /* Extracts the visible text from an option.html (may contain inner <span> elements) */
  function plainText(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
  }

  function showExplanation(isCorrect) {
    if (isCorrect && inReinforce) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    var text = (isCorrect ? App.i18n.t('explicacionCorrecta') : App.i18n.t('explicacionIncorrectaA')) +
      plainText(correct.html) + '.';
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look at the question/visual again.
     Only on the second mistake is the correct answer explained
     (showExplanation). The invitation is the one written for THIS
     question —which is what to do with the figure in front of you— and
     not the same sentence for every question. The generic line is only
     the fallback, for a question that forgot to bring its own. */
  function showHint(op) {
    /* The hint names the answer just tried («{elegida}») and says why it
       does not fit and where to look, never the right answer. */
    explanationEl.textContent = App.feedback.hintText(
      (question && question.hint) || App.i18n.t('hint'),
      op ? plainText(op.html) : '');
    explanationWrap.classList.remove('hidden');
  }

  function answer(op, btn) {
    if (resolved) return;
    if (op.correct) {
      showExplanation(op.correct);
      resolved = true;
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
      if (attempts === 1) App.reinforce.add(level.id + ':' + index, question);
      var respuestaTrasPista = attempts > 1;
      showHint(op);
      /* Reveal the explanation only after the hint is acknowledged. */
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap, function () { if (respuestaTrasPista) showExplanation(op.correct); });
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
    if (activity.id === 'positivos-y-negativos') {
      progress.signedRounds += 1;
    } else {
      progress.completedRounds = (progress.completedRounds || 0) + 1;
    }
    save();
    show(screenEnd);
    var summaryEl = $('#endSummary');
    if (level.tipo === 'counter') {
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{activity}', App.i18n.t('activity.' + activity.id + '.name'))
        .replace('{stars}', progress.stars);
    }
    } else if (activity.id === 'positivos-y-negativos') {
      summaryEl.textContent = App.i18n.t('signed.endSummary')
        .replace('{stars}', progress.stars);
    } else if (level.tipo === 'ascensorLibre' || level.tipo === 'ascensorMeta') {
      /* Free-exploration elevator: no question count, only a star
         tally. Different from the counter summary to keep each
         tool's closing line distinct. */
      summaryEl.textContent = '';
    } else {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{activity}', App.i18n.t('activity.' + activity.id + '.name'))
        .replace('{stars}', progress.stars);
    }
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* ============================================================
     Free-exploration counter (no quiz)
     ============================================================ */

  /* Reads the current number aloud using App.tts. For exact powers
     of ten we use the words already registered in DATA.potencias
     (same source as the escalera generator); for any other value we
     fall back to the formatted decimal so the browser's TTS reads
     it digit-by-digit (e.g. "one million, two hundred thirty four
     thousand, five hundred sixty seven"). For non-power-of-ten
     numbers the formatted-with-separator string reads naturally
     with the thousands separator as a pause marker. */
  function counterSay(n) {
    if (!n) { if (false && App.tts && App.tts.speak) App.tts.speak(App.i18n.locale() === 'en' ? 'zero' : 'cero'); return; }
    var words = DATA.potencias[App.i18n.locale()];
    var exp = -1;
    var v = n;
    while (v >= 10 && v % 10 === 0) { v = v / 10; exp += 1; }
    if (v === 1 && exp >= 0 && exp < words.length) {
      if (false && App.tts && App.tts.speak) App.tts.speak(words[exp]);
      return;
    }
    /* Not a clean power of ten: read the formatted number. The
       thousands separator makes it sound natural for place value
       practice. */
    var sep = thousandsSeparator();
    var s = String(n);
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch >= '0' && ch <= '9') {
        out += (App.i18n.locale() === 'en' ? numberNameEn(ch) : numberNameEs(ch));
      } else if (ch === sep) {
        out += ', ';
      } else {
        out += ch;
      }
      if (i < s.length - 1) out += ' ';
    }
    if (false && App.tts && App.tts.speak) App.tts.speak(out);
  }

  /* Digit names for the fallback TTS path above. Kept local because
     they're only used by counterSay; the rest of the app uses
     DATA.potencias + DATA.readings for full number-to-words. */
  var DIGIT_NAMES_ES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  var DIGIT_NAMES_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  function numberNameEs(d) { return DIGIT_NAMES_ES[+d]; }
  function numberNameEn(d) { return DIGIT_NAMES_EN[+d]; }

  /* Per-level state for the counter. Held in a closure so re-entering
     the level (via Exit —  Play again) starts fresh. */
  var counterValue = 0;
  var counterMax = 0;
  var counterShowSep = true;
  /* When the thousands separator is hidden, this paints each 3-digit
     group in a distinct background tint, simulating the visual cue of
     the separator dot. Only meaningful when counterShowSep is false. */
  var counterColorGroups = false;
  var counterShowWords = false;

  function renderCounter(q) {
    counterValue = 0;
    counterMax = q.max;
    counterShowSep = true;
    counterColorGroups = false;
    counterShowWords = false;
    counterWords.setAttribute('aria-pressed', 'false');
    counterWordsLabel.textContent = App.i18n.t('gen.counterWordsOff');
    counterUI.classList.remove('hidden');
    elevatorUI.classList.add('hidden');
    counterHint.textContent = App.i18n.t('gen.counterHint');
    /* The progress bar / quiz card / options belong to the quiz flow;
       they're hidden while the counter is shown so the screen reads
       as a free exploration surface, not a question. */
    progressBar.classList.add('hidden');
    quizCard.classList.add('hidden');
    optionsEl.classList.add('hidden');
    btnNext.classList.add('hidden');
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    /* progressText stays at 0/6; the bar is hidden, so it isn't read. */
    progressFill.style.width = '0%';
    progressText.textContent = '';
    paintCounter();
    paintCounterToggle();
    paintStars();
  }

  function paintCounter() {
    counterNumber.innerHTML = paintCounterNumber(counterValue);
    counterWritten.textContent = counterShowWords ? numberToWords(counterValue) : '';
    counterWritten.classList.toggle('hidden', !counterShowWords);
    /* Disable "-" buttons at 0; the "——" buttons share the .data-step
       attribute that starts with "-". */
    App.utils.$$('#counterUI .btn-counter[data-step]').forEach(function (b) {
      var step = parseInt(b.getAttribute('data-step'), 10);
      var wouldBeNeg = (counterValue + step) < 0;
      var wouldBeOver = (counterValue + step) > counterMax;
      b.disabled = wouldBeNeg || wouldBeOver;
    });
  }

  /* ============================================================
     Interactive "leer números" - typed input + "Comprobar" / "Ver
     resultado" / "Generar" buttons. The number is shown in words;
     the user types the numeric form in a wide input. The round is
     6 questions; +1 star per "Comprobar" answer that matches.
     "Ver resultado" fills the input with the canonical answer and
     ends the question (no star) - it is the "I do not know, show me"
     button the user requested.
     ============================================================ */

  /* Tracks whether the current lecturaInput question has already
     been answered (either via "Comprobar" or "Ver resultado"). Held
     in a closure so re-entering the level (next round) starts
     fresh. */
  var lecturaAnswered = false;

  /* Wrong typed answer (lecturaInput and escribirInput). A hint does
     not help with a number, so the solution is shown instead: the
     digits and how they are read in words. The input and the answer
     buttons are locked until "Entendido" is pressed
     (App.feedback.lockUntilAck). Then the solution is hidden and the
     input opens again so the user writes the number. */
  function showTypedSolution(input, buttons) {
    explanationEl.textContent = App.i18n.t("typedSolution")
      .replace("{n}", question.correct)
      .replace("{words}", question.words);
    explanationWrap.classList.remove("hidden");
    App.feedback.lockUntilAck([input].concat(buttons), explanationWrap, function () {
      explanationWrap.classList.add("hidden");
      explanationEl.textContent = "";
      input.focus();
    });
  }

  function renderLecturaInput(q) {
    /* Standard quiz parts are hidden - this level owns its own
       panel. progressBar stays visible so the user can see how
       many questions remain in the round. */
    progressBar.classList.remove("hidden");
    quizCard.classList.add("hidden");
    optionsEl.classList.add("hidden");
    counterUI.classList.add("hidden");
    elevatorUI.classList.add("hidden");
    lecturaUI.classList.remove("hidden");
    btnNext.classList.add("hidden");

    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    explanationWrap.classList.add("hidden");
    explanationEl.textContent = "";
    /* Reset local state. */
    lecturaAnswered = false;
    lecturaInput.value = "";
    lecturaInput.disabled = false;
    /* The number is hidden until the user clicks "Generar". Until
       then, the prompt + Generate button are the only affordance -
       the user controls when a number appears. */
    lecturaWords.textContent = "";
    lecturaWords.classList.add("hidden");
    lecturaGenerate.classList.remove("hidden");
    lecturaCheck.classList.add("hidden");
    lecturaReveal.classList.add("hidden");
    lecturaNext.classList.add("hidden");
    lecturaInput.classList.add("hidden");
    /* Localized labels. */
    lecturaGenerate.textContent = App.i18n.t("gen.lecturaInputGenerate");
    lecturaCheck.textContent = App.i18n.t("gen.lecturaInputCheck");
    lecturaReveal.textContent = App.i18n.t("gen.lecturaInputReveal");
    lecturaNext.textContent = App.i18n.t("core.next");
    /* Default prompt and a faint hint telling the user to click
       "Generate" first. */
    promptEl.textContent = question.prompt;
    lecturaHint.textContent = App.i18n.t("gen.lecturaInputIdleHint");
    lecturaHint.classList.remove("hidden");
    progressFill.style.width = ((index / DATA.perRound) * 100) + "%";
    progressText.textContent = "";
    paintStars();
  }

  /* Called when the user clicks "Generar número" - reveals the
     current question's number in words and shows the input. The
     number itself was decided up front by the generator (so the
     correct answer is stable across "Comprobar" attempts);
     "Generar" only changes what the user SEES. If the user wants a
     brand-new number before answering, they have to use the
     "Siguiente" path (which advances to the next question and a
     fresh random pick). */
  function showLecturaInput() {
    lecturaWords.textContent = question.words;
    lecturaWords.classList.remove("hidden");
    lecturaInput.value = "";
    lecturaInput.disabled = false;
    lecturaInput.classList.remove("hidden");
    lecturaGenerate.classList.add("hidden");
    lecturaCheck.classList.remove("hidden");
    lecturaReveal.classList.remove("hidden");
    lecturaNext.classList.add("hidden");
    lecturaHint.classList.add("hidden");
    /* Focus the input so the keyboard is ready. */
    lecturaInput.focus();
  }

  /* Validate the user's input against the canonical answer. The
     user can correct the input between attempts and press
     "Comprobar" again; this mirrors the typed-input practice in
     tools/quantities, where the input is not locked after a miss
     so the user can edit and retry. */
  function checkLecturaInput() {
    if (lecturaAnswered) return;
    if (!question || question.tipo !== "lecturaInput") return;
    var raw = lecturaInput.value || "";
    /* Normalise: strip whitespace. The canonical answer is digits
       only (the number is read aloud without separators), so the
       only validation needed is a digit-string compare. */
    var clean = raw.trim().replace(/\s+/g, "");
    if (clean === question.correct) {
      lecturaAnswered = true;
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      App.feedback.success(feedbackEl);
      feedbackEl.textContent += " " +
        App.i18n.t("lecturaInputCorrect").replace("{n}", question.correct);
      lecturaInput.disabled = true;
      lecturaCheck.classList.add("hidden");
      lecturaReveal.classList.add("hidden");
      lecturaNext.classList.remove("hidden");
      lecturaNext.focus();
    } else {
      attempts += 1;
      if (attempts === 1) {
        App.reinforce.add(level.id + ":" + index, question);
      }
      App.feedback.encourage(feedbackEl);
      /* No hint here: the solution is shown and the user writes the
         number again after pressing "Entendido". */
      showTypedSolution(lecturaInput, [lecturaCheck, lecturaReveal]);
    }
  }

  /* Fill the input with the canonical answer and advance the
     state machine to "answered" so the next "Comprobar" is a
     no-op. No star is awarded - the user has seen the answer, so
     it does not count as a correct attempt. The user can still
     edit the input (e.g. to copy the answer character by
     character) before pressing "Siguiente". */
  function revealLecturaInput() {
    if (lecturaAnswered) return;
    if (!question || question.tipo !== "lecturaInput") return;
    lecturaAnswered = true;
    lecturaInput.value = question.correct;
    lecturaInput.disabled = false;
    lecturaCheck.classList.add("hidden");
    lecturaReveal.classList.add("hidden");
    /* "Siguiente" is the only forward path after a reveal. */
    lecturaNext.classList.remove("hidden");
    feedbackEl.textContent = App.i18n.t("lecturaInputRevealed")
      .replace("{n}", question.correct);
    feedbackEl.className = "feedback";
    feedbackEl.classList.add("success");
    lecturaNext.focus();
  }

  /* Wire up the lecturaInput controls once (the elements persist
     across questions). Same pattern as the counter and elevator
     wire-ups: a single addEventListener for each button, with the
     current question read from the closure each click. */
  if (lecturaGenerate) {
    lecturaGenerate.addEventListener("click", showLecturaInput);
  }
  if (lecturaCheck) {
    lecturaCheck.addEventListener("click", checkLecturaInput);
  }
  if (lecturaReveal) {
    lecturaReveal.addEventListener("click", revealLecturaInput);
  }
  if (lecturaInput) {
    /* Enter key on the input triggers "Comprobar" so the user
       does not have to mouse back to the button. */
    lecturaInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        checkLecturaInput();
      }
    });
  }
  if (lecturaNext) {
    /* "Siguiente" runs the same flow as the standard #btnNext:
       advance the round. Falls through to next() which already
       understands the index/round boundary. */
    lecturaNext.addEventListener("click", function () { next(); });
  }

  /* ============================================================
  /* ============================================================
     Interactive "escribir números" - typed input + audio.
     Sibling of renderLecturaInput/show/check/reveal above. The
     key difference: "Generar" plays the number aloud via
     App.tts.speak(numberToWords(n)) instead of painting the
     number in words. A "🔊 Reproducir" button is added so the
     user can hear the number again before answering. "Ver
     resultado" reveals the digits in the input (the same
     "answer in the input" affordance as lecturaInput).
     ============================================================ */

  /* Local state for the current escribirInput question. Held in
     a closure so re-entering the level starts fresh. */
  var escribirAnswered = false;

  /* Speak the current number aloud via App.tts. The audio is
     the same numberToWords(n) used by the lecturaInput flow -
     the only difference is the channel (audio vs visual). Safe
     when App.tts is missing (some test environments) - the
     function is a no-op then. */
  function speakQuestion() {
    if (!question || question.tipo !== "escribirInput") return;
    if (App.tts && App.tts.speak) {
      App.tts.speak(question.words);
    }
  }

  function renderEscribirInput(q) {
    /* Same panel setup as renderLecturaInput: progress bar
       visible, all other quiz parts hidden. */
    progressBar.classList.remove("hidden");
    quizCard.classList.add("hidden");
    optionsEl.classList.add("hidden");
    counterUI.classList.add("hidden");
    elevatorUI.classList.add("hidden");
    lecturaUI.classList.add("hidden");
    escribirUI.classList.remove("hidden");
    btnNext.classList.add("hidden");

    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    explanationWrap.classList.add("hidden");
    explanationEl.textContent = "";
    /* Reset local state. */
    escribirAnswered = false;
    escribirInput.value = "";
    escribirInput.disabled = false;
    /* No number visible yet - the user must click "Generar"
       to hear the audio. */
    escribirNumber.textContent = "";
    escribirNumber.classList.add("hidden");
    escribirGenerate.classList.remove("hidden");
    escribirReplay.classList.add("hidden");
    escribirCheck.classList.add("hidden");
    escribirReveal.classList.add("hidden");
    escribirNext.classList.add("hidden");
    escribirInput.classList.add("hidden");
    /* Localized labels. */
    escribirGenerate.textContent = App.i18n.t("gen.escribirInputGenerate");
    escribirReplay.textContent = App.i18n.t("gen.escribirInputReplay");
    escribirCheck.textContent = App.i18n.t("gen.escribirInputCheck");
    escribirReveal.textContent = App.i18n.t("gen.escribirInputReveal");
    escribirNext.textContent = App.i18n.t("core.next");
    promptEl.textContent = question.prompt;
    /* Idle hint: tell the user the next click will play audio. */
    if (App.tts && App.tts.speak) {
      escribirHint.textContent = App.i18n.t("gen.escribirInputIdleHint");
    } else {
      escribirHint.textContent = App.i18n.t("gen.escribirInputNoAudio");
    }
    escribirHint.classList.remove("hidden");
    progressFill.style.width = ((index / DATA.perRound) * 100) + "%";
    progressText.textContent = "";
    paintStars();
  }

  /* Click on "Generar número": play the audio, reveal the
     input + Check + Replay + Reveal. Same shape as the lectura
     flow but the trigger is audio (App.tts.speak) instead of
     painting the number in words. */
  function showEscribirInput() {
    escribirNumber.textContent = "";
    escribirNumber.classList.add("hidden");
    escribirInput.value = "";
    escribirInput.disabled = false;
    escribirInput.classList.remove("hidden");
    escribirGenerate.classList.add("hidden");
    escribirReplay.classList.remove("hidden");
    escribirCheck.classList.remove("hidden");
    escribirReveal.classList.remove("hidden");
    escribirNext.classList.add("hidden");
    escribirHint.classList.add("hidden");
    /* Speak the number aloud (the whole point of this level). */
    speakQuestion();
    escribirInput.focus();
  }

  /* Click on "🔊 Reproducir": re-speak the current number. The
     number is the one decided up front by the generator; this
     button never picks a new value - it only re-says the same
     one. */
  function replayEscribir() {
    if (escribirAnswered) return;
    speakQuestion();
  }

  /* Click on "Comprobar": validate against the canonical answer.
     Same logic as checkLecturaInput - whitespace-tolerant digit
     compare, +1 star on success, encourage + retry on miss. */
  function checkEscribirInput() {
    if (escribirAnswered) return;
    if (!question || question.tipo !== "escribirInput") return;
    var raw = escribirInput.value || "";
    var clean = raw.trim().replace(/\s+/g, "");
    if (clean === question.correct) {
      escribirAnswered = true;
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      App.feedback.success(feedbackEl);
      feedbackEl.textContent += " " +
        App.i18n.t("escribirInputCorrect").replace("{n}", question.correct);
      escribirInput.disabled = true;
      escribirCheck.classList.add("hidden");
      escribirReveal.classList.add("hidden");
      escribirReplay.classList.add("hidden");
      escribirNext.classList.remove("hidden");
      escribirNext.focus();
    } else {
      attempts += 1;
      if (attempts === 1) {
        App.reinforce.add(level.id + ":" + index, question);
      }
      App.feedback.encourage(feedbackEl);
      /* No hint here: the solution is shown and the user writes the
         number again after pressing "Entendido". */
      showTypedSolution(escribirInput, [escribirCheck, escribirReveal]);
    }
  }

  /* Click on "Ver resultado": fill the input with the canonical
     answer and show "Siguiente". Same shape as revealLecturaInput. */
  function revealEscribirInput() {
    if (escribirAnswered) return;
    if (!question || question.tipo !== "escribirInput") return;
    escribirAnswered = true;
    escribirInput.value = question.correct;
    escribirInput.disabled = false;
    escribirCheck.classList.add("hidden");
    escribirReveal.classList.add("hidden");
    escribirReplay.classList.add("hidden");
    escribirNext.classList.remove("hidden");
    feedbackEl.textContent = App.i18n.t("escribirInputRevealed")
      .replace("{n}", question.correct);
    feedbackEl.className = "feedback";
    feedbackEl.classList.add("success");
    escribirNext.focus();
  }

  /* Wire up the escribirInput controls (elements persist across
     questions). Same pattern as the lecturaInput wire-up: one
     addEventListener per button, the current question is read
     from the closure each click. */
  if (escribirGenerate) {
    escribirGenerate.addEventListener("click", showEscribirInput);
  }
  if (escribirReplay) {
    escribirReplay.addEventListener("click", replayEscribir);
  }
  if (escribirCheck) {
    escribirCheck.addEventListener("click", checkEscribirInput);
  }
  if (escribirReveal) {
    escribirReveal.addEventListener("click", revealEscribirInput);
  }
  if (escribirInput) {
    /* Enter triggers "Comprobar" so the user does not have to
       mouse back to the button. */
    escribirInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        checkEscribirInput();
      }
    });
  }
  if (escribirNext) {
    escribirNext.addEventListener("click", function () { next(); });
  }

  /* ============================================================

     Free-exploration elevator (no quiz)
     Sibling of the water-temperature tool: ——10/——1/+1/+10 buttons,
     the visual reacts on every step. The big number reads with a
     sign; the shaft shows the elevator emoji on the current floor,
     with the ground floor (0) always highlighted as the boundary
     between positive and negative. Same storage shape as the
     counter — progress.stars increments on exit.
     ============================================================ */

  /* Per-mission state. Held in closures so re-entering the level
     (Exit —  Play again) starts fresh. */
  var elevatorValue = 0;
  var elevatorMin = 0;
  var elevatorMax = 0;
  var elevatorMode = 'libre';
  var elevatorTarget = 0;
  /* Set to the celebration key once a 'meta' mission lands on the
     target, so we don't replay the same celebration on every
     subsequent step. Reset on exit/re-enter. */
  var elevatorCelebrated = false;

  function renderElevator(q) {
    elevatorValue = (q.mode === 'meta' && typeof q.inicio === 'number')
      ? q.inicio : 0;
    elevatorMin = (typeof q.min === 'number') ? q.min : DATA.elevador.min;
    elevatorMax = (typeof q.max === 'number') ? q.max : DATA.elevador.max;
    elevatorMode = q.mode || 'libre';
    elevatorTarget = (typeof q.target === 'number') ? q.target : 0;
    elevatorCelebrated = false;
    elevatorUI.classList.remove('hidden');
    counterUI.classList.add('hidden');
    elevatorHint.textContent = App.i18n.t(
      elevatorMode === 'meta' ? 'gen.elevatorHintMeta' : 'gen.elevatorHintLibre'
    );
    /* The progress bar / quiz card / options belong to the quiz
       flow; they're hidden while the elevator is shown so the
       screen reads as a free exploration surface, not a question. */
    progressBar.classList.add('hidden');
    quizCard.classList.add('hidden');
    optionsEl.classList.add('hidden');
    btnNext.classList.add('hidden');
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    /* progressText stays at 0/6; the bar is hidden, so it isn't read. */
    progressFill.style.width = '0%';
    progressText.textContent = '';
    paintElevatorGoal();
    paintElevatorSuggestion();
    paintElevator();
    paintStars();
  }

  /* Show the goal line. For 'libre' missions the goal is empty
     (no target, just explore). For 'meta' missions the goal reads
     the target floor with its sign. */
  function paintElevatorGoal() {
    if (elevatorMode !== 'meta') {
      elevatorGoal.textContent = '';
      return;
    }
    var t = elevatorTarget;
    var key = 'gen.elevatorGoalMeta';
    elevatorGoal.textContent = App.i18n.t(key).replace(
      '{piso}', (t < 0 ? '−' : '') + Math.abs(t)
    );
  }

  /* Pick a random floor in [elevatorMin, elevatorMax] inclusive,
     avoiding the level's starting floor and 0. Same helper used
     by the temperature tool; kept local because both tools share
     the exact same mechanic. Avoids 0 because 0 is the ground
     floor — saying "go to floor 0" while the elevator is already
     there adds noise rather than direction. */
  function pickElevatorSuggestion() {
    var start = (elevatorMode === 'meta' && typeof level.inicio === 'number')
      ? level.inicio : 0;
    var v = pickRandomInt(elevatorMin, elevatorMax, start);
    while (v === 0) v = pickRandomInt(elevatorMin, elevatorMax, start);
    return v;
  }

  /* Paint the suggestion line. For 'ascensorMeta' the goal line
     already names the target floor, so showing ANOTHER random
     floor would conflict — hide the suggestion. For 'ascensorLibre'
     the goal line is empty, so the suggestion adds a concrete
     starting floor to the open-ended mission. */
  function paintElevatorSuggestion() {
    if (elevatorMode === 'meta') {
      elevatorSuggestion.textContent = '';
      elevatorSuggestion.classList.add('hidden');
      return;
    }
    var v = pickElevatorSuggestion();
    var sign = v < 0 ? '——' : '+';
    var key = v < 0 ? 'gen.elevatorSuggestionDown'
      : 'gen.elevatorSuggestionUp';
    elevatorSuggestion.textContent = App.i18n.t(key)
      .replace('{piso}', sign + Math.abs(v));
    elevatorSuggestion.classList.remove('hidden');
  }

  /* Main render: number, state label, accessibility text, button
     enable/disable, live shaft. Called on every value change. */
  function paintElevator() {
    var n = elevatorValue;
    /* Big floor number. The sign is part of the text so screen
       readers say "menos cinco" naturally. */
    elevatorNumber.textContent = (n < 0 ? '——' : '') + Math.abs(n);
    elevatorNumber.setAttribute(
      'aria-label',
      App.i18n.t('gen.elevatorReadoutAria')
        .replace('{piso}', (n < 0 ? '——' : '') + Math.abs(n))
    );
    /* State label: above / on / below ground. Same vocabulary as
       the activity instruction so the user sees the same words in
       three places (instruction, hint, label). */
    var labelKey = n > 0 ? 'gen.elevatorStateAbove'
      : n < 0 ? 'gen.elevatorStateBelow'
      : 'gen.elevatorStateGround';
    elevatorStateLabel.textContent = App.i18n.t(labelKey);
    /* Disable "+" / "——" at the true edges of the building (±3) so the
       elevator cannot be sent past the top or bottom floor. With a
       ±3 range and single-floor steps this is a rare, honest edge
       case — not a stand-in for a range the buttons don't fit. */
    App.utils.$$('#elevatorUI .btn-elevator[data-step]').forEach(function (b) {
      var step = parseInt(b.getAttribute('data-step'), 10);
      var wouldBe = elevatorValue + step;
      b.disabled = (wouldBe < elevatorMin) || (wouldBe > elevatorMax);
    });
    /* Live shaft. */
    paintElevatorShaft();
    celebrateIfElevatorGoalReached();
  }

  /* Render the shaft. Same shape as the old quiz-style
     shaftHTML(min, max, markers) but with a single marker — the
     elevator emoji on the current floor — and the ground floor
     always tinted with the project reasoning colour. Floors are
     listed top-to-bottom (max first) so floor +10 sits at the top
     and floor ——10 at the bottom, matching the building
     convention. */
  function paintElevatorShaft() {
    var html = '';
    for (var f = elevatorMax; f >= elevatorMin; f--) {
      var clases = 'floor-row';
      var contenido = '';
      if (f === 0) {
        clases += ' ground-floor';
        contenido += '<span class="floor-icon">—x——</span>';
      }
      if (f === elevatorValue) {
        clases += ' current-floor';
        contenido += '<span class="floor-icon">—x——</span>';
      }
      contenido = '<span class="floor-label">' + (f > 0 ? '+' + f : (f < 0 ? '−' + Math.abs(f) : '0')) + '</span>' + contenido;
      html += '<div class="' + clases + '">' + contenido + '</div>';
    }
    elevatorShaft.innerHTML = html;
  }

  /* For 'meta' missions, when the user lands on the target floor
     (within DATA.elevador.tolerancia), show the celebration once.
     'libre' missions have no target, so no celebration fires. */
  function celebrateIfElevatorGoalReached() {
    if (elevatorCelebrated) return;
    if (elevatorMode !== 'meta') return;
    var diff = Math.abs(elevatorValue - elevatorTarget);
    if (diff > DATA.elevador.tolerancia) return;
    var t = elevatorTarget;
    var key = 'gen.elevatorSuccess';
    feedbackEl.textContent = App.i18n.t(key).replace(
      '{piso}', (t < 0 ? '−' : '') + Math.abs(t)
    );
    /* Set 'feedback' first so the bare class literal the CSS
       coverage check scans for matches a real selector. The
       'success' modifier is added with classList.add afterwards.
       Same intent as the temperature tool: App.feedback.success()
       would overwrite the celebration text with a generic
       "⭐ Fantastic!" pick, which doesn't fit here — the message
       has to identify the floor the user just reached. */
    feedbackEl.className = 'feedback';
    feedbackEl.classList.add('success');
    elevatorCelebrated = true;
  }

  function paintCounterToggle() {
    /* The button shows what the current state LOOKS LIKE; clicking
       it switches to the other state. The label is built from
       strings.es/en.js so it stays localized. */
    counterSepLabel.textContent = counterShowSep
      ? App.i18n.t('gen.counterSepOn')
      : App.i18n.t('gen.counterSepOff');
    counterSep.setAttribute('aria-pressed', String(counterShowSep));
    /* The 'colour groups' toggle is only meaningful when the
       thousands separator is hidden: with the separator on, the
       dot/label already does the grouping visually. Hide the
       button otherwise to keep the surface uncluttered. */
    if (counterShowSep) {
      counterGroups.classList.add('hidden');
    } else {
      counterGroups.classList.remove('hidden');
      counterGroupsLabel.textContent = counterColorGroups
        ? App.i18n.t('gen.counterGroupsOn')
        : App.i18n.t('gen.counterGroupsOff');
      counterGroups.setAttribute('aria-pressed', String(counterColorGroups));
    }
  }

  /* Three paint variants for the displayed number, chosen from the
     current toggle state:
       - showSep              —  digit groups with . separator + label
       - !showSep && colorGroups —  digit groups with a coloured background
                                   per 3-digit chunk (no separator glyph)
       - !showSep && !colorGroups —  one continuous digit string */
  function paintCounterNumber(n) {
    if (counterShowSep) return paintNumber(n, { labels: true });
    var s = String(n);
    var groups = [];
    for (var i = s.length; i > 0; i -= 3) groups.unshift(s.slice(Math.max(0, i - 3), i));
    var html = '<span class="num-color">';
    for (var g = 0; g < groups.length; g++) {
      var body = '';
      for (var j = 0; j < groups[g].length; j++) {
        var pos = groups[g].length - 1 - j;
        var posAbs = (groups.length - 1 - g) * 3 + pos;
        body += '<span class="' + POS_CLASS[pos] + '">' + groups[g][j] + '</span>';
      }
      if (counterColorGroups && groups.length > 1) {
        /* Cycle the tint across groups (g0 leftmost = lowest group).
           Three hues is enough to tell adjacent groups apart without
           becoming a rainbow. */
        html += '<span class="num-group num-group-' + (g % 3) + '">' + body + '</span>';
      } else {
        html += body;
      }
    }
    html += '</span>';
    return html;
  }

  var SMALL_ES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  var TENS_ES = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  var HUNDREDS_ES = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  var SMALL_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS_EN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function under100Es(n) {
    if (n < 20) return SMALL_ES[n];
    if (n < 30) {
      var twenties = ['', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
      return n === 20 ? 'veinte' : twenties[n - 20];
    }
    return n % 10 ? TENS_ES[Math.floor(n / 10)] + ' y ' + SMALL_ES[n % 10] : TENS_ES[Math.floor(n / 10)];
  }

  function under1000Es(n) {
    if (n < 100) return under100Es(n);
    if (n === 100) return 'cien';
    return HUNDREDS_ES[Math.floor(n / 100)] + (n % 100 ? ' ' + under100Es(n % 100) : '');
  }

  function numberToWordsEs(n) {
    if (n < 1000) return under1000Es(n);
    if (n >= 1000000000000) {
      return n === 1000000000000 ? 'un billón' : under1000Es(Math.floor(n / 1000000000000)) + ' billones';
    }
    if (n >= 1000000000) {
      var millionCount = Math.floor(n / 1000000);
      var millionRest = n % 1000000;
      var billionWords = millionCount === 1000 ? 'mil millones' : numberToWordsEs(millionCount) + ' millones';
      return billionWords + (millionRest ? ' ' + numberToWordsEs(millionRest) : '');
    }
    if (n >= 1000000) {
      var millions = Math.floor(n / 1000000);
      var millionRest = n % 1000000;
      return (millions === 1 ? 'un millón' : under1000Es(millions) + ' millones') + (millionRest ? ' ' + numberToWordsEs(millionRest) : '');
    }
    var thousands = Math.floor(n / 1000);
    var thousandRest = n % 1000;
    return (thousands === 1 ? 'mil' : under1000Es(thousands) + ' mil') + (thousandRest ? ' ' + under1000Es(thousandRest) : '');
  }

  function under100En(n) {
    if (n < 20) return SMALL_EN[n];
    return n % 10 ? TENS_EN[Math.floor(n / 10)] + '-' + SMALL_EN[n % 10] : TENS_EN[Math.floor(n / 10)];
  }

  function under1000En(n) {
    if (n < 100) return under100En(n);
    return SMALL_EN[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + under100En(n % 100) : '');
  }

  function numberToWordsEn(n) {
    if (n < 1000) return under1000En(n);
    var scales = [[1000000000000, 'trillion'], [1000000000, 'billion'], [1000000, 'million'], [1000, 'thousand']];
    for (var i = 0; i < scales.length; i++) {
      if (n >= scales[i][0]) {
        var count = Math.floor(n / scales[i][0]);
        var rest = n % scales[i][0];
        return numberToWordsEn(count) + ' ' + scales[i][1] + (rest ? ' ' + numberToWordsEn(rest) : '');
      }
    }
    return String(n);
  }

  function numberToWords(n) {
    return App.i18n.locale() === 'en' ? numberToWordsEn(n) : numberToWordsEs(n);
  }

  function counterAddStep(step) {
    var next = counterValue + step;
    if (next < 0 || next > counterMax) return;
    counterValue = next;
    paintCounter();
  }

  /* Elevator step handler: clamps the new value within the mission
     range and redraws. Same pattern as counterAddStep — the
     button enable/disable state is recomputed inside paintElevator
     so the next click will reflect the updated bounds. */
  function elevatorAddStep(step) {
    var next = elevatorValue + step;
    if (next < elevatorMin || next > elevatorMax) return;
    elevatorValue = next;
    paintElevator();
  }

  /* Reads the current floor aloud with the matching above/on/
     below-ground line. Same wording as the state label so the
     audio and the visible label stay in sync. */
  function elevatorSay() {
    var n = elevatorValue;
    var main = App.i18n.t('gen.elevatorTtsFloor')
      .replace('{piso}', (n < 0 ? '——' : '') + Math.abs(n));
    var labelKey = n > 0 ? 'gen.elevatorTtsAbove'
      : n < 0 ? 'gen.elevatorTtsBelow'
      : 'gen.elevatorTtsGround';
    if (false && App.tts && App.tts.speak) App.tts.speak(main + '. ' + App.i18n.t(labelKey));
  }

  function exitElevator() {
    progress.stars += 1;
    save();
    paintStars();
    endRound();
  }

  function exitCounter() {
    progress.stars += 1;
    save();
    paintStars();
    endRound();
  }

  /* Wire up the counter buttons once (the elements persist). */
  App.utils.$$('#counterUI .btn-counter[data-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      var step = parseInt(b.getAttribute('data-step'), 10);
      counterAddStep(step);
    });
  });
  counterReset.addEventListener('click', function () {
    counterValue = 0;
    paintCounter();
  });
  counterSep.addEventListener('click', function () {
    /* Toggle the separator state, then redraw both the toggle label
       (which button shows, whether the colour-groups toggle is
       visible, and its label) and the number itself. Turning the
       separator ON makes the colour-groups cue redundant, so we
       force it OFF to keep the two toggles mutually consistent. */
    counterShowSep = !counterShowSep;
    if (counterShowSep) counterColorGroups = false;
    paintCounterToggle();
    paintCounter();
  });
  counterGroups.addEventListener('click', function () {
    if (counterShowSep) return; /* safety: toggle is hidden in this state */
    counterColorGroups = !counterColorGroups;
    paintCounterToggle();
    paintCounter();
  });
  counterAudio.addEventListener('click', function () {
    counterSay(counterValue);
  });
  counterExit.addEventListener('click', function () { exitCounter(); });
  /* Localized aria-label for the audio button. Setting it after the
     elements are wired keeps the HTML lean (no data-i18n-aria needed)
     while still going through the i18n table. */
  counterAudio.setAttribute('aria-label', App.i18n.t('gen.counterAudioAria'));
  counterReset.textContent = App.i18n.t('gen.counterResetLabel');
  counterExit.textContent = App.i18n.t('gen.counterExitLabel');
  counterGroups.setAttribute('aria-label', App.i18n.t('gen.counterGroupsAria'));
  counterWordsLabel.textContent = App.i18n.t('gen.counterWordsOff');
  counterWords.setAttribute('aria-label', App.i18n.t('gen.counterWordsAria'));
  counterWords.addEventListener('click', function () {
    counterShowWords = !counterShowWords;
    counterWords.setAttribute('aria-pressed', String(counterShowWords));
    counterWordsLabel.textContent = App.i18n.t(counterShowWords ? 'gen.counterWordsOn' : 'gen.counterWordsOff');
    paintCounter();
  });

  /* Wire up the elevator buttons once (the elements persist). Same
     pattern as the counter wire-up: step buttons share .data-step,
     the reset button takes the user back to the mission's actual
     starting point (0 for libre, the per-level 'inicio' for meta). */
  App.utils.$$('#elevatorUI .btn-elevator[data-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      elevatorAddStep(parseInt(b.getAttribute('data-step'), 10));
    });
  });
  elevatorReset.addEventListener('click', function () {
    elevatorValue = (elevatorMode === 'meta')
      ? ((typeof level.inicio === 'number') ? level.inicio : 0)
      : 0;
    elevatorCelebrated = false;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    paintElevatorSuggestion();
    paintElevator();
  });
  elevatorAudio.addEventListener('click', elevatorSay);
  elevatorExit.addEventListener('click', function () { exitElevator(); });
  /* Localized labels for the elevator icon buttons (kept out of the
     HTML to avoid duplicating strings per locale). */
  elevatorAudio.setAttribute('aria-label', App.i18n.t('gen.elevatorBtnAudio'));
  elevatorReset.textContent = App.i18n.t('gen.elevatorBtnReset');
  elevatorExit.textContent = App.i18n.t('gen.elevatorBtnExit');

  /* ---- Events ---- */

  var elBtnBackToMenu = $('#btnBackToMenu');
  if (elBtnBackToMenu) elBtnBackToMenu.addEventListener('click', function () { show(screenMenu); });
  $('#btnNext').addEventListener('click', next);
  /* btnRepeat was removed during the 25-activity batch cleanup (memory
     entry on 2026-10-13); the screenEnd section no longer has the
     button, so its handler is gone too. If a future batch re-adds the
     button, wire this up again with the hasExpoReal/positivos-y-negativos
     branches restored. */
  var elBtnRepeat = $('#btnRepeat');
  if (elBtnRepeat) elBtnRepeat.addEventListener('click', function () {
    if (activity.id === 'positivos-y-negativos') startSignedIntro();
    else if (activity.hasExpoReal) startExpoScreen(activity.id);
    else startRound(levelFromProgress());
  });

  /* ---- Exposition + real-life buttons (hasExpoReal activities) ---- */
  $('#expoNext').addEventListener('click', function () {
    if (!activity) return;
    startRealScreen(activity.id);
  });
  $('#realBack').addEventListener('click', function () {
    if (!activity) return;
    startExpoScreen(activity.id);
  });
  $('#realNext').addEventListener('click', function () {
    if (!activity) return;
    startRound(levelFromProgress());
  });

  $('#signedIntroNext').addEventListener('click', function () {
    paintSignedReal();
    show(signedRealScreen);
  });
  $('#signedRealNext').addEventListener('click', startSignedTemperature);
  App.utils.$$('#signedTempScreen .btn-signed-temp[data-step]').forEach(function (button) {
    button.addEventListener('click', function () {
      stepSignedTemperature(parseInt(button.getAttribute('data-step'), 10));
    });
  });
  signedTempReset.addEventListener('click', function () {
    signedTempValue = signedTempMission.start;
    paintSignedTemperature();
  });
  signedTempNext.addEventListener('click', finishSignedTemperatureMission);

  $('#noteExtra').innerHTML = App.i18n.t('notaTablas')
    .replace('{link}', '<a href="../math-tables/">' + App.i18n.t('notaTablasLink') + '</a>');

  paintMenu();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
