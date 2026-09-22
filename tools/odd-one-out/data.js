/* ============================================================
   Datos: ¿Qué no encaja? (razonamiento — coherencia temática).
   Formato: DATA[locale] = { perRound, levels: [{ id,
     descKey, stars, grupos: [{ common: string[2], intruso }] }] }
   'comunes' son 2 pictos del mismo grupo; 'intruso' es el que no
   pertenece y el que hay que touch (3 opciones en pantalla en total).
   Los pictos son emojis: iguales en es/en (la coherencia es visual,
   no lingüística). descKey apunta al texto registrado en strings.js
   (App.i18n.t) que sirve de name de la actividad.
   Para ampliar: añadir grupos. app.js usa DATA[App.i18n.locale()].
   ============================================================ */
const LEVELS = [
  {
    id: 1,
    descKey: 'nivel1Desc',
    stars: 1,
    groups: [
      { common: ['🐶', '🐱'], oddOne: '👕' },
      { common: ['🍎', '🍞'], oddOne: '🚗' },
      { common: ['🚗', '🚌'], oddOne: '🍎' },
      { common: ['👕', '👖'], oddOne: '🐶' },
      { common: ['🎸', '🥁'], oddOne: '🍌' },
      { common: ['🍎', '🍌'], oddOne: '🚌' },
      { common: ['🛏️', '🪑'], oddOne: '🐱' },
      { common: ['⚽', '🏀'], oddOne: '🧦' },
      { common: ['🔨', '🪛'], oddOne: '🍇' },
      { common: ['☕', '🧃'], oddOne: '⚽' },
      { common: ['🐝', '🦋'], oddOne: '🎸' },
      { common: ['🌸', '🌹'], oddOne: '🔨' },
      { common: ['📺', '💻'], oddOne: '🌹' },
      { common: ['🐦', '🦅'], oddOne: '📺' },
      { common: ['🍰', '🍩'], oddOne: '🦅' }
    ]
  },
  {
    id: 2,
    descKey: 'nivel2Desc',
    stars: 2,
    groups: [
      { common: ['🍎', '🍌'], oddOne: '🥕' },
      { common: ['🥕', '🥦'], oddOne: '🍎' },
      { common: ['🐶', '🐱'], oddOne: '🦁' },
      { common: ['🦁', '🐘'], oddOne: '🐶' },
      { common: ['🧥', '🧣'], oddOne: '👕' },
      { common: ['👕', '🩳'], oddOne: '🧥' },
      { common: ['🚗', '🚌'], oddOne: '✈️' },
      { common: ['✈️', '🚁'], oddOne: '🚗' },
      { common: ['⚽', '🏀'], oddOne: '🏊' },
      { common: ['🏊', '🤿'], oddOne: '⚽' },
      { common: ['🎸', '🎻'], oddOne: '🥁' },
      { common: ['🥁', '🪘'], oddOne: '🎸' },
      { common: ['🍦', '🍧'], oddOne: '🍰' },
      { common: ['🍰', '🥧'], oddOne: '🍦' },
      { common: ['🐦', '🦅'], oddOne: '🐟' }
    ]
  },
  {
    id: 3,
    descKey: 'nivel3Desc',
    stars: 3,
    groups: [
      { common: ['🍎', '🍓'], oddOne: '🍌' },
      { common: ['🍌', '🍋'], oddOne: '🍓' },
      { common: ['🐦', '🦋'], oddOne: '🐟' },
      { common: ['🐟', '🐬'], oddOne: '🦋' },
      { common: ['🧊', '❄️'], oddOne: '🔥' },
      { common: ['🔥', '☀️'], oddOne: '❄️' },
      { common: ['🍳', '🍽️'], oddOne: '🧼' },
      { common: ['🧼', '🪥'], oddOne: '🍳' },
      { common: ['🧦', '👟'], oddOne: '🎩' },
      { common: ['🎩', '👒'], oddOne: '🧦' },
      { common: ['🍍', '🥭'], oddOne: '🍎' },
      { common: ['🍎', '🍐'], oddOne: '🍍' },
      { common: ['🐮', '🐷'], oddOne: '🦁' },
      { common: ['🦁', '🐯'], oddOne: '🐮' },
      { common: ['🚲', '🏍️'], oddOne: '🚗' }
    ]
  }
];

const DATA = {
  es: { perRound: 8, levels: LEVELS },
  en: { perRound: 8, levels: LEVELS }
};
