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
    modesTitle: 'Elige una actividad',
    whatTime: '¿Qué hora es?',
    clockAria: 'Reloj: {texto}',
    endSummary: 'Has ganado {n} {nWord}. Ahora tienes {stars} {starsWord}.',
    btnMenu: 'Volver al inicio',
    learnTitle: 'Cómo se lee el reloj',
    learnIntro: 'El reloj tiene dos agujas. Cada aguja dice una cosa.',
    learnHourHand: 'La aguja corta marca la hora.',
    learnMinuteHand: 'La aguja larga marca los minutos.',
    learnRuleOClock: 'Si la aguja larga está en el 12, la hora es en punto.',
    learnRuleHalf: 'Si la aguja larga está en el 6, es y media.',
    learnExample: 'En este reloj son las {t}.',
    learnStart: 'Empezar a practicar →',
    oClock: '{h} en punto',
    quarterPast: '{h} y cuarto',
    halfPast: '{h} y media',
    quarterTo: '{h} menos cuarto',
    correctExplanation: '✅ ¡Correcto! Son las ',
    incorrectExplanationA: '❌ No es esa hora. Son las ',
    setHint: '🤔 «{elegida}» no es la hora que pide: ajusta la hora con los botones.',
    convertHint: '🤔 «{elegida}» no coincide con el reloj: compara la esfera con los números.',
    convertAnalogToDigital: '¿Qué hora marca este reloj?',
    convertDigitalToAnalog: 'Toca el reloj que marca esta hora.',
    setLabel: 'Pon el reloj en esta hora:',
    setHour: 'Hora',
    setMinute: 'Minutos',
    setIncrement: 'Subir',
    setDecrement: 'Bajar',
    setConfirm: 'Comprobar',
    elapsedFrom: 'Antes',
    elapsedTo: 'Después',
    elapsedNow: 'Ahora',
    elapsedStep: 'Pasa media hora →',
    elapsedSteps: 'Pasos del tiempo',
    elapsedPassed: 'Ya han pasado: {t}',
    elapsedArrived: 'Ya hemos llegado. ¿Cuánto tiempo ha pasado?',
    elapsedHint: '🤔 «{elegida}» no es el tiempo que ha pasado: cuenta cuántas medias horas has dejado pasar.',
    explainElapsed: 'Han pasado {gap}.',
    correctLead: '✅ ¡Correcto! ',
    incorrectLead: '❌ Esa no es la respuesta. ',
    gap: {
      '30': 'media hora',
      '60': '1 hora',
      '90': 'una hora y media',
      '120': '2 horas',
      '150': 'dos horas y media',
      '180': '3 horas'
    },
    mode: {
      elapsed: {
        name: 'Cuánto tiempo pasa',
        description: 'Mira los dos relojes y di cuánto tiempo hay entre uno y otro.',
        question: '¿Cuánto tiempo pasa entre los dos relojes?'
      },
      set: {
        name: 'Poner el reloj',
        description: 'Lee la hora y mueve las agujas con los botones.',
        question: 'Pon las agujas en la hora indicada.'
      },
      convert: {
        name: 'Analógico ↔ Digital',
        description: 'Empareja el reloj de agujas con los números digitales.',
        question: 'Empareja el reloj con su hora digital.'
      }
    },
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    levelDescription: { 1: 'Horas en punto', 2: 'Y media', 3: 'Y cuarto, menos cuarto' },
    transfer: 'Esto te servirá para leer la hora en el reloj de la cocina, en el del cole o en tu propia muñeca, sin tener que preguntar a cada momento.',
  }, 'es');
})();
