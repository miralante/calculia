/* ============================================================
   Calculia — Restar y Cálculo Mental — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   Los nombres de actividades y levels NO están aquí: son texto y
   viven en strings.js, indexados por 'id': App.i18n.t('actividad.<id>.name'),
   App.i18n.t('actividad.<id>.detalle'), App.i18n.t('actividad.<id>.instruction'),
   App.i18n.t('nivel.<id>').

   La actividad 'groups' tiene su propio recorrido (intro → famosos →
   recordatorio → niveles) y se monta con GROUPS_DATA / GROUPS, no con
   generadores de opciones. Los anclajes/restar/cabeza son lo de
   siempre; cada actividad es independiente.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Foundation ladder. The anchors are 1, 5 and 10 because they are the
       numbers the hand and the coins already give you: +1 is the next
       number, 5 is half a ten-bar, 10 is a whole bar. Every `tipo:
       'anchor'` level (a1-a6) is chosen so there is never a carry or a
       borrow — the units digit is picked to leave room — so the only
       new idea per step is the anchor itself (rule 13, gradual
       progression). `placeValue` (a7-a8) stays carry-free too, joining
       or removing units without the ten ever changing. Only from `carry`
       /`borrow` (a9-a10) does crossing a ten become the point, once the
       carry-free ground is solid.
       `max` caps the starting number; `step` is the anchor. */
    anchors: {
      picto: '🖐️',
      levels: [
        { id: 'a1', tipo: 'anchor', step: 1,  op: 'add',      max: 9 },
        { id: 'a2', tipo: 'anchor', step: 1,  op: 'subtract', max: 10 },
        { id: 'a3', tipo: 'anchor', step: 10, op: 'add',      max: 29 },
        { id: 'a4', tipo: 'anchor', step: 10, op: 'subtract', max: 39 },
        { id: 'a5', tipo: 'anchor', step: 5,  op: 'add',      max: 24 },
        { id: 'a6', tipo: 'anchor', step: 5,  op: 'subtract', max: 29 },
        { id: 'a7', tipo: 'placeValue', op: 'add' },
        { id: 'a8', tipo: 'placeValue', op: 'subtract' },
        /* Adding and subtracting across a ten (see TODO.md, which is not
           served to the browser): the
           only new idea versus a7/a8 is crossing a ten — ten loose units
           regroup into a bar, or a bar breaks into ten units to allow
           the subtraction. Everything else (base-ten picture, 3 options,
           near-miss distractors) stays the same shape. */
        { id: 'a9', tipo: 'carry' },
        { id: 'a10', tipo: 'borrow' }
      ]
    },

    restar: {
      picto: '➖',
      levels: [
        { id: 'r10', tipo: 'restar', a: [5, 10], maxB: 5 },
        { id: 'r20', tipo: 'restar', a: [10, 20], maxB: 10 }
      ]
    },

    cabeza: {
      /* Progression (rule 13): within each operation (sumaGrande,
         restaGrande, multiplicaGrande) only the magnitude increases
         (10→100→1000). When the operation changes, the magnitude
         always resets to the SAME fixed constant (10) — it's not a
         second variable being re-chosen each time, it's a fixed
         anchor — so the only real change across those jumps is the
         operation. */
      picto: '🧠',
      levels: [
        { id: 'k1', tipo: 'doubles' },
        { id: 'k2', tipo: 'sumLarge', suma: 10 },
        { id: 'k3', tipo: 'sumLarge', suma: 100 },
        { id: 'k4', tipo: 'sumLarge', suma: 1000 },
        { id: 'k5', tipo: 'subtractLarge', resta: 10 },
        { id: 'k6', tipo: 'subtractLarge', resta: 100 },
        { id: 'k7', tipo: 'subtractLarge', resta: 1000 },
        { id: 'k8', tipo: 'multiplyLarge', factor: 10 },
        { id: 'k9', tipo: 'multiplyLarge', factor: 100 }
      ]
    },

    /* "Contar en grupos" — antes vivía en Cantidades. Sin levels:
       cada paso (Aprender / Usar / Todos) elige su propia mecánica,
       así que data.js describe el grupo y el recorrido, no niveles
       tipo generador. */
    groups: {
      picto: '🧱',
      walkthrough: true
    }
  }
};

/* ============================================================
   Datos del recorrido "Contar en grupos"
   Antes vivían en tools/quantities/data.js. Movidos aquí al
   reubicar la actividad en Cálculo Mental.

   Cinco mecánicas en el cuestionario (groupToNumber /
   numberToGroup / dozenToNumber / numberToDozen / digitValue),
   tres pasos encadenados (Aprender / Usar / Todos), cuatro pantallas
   del recorrido (intro carrusel → ejemplos reales → recordatorio
   cromático → niveles), igual que números romanos.

   GROUPS_DATA.groups — los grupos de conteo. 'size' es cuántas
   cosas lleva cada grupo; 'cls' es la clase de color usada en
   todas partes (carrusel, recordatorio, cifras de un número
   grande). El color viene de un token del módulo, nunca literal:
   sobrevive al tema claro / oscuro / alto contraste.

     1 unidad, 10 decenas, 100 centenas, 1000 millares,
     6 media docena, 12 docena

   Los dos últimos son la parte práctica: una docena NO son diez,
   que es exactamente la confusión que merece la pena practicar.
   Salen al final del orden para que las potencias de diez ya
   estén seguras.

   'unit' está en el carrusel y en la tabla del recordatorio (es la
   base sobre la que se construyen los demás grupos) pero NO es
   objetivo de práctica en los primeros pasos: preguntar "¿cuántas
   unidades tiene 4?" tiene la respuesta en el enunciado, así que
   sería un hueco tonto. ============================================================ */
var GROUPS = [
  { id: 'unit',      size: 1,    cls: 'grp-unit' },
  { id: 'ten',       size: 10,   cls: 'grp-ten' },
  { id: 'hundred',   size: 100,  cls: 'grp-hundred' },
  { id: 'thousand',  size: 1000, cls: 'grp-thousand' },
  { id: 'halfDozen', size: 6,    cls: 'grp-halfdozen' },
  { id: 'dozen',     size: 12,   cls: 'grp-dozen' }
];

function groupById(id) {
  var found = GROUPS.filter(function (g) { return g.id === id; })[0];
  return found || GROUPS[0];
}

function groupPhrase(count, groupId) {
  var base = 'group.' + groupId + (count === 1 ? 'Name' : 'Label');
  return { count: count, text: t_(base).replace('{n}', count) };
}

function t_(key) {
  return (typeof App !== 'undefined' && App.i18n && App.i18n.t) ? App.i18n.t(key) : key;
}

/* ============================================================
   Datos del recorrido "Contar en grupos"
   Antes vivían en tools/quantities/data.js. Movidos aquí al
   reubicar la actividad en Cálculo Mental.

   GROUPS_DATA.groups — los grupos de conteo (definidos arriba en GROUPS).
   GROUPS_DATA.carousel — orden del carrusel: primero las potencias
     de diez, luego las dos docenas. La persona conoce la decena
     antes que la centena y la centena antes que la docena.
   GROUPS_DATA.famous — situaciones reales para la pantalla de
     ejemplos. 'factKey' apunta a strings.<locale>.js bajo
     'famous.<factKey>'.
   GROUPS_DATA.scenes — las mismas situaciones reutilizadas como
     contexto del cuestionario. 'scene.<id>'.
   GROUPS_DATA.perRoundGroups — cuántas preguntas lleva cada ronda
     de grupos (más corto que las otras: cada ítem es pregunta de
     tres opciones con explicación al fallar, y una ronda corta
     mantiene la lectura del feedback legible).
   GROUPS_DATA.levels — los pasos encadenados. El método de números
     romanos: las pantallas intro/famoso/recordatorio se pintan una
     vez; aquí se elige por dónde empezar (regla 13).

     - 'learn' : se nombra un grupo y se dice cuántos hay, luego al
                 revés. sub-nivel 1 → 2 cambia solo la dirección.
     - 'apply' : se lee un número grande por la posición, luego con
                 docenas. sub-nivel 1 → 2 cambia solo el tamaño del
                 número; 2 → 3 cambia solo la fuente.
     - 'test'  : mezcla los cinco modos, sin orden.

   Las 'stars' viven solo en los sub-niveles. La dificultad del
   paso se queda con la del sub-nivel más difícil (ver
   levelStars en app.js), así que el dato se escribe una sola vez
   y el paso nunca puede parecer más fácil que su sub-nivel final.

   Los cinco modos base (cada uno en los pasos que toca):
     - groupToNumber  : "4 decenas" → 40.
     - numberToGroup  : 40 → "4 decenas".
     - digitValue     : la cifra en una posición coloreada → su
                        valor (la versión con base de la vieja
                        "decompose").
     - dozenToNumber  : "2 docenas" → 24. Es el único modo que
                        usa media docena, así que "media docena"
                        y "6" se aprenden como la misma cosa.
     - numberToDozen  : 24 → "2 docenas".

   Las opciones incorrectas no se inventan números: se construyen
   con los otros grupos que la actividad enseña (ver
   buildDistractors en app.js), así que cada opción es algo que
   la persona ya conoce. ============================================================ */
var GROUPS_DATA = {
  perRoundGroups: 6,

  groups: GROUPS,

  carousel: ['unit', 'ten', 'hundred', 'thousand', 'halfDozen', 'dozen'],

  famous: [
    { group: 'dozen',     factKey: 'huevos' },
    { group: 'halfDozen', factKey: 'medioHuevos' },
    { group: 'ten',       factKey: 'dedos' },
    { group: 'hundred',   factKey: 'siglo' },
    { group: 'thousand',  factKey: 'concierto' }
  ],

  scenes: [
    { id: 'huevos',     group: 'dozen',     count: 12 },
    { id: 'cajaMedia',  group: 'halfDozen', count: 6 },
    { id: 'manos',      group: 'ten',       count: 10 },
    { id: 'siglo',      group: 'hundred',   count: 100 },
    { id: 'gradas',     group: 'thousand',  count: 1000 }
  ],

  levels: [
    {
      id: 'learn', pool: 'group', icon: '📚',
      sublevels: [
        { id: 'learn1', group: 'learn', mode: 'groupToNumber', pools: ['ten'], maxCount: 9, stars: 1 },
        { id: 'learn2', group: 'learn', mode: 'numberToGroup', pools: ['ten'], maxCount: 9, stars: 1 },
        { id: 'learn3', group: 'learn', mode: 'groupToNumber', pools: ['ten', 'hundred'], maxCount: 9, stars: 2 }
      ]
    },
    {
      id: 'apply', pool: 'group', icon: '🧩',
      sublevels: [
        { id: 'apply1', group: 'apply', mode: 'digitValue', positions: ['ten', 'hundred'], stars: 2 },
        { id: 'apply2', group: 'apply', mode: 'digitValue', positions: ['ten', 'hundred', 'thousand'], stars: 3 },
        { id: 'apply3', group: 'apply', mode: 'dozenToNumber', pools: ['halfDozen', 'dozen'], maxCount: 6, stars: 3 },
        { id: 'apply4', group: 'apply', mode: 'numberToDozen', pools: ['halfDozen', 'dozen'], maxCount: 6, stars: 3 }
      ]
    },
    { id: 'test', pool: 'random', mode: 'random', icon: '🎲', stars: 2 }
  ]
};

/* Las estrellas por defecto del recorrido de grupos. Vive en
   GROUPS_PROGRESS para no mezclarse con las estrellas globales del
   Cálculo Mental (que lleva anchors/restar/cabeza). Las estrellas
   que ya existían en Cantidades para esta práctica siguen viviendo
   bajo la clave 'quantities' del localStorage hasta que alguien
   resetee — la nueva actividad empieza desde cero aquí. */
var GROUPS_PROGRESS = {
  defaults: { stars: 0, groupsCompleted: {} },
  load: function () {
    var raw = App.storage.get('mental-math-groups');
    if (!raw) raw = {};
    if (typeof raw.stars !== 'number') raw.stars = 0;
    if (!raw.groupsCompleted) raw.groupsCompleted = {};
    return raw;
  },
  save: function (p) { App.storage.set('mental-math-groups', p); }
};
