/* ============================================================
   Calculia — Trigonometría — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.triangles: triángulos rectángulos por sus dos catetos, en
     cuadraditos. La hipotenusa NO está guardada: app.js la saca, y al
     arrancar comprueba que es el lado más largo. Así el dibujo y la
     respuesta no pueden decir cosas distintas.
   - DATA.reasonPairs: triángulos cuya pareja es el mismo triángulo
     al doble de tamaño. La razón (el cuanto sube por cada cuanto
     avanza) no cambia al agrandar la figura: eso es lo que sostiene
     toda la trigonometría, y aquí se ve contando cuadraditos.
     El doble lo saca app.js del pequeño, así que una pareja no puede
     descuadrarse.
   Los nombres NO están aquí: son texto y viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Los tres lados del triángulo, nombrados por la faena que hacen.
       Primero el más fácil de ver (el más largo), después los dos que
       dependen de qué ángulo se está mirando. */
    lados: {
      picto: '📏',
      levels: [
        { id: 'l1', tipo: 'whichHypotenuse' },
        /* l2 mira el ángulo de la esquina de abajo. l3 mira el de arriba.
           Solo cambia dónde está el ángulo marcado: una variable por paso. */
        { id: 'l2', tipo: 'whichOpposite', corner: 'B' },
        { id: 'l3', tipo: 'whichAdjacent', corner: 'C' }
      ]
    },

    /* La razón: cuánto sube por cada cuanto avanza. Se cuenta primero y
       solo después se compara entre triángulos de distinto tamaño. */
    razon: {
      picto: '📊',
      levels: [
        { id: 'y1', tipo: 'countReason' },
        /* y2 solo dice si dos triángulos la comparten. y3 pide elegir
           cuál de tres la comparte. Primero se juzga, luego se elige. */
        { id: 'y2', tipo: 'sameReasonJudge' },
        { id: 'y3', tipo: 'whichSameReason' }
      ]
    },

    /* La inclinación en el mundo real: la escalera apoyada en la pared.
       Lo que se aprende aquí ya no son triángulos, sino una cosa de
       cada día. */
    medir: {
      picto: '⛰️',
      levels: [
        { id: 'u1', tipo: 'ladderSide' },
        { id: 'u2', tipo: 'ladderTaller' }
      ]
    }
  },

  /* Triángulos rectángulos por sus dos catetos, en cuadraditos: `up` es
     el lado que sube por la pared y `along` el que avanza por el suelo.
     Los catetos se cuentan de uno en uno, así que son números pequeños a
     propósito. */
  triangles: [
    { id: 'a', up: 3, along: 4 },
    { id: 'b', up: 4, along: 3 },
    { id: 'c', up: 2, along: 3 },
    { id: 'd', up: 3, along: 2 },
    { id: 'e', up: 3, along: 3 },
    { id: 'f', up: 4, along: 5 },
    { id: 'g', up: 5, along: 4 },
    { id: 'h', up: 2, along: 2 },
    { id: 'i', up: 1, along: 3 },
    { id: 'j', up: 2, along: 5 },
    { id: 'k', up: 5, along: 2 },
    { id: 'l', up: 4, along: 4 }
  ],

  /* Escaleras apoyadas en la pared. Las tres miden EXACTAMENTE lo mismo:
     25 unidades de largo, cada una con un apoyo distinto. 7-24-25 y
     15-20-25 son las dos únicas parejas de triángulos rectángulos con la
     misma hipotenusa que caben en un dibujo pequeño, y por eso están
     elegidas así: al ser la misma escalera, lo único que cambia de una a
     otra es la inclinación, que es justo lo que se quiere enseñar.
     app.js comprueba al arrancar que las tres dan 25. */
  ladders: [
    /* Cuanto más lejos el pie de la pared, más tumbada. */
    { id: 'tumbada', run: 15, rise: 20 },
    { id: 'levantada', run: 7, rise: 24 },
    /* El tope: pegada a la pared, ya no puede subir más. */
    { id: 'pegada', run: 0, rise: 25 }
  ],

  /* Parejas de triángulos con la misma razón y el doble de tamaño. El
     doble lo construye app.js, así que aquí solo está el pequeño. */
  reasonPairs: [
    { id: 'p34', up: 3, along: 4 },
    { id: 'p23', up: 2, along: 3 },
    { id: 'p12', up: 1, along: 2 },
    { id: 'p11', up: 1, along: 1 }
  ]
};