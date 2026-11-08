/* ============================================================
   Calculia — Temporizador: textos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga desde index.html según App.i18n.locale().
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⏲️ Temporizador',
    instruction: 'Elige cuánto tiempo quieres medir. Pulsa Empezar cuando quieras; la cuenta sube desde cero.',
    choice: {
      second: '1 segundo',
      minute: '1 minuto',
      fiveMinutes: '5 minutos',
      tenMinutes: '10 minutos',
      fifteenMinutes: '15 minutos',
      halfHour: 'Media hora',
      hour: '1 hora'
    },
    goal: 'Tiempo total: {t}',
    elapsedLabel: 'Tiempo pasado',
    start: 'Empezar',
    pause: 'Pausar',
    resume: 'Seguir',
    stop: 'Parar',
    alarmTitle: '¡Se acabó el tiempo!',
    alarmText: 'Has medido {t}.',
    silence: 'Parar el aviso',
    again: 'Medir otro tiempo'
  }, 'es');
})();
