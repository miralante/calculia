/* ============================================================
   Calculia — Textos de Geometría (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   'angle.*' son los nombres de los tres tipos de ángulo; app.js los
   busca por el tipo que deduce de los grados, no por un id guardado.
   Los números NO están aquí: viven una sola vez en data.js.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '📐 Geometría',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Las esquinas, los bordes y las mitades están en las puertas, en las baldosas y en cualquier papel que dobles.',
    explicacion: '✅ Aquí todo se puede contar o mirar. No hay que aprenderse ninguna fórmula.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 «{elegida}» no es la respuesta. Piensa con calma y mira otra vez la pregunta.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    /* El nombre de verdad, con su explicación en palabras de todos los
       días al lado: se enseña la palabra, no se esconde. */
    angle: {
      right: { name: 'recto', gloss: 'como la esquina' },
      acute: { name: 'agudo', gloss: 'más cerrado' },
      obtuse: { name: 'obtuso', gloss: 'más abierto' }
    },
    activity: {
      clasificar: { name: 'Lados iguales', detail: 'Contar y dar nombre.', instruction: 'Los lados iguales llevan la misma marca. Cuenta las marcas iguales y sabrás cuántos lados miden lo mismo. Después le pondrás nombre a la figura.' },
      angulos: { name: 'Los ángulos', detail: 'Recto, agudo u obtuso.', instruction: 'Un ángulo es lo abierta que está una esquina. El ángulo recto es como la esquina de una hoja de papel: en el dibujo lo tienes marcado con una raya gris. Si la línea llega justo a la raya gris, el ángulo es recto. Si se queda antes, es agudo: está más cerrado. Si se pasa, es obtuso: está más abierto.' },
    },
    level: {
      q1: '¿Cuántos lados iguales?',
      q2: 'El nombre del triángulo',
      q3: 'El nombre de la figura de 4 lados',
      n1: 'Recto o agudo',
      n2: 'Recto u obtuso',
      n3: 'Los tres juntos',
      n4: '¿Cuántos grados mide?',
      n5: 'Los grados del reloj'
    },
    figure: {
      equilateral: { name: 'equilátero', gloss: 'los tres lados iguales' },
      isosceles: { name: 'isósceles', gloss: 'dos lados iguales' },
      scalene: { name: 'escaleno', gloss: 'los tres lados distintos' },
      square: { name: 'cuadrado', gloss: 'cuatro lados iguales y esquinas rectas' },
      rectangle: { name: 'rectángulo', gloss: 'dos largos y dos cortos' },
      rhombus: { name: 'rombo', gloss: 'cuatro lados iguales, pero inclinado' }
    },
    gen: {
      degrees: '{n} grados',
      measureAngle: '¿Cuántos grados mide este ángulo?',
      protractorHint: 'Sigue el brazo hasta el borde y lee el número. Cada rayita pequeña son {step} grados.',
      protractorAria: 'Un ángulo de {n} grados sobre un transportador.',
      clockAngle: 'Las dos agujas están en el {a} y en el {b}. ¿Qué ángulo hacen?',
      clockHint: 'La vuelta entera son {turn} grados y hay {marks} marcas, así que de una marca a la siguiente hay {each} grados. Cuenta las marcas por el lado corto.',
      clockAria: 'Un reloj con las agujas en el {a} y en el {b}.',
      howManyEqual: '¿Cuántos lados miden lo mismo?',
      equalHint: 'Los lados con la misma marca miden lo mismo.',
      equalAria: 'Una figura con {n} lados iguales marcados.',
      whichFigure: '¿Cómo se llama esta figura?',
      whichAngle: '¿Cómo es este ángulo?',
      angleHint: 'La raya gris marca dónde está el ángulo recto.',
      /* La pista que sale al fallar. Una por tipo de pregunta, y todas
         dicen qué mirar o qué hacer con lo que hay en pantalla: la frase
         única que había antes («Prueba otra vez…») era la misma para
         todas las preguntas, así que no decía nada. Estas no dan la
         respuesta —dan la estrategia—, que es lo que distingue una
         pista socrática de un spoiler. */
      socraticProtractor: '🤔 «{elegida}» no es la medida del brazo: mira en qué número del transportador cae el brazo que se mueve.',
      socraticClock: '🤔 «{elegida}» no es el camino corto: cuenta las marcas del reloj por el camino corto, de una en una.',
      socraticAngleKind: '🤔 «{elegida}» no es el tipo de ángulo: compara el ángulo con la raya gris que marca la esquina recta.',
      socraticEqualSides: '🤔 «{elegida}» no cuenta bien los lados iguales: mira las marcas iguales del dibujo y cuenta los lados que las llevan.',
      socraticFigureName: '🤔 «{elegida}» no es el nombre de la figura: cuenta primero los lados iguales antes de elegir el nombre.'
    },
    transfer: 'Esto te servirá para entender las esquinas de una puerta y para encontrar una casilla en un mapa.'
  }, 'es');
})();
