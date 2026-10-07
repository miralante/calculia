/* ============================================================
   Calculia — Cantidades.

   Four practices in the menu:
     - read   : the number is shown and the user copies it.
     - write  : the number is spoken and the user writes it.
     - points : the number is shown WITHOUT separator; the user
                must type it WITH the separator in the right place.
     - groups : place value taught through the counting groups a
                person meets in real life — unidades, decenas,
                centenas, millares, media docena and docena.

   "Thousand" rule (see ranges below): < 10.000 has no separator;
   >= 10.000 does. In read/write modes the format shown matches
   what the user must type; in "points" mode that match is broken
   on purpose — the exercise is precisely to put the separator back.

   ------------------------------------------------------------------
   The 'groups' practice — methodology borrowed from roman-numerals
   ------------------------------------------------------------------
   'groups' replaced the old abstract 'decompose' practice (a number
   with coloured digits, ask the value of one digit). Same idea, but
   anchored on things people actually count, and taught with the same
   four screens roman-numerals uses:

     1. intro    : a carousel that names each group and how many it is.
     2. famous   : the same groups in a real situation (a box of
                   eggs, the fingers on two hands, a century…), so
                   the number has a meaning beyond the exercise.
     3. reminder : a colour reference table plus the two rules with
                   worked examples.
     4. quiz     : chained sub-levels that change ONE variable at a
                   time (rule 13), Socratic hints that never reveal
                   the answer, and a reinforcement mini-round.

   DATA.groups — the counting groups. 'size' is how many things one
   group holds; 'cls' is the colour class used everywhere the group
   is painted (intro carousel, reminder, digits of a big number).
   The colour comes from a theme token, never from a literal, so it
   survives light / dark / high-contrast.

     1 unidad, 10 decenas, 100 centenas, 1000 millares,
     6 media docena, 12 docena

   The last two are the practical part: a dozen is NOT ten, which is
   exactly the confusion worth practising. They come last in the
   order so the powers of ten are already secure.

   DATA.famous — real situations for the intro/famous screen. Each
   has a 'factKey' pointing to strings.<locale>.js under
   'famous.<factKey>'; only the words around the number are
   translated, never the number itself.

   DATA.scenes — the same situations reused as quiz context, so a
   round about docenas says "una caja de huevos" instead of an
   abstract label. contextKey points to 'scene.<id>'.

   DATA.levels — visible in the "Grupos" screen. Groups chain their
   sub-levels automatically without returning to the menu, which cuts
   choice fatigue to three buttons while keeping the gradual
   progression inside (regla 13).

     - 'learn'  : name a group, get its number, then the reverse.
                  sub-level 1 → 2 changes only the direction.
     - 'apply'  : read a big number by position, then do it with
                  docenas. sub-level 1 → 2 changes only the size of
                  the number; 2 → 3 changes only the source.
     - 'test'   : pool 'random', all five modes mixed.

   'stars' lives only on the sub-levels. A group's difficulty rating
   is the highest of its sub-levels (see levelStars in app.js), so the
   number is written once: rating the group by hand was how "Aprender"
   and "Usar" both ended up showing one star while the second is
   clearly the harder block.

   The five base modes:

     - groupToNumber : "4 decenas" → 40.
     - numberToGroup : 40 → "4 decenas".
     - digitValue    : the digit at a coloured position → its value
                       (the grounded version of the old 'decompose').
     - dozenToNumber : "2 docenas" → 24.  Also the only mode that
                       uses media docena, so "media docena" and "6"
                       are learned as the same thing.
     - numberToDozen : 24 → "2 docenas".

   Wrong options never invent a number: they are built from the other
   groups the activity teaches (see buildDistractors in app.js), so
   every option is something the person has already met.
   ============================================================ */

/* One entry per counting group. 'size' is how many things one group
   holds; 'cls' is the colour class used everywhere the group is
   painted (intro carousel, reminder, digits of a big number).
   'size' and 'cls' are the only things here: the words live in
   strings.<locale>.js as 'group.<id>Name' (singular, for "una
   docena"), 'group.<id>Label' (with its {n}, for "2 docenas") and
   'group.<id>Plural' (bare plural, for "el 4 de las centenas").

   The colour comes from a theme token, never from a literal, so it
   survives light / dark / high-contrast.

     1 unidad, 10 decenas, 100 centenas, 1000 millares,
     6 media docena, 12 docena

   The last two are the practical part: a dozen is NOT ten, which is
   exactly the confusion worth practising. They come last in the
   order so the powers of ten are already secure.

   'unit' is in the carousel and in the reminder table (it is the
   foundation the other groups are built on) but it is NOT a practice
   target in the early steps: asking "how many units are in 4?" has
   the answer in the question, so a slot would be wasted on it. */
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

/* All the "how many" words for a group live in the dictionary, so
   this function only assembles the pieces. count === 1 uses the
   singular label; anything else the plural one, which is what makes
   "1 docena" read differently from "2 docenas". */
function groupPhrase(count, groupId) {
  var base = 'group.' + groupId + (count === 1 ? 'Name' : 'Label');
  return { count: count, text: t_(base).replace('{n}', count) };
}

/* Localised lookup used by the helper above. Wrapped in a function
   (instead of calling App.i18n.t directly) so data.js stays loadable
   before i18n registers the dictionary; it reads App.i18n.t at call
   time, which is always after register(). */
function t_(key) {
  return (typeof App !== 'undefined' && App.i18n && App.i18n.t) ? App.i18n.t(key) : key;
}

var DATA = {
  perRound: 6,
  /* Absolute ceiling of the read/write/points practices.
     The ceiling is 999,999,999, which falls in the "mil millones"
     group; we do not introduce "billón". */
  ceiling: 999999999,
  practices: [
    { id: 'read', icon: '👀' },
    { id: 'write', icon: '✍️' },
    { id: 'points', icon: '·' },
    { id: 'groups', icon: '🧱' }
  ],
  /* Ranges for the three typing practices (the 'groups' practice
     has its own levels instead of a numeric range). */
  ranges: {
    read: [
      { id: 'l1', min: 0,         max: 99 },
      { id: 'l2', min: 100,       max: 9999 },
      { id: 'l3', min: 10000,     max: 99999 },
      { id: 'l4', min: 100000,    max: 999999 },
      { id: 'l5', min: 1000000,   max: 999999999 }
    ],
    write: [
      { id: 'e1', min: 0,         max: 99 },
      { id: 'e2', min: 100,       max: 9999 },
      { id: 'e3', min: 10000,     max: 99999 },
      { id: 'e4', min: 100000,    max: 999999 },
      { id: 'e5', min: 1000000,   max: 999999999 }
    ],
    points: [
      /* For the exercise to make sense the number must be >= 10.000.
         In "points" mode the separator is removed; the user must
         put it back. */
      { id: 'p1', min: 10000,     max: 99999 },
      { id: 'p2', min: 100000,    max: 999999 },
      { id: 'p3', min: 1000000,   max: 9999999 },
      { id: 'p4', min: 10000000,  max: 99999999 },
      { id: 'p5', min: 100000000, max: 999999999 }
    ]
  },

  /* ---------- The 'groups' practice ---------- */

  /* Order of the intro carousel: the powers of ten first, in size
     order, then the two dozen groups. The person meets a decena
     before a centena and a centena before a docena. */
  carousel: ['unit', 'ten', 'hundred', 'thousand', 'halfDozen', 'dozen'],

  groups: GROUPS,

  /* Real situations for the famous screen. 'speak' is how the TTS
     reads the caption; every one of these is a cardinal quantity
     ("a dozen eggs"), not an ordinal. The phrase itself lives in
     strings.<locale>.js under 'famous.<factKey>' and always ends
     with ":" so app.js can append the coloured formula without the
     two halves fighting over the punctuation. */
  famous: [
    { group: 'dozen',     factKey: 'huevos' },
    { group: 'halfDozen', factKey: 'medioHuevos' },
    { group: 'ten',       factKey: 'dedos' },
    { group: 'hundred',   factKey: 'siglo' },
    { group: 'thousand',  factKey: 'concierto' }
  ],

  /* Scenes reused as quiz context. Each is a real situation whose
     count happens to be one of the groups, so the round reads
     "una caja de huevos" rather than "12". */
  scenes: [
    { id: 'huevos',     group: 'dozen',     count: 12 },
    { id: 'cajaMedia',  group: 'halfDozen', count: 6 },
    { id: 'manos',      group: 'ten',       count: 10 },
    { id: 'siglo',      group: 'hundred',   count: 100 },
    { id: 'gradas',     group: 'thousand',  count: 1000 }
  ],

  /* How many items each groups round draws. Smaller than the typing
     practices: each item is a three-option question with a worked
     explanation on failure, so a short round keeps the feedback
     readable instead of burying it. */
  perRoundGroups: 6,

  levels: [
    {
      id: 'learn', pool: 'group', icon: '📚',
      sublevels: [
        /* Step 1 is the decena alone: the first group that is worth
           a question, because "1 unit" and "4 units" give the answer
           away. Step 1 → 2 changes ONE variable, the direction of the
           question, with the same group and the same counts. Step 3
           adds the centena (only the set of groups changes). */
        { id: 'learn1', group: 'learn', mode: 'groupToNumber', pools: ['ten'], maxCount: 9, stars: 1 },
        { id: 'learn2', group: 'learn', mode: 'numberToGroup', pools: ['ten'], maxCount: 9, stars: 1 },
        { id: 'learn3', group: 'learn', mode: 'groupToNumber', pools: ['ten', 'hundred'], maxCount: 9, stars: 2 }
      ]
    },
    {
      id: 'apply', pool: 'group', icon: '🧩',
      sublevels: [
        /* Step 1 → 2 changes ONLY how big the number is: the same
           digitValue mechanic over hundreds and thousands. */
        { id: 'apply1', group: 'apply', mode: 'digitValue', positions: ['ten', 'hundred'], stars: 2 },
        { id: 'apply2', group: 'apply', mode: 'digitValue', positions: ['ten', 'hundred', 'thousand'], stars: 3 },
        /* Step 3 changes ONLY the source: the powers of ten give way
           to the docenas, with the same "how many is this?" shape.
           Step 4 flips the direction. Same mechanic, new groups —
           and a dozen being twelve rather than ten is the confusion
           this whole tail of the activity exists for. */
        { id: 'apply3', group: 'apply', mode: 'dozenToNumber', pools: ['halfDozen', 'dozen'], maxCount: 6, stars: 3 },
        { id: 'apply4', group: 'apply', mode: 'numberToDozen', pools: ['halfDozen', 'dozen'], maxCount: 6, stars: 3 }
      ]
    },
    { id: 'test', pool: 'random', mode: 'random', icon: '🎲', stars: 2 }
  ]
};