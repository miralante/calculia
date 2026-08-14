/* ============================================================
   Datos: ¿Qué no encaja? (razonamiento — coherencia temática).
   Formato: DATA[locale] = { porRonda, levels: [{ id,
     descKey, estrellas, grupos: [{ common: string[2], intruso }] }] }
   'comunes' son 2 pictos del mismo grupo; 'intruso' es el que no
   pertenece y el que hay que tocar (3 opciones en pantalla en total).
   Los pictos son emojis: iguales en es/en (la coherencia es visual,
   no lingüística). descKey apunta al texto registrado en strings.js
   (App.i18n.t) que sirve de nombre de la actividad.
   Para ampliar: añadir grupos. app.js usa DATA[App.i18n.locale()].
   ============================================================ */
const NIVELES = [
  {
    id: 1,
    descKey: 'nivel1Desc',
    estrellas: 1,
    grupos: [
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
    estrellas: 2,
    grupos: [
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
    estrellas: 3,
    grupos: [
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
  es: { perRound: 8, levels: NIVELES },
  en: { perRound: 8, levels: NIVELES }
};
