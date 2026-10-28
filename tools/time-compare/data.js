/* ============================================================
   Calculia — ¿Cuál dura más? — datos
   Formato:
   - DATA.perRound: preguntas por ronda.
   - DATA.seconds: cuántos segundos tiene cada unidad. Sirve solo para
     comparar; el año se cuenta como 365 días.
   - DATA.durations: tiempos como [cantidad, unidad]. Cada uno tiene
     una duración distinta, para que siempre haya una única respuesta.
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  seconds: { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, year: 31536000 },

  durations: [
    [30, 'second'], [90, 'second'], [2, 'minute'], [5, 'minute'], [20, 'minute'],
    [1, 'hour'], [3, 'hour'], [12, 'hour'], [1, 'day'], [2, 'day'],
    [1, 'week'], [3, 'week'], [1, 'year'], [5, 'year']
  ]
};
