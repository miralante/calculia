/* ============================================================
   Calculia — Textos de Sitios y tamaños (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   - 'pos.*' es la palabra suelta (la que se elige como respuesta).
   - 'phrase.*' es la posición con su referencia ("dentro de la caja"),
     que es lo que se dice cuando hay que nombrarla entera.
   - 'object.*' son las cosas que se colocan en la escena; 'thing.*'
     las que se comparan. app.js las busca por el id de data.js.
   - 'dim.*' incluye el verbo, porque "cabe más" y "es más largo" no
     encajan en la misma plantilla.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🧭 Sitios y tamaños',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Decir dónde está algo y cuál es más grande se usa todos los días: al buscar una cosa en casa o al elegir qué bolsa pesa menos.',
    explicacion: '✅ Aquí no hay que contar ni calcular nada. Solo mirar y decir qué ves.',
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
    pos: {
      inside: 'dentro',
      outside: 'fuera',
      above: 'encima',
      below: 'debajo',
      left: 'a la izquierda',
      right: 'a la derecha'
    },
    phrase: {
      inside: 'dentro de la caja',
      outside: 'fuera de la caja',
      above: 'encima de la silla',
      below: 'debajo de la silla',
      left: 'a la izquierda del árbol',
      right: 'a la derecha del árbol'
    },
    object: {
      ball: 'la pelota',
      cat: 'el gato',
      apple: 'la manzana',
      balloon: 'el globo'
    },
    thing: {
      bus: 'el autobús',
      bike: 'la bici',
      train: 'el tren',
      car: 'el coche',
      tree: 'el árbol',
      flower: 'la flor',
      snake: 'la serpiente',
      worm: 'el gusano',
      elephant: 'el elefante',
      feather: 'la pluma',
      teddy: 'el peluche',
      house: 'la casa',
      apple: 'la manzana',
      chair: 'la silla',
      clip: 'el clip',
      bathtub: 'la bañera',
      cup: 'el vaso',
      bucket: 'el cubo',
      spoon: 'la cuchara',
      barrel: 'el bidón',
      bottle: 'el biberón'
    },
    dim: {
      length: { more: 'es más largo', less: 'es más corto' },
      weight: { more: 'pesa más', less: 'pesa menos' },
      capacity: { more: 'cabe más', less: 'cabe menos' }
    },
    activity: {
      posicion: { name: 'Dónde está', detail: 'Dentro, fuera, encima, debajo.', instruction: 'Mira el dibujo y di dónde está la cosa. Dentro es por la parte de adentro. Fuera es por la parte de afuera. Encima es por arriba y debajo es por abajo.' },
      comparar: { name: 'Cuál es más', detail: 'Más largo, pesa más, cabe más.', instruction: 'Mira las dos cosas y piensa cómo son de verdad, no cómo están dibujadas. Las dos se dibujan del mismo tamaño a propósito.' }
    },
    level: {
      s1: 'Dentro o fuera',
      s2: 'Encima o debajo',
      s3: 'Izquierda o derecha',
      s4: 'Busca el dibujo',
      c1: 'Más largo o más corto',
      c2: 'Pesa más o pesa menos',
      c3: 'Cabe más o cabe menos'
    },
    gen: {
      where: {
        inOut: '¿Está {thing} dentro o fuera de la caja?',
        upDown: '¿Está {thing} encima o debajo de la silla?',
        leftRight: '¿Está {thing} a la izquierda o a la derecha del árbol?'
      },
      findWhere: '¿En qué dibujo está {thing} {phrase}?',
      whichIs: '¿Cuál {word}?',
      sceneAria: '{thing} está {phrase}.',
      compareAria: '{a} y {b}, dibujados del mismo tamaño.'
    },
    transfer: 'Esto te servirá para entender cuando te dicen dónde está algo, y para elegir qué llevas en cada mano cuando una bolsa pesa más que la otra.'
  }, 'es');
})();
