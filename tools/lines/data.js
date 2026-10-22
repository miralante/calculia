/* ============================================================
   Calculia — Dos rectas — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
   - DATA.linePairs: parejas de rectas, cada una por dos puntos en una
     caja de 120x120. `kind` NO es la respuesta: app.js compara las
     pendientes del dibujo y saca de ahí si son paralelas, perpendiculares
     o solo cruzadas, y comprueba al arrancar que cada pareja es lo que
     dice ser.
   Los nombres NO están aquí: son texto y viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Dos rectas a la vez: o no se tocan nunca, o se cruzan, y si al
       cruzarse hacen esquina de cuadrado son perpendiculares. */
    rectas: {
      picto: '➕',
      levels: [
        { id: 'r1', tipo: 'linePair' }
      ]
    }
  },

  linePairs: [
    { id: 'para1', kind: 'parallel', a: [[10, 30], [110, 30]], b: [[10, 80], [110, 80]] },
    { id: 'para2', kind: 'parallel', a: [[20, 10], [20, 110]], b: [[80, 10], [80, 110]] },
    { id: 'para3', kind: 'parallel', a: [[10, 20], [110, 80]], b: [[10, 50], [110, 110]] },
    { id: 'perp1', kind: 'perpendicular', a: [[10, 60], [110, 60]], b: [[60, 10], [60, 110]] },
    { id: 'perp2', kind: 'perpendicular', a: [[15, 15], [105, 105]], b: [[15, 105], [105, 15]] },
    { id: 'perp3', kind: 'perpendicular', a: [[10, 90], [110, 40]], b: [[30, 10], [80, 110]] },
    { id: 'cross1', kind: 'crossing', a: [[10, 100], [110, 20]], b: [[10, 40], [110, 90]] },
    { id: 'cross2', kind: 'crossing', a: [[10, 20], [110, 100]], b: [[10, 70], [110, 40]] },
    { id: 'cross3', kind: 'crossing', a: [[20, 10], [20, 110]], b: [[10, 100], [110, 30]] }
  ]
};
