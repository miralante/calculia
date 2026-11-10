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
      numbers: { name: 'Los números', detail: 'Lee y compara. Aprende los positivos y negativos.' },
      quantities: { name: 'Leer y Escribir Números', detail: 'Lee y escribe números grandes.' },
      order: { name: 'Ordenar números', detail: 'Positivos, negativos, decimales y fracciones.' },
      ordinals: { name: 'Números ordinales', detail: 'Primero, segundo, tercero…' },
      factorial: { name: 'Números factoriales', detail: 'Qué significa el signo «!» y para qué sirve.' }
    }
  }, 'es');
})();
