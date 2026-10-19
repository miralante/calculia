/* ============================================================
   Calculia — Pares e impares: datos.

   Una idea que se repite: un número es par si sus puntos van
   de dos en dos y no sobra ninguno; es impar si sobra uno.

   Hay un único test, "Empezar a practicar", con perRound
   preguntas. Cada pregunta elige al azar uno de estos tipos
   (levels) y un valor dentro de su rango:

     dots    — se cuentan puntos a la vista (0..24).
     numbers — el mismo criterio, con el número escrito (0..99).
     big     — números grandes: basta con mirar la última cifra
               (100..9999).
     shapes  — formas: contar los lados de un polígono (3..8).
     romans  — números romanos: pasarlos a cifras y decidir (1..20).

   kind decide cómo se pinta la pregunta:
     dots  → columna de puntos (parejas y el punto sobrante)
     text  → sólo el número en el enunciado
     shape → dibujo de un polígono con n lados
     roman → sólo el número romano en el enunciado

   Dentro de cada tipo los valores no se repiten en la misma
   ronda; los tipos se mezclan, así que pares e impares pueden
   salir en cualquier orden, sin patrón que memorizar.
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

  /* Preguntas en el test único. */
  perRound: 10,

  /* Tipos de pregunta. min/max es el rango de valores de cada tipo. */
  levels: [
    { id: 'dots',    kind: 'dots',  min: 0,   max: 24 },
    { id: 'numbers', kind: 'text',  min: 0,   max: 99 },
    { id: 'big',     kind: 'text',  min: 100, max: 9999 },
    { id: 'shapes',  kind: 'shape', min: 3,   max: 8 },
    { id: 'romans',  kind: 'roman', min: 1,   max: 20 }
  ]
};
