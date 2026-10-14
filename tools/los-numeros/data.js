/* ============================================================
   Calculia — Tipos de Número — datos
   Esta actividad NO tiene test. Es una galería continua en la
   que cada tipo de número ocupa DOS cards consecutivas: una
   de exposición (visual: recta, pizza…) y otra de vida real
   (los ejemplos cotidianos como «3 manzanas · 5 dedos»).
   Las dos comparaciones (naturales vs enteros, naturales vs
   decimales) son cards únicas, sin parte de vida real separada.
   Las fracciones viven en su propia herramienta (tools/fractions-
   measures/) desde 2026-10; ya no se exponen aquí.
     1. Naturales   — expo
     2. Naturales   — vida real
     3. Enteros     — expo
     4. Enteros     — vida real
     5. Decimales   — expo
     6. Decimales   — vida real
     7. Vs Enteros  — comparación
     8. Vs Decimales
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
    { id: 'VsEnteros',    kind: 'compare', visual: 'compNE' },
    { id: 'VsDecimales',  kind: 'compare', visual: 'compND' }
  ]
};
