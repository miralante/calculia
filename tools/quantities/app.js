/* ============================================================
   Calculia — Cantidades.

   Three practices share this file:

     - read   : the number is shown and the user copies it.
     - write  : the number is spoken and the user writes it.
     - points : a game. The number is shown with no separator; the
                user taps the gaps between the digits to place the
                points (dots in Spanish, commas in English). The
                numbers go up from thousands to billions.

   They share the menu, the task card and the reinforcement
   mini-round. Progressive ranges (see data.js) raise the size of
   the numbers with the user's progress.

   The 'groups' practice (counting in tens/hundreds/thousands/half
   dozen/dozen) moved to Mental Math in 2026-10. Its screens, data
   and i18n keys travelled with it.
   The 'parity' practice (even / odd) became its own tool at
   tools/parity/ on the same date.

   "Thousand" rule (see data.js): < 10.000 has no separator;
   >= 10.000 does. In read/write modes the format shown matches what
   the user must type; in the points game that match is broken on
   purpose — the exercise is precisely to put the separator back.

   The reading in words uses a custom algorithm (not a lookup table)
   so the read and write practices can generate any number in the
   range 0..999,999,999. Localized to es and en.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'quantities';
  var $ = App.utils.$;

  /* Persistent state */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function t(key) { return App.i18n.t(key); }

  /* ----------- Elements ----------- */
  var menuScreen = $('#screenMenu');
  var taskScreen = $('#screenTask');
  var finishScreen = $('#screenFinish');

  var starsEl = $('#stars');

  /* ============================================================
     Part 1 — the practices
     ============================================================ */

  /* Round state */
  var practice = null;
  var round = [];
  var index = 0;
  var case_ = null;           /* current question */
  var attempts = 0;
  var waitingCheck = true;
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce).
     fixedCase allows reusing paint() with an external case (the
     reinforcement one); if null, paint() takes the current case. */
  var fixedCase = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  var reinforceTotal = 0;
  /* Points game: the gaps the user has filled, and the ones the last
     check marked as wrong. A gap is numbered from the left: gap i
     sits after digit i. */
  var placed = [];
  var wrongGaps = [];

  function randomInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* Picks a case from the practice pool without repeating in the round
     (read and write only; the points game has its own generator). */
  function drawCase(p) {
    var lista = DATA.ranges[p];
    var min = lista[0].min, max = lista[lista.length - 1].max;
    var n;
    var avoidTries = 0;
    do {
      n = randomInt(min, max);
      avoidTries += 1;
    } while (round.length > 0 && round[round.length - 1].n === n && avoidTries < 5);
    return n;
  }

  /* ----------- Number formatting ----------- */

  /* Project rule: below 10.000 NO separator is used; from 10.000 up
     it is. This is the only place in the activity that encodes it. */
  function separator() { return App.i18n.locale() === 'en' ? ',' : '.'; }

  function format(n) {
    var negative = n < 0;
    var abs = Math.abs(n);
    var s = String(abs);
    var sep = separator();
    var parts = [];
    while (s.length > 3) {
      parts.unshift(s.slice(s.length - 3));
      s = s.slice(0, s.length - 3);
    }
    parts.unshift(s);
    var out = parts.join(sep);
    return negative ? '−' + out : out;
  }

  /* ----------- Digit position -----------
     Absolute position 0 = units, 1 = tens, ..., 9 = units of
     thousand millions. */
  /* CSS class per absolute position. The first four are the GROUP
     classes (grp-unit / grp-ten / grp-hundred / grp-thousand), so a
     digit in a big number wears exactly the colour the carousel, the
     reminder and the worked examples gave to its group — one colour
     per group across the whole activity. Positions 4 and up (the
     millions the read practice can reach) fall back to the old
     per-position scheme. */
  var POS_CLASS = ['grp-unit', 'grp-ten', 'grp-hundred', 'grp-thousand',
    'digit-u cifra-mil', 'digit-d cifra-mil', 'digit-c cifra-mil',
    'digit-u cifra-millon', 'digit-d cifra-millon', 'digit-c cifra-millon',
    'digit-u cifra-mil-millones'];

  function coloredDigits(n) {
    var s = String(Math.abs(n));
    var sep = separator();
    var groups = [];
    for (var i = s.length; i > 0; i -= 3) groups.unshift(s.slice(Math.max(0, i - 3), i));
    var htmlOut = '';
    for (var g = 0; g < groups.length; g++) {
      var cuerpo = '';
      for (var j = 0; j < groups[g].length; j++) {
        var posAbs = (groups.length - 1 - g) * 3 + (groups[g].length - 1 - j);
        var clase = POS_CLASS[posAbs] || 'digit-u';
        cuerpo += '<span class="' + clase + '">' + groups[g][j] + '</span>';
      }
      if (g > 0) htmlOut += '<span class="digit-sep">' + sep + '</span>';
      htmlOut += cuerpo;
    }
    if (n < 0) htmlOut = '<span class="sign">−</span>' + htmlOut;
    return htmlOut;
  }

  /* ----------- Reading in words (es / en, up to 10⁹) -----------
     Custom algorithm. Handles the two large groups: thousands (10³
     separator) and millions (10⁶ separator). The top range
     (999,999,999) stays inside "thousand millions" in Spanish and
     "one billion" in English, never touching "trillion" etc. */
  var UNITS_ES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  var UNITS_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  var TENS_ES = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  var TENS_EN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  /* Special 11-19 (es): diez, once, doce, trece, catorce, quince,
     dieciséis, diecisiete, dieciocho, diecinueve. Kept here as data so
     the algorithm below can read them directly; they are not a
     comment translation. */
  var TEENS_ES = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  var TEENS_EN = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  /* Hundreds (es): 100 cien, 200 doscientos, ..., 900 novecientos
     (apocopated). Hundreds (en): no apocope. */
  var HUNDREDS_ES = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  var HUNDREDS_EN = ['', 'one hundred', 'two hundred', 'three hundred', 'four hundred', 'five hundred', 'six hundred', 'seven hundred', 'eight hundred', 'nine hundred'];

  function threeDigits(n, locale) {
    /* n in [0, 999]. Returns a string in the requested language. */
    if (locale === 'en') {
      if (n === 0) return 'zero';
      if (n === 100) return 'one hundred';
      var parts = [];
      var c = Math.floor(n / 100);
      var rest = n % 100;
      if (c) parts.push(HUNDREDS_EN[c]);
      if (rest < 10) {
        if (rest) parts.push(UNITS_EN[rest]);
      } else if (rest < 20) {
        parts.push(TEENS_EN[rest - 10]);
      } else {
        var d = Math.floor(rest / 10);
        var u = rest % 10;
        var txt = TENS_EN[d];
        if (u) txt += '-' + UNITS_EN[u];
        parts.push(txt);
      }
      return parts.join(' ');
    }
    /* ES */
    if (n === 0) return 'cero';
    if (n === 100) return 'cien';
    var partsES = [];
    var cES = Math.floor(n / 100);
    var restES = n % 100;
    if (cES) partsES.push(HUNDREDS_ES[cES]);
    if (restES < 10) {
      if (restES) partsES.push(UNITS_ES[restES]);
    } else if (restES < 20) {
      partsES.push(TEENS_ES[restES - 10]);
    } else if (restES < 30) {
      /* 21-29: veinti + uno/dos/... (with accent on 22-29) */
      var uES = restES - 20;
      var txtES = 'veinti';
      if (uES === 1) txtES += 'uno';
      else if (uES === 2) txtES += 'dós';
      else if (uES === 3) txtES += 'trés';
      else if (uES === 4) txtES += 'cuatro';
      else if (uES === 5) txtES += 'cinco';
      else if (uES === 6) txtES += 'séis';
      else if (uES === 7) txtES += 'siete';
      else if (uES === 8) txtES += 'ocho';
      else if (uES === 9) txtES += 'nueve';
      partsES.push(txtES);
    } else {
      var dES = Math.floor(restES / 10);
      var uuES = restES % 10;
      var tES = TENS_ES[dES];
      if (uuES) tES += ' y ' + UNITS_ES[uuES];
      partsES.push(tES);
    }
    return partsES.join(' ');
  }

  /* Apocope: "veintiún" / "veintiuna" is used before "millones". To
     keep it simple and because the user hears the audio, we keep
     the full forms ("veintiuno millones"). Valid in standard Spanish
     for reading aloud. */
  function readGroup(n, locale, singular, plural) {
    if (n === 1) return locale === 'en' ? 'one ' + singular : singular;
    var num = threeDigits(n, locale);
    return num + ' ' + (locale === 'en' ? plural : (n === 1 ? singular : plural));
  }

  function readNumber(n, locale) {
    if (n === 0) return locale === 'en' ? 'zero' : 'cero';
    var negative = n < 0;
    var abs = Math.abs(n);
    if (locale === 'en') {
      var millionsEN = Math.floor(abs / 1000000);
      var restEN = abs % 1000000;
      var thousandsEN = Math.floor(restEN / 1000);
      var unitsEN = restEN % 1000;
      var parts = [];
      if (millionsEN) {
        parts.push(readGroup(millionsEN, 'en', 'million', 'million'));
        if (thousandsEN || unitsEN) {
          var restFullEN = '';
          if (thousandsEN) {
            restFullEN += (thousandsEN === 1 ? 'one thousand' : threeDigits(thousandsEN, 'en') + ' thousand');
          }
          if (unitsEN) {
            if (thousandsEN) restFullEN += ' ';
            restFullEN += threeDigits(unitsEN, 'en');
          }
          parts.push(restFullEN);
        }
      } else if (thousandsEN) {
        parts.push(thousandsEN === 1 ? 'one thousand' : threeDigits(thousandsEN, 'en') + ' thousand');
        if (unitsEN) parts.push(threeDigits(unitsEN, 'en'));
      } else {
        parts.push(threeDigits(unitsEN, 'en'));
      }
      var out = parts.join(' ');
      return negative ? 'negative ' + out : out;
    }
    /* ES */
    var millionsES = Math.floor(abs / 1000000);
    var restES = abs % 1000000;
    var thousandsES = Math.floor(restES / 1000);
    var unitsES = restES % 1000;
    var partsES = [];
    if (millionsES) {
      partsES.push(readGroup(millionsES, 'es', 'millón', 'millones'));
      var restFullES = '';
      if (thousandsES) {
        restFullES += (thousandsES === 1 ? 'mil' : threeDigits(thousandsES, 'es') + ' mil');
      }
      if (unitsES) {
        if (thousandsES) restFullES += ' ';
        restFullES += threeDigits(unitsES, 'es');
      }
      if (restFullES) partsES.push(restFullES);
    } else if (thousandsES) {
      partsES.push(thousandsES === 1 ? 'mil' : threeDigits(thousandsES, 'es') + ' mil');
      if (unitsES) partsES.push(threeDigits(unitsES, 'es'));
    } else {
      partsES.push(threeDigits(unitsES, 'es'));
    }
    var outES = partsES.join(' ');
    return negative ? 'menos ' + outES : outES;
  }

  /* ----------- Generators ----------- */

  function genRead() {
    var n = drawCase('read');
    return {
      n: n,
      tipo: 'typing',
      /* The number is shown already formatted (with separator if
         applicable). The user must copy it EXACTLY: with separator
         if >= 10.000, without it if < 10.000. This trains reading
         the sign. */
      show: format(n),
      correct: format(n),
      prompt: t('promptRead').replace('{n}', format(n)),
      detail: t('detailRead'),
      audio: readNumber(n, App.i18n.locale())
    };
  }

  function genWrite() {
    var n = drawCase('write');
    return {
      n: n,
      tipo: 'typing',
      /* In "write" the number is NOT shown, only spoken.
         The show field stays empty; the 🔊 button appears. */
      show: '',
      correct: format(n),
      prompt: t('promptWrite'),
      detail: t('detailWrite'),
      audio: readNumber(n, App.i18n.locale())
    };
  }

  /* ----------- The points game -----------
     Each round entry names a level from DATA.ranges.points (thousands,
     millions, billions). The number gets a random digit count inside
     that level, so it always has the right number of points. */

  function levelFor(id) {
    var levels = DATA.ranges.points;
    for (var i = 0; i < levels.length; i++) {
      if (levels[i].id === id) return levels[i];
    }
    return levels[0];
  }

  /* Gap i (after digit i, counted from the left) is a place for a
     point when the digits to its right come in full groups of three. */
  function correctGaps(n) {
    var digits = String(n);
    var gaps = [];
    for (var i = 0; i < digits.length - 1; i++) {
      if ((digits.length - 1 - i) % 3 === 0) gaps.push(i);
    }
    return gaps;
  }

  function genPoints() {
    var level = levelFor(round[index].level);
    var digits = randomInt(level.minDigits, level.maxDigits);
    var n = randomInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
    var gaps = correctGaps(n);
    return {
      n: n,
      tipo: 'points',
      gaps: gaps,
      correct: format(n),
      prompt: gaps.length === 1 ? t('promptPointsOne') : t('promptPoints').replace('{count}', gaps.length),
      detail: t('detailPoints'),
      audio: ''
    };
  }

  var GENERATORS = {
    read: genRead,
    write: genWrite,
    points: genPoints
  };

  /* ----------- Points game: board and tray ----------- */

  function renderPointsBoard(focusGap) {
    var board = $('#pointsBoard');
    var digits = String(case_.n);
    board.innerHTML = '';
    for (var i = 0; i < digits.length; i++) {
      var digit = document.createElement('span');
      digit.className = 'pt-digit';
      digit.textContent = digits.charAt(i);
      board.appendChild(digit);
      if (i < digits.length - 1) board.appendChild(gapButton(i));
    }
    /* The board is rebuilt on every tap; give the focus back to the
       gap that was tapped so keyboard users do not lose their place. */
    if (focusGap !== undefined) {
      var again = board.querySelector('[data-gap="' + focusGap + '"]');
      if (again) again.focus();
    }
  }

  function gapButton(i) {
    var isPlaced = placed.indexOf(i) !== -1;
    var isWrong = wrongGaps.indexOf(i) !== -1;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pt-gap' + (isPlaced ? ' is-placed' : '') + (isWrong ? ' is-wrong' : '');
    btn.setAttribute('data-gap', String(i));
    btn.setAttribute('aria-label', t(isPlaced ? 'gapFilledAria' : 'gapEmptyAria'));
    btn.disabled = !waitingCheck;
    if (isPlaced) {
      var point = document.createElement('span');
      point.className = 'pt-point';
      point.textContent = separator();
      btn.appendChild(point);
    }
    if (isWrong) {
      /* The mark is a shape as well as the colour (WCAG 1.4.1). */
      var mark = document.createElement('span');
      mark.className = 'pt-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = '✗';
      btn.appendChild(mark);
    }
    btn.addEventListener('click', function () { toggleGap(i); });
    return btn;
  }

  function renderPointsTray() {
    var tray = $('#pointsTray');
    var left = case_.gaps.length - placed.length;
    tray.innerHTML = '';
    for (var k = 0; k < left; k++) {
      var chip = document.createElement('span');
      chip.className = 'tray-chip';
      chip.textContent = separator();
      tray.appendChild(chip);
    }
    $('#pointsLeft').textContent = t('pointsLeft').replace('{n}', left);
  }

  /* Tap an empty gap to put a point from the tray; tap a placed point
     to take it back. */
  function toggleGap(i) {
    if (!waitingCheck) return;
    var at = placed.indexOf(i);
    if (at !== -1) {
      placed.splice(at, 1);
    } else if (placed.length < case_.gaps.length) {
      placed.push(i);
    } else {
      $('#feedback').textContent = t('pointsNoneLeft');
      return;
    }
    /* Any change clears the marks of the last check. */
    wrongGaps = [];
    $('#feedback').textContent = '';
    renderPointsBoard(i);
    renderPointsTray();
  }

  function checkPoints() {
    if (placed.length < case_.gaps.length) {
      App.feedback.encourage($('#feedback'));
      $('#feedback').textContent = t('pointsMissing');
      return;
    }
    wrongGaps = placed.filter(function (g) { return case_.gaps.indexOf(g) === -1; });
    if (wrongGaps.length === 0) {
      correct();
      return;
    }
    attempts += 1;
    /* Reinforcement: register the first miss of the item. */
    if (attempts === 1) App.reinforce.add(practice + ':' + case_.correct, case_);
    App.feedback.encourage($('#feedback'));
    $('#feedback').textContent = t('pointsWrongMarked') + ' ' + t('hintPoints');
    renderPointsBoard();
  }

  /* ----------- Paint the task ----------- */

  function hideAllZones() {
    hide($('#numberShown'));
    hide($('#pointsZone'));
    hide($('#answerInput'));
    hide($('#listenBtn'));
    $('#answerInput').value = '';
  }

  function paint() {
    /* If fixedCase is set (reinforcement case), use it; otherwise
       keep the current case. fixedCase is cleared at the end of the
       reinforcement. */
    if (fixedCase) case_ = fixedCase;
    fixedCase = null;
    waitingCheck = true;
    attempts = 0;
    hideAllZones();
    $('#prompt').textContent = case_.prompt;
    $('#taskDetail').textContent = case_.detail;
    $('#taskIcon').textContent = '';

    if (practice === 'read') {
      $('#numberShown').innerHTML = coloredDigits(case_.n);
      show($('#numberShown'));
    } else if (practice === 'write') {
      show($('#listenBtn'));
    } else if (practice === 'points') {
      placed = [];
      wrongGaps = [];
      renderPointsBoard();
      renderPointsTray();
      show($('#pointsZone'));
    }

    $('#progressFill').style.width = ((index / round.length) * 100) + '%';
    $('#progressText').textContent = '';
    $('#feedback').textContent = '';
    show($('#checkAnswer'));
    hide($('#nextTask'));

    /* The points game is tap-driven: there is nothing to type. */
    if (practice === 'points') return;

    show($('#answerInput'));
    /* Focus the input: the typing practices are always keyboard
       driven. */
    $('#answerInput').focus();
  }

  function check() {
    if (!waitingCheck) return;
    if (practice === 'points') {
      checkPoints();
      return;
    }
    var raw = $('#answerInput').value;
    /* Normalise: strip whitespace, map the other separator to the
       locale's one (the person may hesitate). The number itself
       must match. */
    var sepLocal = separator();
    var sepOther = sepLocal === '.' ? ',' : '.';
    var clean = raw.trim().replace(/\s/g, '').replace(sepOther, sepLocal);
    if (clean === case_.correct) {
      correct();
    } else {
      attempts += 1;
      /* Reinforcement: register the first miss of the item. The key
         is stable because case_ is regenerated each round. */
      if (attempts === 1) App.reinforce.add(practice + ':' + case_.correct, case_);
      App.feedback.encourage($('#feedback'));
      $('#feedback').textContent += ' ' + t('hint' + practice.charAt(0).toUpperCase() + practice.slice(1));
      /* In typing mode we do not lock: the user can correct and
         press "Comprobar" again. */
      $('#answerInput').focus();
    }
  }

  function correct() {
    progress.stars += 1;
    save();
    App.feedback.success($('#feedback'));
    $('#feedback').textContent += ' ' + t('correctFormat').replace('{n}', case_.correct);
    waitingCheck = false;
    if (practice === 'points') renderPointsBoard();
    hide($('#checkAnswer'));
    show($('#nextTask'));
    $('#nextTask').focus();
  }

  function goNext() {
    waitingCheck = false;
    /* Mini-round: go to the next item of the reinforcement or close. */
    if (inReinforce) {
      reinforceIndex += 1;
      if (reinforceIndex >= reinforceTotal) {
        inReinforce = false;
        App.reinforce.clear();
        App.reinforce.banner.hide();
        closeRound();
        return;
      }
      showReinforce(reinforceList[reinforceIndex]);
      paintReinforceProgress();
      return;
    }
    index += 1;
    if (index < round.length) {
      case_ = GENERATORS[practice]();
      paint();
      return;
    }
    /* consume() fires the callback if there are misses. If not,
       closeRound closes the normal round. */
    var consume = App.reinforce.consume();
    if (consume.length === 0) closeRound();
  }

  /* Closes the round and shows the final screen. Used both when
     closing the normal round and when the reinforcement mini-round
     ends (in that case consume's callback already started the
     mini-round, and this runs only when the queue empties). */
  function closeRound() {
    $('#finishText').textContent = t('roundSummary')
      .replace('{count}', round.length)
      .replace('{stars}', progress.stars);
    $('#contexto').textContent = t('contexto');
    $('#explanation').textContent = t('explicacion');
    App.feedback.celebrate(t('roundComplete'));
    switchTo(finishScreen);
  }

  /* ----------- Start a practice ----------- */

  function startPractice(id) {
    practice = id;
    round = [];
    if (id === 'points') {
      /* One entry per number, from thousands up to billions. Not
         shuffled on purpose: the size of the numbers goes up. */
      round = DATA.pointsSequence.map(function (level) { return { level: level }; });
    } else {
      var lista = DATA.ranges[id];
      var min = lista[0].min;
      var max = lista[lista.length - 1].max;
      var rounds = DATA.perRound;
      var usedNums = {};
      while (round.length < rounds) {
        var n = randomInt(min, max);
        /* Allow repetition after 4 distinct numbers in a row. */
        if (!usedNums[n] || Object.keys(usedNums).length > 4) {
          round.push({ n: n });
          usedNums[n] = true;
          if (Object.keys(usedNums).length > 6) usedNums = {};
        }
      }
      /* The dedup loop above does not visit rounds in random order; calling
         shuffle here makes the round order present the activity as an
         unguessable sequence (the contract in doc/<locale>/tecnico.md
         §2.2.1: every activity shuffles its questions and options). */
      round = App.utils.shuffle(round);
    }
    index = 0;
    inReinforce = false;
    fixedCase = null;
    reinforceList = [];
    reinforceIndex = 0;
    App.reinforce.banner.hide();
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    case_ = GENERATORS[practice]();
    switchTo(taskScreen);
    paint();
  }

  function startReinforce(fallos) {
    reinforceList = fallos.map(function (f) { return f.payload; });
    reinforceTotal = reinforceList.length;
    reinforceIndex = 0;
    inReinforce = true;
    App.reinforce.banner.set(
      t('reinforceTitle') + ' — ' +
      t('reinforceIntro').replace('{n}', reinforceTotal)
    );
    showReinforce(reinforceList[0]);
  }

  function showReinforce(c) {
    fixedCase = c;
    paint();
  }

  function paintReinforceProgress() {
    $('#progressText').textContent = t('progress')
      .replace('{current}', reinforceIndex + 1)
      .replace('{stars}', reinforceTotal);
  }


  /* ----------- Screen switching -----------
     One place decides which screen is visible, so the header star
     counter and the scroll position are consistent whichever way the
     person navigates. */
  var ALL_SCREENS = [menuScreen, taskScreen, finishScreen];

  function switchTo(screen) {
    ALL_SCREENS.forEach(function (s) { hide(s); });
    show(screen);
    paintStars();
    window.scrollTo(0, 0);
  }

  /* ============================================================
     Wiring
     ============================================================ */

  /* Practice menu: one button per DATA.practices entry. */
  (function paintMenu() {
    var cont = $('#practiceGrid');
    cont.innerHTML = '';
    DATA.practices.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-practice';
      btn.innerHTML =
        '<div class="practice-icon" aria-hidden="true">' + p.icon + '</div>' +
        '<div class="practice-name">' + t(p.id + 'Name') + '</div>' +
        '<div class="practice-detail">' + t(p.id + 'Detail') + '</div>';
      btn.addEventListener('click', function () { startPractice(p.id); });
      cont.appendChild(btn);
    });
  })();

  /* ---- Typing practices and the points game ---- */
  $('#checkAnswer').addEventListener('click', check);
  $('#answerInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') check();
  });
  $('#nextTask').addEventListener('click', goNext);
  var elListenBtn = $('#listenBtn');
  if (elListenBtn) elListenBtn.addEventListener('click', function () {
    if (case_ && case_.audio) if (false && App.tts && App.tts.speak) App.tts.speak(case_.audio);
  });
  $('#backToMenu').addEventListener('click', function () { switchTo(menuScreen); });

  function init() {
    App.i18n.apply();
    paintStars();
    switchTo(menuScreen);
  }

  document.addEventListener('DOMContentLoaded', init);
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
