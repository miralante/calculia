/* ============================================================
   Apptonomia — Puzzle (razonamiento: orientación espacial)
   Datos en data.js (DATA.niveles). Módulos compartidos en assets/js/.
   Mecánica: tocar una pieza y después su sitio correcto en el
   tablero, mirando el modelo. Si el sitio no es el correcto, la
   pieza vuelve a la bandeja: nunca se pierde ni se castiga.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'puzzle';
  var $ = App.utils.$;

  var pantallaInicio = $('#pantallaInicio');
  var pantallaJuego = $('#pantallaJuego');
  var pantallaFinal = $('#pantallaFinal');
  var imagenTituloEl = $('#imagenTitulo');
  var modeloEl = $('#modelo');
  var tableroEl = $('#tablero');
  var piezasEl = $('#piezas');
  var feedbackEl = $('#feedback');
  var btnSiguiente = $('#btnSiguiente');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');

  /* Persistent progress */
  var progreso = App.storage.get(TOOL_ID);
  if (typeof progreso.estrellas !== 'number') progreso.estrellas = 0;
  if (!progreso.completados) progreso.completados = {};

  /* Round state */
  var nivel = null;
  var imagenes = [];
  var idx = 0;
  var aciertosRonda = 0;
  var colocadas = 0;
  var piezaSeleccionada = null;
  var slotsEl = [];

  function guardar() { App.storage.set(TOOL_ID, progreso); }

  function pintarEstrellas() { starsEl.textContent = '⭐ ' + progreso.estrellas; }

  function banco() { return DATA[App.i18n.locale()] || DATA.es; }

  function pintarNiveles() {
    var cont = $('#niveles');
    cont.innerHTML = '';
    banco().niveles.forEach(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-nivel';
      var veces = progreso.completados[n.id] || 0;
      btn.innerHTML = n.nombre + ' — ' + n.descripcion +
        ' <span class="nivel-info">(' + App.i18n.t('veces').replace('{n}', veces) + ')</span>';
      btn.addEventListener('click', function () { iniciarRonda(n); });
      cont.appendChild(btn);
    });
  }

  function iniciarRonda(n) {
    nivel = n;
    imagenes = App.utils.shuffle(nivel.imagenes);
    idx = 0;
    aciertosRonda = 0;
    pantallaInicio.classList.add('oculto');
    pantallaFinal.classList.add('oculto');
    pantallaJuego.classList.remove('oculto');
    render();
  }

  function pintarProgreso() {
    progressFill.style.width = ((idx / imagenes.length) * 100) + '%';
    progressText.textContent = idx + ' / ' + imagenes.length;
  }

  function render() {
    var imagen = imagenes[idx];
    piezaSeleccionada = null;
    colocadas = 0;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    btnSiguiente.classList.add('oculto');
    imagenTituloEl.textContent = imagen.nombre;

    var estiloRejilla = 'repeat(' + nivel.columnas + ', 1fr)';
    modeloEl.style.gridTemplateColumns = estiloRejilla;
    tableroEl.style.gridTemplateColumns = estiloRejilla;

    modeloEl.innerHTML = '';
    imagen.celdas.forEach(function (picto) {
      var div = document.createElement('div');
      div.className = 'celda-modelo';
      div.textContent = picto;
      modeloEl.appendChild(div);
    });

    tableroEl.innerHTML = '';
    slotsEl = [];
    imagen.celdas.forEach(function (picto, i) {
      var div = document.createElement('div');
      div.className = 'slot-puzzle';
      div.dataset.index = i;
      div.addEventListener('click', function () { colocarEn(div, i); });
      tableroEl.appendChild(div);
      slotsEl.push(div);
    });

    piezasEl.innerHTML = '';
    App.utils.shuffle(imagen.celdas.map(function (picto, i) {
      return { picto: picto, correctIndex: i };
    })).forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pieza';
      btn.textContent = p.picto;
      btn.setAttribute('aria-label', App.i18n.t('piezaAria'));
      btn.addEventListener('click', function () { seleccionar(btn, p.correctIndex); });
      piezasEl.appendChild(btn);
    });

    pintarProgreso();
    pintarEstrellas();
  }

  function seleccionar(btn, correctIndex) {
    App.utils.$$('.pieza').forEach(function (b) { b.classList.remove('seleccionada'); });
    btn.classList.add('seleccionada');
    piezaSeleccionada = { btn: btn, correctIndex: correctIndex };
  }

  function colocarEn(slot, index) {
    if (!piezaSeleccionada || slot.classList.contains('llena')) return;

    if (index === piezaSeleccionada.correctIndex) {
      slot.textContent = piezaSeleccionada.btn.textContent;
      slot.classList.add('llena');
      piezaSeleccionada.btn.remove();
      piezaSeleccionada = null;
      colocadas += 1;
      App.feedback.success(feedbackEl);
      if (colocadas >= slotsEl.length) {
        terminarImagen();
      }
    } else {
      App.utils.$$('.pieza').forEach(function (b) { b.classList.remove('seleccionada'); });
      piezaSeleccionada = null;
      App.feedback.encourage(feedbackEl);
    }
  }

  function terminarImagen() {
    progreso.estrellas += 1;
    aciertosRonda += 1;
    guardar();
    pintarEstrellas();
    btnSiguiente.classList.remove('oculto');
    btnSiguiente.focus();
  }

  function siguiente() {
    idx += 1;
    App.tts.stop();
    if (idx >= imagenes.length) {
      terminarRonda();
    } else {
      render();
    }
  }

  function terminarRonda() {
    progreso.completados[nivel.id] = (progreso.completados[nivel.id] || 0) + 1;
    guardar();
    pantallaJuego.classList.add('oculto');
    pantallaFinal.classList.remove('oculto');
    $('#resumenFinal').textContent = App.i18n.t('resumenFinal')
      .replace('{n}', aciertosRonda).replace('{total}', progreso.estrellas);
$('#transferencia').textContent = App.i18n.t('transferencia');
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* Events */
  btnSiguiente.addEventListener('click', siguiente);
  $('#btnRepetir').addEventListener('click', function () { iniciarRonda(nivel); });
  $('#btnOtroNivel').addEventListener('click', function () {
    pantallaFinal.classList.add('oculto');
    pintarNiveles();
    pantallaInicio.classList.remove('oculto');
  });

  pintarNiveles();
  pintarEstrellas();
})();

