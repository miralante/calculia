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

  gallery: [
    { id: 'circle', type: 'flat', object: '🕒' },
    { id: 'triangle', type: 'flat', object: '⚠️' },
    { id: 'square', type: 'flat', object: '🪟' },
    { id: 'rectangle', type: 'flat', object: '🚪' },
    { id: 'rhombus', type: 'flat', object: '🪁' },
    { id: 'trapezoid', type: 'flat', object: '🪣' },
    { id: 'pentagon', type: 'flat', object: '🛡️' },
    { id: 'hexagon', type: 'flat', object: '🐝' },
    { id: 'octagon', type: 'flat', object: '🛑' },
    { id: 'cube', type: 'solid', object: '🎲' },
    { id: 'rectangularPrism', type: 'solid', object: '📦' },
    { id: 'triangularPrism', type: 'solid', object: '⛺' },
    { id: 'pyramid', type: 'solid', object: '🏜️' },
    { id: 'sphere', type: 'solid', object: '⚽' },
    { id: 'cylinder', type: 'solid', object: '🥫' },
    { id: 'cone', type: 'solid', object: '🍦' }
  ],

  activities: {
    formas: {
      picto: '🔷',
      levels: [
        {
          id: 'test',
          tipo: 'mixed',
          questions: [
            { id: 'name-circle', tipo: 'shapeName', shape: 'circle' },
            { id: 'name-triangle', tipo: 'shapeName', shape: 'triangle' },
            { id: 'name-square', tipo: 'shapeName', shape: 'square' },
            { id: 'name-rectangle', tipo: 'shapeName', shape: 'rectangle' },
            { id: 'name-rhombus', tipo: 'shapeName', shape: 'rhombus' },
            { id: 'name-trapezoid', tipo: 'shapeName', shape: 'trapezoid' },
            { id: 'name-pentagon', tipo: 'shapeName', shape: 'pentagon' },
            { id: 'name-hexagon', tipo: 'shapeName', shape: 'hexagon' },
            { id: 'name-octagon', tipo: 'shapeName', shape: 'octagon' },
            { id: 'sides-triangle', tipo: 'shapeCount', count: 'sides', shape: 'triangle' },
            { id: 'sides-square', tipo: 'shapeCount', count: 'sides', shape: 'square' },
            { id: 'sides-rectangle', tipo: 'shapeCount', count: 'sides', shape: 'rectangle' },
            { id: 'sides-rhombus', tipo: 'shapeCount', count: 'sides', shape: 'rhombus' },
            { id: 'sides-trapezoid', tipo: 'shapeCount', count: 'sides', shape: 'trapezoid' },
            { id: 'sides-pentagon', tipo: 'shapeCount', count: 'sides', shape: 'pentagon' },
            { id: 'corners-triangle', tipo: 'shapeCount', count: 'corners', shape: 'triangle' },
            { id: 'corners-square', tipo: 'shapeCount', count: 'corners', shape: 'square' },
            { id: 'corners-rectangle', tipo: 'shapeCount', count: 'corners', shape: 'rectangle' },
            { id: 'corners-rhombus', tipo: 'shapeCount', count: 'corners', shape: 'rhombus' },
            { id: 'corners-trapezoid', tipo: 'shapeCount', count: 'corners', shape: 'trapezoid' },
            { id: 'corners-pentagon', tipo: 'shapeCount', count: 'corners', shape: 'pentagon' },
            { id: 'solid-cube', tipo: 'solidName', dir: 'toName', solid: 'cube' },
            { id: 'solid-sphere', tipo: 'solidName', dir: 'toName', solid: 'sphere' },
            { id: 'solid-cylinder', tipo: 'solidName', dir: 'toName', solid: 'cylinder' },
            { id: 'solid-rectangular-prism', tipo: 'solidName', dir: 'toName', solid: 'rectangularPrism' },
            { id: 'solid-triangular-prism', tipo: 'solidName', dir: 'toName', solid: 'triangularPrism' },
            { id: 'solid-pyramid', tipo: 'solidName', dir: 'toName', solid: 'pyramid' },
            { id: 'solid-cone', tipo: 'solidName', dir: 'toName', solid: 'cone' },
            { id: 'faces-cube', tipo: 'solidParts', net: 'cube' },
            { id: 'faces-prism', tipo: 'solidParts', net: 'prism' },
            { id: 'faces-pyramid', tipo: 'solidParts', net: 'pyramid' },
            { id: 'net-cube', tipo: 'fromNet', net: 'cube' },
            { id: 'net-prism', tipo: 'fromNet', net: 'prism' },
            { id: 'net-pyramid', tipo: 'fromNet', net: 'pyramid' }
          ]
        }
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
    rhombus:   { sides: 4, corners: 4 },
    trapezoid: { sides: 4, corners: 4 },
    pentagon:  { sides: 5, corners: 5 },
    hexagon:   { sides: 6, corners: 6 },
    octagon:   { sides: 8, corners: 8 }
  },

  solids: [
    { id: 'cube', objects: ['🎲', '🧊'] },
    { id: 'rectangularPrism', objects: ['📦', '📕'] },
    { id: 'triangularPrism', objects: ['⛺'] },
    { id: 'pyramid', objects: ['🏜️'] },
    { id: 'sphere', objects: ['⚽', '🏀', '🌍'] },
    { id: 'cylinder', objects: ['🥫', '🛢️'] },
    { id: 'cone', objects: ['🍦', '🚧'] }
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
