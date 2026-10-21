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
      positives: { name: 'Positivos', detail: 'Pon los números positivos de menor a mayor.' },
      negatives: { name: 'Negativos', detail: 'Pon los números negativos de menor a mayor.' },
      fractions: { name: 'Fracciones', detail: 'Pon las fracciones de menor a mayor.' },
      decimals: { name: 'Decimales', detail: 'Pon los decimales de menor a mayor.' }
    }
  }, 'es');
})();
