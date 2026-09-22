/* ============================================================
   Calculia — Textos de Porcentajes y proporción (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   'ingredient.<id>.a' y '.b' son los nombres de los dos ingredientes de
   cada receta: app.js los busca por el id que usa data.js.
   Los números NO están aquí: viven una sola vez en data.js.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '💯 Porcentajes',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Por ciento quiere decir «de cada cien». Los porcentajes están en las rebajas, en las etiquetas y en las noticias.',
    explicacion: '✅ Un porcentaje se puede contar: basta mirar cuántos cuadraditos de cien están pintados.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 Prueba otra vez. Cuenta con calma lo que está pintado.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    answer: {
      yes: 'Sí',
      no: 'No'
    },
    ingredient: {
      flourSugar: { a: 'harina', b: 'azúcar' },
      riceWater: { a: 'arroz', b: 'agua' },
      juiceWater: { a: 'naranjas', b: 'agua' },
      milkCocoa: { a: 'leche', b: 'cacao' },
      paintWhite: { a: 'pintura azul', b: 'pintura blanca' }
    },
    /* Nombre de cada cosa que se compra y de cada trabajo que se
       reparte: app.js los busca por el id que usa data.js. */
    item: {
      ticket: 'entradas',
      notebook: 'cuadernos',
      sandwich: 'bocadillos',
      pencil: 'lápices',
      ball: 'balones',
      juice: 'zumos',
      cap: 'gorras',
      book: 'libros'
    },
    job: {
      boxes: 'colocar las cajas',
      paint: 'pintar la pared',
      clean: 'limpiar el local',
      garden: 'arreglar el jardín',
      load: 'cargar el camión',
      fold: 'doblar la ropa'
    },
    activity: {
      porcentaje: { name: '¿Qué porcentaje es?', detail: 'De cada cien.', instruction: 'Un porcentaje dice cuántos son de cada cien. La cuadrícula tiene 100 cuadraditos: cuenta los pintados y ya tienes el porcentaje. Si hay 30 pintados, es el 30 por ciento.' },
      dinero: { name: 'Rebajas', detail: 'Cuánto es y cuánto queda.', instruction: 'Un 50 por ciento es la mitad. Un 25 por ciento es la cuarta parte. Un 10 por ciento es una moneda de cada diez. Con las monedas delante se puede contar.' },
      proporcion: { name: 'Por cada tanto', detail: 'Recetas que crecen.', instruction: 'En una receta, si pones el doble de una cosa tienes que poner el doble de la otra. Si no, ya no sabe igual. Mira las raciones dibujadas. Hay cosas que van al revés: si sois más para el mismo trabajo, se tarda menos.' },
      limite: { name: 'Lo que me llega', detail: 'Cuántas puedo comprar.', instruction: 'Tienes un dinero y cada cosa tiene su precio. Ve quitando el precio de una cada vez. Cuando lo que queda ya no llega para otra, ese es el número. Y lo que queda te sobra.' },
      escala: { name: 'Planos', detail: 'Un cuadrado vale metros.', instruction: 'En un plano todo está más pequeño de verdad. Cada cuadrado del plano vale unos metros de verdad: si cada uno vale 2 metros y hay 3 cuadrados, son 6 metros.' }
    },
    level: {
      p1: 'De diez en diez',
      p2: 'De cinco en cinco',
      p3: 'Busca la cuadrícula',
      r1: '¿Cuánto es el descuento?',
      r2: '¿Cuánto queda por pagar?',
      r3: '¿Cuánto es con el aumento?',
      o1: 'El doble',
      o2: 'El triple',
      o3: 'Al revés: más gente, menos rato',
      l1: '¿Cuántas puedo comprar?',
      l2: '¿Cuánto me sobra?',
      e1: 'Del plano a los metros'
    },
    gen: {
      whatPercent: '¿Qué porcentaje está pintado?',
      percentHint: 'La cuadrícula tiene 100 cuadraditos. Cuenta los pintados.',
      gridAria: 'Una cuadrícula de cien con {n} cuadraditos pintados.',
      whichGrid: '¿En qué cuadrícula está pintado el {n} por ciento?',
      howMuchPart: 'Algo cuesta {price} euros. Te hacen un {percent} por ciento de descuento. ¿De cuánto es el descuento?',
      afterDiscount: 'Algo cuesta {price} euros. Te hacen un {percent} por ciento de descuento. ¿Cuánto pagas al final?',
      afterRise: 'Tienes {price} euros ahorrados. Te dan un {percent} por ciento más. ¿Cuánto tienes al final?',
      moneyHint: 'Las monedas marcadas son la parte del porcentaje.',
      coinsAria: '{total} monedas, {part} de ellas marcadas.',
      euro: ' €',
      ratioPrompt: 'Por cada {a} de {first} pones {b} de {second}. Si pones {many} de {first}, ¿cuánto de {second} necesitas?',
      ratioHint: 'Cuenta lo segundo en todas las raciones dibujadas.',
      servingsAria: '{times} raciones de {a} y {b}.',
      inversePrompt: '{from} personas tardan {hours} horas en {job}. ¿Cuántas horas tardarán {to} personas?',
      inverseHint: 'El trabajo es el mismo: los mismos cuadros, repartidos en {to} filas.',
      workAria: '{people} filas, una por persona, de {hours} horas cada una.',
      howManyFit: 'Tienes {budget} euros. Cada una de esas {thing} cuesta {price} euros. ¿Cuántas puedes comprar?',
      fitHint: 'Ve quitando el precio de una cada vez, hasta que ya no llegue.',
      whatIsLeft: 'Tienes {budget} euros. Cada una de esas {thing} cuesta {price} euros. Compras todas las que puedas. ¿Cuánto dinero te sobra?',
      leftHint: 'Lo que sobra nunca llega para otra más.',
      budgetAria: '{budget} monedas de euro, y debajo el precio de una: {price} monedas.',
      scalePrompt: 'En el plano ocupa {n} cuadrados. ¿Cuánto mide de verdad?',
      scaleKey: 'Cada cuadrado del plano son {unit} metros de verdad.',
      scaleHint: 'Cuenta los cuadrados y mira cuánto vale cada uno.',
      planAria: 'Un plano de {n} cuadrados, cada uno de {unit} metros.',
      metre: ' m'
    },
    transfer: 'Esto te servirá para entender las rebajas de una tienda, saber cuánto te descuentan de verdad, leer un plano o un mapa y saber para cuántas cosas te llega el dinero que llevas.'
  }, 'es');
})();
