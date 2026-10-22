/* ============================================================
   Calculia — Textos de Dos rectas (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   'lines.*' son los tres nombres de una pareja de rectas; app.js los
   busca por el nombre que saca de comparar las dos pendientes del dibujo.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➕ Dos rectas',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Las vías del tren no se tocan nunca. Las calles de una cuadrícula sí se cruzan.',
    explicacion: '✅ Mira el dibujo y decide. Si no se tocan, son paralelas; si se cruzan haciendo esquina de cuadrado, son perpendiculares.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 Prueba otra vez. Mira el dibujo con calma.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    transfer: 'Esto te servirá para ver si dos calles se cruzan o nunca se juntan, y para entender los planos y los mapas.',
    lines: {
      parallel: 'Paralelas: no se tocan nunca',
      perpendicular: 'Perpendiculares: esquina de cuadrado',
      crossing: 'Se cruzan, pero sin hacer esquina'
    },
    activity: {
      rectas: { name: 'Dos rectas', detail: '¿Se tocan o no?', instruction: 'Dos rectas pueden no tocarse nunca: son paralelas. O pueden cruzarse. Y si al cruzarse hacen una esquina de cuadrado, son perpendiculares. Mira el dibujo y decide.' }
    },
    gen: {
      linePair: '¿Cómo son estas dos rectas?',
      linesHint: 'Si se juntan en algún sitio, se cruzan. Y si al cruzarse hacen esquina de cuadrado, son perpendiculares.',
      linesAria: 'Dos rectas dentro de un cuadro.',
      socraticLines: '🤔 Mira si las dos rectas llegan a juntarse en algún punto.'
    }
  }, 'es');
})();
