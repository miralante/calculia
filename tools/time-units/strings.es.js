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
      year: { name: 'Año', text: 'Un año son 12 meses: enero (1), febrero (2), marzo (3), abril (4), mayo (5), junio (6), julio (7), agosto (8), septiembre (9), octubre (10), noviembre (11) y diciembre (12). Un año tiene 365 días. Los años bisiestos tienen 366 días.' },
      semester: { name: 'Semestre', text: 'Un semestre son 6 meses. Un año tiene dos semestres.' },
      quadrimester: { name: 'Cuatrimestre', text: 'Un cuatrimestre son 4 meses. Un año tiene tres cuatrimestres.' },
      trimester: { name: 'Trimestre', text: 'Un trimestre son 3 meses. Un año tiene cuatro trimestres.' },
      bimester: { name: 'Bimestre', text: 'Un bimestre son 2 meses.' },
      month: { name: 'Mes', text: 'Un mes tiene entre 28 y 31 días.' },
      fortnight: { name: 'Quincena', text: 'Una quincena son 15 días. Es la mitad de un mes.' },
      week: { name: 'Semana', text: 'Una semana son 7 días. Son lunes, martes, miércoles, jueves, viernes, sábado y domingo.' },
      day: { name: 'Día', text: 'Un día son 24 horas.' },
      hour: { name: 'Hora', text: 'Una hora son 60 minutos.' },
      halfHour: { name: 'Media hora', text: 'Media hora son 30 minutos.' },
      quarterHour: { name: 'Cuarto de hora', text: 'Un cuarto de hora son 15 minutos.' },
      minute: { name: 'Minuto', text: 'Un minuto son 60 segundos.' },
      second: { name: 'Segundo', text: 'El segundo es la unidad más pequeña de esta lista.' }
    },

    example: {
      century: 'El siglo XX va de 1901 a 2000. En 1969 una persona pisó la Luna. El siglo XXI empezó en 2001.',
      decade: 'Entre 1990 y 2000 pasa una década. En 1992 se celebraron los Juegos Olímpicos de Barcelona.',
      lustro: 'Entre tus 10 años y tus 15 años pasa un lustro.',
      year: 'Tu cumpleaños llega una vez al año.',
      semester: 'De enero a junio pasa un semestre.',
      quadrimester: 'Muchas universidades dividen el curso en dos cuatrimestres.',
      trimester: 'De enero a marzo pasa un trimestre.',
      bimester: 'Algunos recibos se pagan cada bimestre.',
      month: 'Febrero tiene 28 días. En año bisiesto tiene 29.',
      fortnight: 'Algunas personas cobran su sueldo cada quincena.',
      week: 'De lunes a domingo pasa una semana.',
      day: 'Un día tiene mañana, tarde y noche.',
      hour: 'Una película suele durar unas 2 horas.',
      halfHour: 'Un programa de dibujos animados suele durar media hora.',
      quarterHour: 'Esperar el autobús puede tardar un cuarto de hora.',
      minute: 'Lavarse los dientes tarda unos 2 minutos.',
      second: 'El latido de tu corazón dura casi un segundo.'
    },

    q: {
      century: '¿Cuántos años tiene un siglo?',
      decade: '¿Cuántos años tiene una década?',
      lustro: '¿Cuántos años tiene un lustro?',
      year: '¿Cuántos meses tiene un año?',
      semester: '¿Cuántos meses tiene un semestre?',
      quadrimester: '¿Cuántos meses tiene un cuatrimestre?',
      trimester: '¿Cuántos meses tiene un trimestre?',
      bimester: '¿Cuántos meses tiene un bimestre?',
      fortnight: '¿Cuántos días tiene una quincena?',
      week: '¿Cuántos días tiene una semana?',
      day: '¿Cuántas horas tiene un día?',
      hour: '¿Cuántos minutos tiene una hora?',
      halfHour: '¿Cuántos minutos tiene media hora?',
      quarterHour: '¿Cuántos minutos tiene un cuarto de hora?',
      minute: '¿Cuántos segundos tiene un minuto?'
    },

    gen: {
      hint: '🤔 Repasa la explicación. Piensa qué unidad es más pequeña que la de la pregunta.'
    }
  }, 'es');
})();
