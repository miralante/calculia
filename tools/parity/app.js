/* ============================================================
   Calculia — Pares e impares: app.

   Una mecánica. Una pantalla. La respuesta es la imagen:
   cada par en un color, y el posible punto sobrante en otro.
   El usuario mira los puntos y elige Par / Impar; la duda se
   resuelve en un vistazo si están bien coloreados, y ese es
   exactamente el punto: la paridad se ve, no se calcula.

   Antes este bloque vivía dentro de Cantidades (tools/quantities/
   app.js). En 2026-10 salió a su propia herramienta al nivel
   superior de la suite.

   Bandera del módulo: mod-racional (el "razonamiento" del
   agrupamiento). El punto sobrante usa color-foco-suave como
   halo: el orphan dot se lee como el singular.
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

  /* ----------- Elements ----------- */
  var gameScreen = $('#screenParity');
  var finishScreen = $('#screenParityFinish');
  var starsEl = $('#stars');

  function paintStars() {
    starsEl.textContent = '⭐ ' + progress.stars;
  }

  function randomInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  /* ----------- Round state ----------- */
  var items = [];
  var idx = 0;

  /* Mix of evens and odds, alternating roughly, so the user
     cannot reach for "always Par" by accident. */
  function makeRound() {
    var out = [];
    var max = DATA.max;
    var limit = DATA.perRound;
    while (out.length < limit) {
      var candidate = randomInt(0, max);
      var isEven = candidate % 2 === 0;
      /* Accept unless the last two picks were the same parity —
         that keeps a fair balance without preventing any
         reasonable distribution. */
      if (out.length >= 2 &&
          isEven === (out[out.length - 1].a % 2 === 0) &&
          isEven === (out[out.length - 2].a % 2 === 0)) {
        continue;
      }
      out.push({ a: candidate });
    }
    return App.utils.shuffle(out);
  }

  function startRound() {
    items = makeRound();
    idx = 0;
    show(gameScreen);
    hide(finishScreen);
    renderItem();
  }

  /* Render the dots row(s): every two dots of the same colour go
     in one row, the leftover dot (if any) goes in its own row
     in the "leftover" colour. The pairing shape IS the visible
     answer. */
  function paintDots(item) {
    var cont = $('#parityDots');
    cont.innerHTML = '';
    var pairs = Math.floor(item.a / 2);
    var leftover = item.a % 2;
    for (var i = 0; i < pairs; i += 1) {
      var pairRow = document.createElement('div');
      pairRow.className = 'parity-pair-row';
      var d1 = document.createElement('span');
      d1.className = 'parity-dot parity-pair';
      d1.style.backgroundColor = DATA.pairColor;
      var d2 = document.createElement('span');
      d2.className = 'parity-dot parity-pair';
      d2.style.backgroundColor = DATA.pairColor;
      pairRow.appendChild(d1);
      pairRow.appendChild(d2);
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
    /* aria-label describes the picture aloud; the prompt below
       already says the number, so the dots line is purely visual. */
    var s = pairs + ' ' + t('pairsWord');
    if (leftover) s += ', ' + t('oneLeftWord');
    cont.setAttribute('aria-label', s);
  }

  function renderItem() {
    var item = items[idx];
    var pct = items.length === 0 ? 0 : (idx / items.length) * 100;
    $('#parityProgressFill').style.width = pct + '%';
    $('#parityProgressText').textContent = (idx + 1) + ' / ' + items.length;
    /* Prompt: "5 es par o impar" — the number is spoken, the
       dots give the answer visually. */
    $('#parityPrompt').textContent = t('parityPrompt').replace('{a}', item.a);
    paintDots(item);
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
    var correct = item.a % 2 === 0;
    if (value !== correct) {
      button.disabled = true;
      App.feedback.encourage($('#parityFeedback'));
      $('#parityFeedback').textContent += ' ' + t('hintParity');
      App.feedback.lockUntilAck($('#parityOptions').querySelectorAll('button'), $('#parityFeedback'));
      return;
    }
    progress.stars += 1;
    save();
    App.feedback.success($('#parityFeedback'));
    $('#parityOptions').querySelectorAll('button').forEach(function (b) { b.disabled = true; });
    $('#parityExplanation').textContent = t('explainParity').replace('{a}', item.a);
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
    var rounds = items.length;
    $('#parityFinalSummary').textContent = t('parityFinalSummary')
      .replace('{count}', rounds)
      .replace('{stars}', progress.stars);
    hide(gameScreen);
    show(finishScreen);
    App.feedback.celebrate(t('core.roundComplete'));
    paintStars();
  }

  /* ----------- Wiring ----------- */
  $('#parityBack').addEventListener('click', function () { window.location.href = '../../'; });
  $('#parityNext').addEventListener('click', next);

  /* ----------- Boot ----------- */
  function init() {
    App.i18n.apply();
    paintStars();
    startRound();
  }

  document.addEventListener('DOMContentLoaded', init);
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
