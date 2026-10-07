/* ============================================================
   Calculia — Escala — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.readings: los valores que se pueden leer en cada nivel. Ni 0
     ni el final de la regla: en 0 no hay nada que medir y en el tope
     el objeto se sale del dibujo. En l2, l3, t1 y t2 el valor nunca
     cae en un número escrito, porque si cae la respuesta se lee sin
     contar rayitas y la pregunta deja de preguntar lo que pregunta.
   - DATA.spans: tramos de regla para preguntar por el paso. `gaps`
     son las rayitas que hay entre los dos números, que es exactamente
     lo que hay que contar: el paso sale de dividir, y sale bien solo
     si se han contado bien las rayitas.
   - DATA.recorridos: el lápiz empieza en un número y acaba en otro.
     Se cuenta lo que recorre, no lo que ocupa: el fallo típico es
     quedarse uno corto por contar las rayitas con las que empieza.
   - DATA.planos: la escala de un dibujo. El dibujo es SIEMPRE más
     pequeño que la vida real —si fuera del mismo tamaño no haría
     falta la escala—, así que un centímetro del plano vale estos
     metros o kilómetros de verdad. `cm` y `real` van emparejados
     para que el centímetro del plano y la distancia de verdad no se
     puedan confundir uno con otro.
   Los textos NO están aquí: viven en strings.<locale>.js. Las
   unidades ('cm', 'ml', '°C', 'm', 'km') tampoco: son símbolos, y un
   símbolo es el mismo en todos los idiomas (el mismo criterio que los
   números romanos en su data.js).
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Leer: el objeto llega a una rayita y hay que decir cuánto mide.
       l1→l2→l3 solo cambia una cosa: cuánto hay entre número y
       número. En l1 todas las rayitas tienen número, en l2 hay una
       rayita sin número entre dos, y en l3 hay cuatro. La pregunta
       nunca cambia: la misma lectura, con la regla un poco más
       difícil de leer. */
    leer: {
      picto: '📏',
      levels: [
        { id: 'l1', tipo: 'readValue', shape: 'ruler', from: 0, to: 10, step: 1, labelEvery: 1, unit: 'cm' },
        { id: 'l2', tipo: 'readValue', shape: 'ruler', from: 0, to: 10, step: 1, labelEvery: 2, unit: 'cm' },
        { id: 'l3', tipo: 'readValue', shape: 'ruler', from: 0, to: 20, step: 1, labelEvery: 5, unit: 'cm' }
      ]
    },

    /* El paso: cuánto vale una rayita, y cuántas rayitas hay. Son las
       dos caras de lo mismo, y son lo que hace una regla útil: no solo
       dice dónde acaba el lápiz, sino que se puede aplicar a cualquier
       medida. p1 mira el paso; p2 cuenta rayitas. */
    paso: {
      picto: '🔍',
      levels: [
        { id: 'p1', tipo: 'stepValue', unit: 'cm' },
        { id: 'p2', tipo: 'stepsCounted', unit: 'cm' }
      ]
    },

    /* La misma lectura en otros instrumentos. Si leer la regla ya se
       sabe, lo que se practica aquí es que da igual la forma: un
       termómetro
       y una jarra también son una lista de rayitas con números. t1 y
       t2 cambian de instrumento, de unidad y de sentido, y ninguno
       tiene nada que ver con el paso anterior. */
    instrumento: {
      picto: '🌡️',
      levels: [
        { id: 't1', tipo: 'readValue', shape: 'termo', from: 0, to: 40, step: 5, labelEvery: 10, unit: '°C' },
        { id: 't2', tipo: 'readValue', shape: 'jar', from: 0, to: 1000, step: 100, labelEvery: 200, unit: 'ml' }
      ]
    },

    /* Y la escala de un dibujo, que es la otra acepción de la palabra:
       un plano de la ciudad es más pequeño que la ciudad. d1 va del
       plano a la vida real y d2 vuelve, que es el mismo convenio
       leído al revés y ya no se reconoce sin pensarlo. */
    plano: {
      picto: '🗺️',
      levels: [
        { id: 'd1', tipo: 'planToReal' },
        { id: 'd2', tipo: 'realToPlan' }
      ]
    }
  },

  /* Los valores de cada lectura. Ver la nota de arriba: en l1 el valor
     sí puede caer en un número escrito porque ahí todas las rayitas
     están escritas. */
  readings: {
    l1: [2, 3, 4, 5, 6, 7, 8],
    l2: [1, 3, 5, 7, 9],
    l3: [3, 6, 8, 12, 17],
    t1: [15, 25, 35],
    t2: [300, 700, 900]
  },

  /* Tramos con los dos números escritos y las rayitas en medio. El
     paso de cada uno: 1, 1, 5 y 2 centímetros. */
  spans: [
    { from: 0, to: 10, gaps: 10 },
    { from: 0, to: 5, gaps: 5 },
    { from: 5, to: 25, gaps: 4 },
    { from: 10, to: 20, gaps: 5 }
  ],

  /* Recorridos en centímetros, de principio a fin. */
  recorridos: [
    { from: 0, to: 6 },
    { from: 2, to: 11 },
    { from: 5, to: 12 },
    { from: 1, to: 9 },
    { from: 3, to: 10 },
    { from: 2, to: 12 }
  ],

  /* La escala de los planos. `key` es lo que vale un centímetro del
     plano y `unit` en qué se mide eso de verdad. `cm` no pasa de 4
     porque la barra de escala de app.js tiene cuatro tramos de un
     centímetro, y un tramo del plano más largo que la barra no se
     pinta: se saldría del dibujo y la medida quedaría cortada justo
     en la respuesta. */
  planos: [
    { key: 5, unit: 'm', cm: [2, 3, 4], real: [10, 15, 20] },
    { key: 10, unit: 'm', cm: [2, 3, 4], real: [20, 30, 40] },
    { key: 1, unit: 'm', cm: [2, 3, 4], real: [2, 3, 4] },
    { key: 50, unit: 'm', cm: [2, 3, 4], real: [100, 150, 200] },
    { key: 10, unit: 'km', cm: [2, 3, 4], real: [20, 30, 40] }
  ],

  /* Los instrumentos de la vida diaria, para la pantalla de "esto está
     en tu alrededor". Solo el dibujo y el id: el nombre y lo que mide
     cada uno son texto y viven en strings.<locale>.js.

     El picto de la jarra era 🥛, un vaso de leche: sin una sola rayita
     arriba, que es justo lo contrario de lo que dice su texto. Unicode
     no tiene emoji de jarra medidora, y 🫗 (jarra vertiendo) y 🫙
     (jarra) existen pero aquí se pintan como CAJA VACÍA.
     scan-emoji-tofu.js lo mide. 🍺 es la única con asa que sí se pinta,
     y un asa es lo que hace que un recipiente se lea como jarra. */
  real: [
    { id: 'regla', picto: '📏' },
    { id: 'termo', picto: '🌡️' },
    { id: 'jarra', picto: '🍺' },
    { id: 'mapa', picto: '🗺️' },
    { id: 'agua', picto: '🚰' }
  ]
};