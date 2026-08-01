/* ============================================================
   Apptonomia — El Reloj (tiempo)
   Datos en data.js (DATA.niveles, DATA.momentos). Módulos
   compartidos en assets/js/. Dos tipos de pregunta por ronda:
   "leer" (mirar un reloj y elegir la hora en texto) y "asociar"
   (leer un momento del día y elegir el reloj correcto).
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'reloj';
  var $ = App.utils.$;

  var pantallaInicio = $('#pantallaInicio');
  var pantallaJuego = $('#pantallaJuego');
  var pantallaFinal = $('#pantallaFinal');
  var preguntaZonaEl = $('#preguntaZona');
  var preguntaTextoEl = $('#preguntaTexto');
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
  var preguntas = [];
  var idx = 0;
  var aciertosRonda = 0;
  var resuelto = false;
  var intentos = 0;

  function guardar() { App.storage.set(TOOL_ID, progreso); }

  function pintarEstrellas() { starsEl.textContent = '⭐ ' + progreso.estrellas; }

  function hora12(hora24) {
    var h = hora24 % 12;
    return h === 0 ? 12 : h;
  }

  /* Easy Read text for a given time (12-hour analog format).
     Each language has its own time expressions (see strings.js);
     it is NOT a literal word-for-word translation. */
  function textoHora(h, minuto) {
    if (minuto === 0) return App.i18n.t('horaEnPunto').replace('{h}', h);
    if (minuto === 15) return App.i18n.t('horaYCuarto').replace('{h}', h);
    if (minuto === 30) return App.i18n.t('horaYMedia').replace('{h}', h);
    /* 45: se nombra respecto a la hora siguiente */
    var siguiente = h === 12 ? 1 : h + 1;
    return App.i18n.t('horaMenosCuarto').replace('{h}', siguiente);
  }

  function svgReloj(h, minuto) {
    var anguloHora = ((h % 12) + minuto / 60) * 30;
    var anguloMinuto = minuto * 6;
    var numeros = [
      { n: 12, x: 50, y: 20 },
      { n: 3, x: 80, y: 52 },
      { n: 6, x: 50, y: 84 },
      { n: 9, x: 20, y: 52 }
    ].map(function (p) {
      return '<text x="' + p.x + '" y="' + p.y + '" text-anchor="middle" ' +
        'font-size="12" font-weight="700" fill="var(--color-texto)" ' +
        'style="font-family:var(--fuente)">' + p.n + '</text>';
    }).join('');

    return '<svg viewBox="0 0 100 100" width="120" height="120" role="img" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="45" fill="#FFFFFF" stroke="var(--color-texto)" stroke-width="4"/>' +
      numeros +
      '<line x1="50" y1="50" x2="50" y2="28" stroke="var(--color-texto)" stroke-width="5" ' +
      'stroke-linecap="round" transform="rotate(' + anguloHora + ' 50 50)"/>' +
      '<line x1="50" y1="50" x2="50" y2="18" stroke="var(--color-texto)" stroke-width="3.5" ' +
      'stroke-linecap="round" transform="rotate(' + anguloMinuto + ' 50 50)"/>' +
      '<circle cx="50" cy="50" r="3" fill="var(--color-texto)"/>' +
      '</svg>';
  }

  function horaAleatoria() { return 1 + Math.floor(Math.random() * 12); }

  function minutoAleatorio() {
    var opciones = nivel.minutos;
    return opciones[Math.floor(Math.random() * opciones.length)];
  }

  function combinacionDistinta(excluir) {
    var h, m, intentos = 0;
    do {
      h = horaAleatoria();
      m = minutoAleatorio();
      intentos++;
    } while (excluir.some(function (e) { return e.h === h && e.m === m; }) && intentos < 30);
    return { h: h, m: m };
  }

  function generarPreguntaLeer() {
    var h = horaAleatoria();
    var m = minutoAleatorio();
    var usadas = [{ h: h, m: m }];
    var opciones = [{ texto: textoHora(h, m), esCorrecta: true }];
    while (opciones.length < 3) {
      var d = combinacionDistinta(usadas);
      usadas.push(d);
      var texto = textoHora(d.h, d.m);
      if (opciones.some(function (o) { return o.texto === texto; })) continue;
      opciones.push({ texto: texto, esCorrecta: false });
    }
    return { tipo: 'leer', hora: h, minuto: m, opciones: opciones };
  }

  function generarPreguntaAsociar() {
    var momento = DATA.momentos[Math.floor(Math.random() * DATA.momentos.length)];
    var h = hora12(momento.hora);
    var m = minutoAleatorio();
    var usadas = [{ h: h, m: m }];
    var opciones = [{ h: h, m: m, esCorrecta: true }];
    while (opciones.length < 3) {
      var d = combinacionDistinta(usadas);
      usadas.push(d);
      opciones.push({ h: d.h, m: d.m, esCorrecta: false });
    }
    return { tipo: 'asociar', momento: momento, opciones: opciones };
  }

  /* ---- Pantalla inicial ---- */
  function pintarNiveles() {
    var cont = $('#niveles');
    cont.innerHTML = '';
    DATA.niveles.forEach(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-nivel';
      var veces = progreso.completados[n.id] || 0;
      var nombreNivel = App.i18n.t('nivelNombre').replace('{n}', n.id);
      var descripcionNivel = App.i18n.t('nivelDescripcion.' + n.id);
      var vecesTxt = App.i18n.t('veces').replace('{n}', veces);
      btn.innerHTML = nombreNivel + ' — ' + descripcionNivel +
        ' <span class="nivel-info">(' + vecesTxt + ')</span>';
      btn.addEventListener('click', function () { iniciarRonda(n); });
      cont.appendChild(btn);
    });
  }

  function iniciarRonda(n) {
    nivel = n;
    preguntas = [];
    for (var i = 0; i < DATA.porRonda; i++) {
      preguntas.push(i % 2 === 0 ? generarPreguntaLeer() : generarPreguntaAsociar());
    }
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
    var p = preguntas[idx];
    resuelto = false;
    intentos = 0;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explicacionWrap.classList.add('oculto');
    explicacionEl.textContent = '';
    btnSiguiente.classList.add('oculto');
    opcionesEl.innerHTML = '';

    if (p.tipo === 'leer') {
      preguntaZonaEl.innerHTML = svgReloj(p.hora, p.minuto);
      preguntaTextoEl.textContent = App.i18n.t('preguntaQueHora');
      var opcionesLeer = App.utils.shuffle(p.opciones);
      opcionesLeer.forEach(function (op) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-opcion';
        btn.textContent = op.texto;
        btn.addEventListener('click', function () { responder(btn, op.esCorrecta, p); });
        opcionesEl.appendChild(btn);
      });
    } else {
      preguntaZonaEl.innerHTML = '<div class="momento-picto" aria-hidden="true">' + p.momento.picto + '</div>';
      preguntaTextoEl.textContent = App.i18n.t('momento.' + p.momento.id + '.pregunta');
      opcionesEl.className = 'pila opciones-reloj';
      var opcionesAsociar = App.utils.shuffle(p.opciones);
      opcionesAsociar.forEach(function (op) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-opcion opcion-reloj';
        btn.innerHTML = svgReloj(op.h, op.m);
        btn.setAttribute('aria-label', App.i18n.t('relojAria').replace('{texto}', textoHora(op.h, op.m)));
        btn.addEventListener('click', function () { responder(btn, op.esCorrecta, p); });
        opcionesEl.appendChild(btn);
      });
    }

    pintarProgreso();
    pintarEstrellas();
  }

  function respuestaCorrectaTexto(p) {
    var correcta = p.opciones.filter(function (o) { return o.esCorrecta; })[0];
    return p.tipo === 'leer' ? correcta.texto : textoHora(correcta.h, correcta.m);
  }

  function mostrarExplicacion(esCorrecta, p) {
    var texto = (esCorrecta ? App.i18n.t('explicacionCorrecta') : App.i18n.t('explicacionIncorrectaA')) +
      respuestaCorrectaTexto(p) + '.';
    explicacionEl.textContent = texto;
    explicacionWrap.classList.remove('oculto');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look at the clock/moment again.
     Only on the second mistake is the correct time explained
     (mostrarExplicacion). */
  function mostrarPista(p) {
    explicacionEl.textContent = App.i18n.t(p.tipo === 'leer' ? 'pistaLeer' : 'pistaAsociar');
    explicacionWrap.classList.remove('oculto');
  }

  function responder(btn, esCorrecta, p) {
    if (resuelto) return;
    if (esCorrecta) {
      mostrarExplicacion(esCorrecta, p);
      resuelto = true;
      btn.classList.add('correcta');
      App.utils.$$('#opciones .btn-opcion').forEach(function (b) { b.disabled = true; });
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
        mostrarPista(p);
      } else {
        mostrarExplicacion(esCorrecta, p);
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
    opcionesEl.className = 'pila';
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
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* Events */
  btnEscuchar.addEventListener('click', function () {
    App.tts.speak(preguntaTextoEl.textContent);
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

