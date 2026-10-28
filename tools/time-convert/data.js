/* ============================================================
   Calculia — Cambia de unidad — datos
   Formato:
   - DATA.perRound: preguntas por ronda.
   - DATA.conversions: una pareja de unidades. `factor` es cuántas
     unidades pequeñas caben en una grande. `ns` son las cantidades
     que se preguntan; siempre son 2 o más, para que el plural del
     texto sea correcto.
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  conversions: [
    { id: 'hour-minute', factor: 60, ns: [2, 3, 4, 5, 6, 8, 10] },
    { id: 'minute-second', factor: 60, ns: [2, 3, 4, 5, 6, 10] },
    { id: 'day-hour', factor: 24, ns: [2, 3, 4, 5, 6] },
    { id: 'week-day', factor: 7, ns: [2, 3, 4, 5, 6, 8] },
    { id: 'year-month', factor: 12, ns: [2, 3, 4, 5] },
    { id: 'decade-year', factor: 10, ns: [2, 3, 4, 5] },
    { id: 'century-year', factor: 100, ns: [2, 3, 4] },
    { id: 'hour-second', factor: 3600, ns: [2, 3] }
  ]
};
