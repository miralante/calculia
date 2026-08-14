/* ============================================================
   Calculia — Fracciones y Medidas — datos
   Formato:
   - DATA.activities[id]: picto y niveles[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.measures: equivalencias del sistema métrico, por idioma
     (DATA.measures[locale]). Las respuestas falsas están escritas a
     mano para controlar la dificultad.
   Los nombres de actividades y niveles NO están aquí: son texto y
   viven en strings.js, indexados por 'id': App.i18n.t('actividad.<id>.nombre'),
   App.i18n.t('actividad.<id>.detalle'), App.i18n.t('actividad.<id>.instruccion'),
   App.i18n.t('nivel.<id>').
   ============================================================ */
var DATA = {
  porRonda: 6,

  activities: {
    fracciones: {
      /* Progression (rule 13): f1→f2 only changes the fractions
         (halves/quarters → thirds/sixths). f2→f3 changes the type
         (identify → compare), but f3's 'pares' EXCLUSIVELY reuses
         fractions already seen in f1/f2 — the only real novelty
         is the comparing skill, not new fractions adding to the
         load. */
      picto: '🍕',
      levels: [
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

    medidas: {
      picto: '📏',
      levels: [
        { id: 'me1', tipo: 'medidas', lista: 'longitud' },
        { id: 'me2', tipo: 'medidas', lista: 'peso' },
        { id: 'me3', tipo: 'medidas', lista: 'capacidad' }
      ]
    }
  },

  /* Metric system equivalences, per language.
     q: what is being asked · r: correct answer · falsas: 2 wrong answers
     ej: everyday example (optional). */
  measures: {
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
  }
};
