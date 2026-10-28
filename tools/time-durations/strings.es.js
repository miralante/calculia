/* ============================================================
   Calculia — ¿Cuánto tarda?: textos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga desde index.html según App.i18n.locale().
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⏱️ ¿Cuánto tarda?',
    instructionIntro: 'Lee la explicación.',
    introContinue: 'Empezar a practicar →',
    intro: {
      title: '¿Cuánto tarda?',
      text: 'Hay cosas que duran segundos, otras minutos, otras horas y otras días. Piensa en la vida real y elige la duración que tiene sentido.'
    },
    check: 'Comprobar',
    newRound: 'Otra ronda →',

    task: {
      brush: '¿Cuánto tarda en lavarse los dientes?',
      count: '¿Cuánto tarda en contar hasta diez?',
      omelette: '¿Cuánto tarda en hacerse una tortilla?',
      movie: '¿Cuánto dura una película?',
      sleep: '¿Cuánto se duerme en una noche normal?',
      orbit: '¿Cuánto tarda la Tierra en dar una vuelta al Sol?',
      olympics: '¿Cuánto tiempo pasa entre unos Juegos Olímpicos de verano y los siguientes?',
      weekend: '¿Cuánto dura un fin de semana?',
      shower: '¿Cuánto tarda una ducha normal?',
      walk: '¿Cuánto dura un paseo corto?',
      class: '¿Cuánto dura una clase en el colegio?'
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
      hint: '🤔 Piensa si dura unos segundos, unos minutos, unas horas o unos días. ¿Qué tiene sentido en la vida real?'
    }
  }, 'es');
})();
