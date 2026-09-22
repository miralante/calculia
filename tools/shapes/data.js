/* ============================================================
   Calculia — Formas — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.sides: cuántos lados y cuántas esquinas tiene cada forma
     plana. Es un dato, no se calcula, para que el dibujo y la
     respuesta correcta no puedan desincronizarse.
   - DATA.solids: cada cuerpo con objetos reales que lo son de verdad.
     Un dado es un cubo; una caja NO (es un prisma), así que no está.
     Esa precisión importa: una respuesta "casi" enseña algo falso.
   Los nombres de formas, actividades y levels NO están aquí: son
   texto y viven en strings.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Primero reconocer la forma, después contar sus partes: nombrar
       algo es más fácil que analizarlo. */
    planas: {
      picto: '🔷',
      levels: [
        /* g1→g2 solo añade una forma más al grupo; g2→g3 cambia lo que
           se pregunta (nombrar → contar lados); g3→g4 solo cambia qué
           se cuenta (lados → esquinas). Una variable por paso. */
        { id: 'g1', tipo: 'shapeName', shapes: ['circle', 'square', 'triangle'] },
        { id: 'g2', tipo: 'shapeName', shapes: ['circle', 'square', 'triangle', 'rectangle'] },
        { id: 'g3', tipo: 'shapeCount', count: 'sides', shapes: ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon'] },
        { id: 'g4', tipo: 'shapeCount', count: 'corners', shapes: ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon'] }
      ]
    },

    /* Los cuerpos se presentan siempre a través de un objeto que se
       puede tener en la mano: así "cilindro" significa algo antes de
       ser una palabra. b1→b2 solo invierte la dirección. */
    cuerpos: {
      picto: '🧊',
      levels: [
        { id: 'b1', tipo: 'solidName', dir: 'toName' },
        { id: 'b2', tipo: 'solidName', dir: 'toObject' }
      ]
    },

    /* Prismas y pirámides, y lo que sale al doblar un desarrollo. El
       desarrollo se dibuja abierto y se elige el cuerpo: eso sí se puede
       contestar mirando, aunque doblarlo con el dedo no. */
    desarrollos: {
      picto: '📦',
      levels: [
        { id: 'p1', tipo: 'solidParts' },
        { id: 'p2', tipo: 'fromNet' }
      ]
    }
  },

  /* El círculo no aparece en los niveles de contar: no tiene lados
     rectos ni esquinas, y responder "0" enseñaría a contar algo que
     no está. */
  sides: {
    triangle:  { sides: 3, corners: 3 },
    square:    { sides: 4, corners: 4 },
    rectangle: { sides: 4, corners: 4 },
    pentagon:  { sides: 5, corners: 5 },
    hexagon:   { sides: 6, corners: 6 }
  },

  solids: [
    { id: 'cube',     objects: ['🎲', '🧊'] },
    { id: 'sphere',   objects: ['⚽', '🏀', '🌍'] },
    { id: 'cylinder', objects: ['🥫', '🛢️'] }
  ],

  /* Cuerpos con caras planas, por sus piezas. `faces` es cuántas caras
     tiene y `net` cómo se dibuja abierto: cada letra es una pieza del
     desarrollo, fila a fila.
     - 'S' es un cuadrado, 'R' un rectángulo, 'T' un triángulo.
     - '.' es un hueco.
     Ni el nombre ni el número de caras se deducen del dibujo: app.js
     comprueba al arrancar que las piezas del desarrollo son tantas como
     las caras, para que el dibujo y la respuesta no puedan discrepar. */
  nets: [
    { id: 'cube', faces: 6, rows: ['.S..', 'SSSS', '.S..'] },
    { id: 'prism', faces: 5, rows: ['.T.', 'RRR', '.T.'] },
    { id: 'pyramid', faces: 5, rows: ['.T.', 'TST', '.T.'] }
  ]
};
