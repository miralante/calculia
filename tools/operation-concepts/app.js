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
  /* The grouping game's balls: one of these colours per group (data-group 1…4, then the colours repeat). */
  var PACK_COLOURS = 4;
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
  /* The deal drawing: a pool of pieces, empty groups, and the buttons. «Repartir» moves the next piece into the
     next group, in turn, so the sharing is seen happening. The result line shows once the pool is empty. */
  /* `ball`: the pieces are numbered balls (the frame beside the division slides), not slices. */
  function dealInner(total, groups, result, ball) {
    var pieces = '';
    for (var i = 0; i < total; i += 1) {
      pieces += ball
        ? '<span class="ops-deal-piece ops-deal-ball" role="button" tabindex="0"><b>' + (i + 1) + '</b></span>'
        : '<span class="ops-deal-piece" role="button" tabindex="0">' + SLICE + '<b class="ops-num">' + (i + 1) + '</b></span>';
    }
    var boxes = '';
    for (var g = 0; g < groups; g += 1) {
      boxes += '<div class="ops-deal-slot">' + groupTag('friend', g + 1) +
        '<div class="ops-group-box ops-empty-box ops-deal-group"></div></div>';
    }
    /* «Repartir» is there from the start. «Empezar de nuevo» appears after the first deal. */
    return '<div class="ops-deal-pool">' + pieces + '</div>' +
      '<div class="ops-row ops-deal-groups">' + boxes + '</div>' +
      '<p class="ops-expr ops-deal-result" hidden>' + result + '</p>' +
      '<div class="ops-deal-actions">' +
      '<button type="button" class="btn btn-secondary" data-deal="one">' + t('ui.deal') + '</button>' +
      '<button type="button" class="btn btn-secondary" data-deal="reset" hidden>' + t('ui.dealReset') + '</button>' +
      '</div>';
  }
  function dealHtml(total, groups, ball) {
    var result = fill(t('ui.dealResult'), { T: total, g: groups, e: total / groups });
    return '<div class="ops-deal" data-total="' + total + '" data-groups="' + groups + '" data-ball="' + (ball ? '1' : '0') +
      '" data-result="' + result + '">' + dealInner(total, groups, result, ball) + '</div>';
  }
  /* Up to three digits after the decimal point of r ÷ d: 1 ÷ 2 gives 5, 1 ÷ 3 gives 333… (the dots mean the digits go on). */
  function digitsOf(r, d) {
    var out = '';
    var rest = r;
    for (var i = 0; i < 3 && rest; i += 1) {
      rest *= 10;
      out += Math.floor(rest / d);
      rest %= d;
    }
    return rest ? out + '…' : out;
  }
  /* What a calculator shows for total ÷ size, with the locale's decimal sign: 7 ÷ 3 gives 2,333… */
  function valueText(total, size) {
    var r = total % size;
    return r ? Math.floor(total / size) + t('ui.decimalSep') + digitsOf(r, size) : String(total / size);
  }
  /* The same answer for the drawing, with its whole part marked. */
  function calcValueHtml(total, size) {
    var r = total % size;
    return '<b class="ops-int">' + Math.floor(total / size) + '</b>' + (r ? t('ui.decimalSep') + digitsOf(r, size) : '');
  }
  /* The calculator's line under the grouping drawing, shown once the groups are made: the whole part, and the decimal
     part as a part of one pack. Hidden until then. */
  function calcLineHtml(total, size) {
    var r = total % size;
    return '<p class="ops-expr ops-calc" hidden>' + fill(t('ui.calcValue'), { T: total, e: size, v: calcValueHtml(total, size) }) + '</p>' +
      '<p class="ops-story ops-calc-parts" hidden>' + fill(t('ui.calcWhole'), { q: Math.floor(total / size) }) +
      (r ? ' ' + fill(t('ui.calcDecimal'), { dec: '0' + t('ui.decimalSep') + digitsOf(r, size), r: r, e: size }) : '') + '</p>';
  }
  /* The relation between the two operations, once the groups are made: the same balls as a multiplication. */
  function relationLineHtml(total, size) {
    return '<p class="ops-expr ops-calc" hidden>' +
      fill(t('ui.relationLine'), { g: Math.floor(total / size), e: size, T: total }) + '</p>';
  }
  /* The grouping drawing: `total` numbered balls and one empty box per group of `size`. The instruction names the
     task. Each press of «Agrupar» moves the next `size` balls into the next empty box. `calc`: false, true (the
     calculator's answer) or 'relation' (the multiplication that goes back). */
  function frameGroupsInner(total, size, result, calc) {
    var groups = Math.floor(total / size);
    var pieces = '';
    for (var i = 0; i < total; i += 1) {
      pieces += '<span class="ops-deal-piece ops-deal-ball"><b>' + (i + 1) + '</b></span>';
    }
    var boxes = '';
    for (var g = 0; g < groups; g += 1) {
      boxes += '<div class="ops-deal-slot">' + groupTag('packGroup', g + 1) +
        '<div class="ops-group-box ops-empty-box ops-deal-group"></div></div>';
    }
    return '<p class="ops-story ops-pack-instruction">' + fill(t('ui.packInstruction'), { g: groups, e: size }) + '</p>' +
      '<div class="ops-pack-pool">' + pieces + '</div>' +
      '<div class="ops-row ops-deal-groups">' + boxes + '</div>' +
      '<p class="ops-expr ops-deal-result" hidden>' + result + '</p>' +
      (calc === 'relation' ? relationLineHtml(total, size) : (calc ? calcLineHtml(total, size) : '')) +
      '<div class="ops-deal-actions">' +
      '<button type="button" class="btn btn-secondary" data-pack="one">' + t('ui.packOne') + '</button>' +
      '<button type="button" class="btn btn-secondary" data-pack="reset" style="visibility:hidden">' + t('ui.dealReset') + '</button>' +
      '</div>';
  }
  /* `calc`: under the result, once the groups are made, the calculator's answer (true) or the multiplication (`relation`). */
  function frameGroupsHtml(total, size, calc) {
    var rest = total % size;
    var result = fill(t(rest ? 'ui.packResultLeft' : 'ui.packResult'),
      { T: total, e: size, g: Math.floor(total / size), r: rest });
    var attr = calc === 'relation' ? 'r' : (calc ? '1' : '0');
    return '<div class="ops-pack" data-total="' + total + '" data-size="' + size + '" data-calc="' + attr +
      '" data-result="' + result + '">' + frameGroupsInner(total, size, result, calc) + '</div>';
  }
  /* The data-calc of a grouping drawing, read back: 'r' the relation, '1' the calculator, '0' none. */
  function calcOf(attr) { return attr === 'r' ? 'relation' : attr === '1'; }
  /* The names game beside the first slide: the four names to put in their place under the numbers.
     Tap a name, then the place it goes. A wrong place shakes and the name stays free. */
  function namesFrameInner(total, size) {
    var quotient = Math.floor(total / size), rest = total % size;
    var nums = { dividend: total, divisor: size, quotient: quotient, rest: rest };
    var keys = rest ? ['dividend', 'divisor', 'quotient', 'rest'] : ['dividend', 'divisor', 'quotient'];
    var slot = function (key) {
      return '<div class="div-part"><span class="div-num">' + nums[key] + '</span>' +
        '<span class="ops-name-slot" data-slot="' + key + '"></span></div>';
    };
    var line = '<div class="div-names">' + slot('dividend') + sign('÷') + slot('divisor') + sign('=') + slot('quotient');
    if (rest) line += sign(t('ops.div.names.leftOver')) + slot('rest');
    line += '</div>';
    /* The names are offered in a different order from the sum, so they are not already in place. */
    var chips = '';
    keys.slice().reverse().forEach(function (key) {
      chips += '<button type="button" class="btn btn-secondary ops-name-chip" data-name="' + key + '">' +
        t('ops.div.names.' + key) + '</button>';
    });
    return '<p class="ops-story ops-names-msg" aria-live="polite">' + t('ui.namesPick') + '</p>' +
      line +
      '<div class="ops-row ops-names-chips">' + chips + '</div>' +
      '<p class="ops-expr ops-names-done" hidden>' + t('ui.namesDone') + '</p>' +
      '<div class="ops-deal-actions"><button type="button" class="btn btn-secondary" data-names="reset" style="visibility:hidden">' +
      t('ui.dealReset') + '</button></div>';
  }
  function namesFrameHtml(total, size) {
    return '<div class="ops-names" data-total="' + total + '" data-size="' + size + '">' + namesFrameInner(total, size) + '</div>';
  }
  /* The apples of the addition games: red for the first group, green for the second. */
  var APPLE_RED = '🍎';
  var APPLE_GREEN = '🍏';
  function applesHtml(icon, count) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="ops-item ops-apple" aria-hidden="true">' + icon + '</span>';
    return html;
  }
  /* The join game beside the first addition slide: two groups of apples. «Juntar» shows the joined group below the sum;
     the sum stays where it is. */
  function joinFrameInner(a, b) {
    return '<p class="ops-story ops-pack-instruction">' + t('ui.joinInstruction') + '</p>' +
      '<div class="ops-join-groups">' +
      '<div class="ops-group-box ops-join-a ops-deal-group">' + applesHtml(APPLE_RED, a) + '</div>' +
      sign('+') +
      '<div class="ops-group-box ops-join-b ops-deal-group">' + applesHtml(APPLE_GREEN, b) + '</div>' +
      '</div>' +
      '<div class="ops-join-total" hidden>' + sign('=') +
      '<div class="ops-group-box ops-join-all ops-deal-group">' + applesHtml(APPLE_RED, a) + applesHtml(APPLE_GREEN, b) + '</div>' +
      '</div>' +
      '<p class="ops-expr ops-deal-result" hidden>' + fill(t('ui.joinResult'), { a: a, b: b, T: a + b }) + '</p>' +
      '<div class="ops-deal-actions">' +
      '<button type="button" class="btn btn-secondary" data-join="one">' + t('ui.joinOne') + '</button>' +
      '<button type="button" class="btn btn-secondary" data-join="reset" style="visibility:hidden">' + t('ui.dealReset') + '</button>' +
      '</div>';
  }
  function joinFrameHtml(a, b) {
    return '<div class="ops-join" data-a="' + a + '" data-b="' + b + '">' + joinFrameInner(a, b) + '</div>';
  }
  /* `count` numbered balls, from 1. */
  function ballsHtml(count) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="ops-deal-piece ops-deal-ball"><b>' + (i + 1) + '</b></span>';
    return html;
  }
  /* The take game beside the first subtraction slide: n balls, and «Quitar» crosses out the taken ones. Below, the
     balls left, as the sum shows them. */
  function takeFrameInner(n, take) {
    return '<p class="ops-story ops-pack-instruction">' + fill(t('ui.takeInstruction'), { t: take }) + '</p>' +
      '<div class="ops-pack-pool">' + ballsHtml(n) + '</div>' +
      '<div class="ops-take-rest" hidden>' + sign('=') + '<div class="ops-take-left">' + ballsHtml(n - take) + '</div></div>' +
      '<p class="ops-expr ops-deal-result" hidden>' + fill(t('ui.takeResult'), { n: n, t: take, r: n - take }) + '</p>' +
      '<div class="ops-deal-actions">' +
      '<button type="button" class="btn btn-secondary" data-take="one">' + t('ui.takeOne') + '</button>' +
      '<button type="button" class="btn btn-secondary" data-take="reset" style="visibility:hidden">' + t('ui.dealReset') + '</button>' +
      '</div>';
  }
  function takeFrameHtml(n, take) {
    return '<div class="ops-take" data-n="' + n + '" data-remove="' + take + '">' + takeFrameInner(n, take) + '</div>';
  }
  /* One item of the fill game. `kind` is 'have' (already there) or 'add' (coming in). `place` is 'group' (the small
     items in the groups above) or 'hole' (the big slot of the row below). Addition: apples. Subtraction: coins. */
  function fillItemHtml(mode, kind, place) {
    if (mode === 'sub') {
      return place === 'hole'
        ? '<span class="ops-fill-coin"><span class="ops-coin" aria-hidden="true">' + t('ui.coin') + '</span></span>'
        : '<span class="ops-coin" aria-hidden="true">' + t('ui.coin') + '</span>';
    }
    var icon = kind === 'have' ? APPLE_RED : APPLE_GREEN;
    return place === 'hole'
      ? '<span class="ops-fill-apple" aria-hidden="true">' + icon + '</span>'
      : '<span class="ops-item ops-apple" aria-hidden="true">' + icon + '</span>';
  }
  /* The fill game: `need` places, `have` of them filled. Above: the group already there, a plus, and the items to
     bring in. Below: the places. «Añadir» fills the next empty place with one of the items above; the items above stay. */
  function fillFrameInner(need, have, mode) {
    var sub = mode === 'sub';
    var group = function (count, kind) {
      var html = '';
      for (var i = 0; i < count; i += 1) html += fillItemHtml(mode, kind, 'group');
      return html;
    };
    var holes = '';
    for (var h = 0; h < need; h += 1) {
      holes += h < have ? fillItemHtml(mode, 'have', 'hole') : '<span class="ops-fill-empty" aria-hidden="true"></span>';
    }
    var values = { n: need, h: have, m: need - have };
    return '<p class="ops-story ops-pack-instruction">' + fill(t(sub ? 'ui.fillInstructionSub' : 'ui.fillInstructionAdd'), values) + '</p>' +
      '<div class="ops-join-groups">' +
      '<div class="ops-group-box ops-deal-group">' + group(have, 'have') + '</div>' +
      sign('+') +
      '<div class="ops-group-box ops-deal-group ops-fill-from">' + group(need - have, 'add') + '</div>' +
      '</div>' +
      '<div class="ops-row ops-fill-row">' + holes + '</div>' +
      '<p class="ops-story ops-fill-left">' + fill(t(sub ? 'ui.fillLeftSub' : 'ui.fillLeftAdd'), values) + '</p>' +
      '<p class="ops-expr ops-deal-result" hidden>' + fill(t(sub ? 'ui.fillResultSub' : 'ui.fillResultAdd'), values) + '</p>' +
      '<div class="ops-deal-actions">' +
      '<button type="button" class="btn btn-secondary" data-fill="one">' + t(sub ? 'ui.fillOneSub' : 'ui.fillOneAdd') + '</button>' +
      '<button type="button" class="btn btn-secondary" data-fill="reset" style="visibility:hidden">' + t('ui.dealReset') + '</button>' +
      '</div>';
  }
  function fillFrameHtml(need, have, mode) {
    return '<div class="ops-fill" data-need="' + need + '" data-have="' + have + '" data-mode="' + mode + '">' +
      fillFrameInner(need, have, mode) + '</div>';
  }
  /* The swap game: two groups side by side. «Cambiar el orden» shows the same two groups swapped, below, with the
     sum; the first line stays where it is. */
  function swapFrameInner(a, b) {
    var boxA = '<div class="ops-group-box ops-deal-group ops-swap-box">' + applesHtml(APPLE_RED, a) + '</div>';
    var boxB = '<div class="ops-group-box ops-deal-group ops-swap-box">' + applesHtml(APPLE_GREEN, b) + '</div>';
    return '<p class="ops-story ops-pack-instruction">' + t('ui.swapInstruction') + '</p>' +
      '<div class="ops-swap-row">' + boxA + sign('+') + boxB + '</div>' +
      '<div class="ops-swap-total" hidden>' + sign('=') + '<div class="ops-swap-row">' + boxB + sign('+') + boxA + '</div></div>' +
      '<p class="ops-expr ops-deal-result" hidden>' + fill(t('ui.swapResult'), { a: a, b: b, T: a + b }) + '</p>' +
      '<div class="ops-deal-actions">' +
      '<button type="button" class="btn btn-secondary" data-swap="one">' + t('ui.swapOne') + '</button>' +
      '<button type="button" class="btn btn-secondary" data-swap="reset" style="visibility:hidden">' + t('ui.dealReset') + '</button>' +
      '</div>';
  }
  function swapFrameHtml(a, b) {
    return '<div class="ops-swap" data-a="' + a + '" data-b="' + b + '">' + swapFrameInner(a, b) + '</div>';
  }
  /* The frame beside the explanation: a slide with a `frame` spec shows its game on the right. */
  function introFrameHtml(slide) {
    var f = slide && slide.frame;
    if (!f) return null;
    if (f.kind === 'deal') return dealHtml(f.total, f.groups, f.balls);
    if (f.kind === 'pack') return frameGroupsHtml(f.total, f.size, f.calc || false);
    if (f.kind === 'names') return namesFrameHtml(f.total, f.size);
    if (f.kind === 'join') return joinFrameHtml(f.a, f.b);
    if (f.kind === 'take') return takeFrameHtml(f.n, f.take);
    if (f.kind === 'fill') return fillFrameHtml(f.need, f.have, f.mode);
    if (f.kind === 'swap') return swapFrameHtml(f.a, f.b);
    return null;
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

  /* ---- Factorials and powers: numbers in small boxes, with × and = between them ---- */
  /* n! = n × (n−1) × … × 1, and the list of its factors from n down to `low`. */
  function factorialOf(n) {
    var value = 1;
    for (var k = 2; k <= n; k += 1) value *= k;
    return value;
  }
  function factorsDown(n, low) {
    var list = [];
    for (var k = n; k >= low; k -= 1) list.push(k);
    return list;
  }
  /* `base` written `exp` times, for the power a^n. */
  function repeatOf(base, exp) {
    var list = [];
    for (var k = 0; k < exp; k += 1) list.push(base);
    return list;
  }
  /* A row of factors, then = and the result. */
  function chipLine(parts, result) {
    var html = '';
    parts.forEach(function (p, i) {
      if (i) html += sign('×');
      html += '<span class="fac-chip">' + p + '</span>';
    });
    return '<div class="fac-line">' + html + sign('=') + '<span class="fac-chip fac-result">' + result + '</span></div>';
  }
  /* n! as 4 × 3 × 2 × 1 = 24. */
  function chainHtml(n) { return chipLine(factorsDown(n, 1), factorialOf(n)); }
  /* a^n as 2 × 2 × 2 = 8. */
  function powerHtml(base, exp) { return chipLine(repeatOf(base, exp), Math.pow(base, exp)); }
  /* The first few factorials, one card each: the value grows fast. */
  function growthHtml(max) {
    var html = '<div class="fac-growth">';
    for (var n = 1; n <= max; n += 1) {
      html += '<div class="fac-card"><span class="fac-name">' + n + '!</span><span class="fac-value">' + factorialOf(n) + '</span></div>';
    }
    return html + '</div>';
  }
  /* n! as a big number, and below it each small number that divides it with nothing left over. */
  function chipsHtml(n) {
    var value = factorialOf(n);
    var html = '<p class="fac-big">' + n + '! = ' + value + '</p><div class="fac-chips">';
    for (var k = 1; k <= n; k += 1) {
      html += '<span class="fac-chip">' + value + ' ÷ ' + k + ' = ' + (value / k) + '</span>';
    }
    return html + '</div><p class="fac-note">' + t('ui.noRest') + '</p>';
  }
  /* n places in a row, one box each. `counts` writes how many choices that place has (n, n−1 … 1). `result` writes the product under them. */
  function slotsHtml(n, counts, result) {
    var html = '<div class="fac-slots">';
    for (var i = 0; i < n; i += 1) {
      html += '<div class="fac-slot">' + (counts ? '<span class="fac-slot-count">' + (n - i) + '</span>' : '') +
        '<span class="fac-box"></span></div>';
    }
    html += '</div>';
    if (result) html += '<p class="fac-expr">' + factorsDown(n, 1).join(' × ') + ' = ' + factorialOf(n) + '</p>';
    return html;
  }

  /* A drawing from its visual spec: intro slides and real-life examples. */
  function drawingHtml(spec) {
    /* A slide with no picture on the left (the game on the right carries it). */
    if (!spec) return '';
    if (spec.kind === 'chain') return chainHtml(spec.n);
    if (spec.kind === 'power') return powerHtml(spec.base, spec.exp);
    if (spec.kind === 'growth') return growthHtml(spec.max);
    if (spec.kind === 'chips') return chipsHtml(spec.n);
    if (spec.kind === 'slots') return slotsHtml(spec.n, spec.counts, spec.result);
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

  /* The factorial and power questions: a small calculation with its own drawing. */
  function makeMath(type) {
    var key = 'q.' + type + '.';
    if (type === 'factValue') {
      var n = rint(2, 5), value = factorialOf(n), chain = factorsDown(n, 1).join(' × ');
      return {
        prompt: fill(t(key + 'prompt'), { n: n }),
        visual: '<p class="fac-expr">' + chain + ' = ?</p>',
        hint: t(key + 'hint'),
        /* The wrong answers are the usual mix-ups: adding instead of multiplying, or leaving out the n. */
        input: { answer: value },
        explanation: fill(t(key + 'explain'), { chain: chain, T: value })
      };
    }
    if (type === 'factMeaning') {
      var m = rint(3, 5), mChain = factorsDown(m, 1).join(' × ');
      return {
        prompt: fill(t(key + 'prompt'), { n: m }),
        visual: '',
        hint: t(key + 'hint'),
        options: textOptions(mChain, [factorsDown(m, 1).join(' + '), factorsDown(m, 2).join(' × ')]),
        explanation: fill(t(key + 'explain'), { n: m, chain: mChain, T: factorialOf(m) })
      };
    }
    if (type === 'factSlots') {
      var s = rint(3, 5), total = factorialOf(s);
      return {
        prompt: fill(t(key + 'prompt'), { n: s }),
        visual: slotsHtml(s, false, false),
        hint: fill(t(key + 'hint'), { n: s }),
        input: { answer: total },
        explanation: fill(t(key + 'explain'), { chain: factorsDown(s, 1).join(' × '), T: total })
      };
    }
    if (type === 'factDivides') {
      /* The answer divides n! with nothing left over. The wrong ones are numbers just above n that do not. */
      var d = rint(3, 5), whole = factorialOf(d), fits = rint(2, d), misses = [];
      for (var c = d + 1; misses.length < 2 && c <= d + 8; c += 1) if (whole % c) misses.push(c);
      return {
        prompt: fill(t(key + 'prompt'), { n: d }),
        visual: '<p class="fac-expr">' + d + '! = ' + whole + '</p>',
        hint: fill(t(key + 'hint'), { T: whole }),
        options: numericOptions(fits, misses),
        explanation: fill(t(key + 'explain'), { T: whole, k: fits, g: whole / fits })
      };
    }
    if (type === 'powValue') {
      var pb = rint(2, 5), pe = rint(2, 3), pv = Math.pow(pb, pe), pChain = repeatOf(pb, pe).join(' × ');
      return {
        prompt: fill(t(key + 'prompt'), { b: pb, e: pe }),
        visual: '<p class="fac-expr">' + pChain + ' = ?</p>',
        hint: fill(t(key + 'hint'), { b: pb, e: pe }),
        input: { answer: pv },
        explanation: fill(t(key + 'explain'), { chain: pChain, T: pv })
      };
    }
    /* powMeaning: which multiplication is the power. The wrong ones add instead, or change the small number. */
    var mb = rint(2, 5), me = rint(2, 3), mText = repeatOf(mb, me).join(' × ');
    return {
      prompt: fill(t(key + 'prompt'), { b: mb, e: me }),
      visual: '',
      hint: t(key + 'hint'),
      options: textOptions(mText, [repeatOf(mb, me).join(' + '), mb + ' × ' + (me + 1)]),
      explanation: fill(t(key + 'explain'), { b: mb, e: me, chain: mText, T: Math.pow(mb, me) })
    };
  }

  /* A question of the round: def is the operation being practised (its entry of ACTIVITIES). */
  function makeQuestion(type, index, def) {
    if (type.indexOf('fact') === 0 || type.indexOf('pow') === 0) return makeMath(type);
    var q = t('q.' + type + '.prompt');
    var hint = t('q.' + type + '.hint');
    var icon = pickIcon(), pair = pickTwoIcons();
    if (type === 'pick') return makePick(def);
    /* integer and decimal: the packs with a leftover; the calculator's answer names the whole part, or the decimal part. */
    if (type === 'integer' || type === 'decimal') {
      var isz = rint(2, 5), ifull = rint(2, 4), ileft = rint(1, isz - 1), iT = ifull * isz + ileft;
      var idv = { T: iT, e: isz, q: ifull, r: ileft, v: valueText(iT, isz), dec: '0' + t('ui.decimalSep') + digitsOf(ileft, isz) };
      var ivisual = restHtml(iT, isz, icon);
      if (type === 'integer') {
        return {
          prompt: fill(q, idv), visual: ivisual, hint: hint,
          input: { answer: ifull },
          explanation: fill(t('q.integer.explain'), idv)
        };
      }
      return {
        prompt: fill(q, idv), visual: ivisual, hint: hint,
        options: textOptions(idv.dec, [String(ileft), String(ifull)]),
        explanation: fill(t('q.decimal.explain'), idv)
      };
    }
    if (type === 'more') {
      var ma = rint(2, 8), mb = rint(1, 6), MT = ma + mb;
      return {
        prompt: fill(q, { a: ma, b: mb }), visual: joinHtml(ma, mb, pair[0], false, pair[1]), hint: hint,
        input: { answer: MT },
        explanation: fill(t('q.more.explain'), { a: ma, b: mb, T: MT })
      };
    }
    if (type === 'join') {
      var a = rint(1, 8), b = rint(1, 6), T = a + b;
      return {
        prompt: q, visual: joinHtml(a, b, pair[0], false, pair[1]), hint: hint,
        input: { answer: T },
        explanation: fill(t('q.join.explain'), { a: a, b: b, T: T })
      };
    }
    if (type === 'take') {
      var n = rint(4, 12), take = rint(1, n - 1), r = n - take;
      return {
        prompt: fill(q, { n: n, t: take }), visual: takeHtml(n, take, icon), hint: hint,
        input: { answer: r },
        explanation: fill(t('q.take.explain'), { n: n, t: take, r: r })
      };
    }
    if (type === 'gap') {
      var need = rint(3, 10), have = rint(1, need - 1), m = need - have;
      return {
        prompt: fill(q, { n: need, h: have }), visual: gapHtml(need, have, icon), hint: hint,
        input: { answer: m },
        explanation: fill(t('q.gap.explain'), { m: m, n: need, h: have })
      };
    }
    if (type === 'times') {
      var gt = rint(2, 5), et = rint(2, 6), Tt = gt * et;
      return {
        prompt: fill(q, { g: gt, e: et }), visual: groupsHtml(gt, et, icon, gt + ' × ' + et + ' = ?'), hint: hint,
        input: { answer: Tt },
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
        input: { answer: each },
        explanation: fill(t('q.share.explain'), { each: each, T: total, g: people })
      };
    }
    if (type === 'rest') {
      var size = rint(2, 5), full = rint(2, 4), left = rint(1, size - 1);
      return {
        prompt: fill(q, { T: full * size + left, e: size }), visual: restHtml(full * size + left, size, icon), hint: hint,
        input: { answer: full },
        explanation: fill(t(left === 1 ? 'q.rest.explainOne' : 'q.rest.explain'), { q: full, r: left })
      };
    }
    /* leftover: the same packs, asking for what is left outside the full groups. Small leftovers come up often. */
    if (type === 'leftover') {
      var lsize = rint(3, 5), lfull = rint(2, 4), lleft = rint(1, lsize - 1);
      return {
        prompt: fill(q, { T: lfull * lsize + lleft, e: lsize }), visual: restHtml(lfull * lsize + lleft, lsize, icon), hint: hint,
        input: { answer: lleft },
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
    var options = App.utils.shuffle(DATA.ops.filter(function (entry) { return entry.pick !== false; }).map(function (entry) {
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

  /* The deal drawing's buttons: «Repartir» moves one piece into the next group; «Empezar de nuevo» rebuilds it. */
  /* Deals one piece: the next piece of the pool goes into the next group, in turn. */
  function dealOne(box) {
    var piece = box.querySelector('.ops-deal-pool .ops-deal-piece');
    if (!piece) return;
    var boxes = box.querySelectorAll('.ops-deal-group');
    var dealt = box.querySelectorAll('.ops-deal-group .ops-deal-piece').length;
    boxes[dealt % boxes.length].appendChild(piece);
    /* Nothing left to deal: «Repartir» goes away, the result shows and «Empezar de nuevo» appears. It stays hidden until then. */
    if (!box.querySelector('.ops-deal-pool .ops-deal-piece')) {
      box.querySelector('[data-deal="one"]').hidden = true;
      box.querySelector('.ops-deal-result').hidden = false;
      box.querySelector('[data-deal="reset"]').hidden = false;
    }
  }

  /* A tap on a piece in the pool also deals it. «Repartir» is the main way. */
  document.addEventListener('click', function (e) {
    var target = e.target.closest ? e.target : null;
    var button = target ? target.closest('[data-deal]') : null;
    var piece = target ? target.closest('.ops-deal-pool .ops-deal-piece') : null;
    var box = button ? button.closest('.ops-deal') : (piece ? piece.closest('.ops-deal') : null);
    if (!box) return;
    if (button && button.getAttribute('data-deal') === 'reset') {
      var total = parseInt(box.getAttribute('data-total'), 10);
      var groups = parseInt(box.getAttribute('data-groups'), 10);
      box.innerHTML = dealInner(total, groups, box.getAttribute('data-result'), box.getAttribute('data-ball') === '1');
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

  /* The grouping drawing's buttons: «Agrupar» makes the next group of balls; «Empezar de nuevo» rebuilds it. */
  function frameGroupsOne(box) {
    var size = parseInt(box.getAttribute('data-size'), 10);
    var pool = box.querySelector('.ops-pack-pool');
    var left = pool.querySelectorAll('.ops-deal-ball').length;
    var empty = null, number = 0;
    box.querySelectorAll('.ops-deal-group').forEach(function (group, index) {
      if (!empty && !group.querySelector('.ops-deal-ball')) { empty = group; number = index + 1; }
    });
    if (!empty || left < size) return;
    /* Each group takes its own colour, so the balls of one group read apart from the next group's. */
    for (var k = 0; k < size; k += 1) {
      var ball = pool.querySelector('.ops-deal-ball');
      ball.setAttribute('data-group', String(((number - 1) % PACK_COLOURS) + 1));
      empty.appendChild(ball);
    }
    /* No full group is left: the balls that remain are the rest. They are outlined, the result shows and «Empezar de nuevo»
       appears. The reset keeps its place from the start (visibility, not hidden), so the buttons do not move. */
    if (left - size < size) {
      box.querySelector('[data-pack="reset"]').style.visibility = 'visible';
      pool.querySelectorAll('.ops-deal-ball').forEach(function (ball) { ball.classList.add('ops-left'); });
      /* A single ball left over blinks and carries its «resto» label, so the leftover is not missed. */
      if (left - size === 1) {
        var lone = pool.querySelector('.ops-deal-ball');
        lone.classList.add('ops-blink');
        lone.insertAdjacentHTML('afterend', '<span class="ops-tag ops-rest-tag">' + fill(t('ui.remainder'), { r: 1 }) + '</span>');
      }
      box.querySelector('[data-pack="one"]').hidden = true;
      box.querySelector('.ops-deal-result').hidden = false;
      box.querySelectorAll('.ops-calc, .ops-calc-parts').forEach(function (el) { el.hidden = false; });
    }
  }
  document.addEventListener('click', function (e) {
    var target = e.target.closest ? e.target : null;
    var button = target ? target.closest('[data-pack]') : null;
    if (!button) return;
    var box = button.closest('.ops-pack');
    if (button.getAttribute('data-pack') === 'reset') {
      box.innerHTML = frameGroupsInner(parseInt(box.getAttribute('data-total'), 10),
        parseInt(box.getAttribute('data-size'), 10), box.getAttribute('data-result'), calcOf(box.getAttribute('data-calc')));
      return;
    }
    frameGroupsOne(box);
  });

  /* The names game's taps: a name is picked (tap it again to drop it), then a place is tapped to put it there. */
  document.addEventListener('click', function (e) {
    var target = e.target.closest ? e.target : null;
    var box = target ? target.closest('.ops-names') : null;
    if (!box) return;
    var msg = box.querySelector('.ops-names-msg');
    if (target.closest('[data-names="reset"]')) {
      box.innerHTML = namesFrameInner(parseInt(box.getAttribute('data-total'), 10), parseInt(box.getAttribute('data-size'), 10));
      return;
    }
    var chip = target.closest('.ops-name-chip');
    if (chip && !chip.classList.contains('is-placed')) {
      var wasOn = chip.classList.contains('is-selected');
      box.querySelectorAll('.ops-name-chip').forEach(function (c) { c.classList.remove('is-selected'); });
      if (!wasOn) chip.classList.add('is-selected');
      msg.textContent = t(wasOn ? 'ui.namesPick' : 'ui.namesPlace');
      return;
    }
    var slot = target.closest('.ops-name-slot');
    if (!slot || slot.classList.contains('is-ok')) return;
    var selected = box.querySelector('.ops-name-chip.is-selected');
    if (!selected) { msg.textContent = t('ui.namesPick'); return; }
    if (selected.getAttribute('data-name') === slot.getAttribute('data-slot')) {
      slot.textContent = selected.textContent;
      slot.classList.add('is-ok');
      selected.classList.remove('is-selected');
      selected.classList.add('is-placed');
      msg.textContent = t('ui.namesRight');
      if (!box.querySelector('.ops-name-slot:not(.is-ok)')) {
        box.querySelector('.ops-names-done').hidden = false;
        box.querySelector('[data-names="reset"]').style.visibility = 'visible';
        msg.textContent = t('ui.namesDone');
      }
    } else {
      selected.classList.remove('is-selected');
      slot.classList.remove('is-wrong');
      void slot.offsetWidth;
      slot.classList.add('is-wrong');
      msg.textContent = t('ui.namesWrong');
    }
  });


  /* The join and take games' buttons. «Juntar» moves the second group into the first; «Quitar» crosses out the last ones. */
  document.addEventListener('click', function (e) {
    var target = e.target.closest ? e.target : null;
    if (!target) return;
    var join = target.closest('[data-join]');
    if (join) {
      var jbox = join.closest('.ops-join');
      if (join.getAttribute('data-join') === 'reset') {
        jbox.innerHTML = joinFrameInner(parseInt(jbox.getAttribute('data-a'), 10), parseInt(jbox.getAttribute('data-b'), 10));
        return;
      }
      jbox.querySelector('.ops-join-total').hidden = false;
      join.hidden = true;
      jbox.querySelector('[data-join="reset"]').style.visibility = 'visible';
      jbox.querySelector('.ops-deal-result').hidden = false;
      return;
    }
    var take = target.closest('[data-take]');
    if (!take) return;
    var tbox = take.closest('.ops-take');
    if (take.getAttribute('data-take') === 'reset') {
      tbox.innerHTML = takeFrameInner(parseInt(tbox.getAttribute('data-n'), 10), parseInt(tbox.getAttribute('data-remove'), 10));
      return;
    }
    /* Only the balls in the top pool are crossed out; the balls left below are not part of the pool. */
    var balls = tbox.querySelectorAll('.ops-pack-pool .ops-deal-ball');
    var crossed = parseInt(tbox.getAttribute('data-remove'), 10);
    for (var i = balls.length - crossed; i < balls.length; i += 1) balls[i].classList.add('ops-cross');
    take.hidden = true;
    tbox.querySelector('.ops-take-rest').hidden = false;
    tbox.querySelector('[data-take="reset"]').style.visibility = 'visible';
    tbox.querySelector('.ops-deal-result').hidden = false;
  });

  /* The fill and swap games' buttons. */
  document.addEventListener('click', function (e) {
    var target = e.target.closest ? e.target : null;
    if (!target) return;
    var fillBtn = target.closest('[data-fill]');
    if (fillBtn) {
      var fbox = fillBtn.closest('.ops-fill');
      var need = parseInt(fbox.getAttribute('data-need'), 10);
      var have = parseInt(fbox.getAttribute('data-have'), 10);
      var mode = fbox.getAttribute('data-mode');
      if (fillBtn.getAttribute('data-fill') === 'reset') {
        fbox.innerHTML = fillFrameInner(need, have, mode);
        return;
      }
      var empty = fbox.querySelector('.ops-fill-empty');
      if (!empty) return;
      /* Only the hole fills: the items above stay where they are. */
      empty.outerHTML = fillItemHtml(mode, 'add', 'hole');
      var left = fbox.querySelectorAll('.ops-fill-empty').length;
      if (left > 0) {
        fbox.querySelector('.ops-fill-left').textContent = fill(t(mode === 'sub' ? 'ui.fillLeftSub' : 'ui.fillLeftAdd'), { m: left });
      } else {
        fbox.querySelector('.ops-fill-left').hidden = true;
        fillBtn.hidden = true;
        fbox.querySelector('.ops-deal-result').hidden = false;
        fbox.querySelector('[data-fill="reset"]').style.visibility = 'visible';
      }
      return;
    }
    var swapBtn = target.closest('[data-swap]');
    if (swapBtn) {
      var sbox = swapBtn.closest('.ops-swap');
      var sa = parseInt(sbox.getAttribute('data-a'), 10);
      var sb = parseInt(sbox.getAttribute('data-b'), 10);
      if (swapBtn.getAttribute('data-swap') === 'reset') {
        sbox.innerHTML = swapFrameInner(sa, sb);
        return;
      }
      sbox.querySelector('.ops-swap-total').hidden = false;
      swapBtn.hidden = true;
      sbox.querySelector('[data-swap="reset"]').style.visibility = 'visible';
      sbox.querySelector('.ops-deal-result').hidden = false;
    }
  });

  App.activityFlow.setup({
    toolId: 'operation-concepts',
    pairedTest: true,
    test: 'options',
    /* Typed numbers are checked with a hint, then the explanation. The choice questions stay as options. */
    socratic: true,
    typedAnswers: true,
    activities: ACTIVITIES,
    menuBackKey: 'ui.otherOps',
    testVisuals: true,
    testVisualClass: 'ops-visual',
    visualHtml: drawingHtml,
    introFrameHtml: introFrameHtml,
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
