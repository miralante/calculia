/* ============================================================
   Calculia — Measures — data
   Schema:
   - DATA.activities[id]: picto and levels[]. Each level: { id, tipo,
     ...config }. The 'tipo' chooses the question generator in app.js.
     Object.keys(DATA.activities) fixes the menu order.
   - DATA.measures: metric equivalences per locale
     (DATA.measures[locale][lista]).
   Activity and level names do NOT live here: they are UI text and live
   in strings.js, keyed by 'id': App.i18n.t('activity.<id>.name'),
   App.i18n.t('activity.<id>.detail'), App.i18n.t('activity.<id>.instruction'),
   App.i18n.t('level.<id>').
   Split out of tools/fractions-measures/ so each activity has a single
   job: measuring something real, not cutting it into parts.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Order goes from the measure that is easiest to picture with the
       body (a step, a hand span) to the one that needs a container. */
    medidas: {
      picto: '📏',
      levels: [
        { id: 'me1', tipo: 'medidas', lista: 'longitud' },
        { id: 'me2', tipo: 'medidas', lista: 'peso' },
        { id: 'me3', tipo: 'medidas', lista: 'capacidad' }
      ]
    },

    /* La escalera de las unidades: bajar un escalón multiplica por 10.
       Ni los escalones ni el factor están guardados: app.js los saca de
       la posición de cada unidad en la lista, y el dibujo se construye
       con la misma lista, así que no pueden decir cosas distintas.
       es1→es2→es3 cambia una sola cosa cada vez: contar los escalones,
       el factor que sale de ellos, y ese factor aplicado a una cantidad. */
    escalera: {
      picto: '🪜',
      levels: [
        { id: 'es1', tipo: 'stepsApart' },
        { id: 'es2', tipo: 'stepFactor' },
        { id: 'es3', tipo: 'ladderConvert' }
      ]
    }
  },

  /* Las tres escaleras del sistema métrico decimal, de la unidad más
     grande a la más pequeña. El símbolo es notación, igual en los dos
     idiomas, y vive aquí; el nombre en palabras es texto y vive en
     strings.<locale>.js con la clave 'unit.<símbolo>'.
     app.js comprueba al arrancar que las tres tienen los mismos siete
     escalones, porque eso es justo lo que la escalera enseña. */
  ladders: [
    { id: 'length', picto: '📏', units: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'] },
    { id: 'mass', picto: '⚖️', units: ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'] },
    { id: 'capacity', picto: '🥛', units: ['kl', 'hl', 'dal', 'l', 'dl', 'cl', 'ml'] }
  ],

  /* Cuántas unidades se convierten en es3. Pequeñas a propósito: con un
     número grande la cuenta taparía la escalera, que es lo que se enseña. */
  ladderAmounts: [2, 3, 5],

  /* Cuántos escalones como máximo separan las dos unidades de una
     pregunta. Más de tres no se cuentan de un vistazo. */
  maxSteps: 3,

  /* Metric system equivalences, per language.
     q: what is being asked · r: correct answer · falsas: 2 wrong answers
     ej: everyday example (optional). */
  measures: {
    es: {
      longitud: {
        picto: '📏',
        items: [
          { q: '1 metro', question: '¿Cuántos centímetros son?', r: '100 centímetros', falsas: ['10 centímetros', '1.000 centímetros'], ej: 'Una guitarra mide casi 1 metro.' },
          { q: 'Medio metro', question: '¿Cuántos centímetros son?', r: '50 centímetros', falsas: ['5 centímetros', '500 centímetros'] },
          { q: '2 metros', question: '¿Cuántos centímetros son?', r: '200 centímetros', falsas: ['20 centímetros', '2.000 centímetros'], ej: 'Una puerta mide 2 metros.' },
          { q: '1 kilómetro', question: '¿Cuántos metros son?', r: '1.000 metros', falsas: ['100 metros', '10.000 metros'], ej: 'Un paseo de 15 minutos.' },
          { q: 'Medio kilómetro', question: '¿Cuántos metros son?', r: '500 metros', falsas: ['50 metros', '5.000 metros'] },
          { q: '1 centímetro', question: '¿Cuántos milímetros son?', r: '10 milímetros', falsas: ['100 milímetros', '5 milímetros'], ej: 'La uña de un dedo.' },
          { q: '3 metros', question: '¿Cuántos centímetros son?', r: '300 centímetros', falsas: ['30 centímetros', '3.000 centímetros'] }
        ]
      },
      peso: {
        picto: '⚖️',
        items: [
          { q: '1 kilo', question: '¿Cuántos gramos son?', r: '1.000 gramos', falsas: ['100 gramos', '10.000 gramos'], ej: 'Un paquete de arroz pesa 1 kilo.' },
          { q: 'Medio kilo', question: '¿Cuántos gramos son?', r: '500 gramos', falsas: ['50 gramos', '5.000 gramos'], ej: 'Un paquete de macarrones.' },
          { q: 'Un cuarto de kilo', question: '¿Cuántos gramos son?', r: '250 gramos', falsas: ['25 gramos', '2.500 gramos'], ej: 'Un paquete de mantequilla.' },
          { q: '2 kilos', question: '¿Cuántos gramos son?', r: '2.000 gramos', falsas: ['200 gramos', '20.000 gramos'], ej: 'Una bolsa de naranjas.' },
          { q: '5 kilos', question: '¿Cuántos gramos son?', r: '5.000 gramos', falsas: ['500 gramos', '50.000 gramos'] },
          { q: 'Kilo y medio', question: '¿Cuántos gramos son?', r: '1.500 gramos', falsas: ['1.050 gramos', '15.000 gramos'] }
        ]
      },
      capacidad: {
        picto: '🥛',
        items: [
          { q: '1 litro', question: '¿Cuántos mililitros son?', r: '1.000 mililitros', falsas: ['100 mililitros', '10.000 mililitros'], ej: 'Un brik de leche.' },
          { q: 'Medio litro', question: '¿Cuántos mililitros son?', r: '500 mililitros', falsas: ['50 mililitros', '5.000 mililitros'], ej: 'Una botella pequeña de agua.' },
          { q: 'Litro y medio', question: '¿Cuántos mililitros son?', r: '1.500 mililitros', falsas: ['1.050 mililitros', '15.000 mililitros'], ej: 'Una botella grande de agua.' },
          { q: '2 litros', question: '¿Cuántos mililitros son?', r: '2.000 mililitros', falsas: ['200 mililitros', '20.000 mililitros'] },
          { q: 'Un cuarto de litro', question: '¿Cuántos mililitros son?', r: '250 mililitros', falsas: ['25 mililitros', '2.500 mililitros'], ej: 'Una taza de leche.' }
        ]
      }
    },
    en: {
      longitud: {
        picto: '📏',
        items: [
          { q: '1 meter', question: 'How many centimeters is that?', r: '100 centimeters', falsas: ['10 centimeters', '1,000 centimeters'], ej: 'A guitar is almost 1 meter long.' },
          { q: 'Half a meter', question: 'How many centimeters is that?', r: '50 centimeters', falsas: ['5 centimeters', '500 centimeters'] },
          { q: '2 meters', question: 'How many centimeters is that?', r: '200 centimeters', falsas: ['20 centimeters', '2,000 centimeters'], ej: 'A door is 2 meters tall.' },
          { q: '1 kilometer', question: 'How many meters is that?', r: '1,000 meters', falsas: ['100 meters', '10,000 meters'], ej: 'A 15-minute walk.' },
          { q: 'Half a kilometer', question: 'How many meters is that?', r: '500 meters', falsas: ['50 meters', '5,000 meters'] },
          { q: '1 centimeter', question: 'How many millimeters is that?', r: '10 millimeters', falsas: ['100 millimeters', '5 millimeters'], ej: 'A fingernail.' },
          { q: '3 meters', question: 'How many centimeters is that?', r: '300 centimeters', falsas: ['30 centimeters', '3,000 centimeters'] }
        ]
      },
      peso: {
        picto: '⚖️',
        items: [
          { q: '1 kilogram', question: 'How many grams is that?', r: '1,000 grams', falsas: ['100 grams', '10,000 grams'], ej: 'A bag of rice weighs 1 kilogram.' },
          { q: 'Half a kilogram', question: 'How many grams is that?', r: '500 grams', falsas: ['50 grams', '5,000 grams'], ej: 'A bag of pasta.' },
          { q: 'A quarter kilogram', question: 'How many grams is that?', r: '250 grams', falsas: ['25 grams', '2,500 grams'], ej: 'A pack of butter.' },
          { q: '2 kilograms', question: 'How many grams is that?', r: '2,000 grams', falsas: ['200 grams', '20,000 grams'], ej: 'A bag of oranges.' },
          { q: '5 kilograms', question: 'How many grams is that?', r: '5,000 grams', falsas: ['500 grams', '50,000 grams'] },
          { q: 'A kilogram and a half', question: 'How many grams is that?', r: '1,500 grams', falsas: ['1,050 grams', '15,000 grams'] }
        ]
      },
      capacidad: {
        picto: '🥛',
        items: [
          { q: '1 liter', question: 'How many milliliters is that?', r: '1,000 milliliters', falsas: ['100 milliliters', '10,000 milliliters'], ej: 'A carton of milk.' },
          { q: 'Half a liter', question: 'How many milliliters is that?', r: '500 milliliters', falsas: ['50 milliliters', '5,000 milliliters'], ej: 'A small bottle of water.' },
          { q: 'A liter and a half', question: 'How many milliliters is that?', r: '1,500 milliliters', falsas: ['1,050 milliliters', '15,000 milliliters'], ej: 'A large bottle of water.' },
          { q: '2 liters', question: 'How many milliliters is that?', r: '2,000 milliliters', falsas: ['200 milliliters', '20,000 milliliters'] },
          { q: 'A quarter liter', question: 'How many milliliters is that?', r: '250 milliliters', falsas: ['25 milliliters', '2,500 milliliters'], ej: 'A cup of milk.' }
        ]
      }
    }
  }
};
