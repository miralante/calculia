/* ============================================================
   Calculia â€” Los NÃºmeros
   Actividad sin test. Una sola galerÃ­a de 11 slides (4 tipos,
   cada uno en dos cards â€” exposiciÃ³n + vida real â€” mÃ¡s 3
   comparaciones), en el mismo flujo que Formas: una card
   visible, â† / â†’ para cambiar.
     â€¢ kind: 'expo'    â†’ title + visual (number line, pizzaâ€¦)
     â€¢ kind: 'real'    â†’ title + eyebrow Â«En la vida real:Â» +
                         lista de ejemplos cotidianos (sin visual)
     â€¢ kind: 'compare' â†’ title + visual, sin parte de vida real
   La frase de vida real viene como una sola lÃ­nea con ejemplos
   separados por Â« Â· Â» y se renderiza como <ul> para que cada
   ejemplo viva en su propio <li>.
   Persistencia: App.storage con clave 'los-numeros'. La primera
   vez que se llega al final suma 1 estrella; "Ver otra vez"
   no duplica el contador (awardedThisRun).
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'los-numeros';
  var $ = App.utils.$;

  /* ---- Pantallas ---- */
  var screenGallery = $('#screenGallery');
  var screenEnd = $('#screenEnd');

  /* ---- Elementos de la galerÃ­a ---- */
  var slideTitle = $('#slideTitle');
  var slideVisual = $('#slideVisual');
  var slideReal = $('#slideReal');
  var slideEyebrow = $('#slideEyebrow');
  var slidePrev = $('#slidePrev');
  var slideNext = $('#slideNext');
  var slideCounter = $('#slideCounter');
  var slideFinish = $('#slideFinish');

  /* ---- Persistencia ---- */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;
  var awardedThisRun = false;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = 'â­ ' + progress.stars; }

  var starsEl = $('#stars');

  /* ---- Estado ---- */
  var slideIndex = 0;
  var TOTAL = DATA.slides.length;

  /* ---- Visuales SVG ----
     Cada funciÃ³n pinta el visual de un slide. Devuelven el HTML
     (svg + leyenda opcional) que se inyecta con innerHTML. Las
     marcas usan las variables CSS de cada mÃ³dulo para que el
     tema (claro / oscuro / contraste) siga funcionando. */

  function lineTicks(min, max, labels, color) {
    /* Dibuja el eje horizontal y, para cada label, un tick + texto
       + cÃ­rculo en la posiciÃ³n correspondiente. labels es un
       array de { n, isMain, color, label } donde isMain agranda
       el tick. */
    var x0 = 60, x1 = 540;
    var W = 600, H = 130, midY = 70;
    var step = (x1 - x0) / (max - min);
    function pos(n) { return x0 + (n - min) * step; }

    var ticks = '';
    var sep = App.i18n.locale() === 'en' ? '.' : ',';
    labels.forEach(function (e) {
      var x = pos(e.n);
      var c = e.color || color;
      var tickH = e.isMain ? 22 : 14;
      var label = String(e.n);
      if (e.label !== undefined) label = e.label;
      else if (e.n !== Math.floor(e.n)) label = label.replace('.', sep);
      ticks += '<line x1="' + x + '" y1="' + (midY - tickH / 2) + '" x2="' + x + '" y2="' + (midY + tickH / 2) + '" stroke="' + c + '" stroke-width="3"/>';
      ticks += '<text x="' + x + '" y="' + (midY + 38) + '" text-anchor="middle" font-size="20" fill="var(--color-texto)">' + label + '</text>';
      ticks += '<circle cx="' + x + '" cy="' + midY + '" r="6" fill="' + c + '"/>';
    });

    return '' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
        '<line x1="' + x0 + '" y1="' + midY + '" x2="' + x1 + '" y2="' + midY + '" stroke="var(--color-texto)" stroke-width="2"/>' +
        ticks +
      '</svg>';
  }

  /* Tipo 1: Naturales. Recta 0..5, todos en verde. */
  function visualTypeNatural() {
    var labels = [0, 1, 2, 3, 4, 5].map(function (n) {
      return { n: n, isMain: true, color: 'var(--mod-secuencia)' };
    });
    return lineTicks(0, 5, labels, 'var(--mod-secuencia)');
  }

  /* Tipo 2: Enteros. Recta -3..3, todos en azul. */
  function visualTypeEntero() {
    var labels = [];
    for (var n = -3; n <= 3; n++) {
      labels.push({ n: n, isMain: true, color: 'var(--mod-coordinacion)' });
    }
    return lineTicks(-3, 3, labels, 'var(--mod-coordinacion)');
  }

  /* Tipo 3: Decimales. Recta 0..2 con 0, 0,5, 1, 1,5, 2. Los
     naturales (0, 1, 2) en verde y los decimales (0,5 y 1,5)
     en morado. El contraste de color dice que las dos cosas
     conviven en la misma recta. */
  function visualTypeDecimal() {
    var labels = [
      { n: 0,   isMain: true,  color: 'var(--mod-secuencia)' },
      { n: 0.5, isMain: false, color: 'var(--mod-emocional)' },
      { n: 1,   isMain: true,  color: 'var(--mod-secuencia)' },
      { n: 1.5, isMain: false, color: 'var(--mod-emocional)' },
      { n: 2,   isMain: true,  color: 'var(--mod-secuencia)' }
    ];
    return lineTicks(0, 2, labels, 'var(--mod-emocional)');
  }


  /* ComparaciÃ³n 1: Naturales y Enteros. Dos rectas paralelas:
     arriba los naturales (0..5), abajo los enteros (-3..3).
     El ojo ve que la de los enteros es "mÃ¡s grande". */
  function visualCompNE() {
    var natLabels = [0, 1, 2, 3, 4, 5].map(function (n) {
      return { n: n, isMain: true, color: 'var(--mod-secuencia)' };
    });
    var entLabels = [];
    for (var n = -3; n <= 3; n++) {
      entLabels.push({ n: n, isMain: true, color: 'var(--mod-coordinacion)' });
    }
    return '' +
      '<div class="comp-stack">' +
        lineTicks(0, 5, natLabels, 'var(--mod-secuencia)') +
        lineTicks(-3, 3, entLabels, 'var(--mod-coordinacion)') +
      '</div>';
  }

  /* ComparaciÃ³n 2: Naturales y Decimales. Una sola recta 0..2
     con naturales en verde y decimales en morado. Los decimales
     "rellenan" los huecos entre naturales. */
  function visualCompND() {
    var labels = [
      { n: 0,   isMain: true,  color: 'var(--mod-secuencia)' },
      { n: 0.5, isMain: false, color: 'var(--mod-emocional)' },
      { n: 1,   isMain: true,  color: 'var(--mod-secuencia)' },
      { n: 1.5, isMain: false, color: 'var(--mod-emocional)' },
      { n: 2,   isMain: true,  color: 'var(--mod-secuencia)' }
    ];
    return lineTicks(0, 2, labels, 'var(--mod-emocional)');
  }


  function renderVisual(kind) {
    if (kind === 'typeNatural')  return visualTypeNatural();
    if (kind === 'typeEntero')   return visualTypeEntero();
    if (kind === 'typeDecimal')  return visualTypeDecimal();
    if (kind === 'typeFraccion') return visualTypeFraccion();
    if (kind === 'compNE')       return visualCompNE();
    if (kind === 'compND')       return visualCompND();
    if (kind === 'compNF')       return visualCompNF();
    return '';
  }

  /* ---- Pintado del slide actual ---- */
  /* La misma card (slideTitle, slideEyebrow, slideVisual, slideReal)
     se rellena segÃºn el kind del slide:
       â€¢ expo:    muestra solo tÃ­tulo y visual. Eyebrow y lista
                  de vida real quedan ocultos.
       â€¢ real:    muestra tÃ­tulo, eyebrow Â«En la vida real:Â» y la
                  lista de ejemplos. Visual oculto (la exposiciÃ³n
                  ya se vio en el slide anterior del mismo tipo).
       â€¢ compare: muestra tÃ­tulo y visual (la comparaciÃ³n no tiene
                  parte de vida real separada).
     El tÃ­tulo del slide es siempre el mismo para los dos slides
     del mismo tipo (Â«NaturalesÂ», Â«EnterosÂ», â€¦), asÃ­ la persona
     sabe que los dos pertenecen a la misma lecciÃ³n. */
  function renderSlide() {
    var s = DATA.slides[slideIndex];
    slideTitle.textContent = App.i18n.t('slide' + s.id + 'Title') || '';

    /* Eyebrow Â«En la vida real:Â» solo en kind: 'real'. */
    if (s.kind === 'real') {
      slideEyebrow.classList.remove('hidden');
    } else {
      slideEyebrow.classList.add('hidden');
    }

    /* Visual en expo y compare; oculto en real. */
    if (s.kind === 'real') {
      slideVisual.innerHTML = '';
      slideVisual.classList.add('hidden');
    } else {
      slideVisual.innerHTML = renderVisual(s.visual);
      slideVisual.classList.remove('hidden');
      /* Los <text data-i18n> dentro de los SVG se traducen con
         App.i18n.apply cuando se inyectan por innerHTML. */
      if (App.i18n && typeof App.i18n.apply === 'function') {
        App.i18n.apply(slideVisual);
      }
    }

    /* Lista de vida real solo en kind: 'real'. La cadena viene como
       una sola lÃ­nea con Â« Â· Â» entre ejemplos; aquÃ­ se rompe. */
    slideReal.innerHTML = '';
    if (s.kind === 'real') {
      var raw = App.i18n.t('slide' + s.id + 'Real') || '';
      var parts = raw.split(/\s*Â·\s*/).filter(function (p) { return p.length > 0; });
      parts.forEach(function (p) {
        var li = document.createElement('li');
        /* textContent evita cualquier escape problemÃ¡tico del
           primer emoji de la cadena. */
        li.textContent = p;
        slideReal.appendChild(li);
      });
      slideReal.classList.remove('hidden');
    } else {
      slideReal.classList.add('hidden');
    }

    slideCounter.textContent = (slideIndex + 1) + ' / ' + TOTAL;
    slidePrev.disabled = slideIndex === 0;
    slideNext.disabled = slideIndex === TOTAL - 1;
    if (slideIndex === TOTAL - 1) {
      slideFinish.classList.remove('hidden');
    } else {
      slideFinish.classList.add('hidden');
    }
  }

  function goSlide(delta) {
    var next = slideIndex + delta;
    if (next < 0 || next >= TOTAL) return;
    slideIndex = next;
    renderSlide();
  }

  /* ---- Cierre ---- */
  function finishActivity() {
    if (!awardedThisRun) {
      progress.stars += 1;
      progress.completedRounds = (progress.completedRounds || 0) + 1;
      awardedThisRun = true;
      save();
    }
    endSummary.textContent = App.i18n.t('endSummary')
      .replace('{stars}', progress.stars);
    App.feedback.celebrate(App.i18n.t('endTitle'));
    screenGallery.classList.add('hidden');
    screenEnd.classList.remove('hidden');
    paintStars();
  }

  function restart() {
    slideIndex = 0;
    renderSlide();
    screenEnd.classList.add('hidden');
    screenGallery.classList.remove('hidden');
  }

  /* ---- Eventos ---- */
  slidePrev.addEventListener('click', function () { goSlide(-1); });
  slideNext.addEventListener('click', function () { goSlide(1); });
  slideFinish.addEventListener('click', finishActivity);
  /* btnRepeat was removed during the 25-activity end-stage cleanup
     (memory entry 2026-10-13). If a future batch re-adds the button,
     wire it back to restart(). */
  var elBtnRepeat = $('#btnRepeat');
  if (elBtnRepeat) elBtnRepeat.addEventListener('click', restart);


  /* Estado inicial: arranca en el primer slide. */
  renderSlide();
  paintStars();
})();
