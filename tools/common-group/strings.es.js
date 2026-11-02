/* ============================================================
   Calculia — Divisores y múltiplos (grupo): textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➗ Divisores y múltiplos',
    instruction: 'Elige qué quieres practicar.',

    group: {
      factor: { name: 'Factorización', detail: 'Descomponer un número en factores primos.' },
      multiples: { name: 'Múltiplos', detail: 'Números que salen al multiplicar.' },
      divisibility: { name: 'Divisibilidad', detail: 'Cuándo un número se divide exacto.' },
      divisor: { name: 'Máximo común divisor', detail: 'El mayor número que divide a dos.' },
      multiple: { name: 'Mínimo común múltiplo', detail: 'El menor número que es múltiplo de dos.' }
    }
  }, 'es');
})();
