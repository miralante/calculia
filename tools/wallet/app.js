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

  var TOOL_ID = 'wallet';
  var $ = App.utils.$;

  var starsEl = $('#stars');

  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }
  function localeData() { return DATA[App.i18n.locale()] || DATA.es; }
  function pickRandom(list) { return list[Math.floor(Math.random() * list.length)]; }

  /* ---- Screens ---- */
  var SCREENS = ['screenMenu', 'screenLevels', 'screenQuizGame',
    'screenPayGame', 'screenEnd'];
  function show(id) {
    SCREENS.forEach(function (p) { $('#' + p).classList.add('oculto'); });
    $('#' + id).classList.remove('oculto');
  }

  /* ============================================================
     Money: shared module App.dinero (assets/js/dinero.js)
     ============================================================ */
  var format = App.dinero.format;
  var spoken = App.dinero.spoken;
  var ariaMoney = App.dinero.aria;
  var createToken = App.dinero.createToken;
  var breakdown = App.dinero.breakdown;
  var breakdownText = App.dinero.breakdownText;

  /* Paints decorative tokens on the table (hidden if empty). */
  function paintTable(pieces) {
    var tableEl = $('#moneyTable');
    App.dinero.paintTokens(tableEl, pieces);
    tableEl.classList.toggle('oculto', !pieces || !pieces.length);
  }

  /* ============================================================
     Case generators (infinite variety, zero authoring)
     ============================================================ */

  /* All products from the bank, in the active locale. */
  function allProducts() {
    return localeData().pay.levels.reduce(function (list, n) {
      return list.concat(n.products);
    }, []);
  }

  /* Is the amount in the step's "bucket"? (a level's amounts
     don't fall into the previous level, like in Pay exactly). */
  function inBucket(cent, step) {
    if (step === 100) return cent % 100 === 0;
    if (step === 50) return cent % 50 === 0 && cent % 100 !== 0;
    return cent % 10 === 0 && cent % 50 !== 0;
  }

  /* Amounts in the bucket strictly between min and max. */
  function gapAmounts(min, max, step) {
    var list = [];
    for (var v = step; v < max; v += step) {
      if (v > min && inBucket(v, step)) list.push(v);
    }
    return list;
  }

  /* Pair (price, paid): paid is the only amount that's enough and
     the change is never zero. Shared by payWith and change. */
  function generatePair(step) {
    var pairs = [[200, 100], [500, 200], [1000, 500]];   /* [paid, lower] */
    var candidates = [];
    pairs.forEach(function (pair) {
      var prices = gapAmounts(pair[1], pair[0], step);
      if (prices.length) candidates.push({ paid: pair[0], lower: pair[1], prices: prices });
    });
    var c = pickRandom(candidates);
    return { paid: c.paid, lower: c.lower, price: pickRandom(c.prices) };
  }

  /* Amount distractors: close, distinct, positive. */
  function amountDistractors(correct, step) {
    var list = [];
    App.utils.shuffle([step, 100, step * 2]).forEach(function (d) {
      [correct + d, correct - d].forEach(function (x) {
        if (x > 0 && x !== correct && list.indexOf(x) === -1 && list.length < 2) list.push(x);
      });
    });
    while (list.length < 2) list.push(correct + (list.length + 1) * step);
    return list;
  }

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
    quizExplanationWrap.classList.remove('oculto');
  }

  function paintQuizProgress() {
    var total = localeData().perRound;
    $('#progressQuizFill').style.width = (idxQ / total * 100) + '%';
    $('#progressQuizText').textContent = idxQ + ' / ' + total;
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
    quizExplanationWrap.classList.add('oculto');
    quizExplanationEl.textContent = '';
    btnNextQuiz.classList.add('oculto');

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
        btn.className = 'btn-opcion';
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
      if (pair.op.correct) pair.btn.classList.add('correcta');
    });
    showQuizText(cfg.explanation(caseQ, right));
    if (cfg.onResolve) cfg.onResolve(caseQ);
    btnNextQuiz.classList.remove('oculto');
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
    btn.classList.add('animo');
    btn.disabled = true;
    App.feedback.encourage(quizFeedbackEl);
    if (attemptsQ === 1) {
      /* First failure: Socratic hint, without giving the answer (rule 12). */
      showQuizText(currentConfig().hint(caseQ));
      App.feedback.lockUntilAck(optionButtons.map(function (p) { return p.btn; }), quizExplanationWrap);
    } else {
      /* Second failure: the correct answer is marked and explained
         (rule 11: no one is left without a resolution). */
      resolveQuiz(false);
    }
  }

  function nextQuiz() {
    idxQ += 1;
    App.tts.stop();
    if (idxQ >= localeData().perRound) endRound(correctQ);
    else renderQuiz();
  }

  /* ============================================================
     Activity configuration (▶ add new ones here)
     ============================================================ */
  var ACTIVITIES = {

    /* --- How much is there? — count the money on the table ---
       Half the rounds are visual (table shown); the other half are
       audio-only (no table, the breakdown is read aloud). On the
       first failure of an audio round, the table is shown as a
       hint so the user is never left without a way to count. */
    count: {
      isQuiz: true,
      instruction: 'instructionCount',
      summary: 'countSummary',
      levels: function () { return localeData().count.levels; },
      generate: function (level) {
        var n = 2 + Math.floor(Math.random() * 3);
        var pieces = [];
        var total = 0;
        for (var k = 0; k < n; k++) {
          var v = pickRandom(level.cents);
          pieces.push(v);
          total += v;
        }
        pieces.sort(function (a, b) { return b - a; });
        var distractors = [];
        App.utils.shuffle(level.cents).forEach(function (d) {
          [total + d, total - d].forEach(function (x) {
            if (x > 0 && x !== total && distractors.indexOf(x) === -1 && distractors.length < 2) {
              distractors.push(x);
            }
          });
        });
        while (distractors.length < 2) {
          distractors.push(total + (distractors.length + 1) * level.cents[0]);
        }
        return {
          pieces: pieces,
          total: total,
          amounts: App.utils.shuffle([total].concat(distractors)),
          noTable: false
        };
      },
      prompt: function () { return App.i18n.t('countPrompt'); },
      table: function (c) { return c.pieces; },
      options: function (c) {
        return c.amounts.map(function (cent) {
          return { text: format(cent), correct: cent === c.total };
        });
      },
      hint: function () { return App.i18n.t('countHint'); },
      explanation: function (c, right) {
        return App.i18n.t(right ? 'correctExplanation' : 'almostExplanation')
          .replace('{d}', breakdownText(c.pieces))
          .replace('{total}', format(c.total));
      }
    },

    /* --- What do I pay with? — choose the money that's enough --- */
    payWith: {
      isQuiz: true,
      optionKind: 'token',
      instruction: 'instructionPayWith',
      summary: 'payWithSummary',
      levels: function () { return localeData().amount.levels; },
      generate: function (level) {
        var pair = generatePair(level.step);
        var product = pickRandom(allProducts());
        var lowers = [500, 200, 100, 50].filter(function (c) { return c < pair.lower; });
        var options = App.utils.shuffle([
          { cent: pair.paid, correct: true },
          { cent: pair.lower, correct: false },
          { cent: pickRandom(lowers), correct: false }
        ]);
        return {
          picto: product.picto,
          name: product.name,
          price: pair.price,
          paid: pair.paid,
          change: pair.paid - pair.price,
          list: options
        };
      },
      prompt: function (c) {
        return c.picto + ' ' + App.i18n.t('payWithPrompt')
          .replace('{nombre}', c.name)
          .replace('{precio}', format(c.price));
      },
      table: function () { return null; },
      options: function (c) { return c.list; },
      hint: function () { return App.i18n.t('payWithHint'); },
      explanation: function (c, right) {
        return App.i18n.t(right ? 'payCorrectExplanation' : 'payAlmostExplanation')
          .replace('{pagado}', spoken(c.paid))
          .replace('{cambio}', format(c.change));
      },
      /* When resolved, the change appears as tokens on the table:
         connects paying with the physical change. */
      onResolve: function (c) { paintTable(breakdown(c.change)); }
    },

    /* --- Is the change correct? — verify what's given back --- */
    change: {
      isQuiz: true,
      instruction: 'instructionCheckChange',
      summary: 'changeSummary',
      levels: function () { return localeData().amount.levels; },
      generate: function (level) {
        var pair = generatePair(level.step);
        var right = pair.paid - pair.price;
        var isRight = Math.random() < 0.5;
        var shown = right;
        if (!isRight) {
          var deltas = App.utils.shuffle([level.step, -level.step, 100, -100]);
          for (var k = 0; k < deltas.length; k++) {
            var m = right + deltas[k];
            if (m > 0 && m !== right) { shown = m; break; }
          }
        }
        return { price: pair.price, paid: pair.paid, right: right, shown: shown, isRight: shown === right };
      },
      prompt: function (c) {
        return App.i18n.t('changePrompt')
          .replace('{precio}', format(c.price))
          .replace('{pagado}', spoken(c.paid));
      },
      table: function (c) { return breakdown(c.shown); },
      /* Yes/No in fixed (natural) order, not shuffled. */
      options: function (c) {
        return [
          { text: App.i18n.t('answerYes'), correct: c.isRight },
          { text: App.i18n.t('answerNo'), correct: !c.isRight }
        ];
      },
      hint: function () { return App.i18n.t('changeHint'); },
      explanation: function (c) {
        var key = c.isRight ? 'changeCorrectExplanation' :
          (c.shown < c.right ? 'changeShortExplanation' : 'changeOverExplanation');
        return App.i18n.t(key)
          .replace('{bueno}', format(c.right))
          .replace('{mostrado}', format(c.shown));
      }
    },

    /* --- The Piggy Bank — how much is left to buy it? --- */
    piggyBank: {
      isQuiz: true,
      instruction: 'instructionPiggyBank',
      summary: 'piggyBankSummary',
      levels: function () { return localeData().amount.levels; },
      generate: function (level) {
        /* Targets: the PRODUCTS bank for the level's bucket. */
        var bank = localeData().pay.levels.filter(function (n) { return n.id === level.id; })[0];
        var candidates = bank.products.filter(function (p) { return p.priceCent >= 2 * level.step; });
        var product = pickRandom(candidates);
        var steps = product.priceCent / level.step;
        var have = level.step * (1 + Math.floor(Math.random() * (steps - 1)));
        var missing = product.priceCent - have;
        var options = App.utils.shuffle([missing].concat(amountDistractors(missing, level.step)));
        return {
          picto: product.picto,
          name: product.name,
          price: product.priceCent,
          have: have,
          missing: missing,
          amounts: options
        };
      },
      prompt: function (c) {
        var name = c.name.charAt(0).toLowerCase() + c.name.slice(1);
        return c.picto + ' ' + App.i18n.t('piggyBankPrompt')
          .replace('{nombre}', name)
          .replace('{precio}', format(c.price));
      },
      table: function (c) { return breakdown(c.have); },
      options: function (c) {
        return c.amounts.map(function (cent) {
          return { text: format(cent), correct: cent === c.missing };
        });
      },
      hint: function () { return App.i18n.t('piggyBankHint'); },
      explanation: function (c, right) {
        return App.i18n.t(right ? 'piggyBankCorrectExplanation' : 'piggyBankAlmostExplanation')
          .replace('{precio}', format(c.price))
          .replace('{tienes}', format(c.have))
          .replace('{falta}', format(c.missing));
      }
    },

    /* --- More or less — mental rounding ("costs about 3 €") --- */
    rounding: {
      isQuiz: true,
      instruction: 'instructionRounding',
      summary: 'roundingSummary',
      levels: function () { return localeData().rounding.levels; },
      generate: function (level) {
        var target = 2 + Math.floor(Math.random() * 8);   /* 2-9 € */
        var delta = pickRandom(level.deltas);
        /* The ,50 always below the target: x,50 rounds UP to x+1. */
        var sign = delta === 50 ? -1 : pickRandom([-1, 1]);
        var shown = target * 100 + sign * delta;
        /* Flavoured product with a nearby reference price. */
        var close = allProducts().filter(function (p) {
          return Math.abs(p.priceCent - shown) <= 150;
        });
        var product = pickRandom(close.length ? close : allProducts());
        return {
          picto: product.picto,
          name: product.name,
          shown: shown,
          target: target,
          isHalf: delta === 50,
          candidates: [target - 1, target, target + 1]
        };
      },
      prompt: function (c) {
        return c.picto + ' ' + App.i18n.t('roundingPrompt')
          .replace('{nombre}', c.name)
          .replace('{precio}', format(c.shown));
      },
      table: function () { return null; },
      /* Three consecutive euros, in order (no shuffle: this is a
         number line, not a distraction quiz). */
      options: function (c) {
        return c.candidates.map(function (n) {
          return { text: App.i18n.t('aboutEuros').replace('{n}', n), correct: n === c.target };
        });
      },
      hint: function () { return App.i18n.t('roundingHint'); },
      explanation: function (c, right) {
        var key = c.isHalf ?
          (right ? 'roundingHalfCorrectExplanation' : 'roundingHalfAlmostExplanation') :
          (right ? 'roundingCorrectExplanation' : 'roundingAlmostExplanation');
        return App.i18n.t(key)
          .replace('{precio}', format(c.shown))
          .replace(/\{n\}/g, c.target);
      }
    },

    /* --- Pay exactly — interactive, outside the runner --- */
    pay: {
      isQuiz: false,
      instruction: 'payInstruction',
      summary: 'paySummary',
      levels: function () { return localeData().pay.levels; }
    }
  };

  /* ============================================================
     Menu and levels (shared)
     ============================================================ */
  function openActivity(id) {
    currentActivity = id;
    var cfg = currentConfig();
    $('#activityInstruction').textContent = App.i18n.t(cfg.instruction);
    paintLevels();
    show('screenLevels');
  }

  function paintLevels() {
    var cfg = currentConfig();
    var cont = $('#levels');
    cont.innerHTML = '';
    cfg.levels().forEach(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-nivel';
      btn.innerHTML = n.description;
      btn.addEventListener('click', function () {
        if (cfg.isQuiz) startQuizRound(n);
        else startPayRound(n);
      });
      cont.appendChild(btn);
    });
  }

  function endRound(correct) {
    var cfg = currentConfig();
    save();
    $('#endSummary').textContent = App.i18n.t(cfg.summary)
      .replace('{n}', correct)
      .replace('{t}', localeData().perRound);
    $('#transfer').textContent = App.i18n.t('transfer');
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
    $('#progressPayText').textContent = idxP + ' / ' + total;
  }

  function renderPay() {
    var item = roundProducts[idxP];
    solvedP = false;
    failuresP = 0;
    placedPieces = [];
    payFeedbackEl.textContent = '';
    payFeedbackEl.className = 'feedback';
    btnNextPay.classList.add('oculto');
    btnCheck.disabled = false;
    productEl.textContent = item.picto;
    priceTextEl.textContent = App.i18n.t('costs')
      .replace('{nombre}', item.name)
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
      btnNextPay.classList.remove('oculto');
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
    payFeedbackEl.className = 'feedback animo';
  }

  /* ---- 💡 On-demand hint (two-step Socratic method) ----
     Teaches the largest-to-smallest paying strategy: 1st tap
     asks for the largest amount that fits; the 2nd marks it. */
  function clearPayHint() {
    hintStepP = 0;
    payHintWrap.classList.add('oculto');
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
    payHintWrap.classList.remove('oculto');
  }

  function nextPay() {
    idxP += 1;
    App.tts.stop();
    if (idxP >= localeData().perRound) endRound(correctP);
    else renderPay();
  }

  /* ---- Events ---- */
  App.utils.$$('.activity-card').forEach(function (btn) {
    btn.addEventListener('click', function () { openActivity(btn.getAttribute('data-activity')); });
  });
  $('#btnBackToMenuLevels').addEventListener('click', function () { show('screenMenu'); });
  $('#btnBackToMenuEnd').addEventListener('click', function () { show('screenMenu'); });

  btnNextQuiz.addEventListener('click', nextQuiz);
  btnCheck.addEventListener('click', check);
  btnRemoveLast.addEventListener('click', removeLastPiece);
  $('#btnClear').addEventListener('click', clearAll);
  btnNextPay.addEventListener('click', nextPay);
  $('#btnPayHint').addEventListener('click', requestPayHint);
  $('#btnRepeat').addEventListener('click', function () {
    if (currentConfig().isQuiz) startQuizRound(levelQ);
    else startPayRound(levelP);
  });
  $('#btnAnotherLevelEnd').addEventListener('click', function () { openActivity(currentActivity); });

  paintStars();
})();
