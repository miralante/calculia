/* ============================================================
   Calculia — Pares e impares: app.

   Fases, en el orden de la anatomía de Calculia (SPEC §3.6 y
   §3.8): primero se explica (qué es par y qué es impar, con los
   números del 0 al 10), luego se muestra en la vida real, y por
   último un único test, "Empezar a practicar". El test tiene tres
   partes, en orden: puntos, números del 0 al 99 y números grandes
   por su última cifra. Cada respuesta correcta publica su
   explicación; cada fallo publica una pista que no revela la
   respuesta.

   La regla es la misma en todas las partes: par si se puede repartir
   en parejas sin que sobre nada; impar si sobra uno.

   Bandera del módulo: mod-razonamiento (el "razonamiento" del
   agrupamiento). El punto sobrante usa color-foco-suave como
   halo: el punto suelto se lee como el singular.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'parity';
  var $ = App.utils.$;

  /* Persistent state */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function t(key) { return App.i18n.t(key); }

  /* Replaces every {name} in text with values[name]. Replacing
     all occurrences (not only the first) keeps the helper safe for
     texts that repeat a placeholder, such as "{n} es {p}". */
  function fill(text, values) {
    Object.keys(values).forEach(function (name) {
      text = text.split('{' + name + '}').join(String(values[name]));
    });
    return text;
  }

  function randomInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
  function isEven(n) { return n % 2 === 0; }
  function wordFor(n) { return t(isEven(n) ? 'wordEven' : 'wordOdd'); }
  function format(n) { return n.toLocaleString(App.i18n.locale() === 'en' ? 'en-US' : 'es-ES'); }

  /* ----------- Elements ----------- */
  var screens = {
    intro: $('#screenParityIntro'),
    real: $('#screenParityReal'),
    game: $('#screenParity'),
    finish: $('#screenParityFinish')
  };
  var starsEl = $('#stars');

  function paintStars() {
    starsEl.textContent = '⭐ ' + progress.stars;
  }

  /* Moves between the stages of the activity. Focus goes to the
     stage heading so a screen reader announces the new stage. */
  function goTo(name) {
    Object.keys(screens).forEach(function (key) { hide(screens[key]); });
    show(screens[name]);
    window.scrollTo(0, 0);
    var heading = screens[name].querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }

  /* ----------- Explanation stage: dots, slides and real examples ----------- */

  /* One ball: a circle with its number inside. */
  function ball(number, leftover) {
    var el = document.createElement('span');
    el.className = leftover ? 'parity-ball parity-leftover' : 'parity-ball parity-pair';
    el.style.backgroundColor = leftover ? DATA.leftoverColor : DATA.pairColor;
    el.textContent = String(number);
    return el;
  }

  /* Paints n balls numbered 1..n. Each pair is a column: the ball
     with the lower number sits on top, the one above it below, so
     "1 con 2" reads as one pair. The leftover ball (odd n) stands
     alone in the second colour. The pairing shape IS the answer.
     Sets an aria-label on the container that says it aloud. */
  function paintDots(cont, n) {
    cont.innerHTML = '';
    var pairs = Math.floor(n / 2);
    for (var i = 0; i < pairs; i += 1) {
      var pair = document.createElement('div');
      pair.className = 'parity-ball-pair';
      pair.appendChild(ball(2 * i + 1, false));
      pair.appendChild(ball(2 * i + 2, false));
      cont.appendChild(pair);
    }
    if (n % 2) {
      var single = document.createElement('div');
      single.className = 'parity-ball-pair';
      single.appendChild(ball(n, true));
      cont.appendChild(single);
    }
    var label = pairs + ' ' + t('pairsWord');
    if (n % 2) label += ', ' + t('oneLeftWord');
    cont.setAttribute('aria-label', label);
  }

  /* The explanation stage is a set of slides, one number at a time:
     0 to 10. Each slide shows that number as balls in pairs (one
     above the other), and a caption that says whether it is even or
     odd and why. Arrows (and a click on the balls) move through the
     slides; the order wraps around. */
  var SEQ_MAX = 10;
  var seqIdx = 0;

  function seqCaptionFor(n) {
    var p = wordFor(n);
    if (n === 0) return fill(t('seqZero'), { p: p });
    if (n === 1) return fill(t('seqOne'), { p: p });
    if (isEven(n)) return fill(t('seqEven'), { n: n, p: p });
    return fill(t('seqOdd'), { n: n, p: p });
  }

  function paintSlide() {
    var display = $('#seqDisplay');
    display.innerHTML = '';
    display.classList.add('parity-carousel-balls');
    if (seqIdx === 0) {
      /* No balls: one outlined "0" stands in for the empty set, so the
         even reference is visible on the slide. */
      var zero = document.createElement('span');
      zero.className = 'parity-ball parity-zero';
      zero.textContent = '0';
      display.appendChild(zero);
    } else {
      paintDots(display, seqIdx);
    }
    display.setAttribute('aria-label', seqIdx + ': ' + seqCaptionFor(seqIdx));
    $('#seqCaption').textContent = seqCaptionFor(seqIdx);
  }

  function seqStep(delta) {
    seqIdx = (seqIdx + delta + (SEQ_MAX + 1)) % (SEQ_MAX + 1);
    paintSlide();
  }

  function renderIntroSequence() {
    paintSlide();
    $('#seqPrev').addEventListener('click', function () { seqStep(-1); });
    $('#seqNext').addEventListener('click', function () { seqStep(1); });
    var display = $('#seqDisplay');
    display.addEventListener('click', function () { seqStep(1); });
    display.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        seqStep(1);
      }
    });
  }

  /* Turns an SVG string into a node. */
  function svgFrom(markup) {
    var wrap = document.createElement('div');
    wrap.innerHTML = markup;
    return wrap.firstElementChild;
  }

  /* One wheel as SVG: a dark tyre, a coloured rim (the colour says
     whether the wheel is part of the pair or the one left alone),
     eight spokes and a hub. */
  function wheelMarkup(cx, cy, r, rim) {
    var spokes = '';
    for (var i = 0; i < 8; i += 1) {
      var a = (Math.PI * 2 * i) / 8;
      var x = cx + (r - 5) * Math.cos(a);
      var y = cy + (r - 5) * Math.sin(a);
      spokes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) +
        '" y2="' + y.toFixed(1) + '" stroke="#CFD8DC" stroke-width="1.5"/>';
    }
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#263238"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 3) + '" fill="none" stroke="' + rim + '" stroke-width="4"/>' +
      spokes +
      '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#90A4AE"/>';
  }

  /* One clover leaf: a heart with its notch outwards and its point
     towards the centre, turned by "rotation" degrees. The light vein
     makes it read as a real leaf. */
  function leafMarkup(cx, cy, rotation, fill) {
    return '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + rotation + ') scale(0.62)">' +
      '<path d="M0,-20 C-12,-38 -40,-22 -38,2 C-36,22 -14,34 0,46 C14,34 36,22 38,2 C40,-22 12,-38 0,-20 Z" fill="' + fill + '"/>' +
      '<path d="M0,-12 L0,30" stroke="#fff" stroke-opacity="0.35" stroke-width="3" stroke-linecap="round"/>' +
      '</g>';
  }

  /* Each drawing shows exactly the number its text names. Pairs are
     drawn in the pair colour; the one left alone is drawn in the
     leftover colour, so the odd example is visible at a glance. */

  /* Shoes: two shoes, one pair. */
  function shoesDrawing() {
    var box = document.createElement('div');
    box.className = 'parity-real-visual parity-real-row';
    for (var i = 0; i < 2; i += 1) {
      var shoe = document.createElement('span');
      shoe.className = 'parity-real-emoji';
      shoe.textContent = '👟';
      box.appendChild(shoe);
    }
    return box;
  }

  /* A dozen eggs in a carton: two rows of six, so each column of
     the carton is a pair of eggs. */
  function eggsDrawing() {
    var box = document.createElement('div');
    box.className = 'parity-real-visual parity-real-eggs';
    for (var i = 0; i < 12; i += 1) {
      var egg = document.createElement('span');
      egg.className = 'parity-real-emoji';
      egg.textContent = '🥚';
      box.appendChild(egg);
    }
    return box;
  }

  /* Tricycle: two back wheels (a pair) and one front wheel alone,
     in the leftover colour. Three wheels: odd. */
  function trikeDrawing() {
    var markup =
      '<svg viewBox="0 0 240 180" class="parity-real-svg" focusable="false">' +
      '<ellipse cx="120" cy="170" rx="96" ry="6" fill="#000" opacity="0.12"/>' +
      '<path d="M120 92 L58 132 M120 92 L182 132 M120 92 L120 140" stroke="#C62828" stroke-width="7" stroke-linecap="round" fill="none"/>' +
      '<line x1="58" y1="132" x2="182" y2="132" stroke="#455A64" stroke-width="6" stroke-linecap="round"/>' +
      '<line x1="120" y1="92" x2="120" y2="40" stroke="#455A64" stroke-width="6" stroke-linecap="round"/>' +
      '<line x1="98" y1="40" x2="142" y2="40" stroke="#455A64" stroke-width="6" stroke-linecap="round"/>' +
      '<rect x="104" y="78" width="32" height="11" rx="5" fill="#4E342E"/>' +
      '<path d="M109 78 L109 50 Q120 44 131 50 L131 78 Z" fill="#6D4C41"/>' +
      '<rect x="91" y="34" width="10" height="12" rx="5" fill="#212121"/>' +
      '<rect x="139" y="34" width="10" height="12" rx="5" fill="#212121"/>' +
      wheelMarkup(58, 132, 26, DATA.pairColor) +
      wheelMarkup(182, 132, 26, DATA.pairColor) +
      wheelMarkup(120, 140, 24, DATA.leftoverColor) +
      '</svg>';
    return svgFrom(markup);
  }

  /* Clover: two leaves below (a pair) and one leaf on top alone, in
     the leftover colour. Three leaves: odd. */
  function cloverDrawing() {
    var markup =
      '<svg viewBox="0 0 200 210" class="parity-real-svg" focusable="false">' +
      '<defs>' +
        '<linearGradient id="parity-leaf-green" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#7CB342"/><stop offset="1" stop-color="#2E7D32"/>' +
        '</linearGradient>' +
        '<linearGradient id="parity-leaf-odd" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#FFB74D"/><stop offset="1" stop-color="' + DATA.leftoverColor + '"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path d="M100 96 C104 140 96 170 102 204" stroke="#33691E" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      leafMarkup(70.6, 107, 240, 'url(#parity-leaf-green)') +
      leafMarkup(129.4, 107, 120, 'url(#parity-leaf-green)') +
      leafMarkup(100, 56, 0, 'url(#parity-leaf-odd)') +
      '</svg>';
    return svgFrom(markup);
  }

  function drawingFor(id) {
    if (id === 'shoes') return shoesDrawing();
    if (id === 'eggs') return eggsDrawing();
    if (id === 'trike') return trikeDrawing();
    return cloverDrawing();
  }

  function renderRealCards() {
    var list = $('#realCards');
    list.innerHTML = '';
    DATA.examples.forEach(function (id, i) {
      var card = document.createElement('article');
      card.className = 'card parity-example';

      var visual = drawingFor(id);
      visual.setAttribute('aria-hidden', 'true');

      var body = document.createElement('div');
      var title = document.createElement('h3');
      title.textContent = t('real.' + i + '.title');
      var text = document.createElement('p');
      text.textContent = t('real.' + i + '.text');
      body.appendChild(title);
      body.appendChild(text);

      card.appendChild(visual);
      card.appendChild(body);
      list.appendChild(card);
    });
  }

  /* ----------- Test: three parts, in order ----------- */
  var items = [];
  var idx = 0;

  /* Builds the test from DATA.blocks, in order: the dots first, then
     the numbers, then the big numbers. Inside each part the values
     never repeat, so no question is asked twice. Even and odd numbers
     come in any order within a part. */
  function makeRound() {
    var out = [];
    DATA.blocks.forEach(function (block) {
      var taken = {};
      for (var i = 0; i < block.count; i += 1) {
        var value;
        do { value = randomInt(block.min, block.max); } while (taken[value]);
        taken[value] = true;
        out.push({ block: block, a: value });
      }
    });
    return out;
  }

  function startRound() {
    items = makeRound();
    idx = 0;
    $('#parityRuleBox').open = false;
    goTo('game');
    renderItem();
  }

  /* ----------- Question text, visual and explanation ----------- */

  function promptFor(item) {
    return fill(t('parityPrompt'), { a: format(item.a) });
  }

  /* Only the dots part draws a picture. The number parts show the
     number in the prompt and nothing else. */
  function paintVisual(item) {
    var cont = $('#parityDots');
    cont.innerHTML = '';
    if (item.block.kind === 'dots') {
      show(cont);
      paintDots(cont, item.a);
    } else {
      hide(cont);
      cont.removeAttribute('aria-label');
    }
  }

  function explanationFor(item) {
    var n = item.a;
    if (item.block.kind === 'dots') return fill(t('explainParity'), { a: n });
    if (item.block.id === 'big') {
      return fill(t('explainLast'), { a: format(n), d: n % 10, p: wordFor(n) });
    }
    return fill(t(isEven(n) ? 'explainPairsEven' : 'explainPairsOdd'), { a: format(n) });
  }

  function renderItem() {
    var item = items[idx];
    var pct = items.length === 0 ? 0 : (idx / items.length) * 100;
    $('#parityProgressFill').style.width = pct + '%';
    $('#parityProgressText').textContent = (idx + 1) + ' / ' + items.length;
    $('#parityBlock').textContent = t('blocks.' + item.block.id + '.label');
    $('#parityPrompt').textContent = promptFor(item);
    /* The rule box follows the part the current question belongs to. */
    $('#parityRule').textContent = t('blocks.' + item.block.id + '.rule');
    paintVisual(item);

    var options = $('#parityOptions');
    options.innerHTML = '';
    var buttons = [
      { value: true,  label: t('evenLabel') },
      { value: false, label: t('oddLabel') }
    ];
    App.utils.shuffle(buttons).forEach(function (choice) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn option-btn';
      btn.textContent = choice.label;
      btn.addEventListener('click', function () { answer(item, choice.value, btn); });
      options.appendChild(btn);
    });
    $('#parityFeedback').textContent = '';
    $('#parityFeedback').className = 'feedback';
    $('#parityExplanationWrap').classList.add('hidden');
    $('#parityExplanation').textContent = '';
    hide($('#parityNext'));
  }

  function answer(item, value, button) {
    var correct = isEven(item.a) === value;
    if (!correct) {
      button.disabled = true;
      App.feedback.encourage($('#parityFeedback'));
      $('#parityFeedback').textContent += ' ' + t('blocks.' + item.block.id + '.hint');
      App.feedback.lockUntilAck($('#parityOptions').querySelectorAll('button'), $('#parityFeedback'));
      return;
    }
    progress.stars += 1;
    save();
    App.feedback.success($('#parityFeedback'));
    $('#parityOptions').querySelectorAll('button').forEach(function (b) { b.disabled = true; });
    $('#parityExplanation').textContent = explanationFor(item);
    $('#parityExplanationWrap').classList.remove('hidden');
    show($('#parityNext'));
    $('#parityNext').focus();
  }

  function next() {
    idx += 1;
    if (idx < items.length) {
      renderItem();
      return;
    }
    finishRound();
  }

  function finishRound() {
    $('#parityFinalSummary').textContent = fill(t('parityFinalSummary'), {
      count: items.length,
      stars: progress.stars
    });
    goTo('finish');
    App.feedback.celebrate(t('core.roundComplete'));
    paintStars();
  }

  /* ----------- Wiring ----------- */
  $('#parityIntroNext').addEventListener('click', function () { goTo('real'); });
  $('#parityRealNext').addEventListener('click', startRound);
  $('#parityNext').addEventListener('click', next);

  /* ----------- Boot ----------- */
  function init() {
    App.i18n.apply();
    paintStars();
    renderIntroSequence();
    renderRealCards();
    goTo('intro');
  }

  document.addEventListener('DOMContentLoaded', init);
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
