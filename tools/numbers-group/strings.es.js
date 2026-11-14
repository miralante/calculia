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
      positivos: { name: 'Positivos y negativos', detail: 'Comprende los signos y practica con el termómetro y el ascensor.' },
      unidades: { name: 'Unidades y decenas', detail: '¿Qué número es?' },
      placevalue: { name: 'Cambiar de posición', detail: '10 pequeños se cambian por 1 grande.' },
      comparar: { name: 'Mayor, menor o igual', detail: 'Los signos <, > y =.' },
      ordinals: { name: 'Números ordinales', detail: 'Primero, segundo, tercero…' }
    }
  }, 'es');
})();
