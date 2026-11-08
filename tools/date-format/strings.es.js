/* ============================================================
   Calculia — Leer fechas: textos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga desde index.html según App.i18n.locale().
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    ui: { realLabel: 'Ejemplos de la vida real' },
    btnMenu: 'Volver al inicio',
    title: '📅 Leer fechas',
    instructionIntro: 'Lee la explicación.',

    explain: {
      read: { name: 'Así se escribe una fecha', text: 'Una fecha tiene tres partes, en este orden: día, mes y año. Las barras las separan: 10/01/2025.' },
      day: { name: 'Primero: el día', text: 'El primer número es el día. En 10/01/2025 el día es 10.' },
      month: { name: 'Después: el mes', text: 'El segundo número es el mes. En 10/01/2025 el mes es 01, enero.' },
      year: { name: 'Por último: el año', text: 'El último número es el año. En 10/01/2025 el año es 2025.' },
      months: { name: 'Los meses', text: 'Enero es el primero y diciembre es el último.' },
      example: { name: 'Ejemplo', text: '10/01/2025 se lee: 10 de enero de 2025.' }
    },

    month: {
      m01: 'enero', m02: 'febrero', m03: 'marzo', m04: 'abril', m05: 'mayo', m06: 'junio',
      m07: 'julio', m08: 'agosto', m09: 'septiembre', m10: 'octubre', m11: 'noviembre', m12: 'diciembre'
    },
    longDate: '{d} de {m} de {y}',

    q: {
      day: 'En {date}, ¿qué número es el día?',
      month: '¿En qué mes cae {date}?',
      year: '¿Qué año es {date}?',
      written: 'La fecha es {long}. ¿Cómo se escribe con barras?'
    },

    gen: {
      hint: '🤔 Recuerda el orden: día, mes y año. Las barras separan cada parte.'
    }
  }, 'es');
})();
