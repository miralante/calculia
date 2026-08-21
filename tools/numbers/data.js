/* ============================================================
   Calculia — Numbers — data
   Schema:
   - DATA.activities[id]: picto and levels[]. Each level: { id, tipo,
     ...config }. The 'tipo' chooses the question generator in app.js.
     Object.keys(DATA.activities) fixes the menu order.
   - DATA.readings: large numbers with their reading in words, per
     locale (DATA.readings[locale][lista]). NOTE: the numeric scale
     differs between locales (10^9 is "mil millones" in Spanish but
     "one billion" in English; 10^12 is "un billón" in Spanish but
     "one trillion" in English). See I18N.md §2.
   Activity and level names do NOT live here: they are UI text and
   live in strings.js, keyed by 'id': App.i18n.t('activity.<id>.name'),
   App.i18n.t('activity.<id>.detail'), App.i18n.t('activity.<id>.instruction'),
   App.i18n.t('level.<id>').
   To extend: add a new level with an id, and its text to
   strings.js (es and en).
   ============================================================ */
var DATA = {
  porRonda: 6,

  activities: {
    "positivos-y-negativos": {
      /* Positive and negative numbers via an elevator (floors below ground
         = negative, floors above ground = positive, ground floor = 0).
         Progression (rule 13): en1→en2 keeps the same reading skill and
         adds movement (only variable: gains a start+delta instead of a
         fixed floor). en2→en3 introduces comparing two floors instead of
         one. en3→en4 introduces locating a GIVEN floor number among
         candidate spots (the "place it in its spot" skill) instead of
         reading one shown floor. The range (min/max) stays fixed across
         all 4 levels so the only real change each step is the skill. */
      picto: '🛗',
      levels: [
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
         scale). umiles→umillones only changes 'lista'.
         umillones→counter introduces a different *mode* (free
         exploration up to 10^12 with ±1/±10/±100/±1000 buttons
         instead of a quiz): the consolidation step after the
         reading rounds, where the person uses everything they
         just saw to navigate the full range. The 'max' field
         here is the upper bound (inclusive); 10^12 = un billón
         (es) / one trillion (en). */
      picto: '🧱',
      levels: [
        { id: 'u99', tipo: 'bloques', max: 99 },
        { id: 'u999', tipo: 'bloques', max: 999 },
        { id: 'udictado', tipo: 'dictado', max: 999 },
        { id: 'umiles', tipo: 'lectura', lista: 'miles' },
        { id: 'umillones', tipo: 'lectura', lista: 'millones' },
        { id: 'counter', tipo: 'counter', max: 1000000000000 }
      ]
    },

    placevalue: {
      /* Place-value exchange ("10 of these make 1 of those") and the
         ×10 ladder up to 10^12. Progression (rule 13): pv1→pv2→pv3
         only change 'lugar' (which exchange). pv3→pv4 changes 'tipo'
         (exchange → ladder). pv4→pv5 only changes the exponent range
         (up to a million → up to a trillion / billón). */
      picto: '🔁',
      levels: [
        { id: 'pv1', tipo: 'canje', lugar: 0 },
        { id: 'pv2', tipo: 'canje', lugar: 1 },
        { id: 'pv3', tipo: 'canje', lugar: 2 },
        { id: 'pv4', tipo: 'escalera', minExp: 0, maxExp: 5 },
        { id: 'pv5', tipo: 'escalera', minExp: 6, maxExp: 11 }
      ]
    }
  },

  /* Large numbers and how to read them, per language. nota is shown as a hint.
     The scale differs between languages: see the note above. */
  readings: {
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
  }
};
