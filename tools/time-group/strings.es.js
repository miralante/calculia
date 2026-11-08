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
      moments: { name: 'Momentos del día', detail: 'Elige el reloj que corresponde a cada momento del día.' },
      elapsed: { name: '¿Cuánto tiempo pasa?', detail: 'Mira dos relojes y di cuánto tiempo hay entre ellos.' },
      convert: { name: 'Cambia de unidad', detail: 'Pasa horas a minutos, días a horas y más.' },
      durations: { name: '¿Cuánto tarda?', detail: 'Elige cuánto dura cada cosa de la vida diaria.' },
      timer: { name: 'Temporizador', detail: 'Mide 1 segundo, 1 minuto, 5 minutos… y avisa al acabar.' },
      compare: { name: '¿Cuál dura más?', detail: 'Compara tiempos escritos con unidades distintas.' },
      dates: { name: 'Leer fechas', detail: 'Lee 10/01/2025: día, mes y año, y practica.' }
    }
  }, 'es');
})();
