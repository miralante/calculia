/* ============================================================
   Calculia — Cambia de unidad: textos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga desde index.html según App.i18n.locale().
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    btnMenu: 'Volver al inicio',
    title: '🔁 Cambia de unidad',
    instructionIntro: 'Lee la explicación.',
    ui: { realLabel: 'Ejemplos de la vida real' },
    explain: {
      hours: { name: 'Horas, medias horas y cuartos', text: 'Una hora son 2 medias horas. Una hora son 4 cuartos de hora.' },
      minutes: { name: 'Minutos y segundos', text: 'Una hora son 60 minutos. Un minuto son 60 segundos.' },
      multiply: { name: 'Para pasar a una unidad pequeña, multiplica', text: '3 horas × 2 = 6 medias horas. 2 horas × 4 = 8 cuartos de hora.' },
      divide: { name: 'Para pasar a una unidad grande, divide', text: '8 cuartos de hora ÷ 4 = 2 horas. 120 minutos ÷ 60 = 2 horas.' }
    },
    example: {
      film: 'Una película dura 2 horas. Son 4 medias horas.',
      song: 'Una canción dura 3 minutos. Son 180 segundos.',
      class: 'Una clase dura media hora. Son 30 minutos.',
      lunch: 'La pausa de comer dura una hora. Son 4 cuartos de hora.',
      recipe: 'Una receta espera un cuarto de hora. Son 15 minutos.'
    },
    q: {
      'day-hour': '¿Cuántas horas hay en {n} días?',
      'week-day': '¿Cuántos días hay en {n} semanas?',
      'year-month': '¿Cuántos meses hay en {n} años?',
      'decade-year': '¿Cuántos años hay en {n} décadas?',
      'century-year': '¿Cuántos años hay en {n} siglos?',
      'hour-half': '¿Cuántas medias horas hay en {n} horas?',
      'hour-quarter': '¿Cuántos cuartos de hora hay en {n} horas?',
      'half-quarter': '¿Cuántos cuartos de hora hay en {n} medias horas?',
      'hour-minute': '¿Cuántos minutos hay en {n} horas?',
      'half-minute': '¿Cuántos minutos hay en {n} medias horas?',
      'quarter-minute': '¿Cuántos minutos hay en {n} cuartos de hora?',
      'minute-second': '¿Cuántos segundos hay en {n} minutos?',
      'hour-second': '¿Cuántos segundos hay en {n} horas?',
      'half-hour-back': '¿Cuántas horas son {n} medias horas?',
      'quarter-hour-back': '¿Cuántas horas son {n} cuartos de hora?',
      'minute-hour-back': '¿Cuántas horas son {n} minutos?',
      'second-minute-back': '¿Cuántos minutos son {n} segundos?'
    },
    gen: {
      hint: '🤔 Piensa en cuántas pequeñas caben en una grande. Para pasar a una pequeña, multiplica. Para pasar a una grande, divide.'
    }
  }, 'es');
})();
