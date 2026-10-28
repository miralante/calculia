/* ============================================================
   Calculia — Pares e impares: textos (ES)
   Archivo específico del idioma. Se carga condicionalmente
   desde index.html según App.i18n.locale().

   Flujo en 3 pasos, como en Formas:
     1. introScreen  — qué es par y qué es impar, con los números
                       del 0 al 10 y sus bolas en parejas.
     2. realScreen   — ejemplos de la vida real (zapatos, huevos,
                       triciclo, trébol), con el número dibujado.
     3. parityScreen — un único test, «Empezar a practicar», en tres
                       partes: puntos, números del 0 al 99 y números
                       grandes por su última cifra. Cada acierto
                       publica su explicación; cada fallo, una pista.

   Las claves de cada parte viven bajo blocks.<id>.*. Mismas claves
   que strings.en.js.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🟦 Pares e impares',
    instruction: 'Mira los puntos: ¿sobra uno o van todos en parejas?',
    btnMenu: 'Volver al inicio',
    /* Recordatorio antes del test, y ayuda «abre aquí» en las preguntas
       de números sin bolas. */
    ruleOpen: 'Abre aquí para ver la regla',
    ruleLastDigit: 'Si termina en 0, 2, 4, 6 u 8: par. Si termina en 1, 3, 5, 7 o 9: impar.',
    reminderTitle: 'Recuerda la regla',
    reminderPairs: 'Si sus puntos van de dos en dos y no sobra ninguno, es par. Si sobra uno, es impar.',
    reminderLastDigit: 'Mira la última cifra:',
    reminderExample: 'Ejemplo: 18 termina en 8, así que es par. 27 termina en 7, así que es impar.',
    reminderNext: 'Empezar a practicar →',

    /* Tecla del menú raíz: la palabra "Pares e impares" que sale
       en la tarjeta de la portada y de dev/. */
    parityName: 'Pares e impares',
    parityDetail: 'Mira los puntos: ¿sobra uno o van todos en parejas?',

    /* ---------- Pantalla 1: qué es par y qué es impar ---------- */
    introTitle: '¿Qué es par y qué es impar?',
    introText: 'Un número es par si sus puntos van de dos en dos y no sobra ninguno. Si sobra uno, es impar.',
    /* Pies de las diapositivas del 0 al 10. {p} = par o impar. */
    seqZero: 'Ninguna bola: es {p}.',
    zeroLabel: '0 = par',
    seqEven: '{n} bolas, todas en parejas: es {p}.',
    seqOne: 'Una bola, y se queda sola: es {p}.',
    seqOdd: '{n} bolas: una se queda sola y las demás van en parejas: es {p}.',
    introNext: 'Ver en la vida real →',

    /* ---------- Pantalla 2: la vida real ---------- */
    realTitle: 'En la vida real',
    realText: 'Fíjate: lo par va en parejas y lo impar deja uno suelto.',
    realNext: 'Ver la regla →',
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

    /* ---------- Pantalla 3: el test, en tres partes ----------
       Cada parte tiene su nombre (label), su regla (rule, en el
       recuadro «Recuerda la regla») y su pista (hint). */
    blocks: {
      dots: {
        label: 'Parte 1: puntos',
        rule: 'Los puntos van de dos en dos. Si no sobra ninguno, es par. Si sobra uno, es impar.',
        hint: '«{elegida}» no es la respuesta: empareja los puntos de dos en dos. Si sobra uno, es impar.'
      },
      numbers: {
        label: 'Parte 2: números del 0 al 99',
        rule: 'Un número es par si se puede repartir en parejas sin que sobre nada. Si sobra uno, es impar.',
        hint: '«{elegida}» no es la respuesta: imagina los puntos de dos en dos. ¿Sobra uno?'
      },
      big: {
        label: 'Parte 3: números grandes',
        rule: 'Mira la última cifra: 0, 2, 4, 6 u 8 → par. 1, 3, 5, 7 o 9 → impar.',
        hint: '«{elegida}» no es la respuesta: mira solo la última cifra.'
      }
    },

    /* ---------- Pantalla 3: textos de las preguntas ---------- */
    parityPrompt: '¿{a} es par o impar?',
    evenLabel: 'Par',
    oddLabel: 'Impar',
    wordEven: 'par',
    wordOdd: 'impar',
    pairsWord: 'parejas',
    oneLeftWord: 'uno que sobra',

    /* Explicaciones: se publican al acertar. Las pistas de cada parte
       están en blocks.<id>.hint. */
    explainParity: 'Los {a} puntos van de dos en dos. Si no sobra ninguno, es par; si sobra uno, es impar.',
    explainPairsEven: '{a} es par: de dos en dos no sobra ninguno.',
    explainPairsOdd: '{a} es impar: de dos en dos, sobra uno.',
    explainLast: 'La última cifra de {a} es {d}. Así que {a} es {p}.',

    /* ---------- Cierre ---------- */
    parityFinalSummary: 'Has terminado {count} preguntas. Ya tienes {stars} estrellas.',
    parityTransfer: 'Saber qué números son pares y cuáles impares sirve para repartir en dos equipos, alternar turnos o cortar listas por la mitad.'
  }, 'es');
})();
