/* ============================================================
   Calculia — Máximo común divisor — datos
   Formato:
   - DATA.perRound: preguntas por ronda.
   - DATA.pairs: parejas de números. Ninguno divide al otro y los
     dos tienen un divisor común mayor que 1, para que la respuesta
     no sea trivial.
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  pairs: [
    [12, 18], [8, 20], [15, 25], [14, 21], [10, 35], [18, 30],
    [20, 28], [24, 36], [30, 45], [21, 35], [12, 30], [16, 40]
  ]
};
