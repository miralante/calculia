/* ============================================================
   Calculia — Leer fechas — datos
   Formato:
   - DATA.perRound: preguntas por ronda.
   - DATA.explain: las tarjetas de la explicación, en orden. `picto` es
     el dibujo de cada tarjeta; el texto está en strings.<locale>.js.
   - DATA.kinds: los tipos de pregunta de la práctica. Las fechas se
     generan al azar en app.js (día 1–28, mes 1–12, año 2020–2030).
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  explain: [
    { id: 'read', picto: '📅' },
    { id: 'day', picto: '🔟' },
    { id: 'month', picto: '🌙' },
    { id: 'year', picto: '🗓️' },
    { id: 'months', picto: '📋', grid: 'months' },
    { id: 'example', picto: '✅' }
  ],

  kinds: ['day', 'month', 'year', 'written']
};
