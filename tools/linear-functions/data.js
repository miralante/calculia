/* ============================================================
   Calculia — Funciones lineales y afines — datos
   Formato:
   - DATA.view: la cuadrícula. x va de 0 a xMax y y de 0 a yMax. Los
     números van escritos en los bordes, así que un punto se lee, no se
     calcula. pickYMax es la altura de los dibujos pequeños de «Las
     casillas» (nivel k2), que enseñan dos casillas a la vez.
   - DATA.rules: las reglas de la forma y = m · x + n. Con n = 0 la
     recta pasa por el cero (lineal); con n > 0 empieza en otro número
     (afín). Cada regla cabe en la cuadrícula para todo x de 0 a xMax:
     app.js lo comprueba al arrancar.
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.real: los ejemplos de la vida real que se ven antes de
     practicar. Cada uno tiene un dibujo (picto) y su texto va en
     strings.<locale>.js.
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  view: { xMax: 4, yMax: 10, pickYMax: 5 },

  rules: [
    { m: 1, n: 0 }, { m: 1, n: 1 }, { m: 1, n: 3 },
    { m: 2, n: 0 }, { m: 2, n: 1 }, { m: 2, n: 2 }
  ],

  real: [
    { id: 'taxi', picto: '🚕' },
    { id: 'hucha', picto: '🐷' },
    { id: 'galletas', picto: '🍪' }
  ],

  activities: {
    /* Las casillas: un punto se dice con dos números, primero x (el de
       abajo) y después y (el de la izquierda). Es lo que hace falta para
       leer cualquier recta, y por eso va primero. Ya no es una actividad
       de geometría. */
    casilla: {
      picto: '📍',
      levels: [
        { id: 'k1', tipo: 'readCoord' },
        { id: 'k2', tipo: 'pickCoord' }
      ]
    },

    /* La regla como máquina: entra x, sale y. Primero lineal (y = m · x),
       que empieza en cero; después afín (y = m · x + n), que empieza en
       otro número. El error típico es olvidar la n, y las respuestas
       mal hechas lo ofrecen a propósito. */
    tabla: {
      picto: '🧮',
      levels: [
        { id: 'v1', tipo: 'tableOut', affine: false },
        { id: 'v2', tipo: 'tableOut', affine: true }
      ]
    },

    /* La recta: los puntos que se alinean. r1 pone tres en línea y uno
       fuera; r2 pregunta si la recta es lineal o afín, mirando si pasa
       por el cero. */
    recta: {
      picto: '📈',
      levels: [
        { id: 'r1', tipo: 'offTheLine' },
        { id: 'r2', tipo: 'kindOfLine' }
      ]
    },

    /* Cuánto sube (la m, la pendiente) y dónde empieza (la n). */
    pendiente: {
      picto: '🪜',
      levels: [
        { id: 'p1', tipo: 'slope' },
        { id: 'p2', tipo: 'start' }
      ]
    },

    /* El test que mezcla todo: una ronda con preguntas tomadas al azar
       entre los niveles de las cuatro actividades. Igual que en Escala,
       la cola se construye una vez y se lee por índice. */
    test: {
      picto: '🎯',
      levels: [{ id: 'z1', tipo: 'mixedTest' }]
    }
  }
};
