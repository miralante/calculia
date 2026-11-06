/* ============================================================
   Calculia — Textos de Rectas (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   'kind.*' son los tres nombres de una pareja de rectas: app.js los
   busca por la clase que saca del dibujo.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🛤️ Rectas',
    instructionIntro: 'Mira las rectas.',

    /* Textos de la pantalla (los comparte el motor assets/js/activity-flow.js). */
    ui: {
      seeReal: 'Verlas en la vida real →',
      realLabel: 'Las rectas están a nuestro alrededor',
      hint: '🤔 Prueba otra vez. Mira el dibujo con calma.'
    },

    concept: {
      line: {
        title: 'Recta',
        text: 'Es una línea que no se dobla y no tiene fin: sigue en las dos direcciones.'
      },
      parallel: {
        title: 'Paralelas',
        text: 'Dos rectas que nunca se tocan, aunque se alarguen.'
      },
      crossing: {
        title: 'Secantes',
        text: 'Dos rectas que se cruzan en un punto, pero no hacen esquina de cuadrado.'
      },
      perpendicular: {
        title: 'Perpendiculares',
        text: 'Dos rectas que se cruzan haciendo esquina de cuadrado.'
      }
    },
    real: {
      rails: 'Las vías del tren son paralelas: nunca se tocan.',
      scissors: 'Las tijeras se cruzan en un punto, pero no hacen esquina de cuadrado: son secantes.',
      square: 'La escuadra tiene una esquina recta: sus lados son perpendiculares.',
      streets: 'Las calles de una cuadrícula se cruzan haciendo esquina: son perpendiculares.'
    },
    kind: {
      parallel: 'Paralelas',
      crossing: 'Secantes',
      perpendicular: 'Perpendiculares'
    },
    gen: {
      kindPrompt: '¿Cómo son estas dos rectas?',
      linesAria: 'Dos rectas dentro de un cuadro.',
      socraticKind: '🤔 Mira si se tocan. Si se cruzan, mira si la esquina es de cuadrado exacto.'
    }
  }, 'es');
})();
