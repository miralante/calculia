/* ============================================================
   Calculia — Operaciones
   Four sub-activities (+ − × ÷), one per operation. Each follows the
   Formas flow: 1. explanation (slides with a drawing), 2. real life
   (short everyday examples), 3. test (one question at a time).
   The drawings count things with small icons (dots of sweets, bags,
   boxes). The numbers in the test are small on purpose: this activity
   is about what an operation means, not about calculating fast.
   Texts are in strings.<locale>.js, the structure in data.js.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'operation-concepts';
  var $ = App.utils.$;
  function t(key) { return App.i18n.t(key); }

  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;

  var SCREENS = ['#screenMenu', '#screenIntro', '#screenReal', '#screenGame', '#screenEnd'];
  var op = null;           // the operation chosen in the menu (an entry of DATA.ops)
  var introIndex = 0;
  var realIndex = 0;
  var round = [];
  var qIndex = 0;
  var roundRight = 0;
  var question = null;
  var answered = false;
  var firstTry = true;
  var pickQueue = [];      // the «¿qué operación usarías?» stories of this round, not yet asked
  var SLICE = '<span class="ops-slice" aria-hidden="true"></span>';   // one slice of a pizza

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { $('#stars').textContent = '⭐ ' + progress.stars; }
  function show(screen) {
    SCREENS.forEach(function (id) { $(id).classList.toggle('hidden', id !== screen); });
  }
  function fill(text, values) {
    var out = text;
    Object.keys(values).forEach(function (k) { out = out.split('{' + k + '}').join(values[k]); });
    return out;
  }
  function opEntry(id) {
    for (var i = 0; i < DATA.ops.length; i += 1) if (DATA.ops[i].id === id) return DATA.ops[i];
    return null;
  }
  function rint(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  /* ---- Drawings -------------------------------------------------------
     Each drawing is HTML made of small icons. `cross` marks the last
     items as taken away; `empty` leaves the last ones as empty spaces. */
  function items(count, icon, opts) {
    var o = opts || {};
    var html = '';
    for (var i = 0; i < count; i += 1) {
      var cls = 'ops-item';
      if (o.cross && i >= count - o.cross) cls += ' ops-cross';
      if (o.alt) cls += ' ops-alt';
      if (o.empty && i >= count - o.empty) cls = 'ops-item ops-empty';
      /* `from` numbers the items on from that value: the first one carries it, the rest count on. */
      var num = o.from === undefined ? '' : '<b class="ops-num">' + (o.from + i) + '</b>';
      html += '<span class="' + cls + '" aria-hidden="true">' + (o.empty && i >= count - o.empty ? '' : icon) + num + '</span>';
    }
    return html;
  }
  function row(count, icon, opts) { return '<div class="ops-row">' + items(count, icon, opts) + '</div>'; }
  function sign(s) { return '<span class="ops-sign" aria-hidden="true">' + s + '</span>'; }

  /* Two groups and their sum (or their total). The second group has its own
     icon (another colour of the same fruit) so the two groups read apart. */
  function joinHtml(a, b, icon, showTotal, iconB, alt) {
    var second = iconB || icon;
    var html = '<div class="ops-line">' + row(a, icon) + sign('+') + row(b, second, { alt: alt });
    if (showTotal) html += sign('=') + '<div class="ops-row">' + items(a, icon) + items(b, second, { alt: alt }) + '</div>';
    return html + '</div>';
  }
  /* The same sum twice: first the groups in one order, then in the other, each with a total.
     Both colours show, so the swapped sum reads as the same total, not a new one. */
  function swapHtml(a, b, icon, iconB) {
    return '<div class="ops-divide">' + joinHtml(a, b, icon, true, iconB) + joinHtml(b, a, iconB, true, icon) + '</div>';
  }
  /* `n` items, the last `take` crossed out, counting from the right. `showResult` adds the items left, after «=». */
  function takeHtml(n, take, icon, showResult) {
    var html = '<div class="ops-line">' + row(n, icon, { cross: take });
    if (showResult) html += sign('=') + row(n - take, icon);
    return html + '</div>';
  }
  /* `need` places, `have` of them filled. */
  function gapHtml(need, have, icon) {
    var html = '';
    for (var i = 0; i < need; i += 1) {
      html += i < have
        ? '<span class="ops-item" aria-hidden="true">' + icon + '</span>'
        : '<span class="ops-item ops-empty" aria-hidden="true"></span>';
    }
    return '<div class="ops-line"><div class="ops-row">' + html + '</div></div>';
  }
  /* `groups` framed boxes of `each` items: each box is one group that repeats. */
  function groupsHtml(groups, each, icon, sumText, alt, numbered) {
    var html = '<div class="ops-group-stack">';
    for (var g = 0; g < groups; g += 1) {
      html += '<div class="ops-group-box">' + row(each, icon, { alt: alt && g % 2 === 1, from: numbered ? g * each + 1 : undefined }) + '</div>';
    }
    html += '</div>';
    if (sumText) html += '<p class="ops-expr">' + sumText + '</p>';
    return html;
  }
  /* The same groups as groupsHtml, each item numbered, so the count reads 1 … total. */
  function numberedGroupsHtml(groups, each, icon) {
    var html = '<div class="ops-group-stack">';
    for (var g = 0; g < groups; g += 1) html += '<div class="ops-group-box">' + row(each, icon, { from: g * each + 1 }) + '</div>';
    return html + '</div>';
  }
  /* The same total in two arrangements side by side: `a` groups of `b`, then `b` groups of `a`.
     Both are numbered, so the count to the same total can be seen. */
  function swapGroupsHtml(a, b, icon) {
    return '<div class="ops-compare">' +
      '<div class="ops-compare-side">' + numberedGroupsHtml(a, b, icon) + '<p class="ops-expr">' + a + ' × ' + b + '</p></div>' +
      '<div class="ops-compare-side">' + numberedGroupsHtml(b, a, icon) + '<p class="ops-expr">' + b + ' × ' + a + '</p></div>' +
      '</div>';
  }
  /* All items in one row, to be shared out by counting. */
  function flatHtml(total, icon) {
    return '<div class="ops-line">' + row(total, icon) + '</div>';
  }
  /* `total` items in rows of `size`: each full row is a framed group. `caption`, if given, names the groups. */
  function packHtml(total, size, icon, caption) {
    var html = '<div class="ops-group-stack">';
    for (var g = 0; g < Math.floor(total / size); g += 1) html += '<div class="ops-group-box">' + row(size, icon) + '</div>';
    if (total % size) html += '<div class="ops-row ops-left-row">' + items(total % size, icon, {}).replace(/ops-item/g, 'ops-item ops-left') + '</div>';
    html += '</div>';
    if (caption) html += '<p class="ops-expr">' + caption + '</p>';
    return html;
  }
  /* Like packHtml, but the leftover row is drawn apart so it reads as «sobra». */
  function restHtml(total, size, icon) { return packHtml(total, size, icon); }
  /* The total, and below it the empty groups it has to be shared into: the user fills them in. */
  function shareHtml(total, groups) {
    var html = '<div class="ops-divide">' + row(total, SLICE) + sign('↓') + '<div class="ops-group-stack">';
    for (var g = 0; g < groups; g += 1) html += '<div class="ops-group-box ops-empty-box"></div>';
    return html + '</div></div>';
  }
  /* The total first, and next to it how it is divided: `groups` equal groups (sharing), or groups of `size`
     (packing). A leftover, if any, sits apart. `caption` writes the division underneath. */
  function divideHtml(total, groups, size, icon, caption, product, alt) {
    var each = groups ? total / groups : size;
    var full = groups || Math.floor(total / size);
    var rem = groups ? 0 : total % size;
    var html = '<div class="ops-divide">' + row(total, icon) + sign('↓') + '<div class="ops-group-stack">';
    for (var g = 0; g < full; g += 1) html += '<div class="ops-group-box">' + row(each, icon, { alt: alt && g % 2 === 1 }) + '</div>';
    if (rem) html += '<div class="ops-row ops-left-row">' + items(rem, icon, {}).replace(/ops-item/g, 'ops-item ops-left') + '</div>';
    html += '</div></div>';
    if (caption) {
      var text = total + ' ÷ ' + (groups || size) + ' = ' + (groups ? each : full);
      if (rem) text += ', ' + fill(t('ui.remainder'), { r: rem });
      /* `product` writes the opposite multiplication on the line below: 3 × 4 = 12. */
      if (product && !rem) text += '<br>' + (groups || full) + ' × ' + each + ' = ' + total;
      html += '<p class="ops-expr">' + text + '</p>';
    }
    return html;
  }

  /* A drawing from its visual spec: intro slides and real-life examples. */
  function drawingHtml(spec) {
    /* A money drawing (`coin`) is drawn with the currency sign of the locale, not an emoji. */
    var icon = spec.coin ? '<span class="ops-coin" aria-hidden="true">' + t('ui.coin') + '</span>' : (spec.slice ? SLICE : spec.icon);
    if (spec.kind === 'join') return joinHtml(spec.a, spec.b, icon, true, spec.iconB, spec.alt);
    if (spec.kind === 'swap') return swapHtml(spec.a, spec.b, icon, spec.iconB);
    if (spec.kind === 'swapgroups') return swapGroupsHtml(spec.a, spec.b, icon);
    if (spec.kind === 'take') return takeHtml(spec.n, spec.take, icon, spec.result);
    if (spec.kind === 'gap') return gapHtml(spec.need, spec.have, icon);
    if (spec.kind === 'groups') {
      var text = null;
      if (spec.sum) {
        var parts = [];
        for (var g = 0; g < spec.groups; g += 1) parts.push(String(spec.each));
        text = parts.join(' + ') + ' = ' + (spec.groups * spec.each);
        /* `product` puts the multiplication on the line below the sum. */
        if (spec.product) text += '<br>' + spec.groups + ' × ' + spec.each + ' = ' + (spec.groups * spec.each);
      } else if (spec.caption) {
        text = fill(t('ui.groupsOf'), { g: spec.groups, e: spec.each });
      }
      /* A sum slide numbers its items: the sum counts them one by one. */
      return groupsHtml(spec.groups, spec.each, spec.icon, text, spec.alt, spec.sum);
    }
    if (spec.kind === 'divide') return divideHtml(spec.total, spec.groups, spec.size, icon, spec.caption, spec.product, spec.alt);
    if (spec.kind === 'pack') {
      var caption = spec.caption ? fill(t('ui.groupsOf'), { g: spec.total / spec.size, e: spec.size }) : null;
      return packHtml(spec.total, spec.size, spec.icon, caption);
    }
    if (spec.kind === 'rest') return restHtml(spec.total, spec.size, spec.icon);
    return '';
  }

  /* ---- Menu -------------------------------------------------------------- */
  function renderMenu() {
    var grid = $('#opGrid');
    grid.innerHTML = '';
    DATA.ops.forEach(function (entry) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn-actividad';
      button.innerHTML = '<span class="picto" aria-hidden="true">' + entry.symbol + '</span>' +
        '<span>' + t('ops.' + entry.id + '.name') + '</span>' +
        '<span class="detail-card">' + t('ops.' + entry.id + '.detail') + '</span>';
      button.addEventListener('click', function () { openOp(entry); });
      grid.appendChild(button);
    });
    show('#screenMenu');
  }

  function openOp(entry) {
    op = entry;
    introIndex = 0;
    $('#opTitle').textContent = entry.symbol + ' ' + t('ops.' + entry.id + '.name');
    paintIntro();
    show('#screenIntro');
  }

  /* ---- 1. Explanation: slides with a drawing --------------------------- */
  function paintIntro() {
    var slide = op.intro[introIndex];
    $('#introTitle').textContent = t('ops.' + op.id + '.intro.' + (introIndex + 1) + '.title');
    $('#introVisual').innerHTML = drawingHtml(slide.visual);
    $('#introVisual').setAttribute('aria-label', t('ui.visualAria'));
    $('#introText').textContent = t('ops.' + op.id + '.intro.' + (introIndex + 1) + '.text');
    var introBar = $('#introProgress');
    introBar.setAttribute('aria-label', fill(t('ui.count'), { i: introIndex + 1, n: op.intro.length }));
    introBar.setAttribute('aria-valuemax', String(op.intro.length));
    introBar.setAttribute('aria-valuenow', String(introIndex + 1));
    $('#introProgressFill').style.width = ((introIndex + 1) / op.intro.length * 100) + '%';
    $('#introPrev').disabled = introIndex === 0;
    $('#introNext').disabled = introIndex === op.intro.length - 1;
  }

  /* ---- 2. Real life: short examples ---------------------------------------- */
  function paintReal() {
    $('#realVisual').innerHTML = drawingHtml(op.real[realIndex].visual);
    $('#realVisual').setAttribute('aria-label', t('ui.visualAria'));
    $('#realText').textContent = t('ops.' + op.id + '.real.' + (realIndex + 1));
    var realBar = $('#realProgress');
    realBar.setAttribute('aria-label', fill(t('ui.count'), { i: realIndex + 1, n: op.real.length }));
    realBar.setAttribute('aria-valuemax', String(op.real.length));
    realBar.setAttribute('aria-valuenow', String(realIndex + 1));
    $('#realProgressFill').style.width = ((realIndex + 1) / op.real.length * 100) + '%';
    $('#realPrev').disabled = realIndex === 0;
    $('#realNext').disabled = realIndex === op.real.length - 1;
  }

  /* ---- 3. Test -------------------------------------------------------------- */
  function startRound() {
    var types = DATA.questions[op.id];
    var list = [];
    for (var i = 0; i < DATA.perRound; i += 1) list.push(types[i % types.length]);
    pickQueue = [];
    round = App.utils.shuffle(list).map(makeQuestion);
    qIndex = 0;
    roundRight = 0;
    show('#screenGame');
    renderQuestion();
  }

  /* Numbers as answers: the right one and two others, all different and not
     below zero, in a shuffled order. */
  function numericOptions(correct, wrongs) {
    var values = [correct];
    wrongs.forEach(function (v) {
      if (values.length < 3 && v >= 0 && values.indexOf(v) === -1) values.push(v);
    });
    return App.utils.shuffle(values).map(function (v) {
      return { html: String(v), aria: String(v), correct: v === correct };
    });
  }

  function textOptions(correctText, wrongTexts) {
    var texts = [correctText];
    wrongTexts.forEach(function (s) { if (texts.indexOf(s) === -1 && texts.length < 3) texts.push(s); });
    return App.utils.shuffle(texts).map(function (s) {
      return { html: s, aria: s, correct: s === correctText };
    });
  }

  function makeQuestion(type) {
    var q = t('q.' + type + '.prompt');
    var hint = t('q.' + type + '.hint');
    if (type === 'pick') return makePick();
    if (type === 'more') {
      var ma = rint(2, 5), mb = rint(1, 4), MT = ma + mb;
      return {
        prompt: fill(q, { a: ma, b: mb }), visual: joinHtml(ma, mb, '🍎', false, '🍏'), hint: hint,
        options: numericOptions(MT, [MT + 1, MT - 1, MT + 2]),
        explanation: fill(t('q.more.explain'), { a: ma, b: mb, T: MT })
      };
    }
    if (type === 'join') {
      var a = rint(1, 5), b = rint(1, 4), T = a + b;
      return {
        prompt: q, visual: joinHtml(a, b, '🍎', false, '🍏'), hint: hint,
        options: numericOptions(T, [T + 1, T - 1, T + 2]),
        explanation: fill(t('q.join.explain'), { a: a, b: b, T: T })
      };
    }
    if (type === 'take') {
      var n = rint(4, 9), take = rint(1, n - 1), r = n - take;
      return {
        prompt: fill(q, { n: n, t: take }), visual: takeHtml(n, take, '🍪'), hint: hint,
        options: numericOptions(r, [n, r + 1, r - 1, take]),
        explanation: fill(t('q.take.explain'), { n: n, t: take, r: r })
      };
    }
    if (type === 'gap') {
      var need = rint(3, 8), have = rint(1, need - 1), m = need - have;
      return {
        prompt: fill(q, { n: need, h: have }), visual: gapHtml(need, have, '⭐'), hint: hint,
        options: numericOptions(m, [need, have, m + 1, m - 1]),
        explanation: fill(t('q.gap.explain'), { m: m, n: need, h: have })
      };
    }
    if (type === 'times') {
      var gt = rint(2, 4), et = rint(2, 5), Tt = gt * et;
      return {
        prompt: fill(q, { g: gt, e: et }), visual: groupsHtml(gt, et, '🔋'), hint: hint,
        options: numericOptions(Tt, [gt + et, Tt + et, Tt - 1, Tt + 1]),
        explanation: fill(t('q.times.explain'), { g: gt, e: et, T: Tt })
      };
    }
    if (type === 'repeat') {
      var gr = rint(2, 4), er = rint(2, 5);
      var sumOf = function (count) { return new Array(count).fill(er).join(' + '); };
      var correct = sumOf(gr);
      return {
        prompt: fill(q, { g: gr, e: er }), visual: groupsHtml(gr, er, '🔋'), hint: hint,
        options: textOptions(correct, [sumOf(gr + 1), gr + ' + ' + er, er + ' × ' + (gr - 1)]),
        explanation: fill(t('q.repeat.explain'), { g: gr, e: er })
      };
    }
    if (type === 'share') {
      var people = rint(2, 4), each = rint(2, 5), total = people * each;
      return {
        prompt: fill(q, { T: total, g: people }), visual: shareHtml(total, people), hint: hint,
        options: numericOptions(each, [each + 1, each - 1, people]),
        explanation: fill(t('q.share.explain'), { each: each, T: total, g: people })
      };
    }
    if (type === 'rest') {
      var size = rint(3, 5), full = rint(2, 4), left = rint(1, size - 1);
      return {
        prompt: fill(q, { T: full * size + left, e: size }), visual: restHtml(full * size + left, size, '🔴'), hint: hint,
        options: numericOptions(full, [full + 1, full - 1, left]),
        explanation: fill(t('q.rest.explain'), { q: full, r: left })
      };
    }
    /* swap: changing the order of the two addends keeps the total (commutative). */
    if (type === 'swap') {
      var sa = rint(2, 5), sb = rint(1, 5);
      while (sb === sa) sb = rint(1, 5);
      return {
        prompt: fill(q, { a: sa, b: sb }), visual: joinHtml(sa, sb, '🍎', false, '🍏'), hint: hint,
        options: textOptions(sb + ' + ' + sa, [sa + ' + ' + (sb + 1), (sa + 1) + ' + ' + (sb + 1), sa + ' + ' + sa]),
        explanation: fill(t('q.swap.explain'), { a: sa, b: sb, T: sa + sb })
      };
    }
    /* swapTimes: turning the groups around keeps the total (commutative). */
    if (type === 'swapTimes') {
      var sg = rint(2, 4), se = rint(2, 5);
      while (se === sg) se = rint(2, 5);
      return {
        prompt: fill(q, { g: sg, e: se }), visual: groupsHtml(sg, se, '🔋'), hint: hint,
        options: textOptions(se + ' × ' + sg, [sg + ' × ' + (se + 1), sg + ' + ' + se, (sg + 1) + ' × ' + se]),
        explanation: fill(t('q.swapTimes.explain'), { g: sg, e: se, T: sg * se })
      };
    }
    /* relation */
    var gl = rint(2, 4), el = rint(2, 5), Tl = gl * el;
    var division = Tl + ' ÷ ' + el + ' = ' + gl;
    return {
      prompt: fill(q, { T: Tl, e: el }), visual: groupsHtml(gl, el, '🔴'), hint: fill(hint, { e: el }),
      options: textOptions(division, [
        Tl + ' ÷ ' + el + ' = ' + (gl + 1),
        Tl + ' ÷ ' + gl + ' = ' + (el + 1),
        Tl + ' + ' + el + ' = ' + gl
      ]),
      explanation: fill(t('q.relation.explain'), { T: Tl, e: el, g: gl })
    };
  }

  /* «¿Qué operación usarías?»: a short situation, four operations to choose. */
  function makePick() {
    /* Only the stories of the operation being practised, each one once per round. */
    if (!pickQueue.length) {
      pickQueue = App.utils.shuffle(DATA.picks.filter(function (p) { return p.op === op.id; }));
    }
    var item = pickQueue.shift();
    var answer = opEntry(item.op);
    var options = App.utils.shuffle(DATA.ops.map(function (entry) {
      return {
        html: '<span class="op-sym">' + entry.symbol + '</span><span>' + t('answerName.' + entry.id) + '</span>',
        aria: t('answerName.' + entry.id),
        correct: entry.id === item.op
      };
    }));
    return {
      prompt: t('picks.prompt'),
      visual: '<p class="ops-story">' + t('picks.' + item.id) + '</p>',
      hint: t('picks.hint'),
      options: options,
      explanation: fill(t('pickExplain'), { op: t('answerName.' + answer.id) })
    };
  }

  function renderQuestion() {
    question = round[qIndex];
    answered = false;
    firstTry = true;
    $('#progressFill').style.width = ((qIndex / round.length) * 100) + '%';
    $('#progressText').textContent = (qIndex + 1) + ' / ' + round.length;
    $('#testPrompt').textContent = question.prompt;
    $('#testVisual').innerHTML = question.visual;
    $('#feedback').textContent = '';
    $('#feedback').className = 'feedback';
    var box = $('#testOptions');
    box.innerHTML = '';
    question.options.forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn option-btn';
      button.innerHTML = option.html;
      button.setAttribute('aria-label', option.aria);
      button.addEventListener('click', function () { answer(option, button); });
      box.appendChild(button);
    });
    $('#btnNext').classList.add('hidden');
  }

  function answer(option, button) {
    if (answered) return;
    var feedback = $('#feedback');
    if (option.correct) {
      answered = true;
      button.classList.add('correct');
      feedback.textContent = t('ui.right') + ' ' + question.explanation;
      feedback.className = 'feedback success';
      if (firstTry) {
        roundRight += 1;
        progress.stars += 1;
        save();
        paintStars();
      }
      $('#testOptions').querySelectorAll('button').forEach(function (b) { b.disabled = true; });
      $('#btnNext').classList.remove('hidden');
      return;
    }
    /* A wrong answer: the hint, and the option stays off. Nothing is punished. */
    firstTry = false;
    button.classList.add('incorrect');
    button.disabled = true;
    feedback.textContent = question.hint;
    feedback.className = 'feedback error';
  }

  function nextQuestion() {
    qIndex += 1;
    if (qIndex < round.length) {
      renderQuestion();
      return;
    }
    progress.completedRounds += 1;
    save();
    $('#endSummary').textContent = fill(t('ui.roundDone'), {
      n: roundRight, total: round.length, stars: progress.stars
    });
    show('#screenEnd');
  }

  /* ---- Wiring ----------------------------------------------------------- */
  function init() {
    App.i18n.apply();
    paintStars();
    renderMenu();
    $('#introPrev').addEventListener('click', function () { introIndex -= 1; paintIntro(); });
    $('#introNext').addEventListener('click', function () { introIndex += 1; paintIntro(); });
    $('#introContinue').addEventListener('click', function () { realIndex = 0; paintReal(); show('#screenReal'); });
    $('#realPrev').addEventListener('click', function () { realIndex -= 1; paintReal(); });
    $('#realNext').addEventListener('click', function () { realIndex += 1; paintReal(); });
    $('#realContinue').addEventListener('click', startRound);
    $('#btnNext').addEventListener('click', nextQuestion);
    $('#newRound').addEventListener('click', startRound);
    $('#otherOps').addEventListener('click', renderMenu);
    $('#introBack').addEventListener('click', renderMenu);
    $('#testBack').addEventListener('click', renderMenu);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
