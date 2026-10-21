/* ============================================================
   Calculia — Tipos de Número — datos
   Esta actividad NO tiene test. Es una galería continua en la
   que cada tipo de número ocupa DOS cards consecutivas: una
   de exposición (visual: recta, pizza…) y otra de vida real
   (los ejemplos cotidianos como «3 manzanas · 5 dedos»).
   Las comparaciones (naturales vs enteros, naturales vs
   decimales) son cards únicas, sin parte de vida real separada.
   Las fracciones van como tipo propio, justo antes de los
   decimales: una fracción es lo que se convierte en decimal. La
   herramienta de fracciones (tools/fractions-measures/) sigue
   aparte, con su propio trabajo.
     1. Naturales   — expo
     2. Naturales   — vida real
     3. Enteros     — expo
     4. Enteros     — vida real
     5. Fracciones  — expo
     6. Fracciones  — vida real
     7. Decimales   — expo
     8. Decimales   — vida real
     9. Vs Enteros  — comparación
    10. Vs Decimales
   Títulos, eyebrow y frases de vida real viven en
   strings.<locale>.js (slide<id>Title, slide<id>Real, realEyebrow).
   ============================================================ */
var DATA = {
  slides: [
    { id: 'Naturales',    kind: 'expo',    visual: 'typeNatural' },
    { id: 'Naturales',    kind: 'real' },
    { id: 'Enteros',      kind: 'expo',    visual: 'typeEntero' },
    { id: 'Enteros',      kind: 'real' },
    { id: 'Fracciones',   kind: 'expo',    visual: 'typeFraccion' },
    { id: 'Fracciones',   kind: 'real' },
    { id: 'Decimales',    kind: 'expo',    visual: 'typeDecimal' },
    { id: 'Decimales',    kind: 'real' },
    { id: 'VsEnteros',    kind: 'compare', visual: 'compNE' },
    { id: 'VsDecimales',  kind: 'compare', visual: 'compND' }
  ]
};
