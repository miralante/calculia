/* ============================================================
   Calculia — The Wallet (reasoning: functional money handling).
   Data in data.js. Shared modules in assets/js/.
   Five activities from a menu (the "shop" pattern):
   - How much is there? · What do I pay with? · Is the change correct? ·
     The Piggy Bank: money quiz with cases GENERATED at runtime.
     They run on a generic quiz runner (buildQuiz below):
     ▶ TO ADD A NEW MONEY ACTIVITY: one configuration object in
       ACTIVITIES (generate, prompt, table, options, hint, explanation)
       + its card in index.html + its texts in strings.<locale>.js.
     Every activity respects rules 11 and 12: the explanation is
     generated from the resolved case; the first failure triggers a
     Socratic hint (no answer given).
   - Pay exactly: interactive (touch money up to the exact price),
     with Check in two steps and a 💡 greedy-strategy hint button.
   Amounts are stored in cents (integers) to avoid floating-point
   errors. Mistakes are never punished (rule 5).
   ============================================================ */
(function () {
  'use strict';

  var M = App.WalletModel;
  var localeData = M.localeData, show = M.show, format = M.format, spoken = M.spoken, ariaMoney = M.ariaMoney,
      createToken = M.createToken, paintTable = M.paintTable;
  var A = App.WalletActivities;
  var ACTIVITIES = A.ACTIVITIES;


  var TOOL_ID = 'wallet';
  var $ = App.utils.$;

  var starsEl = $('#stars');
  var dificultadEl = $('#difficulty');

  var progress = App.storage.progressWith(TOOL_ID, { stars: 0 });

  var glue = App.activityGlue({
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars;
  /* ============================================================
     Generic money quiz runner
     ============================================================ */
  var quizPromptEl = $('#quizPrompt');
  var quizOptionsEl = $('#quizOptions');
  var quizFeedbackEl = $('#quizFeedback');
  var quizExplanationWrap = $('#quizExplanationWrap');
  var quizExplanationEl = $('#quizExplanation');
  var btnNextQuiz = $('#btnNextQuiz');

  var currentActivity = 'count';
  var levelQ = null;
  var caseQ = null;
  var idxQ = 0;
  var correctQ = 0;
  var attemptsQ = 0;
  var solvedQ = false;
  var optionButtons = [];

  function currentConfig() { return ACTIVITIES[currentActivity]; }

  function showQuizText(text) {
    quizExplanationEl.textContent = text;
    quizExplanationWrap.classList.remove('hidden');
  }

  function paintQuizProgress() {
    var total = localeData().perRound;
    $('#progressQuizFill').style.width = (idxQ / total * 100) + '%';
    $('#progressQuizText').textContent = '';
  }

  function startQuizRound(level) {
    levelQ = level;
    idxQ = 0;
    correctQ = 0;
    show('screenQuizGame');
    renderQuiz();
  }

  function renderQuiz() {
    var cfg = currentConfig();
    caseQ = cfg.generate(levelQ);
    attemptsQ = 0;
    solvedQ = false;
    quizFeedbackEl.textContent = '';
    quizFeedbackEl.className = 'feedback';
    quizExplanationWrap.classList.add('hidden');
    quizExplanationEl.textContent = '';
    btnNextQuiz.classList.add('hidden');

    quizPromptEl.textContent = cfg.prompt(caseQ);
    /* Show the table: the person needs to see the money to count it.
       Earlier some rounds were audio-only (no table), but the
       activity no longer has audio. */
    paintTable(cfg.table ? cfg.table(caseQ) : null);

    quizOptionsEl.innerHTML = '';
    optionButtons = [];
    cfg.options(caseQ).forEach(function (op) {
      var btn;
      if (cfg.optionKind === 'token') {
        btn = createToken(op.cent, true);
        btn.setAttribute('aria-label', ariaMoney(op.cent));
      } else {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.textContent = op.text;
      }
      btn.addEventListener('click', function () { answerQuiz(btn, op); });
      quizOptionsEl.appendChild(btn);
      optionButtons.push({ btn: btn, op: op });
    });

    paintQuizProgress();
    paintStars();
  }

  function resolveQuiz(right) {
    var cfg = currentConfig();
    solvedQ = true;
    optionButtons.forEach(function (pair) {
      pair.btn.disabled = true;
      if (pair.op.correct) pair.btn.classList.add('correct');
    });
    showQuizText(cfg.explanation(caseQ, right));
    if (cfg.onResolve) cfg.onResolve(caseQ);
    btnNextQuiz.classList.remove('hidden');
    btnNextQuiz.focus();
  }

  function answerQuiz(btn, op) {
    if (solvedQ) return;
    if (op.correct) {
      if (attemptsQ === 0) {
        correctQ += 1;
        progress.stars += 1;
        save();
        paintStars();
      }
      App.feedback.success(quizFeedbackEl);
      resolveQuiz(true);
      return;
    }
    attemptsQ += 1;
    btn.classList.add('encourage');
    btn.disabled = true;
    App.feedback.encourage(quizFeedbackEl);
    if (attemptsQ === 1) {
      /* First failure: Socratic hint, without giving the answer (rule 12). */
      showQuizText(App.feedback.hintText(currentConfig().hint(caseQ), btn.textContent));
      App.feedback.lockUntilAck(optionButtons.map(function (p) { return p.btn; }), quizExplanationWrap);
    } else {
      /* Second failure: the correct answer is marked and explained
         (rule 11: no one is left without a resolution). */
      resolveQuiz(false);
    }
  }

  function nextQuiz() {
    idxQ += 1;
    if (idxQ >= localeData().perRound) endRound(correctQ);
    else renderQuiz();
  }

  /* ============================================================
     Menu and levels (shared)
     ============================================================ */
  /* Determina el nivel según el progress: cada ronda completada, sube un nivel. */
  function levelFromProgress() {
    var cfg = currentConfig();
    var rounds = progress.completedRounds || 0;
    var idxN = Math.min(rounds, cfg.levels().length - 1);
    return cfg.levels()[idxN];
  }

  function openActivity(id) {
    currentActivity = id;
    var cfg = currentConfig();
    if (cfg.isQuiz) startQuizRound(levelFromProgress());
    else startPayRound(levelFromProgress());
  }

  function endRound(correct) {
    var cfg = currentConfig();
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    save();
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t(cfg.summary)
        .replace('{n}', correct)
        .replace('{t}', localeData().perRound);
    }
    $('#contexto').textContent = '';
    $('#explanation').textContent = '';
    show('screenEnd');
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* ============================================================
     Activity — Pay exactly (interactive)
     ============================================================ */
  var productEl = $('#product');
  var priceTextEl = $('#priceText');
  var totalPlacedEl = $('#totalPlaced');
  var moneyEl = $('#money');
  var payFeedbackEl = $('#payFeedback');
  var payHintWrap = $('#payHintWrap');
  var payHintTextEl = $('#payHintText');
  var btnCheck = $('#btnCheck');
  var btnRemoveLast = $('#btnRemoveLast');
  var btnNextPay = $('#btnNextPay');

  var levelP = null;
  var roundProducts = [];
  var idxP = 0;
  var correctP = 0;
  var placedPieces = [];      /* cents of each piece placed, in order */
  var failuresP = 0;          /* failed checks of this product */
  var solvedP = false;
  var hintStepP = 0;
  var moneyButtons = {};      /* cent -> button, to mark the hint */

  function startPayRound(n) {
    levelP = n;
    roundProducts = App.utils.shuffle(n.products).slice(0, localeData().perRound);
    idxP = 0;
    correctP = 0;
    paintPayMoney();
    show('screenPayGame');
    renderPay();
  }

  /* Level's money buttons, from largest to smallest (teaches paying
     by starting with the largest). */
  function paintPayMoney() {
    moneyEl.innerHTML = '';
    moneyButtons = {};
    levelP.cents.slice().sort(function (a, b) { return b - a; }).forEach(function (cent) {
      var btn = createToken(cent, true);
      btn.setAttribute('aria-label', App.i18n.t('addMoney').replace('{d}', ariaMoney(cent)));
      btn.addEventListener('click', function () { addMoney(cent); });
      moneyEl.appendChild(btn);
      moneyButtons[cent] = btn;
    });
  }

  function placedTotal() {
    return placedPieces.reduce(function (sum, c) { return sum + c; }, 0);
  }

  function paintTotal() {
    totalPlacedEl.textContent = App.i18n.t('placed').replace('{total}', format(placedTotal()));
  }

  function paintPayProgress() {
    var total = localeData().perRound;
    $('#progressPayFill').style.width = (idxP / total * 100) + '%';
    $('#progressPayText').textContent = '';
  }

  function renderPay() {
    var item = roundProducts[idxP];
    solvedP = false;
    failuresP = 0;
    placedPieces = [];
    payFeedbackEl.textContent = '';
    payFeedbackEl.className = 'feedback';
    btnNextPay.classList.add('hidden');
    btnCheck.disabled = false;
    productEl.textContent = item.picto;
    priceTextEl.textContent = App.i18n.t('costs')
      .replace('{name}', item.name)
      .replace('{precio}', format(item.priceCent));
    clearPayHint();
    paintTotal();
    paintPayProgress();
    paintStars();
  }

  function addMoney(cent) {
    if (solvedP) return;
    placedPieces.push(cent);
    clearPayHint();
    paintTotal();
  }

  function removeLastPiece() {
    if (solvedP) return;
    placedPieces.pop();
    clearPayHint();
    paintTotal();
  }

  function clearAll() {
    if (solvedP) return;
    placedPieces = [];
    clearPayHint();
    paintTotal();
  }

  /* Check with scaffolding (rule 12 adapted): the first failure
     only gives the direction; from the second, the exact amount
     that is missing or extra — nobody gets stuck. */
  function check() {
    if (solvedP) return;
    var target = roundProducts[idxP].priceCent;
    var placed = placedTotal();

    if (placed === target) {
      solvedP = true;
      if (failuresP === 0) {
        correctP += 1;
        progress.stars += 1;
        save();
        paintStars();
      }
      App.feedback.success(payFeedbackEl);
      btnCheck.disabled = true;
      btnNextPay.classList.remove('hidden');
      btnNextPay.focus();
      return;
    }

    failuresP += 1;
    var missing = placed < target;
    var text;
    if (failuresP === 1) {
      text = App.i18n.t(missing ? 'missingMoney1' : 'tooMuchMoney1');
    } else {
      var diff = Math.abs(target - placed);
      text = App.i18n.t(missing ? 'missingMoney2' : 'tooMuchMoney2')
        .replace('{dif}', spoken(diff));
    }
    payFeedbackEl.textContent = text;
    payFeedbackEl.className = 'feedback encourage';
  }

  /* ---- 💡 On-demand hint (two-step Socratic method) ----
     Teaches the largest-to-smallest paying strategy: 1st tap
     asks for the largest amount that fits; the 2nd marks it. */
  function clearPayHint() {
    hintStepP = 0;
    payHintWrap.classList.add('hidden');
    payHintTextEl.textContent = '';
    Object.keys(moneyButtons).forEach(function (c) {
      moneyButtons[c].classList.remove('sugerida');
    });
    btnRemoveLast.classList.remove('sugerida');
    btnCheck.classList.remove('sugerida');
  }

  function requestPayHint() {
    if (solvedP) return;
    var target = roundProducts[idxP].priceCent;
    var remaining = target - placedTotal();
    hintStepP = hintStepP >= 2 ? 2 : hintStepP + 1;
    var text;

    if (remaining === 0) {
      text = App.i18n.t('checkHint');
      btnCheck.classList.add('sugerida');
    } else if (remaining < 0) {
      text = App.i18n.t('removeHint' + hintStepP);
      if (hintStepP === 2) btnRemoveLast.classList.add('sugerida');
    } else {
      text = App.i18n.t('payHint' + hintStepP);
      if (hintStepP === 2) {
        /* The largest money in the level that fits in what's left. */
        var best = levelP.cents.filter(function (c) { return c <= remaining; })
          .sort(function (a, b) { return b - a; })[0];
        if (best) moneyButtons[best].classList.add('sugerida');
      }
    }
    payHintTextEl.textContent = text;
    payHintWrap.classList.remove('hidden');
  }

  function nextPay() {
    idxP += 1;
    if (idxP >= localeData().perRound) endRound(correctP);
    else renderPay();
  }

  /* ---- Events ---- */
  App.utils.$$('#screenMenu .btn-actividad').forEach(function (btn) {
    btn.addEventListener('click', function () { openActivity(btn.getAttribute('data-activity')); });
  });
  var elBtnBackToMenuLevels = $('#btnBackToMenuLevels');
  if (elBtnBackToMenuLevels) elBtnBackToMenuLevels.addEventListener('click', function () { show('screenMenu'); });

  btnNextQuiz.addEventListener('click', nextQuiz);
  btnCheck.addEventListener('click', check);
  btnRemoveLast.addEventListener('click', removeLastPiece);
  $('#btnClear').addEventListener('click', clearAll);
  btnNextPay.addEventListener('click', nextPay);
  $('#btnPayHint').addEventListener('click', requestPayHint);

  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  App.utils.bindEndBackToStart();

})();
