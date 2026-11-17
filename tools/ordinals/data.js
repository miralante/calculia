/* ============================================================
   Calculia — Números ordinales: datos.

   La actividad usa la plantilla compartida de Calculia
   (assets/js/activity-flow.js, modo 'options'): explicación con
   diapositivas, ejemplos de la vida real, recordatorio y un único
   test de una pregunta por pantalla. Este fichero solo guarda los
   datos; los dibujos están en screens.js, las preguntas en app.js y
   los textos en strings.<locale>.js.

   Ordinales: 'n' es su número y 'cls' la clase de color. El color
   recorre cinco valores; ayuda a seguir la serie, pero la cifra y la
   palabra son las que identifican cada ordinal.

   Los ordinales que se enseñan son 1..10 más los redondos 11, 12, 20,
   30 y 40 (PRESENTED_ORDINALS). Las opciones falsas de los modos de
   texto son los vecinos dentro de esa serie, para que nunca aparezca
   un número cuya palabra no se enseña.
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
  { n: 10, cls: 'ord-c5' },
  { n: 11, cls: 'ord-c1' },
  { n: 12, cls: 'ord-c2' },
  { n: 20, cls: 'ord-c3' },
  { n: 30, cls: 'ord-c4' },
  { n: 40, cls: 'ord-c5' }
];

/* Quién se coloca en la fila del test. Emoji de animales: no hay
   género ni tono de piel que elegir. */
var QUEUE_MEMBERS = ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐯'];

function ordinalByN(n) {
  var found = ORDINALS.filter(function (o) { return o.n === n; })[0];
  return found || ORDINALS[0];
}

var PRESENTED_ORDINALS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 20, 30, 40];

var DATA = {
  /* Preguntas por test. Cinco: una ronda corta, como en el resto de
     tests de la suite. */
  perRound: 5,
  /* Como mucho cinco personas en la fila: a 375px, seis animales ya no
     caben con sus separaciones. */
  maxQueue: 5,
  ordinals: ORDINALS,
  queueMembers: QUEUE_MEMBERS,
  presentedOrdinals: PRESENTED_ORDINALS,

  /* Diapositivas de la explicación, después de la carrera: la serie
     que se añade a primero, segundo y tercero. */
  carousel: [4, 5, 6, 7, 8, 9, 10, 11, 12, 20, 30, 40],

  /* Ejemplos de la vida real, en este orden. 'n' es cuántos puestos
     se dibujan. */
  real: [
    { id: 'podio', n: 3 },
    { id: 'clasificacion', n: 5 },
    { id: 'cola', n: 5 },
    { id: 'edificio', n: 5 }
  ],

  /* El piso que se resalta en el edificio del ejemplo ("vivo en el
     tercer piso"). */
  buildingHere: 3,

  /* Los modos de pregunta del test. 'items' es el largo de la fila;
     'pool' la lista de ordinales de la que se saca el ordinal. */
  modes: [
    { mode: 'positionToName', items: 3 },
    { mode: 'positionToName', items: 5 },
    { mode: 'nameToMember', items: 5 },
    { mode: 'ordinalToDigit', pool: PRESENTED_ORDINALS },
    { mode: 'digitToOrdinal', pool: PRESENTED_ORDINALS }
  ]
};
