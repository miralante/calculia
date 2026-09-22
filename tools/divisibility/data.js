/* ============================================================
   Calculia — Grupos exactos — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   Nada de lo que se puede calcular está guardado: si un número es
   múltiplo, si es primo, cada cuánto coinciden dos ciclos o cuánto
   mide el lado de un cuadrado lo calcula app.js. Así el dibujo y la
   respuesta salen del mismo sitio y no pueden decir cosas distintas.
   Los textos NO están aquí: viven en strings.<locale>.js.

   Por qué los números son pequeños: todo se comprueba contando
   puntos en pantalla. Por encima de 25 el dibujo deja de poder
   contarse de un vistazo, y entonces la actividad pasaría a pedir
   memoria en vez de mirada.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Múltiplo primero: es la tabla de multiplicar mirada al revés, así
       que se apoya en algo que ya se sabe. */
    multiplos: {
      picto: '✖️',
      levels: [
        { id: 'm1', tipo: 'isMultiple', bases: [2, 3, 5] },
        { id: 'm2', tipo: 'pickMultiple', bases: [2, 3, 4, 5] }
      ]
    },

    /* Los criterios: reglas que ahorran hacer la división. */
    criterios: {
      picto: '🔍',
      levels: [
        { id: 'd1', tipo: 'criterion', which: ['by2', 'by5'] },
        { id: 'd2', tipo: 'criterion', which: ['by10', 'by3'] }
      ]
    },

    /* Primo: el que no se puede repartir de ninguna manera. Se prueba
       con 2, 3 y 5, que es suficiente para todos los números de aquí
       (el siguiente que habría que probar es el 7, y 7 × 7 = 49 se sale
       del rango). */
    primos: {
      picto: '🧱',
      levels: [
        { id: 'p1', tipo: 'isPrime' }
      ]
    },

    /* Cuándo coinciden dos cosas que se repiten, y el trozo más grande
       que cabe en dos medidas. Son el mínimo común múltiplo y el máximo
       común divisor, presentados por lo que sirven. */
    coinciden: {
      picto: '🚌',
      levels: [
        { id: 'c1', tipo: 'lcm' },
        { id: 'c2', tipo: 'gcd' }
      ]
    },

    /* La potencia como un cuadrado de verdad, y la raíz como su lado. */
    cuadrados: {
      picto: '🟨',
      levels: [
        { id: 's1', tipo: 'square' },
        { id: 's2', tipo: 'root' },
        /* Y el cubo: lo mismo en tres direcciones, contado por capas. */
        { id: 's3', tipo: 'cubeRoot' },
        /* s4 cambia una sola cosa: el número que se multiplica es
           negativo. Los menos se emparejan de dos en dos, y si sobra uno
           el resultado se queda del otro lado del cero.
           s5 cuenta cuántas veces se ha multiplicado: eso es lo que dice
           el índice de una raíz, y se puede contar para cualquier número
           de veces, no solo para dos o tres. */
        { id: 's4', tipo: 'negativePower' },
        { id: 's5', tipo: 'rootIndex' }
      ]
    },

    /* Números muy grandes escritos corto. No se calcula nada: se cuentan
       los ceros. */
    grandes: {
      picto: '🔭',
      levels: [
        { id: 'z1', tipo: 'howManyZeros' },
        { id: 'z2', tipo: 'shortForm' }
      ]
    },

    /* Y los números que no salen exactos de ninguna manera. Es la primera
       vez que aparece un número que no es una fracción. */
    noExactos: {
      picto: '♾️',
      levels: [
        { id: 'i1', tipo: 'exactOrNot' }
      ]
    }
  },

  /* Los números que se pueden poner en filas y contar. */
  numbers: [6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24, 25],

  criteria: [
    /* by2, by5 y by10 se ven en la última cifra. by3 necesita sumar las
       cifras, que es otra regla: por eso está en el segundo nivel. */
    { id: 'by2', divisor: 2 },
    { id: 'by5', divisor: 5 },
    { id: 'by10', divisor: 10 },
    { id: 'by3', divisor: 3 }
  ],

  /* Para los criterios hacen falta números de dos cifras variados, con
     y sin cero al final, y que no sean todos múltiplos de lo mismo. */
  criteriaNumbers: [12, 15, 20, 24, 25, 27, 30, 33, 36, 40, 45, 50],

  /* Hasta 25, para que probar con 2, 3 y 5 sea suficiente. Mezcla de
     primos y compuestos a propósito: si solo hubiera de un tipo, la
     respuesta se acertaría sin mirar. */
  primeCandidates: [7, 9, 11, 12, 13, 15, 16, 17, 18, 19, 21, 23, 25],

  /* Dos cosas que se repiten. El momento en que coinciden tiene que
     caber en la línea de tiempo, así que su mínimo común múltiplo no
     pasa de 24. */
  cyclePairs: [
    { a: 2, b: 3 }, { a: 2, b: 5 }, { a: 3, b: 4 }, { a: 3, b: 5 },
    { a: 4, b: 6 }, { a: 4, b: 10 }, { a: 6, b: 8 }
  ],

  /* Dos medidas con un trozo común mayor que 1: si fuera 1, la pregunta
     no tendría nada que enseñar. */
  commonPairs: [
    { a: 8, b: 12 }, { a: 9, b: 12 }, { a: 10, b: 15 },
    { a: 12, b: 18 }, { a: 16, b: 24 }, { a: 14, b: 21 }
  ],

  /* Lados de cuadrado que se pueden dibujar y contar. */
  squareSides: [2, 3, 4, 5, 6, 7, 8],

  /* Lados de cubo. Pequeños a propósito: las capas se dibujan todas y
     los cubitos se cuentan, así que 5 al cubo (125 cubitos) ya no cabe. */
  cubeSides: [2, 3, 4],

  /* Potencias de un número negativo: `base` se multiplica por sí mismo
     `n` veces, siempre en negativo. Ni el resultado ni su signo están
     guardados: app.js los saca de estos dos números, y dibuja los mismos
     menos que luego se emparejan. app.js comprueba al arrancar que el
     resultado no se va de las tres cifras. */
  negPowers: [
    { base: 2, n: 2 }, { base: 2, n: 3 }, { base: 3, n: 2 },
    { base: 2, n: 4 }, { base: 3, n: 3 }, { base: 5, n: 2 },
    { base: 4, n: 2 }, { base: 10, n: 2 }, { base: 2, n: 5 }
  ],

  /* Cadenas de multiplicar: se empieza en 1 y se multiplica por `base`
     `n` veces. Contar los pasos es lo que dice el índice de la raíz, y
     sirve para cualquier número de pasos. app.js calcula cada eslabón. */
  powerChains: [
    { base: 2, n: 3 }, { base: 2, n: 4 }, { base: 3, n: 2 },
    { base: 2, n: 5 }, { base: 3, n: 3 }, { base: 5, n: 2 },
    { base: 2, n: 6 }, { base: 4, n: 3 }, { base: 10, n: 2 }
  ],

  /* Números grandes por su nombre y sus ceros. `zeros` es cuántos ceros
     lleva el 1 seguido; el nombre vive en strings.<locale>.js bajo
     'big.<zeros>'. */
  bigNumbers: [
    { zeros: 2 }, { zeros: 3 }, { zeros: 4 }, { zeros: 6 }, { zeros: 9 }
  ],

  /* Longitudes para ver si una medida sale exacta. `side` es el lado de
     un cuadrado en cuadraditos: el lado siempre cabe exacto, y su
     diagonal no cabe nunca. Cuál es cuál lo decide app.js midiendo, no
     una etiqueta. */
  exacts: [1, 2, 3, 4, 5],

  timeline: 24
};
