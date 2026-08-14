/* ============================================================
   Calculia — Dinero — datos
   Formato:
   - DATA.activities[id]: picto y niveles[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.llegaUno / DATA.llegaDos / DATA.cambio: solo importes en
     céntimos (independientes del idioma).
   - DATA.productos: productos cotidianos para los precios (solo
     picto e id; el nombre está en strings.js).
   Los nombres de actividades y niveles NO están aquí: son texto y
   viven en strings.js, indexados por 'id': App.i18n.t('actividad.<id>.nombre'),
   App.i18n.t('actividad.<id>.detalle'), App.i18n.t('actividad.<id>.instruccion'),
   App.i18n.t('nivel.<id>'), App.i18n.t('producto.<id>').
   ============================================================ */
var DATA = {
  porRonda: 6,

  activities: {
    llega: {
      picto: '🛍️',
      levels: [
        { id: 'll1', tipo: 'llegaUno' },
        { id: 'll2', tipo: 'llegaDos' }
      ]
    },

    cambio: {
      picto: '💰',
      levels: [
        { id: 'ca1', tipo: 'cambio', lista: 'facil' },
        { id: 'ca2', tipo: 'cambio', lista: 'centimos' }
      ]
    },

    decimales: {
      picto: '💶',
      levels: [
        { id: 'd1', tipo: 'precios' },
        { id: 'd2', tipo: 'comparaPrecios' }
      ]
    }
  },

  /* Cases for "Is it enough?" (amounts in cents, language-independent).
     llegaUno: amount held vs. price of one product.
     llegaDos: amount held vs. the sum of two products. */
  llegaUno: [
    { tiene: 300, precio: 250 },
    { tiene: 300, precio: 380 },
    { tiene: 500, precio: 495 },
    { tiene: 500, precio: 650 },
    { tiene: 800, precio: 750 },
    { tiene: 800, precio: 920 },
    { tiene: 1000, precio: 999 },
    { tiene: 1000, precio: 1250 },
    { tiene: 500, precio: 500 }
  ],
  llegaDos: [
    { tiene: 500, precios: [150, 200] },
    { tiene: 500, precios: [300, 250] },
    { tiene: 800, precios: [350, 300] },
    { tiene: 800, precios: [450, 400] },
    { tiene: 1000, precios: [600, 350] },
    { tiene: 1000, precios: [550, 500] },
    { tiene: 300, precios: [120, 175] },
    { tiene: 300, precios: [150, 175] }
  ],

  /* Cases for "The Change" (amounts in cents, language-independent).
     billete: amount paid with · precio: what it costs.
     The change due (billete - precio) is computed in app.js. */
  cambio: {
    facil: [
      { billete: 500, precio: 300 },
      { billete: 500, precio: 150 },
      { billete: 500, precio: 400 },
      { billete: 1000, precio: 600 },
      { billete: 1000, precio: 750 },
      { billete: 1000, precio: 900 },
      { billete: 2000, precio: 1200 },
      { billete: 2000, precio: 1500 }
    ],
    centimos: [
      { billete: 500, precio: 380 },
      { billete: 500, precio: 275 },
      { billete: 500, precio: 495 },
      { billete: 1000, precio: 650 },
      { billete: 1000, precio: 825 },
      { billete: 1000, precio: 990 },
      { billete: 2000, precio: 1450 },
      { billete: 2000, precio: 1675 }
    ]
  },

  /* Productos cotidianos para leer y comparar precios. */
  productos: [
    { id: 'pan', picto: '🍞' },
    { id: 'leche', picto: '🥛' },
    { id: 'zumo', picto: '🧃' },
    { id: 'manzanas', picto: '🍎' },
    { id: 'queso', picto: '🧀' },
    { id: 'galletas', picto: '🍪' },
    { id: 'lapiz', picto: '✏️' },
    { id: 'cuaderno', picto: '📒' }
  ]
};
