/* ============================================================
   Calculia — Decimal comma.

   A whole number is shown with no separator (452567). The person
   taps the gap where the decimal comma goes (452,567). The prompt
   says how many decimal digits the number has, so the comma is found
   by counting from the right.

   Tap rules (one comma only, so no dragging):
     - tap an empty gap  -> the comma goes there
     - tap another gap   -> the comma moves there
     - tap the comma     -> the comma is removed

   English shows a point instead of the comma (see strings.en.js).
   The gap is the place after the last digit of the whole part.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'decimal';
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
  var boardEl = $('#commaBoard');
  var trayEl = $('#commaTray');
  var feedbackEl = $('#feedback');
  var checkBtn = $('#checkAnswer');
  var nextBtn = $('#nextTask');
  var hearBtn = $('#hearNumber');

  /* ----------- Round state ----------- */
  var round = [];
  var index = 0;
  var case_ = null;           /* current question */
  var attempts = 0;
  var waitingCheck = true;
  var placed = null;          /* gap the comma sits in, or null */
  var wrongGap = null;        /* gap marked ✗ by the last check, or null */
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce).
     fixedCase lets paint() show an external case (the reinforcement one). */
  var fixedCase = null;
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;
  var reinforceTotal = 0;

  function randomInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* Decimal separator of the locale: comma in Spanish, point in English. */
  function decimalSeparator() { return App.i18n.locale() === 'en' ? '.' : ','; }

  /* ----------- Spoken numbers -----------
     The audio says the whole part as a number and the decimals digit by
     digit: "tres coma cinco", "three point five". The whole part is at
     most three digits (see data.js), so only 1 to 999 is needed. */
  var WORDS = {
    es: {
      units: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'],
      teens: ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'],
      twenties: ['veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'],
      tens: ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'],
      hundreds: ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']
    },
    en: {
      units: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
      teens: ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
      tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
    }
  };

  function speakWhole(n, locale) {
    var w = locale === 'en' ? WORDS.en : WORDS.es;
    var parts = [];
    var h = Math.floor(n / 100);
    var rest = n % 100;
    if (h) {
      if (locale === 'en') parts.push(w.units[h] + ' hundred');
      else parts.push(h === 1 && rest === 0 ? 'cien' : w.hundreds[h]);
    }
    if (rest) {
      if (rest < 10) {
        parts.push(w.units[rest]);
      } else if (rest < 20) {
        parts.push(w.teens[rest - 10]);
      } else if (locale !== 'en' && rest < 30) {
        parts.push(w.twenties[rest - 20]);
      } else if (locale === 'en') {
        parts.push(w.tens[Math.floor(rest / 10)] + (rest % 10 ? '-' + w.units[rest % 10] : ''));
      } else {
        parts.push(w.tens[Math.floor(rest / 10)] + (rest % 10 ? ' y ' + w.units[rest % 10] : ''));
      }
    }
    return parts.join(' ');
  }

  /* ----------- Generator ----------- */
  function genDecimal() {
    var step = round[index];
    var total = step.enteras + step.decimales;
    var n;
    /* No trailing zero: "2,50" would be heard and read as "2,5". */
    do {
      n = randomInt(Math.pow(10, total - 1), Math.pow(10, total) - 1);
    } while (n % 10 === 0);
    var locale = App.i18n.locale();
    var digits = String(n);
    var whole = digits.slice(0, step.enteras);
    var fraction = digits.slice(step.enteras);
    var words = WORDS[locale === 'en' ? 'en' : 'es'].units;
    var spokenFraction = fraction.split('').map(function (d) { return words[Number(d)]; }).join(' ');
    return {
      n: n,
      gap: step.enteras - 1,
      decimals: step.decimales,
      correct: whole + decimalSeparator() + fraction,
      prompt: step.decimales === 1
        ? t('promptDecimalOne')
        : t('promptDecimal').replace('{count}', step.decimales),
      detail: t('detailDecimal'),
      audio: speakWhole(Number(whole), locale) + (locale === 'en' ? ' point ' : ' coma ') + spokenFraction
    };
  }

  /* ----------- Board and tray ----------- */
  function renderBoard() {
    var digits = String(case_.n);
    boardEl.innerHTML = '';
    for (var i = 0; i < digits.length; i++) {
      var digit = document.createElement('span');
      digit.className = 'comma-digit';
      digit.textContent = digits.charAt(i);
      boardEl.appendChild(digit);
      if (i < digits.length - 1) boardEl.appendChild(gapButton(i));
    }
  }

  function gapButton(i) {
    var isPlaced = placed === i;
    var isWrong = wrongGap === i;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'comma-gap' + (isPlaced ? ' is-placed' : '') + (isWrong ? ' is-wrong' : '');
    btn.setAttribute('data-gap', String(i));
    btn.setAttribute('aria-label', t(isPlaced ? 'gapFilledAria' : 'gapEmptyAria'));
    btn.disabled = !waitingCheck;
    if (isPlaced) {
      var point = document.createElement('span');
      point.className = 'comma-point';
      point.textContent = decimalSeparator();
      btn.appendChild(point);
    }
    if (isWrong) {
      /* The mark is a shape as well as the colour (WCAG 1.4.1). */
      var mark = document.createElement('span');
      mark.className = 'comma-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = '✗';
      btn.appendChild(mark);
    }
    btn.addEventListener('click', function () { tapGap(i); });
    return btn;
  }

  /* One chip in the tray while the comma is still to be placed. */
  function renderTray() {
    trayEl.innerHTML = '';
    if (placed !== null) return;
    var chip = document.createElement('span');
    chip.className = 'comma-chip';
    chip.textContent = decimalSeparator();
    trayEl.appendChild(chip);
  }

  function tapGap(i) {
    if (!waitingCheck) return;
    /* Tapping the placed comma removes it; tapping another gap moves it. */
    placed = placed === i ? null : i;
    wrongGap = null;
    feedbackEl.textContent = '';
    renderBoard();
    renderTray();
    /* Keep the keyboard user's place on the gap they just used. */
    var again = boardEl.querySelector('[data-gap="' + i + '"]');
    if (again) again.focus();
  }

  /* ----------- Check ----------- */
  function check() {
    if (!waitingCheck) return;
    if (placed === null) {
      App.feedback.encourage(feedbackEl);
      feedbackEl.textContent = t('missing');
      return;
    }
    if (placed === case_.gap) {
      correct();
      return;
    }
    attempts += 1;
    /* Reinforcement: register the first miss of the item. */
    if (attempts === 1) App.reinforce.add('decimal:' + case_.correct, case_);
    wrongGap = placed;
    /* Socratic hint: how many digits are to the right of the comma placed. */
    var digitsToRight = String(case_.n).length - 1 - placed;
    App.feedback.encourage(feedbackEl);
    feedbackEl.textContent = t('wrongMarked') + ' ' + t('wrongHint').replace('{k}', digitsToRight);
    renderBoard();
  }

  function correct() {
    progress.stars += 1;
    save();
    App.feedback.success(feedbackEl);
    feedbackEl.textContent += ' ' + t('correctFormat').replace('{n}', case_.correct);
    waitingCheck = false;
    renderBoard();
    hide(checkBtn);
    /* After a right answer the person can hear the number read aloud. */
    if (App.tts && App.tts.available) show(hearBtn);
    show(nextBtn);
    nextBtn.focus();
  }

  function speakCase() {
    if (case_ && case_.audio && App.tts) App.tts.speak(case_.audio);
  }

  /* ----------- Paint the task ----------- */
  function paint() {
    /* If fixedCase is set (reinforcement case), use it; otherwise keep the current case. */
    if (fixedCase) case_ = fixedCase;
    fixedCase = null;
    waitingCheck = true;
    attempts = 0;
    placed = null;
    wrongGap = null;
    $('#prompt').textContent = case_.prompt;
    $('#taskDetail').textContent = case_.detail;
    feedbackEl.textContent = '';
    renderBoard();
    renderTray();
    show(checkBtn);
    hide(nextBtn);
    hide(hearBtn);
    if (inReinforce) {
      paintReinforceProgress();
    } else {
      $('#progressFill').style.width = ((index / round.length) * 100) + '%';
      $('#progressText').textContent = t('roundProgress')
        .replace('{current}', index + 1)
        .replace('{total}', round.length);
    }
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
      return;
    }
    index += 1;
    if (index < round.length) {
      case_ = genDecimal();
      paint();
      return;
    }
    /* consume() fires the callback if there are misses. If not, close the round. */
    var consume = App.reinforce.consume();
    if (consume.length === 0) closeRound();
  }

  /* Closes the round and shows the final screen. */
  function closeRound() {
    $('#finishText').textContent = t('roundSummary')
      .replace('{count}', round.length)
      .replace('{stars}', progress.stars);
    $('#contexto').textContent = t('contexto');
    $('#explanation').textContent = t('explicacion');
    App.feedback.celebrate(t('roundComplete'));
    switchTo(finishScreen);
  }

  /* ----------- Start the round ----------- */
  function startRound() {
    /* One entry per number, going up one step at a time. Not shuffled on purpose. */
    round = DATA.steps.map(function (step) {
      return { enteras: step.enteras, decimales: step.decimales };
    });
    index = 0;
    inReinforce = false;
    fixedCase = null;
    reinforceList = [];
    reinforceIndex = 0;
    App.reinforce.banner.hide();
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    case_ = genDecimal();
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
    $('#progressFill').style.width = ((reinforceIndex / reinforceTotal) * 100) + '%';
    $('#progressText').textContent = t('roundProgress')
      .replace('{current}', reinforceIndex + 1)
      .replace('{total}', reinforceTotal);
  }

  /* ----------- Screen switching ----------- */
  var ALL_SCREENS = [menuScreen, taskScreen, finishScreen];

  function switchTo(screen) {
    ALL_SCREENS.forEach(function (s) { hide(s); });
    show(screen);
    paintStars();
    window.scrollTo(0, 0);
  }

  /* ----------- Wiring ----------- */
  $('#btnStart').addEventListener('click', startRound);
  checkBtn.addEventListener('click', check);
  nextBtn.addEventListener('click', goNext);
  hearBtn.addEventListener('click', speakCase);
  $('#backToMenu').addEventListener('click', function () { switchTo(menuScreen); });

  function init() {
    App.i18n.apply();
    paintStars();
    switchTo(menuScreen);
  }

  document.addEventListener('DOMContentLoaded', init);
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
