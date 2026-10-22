/* ============================================================
   Calculia — Rectas — datos
   Formato:
   - DATA.linePairs: parejas de rectas, cada una por dos puntos en una
     caja de 120x120. `kind` NO es la respuesta: app.js compara las
     pendientes del dibujo y saca de ahí si son paralelas, secantes o
     perpendiculares, y comprueba al arrancar que cada pareja es lo que
     dice ser. Las parejas `hard` son las más difíciles: casi paralelas
     o casi cuadradas.
   - DATA.concepts y DATA.real: las diapositivas de concepto y los
     objetos de la vida real, en orden.
   Los nombres NO están aquí: son texto y viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  /* Las cuatro diapositivas de conceptos, en orden. El dibujo de cada
     una lo hace app.js con las mismas rectas que luego se preguntan. */
  concepts: [
    { id: 'line' },
    { id: 'parallel' },
    { id: 'crossing' },
    { id: 'perpendicular' }
  ],

  /* Objetos de la vida real. Cada uno corresponde a una de las
     frases de `real.*` en strings. */
  real: [
    { id: 'rails', object: '🛤️' },
    { id: 'scissors', object: '✂️' },
    { id: 'square', object: '📐' },
    { id: 'streets', object: '🏙️' }
  ],

  linePairs: [
    /* Parejas claras: paralelas, secantes y perpendiculares. */
    { id: 'para1', kind: 'parallel', a: [[10, 30], [110, 30]], b: [[10, 80], [110, 80]] },
    { id: 'para2', kind: 'parallel', a: [[20, 10], [20, 110]], b: [[80, 10], [80, 110]] },
    { id: 'para3', kind: 'parallel', a: [[10, 20], [110, 80]], b: [[10, 50], [110, 110]] },
    { id: 'perp1', kind: 'perpendicular', a: [[10, 60], [110, 60]], b: [[60, 10], [60, 110]] },
    { id: 'perp2', kind: 'perpendicular', a: [[15, 15], [105, 105]], b: [[15, 105], [105, 15]] },
    { id: 'perp3', kind: 'perpendicular', a: [[10, 90], [110, 40]], b: [[30, 10], [80, 110]] },
    { id: 'cross1', kind: 'crossing', a: [[10, 100], [110, 20]], b: [[10, 40], [110, 90]] },
    { id: 'cross2', kind: 'crossing', a: [[10, 20], [110, 100]], b: [[10, 70], [110, 40]] },
    { id: 'cross3', kind: 'crossing', a: [[20, 10], [20, 110]], b: [[10, 100], [110, 30]] },

    /* Parejas difíciles: casi paralelas que sí se cruzan, casi cuadradas
       que no lo son, y paralelas o perpendiculares inclinadas. */
    { id: 'para4', kind: 'parallel', hard: true, a: [[10, 40], [110, 90]], b: [[10, 70], [90, 110]] },
    { id: 'para5', kind: 'parallel', hard: true, a: [[10, 20], [110, 60]], b: [[20, 70], [110, 106]] },
    { id: 'cross4', kind: 'crossing', hard: true, a: [[10, 25], [110, 75]], b: [[30, 23], [100, 79]] },
    { id: 'cross5', kind: 'crossing', hard: true, a: [[30, 90], [110, 26]], b: [[20, 26], [100, 106]] },
    { id: 'cross6', kind: 'crossing', hard: true, a: [[20, 100], [100, 4]], b: [[10, 20], [110, 70]] },
    { id: 'perp4', kind: 'perpendicular', hard: true, a: [[40, 20], [60, 80]], b: [[20, 60], [110, 30]] },
    { id: 'perp5', kind: 'perpendicular', hard: true, a: [[30, 20], [70, 80]], b: [[20, 70], [110, 10]] }
  ]
};
