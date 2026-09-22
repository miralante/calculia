/* ============================================================
   Calculia — Restar y Cálculo Mental — datos
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
    /* Foundation ladder. The anchors are 1, 5 and 10 because they are the
       numbers the hand and the coins already give you: +1 is the next
       number, 5 is half a ten-bar, 10 is a whole bar. Every `tipo:
       'anchor'` level (a1-a6) is chosen so there is never a carry or a
       borrow — the units digit is picked to leave room — so the only
       new idea per step is the anchor itself (rule 13, gradual
       progression). `placeValue` (a7-a8) stays carry-free too, joining
       or removing units without the ten ever changing. Only from `carry`
       /`borrow` (a9-a10) does crossing a ten become the point, once the
       carry-free ground is solid.
       `max` caps the starting number; `step` is the anchor. */
    anchors: {
      picto: '🖐️',
      levels: [
        { id: 'a1', tipo: 'anchor', step: 1,  op: 'add',      max: 9 },
        { id: 'a2', tipo: 'anchor', step: 1,  op: 'subtract', max: 10 },
        { id: 'a3', tipo: 'anchor', step: 10, op: 'add',      max: 29 },
        { id: 'a4', tipo: 'anchor', step: 10, op: 'subtract', max: 39 },
        { id: 'a5', tipo: 'anchor', step: 5,  op: 'add',      max: 24 },
        { id: 'a6', tipo: 'anchor', step: 5,  op: 'subtract', max: 29 },
        { id: 'a7', tipo: 'placeValue', op: 'add' },
        { id: 'a8', tipo: 'placeValue', op: 'subtract' },
        /* Adding and subtracting across a ten (see TODO.md, which is not
           served to the browser): the
           only new idea versus a7/a8 is crossing a ten — ten loose units
           regroup into a bar, or a bar breaks into ten units to allow
           the subtraction. Everything else (base-ten picture, 3 options,
           near-miss distractors) stays the same shape. */
        { id: 'a9', tipo: 'carry' },
        { id: 'a10', tipo: 'borrow' }
      ]
    },

    restar: {
      picto: '➖',
      levels: [
        { id: 'r10', tipo: 'restar', a: [5, 10], maxB: 5 },
        { id: 'r20', tipo: 'restar', a: [10, 20], maxB: 10 }
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
      levels: [
        { id: 'k1', tipo: 'doubles' },
        { id: 'k2', tipo: 'sumLarge', suma: 10 },
        { id: 'k3', tipo: 'sumLarge', suma: 100 },
        { id: 'k4', tipo: 'sumLarge', suma: 1000 },
        { id: 'k5', tipo: 'subtractLarge', resta: 10 },
        { id: 'k6', tipo: 'subtractLarge', resta: 100 },
        { id: 'k7', tipo: 'subtractLarge', resta: 1000 },
        { id: 'k8', tipo: 'multiplyLarge', factor: 10 },
        { id: 'k9', tipo: 'multiplyLarge', factor: 100 }
      ]
    }
  }
};
