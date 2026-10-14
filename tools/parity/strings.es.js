/* ============================================================
   Calculia — Pares e impares: textos (ES)
   Archivo específico del idioma. Se carga condicionalmente
   desde index.html según App.i18n.locale().

   El prompt muestra el número ("¿5 es par o impar?") y los
   puntos forman la imagen. Las dos últimas palabras (evenLabel,
   oddLabel) son los textos de los dos botones — están aquí, en
   mayúsculas cortas, porque el interruptor es la respuesta.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🟦 Pares e impares',
    instruction: 'Mira los puntos: ¿sobra uno o van todos en parejas?',
    btnMenu: 'Volver al inicio',

    /* Tecla del menú raíz: la palabra "Pares e impares" que sale
       en la tarjeta de la portada y de dev/. Las claves <id>Detail
       no se usan aquí (la actividad no tiene sub-prácticas). */
    parityName: 'Pares e impares',
    parityDetail: 'Mira los puntos: ¿sobra uno o van todos en parejas?',

    /* ---------- Juego ----------
       El prompt lleva {a} = número de puntos que ve la persona.
       Los pares van en pairsWord ({a} 'parejas') y, si hay un
       punto sobrante, se suma oneLeftWord (', uno que sobra').
       Esa suma se usa también para el aria-label del cuadro de
       puntos. */
    parityPrompt: '¿{a} es par o impar?',
    evenLabel: 'Par',
    oddLabel: 'Impar',
    pairsWord: 'parejas',
    oneLeftWord: 'uno que sobra',
    hintParity: 'Empareja los puntos de dos en dos. Si sobra uno, es impar.',
    explainParity: 'Los {a} puntos van de dos en dos. Si no sobra ninguno, es par; si sobra uno, es impar.',

    parityFinalSummary: 'Has visto {count} números y los has clasificado. Ahora tienes {stars} estrellas.',
    parityTransfer: 'Saber qué números son pares y cuáles impares sirve para repartir en dos equipos, alternar turnos o cortar listas por la mitad.'
  }, 'es');
})();
