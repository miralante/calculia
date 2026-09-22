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
    hint: '🤔 Prueba otra vez. Mira el dibujo con calma.',
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
    answer: {
      yes: 'Sí',
      no: 'No'
    },
    activity: {
      circulo: { name: 'El círculo', detail: 'El borde y lo de dentro.', instruction: 'El borde de un círculo mide algo más de 3 veces lo que mide el círculo de un lado a otro. Por eso la respuesta es un «más o menos». Para lo de dentro se cuentan los cuadrados enteros que caben.' },
      volumen: { name: 'El volumen', detail: 'Cuántos cubos caben.', instruction: 'El volumen es cuántos cubos caben dentro de una caja. Las capas están dibujadas una debajo de otra: cuenta los cubos de una capa y luego cuántas capas hay.' },
      clasificar: { name: 'Lados iguales', detail: 'Contar y dar nombre.', instruction: 'Los lados iguales llevan la misma marca. Cuenta las marcas iguales y sabrás cuántos lados miden lo mismo. Después le pondrás nombre a la figura.' },
      coordenadas: { name: 'Las casillas', detail: 'Una casilla, dos números.', instruction: 'Cada casilla se dice con dos números: primero la columna (los de abajo) y después la fila (los de la izquierda). Los números están escritos en la cuadrícula: no hay que contarlos de memoria.' },
      rectas: { name: 'Dos rectas', detail: '¿Se tocan o no?', instruction: 'Dos rectas pueden no tocarse nunca: son paralelas. O pueden cruzarse. Y si al cruzarse hacen una esquina de cuadrado, son perpendiculares. Mira el dibujo y decide.' },
      angulos: { name: 'Los ángulos', detail: 'Recto, agudo u obtuso.', instruction: 'Un ángulo es lo abierta que está una esquina. El ángulo recto es como la esquina de una hoja de papel: en el dibujo lo tienes marcado con una raya gris. Si la línea llega justo a la raya gris, el ángulo es recto. Si se queda antes, es agudo: está más cerrado. Si se pasa, es obtuso: está más abierto.' },
      perimetro: { name: 'El borde', detail: 'Cuánto mide dar la vuelta.', instruction: 'El borde es el camino que recorres al dar la vuelta a la figura por fuera. Se cuenta cuadradito a cuadradito, sin saltarse las esquinas.' },
      area: { name: 'Lo de dentro', detail: 'Cuántos cuadrados caben.', instruction: 'Aquí no se cuenta el borde: se cuentan los cuadrados que hay dentro de la figura.' },
      simetria: { name: 'Doblar por la mitad', detail: 'Si coincide o no.', instruction: 'Imagina que doblas el dibujo por la raya del medio. Si los dos lados coinciden exactamente, la figura es simétrica. Si sobra algo por un lado, no lo es.' }
    },
    level: {
      w1: 'El borde del círculo',
      w2: 'Lo que cabe dentro',
      v1: 'Contar los cubos',
      m3: '¿Movida o girada?',
      q1: '¿Cuántos lados iguales?',
      q2: 'El nombre del triángulo',
      q3: 'El nombre de la figura de 4 lados',
      k1: '¿En qué casilla está?',
      k2: 'Busca la casilla',
      n1: 'Recto o agudo',
      n2: 'Recto u obtuso',
      n3: 'Los tres juntos',
      p1: 'El borde de un cuadrado',
      p2: 'El borde de un rectángulo',
      a1: 'Los cuadrados de un cuadrado',
      a2: 'Los cuadrados de un rectángulo',
      m1: '¿Coincide?',
      m2: 'Busca la que coincide',
      n4: '¿Cuántos grados mide?',
      n5: 'Los grados del reloj',
      a3: 'Los cuadrados de un triángulo',
      v2: 'Los cuadrados de fuera',
      k3: '¿Cuál se sale de la recta?',
      r1: '¿Paralelas o cruzadas?'
    },
    /* Cómo se llama cada pareja de rectas. app.js las busca por el nombre
       que saca de comparar las dos pendientes del dibujo. */
    lines: {
      parallel: 'Paralelas: no se tocan nunca',
      perpendicular: 'Perpendiculares: esquina de cuadrado',
      crossing: 'Se cruzan, pero sin hacer esquina'
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
      circleEdge: 'Un círculo mide {d} centímetros de un lado a otro. ¿Cuánto mide su borde?',
      circleHint: 'El borde mide algo más de 3 veces esos {d} centímetros.',
      circleAria: 'Un círculo con una raya de {d} centímetros de un lado a otro.',
      about: 'unos {n} cm',
      circleArea: '¿Cuántos cuadrados enteros caben dentro del círculo?',
      circleAreaHint: 'Cuenta solo los cuadrados que están enteros dentro.',
      circleGridAria: 'Un círculo sobre una cuadrícula, con {n} cuadrados enteros dentro.',
      volume: '¿Cuántos cubos caben en la caja?',
      volumeHint: 'Cada capa tiene {per} cubos, y hay {layers} capas.',
      boxAria: 'Una caja de {layers} capas de {per} cubos.',
      degrees: '{n} grados',
      measureAngle: '¿Cuántos grados mide este ángulo?',
      protractorHint: 'Sigue el brazo hasta el borde y lee el número. Cada rayita pequeña son {step} grados.',
      protractorAria: 'Un ángulo de {n} grados sobre un transportador.',
      clockAngle: 'Las dos agujas están en el {a} y en el {b}. ¿Qué ángulo hacen?',
      clockHint: 'La vuelta entera son {turn} grados y hay {marks} marcas, así que de una marca a la siguiente hay {each} grados. Cuenta las marcas por el lado corto.',
      clockAria: 'Un reloj con las agujas en el {a} y en el {b}.',
      linePair: '¿Cómo son estas dos rectas?',
      linesHint: 'Si se juntan en algún sitio, se cruzan. Y si al cruzarse hacen esquina de cuadrado, son perpendiculares.',
      linesAria: 'Dos rectas dentro de un cuadro.',
      triangleArea: '¿Cuántos cuadraditos tiene el triángulo pintado?',
      triangleHint: 'El triángulo es justo la mitad del rectángulo de rayas. Cuenta el rectángulo y parte por la mitad.',
      triangleAria: 'Un triángulo dentro de un rectángulo de {w} por {h} cuadraditos.',
      surface: 'La caja está abierta. ¿Cuántos cuadraditos tiene por fuera?',
      surfaceHint: 'Cuenta los cuadraditos de las seis caras, una por una.',
      netAria: 'Las seis caras de una caja de {w} por {h} por {d}, abiertas.',
      offTheLine: 'Tres puntos están en línea recta. ¿Cuál se sale?',
      lineUpHint: 'Imagina una regla apoyada en los puntos: uno se queda fuera.',
      pointsAria: '{n} puntos en una cuadrícula.',
      dotLetters: 'ABCD',
      whichMoved: '¿Cuál es la misma figura, solo movida de sitio?',
      movedHint: 'Movida sigue mirando igual. Girada mira hacia otro lado.',
      movedAria: 'Una figura dibujada en una cuadrícula.',
      ariaMoved: 'La misma figura movida de sitio.',
      ariaTurned: 'La figura girada.',
      ariaFlipped: 'La figura del revés, como en un espejo.',
      howManyEqual: '¿Cuántos lados miden lo mismo?',
      equalHint: 'Los lados con la misma marca miden lo mismo.',
      equalAria: 'Una figura con {n} lados iguales marcados.',
      whichFigure: '¿Cómo se llama esta figura?',
      whichSquare: '¿En qué casilla está el punto?',
      findSquare: '¿En qué dibujo está el punto en la casilla {where}?',
      coordHint: 'Primero la columna de abajo, después la fila de la izquierda.',
      coordLabel: 'columna {col}, fila {row}',
      whichAngle: '¿Cómo es este ángulo?',
      angleHint: 'La raya gris marca dónde está el ángulo recto.',
      perimeter: '¿Cuántos cuadraditos mide el borde?',
      perimeterHint: 'Dale la vuelta a la figura contando los cuadraditos del borde.',
      area: '¿Cuántos cuadrados hay dentro?',
      areaHint: 'Cuenta los cuadrados de dentro, fila a fila.',
      rectAria: 'Una figura de {w} cuadrados de ancho y {h} de alto.',
      isSymmetric: 'Si doblas por la raya, ¿coinciden los dos lados?',
      pickSymmetric: '¿Cuál de las dos coincide al doblarla por la raya?',
      symmetryHint: 'Mira un lado de la raya y luego el otro.',
      ariaSymmetric: 'Una figura que coincide al doblarla.',
      ariaNotSymmetric: 'Una figura que no coincide al doblarla.'
    },
    transfer: 'Esto te servirá para entender cuánta cinta necesitas para rodear algo, cuántas baldosas caben en un suelo o por dónde doblar un papel para que quede igual.'
  }, 'es');
})();
