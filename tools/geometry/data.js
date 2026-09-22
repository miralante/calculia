/* ============================================================
   Calculia — Geometría — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.angles: cada ángulo por sus grados. Su NOMBRE no está aquí:
     app.js lo deduce de los grados (menos de 90, 90, más de 90), así
     que el dibujo y la respuesta no pueden decir cosas distintas.
   - DATA.rects: rectángulos sobre cuadrícula, en cuadraditos. El
     perímetro y el área tampoco están guardados: se calculan, por lo
     mismo.
   - DATA.figures: figuras dibujadas cuadradito a cuadradito. '#' es
     un cuadradito pintado y '.' uno vacío. Si la figura es simétrica
     o no TAMPOCO está guardado: app.js lo comprueba doblando la
     figura, que es exactamente lo que se le pide a quien juega.
   Los nombres NO están aquí: son texto y viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Los ángulos primero: se reconocen de un vistazo y aparecen en
       todas las esquinas de la calle. */
    angulos: {
      picto: '📐',
      levels: [
        /* n1→n2 solo cambia con qué se compara el ángulo recto;
           n2→n3 junta los tres. Una variable por paso. */
        { id: 'n1', tipo: 'angleKind', against: 'acute' },
        { id: 'n2', tipo: 'angleKind', against: 'obtuse' },
        { id: 'n3', tipo: 'angleKind', against: 'all' },
        /* n4 añade una sola cosa: el transportador, que convierte
           «más o menos que la esquina» en un número de grados.
           n5 lleva esos grados al reloj: la vuelta entera son 360 y cada
           hora es un trozo igual, que es el sistema sexagesimal visto
           en los dos sitios donde de verdad aparece. */
        { id: 'n4', tipo: 'measureAngle' },
        { id: 'n5', tipo: 'clockAngle' }
      ]
    },

    /* El perímetro como lo que es: cuánto mide el borde, contando los
       cuadraditos que se recorren al darle la vuelta. */
    perimetro: {
      picto: '🔲',
      levels: [
        { id: 'p1', tipo: 'perimeter', shape: 'square' },
        { id: 'p2', tipo: 'perimeter', shape: 'rect' }
      ]
    },

    /* El área como lo que es: cuántos cuadraditos caben dentro. */
    area: {
      picto: '🟦',
      levels: [
        { id: 'a1', tipo: 'area', shape: 'square' },
        { id: 'a2', tipo: 'area', shape: 'rect' },
        /* a3 cambia solo la figura: un triángulo, dibujado dentro de su
           rectángulo para que «la mitad» se vea. */
        { id: 'a3', tipo: 'triangleArea' }
      ]
    },

    /* La simetría como doblar por la mitad y que coincida. */
    simetria: {
      picto: '🦋',
      levels: [
        { id: 'm1', tipo: 'symmetry' },
        { id: 'm2', tipo: 'symmetryPick' },
        /* Y por último distinguir mover de girar: la misma figura movida
           sigue mirando igual, y girada no. */
        { id: 'm3', tipo: 'movedOrTurned' }
      ]
    },

    /* El círculo, medido como se mide de verdad: el borde comparado con
       lo que mide de un lado a otro, y lo de dentro contando cuadrados. */
    circulo: {
      picto: '⭕',
      levels: [
        { id: 'w1', tipo: 'circleEdge' },
        { id: 'w2', tipo: 'circleArea' }
      ]
    },

    /* El volumen como lo que es: cuántos cubos caben dentro. */
    volumen: {
      picto: '🧊',
      levels: [
        { id: 'v1', tipo: 'volume' },
        /* v2 pregunta por fuera en vez de por dentro: el cuerpo abierto
           en sus seis caras, y se cuentan los cuadraditos de todas. */
        { id: 'v2', tipo: 'surface' }
      ]
    },

    /* Clasificar por los lados iguales. Primero se cuentan las marcas, y
       solo después se le pone nombre: contar es más fácil que recordar. */
    clasificar: {
      picto: '🔺',
      levels: [
        { id: 'q1', tipo: 'equalSides' },
        { id: 'q2', tipo: 'nameFigure', group: 'triangles' },
        { id: 'q3', tipo: 'nameFigure', group: 'quads' }
      ]
    },

    /* Una casilla se dice con dos números. La cuadrícula lleva los
       números escritos, así que se lee, no se calcula. */
    coordenadas: {
      picto: '🗺️',
      levels: [
        { id: 'k1', tipo: 'readCoord' },
        { id: 'k2', tipo: 'pickCoord' },
        /* k3 pone varios puntos a la vez: si están en línea recta se ve,
           y el que se sale también. Esa es la recta de la geometría
           analítica, sin ecuación. */
        { id: 'k3', tipo: 'offTheLine' }
      ]
    },

    /* Dos rectas a la vez: o no se tocan nunca, o se cruzan, y si al
       cruzarse hacen esquina de cuadrado son perpendiculares. */
    rectas: {
      picto: '➕',
      levels: [
        { id: 'r1', tipo: 'linePair' }
      ]
    }
  },

  /* Parejas de rectas, cada una por dos puntos en una caja de 120x120.
     `kind` NO es la respuesta: app.js compara las pendientes del dibujo
     y saca de ahí si son paralelas, perpendiculares o solo cruzadas, y
     comprueba al arrancar que cada pareja es lo que dice ser. */
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
  ],

  /* Triángulos rectángulos por sus dos catetos, en cuadraditos. Los dos
     pares: el área sale entera al partir el rectángulo por la mitad, que
     es justo lo que el dibujo enseña. app.js lo comprueba. */
  triangles: [
    { w: 4, h: 2 }, { w: 2, h: 4 }, { w: 6, h: 2 }, { w: 4, h: 4 },
    { w: 6, h: 4 }, { w: 2, h: 6 }, { w: 4, h: 6 }
  ],

  /* Marcas de hora entre las que se mide el ángulo. Los grados no están
     guardados: la vuelta entera son 360 y hay 12 marcas, así que cada
     hueco vale 30, y app.js lo saca de ahi. */
  clockPairs: [
    { from: 12, to: 3 }, { from: 12, to: 1 }, { from: 12, to: 2 },
    { from: 3, to: 6 }, { from: 12, to: 4 }, { from: 9, to: 12 },
    { from: 12, to: 6 }, { from: 2, to: 5 }, { from: 4, to: 8 }
  ],

  /* Cuantos grados vale la vuelta entera, y cuantas marcas tiene el
     reloj. De estos dos numeros sale lo que vale cada hueco. */
  fullTurn: 360,
  clockMarks: 12,


  /* Figuras por sus vértices. Cuántos lados iguales tiene cada una NO
     está guardado: app.js mide los lados del dibujo, así que las marcas,
     el nombre y la respuesta salen todos del mismo sitio.
     Las coordenadas están elegidas para que los lados que deben ser
     iguales lo sean de verdad, no casi. */
  figuresByName: {
    triangles: [
      /* Lado 100 los tres: base 100 y altura 86,6. */
      { id: 'equilateral', points: [[10, 96.6], [110, 96.6], [60, 10]] },
      /* Dos lados de 94,3 y una base de 100. */
      { id: 'isosceles', points: [[10, 100], [110, 100], [60, 20]] },
      /* 100, 106,3 y 72,8: los tres distintos. */
      { id: 'scalene', points: [[10, 100], [110, 100], [30, 30]] }
    ],
    quads: [
      { id: 'square', points: [[20, 20], [100, 20], [100, 100], [20, 100]] },
      { id: 'rectangle', points: [[10, 30], [110, 30], [110, 90], [10, 90]] },
      /* Cuatro lados de 70,7 pero sin esquinas rectas: por eso no es un
         cuadrado, y por eso hace falta la explicación al lado del nombre. */
      { id: 'rhombus', points: [[60, 10], [110, 60], [60, 110], [10, 60]] }
    ]
  },

  /* Cuadrícula de coordenadas. Pequeña a propósito: las dos filas de
     números tienen que caber y leerse a 320 px. */
  grid: { cols: 5, rows: 5 },

  /* Puntos en línea recta, dichos como una regla: se empieza en `from` y
     se avanza `step` tantas veces como diga `n`. Los puntos NO están
     guardados uno a uno: app.js los saca de la regla, así que están en
     línea por construcción. `off` es el que se sale, y app.js comprueba
     al arrancar que de verdad no cae en esa recta y que todos caben en la
     cuadrícula. */
  lineRules: [
    { from: [1, 1], step: [1, 1], n: 3, off: [4, 2] },
    { from: [1, 5], step: [1, -1], n: 3, off: [4, 4] },
    { from: [1, 3], step: [2, 0], n: 3, off: [3, 5] },
    { from: [2, 1], step: [0, 2], n: 3, off: [4, 4] },
    { from: [1, 2], step: [2, 1], n: 3, off: [2, 5] },
    { from: [5, 1], step: [-2, 1], n: 3, off: [3, 5] }
  ],

  /* Círculos por lo que miden de un lado a otro, en centímetros. El
     borde mide algo más de 3 veces eso; la actividad pregunta por el
     "más o menos", que es la introducción honesta a esa idea. Ni el
     borde ni los cuadrados de dentro están guardados: app.js los
     calcula. */
  circles: [4, 5, 8, 10, 20],

  /* Cajas por sus tres medidas, en cubos. Pequeñas para que las capas
     se puedan dibujar y contar una a una. */
  boxes: [
    { w: 2, h: 2, d: 2 }, { w: 3, h: 2, d: 2 }, { w: 3, h: 3, d: 2 },
    { w: 4, h: 2, d: 3 }, { w: 2, h: 3, d: 4 }, { w: 4, h: 3, d: 2 }
  ],

  /* Figuras para distinguir mover de girar. Ninguna es simétrica al
     girarla: si lo fuera, movida y girada se verían igual y la pregunta
     no tendría respuesta única. app.js lo comprueba. */
  movedFigures: [
    { id: 'step3', rows: ['#..', '##.', '###'] },
    { id: 'hook3', rows: ['##.', '#..', '#.#'] },
    { id: 'flag3', rows: ['###', '#..', '#..'] },
    { id: 'zig3', rows: ['##.', '.##', '..#'] }
  ],

  /* Sin 90 aquí no habría ángulo recto que reconocer, y sin ángulos
     claramente lejos de 90 la diferencia no se vería.
     Ningún ángulo repite grados: dos entradas con los mismos grados se
     dibujarían exactamente igual, y salir una detrás de otra se lee
     como un botón "Siguiente" que no hace nada. */
  angles: [
    { id: 'right', deg: 90 },
    { id: 'acute1', deg: 30 },
    { id: 'acute2', deg: 45 },
    { id: 'acute3', deg: 60 },
    { id: 'obtuse1', deg: 120 },
    { id: 'obtuse2', deg: 135 },
    { id: 'obtuse3', deg: 150 }
  ],

  /* Lados en cuadraditos. Pequeños a propósito: se tienen que poder
     contar de uno en uno sin perderse. */
  rects: {
    square: [
      { w: 2, h: 2 }, { w: 3, h: 3 }, { w: 4, h: 4 }, { w: 5, h: 5 }
    ],
    rect: [
      { w: 4, h: 2 }, { w: 5, h: 3 }, { w: 6, h: 2 }, { w: 3, h: 5 }, { w: 6, h: 4 }
    ]
  },

  figures: [
    /* Simétricas al doblar por una raya vertical. */
    { id: 'cross', rows: ['.##.', '####', '####', '.##.'] },
    { id: 'tree', rows: ['..##..', '.####.', '######', '..##..'] },
    { id: 'cup', rows: ['#....#', '#....#', '######', '.####.'] },
    { id: 'arrow', rows: ['..##..', '.####.', '##..##', '..##..'] },
    { id: 'house', rows: ['..##..', '.####.', '######', '#.##.#'] },
    /* No simétricas: al doblarlas, un lado sobra.
       Ninguna deja vacía la primera ni la última columna: si las dejara,
       la raya de doblar caería fuera del centro de lo que se ve. */
    { id: 'flag', rows: ['####', '####', '##..', '##..'] },
    { id: 'step', rows: ['#...', '##..', '###.', '####'] },
    { id: 'hook', rows: ['####', '#...', '#...', '###.'] },
    { id: 'wave', rows: ['##..##', '.####.', '##....', '####..'] },
    { id: 'lean', rows: ['####', '###.', '#...', '#...'] }
  ]
};
