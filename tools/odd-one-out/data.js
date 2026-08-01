/* ============================================================
   Datos: ¿Qué no encaja? (razonamiento — coherencia temática).
   Formato: DATA[locale] = { porRonda, niveles: [{ id, nombreKey,
     descKey, estrellas, grupos: [{ comunes: string[2], intruso }] }] }
   'comunes' son 2 pictos del mismo grupo; 'intruso' es el que no
   pertenece y el que hay que tocar (3 opciones en pantalla en total).
   Los pictos son emojis: iguales en es/en (la coherencia es visual,
   no lingüística). nombreKey y descKey apuntan a textos registrados
   en strings.js (App.i18n.t).
   Para ampliar: añadir grupos. app.js usa DATA[App.i18n.locale()].
   ============================================================ */
const NIVELES = [
  {
    id: 1,
    nombreKey: 'nivel1Nombre',
    descKey: 'nivel1Desc',
    estrellas: 1,
    grupos: [
      { comunes: ['🐶', '🐱'], intruso: '👕' },
      { comunes: ['🍎', '🍞'], intruso: '🚗' },
      { comunes: ['🚗', '🚌'], intruso: '🍎' },
      { comunes: ['👕', '👖'], intruso: '🐶' },
      { comunes: ['🎸', '🥁'], intruso: '🍌' },
      { comunes: ['🍎', '🍌'], intruso: '🚌' },
      { comunes: ['🛏️', '🪑'], intruso: '🐱' },
      { comunes: ['⚽', '🏀'], intruso: '🧦' },
      { comunes: ['🔨', '🪛'], intruso: '🍇' },
      { comunes: ['☕', '🧃'], intruso: '⚽' },
      { comunes: ['🐝', '🦋'], intruso: '🎸' },
      { comunes: ['🌸', '🌹'], intruso: '🔨' },
      { comunes: ['📺', '💻'], intruso: '🌹' },
      { comunes: ['🐦', '🦅'], intruso: '📺' },
      { comunes: ['🍰', '🍩'], intruso: '🦅' }
    ]
  },
  {
    id: 2,
    nombreKey: 'nivel2Nombre',
    descKey: 'nivel2Desc',
    estrellas: 2,
    grupos: [
      { comunes: ['🍎', '🍌'], intruso: '🥕' },
      { comunes: ['🥕', '🥦'], intruso: '🍎' },
      { comunes: ['🐶', '🐱'], intruso: '🦁' },
      { comunes: ['🦁', '🐘'], intruso: '🐶' },
      { comunes: ['🧥', '🧣'], intruso: '👕' },
      { comunes: ['👕', '🩳'], intruso: '🧥' },
      { comunes: ['🚗', '🚌'], intruso: '✈️' },
      { comunes: ['✈️', '🚁'], intruso: '🚗' },
      { comunes: ['⚽', '🏀'], intruso: '🏊' },
      { comunes: ['🏊', '🤿'], intruso: '⚽' },
      { comunes: ['🎸', '🎻'], intruso: '🥁' },
      { comunes: ['🥁', '🪘'], intruso: '🎸' },
      { comunes: ['🍦', '🍧'], intruso: '🍰' },
      { comunes: ['🍰', '🥧'], intruso: '🍦' },
      { comunes: ['🐦', '🦅'], intruso: '🐟' }
    ]
  },
  {
    id: 3,
    nombreKey: 'nivel3Nombre',
    descKey: 'nivel3Desc',
    estrellas: 3,
    grupos: [
      { comunes: ['🍎', '🍓'], intruso: '🍌' },
      { comunes: ['🍌', '🍋'], intruso: '🍓' },
      { comunes: ['🐦', '🦋'], intruso: '🐟' },
      { comunes: ['🐟', '🐬'], intruso: '🦋' },
      { comunes: ['🧊', '❄️'], intruso: '🔥' },
      { comunes: ['🔥', '☀️'], intruso: '❄️' },
      { comunes: ['🍳', '🍽️'], intruso: '🧼' },
      { comunes: ['🧼', '🪥'], intruso: '🍳' },
      { comunes: ['🧦', '👟'], intruso: '🎩' },
      { comunes: ['🎩', '👒'], intruso: '🧦' },
      { comunes: ['🍍', '🥭'], intruso: '🍎' },
      { comunes: ['🍎', '🍐'], intruso: '🍍' },
      { comunes: ['🐮', '🐷'], intruso: '🦁' },
      { comunes: ['🦁', '🐯'], intruso: '🐮' },
      { comunes: ['🚲', '🏍️'], intruso: '🚗' }
    ]
  }
];

const DATA = {
  es: { porRonda: 8, niveles: NIVELES },
  en: { porRonda: 8, niveles: NIVELES }
};
