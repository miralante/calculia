/* ============================================================
   Calculia — Sube la escalera: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🪜 Sube la escalera',
    menuTitle: 'Sube la escalera',
    menuDetail: 'Hay números positivos, negativos y decimales. Cada respuesta acertada te sube un peldaño. No hay prisa: tú marcas el ritmo.',
    btnStart: 'Empezar',
    transfer: 'Ordenar números de todo tipo te sirve para leer un termómetro, comparar precios y encontrar la puntuación más alta.',

    game: {
      ladderAria: 'Peldaños de la escalera',
      streak: 'Racha: {n}',
      next: 'Siguiente peldaño →',
      summaryTitle: '¡Has llegado arriba!',
      summaryText: 'Has acertado {n} de {total} a la primera.',
      endBack: 'Volver al inicio'
    },

    /* Questions. Every type and every sign appears here, so the same
       texts serve the positive, negative and decimal steps. */
    q: {
      promptSmallest: '¿Cuál es el número más pequeño?',
      promptLargest: '¿Cuál es el número más grande?',
      promptOrder: '¿Qué fila va de menor a mayor?',
      promptBetween: '¿Cuál de estos números va entre {a} y {b}?',
      promptMissing: '¿Qué número falta en la fila?',
      rowAria: 'Fila de números: {row}. Falta el número del hueco.',
      hintSmallest: 'Si hay negativos, el más pequeño es el que está más lejos del cero. Si son todos positivos, mira primero la parte entera y después las décimas.',
      hintSmallestNeg: 'Todos son negativos. El que está más lejos del cero es el más pequeño.',
      hintLargest: 'Si hay negativos, el más grande es el que está más cerca del cero. Si son todos positivos, mira primero la parte entera y después las décimas.',
      hintLargestNeg: 'Todos son negativos. El que está más cerca del cero es el más grande.',
      hintOrder: 'Busca primero el más pequeño: los negativos van antes que el cero, y el cero antes que los positivos.',
      hintOrderNeg: 'Todos son negativos. El que está más lejos del cero va primero.',
      hintBetween: 'Busca el número que es más grande que {a} y más pequeño que {b}.',
      hintMissing: 'Mira el número de la izquierda y el de la derecha del hueco. ¿Cuál cabe entre los dos?',
      explainSmallest: '{v} es el más pequeño.',
      explainSmallestNeg: '{v} es el más pequeño: está más lejos del cero.',
      explainLargest: '{v} es el más grande.',
      explainLargestNeg: '{v} es el más grande: está más cerca del cero.',
      explainOrder: 'De menor a mayor: {list}.',
      explainBetween: '{v} está entre {a} y {b}.',
      explainMissing: 'Va {v}. La fila, de menor a mayor: {list}.'
    }
  }, 'es');
})();
