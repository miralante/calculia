/* ============================================================
   Calculia — Porcentajes y proporción — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   Ningún resultado está guardado: el porcentaje, el descuento, la
   proporción y la medida a escala los calcula app.js a partir de
   estos números, y el dibujo se construye con los mismos. Así no
   pueden decir cosas distintas.
   Los textos NO están aquí: viven en strings.<locale>.js.

   Por qué el porcentaje se dibuja sobre 100 cuadraditos: "por ciento"
   quiere decir "de cada cien", y con la cuadrícula delante eso deja de
   ser una definición y pasa a ser algo que se cuenta.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* Primero qué es un porcentaje, sobre una cuadrícula de 100. */
    porcentaje: {
      picto: '💯',
      levels: [
        /* p1→p2 solo cambia el tamaño del salto: de diez en diez a de
           cinco en cinco. Una variable por paso. */
        { id: 'p1', tipo: 'readPercent', step: 10 },
        { id: 'p2', tipo: 'readPercent', step: 5 },
        { id: 'p3', tipo: 'pickPercent', step: 10 }
      ]
    },

    /* Después el porcentaje aplicado al dinero: rebajas e intereses. */
    dinero: {
      picto: '🏷️',
      levels: [
        { id: 'r1', tipo: 'percentOf', dir: 'part' },
        { id: 'r2', tipo: 'percentOf', dir: 'less' },
        { id: 'r3', tipo: 'percentOf', dir: 'more' }
      ]
    },

    /* La proporción como una receta: por cada tanto, tanto.
       o3 cambia solo el sentido: hay cosas que al crecer una, la otra
       baja (más gente repartiendo el mismo trabajo, menos tiempo). */
    proporcion: {
      picto: '🥣',
      levels: [
        { id: 'o1', tipo: 'ratio', times: 2 },
        { id: 'o2', tipo: 'ratio', times: 3 },
        { id: 'o3', tipo: 'inverse' }
      ]
    },

    /* Lo que se puede comprar con lo que hay: un límite y un precio.
       l1→l2 solo cambia lo que se pregunta: cuántas caben o qué sobra. */
    limite: {
      picto: '🎟️',
      levels: [
        { id: 'l1', tipo: 'howManyFit' },
        { id: 'l2', tipo: 'whatIsLeft' }
      ]
    },

    /* Y la escala como un plano en el que cada cuadrado vale algo. */
    escala: {
      picto: '🗺️',
      levels: [
        { id: 'e1', tipo: 'scale' }
      ]
    }
  },

  /* Porcentajes de diez en diez y de cinco en cinco. Ni 0 ni 100: no
     hay nada que leer en una cuadrícula vacía ni en una llena. */
  percents: {
    10: [10, 20, 30, 40, 50, 60, 70, 80, 90],
    5: [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]
  },

  /* Precios y porcentajes que dan un resultado exacto en euros: un
     descuento con céntimos sería otro tema. app.js lo comprueba. */
  prices: [
    { price: 20, percent: 50 }, { price: 20, percent: 25 }, { price: 20, percent: 10 },
    { price: 40, percent: 50 }, { price: 40, percent: 25 }, { price: 40, percent: 10 },
    { price: 30, percent: 50 }, { price: 30, percent: 10 },
    { price: 60, percent: 50 }, { price: 60, percent: 25 }, { price: 50, percent: 10 },
    { price: 80, percent: 25 }, { price: 10, percent: 50 }
  ],

  /* Recetas: por cada `a` de lo primero, `b` de lo segundo. */
  recipes: [
    { id: 'flourSugar', a: 2, b: 1, pictoA: '🌾', pictoB: '🍬' },
    { id: 'riceWater', a: 1, b: 2, pictoA: '🍚', pictoB: '💧' },
    { id: 'juiceWater', a: 3, b: 1, pictoA: '🍊', pictoB: '💧' },
    { id: 'milkCocoa', a: 4, b: 1, pictoA: '🥛', pictoB: '🍫' },
    { id: 'paintWhite', a: 2, b: 3, pictoA: '🔵', pictoB: '⚪' }
  ],

  /* Un límite de dinero y un precio. Ni las que caben ni lo que sobra
     están guardados: app.js los saca de estos dos números. Siempre
     sobra algo, porque «no llega para otra» es justo lo que se aprende
     aquí; app.js lo comprueba. */
  budgets: [
    { id: 'ticket', budget: 10, price: 3, picto: '🎟️' },
    { id: 'notebook', budget: 12, price: 5, picto: '📒' },
    { id: 'sandwich', budget: 8, price: 3, picto: '🥪' },
    { id: 'pencil', budget: 9, price: 2, picto: '✏️' },
    { id: 'ball', budget: 14, price: 4, picto: '⚽' },
    { id: 'juice', budget: 11, price: 3, picto: '🧃' },
    { id: 'cap', budget: 13, price: 6, picto: '🧢' },
    { id: 'book', budget: 15, price: 4, picto: '📗' }
  ],

  /* Trabajos que se reparten: `from` personas tardan `hours` horas.
     El trabajo total es el mismo, así que con `to` personas se tarda
     menos. Las horas que se tarda entonces las calcula app.js. */
  jobs: [
    { id: 'boxes', from: 2, hours: 6, to: 4, picto: '📦' },
    { id: 'paint', from: 3, hours: 4, to: 6, picto: '🎨' },
    { id: 'clean', from: 2, hours: 8, to: 4, picto: '🧹' },
    { id: 'garden', from: 2, hours: 9, to: 3, picto: '🌱' },
    { id: 'load', from: 4, hours: 3, to: 2, picto: '🚚' },
    { id: 'fold', from: 3, hours: 8, to: 4, picto: '👕' }
  ],

  /* Planos: cada cuadrado del plano vale tantos metros de verdad. */
  scales: [
    { unit: 2, squares: 3 }, { unit: 2, squares: 5 }, { unit: 5, squares: 2 },
    { unit: 5, squares: 4 }, { unit: 10, squares: 3 }, { unit: 3, squares: 4 },
    { unit: 10, squares: 2 }, { unit: 3, squares: 6 }
  ]
};
