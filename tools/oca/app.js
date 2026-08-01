/* ============================================================
   Apptonomia — La Oca (juego de mesa en solitario)
   Datos en data.js (DATA.niveles, DATA.caras). Módulos compartidos
   en assets/js/. Mecánica: tirar el dado y avanzar por el
   tablero. Las casillas con regalo (especialesDe(), calculadas a
   partir de 'casillas') dan una estrella extra. Sin cronómetro ni
   penalización: solo se avanza.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'oca';
  var $ = App.utils.$;

  var pantallaInicio = $('#pantallaInicio');
  var pantallaJuego = $('#pantallaJuego');
  var pantallaFinal = $('#pantallaFinal');
  var casillaActualEl = $('#casillaActual');
  var tableroEl = $('#tablero');
  var dadoEl = $('#dado');
  var btnTirar = $('#btnTirar');
  var feedbackEl = $('#feedback');
  var starsEl = $('#stars');

  /* Persistent progress */
  var progreso = App.storage.get(TOOL_ID);
  if (typeof progreso.estrellas !== 'number') progreso.estrellas = 0;
  if (!progreso.completados) progreso.completados = {};

  /* Estado de la partida */
  var nivel = null;
  var posicion = 1;
  var moviendo = false;

  function guardar() { App.storage.set(TOOL_ID, progreso); }

  function pintarEstrellas() { starsEl.textContent = '⭐ ' + progreso.estrellas; }

  function banco() { return DATA[App.i18n.locale()] || DATA.es; }

  /* Casillas con regalo: una cada 3 casillas a partir de la 4ª, nunca
     en la meta. Se calcula a partir de 'casillas' (única variable de
     dificultad por nivel, regla 13) en vez de guardarse aparte. */
  function especialesDe(casillas) {
    var out = [];
    for (var i = 4; i < casillas; i += 3) out.push(i);
    return out;
  }

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
      btn.addEventListener('click', function () { iniciarPartida(n); });
      cont.appendChild(btn);
    });
  }

  function iniciarPartida(n) {
    nivel = n;
    posicion = 1;
    moviendo = false;
    pantallaInicio.classList.add('oculto');
    pantallaFinal.classList.add('oculto');
    pantallaJuego.classList.remove('oculto');
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    dadoEl.textContent = '🎲';
    btnTirar.disabled = false;
    pintarTablero();
    pintarEstrellas();
  }

  function pintarTablero() {
    tableroEl.innerHTML = '';
    var especiales = especialesDe(nivel.casillas);
    for (var i = 1; i <= nivel.casillas; i++) {
      var div = document.createElement('div');
      div.className = 'casilla';
      if (i === nivel.casillas) div.classList.add('meta');
      if (especiales.indexOf(i) !== -1) div.classList.add('especial');
      if (i === posicion) div.classList.add('actual');

      var contenido = String(i);
      if (i === nivel.casillas) contenido = '🏁';
      else if (especiales.indexOf(i) !== -1) contenido = '🎁';
      div.textContent = contenido;
      if (i === posicion) {
        var ficha = document.createElement('span');
        ficha.className = 'ficha';
        ficha.textContent = '🦢';
        ficha.setAttribute('aria-hidden', 'true');
        div.appendChild(ficha);
      }
      tableroEl.appendChild(div);
    }
    casillaActualEl.textContent = App.i18n.t('casillaActual')
      .replace('{n}', posicion).replace('{total}', nivel.casillas);
  }

  function tirar() {
    if (moviendo) return;
    moviendo = true;
    btnTirar.disabled = true;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';

    var valor = 1 + Math.floor(Math.random() * 6);
    dadoEl.textContent = banco().caras[valor - 1];

    var destino = Math.min(posicion + valor, nivel.casillas);
    var reducido = App.utils.reducedMotion();
    var pasos = destino - posicion;
    var restantes = pasos;

    function avanzarPaso() {
      if (restantes <= 0) {
        llegar(destino);
        return;
      }
      posicion += 1;
      restantes -= 1;
      pintarTablero();
      setTimeout(avanzarPaso, reducido ? 0 : 220);
    }
    avanzarPaso();
  }

  function llegar(destino) {
    if (especialesDe(nivel.casillas).indexOf(destino) !== -1 && destino !== nivel.casillas) {
      progreso.estrellas += 1;
      guardar();
      pintarEstrellas();
      App.feedback.success(feedbackEl);
      feedbackEl.textContent = App.i18n.t('regalo');
    }

    if (destino >= nivel.casillas) {
      terminarPartida();
    } else {
      moviendo = false;
      btnTirar.disabled = false;
    }
  }

  function terminarPartida() {
    progreso.estrellas += 1;
    progreso.completados[nivel.id] = (progreso.completados[nivel.id] || 0) + 1;
    guardar();
    pintarEstrellas();
    pantallaJuego.classList.add('oculto');
    pantallaFinal.classList.remove('oculto');
    $('#resumenFinal').textContent = App.i18n.t('resumenFinal')
      .replace('{total}', progreso.estrellas);
$('#transferencia').textContent = App.i18n.t('transferencia');
    App.feedback.celebrate(App.i18n.t('meta'));
  }

  /* Events */
  btnTirar.addEventListener('click', tirar);
  $('#btnRepetir').addEventListener('click', function () { iniciarPartida(nivel); });
  $('#btnOtroNivel').addEventListener('click', function () {
    pantallaFinal.classList.add('oculto');
    pintarNiveles();
    pantallaInicio.classList.remove('oculto');
  });

  pintarNiveles();
  pintarEstrellas();
})();

