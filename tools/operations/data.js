/* ============================================================
   Calculia — Cuentas grandes — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.pairs: parejas para dar la vuelta a la multiplicación.
   - DATA.splits: multiplicaciones partidas en dos trozos fáciles.
     `cut` es por dónde se parte: 6 × 7 con cut 5 se ve como 6 × 5
     más 6 × 2. Ningún resultado está guardado: se calcula, así que
     el dibujo y la respuesta no pueden decir cosas distintas.
   - DATA.twoDigit: multiplicar por un número de dos cifras, partido
     por las decenas (13 × 4 se ve como 10 × 4 más 3 × 4).
   - DATA.shares: repartir en partes iguales. La división siempre es
     exacta: un resto sería otro tema.
   - DATA.groups: cuántos grupos de un tamaño caben. Así entra el
     divisor de dos cifras sin tener que dibujar doce montones.
   - DATA.orders: cuentas con dos operaciones. `parens` dice si lleva
     paréntesis, que es lo único que cambia qué se hace primero.
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Dar la vuelta primero: es la propiedad más fácil de ver y la que
       ahorra más trabajo (si sabes una, sabes la otra). */
    voltear: {
      picto: '🔄',
      levels: [
        { id: 'v1', tipo: 'commute' }
      ]
    },

    /* Partir en dos trozos fáciles: primero dentro de las tablas, y
       después con un número de dos cifras, que es el mismo truco. */
    partir: {
      picto: '✂️',
      levels: [
        { id: 'd1', tipo: 'split' },
        { id: 'd2', tipo: 'splitTens' }
      ]
    },

    /* Dividir de las dos maneras en que se dice en la vida real:
       cuánto toca a cada uno, y cuántos grupos salen. */
    repartir: {
      picto: '🤝',
      levels: [
        { id: 'r1', tipo: 'share' },
        { id: 'r2', tipo: 'groups' }
      ]
    },

    /* Sumar y restar cuando hay números negativos. Se resuelve andando
       por la recta: no hay regla de signos que aprenderse. */
    consigno: {
      picto: '🌡️',
      levels: [
        /* n1→n2 solo cambia la dirección del salto. */
        { id: 'g1', tipo: 'walkLine', dir: 'up' },
        { id: 'g2', tipo: 'walkLine', dir: 'down' }
      ]
    },

    /* Qué se hace primero. El paréntesis es lo único que lo cambia. */
    orden: {
      picto: '🔢',
      levels: [
        { id: 'o1', tipo: 'whatFirst' },
        { id: 'o2', tipo: 'orderResult' }
      ]
    }
  },

  /* Nunca a === b: dar la vuelta a 4 × 4 no enseñaría nada. */
  pairs: [
    { a: 2, b: 5 }, { a: 3, b: 4 }, { a: 2, b: 7 }, { a: 3, b: 6 },
    { a: 4, b: 5 }, { a: 2, b: 9 }, { a: 3, b: 8 }, { a: 4, b: 6 }
  ],

  /* Se parte por 5 o por 10, que son los trozos que ya se saben. */
  splits: [
    { a: 6, b: 7, cut: 5 }, { a: 4, b: 8, cut: 5 }, { a: 7, b: 6, cut: 5 },
    { a: 3, b: 9, cut: 5 }, { a: 8, b: 7, cut: 5 }, { a: 6, b: 8, cut: 5 }
  ],

  /* El corte es siempre por las decenas: es lo que hace que se pueda
     multiplicar un número de dos cifras sin aprenderse nada nuevo. */
  twoDigit: [
    { a: 13, b: 4 }, { a: 12, b: 5 }, { a: 14, b: 3 }, { a: 15, b: 4 },
    { a: 16, b: 3 }, { a: 11, b: 6 }, { a: 12, b: 7 }, { a: 18, b: 2 }
  ],

  /* Divisiones exactas, con el divisor de una cifra. */
  shares: [
    { total: 12, groups: 3 }, { total: 20, groups: 4 }, { total: 18, groups: 6 },
    { total: 24, groups: 4 }, { total: 15, groups: 5 }, { total: 28, groups: 7 },
    { total: 30, groups: 5 }, { total: 36, groups: 6 }
  ],

  /* Cuántos grupos salen. Aquí el tamaño del grupo puede tener dos
     cifras sin que el dibujo se vuelva imposible de contar. */
  groups: [
    { total: 36, size: 12 }, { total: 48, size: 12 }, { total: 45, size: 15 },
    { total: 44, size: 11 }, { total: 60, size: 15 }, { total: 42, size: 14 },
    { total: 40, size: 10 }, { total: 39, size: 13 }
  ],

  /* Saltos sobre la recta de los números. `from` puede ser negativo y
     `step` es cuánto se salta; a dónde se llega lo calcula app.js, y la
     recta se dibuja con los mismos números.
     El recorrido se queda entre -6 y 10, que es lo que cabe dibujado y
     se puede recorrer contando de uno en uno. */
  walks: [
    { from: -2, step: 5 }, { from: -4, step: 6 }, { from: -1, step: 3 },
    { from: -5, step: 8 }, { from: -3, step: 4 }, { from: 2, step: 6 },
    { from: -6, step: 9 }, { from: 1, step: 7 }, { from: -2, step: 2 },
    { from: 3, step: 5 }, { from: -4, step: 10 }, { from: 0, step: 4 }
  ],

  lineMin: -6,
  lineMax: 10,

  /* a + b × c, con y sin paréntesis. Los dos resultados son distintos
     en todas: si coincidieran, el paréntesis no enseñaría nada. */
  orders: [
    { a: 2, b: 3, c: 4 }, { a: 5, b: 2, c: 3 }, { a: 4, b: 2, c: 5 },
    { a: 3, b: 4, c: 2 }, { a: 6, b: 3, c: 3 }, { a: 2, b: 5, c: 4 },
    { a: 7, b: 2, c: 4 }, { a: 1, b: 6, c: 3 }
  ]
};
