/* ============================================================
   Apptonomia — Adivinanzas (lógica)
   Datos en data.js (const DATA). Módulos compartidos en assets/js/.
   Mecánica: ronda de 10 preguntas con opción múltiple.
   El error nunca se castiga: se anima a reintentar.
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    toolId: 'adivinanzas',
    porRonda: 10
  };

  var $ = App.utils.$;

  /* Elementos */
  var textoEl = $('#textoPregunta');
  var opcionesEl = $('#opciones');
  var feedbackEl = $('#feedback');
  var explicacionWrap = $('#explicacionWrap');
  var explicacionEl = $('#explicacion');
  var btnEscuchar = $('#btnEscuchar');
  var btnSiguiente = $('#btnSiguiente');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');
  var pantallaJuego = $('#pantallaJuego');
  var pantallaFinal = $('#pantallaFinal');
  var resumenFinal = $('#resumenFinal');

  /* Progreso persistente (se conserva al cerrar el navegador) */
  var progreso = App.storage.get(CONFIG.toolId);
  if (typeof progreso.estrellas !== 'number') progreso.estrellas = 0;
  if (typeof progreso.rondas !== 'number') progreso.rondas = 0;

  /* Current round state */
  var items = [];
  var idx = 0;
  var aciertosRonda = 0;
  var resuelto = false;
  var intentos = 0;

  function guardar() {
    App.storage.set(CONFIG.toolId, progreso);
  }

  function pintarEstrellas() {
    starsEl.textContent = '⭐ ' + progreso.estrellas;
  }

  function pintarProgreso() {
    progressFill.style.width = ((idx / CONFIG.porRonda) * 100) + '%';
    progressText.textContent = idx + ' / ' + CONFIG.porRonda;
  }

  function iniciarRonda() {
    var banco = DATA[App.i18n.locale()] || DATA.es;
    items = App.utils.shuffle(banco).slice(0, CONFIG.porRonda);
    idx = 0;
    aciertosRonda = 0;
    pantallaFinal.classList.add('oculto');
    pantallaJuego.classList.remove('oculto');
    render();
  }

  function render() {
    var item = items[idx];
    resuelto = false;
    intentos = 0;
    textoEl.textContent = item.text;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explicacionWrap.classList.add('oculto');
    explicacionEl.textContent = '';
    btnSiguiente.classList.add('oculto');
    opcionesEl.innerHTML = '';

    var opciones = App.utils.shuffle(item.options.map(function (opt, i) {
      return { texto: opt, esCorrecta: i === item.correct };
    }));

    opciones.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-opcion';
      btn.textContent = op.texto;
      btn.addEventListener('click', function () {
        responder(btn, op.texto, op.esCorrecta, item);
      });
      opcionesEl.appendChild(btn);
    });

    pintarProgreso();
    pintarEstrellas();
  }

  function mostrarExplicacion(opcionTexto, esCorrecta, item) {
    var texto = esCorrecta
      ? App.i18n.t('explicacionCorrecta') + item.answer + '.'
      : App.i18n.t('explicacionIncorrectaA') + opcionTexto +
        App.i18n.t('explicacionIncorrectaB') + item.answer + '.';
    explicacionEl.textContent = texto;
    explicacionWrap.classList.remove('oculto');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is pointed back to the hint already on screen. Only
     on the second mistake is the correct answer explained
     (mostrarExplicacion). */
  function mostrarPista(item) {
    explicacionEl.textContent = App.i18n.t('pista') + '"' + item.text + '"';
    explicacionWrap.classList.remove('oculto');
  }

  function responder(btn, opcionTexto, esCorrecta, item) {
    if (resuelto) return;
    if (esCorrecta) {
      mostrarExplicacion(opcionTexto, esCorrecta, item);
      resuelto = true;
      btn.classList.add('correcta');
      App.utils.$$('#opciones .btn-opcion').forEach(function (b) {
        b.disabled = true;
      });
      App.feedback.success(feedbackEl);
      progreso.estrellas += 1;
      aciertosRonda += 1;
      guardar();
      pintarEstrellas();
      btnSiguiente.classList.remove('oculto');
      btnSiguiente.focus();
    } else {
      /* Encouragement, never punishment: can try again */
      intentos += 1;
      if (intentos === 1) {
        mostrarPista(item);
      } else {
        mostrarExplicacion(opcionTexto, esCorrecta, item);
      }
      btn.classList.add('animo');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#opciones .btn-opcion'), explicacionWrap);
    }
  }

  function siguiente() {
    idx += 1;
    App.tts.stop();
    if (idx >= CONFIG.porRonda) {
      terminarRonda();
    } else {
      render();
    }
  }

  function terminarRonda() {
    progreso.rondas += 1;
    guardar();
    pintarProgreso();
    pantallaJuego.classList.add('oculto');
    pantallaFinal.classList.remove('oculto');
    resumenFinal.textContent = App.i18n.t('resumenFinal')
      .replace('{n}', aciertosRonda)
      .replace('{total}', progreso.estrellas);
$('#transferencia').textContent = App.i18n.t('transferencia');
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* Events */
  btnEscuchar.addEventListener('click', function () {
    App.tts.speak(items[idx].text);
  });
  btnSiguiente.addEventListener('click', siguiente);
  $('#btnRepetir').addEventListener('click', iniciarRonda);
})();

