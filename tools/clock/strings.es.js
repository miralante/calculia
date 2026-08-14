/* ============================================================
   Calculia — Clock texts (ES)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🕐 El Reloj',
    instruction: 'Mira el reloj. Elige la hora correcta.',
    contexto: 'Estás en un momento del día: el desayuno, el cole, la comida o la cena. En el reloj grande de la cocina ves qué hora es.',
    explicacion: '✅ Lo has hecho muy bien. Saber la hora te ayuda a llegar puntual al cole, a no perderte la merienda y a controlar tu propio tiempo.',
    levelsTitle: 'Elige una actividad',
    whatTime: '¿Qué hora es?',
    clockAria: 'Reloj: {texto}',
    endSummary: 'Has ganado {n} estrellas. Ahora tienes {stars} estrellas.',
    otherLevel: 'Elegir otra actividad',
    oClock: '{h} en punto',
    quarterPast: '{h} y cuarto',
    halfPast: '{h} y media',
    quarterTo: '{h} menos cuarto',
    correctExplanation: '✅ ¡Correcto! Son las ',
    incorrectExplanationA: '❌ No es esa hora. Son las ',
    readHint: '🤔 Prueba otra vez. Mira el reloj con calma.',
    associateHint: '🤔 Prueba otra vez. Piensa en ese momento del día.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    levelDescription: { 1: 'Horas en punto', 2: 'Y media', 3: 'Y cuarto, menos cuarto' },
    moment: {
      desayuno: { name: 'el desayuno', question: '¿A qué hora es el desayuno?' },
      colegio: { name: 'ir al colegio', question: '¿A qué hora vas al colegio?' },
      comida: { name: 'la comida', question: '¿A qué hora es la comida?' },
      merienda: { name: 'la merienda', question: '¿A qué hora es la merienda?' },
      cena: { name: 'la cena', question: '¿A qué hora es la cena?' },
      dormir: { name: 'dormir', question: '¿A qué hora te vas a dormir?' }
    },
    transfer: 'Esto te servirá para leer la hora en el reloj de la cocina, en el del cole o en tu propia muñeca, sin tener que preguntar a cada momento.',
    transferencia: 'Esto te servirá para leer la hora en el reloj de la cocina, en el del cole o en tu propia muñeca, sin tener que preguntar a cada momento.'
  }, 'es');
})();
