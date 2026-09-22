/* ============================================================
   Calculia — Textos de El Calendario (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   Los nombres de días, meses y estaciones van en 'day.*', 'month.*' y
   'season.*': app.js los busca por el id que usa data.js, así que
   añadir uno es añadir su id aquí y en los dos idiomas.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '📅 El Calendario',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Los días, los meses y las estaciones se repiten siempre en el mismo orden. Saberlo te ayuda a situarte en el tiempo.',
    explicacion: '✅ Conocer el calendario te ayuda a recordar citas, planear la semana y saber cuándo llega algo que esperas.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 Prueba otra vez. Mira el calendario con calma.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    day: {
      monday: 'lunes',
      tuesday: 'martes',
      wednesday: 'miércoles',
      thursday: 'jueves',
      friday: 'viernes',
      saturday: 'sábado',
      sunday: 'domingo'
    },
    month: {
      january: 'enero',
      february: 'febrero',
      march: 'marzo',
      april: 'abril',
      may: 'mayo',
      june: 'junio',
      july: 'julio',
      august: 'agosto',
      september: 'septiembre',
      october: 'octubre',
      november: 'noviembre',
      december: 'diciembre'
    },
    season: {
      spring: 'primavera',
      summer: 'verano',
      autumn: 'otoño',
      winter: 'invierno'
    },
    activity: {
      unidades: { name: 'Cuánto dura', detail: 'Días, semanas, meses y años.', instruction: 'Una semana son 7 días. Un año son 12 meses y también 4 estaciones. Cuéntalos en la tira: no hay que aprendérselo de memoria.' },
      semana: { name: 'Los días de la semana', detail: 'De lunes a domingo.', instruction: 'La semana tiene 7 días y siempre van en el mismo orden: lunes, martes, miércoles, jueves, viernes, sábado y domingo. Sábado y domingo son el fin de semana. Mira la tira de días: la respuesta está ahí.' },
      meses: { name: 'Los meses del año', detail: 'De enero a diciembre.', instruction: 'El año tiene 12 meses y siempre van en el mismo orden: empieza en enero y termina en diciembre. Después de diciembre vuelve a empezar enero. Mira el cuadro de meses: la respuesta está ahí.' },
      estaciones: { name: 'Las estaciones', detail: 'Primavera, verano, otoño e invierno.', instruction: 'El año tiene 4 estaciones. En invierno hace frío (enero, febrero). En primavera salen las flores (abril, mayo). En verano hace calor (julio, agosto). En otoño caen las hojas (octubre, noviembre).' }
    },
    level: {
      u1: '¿Cuántos tiene?',
      u2: '¿Qué dura más?',
      w1: 'El día siguiente',
      w2: 'El día anterior',
      w3: '¿Qué día falta?',
      m1: 'El mes siguiente',
      m2: 'El mes anterior',
      m3: '¿Qué mes falta?',
      s1: 'Del mes a la estación',
      s2: 'De la estación al mes'
    },
    unit: {
      day: 'un día',
      week: 'una semana',
      month: 'un mes',
      year: 'un año'
    },
    gen: {
      howManyIn: {
        daysInWeek: '¿Cuántos días tiene una semana?',
        monthsInYear: '¿Cuántos meses tiene un año?',
        seasonsInYear: '¿Cuántas estaciones tiene un año?'
      },
      unitName: {
        daysInWeek: 'días en una semana',
        monthsInYear: 'meses en un año',
        seasonsInYear: 'estaciones en un año'
      },
      countThem: 'Cuenta las casillas de la tira.',
      unitAria: 'Una tira con {n} {what}.',
      whichLonger: '¿Qué dura más, {a} o {b}?',
      whichShorter: '¿Qué dura menos, {a} o {b}?',
      containsHint: 'El primero está marcado: es uno de los trozos del otro.',
      pairAria: '{big} con {small} señalado dentro.',
      dayAfter: '¿Qué día viene después del {day}?',
      dayBefore: '¿Qué día viene antes del {day}?',
      dayGap: '¿Qué día falta en la semana?',
      weekAria: 'La semana con el {day} señalado.',
      weekGapAria: 'La semana con un día en blanco.',
      monthAfter: '¿Qué mes viene después de {month}?',
      monthBefore: '¿Qué mes viene antes de {month}?',
      monthGap: '¿Qué mes falta en el año?',
      yearAria: 'Los meses del año con {month} señalado.',
      yearGapAria: 'Los meses del año con un mes en blanco.',
      seasonOf: '¿En qué estación está {month}?',
      monthOfSeason: '¿Cuál de estos meses es de {season}?'
    },
    transfer: 'Esto te servirá para saber qué día es hoy, apuntar una cita en el calendario y contar cuánto falta para algo que esperas.'
  }, 'es');
})();
