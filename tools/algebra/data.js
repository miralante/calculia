/* ============================================================
   Calculia — La balanza — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   Nada de lo que se puede calcular está guardado: lo que pesa la bolsa,
   lo que valen varias bolsas y lo que hace la línea de la gráfica lo
   calcula app.js con estos números, y el dibujo se construye con los
   mismos. Así no pueden decir cosas distintas.
   Los textos NO están aquí: viven en strings.<locale>.js.

   Nivel de ambición: esta actividad es 💡 concepto (ver doc/es/spec.md
   §8.1). No se pide manipular símbolos ni despejar: se pide entender
   que una letra es un número que todavía no se sabe, que una balanza
   tiene que quedar equilibrada, y que una gráfica que sube significa
   que algo crece. Eso es lo que se presenta, y se presenta entero.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* La balanza primero: es una ecuación sin que haga falta llamarla
       así, y se resuelve mirando qué falta para que quede igual. */
    balanza: {
      picto: '⚖️',
      levels: [
        /* b1→b2 solo cambia de "una bolsa y pesas" a "varias bolsas";
           b2→b3 pone pesas en los dos platos. Una variable por paso. */
        { id: 'b1', tipo: 'onePlusWeights' },
        { id: 'b2', tipo: 'manyBags' },
        { id: 'b3', tipo: 'bothSides' }
      ]
    },

    /* Después la letra: solo es el nombre del número que no se sabe. */
    letras: {
      picto: '🔤',
      levels: [
        { id: 'l1', tipo: 'substitute' },
        { id: 'l2', tipo: 'writeIt' }
      ]
    },

    /* Leer una gráfica de verdad: si sube, si baja, y dónde está lo
       más alto. */
    graficas: {
      picto: '📉',
      levels: [
        { id: 'g1', tipo: 'upOrDown' },
        { id: 'g2', tipo: 'highestPoint' }
      ]
    },

    /* Dos balanzas a la vez: eso es un sistema. Y una balanza torcida:
       eso es una desigualdad. */
    dosBalanzas: {
      picto: '⚖️',
      levels: [
        { id: 's1', tipo: 'system' },
        { id: 's2', tipo: 'tilted' }
      ]
    },

    /* El cuadrado de un número visto al revés: si x por x son 36, x es 6.
       Eso es una ecuación de segundo grado, presentada por lo que es. */
    cuadrado: {
      picto: '⬛',
      levels: [
        { id: 'q1', tipo: 'squareEquation' }
      ]
    },

    /* Piezas: la pieza grande es un cuadrado de lado x, la tira mide x
       de largo y 1 de ancho, y la pequeña es un 1. Con eso, una suma de
       piezas es un polinomio, un cuadrado hecho de piezas es una
       identidad, y buscar el otro lado de un rectángulo es factorizar.
       t1→t2→t3 cambia solo lo que se pide: leer las piezas, el lado del
       cuadrado, y el lado que falta. Una variable por paso. */
    piezas: {
      picto: '🟦',
      levels: [
        { id: 't1', tipo: 'readTiles' },
        { id: 't2', tipo: 'squareSide' },
        { id: 't3', tipo: 'otherSide' }
      ]
    },

    /* Y cómo crece: siempre lo mismo (una recta) o cada vez más (una
       curva). Es la diferencia entre las familias de funciones, contada
       con los saltos de una en una, sin nombrarlas. */
    crecer: {
      picto: '📈',
      levels: [
        { id: 'c1', tipo: 'howItGrows' },
        { id: 'c2', tipo: 'pickStraight' }
      ]
    }
  },

  /* Series para ver cómo crece algo. `kind` no lo usa app.js para
     responder: la respuesta se calcula mirando si los saltos entre un
     valor y el siguiente son todos iguales. Está aquí para poder elegir
     de qué tipo se quiere una serie, y app.js comprueba al arrancar que
     cada una es de verdad lo que dice ser. */
  growths: [
    { id: 'steps2', kind: 'same', values: [2, 4, 6, 8, 10] },
    { id: 'steps3', kind: 'same', values: [3, 6, 9, 12, 15] },
    { id: 'steps5', kind: 'same', values: [1, 6, 11, 16, 21] },
    { id: 'steps4', kind: 'same', values: [4, 8, 12, 16, 20] },
    { id: 'double', kind: 'faster', values: [1, 2, 4, 8, 16] },
    { id: 'squares', kind: 'faster', values: [1, 4, 9, 16, 25] },
    { id: 'triple', kind: 'faster', values: [1, 3, 9, 27, 81] },
    { id: 'pileUp', kind: 'faster', values: [2, 5, 10, 17, 26] }
  ],

  /* Balanzas con una bolsa y pesas: bolsa + `add` = `total`. El peso de
     la bolsa sale de la resta, y siempre es positivo. */
  simple: [
    { add: 2, total: 7 }, { add: 3, total: 8 }, { add: 4, total: 10 },
    { add: 1, total: 6 }, { add: 5, total: 9 }, { add: 2, total: 9 },
    { add: 3, total: 12 }, { add: 4, total: 7 }
  ],

  /* Varias bolsas iguales: `bags` bolsas pesan `total`. El total es
     siempre múltiplo del número de bolsas, así que cada una pesa un
     número entero de kilos. */
  groups: [
    { bags: 2, total: 8 }, { bags: 2, total: 10 }, { bags: 3, total: 9 },
    { bags: 3, total: 12 }, { bags: 4, total: 8 }, { bags: 2, total: 14 },
    { bags: 4, total: 12 }, { bags: 3, total: 15 }
  ],

  /* Pesas en los dos platos: bolsa + `left` = `right`. La bolsa pesa
     right − left, y se ve quitando las mismas pesas de los dos lados. */
  both: [
    { left: 2, right: 7 }, { left: 3, right: 9 }, { left: 1, right: 5 },
    { left: 4, right: 10 }, { left: 2, right: 11 }, { left: 5, right: 12 },
    { left: 3, right: 6 }, { left: 1, right: 8 }
  ],

  /* Dos balanzas a la vez. La primera dice que una bolsa y una caja pesan
     `total`; la segunda, que la bolsa pesa `diff` más que la caja. Lo que
     pesa cada una lo calcula app.js, y comprueba que las dos balanzas
     cuadran con la misma pareja: si no cuadraran, un sistema no tendría
     una sola solución. Los números están elegidos para que las dos pesen
     un número entero de kilos. */
  systems: [
    { total: 7, diff: 1 }, { total: 9, diff: 3 }, { total: 10, diff: 2 },
    { total: 8, diff: 2 }, { total: 11, diff: 1 }, { total: 12, diff: 4 },
    { total: 6, diff: 2 }, { total: 13, diff: 3 }
  ],

  /* Balanzas torcidas: un lado pesa más que el otro. `left` y `right` son
     las pesas de cada lado y nunca son iguales, porque una desigualdad que
     fuera igualdad no sería una desigualdad. */
  tilts: [
    { left: 5, right: 3 }, { left: 2, right: 6 }, { left: 7, right: 4 },
    { left: 3, right: 8 }, { left: 9, right: 5 }, { left: 4, right: 9 },
    { left: 6, right: 2 }, { left: 1, right: 7 }
  ],

  /* Lados de cuadrado para la pregunta al revés: si x por x son estos
     cuadraditos, ¿cuánto vale x? */
  squareSides: [2, 3, 4, 5, 6, 7, 8],

  /* Montones de piezas para leerlos escritos. `sq` son cuadrados grandes
     (lado x), `str` tiras (x de largo) y `one` cuadraditos de 1. Lo
     escrito no está guardado: app.js lo construye con estas cuentas, y
     dibuja las mismas piezas. app.js comprueba al arrancar que cada
     montón tiene al menos dos clases de pieza (con una sola no hay nada
     que sumar) y que dos montones no se escriben igual. */
  tiles: [
    { id: 'a', sq: 1, str: 3, one: 2 },
    { id: 'b', sq: 1, str: 2, one: 0 },
    { id: 'c', sq: 0, str: 2, one: 3 },
    { id: 'd', sq: 1, str: 0, one: 4 },
    { id: 'e', sq: 2, str: 1, one: 1 },
    { id: 'f', sq: 1, str: 4, one: 3 },
    { id: 'g', sq: 0, str: 3, one: 1 },
    { id: 'h', sq: 2, str: 3, one: 0 }
  ],

  /* Cuadrados hechos de piezas: el lado es x más `a`. Las piezas que
     hacen falta (un cuadrado grande, tiras y cuadraditos) las calcula
     app.js con este número, así que el dibujo y la respuesta no pueden
     decir cosas distintas. */
  tileSquares: [1, 2, 3],

  /* Rectángulos hechos de piezas: un lado mide x y el otro x más `a`. */
  tileRects: [2, 3, 4, 5],

  /* La letra con un valor dado y cuántas veces se repite. */
  values: [
    { x: 3, times: 2 }, { x: 4, times: 3 }, { x: 5, times: 2 },
    { x: 2, times: 4 }, { x: 6, times: 2 }, { x: 3, times: 4 },
    { x: 7, times: 2 }, { x: 4, times: 5 }
  ],

  /* Gráficas de cosas reales, hora a hora. Los valores son los que se
     leen en el dibujo; si sube, baja o se queda igual lo decide app.js
     comparando dos horas seguidas.
     Dos condiciones que app.js comprueba al arrancar:
     - cada serie tiene un único máximo, o "dónde está lo más alto" no
       tendría una sola respuesta;
     - entre todas las series hay al menos un tramo que sube, uno que
       baja y uno que se queda igual, o una de las tres respuestas
       posibles nunca saldría y sería una opción muerta. */
  series: [
    { id: 'temperature', from: 8, values: [12, 14, 17, 21, 24, 22, 22, 16] },
    { id: 'people', from: 9, values: [2, 6, 11, 11, 14, 10, 5, 3] },
    { id: 'battery', from: 8, values: [100, 88, 70, 55, 40, 28, 15, 6] },
    { id: 'rain', from: 10, values: [1, 2, 4, 9, 6, 3, 3, 1] }
  ]
};
