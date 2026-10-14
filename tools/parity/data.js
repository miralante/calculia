/* ============================================================
   Calculia — Pares e impares: datos.

   Una sola mecánica: el número se pinta como una columna de
   puntos y la persona decide si sobra uno (impar) o si todos
   van de dos en dos (par). Para hacer la respuesta visible —
   no sólo aritmética — cada par se pinta de un color y el
   posible punto sobrante va en otro color (mod-racional y
   color-foco, los dos tokens del módulo).

   El rango 0..24 está pensado para contar de un vistazo: a
   partir de 25 la rejilla se ve apretada en 360px y la paridad
   deja de ser lo importante. La mezcla alterna pares e impares
   para que el usuario no pueda caer en "siempre par" como
   atajo.

   Antes esta actividad vivía dentro de Cantidades (tools/
   quantities/data.js). En 2026-10 pasó a ser su propia
   herramienta al nivel superior de la suite.
   ============================================================ */

var DATA = {
  /* Dot count: random from 0 to max. */
  max: 24,
  /* Items per round. Más alto que las prácticas de tres opciones
     porque cada acierto consume el par de botones — diez items
     son la ronda corta que se siente "una cantidad" sin
     convertirse en tarea. */
  perRound: 10,
  /* First colour paints every pair. The leftover dot (if any)
     paints in the second colour, so even numbers only ever
     show the first colour. */
  pairColor: '#1565C0',
  leftoverColor: '#E65100'
};
