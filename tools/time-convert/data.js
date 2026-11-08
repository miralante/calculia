/* ============================================================
   Calculia — Cambia de unidad — datos
   The units of this activity: hour, half hour, quarter hour, minute and
   second. The explanation and the test use the same ones.
   Formato:
   - DATA.perRound: preguntas por ronda.
   - DATA.conversions: una pareja de unidades. `factor` es cuántas
     unidades pequeñas caben en una grande. `ns` son las cantidades
     que se preguntan; siempre son 2 o más, para que el plural del
     texto sea correcto.
     Con `back: true` la pregunta enseña la cantidad pequeña (media hora
     × ns) y pide la grande (ns): se divide.
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  /* The explanation carousel: one card per step. `picto` is the drawing;
     the name and sentence are in strings (explain.<id>). */
  explain: [
    { id: 'hours', picto: '🕐' },
    { id: 'minutes', picto: '⏱️' },
    { id: 'multiply', picto: '✖️' },
    { id: 'divide', picto: '➗' }
  ],

  /* Real-life stage: one everyday example at a time. `picto` is the drawing;
     the sentence is in strings (example.<id>). */
  real: [
    { id: 'film', picto: '🎬' },
    { id: 'song', picto: '🎵' },
    { id: 'class', picto: '🏫' },
    { id: 'lunch', picto: '🍽️' },
    { id: 'recipe', picto: '🍳' }
  ],

  conversions: [
    { id: 'hour-half', factor: 2, ns: [2, 3, 4, 5] },
    { id: 'hour-quarter', factor: 4, ns: [2, 3, 4, 5] },
    { id: 'half-quarter', factor: 2, ns: [2, 3, 4, 5, 6] },
    { id: 'hour-minute', factor: 60, ns: [2, 3, 4, 5, 6, 8, 10] },
    { id: 'half-minute', factor: 30, ns: [2, 3, 4, 5, 6] },
    { id: 'quarter-minute', factor: 15, ns: [2, 3, 4, 5, 6, 8] },
    { id: 'minute-second', factor: 60, ns: [2, 3, 4, 5, 6, 10] },
    { id: 'hour-second', factor: 3600, ns: [2, 3] },
    { id: 'half-hour-back', factor: 2, ns: [2, 3, 4, 5], back: true },
    { id: 'quarter-hour-back', factor: 4, ns: [2, 3, 4, 5], back: true },
    { id: 'minute-hour-back', factor: 60, ns: [2, 3, 4], back: true },
    { id: 'second-minute-back', factor: 60, ns: [2, 3, 4, 5], back: true }
  ]
};
