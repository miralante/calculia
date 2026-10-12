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
   'ord.<n>Caption' (una frase fácil). Los tres primeros llevan
   además 'medal' con la medalla correspondiente (🥇🥈🥉): la
   medalla es lo que abre la actividad, porque "primero, segundo,
   tercero" es la cara que la gente ya reconoce sin tener que
   aprenderla primero.

   No hay forma abreviada con el signo de grado superíndice, y es
   deliberado: check.js (comprobación 6.1) prohíbe por substring las
   seis primeras abreviaturas de ordinal en todo lo que se sirve al
   navegador, porque son indistinguibles de la marca de curso
   escolar, y el escaneo es sobre el contenido crudo del fichero
   (comentarios incluidos). La cifra hace el mismo trabajo: la
   persona ve "3" y "tercero" juntos, que es justo la correspondencia
   que hay que aprender.

   El color recorre 5 valores y se repite del sexto en adelante. Es
   deliberado y no es un descuido: el color aquí no identifica al
   ordinal —eso lo hacen la cifra y la palabra, que siempre están
   escritas al lado—, sino que ayuda a seguir la serie.

   DATA.famous — los DOS escenarios de la vida real. Son dos, no un
   carrusel de ordinales sueltos: la pantalla 2 ("En la vida real")
   recorre uno a uno los dos casos que la RAE y la vida cotidiana
   asocian a los ordinales, "el edificio" y "la cola", que son los
   dos contextos donde alguien escucha de verdad "vivo en el tercer
   piso" o "es el primero de la cola". Cada escenario muestra
   varios ordinales a la vez (5 pisos o 5 personas) para que se vea
   la serie funcionando, no un ordinal suelto.

   DATA.scenes — apoyo bajo el enunciado del juego: "tercero" no es
   solo una palabra, es el piso en el que vive alguien o el puesto
   que quedó en una carrera.

   DATA.levels — dos grupos visibles que encadenan sus sub-niveles
   sin volver al menú (regla 13, un cambio de variable cada vez),
   más un test que mezcla todo:

     - 'learn' : leer el lugar en la fila.
         paso 1 → 2 cambia SÓLO el largo de la fila (3 → 5);
         paso 2 → 3 cambia SÓLO el sentido de la pregunta
         (señala un lugar y nombralo → nombra un lugar y busca
         quién está ahí).
     - 'apply' : usar el ordinal fuera de la fila.
         paso 4 → 5 cambia SÓLO el sentido (ordinal → cifra,
         cifra → ordinal), con el rango de los ordinales
         presentados en la pantalla 1.
     - 'test'  : mezcla de los cinco modos, en orden aleatorio,
         sobre los mismos ordinales que la pantalla 1.

   El rango de la pantalla 1 —los ordinales que se enseñan— es
   intencionadamente corto: 1..10 más los cuatro ordinales "redondos"
   que la gente necesita oír en la vida real (undécimo, duodécimo,
   vigésimo, trigésimo). Meter los 29 huecos intermedios sólo serviría
   para llenar la pantalla de palabras que no suenan en ningún sitio.
   La serie entera, si alguien la necesita, sigue en el diccionario.

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
   ya no caben y empezarían a salirse. El rango de ordinales se
   practica en los pasos de texto, donde no hay que dibujar a nadie.
   ============================================================ */

var ORDINALS = [
  { n: 1, cls: 'ord-c1', medal: '🥇' },
  { n: 2, cls: 'ord-c2', medal: '🥈' },
  { n: 3, cls: 'ord-c3', medal: '🥉' },
  { n: 4, cls: 'ord-c4' },
  { n: 5, cls: 'ord-c5' },
  { n: 6, cls: 'ord-c1' },
  { n: 7, cls: 'ord-c2' },
  { n: 8, cls: 'ord-c3' },
  { n: 9, cls: 'ord-c4' },
  { n: 10, cls: 'ord-c5' },
  { n: 11, cls: 'ord-c1' },
  { n: 12, cls: 'ord-c2' },
  { n: 20, cls: 'ord-c3' },
  { n: 30, cls: 'ord-c4' }
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

/* El conjunto de ordinales que se enseñan y se preguntan en los
   pasos de práctica. Lo comparten el carrusel de la pantalla 1 y los
   modos de texto de la pantalla 5 (apply + test). Si la pantalla 1
   cambia, basta con tocar este array y el resto se actualiza. */
var PRESENTED_ORDINALS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 20, 30];

var DATA = {
  /* Cuántos ítems tiene una ronda. Más corta que la de Cantidades
     porque aquí cada ronda enseña una regla y hay tres pantallas
     antes: una ronda larga escondería el mensaje final. */
  perRound: 5,
  maxQueue: 5,
  ordinals: ORDINALS,
  queueMembers: QUEUE_MEMBERS,
  presentedOrdinals: PRESENTED_ORDINALS,

  /* Orden del carrusel y de la tabla del recordatorio: del primero
     al décimo, en orden, y luego los cuatro ordinales "redondos" que
     la pantalla 1 anuncia como los que también hay que saber. Un
     ordinal suelto no significa nada; la serie sí. */
  carousel: PRESENTED_ORDINALS,

  /* Los DOS escenarios de la vida real. La pantalla 2 ("En la vida
     real") recorre uno a uno estos dos casos: el edificio (los pisos
     se cuentan de abajo arriba) y la cola (el primero va delante).
     No es un carrusel de ordinales sueltos: cada escenario muestra
     varios ordinales a la vez para que se vea la serie funcionando. */
  famous: [
    { id: 'edificio', n: 5 },
    { id: 'cola', n: 5 }
  ],

  /* Situaciones de apoyo en el juego, para que el ordinal nombre
     algo y no sea una palabra suelta. */
  scenes: [
    { id: 'piso', n: 1 },
    { id: 'piso2', n: 2 },
    { id: 'piso3', n: 3 },
    { id: 'piso4', n: 4 },
    { id: 'piso5', n: 5 },
    { id: 'cola', n: 1 },
    { id: 'cola2', n: 2 },
    { id: 'cola3', n: 3 },
    { id: 'cola4', n: 4 },
    { id: 'cola5', n: 5 }
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
        { id: 'l4', group: 'apply', mode: 'ordinalToDigit',
          pool: PRESENTED_ORDINALS, stars: 2 },
        { id: 'l5', group: 'apply', mode: 'digitToOrdinal',
          pool: PRESENTED_ORDINALS, stars: 3 }
      ]
    },
    { id: 'test', pool: 'random', mode: 'random', icon: '🎲', stars: 2 }
  ]
};