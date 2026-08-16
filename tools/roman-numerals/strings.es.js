/* ============================================================
   Calculia — Textos de Números Romanos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   ============================================================
   Flujo en 4 pantallas (ver doc/es/SPEC.md §3.6, regla 13):
     1. introScreen — qué son los números romanos y para qué se
        siguen usando. Carrusel de los 5 símbolos/combinaciones
        básicos (I, V, X, IV, VI) que el usuario va tocando para
        pasar al siguiente.
     2. famousScreen — ejemplos reales con significado (un siglo,
        un rey o reina real, un reloj) que se recorren con
        Anterior/Siguiente, siempre construidos solo con I/V/X
        para no salirse todavía de lo que la actividad ha
        enseñado.
     3. reminderScreen — la tabla I/V/X con el valor de cada
        letra paso a paso y la regla de resta (IV, IX...). NO hay
        audio: la pista es la propia tabla con colores asociando
        cada letra a su valor decimal.
     4. levelsScreen — 3 grupos de actividad: "Aprender"
        (encadena nivel 1 → 2), "Aplicar" (encadena nivel 3 → 4 →
        5) y "Test" (mezcla los 5 modos base). Los dos primeros
        agrupan sub-niveles para reducir la fatiga de elección; al
        terminar cada sub-nivel la actividad pasa al siguiente
        dentro del mismo grupo sin volver al menú, conservando la
        progresión gradual (regla 13).

   En el test (y en todos los modos), las opciones son siempre
   tres: la respuesta correcta y los dos componentes del número
   romano (sus valores decimales en los modos de respuesta
   numérica, o sus letras en el modo numberToRoman). Para VI
   las alternativas son 5 y 1 (los valores de la V y la I); para
   XI son 10 y 1. Si el número solo tiene una letra distinta
   (I, V, X, XX…), la segunda alternativa se completa con otro
   valor de los que enseña la actividad (1, 5, 10). Así, en vez
   de un "0/∞" fijo, las alternativas son las piezas reales de
   las que se compone la respuesta.

   Cada ronda muestra la mecánica del número paso a paso
   (descomposición) con un color por letra (I→azul, V→verde,
   X→naranja). Las pistas Socráticas guían letra a letra
   ("¿Cuántas I ves?", "¿Hay una V detrás?") en vez de repetir
   el número.

   Práctica con repetición: cada item de los niveles de práctica
   se presenta exactamente 2 veces en la ronda (en orden
   mezclado) para asentar la mecánica, y al fallar se muestra
   inmediatamente la ayuda con la descomposición en colores y el
   total. El test (nivel "Test") mezcla los 4 modos base sin
   repetir items, evaluando lo aprendido tras la práctica.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    "title": "🏛️ Números Romanos",
    "instruction": "Aprende los números romanos y úsalos para reconocer los siglos.",
    "backToLevels": "← Volver a niveles",

    /* ---------- Pantalla 1: introducción (carrusel de símbolos) ---------- */
    "introTitle": "Qué son los números romanos",
    "introText": "Los números romanos son un sistema antiguo que aún se usa hoy. Los verás en relojes, monumentos y libros.",
    "introNext": "Siguiente →",

    /* ---------- Pantalla 2: números romanos famosos ---------- */
    "introFamousTitle": "Un número romano famoso",
    "introFamousSubtitle": "Fíjate en este ejemplo:",
    "introFamousExample": "Felipe VI → el 6 (VI) es el número romano.",
    "famousPrev": "← Anterior",
    "famousNext": "Siguiente →",

    /* ---------- Pantalla 3: recordatorio (el valor de cada letra) ---------- */
    "referenceTitle": "Recuerda el valor de cada letra",
    "referenceText": "Cada letra vale siempre lo mismo. Se suman en orden, salvo si una letra menor va delante de una mayor: entonces resta.",
    "referenceNext": "Empezar a practicar →",
    "symbol{I}": "I vale 1 (se suma)",
    "symbol{V}": "V vale 5 (se suma)",
    "symbol{X}": "X vale 10 (se suma)",
    "ruleSubtract": "Si una letra menor va DELANTE de una mayor, resta:",
    "ruleAdd": "Si va DETRÁS, suma:",
    "exampleSubtract": "IV = 1 − 5 = 4",
    "exampleAdd": "VI = 5 + 1 = 6",

    /* ---------- Pantalla 4: niveles ---------- */
    /* Los niveles se agrupan en 3 botones (en vez de los 6
       anteriores) para reducir la fatiga de elección. Las dos
       primeras opciones agrupan sub-niveles que se encadenan
       automáticamente, conservando la progresión gradual (regla
       13): cada sub-nivel cambia solo una variable. */
    "levelsTitle": "Elige una actividad",
    "test": "Test",
    "testInfo": "Mezcla las 4 actividades en orden aleatorio",
    "level1": "Símbolos I, V, X",
    "level1Info": "Números del 1 al 10",
    "level2": "Números del 11 al 21",
    "level2Info": "Combina X con I y V",
    "level3": "¿Qué siglo es?",
    "level3Info": "Lee el siglo en números romanos",
    "level4": "Escribe el número en romano",
    "level4Info": "Elige el número romano correcto",
    "level5": "Reyes y reinas",
    "level5Info": "Lee su nombre real y adivina su número",
    "read": "Aprende los números romanos",
    "readInfo": "Del 1 al 10, luego del 11 al 21",
    "apply": "Aplícalos en la vida real",
    "applyInfo": "Siglos, escribir el romano, reyes y reinas",
    "done": " ✔ Hecho",
    "chooseAnotherLevel": "Elegir otra actividad",

    /* ---------- Quiz ---------- */
    "whichNumber": "¿Qué número es?",
    "whichCenturyNumber": "¿En qué siglo estamos?",
    "whichRoman": "¿Qué número romano es este?",
    "whichMonarchNumber": "¿Qué número tiene su nombre?",
    "centuryRomanLabel": "Siglo {roman}",
    "correctExplanation": "✅ ¡Correcto! Los números romanos se leen letra a letra: cada letra suma (o resta, si va delante de una mayor).",
    "wrongExplanationPrefix": "❌ No es ese. Fíjate en los colores: ",
    "hintHint": "🤔 Pista: ",
    "finalSummary": "Has ganado {n} estrellas. Ahora tienes {total} estrellas.",
    /* Cabecera y fin del refuerzo de fallos: al terminar la ronda
       normal, los items fallados se vuelven a presentar en una
       mini-ronda hasta acertarlos todos. Las estrellas ya sumadas
       no se pierden. */
    "reinforceTitle": "Refuerzo",
    "reinforceIntro": "Repite estos {n} hasta acertarlos todos.",
    "reinforceDone": "¡Refuerzo terminado! Ya dominas esos números.",
    "contexto": "Estás leyendo números romanos. Los verás en sitios reales: libros, monumentos o relojes.",
    "transferencia": "Esto te servirá para leer números romanos de verdad: en una placa, en un libro o en el siglo de un cuadro.",

    /* Plantilla para la igualdad final de un ejemplo de solo un
       chunk (ver formatEquals en app.js): {total} = resultado. */
    "decompositionEquals": " = {total}",

    /* Carrusel: cada letra con su rol y un ejemplo de uso.
       Las menciones de letras dentro del caption usan los
       placeholders {I}, {V} y {X}; app.js los sustituye por
       spans coloreados (azul/verde/naranja) para que cada
       parte de la explicación ("la {V} vale 5", "la {I}
       vale 1") se lea con el color asociado a esa letra, igual
       que el símbolo grande de arriba y la fórmula del
       recordatorio. En IV, la {I} que resta se pinta además en
       rojo. */
    "carousel": {
      "i": { "label": "I", "caption": "Es la primera letra del sistema. Su valor se aprende abajo." },
      "v": { "label": "V", "caption": "Es la letra del cinco. Su valor se aprende abajo." },
      "x": { "label": "X", "caption": "Es la letra del diez. Su valor se aprende abajo." },
      "iv": { "label": "IV", "caption": "Es el número 4 en números romanos. La {V} vale {v} y la {I} vale {i}. Si la {I} va delante, resta: {v} − {i}." },
      "ix": { "label": "IX", "caption": "Es el número 9 en números romanos. La {X} vale {x} y la {I} vale {i}. Si la {I} va delante, resta: {x} − {i}." },
      "vi": { "label": "VI", "caption": "Es el número 6 en números romanos. La {V} vale {v} y la {I} vale {i}. Si la {I} va detrás, suma: {v} + {i} = {i6}." },
      "xi": { "label": "XI", "caption": "Es el número 11 en números romanos. La {X} vale {x} y la {I} vale {i}. Si la {I} va detrás, suma: {x} + {i} = {i11}." }
    },

    /* Números romanos famosos para aprendizaje significativo.
       Cada frase termina en ":" — la fórmula aritmética coloreada
       ("10 más 10, es decir 20") se genera desde el número romano
       en app.js (formulaColoreada), con cada cifra del color de la
       letra que la aporta. */
    "famous": {
      "century19": "En el siglo XIX se inventó el teléfono. La {X} vale {x} y la {I} vale {i}. La {I} va delante de la última {X}, así que tengo {x} y se resta {i}:",
      "century20": "El siglo pasado, el que vivió la llegada del hombre a la Luna en 1969. La {X} vale {x}, y como las dos {X} van seguidas, suman:",
      "century21": "El siglo en que vivimos. La {X} vale {x} y la {I} vale {i}. Como hay dos {X} y cada una vale {x}, suman:",
      "clock11": "En muchos relojes con números romanos, las 11 se marcan como XI. La {X} vale {x} y la {I} vale {i}. Como la {I} va detrás de la {X}, suma:",
      "clock12": "En muchos relojes con números romanos, las 12 se marcan como XII. La {X} vale {x} y la {I} vale {i}. Como las dos {I} van detrás de la {X}, suman:",
      "carlos3": "Rey de España. La {I} vale {i} y las tres {I} van seguidas, así que suman:",
      "isabel2": "Reina de España. La {I} vale {i} y las dos {I} van seguidas, así que suman:",
      "felipe6": "Rey de España desde 2014. La {V} vale {v} y la {I} vale {i}. Como la {I} va detrás de la {V}, suma:",
      "henry8": "Rey de Inglaterra. La {V} vale {v} y la {I} vale {i}. Como las {I} van detrás de la {V}, suman:"
    },
    /* Frase hablada (TTS) por cada ejemplo de la pantalla de
       famosos. Es lo que dice el botón de audio: lo que se oye debe
       ser una frase natural en el idioma activo, no una traducción
       literal del visible. Aquí se decide por idioma porque el
       visible (item.label en data.js) es la forma corta que se
       muestra en pantalla, no siempre la que suena natural en cada
       idioma. Por ejemplo, el visible "Las XII" funciona en español
       ("Las doce") pero no en inglés: ahí la frase hablada es
       "Twelve o'clock", que ya incluye el número y no necesita
       concatenarse con cardinalFor(12). Si una entrada falta, app.js
       cae al comportamiento genérico (prefijo del label + número
       cardinal/ordinal) — por eso los monarcas no aparecen aquí: su
       visible ("Carlos III", "Henry VIII") ya es la frase hablada
       correcta en su idioma, con el ordinal concatenado. */
    "famousSpeak": {
      "century19": "Siglo diecinueve",
      "century20": "Siglo veinte",
      "century21": "Siglo veintiuno",
      "clock11": "Las once",
      "clock12": "Las doce"
    },
    /* Conector que separa los sumandos de la fórmula coloreada,
       en notación matemática: "10+10+1=21". Los números se generan
       con su color desde app.js; aquí solo va el conector entre
       sumandos. La fórmula termina con "=N", no con ", es decir N",
       también construido por app.js. */
    "formulaSep": "+",

    /* Pistas Socráticas por letra, para que la pista guíe
       la mecánica y no se limite a repetir el número. */
    "pistaI":  "¿Cuántas I ves? ¿Cuánto vale cada I?",
    "pistaV":  "¿Hay una V? ¿Cuánto vale?",
    "pistaX":  "¿Hay una X? ¿Cuánto vale?",
    "pistaIV": "Una I va DELANTE de una V. ¿Suma o resta?",
    "pistaIX": "Una I va DELANTE de una X. ¿Suma o resta?",
    "pistaXI": "Hay una X y una I detrás. ¿Cuánto suman 10 + 1?",
    "pistaGeneral": "Cuenta letra a letra: ¿cuáles suman y cuáles restan?",

    /* Ordinales para siglos y monarcas (audio). El audio del enunciado
       usa estas palabras en lugar de leer las letras (que sonaría
       como 'uve-ié'). 1 = primero, 4 = cuarto, 8 = octavo, etc. */
    "ordinales": {
      "1": "primero",  "2": "segundo",   "3": "tercero",   "4": "cuarto",
      "5": "quinto",   "6": "sexto",     "7": "séptimo",   "8": "octavo",
      "9": "noveno",   "10": "décimo",   "11": "undécimo", "12": "duodécimo",
      "13": "decimotercero", "14": "decimocuarto", "15": "decimoquinto",
      "16": "decimosexto",   "17": "decimoséptimo","18": "decimoctavo",
      "19": "decimonoveno",  "20": "vigésimo",    "21": "vigésimo primero"
    },
    /* Cardinales 1-21 para el modo numberToRoman: ahí el enunciado
       es un número decimal (p. ej. "19") y se pronuncia como
       "diecinueve", no como ordinal. */
    "cardinales": {
      "1": "uno",     "2": "dos",      "3": "tres",     "4": "cuatro",
      "5": "cinco",   "6": "seis",     "7": "siete",    "8": "ocho",
      "9": "nueve",   "10": "diez",    "11": "once",    "12": "doce",
      "13": "trece",  "14": "catorce", "15": "quince",  "16": "dieciséis",
      "17": "diecisiete", "18": "dieciocho", "19": "diecinueve",
      "20": "veinte", "21": "veintiuno"
    },

    /* Contexto por siglo y por monarca (sin audio, se muestra) */
    "centuryContext": {
      "5":  "En el siglo V cayó el Imperio Romano de Occidente.",
      "15": "En el siglo XV, Cristóbal Colón llegó a América.",
      "18": "En el siglo XVIII reinó el Rey Carlos III.",
      "19": "En el siglo XIX reinaron Fernando VII e Isabel II.",
      "20": "En el siglo XX el ser humano pisó la Luna por primera vez.",
      "21": "El siglo XXI es el siglo en que vivimos. Empezó en el año 2001."
    },
    "monarchContext": {
      "m1": "Isabel I fue Reina de Castilla. Ayudó a preparar el viaje de Cristóbal Colón a América.",
      "m2": "Isabel II fue Reina de España en el siglo XIX.",
      "m3": "Carlos III fue Rey de España en el siglo XVIII.",
      "m4": "Felipe IV fue Rey de España. En su corte trabajó el pintor Velázquez.",
      "m5": "Felipe V fue el primer Rey Borbón de España.",
      "m6": "Felipe VI es el Rey de España desde el año 2014.",
      "m7": "Fernando VII fue Rey de España en el siglo XIX.",
      "m8": "Alfonso VIII fue Rey de Castilla en la Edad Media."
    }
  }, 'es');
})();
