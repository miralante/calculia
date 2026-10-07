/* ============================================================
   Calculia — Números ordinales.

   Qué es y de dónde viene
   ------------------------
   Los ordinales YA EXISTÍAN en este proyecto como sub-actividad de
   Los Números (`ordinales`, niveles `o1`-`o3`). Esta actividad toma
   esa idea —una fila con bandera y animales, la bandera marca por
   dónde empieza la cuenta— y le aplica la metodología de
   Números Romanos: pantallas de presentación, ejemplos de la vida
   real, recordatorio con las reglas y pasos encadenados que cambian
   una sola variable cada vez.

   Lo que se conserva de `numbers` porque ya estaba probado:
     - la fila de animales (sin género ni tono de piel que elegir, y
       en español el ordinal concuerda con "lugar", así que no hay
       que seguir además el género gramatical),
     - la bandera 🏁 al frente, que es lo que hace que "primero" no
       dependa de adivinar por qué extremo se cuenta,
     - las opciones equivocadas VECINAS (target±1, target±2), porque
       el error real aquí no es un número cualquiera equivocado: es
       contar desde el otro extremo o empezar por cero.

   Qué cambia respecto a `numbers`:
     - deja de ser una pantalla más dentro de otra actividad y pasa
       a tener las suyas cuatro, como Romanos,
     - los ordinales llegan hasta el décimo, no solo hasta el quinto,
       porque los pisos y las veces de algo llegan bastante más allá
       de cinco y "quinto" no era el final del mundo real,
     - se enseñan dos reglas que la fila por sí sola no explica.

   Estructura de datos
   ------------------
   DATA.ordinals — un ordinal por fila. 'n' es su número, 'cls' la
   clase de color. Las palabras viven en strings.<locale>.js como
   'ord.<n>Name' (primero), 'ord.<n>Place' (primer lugar) y
   'ord.<n>Caption' (una frase fácil).

   No hay forma abreviada con el signo de grado superíndice, y es
   deliberado: check.js (comprobación 6.1) prohíbe por substring las
   seis primeras abreviaturas de ordinal en todo lo que se sirve al
   navegador, porque son indistinguibles de la marca de curso
   escolar, y el escaneo es sobre el contenido crudo del fichero
   (comentarios incluidos). La cifra hace el mismo trabajo: la
   persona ve "3" y "tercero" juntos, que es justo la correspondencia
   que hay que aprender.

   El color recorre 5 valores y se repite del sexto al décimo. Es
   deliberado y no es un descuido: el color aquí no identifica al
   ordinal —eso lo hacen la cifra y la palabra, que siempre están
   escritas al lado—, sino que ayuda a seguir la serie. Los cinco
   primeros coinciden con el rango de la fila (o1-o3), que es el que
   la persona ve más a menudo.

   DATA.famous — situaciones reales para la pantalla de ejemplos.
   'factKey' apunta a 'famous.<factKey>'; las frases terminan en ':'
   porque app.js añade detrás la cuenta con color.

   DATA.scenes — la misma idea como apoyo bajo el enunciado del
   juego: "tercero" no es solo una palabra, es el piso en el que
   vive alguien o el puesto que quedó en una carrera.

   DATA.levels — dos grupos visibles que encadenan sus sub-niveles
   sin volver al menú (regla 13, un cambio de variable cada vez):

     - 'learn' : leer el lugar en la fila.
         paso 1 → 2 cambia SÓLO el largo de la fila (3 → 5);
         paso 2 → 3 cambia SÓLO el sentido de la pregunta
         (señala un lugar y nombralo → nombra un lugar y busca
         quién está ahí).
     - 'apply' : usar el ordinal fuera de la fila.
         paso 4 → 5 cambia SÓLO el sentido (ordinal → cifra,
         cifra → ordinal), con el rango 1..10.
     - 'test'  : mezcla de los cinco modos, en orden aleatorio.

   Los cuatro modos base:

     - positionToName : la flecha señala a alguien → ¿qué lugar es?
     - nameToMember   : se nombra un lugar → ¿quién está ahí?
     - ordinalToDigit : "tercero" → 3
     - digitToOrdinal : 4 → "cuarto"

   El largo de la fila NO es un modo: es el campo 'items' del
   sub-nivel, y por eso el paso 1 → 2 puede cambiarlo sin tocar
   nada más.

   La fila tiene un tope de 5 en los pasos de la fila y 3 en el
   primero: a 375px de ancho, seis animales de 44px más separaciones
   ya no caben y empezarían a salirse. El rango 1..10 se practica
   en los pasos de texto, donde no hay que dibujar a nadie.
   ============================================================ */

var ORDINALS = [
  { n: 1, cls: 'ord-c1' },
  { n: 2, cls: 'ord-c2' },
  { n: 3, cls: 'ord-c3' },
  { n: 4, cls: 'ord-c4' },
  { n: 5, cls: 'ord-c5' },
  { n: 6, cls: 'ord-c1' },
  { n: 7, cls: 'ord-c2' },
  { n: 8, cls: 'ord-c3' },
  { n: 9, cls: 'ord-c4' },
  { n: 10, cls: 'ord-c5' }
];

/* Quién se coloca en la fila. Emoji, así que la lista no necesita
   separarse por idioma (mismo criterio que la serie de patrones en
   tools/patterns/). Animales y no personas: no hay género ni tono de
   piel que elegir, y en español el ordinal concuerda con "lugar",
   así que la palabra no carga además con el género gramatical. */
var QUEUE_MEMBERS = ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐯'];

function ordinalByN(n) {
  var found = ORDINALS.filter(function (o) { return o.n === n; })[0];
  return found || ORDINALS[0];
}

var DATA = {
  /* Cuántos ítems tiene una ronda. Más corta que la de Cantidades
     porque aquí cada ronda enseña una regla y hay tres pantallas
     antes: una ronda larga escondería el mensaje final. */
  perRound: 5,
  maxQueue: 5,
  ordinals: ORDINALS,
  queueMembers: QUEUE_MEMBERS,

  /* Orden del carrusel y de la tabla del recordatorio: del primero
     al décimo, en orden. Un ordinal suelto no significa nada; la
     serie sí. */
  carousel: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

  /* Ejemplos de la vida real para la pantalla 2. */
  famous: [
    { n: 1, factKey: 'primeraCita' },
    { n: 2, factKey: 'segundaVez' },
    { n: 3, factKey: 'tercerPiso' },
    { n: 4, factKey: 'cuartoLugar' },
    { n: 5, factKey: 'quintoPiso' }
  ],

  /* Situaciones de apoyo en el juego, para que el ordinal nombre
     algo y no sea una palabra suelta. */
  scenes: [
    { id: 'cita', n: 1 },
    { id: 'repetir', n: 2 },
    { id: 'piso', n: 3 },
    { id: 'carrera', n: 4 },
    { id: 'turno', n: 5 },
    { id: 'entrega', n: 1 },
    { id: 'visita', n: 2 },
    { id: 'escalera', n: 3 },
    { id: 'clasificacion', n: 4 },
    { id: 'puesto', n: 5 }
  ],

  levels: [
    {
      id: 'learn', pool: 'group', icon: '📚',
      sublevels: [
        { id: 'l1', group: 'learn', mode: 'positionToName', items: 3, stars: 1 },
        { id: 'l2', group: 'learn', mode: 'positionToName', items: 5, stars: 2 },
        { id: 'l3', group: 'learn', mode: 'nameToMember', items: 5, stars: 2 }
      ]
    },
    {
      id: 'apply', pool: 'group', icon: '🧩',
      sublevels: [
        { id: 'l4', group: 'apply', mode: 'ordinalToDigit', min: 1, max: 10, stars: 2 },
        { id: 'l5', group: 'apply', mode: 'digitToOrdinal', min: 1, max: 10, stars: 3 }
      ]
    },
    { id: 'test', pool: 'random', mode: 'random', icon: '🎲', stars: 2 }
  ]
};