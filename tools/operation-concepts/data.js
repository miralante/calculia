/* ============================================================
   Calculia — Operaciones — datos
   Cuatro subactividades, una por operación: + − × ÷.
   Cada una tiene su explicación (slides con dibujo), sus ejemplos de
   la vida real y su prueba. No hay cálculo difícil: se trata de
   entender qué significa cada operación y cuándo se usa.

   Formato:
   - ops[]: id, símbolo e icono. intro[]: slides; cada uno tiene un
     `visual` (ver app.js renderVisual). Los textos NO están aquí: viven
     en strings.<locale>.js, con las mismas claves (ops.<id>.intro.<n>).
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
        { visual: { kind: 'join', a: 3, b: 2, icon: '🍎', iconB: '🍏' } },
        { visual: { kind: 'join', a: 3, b: 2, icon: '🍎', iconB: '🍏' } },
        { visual: { kind: 'join', a: 2, b: 3, icon: '🍏', iconB: '🍎' } }
      ],
      real: [
        { visual: { kind: 'join', a: 5, b: 3, icon: '🍪' } },
        { visual: { kind: 'join', a: 4, b: 3, icon: '🧑' } },
        { visual: { kind: 'join', a: 2, b: 5, icon: '💶' } }
      ] },
    { id: 'sub', symbol: '−', icon: '➖',
      intro: [
        { visual: { kind: 'take', n: 5, take: 2, icon: '🍪' } },
        { visual: { kind: 'gap', have: 3, need: 5, icon: '💶' } }
      ],
      real: [
        { visual: { kind: 'take', n: 6, take: 2, icon: '🧃', result: true } },
        { visual: { kind: 'take', n: 10, take: 3, icon: '🚲', result: true } },
        { visual: { kind: 'gap', need: 8, have: 5, icon: '🎁' } }
      ] },
    { id: 'mul', symbol: '×', icon: '✖️',
      intro: [
        { visual: { kind: 'groups', groups: 3, each: 4, icon: '🔋', caption: true } },
        { visual: { kind: 'groups', groups: 3, each: 4, icon: '🔋', sum: true } },
        { visual: { kind: 'groups', groups: 4, each: 3, icon: '🔋', caption: true } }
      ],
      real: [
        { visual: { kind: 'groups', groups: 2, each: 6, icon: '🥚', sum: true } },
        { visual: { kind: 'groups', groups: 4, each: 5, icon: '🪑', sum: true } },
        { visual: { kind: 'groups', groups: 3, each: 4, icon: '🍕', sum: true } }
      ] },
    { id: 'div', symbol: '÷', icon: '➗',
      intro: [
        { visual: { kind: 'groups', groups: 3, each: 4, icon: '🧦', caption: true } },
        { visual: { kind: 'pack', total: 12, size: 4, icon: '🧦', caption: true } },
        { visual: { kind: 'rest', total: 13, size: 4, icon: '🧦' } },
        { visual: { kind: 'groups', groups: 3, each: 4, icon: '🧦' } }
      ],
      real: [
        { visual: { kind: 'groups', groups: 4, each: 3, icon: '🧦', caption: true } },
        { visual: { kind: 'pack', total: 15, size: 5, icon: '📚', caption: true } },
        { visual: { kind: 'rest', total: 11, size: 3, icon: '🍪' } }
      ] }
  ],

  /* Pregunta «¿qué operación usarías?». `op` es la respuesta. */
  picks: [
    { id: 'add1', op: 'add' }, { id: 'add2', op: 'add' },
    { id: 'sub1', op: 'sub' }, { id: 'sub2', op: 'sub' },
    { id: 'mul1', op: 'mul' }, { id: 'mul2', op: 'mul' },
    { id: 'div1', op: 'div' }, { id: 'div2', op: 'div' }
  ],

  /* Tipos de pregunta de la prueba de cada operación. Cada ronda toma
     `perRound` preguntas, mezclando estos tipos. */
  questions: {
    add: ['pick', 'join', 'more'],
    sub: ['pick', 'take', 'gap'],
    mul: ['pick', 'times', 'repeat'],
    div: ['pick', 'share', 'rest', 'relation']
  }
};
