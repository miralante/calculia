/* ============================================================
   Calculia — Pares e impares: app.

   Fases, en el orden de la anatomía de Calculia (SPEC §3.6 y
   §3.8): primero se explica (qué es par y qué es impar, con los
   números del 0 al 10), luego se muestra en la vida real, y por
   último un único test, "Empezar a practicar", igual que en
   Formas. El test mezcla los cinco tipos de pregunta: puntos,
   número escrito, última cifra, lados de una forma y número
   romano. Cada respuesta correcta publica su explicación; cada
   fallo publica una pista que no revela la respuesta.

   La regla es la misma en todos: par si se puede repartir en
   parejas sin que sobre nada; impar si sobra uno.

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

  var ROMAN = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  function toRoman(n) {
    var out = '';
    ROMAN.forEach(function (pair) {
      while (n >= pair[0]) { out += pair[1]; n -= pair[0]; }
    });
    return out;
  }

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

  /* ----------- Explanation stage: intro sequence and real examples ----------- */

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

  /* The explanation stage: 0 to 10, one row per number, each with
     its balls in pairs and its parity word. Reading down the list
     shows the pattern: pairs of balls, and the odd number leaves
     one ball alone. */
  function renderIntroSequence() {
    var list = $('#introSeq');
    list.innerHTML = '';
    for (var n = 0; n <= 10; n += 1) {
      var row = document.createElement('div');
      row.className = 'parity-seq-row';

      var num = document.createElement('span');
      num.className = 'parity-seq-num';
      num.textContent = String(n);

      var balls = document.createElement('div');
      balls.className = 'parity-seq-balls';
      balls.setAttribute('role', 'img');
      paintDots(balls, n);

      var tag = document.createElement('span');
      tag.className = 'parity-seq-tag';
      tag.textContent = t(n % 2 === 0 ? 'evenLabel' : 'oddLabel');

      row.appendChild(num);
      row.appendChild(balls);
      row.appendChild(tag);
      list.appendChild(row);
    }
  }

  /* SVG helper for the real-life drawings. */
  function svgNode(name, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.keys(attrs).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    return el;
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
    var svg = svgNode('svg', { viewBox: '0 0 180 120', class: 'parity-real-svg', focusable: 'false' });
    svg.appendChild(svgNode('line', { x1: 40, y1: 92, x2: 140, y2: 92, stroke: 'currentColor', 'stroke-width': 4 }));
    svg.appendChild(svgNode('path', { d: 'M 90 56 L 40 92 M 90 56 L 140 92', stroke: 'currentColor', 'stroke-width': 4, fill: 'none' }));
    svg.appendChild(svgNode('rect', { x: 78, y: 46, width: 24, height: 9, rx: 3, fill: 'currentColor' }));
    svg.appendChild(svgNode('line', { x1: 90, y1: 22, x2: 90, y2: 46, stroke: 'currentColor', 'stroke-width': 4 }));
    svg.appendChild(svgNode('circle', { cx: 40, cy: 92, r: 20, fill: DATA.pairColor }));
    svg.appendChild(svgNode('circle', { cx: 140, cy: 92, r: 20, fill: DATA.pairColor }));
    svg.appendChild(svgNode('circle', { cx: 90, cy: 92, r: 18, fill: DATA.leftoverColor }));
    [[40, 92], [140, 92], [90, 92]].forEach(function (c) {
      svg.appendChild(svgNode('circle', { cx: c[0], cy: c[1], r: 5, fill: '#fff' }));
    });
    return svg;
  }

  /* Clover: two leaves below (a pair) and one leaf on top alone, in
     the leftover colour. Three leaves: odd. */
  function cloverDrawing() {
    var svg = svgNode('svg', { viewBox: '0 0 160 170', class: 'parity-real-svg', focusable: 'false' });
    svg.appendChild(svgNode('line', { x1: 80, y1: 118, x2: 80, y2: 166, stroke: 'currentColor', 'stroke-width': 5 }));
    svg.appendChild(svgNode('circle', { cx: 56, cy: 100, r: 30, fill: DATA.pairColor }));
    svg.appendChild(svgNode('circle', { cx: 104, cy: 100, r: 30, fill: DATA.pairColor }));
    svg.appendChild(svgNode('circle', { cx: 80, cy: 46, r: 30, fill: DATA.leftoverColor }));
    return svg;
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

  /* ----------- Round state ----------- */
  var items = [];
  var idx = 0;

  /* One test for the whole round, like Formas. Each question picks a
     kind at random (dots, number, big number, shape or Roman numeral)
     and a value of that kind. Values never repeat within the same
     kind, so the round does not ask the same question twice. Even and
     odd numbers come in any order. */
  function makeRound() {
    var out = [];
    var used = {};
    while (out.length < DATA.perRound) {
      var level = DATA.levels[randomInt(0, DATA.levels.length - 1)];
      var taken = used[level.id] || (used[level.id] = {});
      var span = level.max - level.min + 1;
      if (Object.keys(taken).length >= span) continue;
      var value;
      do { value = randomInt(level.min, level.max); } while (taken[value]);
      taken[value] = true;
      out.push({ level: level, a: value });
    }
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
    if (item.level.kind === 'shape') return t('shapePrompt');
    var shown = item.level.kind === 'roman' ? toRoman(item.a) : format(item.a);
    return fill(t('parityPrompt'), { a: shown });
  }

  /* A regular polygon with n sides, drawn as an SVG. Each corner
     is a dot so the sides are easy to count one by one. */
  function shapeSvg(n) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 160 160');
    svg.setAttribute('class', 'parity-shape');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('aria-hidden', 'true');

    var corners = [];
    for (var i = 0; i < n; i += 1) {
      var angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      corners.push({
        x: 80 + 64 * Math.cos(angle),
        y: 80 + 64 * Math.sin(angle)
      });
    }

    var body = document.createElementNS(NS, 'polygon');
    body.setAttribute('points', corners.map(function (c) {
      return c.x.toFixed(1) + ',' + c.y.toFixed(1);
    }).join(' '));
    body.setAttribute('class', 'parity-shape-body');
    svg.appendChild(body);

    corners.forEach(function (c) {
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', c.x.toFixed(1));
      dot.setAttribute('cy', c.y.toFixed(1));
      dot.setAttribute('r', '6');
      dot.setAttribute('class', 'parity-shape-corner');
      svg.appendChild(dot);
    });
    return svg;
  }

  /* Only the dots and shapes questions draw a picture. The number
     questions show the number in the prompt and nothing else. */
  function paintVisual(item) {
    var cont = $('#parityDots');
    cont.innerHTML = '';
    if (item.level.kind === 'dots') {
      show(cont);
      paintDots(cont, item.a);
    } else if (item.level.kind === 'shape') {
      show(cont);
      cont.appendChild(shapeSvg(item.a));
      cont.setAttribute('aria-label', t('shapeAria'));
    } else {
      hide(cont);
      cont.removeAttribute('aria-label');
    }
  }

  function explanationFor(item) {
    var n = item.a;
    var p = wordFor(n);
    if (item.level.kind === 'dots') return fill(t('explainParity'), { a: n });
    if (item.level.kind === 'shape') {
      return fill(t('explainShape'), { name: t('shapeName.' + n), n: n, p: p });
    }
    if (item.level.kind === 'roman') {
      return fill(t('explainRoman'), { roman: toRoman(n), n: n, p: p });
    }
    if (item.level.id === 'big') {
      return fill(t('explainLast'), { a: format(n), d: n % 10, p: p });
    }
    return fill(t(isEven(n) ? 'explainPairsEven' : 'explainPairsOdd'), { a: format(n) });
  }

  function renderItem() {
    var item = items[idx];
    var pct = items.length === 0 ? 0 : (idx / items.length) * 100;
    $('#parityProgressFill').style.width = pct + '%';
    $('#parityProgressText').textContent = (idx + 1) + ' / ' + items.length;
    $('#parityPrompt').textContent = promptFor(item);
    /* The rule box follows the kind of the current question. */
    $('#parityRule').textContent = t('levels.' + item.level.id + '.rule');
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
      $('#parityFeedback').textContent += ' ' + t('levels.' + item.level.id + '.hint');
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
