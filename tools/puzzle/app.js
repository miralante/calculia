/* ============================================================
   Calculia — Puzzle (reasoning: spatial orientation)
   Data in data.js (DATA.niveles). Shared modules in assets/js/.
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

  function paintLevels() {
    var cont = $('#levels');
    cont.innerHTML = '';
    bank().niveles.forEach(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-nivel';
      btn.innerHTML = n.descripcion;
      btn.addEventListener('click', function () { startRound(n); });
      cont.appendChild(btn);
    });
  }

  function startRound(n) {
    level = n;
    images = App.utils.shuffle(level.imagenes);
    index = 0;
    roundCorrect = 0;
    screenStart.classList.add('oculto');
    screenEnd.classList.add('oculto');
    screenGame.classList.remove('oculto');
    render();
  }

  function paintProgress() {
    progressFill.style.width = ((index / images.length) * 100) + '%';
    progressText.textContent = index + ' / ' + images.length;
  }

  function render() {
    var image = images[index];
    selectedPiece = null;
    placed = 0;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    btnNext.classList.add('oculto');
    titleImageEl.textContent = image.nombre;

    var gridStyle = 'repeat(' + level.columnas + ', 1fr)';
    modelEl.style.gridTemplateColumns = gridStyle;
    boardEl.style.gridTemplateColumns = gridStyle;

    modelEl.innerHTML = '';
    image.celdas.forEach(function (picto) {
      var div = document.createElement('div');
      div.className = 'celda-modelo';
      div.textContent = picto;
      modelEl.appendChild(div);
    });

    boardEl.innerHTML = '';
    slotsEl = [];
    image.celdas.forEach(function (picto, i) {
      var div = document.createElement('div');
      div.className = 'slot-puzzle';
      div.dataset.index = i;
      div.addEventListener('click', function () { placeIn(div, i); });
      boardEl.appendChild(div);
      slotsEl.push(div);
    });

    piecesEl.innerHTML = '';
    App.utils.shuffle(image.celdas.map(function (picto, i) {
      return { picto: picto, correctIndex: i };
    })).forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pieza';
      btn.textContent = p.picto;
      btn.setAttribute('aria-label', App.i18n.t('piezaAria'));
      btn.addEventListener('click', function () { select(btn, p.correctIndex); });
      piecesEl.appendChild(btn);
    });

    paintProgress();
    paintStars();
  }

  function select(btn, correctIndex) {
    App.utils.$$('.pieza').forEach(function (b) { b.classList.remove('seleccionada'); });
    btn.classList.add('seleccionada');
    selectedPiece = { btn: btn, correctIndex: correctIndex };
  }

  function placeIn(slot, index) {
    if (!selectedPiece || slot.classList.contains('llena')) return;

    if (index === selectedPiece.correctIndex) {
      slot.textContent = selectedPiece.btn.textContent;
      slot.classList.add('llena');
      selectedPiece.btn.remove();
      selectedPiece = null;
      placed += 1;
      App.feedback.success(feedbackEl);
      if (placed >= slotsEl.length) {
        endImage();
      }
    } else {
      App.utils.$$('.pieza').forEach(function (b) { b.classList.remove('seleccionada'); });
      selectedPiece = null;
      App.feedback.encourage(feedbackEl);
    }
  }

  function endImage() {
    progress.stars += 1;
    roundCorrect += 1;
    save();
    paintStars();
    btnNext.classList.remove('oculto');
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
    save();
    screenGame.classList.add('oculto');
    screenEnd.classList.remove('oculto');
    $('#endSummary').textContent = App.i18n.t('resumenFinal')
      .replace('{n}', roundCorrect).replace('{total}', progress.stars);
$('#transfer').textContent = App.i18n.t('transferencia');
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* Events */
  btnNext.addEventListener('click', next);
  $('#btnRepeat').addEventListener('click', function () { startRound(level); });
  $('#btnOtherLevel').addEventListener('click', function () {
    screenEnd.classList.add('oculto');
    paintLevels();
    screenStart.classList.remove('oculto');
  });

  paintLevels();
  paintStars();
})();

