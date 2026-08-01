/* ============================================================
   Apptonomia — Los Números — datos
   Formato:
   - DATA.grupos: secciones del menú. Cada una lista ids de actividades.
     Los nombres de grupos, actividades, niveles y productos NO están
     aquí: son texto y viven en strings.js, indexados por 'id':
     App.i18n.t('grupo.<id>'), App.i18n.t('actividad.<id>.nombre'),
     App.i18n.t('actividad.<id>.detalle'), App.i18n.t('actividad.<id>.instruccion'),
     App.i18n.t('nivel.<id>'), App.i18n.t('producto.<id>').
   - DATA.actividades[id]: picto y niveles[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
   - DATA.lecturas: números grandes con su lectura en palabras, por
     idioma (DATA.lecturas[locale][lista]). OJO: la escala numérica
     cambia entre idiomas (1.000.000.000 es "mil millones" en español
     pero "one billion" en inglés; 10^12 es "un billón" en español
      pero "one trillion" en inglés). Ver I18N.md §2.
   - DATA.medidas: equivalencias del sistema métrico, por idioma
     (DATA.medidas[locale]). Las respuestas falsas están escritas a
     mano para controlar la dificultad.
   - DATA.llegaUno / DATA.llegaDos / DATA.cambio: solo importes en
     céntimos (independientes del idioma).
   - DATA.productos: productos cotidianos para los precios (solo
     picto e id; el nombre está en strings.js).
   Para ampliar: añadir una actividad, nivel o producto nuevo con un
   id, y sus textos a strings.js (es y en).
   ============================================================ */
var DATA = {
  porRonda: 6,

  grupos: [
    { id: 'numeros', ids: ['contar', 'enteros', 'unidades', 'placevalue', 'fracciones', 'decimales'] },
    { id: 'calcular', ids: ['sumar', 'restar', 'multiplicar', 'cabeza', 'llega', 'cambio', 'medidas'] }
  ],

  actividades: {
    contar: {
      /* Progression (rule 13): c1→c2→c5→c10 only change 'paso'. 'max'
         (the available number range) is derived from 'paso' in app.js.
         c2→c2p keeps the exact same 'paso' (2) and range: it doesn't add
         a new number range to learn, only a new skill (classify a number
         already reached by counting in twos as even/odd). */
      picto: '🔢',
      niveles: [
        { id: 'c1', tipo: 'contar', paso: 1 },
        { id: 'c2', tipo: 'contar', paso: 2 },
        { id: 'c2p', tipo: 'paresImpares', paso: 2, max: 24 },
        { id: 'c5', tipo: 'contar', paso: 5 },
        { id: 'c10', tipo: 'contar', paso: 10 }
      ]
    },

    enteros: {
      /* Negative numbers via an elevator (floors below ground = negative).
         Progression (rule 13): en1→en2 keeps the same reading skill and
         adds movement (only variable: gains a start+delta instead of a
         fixed floor). en2→en3 introduces comparing two floors instead of
         one. en3→en4 introduces locating a GIVEN floor number among
         candidate spots (the "place it in its spot" skill) instead of
         reading one shown floor. The range (min/max) stays fixed across
         all 4 levels so the only real change each step is the skill. */
      picto: '🛗',
      niveles: [
        { id: 'en1', tipo: 'ascensorLeer', min: -5, max: 5 },
        { id: 'en2', tipo: 'ascensorMover', min: -5, max: 5 },
        { id: 'en3', tipo: 'ascensorComparar', min: -5, max: 5 },
        { id: 'en4', tipo: 'ascensorColocar', min: -5, max: 5 }
      ]
    },

    unidades: {
      /* Progression (rule 13): order designed so each step changes
         a single thing. u999→udictado only changes 'tipo' (the
         range stays at 999). udictado→umiles changes 'tipo' with
         a minimal magnitude jump (999→thousands, the next natural
         scale). umiles→umillones only changes 'lista'. */
      picto: '🧱',
      niveles: [
        { id: 'u99', tipo: 'bloques', max: 99 },
        { id: 'u999', tipo: 'bloques', max: 999 },
        { id: 'udictado', tipo: 'dictado', max: 999 },
        { id: 'umiles', tipo: 'lectura', lista: 'miles' },
        { id: 'umillones', tipo: 'lectura', lista: 'millones' }
      ]
    },

    placevalue: {
      /* Place-value exchange ("10 of these make 1 of those") and the
         ×10 ladder up to 10^12. Progression (rule 13): pv1→pv2→pv3
         only change 'lugar' (which exchange). pv3→pv4 changes 'tipo'
         (exchange → ladder). pv4→pv5 only changes the exponent range
         (up to a million → up to a trillion / billón). */
      picto: '🔁',
      niveles: [
        { id: 'pv1', tipo: 'canje', lugar: 0 },
        { id: 'pv2', tipo: 'canje', lugar: 1 },
        { id: 'pv3', tipo: 'canje', lugar: 2 },
        { id: 'pv4', tipo: 'escalera', minExp: 0, maxExp: 5 },
        { id: 'pv5', tipo: 'escalera', minExp: 6, maxExp: 11 }
      ]
    },

    fracciones: {
      /* Progression (rule 13): f1→f2 only changes the fractions
         (halves/quarters → thirds/sixths). f2→f3 changes the type
         (identify → compare), but f3's 'pares' EXCLUSIVELY reuses
         fractions already seen in f1/f2 — the only real novelty
         is the comparing skill, not new fractions adding to the
         load. */
      picto: '🍕',
      niveles: [
        {
          id: 'f1', tipo: 'fracciones',
          fracs: [[1, 2], [1, 4], [3, 4], [2, 4]]
        },
        {
          id: 'f2', tipo: 'fracciones',
          fracs: [[1, 3], [2, 3], [1, 6], [5, 6]]
        },
        {
          id: 'f3', tipo: 'comparaFrac',
          pares: [
            [[1, 2], [1, 4]], [[3, 4], [1, 4]], [[2, 3], [1, 3]],
            [[1, 2], [3, 4]], [[1, 6], [5, 6]], [[1, 3], [2, 3]]
          ]
        }
      ]
    },

    decimales: {
      picto: '💶',
      niveles: [
        { id: 'd1', tipo: 'precios' },
        { id: 'd2', tipo: 'comparaPrecios' }
      ]
    },

    sumar: {
      picto: '➕',
      niveles: [
        { id: 's10', tipo: 'sumar', a: [1, 5], b: [1, 5] },
        { id: 's20', tipo: 'sumar', a: [4, 10], b: [4, 10] }
      ]
    },

    restar: {
      picto: '➖',
      niveles: [
        { id: 'r10', tipo: 'restar', a: [5, 10], maxB: 5 },
        { id: 'r20', tipo: 'restar', a: [10, 20], maxB: 10 }
      ]
    },

    multiplicar: {
      picto: '✖️',
      niveles: [
        { id: 'm1', tipo: 'multiplicar', tablas: [2, 5, 10] },
        { id: 'm2', tipo: 'multiplicar', tablas: [3, 4] },
        { id: 'm3', tipo: 'multiplicar', tablas: [6, 7] },
        { id: 'm4', tipo: 'multiplicar', tablas: [8, 9] }
      ]
    },

    cabeza: {
      /* Progression (rule 13): within each operation (sumaGrande,
         restaGrande, multiplicaGrande) only the magnitude increases
         (10→100→1000). When the operation changes, the magnitude
         always resets to the SAME fixed constant (10) — it's not a
         second variable being re-chosen each time, it's a fixed
         anchor — so the only real change across those jumps is the
         operation. */
      picto: '🧠',
      niveles: [
        { id: 'k1', tipo: 'dobles' },
        { id: 'k2', tipo: 'sumaGrande', suma: 10 },
        { id: 'k3', tipo: 'sumaGrande', suma: 100 },
        { id: 'k4', tipo: 'sumaGrande', suma: 1000 },
        { id: 'k5', tipo: 'restaGrande', resta: 10 },
        { id: 'k6', tipo: 'restaGrande', resta: 100 },
        { id: 'k7', tipo: 'restaGrande', resta: 1000 },
        { id: 'k8', tipo: 'multiplicaGrande', factor: 10 },
        { id: 'k9', tipo: 'multiplicaGrande', factor: 100 }
      ]
    },

    llega: {
      picto: '🛍️',
      niveles: [
        { id: 'll1', tipo: 'llegaUno' },
        { id: 'll2', tipo: 'llegaDos' }
      ]
    },

    cambio: {
      picto: '💰',
      niveles: [
        { id: 'ca1', tipo: 'cambio', lista: 'facil' },
        { id: 'ca2', tipo: 'cambio', lista: 'centimos' }
      ]
    },

    medidas: {
      picto: '📏',
      niveles: [
        { id: 'me1', tipo: 'medidas', lista: 'longitud' },
        { id: 'me2', tipo: 'medidas', lista: 'peso' },
        { id: 'me3', tipo: 'medidas', lista: 'capacidad' }
      ]
    }
  },

  /* Large numbers and how to read them, per language. nota is shown as a hint.
     The scale differs between languages: see the note above. */
  lecturas: {
    es: {
      miles: [
        { n: 1000, palabras: 'mil' },
        { n: 2000, palabras: 'dos mil' },
        { n: 3000, palabras: 'tres mil' },
        { n: 4500, palabras: 'cuatro mil quinientos' },
        { n: 7000, palabras: 'siete mil' },
        { n: 10000, palabras: 'diez mil' },
        { n: 20000, palabras: 'veinte mil' },
        { n: 45000, palabras: 'cuarenta y cinco mil' },
        { n: 100000, palabras: 'cien mil' },
        { n: 300000, palabras: 'trescientos mil' },
        { n: 500000, palabras: 'quinientos mil' },
        { n: 750000, palabras: 'setecientos cincuenta mil' }
      ],
      millones: [
        { n: 1000000, palabras: 'un millón' },
        { n: 2000000, palabras: 'dos millones' },
        { n: 5000000, palabras: 'cinco millones' },
        { n: 10000000, palabras: 'diez millones' },
        { n: 50000000, palabras: 'cincuenta millones' },
        { n: 100000000, palabras: 'cien millones' },
        { n: 500000000, palabras: 'quinientos millones' },
        { n: 1000000000, palabras: 'mil millones' },
        { n: 2000000000, palabras: 'dos mil millones' },
        { n: 1000000000000, palabras: 'un billón', nota: 'Un billón es un millón de millones.' }
      ]
    },
    en: {
      miles: [
        { n: 1000, palabras: 'one thousand' },
        { n: 2000, palabras: 'two thousand' },
        { n: 3000, palabras: 'three thousand' },
        { n: 4500, palabras: 'four thousand five hundred' },
        { n: 7000, palabras: 'seven thousand' },
        { n: 10000, palabras: 'ten thousand' },
        { n: 20000, palabras: 'twenty thousand' },
        { n: 45000, palabras: 'forty-five thousand' },
        { n: 100000, palabras: 'one hundred thousand' },
        { n: 300000, palabras: 'three hundred thousand' },
        { n: 500000, palabras: 'five hundred thousand' },
        { n: 750000, palabras: 'seven hundred fifty thousand' }
      ],
      millones: [
        { n: 1000000, palabras: 'one million' },
        { n: 2000000, palabras: 'two million' },
        { n: 5000000, palabras: 'five million' },
        { n: 10000000, palabras: 'ten million' },
        { n: 50000000, palabras: 'fifty million' },
        { n: 100000000, palabras: 'one hundred million' },
        { n: 500000000, palabras: 'five hundred million' },
        { n: 1000000000, palabras: 'one billion' },
        { n: 2000000000, palabras: 'two billion' },
        { n: 1000000000000, palabras: 'one trillion', nota: 'One trillion is a thousand billions.' }
      ]
    }
  },

  /* Words for the powers of ten (index = exponent, 0..12), used by the
     'escalera' (×10 ladder) generator to speak the numbers aloud.
     Note the scale change between languages (I18N.md §2): 10^9 is
     "mil millones" (es) but "one billion" (en); 10^12 is "un billón"
     (es) but "one trillion" (en). */
  potencias: {
    es: ['uno', 'diez', 'cien', 'mil', 'diez mil', 'cien mil', 'un millón',
      'diez millones', 'cien millones', 'mil millones', 'diez mil millones',
      'cien mil millones', 'un billón'],
    en: ['one', 'ten', 'one hundred', 'one thousand', 'ten thousand',
      'one hundred thousand', 'one million', 'ten million', 'one hundred million',
      'one billion', 'ten billion', 'one hundred billion', 'one trillion']
  },

  /* Metric system equivalences, per language.
     q: what is being asked · r: correct answer · falsas: 2 wrong answers
     ej: everyday example (optional). */
  medidas: {
    es: {
      longitud: {
        picto: '📏',
        items: [
          { q: '1 metro', pregunta: '¿Cuántos centímetros son?', r: '100 centímetros', falsas: ['10 centímetros', '1.000 centímetros'], ej: 'Una guitarra mide casi 1 metro.' },
          { q: 'Medio metro', pregunta: '¿Cuántos centímetros son?', r: '50 centímetros', falsas: ['5 centímetros', '500 centímetros'] },
          { q: '2 metros', pregunta: '¿Cuántos centímetros son?', r: '200 centímetros', falsas: ['20 centímetros', '2.000 centímetros'], ej: 'Una puerta mide 2 metros.' },
          { q: '1 kilómetro', pregunta: '¿Cuántos metros son?', r: '1.000 metros', falsas: ['100 metros', '10.000 metros'], ej: 'Un paseo de 15 minutos.' },
          { q: 'Medio kilómetro', pregunta: '¿Cuántos metros son?', r: '500 metros', falsas: ['50 metros', '5.000 metros'] },
          { q: '1 centímetro', pregunta: '¿Cuántos milímetros son?', r: '10 milímetros', falsas: ['100 milímetros', '5 milímetros'], ej: 'La uña de un dedo.' },
          { q: '3 metros', pregunta: '¿Cuántos centímetros son?', r: '300 centímetros', falsas: ['30 centímetros', '3.000 centímetros'] }
        ]
      },
      peso: {
        picto: '⚖️',
        items: [
          { q: '1 kilo', pregunta: '¿Cuántos gramos son?', r: '1.000 gramos', falsas: ['100 gramos', '10.000 gramos'], ej: 'Un paquete de arroz pesa 1 kilo.' },
          { q: 'Medio kilo', pregunta: '¿Cuántos gramos son?', r: '500 gramos', falsas: ['50 gramos', '5.000 gramos'], ej: 'Un paquete de macarrones.' },
          { q: 'Un cuarto de kilo', pregunta: '¿Cuántos gramos son?', r: '250 gramos', falsas: ['25 gramos', '2.500 gramos'], ej: 'Un paquete de mantequilla.' },
          { q: '2 kilos', pregunta: '¿Cuántos gramos son?', r: '2.000 gramos', falsas: ['200 gramos', '20.000 gramos'], ej: 'Una bolsa de naranjas.' },
          { q: '5 kilos', pregunta: '¿Cuántos gramos son?', r: '5.000 gramos', falsas: ['500 gramos', '50.000 gramos'] },
          { q: 'Kilo y medio', pregunta: '¿Cuántos gramos son?', r: '1.500 gramos', falsas: ['1.050 gramos', '15.000 gramos'] }
        ]
      },
      capacidad: {
        picto: '🥛',
        items: [
          { q: '1 litro', pregunta: '¿Cuántos mililitros son?', r: '1.000 mililitros', falsas: ['100 mililitros', '10.000 mililitros'], ej: 'Un brik de leche.' },
          { q: 'Medio litro', pregunta: '¿Cuántos mililitros son?', r: '500 mililitros', falsas: ['50 mililitros', '5.000 mililitros'], ej: 'Una botella pequeña de agua.' },
          { q: 'Litro y medio', pregunta: '¿Cuántos mililitros son?', r: '1.500 mililitros', falsas: ['1.050 mililitros', '15.000 mililitros'], ej: 'Una botella grande de agua.' },
          { q: '2 litros', pregunta: '¿Cuántos mililitros son?', r: '2.000 mililitros', falsas: ['200 mililitros', '20.000 mililitros'] },
          { q: 'Un cuarto de litro', pregunta: '¿Cuántos mililitros son?', r: '250 mililitros', falsas: ['25 mililitros', '2.500 mililitros'], ej: 'Una taza de leche.' }
        ]
      }
    },
    en: {
      longitud: {
        picto: '📏',
        items: [
          { q: '1 meter', pregunta: 'How many centimeters is that?', r: '100 centimeters', falsas: ['10 centimeters', '1,000 centimeters'], ej: 'A guitar is almost 1 meter long.' },
          { q: 'Half a meter', pregunta: 'How many centimeters is that?', r: '50 centimeters', falsas: ['5 centimeters', '500 centimeters'] },
          { q: '2 meters', pregunta: 'How many centimeters is that?', r: '200 centimeters', falsas: ['20 centimeters', '2,000 centimeters'], ej: 'A door is 2 meters tall.' },
          { q: '1 kilometer', pregunta: 'How many meters is that?', r: '1,000 meters', falsas: ['100 meters', '10,000 meters'], ej: 'A 15-minute walk.' },
          { q: 'Half a kilometer', pregunta: 'How many meters is that?', r: '500 meters', falsas: ['50 meters', '5,000 meters'] },
          { q: '1 centimeter', pregunta: 'How many millimeters is that?', r: '10 millimeters', falsas: ['100 millimeters', '5 millimeters'], ej: 'A fingernail.' },
          { q: '3 meters', pregunta: 'How many centimeters is that?', r: '300 centimeters', falsas: ['30 centimeters', '3,000 centimeters'] }
        ]
      },
      peso: {
        picto: '⚖️',
        items: [
          { q: '1 kilogram', pregunta: 'How many grams is that?', r: '1,000 grams', falsas: ['100 grams', '10,000 grams'], ej: 'A bag of rice weighs 1 kilogram.' },
          { q: 'Half a kilogram', pregunta: 'How many grams is that?', r: '500 grams', falsas: ['50 grams', '5,000 grams'], ej: 'A bag of pasta.' },
          { q: 'A quarter kilogram', pregunta: 'How many grams is that?', r: '250 grams', falsas: ['25 grams', '2,500 grams'], ej: 'A pack of butter.' },
          { q: '2 kilograms', pregunta: 'How many grams is that?', r: '2,000 grams', falsas: ['200 grams', '20,000 grams'], ej: 'A bag of oranges.' },
          { q: '5 kilograms', pregunta: 'How many grams is that?', r: '5,000 grams', falsas: ['500 grams', '50,000 grams'] },
          { q: 'A kilogram and a half', pregunta: 'How many grams is that?', r: '1,500 grams', falsas: ['1,050 grams', '15,000 grams'] }
        ]
      },
      capacidad: {
        picto: '🥛',
        items: [
          { q: '1 liter', pregunta: 'How many milliliters is that?', r: '1,000 milliliters', falsas: ['100 milliliters', '10,000 milliliters'], ej: 'A carton of milk.' },
          { q: 'Half a liter', pregunta: 'How many milliliters is that?', r: '500 milliliters', falsas: ['50 milliliters', '5,000 milliliters'], ej: 'A small bottle of water.' },
          { q: 'A liter and a half', pregunta: 'How many milliliters is that?', r: '1,500 milliliters', falsas: ['1,050 milliliters', '15,000 milliliters'], ej: 'A large bottle of water.' },
          { q: '2 liters', pregunta: 'How many milliliters is that?', r: '2,000 milliliters', falsas: ['200 milliliters', '20,000 milliliters'] },
          { q: 'A quarter liter', pregunta: 'How many milliliters is that?', r: '250 milliliters', falsas: ['25 milliliters', '2,500 milliliters'], ej: 'A cup of milk.' }
        ]
      }
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
