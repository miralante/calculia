/* ============================================================
   Calculia — Cambia de unidad: textos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga desde index.html según App.i18n.locale().
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔁 Cambia de unidad',
    instructionIntro: 'Lee la explicación.',
    introContinue: 'Empezar a practicar →',
    intro: {
      title: 'Cambia de unidad',
      text: 'Una hora son 60 minutos. Para saber cuántos minutos hay en 3 horas, multiplica: 3 × 60 = 180.'
    },
    check: 'Comprobar',
    newRound: 'Otra ronda →',
    q: {
      'hour-minute': '¿Cuántos minutos hay en {n} horas?',
      'minute-second': '¿Cuántos segundos hay en {n} minutos?',
      'day-hour': '¿Cuántas horas hay en {n} días?',
      'week-day': '¿Cuántos días hay en {n} semanas?',
      'year-month': '¿Cuántos meses hay en {n} años?',
      'decade-year': '¿Cuántos años hay en {n} décadas?',
      'century-year': '¿Cuántos años hay en {n} siglos?',
      'hour-second': '¿Cuántos segundos hay en {n} horas?'
    },
    gen: {
      hint: '🤔 Cada unidad grande tiene muchas pequeñas. Multiplica la cantidad por cuántas tiene cada una.'
    }
  }, 'es');
})();
