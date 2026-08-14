/* ============================================================
   Calculia — Mental Math texts (ES)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🧠 Restar y Cálculo Mental',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Alguien te pregunta cuánto queda o cuánto es sin usar papel. Aprende a restar y a calcular de cabeza con trucos sencillos.',
    explicacion: '✅ Restar y calcular de cabeza te sirve para no depender siempre de una calculadora.',
    btnBackToMenu: '← Otras actividades',
    otherLevel: 'Elegir otro nivel',
    resumenFinal: 'Has resuelto {n} preguntas de {actividad}. Ahora tienes {stars} estrellas.',
    endSummary: 'Has resuelto {n} preguntas de {actividad}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{nombre}»?',
    btnOtherActivity: 'Otra actividad',
    explicacionCorrecta: '✅ ¡Correcto! La respuesta es: ',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    explicacionIncorrectaA: '❌ Mira: la respuesta correcta es ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    pista: '🤔 Prueba otra vez. Piensa con calma.',
    hint: '🤔 Prueba otra vez. Piensa con calma.',
    refuerzoTitulo: 'Refuerzo',
    reinforceTitle: 'Refuerzo',
    refuerzoIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    leyendaUnidadesTxt: 'unidades',
    legendUnitsTxt: 'unidades',
    leyendaDecenasTxt: 'decenas',
    legendTensTxt: 'decenas',
    leyendaCentenasTxt: 'centenas',
    legendHundredsTxt: 'centenas',
    activity: {
      restar: { name: 'Restar', detail: 'Quitar y contar lo que queda.', instruction: 'Restar es quitar. Cuenta los puntos que no tienen una cruz.' },
      cabeza: { name: 'De cabeza', detail: 'Calcula sin papel.', instruction: 'Piensa el resultado de cabeza. Fíjate en la cifra que cambia.' }
    },
    level: { r10: 'Restas hasta 10', r20: 'Restas hasta 20', k1: 'Dobles', k2: 'Sumar 10', k3: 'Sumar 100', k4: 'Sumar 1.000', k5: 'Restar 10', k6: 'Restar 100', k7: 'Restar 1.000', k8: 'Multiplicar x10', k9: 'Multiplicar x100' },
    gen: {
      restarEnunciado: '¿Cuánto es {a} − {b}?',
      subtractPrompt: '¿Cuánto es {a} − {b}?',
      restarPista: 'Quita {b}. Cuenta los puntos que quedan.',
      subtractHint: 'Quita {b}. Cuenta los puntos que quedan.',
      doblesEnunciado: '¿Cuánto es {a} + {a}?',
      doublesPrompt: '¿Cuánto es {a} + {a}?',
      doblesPista: 'Los dos números son iguales. Es un doble.',
      doublesHint: 'Los dos números son iguales. Es un doble.',
      pistaDecenas: 'Solo cambia la cifra verde: las decenas.',
      tensHint: 'Solo cambia la cifra verde: las decenas.',
      pistaCentenas: 'Solo cambia la cifra morada: las centenas.',
      hundredsHint: 'Solo cambia la cifra morada: las centenas.',
      pistaMiles: 'Solo cambia la cifra de los miles.',
      thousandsHint: 'Solo cambia la cifra de los miles.',
      sumaGrandeEnunciado: '¿Cuánto es {n} + {suma}?',
      bigAddPrompt: '¿Cuánto es {n} + {suma}?',
      restaGrandeEnunciado: '¿Cuánto es {n} − {resta}?',
      bigSubtractPrompt: '¿Cuánto es {n} − {resta}?',
      multiplicaGrandeEnunciado: '¿Cuánto es {n} × {factor}?',
      bigMultiplyPrompt: '¿Cuánto es {n} × {factor}?',
      multiplicaGrandePista: 'Añade {ceros} al final de {n}.',
      bigMultiplyHint: 'Añade {ceros} al final de {n}.',
      oneZero: 'un cero',
      twoZeros: 'dos ceros'
    },
    transferencia: 'Esto te servirá para saber cuánto te queda, cuánto falta o calcular una cantidad grande sin usar la calculadora.',
    transfer: 'Esto te servirá para saber cuánto te queda, cuánto falta o calcular una cantidad grande sin usar la calculadora.'
  }, 'es');
})();
