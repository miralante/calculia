/* ============================================================
   Calculia — Unidades de tiempo: textos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga desde index.html según App.i18n.locale().
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⌛ Unidades de tiempo',
    instructionIntro: 'Lee la explicación.',
    instructionExamples: 'Mira cómo aparece en la vida real.',
    introNext: 'Ver en la vida real →',
    examplesNext: 'Empezar a practicar →',
    prev: '←',
    nextArrow: '→',
    check: 'Comprobar',
    newRound: 'Otra ronda →',

    unit: {
      century: { name: 'Siglo', text: 'Un siglo son 100 años.' },
      decade: { name: 'Década', text: 'Una década son 10 años.' },
      lustro: { name: 'Lustro', text: 'Un lustro son 5 años.' },
      year: { name: 'Año', text: 'Un año son 12 meses y unos 365 días.' },
      month: { name: 'Mes', text: 'Un mes tiene entre 28 y 31 días.' },
      week: { name: 'Semana', text: 'Una semana son 7 días.' },
      day: { name: 'Día', text: 'Un día son 24 horas.' },
      hour: { name: 'Hora', text: 'Una hora son 60 minutos.' },
      minute: { name: 'Minuto', text: 'Un minuto son 60 segundos.' },
      second: { name: 'Segundo', text: 'El segundo es la unidad más pequeña de esta lista.' }
    },

    example: {
      century: 'El siglo XXI empezó en el año 2001.',
      decade: 'Entre 2020 y 2030 pasa una década.',
      lustro: 'Entre tus 10 años y tus 15 años pasa un lustro.',
      year: 'Tu cumpleaños llega una vez al año.',
      month: 'Febrero tiene 28 días. En año bisiesto tiene 29.',
      week: 'De lunes a domingo pasa una semana.',
      day: 'Un día tiene mañana, tarde y noche.',
      hour: 'Una película suele durar unas 2 horas.',
      minute: 'Lavarse los dientes tarda unos 2 minutos.',
      second: 'El latido de tu corazón dura casi un segundo.'
    },

    q: {
      century: '¿Cuántos años tiene un siglo?',
      decade: '¿Cuántos años tiene una década?',
      lustro: '¿Cuántos años tiene un lustro?',
      year: '¿Cuántos meses tiene un año?',
      week: '¿Cuántos días tiene una semana?',
      day: '¿Cuántas horas tiene un día?',
      hour: '¿Cuántos minutos tiene una hora?',
      minute: '¿Cuántos segundos tiene un minuto?'
    },

    gen: {
      hint: '🤔 Repasa la explicación. Piensa qué unidad es más pequeña que la de la pregunta.'
    }
  }, 'es');
})();
