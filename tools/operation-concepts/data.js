/* ============================================================
   Calculia — Operaciones — datos
   Seis subactividades, una por operación: + − × ÷, el factorial (!) y
   las potencias (^). Cada una tiene su explicación (slides con dibujo),
   sus ejemplos de la vida real y su prueba (las potencias no tienen
   ejemplos: `skipReal`). No hay cálculo difícil: se trata de entender qué
   significa cada operación y cuándo se usa.
   `pick: false` quita la operación de las preguntas «¿qué operación
   usarías?», que solo cubren las cuatro básicas.

   Formato:
   - ops[]: id, símbolo e icono. intro[]: slides; cada uno tiene un
     `visual` (ver app.js renderVisual). Los textos NO están aquí: viven
     en strings.<locale>.js, con las mismas claves (ops.<id>.intro.<n>).
     `alt: true` (en los ejemplos reales) tiñe de otro tono el segundo
     grupo o los grupos impares, para que se vean separados.
   - picks[]: situaciones para la pregunta «¿qué operación usarías?».
     Cada una dice cuál es la operación correcta. El texto está en
     strings.<locale>.js (picks.<n>).
   Los números de las preguntas se generan en app.js con rangos pequeños.
   ============================================================ */
var DATA = {
  perRound: 6,

  ops: [
    { id: 'add', symbol: '+', icon: '➕',
      intro: [
        { frame: { kind: 'join', a: 3, b: 2 } },
        { frame: { kind: 'fill', mode: 'add', need: 5, have: 3 } },
        { frame: { kind: 'swap', a: 3, b: 2 } }
      ],
      real: [
        { visual: { kind: 'join', a: 3, b: 2, icon: '🍪', alt: true } },
        { visual: { kind: 'join', a: 2, b: 2, icon: '🧑', alt: true } },
        { visual: { kind: 'join', a: 2, b: 5, coin: true, alt: true } }
      ] },
    { id: 'sub', symbol: '−', icon: '➖',
      intro: [
        { frame: { kind: 'take', n: 5, take: 2, coin: true } },
        { frame: { kind: 'fill', mode: 'sub', need: 5, have: 3 } }
      ],
      real: [
        { visual: { kind: 'take', n: 6, take: 2, icon: '🧃', result: true } },
        { visual: { kind: 'take', n: 6, take: 2, icon: '🚲', result: true } },
        { visual: { kind: 'gap', need: 8, have: 5, icon: '🎈' } }
      ] },
    { id: 'mul', symbol: '×', icon: '✖️',
      intro: [
        { frame: { kind: 'repeat', size: 4, times: 3, icon: '🔋' } },
        { visual: { kind: 'groups', groups: 3, each: 4, icon: '🔋', sum: true, product: true } },
        { visual: { kind: 'groups', groups: 4, each: 3, icon: '🔋', sum: true, product: true } },
        { visual: { kind: 'swapgroups', a: 3, b: 4, icon: '🔋' } }
      ],
      real: [
        { visual: { kind: 'groups', groups: 2, each: 6, icon: '🥚', sum: true, product: true, alt: true } },
        { visual: { kind: 'groups', groups: 4, each: 5, icon: '🪑', sum: true, product: true, alt: true } },
        { visual: { kind: 'groups', groups: 3, each: 4, icon: '🍕', sum: true, product: true, alt: true } }
      ] },
    { id: 'div', symbol: '÷', icon: '➗',
      intro: [
        /* The game draws the division itself: no drawing above it, so the same expression is not shown twice. */
        { frame: { kind: 'names', total: 7, size: 3 } },
        { frame: { kind: 'deal', total: 6, groups: 2, balls: true } },
        { frame: { kind: 'pack', total: 6, size: 2 } },
        { frame: { kind: 'pack', total: 7, size: 3 } },
        { frame: { kind: 'pack', total: 8, size: 2, calc: 'relation' } },
        { frame: { kind: 'pack', total: 7, size: 3, calc: true } },
        { frame: { kind: 'pack', total: 7, size: 3, calc: true } },
        { frame: { kind: 'pack', total: 13, size: 5, calc: true } }
      ],
      real: [
        { visual: { kind: 'divide', total: 8, groups: 4, coin: true, caption: true, alt: true } },
        { visual: { kind: 'divide', total: 6, size: 2, icon: '📖', caption: true, alt: true, label: 'shelf' } },
        { visual: { kind: 'divide', total: 8, size: 3, icon: '🍪', caption: true, alt: true, label: 'box' } }
      ] },
    /* Four slides: what a power is, what the small number counts, the name of
       each part, and the game that puts the names in their place. */
    { id: 'pow', symbol: '^', pick: false,
      intro: [
        { visual: { kind: 'power', base: 2, exp: 3, mode: 'repeat' } },
        { visual: { kind: 'power', base: 3, exp: 2, mode: 'exponent' } },
        { visual: { kind: 'anatomy', base: 4, exp: 3 } },
        { frame: { kind: 'powerNames', base: 4, exp: 3 } }
      ],
      skipReal: true },
    { id: 'fac', symbol: '!', pick: false,
      intro: [
        { visual: { kind: 'chain', n: 4 } },
        { visual: { kind: 'growth', max: 5 } },
        { visual: { kind: 'chips', n: 5 } }
      ],
      real: [
        { visual: { kind: 'slots', n: 3, counts: true, result: true } },
        { visual: { kind: 'slots', n: 4, counts: true, result: true } },
        { visual: { kind: 'slots', n: 5, counts: true, result: true } }
      ] }
  ],

  /* Pregunta «¿qué operación usarías?». `op` es la respuesta. */
  picks: [
    { id: 'add1', op: 'add' }, { id: 'add2', op: 'add' }, { id: 'add3', op: 'add' },
    { id: 'add4', op: 'add' }, { id: 'add5', op: 'add' },
    { id: 'sub1', op: 'sub' }, { id: 'sub2', op: 'sub' }, { id: 'sub3', op: 'sub' },
    { id: 'sub4', op: 'sub' }, { id: 'sub5', op: 'sub' },
    { id: 'mul1', op: 'mul' }, { id: 'mul2', op: 'mul' }, { id: 'mul3', op: 'mul' },
    { id: 'mul4', op: 'mul' }, { id: 'mul5', op: 'mul' },
    { id: 'div1', op: 'div' }, { id: 'div2', op: 'div' }, { id: 'div3', op: 'div' },
    { id: 'div4', op: 'div' }, { id: 'div5', op: 'div' }
  ],

  /* Tipos de pregunta de la prueba de cada operación. Cada ronda toma
     `perRound` preguntas, mezclando estos tipos. */
  questions: {
    add: ['pick', 'join', 'more', 'swap'],
    sub: ['pick', 'take', 'gap'],
    mul: ['pick', 'times', 'repeat', 'swapTimes'],
    div: ['pick', 'share', 'rest', 'leftover', 'relation', 'integer', 'decimal'],
    fac: ['factValue', 'factMeaning', 'factSlots', 'factDivides']
  }
};
