/* ============================================================
   Calculia — Quantities (read and write large numbers).
   Four practices in the menu:
     - read     : the paintNumber is shown WITHOUT separator (< 10.000)
                 or with separator (>= 10.000); the user copies it.
                 (Showing it with separator trains reading the paintSign.)
     - write    : the paintNumber is spoken and the user writes it.
     - points   : the paintNumber is shown WITHOUT separator; the user
                 must type it WITH the separator in the right place.
     - decompose: the paintNumber is shown with digits coloured by
                 position and the user is asked for the value of
                 ONE digit (3 options: the correct one + 2
                 distractors from the same paintNumber, avoiding repeats).

   "Thousand" rule (see data.js): < 10.000 has no separator;
   >= 10.000 does. In read/write modes the format shown matches
   what the user must type; in "points" mode that match is broken
   on purpose — the exercise is precisely to put the separator back.

   The reading in words uses a custom algorithm (not a lookup
   table) so the activity can generate any paintNumber in the range
   0..999,999,999. Localized to es and en.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'quantities';
  var $ = App.utils.$;

  /* Persistent state */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  /* Round state */
  var practice = null;
  var round = [];
  var index = 0;
  var case_ = null;           /* current question */
  var attempts = 0;
  var waitingCheck = true;
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce).
     fixedCase allows reusing paint() with an external case (the
     reinforcement one); if null, paint() takes the current case.
     inReinforce controls the mini-round flow. */
  var fixedCase = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  var reinforceTotal = 0;

  /* ----------- General helpers ----------- */

  function save() { App.storage.set(TOOL_ID, progress); }
  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  function randomInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  /* Picks a case from the practice pool without repeating in the round. */
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

  /* Project rule: below 10.000 NO separator is used; from
     10.000 up it is. This is the only place in the activity
     that encodes that rule. */
  function separator() { return App.i18n.locale() === 'en' ? ',' : '.'; }

  function format(n) {
    var negative = n < 0;
    var abs = Math.abs(n);
    var s = String(abs);
    var sep = separator();
    /* Insert separator every 3 digits from the right. */
    var parts = [];
    while (s.length > 3) {
      parts.unshift(s.slice(s.length - 3));
      s = s.slice(0, s.length - 3);
    }
    parts.unshift(s);
    var out = parts.join(sep);
    return negative ? '−' + out : out;
  }

  function withoutSeparator(n) { return String(n); }

  /* ----------- Digit position (i18n labels) -----------
     Absolute position 0 = units, 1 = tens, ..., 9 = units of
     thousand millions. The i18n key follows the pattern posU,
     posD, posC, posUM, posDM, posCM, posUMM, posDMM, posCMM,
     posUMMM. */
  var POS_KEYS = ['posU', 'posD', 'posC',
    'posUM', 'posDM', 'posCM',
    'posUMM', 'posDMM', 'posCMM', 'posUMMM'];

  /* CSS colour per absolute position (same convention as numbers:
     units blue, tens green, hundreds purple). For thousands
     groups the colours repeat. */
  var POS_CLASS = ['cifra-u', 'cifra-d', 'cifra-c',
    'cifra-u cifra-mil', 'cifra-d cifra-mil', 'cifra-c cifra-mil',
    'cifra-u cifra-millon', 'cifra-d cifra-millon', 'cifra-c cifra-millon',
    'cifra-u cifra-mil-millones'];

  function digitAtPosition(n, pos) {
    return Math.floor(Math.abs(n) / Math.pow(10, pos)) % 10;
  }

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
        var clase = POS_CLASS[posAbs] || 'cifra-u';
        cuerpo += '<span class="' + clase + '">' + groups[g][j] + '</span>';
      }
      if (g > 0) htmlOut += '<span class="digit-sep">' + sep + '</span>';
      htmlOut += cuerpo;
    }
    if (n < 0) htmlOut = '<span class="sign">−</span>' + htmlOut;
    return htmlOut;
  }

  function legendHTML() {
    var parts = [];
    parts.push('<span class="digit-u">' + App.i18n.t('posU') + '</span>');
    parts.push('<span class="digit-d">' + App.i18n.t('posD') + '</span>');
    parts.push('<span class="digit-c">' + App.i18n.t('posC') + '</span>');
    return App.i18n.t('legendTitle') + ' ' + parts.join(' · ');
  }

  /* ----------- Reading in words (es / en, up to 10⁹) -----------
     Custom algorithm. Handles the two large groups: thousands
     (10³ separator) and millions (10⁶ separator). The top range
     (999,999,999) stays inside "thousand millions" in Spanish and
     "one billion" in English, never touching "trillion" etc. */
  var UNITS_ES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  var UNITS_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  var TENS_ES = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  var TENS_EN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  /* Special 11-19 (es): once, doce, trece, catorce, quince, dieciséis, diecisiete, dieciocho, diecinueve.
     Special 11-19 (en): eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen.
     The Spanish forms are kept here as data so the paintNumber-to-words
     algorithm below can read them directly; they are not a comment
     translation. */
  var TEENS_ES = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  var TEENS_EN = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  /* Hundreds (es): 100 cien, 200 doscientos, ..., 900 novecientos (apocopated).
     Hundreds (en): 100 one hundred, 200 two hundred, ..., 900 nine hundred (no apocope). */
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
    var parts = [];
    var c = Math.floor(n / 100);
    var rest = n % 100;
    if (c) parts.push(HUNDREDS_ES[c]);
    if (rest < 10) {
      if (rest) parts.push(UNITS_ES[rest]);
    } else if (rest < 20) {
      parts.push(TEENS_ES[rest - 10]);
    } else if (rest < 30) {
      /* 21-29: veinti + uno/dos/... (with accent on 22-29) */
      var u = rest - 20;
      var txt = 'veinti';
      if (u === 1) txt += 'uno';
      else if (u === 2) txt += 'dós';
      else if (u === 3) txt += 'trés';
      else if (u === 4) txt += 'cuatro';
      else if (u === 5) txt += 'cinco';
      else if (u === 6) txt += 'séis';
      else if (u === 7) txt += 'siete';
      else if (u === 8) txt += 'ocho';
      else if (u === 9) txt += 'nueve';
      parts.push(txt);
    } else {
      var d = Math.floor(rest / 10);
      var uu = rest % 10;
      var txt = TENS_ES[d];
      if (uu) txt += ' y ' + UNITS_ES[uu];
      parts.push(txt);
    }
    return parts.join(' ');
  }

  /* Apocope: "veintiún" / "veintiuna" is used before "millones",
     "billones"… (the apocopated forms of veintiuno / veintiuna when
     they precede a noun). To keep it simple and because the user will hear
     the audio, we keep the full forms ("veintiuno millones").
     Valid in standard Spanish for reading aloud. */
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

  /* ----------- Generators per practice ----------- */

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
      prompt: App.i18n.t('promptRead').replace('{n}', format(n)),
      detail: App.i18n.t('detailRead'),
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
      prompt: App.i18n.t('promptWrite'),
      detail: App.i18n.t('detailWrite'),
      audio: readNumber(n, App.i18n.locale())
    };
  }

  function genPoints() {
    var n = drawCase('points');
    return {
      n: n,
      tipo: 'typing',
      /* Shown without separator (even if >= 10.000). The user
         must type the version WITH separator. */
      show: withoutSeparator(n),
      correct: format(n),
      prompt: App.i18n.t('promptPoints').replace('{nRaw}', withoutSeparator(n)),
      detail: App.i18n.t('detailPoints'),
      audio: ''
    };
  }

  function genDecompose() {
    var n = drawCase('decompose');
    var s = String(Math.abs(n));
    var totalDigits = s.length;
    /* Pick a random position that exists in the paintNumber. The target
       digit should be != 0 more often than 0, because asking for
       a 0 digit is trivial; but we allow 0 to avoid bias. */
    var posAbs;
    do {
      posAbs = randomInt(0, totalDigits - 1);
    } while (digitAtPosition(n, posAbs) === 0 && Math.random() < 0.6);
    var correctDigit = digitAtPosition(n, posAbs);
    /* Distractors: other digits from the same paintNumber. */
    var others = [];
    for (var p = 0; p < totalDigits; p++) {
      if (p !== posAbs) {
        var c = digitAtPosition(n, p);
        if (others.indexOf(c) === -1) others.push(c);
      }
    }
    App.utils.shuffle(others);
    var distractors = others.slice(0, 2);
    /* If not enough, fill from 0-9 not yet used. */
    var used = [correctDigit].concat(distractors);
    while (distractors.length < 2) {
      var candidate = randomInt(0, 9);
      if (used.indexOf(candidate) === -1) {
        distractors.push(candidate);
        used.push(candidate);
      }
    }
    var options = App.utils.shuffle([correctDigit].concat(distractors));
    return {
      n: n,
      tipo: 'options',
      show: '',
      correct: correctDigit,
      options: options,
      posAbs: posAbs,
      prompt: App.i18n.t('promptDecompose')
        .replace('{placeLabel}', App.i18n.t(POS_KEYS[posAbs]))
        .replace('{n}', format(n)),
      detail: App.i18n.t('detailDecompose'),
      audio: ''
    };
  }

  var GENERATORS = {
    read: genRead,
    write: genWrite,
    points: genPoints,
    decompose: genDecompose
  };

  /* ----------- Show / hide zones per mode ----------- */

  function hideAllZones() {
    hide($('#numberShown'));
    hide($('#numberWithSep'));
    hide($('#numberColored'));
    hide($('#answerInput'));
    hide($('#optionsGrid'));
    hide($('#btnEscuchar'));
    hide($('#legend'));
    $('#optionsGrid').innerHTML = '';
    $('#answerInput').value = '';
  }

  function paint() {
    /* If casoFijo is set (reinforcement case), use it; otherwise
       keep the current case. casoFijo is cleared at the end of the
       reinforcement. */
    if (fixedCase) case_ = fixedCase;
    fixedCase = null;
    hideAllZones();
    var promptEl = $('#prompt');
    promptEl.textContent = case_.prompt;
    $('#taskDetail').textContent = case_.detail;
    $('#taskIcon').textContent = DATA.practices.filter(function (p) { return p.id === practice; })[0].icon;

    if (practice === 'read') {
      $('#numberShown').innerHTML = coloredDigits(case_.n);
      show($('#numberShown'));
      show($('#answerInput'));
    } else if (practice === 'write') {
      show($('#answerInput'));
      show($('#btnEscuchar'));
    } else if (practice === 'points') {
      $('#numberWithSep').textContent = case_.show;
      show($('#numberWithSep'));
      show($('#answerInput'));
    } else if (practice === 'decompose') {
      $('#numberColored').innerHTML = coloredDigits(case_.n);
      show($('#numberColored'));
      show($('#legend'));
      $('#legend').innerHTML = legendHTML();
      var grid = $('#optionsGrid');
      case_.options.forEach(function (opcion) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'option-btn option-btn--digit';
        button.textContent = String(opcion);
        button.setAttribute('data-value', opcion);
        button.setAttribute('aria-label', opcion);
        button.addEventListener('click', function () { clickOption(button, opcion); });
        grid.appendChild(button);
      });
      show(grid);
    }

    $('#progressFill').style.width = ((index / round.length) * 100) + '%';
    $('#progressText').textContent = App.i18n.t('progress').replace('{current}', index + 1).replace('{total}', round.length);
    $('#feedback').textContent = '';
    show($('#checkAnswer'));
    hide($('#nextTask'));
    attempts = 0;
    waitingCheck = true;

    /* Auto-audio in "write": the person must be able to hear the
       number without having to press 🔊. reducedMotion does not
       affect audio. */
    if (practice === 'write' && case_.audio) {
      App.tts.speak(case_.audio);
    }
    /* Focus: input if typing, first button if options. */
    if (practice === 'read' || practice === 'write' || practice === 'points') {
      $('#answerInput').focus();
    } else if (practice === 'decompose') {
      var firstButton = $('#optionsGrid').querySelector('.option-btn');
      if (firstButton) firstButton.focus();
    }
  }

  /* ----------- Click option (decompose mode) ----------- */

  function clickOption(button, value) {
    if (!waitingCheck) return;
    var correct = value === case_.correct;
    if (correct) {
      correct();
    } else {
      attempts += 1;
      if (attempts === 1) App.reinforce.add(practice + ':' + case_.correct, case_);
      App.feedback.encourage($('#feedback'));
      $('#feedback').textContent += ' ' + App.i18n.t('hintDecompose');
      /* Socratic lock: block the rest of the options until the
         person confirms "Got it". Consistent with numbers and
         SPEC §6 rule 12. */
      var buttons = $('#optionsGrid').querySelectorAll('.option-btn');
      App.feedback.lockUntilAck(buttons, $('#feedback'));
    }
  }

  /* ----------- Check (typing mode) ----------- */

  function check() {
    if (!waitingCheck) return;
    var raw = $('#answerInput').value;
    /* Normalise: strip whitespace, map other separator to the
       locale's one (the person may hesitate). The number itself
       must match. */
    var sepLocal = separator();
    var sepOther = sepLocal === '.' ? ',' : '.';
    var clean = raw.trim().replace(new RegExp('\\s', 'g'), '').replace(sepOther, sepLocal);
    if (clean === case_.correct) {
      correct();
    } else {
      attempts += 1;
      /* Reinforcement: register the first miss of the item. Stable
         key: practice + ':' + case_.correct. case_ is regenerated
      each round by GENERATORS, so we need something stable. */
      if (attempts === 1) App.reinforce.add(practice + ':' + case_.correct, case_);
      App.feedback.encourage($('#feedback'));
      $('#feedback').textContent += ' ' + App.i18n.t('hint' + practice.charAt(0).toUpperCase() + practice.slice(1));
      /* In typing mode, re-focus input to retry. We do not lock:
         the user can correct and press "Check" again. */
      $('#answerInput').focus();
    }
  }

  /* ----------- Correct / end of task ----------- */

  function correct() {
    progress.stars += 1;
    save();
    $('#stars').textContent = '⭐ ' + progress.stars;
    App.feedback.success($('#feedback'));
    /* In typing, show the correct form as reinforcement. */
    if (case_.tipo === 'typing') {
      $('#feedback').textContent += ' ' + App.i18n.t('correctFormat').replace('{n}', case_.correct);
    }
    waitingCheck = false;
    hide($('#checkAnswer'));
    show($('#nextTask'));
    $('#nextTask').focus();
  }

  /* ----------- Next / end of round ----------- */

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
      caso = GENERATORS[practice]();
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
     ends (in that case consume's callback already started the mini-
     round, and this runs only when the queue empties). */
  function closeRound() {
    hide($('#screenTask'));
    show($('#screenFinish'));
    $('#finishText').textContent = App.i18n.t('roundSummary')
      .replace('{count}', round.length)
      .replace('{stars}', progress.stars);
    $('#contexto').textContent = App.i18n.t('contexto');
    $('#explicacion').textContent = App.i18n.t('explicacion');
    $('#transfer').textContent = App.i18n.t('transferencia');
    App.feedback.celebrate(App.i18n.t('roundComplete'));
  }

  /* ----------- Start / menu ----------- */

  function startPractice(id) {
    practice = id;
    var lista = DATA.ranges[id];
    var min = lista[0].min;
    var max = lista[lista.length - 1].max;
    var rounds = DATA.perRound;
    round = [];
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
    index = 0;
    inReinforce = false;
    casoFijo = null;
    reinforceList = [];
    reinforceIndex = 0;
    App.reinforce.banner.hide();
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    caso = GENERATORS[practice]();
    hide($('#screenMenu'));
    hide($('#screenFinish'));
    show($('#screenTask'));
    paint();
  }

  function startReinforce(fallos) {
    reinforceList = fallos.map(function (f) { return f.payload; });
    reinforceTotal = reinforceList.length;
    reinforceIndex = 0;
    inReinforce = true;
    App.reinforce.banner.set(
      App.i18n.t('reinforceTitle') + ' — ' +
      App.i18n.t('reinforceIntro').replace('{n}', reinforceTotal)
    );
    showReinforce(reinforceList[0]);
  }

  function showReinforce(c) {
    fixedCase = c;
    paint();
  }

  /* ----------- Wiring ----------- */

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
        '<div class="practice-name">' + App.i18n.t(p.id + 'Name') + '</div>' +
        '<div class="practice-detail">' + App.i18n.t(p.id + 'Detail') + '</div>';
      btn.addEventListener('click', function () { startPractice(p.id); });
      cont.appendChild(btn);
    });
  })();

  /* Events */
  $('#checkAnswer').addEventListener('click', check);
  $('#answerInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') check();
  });
  $('#nextTask').addEventListener('click', goNext);
  $('#btnEscuchar').addEventListener('click', function () {
    if (case_ && case_.audio) App.tts.speak(case_.audio);
  });
  $('#playAgain').addEventListener('click', function () { startPractice(practice); });
  $('#chooseAnother').addEventListener('click', function () {
    hide($('#screenFinish'));
    show($('#screenMenu'));
  });
  $('#backToMenu').addEventListener('click', function () {
    window.location.href = '../../site/index.html';
  });
})();
