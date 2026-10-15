/* ============================================================
   Calculia — Cantidades.

   Three practices share this file:

     - read   : the number is shown in digits, coloured by group, and
                the user writes it in words.
     - write  : the number is spoken (🔊) and the user writes it in
                words. Read and write go from 4 digits up to 9.
     - points : a game. The number is shown with no separator; the
                user drags the points from the right into the gaps
                between the digits (dots in Spanish, commas in
                English). The numbers start at 4 digits and go up
                one digit at a time, with one point more every three.

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

  /* ----------- Colour by group -----------
     One colour per group of three digits. The groups are the ones the
     separator (dot in Spanish, comma in English) makes: units,
     thousands, millions... Every digit of a group shares its colour
     and the next group changes it, so the colour says which group a
     digit belongs to. Classes: dot-group-0..3 in styles.css. */
  var GROUP_CLASS = ['dot-group-0', 'dot-group-1', 'dot-group-2', 'dot-group-3'];

  function coloredDigits(n) {
    var s = String(Math.abs(n));
    var sep = separator();
    var htmlOut = '';
    for (var i = 0; i < s.length; i++) {
      var fromRight = s.length - 1 - i;
      /* The separator goes in front of the first digit of each new group. */
      if (i > 0 && fromRight % 3 === 2) htmlOut += '<span class="digit-sep">' + sep + '</span>';
      var group = Math.floor(fromRight / 3);
      htmlOut += '<span class="' + GROUP_CLASS[group % GROUP_CLASS.length] + '">' + s.charAt(i) + '</span>';
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
      if (uES === 0) txtES = 'veinte';
      else if (uES === 1) txtES += 'uno';
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

  /* Apocope (es): a number that ends in "uno" loses the "o" before a
     masculine noun (mil, millón, millones): "veintiún mil", "treinta y
     un millones". The written form is what the person must type, so
     it follows the spelling rules, not the spoken shortcut. */
  function apocopeES(txt) {
    if (/veintiuno$/.test(txt)) return txt.replace(/veintiuno$/, 'veintiún');
    return txt.replace(/\buno$/, 'un');
  }

  /* Words are compared without case, spaces, hyphens, commas or dots:
     "Veinte-y-dos" and "veinte y dos" are the same answer. Accents are
     NOT ignored: they are part of the spelling being practised. */
  function normaliseWords(s) {
    return s.toLowerCase().replace(/[-,.]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function readGroup(n, locale, singular, plural) {
    if (n === 1) return locale === 'en' ? 'one ' + singular : 'un ' + singular;
    var num = locale === 'en' ? threeDigits(n, 'en') : apocopeES(threeDigits(n, 'es'));
    return num + ' ' + plural;
  }

  function readNumber(n, locale) {
    if (n === 0) return locale === 'en' ? 'zero' : 'cero';
    var negative = n < 0;
    var abs = Math.abs(n);
    if (abs >= 1000000000) {
      /* Billions: "X mil millones" in Spanish, "X billion" in English.
         What is left under a billion is read by the rules below. */
      var bn = Math.floor(abs / 1000000000);
      var restBn = abs % 1000000000;
      var headBn = locale === 'en'
        ? (bn === 1 ? 'one' : threeDigits(bn, 'en')) + ' billion'
        : (bn === 1 ? '' : threeDigits(bn, 'es') + ' ') + 'mil millones';
      var outBn = restBn ? headBn + ' ' + readNumber(restBn, locale) : headBn;
      return negative ? (locale === 'en' ? 'negative ' : 'menos ') + outBn : outBn;
    }
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
        restFullES += (thousandsES === 1 ? 'mil' : apocopeES(threeDigits(thousandsES, 'es')) + ' mil');
      }
      if (unitsES) {
        if (thousandsES) restFullES += ' ';
        restFullES += threeDigits(unitsES, 'es');
      }
      if (restFullES) partsES.push(restFullES);
    } else if (thousandsES) {
      partsES.push(thousandsES === 1 ? 'mil' : apocopeES(threeDigits(thousandsES, 'es')) + ' mil');
      if (unitsES) partsES.push(threeDigits(unitsES, 'es'));
    } else {
      partsES.push(threeDigits(unitsES, 'es'));
    }
    var outES = partsES.join(' ');
    return negative ? 'menos ' + outES : outES;
  }

  /* ----------- Generators ----------- */

  /* Read and write share one generator. The digit count comes from the
     round (see DATA.writeDigits): thousands first, up to 9 digits. The
     answer is always the number spelled out in words.
       read : the number is shown in digits, coloured by group.
       write: the number is only spoken (🔊); nothing is shown. */
  function genWords() {
    var digits = round[index].digits;
    var n = randomInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
    var words = readNumber(n, App.i18n.locale());
    var reading = practice === 'read';
    return {
      n: n,
      tipo: 'typing',
      show: reading ? format(n) : '',
      correct: words,
      prompt: t(reading ? 'promptRead' : 'promptWrite'),
      detail: t(reading ? 'detailRead' : 'detailWrite'),
      audio: words
    };
  }

  /* ----------- The points game -----------
     Each round entry gives the digit count of its number (see
     DATA.pointsDigits), so the points go up one at a time: first
     one point, then two, then three. The digits are random. */

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
    var digits = round[index].digits;
    var n = randomInt(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
    var gaps = correctGaps(n);
    return {
      n: n,
      tipo: 'points',
      gaps: gaps,
      correct: format(n),
      prompt: gaps.length === 1 ? t('promptPointsOne') : t('promptPoints').replace('{count}', gaps.length),
      detail: t('detailPoints'),
      audio: readNumber(n, App.i18n.locale())
    };
  }

  var GENERATORS = {
    read: genWords,
    write: genWords,
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
    btn.addEventListener('click', function () { if (!justDragged) toggleGap(i); });
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
  }

  /* ----------- Dragging the points -----------
     A point can be dragged from the tray to an empty gap, or moved
     from one gap to another. Dropped anywhere else, it goes back to
     the tray. Pointer events cover mouse, touch and pen. A plain tap
     still works (see toggleGap): a drag starts only after a few
     pixels of movement. */
  var DRAG_START_PX = 6;
  var drag = null;          /* { from, ghost, moved, startX, startY } */
  var justDragged = false;  /* swallows the click that follows a drop */

  function startDrag(e, from) {
    if (!waitingCheck || e.button !== 0) return;
    drag = { from: from, ghost: null, moved: false, startX: e.clientX, startY: e.clientY };
    document.addEventListener('pointermove', moveDrag);
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', cancelDrag);
  }

  /* Any part of a placed gap picks its point up, not only the dot. */
  function onBoardPointerDown(e) {
    var gap = e.target.closest ? e.target.closest('.pt-gap.is-placed') : null;
    if (gap) startDrag(e, Number(gap.getAttribute('data-gap')));
  }

  /* The gap element under the pointer, placed or not, or null. */
  function gapAt(x, y) {
    var el = document.elementFromPoint(x, y);
    return el && el.closest ? el.closest('#pointsBoard .pt-gap') : null;
  }

  function onTrayPointerDown(e) {
    var chip = e.target.closest ? e.target.closest('.tray-chip') : null;
    if (chip) startDrag(e, null);
  }

  /* The gap under the pointer, or null. An empty gap is a target; so
     is the gap the point was lifted from (dropping it back is a no-op). */
  function gapUnder(x, y) {
    var el = document.elementFromPoint(x, y);
    var gap = el && el.closest ? el.closest('#pointsBoard .pt-gap') : null;
    if (!gap) return null;
    var g = Number(gap.getAttribute('data-gap'));
    if (placed.indexOf(g) === -1 || g === drag.from) return g;
    return null;
  }

  function moveDrag(e) {
    if (!drag) return;
    if (!drag.moved) {
      if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) < DRAG_START_PX) return;
      drag.moved = true;
      drag.ghost = document.createElement('span');
      drag.ghost.className = 'pt-ghost';
      drag.ghost.setAttribute('aria-hidden', 'true');
      drag.ghost.textContent = separator();
      document.body.appendChild(drag.ghost);
    }
    drag.ghost.style.left = e.clientX + 'px';
    drag.ghost.style.top = e.clientY + 'px';
    var over = gapUnder(e.clientX, e.clientY);
    var gaps = document.querySelectorAll('#pointsBoard .pt-gap');
    for (var k = 0; k < gaps.length; k++) {
      gaps[k].classList.toggle('is-target', Number(gaps[k].getAttribute('data-gap')) === over && over !== drag.from);
    }
  }

  function endDrag(e) {
    var d = drag;
    /* Read the target before stopDrag clears the drag state. */
    var g = null;
    if (d && d.moved) {
      g = gapUnder(e.clientX, e.clientY);
      /* A point dropped on a gap that already holds one goes back to
         where it was, instead of leaving the board. */
      if (g === null && d.from !== null && gapAt(e.clientX, e.clientY)) g = d.from;
    }
    stopDrag();
    if (!d || !d.moved) return;   /* a tap: the click does the work */
    justDragged = true;
    setTimeout(function () { justDragged = false; }, 300);
    if (g !== null && d.ghost) {
      /* Glide the point into its gap, then settle it there. */
      glideTo(d.ghost, gapCenter(g), function () { settleDrop(d, g); });
    } else {
      if (d.ghost) d.ghost.remove();
      settleDrop(d, null);
    }
  }

  function settleDrop(d, g) {
    if (g !== null) {
      if (d.from === null) {
        placed.push(g);
      } else if (g !== d.from) {
        placed.splice(placed.indexOf(d.from), 1);
        placed.push(g);
      }
    } else if (d.from !== null) {
      /* Dropped outside any gap: the point goes back to the tray. */
      placed.splice(placed.indexOf(d.from), 1);
    }
    refreshWrong(g);
    renderPointsBoard(g !== null ? g : undefined);
    renderPointsTray();
  }

  /* Marks every placed point that is not in a right gap, and says so
     when the point just placed (lastGap) is one of them. */
  function refreshWrong(lastGap) {
    wrongGaps = placed.filter(function (p) { return case_.gaps.indexOf(p) === -1; });
    var wrongNow = lastGap !== null && wrongGaps.indexOf(lastGap) !== -1;
    /* Socratic hint: how many digits are to the right of the gap, and
       where the right gaps are. It does not name the gap itself. */
    var digitsToRight = String(case_.n).length - 1 - lastGap;
    $('#feedback').textContent = wrongNow
      ? t('pointsWrongPlace') + ' ' + t('pointsWrongHint').replace('{k}', digitsToRight)
      : '';
  }

  function gapCenter(g) {
    var r = document.querySelector('#pointsBoard [data-gap="' + g + '"]').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  /* Moves an element to a point on screen, then runs done(). */
  function glideTo(el, to, done) {
    el.style.transition = 'left 0.18s ease-out, top 0.18s ease-out';
    el.style.left = to.x + 'px';
    el.style.top = to.y + 'px';
    setTimeout(function () { el.remove(); done(); }, 190);
  }

  /* A point placed with a tap comes flying from the tray (rect), so it
     reads as moving from right to left into its gap. */
  function flyIn(g, from) {
    var pt = document.querySelector('#pointsBoard [data-gap="' + g + '"] .pt-point');
    if (!pt) return;
    var to = pt.getBoundingClientRect();
    pt.style.transition = 'none';
    pt.style.transform = 'translate(' + (from.left - to.left) + 'px, ' + (from.top - to.top) + 'px)';
    void pt.offsetWidth;
    pt.style.transition = 'transform 0.25s ease-out';
    pt.style.transform = '';
  }

  function cancelDrag() {
    if (drag && drag.ghost) drag.ghost.remove();
    stopDrag();
  }

  function stopDrag() {
    document.removeEventListener('pointermove', moveDrag);
    document.removeEventListener('pointerup', endDrag);
    document.removeEventListener('pointercancel', cancelDrag);
    drag = null;
    var marked = document.querySelectorAll('#pointsBoard .is-target');
    for (var k = 0; k < marked.length; k++) marked[k].classList.remove('is-target');
  }

  /* Tap an empty gap to put a point from the tray; tap a placed point
     to take it back. */
  function toggleGap(i) {
    if (!waitingCheck) return;
    var at = placed.indexOf(i);
    var fromRect = null;
    if (at !== -1) {
      placed.splice(at, 1);
    } else if (placed.length < case_.gaps.length) {
      /* Where the point leaves the tray from, before the tray is redrawn. */
      var chips = document.querySelectorAll('#pointsTray .tray-chip');
      if (chips.length) fromRect = chips[chips.length - 1].getBoundingClientRect();
      placed.push(i);
    } else {
      $('#feedback').textContent = t('pointsNoneLeft');
      return;
    }
    refreshWrong(at === -1 ? i : null);
    renderPointsBoard(i);
    renderPointsTray();
    if (fromRect) flyIn(i, fromRect);
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
    hide($('#hearNumber'));
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
      /* Read: the number is shown in digits, coloured by group. */
      $('#numberShown').innerHTML = coloredDigits(case_.n);
      show($('#numberShown'));
    } else if (practice === 'write') {
      /* Write: nothing is shown; the person listens with 🔊. */
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
    /* Read and write both ask for the number in words. */
    if (normaliseWords(raw) === normaliseWords(case_.correct)) {
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
    /* Challenge met: the number is shown with each group of three in its
       own colour, so it is easier to see its groups. */
    if (practice === 'points') $('#pointsBoard').innerHTML = coloredDigits(case_.n);
    hide($('#checkAnswer'));
    /* After a right answer the person can hear the number read aloud. */
    if (App.tts && App.tts.available) show($('#hearNumber'));
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
      /* One entry per number, from 4 digits up to 12. Not shuffled on
         purpose: the numbers get bigger as the round goes on. */
      round = DATA.pointsDigits.map(function (digits) { return { digits: digits }; });
    } else {
      /* Read and write: one entry per number, from 4 digits (thousands)
         up to 9. Not shuffled on purpose: the numbers get bigger as the
         round goes on, like the points game. */
      round = DATA.wordDigits.map(function (digits) { return { digits: digits }; });
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
  /* The answer box is a textarea (it wraps like a word processor), so
     Enter checks the answer and Shift+Enter starts a new line. */
  $('#answerInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      check();
    }
  });
  $('#nextTask').addEventListener('click', goNext);
  $('#pointsBoard').addEventListener('pointerdown', onBoardPointerDown);
  $('#pointsTray').addEventListener('pointerdown', onTrayPointerDown);
  /* Audio: reads the current number aloud. Used by the write practice
     (listen before writing) and by the button shown after a right answer. */
  function speakCase() {
    if (case_ && case_.audio && App.tts) App.tts.speak(case_.audio);
  }
  var elListenBtn = $('#listenBtn');
  if (elListenBtn) elListenBtn.addEventListener('click', speakCase);
  $('#hearNumber').addEventListener('click', speakCase);
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
