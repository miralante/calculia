/* ============================================================
   Calculia — Problemas — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.problems: cada problema con su operación, sus dos números y
     el dibujo de lo que se cuenta. El enunciado NO está aquí: es
     texto y vive en strings.<locale>.js bajo 'problem.<id>', con
     {a} y {b} en los huecos. Así los números están una sola vez y no
     pueden decir una cosa en español y otra en inglés.
   - `cue: true` significa que la frase lleva palabra pista ("más",
     "se van"). Los niveles las separan: primero con pista, después
     sin ella, porque quitar la pista es lo único que cambia.
   Las restas están escritas de forma que nunca dan negativo: a > b
   siempre, y app.js lo comprueba al arrancar.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Primero decidir qué hay que hacer, sin calcular nada: separa
       "qué operación es" de "cuánto es", que son dos dificultades
       distintas y se atascan por motivos distintos. */
    operacion: {
      picto: '🤔',
      levels: [
        { id: 'o1', tipo: 'chooseOp', cue: true },
        { id: 'o2', tipo: 'chooseOp', cue: false }
      ]
    },

    /* Después resolverlo, con el dibujo delante para poder contar. */
    resultado: {
      picto: '✏️',
      levels: [
        { id: 'r1', tipo: 'solve', op: 'add', max: 10 },
        { id: 'r2', tipo: 'solve', op: 'sub', max: 10 },
        { id: 'r3', tipo: 'solve', max: 20 }
      ]
    },

    /* Y por último dos cosas que pasan una detrás de otra. Lo difícil no
       es la cuenta: es no pararse a mitad de camino. */
    dosPasos: {
      picto: '🪜',
      levels: [
        /* t1→t2 solo cambia si los dos pasos van en la misma dirección
           (juntar y juntar) o en direcciones distintas (juntar y quitar),
           que es lo que hace fácil olvidarse del segundo. */
        { id: 't1', tipo: 'twoStep', mix: false },
        { id: 't2', tipo: 'twoStep', mix: true }
      ]
    }
  },

  /* Dos pasos seguidos. `ops` dice qué se hace con {b} y luego con {c}.
     Ningún resultado está guardado: app.js lo calcula aplicando los dos
     pasos, y comprueba al arrancar que nunca se baja de cero. */
  twoStep: [
    /* Los dos pasos en la misma dirección. */
    { id: 'garden', a: 6, b: 4, c: 2, ops: ['add', 'add'], picto: '🌷' },
    { id: 'stickers2', a: 3, b: 5, c: 4, ops: ['add', 'add'], picto: '⭐' },
    { id: 'socks', a: 9, b: 2, c: 3, ops: ['sub', 'sub'], picto: '🧦' },
    { id: 'basket', a: 12, b: 3, c: 4, ops: ['sub', 'sub'], picto: '🍎' },

    /* Un paso en cada dirección. */
    { id: 'bus', a: 5, b: 3, c: 2, ops: ['add', 'sub'], picto: '🧍' },
    { id: 'plate', a: 4, b: 5, c: 3, ops: ['add', 'sub'], picto: '🍪' },
    { id: 'shelf', a: 7, b: 6, c: 4, ops: ['add', 'sub'], picto: '📗' },
    { id: 'pond', a: 8, b: 3, c: 5, ops: ['add', 'sub'], picto: '🐟' },
    { id: 'purse', a: 10, b: 5, c: 7, ops: ['add', 'sub'], picto: '🪙' },
    { id: 'case', a: 12, b: 4, c: 3, ops: ['sub', 'add'], picto: '✏️' }
  ],

  problems: [
    /* Con palabra pista: la frase dice "más", "otro", "se van". */
    { id: 'apples', op: 'add', a: 3, b: 2, picto: '🍎', cue: true },
    { id: 'stickers', op: 'add', a: 5, b: 4, picto: '⭐', cue: true },
    { id: 'chairs', op: 'add', a: 6, b: 3, picto: '🪑', cue: true },
    { id: 'coins', op: 'add', a: 7, b: 5, picto: '🪙', cue: true },
    { id: 'books', op: 'add', a: 8, b: 6, picto: '📗', cue: true },
    { id: 'birds', op: 'sub', a: 6, b: 2, picto: '🐦', cue: true },
    { id: 'cookies', op: 'sub', a: 8, b: 3, picto: '🍪', cue: true },
    { id: 'balloons', op: 'sub', a: 9, b: 4, picto: '🎈', cue: true },
    { id: 'pencils', op: 'sub', a: 12, b: 5, picto: '✏️', cue: true },
    { id: 'oranges', op: 'sub', a: 15, b: 6, picto: '🍊', cue: true },

    /* Sin palabra pista: hay que entender la situación. */
    { id: 'busStop', op: 'add', a: 4, b: 3, picto: '🧍', cue: false },
    { id: 'twoPlates', op: 'add', a: 5, b: 2, picto: '🥚', cue: false },
    { id: 'bothBoxes', op: 'add', a: 9, b: 7, picto: '🧦', cue: false },
    { id: 'howManyLeft', op: 'sub', a: 7, b: 3, picto: '🍬', cue: false },
    { id: 'howManyMore', op: 'sub', a: 9, b: 6, picto: '🐟', cue: false },
    { id: 'missing', op: 'sub', a: 14, b: 8, picto: '🧩', cue: false }
  ]
};
