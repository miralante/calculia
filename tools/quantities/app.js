/* ============================================================
   Calculia — Cantidades.

   The activity has two halves.

   1) Three typing practices (read / write / points) over big
      numbers: format the number, copy it, hear it and write it, or
      put the thousands separator back. They share the menu, the
      task card and the reinforcement mini-round.

   2) One 'groups' practice that teaches place value through the
      counting groups a person meets in real life — unidades,
      decenas, centenas, millares, media docena and docena. It is
      taught with the roman-numerals methodology: a carousel that
      names each group, real situations where the group appears, a
      colour reminder with worked examples, then chained sub-levels
      that change ONE variable at a time (rule 13).

   Why the old 'decompose' practice is gone: it showed a number with
   coloured digits and asked for the value of one digit. Correct, but
   abstract — the group had no name and no life outside the exercise.
   'groups' keeps the same mechanic (digitValue is its fourth mode)
   and grounds it in "cuatro decenas", "una caja de huevos",
   "media docena". The powers of ten are learned first and the
   docenas come last, because a dozen being twelve rather than ten
   is the confusion worth practising.

   "Thousand" rule (see data.js): < 10.000 has no separator;
   >= 10.000 does. In read/write modes the format shown matches what
   the user must type; in "points" mode that match is broken on
   purpose — the exercise is precisely to put the separator back.

   The reading in words uses a custom algorithm (not a lookup table)
   so the typing practices can generate any number in the range
   0..999,999,999. Localized to es and en.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'quantities';
  var $ = App.utils.$;

  /* Persistent state */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (!progress.groupsCompleted) progress.groupsCompleted = {};

  function save() { App.storage.set(TOOL_ID, progress); }
  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function t(key) { return App.i18n.t(key); }

  /* t() returns the key itself when a translation is missing, so
     that is how a missing real-life sentence is detected. */
  function realText(key) {
    var text = t(key);
    return text !== key ? text : '';
  }

  /* ----------- Elements ----------- */
  var menuScreen = $('#screenMenu');
  var introScreen = $('#screenIntro');
  var famousScreen = $('#screenFamous');
  var reminderScreen = $('#screenReminder');
  var levelsScreen = $('#screenLevels');
  var taskScreen = $('#screenTask');
  var groupsQuizScreen = $('#screenGroupsQuiz');
  var finishScreen = $('#screenFinish');
  var groupsEndScreen = $('#screenGroupsEnd');

  var starsEl = $('#stars');

  /* ============================================================
     Part 1 — the three typing practices
     ============================================================ */

  /* Round state (typing practices) */
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

  function randomInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

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

  function withoutSeparator(n) { return String(n); }

  /* ----------- Digit position -----------
     Absolute position 0 = units, 1 = tens, ..., 9 = units of
     thousand millions. */
  /* CSS class per absolute position. The first four are the GROUP
     classes (grp-unit / grp-ten / grp-hundred / grp-thousand), so a
     digit in a big number wears exactly the colour the carousel, the
     reminder and the worked examples gave to its group — one colour
     per group across the whole activity. Positions 4 and up (the
     millions the typing practices can reach) fall back to the old
     per-position scheme. */
  var POS_CLASS = ['grp-unit', 'grp-ten', 'grp-hundred', 'grp-thousand',
    'digit-u cifra-mil', 'digit-d cifra-mil', 'digit-c cifra-mil',
    'digit-u cifra-millon', 'digit-d cifra-millon', 'digit-c cifra-millon',
    'digit-u cifra-mil-millones'];

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
      else if (u === 6) txt += 'seis';
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

  /* ----------- Generators for the typing practices ----------- */

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

  function genPoints() {
    var n = drawCase('points');
    return {
      n: n,
      tipo: 'typing',
      /* Shown without separator (even if >= 10.000). The user
         must type the version WITH separator. */
      show: withoutSeparator(n),
      correct: format(n),
      prompt: t('promptPoints').replace('{nRaw}', withoutSeparator(n)),
      detail: t('detailPoints'),
      audio: ''
    };
  }

  var GENERATORS = {
    read: genRead,
    write: genWrite,
    points: genPoints
  };

  /* ----------- Paint the typing task ----------- */

  function hideAllZones() {
    hide($('#numberShown'));
    hide($('#numberWithSep'));
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
      $('#numberWithSep').textContent = case_.show;
      show($('#numberWithSep'));
    }
    show($('#answerInput'));

    $('#progressFill').style.width = ((index / round.length) * 100) + '%';
    $('#progressText').textContent = '';
    $('#feedback').textContent = '';
    show($('#checkAnswer'));
    hide($('#nextTask'));
    attempts = 0;
    waitingCheck = true;

    /* Focus the input: the typing practices are always keyboard
       driven. */
    $('#answerInput').focus();
  }

  function check() {
    if (!waitingCheck) return;
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

  /* ----------- Start a typing practice ----------- */

  function startPractice(id) {
    practice = id;
    /* 'groups' is not a typing practice: it has its own screens
       (intro / famous / reminder / levels) and is started from the
       same menu. */
    if (id === 'groups') {
      switchTo(introScreen);
      return;
    }
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

  /* ============================================================
     Part 2 — the 'groups' practice

     roman-numerals methodology: intro carousel → real situations →
     colour reminder with worked examples → chained sub-levels.
     ============================================================ */

  /* ---------- Screen 1: intro carousel ---------- */

  var carouselIdx = 0;

  /* The big display shows the group name, its colour, how many it
     holds and a worked example ("4 decenas = 40"). The example is
     generated, not written by hand, so the carousel and the quiz can
     never disagree about what a decena is. */
  function paintCarousel() {
    var id = DATA.carousel[carouselIdx];
    var g = groupById(id);
    var el = $('#carouselDisplay');
    el.innerHTML =
      '<span class="carousel-name ' + g.cls + '">' + t('group.' + id + 'Name') + '</span>' +
      '<span class="carousel-value">' + format(g.size) + '</span>';
    el.setAttribute('aria-label', t('group.' + id + 'Name') + ': ' + format(g.size));
    $('#carouselCaption').textContent = t('group.' + id + 'Caption');
  }

  function carouselStep(delta) {
    carouselIdx = (carouselIdx + delta + DATA.carousel.length) % DATA.carousel.length;
    paintCarousel();
  }

  /* ---------- Screen 2: real situations ---------- */

  var famousIdx = 0;

  /* Each entry pairs a group with a real situation. The situation
     sentence lives in strings.<locale>.js and always ends with ":",
     so the coloured formula can be appended without the two halves
     fighting over the punctuation — same trick as
     roman-numerals' famous screen. */
  function paintFamous() {
    var item = DATA.famous[famousIdx];
    var g = groupById(item.group);
    var example = t('famous.' + item.factKey);
    var exampleText = example !== 'famous.' + item.factKey ? example : '';
    $('#famousExample').innerHTML =
      '<span class="famoso-group ' + g.cls + '">' + t('group.' + item.group + 'Name') + '</span>' +
      '<span class="famoso-value"><span class="famoso-equals">=</span>' +
      '<span class="famoso-number">' + format(g.size) + '</span></span>';
    $('#famousExample').setAttribute('aria-label', t('group.' + item.group + 'Name') + ': ' + format(g.size));
    $('#famousText').textContent = exampleText;
  }

  function famousStep(delta) {
    famousIdx = (famousIdx + delta + DATA.famous.length) % DATA.famous.length;
    paintFamous();
  }

  /* ---------- Screen 3: the reminder ---------- */

  /* The colour table has one row per group, each showing the group's
     colour, its name and how many it holds. Below it, the two rules
     with worked examples — the same shape as the roman-numerals
     reminder, which teaches two rules with two examples each so the
     rule is seen with more than one number.

     Rule 1 (same in every group): count the groups, then multiply.
       "3 decenas = 3 × 10 = 30"
     Rule 2 (the one that surprises): a dozen is twelve, not ten.
       "2 docenas = 2 × 12 = 24"  vs  "2 decenas = 20" */
  var RULE_EXAMPLES = [
    { count: 3, group: 'ten' },
    { count: 4, group: 'hundred' },
    { count: 5, group: 'ten' }
  ];
  var DOZEN_EXAMPLES = [
    { count: 2, group: 'dozen' },
    { count: 3, group: 'halfDozen' },
    { count: 2, group: 'ten' }
  ];

  function paintGroupsRow() {
    var el = $('#groupsRow');
    el.innerHTML = '';
    DATA.carousel.forEach(function (id) {
      var g = groupById(id);
      var chip = document.createElement('div');
      chip.className = 'group-chip';
      chip.innerHTML =
        '<span class="group-chip-name ' + g.cls + '">' + t('group.' + id + 'Name') + '</span>' +
        '<span class="group-chip-size">' + format(g.size) + '</span>';
      el.appendChild(chip);
    });
  }

  /* The worked example: "3 decenas = 3 × 10 = 30". The count, the
     multiplier and the total each keep the group's colour so the eye
     can pair "decenas" with the number that multiplies and with the
     number that comes out. */
  function exampleFormula(example) {
    var g = groupById(example.group);
    var phrase = groupPhrase(example.count, example.group);
    var total = example.count * g.size;
    return '<span class="ex-phrase ' + g.cls + '">' + phrase.text + '</span>' +
      '<span class="ex-op"> = </span>' +
      '<span class="ex-count ' + g.cls + '">' + example.count + '</span>' +
      '<span class="ex-op"> × </span>' +
      '<span class="ex-size ' + g.cls + '">' + format(g.size) + '</span>' +
      '<span class="ex-op"> = </span>' +
      '<span class="ex-total">' + format(total) + '</span>';
  }

  function paintRuleExamples() {
    var box1 = $('#ruleMultiply');
    box1.innerHTML = RULE_EXAMPLES.map(function (ex) {
      return '<div class="rule-example">' + exampleFormula(ex) + '</div>';
    }).join('');
    var box2 = $('#ruleDozen');
    box2.innerHTML = DOZEN_EXAMPLES.map(function (ex) {
      return '<div class="rule-example">' + exampleFormula(ex) + '</div>';
    }).join('');
  }

  /* ---------- Screen 4: the levels ---------- */

  /* Difficulty rating shown on the level button. A group is rated by
     its hardest sub-level, so the number is written once in data.js
     and the group can never claim to be easier than the step it
     ends on. */
  function levelStars(level) {
    if (level.sublevels) {
      return level.sublevels.reduce(function (max, sn) {
        return Math.max(max, sn.stars || 1);
      }, 1);
    }
    return level.stars || 1;
  }

  function paintLevels() {
    var cont = $('#levelsGrid');
    cont.innerHTML = '';
    DATA.levels.forEach(function (level) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-practice';
      var done = levelDone(level);
      btn.innerHTML =
        '<div class="practice-icon" aria-hidden="true">' + (level.icon || levelIcon(level)) + '</div>' +
        '<div class="practice-name">' + t('level.' + level.id + 'Name') + '</div>' +
        '<div class="practice-detail">' + t('level.' + level.id + 'Detail') + '</div>' +
        '<div class="practice-stars" aria-label="' + t('starsCount').replace('{n}', levelStars(level)) + '">' +
        '⭐'.repeat(levelStars(level)) + '</div>' +
        (done ? '<div class="practice-done">' + t('levelDone') + '</div>' : '');
      btn.addEventListener('click', function () { startGroupsLevel(level); });
      cont.appendChild(btn);
    });
  }

  /* Every sub-level of a group must be finished before the group
     counts as done — the group is a chain, not a single round. */
  function levelDone(level) {
    if (level.sublevels) {
      return level.sublevels.every(function (sn) {
        return progress.groupsCompleted[sn.id];
      });
    }
    return !!progress.groupsCompleted[level.id];
  }

  function levelIcon(level) {
    return { learn: '📚', apply: '🧩', test: '🎲' }[level.id] || '⭐';
  }

  /* ---------- Quiz ---------- */

  var currentLevel = null;
  var currentGroup = null;
  var currentSubIdx = 0;
  var items = [];
  var gIdx = 0;
  var gCorrect = 0;
  var gResolved = false;
  var gAttempts = 0;
  /* Text of the "next step of the chain" banner, set by finishGroups
     before it jumps to the next sub-level and cleared once painted.
     Kept in a variable instead of being written straight into the
     DOM because startGroupsLevel re-renders the quiz from scratch,
     which would otherwise wipe the banner it is meant to show. */
  var chainBanner = '';

  /* A number that has a non-zero digit in one of the positions the
     level allows, plus other digits in the other allowed positions.
     Building the number this way (instead of drawing a random one and
     hoping the digit is non-zero) means the question never lands on
     a 0, which carries no information about the group. */
  function numberWithTargetDigit(positions) {
    var targetId = positions[randomInt(0, positions.length - 1)];
    var target = groupById(targetId);
    var digit = randomInt(1, 9);
    var n = digit * target.size;
    positions.forEach(function (id) {
      if (id === targetId) return;
      if (Math.random() < 0.6) n += randomInt(0, 9) * groupById(id).size;
    });
    return {
      n: n,
      targetId: targetId,
      digit: digit,
      /* The value of the digit at its position, e.g. 4 at hundreds
         = 400. This is what the question asks for. */
      value: digit * target.size
    };
  }

  /* One round entry. Each mode returns the same shape so buildRound
     can treat them uniformly. */
  function entryFor(level) {
    var mode = level.mode;
    if (mode === 'groupToNumber' || mode === 'dozenToNumber') {
      var pool = level.pools || ['unit', 'ten'];
      var groupId = pool[randomInt(0, pool.length - 1)];
      var count = randomInt(1, level.maxCount || 9);
      var g = groupById(groupId);
      return {
        mode: mode, groupId: groupId, count: count,
        n: count * g.size, size: g.size
      };
    }
    if (mode === 'numberToGroup' || mode === 'numberToDozen') {
      var pool2 = level.pools || ['unit', 'ten'];
      var groupId2 = pool2[randomInt(0, pool2.length - 1)];
      var count2 = randomInt(1, level.maxCount || 9);
      var g2 = groupById(groupId2);
      return {
        mode: mode, groupId: groupId2, count: count2,
        n: count2 * g2.size, size: g2.size
      };
    }
    /* digitValue */
    var positions = level.positions || ['ten', 'hundred'];
    var built = numberWithTargetDigit(positions);
    return {
      mode: 'digitValue', groupId: built.targetId,
      n: built.n, digit: built.digit, value: built.value,
      size: groupById(built.targetId).size
    };
  }

  /* Identity of a round entry, so two identical questions never land
     one after the other (see spreadRepeats). */
  function groupsEntryKey(entry) {
    return entry.mode + '|' + entry.groupId + '|' + entry.count + '|' + entry.digit;
  }

  function hasAdjacentRepeat(list) {
    for (var i = 1; i < list.length; i++) {
      if (groupsEntryKey(list[i]) === groupsEntryKey(list[i - 1])) return true;
    }
    return false;
  }

  /* Reshuffle a few times until no two copies of the same question
     are side by side. Two identical cards in a row make "Siguiente"
     look broken: the button works but the screen does not change. */
  function spreadRepeats(list) {
    for (var attempt = 0; attempt < 20; attempt++) {
      var shuffled = App.utils.shuffle(list);
      if (!hasAdjacentRepeat(shuffled)) return shuffled;
    }
    var byKey = {};
    list.forEach(function (e) {
      var k = groupsEntryKey(e);
      (byKey[k] = byKey[k] || []).push(e);
    });
    var flat = [];
    Object.keys(byKey)
      .sort(function (a, b) { return byKey[b].length - byKey[a].length; })
      .forEach(function (k) { flat = flat.concat(byKey[k]); });
    var out = new Array(flat.length);
    var slot = 0;
    for (var i = 0; i < flat.length; i++) {
      out[slot] = flat[i];
      slot += 2;
      if (slot >= flat.length) slot = 1;
    }
    return out;
  }

  /* The flat list of base sub-levels (those with their own mode),
     excluding the groups and the 'test' level, which are wrappers. */
  function baseLevels() {
    var out = [];
    DATA.levels.forEach(function (level) {
      if (level.pool === 'group') {
        if (level.sublevels) out = out.concat(level.sublevels);
      } else if (level.pool !== 'random' && level.mode !== 'random') {
        out.push(level);
      }
    });
    return out;
  }

  function itemsForGroupsLevel(level) {
    var total = DATA.perRoundGroups;
    if (level.pool === 'random' || level.mode === 'random') {
      var modes = baseLevels();
      var out = [];
      for (var i = 0; i < total; i++) {
        var entry, tries = 0;
        do {
          var base = modes[randomInt(0, modes.length - 1)];
          entry = entryFor(base);
          tries += 1;
        } while (out.length && tries < 10 &&
                 groupsEntryKey(entry) === groupsEntryKey(out[out.length - 1]));
        out.push(entry);
      }
      return out;
    }
    var pool = [];
    for (var k = 0; k < total; k++) {
      var candidate, ct = 0;
      do {
        candidate = entryFor(level);
        ct += 1;
      } while (pool.length && ct < 10 &&
               groupsEntryKey(candidate) === groupsEntryKey(pool[pool.length - 1]));
      pool.push(candidate);
    }
    return pool;
  }

  /* Starts a round. If 'level' is a group, starts with its first
     sub-level and remembers which one, so the chain continues
     automatically when the round ends (see finishGroups).

     `inChain` separates "entered from the levels screen" from "next
     sub-level of a chain". Without it, the non-chain branch clears
     currentGroup and the chain breaks silently: finishGroups() no
     longer finds the group and jumps to the end screen after the
     FIRST sub-level, so steps 2 and 3 are never played. */
  function startGroupsLevel(level, inChain) {
    if (level.pool === 'group') {
      currentGroup = level;
      currentSubIdx = 0;
      startGroupsLevel(level.sublevels[0], true);
      return;
    }
    if (!inChain) {
      currentGroup = null;
      currentSubIdx = 0;
    }
    currentLevel = level;
    items = itemsForGroupsLevel(level);
    gIdx = 0;
    gCorrect = 0;
    switchTo(groupsQuizScreen);
    renderGroups();
  }

  /* Real-life sentence for a round, when the entry's group has one.

     Only when the round asks for a SINGLE group. Every scene in
     DATA.scenes describes one group of that size — "there are ten
     fingers on both hands" is about one decena — so attaching it to
     "6 decenas" would state something false, and a false example is
     worse than no example. digitValue never gets one either: its
     prompt is an arbitrary number, not a group of things.

     t() returns the key itself when missing, so a key with no
     translation simply yields no context line. */
  function sceneFor(entry) {
    if (entry.mode === 'digitValue' || entry.count !== 1) return '';
    var scene = DATA.scenes.filter(function (s) { return s.group === entry.groupId; })[0];
    return scene ? realText('scene.' + scene.id) : '';
  }

  /* Builds the wrong options. They are never invented numbers: each
     comes from another group the activity teaches, or from the same
     group with a different count. So every option on screen is
     something the person has already met. */
  function valueDistractors(entry, correct) {
    var pool = [];
    DATA.groups.forEach(function (g) {
      if (g.id === entry.groupId) return;
      /* Same count in another group: "3 decenas" and "3 centenas"
         are the classic confusion, so it must be one of the two. */
      pool.push(entry.count * g.size);
    });
    /* Same group, one more or one less group. */
    if (entry.count + 1 <= 12) pool.push((entry.count + 1) * entry.size);
    if (entry.count - 1 >= 1) pool.push((entry.count - 1) * entry.size);
    /* digitValue: the bare digit is the trap — the person reads the
       4 and forgets it stands for 400. */
    if (entry.mode === 'digitValue') {
      pool.push(entry.digit);
      pool.push(entry.digit * 10);
    }
    return takeTwo(pool, correct);
  }

  function phraseDistractors(entry, correctText) {
    var pool = [];
    DATA.groups.forEach(function (g) {
      if (g.id !== entry.groupId) pool.push(groupPhrase(entry.count, g.id).text);
    });
    pool.push(groupPhrase(entry.count + 1, entry.groupId).text);
    if (entry.count > 1) pool.push(groupPhrase(entry.count - 1, entry.groupId).text);
    return takeTwo(pool, correctText);
  }

  /* Two distinct wrong values that are not the correct one, in the
     original order, so the option set never repeats itself. */
  function takeTwo(pool, correct) {
    var out = [];
    pool.forEach(function (v) {
      if (out.length < 2 && v !== correct && out.indexOf(v) === -1) out.push(v);
    });
    /* Fallback when the pool was too small (only possible with a
       group of size 1). Fill from the other groups' sizes. */
    var extra = [6, 10, 12, 100, 1000];
    var k = 0;
    while (out.length < 2 && k < extra.length) {
      if (extra[k] !== correct && out.indexOf(extra[k]) === -1) out.push(extra[k]);
      k += 1;
    }
    return out;
  }

  function buildGroupsRound(entry) {
    var mode = entry.mode;
    var shown, question, correctValue, options, context = '';

    if (mode === 'groupToNumber' || mode === 'dozenToNumber') {
      shown = groupPhrase(entry.count, entry.groupId).text;
      question = t('qHowMany');
      correctValue = entry.n;
      options = App.utils.shuffle([correctValue].concat(valueDistractors(entry, correctValue)));
      context = sceneFor(entry);
    } else if (mode === 'numberToGroup' || mode === 'numberToDozen') {
      shown = format(entry.n);
      question = t('qWhichGroup');
      correctValue = groupPhrase(entry.count, entry.groupId).text;
      options = App.utils.shuffle([correctValue].concat(phraseDistractors(entry, correctValue)));
      context = sceneFor(entry);
    } else {
      /* digitValue: the prompt is the number with its digits in the
         colour of their group. aria-label carries the plain number so
         the screen reader does not read the spans separately. */
      shown = coloredDigits(entry.n);
      question = t('qDigitValue')
        .replace('{digit}', entry.digit)
        .replace('{plural}', t('group.' + entry.groupId + 'Plural'));
      correctValue = entry.value;
      options = App.utils.shuffle([correctValue].concat(valueDistractors(entry, correctValue)));
      context = sceneFor(entry);
    }
    return {
      shown: shown, question: question, correctValue: correctValue,
      options: options, context: context, entry: entry
    };
  }

  function paintGroupsProgress() {
    $('#groupsProgressFill').style.width = ((gIdx / items.length) * 100) + '%';
    $('#groupsProgressText').textContent = (gIdx + 1) + ' / ' + items.length;
    /* The sub-levels are not named individually: they are numbered
       steps inside their group, so the header reads "Paso 2 de 4 ·
       Aplicar". Naming each sub-level separately would mean six
       near-identical labels in four languages for what is really one
       progression. */
    var groupId = currentLevel.group || currentLevel.id;
    var position = 1;
    var totalSteps = DATA.levels.filter(function (l) { return l.id === groupId; })[0];
    var flat = totalSteps && totalSteps.sublevels ? totalSteps.sublevels : [currentLevel];
    flat.forEach(function (sn, i) { if (sn.id === currentLevel.id) position = i + 1; });
    $('#groupsStep').textContent = t('stepLabel')
      .replace('{n}', position)
      .replace('{total}', flat.length)
      .replace('{name}', t('level.' + groupId + 'Name'));
  }

  function renderGroups() {
    var roundData = buildGroupsRound(items[gIdx]);
    gResolved = false;
    gAttempts = 0;
    var shownEl = $('#groupsShown');
    shownEl.innerHTML = roundData.shown;
    shownEl.setAttribute('aria-label', plainShown(roundData));
    /* 72px está pensado para una cifra. Cuando el prompt es una frase
       ("4 decenas") no cabe en 320px, así que baja de tamaño; el
       layout se decide aquí, no con un poco de CSS suelta. */
    shownEl.classList.toggle('quiz-shown--phrase', roundData.entry.mode !== 'digitValue');
    $('#groupsContext').textContent = roundData.context;
    $('#groupsContext').classList.toggle('hidden', !roundData.context);
    $('#groupsQuestion').textContent = roundData.question;
    $('#groupsFeedback').textContent = '';
    $('#groupsFeedback').className = 'feedback';
    $('#groupsExplanationWrap').classList.add('hidden');
    $('#groupsExplanation').textContent = '';
    $('#groupsNext').classList.add('hidden');
    var banner = $('#groupsChainBanner');
    if (chainBanner) {
      banner.textContent = chainBanner;
      banner.classList.remove('hidden');
      chainBanner = '';
    } else {
      banner.textContent = '';
      banner.classList.add('hidden');
    }

    var optionsEl = $('#groupsOptions');
    optionsEl.innerHTML = '';
    roundData.options.forEach(function (value) {
      var btn = document.createElement('button');
      btn.type = 'button';
      /* Una frase ("4 decenas", "3 medias docenas") no cabe en una
         celda de tres columnas a 375px con el tamaño de titular: se
         salía del botón. Los dígitos sí caben, así que el tamaño sólo
         baja cuando la opción es texto. */
      btn.className = 'option-btn' + (/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(String(value)) ? ' option-btn--word' : '');
      btn.textContent = value;
      btn.addEventListener('click', function () { answerGroups(btn, value, roundData); });
      optionsEl.appendChild(btn);
    });

    paintGroupsProgress();
    paintStars();
  }

  /* The spoken/announced version of the prompt, without the coloured
     markup, so aria-label is readable. */
  function plainShown(roundData) {
    var entry = roundData.entry;
    if (entry.mode === 'digitValue') return format(entry.n);
    return roundData.shown;
  }

  /* Socratic hint. It must not give the answer away (SPEC: the hint
     teaches the mechanic, it does not resolve the round), so it says
     which group to look at, never what it multiplies to. */
  function pickGroupsHint(entry) {
    if (entry.mode === 'digitValue') {
      return t('hintDigitValue');
    }
    if (entry.mode === 'numberToGroup' || entry.mode === 'numberToDozen') {
      return t('hintWhichGroup');
    }
    if (entry.groupId === 'dozen' || entry.groupId === 'halfDozen') {
      return t('hintDozen');
    }
    return t('hintHowMany');
  }

  function answerGroups(btn, value, roundData) {
    if (gResolved) return;
    var isCorrect = value === roundData.correctValue;
    if (isCorrect) {
      gResolved = true;
      btn.classList.add('correct');
      App.utils.$$('#groupsOptions .option-btn').forEach(function (b) { b.disabled = true; });
      App.feedback.success($('#groupsFeedback'));
      progress.stars += 1;
      gCorrect += 1;
      save();
      paintStars();
      $('#groupsExplanation').textContent = t('groupsCorrect');
      $('#groupsExplanationWrap').classList.remove('hidden');
      $('#groupsNext').classList.remove('hidden');
      $('#groupsNext').focus();
    } else {
      gAttempts += 1;
      if (gAttempts === 1) {
        $('#groupsExplanation').textContent = t('groupsHintPrefix') + pickGroupsHint(roundData.entry);
      } else {
        $('#groupsExplanation').textContent = t('groupsWrongPrefix') + roundData.correctValue;
      }
      $('#groupsExplanationWrap').classList.remove('hidden');
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage($('#groupsFeedback'));
      /* Socratic lock: block the rest of the options until the
         person confirms, so the hint is read before trying again. */
      App.feedback.lockUntilAck(App.utils.$$('#groupsOptions .option-btn'), $('#groupsExplanationWrap'));
    }
  }

  function nextGroups() {
    gIdx += 1;
    if (gIdx >= items.length) finishGroups();
    else renderGroups();
  }

  function finishGroups() {
    progress.groupsCompleted[currentLevel.id] = (progress.groupsCompleted[currentLevel.id] || 0) + 1;
    save();
    /* If the round belonged to a chained group, jump straight to the
       next sub-level without going back to the menu (regla 13: the
       chain keeps the progression visible). */
    if (currentGroup && currentSubIdx + 1 < currentGroup.sublevels.length) {
      currentSubIdx += 1;
      chainBanner = t('chainNext')
        .replace('{name}', t('level.' + currentGroup.sublevels[currentSubIdx].group + 'Name'));
      startGroupsLevel(currentGroup.sublevels[currentSubIdx], true);
      return;
    }
    $('#groupsFinalSummary').textContent = t('groupsFinal')
      .replace('{n}', gCorrect)
      .replace('{total}', items.length)
      .replace('{stars}', progress.stars);
    switchTo(groupsEndScreen);
    App.feedback.celebrate(t('core.roundComplete'));
  }

  /* ----------- Screen switching -----------
     One place decides which screen is visible, so the header star
     counter and the scroll position are consistent whichever way the
     person navigates. */
  var ALL_SCREENS = [menuScreen, introScreen, famousScreen, reminderScreen,
    levelsScreen, taskScreen, groupsQuizScreen, finishScreen, groupsEndScreen];

  function switchTo(screen) {
    ALL_SCREENS.forEach(function (s) { hide(s); });
    /* La rejilla de pasos lleva la marca de "hecho" por grupo, así que
       hay que repintarla en cada llegada. Si se pintara sólo en
       init(), al volver de terminar una cadena la pantalla seguiría
       diciendo que no se ha hecho nada. */
    if (screen === levelsScreen) paintLevels();
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

  /* ---- Typing practices ---- */
  $('#checkAnswer').addEventListener('click', check);
  $('#answerInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') check();
  });
  $('#nextTask').addEventListener('click', goNext);
  var elListenBtn = $('#listenBtn');
  if (elListenBtn) elListenBtn.addEventListener('click', function () {
    if (case_ && case_.audio) if (false && App.tts && App.tts.speak) App.tts.speak(case_.audio);
  });
  $('#playAgain').addEventListener('click', function () { startPractice(practice); });
  $('#chooseAnother').addEventListener('click', function () { switchTo(menuScreen); });
  $('#backToMenu').addEventListener('click', function () { switchTo(menuScreen); });

  /* ---- Groups: intro → famous → reminder → levels ---- */
  $('#carouselDisplay').addEventListener('click', function () { carouselStep(1); });
  $('#carouselDisplay').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carouselStep(1);
    }
  });
  $('#carouselPrev').addEventListener('click', function () { carouselStep(-1); });
  $('#carouselNext').addEventListener('click', function () { carouselStep(1); });
  $('#introNext').addEventListener('click', function () { switchTo(famousScreen); });

  $('#famousPrev2').addEventListener('click', function () { famousStep(-1); });
  $('#famousNext2').addEventListener('click', function () { famousStep(1); });
  $('#famousPrevBtn').addEventListener('click', function () { switchTo(introScreen); });
  $('#famousNextBtn').addEventListener('click', function () { switchTo(reminderScreen); });

  $('#reminderBack').addEventListener('click', function () { switchTo(famousScreen); });
  $('#referenceNext').addEventListener('click', function () { switchTo(levelsScreen); });

  $('#levelsBack').addEventListener('click', function () { switchTo(reminderScreen); });
  $('#levelsBackToMenu').addEventListener('click', function () { switchTo(menuScreen); });

  $('#groupsBackLevels').addEventListener('click', function () { switchTo(levelsScreen); });
  $('#groupsNext').addEventListener('click', nextGroups);
  $('#groupsReplay').addEventListener('click', function () { startGroupsLevel(currentLevel); });
  $('#groupsChooseLevel').addEventListener('click', function () { switchTo(levelsScreen); });
  $('#groupsEndMenu').addEventListener('click', function () { switchTo(menuScreen); });

  function init() {
    App.i18n.apply();
    paintStars();
    paintCarousel();
    paintFamous();
    paintGroupsRow();
    paintRuleExamples();
    paintLevels();
    switchTo(menuScreen);
  }

  document.addEventListener('DOMContentLoaded', init);
})();