/* ============================================================
   Data: The Clock (time — read the clock and associate it with
   the day).
   Format:
   DATA.levels = [{ id, stars, minutes: number[] }]
     'minutes' are the minutes the clock can show at that level.
   DATA.moments = [{ id, picto, hora (0-23) }]
     'hora' is the base hour (24h format) of that moment of the
     day; the exact minute of each question is decided by the
     chosen level.
   Names, descriptions and questions are NOT here: they are text
   and live in strings.js. Level: App.i18n.t('levelDescription.' + id).
   Moment: App.i18n.t('moment.' + id + '.name') / '.question'.
   To extend: add a new level or moment with an id, and its texts
   in strings.js (es and en).
   ============================================================ */
var DATA = {
  perRound: 8,
  levels: [
    { id: 1, stars: 1, minutes: [0] },
    { id: 2, stars: 2, minutes: [0, 30] },
    { id: 3, stars: 3, minutes: [0, 15, 30, 45] }
  ],
  moments: [
    { id: 'desayuno', picto: '�', hora: 8 },
    { id: 'colegio', picto: '🏫', hora: 9 },
    { id: 'comida', picto: '🍽️', hora: 14 },
    { id: 'merienda', picto: '🍪', hora: 17 },
    { id: 'cena', picto: '🌙', hora: 21 },
    { id: 'dormir', picto: '😴', hora: 22 }
  ]
};
