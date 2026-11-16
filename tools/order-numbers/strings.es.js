/* ============================================================
   Calculia — Ordenar números (grupo): textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Ordenar números',
    instruction: 'Elige qué números quieres ordenar.',

    group: {
      comparar: { name: 'Mayor, menor o igual', detail: 'Los signos <, > y =.' },
      positives: { name: 'Ordenar positivos', detail: 'Pon los números positivos de menor a mayor.' },
      negatives: { name: 'Ordenar negativos', detail: 'Pon los números negativos de menor a mayor.' },
      fractions: { name: 'Ordenar fracciones', detail: 'Pon las fracciones de menor a mayor.' },
      decimals: { name: 'Ordenar decimales', detail: 'Pon los decimales de menor a mayor.' }
    }
  }, 'es');
})();
