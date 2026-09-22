/* ============================================================
   Calculia — Textos de Medidas (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   Las preguntas de cada medida (longitud, peso, capacidad) NO están
   aquí: viven en data.js, porque cada una lleva su propia respuesta
   correcta y sus dos respuestas falsas escritas a mano.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '📏 Medidas',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Mides una habitación, pesas la fruta en la báscula o llenas una botella. Las medidas están en todas partes.',
    explicacion: '✅ Saber las medidas te ayuda a comprar lo justo y a entender cuánto ocupa o pesa algo.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    explicacionCorrecta: '✅ ¡Correcto! La respuesta es: ',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    explicacionIncorrectaA: '❌ Mira: la respuesta correcta es ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    pista: '🤔 Prueba otra vez. Piensa con calma.',
    hint: '🤔 Prueba otra vez. Piensa con calma.',
    refuerzoTitulo: 'Refuerzo',
    reinforceTitle: 'Refuerzo',
    refuerzoIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    /* Nombre de cada escalón de la escalera. La clave es el símbolo,
       que es notación y vive en data.js */
    unit: {
      'km': 'kilómetro',
      'hm': 'hectómetro',
      'dam': 'decámetro',
      'm': 'metro',
      'dm': 'decímetro',
      'cm': 'centímetro',
      'mm': 'milímetro',
      'kg': 'kilogramo',
      'hg': 'hectogramo',
      'dag': 'decagramo',
      'g': 'gramo',
      'dg': 'decigramo',
      'cg': 'centigramo',
      'mg': 'miligramo',
      'kl': 'kilolitro',
      'hl': 'hectolitro',
      'dal': 'decalitro',
      'l': 'litro',
      'dl': 'decilitro',
      'cl': 'centilitro',
      'ml': 'mililitro'
    },
    /* En plural, para cuando la pregunta habla de varios. El español lo pide
       aunque el inglés lo forme igual: la forma no se calcula en código */
    unitPlural: {
      'km': 'kilómetros',
      'hm': 'hectómetros',
      'dam': 'decámetros',
      'm': 'metros',
      'dm': 'decímetros',
      'cm': 'centímetros',
      'mm': 'milímetros',
      'kg': 'kilogramos',
      'hg': 'hectogramos',
      'dag': 'decagramos',
      'g': 'gramos',
      'dg': 'decigramos',
      'cg': 'centigramos',
      'mg': 'miligramos',
      'kl': 'kilolitros',
      'hl': 'hectolitros',
      'dal': 'decalitros',
      'l': 'litros',
      'dl': 'decilitros',
      'cl': 'centilitros',
      'ml': 'mililitros'
    },
    activity: {
      medidas: { name: 'Medidas', detail: 'Metros, kilos y litros.', instruction: 'Piensa cuánto mide, cuánto pesa o cuánto cabe. Toca la respuesta.' },
      escalera: { name: 'La escalera', detail: 'Cada escalón, por 10.', instruction: 'Las unidades están en una escalera. El escalón de arriba es el más grande. Cada vez que bajas un escalón, se multiplica por 10. Entre un escalón y el siguiente está escrito ese 10: cúéntalos.' }
    },
    level: {
      me1: 'Longitud: metros',
      me2: 'Peso: kilos',
      me3: 'Capacidad: litros',
      es1: '¿Cuántos escalones?',
      es2: '¿Por cuánto se multiplica?',
      es3: 'Cambiar de unidad'
    },
    gen: {
      timesTen: '×10',
      stepsApart: 'Del {big} al {small}, ¿cuántos escalones hay que bajar?',
      stepsHint: 'Cuenta los saltos entre un escalón y el siguiente, no los escalones.',
      ladderAria: 'Una escalera de unidades, con el {big} y el {small} señalados.',
      stepFactor: '¿Cuántos {small} caben en 1 {big}?',
      factorHint: 'Cada escalón que bajas es un ×10 más.',
      ladderConvert: '{n} {big}, ¿cuántos {small} son?',
      convertHint: 'Baja los escalones uno a uno, multiplicando por 10 cada vez.'
    },
    transfer: 'Esto te servirá para comprar por peso, entender una receta, saber si algo cabe donde quieres ponerlo y pasar de una unidad a otra sin perderte.'
  }, 'es');
})();
