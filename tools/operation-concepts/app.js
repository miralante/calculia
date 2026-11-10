/* ============================================================
   Calculia — Operaciones
   Four operations (+ − × ÷), one activity per operation in the menu. Each
   one follows the three stages of the shared flow (assets/js/activity-flow.js):
   1. slides with a drawing, 2. real-life examples, 3. the test, one question at
   a time. The menu, the stages and the closing screen are the engine's; this
   file has the drawings, the questions and the operation-specific parts.
   The drawings count things with small icons (dots of sweets, bags,
   boxes). The numbers in the test are small on purpose: this activity
   is about what an operation means, not about calculating fast.
   Texts are in strings.<locale>.js, the structure in data.js.
   ============================================================ */
(function () {
  'use strict';

  function t(key) { return App.i18n.t(key); }
  var fill = App.utils.fill;
  var rint = App.utils.rint;

  var pickQueue = [];      // the «¿qué operación usarías?» stories of this round, not yet asked
  /* One slice of a pizza: a 60° wedge with its tip at the centre, crust along the outer arc, and pepperoni. */
  var SLICE = '<svg class="ops-slice" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
    '<path d="M20 20 L11 4.4 A18 18 0 0 1 29 4.4 Z" fill="#f4c04a" stroke="#c98a2b" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<path d="M11 4.4 A18 18 0 0 1 29 4.4" fill="none" stroke="#b8741a" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="20" cy="10" r="2" fill="#d9452b"/><circle cx="19.5" cy="15" r="1.5" fill="#d9452b"/>' +
    '</svg>';

  function opEntry(id) {
    for (var i = 0; i < DATA.ops.length; i += 1) if (DATA.ops[i].id === id) return DATA.ops[i];
    return null;
  }

  /* The objects a question is drawn with. Each question picks one (two different ones for a sum), so the
     pictures change too, not only the numbers. Every item of one question is the same object, so it can be counted. */
  var ITEM_ICONS = ['🍎', '🍊', '🍇', '🍓', '🍪', '🍬', '🍭', '🌼', '🥚', '🍕', '🔋', '🎈', '⭐', '📖', '🚲', '🧃'];
  function pickIcon() { return ITEM_ICONS[rint(0, ITEM_ICONS.length - 1)]; }
  function pickTwoIcons() {
    var first = pickIcon(), second = pickIcon();
    while (second === first) second = pickIcon();
    return [first, second];
  }

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
  /* The balls of a numbered division drawing: one colour per package, in order. */
  var PACKAGE_BALLS = ['🔴', '🔵', '🟢', '🟡'];
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
  /* A small drawing of `g` groups of `e`, side by side, for an answer button: the groups read as one picture, and the button stays short. */
  function optionGroupsHtml(g, e, icon) {
    var html = '<span class="ops-mini" aria-hidden="true">';
    for (var k = 0; k < g; k += 1) html += '<span class="ops-mini-group">' + items(e, icon) + '</span>';
    return html + '</span>';
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
  /* The name of group `n` in a drawing: «Amigo n», «Paquete n», «Estante n» or «Caja n», in the same auxiliary style. */
  function groupTag(key, n) {
    return '<span class="ops-tag">' + fill(t('ui.' + key), { n: n }) + '</span>';
  }
  /* The deal drawing: a pool of pieces, empty groups, and two buttons. «Repartir uno» moves the next piece into the
     next group, in turn, so the sharing is seen happening. The result line shows once the pool is empty. */
  function dealInner(total, groups, result) {
    var pieces = '';
    for (var i = 0; i < total; i += 1) pieces += '<span class="ops-deal-piece" role="button" tabindex="0">' + SLICE + '<b class="ops-num">' + (i + 1) + '</b></span>';
    var boxes = '';
    for (var g = 0; g < groups; g += 1) {
      boxes += '<div class="ops-deal-slot">' + groupTag('friend', g + 1) +
        '<div class="ops-group-box ops-empty-box ops-deal-group"></div></div>';
    }
    /* The buttons stay hidden until the first slice is dealt: the slices themselves are the way to start. */
    return '<div class="ops-deal-pool">' + pieces + '</div>' +
      '<div class="ops-row ops-deal-groups">' + boxes + '</div>' +
      '<p class="ops-expr ops-deal-result" hidden>' + result + '</p>' +
      '<div class="ops-deal-actions" hidden>' +
      '<button type="button" class="btn btn-secondary" data-deal="one">' + t('ui.dealOne') + '</button>' +
      '<button type="button" class="btn btn-secondary" data-deal="reset">' + t('ui.dealReset') + '</button>' +
      '</div>';
  }
  function dealHtml(total, groups) {
    var result = fill(t('ui.dealResult'), { T: total, g: groups, e: total / groups });
    return '<div class="ops-deal" data-total="' + total + '" data-groups="' + groups + '" data-result="' + result + '">' +
      dealInner(total, groups, result) + '</div>';
  }
  /* The total first, and next to it how it is divided: `groups` equal groups (sharing), or groups of `size`
     (packing). A leftover, if any, sits apart. `caption` writes the division underneath. */
  function divideHtml(total, groups, size, icon, caption, product, alt, numbered, labelKey) {
    var each = groups ? total / groups : size;
    var full = groups || Math.floor(total / size);
    var rem = groups ? 0 : total % size;
    /* Each full group carries its name: «Amigo n» when shared, «Paquete n» when packed unless the spec names another (shelf, box). */
    var tagKey = labelKey || (groups ? 'friend' : 'pack');
    /* A numbered drawing colours each package apart, so the balls in the total read as the packages they go in. */
    var ball = function (g) { return numbered ? PACKAGE_BALLS[g % PACKAGE_BALLS.length] : icon; };
    var top = row(total, icon);
    if (numbered) {
      top = '';
      for (var p = 0; p < full; p += 1) top += items(each, ball(p), { from: p * each + 1 });
      if (rem) top += items(rem, ball(full), { from: full * each + 1 });
      top = '<div class="ops-row">' + top + '</div>';
    }
    var html = '<div class="ops-divide' + (numbered ? ' ops-numbered' : '') + '">' + top + sign('↓') + '<div class="ops-group-stack">';
    for (var g = 0; g < full; g += 1) {
      html += '<div class="ops-group-slot">' + groupTag(tagKey, g + 1) +
        '<div class="ops-group-box">' + row(each, ball(g), { alt: alt && g % 2 === 1, from: numbered ? g * each + 1 : undefined }) + '</div></div>';
    }
    if (rem) html += '<div class="ops-row ops-left-row">' + items(rem, ball(full), { from: numbered ? full * each + 1 : undefined }).replace(/ops-item/g, 'ops-item ops-left') + '</div>';
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

  /* The parts of a division under their numbers, in one line: 7 (dividend) ÷ 3 (divisor) = 2 (quotient),
     sobra 1 (rest). The rest appears only when the division is not exact. */
  function namesHtml(total, size) {
    var name = function (key) { return t('ops.div.names.' + key); };
    var part = function (num, key) {
      return '<div class="div-part"><span class="div-num">' + num + '</span><span class="div-name">' + name(key) + '</span></div>';
    };
    var html = '<div class="div-names">' + part(total, 'dividend') + sign('÷') + part(size, 'divisor') +
      sign('=') + part(Math.floor(total / size), 'quotient');
    if (total % size) html += sign(name('leftOver')) + part(total % size, 'rest');
    return html + '</div>';
  }

  /* A drawing from its visual spec: intro slides and real-life examples. */
  function drawingHtml(spec) {
    /* A money drawing (`coin`) is drawn with the currency sign of the locale, not an emoji. */
    var icon = spec.coin ? '<span class="ops-coin" aria-hidden="true">' + t('ui.coin') + '</span>' : (spec.slice ? SLICE : spec.icon);
    if (spec.kind === 'join') return joinHtml(spec.a, spec.b, icon, true, spec.iconB, spec.alt);
    if (spec.kind === 'swap') return swapHtml(spec.a, spec.b, icon, spec.iconB);
    if (spec.kind === 'swapgroups') return swapGroupsHtml(spec.a, spec.b, icon);
    if (spec.kind === 'deal') return dealHtml(spec.total, spec.groups);
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
    if (spec.kind === 'divide') return divideHtml(spec.total, spec.groups, spec.size, icon, spec.caption, spec.product, spec.alt, spec.numbered, spec.label);
    if (spec.kind === 'pack') {
      var caption = spec.caption ? fill(t('ui.groupsOf'), { g: spec.total / spec.size, e: spec.size }) : null;
      return packHtml(spec.total, spec.size, spec.icon, caption);
    }
    if (spec.kind === 'rest') return restHtml(spec.total, spec.size, spec.icon);
    if (spec.kind === 'names') return namesHtml(spec.total, spec.size);
    return '';
  }


  /* ---- Activities: one per operation, each with its own slides, examples and questions ---- */

  /* The question types of one round of an operation (def is its entry of ACTIVITIES). Each question draws its
     type at random, so a round does not repeat the same mix of problems. */
  function buildRound(def) {
    var types = DATA.questions[def.id];
    var list = [];
    for (var i = 0; i < DATA.perRound; i += 1) list.push(types[rint(0, types.length - 1)]);
    pickQueue = [];
    return App.utils.shuffle(list);
  }

  var ACTIVITIES = DATA.ops.map(function (entry) {
    return {
      id: entry.id,
      picto: entry.symbol,
      name: function () { return t('ops.' + entry.id + '.name'); },
      detail: function () { return t('ops.' + entry.id + '.detail'); },
      intro: entry.intro,
      real: entry.real
    };
  });

  /* Numbers as answers: the right one and two others, all different and not
     below zero, in a shuffled order. */
  var numericOptions = App.utils.numericOptions;

  function textOptions(correctText, wrongTexts) {
    var texts = [correctText];
    wrongTexts.forEach(function (s) { if (texts.indexOf(s) === -1 && texts.length < 3) texts.push(s); });
    return App.utils.shuffle(texts).map(function (s) {
      return { html: s, aria: s, correct: s === correctText };
    });
  }

  /* A question of the round: def is the operation being practised (its entry of ACTIVITIES). */
  function makeQuestion(type, index, def) {
    var q = t('q.' + type + '.prompt');
    var hint = t('q.' + type + '.hint');
    var icon = pickIcon(), pair = pickTwoIcons();
    if (type === 'pick') return makePick(def);
    if (type === 'more') {
      var ma = rint(2, 8), mb = rint(1, 6), MT = ma + mb;
      return {
        prompt: fill(q, { a: ma, b: mb }), visual: joinHtml(ma, mb, pair[0], false, pair[1]), hint: hint,
        options: numericOptions(MT, [MT + 1, MT - 1, MT + 2]),
        explanation: fill(t('q.more.explain'), { a: ma, b: mb, T: MT })
      };
    }
    if (type === 'join') {
      var a = rint(1, 8), b = rint(1, 6), T = a + b;
      return {
        prompt: q, visual: joinHtml(a, b, pair[0], false, pair[1]), hint: hint,
        options: numericOptions(T, [T + 1, T - 1, T + 2]),
        explanation: fill(t('q.join.explain'), { a: a, b: b, T: T })
      };
    }
    if (type === 'take') {
      var n = rint(4, 12), take = rint(1, n - 1), r = n - take;
      return {
        prompt: fill(q, { n: n, t: take }), visual: takeHtml(n, take, icon), hint: hint,
        options: numericOptions(r, [n, r + 1, r - 1, take]),
        explanation: fill(t('q.take.explain'), { n: n, t: take, r: r })
      };
    }
    if (type === 'gap') {
      var need = rint(3, 10), have = rint(1, need - 1), m = need - have;
      return {
        prompt: fill(q, { n: need, h: have }), visual: gapHtml(need, have, icon), hint: hint,
        options: numericOptions(m, [need, have, m + 1, m - 1]),
        explanation: fill(t('q.gap.explain'), { m: m, n: need, h: have })
      };
    }
    if (type === 'times') {
      var gt = rint(2, 5), et = rint(2, 6), Tt = gt * et;
      return {
        prompt: fill(q, { g: gt, e: et }), visual: groupsHtml(gt, et, icon, gt + ' × ' + et + ' = ?'), hint: hint,
        options: numericOptions(Tt, [gt + et, Tt + et, Tt - 1, Tt + 1]),
        explanation: fill(t('q.times.explain'), { g: gt, e: et, T: Tt })
      };
    }
    if (type === 'repeat') {
      var gr = rint(2, 5), er = rint(2, 6);
      var sumOf = function (count) { return new Array(count).fill(er).join(' + '); };
      var correct = sumOf(gr);
      return {
        prompt: fill(q, { g: gr, e: er }), visual: groupsHtml(gr, er, icon), hint: hint,
        options: textOptions(correct, [sumOf(gr + 1), gr + ' + ' + er, er + ' × ' + (gr - 1)]),
        explanation: fill(t('q.repeat.explain'), { g: gr, e: er })
      };
    }
    if (type === 'share') {
      var people = rint(2, 4), each = rint(2, 6), total = people * each;
      return {
        /* The same deal drawing as the explanation: the slices can be dealt one by one, with the buttons to help. */
        prompt: fill(q, { T: total, g: people }), visual: dealHtml(total, people), hint: hint,
        options: numericOptions(each, [each + 1, each - 1, people]),
        explanation: fill(t('q.share.explain'), { each: each, T: total, g: people })
      };
    }
    if (type === 'rest') {
      var size = rint(2, 5), full = rint(2, 4), left = rint(1, size - 1);
      return {
        prompt: fill(q, { T: full * size + left, e: size }), visual: restHtml(full * size + left, size, icon), hint: hint,
        options: numericOptions(full, [full + 1, full - 1, left]),
        explanation: fill(t(left === 1 ? 'q.rest.explainOne' : 'q.rest.explain'), { q: full, r: left })
      };
    }
    /* leftover: the same packs, asking for what is left outside the full groups. Small leftovers come up often. */
    if (type === 'leftover') {
      var lsize = rint(3, 5), lfull = rint(2, 4), lleft = rint(1, lsize - 1);
      return {
        prompt: fill(q, { T: lfull * lsize + lleft, e: lsize }), visual: restHtml(lfull * lsize + lleft, lsize, icon), hint: hint,
        options: numericOptions(lleft, [lsize, lfull, lleft + 1, lleft - 1]),
        explanation: fill(t(lleft === 1 ? 'q.leftover.explainOne' : 'q.leftover.explain'), { q: lfull, r: lleft })
      };
    }
    /* swap: changing the order of the two addends keeps the total (commutative). */
    if (type === 'swap') {
      var sa = rint(2, 8), sb = rint(1, 8);
      while (sb === sa) sb = rint(1, 8);
      return {
        prompt: fill(q, { a: sa, b: sb }), visual: joinHtml(sa, sb, pair[0], false, pair[1]), hint: hint,
        options: textOptions(sb + ' + ' + sa, [sa + ' + ' + (sb + 1), (sa + 1) + ' + ' + (sb + 1), sa + ' + ' + sa]),
        explanation: fill(t('q.swap.explain'), { a: sa, b: sb, T: sa + sb })
      };
    }
    /* swapTimes: turning the groups around keeps the total (commutative). */
    if (type === 'swapTimes') {
      var sg = rint(2, 5), se = rint(2, 6);
      while (se === sg) se = rint(2, 6);
      /* Each answer is drawn as its own groups, so the equivalent arrangement is seen, not only read. */
      var asGroups = function (g, e, correctOne) {
        return {
          html: '<span class="ops-option">' + optionGroupsHtml(g, e, icon) + '<span class="ops-option-name">' + g + ' × ' + e + '</span></span>',
          aria: g + ' × ' + e, correct: correctOne
        };
      };
      return {
        prompt: fill(q, { g: sg, e: se }), visual: groupsHtml(sg, se, icon), hint: hint,
        options: App.utils.shuffle([asGroups(se, sg, true), asGroups(sg, se + 1, false), asGroups(sg + 1, se, false)]),
        explanation: fill(t('q.swapTimes.explain'), { g: sg, e: se, T: sg * se })
      };
    }
    /* relation */
    var gl = rint(2, 5), el = rint(2, 6), Tl = gl * el;
    var division = Tl + ' ÷ ' + el + ' = ' + gl;
    return {
      prompt: fill(q, { T: Tl, e: el }), visual: groupsHtml(gl, el, icon), hint: fill(hint, { e: el }),
      options: textOptions(division, [
        Tl + ' ÷ ' + el + ' = ' + (gl + 1),
        Tl + ' ÷ ' + gl + ' = ' + (el + 1),
        Tl + ' + ' + el + ' = ' + gl
      ]),
      explanation: fill(t('q.relation.explain'), { T: Tl, e: el, g: gl })
    };
  }

  /* «¿Qué operación usarías?»: a short situation, four operations to choose. */
  function makePick(def) {
    /* Only the stories of the operation being practised, each one once per round. */
    if (!pickQueue.length) {
      pickQueue = App.utils.shuffle(DATA.picks.filter(function (p) { return p.op === def.id; }));
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

  /* The deal drawing's buttons: «Repartir uno» moves one piece into the next group; «Empezar de nuevo» rebuilds it. */
  /* Deals one slice: the next piece of the pool goes into the next group, in turn. */
  function dealOne(box) {
    var piece = box.querySelector('.ops-deal-pool .ops-deal-piece');
    if (!piece) return;
    var boxes = box.querySelectorAll('.ops-deal-group');
    var dealt = box.querySelectorAll('.ops-deal-group .ops-deal-piece').length;
    boxes[dealt % boxes.length].appendChild(piece);
    box.querySelector('.ops-deal-actions').hidden = false;
    if (!box.querySelector('.ops-deal-pool .ops-deal-piece')) box.querySelector('.ops-deal-result').hidden = false;
  }

  /* A tap on a slice in the pool deals it. The buttons below appear after the first deal. */
  document.addEventListener('click', function (e) {
    var target = e.target.closest ? e.target : null;
    var button = target ? target.closest('[data-deal]') : null;
    var piece = target ? target.closest('.ops-deal-pool .ops-deal-piece') : null;
    var box = button ? button.closest('.ops-deal') : (piece ? piece.closest('.ops-deal') : null);
    if (!box) return;
    if (button && button.getAttribute('data-deal') === 'reset') {
      var total = parseInt(box.getAttribute('data-total'), 10);
      var groups = parseInt(box.getAttribute('data-groups'), 10);
      box.innerHTML = dealInner(total, groups, box.getAttribute('data-result'));
      return;
    }
    dealOne(box);
  });
  /* The same for the keyboard: Enter or Space on a focused slice deals it. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var piece = e.target.closest ? e.target.closest('.ops-deal-pool .ops-deal-piece') : null;
    if (!piece) return;
    e.preventDefault();
    dealOne(piece.closest('.ops-deal'));
  });


  App.activityFlow.setup({
    toolId: 'operation-concepts',
    test: 'options',
    activities: ACTIVITIES,
    menuBackKey: 'ui.otherOps',
    testVisuals: true,
    testVisualClass: 'ops-visual',
    visualHtml: drawingHtml,
    introCopy: function (i, def) {
      return {
        title: t('ops.' + def.id + '.intro.' + (i + 1) + '.title'),
        text: t('ops.' + def.id + '.intro.' + (i + 1) + '.text')
      };
    },
    realText: function (i, def) { return t('ops.' + def.id + '.real.' + (i + 1)); },
    buildRound: buildRound,
    makeQuestion: makeQuestion,
    backHref: '../../'
  });
})();
