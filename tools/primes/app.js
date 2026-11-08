/* ============================================================
   Calculia — Primos y compuestos
   Three stages, in the flow of the test sheet: 1. the concepts (slides
   with a drawing), 2. real life (one example at a time), 3. the test sheet,
   where the whole round is on one screen, as in Rectas.
   The stages and the sheet are built by assets/js/activity-flow.js; this
   file has the numbers, the drawings and the questions. The data is in
   data.js and the texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;

  /* The three kinds of question, one of each in every three. */
  var KINDS = ['classify', 'pick', 'factors'];

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
    /* Six dots in two groups of three: 6 shared between 2 is 3 each. */
    divide: [[36, 46, 6], [60, 46, 6], [84, 46, 6], [36, 74, 6], [60, 74, 6], [84, 74, 6]],
    prime: [[15, 60, 5], [29, 60, 5], [43, 60, 5], [57, 60, 5], [71, 60, 5], [85, 60, 5], [99, 60, 5]],
    composite: [[36, 46, 6], [60, 46, 6], [84, 46, 6], [36, 74, 6], [60, 74, 6], [84, 74, 6]],
    one: [[60, 60, 8]]
  };

  /* Numbers in cells, five to a row. A prime gets a ring, so it is told
     apart without colour, as in the tree. */
  function numbersSvg(nums) {
    var cells = nums.map(function (n, i) {
      var x = 12 + (i % 5) * 24;
      var y = 16 + Math.floor(i / 5) * 28;
      return '<circle cx="' + x + '" cy="' + y + '" r="10" class="tree-node' +
        (isPrime(n) ? ' is-prime' : '') + '"/>' +
        '<text x="' + x + '" y="' + (y + 4) + '" class="tree-num">' + n + '</text>';
    }).join('');
    return '<svg viewBox="0 0 120 60" width="190" height="95" aria-hidden="true">' + cells + '</svg>';
  }

  function conceptSvg(item) {
    if (item.numbers) return numbersSvg(item.numbers);
    if (item.id === 'factors') return treeSvg();
    return dotsSvg(CONCEPT_DOTS[item.id]);
  }

  /* ---- Questions ----
     Each question is built from one number, so the answer comes from the
     number itself. */
  function classifyQuestion(n) {
    var answer = n === 1 ? 'neither' : (isPrime(n) ? 'prime' : 'composite');
    return {
      prompt: t('gen.classifyPrompt'),
      hint: t('gen.hintClassify'),
      visual: '<div class="number-stage">' + n + '</div>',
      options: App.utils.shuffle(['prime', 'composite', 'neither'].map(function (k) {
        return {
          html: '<span class="answer-name">' + t('answer.' + k) + '</span>',
          aria: t('answer.' + k),
          correct: k === answer
        };
      })),
      inline: true
    };
  }

  function pickQuestion(set) {
    return {
      prompt: t('gen.pickPrompt'),
      hint: t('gen.hintPick'),
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
      prompt: t('gen.factorsPrompt'),
      hint: t('gen.hintFactors'),
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

  function makeQuestion(kind) {
    if (kind === 'classify') {
      return classifyQuestion(App.utils.drawRound('primes-classify', DATA.numbers));
    }
    if (kind === 'pick') {
      return pickQuestion(App.utils.drawRound('primes-pick', DATA.pickSets));
    }
    return factorsQuestion(App.utils.drawRound('primes-factors', DATA.factorNumbers));
  }

  App.activityFlow.setup({
    toolId: 'primes',
    test: 'options',
    slideProgress: false,
    intro: DATA.concepts.map(function (concept) { return { visual: concept }; }),
    real: DATA.real.map(function (item) { return { visual: item }; }),
    introHeading: function () { return t('instructionIntro'); },
    introCopy: function (i) {
      var id = DATA.concepts[i].id;
      return { title: t('concept.' + id + '.title'), text: t('concept.' + id + '.text') };
    },
    realText: function (i) { return t('real.' + DATA.real[i].id); },
    visualHtml: function (concept) {
      return '<div class="grid-stage">' + conceptSvg(concept) + '</div>';
    },
    /* The objects are drawn one by one, so the count can be seen: 7 sweets, 12 tiles. */
    realVisualHtml: function (item) {
      var html = '';
      for (var i = 0; i < item.count; i += 1) {
        html += '<span class="real-item">' + item.object + '</span>';
      }
      return '<div class="real-object" aria-hidden="true">' + html + '</div>';
    },
    /* The round is a shuffled list of question kinds, one kind per question. */
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(KINDS[i % KINDS.length]);
      return App.utils.shuffle(list);
    },
    makeQuestion: makeQuestion
  });
})();
