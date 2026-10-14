/* ============================================================
   Calculia — Los Números — datos
   Esta actividad NO tiene test. Es una galería continua en la
   que cada tipo de número ocupa DOS cards consecutivas: una
   de exposición (visual: recta, pizza…) y otra de vida real
   (los ejemplos cotidianos como «3 manzanas · 5 dedos»).
   Las tres comparaciones (naturales vs cada uno de los otros)
   son cards únicas, sin parte de vida real separada.
     1. Naturales   — expo
     2. Naturales   — vida real
     3. Enteros     — expo
     4. Enteros     — vida real
     5. Decimales   — expo
     6. Decimales   — vida real
     7. Fracciones  — expo
     8. Fracciones  — vida real
     9. Vs Enteros  — comparación
    10. Vs Decimales
    11. Vs Fracciones
   Títulos, eyebrow y frases de vida real viven en
   strings.<locale>.js (slide<id>Title, slide<id>Real, realEyebrow).
   ============================================================ */
var DATA = {
  slides: [
    { id: 'Naturales',    kind: 'expo',    visual: 'typeNatural' },
    { id: 'Naturales',    kind: 'real' },
    { id: 'Enteros',      kind: 'expo',    visual: 'typeEntero' },
    { id: 'Enteros',      kind: 'real' },
    { id: 'Decimales',    kind: 'expo',    visual: 'typeDecimal' },
    { id: 'Decimales',    kind: 'real' },
    { id: 'Fracciones',   kind: 'expo',    visual: 'typeFraccion' },
    { id: 'Fracciones',   kind: 'real' },
    { id: 'VsEnteros',    kind: 'compare', visual: 'compNE' },
    { id: 'VsDecimales',  kind: 'compare', visual: 'compND' },
    { id: 'VsFracciones', kind: 'compare', visual: 'compNF' }
  ]
};
