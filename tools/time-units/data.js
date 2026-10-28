/* ============================================================
   Calculia — Unidades de tiempo — datos
   Formato:
   - DATA.perRound: preguntas por ronda.
   - DATA.units: las unidades de la explicación, del siglo al segundo.
     `picto` es el dibujo de cada tarjeta; el texto está en strings.
   - DATA.pairs: cuántas unidades pequeñas caben en una grande. Cada
     `answer` es la respuesta; la pregunta está en strings (q.<id>).
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  units: [
    { id: 'century', picto: '🏛️' },
    { id: 'decade', picto: '🔟' },
    { id: 'lustro', picto: '🖐️' },
    { id: 'year', picto: '🗓️' },
    { id: 'month', picto: '🌙' },
    { id: 'week', picto: '📆' },
    { id: 'day', picto: '☀️' },
    { id: 'hour', picto: '🕐' },
    { id: 'minute', picto: '⏱️' },
    { id: 'second', picto: '⚡' }
  ],

  pairs: [
    { id: 'century', answer: 100 },
    { id: 'decade', answer: 10 },
    { id: 'lustro', answer: 5 },
    { id: 'year', answer: 12 },
    { id: 'week', answer: 7 },
    { id: 'day', answer: 24 },
    { id: 'hour', answer: 60 },
    { id: 'minute', answer: 60 }
  ]
};
