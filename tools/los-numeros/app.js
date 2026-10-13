/* ============================================================
   Calculia — Los Números
   Esta actividad NO tiene test. Es un recorrido de presentación:
     1) screenIntro: 4 tarjetas con los tipos.
     2) screenSlides: carrusel con 3 comparaciones
        (naturales↔enteros, naturales↔decimales, naturales↔fracciones).
        Cada slide tiene un SVG generado aquí: dos rectas
        numéricas (zoom) o una pizza con partes.
     3) screenReal: 4 tarjetas de "vida real", una por tipo.
     4) screenEnd: cierre. +1 estrella por completar la actividad
        una vez (las siguientes no suman, como en el resto de
        actividades de presentación de la suite).
   Persistencia: App.storage con clave 'los-numeros'. Guarda
   stars (cuántas veces se ha llegado al final) y completedRounds.
   El final suma 1 estrella solo si no se ha llegado al final
   antes en la sesión: si la persona repite, ya no se duplica.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'los-numeros';
  var $ = App.utils.$;

  /* ---- Pantallas ---- */
  var screenIntro = $('#screenIntro');
  var screenSlides = $('#screenSlides');
  var screenReal = $('#screenReal');
  var screenEnd = $('#screenEnd');

  /* ---- Elementos del carrusel de comparaciones ---- */
  var slideTitle = $('#slideTitle');
  var slideBody = $('#slideBody');
  var slideVisual = $('#slideVisual');
  var slidePrev = $('#slidePrev');
  var slideNext = $('#slideNext');
  var slideCounter = $('#slideCounter');
  var slidesContinue = $('#slidesContinue');

  /* ---- Elementos de la vida real ---- */
  var realGrid = $('#realGrid');

  /* ---- Elementos del cierre ---- */
  var endSummary = $('#endSummary');
  var starsEl = $('#stars');

  /* ---- Persistencia ---- */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;
  /* awardedThisRun se resetea cada vez que se entra a la actividad
     desde el principio: solo se concede la estrella de cierre una
     vez por sesión de presentación, no por cada "Ver otra vez". */
  var awardedThisRun = false;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Estado del carrusel ---- */
  var slideIndex = 0;
  var TOTAL_SLIDES = DATA.slides.length;

  /* ---- Visuales SVG ----
     Cada función devuelve el HTML del SVG para meterlo con
     innerHTML. Se usan viewBox para que escale a cualquier
     ancho disponible. El color de cada tipo se toma de la
     variable CSS correspondiente para que el tema (claro /
     oscuro / contraste) siga funcionando. */

  /* Recta numérica de -3 a 3. Naturales (0, 1, 2, 3) en verde;
     enteros negativos (-1, -2, -3) en azul. Sirve para ver
     que los naturales son un subconjunto de los enteros. */
  function visualRectaNE() {
    var W = 600, H = 130;
    var x0 = 60, x1 = W - 60, midY = 70;
    var min = -3, max = 3;
    var step = (x1 - x0) / (max - min);
    function pos(n) { return x0 + (n - min) * step; }

    var ticks = '';
    for (var n = min; n <= max; n++) {
      var x = pos(n);
      var isNatural = n >= 0;
      var color = isNatural ? 'var(--mod-secuencia)' : 'var(--mod-coordinacion)';
      var isZero = n === 0;
      var tickH = isZero ? 22 : 14;
      ticks += '<line x1="' + x + '" y1="' + (midY - tickH / 2) + '" x2="' + x + '" y2="' + (midY + tickH / 2) + '" stroke="' + color + '" stroke-width="3"/>';
      ticks += '<text x="' + x + '" y="' + (midY + 38) + '" text-anchor="middle" font-size="20" fill="var(--color-texto)">' + (n === 0 ? '0' : n) + '</text>';
      ticks += '<circle cx="' + x + '" cy="' + midY + '" r="5" fill="' + color + '"/>';
    }

    var html = '' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Recta de -3 a 3">' +
        '<line x1="' + x0 + '" y1="' + midY + '" x2="' + x1 + '" y2="' + midY + '" stroke="var(--color-texto)" stroke-width="2"/>' +
        ticks +
      '</svg>' +
      '<div class="slide-legend">' +
        '<span class="legend-dot" style="background: var(--mod-secuencia);"></span><span data-i18n="legendNaturales">Naturales</span>' +
        '<span class="legend-dot" style="background: var(--mod-coordinacion);"></span><span data-i18n="legendEnteros">Enteros (los de debajo de 0)</span>' +
      '</div>';
    return html;
  }

  /* Recta de 0 a 2 con marcas a 0, 0,5, 1, 1,5, 2. Los naturales
     (0, 1, 2) en verde y los decimales (0,5 y 1,5) en morado.
     Muestra que los decimales "rellenan los huecos" entre
     naturales. */
  function visualRectaND() {
    var W = 600, H = 130;
    var x0 = 60, x1 = W - 60, midY = 70;
    var min = 0, max = 2;
    var step = (x1 - x0) / (max - min);
    function pos(n) { return x0 + (n - min) * step; }

    /* Marcas a 0, 0.5, 1, 1.5, 2. Las naturales (enteros) llevan
       tick más alto; las decimales (mitades) tick más bajo.
       En el archivo de datos los números están en formato ES
       (coma): "0,5". Aquí pintamos la etiqueta con punto o
       coma según el locale. */
    var labels = [
      { n: 0,   natural: true },
      { n: 0.5, natural: false },
      { n: 1,   natural: true },
      { n: 1.5, natural: false },
      { n: 2,   natural: true }
    ];
    var loc = App.i18n.locale();
    var sep = loc === 'en' ? '.' : ',';

    var ticks = '';
    labels.forEach(function (e) {
      var x = pos(e.n);
      var color = e.natural ? 'var(--mod-secuencia)' : 'var(--mod-emocional)';
      var tickH = e.natural ? 22 : 14;
      var label = e.n === 0 || e.n === 1 || e.n === 2
        ? String(e.n)
        : e.n.toString().replace('.', sep);
      ticks += '<line x1="' + x + '" y1="' + (midY - tickH / 2) + '" x2="' + x + '" y2="' + (midY + tickH / 2) + '" stroke="' + color + '" stroke-width="3"/>';
      ticks += '<text x="' + x + '" y="' + (midY + 38) + '" text-anchor="middle" font-size="20" fill="var(--color-texto)">' + label + '</text>';
      ticks += '<circle cx="' + x + '" cy="' + midY + '" r="5" fill="' + color + '"/>';
    });

    return '' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Recta de 0 a 2">' +
        '<line x1="' + x0 + '" y1="' + midY + '" x2="' + x1 + '" y2="' + midY + '" stroke="var(--color-texto)" stroke-width="2"/>' +
        ticks +
      '</svg>' +
      '<div class="slide-legend">' +
        '<span class="legend-dot" style="background: var(--mod-secuencia);"></span><span data-i18n="legendNaturales">Naturales</span>' +
        '<span class="legend-dot" style="background: var(--mod-emocional);"></span><span data-i18n="legendDecimales">Decimales (entre dos naturales)</span>' +
      '</div>';
  }

  /* Pizza dividida: dos círculos. Uno entero (1, natural) y otro
     cortado en 4 partes, con 1 parte coloreada (1/4, fracción).
     Sirve para ver que "1 pizza" es un natural y "1/4 de pizza"
     es una fracción. */
  function visualPizza() {
    var cx1 = 150, cy = 110, r = 90;
    var cx2 = 450;

    function pizzaPath(cx, cy, r) {
      return 'M ' + cx + ' ' + (cy - r) +
             ' A ' + r + ' ' + r + ' 0 1 1 ' + cx + ' ' + (cy + r) +
             ' A ' + r + ' ' + r + ' 0 1 1 ' + cx + ' ' + (cy - r) + ' Z';
    }
    /* Para partir en 4: dos elipses perpendiculares (cruces). */
    function slicePath(cx, cy, r, startAngle, endAngle) {
      var sx = cx + r * Math.cos(startAngle);
      var sy = cy + r * Math.sin(startAngle);
      var ex = cx + r * Math.cos(endAngle);
      var ey = cy + r * Math.sin(endAngle);
      var large = endAngle - startAngle > Math.PI ? 1 : 0;
      return 'M ' + cx + ' ' + cy + ' L ' + sx + ' ' + sy + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + ex + ' ' + ey + ' Z';
    }

    /* Pizza 1: entera (un solo path). */
    var p1 = pizzaPath(cx1, cy, r);
    /* Pizza 2: 4 cuartos, uno de cada color. */
    var quarters = '';
    var quarterColors = ['#FFD9A8', 'var(--mod-memoria)', '#FFE5C2', '#FFE5C2'];
    var labels = [
      { angle: -Math.PI / 2, label: '1/4' },
      { angle: 0,           label: '1/4' },
      { angle: Math.PI / 2, label: '1/4' },
      { angle: Math.PI,     label: '1/4' }
    ];
    for (var i = 0; i < 4; i++) {
      var startAngle = -Math.PI / 2 + i * (Math.PI / 2);
      var endAngle = startAngle + Math.PI / 2;
      quarters += '<path d="' + slicePath(cx2, cy, r, startAngle, endAngle) + '" fill="' + quarterColors[i] + '" stroke="var(--color-texto)" stroke-width="2"/>';
    }
    /* El cuarto coloreado se identifica con un trazo más fuerte. */
    var colouredStart = -Math.PI / 2;
    var colouredEnd = colouredStart + Math.PI / 2;
    var colouredPath = slicePath(cx2, cy, r, colouredStart, colouredEnd);
    quarters += '<path d="' + colouredPath + '" fill="var(--mod-memoria)" stroke="var(--color-texto)" stroke-width="3"/>';
    /* Líneas divisorias (re-pintar por encima para que se vean). */
    for (var j = 0; j < 4; j++) {
      var ang = -Math.PI / 2 + j * (Math.PI / 2);
      var lx = cx2 + r * Math.cos(ang);
      var ly = cy + r * Math.sin(ang);
      quarters += '<line x1="' + cx2 + '" y1="' + cy + '" x2="' + lx + '" y2="' + ly + '" stroke="var(--color-texto)" stroke-width="2"/>';
    }

    return '' +
      '<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pizza entera y pizza partida en cuartos">' +
        /* Pizza 1: entera */
        '<path d="' + p1 + '" fill="#FFD9A8" stroke="var(--color-texto)" stroke-width="2"/>' +
        '<text x="' + cx1 + '" y="' + (cy + r + 32) + '" text-anchor="middle" font-size="22" font-weight="700" fill="var(--color-texto)" data-i18n="pizzaEntero">1 pizza</text>' +
        /* Pizza 2: 4 cuartos */
        quarters +
        '<text x="' + cx2 + '" y="' + (cy + r + 32) + '" text-anchor="middle" font-size="22" font-weight="700" fill="var(--color-texto)" data-i18n="pizzaCuarto">1/4 de pizza</text>' +
      '</svg>' +
      '<div class="slide-legend">' +
        '<span class="legend-dot" style="background: #FFD9A8;"></span><span data-i18n="legendNaturales">Naturales (1 entero)</span>' +
        '<span class="legend-dot" style="background: var(--mod-memoria);"></span><span data-i18n="legendFracciones">Fracciones (1 parte de 4)</span>' +
      '</div>';
  }

  function renderSlideVisual(kind) {
    if (kind === 'rectaNE') return visualRectaNE();
    if (kind === 'rectaND') return visualRectaND();
    if (kind === 'pizza') return visualPizza();
    return '';
  }

  /* ---- Pintado del slide actual ---- */
  function renderSlide() {
    var s = DATA.slides[slideIndex];
    var titleKey = 'slide' + s.id + 'Title';
    var bodyKey = 'slide' + s.id + 'Body';
    slideTitle.textContent = App.i18n.t(titleKey) || '';
    slideBody.textContent = App.i18n.t(bodyKey) || '';
    slideVisual.innerHTML = renderSlideVisual(s.visual);
    /* El SVG tiene data-i18n en algunos <text>. Re-aplicamos las
       traducciones: i18n.js rellena data-i18n al cargar, pero los
       nodos se han metido por innerHTML ahora. */
    if (App.i18n && typeof App.i18n.apply === 'function') {
      App.i18n.apply(slideVisual);
    }
    slideCounter.textContent = (slideIndex + 1) + ' / ' + TOTAL_SLIDES;
    slidePrev.disabled = slideIndex === 0;
    slideNext.disabled = slideIndex === TOTAL_SLIDES - 1;
    /* El botón "Ver en la vida real" solo aparece en el último slide. */
    if (slideIndex === TOTAL_SLIDES - 1) {
      slidesContinue.classList.remove('hidden');
    } else {
      slidesContinue.classList.add('hidden');
    }
  }

  function goSlide(delta) {
    var next = slideIndex + delta;
    if (next < 0 || next >= TOTAL_SLIDES) return;
    slideIndex = next;
    renderSlide();
  }

  /* ---- Pintado de las tarjetas de vida real ---- */
  function renderRealLife() {
    realGrid.innerHTML = '';
    DATA.real.forEach(function (item) {
      var title = App.i18n.t('real' + capitalize(item.id) + 'Title') || '';
      var icon = App.i18n.t(item.iconKey) || '';
      var examples = App.i18n.t(item.examplesKey) || '';
      var card = document.createElement('article');
      card.className = 'real-card real-card-' + item.id;
      card.innerHTML = '' +
        '<div class="real-emoji" aria-hidden="true">' + item.emoji + '</div>' +
        '<h3>' + title + '</h3>' +
        '<p class="real-icon">' + icon + '</p>' +
        '<p class="real-examples">' + examples + '</p>';
      realGrid.appendChild(card);
    });
    /* Re-aplicar data-i18n por si hay traducciones. */
    if (App.i18n && typeof App.i18n.apply === 'function') {
      App.i18n.apply(realGrid);
    }
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---- Navegación entre pantallas ---- */
  function showScreen(name) {
    [screenIntro, screenSlides, screenReal, screenEnd].forEach(function (el) {
      el.classList.add('hidden');
    });
    if (name === 'intro') screenIntro.classList.remove('hidden');
    else if (name === 'slides') screenSlides.classList.remove('hidden');
    else if (name === 'real') screenReal.classList.remove('hidden');
    else if (name === 'end') screenEnd.classList.remove('hidden');
  }

  function startSlides() {
    slideIndex = 0;
    renderSlide();
    showScreen('slides');
  }

  function goToReal() {
    renderRealLife();
    showScreen('real');
  }

  function finishActivity() {
    /* Una estrella por completar la actividad una vez en esta
       entrada. Si la persona pulsa "Ver otra vez" y vuelve a
       llegar al final, no se duplica. */
    if (!awardedThisRun) {
      progress.stars += 1;
      progress.completedRounds = (progress.completedRounds || 0) + 1;
      awardedThisRun = true;
      save();
    }
    endSummary.textContent = App.i18n.t('endSummary')
      .replace('{stars}', progress.stars);
    App.feedback.celebrate(App.i18n.t('endTitle'));
    showScreen('end');
    paintStars();
  }

  function backToIntro() {
    showScreen('intro');
  }

  /* ---- Eventos ---- */
  $('#introContinue').addEventListener('click', startSlides);
  slidePrev.addEventListener('click', function () { goSlide(-1); });
  slideNext.addEventListener('click', function () { goSlide(1); });
  slidesContinue.addEventListener('click', goToReal);
  $('#realContinue').addEventListener('click', finishActivity);
  $('#btnRepeat').addEventListener('click', startSlides);
  $('#btnMenu').addEventListener('click', backToIntro);

  paintStars();
})();
