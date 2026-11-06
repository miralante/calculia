/* ============================================================
   Calculia — Cambia de unidad
   Data in data.js. Shared modules in assets/js/.
   Screens: explanation → test sheet. The whole round is on one
   screen, as in Máximo común divisor.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'time-convert';
  var $ = App.utils.$;

  var screenIntro = $('#screenIntro');
  var screenGame = $('#screenGame');
  var testSheetEl = $('#testSheet');
  var btnCheck = $('#btnCheck');
  var btnNewRound = $('#btnNewRound');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  /* Right answers of the round, counted at the first check. */
  var roundCorrect = 0;

  var glue = App.activityGlue({
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars;

  /* Checked at start-up, so bad data fails loudly: each conversion has a
     factor above 1 and at least two amounts to ask about. */
  DATA.conversions.forEach(function (conv) {
    if (!(conv.factor > 1) || conv.ns.length < 2) {
      throw new Error('time-convert: bad conversion ' + conv.id);
    }
  });

  function show(screen) {
    [screenIntro, screenGame].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Test sheet ----
     The whole round is on one screen. Every question is generated when the
     round starts, and the options inside each one are shuffled too. "Comprobar"
     checks them all at once; "Otra ronda" deals a new round. */

  /* The wrong answers are the slips people make: the amount left as it is,
     the answer one step too high or too low, and the answer times ten. */
  function question(conv) {
    var n = App.utils.shuffle(conv.ns)[0];
    var answer = n * conv.factor;
    var pool = [n, answer + conv.factor, answer - conv.factor, answer * 10]
      .filter(function (v) { return v > 0 && v !== answer; })
      .filter(function (v, i, all) { return all.indexOf(v) === i; });
    var wrong = App.utils.shuffle(pool).slice(0, 2);

    return {
      prompt: App.i18n.t('q.' + conv.id).replace('{n}', n),
      hint: App.i18n.t('gen.hint'),
      options: App.utils.shuffle([answer].concat(wrong).map(function (v) {
        return {
          html: '<span class="answer-num">' + v + '</span>',
          aria: String(v),
          correct: v === answer
        };
      })),
      inline: true
    };
  }

  function startRound() {
    App.utils.drawRoundReset();
    var questions = [];
    for (var i = 0; i < DATA.perRound; i += 1) {
      questions.push(question(App.utils.drawRound(TOOL_ID, DATA.conversions)));
    }
    sheetTest.set(App.utils.shuffle(questions));
    roundCorrect = 0;
    show(screenGame);
    sheetTest.render();
  }

  /* The test sheet: the whole round on one screen, checked at once. */
  var sheetTest = App.sheetTest.create({
    sheetEl: testSheetEl,
    checkBtn: btnCheck,
    newRoundBtn: btnNewRound,
    progressFill: progressFill,
    progressText: progressText,
    onScored: function (rightFirstTry) {
      roundCorrect = rightFirstTry;
      progress.stars += roundCorrect;
      save();
      paintStars();
    }
  });

  /* ---- Explanation carousel ----
     One card per step: a picto, the name and one sentence. Clicking the
     card (or pressing Enter) moves forward. */
  function paintExplain(step) {
    var el = $('#carouselDisplay');
    el.textContent = '';
    var picto = document.createElement('span');
    picto.className = 'carousel-figure';
    picto.setAttribute('aria-hidden', 'true');
    picto.textContent = step.picto;
    var name = document.createElement('span');
    name.className = 'carousel-name';
    name.textContent = App.i18n.t('explain.' + step.id + '.name');
    var text = document.createElement('p');
    text.className = 'gallery-note';
    text.textContent = App.i18n.t('explain.' + step.id + '.text');
    el.appendChild(picto);
    el.appendChild(name);
    el.appendChild(text);
  }

  var explIdx = 0;
  function explStep(delta) {
    explIdx = (explIdx + delta + DATA.explain.length) % DATA.explain.length;
    paintExplain(DATA.explain[explIdx]);
  }

  /* ---- Events ---- */

  $('#carouselPrev').addEventListener('click', function () { explStep(-1); });
  $('#carouselNext').addEventListener('click', function () { explStep(1); });
  var carouselDisplay = $('#carouselDisplay');
  carouselDisplay.addEventListener('click', function () { explStep(1); });
  carouselDisplay.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      explStep(1);
    }
  });

  paintExplain(DATA.explain[explIdx]);
  $('#introContinue').addEventListener('click', startRound);
  $('#btnCheck').addEventListener('click', sheetTest.check);
  $('#btnNewRound').addEventListener('click', startRound);

  paintStars();
})();
