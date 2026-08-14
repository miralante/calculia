/* ============================================================
   Datos: series de patrones para completar (4 niveles).
   Formato: DATA[locale].niveles = [{ id, nombre, descripcion, estrellas, series }]
   Cada serie: { patron: string[] (termina en '❓'), opciones: string[3], correcta: indice }
   Nivel 1: parejas de color/forma alternas (AB).
   Nivel 2: series de tres elementos (ABC) y progresiones de tamano (circulos).
   Nivel 3: series numericas (+1, +2, +5, +10, dobles).
   Nivel 4: codificación/decodificación símbolo→letra (cierra el hueco de la
   taxonomía). Cada patrón repite un par [símbolo, letra]
   dos veces completas (p. ej. ★ A ● B ★ A ● ❓) para enseñar la
   correspondencia dentro del propio ítem, y termina pidiendo la letra
   que falta — sigue siendo "continuar la secuencia, 3 opciones", el
   mismo motor sin cambios; solo cambia el tipo de contenido a decodificar
   (regla 13: una sola variable respecto al nivel 3).
   Las series (patron/opciones/correcta) son símbolos y números: no cambian
   entre idiomas. Solo el nombre y la descripción de cada nivel se traducen
   (ver NOMBRES_NIVEL). Para ampliar: añadir series al array del nivel
   correspondiente en NIVELES_BASE.
   ============================================================ */
const NIVELES_BASE = [
    {
      "id": 1,
      "estrellas": 1,
      "series": [
        {
          "patron": [
            "🔵",
            "🔴",
            "🔵",
            "🔴",
            "🔵",
            "❓"
          ],
          "opciones": [
            "🔴",
            "🍇",
            "🎈"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🔴",
            "🔵",
            "🔴",
            "🔵",
            "🔴",
            "❓"
          ],
          "opciones": [
            "🔵",
            "🍇",
            "🎈"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🟢",
            "🟡",
            "🟢",
            "🟡",
            "🟢",
            "❓"
          ],
          "opciones": [
            "🟡",
            "🐢",
            "🧦"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🟡",
            "🟢",
            "🟡",
            "🟢",
            "🟡",
            "❓"
          ],
          "opciones": [
            "🟢",
            "🐢",
            "🧦"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "⭐",
            "🌙",
            "⭐",
            "🌙",
            "⭐",
            "❓"
          ],
          "opciones": [
            "🌙",
            "🌵",
            "🦴"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🌙",
            "⭐",
            "🌙",
            "⭐",
            "🌙",
            "❓"
          ],
          "opciones": [
            "⭐",
            "🌵",
            "🦴"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🍎",
            "🍌",
            "🍎",
            "🍌",
            "🍎",
            "❓"
          ],
          "opciones": [
            "🍌",
            "🎈",
            "🥕"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🍌",
            "🍎",
            "🍌",
            "🍎",
            "🍌",
            "❓"
          ],
          "opciones": [
            "🍎",
            "🎈",
            "🥕"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🐱",
            "🐶",
            "🐱",
            "🐶",
            "🐱",
            "❓"
          ],
          "opciones": [
            "🐶",
            "🧦",
            "🐝"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🐶",
            "🐱",
            "🐶",
            "🐱",
            "🐶",
            "❓"
          ],
          "opciones": [
            "🐱",
            "🧦",
            "🐝"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "☀️",
            "☁️",
            "☀️",
            "☁️",
            "☀️",
            "❓"
          ],
          "opciones": [
            "☁️",
            "🦴",
            "🍉"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "☁️",
            "☀️",
            "☁️",
            "☀️",
            "☁️",
            "❓"
          ],
          "opciones": [
            "☀️",
            "🦴",
            "🍉"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🟣",
            "🟠",
            "🟣",
            "🟠",
            "🟣",
            "❓"
          ],
          "opciones": [
            "🟠",
            "🥕",
            "🎲"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🟠",
            "🟣",
            "🟠",
            "🟣",
            "🟠",
            "❓"
          ],
          "opciones": [
            "🟣",
            "🥕",
            "🎲"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🐟",
            "🦋",
            "🐟",
            "🦋",
            "🐟",
            "❓"
          ],
          "opciones": [
            "🦋",
            "🐝",
            "🍇"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🦋",
            "🐟",
            "🦋",
            "🐟",
            "🦋",
            "❓"
          ],
          "opciones": [
            "🐟",
            "🐝",
            "🍇"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🌸",
            "🍀",
            "🌸",
            "🍀",
            "🌸",
            "❓"
          ],
          "opciones": [
            "🍀",
            "🍉",
            "🐢"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🍀",
            "🌸",
            "🍀",
            "🌸",
            "🍀",
            "❓"
          ],
          "opciones": [
            "🌸",
            "🍉",
            "🐢"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🔺",
            "🔻",
            "🔺",
            "🔻",
            "🔺",
            "❓"
          ],
          "opciones": [
            "🔻",
            "🎲",
            "🌵"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🔻",
            "🔺",
            "🔻",
            "🔺",
            "🔻",
            "❓"
          ],
          "opciones": [
            "🔺",
            "🎲",
            "🌵"
          ],
          "correcta": 0
        }
      ]
    },
    {
      "id": 2,
      "estrellas": 2,
      "series": [
        {
          "patron": [
            "🔵",
            "🔴",
            "🟡",
            "🔵",
            "🔴",
            "🟡",
            "❓"
          ],
          "opciones": [
            "🔵",
            "🍇",
            "🧦"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🔴",
            "🟡",
            "🔵",
            "🔴",
            "🟡",
            "🔵",
            "❓"
          ],
          "opciones": [
            "🔴",
            "🍇",
            "🧦"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🟢",
            "🟣",
            "🟠",
            "🟢",
            "🟣",
            "🟠",
            "❓"
          ],
          "opciones": [
            "🟢",
            "🐢",
            "🦴"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🟣",
            "🟠",
            "🟢",
            "🟣",
            "🟠",
            "🟢",
            "❓"
          ],
          "opciones": [
            "🟣",
            "🐢",
            "🦴"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "⭐",
            "🌙",
            "☀️",
            "⭐",
            "🌙",
            "☀️",
            "❓"
          ],
          "opciones": [
            "⭐",
            "🌵",
            "🥕"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🌙",
            "☀️",
            "⭐",
            "🌙",
            "☀️",
            "⭐",
            "❓"
          ],
          "opciones": [
            "🌙",
            "🌵",
            "🥕"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🍎",
            "🍌",
            "🍇",
            "🍎",
            "🍌",
            "🍇",
            "❓"
          ],
          "opciones": [
            "🍎",
            "🧦",
            "🍉"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🍌",
            "🍇",
            "🍎",
            "🍌",
            "🍇",
            "🍎",
            "❓"
          ],
          "opciones": [
            "🍌",
            "🧦",
            "🍉"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🐱",
            "🐶",
            "🐰",
            "🐱",
            "🐶",
            "🐰",
            "❓"
          ],
          "opciones": [
            "🐱",
            "🧦",
            "🍉"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🐶",
            "🐰",
            "🐱",
            "🐶",
            "🐰",
            "🐱",
            "❓"
          ],
          "opciones": [
            "🐶",
            "🧦",
            "🍉"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "⚪",
            "🔘",
            "⚫",
            "⚪",
            "🔘",
            "⚫",
            "❓"
          ],
          "opciones": [
            "⚪",
            "🦴",
            "🎲"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🔘",
            "⚫",
            "⚪",
            "🔘",
            "⚫",
            "⚪",
            "❓"
          ],
          "opciones": [
            "🔘",
            "🦴",
            "🎲"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🔺",
            "🔻",
            "🔶",
            "🔺",
            "🔻",
            "🔶",
            "❓"
          ],
          "opciones": [
            "🔺",
            "🥕",
            "🍇"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🔻",
            "🔶",
            "🔺",
            "🔻",
            "🔶",
            "🔺",
            "❓"
          ],
          "opciones": [
            "🔻",
            "🥕",
            "🍇"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🐟",
            "🦋",
            "🐝",
            "🐟",
            "🦋",
            "🐝",
            "❓"
          ],
          "opciones": [
            "🐟",
            "🍉",
            "🌵"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🦋",
            "🐝",
            "🐟",
            "🦋",
            "🐝",
            "🐟",
            "❓"
          ],
          "opciones": [
            "🦋",
            "🍉",
            "🌵"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🌸",
            "🍀",
            "🌵",
            "🌸",
            "🍀",
            "🌵",
            "❓"
          ],
          "opciones": [
            "🌸",
            "🎲",
            "🧦"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🍀",
            "🌵",
            "🌸",
            "🍀",
            "🌵",
            "🌸",
            "❓"
          ],
          "opciones": [
            "🍀",
            "🎲",
            "🧦"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🎈",
            "🧦",
            "🎲",
            "🎈",
            "🧦",
            "🎲",
            "❓"
          ],
          "opciones": [
            "🎈",
            "🌵",
            "🍉"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "🧦",
            "🎲",
            "🎈",
            "🧦",
            "🎲",
            "🎈",
            "❓"
          ],
          "opciones": [
            "🧦",
            "🌵",
            "🍉"
          ],
          "correcta": 0
        }
      ]
    },
    {
      "id": 3,
      "estrellas": 3,
      "series": [
        {
          "patron": [
            "1",
            "2",
            "3",
            "4",
            "❓"
          ],
          "opciones": [
            "5",
            "4",
            "6"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "3",
            "4",
            "5",
            "6",
            "❓"
          ],
          "opciones": [
            "7",
            "6",
            "8"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "5",
            "6",
            "7",
            "8",
            "❓"
          ],
          "opciones": [
            "9",
            "8",
            "10"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "10",
            "11",
            "12",
            "13",
            "❓"
          ],
          "opciones": [
            "14",
            "13",
            "15"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "20",
            "21",
            "22",
            "23",
            "❓"
          ],
          "opciones": [
            "24",
            "23",
            "25"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "0",
            "2",
            "4",
            "6",
            "❓"
          ],
          "opciones": [
            "8",
            "6",
            "10"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "2",
            "4",
            "6",
            "8",
            "❓"
          ],
          "opciones": [
            "10",
            "8",
            "12"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "4",
            "6",
            "8",
            "10",
            "❓"
          ],
          "opciones": [
            "12",
            "10",
            "14"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "10",
            "12",
            "14",
            "16",
            "❓"
          ],
          "opciones": [
            "18",
            "16",
            "20"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "21",
            "23",
            "25",
            "27",
            "❓"
          ],
          "opciones": [
            "29",
            "27",
            "31"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "0",
            "5",
            "10",
            "15",
            "❓"
          ],
          "opciones": [
            "20",
            "15",
            "25"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "5",
            "10",
            "15",
            "20",
            "❓"
          ],
          "opciones": [
            "25",
            "20",
            "30"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "10",
            "15",
            "20",
            "25",
            "❓"
          ],
          "opciones": [
            "30",
            "25",
            "35"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "0",
            "10",
            "20",
            "30",
            "❓"
          ],
          "opciones": [
            "40",
            "30",
            "50"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "10",
            "20",
            "30",
            "40",
            "❓"
          ],
          "opciones": [
            "50",
            "40",
            "60"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "5",
            "15",
            "25",
            "35",
            "❓"
          ],
          "opciones": [
            "45",
            "35",
            "55"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "1",
            "2",
            "4",
            "8",
            "❓"
          ],
          "opciones": [
            "16",
            "8",
            "24"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "2",
            "4",
            "8",
            "16",
            "❓"
          ],
          "opciones": [
            "32",
            "16",
            "48"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "3",
            "6",
            "12",
            "24",
            "❓"
          ],
          "opciones": [
            "48",
            "24",
            "72"
          ],
          "correcta": 0
        },
        {
          "patron": [
            "5",
            "10",
            "20",
            "40",
            "❓"
          ],
          "opciones": [
            "80",
            "40",
            "120"
          ],
          "correcta": 0
        }
      ]
    },
    {
      "id": 4,
      "estrellas": 4,
      "series": [
        { "patron": ["★", "A", "●", "B", "★", "A", "●", "❓"], "opciones": ["B", "A", "C"], "correcta": 0 },
        { "patron": ["●", "B", "★", "A", "●", "B", "★", "❓"], "opciones": ["A", "B", "C"], "correcta": 0 },
        { "patron": ["▲", "C", "■", "D", "▲", "C", "■", "❓"], "opciones": ["D", "C", "A"], "correcta": 0 },
        { "patron": ["■", "D", "▲", "C", "■", "D", "▲", "❓"], "opciones": ["C", "D", "B"], "correcta": 0 },
        { "patron": ["♦", "E", "♥", "F", "♦", "E", "♥", "❓"], "opciones": ["F", "E", "A"], "correcta": 0 },
        { "patron": ["♥", "F", "♦", "E", "♥", "F", "♦", "❓"], "opciones": ["E", "F", "C"], "correcta": 0 },
        { "patron": ["☀", "G", "☾", "H", "☀", "G", "☾", "❓"], "opciones": ["H", "G", "D"], "correcta": 0 },
        { "patron": ["☾", "H", "☀", "G", "☾", "H", "☀", "❓"], "opciones": ["G", "H", "E"], "correcta": 0 },
        { "patron": ["★", "A", "▲", "C", "★", "A", "▲", "❓"], "opciones": ["C", "A", "B"], "correcta": 0 },
        { "patron": ["●", "B", "■", "D", "●", "B", "■", "❓"], "opciones": ["D", "B", "A"], "correcta": 0 },
        { "patron": ["♦", "E", "☀", "G", "♦", "E", "☀", "❓"], "opciones": ["G", "E", "H"], "correcta": 0 },
        { "patron": ["♥", "F", "☾", "H", "♥", "F", "☾", "❓"], "opciones": ["H", "F", "G"], "correcta": 0 }
      ]
    }
];

/* Description of each activity, per language (id -> descripcion). */
const DESCRIPCION_NIVEL = {
  es: { 1: 'Colores y formas', 2: 'Series de 3 y tamaños', 3: 'Números', 4: 'Descifra el código' },
  en: { 1: 'Colours and shapes', 2: 'Sets of 3 and sizes', 3: 'Numbers', 4: 'Crack the code' }
};

function nivelesPatrones(loc) {
  var descripciones = DESCRIPCION_NIVEL[loc] || DESCRIPCION_NIVEL.es;
  return NIVELES_BASE.map(function (n) {
    return {
      id: n.id,
      descripcion: descripciones[n.id],
      estrellas: n.estrellas,
      series: n.series
    };
  });
}

const DATA = {
  es: { niveles: nivelesPatrones('es') },
  en: { niveles: nivelesPatrones('en') }
};
