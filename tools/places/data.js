/* ============================================================
   Calculia — Sitios y tamaños — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.relations: cada pareja de posiciones opuestas, con el objeto
     de referencia respecto al que se mira. La referencia es parte del
     dato: "arriba" sin referencia no significa nada.
   - DATA.objects: lo que se coloca en la escena. Solo cambia el dibujo,
     nunca la respuesta.
   - DATA.pairs: parejas de cosas reales para comparar sin medir. En
     cada pareja, `more` es SIEMPRE la mayor de las dos; app.js baraja
     el orden en que se muestran, así que la respuesta correcta no
     depende de la posición en pantalla.
   Los nombres de las posiciones y de las cosas NO están aquí: son
   texto y viven en strings.<locale>.js ('pos.*', 'phrase.*',
   'thing.*', 'dim.*').

   Las parejas se han elegido para que la respuesta no admita discusión:
   un autobús es más largo que una bici, y un elefante más pesado que
   una pluma, en cualquier autobús y con cualquier pluma. Una pareja
   "casi" enseñaría algo falso.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Primero situarse: no necesita ningún número, así que es por donde
       se puede empezar sin saber nada todavía. */
    posicion: {
      picto: '🧭',
      levels: [
        /* s1→s2→s3 solo cambia la pareja de palabras; s4 cambia la
           dirección (de la palabra al dibujo). Una variable por paso. */
        { id: 's1', tipo: 'whereIs', relation: 'inOut' },
        { id: 's2', tipo: 'whereIs', relation: 'upDown' },
        { id: 's3', tipo: 'whereIs', relation: 'leftRight' },
        { id: 's4', tipo: 'findWhere' }
      ]
    },

    /* Después comparar sin instrumentos: más largo, más pesado, cabe
       más. Tampoco hace falta ningún número. */
    comparar: {
      picto: '📐',
      levels: [
        { id: 'c1', tipo: 'compare', dim: 'length' },
        { id: 'c2', tipo: 'compare', dim: 'weight' },
        { id: 'c3', tipo: 'compare', dim: 'capacity' }
      ]
    }
  },

  relations: {
    /* `anchor` es el dibujo de la referencia; `box` dice que la
       referencia se dibuja como una caja que contiene o no al objeto. */
    inOut: { ids: ['inside', 'outside'], anchor: '📦', shape: 'box' },
    upDown: { ids: ['above', 'below'], anchor: '🪑', shape: 'line' },
    leftRight: { ids: ['left', 'right'], anchor: '🌳', shape: 'row' }
  },

  objects: [
    { id: 'ball', picto: '⚽' },
    { id: 'cat', picto: '🐱' },
    { id: 'apple', picto: '🍎' },
    { id: 'balloon', picto: '🎈' }
  ],

  pairs: {
    length: [
      { more: { id: 'bus', picto: '🚌' }, less: { id: 'bike', picto: '🚲' } },
      { more: { id: 'train', picto: '🚂' }, less: { id: 'car', picto: '🚗' } },
      { more: { id: 'tree', picto: '🌳' }, less: { id: 'flower', picto: '🌷' } },
      { more: { id: 'snake', picto: '🐍' }, less: { id: 'worm', picto: '🐛' } }
    ],
    weight: [
      { more: { id: 'elephant', picto: '🐘' }, less: { id: 'feather', picto: '🪶' } },
      { more: { id: 'car', picto: '🚗' }, less: { id: 'teddy', picto: '🧸' } },
      { more: { id: 'house', picto: '🏠' }, less: { id: 'apple', picto: '🍎' } },
      { more: { id: 'chair', picto: '🪑' }, less: { id: 'clip', picto: '📎' } }
    ],
    capacity: [
      { more: { id: 'bathtub', picto: '🛁' }, less: { id: 'cup', picto: '🥤' } },
      { more: { id: 'bucket', picto: '🪣' }, less: { id: 'spoon', picto: '🥄' } },
      { more: { id: 'barrel', picto: '🛢️' }, less: { id: 'bottle', picto: '🍼' } }
    ]
  }
};
