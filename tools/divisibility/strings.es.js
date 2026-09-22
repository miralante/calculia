/* ============================================================
   Calculia — Textos de Grupos exactos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   'rule.*' son los criterios de divisibilidad escritos como reglas:
   app.js los busca por el id del criterio en data.js.
   Los números NO están aquí: viven una sola vez en data.js.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '✖️ Grupos exactos',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Hay números que se reparten exactos y números que siempre dejan algo suelto. Saber cuáles son ahorra mucho trabajo.',
    explicacion: '✅ Todo se puede comprobar poniendo los puntos en filas y mirando si la última fila queda completa.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 Prueba otra vez. Mira si la última fila queda completa.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    answer: {
      yes: 'Sí',
      no: 'No'
    },
    /* Cada criterio, escrito como la regla que se usa de verdad. */
    rule: {
      by2: 'Entre 2 se puede si acaba en 0, 2, 4, 6 u 8.',
      by5: 'Entre 5 se puede si acaba en 0 o en 5.',
      by10: 'Entre 10 se puede si acaba en 0.',
      by3: 'Entre 3 se puede si al sumar sus cifras sale un número de la tabla del 3.'
    },
    activity: {
      grandes: { name: 'Números grandes', detail: 'Escritos corto.', instruction: 'Un millón es un 1 con seis ceros. Para no escribir tantos ceros se escribe 10 con un número pequeño arriba, que dice cuántos ceros lleva. Cuéntalos y ya lo tienes.' },
      noExactos: { name: 'No sale exacto', detail: 'Números que no encajan.', instruction: 'El lado de un cuadrado mide un número exacto de cuadraditos. Pero su diagonal, la raya de esquina a esquina, no cae nunca en una raya: no hay ningún número exacto que la mida. Hay números así.' },
      multiplos: { name: 'Múltiplos', detail: '¿Sale exacto?', instruction: 'Un número es múltiplo de otro si se puede repartir en filas completas, sin que sobre ninguno. Pon los puntos en filas y mira la última: si está completa, es múltiplo.' },
      criterios: { name: 'Reglas rápidas', detail: 'Sin hacer la división.', instruction: 'Hay reglas que te dicen si una división sale exacta sin hacerla. Para el 2, el 5 y el 10 basta mirar la última cifra. Para el 3 se suman todas las cifras.' },
      primos: { name: 'Números primos', detail: 'Los que no se reparten.', instruction: 'Un número primo no se puede repartir en filas completas de ninguna manera, salvo en filas de uno. Aquí se prueba con 2, 3 y 5: si ninguna sale completa, es primo.' },
      coinciden: { name: 'Cuándo coinciden', detail: 'Y el trozo común.', instruction: 'Si una cosa pasa cada 4 y otra cada 6, hay momentos en que coinciden. También se puede buscar el trozo más grande que cabe exacto en dos medidas distintas.' },
      cuadrados: { name: 'Cuadrados', detail: 'Elevar al cuadrado y volver.', instruction: 'Un número al cuadrado es un cuadrado de verdad: 5 al cuadrado son 5 filas de 5. La raíz cuadrada es lo contrario: te dan los cuadraditos y buscas el lado.' }
    },
    level: {
      s3: 'La raíz del cubo',
      s4: 'Multiplicar negativos',
      s5: '¿Cuántas veces?',
      z1: '¿Cuántos ceros?',
      z2: 'Escrito corto',
      i1: '¿Sale exacto?',
      m1: '¿Es múltiplo?',
      m2: 'Busca el múltiplo',
      d1: 'Entre 2 y entre 5',
      d2: 'Entre 10 y entre 3',
      p1: '¿Es primo?',
      c1: 'Cuándo coinciden',
      c2: 'El trozo más grande',
      s1: 'Al cuadrado',
      s2: 'La raíz'
    },
    big: {
      '2': 'cien',
      '3': 'mil',
      '4': 'diez mil',
      '6': 'un millón',
      '9': 'mil millones'
    },
    gen: {
      cubeRoot: 'Un cubo tiene {n} cubitos. ¿Cuánto mide su lado?',
      cubeHint: 'Cuenta los cubitos de un solo lado de una capa.',
      cubeAria: 'Un cubo de {side} de lado, con {n} cubitos.',
      howManyZeros: '¿Cuántos ceros lleva {name}?',
      zerosHint: 'Están escritos todos. Cuéntalos.',
      zerosAria: 'Un uno seguido de {n} ceros.',
      shortForm: '¿Cómo se escribe corto este número?',
      shortHint: 'El número pequeño de arriba dice cuántos ceros lleva.',
      powerAria: 'diez elevado a {n}',
      exactSide: 'El lado del cuadrado. ¿Mide un número exacto de cuadraditos?',
      exactDiagonal: 'La raya de esquina a esquina. ¿Mide un número exacto de cuadraditos?',
      exactHint: 'Mira si la raya acaba justo en una esquina de la cuadrícula.',
      sideAria: 'El lado de un cuadrado de {n} cuadraditos.',
      diagonalAria: 'La diagonal de un cuadrado de {n} cuadraditos.',
      isMultiple: '¿Es {n} múltiplo de {base}?',
      whichMultiple: '¿Cuál de estos números es múltiplo de {base}?',
      multipleHint: 'Si la última fila queda completa, sale exacto.',
      rowsAria: '{n} puntos puestos en filas de {base}.',
      divides: '¿Se puede dividir {n} entre {d} sin que sobre nada?',
      isPrime: '¿Es {n} un número primo?',
      inRowsOf: 'En filas de {t}:',
      primeHint: 'Si ninguna de las tres sale completa, el número es primo.',
      triesAria: 'El número {n} probado en filas de 2, de 3 y de 5.',
      meetEvery: 'Una cosa pasa cada {a} y otra cada {b}. ¿Cada cuánto coinciden?',
      meetHint: 'La estrella marca la primera vez que coinciden.',
      cyclesAria: 'Dos líneas de tiempo: una marca cada {a} y otra cada {b}.',
      biggestChunk: 'Tienes dos medidas: {a} y {b}. ¿Cuál es el trozo más grande que cabe exacto en las dos?',
      chunkHint: 'Tiene que caber exacto en las dos, y ser el más grande que lo consigue.',
      barsAria: 'Dos barras: una de {a} y otra de {b}.',
      squareOf: '¿Cuántos cuadraditos tiene un cuadrado de {n} de lado?',
      squareHint: 'Son {n} filas de {n}.',
      squareAria: 'Un cuadrado de {n} filas de {n}.',
      rootOf: 'Un cuadrado tiene {n} cuadraditos. ¿Cuánto mide su lado?',
      rootHint: 'Cuenta los cuadraditos de un solo lado.',
      negativePower: 'Multiplicas {times} veces el número menos {base}. ¿Qué sale?',
      negativeHint: 'Los menos se van de dos en dos. Si sobra uno, el resultado se queda del otro lado del cero.',
      negativeAria: 'Menos {base} multiplicado {times} veces, con sus menos emparejados.',
      rootIndex: 'Se empieza en 1 y se multiplica por {base} hasta llegar a {n}. ¿Cuántas veces se ha multiplicado?',
      chainHint: 'Cuenta las flechas de ×{base}, no las casillas.',
      chainAria: 'Una cadena que multiplica por {base} {times} veces.'
    },
    transfer: 'Esto te servirá para repartir sin que sobre, para saber cuándo vuelven a coincidir dos cosas que se repiten, y para entender los números que salen en las etiquetas y las medidas.'
  }, 'es');
})();
