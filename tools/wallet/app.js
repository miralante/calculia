/* ============================================================
   Apptonomia — El Monedero (razonamiento: manejo funcional del
   dinero). Datos en data.js. Módulos compartidos en assets/js/.
   Cinco actividades desde un menú (patrón La Compra):
   - ¿Cuánto hay? · ¿Con qué pago? · ¿Está bien el cambio? ·
     La Hucha: quiz de dinero físico con casos GENERADOS al vuelo.
     Corren sobre un runner genérico (montarQuiz más abajo):
     ▶ AÑADIR UNA ACTIVIDAD DE DINERO NUEVA = un objeto de
       configuración en ACTIVIDADES (generar, enunciado, mesa,
       opciones, pista, explicación) + su tarjeta en index.html
       + sus textos en strings.js.
     Todas cumplen las reglas 11 y 12: explicación generada del
     propio caso al resolver, pista socrática al primer fallo.
   - Paga justo: interactiva (tocar dinero hasta el precio exacto),
     con Comprobar en dos pasos y botón 💡 de estrategia greedy.
   Los importes se trabajan en céntimos (enteros) para evitar
   errores de coma flotante. El error nunca se castiga (regla 5).
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'monedero';
  var $ = App.utils.$;

  var starsEl = $('#stars');

  /* Progreso persistente (migra el formato antiguo: 'completados'
     era de la única actividad de pagar). */
  var progreso = App.storage.get(TOOL_ID);
  if (typeof progreso.estrellas !== 'number') progreso.estrellas = 0;
  if (!progreso.completadosPagar) progreso.completadosPagar = progreso.completados || {};
  ['completadosContar', 'completadosConQuePago', 'completadosCambio', 'completadosHucha', 'completadosRedondeo']
    .forEach(function (clave) { if (!progreso[clave]) progreso[clave] = {}; });
  delete progreso.completados;

  function guardar() { App.storage.set(TOOL_ID, progreso); }
  function pintarEstrellas() { starsEl.textContent = '⭐ ' + progreso.estrellas; }
  function datos() { return DATA[App.i18n.locale()] || DATA.es; }
  function azar(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

  /* ---- Pantallas ---- */
  var PANTALLAS = ['pantallaMenu', 'pantallaNiveles', 'pantallaJuegoQuiz',
    'pantallaJuegoPagar', 'pantallaFinal'];
  function mostrar(id) {
    PANTALLAS.forEach(function (p) { $('#' + p).classList.add('oculto'); });
    $('#' + id).classList.remove('oculto');
  }

  /* ============================================================
     Dinero: módulo compartido App.dinero (assets/js/dinero.js)
     ============================================================ */
  var formatear = App.dinero.formatear;
  var hablado = App.dinero.hablado;
  var ariaDinero = App.dinero.aria;
  var crearFicha = App.dinero.crearFicha;
  var descomponer = App.dinero.descomponer;
  var desglose = App.dinero.desglose;

  /* Pinta fichas decorativas en la mesa (oculta si no hay). */
  function pintarMesa(piezas) {
    var mesaEl = $('#mesaDinero');
    App.dinero.pintarFichas(mesaEl, piezas);
    mesaEl.classList.toggle('oculto', !piezas || !piezas.length);
  }

  /* "Una moneda de un euro, una moneda de cincuenta céntimos" —
     used in audio-only mode of "How much is there?" so the user
     can still count what is on the table, just by listening. */
  function enunciadoHablarContar(piezas) {
    var desgloseTexto = desglose(piezas);
    return App.i18n.t('contarEnunciadoAudio').replace('{d}', desgloseTexto);
  }

  /* ============================================================
     Generadores de casos (variedad infinita, cero autoría)
     ============================================================ */

  /* Todos los productos del banco, en el idioma activo. */
  function todosLosProductos() {
    return datos().pagar.niveles.reduce(function (lista, n) {
      return lista.concat(n.productos);
    }, []);
  }

  /* Is the amount in the step's "bucket"? (a level's amounts
     don't fall into the previous level, like in Paga justo). */
  function enBucket(cent, paso) {
    if (paso === 100) return cent % 100 === 0;
    if (paso === 50) return cent % 50 === 0 && cent % 100 !== 0;
    return cent % 10 === 0 && cent % 50 !== 0;
  }

  /* Importes del bucket estrictamente entre min y max. */
  function importesEnHueco(min, max, paso) {
    var lista = [];
    for (var v = paso; v < max; v += paso) {
      if (v > min && enBucket(v, paso)) lista.push(v);
    }
    return lista;
  }

  /* Pair (precio, pagado): pagado is the only amount that's enough and
     the change is never zero. Shared by conquepago and cambio. */
  function generarPar(paso) {
    var pares = [[200, 100], [500, 200], [1000, 500]];   /* [pagado, inferior] */
    var candidatos = [];
    pares.forEach(function (par) {
      var precios = importesEnHueco(par[1], par[0], paso);
      if (precios.length) candidatos.push({ pagado: par[0], inferior: par[1], precios: precios });
    });
    var c = azar(candidatos);
    return { pagado: c.pagado, inferior: c.inferior, precio: azar(c.precios) };
  }

  /* Distractores de importe: cercanos, distintos y positivos. */
  function distractoresDe(correcto, paso) {
    var lista = [];
    App.utils.shuffle([paso, 100, paso * 2]).forEach(function (d) {
      [correcto + d, correcto - d].forEach(function (x) {
        if (x > 0 && x !== correcto && lista.indexOf(x) === -1 && lista.length < 2) lista.push(x);
      });
    });
    while (lista.length < 2) lista.push(correcto + (lista.length + 1) * paso);
    return lista;
  }

  /* ============================================================
     Runner genérico de quiz de dinero
     ============================================================ */
  var enunciadoQuizEl = $('#enunciadoQuiz');
  var opcionesQuizEl = $('#opcionesQuiz');
  var feedbackQuizEl = $('#feedbackQuiz');
  var explicacionQuizWrap = $('#explicacionQuizWrap');
  var explicacionQuizEl = $('#explicacionQuiz');
  var btnSiguienteQuiz = $('#btnSiguienteQuiz');

  var actividadActual = 'contar';
  var nivelQ = null;
  var casoQ = null;
  var idxQ = 0;
  var aciertosQ = 0;
  var intentosQ = 0;
  var resueltoQ = false;
  var opcionBotones = [];

  function cfgActual() { return ACTIVIDADES[actividadActual]; }

  function mostrarTextoQuiz(texto) {
    explicacionQuizEl.textContent = texto;
    explicacionQuizWrap.classList.remove('oculto');
  }

  function pintarProgresoQuiz() {
    var total = datos().porRonda;
    $('#progressQuizFill').style.width = (idxQ / total * 100) + '%';
    $('#progressQuizText').textContent = idxQ + ' / ' + total;
  }

  function iniciarRondaQuiz(nivel) {
    nivelQ = nivel;
    idxQ = 0;
    aciertosQ = 0;
    mostrar('pantallaJuegoQuiz');
    renderQuiz();
  }

  function renderQuiz() {
    var cfg = cfgActual();
    casoQ = cfg.generar(nivelQ);
    intentosQ = 0;
    resueltoQ = false;
    feedbackQuizEl.textContent = '';
    feedbackQuizEl.className = 'feedback';
    explicacionQuizWrap.classList.add('oculto');
    explicacionQuizEl.textContent = '';
    btnSiguienteQuiz.classList.add('oculto');

    enunciadoQuizEl.textContent = cfg.enunciado(casoQ);
    /* Audio-only variants (e.g. ¿Cuánto hay? sin mesa) hide the
       table so the user has to listen and count; the hint shows
       the pieces if they fail. */
    pintarMesa(casoQ.sinMesa ? null : (cfg.mesa ? cfg.mesa(casoQ) : null));
    if (casoQ.sinMesa && cfg.enunciadoHablar) {
      App.tts.stop();
      App.tts.speak(cfg.enunciadoHablar(casoQ));
    }

    opcionesQuizEl.innerHTML = '';
    opcionBotones = [];
    cfg.opciones(casoQ).forEach(function (op) {
      var btn;
      if (cfg.tipoOpcion === 'ficha') {
        btn = crearFicha(op.cent, true);
        btn.setAttribute('aria-label', ariaDinero(op.cent));
      } else {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-opcion';
        btn.textContent = op.texto;
      }
      btn.addEventListener('click', function () { responderQuiz(btn, op); });
      opcionesQuizEl.appendChild(btn);
      opcionBotones.push({ btn: btn, op: op });
    });

    pintarProgresoQuiz();
    pintarEstrellas();
  }

  function resolverQuiz(bien) {
    var cfg = cfgActual();
    resueltoQ = true;
    opcionBotones.forEach(function (par) {
      par.btn.disabled = true;
      if (par.op.correcta) par.btn.classList.add('correcta');
    });
    mostrarTextoQuiz(cfg.explicacion(casoQ, bien));
    if (cfg.alResolver) cfg.alResolver(casoQ);
    btnSiguienteQuiz.classList.remove('oculto');
    btnSiguienteQuiz.focus();
  }

  function responderQuiz(btn, op) {
    if (resueltoQ) return;
    if (op.correcta) {
      if (intentosQ === 0) {
        aciertosQ += 1;
        progreso.estrellas += 1;
        guardar();
        pintarEstrellas();
      }
      App.feedback.success(feedbackQuizEl);
      resolverQuiz(true);
      return;
    }
    intentosQ += 1;
    btn.classList.add('animo');
    btn.disabled = true;
    App.feedback.encourage(feedbackQuizEl);
    if (intentosQ === 1) {
      /* First failure: Socratic hint, without giving the answer (rule 12).
         In audio rounds, the hint also reveals the table so the user can
         count the pieces by eye — a visual fallback for the audio-only case. */
      if (casoQ.sinMesa) {
        pintarMesa(cfgActual().mesa(casoQ));
        App.tts.stop();
        App.tts.speak(cfgActual().pista(casoQ));
      }
      mostrarTextoQuiz(cfgActual().pista(casoQ));
      App.feedback.lockUntilAck(opcionBotones.map(function (p) { return p.btn; }), explicacionQuizWrap);
    } else {
      /* Second failure: the correct answer is marked and explained
         (rule 11: no one is left without a resolution). */
      resolverQuiz(false);
    }
  }

  function siguienteQuiz() {
    idxQ += 1;
    App.tts.stop();
    if (idxQ >= datos().porRonda) terminarRonda(aciertosQ);
    else renderQuiz();
  }

  /* ============================================================
     Configuración de las actividades (▶ añadir aquí las nuevas)
     ============================================================ */
  var ACTIVIDADES = {

    /* --- How much is there? — count the money on the table ---
       Half the rounds are visual (table shown); the other half are
       audio-only (no table, the breakdown is read aloud). On the
       first failure of an audio round, the table is shown as a
       hint so the user is never left without a way to count. */
    contar: {
      esQuiz: true,
      instruccion: 'instruccionContar',
      progresoClave: 'completadosContar',
      resumen: 'resumenContar',
      niveles: function () { return datos().contar.niveles; },
      generar: function (nivel) {
        var n = 2 + Math.floor(Math.random() * 3);
        var piezas = [];
        var total = 0;
        for (var k = 0; k < n; k++) {
          var v = azar(nivel.cents);
          piezas.push(v);
          total += v;
        }
        piezas.sort(function (a, b) { return b - a; });
        var distractores = [];
        App.utils.shuffle(nivel.cents).forEach(function (d) {
          [total + d, total - d].forEach(function (x) {
            if (x > 0 && x !== total && distractores.indexOf(x) === -1 && distractores.length < 2) {
              distractores.push(x);
            }
          });
        });
        while (distractores.length < 2) {
          distractores.push(total + (distractores.length + 1) * nivel.cents[0]);
        }
        /* Audio round? Skip the table; the breakdown is read aloud
           and the pieces only appear on the first failure. */
        var sinMesa = Math.random() < 0.5;
        return {
          piezas: piezas,
          total: total,
          importes: App.utils.shuffle([total].concat(distractores)),
          sinMesa: sinMesa
        };
      },
      enunciado: function () { return App.i18n.t('contarPregunta'); },
      /* Spoken breakdown for audio rounds: "a one-euro coin and a
         fifty-cent coin". read after the written prompt. */
      enunciadoHablar: function (caso) { return enunciadoHablarContar(caso.piezas); },
      mesa: function (caso) { return caso.piezas; },
      opciones: function (caso) {
        return caso.importes.map(function (cent) {
          return { texto: formatear(cent), correcta: cent === caso.total };
        });
      },
      pista: function () { return App.i18n.t('pistaContar'); },
      explicacion: function (caso, bien) {
        return App.i18n.t(bien ? 'explicacionBien' : 'explicacionCasi')
          .replace('{d}', desglose(caso.piezas))
          .replace('{total}', formatear(caso.total));
      }
    },

    /* --- What do I pay with? — choose the money that's enough --- */
    conquepago: {
      esQuiz: true,
      tipoOpcion: 'ficha',
      instruccion: 'instruccionConQuePago',
      progresoClave: 'completadosConQuePago',
      resumen: 'resumenConQuePago',
      niveles: function () { return datos().importe.niveles; },
      generar: function (nivel) {
        var par = generarPar(nivel.paso);
        var producto = azar(todosLosProductos());
        var menores = [500, 200, 100, 50].filter(function (c) { return c < par.inferior; });
        var opciones = App.utils.shuffle([
          { cent: par.pagado, correcta: true },
          { cent: par.inferior, correcta: false },
          { cent: azar(menores), correcta: false }
        ]);
        return {
          picto: producto.picto,
          nombre: producto.nombre,
          precio: par.precio,
          pagado: par.pagado,
          cambio: par.pagado - par.precio,
          lista: opciones
        };
      },
      enunciado: function (caso) {
        return caso.picto + ' ' + App.i18n.t('enunciadoConQuePago')
          .replace('{nombre}', caso.nombre)
          .replace('{precio}', formatear(caso.precio));
      },
      mesa: function () { return null; },
      opciones: function (caso) { return caso.lista; },
      pista: function () { return App.i18n.t('pistaConQuePago'); },
      explicacion: function (caso, bien) {
        return App.i18n.t(bien ? 'explicacionPagoBien' : 'explicacionPagoCasi')
          .replace('{pagado}', hablado(caso.pagado))
          .replace('{cambio}', formatear(caso.cambio));
      },
      /* Al resolver, el cambio aparece como fichas en la mesa:
         conecta pagar con el cambio físico. */
      alResolver: function (caso) { pintarMesa(descomponer(caso.cambio)); }
    },

    /* --- Is the change correct? — verify what's given back --- */
    cambio: {
      esQuiz: true,
      instruccion: 'instruccionCambio',
      progresoClave: 'completadosCambio',
      resumen: 'resumenCambio',
      niveles: function () { return datos().importe.niveles; },
      generar: function (nivel) {
        var par = generarPar(nivel.paso);
        var bueno = par.pagado - par.precio;
        var esBien = Math.random() < 0.5;
        var mostrado = bueno;
        if (!esBien) {
          var deltas = App.utils.shuffle([nivel.paso, -nivel.paso, 100, -100]);
          for (var k = 0; k < deltas.length; k++) {
            var m = bueno + deltas[k];
            if (m > 0 && m !== bueno) { mostrado = m; break; }
          }
        }
        return { precio: par.precio, pagado: par.pagado, bueno: bueno, mostrado: mostrado, esBien: mostrado === bueno };
      },
      enunciado: function (caso) {
        return App.i18n.t('enunciadoCambio')
          .replace('{precio}', formatear(caso.precio))
          .replace('{pagado}', hablado(caso.pagado));
      },
      mesa: function (caso) { return descomponer(caso.mostrado); },
      /* Yes/No in fixed (natural) order, not shuffled. */
      opciones: function (caso) {
        return [
          { texto: App.i18n.t('si'), correcta: caso.esBien },
          { texto: App.i18n.t('no'), correcta: !caso.esBien }
        ];
      },
      pista: function () { return App.i18n.t('pistaCambio'); },
      explicacion: function (caso) {
        var clave = caso.esBien ? 'explicacionCambioBien' :
          (caso.mostrado < caso.bueno ? 'explicacionCambioFalta' : 'explicacionCambioSobra');
        return App.i18n.t(clave)
          .replace('{bueno}', formatear(caso.bueno))
          .replace('{mostrado}', formatear(caso.mostrado));
      }
    },

    /* --- The Piggy Bank — how much is left to buy it? --- */
    hucha: {
      esQuiz: true,
      instruccion: 'instruccionHucha',
      progresoClave: 'completadosHucha',
      resumen: 'resumenHucha',
      niveles: function () { return datos().importe.niveles; },
      generar: function (nivel) {
        /* Objetivos: el banco PRODUCTOS del bucket del nivel. */
        var banco = datos().pagar.niveles.filter(function (n) { return n.id === nivel.id; })[0];
        var candidatos = banco.productos.filter(function (p) { return p.precioCent >= 2 * nivel.paso; });
        var producto = azar(candidatos);
        var pasos = producto.precioCent / nivel.paso;
        var tienes = nivel.paso * (1 + Math.floor(Math.random() * (pasos - 1)));
        var falta = producto.precioCent - tienes;
        var opciones = App.utils.shuffle([falta].concat(distractoresDe(falta, nivel.paso)));
        return {
          picto: producto.picto,
          nombre: producto.nombre,
          precio: producto.precioCent,
          tienes: tienes,
          falta: falta,
          importes: opciones
        };
      },
      enunciado: function (caso) {
        var nombre = caso.nombre.charAt(0).toLowerCase() + caso.nombre.slice(1);
        return caso.picto + ' ' + App.i18n.t('enunciadoHucha')
          .replace('{nombre}', nombre)
          .replace('{precio}', formatear(caso.precio));
      },
      mesa: function (caso) { return descomponer(caso.tienes); },
      opciones: function (caso) {
        return caso.importes.map(function (cent) {
          return { texto: formatear(cent), correcta: cent === caso.falta };
        });
      },
      pista: function () { return App.i18n.t('pistaHucha'); },
      explicacion: function (caso, bien) {
        return App.i18n.t(bien ? 'explicacionHuchaBien' : 'explicacionHuchaCasi')
          .replace('{precio}', formatear(caso.precio))
          .replace('{tienes}', formatear(caso.tienes))
          .replace('{falta}', formatear(caso.falta));
      }
    },

    /* --- More or less — mental rounding ("costs about 3 €") --- */
    redondeo: {
      esQuiz: true,
      instruccion: 'instruccionRedondeo',
      progresoClave: 'completadosRedondeo',
      resumen: 'resumenRedondeo',
      niveles: function () { return datos().redondeo.niveles; },
      generar: function (nivel) {
        var objetivo = 2 + Math.floor(Math.random() * 8);   /* 2-9 € */
        var delta = azar(nivel.deltas);
        /* El ,50 siempre por debajo del objetivo: x,50 SUBE a x+1. */
        var signo = delta === 50 ? -1 : azar([-1, 1]);
        var mostrado = objetivo * 100 + signo * delta;
        /* Producto de sabor con precio de referencia cercano. */
        var cercanos = todosLosProductos().filter(function (p) {
          return Math.abs(p.precioCent - mostrado) <= 150;
        });
        var producto = azar(cercanos.length ? cercanos : todosLosProductos());
        return {
          picto: producto.picto,
          nombre: producto.nombre,
          mostrado: mostrado,
          objetivo: objetivo,
          esMedio: delta === 50,
          candidatos: [objetivo - 1, objetivo, objetivo + 1]
        };
      },
      enunciado: function (caso) {
        return caso.picto + ' ' + App.i18n.t('enunciadoRedondeo')
          .replace('{nombre}', caso.nombre)
          .replace('{precio}', formatear(caso.mostrado));
      },
      mesa: function () { return null; },
      /* Tres euros consecutivos, en orden (no se barajan: es una
         recta numérica, no un quiz de despiste). */
      opciones: function (caso) {
        return caso.candidatos.map(function (n) {
          return { texto: App.i18n.t('unosEuros').replace('{n}', n), correcta: n === caso.objetivo };
        });
      },
      pista: function () { return App.i18n.t('pistaRedondeo'); },
      explicacion: function (caso, bien) {
        var clave = caso.esMedio ?
          (bien ? 'explicacionRedondeoMedioBien' : 'explicacionRedondeoMedioCasi') :
          (bien ? 'explicacionRedondeoBien' : 'explicacionRedondeoCasi');
        return App.i18n.t(clave)
          .replace('{precio}', formatear(caso.mostrado))
          .replace(/\{n\}/g, caso.objetivo);
      }
    },

    /* --- Paga justo — interactiva, fuera del runner --- */
    pagar: {
      esQuiz: false,
      instruccion: 'pagarInstruccion',
      progresoClave: 'completadosPagar',
      resumen: 'resumenPagar',
      niveles: function () { return datos().pagar.niveles; }
    }
  };

  /* ============================================================
     Menú y niveles (compartidos)
     ============================================================ */
  function abrirActividad(id) {
    actividadActual = id;
    var cfg = cfgActual();
    $('#instruccionActividad').textContent = App.i18n.t(cfg.instruccion);
    pintarNiveles();
    mostrar('pantallaNiveles');
  }

  function pintarNiveles() {
    var cfg = cfgActual();
    var cont = $('#niveles');
    cont.innerHTML = '';
    cfg.niveles().forEach(function (n) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-nivel';
      var veces = progreso[cfg.progresoClave][n.id] || 0;
      btn.innerHTML = n.nombre + ' — ' + n.descripcion +
        ' <span class="nivel-info">(' + App.i18n.t('vecesTexto').replace('{n}', veces) + ')</span>';
      btn.addEventListener('click', function () {
        if (cfg.esQuiz) iniciarRondaQuiz(n);
        else iniciarRondaPagar(n);
      });
      cont.appendChild(btn);
    });
  }

  function terminarRonda(aciertos) {
    var cfg = cfgActual();
    var nivel = cfg.esQuiz ? nivelQ : nivelP;
    progreso[cfg.progresoClave][nivel.id] = (progreso[cfg.progresoClave][nivel.id] || 0) + 1;
    guardar();
    $('#resumenFinal').textContent = App.i18n.t(cfg.resumen)
      .replace('{n}', aciertos)
      .replace('{t}', datos().porRonda);
$('#transferencia').textContent = App.i18n.t('transferencia');
    mostrar('pantallaFinal');
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* ============================================================
     Actividad — Paga justo (interactiva)
     ============================================================ */
  var productoEl = $('#producto');
  var precioTextoEl = $('#precioTexto');
  var totalPuestoEl = $('#totalPuesto');
  var monedasEl = $('#monedas');
  var feedbackPagarEl = $('#feedbackPagar');
  var ayudaPagarWrap = $('#ayudaPagarWrap');
  var ayudaPagarTextoEl = $('#ayudaPagarTexto');
  var btnComprobar = $('#btnComprobar');
  var btnQuitar = $('#btnQuitar');
  var btnSiguientePagar = $('#btnSiguientePagar');

  var nivelP = null;
  var productosRonda = [];
  var idxP = 0;
  var aciertosP = 0;
  var puestas = [];      /* cents of each piece placed, in order */
  var fallosP = 0;       /* comprobaciones falladas de este producto */
  var resueltoP = false;
  var ayudaPasoP = 0;
  var botonesDinero = {};  /* cent -> button, to mark the hint */

  function iniciarRondaPagar(n) {
    nivelP = n;
    productosRonda = App.utils.shuffle(n.productos).slice(0, datos().porRonda);
    idxP = 0;
    aciertosP = 0;
    pintarDineroPagar();
    mostrar('pantallaJuegoPagar');
    renderPagar();
  }

  /* Level's money buttons, from largest to smallest (teaches paying
     by starting with the largest). */
  function pintarDineroPagar() {
    monedasEl.innerHTML = '';
    botonesDinero = {};
    nivelP.cents.slice().sort(function (a, b) { return b - a; }).forEach(function (cent) {
      var btn = crearFicha(cent, true);
      btn.setAttribute('aria-label', App.i18n.t('anadirDinero').replace('{d}', ariaDinero(cent)));
      btn.addEventListener('click', function () { anadirDinero(cent); });
      monedasEl.appendChild(btn);
      botonesDinero[cent] = btn;
    });
  }

  function totalPuestas() {
    return puestas.reduce(function (suma, c) { return suma + c; }, 0);
  }

  function pintarTotal() {
    totalPuestoEl.textContent = App.i18n.t('hasPuesto').replace('{total}', formatear(totalPuestas()));
  }

  function pintarProgresoPagar() {
    var total = datos().porRonda;
    $('#progressPagarFill').style.width = (idxP / total * 100) + '%';
    $('#progressPagarText').textContent = idxP + ' / ' + total;
  }

  function renderPagar() {
    var item = productosRonda[idxP];
    resueltoP = false;
    fallosP = 0;
    puestas = [];
    feedbackPagarEl.textContent = '';
    feedbackPagarEl.className = 'feedback';
    btnSiguientePagar.classList.add('oculto');
    btnComprobar.disabled = false;
    productoEl.textContent = item.picto;
    precioTextoEl.textContent = App.i18n.t('cuesta')
      .replace('{nombre}', item.nombre)
      .replace('{precio}', formatear(item.precioCent));
    limpiarAyudaPagar();
    pintarTotal();
    pintarProgresoPagar();
    pintarEstrellas();
  }

  function anadirDinero(cent) {
    if (resueltoP) return;
    puestas.push(cent);
    limpiarAyudaPagar();
    pintarTotal();
  }

  function quitarUltima() {
    if (resueltoP) return;
    puestas.pop();
    limpiarAyudaPagar();
    pintarTotal();
  }

  function vaciar() {
    if (resueltoP) return;
    puestas = [];
    limpiarAyudaPagar();
    pintarTotal();
  }

  /* Comprobar con andamiaje (regla 12 adaptada): el primer fallo
     solo da la dirección; a partir del segundo, la cantidad exacta
     que falta o sobra — nadie se queda atascado. */
  function comprobar() {
    if (resueltoP) return;
    var objetivo = productosRonda[idxP].precioCent;
    var puesto = totalPuestas();

    if (puesto === objetivo) {
      resueltoP = true;
      if (fallosP === 0) {
        aciertosP += 1;
        progreso.estrellas += 1;
        guardar();
        pintarEstrellas();
      }
      App.feedback.success(feedbackPagarEl);
      btnComprobar.disabled = true;
      btnSiguientePagar.classList.remove('oculto');
      btnSiguientePagar.focus();
      return;
    }

    fallosP += 1;
    var falta = puesto < objetivo;
    var texto;
    if (fallosP === 1) {
      texto = App.i18n.t(falta ? 'faltaDinero1' : 'sobraDinero1');
    } else {
      var dif = Math.abs(objetivo - puesto);
      texto = App.i18n.t(falta ? 'faltaDinero2' : 'sobraDinero2')
        .replace('{dif}', hablado(dif));
    }
    feedbackPagarEl.textContent = texto;
    feedbackPagarEl.className = 'feedback animo';
  }

  /* ---- 💡 On-demand hint (two-step Socratic method) ----
     Teaches the largest-to-smallest paying strategy: 1st tap
     asks for the largest amount that fits; the 2nd marks it. */
  function limpiarAyudaPagar() {
    ayudaPasoP = 0;
    ayudaPagarWrap.classList.add('oculto');
    ayudaPagarTextoEl.textContent = '';
    Object.keys(botonesDinero).forEach(function (c) {
      botonesDinero[c].classList.remove('sugerida');
    });
    btnQuitar.classList.remove('sugerida');
    btnComprobar.classList.remove('sugerida');
  }

  function pedirAyudaPagar() {
    if (resueltoP) return;
    var objetivo = productosRonda[idxP].precioCent;
    var restante = objetivo - totalPuestas();
    ayudaPasoP = ayudaPasoP >= 2 ? 2 : ayudaPasoP + 1;
    var texto;

    if (restante === 0) {
      texto = App.i18n.t('ayudaComprobar');
      btnComprobar.classList.add('sugerida');
    } else if (restante < 0) {
      texto = App.i18n.t('ayudaQuita' + ayudaPasoP);
      if (ayudaPasoP === 2) btnQuitar.classList.add('sugerida');
    } else {
      texto = App.i18n.t('ayudaPagar' + ayudaPasoP);
      if (ayudaPasoP === 2) {
        /* The largest money in the level that fits in what's left. */
        var mejor = nivelP.cents.filter(function (c) { return c <= restante; })
          .sort(function (a, b) { return b - a; })[0];
        if (mejor) botonesDinero[mejor].classList.add('sugerida');
      }
    }
    ayudaPagarTextoEl.textContent = texto;
    ayudaPagarWrap.classList.remove('oculto');
  }

  function siguientePagar() {
    idxP += 1;
    App.tts.stop();
    if (idxP >= datos().porRonda) terminarRonda(aciertosP);
    else renderPagar();
  }

  /* ---- Eventos ---- */
  App.utils.$$('.tarjeta-actividad').forEach(function (btn) {
    btn.addEventListener('click', function () { abrirActividad(btn.getAttribute('data-actividad')); });
  });
  $('#btnVolverMenuNiveles').addEventListener('click', function () { App.tts.stop(); mostrar('pantallaMenu'); });
  $('#btnVolverMenuFinal').addEventListener('click', function () { App.tts.stop(); mostrar('pantallaMenu'); });

  btnSiguienteQuiz.addEventListener('click', siguienteQuiz);
  $('#btnEnunciadoQuiz').addEventListener('click', function () {
    App.tts.speak(enunciadoQuizEl.textContent);
  });

  $('#btnEscuchar').addEventListener('click', function () {
    App.tts.speak(precioTextoEl.textContent);
  });
  btnComprobar.addEventListener('click', comprobar);
  btnQuitar.addEventListener('click', quitarUltima);
  $('#btnVaciar').addEventListener('click', vaciar);
  btnSiguientePagar.addEventListener('click', siguientePagar);
  $('#btnAyudaPagar').addEventListener('click', pedirAyudaPagar);
  $('#btnEscucharAyudaPagar').addEventListener('click', function () {
    App.tts.speak(ayudaPagarTextoEl.textContent);
  });

  $('#btnRepetir').addEventListener('click', function () {
    if (cfgActual().esQuiz) iniciarRondaQuiz(nivelQ);
    else iniciarRondaPagar(nivelP);
  });
  $('#btnOtroNivelFinal').addEventListener('click', function () { abrirActividad(actividadActual); });

  pintarEstrellas();
})();

