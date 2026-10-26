/* ============================================================
   Calculia — Geometría — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.angles: cada ángulo por sus grados. Su NOMBRE no está aquí:
     app.js lo deduce de los grados (menos de 90, 90, más de 90), así
     que el dibujo y la respuesta no pueden decir cosas distintas.
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

    /* Clasificar por los lados iguales. Primero se cuentan las marcas, y
       solo después se le pone nombre: contar es más fácil que recordar. */
    clasificar: {
      picto: '🔺',
      levels: [
        { id: 'q1', tipo: 'equalSides' },
        { id: 'q2', tipo: 'nameFigure', group: 'triangles' },
        { id: 'q3', tipo: 'nameFigure', group: 'quads' }
      ]
    }
  },

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
  ]
};
