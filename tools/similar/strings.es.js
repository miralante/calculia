/* ============================================================
   Calculia — Textos de Formas parecidas (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   Los números NO están aquí: viven una sola vez en data.js, y lo que
   se compara lo calcula app.js.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔍 Formas parecidas',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Una foto ampliada, un plano o un mapa son la misma forma a otro tamaño. Y una rampa puede estar más o menos inclinada.',
    explicacion: '✅ Aquí no hay fórmulas. Todo se cuenta en cuadraditos y se compara mirando.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 Prueba otra vez. Cuenta los cuadraditos con calma.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    answer: {
      yes: 'Sí',
      no: 'No'
    },
    activity: {
      semejanza: { name: 'La misma forma', detail: 'Igual pero más grande.', instruction: 'Dos figuras son la misma forma cuando una es la otra hecha más grande, sin estirarla ni aplastarla. Si una mide el doble de ancho, tiene que medir también el doble de alto.' },
      pitagoras: { name: 'Los tres cuadrados', detail: 'Uno vale por los otros dos.', instruction: 'Si dibujas un cuadrado sobre cada lado de un triángulo con una esquina recta, el cuadrado del lado largo tiene tantos cuadraditos como los otros dos juntos. Se puede contar.' },
      rampas: { name: 'Las rampas', detail: 'Cuál sube más rápido.', instruction: 'Una rampa está más inclinada cuando sube más por cada paso que avanza. Dos rampas de distinto tamaño pueden estar igual de inclinadas.' }
    },
    level: {
      p1: '¿Son la misma forma?',
      p2: 'Busca la misma forma',
      t1: '¿Cuántos cuadraditos?',
      r1: '¿Cuál sube más?',
      r2: '¿Suben igual?'
    },
    gen: {
      sameShape: '¿Son las dos la misma forma?',
      pickSameShape: '¿Cuál es la misma forma, pero de otro tamaño?',
      shapeHint: 'Si una es el doble de ancha, tiene que ser el doble de alta.',
      pairAria: 'Un rectángulo de {aw} por {ah} y otro de {bw} por {bh}.',
      oneAria: 'Un rectángulo de {w} por {h}.',
      squaresOnSides: '¿Cuántos cuadraditos tiene el cuadrado que falta?',
      triHint: 'El que falta tiene tantos como los otros dos juntos.',
      triAria: 'Dos cuadrados de {a} y {b} cuadraditos, y uno por averiguar.',
      whichSteeper: '¿Cuál de las dos rampas sube más?',
      rampHint: 'Mira cuánto sube cada una por lo que avanza.',
      rampKey: 'avanza {run}, sube {rise}',
      rampA: 'La primera',
      rampB: 'La segunda',
      rampsAria: 'Dos rampas dibujadas en cuadraditos.',
      sameSlope: '¿Están las dos igual de inclinadas?',
      slopeHint: 'Pueden ser de distinto tamaño y subir igual.'
    },
    transfer: 'Esto te servirá para entender un plano o un mapa, saber si una foto está estirada, y darte cuenta de qué cuesta más subir.'
  }, 'es');
})();
