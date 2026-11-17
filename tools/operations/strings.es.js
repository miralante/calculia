/* ============================================================
   Calculia — Textos de Cuentas grandes (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   Los números NO están aquí: viven una sola vez en data.js, y los
   resultados se calculan en app.js.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➗ Cuentas rápidas',
    instructionMenu: 'Elige qué quieres practicar.',
    btnMenu: 'Volver al inicio',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} {starsWord}.',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 «{elegida}» no es la respuesta. Piensa con calma y mira otra vez la pregunta.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    activity: {
      consigno: { name: 'Con signo', detail: 'Cuando hay negativos.', instruction: 'Cuando hay números negativos no hace falta aprenderse ninguna regla. Busca en la recta dónde empiezas y anda los pasos que te dicen: hacia la derecha si subes y hacia la izquierda si bajas. Donde llegas es la respuesta.' },
      voltear: { name: 'Dar la vuelta', detail: 'El orden no cambia nada.', instruction: 'En una multiplicación da igual el orden: 3 por 4 y 4 por 3 son la misma cantidad de puntos, puestos de otra manera. Si te sabes una, ya te sabes la otra.' },
      partir: { name: 'Partir la cuenta', detail: 'Dos trozos fáciles.', instruction: 'Una multiplicación difícil se parte en dos fáciles. 6 por 7 son 6 por 5 y 6 por 2. Haces los dos trozos y los juntas.' },
      repartir: { name: 'Repartir', detail: 'Cuánto toca y cuántos grupos.', instruction: 'Dividir se dice de dos maneras. Una: repartir entre varios y ver cuánto le toca a cada uno. Otra: hacer grupos de un tamaño y ver cuántos grupos salen.' },
      orden: { name: 'Qué va primero', detail: 'Multiplicar y los paréntesis.', instruction: 'Cuando hay dos operaciones, la multiplicación se hace antes que la suma. Pero si hay paréntesis, lo de dentro del paréntesis va primero. Los paréntesis mandan.' },
      placevalue: { name: 'Cuentas rápidas', detail: '10 pequeños se cambian por 1 grande.', instruction: 'Cuando juntas 10 iguales, forman 1 del grupo siguiente. La cifra se mueve una posición a la izquierda.' }
    },
    /* Explicación y vida real de «placevalue» (hasExpoReal): la pantalla
       es la misma que usan las demás sub-actividades con explicación. */
    expo: {
      placevalue: {
        title: 'Cuentas rápidas',
        intro: '10 unidades forman 1 decena. 10 decenas forman 1 centena. 10 centenas forman 1 millar. Y así sigue.',
        bullets: [
          '10 × 1 = 1 decena (10)',
          '10 × 10 = 1 centena (100)',
          '10 × 100 = 1 millar (1.000)'
        ],
        note: 'Multiplicar por 10 mueve la cifra un lugar a la izquierda y añade un cero.'
      }
    },
    real: {
      placevalue: {
        title: 'Los cambios de 10 en tu día',
        items: [
          { icon: '🥚', text: '10 huevos sueltos forman 1 docena.' },
          { icon: '✏️', text: '10 lápices sueltos forman 1 paquete.' },
          { icon: '💶', text: '10 monedas de 10 céntimos = 1 euro.' },
          { icon: '⏱️', text: '10 años = 1 década. 10 décadas = 1 siglo (100 años).' }
        ]
      }
    },
    expoNext: 'Ver ejemplos de la vida real →',
    expoSlideNext: 'Siguiente →',
    expoBack: '← Anterior',
    expoProgress: '{n} / {total}',
    realBack: '← Volver a la explicación',
    realNext: 'Empezar a practicar →',
    /* Leyenda de colores de las cifras (unidades, decenas, centenas) y
       nombres de los grupos de miles, para «Cuentas rápidas». */
    leyendaUnidadesTxt: 'unidades',
    leyendaDecenasTxt: 'decenas',
    leyendaCentenasTxt: 'centenas',
    grupoEtq: { 0: '', 1: 'miles', 2: 'millones', 3: 'mil millones', 4: 'billones' },
    level: {
    },
    gen: {
      walkUp: 'Estás en el {from}. Subes {step}. ¿A dónde llegas?',
      walkDown: 'Estás en el {from}. Bajas {step}. ¿A dónde llegas?',
      walkHint: 'Empieza donde está la chincheta y cuenta los pasos por la recta.',
      lineAria: 'Una recta de números con el {from} señalado y un salto de {step}.',
      commute: 'Si {first} = {total}, ¿cuánto es {second}?',
      commuteHint: 'Son los mismos puntos, girados.',
      commuteAria: 'Dos grupos de puntos: uno de {a} filas de {b}, y otro de {b} filas de {a}.',
      howMuch: '¿Cuánto es {op}?',
      splitHint: 'Un trozo son {left} y el otro son {right}. Júntalos.',
      splitAria: 'Una multiplicación de {a} por {b}, partida en {a} por {cut} y {a} por {rest}.',
      splitTensAria: 'El número {a} partido en {tens} y {units}.',
      share: 'Repartes {total} entre {groups}. ¿Cuántos le tocan a cada uno?',
      shareHint: 'Cuenta los puntos de un solo montón.',
      shareAria: '{groups} montones con {each} puntos cada uno.',
      groups: 'Tienes {total}. Haces grupos de {size}. ¿Cuántos grupos salen?',
      groupsHint: 'Cuenta los montones, no los puntos.',
      groupsAria: '{count} montones de {size} puntos.',
      whatFirst: '¿Qué se hace primero?',
      timesFirstHint: 'Sin paréntesis, la multiplicación va antes que la suma.',
      parensHint: 'Lo que está dentro del paréntesis va primero.',
      /* Pista socrática: una por tipo de pregunta. La frase genérica
         («Prueba otra vez. Mira el dibujo y cuenta con calma») era la
         misma para todas, así que no decía nada. Estas dan la estrategia
         —qué mirar en el dibujo de esta pregunta— y nunca la respuesta. */
      socraticWalk: '🤔 «{elegida}» no sale de contar bien los pasos: empieza en la chincheta, no en el cero, y cuenta los pasos.',
      socraticCommute: '🤔 «{elegida}» no es el mismo total: cuenta los puntos del rectángulo que está en blanco, son los mismos.',
      socraticSplit: '🤔 «{elegida}» no junta bien los dos trozos: ya están calculados, mira sus números y júntalos.',
      socraticSplitTens: '🤔 «{elegida}» no respeta cómo se ha partido el número: mira las decenas y las unidades en que se ha partido.',
      socraticShare: '🤔 «{elegida}» no es lo que hay en cada montón: fíjate en un solo montón y cuenta los puntos que tiene.',
      socraticGroups: '🤔 «{elegida}» cuenta puntos y no montones: lo que se pregunta es cuántos montones hay, cuéntalos a ellos.',
      socraticWhatFirst: '🤔 «{elegida}» no empieza por donde toca: mira primero si hay paréntesis, y si los hay, mandan ellos.',
      socraticOrderResult: '🤔 «{elegida}» hace las cuentas en otro orden: haz primero lo de dentro del paréntesis o la multiplicación, y luego suma.',
      /* «Cuentas rápidas» de los números: textos de canje y de la escalera del ×10. */
      canjeDirecto0: 'Con {n} unidades, ¿cuántas decenas formas?',
      canjeDirecto1: 'Con {n} decenas, ¿cuántas centenas formas?',
      canjeDirecto2: 'Con {n} centenas, ¿cuántos miles formas?',
      canjePista0: '10 unidades forman 1 decena.',
      canjePista1: '10 decenas forman 1 centena.',
      canjePista2: '10 centenas forman 1 millar: 1.000.',
      canjeAriaDirecto: '{k} grupos de 10 bloques',
      canjeInverso0: '{k} decenas. ¿Cuántas unidades son?',
      canjeInverso1: '{k} centenas. ¿Cuántas decenas son?',
      canjeInverso2: '{k} miles. ¿Cuántas centenas son?',
      canjeAriaInverso: '{k} bloques grandes',
      escaleraEnunciado: '¿Cuánto es 10 × este número?',
      escaleraPista: 'Por 10: cada cifra se mueve un sitio a la izquierda y se añade un cero.',
      socraticTradeUp: '🤔 «{elegida}» no es el número de grupos. Mira los bloques y agrúpalos de diez en diez: cuenta los grupos.',
      socraticTradeDown: '🤔 «{elegida}» no es cuántos bloques pequeños entran. Mira cada bloque grande y cuenta cuántos pequeños caben dentro.',
      socraticLadder: '🤔 «{elegida}» no tiene los ceros que toca. Mira el número: es un uno seguido de ceros, cuenta cuántos hay.'
    },
    transfer: 'Esto te servirá para hacer cuentas grandes de cabeza partiéndolas en trozos, y para repartir cosas entre varias personas sin que sobre ni falte.'
  }, 'es');
})();
