/* ============================================================
   Calculia — Factoriales — datos.

   Una sola actividad con tres partes: explicación (slides con dibujo),
   ejemplos de la vida real y prueba. Los números son pequeños a propósito:
   se trata de entender qué significa el signo «!», no de calcular deprisa.

   Formato:
   - perRound: preguntas por ronda.
   - intro[]: slides; cada uno tiene un `visual` (ver app.js drawingHtml).
   - real[]: ejemplos de la vida real; cada uno tiene su `visual`.
   - types[]: tipos de pregunta que sortea cada ronda.
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  intro: [
    { visual: { kind: 'chain', n: 4 } },
    { visual: { kind: 'growth', max: 5 } },
    { visual: { kind: 'chips', n: 5 } }
  ],

  real: [
    { visual: { kind: 'slots', n: 3, counts: true, result: true } },
    { visual: { kind: 'slots', n: 4, counts: true, result: true } },
    { visual: { kind: 'slots', n: 5, counts: true, result: true } }
  ],

  /* value: cuánto vale n!. meaning: qué significa n!. slots: maneras de ordenar n. divides: qué número divide exacto a n!. */
  types: ['value', 'meaning', 'slots', 'divides']
};
