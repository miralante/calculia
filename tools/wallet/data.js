/* ============================================================
   Calculia — The Wallet (reasoning: functional money handling).
   Five activities from a menu (rule 10), in the same "shop" pattern:

   - "How much is there?" (count): NO hard-coded cases — each case
     is generated at runtime in app.js from the level's denominations
     (infinite variety, nothing to memorise). Rule 13: the only
     per-level variable is THE MONEY TYPES (euro coins → + banknotes →
     + cent coins). See COUNT_BASE.

   - "Pay exactly" (pay): a SINGLE product bank (PRODUCTS).
     ▶ TO ADD A CASE: one line in PRODUCTS with
       { picto, key, price } + the name in NAMES.es and
       NAMES.en. NOTHING ELSE: the level is deduced from the price
       alone (levelFromPrice), so it is impossible to put it in the
       wrong level or to set an unpayable price.
     Rule 13: the only per-level variable is THE PRICE FINENESS
     (the new money is implied by the price): N1 whole euros →
     N2 adds ,50 → N3 adds ,10/,20 → N4 adds 5-cent pieces.
     Prices are always multiples of 5 cents (matching real rounding
     practice); 1- and 2-cent coins are not used.

   - "What do I pay with?" (payWith), "Is the change correct?" (change)
     and "The Piggy Bank" (piggyBank): cases GENERATED at runtime in
     app.js. The three share the SAME level ladder (AMOUNT_LEVELS):
     rule 13, only variable = amount fineness (whole → with ,50 →
     with tenths). The Piggy Bank also reuses PRODUCTS as savings
     targets — adding a product feeds both "Pay exactly" and "The
     Piggy Bank".

   Quiz-type activities run on a generic runner in
   app.js (buildQuiz below): adding a new money activity is just
   ONE configuration object.

   The visual money catalogue and helpers live in the shared module
   assets/js/dinero.js (App.dinero). Amounts are kept in cents
   (integers) to avoid floating-point errors. app.js uses
   DATA[App.i18n.locale()] || DATA.es.
   ============================================================ */

/* ---- How much is there? — denominations per level (rule 13: each
   level only ADDS money types; the number of pieces doesn't change). */
const COUNT_BASE = [
  { id: 1, cents: [100, 200] },
  { id: 2, cents: [100, 200, 500, 1000] },
  { id: 3, cents: [10, 20, 50, 100, 200, 500, 1000] },
  { id: 4, cents: [10, 20, 50, 100, 200, 500, 1000, 2000, 5000] }
];

/* ---- Amounts ladder shared by "What do I pay with?", "Is the
   change correct?", and The Piggy Bank (rule 13: the only variable
   is the granularity of the amounts; 'step' is the multiple in cents
   and each level's amounts do NOT fall into the previous level —
   bucket, like in Pay exactly). */
const AMOUNT_LEVELS = [
  { id: 1, step: 100 },
  { id: 2, step: 50 },
  { id: 3, step: 10 }
];

/* ---- More or less — possible deltas from the target euro
   (rule 13: the only variable is the distance to the euro; level 3
   introduces ,50 and its "50 rounds up" rule). */
const ROUNDING_BASE = [
  { id: 1, deltas: [10, 20] },
  { id: 2, deltas: [30, 40] },
  { id: 3, deltas: [50] }
];

/* ---- Pay exactly — money available per level (cumulative). */
const PAY_CENTS = {
  1: [100, 200, 500],
  2: [50, 100, 200, 500],
  3: [10, 20, 50, 100, 200, 500],
  4: [5, 10, 20, 50, 100, 200, 500]
};

/* The level of a product is deduced ONLY from its price. */
function levelFromPrice(cent) {
  if (cent % 100 === 0) return 1;   /* whole euros */
  if (cent % 50 === 0) return 2;    /* ends in ,50 */
  if (cent % 10 === 0) return 3;    /* ends in ,10 … ,90 */
  return 4;                         /* multiples of 5 cents */
}

/* ▶ Product bank. To add a case: ONE line here
   (price in euros, multiple of 0.05) + name in NAMES.es/en. */
const PRODUCTS = [
  /* Level 1 — whole euros */
  { picto: '🍞', key: 'bread', price: 2 },
  { picto: '🥛', key: 'milk', price: 1 },
  { picto: '🍎', key: 'apples', price: 3 },
  { picto: '🧴', key: 'shampoo', price: 4 },
  { picto: '🧦', key: 'socks', price: 5 },
  { picto: '🥚', key: 'eggs', price: 3 },
  { picto: '📓', key: 'notebook', price: 2 },
  { picto: '🧢', key: 'cap', price: 6 },
  { picto: '⚽', key: 'ball', price: 8 },
  /* Level 2 — prices with ,50 */
  { picto: '🧃', key: 'juice', price: 2.50 },
  { picto: '🍪', key: 'biscuits', price: 1.50 },
  { picto: '🥤', key: 'softDrink', price: 0.50 },
  { picto: '🧀', key: 'cheese', price: 4.50 },
  { picto: '📖', key: 'magazine', price: 3.50 },
  { picto: '🍯', key: 'honey', price: 5.50 },
  { picto: '🥪', key: 'sandwich', price: 2.50 },
  /* Level 3 — prices with ,10 and ,20 */
  { picto: '🍬', key: 'sweets', price: 0.70 },
  { picto: '🥖', key: 'breadLoaf', price: 1.20 },
  { picto: '🍎', key: 'apple', price: 0.90 },
  { picto: '🥐', key: 'croissant', price: 1.10 },
  { picto: '🧻', key: 'tissues', price: 2.70 },
  { picto: '🍫', key: 'chocolate', price: 1.80 },
  { picto: '🧀', key: 'cheesePiece', price: 3.40 },
  { picto: '🔋', key: 'batteries', price: 2.60 },
  /* Level 4 — prices with 5-cent amounts */
  { picto: '🍬', key: 'gum', price: 0.35 },
  { picto: '✉️', key: 'stamp', price: 0.85 },
  { picto: '⭐', key: 'stickers', price: 1.15 },
  { picto: '🖊️', key: 'pencil', price: 0.65 },
  { picto: '🧽', key: 'eraser', price: 0.45 },
  { picto: '🌰', key: 'chestnuts', price: 1.95 },
  { picto: '🔑', key: 'keyring', price: 2.25 },
  { picto: '🎈', key: 'balloon', price: 0.15 }
];

/* Name of each product, per language (key -> name). The keys are
   intentionally language-neutral; the es/en naming is what differs. */
const NAMES = {
  es: {
    bread: 'El pan', milk: 'La leche', apples: 'Las manzanas', shampoo: 'El champú',
    socks: 'Los calcetines', eggs: 'Los huevos', notebook: 'El cuaderno',
    cap: 'La gorra', ball: 'El balón',
    juice: 'El zumo', biscuits: 'Las galletas', softDrink: 'El refresco', cheese: 'El queso',
    magazine: 'La revista', honey: 'La miel', sandwich: 'El bocadillo',
    sweets: 'Los caramelos', breadLoaf: 'La barra de pan', apple: 'La manzana',
    croissant: 'El cruasán', tissues: 'El paquete de pañuelos', chocolate: 'La chocolatina',
    cheesePiece: 'El trozo de queso', batteries: 'Las pilas',
    gum: 'El chicle', stamp: 'El sello', stickers: 'Las pegatinas', pencil: 'El lápiz',
    eraser: 'La goma', chestnuts: 'Las castañas', keyring: 'El llavero', balloon: 'El globo'
  },
  en: {
    bread: 'The bread', milk: 'The milk', apples: 'The apples', shampoo: 'The shampoo',
    socks: 'The socks', eggs: 'The eggs', notebook: 'The notebook',
    cap: 'The cap', ball: 'The ball',
    juice: 'The juice', biscuits: 'The biscuits', softDrink: 'The soft drink', cheese: 'The cheese',
    magazine: 'The magazine', honey: 'The honey', sandwich: 'The sandwich',
    sweets: 'The sweets', breadLoaf: 'The loaf of bread', apple: 'The apple',
    croissant: 'The croissant', tissues: 'The packet of tissues', chocolate: 'The chocolate bar',
    cheesePiece: 'The piece of cheese', batteries: 'The batteries',
    gum: 'The chewing gum', stamp: 'The stamp', stickers: 'The stickers', pencil: 'The pencil',
    eraser: 'The rubber', chestnuts: 'The chestnuts', keyring: 'The keyring', balloon: 'The balloon'
  }
};

/* Name and description of each level, per language. */
const LEVEL_TXT = {
  es: {
    count: { 1: 'Monedas de euro', 2: 'También billetes', 3: 'También céntimos', 4: 'Billetes grandes' },
    pay: { 1: 'Precios enteros', 2: 'Con 50 céntimos', 3: 'Con 10 y 20 céntimos', 4: 'Céntimos de cinco' },
    amount: { 1: 'Importes enteros', 2: 'Con 50 céntimos', 3: 'Con 10 y 20 céntimos' },
    rounding: { 1: 'Muy cerca del euro', 2: 'Un poco más lejos', 3: 'Acaba en 50' }
  },
  en: {
    count: { 1: 'Euro coins', 2: 'Also banknotes', 3: 'Also cents', 4: 'Big banknotes' },
    pay: { 1: 'Whole prices', 2: 'With 50 cents', 3: 'With 10 and 20 cents', 4: 'Five-cent prices' },
    amount: { 1: 'Whole amounts', 2: 'With 50 cents', 3: 'With 10 and 20 cents' },
    rounding: { 1: 'Very close to the euro', 2: 'A little further', 3: 'Ends in 50' }
  }
};

function buildWallet(loc) {
  var txt = LEVEL_TXT[loc] || LEVEL_TXT.es;
  var names = NAMES[loc] || NAMES.es;

  var count = COUNT_BASE.map(function (n) {
    return { id: n.id, description: txt.count[n.id], cents: n.cents };
  });

  var pay = Object.keys(PAY_CENTS).map(function (idStr) {
    var id = Number(idStr);
    return {
      id: id,
      description: txt.pay[id],
      cents: PAY_CENTS[id],
      products: PRODUCTS.filter(function (p) {
        return levelFromPrice(Math.round(p.price * 100)) === id;
      }).map(function (p) {
        return { picto: p.picto, name: names[p.key] || p.key, priceCent: Math.round(p.price * 100) };
      })
    };
  });

  var amount = AMOUNT_LEVELS.map(function (n) {
    return { id: n.id, description: txt.amount[n.id], step: n.step };
  });

  var rounding = ROUNDING_BASE.map(function (n) {
    return { id: n.id, description: txt.rounding[n.id], deltas: n.deltas };
  });

  return {
    perRound: 6,
    count: { levels: count },
    pay: { levels: pay },
    amount: { levels: amount },
    rounding: { levels: rounding }
  };
}

const DATA = {
  es: buildWallet('es'),
  en: buildWallet('en')
};
