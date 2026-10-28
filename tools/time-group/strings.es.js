/* ============================================================
   Calculia — Tiempo y reloj (grupo): textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⏳ Tiempo y reloj',
    instruction: 'Elige qué quieres practicar.',

    group: {
      units: { name: 'Unidades de tiempo', detail: 'Del siglo al segundo: explicación y ejemplos de la vida real.' },
      clock: { name: 'El reloj', detail: '¿Qué hora es?' },
      convert: { name: 'Cambia de unidad', detail: 'Pasa horas a minutos, días a horas y más.' },
      durations: { name: '¿Cuánto tarda?', detail: 'Elige cuánto dura cada cosa de la vida diaria.' },
      compare: { name: '¿Cuál dura más?', detail: 'Compara tiempos escritos con unidades distintas.' }
    }
  }, 'es');
})();
