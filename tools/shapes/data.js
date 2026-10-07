/* ============================================================
   Calculia — Formas — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.sides: cuántos lados y cuántos vértices tiene cada forma
     plana. Es un dato, no se calcula, para que el dibujo, la aclaración
     de la galería, el perímetro y la respuesta correcta no puedan
     desincronizarse.
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
    { id: 'square', type: 'flat', object: '⬛' },
    { id: 'rectangle', type: 'flat', object: '🚪' },
    { id: 'rhombus', type: 'flat', object: '🪁' },
    { id: 'trapezoid', type: 'flat', object: '🥛' },
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
            /* El perímetro: el lado se da en la pregunta y el total sale de
               multiplicarlo por los lados que tiene la forma, así que
               aquí no hay ningún número que se pueda desincronizar del
               dibujo. Solo formas regulares —todos sus lados miden lo
               mismo—, porque en un rectángulo o un trapecio el lado no
               es uno solo: app.js lo comprueba al arrancar y avisa. */
            { id: 'perimeter-triangle', tipo: 'shapePerimeter', shape: 'triangle', side: 2 },
            { id: 'perimeter-square', tipo: 'shapePerimeter', shape: 'square', side: 3 },
            { id: 'perimeter-rhombus', tipo: 'shapePerimeter', shape: 'rhombus', side: 2 },
            { id: 'perimeter-pentagon', tipo: 'shapePerimeter', shape: 'pentagon', side: 2 },
            { id: 'perimeter-hexagon', tipo: 'shapePerimeter', shape: 'hexagon', side: 3 },
            { id: 'perimeter-octagon', tipo: 'shapePerimeter', shape: 'octagon', side: 2 },
            /* Los cuatro conceptos nuevos se preguntan aquí en su forma de
               reconocer, no de calcular: contar cuadraditos es de
               `geometry` y medir un lado es de `similar`. Lo que se
               comprueba es que el niño sabe a qué parte de la figura o del
               cuerpo se está llamando con cada palabra.
               El área no se repite: es la misma pregunta con cualquier
               forma, así que una basta. */
            { id: 'area-inside', tipo: 'shapeArea' },
            { id: 'volume-cube', tipo: 'solidVolume', solid: 'cube', against: ['sphere', 'cone'] },
            { id: 'volume-cylinder', tipo: 'solidVolume', solid: 'cylinder', against: ['cone', 'sphere'] },
            { id: 'volume-cone', tipo: 'solidVolume', solid: 'cone', against: ['cube', 'cylinder'] },
            /* Solo figuras con un único eje vertical: un cuadrado o un
               hexágono tienen también el horizontal y la pregunta no
               tendría una sola respuesta. app.js lo comprueba al arrancar. */
            { id: 'symmetry-triangle', tipo: 'shapeSymmetry', shape: 'triangle' },
            { id: 'symmetry-pentagon', tipo: 'shapeSymmetry', shape: 'pentagon' },
            { id: 'symmetry-trapezoid', tipo: 'shapeSymmetry', shape: 'trapezoid' },
            /* Las tres opciones se dibujan al mismo tamaño, así que solo la
               forma las distingue: elegir la mayor o la menor sería otra
               pregunta. */
            { id: 'similar-square', tipo: 'shapeSimilar', shape: 'square', against: ['triangle', 'hexagon'] },
            { id: 'similar-pentagon', tipo: 'shapeSimilar', shape: 'pentagon', against: ['rectangle', 'octagon'] },
            { id: 'similar-octagon', tipo: 'shapeSimilar', shape: 'octagon', against: ['rhombus', 'triangle'] },
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

  /* El círculo no aparece en los niveles de contar ni en los de perímetro:
     no tiene lados rectos ni vértices, y responder "0" —o medir su
     contorno como una suma de lados— enseñaría a contar algo que no
     está. Su perímetro sí se puede medir, pero por la curva, y eso es
     otra actividad. */
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
     - `solid` es el cuerpo que sale al plegar ese desarrollo. Sirve para
       que la aclaración de la galería y el test no puedan discrepar sobre
       cuántas caras tiene: app.js compara ese texto con `faces` al arrancar.
     Ni el nombre ni el número de caras se deducen del dibujo: app.js
     comprueba al arrancar que las piezas del desarrollo son tantas como
     las caras, para que el dibujo y la respuesta no puedan discrepar. */
  nets: [
    { id: 'cube', solid: 'cube', faces: 6, rows: ['.S..', 'SSSS', '.S..'] },
    { id: 'prism', solid: 'triangularPrism', faces: 5, rows: ['.T.', 'RRR', '.T.'] },
    { id: 'pyramid', solid: 'pyramid', faces: 5, rows: ['.T.', 'TST', '.T.'] }
  ]
};
