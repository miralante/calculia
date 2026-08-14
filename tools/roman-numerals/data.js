/* ============================================================
   Datos: Números Romanos (orientado a reconocer siglos y
   reyes/reinas reales).
   Los símbolos y números son iguales en cualquier idioma: no se
   duplican por idioma (patrón 3 de I18N.md §1.4). Solo el texto
   que envuelve al número ("Siglo {roman}") vive en
   strings.<locale>.js.
   Formato:
   DATA.symbols = [{ roman, value }] — tabla de referencia I/V/X.
   DATA.numbers = [{ n, roman }] — correspondencia 1..21 (hasta 21
     porque hoy vivimos en el siglo XXI; no hace falta L/C/D/M).
   DATA.monarchs = { es: [...], en: [...] } — 8 reyes/reinas reales
     por idioma, cada uno { id, name, n }. Contenido cultural, no
     traducción literal (I18N.md §3): cada idioma usa monarcas de
     su propia referencia cultural (España en es, Reino Unido en
     en), cubriendo del 1 al 8 una vez cada uno. El texto de apoyo
     ("Isabel I fue Reina de Castilla...") vive en
     strings.<locale>.js bajo monarchContext.<id>.
   DATA.famousRomans = [{ roman, factKey }] — números romanos
     reales (siglos, reyes, años, eventos) usados en la pantalla
     de introducción para dar aprendizaje significativo. La frase
     "Siglo XX — el que vivió la llegada a la Luna" vive en
     strings.<locale>.js bajo famous.<factKey>.
   DATA.perRound = tamaño de cada ronda de test.
   DATA.levels = [{ id, pool, min, max, mode, estrellas, sublevels? }]
     - pool 'numbers' (por defecto): la ronda sale de DATA.numbers
       filtrado por min/max. pool 'monarchs': la ronda sale de
       DATA.monarchs[locale actual]. pool 'random': cada item se
       elige al azar de cualquiera de las otras pools. pool 'group':
       el botón representa un grupo de sub-niveles encadenados
       (sublevels: [...]).
     - mode 'romanToNumber': se ve el número romano, se elige el
       número normal (1-10 en nivel 1, 11-21 en nivel 2).
     - mode 'centuryToNumber': se ve "Siglo {roman}", se elige a
       qué siglo (número normal) corresponde. Los siglos siempre se
       escriben en números romanos en la vida real (Siglo XX, nunca
       "Siglo 20"), así que este modo nunca muestra el siglo con su
       número decimal.
     - mode 'numberToRoman': se ve un número normal (sin "Siglo",
       para no sugerir que un siglo se escribe con su número
       decimal), se elige el número romano correcto para ese número.
     - mode 'monarchToNumber': se ve el nombre real de un rey o
       reina (p. ej. "Felipe VI"), se elige el número que representa
       su numeral romano.
     - sublevels (opcional): si está presente, el botón del menú
       representa un GRUPO de niveles encadenados. Al terminar cada
       sub-nivel la actividad pasa automáticamente al siguiente
       dentro del mismo grupo, sin volver al menú — reduce la
       "fatiga de elección" mostrando solo 3 opciones en el menú en
       lugar de 6, mientras se conserva la progresión gradual (regla
       13) dentro del grupo: cada sub-nivel sigue cambiando solo una
       variable cada vez.
     Progresión gradual (regla 13): dentro de cada grupo, cada
     sub-nivel cambia una sola variable — primero el rango (nivel
     1→2: 1-10 a 11-21), luego el contexto de "siglo" (nivel 3),
     luego la dirección de la pregunta (nivel 4), luego la fuente
     pasa de siglos a reyes/reinas reales (nivel 5). pool 'random'
     mezcla los 5 modos base para que el usuario no memorice el
     orden.
   app.js filtra DATA.numbers por nivel.min/max (o usa
   DATA.monarchs para pool 'monarchs') para generar cada ronda; las
   opciones incorrectas salen de otros elementos del mismo grupo,
   nunca inventadas. Cada ronda se reordena al iniciar y, en modo
   'random', los items también se mezclan entre niveles.
   Algunos siglos notables (5, 15, 18, 19, 20, 21 — mismas claves en
   ambos idiomas, solo cambia el dato) tienen además un dato real en
   strings.<locale>.js bajo centuryContext.<n>, mostrado en pantalla
   como apoyo cuando existe.

   ----------------------------------------------------------
   Arithmetic decomposition (DATA.decompose)
   ----------------------------------------------------------
   Decomposes a Roman numeral into tokens (one entry per letter,
   to paint it with its colour) and into chunks (consecutive
   repeated letters of the same sign grouped into a single addend,
   or a subtract-add pair like IV/IX grouped into its already
   resolved value). Chunks are the basis of the arithmetic formula:
   each number is read as the sum of its chunks. Examples:
     "VII"  → chunks: V(5) II(2)
               sum:      "5 + 2"
               total:    7
               mode:     "add"
     "IV"   → chunks: IV(4, par resta-suma)
               subtract: "5 − 1"
               total:    4
               mode:     "subtract"
     "XIV"  → chunks: X(10) IV(4, par resta-suma)
               sum:      "10 + 4"
               total:    14
               mode:     "add" (el par IV ya aporta su valor resuelto
                 como un sumando más; no hace falta un tercer modo)
   Esta función es la base de la "explicación con colores" del
   recordatorio (tokens, letra a letra) y de la fórmula agrupada
   que se muestra en el quiz (chunks), además de las pistas
   Socráticas letra a letra.
   ============================================================ */
var ROMAN_VALUES = { I: 1, V: 5, X: 10 };

function decompose(roman) {
  var letters = String(roman).toUpperCase().split('');
  var tokens = letters.map(function (ch, i) {
    var cur = ROMAN_VALUES[ch];
    var next = ROMAN_VALUES[letters[i + 1]] || 0;
    return { letter: ch, value: cur, sign: cur < next ? '-' : '+' };
  });

  var chunks = [];
  var i = 0;
  while (i < tokens.length) {
    if (tokens[i].sign === '-') {
      /* Subtract-add pair (e.g. IV, IX): always a single smaller letter
         followed by a larger one in a valid Roman numeral. */
      chunks.push({ letters: letters[i] + letters[i + 1], value: tokens[i + 1].value - tokens[i].value, pair: true });
      i += 2;
    } else {
      var j = i;
      while (j < tokens.length && letters[j] === letters[i] && tokens[j].sign === '+') j += 1;
      chunks.push({ letters: letters.slice(i, j).join(''), value: tokens[i].value * (j - i), pair: false });
      i = j;
    }
  }

  var total = chunks.reduce(function (acc, c) { return acc + c.value; }, 0);
  var sum = chunks.map(function (c) { return c.value; }).join(' + ');
  var soloPar = chunks.length === 1 && chunks[0].pair ? chunks[0] : null;
  var subtract = soloPar ? (ROMAN_VALUES[soloPar.letters[1]] + ' − ' + ROMAN_VALUES[soloPar.letters[0]]) : '';
  var mode = soloPar ? 'subtract' : 'add';
  return { tokens: tokens, chunks: chunks, sum: sum, subtract: subtract, total: total, mode: mode };
}

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
  /* Números romanos famosos para aprendizaje significativo.
     Solo se usan en la pantalla de introducción (panel "número
     romano famoso"). El "factKey" apunta a strings.<locale>.js
     bajo "famous.<factKey>". El idioma decide qué monarcas se
     enseñan; los siglos y el reloj son compartidos.
     Todos usan solo I/V/X (1-21): el resto de la actividad no
     enseña L/C/D/M, así que un ejemplo "famoso" con esos símbolos
     (p. ej. MCMLXXXIX) sería ilegible en la primera pantalla, antes
     de que quien aprende haya visto siquiera la tabla I/V/X — rompe
     la progresión gradual (regla 13) y la lectura fácil. */
  famousRomans: [
    /* speak: cómo se pronuncia el número en el TTS del famoso.
       - 'cardinal' para siglos y el reloj: "Siglo 20", "Siglo 21",
         "las 12" — se lee como número, no como ordinal.
       - 'ordinal' para monarcas: "Felipe VI" → "sexto", "Henry VIII"
         → "octavo" — el numeral forma parte del nombre del rey/reina
         y se pronuncia como ordinal.
       Si se omite, por compatibilidad se asume 'ordinal' (el
       comportamiento histórico: cualquier item sin speak se trata
       como si fuera un monarca).
       showFormula (opcional, default true): si true, paintFamoso
       concatena la fórmula coloreada ("10+10+1=21") al final de
       la frase i18n. Si false, la frase ya incluye el cálculo
       numérico explícito y no se duplica con la fórmula. Se usa
       en XXI, donde la frase cierra con "20+1=21".
       label: lo que se muestra como número grande en la pantalla
       (encima del refuerzo significativo). Por defecto es el
       propio romano (item.roman), pero aquí lo cambiamos a su
       forma en contexto para que el lector vea directamente
       "Siglo XXI" / "Las XII" / "Carlos III" en vez de solo
       "XXI" / "XII" / "III" — el refuerzo de abajo ya no
       necesita repetir el "Siglo XX — " / "Carlos III — " al
       principio. */
    { roman: 'XX',   factKey: 'century20', speak: 'cardinal', label: 'Siglo XX' },
    { roman: 'XXI',  factKey: 'century21', speak: 'cardinal', showFormula: false, label: 'Siglo XXI' },
    { roman: 'XI',   factKey: 'clock11',   speak: 'cardinal', label: 'Las XI' },
    { roman: 'XII',  factKey: 'clock12',   speak: 'cardinal', label: 'Las XII' },
    { roman: 'III',  factKey: 'carlos3',   locale: 'es', label: 'Carlos III' },
    { roman: 'II',   factKey: 'isabel2',   locale: 'es', label: 'Isabel II' },
    { roman: 'VI',   factKey: 'felipe6',   locale: 'es', label: 'Felipe VI' },
    { roman: 'VIII', factKey: 'henry8',    locale: 'en', label: 'Henry VIII' },
    { roman: 'XIX',  factKey: 'century19', speak: 'cardinal', showFormula: false, label: 'Siglo XIX' }
  ],
  monarchs: {
    es: [
      { id: 'm1', name: 'Isabel I', n: 1 },
      { id: 'm2', name: 'Isabel II', n: 2 },
      { id: 'm3', name: 'Carlos III', n: 3 },
      { id: 'm4', name: 'Felipe IV', n: 4 },
      { id: 'm5', name: 'Felipe V', n: 5 },
      { id: 'm6', name: 'Felipe VI', n: 6 },
      { id: 'm7', name: 'Fernando VII', n: 7 },
      { id: 'm8', name: 'Alfonso VIII', n: 8 }
    ],
    en: [
      { id: 'm1', name: 'Elizabeth I', n: 1 },
      { id: 'm2', name: 'Elizabeth II', n: 2 },
      { id: 'm3', name: 'Richard III', n: 3 },
      { id: 'm4', name: 'Henry IV', n: 4 },
      { id: 'm5', name: 'Henry V', n: 5 },
      { id: 'm6', name: 'George VI', n: 6 },
      { id: 'm7', name: 'Edward VII', n: 7 },
      { id: 'm8', name: 'Henry VIII', n: 8 }
    ]
  },
  perRound: 8,
  /* Cada item de práctica se repite exactamente N veces durante la
     ronda de práctica antes del test. Mantenerlo en 2 es la
     calibración actual: suficiente para asentar la mecánica sin
     aburrir. El test (nivel 'random') no aplica esta repetición:
     cada item aparece una sola vez para evaluar lo aprendido. */
  repetitions: 2,
  /* Grupos visibles en el menú. Cada grupo se presenta como un único
     botón para reducir la fatiga de elección (el menú mostraba antes
     6 opciones; ahora muestra 3). Cuando el grupo tiene
     'sublevels', la actividad los encadena automáticamente sin
     volver al menú entre ellos, conservando la progresión gradual
     (regla 13): cada sub-nivel cambia solo una variable.

     - read   = aprender a leer números romanos (1-10 → 11-21)
     - apply  = aplicar el número romano en contexto real (siglo →
                escribir romano → reyes/reinas)
     - random = mezcla los 5 modos base en orden aleatorio */
  levels: [
    {
      id: 'read', pool: 'group', estrellas: 1,
      sublevels: [
        { id: 'level1', pool: 'numbers', min: 1, max: 10, mode: 'romanToNumber', estrellas: 1 },
        { id: 'level2', pool: 'numbers', min: 11, max: 21, mode: 'romanToNumber', estrellas: 2 }
      ]
    },
    {
      id: 'apply', pool: 'group', estrellas: 3,
      sublevels: [
        { id: 'level3', pool: 'numbers', min: 1, max: 21, mode: 'centuryToNumber', estrellas: 2 },
        { id: 'level4', pool: 'numbers', min: 1, max: 21, mode: 'numberToRoman', estrellas: 3 },
        { id: 'level5', pool: 'monarchs', mode: 'monarchToNumber', estrellas: 3 }
      ]
    },
    { id: 'test', pool: 'random', mode: 'random', estrellas: 2 }
  ],
  decompose: decompose
};
