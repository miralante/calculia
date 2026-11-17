/* ============================================================
   Calculia — Números ordinales: los dibujos.

   Solo HTML. La plantilla compartida (assets/js/activity-flow.js) pinta
   las pantallas; este fichero dice qué se dibuja en cada una:
     - la explicación: la carrera de llegada y la serie (intro),
     - los ejemplos de la vida real: el podio, la clasificación, la cola
       y el edificio (real),
     - el recordatorio: la serie entera y la regla (reminder).
   Las medallas, las personas y los corredores son SVG o emoji en línea:
   se ven igual en cualquier sistema, y la cifra y la palabra siempre
   llevan el significado, nunca solo el color.

   Expone window.App.ordinalsVisuals.
   ============================================================ */
(function () {
  'use strict';

  function t(key) { return App.i18n.t(key); }

  /* Cifra abreviada del ordinal: el dígito pegado al indicador de
     ordinal (en español) o al sufijo st/nd/rd/th (en inglés). Se
     concatena en runtime y nunca aparece como literal en el fuente: así
     lo exige scripts/check.js (punto 6.1), que prohíbe por substring las
     formas abreviadas en todo lo que se sirve al navegador. */
  function abbrev(n) {
    if (App.i18n.locale() === 'en') {
      var sfx = (n % 100 >= 11 && n % 100 <= 13) ? 'th'
              : (n % 10 === 1) ? 'st'
              : (n % 10 === 2) ? 'nd'
              : (n % 10 === 3) ? 'rd'
              : 'th';
      return n + sfx;
    }
    return n + 'º';
  }

  /* Medallas: oro, plata y bronce, con su cinta de dos colores. */
  var MEDAL_FILL = { 1: '#D4A017', 2: '#9AA3AD', 3: '#B0703C' };
  function medalSvg(n) {
    return '<svg class="medal-svg" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
      '<path d="M10 2h8l4 12-6 2z" fill="#00695C"/>' +
      '<path d="M22 2h8l-6 14-6-2z" fill="#B3446C"/>' +
      '<circle cx="20" cy="27" r="11" fill="' + MEDAL_FILL[n] + '"/>' +
      '</svg>';
  }

  /* Personas neutras en las escenas de la vida real (edificio, cola, podio).
     La lista es corta y no tiene género ni tono de piel. */
  var NEIGHBOURS = ['🧑', '👶', '🧒', '🧓', '🧑'];
  function neighbourEmoji(n) { return NEIGHBOURS[(n - 1) % NEIGHBOURS.length]; }

  /* Colores de equipación de la clasificación: uno por puesto. */
  var KIT = ['#1E5BB8', '#2E7D32', '#6A3FA0', '#C0632A', '#B3446C'];

  /* Busto de futbolista con su equipación, cuello blanco y un balón al lado. */
  function footballerSvg(n) {
    var kit = KIT[(n - 1) % KIT.length];
    return '<svg class="person-svg" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" focusable="false">' +
      '<path d="M4 28c0-6.5 4.5-10 10-10s10 3.5 10 10z" fill="' + kit + '"/>' +
      '<path d="M11 18.2 14 22l3-3.8" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<rect x="12.2" y="14" width="3.6" height="4.5" fill="#F1C27D"/>' +
      '<circle cx="14" cy="9.5" r="5" fill="#F1C27D"/>' +
      '<path d="M9 9c0-3.4 2.2-5.2 5-5.2s5 1.8 5 5.2c-1.2-1.6-2.8-2.4-5-2.4S10.2 7.4 9 9z" fill="#3B2A1A"/>' +
      '<circle cx="22.2" cy="23.2" r="3.4" fill="#FFFFFF" stroke="#14161E" stroke-width="0.8"/>' +
      '<path d="M22.2 21.4l1.3.9-.5 1.5h-1.6l-.5-1.5z" fill="#14161E"/>' +
      '</svg>';
  }

  /* Corredor de la llegada: trazos y cabeza, en el color del texto. */
  function runnerSvg() {
    return '<svg class="runner-svg" width="26" height="30" viewBox="0 0 26 30" aria-hidden="true" focusable="false">' +
      '<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M15 10.5 12 18"/>' +
      '<path d="M14 11.5 19.5 15"/>' +
      '<path d="M14 11.5 9 12.5"/>' +
      '<path d="M12 18 17.5 25"/>' +
      '<path d="M12 18 6.5 24"/>' +
      '</g>' +
      '<circle cx="17" cy="5" r="3.4" fill="currentColor"/>' +
      '</svg>';
  }

  /* ---- Explicación: la carrera de llegada (primera diapositiva) ---- */
  function raceHtml() {
    var names = [1, 2, 3].map(function (n) { return abbrev(n) + ' ' + t('ord.' + n + 'Name'); }).join('; ');
    return '<div class="stops-row" role="img" aria-label="' + names + '">' +
      '<div class="race-lanes">' + [1, 2, 3].map(function (n) {
        var o = ordinalByN(n);
        return '<div class="race-lane ' + o.cls + '">' +
          '<span class="race-label">' +
            '<span class="race-ord">' + abbrev(n) + '</span>' +
            '<span class="race-name">' + t('ord.' + n + 'Name') + '</span>' +
          '</span>' +
          '<span class="race-track">' +
            '<span class="race-runner race-runner--' + n + '" aria-hidden="true">' + runnerSvg() + '</span>' +
            '<span class="race-tape" aria-hidden="true"></span>' +
          '</span>' +
        '</div>';
      }).join('') + '</div>' +
    '</div>';
  }

  /* ---- Explicación: un ordinal solo, con su cifra, su palabra y su lugar ---- */
  function heroHtml(n) {
    var o = ordinalByN(n);
    return '<div class="ordinal-hero-wrap" role="img" aria-label="' + abbrev(n) + ' — ' + t('ord.' + n + 'Name') + '">' +
      '<span class="ordinal-hero ' + o.cls + '" aria-hidden="true">' + abbrev(n) + '</span>' +
      '<span class="ordinal-hero-name ' + o.cls + '" aria-hidden="true">' + t('ord.' + n + 'Name') + '</span>' +
      '<span class="ordinal-hero-place" aria-hidden="true">' + t('placePrefix').replace('{n}', n) + '</span>' +
    '</div>';
  }

  /* ---- Ejemplos de la vida real ---- */

  /* Edificio: los pisos se cuentan de abajo arriba, con el piso que se
     señala resaltado y su etiqueta. */
  function buildingHtml(total, here) {
    var rows = [];
    for (var i = total; i >= 1; i--) {
      var o = ordinalByN(i);
      var isHere = i === here;
      rows.push(
        '<div class="building-floor ' + o.cls + (isHere ? ' building-floor--current' : '') + '">' +
          '<span class="building-floor-ord ' + o.cls + '">' + abbrev(i) + '</span>' +
          '<span class="building-floor-label">' + t('buildingFloor').replace('{n}', i) + '</span>' +
          (isHere ? '<span class="building-here">' + t('buildingHere') + '</span>' : '') +
          '<span class="building-person" aria-hidden="true">' + neighbourEmoji(i) + '</span>' +
        '</div>'
      );
    }
    return rows.join('');
  }

  /* Cola: la ventanilla delante y las personas en fila, cada una con su figura. */
  function queueHtml(total) {
    var cells = ['<span class="queue-counter" aria-hidden="true">' + t('queueCounter') + '</span>'];
    for (var i = 1; i <= total; i++) {
      var o = ordinalByN(i);
      cells.push(
        '<span class="queue-person-cell">' +
          '<span class="queue-person-figure" aria-hidden="true">' + neighbourEmoji(i) + '</span>' +
          '<span class="queue-person-ord ' + o.cls + '">' + abbrev(i) + '</span>' +
        '</span>'
      );
    }
    return cells.join('');
  }

  /* Clasificación: una lista de primero a último, con su busto a la derecha. */
  function rankingHtml(total) {
    var rows = [];
    for (var i = 1; i <= total; i++) {
      var o = ordinalByN(i);
      rows.push(
        '<div class="classification-row ' + o.cls + '">' +
          '<span class="classification-ord ' + o.cls + '">' + abbrev(i) + '</span>' +
          '<span class="classification-person" aria-hidden="true">' + footballerSvg(i) + '</span>' +
        '</div>'
      );
    }
    return rows.join('');
  }

  /* Podio: el primero en el centro y más alto; el segundo a su izquierda
     y el tercero a su derecha. */
  function podiumHtml() {
    var positions = [
      { n: 2, cls: 'podium-pos--2' },
      { n: 1, cls: 'podium-pos--1' },
      { n: 3, cls: 'podium-pos--3' }
    ];
    return positions.map(function (p) {
      var o = ordinalByN(p.n);
      return '<div class="podium-pos ' + p.cls + '">' +
        '<div class="podium-medal">' + medalSvg(p.n) + '</div>' +
        '<div class="podium-block">' +
          '<span class="podium-person" aria-hidden="true">' + neighbourEmoji(p.n) + '</span>' +
          '<span class="podium-ord ' + o.cls + '">' + abbrev(p.n) + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function realHtml(spec) {
    var aria, body, cls;
    if (spec.id === 'edificio') {
      cls = 'famous-stage famous-building';
      body = buildingHtml(spec.n, DATA.buildingHere);
      aria = t('buildingAria').replace('{n}', spec.n).replace('{top}', spec.n)
        .replace('{current}', DATA.buildingHere);
    } else if (spec.id === 'cola') {
      cls = 'famous-stage famous-queue';
      body = queueHtml(spec.n);
      aria = t('queueAriaLabel').replace('{n}', spec.n);
    } else if (spec.id === 'clasificacion') {
      cls = 'famous-stage famous-classification';
      body = rankingHtml(spec.n);
      aria = t('classificationAria').replace('{n}', spec.n);
    } else {
      cls = 'famous-stage famous-podium';
      body = podiumHtml();
      aria = t('podiumAria');
    }
    return '<div class="' + cls + '" role="img" aria-label="' + aria + '">' + body + '</div>';
  }

  /* ---- Recordatorio: la serie entera en fichas y la regla con ejemplos ---- */

  /* Una ficha por ordinal: la cifra (con su medalla en los tres primeros),
     la palabra y el lugar. El color de la franja sigue la clase del ordinal;
     la cifra y la palabra van siempre escritas. */
  function chipsHtml(ordinals) {
    return ordinals.map(function (n) {
      var o = ordinalByN(n);
      var medal = n <= 3 ? medalSvg(n) : '';
      return '<div class="ord-chip ' + o.cls + '">' +
        '<span class="ord-chip-figure ' + o.cls + '">' + medal + abbrev(n) + '</span>' +
        '<span class="ord-chip-name">' + t('ord.' + n + 'Name') + '</span>' +
        '<span class="ord-chip-place">' + t('placePrefix').replace('{n}', n) + '</span>' +
      '</div>';
    }).join('');
  }

  /* La regla: cifra · palabra · lugar, con cuatro ejemplos. */
  var RULE_ONE = [1, 2, 3, 4];
  function exampleHtml(n) {
    var o = ordinalByN(n);
    return '<div class="rule-example">' +
      '<span class="ex-figure ' + o.cls + '">' + abbrev(n) + '</span>' +
      '<span class="ex-op"> · </span>' +
      '<span class="ex-name">' + t('ord.' + n + 'Name') + '</span>' +
      '<span class="ex-op"> · </span>' +
      '<span class="ex-natural">' + t('placePrefix').replace('{n}', n) + '</span>' +
    '</div>';
  }

  function reminderHtml() {
    return '<p class="reference-text">' + t('reminderText') + '</p>' +
      '<div class="ordinals-row">' + chipsHtml(DATA.presentedOrdinals) + '</div>' +
      '<p class="rule-title">' + t('ruleMatchTitle') + '</p>' +
      RULE_ONE.map(exampleHtml).join('');
  }

  /* ---- Lo que usa la plantilla: la explicación, los ejemplos y el recordatorio ---- */
  App.ordinalsVisuals = {
    abbrev: abbrev,
    /* spec: { kind: 'race' } o { kind: 'ordinal', n } */
    intro: function (spec) {
      return spec.kind === 'race' ? raceHtml() : heroHtml(spec.n);
    },
    /* spec: { id, n } de DATA.real */
    real: realHtml,
    reminder: reminderHtml
  };
})();
