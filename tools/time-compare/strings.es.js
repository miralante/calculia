/* ============================================================
   Calculia — ¿Cuál dura más?: textos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga desde index.html según App.i18n.locale().
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🏁 ¿Cuál dura más?',
    instructionIntro: 'Lee la explicación.',
    btnMenu: 'Volver al inicio',

    ui: {
      realLabel: 'Ejemplos de la vida real'
    },

    /* Explicación en slides con dibujo. */
    intro: {
      1: { title: '¿Cuál dura más?', text: 'Para comparar, pasa todo a la misma unidad. Por ejemplo: 2 horas son 120 minutos. Eso es más que 90 minutos.' },
      2: { title: 'Mira las unidades', text: 'Hay segundos, minutos, horas, días, semanas y años. Un día son 24 horas. Es más que 12 horas.' }
    },

    /* Ejemplos de la vida real. */
    real: {
      1: 'Una película dura unas 2 horas. Una canción dura unos 3 minutos.',
      2: 'Un fin de semana dura unos 2 días. Una semana tiene 7 días.'
    },

    q: {
      longest: '¿Cuál dura más?',
      shortest: '¿Cuál dura menos?'
    },

    units: {
      second: { one: 'segundo', many: 'segundos' },
      minute: { one: 'minuto', many: 'minutos' },
      hour: { one: 'hora', many: 'horas' },
      day: { one: 'día', many: 'días' },
      week: { one: 'semana', many: 'semanas' },
      year: { one: 'año', many: 'años' }
    },

    gen: {
      hint: '🤔 Pasa los tiempos a la misma unidad. ¿Cuántos minutos o cuántas horas tiene cada uno?'
    }
  }, 'es');
})();
