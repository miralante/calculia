/* ============================================================
   Calculia — Formas parecidas — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   Nada de lo que se puede calcular está guardado: si dos figuras son
   la misma forma, cuántos cuadraditos tiene cada cuadrado del triángulo
   y cuál rampa está más inclinada lo calcula app.js con estos números.
   Los textos NO están aquí: viven en strings.<locale>.js.

   Nivel de ambición: 💡 concepto (ver doc/es/spec.md §8.1). No se pide
   calcular senos ni resolver triángulos: se pide ver que dos figuras
   pueden tener la misma forma y distinto tamaño, que el cuadrado del
   lado largo es igual que los otros dos juntos, y que una rampa puede
   estar más inclinada que otra. Eso se presenta entero y se puede
   contar en pantalla.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* La misma forma a otro tamaño: es lo que hace un plano, una foto
       ampliada o un mapa. */
    semejanza: {
      picto: '🔍',
      levels: [
        /* p1→p2 solo cambia la dirección: de juzgar una pareja a elegir
           cuál de tres es la misma forma. */
        { id: 'p1', tipo: 'sameShape' },
        { id: 'p2', tipo: 'pickSameShape' }
      ]
    },

    /* El cuadrado del lado largo es igual que los otros dos juntos. Se
       cuenta, no se demuestra: eso es Pitágoras presentado, no exigido. */
    pitagoras: {
      picto: '📐',
      levels: [
        { id: 't1', tipo: 'squaresOnSides' }
      ]
    },

    /* Cuál sube más rápido. La trigonometría empieza aquí y, para esta
       actividad, aquí se queda. */
    rampas: {
      picto: '🛝',
      levels: [
        { id: 'r1', tipo: 'steeper' },
        { id: 'r2', tipo: 'sameSlope' }
      ]
    }
  },

  /* Rectángulos por su ancho y su alto, en cuadraditos. Dos son la
     misma forma cuando uno es el otro multiplicado por algo: app.js lo
     comprueba multiplicando en cruz, sin decimales de por medio. */
  rects: [
    { w: 2, h: 3 }, { w: 4, h: 6 }, { w: 6, h: 9 },
    { w: 3, h: 2 }, { w: 6, h: 4 },
    { w: 2, h: 5 }, { w: 4, h: 10 },
    { w: 3, h: 4 }, { w: 6, h: 8 },
    { w: 2, h: 2 }, { w: 4, h: 4 },
    { w: 3, h: 5 }, { w: 6, h: 10 },
    /* 5x2 y 10x4: el ancho y el alto se duplican los dos, así que son la
       misma forma. Sin esta pareja, 5x2 se quedaría sin con quién
       compararse y app.js lo avisa al arrancar. */
    { w: 5, h: 2 }, { w: 10, h: 4 },
    { w: 2, h: 4 }, { w: 3, h: 6 }
  ],

  /* Triángulos rectángulos con los dos catetos en cuadraditos. Los
     cuadrados que se dibujan sobre los lados se cuentan, así que los
     números son pequeños a propósito. */
  legs: [
    { a: 3, b: 4 }, { a: 2, b: 3 }, { a: 3, b: 3 },
    { a: 2, b: 4 }, { a: 4, b: 4 }, { a: 2, b: 5 },
    { a: 3, b: 5 }, { a: 4, b: 5 }
  ],

  /* Rampas por lo que avanzan y lo que suben. Más inclinada es la que
     sube más por cada paso que avanza; app.js compara multiplicando en
     cruz, así que no hay redondeos.
     Las parejas se forman en app.js: aquí solo están las rampas. */
  ramps: [
    { run: 4, rise: 1 }, { run: 4, rise: 2 }, { run: 4, rise: 3 },
    { run: 3, rise: 1 }, { run: 3, rise: 2 }, { run: 3, rise: 3 },
    { run: 6, rise: 2 }, { run: 6, rise: 3 }, { run: 2, rise: 1 },
    { run: 5, rise: 1 }, { run: 5, rise: 2 }, { run: 6, rise: 1 }
  ]
};
