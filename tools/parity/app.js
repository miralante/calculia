/* ============================================================
   Calculia — Pares e impares: app.

   Fases, en el orden de la anatomía de Calculia (SPEC §3.6 y
   §3.8): primero se explica (qué es par y qué es impar), luego
   se muestra en la vida real, después se elige nivel y se
   practica. Cada respuesta correcta publica su explicación; cada
   fallo publica una pista que no revela la respuesta.

   Los niveles van de lo visible a lo abstracto: puntos, número
   escrito, última cifra, lados de una forma y número romano. La
   regla es la misma en todos: par si se puede repartir en
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
  if (!progress.done || typeof progress.done !== 'object') progress.done = {};

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
    levels: $('#screenParityLevels'),
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

  /* ----------- Explanation stage: intro demo and real examples ----------- */

  /* Paints a column of dots: every two dots of one colour sit in a
     row, the leftover dot (if any) sits alone in the second colour.
     The pairing shape IS the visible answer. Returns nothing; sets
     an aria-label on the container that says the same thing aloud. */
  function paintDots(cont, n) {
    cont.innerHTML = '';
    var pairs = Math.floor(n / 2);
    var leftover = n % 2;
    for (var i = 0; i < pairs; i += 1) {
      var pairRow = document.createElement('div');
      pairRow.className = 'parity-pair-row';
      for (var j = 0; j < 2; j += 1) {
        var dot = document.createElement('span');
        dot.className = 'parity-dot parity-pair';
        dot.style.backgroundColor = DATA.pairColor;
        pairRow.appendChild(dot);
      }
      cont.appendChild(pairRow);
    }
    if (leftover) {
      var singleRow = document.createElement('div');
      singleRow.className = 'parity-pair-row';
      var d = document.createElement('span');
      d.className = 'parity-dot parity-leftover';
      d.style.backgroundColor = DATA.leftoverColor;
      singleRow.appendChild(d);
      cont.appendChild(singleRow);
    }
    var label = pairs + ' ' + t('pairsWord');
    if (leftover) label += ', ' + t('oneLeftWord');
    cont.setAttribute('aria-label', label);
  }

  function renderIntroDemo() {
    paintDots($('#introDemoEven'), 4);
    paintDots($('#introDemoOdd'), 5);
  }

  function renderRealCards() {
    var list = $('#realCards');
    list.innerHTML = '';
    DATA.examples.forEach(function (icon, i) {
      var card = document.createElement('article');
      card.className = 'card parity-example';

      var iconEl = document.createElement('span');
      iconEl.className = 'parity-example-icon';
      iconEl.setAttribute('aria-hidden', 'true');
      iconEl.textContent = icon;

      var body = document.createElement('div');
      var title = document.createElement('h3');
      title.textContent = t('real.' + i + '.title');
      var text = document.createElement('p');
      text.textContent = t('real.' + i + '.text');
      body.appendChild(title);
      body.appendChild(text);

      card.appendChild(iconEl);
      card.appendChild(body);
      list.appendChild(card);
    });
  }

  /* ----------- Level selection ----------- */
  function renderLevels() {
    var list = $('#parityLevelList');
    list.innerHTML = '';
    DATA.levels.forEach(function (level, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn level-btn';

      var name = document.createElement('span');
      name.className = 'level-name';
      name.textContent = (i + 1) + '. ' + t('levels.' + level.id + '.name');

      var detail = document.createElement('span');
      detail.className = 'level-detail';
      detail.textContent = t('levels.' + level.id + '.detail');

      btn.appendChild(name);
      btn.appendChild(detail);
      if (progress.done[level.id]) {
        var done = document.createElement('span');
        done.className = 'level-done';
        done.textContent = t('levelDone');
        btn.appendChild(done);
      }
      btn.addEventListener('click', function () { startRound(level); });
      list.appendChild(btn);
    });
  }

  /* ----------- Round state ----------- */
  var currentLevel = null;
  var items = [];
  var idx = 0;

  /* Numbers are drawn at random from the level's range, without
     repeats inside a round. Even and odd numbers come in any order,
     so a round can have several of the same kind in a row and the
     user cannot predict the next one. A range smaller than perRound
     (the shapes level) gives one question per value instead. */
  function makeRound(level) {
    var out = [];
    var used = {};
    var span = level.max - level.min + 1;
    var count = Math.min(level.perRound, span);
    while (out.length < count) {
      var candidate = randomInt(level.min, level.max);
      if (used[candidate]) continue;
      used[candidate] = true;
      out.push({ a: candidate });
    }
    return out;
  }

  function startRound(level) {
    currentLevel = level;
    items = makeRound(level);
    idx = 0;
    $('#parityRule').textContent = t('levels.' + level.id + '.rule');
    $('#parityRuleBox').open = false;
    goTo('game');
    renderItem();
  }

  /* ----------- Question text, visual and explanation ----------- */

  function promptFor(level, item) {
    if (level.kind === 'shape') return t('shapePrompt');
    var shown = level.kind === 'roman' ? toRoman(item.a) : format(item.a);
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

  /* Only the dots and shapes levels draw a picture. The number
     levels show the number in the prompt and nothing else. */
  function paintVisual(level, item) {
    var cont = $('#parityDots');
    cont.innerHTML = '';
    if (level.kind === 'dots') {
      show(cont);
      paintDots(cont, item.a);
    } else if (level.kind === 'shape') {
      show(cont);
      cont.appendChild(shapeSvg(item.a));
      cont.setAttribute('aria-label', t('shapeAria'));
    } else {
      hide(cont);
      cont.removeAttribute('aria-label');
    }
  }

  function explanationFor(level, item) {
    var n = item.a;
    var p = wordFor(n);
    if (level.kind === 'dots') return fill(t('explainParity'), { a: n });
    if (level.kind === 'shape') {
      return fill(t('explainShape'), { name: t('shapeName.' + n), n: n, p: p });
    }
    if (level.kind === 'roman') {
      return fill(t('explainRoman'), { roman: toRoman(n), n: n, p: p });
    }
    if (level.id === 'big') {
      return fill(t('explainLast'), { a: format(n), d: n % 10, p: p });
    }
    return fill(t(isEven(n) ? 'explainPairsEven' : 'explainPairsOdd'), { a: format(n) });
  }

  function renderItem() {
    var item = items[idx];
    var pct = items.length === 0 ? 0 : (idx / items.length) * 100;
    $('#parityProgressFill').style.width = pct + '%';
    $('#parityProgressText').textContent = (idx + 1) + ' / ' + items.length;
    $('#parityPrompt').textContent = promptFor(currentLevel, item);
    paintVisual(currentLevel, item);

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
      $('#parityFeedback').textContent += ' ' + t('levels.' + currentLevel.id + '.hint');
      App.feedback.lockUntilAck($('#parityOptions').querySelectorAll('button'), $('#parityFeedback'));
      return;
    }
    progress.stars += 1;
    save();
    App.feedback.success($('#parityFeedback'));
    $('#parityOptions').querySelectorAll('button').forEach(function (b) { b.disabled = true; });
    $('#parityExplanation').textContent = explanationFor(currentLevel, item);
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
    progress.done[currentLevel.id] = true;
    save();
    $('#parityFinalSummary').textContent = fill(t('parityFinalSummary'), {
      level: t('levels.' + currentLevel.id + '.name'),
      count: items.length,
      stars: progress.stars
    });
    goTo('finish');
    App.feedback.celebrate(t('core.roundComplete'));
    paintStars();
  }

  /* ----------- Wiring ----------- */
  $('#parityIntroNext').addEventListener('click', function () { goTo('real'); });
  $('#parityRealNext').addEventListener('click', function () { renderLevels(); goTo('levels'); });
  $('#parityLevelsBack').addEventListener('click', function () { goTo('real'); });
  $('#parityBack').addEventListener('click', function () { renderLevels(); goTo('levels'); });
  $('#parityNext').addEventListener('click', next);

  /* ----------- Boot ----------- */
  function init() {
    App.i18n.apply();
    paintStars();
    renderIntroDemo();
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
