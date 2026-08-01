/* ============================================================
   Datos: El Monedero (razonamiento — manejo funcional del dinero).
   Cinco actividades desde un menú (regla 10), como La Compra:

   - '¿Cuánto hay?' (contar): NO tiene casos escritos — cada caso se
     genera al vuelo en app.js con las denominaciones del nivel
     (variedad infinita, nada que memorizar). Regla 13: la única
     variable por nivel son LOS TIPOS DE DINERO (monedas de euro →
     + billetes → + monedas de céntimos). Ver CONTAR_BASE.

   - 'Paga justo' (pagar): banco ÚNICO de productos (PRODUCTOS).
     ▶ PARA AÑADIR UN CASO: una línea en PRODUCTOS con
       { picto, clave, precio } + el nombre en NOMBRES.es y
       NOMBRES.en. NADA MÁS: el nivel se deduce solo del precio
       (nivelDePrecio), así es imposible ponerlo en el nivel
       equivocado o crear un precio impagable.
     Regla 13: la única variable por nivel es LA FINURA DEL PRECIO
     (el dinero nuevo viene dado por el precio): N1 enteros →
     N2 añade ,50 → N3 añade ,10/,20 → N4 añade céntimos de 5.
     Precios siempre en múltiplos de 5 céntimos (como el redondeo
     real); no se usan monedas de 1 y 2 céntimos.

   - '¿Con qué pago?' (conquepago), '¿Está bien el cambio?' (cambio)
     y 'La Hucha' (hucha): casos GENERADOS al vuelo en app.js. Las
     tres comparten la MISMA escalera de niveles (NIVELES_IMPORTE):
     regla 13, única variable = la finura de los importes
     (enteros → con ,50 → con décimos). La Hucha reutiliza además
     el banco PRODUCTOS como objetivos de ahorro — añadir un
     producto alimenta a la vez 'Paga justo' y 'La Hucha'.

   Las actividades tipo quiz corren sobre un runner genérico en
   app.js (montarQuiz): añadir una actividad de dinero nueva es
   escribir UN objeto de configuración.

   El catálogo visual del dinero y sus helpers viven en el módulo
   compartido assets/js/dinero.js (App.dinero). Los importes se
   trabajan en céntimos (enteros) para evitar errores de coma
   flotante. app.js usa DATA[App.i18n.locale()] || DATA.es.
   ============================================================ */

/* ---- How much is there? — denominations per level (rule 13: each
   level only ADDS money types; the number of pieces doesn't change). */
const CONTAR_BASE = [
  { id: 1, cents: [100, 200] },
  { id: 2, cents: [100, 200, 500, 1000] },
  { id: 3, cents: [10, 20, 50, 100, 200, 500, 1000] },
  { id: 4, cents: [10, 20, 50, 100, 200, 500, 1000, 2000, 5000] }
];

/* ---- Amounts ladder shared by "What do I pay with?", "Is the
   change correct?", and The Piggy Bank (rule 13: the only variable
   is the granularity of the amounts; 'paso' is the multiple in cents
   and each level's amounts do NOT fall into the previous level —
   bucket, like in Paga justo). */
const NIVELES_IMPORTE = [
  { id: 1, paso: 100 },
  { id: 2, paso: 50 },
  { id: 3, paso: 10 }
];

/* ---- More or less — possible deltas from the target euro
   (rule 13: the only variable is the distance to the euro; level 3
   introduces ,50 and its "the 50 rounds up" rule). */
const REDONDEO_BASE = [
  { id: 1, deltas: [10, 20] },
  { id: 2, deltas: [30, 40] },
  { id: 3, deltas: [50] }
];

/* ---- Paga justo — dinero disponible por nivel (acumulativo). */
const PAGAR_CENTS = {
  1: [100, 200, 500],
  2: [50, 100, 200, 500],
  3: [10, 20, 50, 100, 200, 500],
  4: [5, 10, 20, 50, 100, 200, 500]
};

/* El nivel de un producto se deduce SOLO de su precio. */
function nivelDePrecio(cent) {
  if (cent % 100 === 0) return 1;   /* euros enteros */
  if (cent % 50 === 0) return 2;    /* acaba en ,50 */
  if (cent % 10 === 0) return 3;    /* ends in ,10 … ,90 */
  return 4;                         /* multiples of 5 cents */
}

/* ▶ Product bank. To add a case: ONE line here
   (price in euros, multiple of 0.05) + name in NOMBRES.es/en. */
const PRODUCTOS = [
  /* Nivel 1 — precios enteros */
  { picto: '🍞', clave: 'pan', precio: 2 },
  { picto: '🥛', clave: 'leche', precio: 1 },
  { picto: '🍎', clave: 'manzanas', precio: 3 },
  { picto: '🧴', clave: 'champu', precio: 4 },
  { picto: '🧦', clave: 'calcetines', precio: 5 },
  { picto: '🥚', clave: 'huevos', precio: 3 },
  { picto: '📓', clave: 'cuaderno', precio: 2 },
  { picto: '🧢', clave: 'gorra', precio: 6 },
  { picto: '⚽', clave: 'balon', precio: 8 },
  /* Nivel 2 — precios con ,50 */
  { picto: '🧃', clave: 'zumo', precio: 2.50 },
  { picto: '🍪', clave: 'galletas', precio: 1.50 },
  { picto: '🥤', clave: 'refresco', precio: 0.50 },
  { picto: '🧀', clave: 'queso', precio: 4.50 },
  { picto: '📖', clave: 'revista', precio: 3.50 },
  { picto: '🍯', clave: 'miel', precio: 5.50 },
  { picto: '🥪', clave: 'bocadillo', precio: 2.50 },
  /* Nivel 3 — precios con ,10 y ,20 */
  { picto: '🍬', clave: 'caramelos', precio: 0.70 },
  { picto: '🥖', clave: 'barraPan', precio: 1.20 },
  { picto: '🍎', clave: 'manzana', precio: 0.90 },
  { picto: '🥐', clave: 'cruasan', precio: 1.10 },
  { picto: '🧻', clave: 'panuelos', precio: 2.70 },
  { picto: '🍫', clave: 'chocolatina', precio: 1.80 },
  { picto: '🧀', clave: 'trozoQueso', precio: 3.40 },
  { picto: '🔋', clave: 'pilas', precio: 2.60 },
  /* Level 4 — prices with 5-cent amounts */
  { picto: '🍬', clave: 'chicle', precio: 0.35 },
  { picto: '✉️', clave: 'sello', precio: 0.85 },
  { picto: '⭐', clave: 'pegatinas', precio: 1.15 },
  { picto: '🖊️', clave: 'lapiz', precio: 0.65 },
  { picto: '🧽', clave: 'goma', precio: 0.45 },
  { picto: '🌰', clave: 'castanas', precio: 1.95 },
  { picto: '🔑', clave: 'llavero', precio: 2.25 },
  { picto: '🎈', clave: 'globo', precio: 0.15 }
];

/* Nombre de cada producto, por idioma (clave -> nombre). */
const NOMBRES = {
  es: {
    pan: 'El pan', leche: 'La leche', manzanas: 'Las manzanas', champu: 'El champú',
    calcetines: 'Los calcetines', huevos: 'Los huevos', cuaderno: 'El cuaderno',
    gorra: 'La gorra', balon: 'El balón',
    zumo: 'El zumo', galletas: 'Las galletas', refresco: 'El refresco', queso: 'El queso',
    revista: 'La revista', miel: 'La miel', bocadillo: 'El bocadillo',
    caramelos: 'Los caramelos', barraPan: 'La barra de pan', manzana: 'La manzana',
    cruasan: 'El cruasán', panuelos: 'El paquete de pañuelos', chocolatina: 'La chocolatina',
    trozoQueso: 'El trozo de queso', pilas: 'Las pilas',
    chicle: 'El chicle', sello: 'El sello', pegatinas: 'Las pegatinas', lapiz: 'El lápiz',
    goma: 'La goma', castanas: 'Las castañas', llavero: 'El llavero', globo: 'El globo'
  },
  en: {
    pan: 'The bread', leche: 'The milk', manzanas: 'The apples', champu: 'The shampoo',
    calcetines: 'The socks', huevos: 'The eggs', cuaderno: 'The notebook',
    gorra: 'The cap', balon: 'The ball',
    zumo: 'The juice', galletas: 'The biscuits', refresco: 'The soft drink', queso: 'The cheese',
    revista: 'The magazine', miel: 'The honey', bocadillo: 'The sandwich',
    caramelos: 'The sweets', barraPan: 'The loaf of bread', manzana: 'The apple',
    cruasan: 'The croissant', panuelos: 'The packet of tissues', chocolatina: 'The chocolate bar',
    trozoQueso: 'The piece of cheese', pilas: 'The batteries',
    chicle: 'The chewing gum', sello: 'The stamp', pegatinas: 'The stickers', lapiz: 'The pencil',
    goma: 'The rubber', castanas: 'The chestnuts', llavero: 'The keyring', globo: 'The balloon'
  }
};

/* Name and description of each level, per language. */
const NIVELES_TXT = {
  es: {
    contar: { 1: 'Monedas de euro', 2: 'También billetes', 3: 'También céntimos', 4: 'Billetes grandes' },
    pagar: { 1: 'Precios enteros', 2: 'Con 50 céntimos', 3: 'Con 10 y 20 céntimos', 4: 'Céntimos de cinco' },
    importe: { 1: 'Importes enteros', 2: 'Con 50 céntimos', 3: 'Con 10 y 20 céntimos' },
    redondeo: { 1: 'Muy cerca del euro', 2: 'Un poco más lejos', 3: 'Acaba en 50' }
  },
  en: {
    contar: { 1: 'Euro coins', 2: 'Also banknotes', 3: 'Also cents', 4: 'Big banknotes' },
    pagar: { 1: 'Whole prices', 2: 'With 50 cents', 3: 'With 10 and 20 cents', 4: 'Five-cent prices' },
    importe: { 1: 'Whole amounts', 2: 'With 50 cents', 3: 'With 10 and 20 cents' },
    redondeo: { 1: 'Very close to the euro', 2: 'A little further', 3: 'Ends in 50' }
  }
};

function construirMonedero(loc) {
  var txt = NIVELES_TXT[loc] || NIVELES_TXT.es;
  var nombres = NOMBRES[loc] || NOMBRES.es;
  var prefijo = loc === 'en' ? 'Level ' : 'Nivel ';

  var contar = CONTAR_BASE.map(function (n) {
    return { id: n.id, nombre: prefijo + n.id, descripcion: txt.contar[n.id], cents: n.cents };
  });

  var pagar = Object.keys(PAGAR_CENTS).map(function (idStr) {
    var id = Number(idStr);
    return {
      id: id,
      nombre: prefijo + id,
      descripcion: txt.pagar[id],
      cents: PAGAR_CENTS[id],
      productos: PRODUCTOS.filter(function (p) {
        return nivelDePrecio(Math.round(p.precio * 100)) === id;
      }).map(function (p) {
        return { picto: p.picto, nombre: nombres[p.clave] || p.clave, precioCent: Math.round(p.precio * 100) };
      })
    };
  });

  var importe = NIVELES_IMPORTE.map(function (n) {
    return { id: n.id, nombre: prefijo + n.id, descripcion: txt.importe[n.id], paso: n.paso };
  });

  var redondeo = REDONDEO_BASE.map(function (n) {
    return { id: n.id, nombre: prefijo + n.id, descripcion: txt.redondeo[n.id], deltas: n.deltas };
  });

  return {
    porRonda: 6,
    contar: { niveles: contar },
    pagar: { niveles: pagar },
    importe: { niveles: importe },
    redondeo: { niveles: redondeo }
  };
}

const DATA = {
  es: construirMonedero('es'),
  en: construirMonedero('en')
};
