/* ============================================================
   Calculia — Restar y Cálculo Mental — datos
   Formato:
   - DATA.activities[id]: picto y niveles[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   Los nombres de actividades y niveles NO están aquí: son texto y
   viven en strings.js, indexados por 'id': App.i18n.t('actividad.<id>.nombre'),
   App.i18n.t('actividad.<id>.detalle'), App.i18n.t('actividad.<id>.instruccion'),
   App.i18n.t('nivel.<id>').
   ============================================================ */
var DATA = {
  porRonda: 6,

  activities: {
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
    }
  }
};
