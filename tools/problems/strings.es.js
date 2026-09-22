/* ============================================================
   Calculia — Textos de Problemas (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   Cada problema tiene dos claves, buscadas por el id de data.js:
   - 'problem.<id>': el enunciado, con {a} y {b} en los huecos.
   - 'ask.<id>': la pregunta final, con la palabra de lo que se cuenta.
   Los números NO están aquí: viven una sola vez en data.js.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🤔 Problemas',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Un problema es una situación contada con palabras. Primero se entiende lo que pasa. Después se calcula.',
    explicacion: '✅ Lo importante de un problema no es la cuenta: es darse cuenta de qué hay que hacer.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 Prueba otra vez. Lee el problema despacio y mira el dibujo.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    op: {
      add: 'sumar',
      sub: 'restar'
    },
    activity: {
      operacion: { name: '¿Qué hay que hacer?', detail: 'Sumar o restar.', instruction: 'Lee el problema y decide qué hay que hacer. Si las cosas se juntan, hay que sumar. Si las cosas se van o se quitan, hay que restar. Aquí no tienes que calcular nada.' },
      dosPasos: { name: 'Dos pasos', detail: 'Pasan dos cosas seguidas.', instruction: 'Aquí pasan dos cosas, una detrás de otra. Hazlo por partes: primero lo que pasa al principio, y después lo segundo. Lo fácil es olvidarse del segundo paso y contestar a mitad de camino.' },
      resultado: { name: '¿Cuánto es?', detail: 'Resuelve el problema.', instruction: 'Lee el problema y di cuántos quedan. Tienes el dibujo delante: puedes contar. Lo tachado es lo que ya se ha ido.' }
    },
    level: {
      o1: 'Con palabra pista',
      o2: 'Sin palabra pista',
      t1: 'Los dos hacia el mismo lado',
      t2: 'Uno hacia cada lado',
      r1: 'Problemas de sumar',
      r2: 'Problemas de restar',
      r3: 'Sumar y restar'
    },
    gen: {
      whatToDo: '¿Qué hay que hacer?',
      twoStepHint: 'Son dos pasos. Lo tachado es lo que se ha ido.',
      ariaTwoStep: 'Un grupo con {total} cosas y {gone} tachadas.',
      countHint: 'Puedes contar los dibujos. Lo tachado ya no está.',
      ariaAdd: 'Un grupo de {a} y otro grupo de {b}.',
      ariaSub: 'Un grupo con {a} cosas y {b} tachadas.'
    },
    problem: {
      garden: 'En el jardín hay {a} flores. Plantas {b} flores más. Luego plantas {c} flores más.',
      stickers2: 'Tienes {a} pegatinas. Ganas {b} pegatinas. Luego ganas {c} pegatinas más.',
      socks: 'En el cajón hay {a} calcetines. Sacas {b} calcetines. Luego sacas {c} más.',
      basket: 'En la cesta hay {a} manzanas. Coges {b} manzanas. Luego coges {c} más.',
      bus: 'En el autobús van {a} personas. Suben {b} personas. Luego bajan {c} personas.',
      plate: 'En el plato hay {a} galletas. Pones {b} galletas más. Luego te comes {c}.',
      shelf: 'En la estantería hay {a} libros. Pones {b} libros más. Luego prestas {c}.',
      pond: 'En el estanque hay {a} peces. Echas {b} peces más. Luego se llevan {c}.',
      purse: 'En el monedero tienes {a} monedas. Guardas {b} monedas más. Luego pagas con {c}.',
      case: 'En el estuche hay {a} lápices. Sacas {b} lápices. Luego guardas {c} lápices.',
      apples: 'Tienes {a} manzanas. Te dan {b} manzanas más.',
      stickers: 'Tienes {a} pegatinas. Ganas {b} pegatinas más.',
      chairs: 'Hay {a} sillas en la mesa. Traes {b} sillas más.',
      coins: 'Tienes {a} monedas. Encuentras {b} monedas más.',
      books: 'En la estantería hay {a} libros. Pones {b} libros más.',
      birds: 'Hay {a} pájaros en el árbol. Se van {b} pájaros.',
      cookies: 'Hay {a} galletas en el plato. Te comes {b} galletas.',
      balloons: 'Tienes {a} globos. Se te escapan {b} globos.',
      pencils: 'Tienes {a} lápices. Prestas {b} lápices.',
      oranges: 'Hay {a} naranjas en la bolsa. Sacas {b} naranjas.',
      busStop: 'En la parada esperan {a} personas. En la otra parada esperan {b} personas.',
      twoPlates: 'En un plato hay {a} huevos. En el otro plato hay {b} huevos.',
      bothBoxes: 'En una caja hay {a} calcetines. En la otra caja hay {b} calcetines.',
      howManyLeft: 'Compras {a} caramelos. Repartes {b} caramelos.',
      howManyMore: 'Ana tiene {a} peces. Luis tiene {b} peces.',
      missing: 'El puzzle tiene {a} piezas. Ya has puesto {b} piezas.'
    },
    ask: {
      garden: '¿Cuántas flores hay ahora?',
      stickers2: '¿Cuántas pegatinas tienes ahora?',
      socks: '¿Cuántos calcetines quedan en el cajón?',
      basket: '¿Cuántas manzanas quedan en la cesta?',
      bus: '¿Cuántas personas van ahora en el autobús?',
      plate: '¿Cuántas galletas quedan en el plato?',
      shelf: '¿Cuántos libros quedan en la estantería?',
      pond: '¿Cuántos peces hay ahora en el estanque?',
      purse: '¿Cuántas monedas te quedan en el monedero?',
      case: '¿Cuántos lápices hay ahora en el estuche?',
      apples: '¿Cuántas manzanas tienes ahora?',
      stickers: '¿Cuántas pegatinas tienes ahora?',
      chairs: '¿Cuántas sillas hay ahora?',
      coins: '¿Cuántas monedas tienes ahora?',
      books: '¿Cuántos libros hay ahora?',
      birds: '¿Cuántos pájaros quedan en el árbol?',
      cookies: '¿Cuántas galletas quedan en el plato?',
      balloons: '¿Cuántos globos te quedan?',
      pencils: '¿Cuántos lápices te quedan?',
      oranges: '¿Cuántas naranjas quedan en la bolsa?',
      busStop: '¿Cuántas personas esperan entre las dos paradas?',
      twoPlates: '¿Cuántos huevos hay entre los dos platos?',
      bothBoxes: '¿Cuántos calcetines hay entre las dos cajas?',
      howManyLeft: '¿Cuántos caramelos te quedan?',
      howManyMore: '¿Cuántos peces tiene Ana más que Luis?',
      missing: '¿Cuántas piezas te faltan por poner?'
    },
    transfer: 'Esto te servirá para entender lo que te cuentan antes de hacer la cuenta: en la compra, al repartir algo o al ver cuánto te queda.'
  }, 'es');
})();
