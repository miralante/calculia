/* ============================================================
   Calculia — Pares e impares: textos (ES)
   Archivo específico del idioma. Se carga condicionalmente
   desde index.html según App.i18n.locale().

   Flujo en 3 pasos, como en Formas:
     1. introScreen  — qué es par y qué es impar, con los números
                       del 0 al 10 y sus bolas en parejas.
     2. realScreen   — ejemplos de la vida real (zapatos, huevos,
                       triciclo, trébol), con el número dibujado.
     3. parityScreen — un único test, «Empezar a practicar», que
                       mezcla puntos, números, última cifra, formas
                       y números romanos. Cada acierto publica su
                       explicación; cada fallo, una pista.

   Las claves de cada tipo de pregunta viven bajo levels.<id>.* y
   las de las formas bajo shapeName.<lados>. Mismas claves que
   strings.en.js.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🟦 Pares e impares',
    instruction: 'Mira los puntos: ¿sobra uno o van todos en parejas?',
    btnMenu: 'Volver al inicio',
    ruleTitle: 'Recuerda la regla',

    /* Tecla del menú raíz: la palabra "Pares e impares" que sale
       en la tarjeta de la portada y de dev/. */
    parityName: 'Pares e impares',
    parityDetail: 'Mira los puntos: ¿sobra uno o van todos en parejas?',

    /* ---------- Pantalla 1: qué es par y qué es impar ---------- */
    introTitle: '¿Qué es par y qué es impar?',
    introText: 'Un número es par si sus puntos van de dos en dos y no sobra ninguno. Si sobra uno, es impar.',
    introSeqCaption: 'Fíjate: las bolas van de dos en dos, una encima de otra. Si una se queda sola, el número es impar.',
    introNext: 'Ver en la vida real →',

    /* ---------- Pantalla 2: la vida real ---------- */
    realTitle: 'En la vida real',
    realText: 'Fíjate: lo par va en parejas y lo impar deja uno suelto.',
    realNext: 'Empezar a practicar →',
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
        title: 'Triciclo',
        text: 'Dos ruedas detrás, en pareja, y una delante que va sola. Tres ruedas: impar.'
      },
      3: {
        title: 'Trébol',
        text: 'Dos hojas abajo, en pareja, y una arriba que se queda sola. Tres hojas: impar.'
      }
    },

    /* ---------- Pantalla 3: el test ----------
       Cada tipo de pregunta tiene su regla (levels.<id>.rule, en el
       recuadro «Recuerda la regla») y su pista (levels.<id>.hint). */
    levels: {
      dots: {
        rule: 'Los puntos van de dos en dos. Si no sobra ninguno, es par. Si sobra uno, es impar.',
        hint: 'Empareja los puntos de dos en dos. Si sobra uno, es impar.'
      },
      numbers: {
        rule: 'Un número es par si se puede repartir en parejas sin que sobre nada. Si sobra uno, es impar.',
        hint: 'Imagina los puntos de dos en dos. ¿Sobra uno?'
      },
      big: {
        rule: 'Mira la última cifra: 0, 2, 4, 6 u 8 → par. 1, 3, 5, 7 o 9 → impar.',
        hint: 'Mira solo la última cifra.'
      },
      shapes: {
        rule: 'Cuenta los lados uno a uno. Si se agrupan de dos en dos y sobra uno, es impar.',
        hint: 'Cuenta los lados uno a uno, despacio.'
      },
      romans: {
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
    parityFinalSummary: 'Has terminado {count} preguntas. Ya tienes {stars} estrellas.',
    parityTransfer: 'Saber qué números son pares y cuáles impares sirve para repartir en dos equipos, alternar turnos o cortar listas por la mitad.'
  }, 'es');
})();
