/* ============================================================
   Calculia — Pares e impares: textos (ES)
   Archivo específico del idioma. Se carga condicionalmente
   desde index.html según App.i18n.locale().

   Flujo en 4 pasos (mismo orden que el resto del catálogo):
     1. introScreen  — qué es par y qué es impar (dos montones
                       de puntos).
     2. realScreen   — ejemplos de la vida real (zapatos, huevos,
                       bailar en pareja, un dado).
     3. levelsScreen — cinco niveles, de lo visible a lo abstracto:
                       puntos, número escrito, números grandes
                       (última cifra), formas y números romanos.
     4. parityScreen — la práctica. Cada acierto publica su
                       explicación; cada fallo, una pista.

   Las claves de los niveles viven bajo levels.<id>.* y las de
   las formas bajo shapeName.<lados>. Mismas claves que
   strings.en.js.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🟦 Pares e impares',
    instruction: 'Mira los puntos: ¿sobra uno o van todos en parejas?',
    btnMenu: 'Volver al inicio',
    backLevels: '← Niveles',
    ruleTitle: 'Recuerda la regla',

    /* Tecla del menú raíz: la palabra "Pares e impares" que sale
       en la tarjeta de la portada y de dev/. */
    parityName: 'Pares e impares',
    parityDetail: 'Mira los puntos: ¿sobra uno o van todos en parejas?',

    /* ---------- Pantalla 1: qué es par y qué es impar ---------- */
    introTitle: '¿Qué es par y qué es impar?',
    introText: 'Un número es par si sus puntos van de dos en dos y no sobra ninguno. Si sobra uno, es impar.',
    introEvenCaption: 'Par: 4 puntos, dos parejas',
    introOddCaption: 'Impar: 5 puntos, sobra uno',
    introNext: 'Ver en la vida real →',

    /* ---------- Pantalla 2: la vida real ---------- */
    realTitle: 'En la vida real',
    realText: 'Fíjate: lo par va en parejas y lo impar deja uno suelto.',
    realNext: 'Elegir un nivel →',
    real: {
      0: {
        title: 'Zapatos',
        text: 'Van de dos en dos: un pie y el otro. Si tienes un zapato suelto, sobra uno.'
      },
      1: {
        title: 'Huevos',
        text: 'Una docena tiene 12 huevos: 6 parejas exactas. Si hay 7, uno se queda solo.'
      },
      2: {
        title: 'Bailar en pareja',
        text: 'Si el grupo es par, todos tienen pareja. Si es impar, siempre se queda uno sin pareja.'
      },
      3: {
        title: 'Un dado',
        text: 'En un dado, los números pares son el 2, el 4 y el 6. Los impares son el 1, el 3 y el 5.'
      }
    },

    /* ---------- Pantalla 3: niveles ---------- */
    levelsTitle: 'Elige un nivel',
    levelsText: 'Empieza por el 1 y sigue en orden.',
    levelsBack: '← Volver',
    levelDone: '✔ Hecho',
    levels: {
      dots: {
        name: 'Puntos',
        detail: 'Cuenta los puntos de dos en dos.',
        rule: 'Los puntos van de dos en dos. Si no sobra ninguno, es par. Si sobra uno, es impar.',
        hint: 'Empareja los puntos de dos en dos. Si sobra uno, es impar.'
      },
      numbers: {
        name: 'Números del 0 al 99',
        detail: 'Imagina los puntos y decide.',
        rule: 'Un número es par si se puede repartir en parejas sin que sobre nada. Si sobra uno, es impar.',
        hint: 'Imagina los puntos de dos en dos. ¿Sobra uno?'
      },
      big: {
        name: 'Números grandes',
        detail: 'No hace falta contar: mira la última cifra.',
        rule: 'Mira la última cifra: 0, 2, 4, 6 u 8 → par. 1, 3, 5, 7 o 9 → impar.',
        hint: 'Mira solo la última cifra.'
      },
      shapes: {
        name: 'Formas',
        detail: 'Cuenta los lados de cada dibujo.',
        rule: 'Cuenta los lados uno a uno. Si se agrupan de dos en dos y sobra uno, es impar.',
        hint: 'Cuenta los lados uno a uno, despacio.'
      },
      romans: {
        name: 'Números romanos',
        detail: 'Pásalos a cifras y decide.',
        rule: 'Pasa el número romano a cifras normales (XIV = 14) y mira la última cifra.',
        hint: 'Pásalo a cifras normales (XIV = 14) y mira la última cifra.'
      }
    },

    /* ---------- Pantalla 4: práctica ---------- */
    parityPrompt: '¿{a} es par o impar?',
    shapePrompt: 'Este dibujo, ¿tiene un número par o impar de lados?',
    shapeAria: 'Dibujo de un polígono',
    evenLabel: 'Par',
    oddLabel: 'Impar',
    wordEven: 'par',
    wordOdd: 'impar',
    pairsWord: 'parejas',
    oneLeftWord: 'uno que sobra',

    /* Explicaciones: se publican al acertar. Las pistas de cada
       nivel están en levels.<id>.hint. */
    explainParity: 'Los {a} puntos van de dos en dos. Si no sobra ninguno, es par; si sobra uno, es impar.',
    explainPairsEven: '{a} es par: de dos en dos no sobra ninguno.',
    explainPairsOdd: '{a} es impar: de dos en dos, sobra uno.',
    explainLast: 'La última cifra de {a} es {d}. Así que {a} es {p}.',
    explainShape: 'Es {name}: tiene {n} lados. {n} es {p}.',
    explainRoman: '{roman} vale {n}. {n} es {p}.',
    shapeName: {
      3: 'un triángulo',
      4: 'un cuadrado',
      5: 'un pentágono',
      6: 'un hexágono',
      7: 'un heptágono',
      8: 'un octógono'
    },

    /* ---------- Cierre ---------- */
    parityFinalSummary: 'Nivel «{level}» terminado: {count} preguntas. Ya tienes {stars} estrellas.',
    parityTransfer: 'Saber qué números son pares y cuáles impares sirve para repartir en dos equipos, alternar turnos o cortar listas por la mitad.'
  }, 'es');
})();
