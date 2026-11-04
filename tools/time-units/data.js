/* ============================================================
   Calculia — Unidades de tiempo — datos
   Formato:
   - DATA.perRound: preguntas por ronda.
   - DATA.units: las unidades de la explicación, del siglo al segundo,
     con las fracciones del año, del mes, del día y de la hora.
     `picto` es el dibujo de cada tarjeta; el texto está en strings.
   - DATA.pairs: cuántas unidades pequeñas caben en una grande. Cada
     `answer` es la respuesta; la pregunta está en strings (q.<id>).
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  units: [
    { id: 'century', picto: '💯' },
    { id: 'decade', picto: '🔟' },
    { id: 'lustro', picto: '🖐️' },
    { id: 'year', picto: '🗓️' },
    { id: 'yearMonths', picto: '📋', grid: true },
    { id: 'semester', picto: '6️⃣' },
    { id: 'quadrimester', picto: '4️⃣' },
    { id: 'trimester', picto: '3️⃣' },
    { id: 'bimester', picto: '2️⃣' },
    { id: 'month', picto: '🌙' },
    { id: 'fortnight', picto: '🌓' },
    { id: 'week', picto: '📆' },
    { id: 'day', picto: '☀️' },
    { id: 'hour', picto: '🕐' },
    { id: 'halfHour', picto: '🕧' },
    { id: 'quarterHour', picto: '🕒' },
    { id: 'minute', picto: '⏱️' },
    { id: 'second', picto: '⚡' }
  ],

  pairs: [
    { id: 'century', answer: 100 },
    { id: 'decade', answer: 10 },
    { id: 'lustro', answer: 5 },
    { id: 'year', answer: 12 },
    { id: 'semester', answer: 6 },
    { id: 'quadrimester', answer: 4 },
    { id: 'trimester', answer: 3 },
    { id: 'bimester', answer: 2 },
    { id: 'fortnight', answer: 15 },
    { id: 'week', answer: 7 },
    { id: 'day', answer: 24 },
    { id: 'hour', answer: 60 },
    { id: 'halfHour', answer: 30 },
    { id: 'quarterHour', answer: 15 },
    { id: 'minute', answer: 60 }
  ]
};
