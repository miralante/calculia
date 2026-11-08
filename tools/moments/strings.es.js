/* ============================================================
   Calculia — Momentos del día: textos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga desde index.html según App.i18n.locale().
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🌅 Momentos del día',
    instructionIntro: 'Lee la explicación.',
    btnMenu: 'Volver al inicio',

    ui: { realLabel: 'Ejemplos de la vida real' },

    /* Explicación en slides con dibujo: una por parte del día. */
    intro: {
      1: { title: 'Por la mañana', text: 'Es desde que te levantas hasta la comida. El desayuno y el colegio son por la mañana.' },
      2: { title: 'Por la tarde', text: 'Es desde la comida hasta que anochece. La comida y la merienda son por la tarde.' },
      3: { title: 'Por la noche', text: 'Es cuando anochece, hasta que te vas a dormir. La cena y la hora de dormir son por la noche.' }
    },

    /* Ejemplos de la vida real: un momento cada vez. */
    example: {
      desayuno: 'El desayuno es por la mañana, cuando empieza el día.',
      colegio: 'Ir al colegio es por la mañana.',
      comida: 'La comida es por la tarde, después de la mañana.',
      merienda: 'La merienda es por la tarde, antes de que anochezca.',
      cena: 'La cena es por la noche.',
      dormir: 'La hora de dormir es por la noche.'
    },

    part: {
      manana: 'Por la mañana',
      tarde: 'Por la tarde',
      noche: 'Por la noche'
    },

    q: {
      desayuno: '¿Cuándo es el desayuno?',
      colegio: '¿Cuándo vas al colegio?',
      comida: '¿Cuándo es la comida?',
      merienda: '¿Cuándo es la merienda?',
      cena: '¿Cuándo es la cena?',
      dormir: '¿Cuándo te vas a dormir?'
    },

    explain: {
      desayuno: 'El desayuno es por la mañana.',
      colegio: 'Ir al colegio es por la mañana.',
      comida: 'La comida es por la tarde.',
      merienda: 'La merienda es por la tarde.',
      cena: 'La cena es por la noche.',
      dormir: 'La hora de dormir es por la noche.'
    },

    gen: {
      hint: '🤔 Piensa si pasa antes de la comida, después de la comida o cuando ya es de noche.'
    }
  }, 'es');
})();
