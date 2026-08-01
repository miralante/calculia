/* ============================================================
   Apptonomia — Historias (razonamiento: ordenar en el tiempo)
   Datos en data.js (DATA.niveles). Módulos compartidos en assets/js/.
   Mecánica: tocar las viñetas en el orden correcto. Un toque fuera
   de orden no penaliza: solo anima a seguir intentando.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'historias';
  var $ = App.utils.$;

  var pantallaInicio = $('#pantallaInicio');
  var pantallaJuego = $('#pantallaJuego');
  var pantallaFinal = $('#pantallaFinal');
  var historiaTituloEl = $('#historiaTitulo');
  var secuenciaEl = $('#secuencia');
  var disponiblesEl = $('#disponibles');
  var feedbackEl = $('#feedback');
  var explicacionWrap = $('#explicacionWrap');
  var explicacionEl = $('#explicacion');
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
  var historias = [];
  var idx = 0;
  var aciertosRonda = 0;
  var siguienteEsperado = 0;
  var slots = [];
  var intentos = 0;   /* Socratic counter per story (rule 12) */

  function guardar() { App.storage.set(TOOL_ID, progreso); }

  function pintarEstrellas() { starsEl.textContent = '⭐ ' + progreso.estrellas; }

  function pintarNiveles() {
    var cont = $('#niveles');
    cont.innerHTML = '';
    DATA.niveles.forEach(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-nivel';
      var veces = progreso.completados[n.id] || 0;
      var nombreNivel = App.i18n.t('nivelNombre').replace('{n}', n.id);
      var descripcionNivel = App.i18n.t('nivelDescripcion').replace('{n}', n.historias[0].vinetas.length);
      var vecesTxt = App.i18n.t('veces').replace('{n}', veces);
      btn.innerHTML = nombreNivel + ' — ' + descripcionNivel +
        ' <span class="nivel-info">(' + vecesTxt + ')</span>';
      btn.addEventListener('click', function () { iniciarRonda(n); });
      cont.appendChild(btn);
    });
  }

  function iniciarRonda(n) {
    nivel = n;
    historias = App.utils.shuffle(nivel.historias).slice(0, DATA.porRonda);
    idx = 0;
    aciertosRonda = 0;
    pantallaInicio.classList.add('oculto');
    pantallaFinal.classList.add('oculto');
    pantallaJuego.classList.remove('oculto');
    render();
  }

  function pintarProgreso() {
    progressFill.style.width = ((idx / DATA.porRonda) * 100) + '%';
    progressText.textContent = idx + ' / ' + DATA.porRonda;
  }

  function render() {
    var historia = historias[idx];
    siguienteEsperado = 0;
    intentos = 0;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explicacionWrap.classList.add('oculto');
    explicacionEl.textContent = '';
    feedbackEl.className = 'feedback';
    btnSiguiente.classList.add('oculto');
    historiaTituloEl.textContent = App.i18n.t('historia.' + historia.id);

    pintarSlots();

    disponiblesEl.innerHTML = '';
    App.utils.shuffle(historia.vinetas.map(function (picto, orden) {
      return { picto: picto, orden: orden };
    })).forEach(function (v) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn vineta';
      btn.textContent = v.picto;
      btn.setAttribute('aria-label', App.i18n.t('vinetaAria'));
      btn.addEventListener('click', function () { tocar(v.orden, btn); });
      disponiblesEl.appendChild(btn);
    });

    pintarProgreso();
    pintarEstrellas();
  }

  function pintarSlots() {
    secuenciaEl.innerHTML = '';
    slots.forEach(function (picto) {
      var div = document.createElement('div');
      div.className = 'slot' + (picto ? ' lleno' : '');
      div.textContent = picto || '';
      secuenciaEl.appendChild(div);
    });
  }

  function tocar(orden, btn) {
    var historia = historias[idx];
    if (orden === siguienteEsperado) {
      slots[orden] = historia.vinetas[orden];
      pintarSlots();
      btn.disabled = true;
      btn.classList.add('colocada');
      App.feedback.success(feedbackEl);
      siguienteEsperado += 1;
      if (siguienteEsperado >= historia.vinetas.length) {
        terminarHistoria();
      }
    } else {
      intentos += 1;
      if (intentos === 1) {
        mostrarPista();
      } else {
        mostrarExplicacion();
      }
      btn.disabled = true;
      btn.classList.add('animo');
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('.vineta', disponiblesEl), explicacionWrap);
    }
  }

  /* Socratic method (rule 12). First mistake → hint (no answer);
     second mistake → explanation with the correct beginning. */
  function mostrarPista() {
    explicacionEl.textContent = App.i18n.t('pista');
    explicacionWrap.classList.remove('oculto');
  }

  function mostrarExplicacion() {
    explicacionEl.textContent = App.i18n.t('explicacion');
    explicacionWrap.classList.remove('oculto');
  }

  function terminarHistoria() {
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
    if (idx >= DATA.porRonda) {
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
      .replace('{n}', aciertosRonda)
      .replace('{estrellas}', progreso.estrellas);
$('#transferencia').textContent = App.i18n.t('transferencia');
    App.feedback.celebrate(App.i18n.t('finalTitulo'));
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

