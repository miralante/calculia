/* ============================================================
   Calculia — Pares e impares: datos.

   Una idea que se repite: un número es par si sus puntos van
   de dos en dos y no sobra ninguno; es impar si sobra uno.

   El test tiene tres partes, en este orden, y cada una enseña
   un paso más:

     1. dots    — puntos a la vista: se agrupan de dos en dos (0..24).
     2. numbers — el mismo criterio con el número escrito, sin dibujo
                  (0..99).
     3. big     — números grandes: no hace falta contar, basta con
                  mirar la última cifra (100..9999).

   Dentro de cada parte los valores no se repiten. Las formas y los
   números romanos son de sus propias actividades, no de esta.
   ============================================================ */

var DATA = {
  /* Colours of the dots. The first colour paints every pair; the
     leftover ball (if any) paints in the second colour, so even
     numbers only ever show the first colour. */
  pairColor: '#1565C0',
  leftoverColor: '#E65100',

  /* Ejemplos de la vida real (pantalla 2), en orden. Cada id dibuja
     el número que dice su texto: dos zapatos, una docena de huevos
     (pares), un triciclo y un trébol (impares, con una pieza sola
     en el color de sobrante). El texto vive en strings.<locale>.js
     bajo real.<índice>. */
  examples: ['shoes', 'eggs', 'trike', 'clover'],

  /* Partes del test. count = preguntas de la parte; min/max = rango
     de valores. Las partes se hacen en el orden de esta lista. */
  blocks: [
    { id: 'dots',    kind: 'dots', count: 4, min: 0,   max: 24 },
    { id: 'numbers', kind: 'text', count: 3, min: 0,   max: 99 },
    { id: 'big',     kind: 'text', count: 3, min: 100, max: 9999 }
  ]
};
