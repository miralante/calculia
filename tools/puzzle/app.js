/* ============================================================
   Calculia — Puzzle (reasoning: spatial orientation)
   Data in data.js (DATA.levels). Shared modules in assets/js/.
   Mechanic: tap a piece and then its correct spot on the board,
   looking at the model. If the spot is wrong, the piece returns
   to the tray: it is never lost or punished.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'puzzle';
  var $ = App.utils.$;

  var screenStart = $('#screenStart');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var titleImageEl = $('#titleImage');
  var modelEl = $('#model');
  var boardEl = $('#board');
  var piecesEl = $('#pieces');
  var feedbackEl = $('#feedback');
  var btnNext = $('#btnNext');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');
  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;

  /* Round state */
  var level = null;
  var images = [];
  var index = 0;
  var roundCorrect = 0;
  var placed = 0;
  var selectedPiece = null;
  var slotsEl = [];

  function save() { App.storage.set(TOOL_ID, progress); }

  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  function bank() { return DATA[App.i18n.locale()] || DATA.es; }

  /* Determina el nivel según el progress: cada ronda completada, sube un nivel. */
  function levelFromProgress() {
    var idxN = Math.min(progress.completedRounds || 0, bank().levels.length - 1);
    return bank().levels[idxN];
  }

  function startRound(n) {
    level = n;
    images = App.utils.shuffle(level.images);
    index = 0;
    roundCorrect = 0;
    screenStart.classList.add('hidden');
    screenEnd.classList.add('hidden');
    screenGame.classList.remove('hidden');
    render();
  }

  function paintProgress() {
    progressFill.style.width = ((index / images.length) * 100) + '%';
    progressText.textContent = '';
  }

  function render() {
    var image = images[index];
    selectedPiece = null;
    placed = 0;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    btnNext.classList.add('hidden');
    titleImageEl.textContent = image.name;

    var gridStyle = 'repeat(' + level.cols + ', 1fr)';
    modelEl.style.gridTemplateColumns = gridStyle;
    boardEl.style.gridTemplateColumns = gridStyle;

    modelEl.innerHTML = '';
    image.cells.forEach(function (picto) {
      var div = document.createElement('div');
      div.className = 'model-cell';
      div.textContent = picto;
      modelEl.appendChild(div);
    });

    boardEl.innerHTML = '';
    slotsEl = [];
    image.cells.forEach(function (picto, i) {
      var div = document.createElement('div');
      div.className = 'puzzle-slot';
      div.dataset.index = i;
      div.addEventListener('click', function () { placeIn(div, i); });
      boardEl.appendChild(div);
      slotsEl.push(div);
    });

    piecesEl.innerHTML = '';
    App.utils.shuffle(image.cells.map(function (picto, i) {
      return { picto: picto, correctIndex: i };
    })).forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'piece';
      btn.textContent = p.picto;
      btn.setAttribute('aria-label', App.i18n.t('pieceAria'));
      btn.addEventListener('click', function () { select(btn, p.correctIndex); });
      piecesEl.appendChild(btn);
    });

    paintProgress();
    paintStars();
  }

  function select(btn, correctIndex) {
    App.utils.$$('.piece').forEach(function (b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    selectedPiece = { btn: btn, correctIndex: correctIndex };
  }

  function placeIn(slot, index) {
    if (!selectedPiece || slot.classList.contains('filled')) return;

    if (index === selectedPiece.correctIndex) {
      slot.textContent = selectedPiece.btn.textContent;
      slot.classList.add('filled');
      selectedPiece.btn.remove();
      selectedPiece = null;
      placed += 1;
      App.feedback.success(feedbackEl);
      if (placed >= slotsEl.length) {
        endImage();
      }
    } else {
      App.utils.$$('.piece').forEach(function (b) { b.classList.remove('selected'); });
      selectedPiece = null;
      App.feedback.encourage(feedbackEl);
    }
  }

  function endImage() {
    progress.stars += 1;
    roundCorrect += 1;
    save();
    paintStars();
    btnNext.classList.remove('hidden');
    btnNext.focus();
  }

  function next() {
    index += 1;
    if (index >= images.length) {
      endRound();
    } else {
      render();
    }
  }

  function endRound() {
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    save();
    screenGame.classList.add('hidden');
    screenEnd.classList.remove('hidden');
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{stars}', progress.stars);
    }
    $('#contexto').textContent = '';
    $('#explanation').textContent = '';
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* Events */
  btnNext.addEventListener('click', next);
  $('#btnRepeat').addEventListener('click', function () { startRound(levelFromProgress()); });
  $('#btnMenu').addEventListener('click', function () {
    screenEnd.classList.add('hidden');
    screenStart.classList.remove('hidden');
  });

  paintStars();
})();

