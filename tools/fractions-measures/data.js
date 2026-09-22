/* ============================================================
   Calculia — Fracciones — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   Los nombres de actividades y levels NO están aquí: son texto y
   viven en strings.js, indexados por 'id': App.i18n.t('actividad.<id>.name'),
   App.i18n.t('actividad.<id>.detalle'), App.i18n.t('actividad.<id>.instruction'),
   App.i18n.t('nivel.<id>').
   ============================================================ */
var DATA = {
  perRound: 6,

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
            /* app.js baraja cada par antes de mostrarlo, así que el orden
               aquí no cuenta: dos pares con las mismas dos fracciones
               serían la misma pregunta. app.js lo comprueba. */
            [[1, 2], [1, 4]], [[3, 4], [1, 4]], [[2, 3], [1, 3]],
            [[1, 2], [3, 4]], [[1, 6], [5, 6]], [[1, 2], [1, 6]]
          ]
        },
        /* Equivalent fractions (see TODO.md, not served to the browser).
           'pares' is [shown, equivalent-answer]. Denominators stay inside
           the set f1/f2 already taught (2, 3, 4, 6) so the only new idea
           is the equivalence itself — same discipline as f3 (rule 13). */
        {
          id: 'f4', tipo: 'equivalentes',
          pares: [
            [[1, 2], [2, 4]], [[1, 2], [3, 6]], [[1, 3], [2, 6]],
            [[2, 3], [4, 6]], [[2, 4], [1, 2]], [[3, 6], [1, 2]]
          ],
          distractores: [[1, 4], [3, 4], [1, 3], [2, 3], [1, 6], [5, 6], [2, 4]]
        },
        /* Adding and subtracting fractions that share a denominator.
           'casos' is [denominator, first, second], always
           chosen so the result stays between 1 and the denominator: no
           improper fractions and no zero, which would each be a second
           new idea on top of the operation (rule 13).
           f4→f5 changes the skill; f5→f6 only flips the operation. */
        {
          id: 'f5', tipo: 'sumaFrac', op: 'add',
          casos: [
            [4, 1, 2], [4, 2, 1], [4, 1, 1], [6, 2, 3],
            [6, 1, 4], [3, 1, 1], [6, 3, 2], [4, 1, 3]
          ]
        },
        {
          id: 'f6', tipo: 'sumaFrac', op: 'subtract',
          casos: [
            [4, 3, 1], [4, 3, 2], [6, 5, 2], [6, 4, 1],
            [3, 2, 1], [6, 5, 3], [4, 2, 1], [6, 4, 3]
          ]
        },
        /* Fractions whose slices are NOT the same size. The second
           denominator is always a multiple of the first, so the only new
           idea is "cut the big slices to match" (rule 13). f6→f7 changes
           the skill; f7→f8 only flips the operation. */
        {
          id: 'f7', tipo: 'mixFrac', op: 'add',
          casos: [
            [2, 1, 4, 1], [2, 1, 4, 2], [2, 1, 6, 1], [2, 1, 6, 2],
            [3, 1, 6, 1], [3, 1, 6, 2], [4, 1, 8, 1], [2, 1, 8, 3]
          ]
        },
        {
          id: 'f8', tipo: 'mixFrac', op: 'subtract',
          casos: [
            [2, 1, 4, 1], [2, 1, 6, 1], [2, 1, 6, 2], [3, 2, 6, 1],
            [4, 3, 8, 1], [2, 1, 8, 3], [3, 1, 6, 1], [4, 3, 8, 3]
          ]
        },
        /* A fraction OF an amount, which is how fractions get used out
           loud: half of eight, a quarter of twelve. `casos` is
           [den, total] and the total is always a multiple of den, so the
           groups come out even and the answer can be counted. */
        {
          id: 'f9', tipo: 'fracOf',
          casos: [
            [2, 8], [2, 10], [2, 6], [3, 9], [3, 12],
            [4, 8], [4, 12], [2, 12], [3, 6], [4, 16]
          ],
          things: [
            { id: 'sweets', picto: '🍬' },
            { id: 'apples', picto: '🍎' },
            { id: 'coins', picto: '🪙' },
            { id: 'pencils', picto: '✏️' }
          ]
        }
      ]
    },

    /* Decimal numbers (see TODO.md, not served to the browser).
       Placed after 'fracciones' on purpose: a decimal is presented as
       another way of writing a fraction the person already knows, so the
       pies carry over and only the notation is new.
       Progression (rule 13): d1→d2 only flips the direction of the
       question; d2→d3 only changes the set of fractions (tenths → the
       halves and quarters met in f1, which are the ones that actually
       turn up on a price tag or a bottle). */
    decimales: {
      picto: '🔢',
      levels: [
        {
          id: 'd1', tipo: 'decimalPie', dir: 'toNumber',
          fracs: [[1, 10], [2, 10], [3, 10], [5, 10], [7, 10], [9, 10]]
        },
        {
          id: 'd2', tipo: 'decimalPie', dir: 'toPicture',
          fracs: [[1, 10], [2, 10], [3, 10], [5, 10], [7, 10], [9, 10]]
        },
        {
          id: 'd3', tipo: 'decimalPie', dir: 'toNumber',
          fracs: [[1, 2], [1, 4], [3, 4]]
        },
        /* Adding and taking away decimals, on the same tenths pies. Only
           tenths, so each step is one slice: the notation is the only new
           thing. d3→d4 changes the skill; d4→d5 only flips the
           operation. `casos` is [tenths, tenths], kept so the result
           stays between 1 and 10 tenths. */
        {
          id: 'd4', tipo: 'decimalOp', op: 'add',
          casos: [[3, 4], [2, 5], [1, 6], [4, 4], [2, 3], [5, 4], [1, 8], [3, 6]]
        },
        {
          id: 'd5', tipo: 'decimalOp', op: 'subtract',
          casos: [[7, 3], [8, 5], [9, 4], [6, 2], [5, 3], [9, 7], [8, 1], [7, 5]]
        },
        /* Las dos notaciones en la misma cuenta: una fracción y un
           decimal juntos. d5→d6 cambia una sola cosa — que uno de los dos
           sumandos venga escrito como fracción — y d6→d7 solo da la
           vuelta a la operación.
           `casos` es [fracción, décimas]. La fracción siempre cabe en
           décimas exactas (medios, quintos y décimos), o los dos dibujos
           no se podrían juntar; app.js lo comprueba al arrancar. */
        {
          id: 'd6', tipo: 'mixedOp', op: 'add',
          casos: [
            [[1, 2], 3], [[1, 5], 4], [[3, 10], 5], [[1, 2], 4],
            [[2, 5], 2], [[1, 10], 6], [[3, 5], 3], [[1, 5], 7]
          ]
        },
        {
          id: 'd7', tipo: 'mixedOp', op: 'subtract',
          casos: [
            [[1, 2], 2], [[4, 5], 3], [[9, 10], 4], [[1, 2], 1],
            [[3, 5], 2], [[7, 10], 5], [[4, 5], 6], [[9, 10], 2]
          ]
        },
        /* Y las dos notaciones comparadas: cuál es más. Son la misma
           clase de número escrita de dos maneras, y verlo es de lo que
           va este nivel. Los dos nunca valen lo mismo: app.js lo
           comprueba, porque si valieran no habría respuesta. */
        {
          id: 'd8', tipo: 'fracOrDecimal',
          casos: [
            [[1, 2], 3], [[1, 5], 4], [[3, 5], 4], [[1, 2], 7],
            [[9, 10], 6], [[1, 10], 4], [[4, 5], 5], [[3, 10], 6]
          ]
        }
      ]
    }
  }
};
