/* ============================================================
   Calculia — ¿Cuánto tarda? — datos
   Formato:
   - DATA.perRound: preguntas por ronda.
   - DATA.tasks: una cosa de la vida diaria. `correct` es la duración
     real como [cantidad, unidad]; `wrong` son dos duraciones falsas
     con otra unidad, para que la respuesta dependa de la escala.
     Unidades: second, minute, hour, day, week, year.
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  tasks: [
    { id: 'brush', correct: [2, 'minute'], wrong: [[2, 'second'], [2, 'hour']] },
    { id: 'count', correct: [10, 'second'], wrong: [[10, 'hour'], [10, 'day']] },
    { id: 'omelette', correct: [15, 'minute'], wrong: [[15, 'second'], [15, 'hour']] },
    { id: 'movie', correct: [2, 'hour'], wrong: [[2, 'minute'], [2, 'day']] },
    { id: 'sleep', correct: [8, 'hour'], wrong: [[8, 'minute'], [8, 'week']] },
    { id: 'orbit', correct: [1, 'year'], wrong: [[1, 'week'], [1, 'day']] },
    { id: 'olympics', correct: [4, 'year'], wrong: [[4, 'day'], [4, 'week']] },
    { id: 'weekend', correct: [2, 'day'], wrong: [[2, 'hour'], [2, 'week']] },
    { id: 'shower', correct: [10, 'minute'], wrong: [[10, 'second'], [10, 'hour']] },
    { id: 'walk', correct: [20, 'minute'], wrong: [[20, 'second'], [20, 'day']] },
    { id: 'class', correct: [50, 'minute'], wrong: [[50, 'second'], [50, 'hour']] }
  ]
};
