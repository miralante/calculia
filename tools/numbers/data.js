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
  perRound: 6,

  activities: {
    /* Ordinal numbers (see TODO.md, not served to the browser). Framed as
       a queue because waiting your turn and knowing which place you are
       in is a real daily-living skill, not a classroom abstraction. The
       flag marks where the queue starts, so "first" never depends on
       guessing which end counts.
       Progression (rule 13): o1→o2 only changes the queue length;
       o2→o3 only flips the direction of the question (point at a place
       and name it → name a place and find who is there). */
    ordinales: {
      picto: '1️⃣',
      levels: [
        { id: 'o1', tipo: 'ordinal', items: 3, ask: 'position' },
        { id: 'o2', tipo: 'ordinal', items: 5, ask: 'position' },
        { id: 'o3', tipo: 'ordinal', items: 5, ask: 'member' }
      ]
    },

    /* The comparison signs (see TODO.md, not served to the browser).
       Progression (rule 13), exactly one variable per step:
         c1→c2  magnitude grows, blocks stay.
         c2→c3  same numbers, the blocks go away — the comparison has to
                be made on the digits alone. This is the abstraction step.
         c3→c4  magnitude grows again.
         c4→c5  magnitude grows again.
       Blocks only exist below 100: two sides of ~27 blocks stop being
       countable at a glance on a phone, which would defeat their point. */
    comparar: {
      picto: '⚖️',
      levels: [
        { id: 'c1', tipo: 'comparar', min: 1, max: 9, blocks: true },
        { id: 'c2', tipo: 'comparar', min: 10, max: 99, blocks: true },
        { id: 'c3', tipo: 'comparar', min: 10, max: 99, blocks: false },
        { id: 'c4', tipo: 'comparar', min: 100, max: 999, blocks: false },
        { id: 'c5', tipo: 'comparar', min: 1000, max: 9999, blocks: false }
      ]
    },

    /* The number line (see TODO.md, not served to the browser). The elevator
       already draws a number line, but only to make sense of negatives;
       this one is about placing a number among its neighbours, which is
       what placing a number on a line actually asks for.
       The mark ALWAYS sits on a notch, so the number can be counted
       exactly instead of estimated — a mark floating between notches
       would have no determinable answer.
       `tick` is the value of one notch, `label` how often a notch carries
       a printed number. The variable that grows is how much help the
       labels give, which is the real number-line skill:
         n1  every notch is labelled — just read the one under the arrow.
         n2  labels every 5, so units are counted from the nearest one.
         n3  same, on a longer line.
         n4  each notch is now worth ten, counted from a distant label. */
    recta: {
      picto: '📈',
      levels: [
        { id: 'n1', tipo: 'numberLine', min: 0, max: 10, tick: 1, label: 1 },
        { id: 'n2', tipo: 'numberLine', min: 0, max: 10, tick: 1, label: 5 },
        { id: 'n3', tipo: 'numberLine', min: 0, max: 20, tick: 1, label: 5 },
        { id: 'n4', tipo: 'numberLine', min: 0, max: 100, tick: 10, label: 50 }
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
    },

    /* Positive and negative numbers via an elevator (floors below ground
       = negative, floors above ground = positive, ground floor = 0).
       Free-exploration mode: same mechanic as the water-temperature
       tool (−1/+1 buttons, the visual reacts on every step). The
       person drives the elevator from the ground floor to the
       basement and back, watching the floor number change. Two
       missions (rule 13, only one variable changes between them):
       libre  → meta. libre has no target, just explore. meta adds a
       single target floor (the elevator starts somewhere else and
       has to be navigated to the goal, crossing zero in the
       process). Range (−3/+3): a small, realistic building — 3
       parking floors below ground, 3 floors above it — small
       enough that every floor fits on screen at once and moving
       one floor at a time (the only button) always reaches the
       target in a few taps, no ±10 jump needed.
       Last in the menu because negative numbers are the most advanced
       idea in this tool, while naming a place in a queue and comparing
       two numbers are the most approachable ones. */
    "positivos-y-negativos": {
      picto: '🛗',
      levels: [
        { id: 'libre', tipo: 'ascensorLibre', min: -3, max: 3 },
        { id: 'meta',  tipo: 'ascensorMeta',  min: -3, max: 3, meta: -1, inicio: 2 }
      ]
    }
  },

  /* Large numbers and how to read them, per language. nota is shown as a hint.
     The scale differs between languages: see the note above. */
  readings: {
    es: {
      miles: [
        { n: 1000, words: 'mil' },
        { n: 2000, words: 'dos mil' },
        { n: 3000, words: 'tres mil' },
        { n: 4500, words: 'cuatro mil quinientos' },
        { n: 7000, words: 'siete mil' },
        { n: 10000, words: 'diez mil' },
        { n: 20000, words: 'veinte mil' },
        { n: 45000, words: 'cuarenta y cinco mil' },
        { n: 100000, words: 'cien mil' },
        { n: 300000, words: 'trescientos mil' },
        { n: 500000, words: 'quinientos mil' },
        { n: 750000, words: 'setecientos cincuenta mil' }
      ],
      millones: [
        { n: 1000000, words: 'un millón' },
        { n: 2000000, words: 'dos millones' },
        { n: 5000000, words: 'cinco millones' },
        { n: 10000000, words: 'diez millones' },
        { n: 50000000, words: 'cincuenta millones' },
        { n: 100000000, words: 'cien millones' },
        { n: 500000000, words: 'quinientos millones' },
        { n: 1000000000, words: 'mil millones' },
        { n: 2000000000, words: 'dos mil millones' },
        { n: 1000000000000, words: 'un billón', nota: 'Un billón es un millón de millones.' }
      ]
    },
    en: {
      miles: [
        { n: 1000, words: 'one thousand' },
        { n: 2000, words: 'two thousand' },
        { n: 3000, words: 'three thousand' },
        { n: 4500, words: 'four thousand five hundred' },
        { n: 7000, words: 'seven thousand' },
        { n: 10000, words: 'ten thousand' },
        { n: 20000, words: 'twenty thousand' },
        { n: 45000, words: 'forty-five thousand' },
        { n: 100000, words: 'one hundred thousand' },
        { n: 300000, words: 'three hundred thousand' },
        { n: 500000, words: 'five hundred thousand' },
        { n: 750000, words: 'seven hundred fifty thousand' }
      ],
      millones: [
        { n: 1000000, words: 'one million' },
        { n: 2000000, words: 'two million' },
        { n: 5000000, words: 'five million' },
        { n: 10000000, words: 'ten million' },
        { n: 50000000, words: 'fifty million' },
        { n: 100000000, words: 'one hundred million' },
        { n: 500000000, words: 'five hundred million' },
        { n: 1000000000, words: 'one billion' },
        { n: 2000000000, words: 'two billion' },
        { n: 1000000000000, words: 'one trillion', nota: 'One trillion is a thousand billions.' }
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

  /* Who stands in the queue for the 'ordinal' levels. Emoji only, so the
     list needs no locale split (same reasoning as the pattern series in
     tools/patterns/). Animals rather than people: no gender or skin-tone
     to pick, and the ordinal then agrees with "lugar" in Spanish, which
     avoids asking the person to track grammatical gender on top of the
     actual skill. */
  queueMembers: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐯'],

  /* Shared config for the elevator free-exploration missions
     ('positivos-y-negativos'). Centralised here so the visual range
     and the tolerance for 'ascensorMeta' stay in lockstep across
     levels. */
  elevador: {
    /* Inclusive range the user can move within: a small, realistic
       building (3 floors below ground, 3 above). Small enough that
       moving one floor at a time — the only step size offered — is
       always enough to reach any floor in a few taps. */
    min: -3,
    max: 3,
    /* Tolerance for 'ascensorMeta' (a ±tolerance band around the
     target floor counts as a hit). 0 means "land exactly on the
     floor" — the user must stop the right number of times. */
    tolerancia: 0
  }
};
