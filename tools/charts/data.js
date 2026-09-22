/* ============================================================
   Calculia — Datos y gráficos — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.sets: conjuntos para el pictograma y la tabla. Cada uno con
     sus categorías y cuántos hay de cada una.
   - DATA.barSets: lo mismo para las barras, pero con valores pares y
     una escala que sube de 2 en 2: ahí la destreza es leer la altura
     contra la escala, no contar dibujos uno a uno.
   - DATA.shareSets: tres categorías cuya suma es múltiplo de 3, para
     que la media sea un reparto exacto y no un número con decimales.
   - DATA.tokens: todo lo que puede haber en una bolsa. DATA.bags usa
     sus ids; lo que NO está en una bolsa es lo que hace que sacarlo
     sea imposible, así que la lista completa es un dato, no un
     detalle.
   Los nombres de las categorías y de los conjuntos NO están aquí: son
   texto y viven en strings.<locale>.js ('cat.<id>', 'set.<id>').

   Invariantes que app.js comprueba al arrancar, porque de ellas
   depende que la respuesta sea única:
   - todo conjunto tiene un máximo único y un mínimo único;
   - ninguna bolsa mezcla dos cantidades iguales en el nivel de "qué
     es más probable".
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Pictograma primero: cada dibujo es una cosa, así que el gráfico
       se lee contando, que es lo que ya se sabe hacer. */
    pictograma: {
      picto: '📊',
      levels: [
        /* g1→g2 cambia la pregunta (cuántos → cuál tiene más);
           g2→g3 solo cambia el extremo (más → menos). */
        { id: 'g1', tipo: 'readRow' },
        { id: 'g2', tipo: 'extreme', which: 'max' },
        { id: 'g3', tipo: 'extreme', which: 'min' }
      ]
    },

    /* Barras después: la misma pregunta, pero ya no hay dibujos que
       contar; hay que apoyarse en la escala. */
    barras: {
      picto: '📈',
      levels: [
        { id: 'b1', tipo: 'readBar' },
        { id: 'b2', tipo: 'extremeBar', which: 'max' },
        { id: 'b3', tipo: 'extremeBar', which: 'min' },
        /* b4 añade una sola variable: dos series en el mismo gráfico, que
           es lo que hace falta para leer un gráfico combinado. */
        { id: 'b4', tipo: 'twoSeries' }
      ]
    },

    /* La misma información sin dibujo ninguno: solo números en una
       tabla. Es el paso a la representación abstracta. */
    tabla: {
      picto: '🧾',
      levels: [
        { id: 't1', tipo: 'readTable' },
        { id: 't2', tipo: 'mode' }
      ]
    },

    /* La media presentada como lo que es: repartir a partes iguales. */
    media: {
      picto: '⚖️',
      levels: [
        { id: 'a1', tipo: 'share' }
      ]
    },

    /* Probabilidad por conteo directo, nunca como fracción. */
    probabilidad: {
      picto: '🎲',
      levels: [
        { id: 'p1', tipo: 'chance' },
        { id: 'p2', tipo: 'moreLikely' },
        /* p4 dice la probabilidad como número, contando: cuántas de esa
           clase hay de las que hay en total. Sin fracciones ni tantos por
           ciento: «dos de seis» es ya la probabilidad. */
        { id: 'p4', tipo: 'chanceNumber' },
        /* Sacar dos veces: todos los resultados posibles se dibujan, así
           que se cuentan. Con 2 colores salen 4 y con 3 salen 9: por eso
           la respuesta cambia de una pregunta a otra, que es lo que hace
           que el nivel enseñe algo. */
        { id: 'p3', tipo: 'twoDraws' }
      ]
    },

    /* Cuántas combinaciones distintas salen. Se dibujan todas, así que
       la combinatoria empieza por contarlas, no por multiplicar. */
    combinaciones: {
      picto: '👕',
      levels: [
        { id: 'k1', tipo: 'outfits' }
      ]
    },

    /* Si los datos están muy juntos o muy repartidos. Es la idea de
       dispersión antes de cualquier fórmula. */
    reparto: {
      picto: '↔️',
      levels: [
        { id: 'x1', tipo: 'spread' },
        /* x2 pide lo mismo con un número: del más bajo al más alto,
           cuánto hay. Eso es el rango. */
        { id: 'x2', tipo: 'range' }
      ]
    },

    /* Dos cosas medidas a la vez: cuando una sube, ¿la otra sube o baja?
       Es la estadística de dos variables, leída en una nube de puntos. */
    dosCosas: {
      picto: '💫',
      levels: [
        { id: 'y1', tipo: 'scatter' }
      ]
    },

    /* Y el azar que depende de lo que ya ha pasado: si sacas una bola y no
       la devuelves, la siguiente vez hay una menos. */
    despues: {
      picto: '🔁',
      levels: [
        { id: 'w1', tipo: 'afterDraw' }
      ]
    }
  },

  /* Parejas de medidas tomadas a la vez. `dir` no lo usa app.js para
     responder: mira los puntos y ve si al avanzar suben o bajan. Está
     aquí para poder elegir de qué tipo se quiere una nube, y app.js
     comprueba al arrancar que cada una hace de verdad lo que dice. */
  clouds: [
    { id: 'heightAge', dir: 'up', points: [1, 2, 3, 4, 6, 7] },
    { id: 'studyMarks', dir: 'up', points: [2, 2, 4, 5, 6, 8] },
    { id: 'priceSales', dir: 'down', points: [8, 7, 5, 4, 3, 1] },
    { id: 'coldIceCream', dir: 'down', points: [7, 6, 6, 4, 2, 1] }
  ],

  /* Prendas para combinar. Todas las combinaciones se dibujan, así que
     el producto se mantiene pequeño a propósito. */
  outfits: [
    { tops: ['👕', '🧥'], bottoms: ['👖', '🩳'] },
    { tops: ['👕', '🧥', '👔'], bottoms: ['👖', '🩳'] },
    { tops: ['👕', '🧥'], bottoms: ['👖', '🩳', '🩴'] },
    { tops: ['👕', '🧥', '👔'], bottoms: ['👖', '🩳', '🩴'] }
  ],

  /* Dos grupos de medidas sobre la misma recta del 1 al 10. En cada
     pareja, uno está claramente más repartido que el otro: app.js lo
     comprueba comparando de dónde a dónde llega cada uno. */
  spreads: [
    { tight: [4, 5, 5, 6], wide: [1, 4, 7, 10] },
    { tight: [7, 8, 8, 9], wide: [2, 5, 8, 10] },
    { tight: [2, 3, 3, 4], wide: [1, 5, 6, 10] },
    { tight: [5, 6, 6, 7], wide: [1, 3, 8, 9] },
    { tight: [8, 9, 9, 10], wide: [1, 4, 6, 9] }
  ],

  /* Bolsas para sacar dos veces. Los resultados posibles son todas las
     parejas, y app.js las dibuja todas: con 2 colores son 4 y con 3 son
     9, que siguen cabiendo en pantalla. */
  drawSets: [
    ['red', 'blue'],
    ['blue', 'green'],
    ['red', 'yellow'],
    ['red', 'blue', 'green'],
    ['blue', 'green', 'yellow'],
    ['red', 'green', 'yellow']
  ],

  /* Dos series medidas sobre las mismas columnas: es el gráfico
     combinado. En cada conjunto hay una columna donde gana la primera,
     otra donde gana la segunda y otra donde empatan, así que las tres
     preguntas posibles tienen una única respuesta y ninguna opción queda
     muerta. app.js lo comprueba al arrancar. Los valores son pares, como
     en `barSets`: la barra acaba justo en una raya de la escala. */
  pairSets: [
    { id: 'match', a: 'teamRed', b: 'teamBlue', cats: [
      { id: 'monday', an: 12, bn: 6 },
      { id: 'tuesday', an: 4, bn: 14 },
      { id: 'wednesday', an: 8, bn: 8 }
    ] },
    { id: 'shop', a: 'milk', b: 'juice', cats: [
      { id: 'morning', an: 6, bn: 12 },
      { id: 'noon', an: 16, bn: 4 },
      { id: 'evening', an: 10, bn: 10 }
    ] },
    { id: 'sky', a: 'sun', b: 'rain', cats: [
      { id: 'monday', an: 14, bn: 8 },
      { id: 'tuesday', an: 2, bn: 12 },
      { id: 'wednesday', an: 6, bn: 6 }
    ] },
    { id: 'trip', a: 'bus', b: 'bike', cats: [
      { id: 'morning', an: 8, bn: 18 },
      { id: 'noon', an: 12, bn: 4 },
      { id: 'evening', an: 16, bn: 16 }
    ] }
  ],

  sets: [
    { id: 'fruit', cats: [
      { id: 'apple', picto: '🍎', n: 5 },
      { id: 'banana', picto: '🍌', n: 3 },
      { id: 'orange', picto: '🍊', n: 7 }
    ] },
    { id: 'pets', cats: [
      { id: 'dog', picto: '🐶', n: 6 },
      { id: 'cat', picto: '🐱', n: 4 },
      { id: 'fish', picto: '🐟', n: 2 }
    ] },
    { id: 'weather', cats: [
      { id: 'sun', picto: '☀️', n: 8 },
      { id: 'rain', picto: '🌧️', n: 3 },
      { id: 'cloud', picto: '☁️', n: 5 }
    ] },
    { id: 'transport', cats: [
      { id: 'bus', picto: '🚌', n: 4 },
      { id: 'bike', picto: '🚲', n: 7 },
      { id: 'walk', picto: '🚶', n: 9 }
    ] },
    { id: 'drinks', cats: [
      { id: 'water', picto: '💧', n: 9 },
      { id: 'milk', picto: '🥛', n: 6 },
      { id: 'juice', picto: '🧃', n: 3 }
    ] }
  ],

  /* Valores pares: la escala sube de 2 en 2 y la barra siempre acaba
     justo en una raya, para que se pueda leer sin estimar. */
  barStep: 2,
  barMax: 20,
  barSets: [
    { id: 'books', cats: [
      { id: 'monday', picto: '📗', n: 4 },
      { id: 'tuesday', picto: '📘', n: 10 },
      { id: 'wednesday', picto: '📙', n: 6 }
    ] },
    { id: 'goals', cats: [
      { id: 'teamRed', picto: '🔴', n: 8 },
      { id: 'teamBlue', picto: '🔵', n: 14 },
      { id: 'teamGreen', picto: '🟢', n: 2 }
    ] },
    { id: 'visitors', cats: [
      { id: 'morning', picto: '🌅', n: 12 },
      { id: 'noon', picto: '🌞', n: 18 },
      { id: 'evening', picto: '🌇', n: 6 }
    ] },
    { id: 'plants', cats: [
      { id: 'garden', picto: '🌻', n: 16 },
      { id: 'balcony', picto: '🪴', n: 4 },
      { id: 'window', picto: '🌿', n: 10 }
    ] }
  ],

  /* Suma múltiplo de 3 en todos: el reparto sale exacto. */
  shareSets: [
    { id: 'sweets', cats: [
      { id: 'ana', picto: '🍬', n: 2 },
      { id: 'luis', picto: '🍬', n: 4 },
      { id: 'sara', picto: '🍬', n: 3 }
    ] },
    { id: 'marbles', cats: [
      { id: 'ana', picto: '🔵', n: 6 },
      { id: 'luis', picto: '🔵', n: 1 },
      { id: 'sara', picto: '🔵', n: 5 }
    ] },
    { id: 'cards', cats: [
      { id: 'ana', picto: '🃏', n: 5 },
      { id: 'luis', picto: '🃏', n: 5 },
      { id: 'sara', picto: '🃏', n: 8 }
    ] },
    { id: 'stickers', cats: [
      { id: 'ana', picto: '⭐', n: 7 },
      { id: 'luis', picto: '⭐', n: 2 },
      { id: 'sara', picto: '⭐', n: 3 }
    ] }
  ],

  tokens: [
    { id: 'red', picto: '🔴' },
    { id: 'blue', picto: '🔵' },
    { id: 'green', picto: '🟢' },
    { id: 'yellow', picto: '🟡' }
  ],

  bags: [
    /* Una bolsa de un solo color: sacar ese color es seguro. */
    { id: 'allRed', items: [{ id: 'red', n: 5 }] },
    { id: 'allBlue', items: [{ id: 'blue', n: 4 }] },
    { id: 'redBlue', items: [{ id: 'red', n: 5 }, { id: 'blue', n: 2 }] },
    { id: 'blueGreen', items: [{ id: 'blue', n: 6 }, { id: 'green', n: 3 }] },
    { id: 'redYellow', items: [{ id: 'red', n: 2 }, { id: 'yellow', n: 7 }] },
    { id: 'greenYellow', items: [{ id: 'green', n: 4 }, { id: 'yellow', n: 1 }] }
  ]
};
