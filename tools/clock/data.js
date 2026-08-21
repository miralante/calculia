/* ============================================================
   Data: The Clock (time — read / set / convert / situate).
   Format:
   DATA.perRound        number of questions per round
   DATA.modes           [{ id, stars }]  the four mechanics; app.js
                        dispatches on id and calls
                        App.i18n.t('mode.' + id + '.name' / '.description' /
                        '.question').
   DATA.levels          [{ id, stars, minutes: number[] }]
     'minutes' lists the minute values the round can show. All
     four modes (read, set, convert, situations) draw from this
     list at the active level.
   DATA.moments         [{ id, picto, hora (0-23) }]
     'hora' is the base 24-hour hour for that moment of day.
     The exact minute is chosen per question from the active level.

   Names, descriptions, questions, hints and explanations are
   NOT here: they are UI text and live in strings.<locale>.js.
     App.i18n.t('mode.' + id + '.name' | '.description' | '.question')
     App.i18n.t('levelDescription.' + id)
     App.i18n.t('moment.' + id + '.name' | '.question')

   To extend:
     - new mechanic  → add a mode id here and implement the body
       in app.js under the same `runMode(modeId, ...)` entry point.
     - new difficulty → add a level id (and matching strings.es/.en).
     - new moment of the day → add it here AND in both strings files.

   Levels stay backward-compatible: each new level's `minutes` is
   only required to be a superset if you want stricter difficulty.
   ============================================================ */
var DATA = {
  perRound: 8,
  modes: [
    { id: 'read',       stars: 1 }, // see the clock → write the time
    { id: 'set',        stars: 2 }, // read the time → set the hands
    { id: 'convert',    stars: 3 }, // analog ↔ digital pairing
    { id: 'situations', stars: 2 }  // moment of the day → analog time
  ],
  levels: [
    { id: 1, stars: 1, minutes: [0] },
    { id: 2, stars: 2, minutes: [0, 30] },
    { id: 3, stars: 3, minutes: [0, 15, 30, 45] }
  ],
  moments: [
    { id: 'desayuno', picto: '🥐', hora: 8 },
    { id: 'colegio',  picto: '🏫', hora: 9 },
    { id: 'comida',   picto: '🍽️', hora: 14 },
    { id: 'merienda', picto: '🍪', hora: 17 },
    { id: 'cena',     picto: '🌙', hora: 21 },
    { id: 'dormir',   picto: '😴', hora: 22 }
  ]
};
