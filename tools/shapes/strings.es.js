/* ============================================================
   Calculia — Textos de Formas (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   Los nombres de formas y cuerpos van en 'shape.*' y 'solid.*': app.js
   los busca por el id que usa data.js, así que añadir una forma es
   añadir su id aquí y en los dos idiomas.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔷 Formas',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Una señal de tráfico, una ventana, una pelota, una lata. Las formas están en todo lo que tocas y ves.',
    explicacion: '✅ Reconocer las formas te ayuda a describir las cosas y a entender señales, planos y dibujos.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    explicacionCorrecta: '✅ ¡Correcto! La respuesta es: ',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    explicacionIncorrectaA: '❌ Mira: la respuesta correcta es ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    pista: '🤔 Prueba otra vez. Mira el dibujo con calma.',
    hint: '🤔 Prueba otra vez. Mira el dibujo con calma.',
    refuerzoTitulo: 'Refuerzo',
    reinforceTitle: 'Refuerzo',
    refuerzoIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    shape: {
      circle: 'círculo',
      square: 'cuadrado',
      triangle: 'triángulo',
      rectangle: 'rectángulo',
      pentagon: 'pentágono',
      hexagon: 'hexágono'
    },
    solid: {
      cube: 'cubo',
      sphere: 'esfera',
      cylinder: 'cilindro'
    },
    activity: {
      desarrollos: { name: 'Cuerpos abiertos', detail: 'Prismas y pirámides.', instruction: 'Si abres una caja y la dejas plana, ves todas sus caras. A eso se le llama el desarrollo. Cuéntalas: un cubo tiene 6 caras cuadradas, un prisma tiene 2 triángulos y 3 rectángulos, y una pirámide tiene 1 cuadrado y 4 triángulos.' },
      planas: { name: 'Formas planas', detail: 'Círculo, cuadrado, triángulo…', instruction: 'Mira el dibujo y di qué forma es. Después contarás sus lados y sus esquinas. Un lado es una raya recta. Una esquina es donde se juntan dos lados.' },
      cuerpos: { name: 'Cuerpos', detail: 'Cubo, esfera y cilindro.', instruction: 'Los cuerpos son formas que ocupan sitio: se pueden coger con la mano. Un dado es un cubo. Una pelota es una esfera. Una lata es un cilindro.' }
    },
    level: {
      p1: '¿Cuántas caras tiene?',
      p2: '¿Qué sale al doblarlo?',
      g1: 'Tres formas',
      g2: 'Cuatro formas',
      g3: 'Contar los lados',
      g4: 'Contar las esquinas',
      b1: 'Del objeto al nombre',
      b2: 'Del nombre al objeto'
    },
    net: {
      cube: { name: 'cubo', gloss: '6 cuadrados' },
      prism: { name: 'prisma', gloss: '2 triángulos y 3 rectángulos' },
      pyramid: { name: 'pirámide', gloss: '1 cuadrado y 4 triángulos' }
    },
    gen: {
      howManyFaces: 'Este es un {name} abierto. ¿Cuántas caras tiene?',
      facesHint: 'Cuenta las piezas del dibujo: cada una es una cara.',
      netAria: 'Un {name} abierto, con sus {n} caras.',
      fromNet: 'Si doblas este dibujo, ¿qué cuerpo sale?',
      netHint: 'Mira qué forma tiene cada pieza y cuántas hay.',
      netPiecesAria: 'Un cuerpo abierto, con {n} piezas.',
      shapeNamePrompt: '¿Qué forma es?',
      sidesPrompt: '¿Cuántos lados tiene?',
      sidesHint: 'Cuenta las rayas rectas del borde.',
      cornersPrompt: '¿Cuántas esquinas tiene?',
      cornersHint: 'Cuenta los puntos marcados.',
      solidToNamePrompt: '¿Qué forma tiene este objeto?',
      solidToObjectPrompt: '¿Cuál de estos objetos es un {name}?',
      solidHint: 'Piensa en la forma del objeto, no en para qué sirve.'
    },
    transfer: 'Esto te servirá para entender señales y dibujos, y para decir cómo es algo cuando lo tengas que explicar.'
  }, 'es');
})();
