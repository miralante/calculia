/* ============================================================
   Calculia — Primos y compuestos
   Data in data.js. Shared modules in assets/js/.
   Screens: concepts → real examples → test sheet. The test sheet shows
   every question of the round at once, as in Rectas.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'primes';
  var $ = App.utils.$;

  var screenIntro = $('#screenIntro');
  var screenReal = $('#screenReal');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var galleryVisual = $('#galleryVisual');
  var galleryCaption = $('#galleryCaption');
  var galleryNote = $('#galleryNote');
  var realObject = $('#realObject');
  var realCaption = $('#realCaption');
  var testSheetEl = $('#testSheet');
  var btnCheck = $('#btnCheck');
  var btnNewRound = $('#btnNewRound');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  /* Round state. Each roundSheets entry is one question of the round with
     the option the person picked (selected, null until chosen) and whether
     "Comprobar" accepted it (correct, null until it is checked). */
  var roundCorrect = 0;
  var roundSheets = [];
  var galleryIndex = 0;
  var realIndex = 0;

  /* The three kinds of question, one of each in every three. */
  var KINDS = ['classify', 'pick', 'factors'];

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Nothing that can be worked out is stored ----
     Whether a number is prime comes out of trying its divisors, so the
     answer and the number cannot disagree. */
  function isPrime(n) {
    if (n < 2) return false;
    for (var d = 2; d * d <= n; d += 1) {
      if (n % d === 0) return false;
    }
    return true;
  }

  /* Prime factors in ascending order: 12 → [2, 2, 3]. */
  function factorize(n) {
    var parts = [];
    var rest = n;
    for (var d = 2; d * d <= rest; d += 1) {
      while (rest % d === 0) {
        parts.push(d);
        rest /= d;
      }
    }
    if (rest > 1) parts.push(rest);
    return parts;
  }

  function nextPrime(n) {
    var m = n + 1;
    while (!isPrime(m)) m += 1;
    return m;
  }

  /* Checked at start-up, so bad data fails loudly instead of teaching a
     lie: each set has exactly one prime, and each factor number is
     composite (its factorisation is more than the number itself). */
  DATA.pickSets.forEach(function (set) {
    var primes = [set.prime].concat(set.others).filter(isPrime);
    if (primes.length !== 1 || primes[0] !== set.prime) {
      throw new Error('primes: set with ' + set.prime + ' does not have exactly one prime');
    }
  });
  DATA.factorNumbers.forEach(function (n) {
    if (isPrime(n)) throw new Error('primes: "' + n + '" is prime, not composite');
  });

  /* ---- Drawings ----
     Dots are the picture of a number: a prime is only one row of dots,
     a composite can also be a rectangle of rows and columns. */
  function dotsSvg(dots) {
    return '<svg viewBox="0 0 120 120" width="190" height="190" aria-hidden="true">' +
      '<rect x="0" y="0" width="120" height="120" class="primes-box"/>' +
      dots.map(function (p) {
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" class="dot"/>';
      }).join('') + '</svg>';
  }

  /* The factor tree of 12: 12 splits into 2 and 6, and 6 into 2 and 3.
     The primes get a ring, so they are told apart without colour. */
  function treeSvg() {
    var nodes = [
      { x: 60, y: 24, n: 12, prime: false, from: null },
      { x: 34, y: 66, n: 2, prime: true, from: 0 },
      { x: 86, y: 66, n: 6, prime: false, from: 0 },
      { x: 70, y: 106, n: 2, prime: true, from: 2 },
      { x: 102, y: 106, n: 3, prime: true, from: 2 }
    ];
    var body = nodes.map(function (node) {
      if (node.from === null) return '';
      var parent = nodes[node.from];
      return '<line x1="' + parent.x + '" y1="' + (parent.y + 12) + '" x2="' +
        node.x + '" y2="' + (node.y - 12) + '" class="tree-line"/>';
    }).join('');
    body += nodes.map(function (node) {
      return '<circle cx="' + node.x + '" cy="' + node.y + '" r="12" class="tree-node' +
        (node.prime ? ' is-prime' : '') + '"/>' +
        '<text x="' + node.x + '" y="' + (node.y + 5) + '" class="tree-num">' + node.n + '</text>';
    }).join('');
    return '<svg viewBox="0 0 120 120" width="190" height="190" aria-hidden="true">' + body + '</svg>';
  }

  /* The concept slides. Each one draws its own idea. */
  var CONCEPT_DOTS = {
    prime: [[15, 60, 5], [29, 60, 5], [43, 60, 5], [57, 60, 5], [71, 60, 5], [85, 60, 5], [99, 60, 5]],
    composite: [[36, 46, 6], [60, 46, 6], [84, 46, 6], [36, 74, 6], [60, 74, 6], [84, 74, 6]],
    one: [[60, 60, 8]]
  };

  function conceptSvg(id) {
    if (id === 'factors') return treeSvg();
    return dotsSvg(CONCEPT_DOTS[id]);
  }

  /* ---- Questions ----
     Each question is built from one number, so the answer comes from the
     number itself. */
  function classifyQuestion(n) {
    var answer = n === 1 ? 'neither' : (isPrime(n) ? 'prime' : 'composite');
    return {
      prompt: App.i18n.t('gen.classifyPrompt'),
      hint: App.i18n.t('gen.hintClassify'),
      visual: '<div class="number-stage">' + n + '</div>',
      options: App.utils.shuffle(['prime', 'composite', 'neither'].map(function (k) {
        return {
          html: '<span class="answer-name">' + App.i18n.t('answer.' + k) + '</span>',
          aria: App.i18n.t('answer.' + k),
          correct: k === answer
        };
      })),
      inline: true
    };
  }

  function pickQuestion(set) {
    return {
      prompt: App.i18n.t('gen.pickPrompt'),
      hint: App.i18n.t('gen.hintPick'),
      visual: '',
      options: App.utils.shuffle([set.prime].concat(set.others).map(function (n) {
        return {
          html: '<span class="answer-num">' + n + '</span>',
          aria: String(n),
          correct: n === set.prime
        };
      })),
      inline: true
    };
  }

  /* The wrong answers are the mistakes people make: a factor that is not
     prime yet (merge the first two), a product that is not the number
     (the last factor changed to the next prime), and the 1 that is not
     prime. The right one is the only list where every factor is prime and
     they multiply back to the number. */
  function factorsQuestion(n) {
    var parts = factorize(n);
    var merged = parts.slice(2).concat([parts[0] * parts[1]]).sort(function (a, b) { return a - b; });
    var changed = parts.slice(0, -1).concat([nextPrime(parts[parts.length - 1])]);
    var texts = [
      parts.join(' × '),
      merged.length === 1 ? merged[0] + ' × 1' : merged.join(' × '),
      changed.join(' × '),
      ['1'].concat(parts).join(' × ')
    ];
    return {
      prompt: App.i18n.t('gen.factorsPrompt'),
      hint: App.i18n.t('gen.hintFactors'),
      visual: '<div class="number-stage">' + n + '</div>',
      options: App.utils.shuffle(texts.map(function (text, i) {
        return {
          html: '<span class="answer-name">' + text + '</span>',
          aria: text,
          correct: i === 0
        };
      })),
      inline: true
    };
  }

  /* ---- Screens ---- */

  function show(screen) {
    [screenIntro, screenReal, screenGame, screenEnd].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Concept carousel ---- */

  function paintGallery() {
    var item = DATA.concepts[galleryIndex];
    galleryVisual.innerHTML = '<div class="grid-stage">' + conceptSvg(item.id) + '</div>';
    galleryCaption.textContent = App.i18n.t('concept.' + item.id + '.title');
    galleryNote.textContent = App.i18n.t('concept.' + item.id + '.text');
  }

  /* ---- Real-life carousel ---- */

  function paintRealExample() {
    var item = DATA.real[realIndex];
    realObject.textContent = item.object;
    realCaption.textContent = App.i18n.t('real.' + item.id);
  }

  /* ---- Test sheet ----
     The whole round is on one screen. Every question is generated when the
     round starts, and the options inside each one are shuffled too. "Comprobar"
     checks them all at once; "Otra ronda" deals a new round. */

  function makeQuestion(kind) {
    if (kind === 'classify') {
      return classifyQuestion(App.utils.drawRound('primes-classify', DATA.numbers));
    }
    if (kind === 'pick') {
      return pickQuestion(App.utils.drawRound('primes-pick', DATA.pickSets));
    }
    return factorsQuestion(App.utils.drawRound('primes-factors', DATA.factorNumbers));
  }

  function startRound() {
    App.utils.drawRoundReset();
    var questions = [];
    for (var i = 0; i < DATA.perRound; i += 1) {
      questions.push(makeQuestion(KINDS[i % KINDS.length]));
    }
    roundSheets = App.utils.shuffle(questions).map(function (q) {
      return { question: q, selected: null, correct: null };
    });
    roundCorrect = 0;
    show(screenGame);
    renderSheet();
  }

  /* Paints the whole round at once. The user can change a selection on any
     question until "Comprobar" is pressed. Right answers lock; a missed
     question shows its hint (never the answer) and stays open. */
  function renderSheet() {
    testSheetEl.innerHTML = '';
    roundSheets.forEach(function (sheet, i) {
      var card = document.createElement('article');
      card.className = 'card stack test-sheet-card';

      var promptEl = document.createElement('p');
      promptEl.className = 'prompt';
      promptEl.textContent = sheet.question.prompt;
      card.appendChild(promptEl);

      if (sheet.question.visual) {
        var visualEl = document.createElement('div');
        visualEl.className = 'visual';
        visualEl.innerHTML = sheet.question.visual;
        /* Only a picture without text gets a label. A number is already
           text, so the screen reader must read it as it is. */
        if (sheet.question.visualAria) {
          visualEl.setAttribute('role', 'img');
          visualEl.setAttribute('aria-label', sheet.question.visualAria);
        }
        card.appendChild(visualEl);
      }

      var optionsEl = document.createElement('div');
      optionsEl.className = 'stack options';
      if (sheet.question.inline) optionsEl.classList.add('options-row');
      sheet.question.options.forEach(function (op, j) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.innerHTML = op.html;
        if (op.aria) btn.setAttribute('aria-label', op.aria);
        btn.addEventListener('click', function () { selectOption(i, j); });
        optionsEl.appendChild(btn);
      });
      card.appendChild(optionsEl);

      var feedbackEl = document.createElement('p');
      feedbackEl.className = 'feedback hidden';
      feedbackEl.setAttribute('aria-live', 'polite');
      card.appendChild(feedbackEl);

      testSheetEl.appendChild(card);
    });

    btnCheck.classList.remove('hidden');
    btnCheck.disabled = false;
    btnNewRound.classList.add('hidden');
    paintSheetProgress();
  }

  function selectOption(sheetIdx, optionIdx) {
    var sheet = roundSheets[sheetIdx];
    if (sheet.correct === true) return; /* already right: locked */
    sheet.selected = optionIdx;
    var card = testSheetEl.querySelectorAll('.test-sheet-card')[sheetIdx];
    card.querySelectorAll('.option-btn').forEach(function (b, j) {
      b.classList.toggle('selected', j === optionIdx);
      b.classList.remove('incorrect');
    });
    paintSheetProgress();
  }

  function checkAnswers() {
    var firstUnanswered = -1;
    for (var i = 0; i < roundSheets.length; i += 1) {
      if (roundSheets[i].correct !== true && roundSheets[i].selected === null) {
        firstUnanswered = i;
        break;
      }
    }
    if (firstUnanswered !== -1) {
      /* Not checked half-way: scroll to the first unanswered card and shake
         it so it is noticed. The round does not count yet. */
      var target = testSheetEl.querySelectorAll('.test-sheet-card')[firstUnanswered];
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('shake');
      setTimeout(function () { target.classList.remove('shake'); }, 500);
      return;
    }

    /* Only the first check of the round scores. Later checks walk through
       the questions still wrong and add no stars. */
    var firstCheck = roundSheets.every(function (sheet) { return sheet.correct === null; });
    var rightFirstTry = 0;
    var cards = testSheetEl.querySelectorAll('.test-sheet-card');
    roundSheets.forEach(function (sheet, i) {
      if (sheet.correct === true) return; /* already right: stays locked */
      var card = cards[i];
      var options = card.querySelectorAll('.option-btn');
      var selected = sheet.question.options[sheet.selected];
      sheet.correct = selected.correct;
      if (selected.correct && firstCheck) rightFirstTry += 1;

      options.forEach(function (b) { b.classList.remove('selected'); });
      var feedbackEl = card.querySelector('.feedback');
      feedbackEl.classList.remove('hidden', 'success', 'error', 'encourage');
      if (selected.correct) {
        options.forEach(function (b) { b.disabled = true; });
        options[sheet.selected].classList.add('correct');
        feedbackEl.textContent = '✅';
        feedbackEl.classList.add('success');
      } else {
        /* Wrong: the hint shows, the answer does not. The card stays open. */
        options[sheet.selected].classList.add('incorrect');
        App.feedback.encourage(feedbackEl);
        feedbackEl.textContent = ' ' + (sheet.question.hint || App.i18n.t('hint'));
        feedbackEl.classList.add('error');
      }
    });

    if (firstCheck) {
      roundCorrect = rightFirstTry;
      progress.stars += roundCorrect;
      save();
      paintStars();
    }

    var allRight = roundSheets.every(function (sheet) { return sheet.correct === true; });
    btnCheck.classList.toggle('hidden', allRight);
    btnNewRound.classList.remove('hidden');
    if (allRight) btnNewRound.focus();
    paintSheetProgress();
  }

  /* Before "Comprobar" the bar counts the questions with an option picked;
     after it, the ones already right. The figure is always "x / total". */
  function paintSheetProgress() {
    var total = roundSheets.length;
    var checked = roundSheets[0].correct !== null;
    var numerator = checked
      ? roundSheets.filter(function (s) { return s.correct === true; }).length
      : roundSheets.filter(function (s) { return s.selected !== null; }).length;
    progressFill.style.width = (numerator / total * 100) + '%';
    progressText.textContent = numerator + ' / ' + total;
  }

  /* ---- Events ---- */

  $('#galleryPrev').addEventListener('click', function () {
    galleryIndex = (galleryIndex + DATA.concepts.length - 1) % DATA.concepts.length;
    paintGallery();
  });
  $('#galleryNext').addEventListener('click', function () {
    galleryIndex = (galleryIndex + 1) % DATA.concepts.length;
    paintGallery();
  });
  $('#realPrev').addEventListener('click', function () {
    realIndex = (realIndex + DATA.real.length - 1) % DATA.real.length;
    paintRealExample();
  });
  $('#realNext').addEventListener('click', function () {
    realIndex = (realIndex + 1) % DATA.real.length;
    paintRealExample();
  });
  $('#introContinue').addEventListener('click', function () { show(screenReal); });
  $('#realContinue').addEventListener('click', startRound);
  $('#btnCheck').addEventListener('click', checkAnswers);
  $('#btnNewRound').addEventListener('click', startRound);

  /* End screen: the only button is "Volver al inicio", which goes back to
     the Calculia landing. The test sheet never reaches it; the guard keeps
     the wire the same as the other activities. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

  paintGallery();
  paintRealExample();
  paintStars();
})();
