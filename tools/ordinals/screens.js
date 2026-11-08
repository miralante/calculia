/* ============================================================
   Calculia — Ordinal numbers: the three screens before the levels.
   Screen 1 is the medals and the carousel, screen 2 the famous ordinals
   (the building, the queue, the classification and the podium) and screen 3
   the reminder (the ordinal row and the rule). This file owns their drawing
   and their buttons. The page gives it switchTo() and the abbreviation helper,
   and gets back paint() and bind().
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;
  function t(key) { return App.i18n.t(key); }

  /* host: { switchTo(screen), abbrev(n) }. Returns { paint(), bind() }. */
  App.ordinalsScreens = function (host) {
    var switchTo = host.switchTo;
    var abbrev = host.abbrev;
    var introScreen = $('#screenIntro');
    var famousScreen = $('#screenFamous');
    var reminderScreen = $('#screenReminder');
    var levelsScreen = $('#screenLevels');

    /* ============================================================
       Pantalla 1: medallas + serie, en carrusel
       ============================================================ */

    /* Tarjeta de medallas: es la presentación del concepto y va
       SIEMPRE en el mismo sitio, ANTES del carrusel. La razón está en
       strings.es.js / strings.en.js: primero/segundo/tercero son los
       ordinales que ya se conocen sin tener que aprenderlos, así que
       la tarjeta los presenta y el carrusel lo que viene después —
       cuarto, quinto… y los redondos — los añade.

       Cada medalla se pinta como su número de podium (🥇 arriba, 🥈
       en medio, 🥉 abajo): es la disposición que se ve en cualquier
       foto de una carrera, y por eso se reconoce sin tener que
       aprenderla. La cifra y la palabra se quedan DENTRO de la misma
       pieza, no como hermanos sueltos: si la cifra viviera en una
       esquina y la palabra en otra, alguien podría leerlas como
       datos separados en vez de como la misma cosa. */
    function paintMedals() {
      var el = $('#medalsRow');
      if (!el) return;
      var items = [
        { medal: '🥇', n: 1, cls: 'ord-c1' },
        { medal: '🥈', n: 2, cls: 'ord-c2' },
        { medal: '🥉', n: 3, cls: 'ord-c3' }
      ];
      var ariaParts = items.map(function (i) {
        return abbrev(i.n) + ' — ' + t('ord.' + i.n + 'Name');
      });
      el.setAttribute('aria-label', ariaParts.join('; '));
      el.innerHTML = items.map(function (i) {
        /* Texto a la izquierda, medalla a la derecha: la cifra y el
           nombre comparten pieza (van juntos, alineados a la derecha
           de su columna, justo al lado de la medalla) y la medalla
           se queda en su esquina como el "sello" que confirma el
           puesto. Si la medalla viviera encima del número, se leería
           como un adorno; si viviera debajo, se leería como dato
           separado. */
        return '<div class="medal-item medal-item--' + i.n + '">' +
          '<span class="medal-text">' +
            '<span class="medal-figure ' + i.cls + '">' + abbrev(i.n) + '</span>' +
            '<span class="medal-name ' + i.cls + '">' + t('ord.' + i.n + 'Name') + '</span>' +
          '</span>' +
          '<span class="medal-icon" aria-hidden="true">' + i.medal + '</span>' +
          '</div>';
      }).join('');
    }

    var carouselIdx = 0;

    /* Cada paso enseña el ordinal de TRES formas a la vez: la cifra
       abreviada (la del dígito pegado al indicador de ordinal, en
       español y en inglés), la cifra pelada como número y la palabra
       (tercero). Las tres van juntas a propósito: el ojo necesita
       ver cifra, abreviatura y palabra como el mismo dato, no como
       tres datos separados. La abreviatura se construye en runtime
       con `abbrev(n)`: por qué se concatena al vuelo en vez de
       escribirse como literal está explicado junto a esa función.

       Los tres primeros llevan además la medalla: 🥇 para el primero,
       🥈 para el segundo, 🥉 para el tercero. La medalla va EN LA
       MISMA LÍNEA que la cifra y entre los dos hay sólo un espacio,
       porque comparten el mismo papel —los dos "marcan el puesto"—
       y separar la medalla en una esquina arriba convertiría el podio
       en un adorno. */
    function paintCarousel() {
      var n = DATA.carousel[carouselIdx];
      var o = ordinalByN(n);
      var el = $('#carouselDisplay');
      var figureHtml = o.medal
        ? '<span class="carousel-figure-row">' +
          '<span class="carousel-medal" aria-hidden="true">' + o.medal + '</span>' +
          '<span class="carousel-figure ' + o.cls + '">' + abbrev(n) + '</span>' +
          '</span>'
        : '<span class="carousel-figure ' + o.cls + '">' + abbrev(n) + '</span>';
      el.innerHTML =
        figureHtml +
        '<span class="carousel-name ' + o.cls + '">' + t('ord.' + n + 'Name') + '</span>';
      /* La abreviatura llega al lector de pantalla en el aria-label:
         coincide con lo que ve el ojo (la cifra abreviada pegada al
         guion largo y al nombre del ordinal). */
      el.setAttribute('aria-label', abbrev(n) + ' — ' + t('ord.' + n + 'Name'));
    }

    function carouselStep(delta) {
      carouselIdx = App.utils.wrapIndex(carouselIdx, delta, DATA.carousel.length);
      paintCarousel();
    }

    /* ============================================================
       Pantalla 2: CUATRO escenarios de la vida real
       ============================================================ */

    /* Los cuatro escenarios (podio, clasificación, cola y edificio) se
       renderizan como un escenario a la vez — uno por slide —, no como
       un carrusel de ordinales sueltos. La razón está en la actividad:
       cuando alguien oye "vivo en el tercer piso", los ordinales están
       rodeados de contexto (el resto de los pisos del edificio), y ese
       contexto es lo que le da sentido a la palabra. Un ordinal aislado
       — "tercero = 3" — se recuerda peor que la palabra dentro de una
       escena. Mismo razonamiento para "quedó en el primer lugar",
       "va el tercero en la clasificación" o "es el primero de la
       cola": el escenario es lo que vuelve el ordinal algo reconocible. */
    var famousIdx = 0;

    /* Personas variadas para los vecinos de cada piso, la cola, la
       clasificación y el podio: antes era siempre 🧑 (mismo emoji cinco
       veces). Aquí se eligen de un pool pequeño y neutro (sin hombres/
       mujeres ni tono de piel) para que cada planta — y cada puesto
       de los otros escenarios — tenga un vecino distinto. La
       posición 1 da el primer icono, la siguiente el segundo, etc.;
       al pasar del pool se vuelve al principio, así la distribución
       sigue siendo predecible. */
    var NEIGHBOURS = ['🧑', '👶', '🧒', '🧓', '🧑'];

    /* Edificio: una pila de plantas con dos flechas juntas DEBAJO para
       señalar el piso actual. La flecha de arriba está DESACTIVADA en
       el último piso y la de abajo en el primero: no se puede subir
       más alto del ático ni bajar más abajo de la planta baja. La
       idea de gamificación es la misma que en una app de mapas: el
       usuario navega por las plantas y la actual se queda "encendida"
       mientras las demás quedan en reposo.

       Las dos flechas van abajo, una al lado de la otra, y NO arriba y
       abajo del edificio: con la flecha arriba en responsive el botón
       se quedaba colgando del borde superior, separado del contexto.
       Juntas abajo son un único control ("estás en el piso N,
       pulsa ▲ o ▼") que sigue al edificio.

       El resaltado del piso actual aplica a cualquier piso según las
       flechas, piso 1 incluido: el edificio se recorre con ▲/▼, y el
       piso actual se queda "encendido" mientras los demás quedan en
       reposo. No hace falta ningún marcador extra en el piso 1: el
       podio de la pantalla 1 ya presentó la 🥇🥈🥉, y la cifra ordinal
       ("1.º") que precede a cada planta es lo que fija el orden. */
    var currentFloor = 1;

    function renderBuilding(total) {
      var upDisabled = currentFloor >= total ? ' disabled' : '';
      var downDisabled = currentFloor <= 1 ? ' disabled' : '';
      var rows = [];
      for (var i = total; i >= 1; i--) {
        var o = ordinalByN(i);
        var label = t('buildingFloor').replace('{n}', i);
        var isCurrent = i === currentFloor;
        var currentClass = isCurrent ? ' building-floor--current' : '';
        var person = ' <span class="building-person" aria-hidden="true">' + NEIGHBOURS[(i - 1) % NEIGHBOURS.length] + '</span>';
        rows.push(
          '<div class="building-floor' + currentClass + '">' +
          '<span class="building-floor-ord ' + o.cls + '">' + abbrev(i) + '</span>' +
          '<span class="building-floor-label">' + label + person + '</span>' +
          '</div>'
        );
      }
      rows.push(
        '<div class="building-arrows">' +
        '<button type="button" class="building-arrow building-arrow--up" id="buildingUp"' +
        upDisabled + ' aria-label="' + t('buildingArrowUp') + '">▲</button>' +
        '<button type="button" class="building-arrow building-arrow--down" id="buildingDown"' +
        downDisabled + ' aria-label="' + t('buildingArrowDown') + '">▼</button>' +
        '</div>'
      );
      return rows.join('');
    }

    /* Cola: una fila de personas con la bandera al frente. Igual que
       en el juego, pero con personas en vez de animales y con la
       cifra ordinal al lado de cada persona. La bandera es lo que fija
       por dónde empieza la cuenta, igual que en buildQueue(). */
    function renderQueue(total) {
      var cells = ['<span class="queue-flag" aria-hidden="true">🚩</span>'];
      for (var i = 1; i <= total; i++) {
        var o = ordinalByN(i);
        cells.push(
          '<span class="queue-person-cell">' +
          '<span class="queue-person-emoji" aria-hidden="true">' + NEIGHBOURS[(i - 1) % NEIGHBOURS.length] + '</span>' +
          '<span class="queue-person-ord ' + o.cls + '">' + abbrev(i) + '</span>' +
          '</span>'
        );
      }
      return cells.join('');
    }

    /* Clasificación: una tabla con los puestos del 1 al N y un
       participante al lado (emoji). Es la lectura natural de los
       ordinales en una carrera, una liga o cualquier lista de "del
       primero al último": cada fila es "1.º · 🐶", "2.º · 🐱", etc.
       Igual que la cola, no hace falta interacción: la persona ve la
       serie entera de una vez. Los emojis se toman del mismo pool
       NEIGHBOURS que el edificio y la cola, para que el visual sea
       reconocible al cambiar de slide. */
    function renderClasificacion(total) {
      var rows = [];
      for (var i = 1; i <= total; i++) {
        var o = ordinalByN(i);
        var emoji = NEIGHBOURS[(i - 1) % NEIGHBOURS.length];
        rows.push(
          '<div class="classification-row">' +
          '<span class="classification-ord ' + o.cls + '">' + abbrev(i) + '</span>' +
          '<span class="classification-emoji" aria-hidden="true">' + emoji + '</span>' +
          '</div>'
        );
      }
      return rows.join('');
    }

    /* Podio: una tarima con los tres primeros 🥇🥈🥉. El podio olímpico
       tiene tres puestos por definición: el primero arriba en el
       centro, el segundo a su izquierda, el tercero a su derecha. El
       escenario no es interactivo: una vez que alguien ve "el de oro,
       el de plata, el de bronce", ya entiende que "primero/segundo/
       tercero" se reparten así. La cifra ordinal (1.º, 2.º, 3.º) va
       DEBAJO de cada posición, no encima: si la cifra viviera arriba,
       leería "2.º 🥈" como "el segundo se llama 🥈"; al revés, la
       medalla es lo que "marca el puesto" y la cifra es la lectura
       que lo nombra. Los emojis de participante van al lado de la
       cifra, igual que en el edificio y la clasificación. */
    function renderPodium() {
      /* ORDEN VISUAL en pantalla: 🥈 🥇 🥉 (segundo a la izquierda,
         primero en el centro arriba, tercero a la derecha). El
         "primero" sube más arriba que los otros dos: la altura es lo
         que dice "ganó la carrera". Si los tres quedaran a la misma
         altura, dejaría de parecer un podio. */
      var positions = [
        { n: 2, medal: '🥈', cls: 'podium-pos--2' },
        { n: 1, medal: '🥇', cls: 'podium-pos--1' },
        { n: 3, medal: '🥉', cls: 'podium-pos--3' }
      ];
      var html = positions.map(function (p) {
        var o = ordinalByN(p.n);
        var emoji = NEIGHBOURS[(p.n - 1) % NEIGHBOURS.length];
        return '<div class="podium-pos ' + p.cls + '">' +
          '<div class="podium-medal" aria-hidden="true">' + p.medal + '</div>' +
          '<div class="podium-block">' +
            '<span class="podium-emoji" aria-hidden="true">' + emoji + '</span>' +
            '<span class="podium-ord ' + o.cls + '">' + abbrev(p.n) + '</span>' +
          '</div>' +
          '</div>';
      }).join('');
      return html;
    }

    function paintFamous() {
      var item = DATA.famous[famousIdx];
      var container = $('#famousScene');
      var labelEl = $('#famousLabel');
      var textEl = $('#famousText');
      var ariaEl = $('#famousSceneWrap');

      /* El texto explicativo (#famousText) no se pinta: el slide se
         compone solo de un título (label) y el visual. El mismo criterio
         que la galería de Formas, donde cada figura se muestra con su
         nombre y nada más — la aclaración larga está en la tabla del
         recordatorio. */
      textEl.textContent = '';

      if (item.id === 'edificio') {
        container.className = 'famous-stage famous-building';
        container.innerHTML = renderBuilding(item.n);
        container.setAttribute('aria-hidden', 'true');
        labelEl.textContent = t('buildingLabel');
        /* La aria menciona el piso destacado para que el lector de
           pantalla sepa en cuál está la persona sin tener que
           descubrirlo en el DOM. */
        ariaEl.setAttribute('aria-label', t('buildingAria')
          .replace('{n}', item.n).replace('{top}', item.n)
          .replace('{current}', currentFloor));
      } else if (item.id === 'cola') {
        container.className = 'famous-stage famous-queue';
        container.innerHTML = renderQueue(item.n);
        container.setAttribute('aria-hidden', 'true');
        labelEl.textContent = t('queueLabel');
        ariaEl.setAttribute('aria-label', t('queueAriaLabel')
          .replace('{n}', item.n));
      } else if (item.id === 'clasificacion') {
        container.className = 'famous-stage famous-classification';
        container.innerHTML = renderClasificacion(item.n);
        container.setAttribute('aria-hidden', 'true');
        labelEl.textContent = t('classificationLabel');
        ariaEl.setAttribute('aria-label', t('classificationAria')
          .replace('{n}', item.n));
      } else if (item.id === 'podio') {
        container.className = 'famous-stage famous-podium';
        container.innerHTML = renderPodium();
        container.setAttribute('aria-hidden', 'true');
        labelEl.textContent = t('podiumLabel');
        ariaEl.setAttribute('aria-label', t('podiumAria'));
      } else if (item.type === 'list') {
        /* Slide-lista: una rejilla con los ordinales que la persona
           tiene que aprender de memoria (1-9 o los redondos 11/12/20/30).
           Misma ficha que el recordatorio (cifra + medalla si la tiene +
           nombre + número natural), pero aquí se ve un subconjunto y no
           la serie entera. */
        container.className = 'famous-stage famous-list';
        container.innerHTML = renderOrdinalChips(item.ordinals);
        container.setAttribute('aria-hidden', 'true');
        labelEl.textContent = t('famous.' + item.id + '.label');
        ariaEl.setAttribute('aria-label', t('famous.' + item.id + '.aria')
          .replace('{list}', item.ordinals.map(function (n) {
            return abbrev(n) + ' (' + t('ord.' + n + 'Name') + ')';
          }).join(', ')));
      }
    }

    function famousStep(delta) {
      famousIdx = (famousIdx + delta + DATA.famous.length) % DATA.famous.length;
      /* Cada vez que se cambia de slide, el piso destacado vuelve al 1.
         Si la persona sale del edificio y vuelve, empieza de nuevo desde
         la planta baja: el "ahorro" del piso actual solo aplica dentro
         del propio slide, mientras la persona lo está explorando. */
      currentFloor = 1;
      paintFamous();
    }

    /* ============================================================
       Pantalla 3: recordatorio
       ============================================================ */

    /* Construye el HTML de un conjunto de ord-chips a partir de una lista
       de ordinales. La usan tanto el recordatorio (pantalla 3, serie
       entera) como los slides-lista de "En la vida real" (subconjunto
       de ordinales destacados). Las medallas se incluyen si el ordinal
       las tiene (1/2/3): la persona las ha visto en la pantalla 1, pero
       aquí también — el recordatorio NO es donde se quita la medalla,
       es donde se consolida la serie entera.

       La tercera pieza es "Posición N": el número natural al que
       corresponde el ordinal con la palabra "Posición" delante.
       Antes era "primer lugar" / "sexto lugar" / "cuadragésimo lugar"
       — eso era la palabra del ordinal + "lugar" y repetía la pieza
       central sin aportar información. Con "Posición N" el número
       queda ligado a su papel ("el puesto número N") sin repetir
       "primero/segundo/…". */
    function renderOrdinalChips(ordinals) {
      var html = '';
      ordinals.forEach(function (n) {
        var o = ordinalByN(n);
        var medalHtml = o.medal
          ? '<span class="ord-chip-medal" aria-hidden="true">' + o.medal + '</span>'
          : '';
        html +=
          '<div class="ord-chip">' +
          '<span class="ord-chip-figure ' + o.cls + '">' + medalHtml + abbrev(n) + '</span>' +
          '<span class="ord-chip-name ' + o.cls + '">' + t('ord.' + n + 'Name') + '</span>' +
          '<span class="ord-chip-place">' + t('placePrefix').replace('{n}', n) + '</span>' +
          '</div>';
      });
      return html;
    }

    /* La serie entera. Cada ficha lleva la cifra, la palabra y el
       número natural: las tres van juntas porque la cifra (1.º) y el
       natural (1) son las dos formas que se mezclan en el juego, y la
       palabra (primero) las conecta. El HTML se delega en
       renderOrdinalChips para no duplicar la construcción de la ficha
       entre el recordatorio y los slides-lista. */
    function paintOrdinalRow() {
      var el = $('#ordinalsRow');
      el.innerHTML = renderOrdinalChips(DATA.presentedOrdinals);
    }

    /* Una sola regla en el recordatorio: el ordinal va con su número.
       "1.º · primero · 1", "2.º · segundo · 2" — los ejemplos se pintan
       en columna para que la persona vea la misma fórmula repetida:
       cifra ordinal (con el marcador), palabra del ordinal y número
       natural al que corresponde. La tercera pieza ya NO dice
       "primer lugar" / "segundo lugar": eso era "primero" + "lugar"
       y repetía la palabra de la pieza central sin añadir información.
       La cifra ordinal (1.º) y el número natural (1) enseñan a la vez
       la forma con marcador y la forma sin él, que es justo lo que
       luego se mezcla en el juego.

       La antigua regla 2 ("la cuenta empieza en el primero, no hay
       lugar cero") se apoyaba en una miniatura de fila con bandera;
       era redundante con esta primera regla y se ha quitado: el
       conteo desde la bandera ya se entiende en el juego. */
    var RULE_ONE = [1, 2, 3, 4];

    /* "1.º · primero · Posición 1": cifra ordinal (abbrev), palabra y
       número natural (con "Posición" delante) unidos por un punto,
       que es como se leen en un cartel de puerta ("tercer piso") o
       en una lista de turnos. "Posición N" en la tercera pieza — y
       no "Nº lugar" — es lo que fija que las tres formas son la
       misma: cifra, palabra y "el puesto que ocupa", sin repetir
       "primero/segundo/…" en la última pieza. */
    function exampleFormula(n) {
      var o = ordinalByN(n);
      return '<span class="ex-figure ' + o.cls + '">' + abbrev(n) + '</span>' +
        '<span class="ex-op"> · </span>' +
        '<span class="ex-name ' + o.cls + '">' + t('ord.' + n + 'Name') + '</span>' +
        '<span class="ex-op"> · </span>' +
        '<span class="ex-natural">' + t('placePrefix').replace('{n}', n) + '</span>';
    }

    function paintRuleExamples() {
      $('#ruleMatch').innerHTML = RULE_ONE.map(function (n) {
        return '<div class="rule-example">' + exampleFormula(n) + '</div>';
      }).join('');
    }

    function bind() {
      App.utils.bindCarousel({ prev: $('#carouselPrev'), next: $('#carouselNext'), card: $('#carouselDisplay') }, carouselStep);
      $('#introNext').addEventListener('click', function () { switchTo(famousScreen); });

      $('#famousPrev2').addEventListener('click', function () { famousStep(-1); });
      /* Click delegado: las flechas del edificio (#buildingUp /
         #buildingDown) viven DENTRO de #famousScene, cuyo innerHTML se
         regenera en cada paintFamous. Adjuntar el handler al contenedor
         evita re-enganchar listeners cada vez que cambia el DOM. El
         delegate ignora otros slides (cola, listas) porque ningún botón
         suyo tiene esos ids. */
      $('#famousScene').addEventListener('click', function (e) {
        var target = e.target;
        if (target.id === 'buildingUp') {
          if (currentFloor < DATA.famous[famousIdx].n) {
            currentFloor += 1;
            paintFamous();
          }
        } else if (target.id === 'buildingDown') {
          if (currentFloor > 1) {
            currentFloor -= 1;
            paintFamous();
          }
        }
      });
      $('#famousNext2').addEventListener('click', function () { famousStep(1); });
      /* Antes había aquí listeners para los botones "← Anterior" de
         Pantalla 2 (famousBackBtn), "← Volver a los ejemplos" de
         Pantalla 3 (reminderBack), "← Volver al recordatorio" de
         Pantalla 4 (levelsBack) y "← Volver a los pasos" de Pantalla 5
         (backLevelsBtn). Se quitaron: solo queda el "← Volver" global
         de la cabecera para volver a la portada de Calculia. */
      $('#famousNextBtn').addEventListener('click', function () { switchTo(reminderScreen); });

      $('#referenceNext').addEventListener('click', function () { switchTo(levelsScreen); });

    }

    return {
      paint: function () {
        paintMedals();
        paintCarousel();
        paintFamous();
        paintOrdinalRow();
        paintRuleExamples();
      },
      bind: bind
    };
  };
})();
