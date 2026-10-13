/* ============================================================
   Calculia — Los Números — datos
   Esta actividad NO tiene test. Es una galería continua de 7
   slides, igual que Formas: cuatro tipos (uno por slide) y tres
   comparaciones (naturales vs cada uno de los otros). El texto
   es mínimo — el visual es la lección.
     1. Naturales        → visual: typeNatural
     2. Enteros         → visual: typeEntero
     3. Decimales       → visual: typeDecimal
     4. Fracciones      → visual: typeFraccion
     5. vs Enteros      → visual: compNE
     6. vs Decimales    → visual: compND
     7. vs Fracciones   → visual: compNF
   Los títulos y la línea de vida real viven en strings.<locale>.js
   y se leen en app.js con App.i18n.t('slide<n>Title' / 'slide<n>Real').
   ============================================================ */
var DATA = {
  slides: [
    { id: 'Naturales',       kind: 'type',    visual: 'typeNatural' },
    { id: 'Enteros',         kind: 'type',    visual: 'typeEntero' },
    { id: 'Decimales',       kind: 'type',    visual: 'typeDecimal' },
    { id: 'Fracciones',      kind: 'type',    visual: 'typeFraccion' },
    { id: 'VsEnteros',       kind: 'compare', visual: 'compNE' },
    { id: 'VsDecimales',     kind: 'compare', visual: 'compND' },
    { id: 'VsFracciones',    kind: 'compare', visual: 'compNF' }
  ]
};
