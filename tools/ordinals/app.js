/* ============================================================
   Calculia — Números ordinales.

   Usa la plantilla compartida (assets/js/activity-flow.js, modo
   'options'), igual que Pares e impares:
     1. explicación: la carrera de llegada y la serie, con ← →;
     2. ejemplos de la vida real: el podio, la clasificación, la cola y
        el edificio;
     3. recordatorio: la serie entera y la regla;
     4. test: cinco preguntas, una por pantalla, con su cierre.

   Este fichero dice qué pregunta sale: la fila de animales con la
   meta delante y un lugar señalado, la pregunta de quién está en un
   lugar, y los modos de texto (cifra ↔ palabra). Los dibujos están en
   screens.js, los datos en data.js y los textos en strings.<locale>.js.

   Dos decisiones que conviene no deshacer sin pensarlo:
   - Las opciones falsas son los LUGARES VECINOS (target±1), no números
     cualesquiera. El error real de un ordinal es contar desde el otro
     extremo o empezar por cero.
   - El recordatorio avisa de que no hay un "lugar cero": la meta no es
     el puesto número cero.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;
  var fill = App.utils.fill;
  var rint = App.utils.rint;
  var V = App.ordinalsVisuals;
  var abbrev = V.abbrev;

  /* Etiqueta de cada ejemplo de la vida real (la que va bajo el dibujo). */
  var REAL_LABEL = {
    podio: 'podiumLabel',
    clasificacion: 'classificationLabel',
    cola: 'queueLabel',
    edificio: 'buildingLabel'
  };

  /* La fila del test: n animales, la meta al frente y, si se pregunta el
     lugar, una flecha sobre el que se señala. */
  function buildQueue(itemsCount, target, showPointer) {
    var row = App.utils.shuffle(DATA.queueMembers.slice()).slice(0, itemsCount);
    var pointerRow = showPointer
      ? '<div class="queue-row queue-pointers" aria-hidden="true">' +
        '<span class="queue-start-spacer"></span>' +
        row.map(function (_, i) {
          return '<span class="queue-pointer">' + (i + 1 === target ? '⬇️' : '') + '</span>';
        }).join('') +
        '</div>'
      : '';
    var queue = '<div class="queue-row" aria-hidden="true">' +
      '<span class="queue-start queue-goal">' + t('queueGoal') + '</span>' +
      row.map(function (m) { return '<span class="queue-member">' + m + '</span>'; }).join('') +
      '</div>';
    return { row: row, html: pointerRow + queue };
  }

  /* Lugares vecinos de 'target' dentro de una fila de 'total': primero el
     anterior y el siguiente. */
  function nearbyPlaces(target, total) {
    var out = [];
    [target - 1, target + 1, target - 2, target + 2].forEach(function (p) {
      if (p >= 1 && p <= total && p !== target && out.indexOf(p) === -1) out.push(p);
    });
    return out;
  }

  /* Vecinos de un ordinal dentro de la serie que se enseña. Un vecino fuera
     de esa serie (13, 21…) no tiene palabra en el diccionario. */
  function neighbourOrdinals(n) {
    var list = DATA.presentedOrdinals;
    var i = list.indexOf(n);
    var out = [];
    if (i > 0) out.push(list[i - 1]);
    if (i >= 0 && i < list.length - 1) out.push(list[i + 1]);
    return out;
  }

  /* Una pregunta sale de un modo y sus valores. */
  function entryFor(mode) {
    if (mode.mode === 'positionToName' || mode.mode === 'nameToMember') {
      return { mode: mode.mode, items: mode.items, target: rint(1, mode.items) };
    }
    return { mode: mode.mode, n: mode.pool[rint(0, mode.pool.length - 1)] };
  }

  function entryKey(entry) {
    return entry.mode + '|' + (entry.target || entry.n) + '|' + (entry.items || '');
  }

  /* Las preguntas del test. No se repite la misma pregunta seguida. */
  function buildEntries() {
    var out = [];
    for (var k = 0; k < DATA.perRound; k++) {
      var entry, tries = 0;
      do {
        entry = entryFor(DATA.modes[rint(0, DATA.modes.length - 1)]);
        tries += 1;
      } while (out.length && tries < 10 && entryKey(entry) === entryKey(out[out.length - 1]));
      out.push(entry);
    }
    return out;
  }

  /* Pregunta de fila: "¿qué lugar ocupa el que señala la flecha?" o
     "¿quién está en el tercer lugar?". */
  function queueQuestion(entry) {
    var asking = entry.mode === 'positionToName';
    var q = buildQueue(entry.items, entry.target, asking);
    var places = nearbyPlaces(entry.target, entry.items).slice(0, 2);
    var placeWord = t('ord.' + entry.target + 'Name');
    var placeName = t('ord.' + entry.target + 'Place');
    var list;
    var prompt, explanation, visualAria;
    if (asking) {
      prompt = t('qPosition');
      list = [{ html: placeWord, aria: placeWord, correct: true }].concat(places.map(function (p) {
        var word = t('ord.' + p + 'Name');
        return { html: word, aria: word, correct: false };
      }));
      explanation = fill(t('explainPosition'), { ord: placeWord });
      visualAria = fill(t('queueAria'), { n: entry.items, pos: entry.target });
    } else {
      var member = q.row[entry.target - 1];
      prompt = fill(t('qMember'), { place: placeName });
      list = [{ html: '<span class="queue-member">' + member + '</span>', aria: member, correct: true }]
        .concat(places.map(function (p) {
          var other = q.row[p - 1];
          return { html: '<span class="queue-member">' + other + '</span>', aria: other, correct: false };
        }));
      explanation = fill(t('explainMember'), { place: placeName, animal: member });
      visualAria = fill(t('queueAriaLabel'), { n: entry.items });
    }
    return {
      prompt: prompt,
      visual: q.html,
      visualAria: visualAria,
      legend: t('queueHint'),
      hint: asking ? t('hintPosition') : t('hintMember'),
      explanation: explanation,
      options: App.utils.shuffle(list)
    };
  }

  /* "Tercero" → ¿qué número es? */
  function ordinalToDigitQuestion(entry) {
    var word = t('ord.' + entry.n + 'Name');
    var list = [{ html: String(entry.n), aria: String(entry.n), correct: true }]
      .concat(neighbourOrdinals(entry.n).map(function (p) {
        return { html: String(p), aria: String(p), correct: false };
      }));
    return {
      prompt: t('qOrdinalToDigit'),
      visual: '<span class="big-word ' + ordinalByN(entry.n).cls + '">' + word + '</span>',
      visualAria: word,
      legend: '',
      hint: t('hintOrdinalToDigit'),
      explanation: fill(t('explainOrdinalToDigit'), { ord: word, n: entry.n }),
      options: App.utils.shuffle(list)
    };
  }

  /* 3 → ¿qué ordinal es? */
  function digitToOrdinalQuestion(entry) {
    var word = t('ord.' + entry.n + 'Name');
    var list = [{ html: word, aria: word, correct: true }]
      .concat(neighbourOrdinals(entry.n).map(function (p) {
        var other = t('ord.' + p + 'Name');
        return { html: other, aria: other, correct: false };
      }));
    return {
      prompt: t('qDigitToOrdinal'),
      visual: '<span class="big-digit">' + abbrev(entry.n) + '</span>',
      visualAria: abbrev(entry.n),
      legend: '',
      hint: t('hintDigitToOrdinal'),
      explanation: fill(t('explainDigitToOrdinal'), { n: entry.n, ord: word }),
      options: App.utils.shuffle(list)
    };
  }

  function makeQuestion(entry) {
    if (entry.mode === 'positionToName' || entry.mode === 'nameToMember') return queueQuestion(entry);
    if (entry.mode === 'ordinalToDigit') return ordinalToDigitQuestion(entry);
    return digitToOrdinalQuestion(entry);
  }

  /* La explicación: la carrera de llegada y luego cada ordinal de la serie. */
  var INTRO = [{ visual: { kind: 'race' } }].concat(DATA.carousel.map(function (n) {
    return { visual: { kind: 'ordinal', n: n } };
  }));

  var REAL = DATA.real.map(function (r) { return { visual: r }; });

  App.activityFlow.setup({
    toolId: 'ordinals',
    test: 'options',
    socratic: true,
    /* Sin botón de repaso: la regla ya se lee en el recordatorio, antes del test. */
    review: 'none',
    testVisuals: true,
    testVisualClass: 'quiz-shown',
    introHeading: function () { return t('instruction'); },
    introCard: function () { return { title: t('introTitle'), text: t('introText') }; },
    intro: INTRO,
    /* La explicación no lleva título ni texto bajo cada diapositiva: la
       cifra y la palabra ya están en el dibujo. */
    introCopy: function () { return { title: null, text: null }; },
    visualHtml: function (spec) { return V.intro(spec); },
    real: REAL,
    /* El nombre del ejemplo va como título, encima del dibujo. */
    realTitle: function (i) { return t(REAL_LABEL[DATA.real[i].id]); },
    realText: function () { return null; },
    /* Desde los ejemplos, el botón abre el recordatorio: se llama «Recuerda». */
    realContinueKey: 'realContinue',
    realVisualHtml: function (spec) { return V.real(spec); },
    reminder: {
      title: function () { return t('reminderTitle'); },
      html: function () { return V.reminder(); },
      next: function () { return t('start'); }
    },
    buildRound: buildEntries,
    makeQuestion: makeQuestion
  });
})();
