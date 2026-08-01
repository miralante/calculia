/* ============================================================
   Datos: Números Romanos (orientado a reconocer siglos).
   Los símbolos y números son iguales en cualquier idioma: no se
   duplican por idioma (patrón 3 de I18N.md §1.4). Solo el texto
   que envuelve al número ("Siglo {roman}") vive en
   strings.<locale>.js.
   Formato:
   DATA.symbols = [{ roman, value }] — tabla de referencia I/V/X.
   DATA.numbers = [{ n, roman }] — correspondencia 1..21 (hasta 21
     porque hoy vivimos en el siglo XXI; no hace falta L/C/D/M).
   DATA.porRonda = tamaño de cada ronda de test.
   DATA.niveles = [{ id, min, max, mode, estrellas }]
     - mode 'romanToNumber': se ve el número romano, se elige el
       número normal (1-10 en nivel 1, 11-21 en nivel 2).
     - mode 'centuryToNumber': se ve "Siglo {roman}", se elige a
       qué siglo (número normal) corresponde.
     - mode 'numberToCentury': se ve "Siglo {n}", se elige el
       número romano correcto para ese siglo.
     Progresión gradual (regla 13): cada nivel cambia una sola
     variable — primero el rango (nivel 1→2), luego el contexto de
     "siglo" (nivel 2→3), luego la dirección de la pregunta
     (nivel 3→4).
   app.js filtra DATA.numbers por nivel.min/max para generar cada
   ronda; las opciones incorrectas salen de otros números del
   mismo rango, nunca inventadas.
   ============================================================ */
var DATA = {
  symbols: [
    { roman: 'I', value: 1 },
    { roman: 'V', value: 5 },
    { roman: 'X', value: 10 }
  ],
  numbers: [
    { n: 1, roman: 'I' }, { n: 2, roman: 'II' }, { n: 3, roman: 'III' }, { n: 4, roman: 'IV' },
    { n: 5, roman: 'V' }, { n: 6, roman: 'VI' }, { n: 7, roman: 'VII' }, { n: 8, roman: 'VIII' },
    { n: 9, roman: 'IX' }, { n: 10, roman: 'X' }, { n: 11, roman: 'XI' }, { n: 12, roman: 'XII' },
    { n: 13, roman: 'XIII' }, { n: 14, roman: 'XIV' }, { n: 15, roman: 'XV' }, { n: 16, roman: 'XVI' },
    { n: 17, roman: 'XVII' }, { n: 18, roman: 'XVIII' }, { n: 19, roman: 'XIX' }, { n: 20, roman: 'XX' },
    { n: 21, roman: 'XXI' }
  ],
  porRonda: 8,
  niveles: [
    { id: 'level1', min: 1, max: 10, mode: 'romanToNumber', estrellas: 1 },
    { id: 'level2', min: 11, max: 21, mode: 'romanToNumber', estrellas: 2 },
    { id: 'level3', min: 1, max: 21, mode: 'centuryToNumber', estrellas: 2 },
    { id: 'level4', min: 1, max: 21, mode: 'numberToCentury', estrellas: 3 }
  ]
};
