/* ============================================================
   Calculia — Momentos del día — datos
   Format:
   - DATA.perRound: preguntas por ronda.
   - DATA.parts: las partes del día, en orden.
   - DATA.intro: una diapositiva por parte del día. `picto` es el dibujo.
   - DATA.moments: un momento de la vida diaria y la parte del día en que
     pasa (`part`). Sirven de vida real y de preguntas.
   The answer is a part of the day in words, not a clock: reading the
   clock is the job of El Reloj.
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  parts: ['manana', 'tarde', 'noche'],

  intro: [
    { id: 'manana', picto: '🌅' },
    { id: 'tarde', picto: '☀️' },
    { id: 'noche', picto: '🌙' }
  ],

  moments: [
    { id: 'desayuno', picto: '🥐', part: 'manana' },
    { id: 'colegio', picto: '🏫', part: 'manana' },
    { id: 'comida', picto: '🍽️', part: 'tarde' },
    { id: 'merienda', picto: '🍪', part: 'tarde' },
    { id: 'cena', picto: '🌙', part: 'noche' },
    { id: 'dormir', picto: '😴', part: 'noche' }
  ]
};
