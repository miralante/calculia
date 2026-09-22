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
    title: '➗ Cuentas grandes',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Una cuenta grande no es una cuenta difícil: es una cuenta pequeña hecha dos veces.',
    explicacion: '✅ Aquí no hay que aprenderse ninguna cuenta nueva. Solo partirla en trozos que ya sabes.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 Prueba otra vez. Mira el dibujo y cuenta con calma.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    activity: {
      consigno: { name: 'Con signo', detail: 'Cuando hay negativos.', instruction: 'Cuando hay números negativos no hace falta aprenderse ninguna regla. Busca en la recta dónde empiezas y anda los pasos que te dicen: hacia la derecha si subes y hacia la izquierda si bajas. Donde llegas es la respuesta.' },
      voltear: { name: 'Dar la vuelta', detail: 'El orden no cambia nada.', instruction: 'En una multiplicación da igual el orden: 3 por 4 y 4 por 3 son la misma cantidad de puntos, puestos de otra manera. Si te sabes una, ya te sabes la otra.' },
      partir: { name: 'Partir la cuenta', detail: 'Dos trozos fáciles.', instruction: 'Una multiplicación difícil se parte en dos fáciles. 6 por 7 son 6 por 5 y 6 por 2. Haces los dos trozos y los juntas.' },
      repartir: { name: 'Repartir', detail: 'Cuánto toca y cuántos grupos.', instruction: 'Dividir se dice de dos maneras. Una: repartir entre varios y ver cuánto le toca a cada uno. Otra: hacer grupos de un tamaño y ver cuántos grupos salen.' },
      orden: { name: 'Qué va primero', detail: 'Multiplicar y los paréntesis.', instruction: 'Cuando hay dos operaciones, la multiplicación se hace antes que la suma. Pero si hay paréntesis, lo de dentro del paréntesis va primero. Los paréntesis mandan.' }
    },
    level: {
      g1: 'Subir desde un negativo',
      g2: 'Bajar hasta un negativo',
      v1: 'Dar la vuelta',
      d1: 'Partir por cinco',
      d2: 'Partir por las decenas',
      r1: 'Cuánto le toca a cada uno',
      r2: 'Cuántos grupos salen',
      o1: '¿Qué se hace primero?',
      o2: '¿Cuánto es?'
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
      parensHint: 'Lo que está dentro del paréntesis va primero.'
    },
    transfer: 'Esto te servirá para hacer cuentas grandes de cabeza partiéndolas en trozos, y para repartir cosas entre varias personas sin que sobre ni falte.'
  }, 'es');
})();
