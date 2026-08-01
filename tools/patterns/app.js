/* ============================================================
   Apptonomia — Patrones (razonamiento)
   Datos en data.js (DATA.niveles). Módulos compartidos en assets/js/.
   Mecánica: se muestra una serie con un hueco y 3 opciones.
   Ronda de 8 series por nivel. El error nunca se castiga.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'patrones';
  var POR_RONDA = 8;
  var $ = App.utils.$;

  /* Spoken names of the symbols, for the audio button (per language) */
  var NOMBRES = {
    es: {
      '🔵': 'círculo azul', '🔴': 'círculo rojo', '🟢': 'círculo verde',
      '🟡': 'círculo amarillo', '🟣': 'círculo morado', '🟠': 'círculo naranja',
      '⭐': 'estrella', '🌙': 'luna', '☀️': 'sol', '☁️': 'nube',
      '🍎': 'manzana', '🍌': 'plátano', '🍇': 'uvas', '🍉': 'sandía',
      '🐱': 'gato', '🐶': 'perro', '🐰': 'conejo',
      '🔺': 'triángulo hacia arriba', '🔻': 'triángulo hacia abajo', '🔶': 'rombo',
      '🐟': 'pez', '🦋': 'mariposa', '🐝': 'abeja',
      '🌸': 'flor', '🍀': 'trébol', '🌵': 'cactus',
      '⚪': 'círculo pequeño', '🔘': 'círculo mediano', '⚫': 'círculo grande',
      '🎈': 'globo', '🧦': 'calcetín', '🎲': 'dado', '🐢': 'tortuga', '🦴': 'hueso', '🥕': 'zanahoria'
    },
    en: {
      '🔵': 'blue circle', '🔴': 'red circle', '🟢': 'green circle',
      '🟡': 'yellow circle', '🟣': 'purple circle', '🟠': 'orange circle',
      '⭐': 'star', '🌙': 'moon', '☀️': 'sun', '☁️': 'cloud',
      '🍎': 'apple', '🍌': 'banana', '🍇': 'grapes', '🍉': 'watermelon',
      '🐱': 'cat', '🐶': 'dog', '🐰': 'rabbit',
      '🔺': 'triangle pointing up', '🔻': 'triangle pointing down', '🔶': 'diamond',
      '🐟': 'fish', '🦋': 'butterfly', '🐝': 'bee',
      '🌸': 'flower', '🍀': 'clover', '🌵': 'cactus',
      '⚪': 'small circle', '🔘': 'medium circle', '⚫': 'large circle',
      '🎈': 'balloon', '🧦': 'sock', '🎲': 'dice', '🐢': 'turtle', '🦴': 'bone', '🥕': 'carrot'
    }
  };

  var pantallaInicio = $('#pantallaInicio');
  var pantallaJuego = $('#pantallaJuego');
  var pantallaFinal = $('#pantallaFinal');
  var serieEl = $('#serie');
  var opcionesEl = $('#opciones');
  var feedbackEl = $('#feedback');
  var explicacionWrap = $('#explicacionWrap');
  var explicacionEl = $('#explicacion');
  var btnEscuchar = $('#btnEscuchar');
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
  var items = [];
  var idx = 0;
  var aciertosRonda = 0;
  var resuelto = false;
  var intentos = 0;

  function guardar() { App.storage.set(TOOL_ID, progreso); }

  function pintarEstrellas() { starsEl.textContent = '⭐ ' + progreso.estrellas; }

  function textoLegible(simbolo) {
    var loc = App.i18n.locale();
    var nombres = NOMBRES[loc] || NOMBRES.es;
    return nombres[simbolo] || simbolo;
  }

  function textoSerie(patron) {
    return patron.map(function (s) {
      return s === '❓' ? App.i18n.t('queSigueAudio') : textoLegible(s);
    }).join(', ');
  }

  /* ---- Pantalla inicial ---- */
  function pintarNiveles() {
    var cont = $('#niveles');
    cont.innerHTML = '';
    var datos = DATA[App.i18n.locale()] || DATA.es;
    datos.niveles.forEach(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-nivel';
      var veces = progreso.completados[n.id] || 0;
      btn.innerHTML = n.nombre + ' — ' + n.descripcion +
        ' <span class="nivel-info">(' + App.i18n.t('vecesTexto').replace('{n}', veces) + ')</span>';
      btn.addEventListener('click', function () { iniciarRonda(n); });
      cont.appendChild(btn);
    });
  }

  function iniciarRonda(n) {
    nivel = n;
    items = App.utils.shuffle(nivel.series).slice(0, POR_RONDA);
    idx = 0;
    aciertosRonda = 0;
    pantallaInicio.classList.add('oculto');
    pantallaFinal.classList.add('oculto');
    pantallaJuego.classList.remove('oculto');
    render();
  }

  function pintarProgreso() {
    progressFill.style.width = ((idx / POR_RONDA) * 100) + '%';
    progressText.textContent = idx + ' / ' + POR_RONDA;
  }

  function render() {
    var item = items[idx];
    resuelto = false;
    intentos = 0;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explicacionWrap.classList.add('oculto');
    explicacionEl.textContent = '';
    btnSiguiente.classList.add('oculto');
    opcionesEl.innerHTML = '';

    serieEl.innerHTML = '';
    item.patron.forEach(function (simbolo) {
      var span = document.createElement('span');
      span.className = 'simbolo' + (simbolo === '❓' ? ' hueco' : '');
      span.textContent = simbolo;
      serieEl.appendChild(span);
    });

    var opciones = App.utils.shuffle(item.opciones.map(function (opt, i) {
      return { texto: opt, esCorrecta: i === item.correcta };
    }));

    opciones.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-opcion opcion-simbolo';
      btn.textContent = op.texto;
      btn.addEventListener('click', function () {
        responder(btn, op.esCorrecta, item);
      });
      opcionesEl.appendChild(btn);
    });

    pintarProgreso();
    pintarEstrellas();
  }

  function mostrarExplicacion(esCorrecta, item) {
    var respuesta = textoLegible(item.opciones[item.correcta]);
    var texto = esCorrecta
      ? App.i18n.t('explicacionCorrecta') + respuesta + '.'
      : App.i18n.t('explicacionIncorrectaA') + respuesta + '.';
    explicacionEl.textContent = texto;
    explicacionWrap.classList.remove('oculto');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look at the sequence again. Only on
     the second mistake is the correct answer explained
     (mostrarExplicacion). */
  function mostrarPista() {
    explicacionEl.textContent = App.i18n.t('pista');
    explicacionWrap.classList.remove('oculto');
  }

  function responder(btn, esCorrecta, item) {
    if (resuelto) return;
    if (esCorrecta) {
      mostrarExplicacion(esCorrecta, item);
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
      intentos += 1;
      if (intentos === 1) {
        mostrarPista();
      } else {
        mostrarExplicacion(esCorrecta, item);
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
    if (idx >= POR_RONDA) {
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
      .replace('{total}', progreso.estrellas);
$('#transferencia').textContent = App.i18n.t('transferencia');
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* Events */
  btnEscuchar.addEventListener('click', function () {
    App.tts.speak(textoSerie(items[idx].patron));
  });
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

