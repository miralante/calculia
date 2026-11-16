/* ============================================================
   Calculia — Números (grupo): textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Números',
    instruction: 'Elige qué quieres practicar.',

    group: {
      types: { name: 'Tipos de números', detail: 'Naturales, enteros, decimales y fracciones.' },
      temperature: { name: 'Temperatura del agua', detail: 'Sube y baja los grados. Mira qué pasa con el agua.' },
      unidades: { name: 'Unidades, decenas, centenas', detail: '¿Qué número es?' },
      placevalue: { name: 'Cuentas rápidas', detail: '10 pequeños se cambian por 1 grande.' },
      ordinals: { name: 'Números ordinales', detail: 'Primero, segundo, tercero…' }
    }
  }, 'es');
})();
