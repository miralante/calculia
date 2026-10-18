/* ============================================================
   Calculia — Pares e impares: datos.

   Una idea que se repite: un número es par si sus puntos van
   de dos en dos y no sobra ninguno; es impar si sobra uno. La
   actividad sube de dificultad por niveles, en este orden:

     1. dots     — se cuentan puntos a la vista (0..24).
     2. numbers  — el mismo criterio, pero con el número escrito
                   y sin dibujo (0..99).
     3. big      — números grandes: no hace falta contar, basta
                   con mirar la última cifra (100..9999).
     4. shapes   — formas: contar los lados de un polígono.
     5. romans   — números romanos: pasarlos a cifras y decidir.

   kind decide cómo se pinta la pregunta:
     dots  → columna de puntos (parejas y el punto sobrante)
     text  → sólo el número en el enunciado
     shape → dibujo de un polígono con n lados
     roman → sólo el número romano en el enunciado

   Cada nivel se practica en una ronda corta de perRound items.
   Los números se eligen al azar dentro del rango del nivel, sin
   repetir ninguno en la misma ronda: pares e impares pueden salir
   en cualquier orden, sin patrón que memorizar.
   ============================================================ */

var DATA = {
  /* Colours of the dots level. The first colour paints every
     pair; the leftover dot (if any) paints in the second colour,
     so even numbers only ever show the first colour. */
  pairColor: '#1565C0',
  leftoverColor: '#E65100',

  /* Ejemplos de la vida real (pantalla 2). El texto vive en
     strings.<locale>.js bajo real.<índice>. */
  examples: ['👟', '🥚', '💃', '🎲'],

  levels: [
    { id: 'dots',    kind: 'dots',  min: 0,   max: 24,   perRound: 10 },
    { id: 'numbers', kind: 'text',  min: 0,   max: 99,   perRound: 10 },
    { id: 'big',     kind: 'text',  min: 100, max: 9999, perRound: 10 },
    { id: 'shapes',  kind: 'shape', min: 3,   max: 8,    perRound: 6 },
    { id: 'romans',  kind: 'roman', min: 1,   max: 20,   perRound: 10 }
  ]
};
