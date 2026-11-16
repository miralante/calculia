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
    { id: 'Naturales',    kind: 'real',    pics: ['apples', 'fingers', 'cake'] },
    { id: 'Enteros',      kind: 'expo',    visual: 'typeEntero' },
    { id: 'Enteros',      kind: 'real',    pics: ['thermo', 'basement', 'floors'] },
    { id: 'Fracciones',   kind: 'expo',    visual: 'typeFraccion' },
    { id: 'Fracciones',   kind: 'real',    pics: ['pizza', 'clock'] },
    { id: 'Decimales',    kind: 'expo',    visual: 'typeDecimal' },
    { id: 'Decimales',    kind: 'real',    pics: ['coin', 'ruler', 'pi'] },
    { id: 'VsEnteros',    kind: 'compare', visual: 'compNE' },
    { id: 'VsDecimales',  kind: 'compare', visual: 'compND' }
  ],

  /* Dibujos de los ejemplos de vida real. Cada clave va en el campo
     pics de su slide, en el mismo orden que los trozos de
     strings.<locale>.js (separados por « · »). */
  pictures: {
    apples: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="21" y="34" width="3" height="10" fill="#6D4C41"/>' +
      '<rect x="49" y="34" width="3" height="10" fill="#6D4C41"/>' +
      '<rect x="77" y="34" width="3" height="10" fill="#6D4C41"/>' +
      '<ellipse cx="30" cy="34" rx="8" ry="4" fill="#43A047" transform="rotate(-20 30 34)"/>' +
      '<ellipse cx="58" cy="34" rx="8" ry="4" fill="#43A047" transform="rotate(-20 58 34)"/>' +
      '<ellipse cx="86" cy="34" rx="8" ry="4" fill="#43A047" transform="rotate(-20 86 34)"/>' +
      '<g fill="#E53935"><circle cx="22" cy="60" r="14"/><circle cx="50" cy="60" r="14"/><circle cx="78" cy="60" r="14"/></g>' +
      '<g fill="#fff" opacity=".45"><circle cx="16" cy="54" r="3"/><circle cx="44" cy="54" r="3"/><circle cx="72" cy="54" r="3"/></g>' +
      '</svg>',
    fingers: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<g fill="#FFCC80">' +
      '<rect x="28" y="34" width="9" height="30" rx="4.5"/>' +
      '<rect x="38" y="22" width="9" height="42" rx="4.5"/>' +
      '<rect x="48" y="18" width="9" height="46" rx="4.5"/>' +
      '<rect x="58" y="24" width="9" height="40" rx="4.5"/>' +
      '<rect x="68" y="36" width="9" height="28" rx="4.5"/>' +
      '<rect x="22" y="50" width="56" height="40" rx="16"/>' +
      '</g></svg>',
    cake: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="30" y="18" width="5" height="18" rx="2" fill="#64B5F6"/>' +
      '<rect x="47" y="18" width="5" height="18" rx="2" fill="#FFD54F"/>' +
      '<rect x="65" y="18" width="5" height="18" rx="2" fill="#81C784"/>' +
      '<ellipse cx="32.5" cy="14" rx="3.5" ry="5" fill="#FF7043"/>' +
      '<ellipse cx="49.5" cy="14" rx="3.5" ry="5" fill="#FF7043"/>' +
      '<ellipse cx="67.5" cy="14" rx="3.5" ry="5" fill="#FF7043"/>' +
      '<rect x="16" y="36" width="68" height="18" rx="6" fill="#FFF3E0"/>' +
      '<rect x="16" y="54" width="68" height="30" rx="6" fill="#F48FB1"/>' +
      '<text x="50" y="76" text-anchor="middle" font-size="22" font-weight="800" fill="#fff" font-family="Nunito, sans-serif">10</text>' +
      '</svg>',
    thermo: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="40" y="8" width="16" height="66" rx="8" fill="#fff" stroke="#607D8B" stroke-width="3"/>' +
      '<rect x="46" y="50" width="8" height="32" fill="#1E88E5"/>' +
      '<circle cx="48" cy="84" r="12" fill="#1E88E5" stroke="#607D8B" stroke-width="3"/>' +
      '<text x="80" y="58" text-anchor="middle" font-size="22" font-weight="800" fill="#1E88E5" font-family="Nunito, sans-serif">−5°</text>' +
      '</svg>',
    basement: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<polygon points="18,12 50,0 82,12" fill="#E57373"/>' +
      '<rect x="24" y="12" width="52" height="28" fill="#90CAF9"/>' +
      '<rect x="40" y="24" width="8" height="16" fill="#fff"/>' +
      '<rect x="6" y="40" width="88" height="6" rx="3" fill="#8D6E63"/>' +
      '<rect x="24" y="46" width="52" height="30" fill="#455A64"/>' +
      '<text x="50" y="68" text-anchor="middle" font-size="22" font-weight="800" fill="#FF8A80" font-family="Nunito, sans-serif">−1</text>' +
      '</svg>',
    floors: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="26" y="6" width="48" height="88" rx="4" fill="#FFB74D"/>' +
      '<g fill="#4FC3F7">' +
      '<rect x="36" y="14" width="10" height="14" rx="2"/><rect x="54" y="14" width="10" height="14" rx="2"/>' +
      '<rect x="36" y="42" width="10" height="14" rx="2"/><rect x="54" y="42" width="10" height="14" rx="2"/>' +
      '<rect x="36" y="70" width="10" height="14" rx="2"/><rect x="54" y="70" width="10" height="14" rx="2"/>' +
      '</g>' +
      '<g stroke="#E65100" stroke-width="2"><line x1="26" y1="36" x2="74" y2="36"/><line x1="26" y1="64" x2="74" y2="64"/></g>' +
      '</svg>',
    pizza: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="42" fill="#FFCC80" stroke="#E65100" stroke-width="3"/>' +
      '<path d="M50 50 L50 8 A42 42 0 0 1 92 50 Z" fill="#E53935"/>' +
      '<g fill="#B71C1C"><circle cx="62" cy="28" r="5"/><circle cx="74" cy="40" r="5"/><circle cx="58" cy="40" r="4"/></g>' +
      '<line x1="50" y1="8" x2="50" y2="92" stroke="#E65100" stroke-width="3"/>' +
      '<line x1="8" y1="50" x2="92" y2="50" stroke="#E65100" stroke-width="3"/>' +
      '</svg>',
    clock: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="42" fill="#fff" stroke="#37474F" stroke-width="4"/>' +
      '<path d="M50 50 L50 8 A42 42 0 0 1 92 50 Z" fill="#FFB74D"/>' +
      '<line x1="50" y1="50" x2="84" y2="50" stroke="#37474F" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="50" cy="50" r="4" fill="#37474F"/>' +
      '</svg>',
    coin: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="42" fill="#FFD54F" stroke="#F9A825" stroke-width="6"/>' +
      '<circle cx="50" cy="50" r="30" fill="none" stroke="#F9A825" stroke-width="2"/>' +
      '<text x="50" y="63" text-anchor="middle" font-size="40" font-weight="800" fill="#E65100" font-family="Nunito, sans-serif">€</text>' +
      '</svg>',
    ruler: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="6" y="34" width="88" height="30" rx="5" fill="#FFB300"/>' +
      '<g stroke="#5D4037" stroke-width="2.5" stroke-linecap="round">' +
      '<line x1="14" y1="34" x2="14" y2="46"/><line x1="26" y1="34" x2="26" y2="42"/><line x1="38" y1="34" x2="38" y2="46"/>' +
      '<line x1="50" y1="34" x2="50" y2="42"/><line x1="62" y1="34" x2="62" y2="46"/><line x1="74" y1="34" x2="74" y2="42"/><line x1="86" y1="34" x2="86" y2="46"/>' +
      '</g></svg>',
    pi: '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="38" fill="#EDE7F6" stroke="#7E57C2" stroke-width="4"/>' +
      '<line x1="12" y1="50" x2="88" y2="50" stroke="#5E35B1" stroke-width="3" stroke-linecap="round"/>' +
      '<text x="50" y="42" text-anchor="middle" font-size="24" font-weight="800" fill="#5E35B1" font-family="Nunito, sans-serif">π</text>' +
      '</svg>'
  }
};
