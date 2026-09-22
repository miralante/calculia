/* ============================================================
   Datos: series de patrones para complete (4 levels).
   Formato: DATA[locale].levels = [{ id, name, description, stars, series }]
   Cada serie: { patron: string[] (termina en '❓'), opciones: string[3], correcta: indice }
   Nivel 1: parejas de color/shape alternas (AB).
   Nivel 2: series de tres elementos (ABC) y progresiones de tamano (circulos).
   Nivel 3: series numericas (+1, +2, +5, +10, dobles).
   Nivel 4: codificación/decodificación símbolo→letra (cierra el hueco de la
   taxonomía). Cada patrón repite un par [símbolo, letra]
   dos veces completas (p. ej. ★ A ● B ★ A ● ❓) para enseñar la
   correspondencia dentro del propio ítem, y termina pidiendo la letra
   que falta — sigue siendo "continue la secuencia, 3 opciones", el
   mismo motor sin cambios; solo cambia el tipo de contenido a decodificar
   (regla 13: una sola variable respecto al nivel 3).
   Las series (patron/opciones/correcta) son símbolos y números: no cambian
   entre idiomas. Solo el name y la descripción de cada nivel se traducen
   (ver NOMBRES_NIVEL). Para ampliar: añadir series al array del nivel
   correspondiente en LEVELS_BASE.
   ============================================================ */
const LEVELS_BASE = [
    {
      "id": 1,
      "stars": 1,
      "series": [
        {
          "pattern": [
            "🔵",
            "🔴",
            "🔵",
            "🔴",
            "🔵",
            "❓"
          ],
          "options": [
            "🔴",
            "🍇",
            "🎈"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🔴",
            "🔵",
            "🔴",
            "🔵",
            "🔴",
            "❓"
          ],
          "options": [
            "🔵",
            "🍇",
            "🎈"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🟢",
            "🟡",
            "🟢",
            "🟡",
            "🟢",
            "❓"
          ],
          "options": [
            "🟡",
            "🐢",
            "🧦"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🟡",
            "🟢",
            "🟡",
            "🟢",
            "🟡",
            "❓"
          ],
          "options": [
            "🟢",
            "🐢",
            "🧦"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "⭐",
            "🌙",
            "⭐",
            "🌙",
            "⭐",
            "❓"
          ],
          "options": [
            "🌙",
            "🌵",
            "🦴"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🌙",
            "⭐",
            "🌙",
            "⭐",
            "🌙",
            "❓"
          ],
          "options": [
            "⭐",
            "🌵",
            "🦴"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🍎",
            "🍌",
            "🍎",
            "🍌",
            "🍎",
            "❓"
          ],
          "options": [
            "🍌",
            "🎈",
            "🥕"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🍌",
            "🍎",
            "🍌",
            "🍎",
            "🍌",
            "❓"
          ],
          "options": [
            "🍎",
            "🎈",
            "🥕"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🐱",
            "🐶",
            "🐱",
            "🐶",
            "🐱",
            "❓"
          ],
          "options": [
            "🐶",
            "🧦",
            "🐝"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🐶",
            "🐱",
            "🐶",
            "🐱",
            "🐶",
            "❓"
          ],
          "options": [
            "🐱",
            "🧦",
            "🐝"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "☀️",
            "☁️",
            "☀️",
            "☁️",
            "☀️",
            "❓"
          ],
          "options": [
            "☁️",
            "🦴",
            "🍉"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "☁️",
            "☀️",
            "☁️",
            "☀️",
            "☁️",
            "❓"
          ],
          "options": [
            "☀️",
            "🦴",
            "🍉"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🟣",
            "🟠",
            "🟣",
            "🟠",
            "🟣",
            "❓"
          ],
          "options": [
            "🟠",
            "🥕",
            "🎲"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🟠",
            "🟣",
            "🟠",
            "🟣",
            "🟠",
            "❓"
          ],
          "options": [
            "🟣",
            "🥕",
            "🎲"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🐟",
            "🦋",
            "🐟",
            "🦋",
            "🐟",
            "❓"
          ],
          "options": [
            "🦋",
            "🐝",
            "🍇"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🦋",
            "🐟",
            "🦋",
            "🐟",
            "🦋",
            "❓"
          ],
          "options": [
            "🐟",
            "🐝",
            "🍇"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🌸",
            "🍀",
            "🌸",
            "🍀",
            "🌸",
            "❓"
          ],
          "options": [
            "🍀",
            "🍉",
            "🐢"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🍀",
            "🌸",
            "🍀",
            "🌸",
            "🍀",
            "❓"
          ],
          "options": [
            "🌸",
            "🍉",
            "🐢"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🔺",
            "🔻",
            "🔺",
            "🔻",
            "🔺",
            "❓"
          ],
          "options": [
            "🔻",
            "🎲",
            "🌵"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🔻",
            "🔺",
            "🔻",
            "🔺",
            "🔻",
            "❓"
          ],
          "options": [
            "🔺",
            "🎲",
            "🌵"
          ],
          "correct": 0
        }
      ]
    },
    {
      "id": 2,
      "stars": 2,
      "series": [
        {
          "pattern": [
            "🔵",
            "🔴",
            "🟡",
            "🔵",
            "🔴",
            "🟡",
            "❓"
          ],
          "options": [
            "🔵",
            "🍇",
            "🧦"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🔴",
            "🟡",
            "🔵",
            "🔴",
            "🟡",
            "🔵",
            "❓"
          ],
          "options": [
            "🔴",
            "🍇",
            "🧦"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🟢",
            "🟣",
            "🟠",
            "🟢",
            "🟣",
            "🟠",
            "❓"
          ],
          "options": [
            "🟢",
            "🐢",
            "🦴"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🟣",
            "🟠",
            "🟢",
            "🟣",
            "🟠",
            "🟢",
            "❓"
          ],
          "options": [
            "🟣",
            "🐢",
            "🦴"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "⭐",
            "🌙",
            "☀️",
            "⭐",
            "🌙",
            "☀️",
            "❓"
          ],
          "options": [
            "⭐",
            "🌵",
            "🥕"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🌙",
            "☀️",
            "⭐",
            "🌙",
            "☀️",
            "⭐",
            "❓"
          ],
          "options": [
            "🌙",
            "🌵",
            "🥕"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🍎",
            "🍌",
            "🍇",
            "🍎",
            "🍌",
            "🍇",
            "❓"
          ],
          "options": [
            "🍎",
            "🧦",
            "🍉"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🍌",
            "🍇",
            "🍎",
            "🍌",
            "🍇",
            "🍎",
            "❓"
          ],
          "options": [
            "🍌",
            "🧦",
            "🍉"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🐱",
            "🐶",
            "🐰",
            "🐱",
            "🐶",
            "🐰",
            "❓"
          ],
          "options": [
            "🐱",
            "🧦",
            "🍉"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🐶",
            "🐰",
            "🐱",
            "🐶",
            "🐰",
            "🐱",
            "❓"
          ],
          "options": [
            "🐶",
            "🧦",
            "🍉"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "⚪",
            "🔘",
            "⚫",
            "⚪",
            "🔘",
            "⚫",
            "❓"
          ],
          "options": [
            "⚪",
            "🦴",
            "🎲"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🔘",
            "⚫",
            "⚪",
            "🔘",
            "⚫",
            "⚪",
            "❓"
          ],
          "options": [
            "🔘",
            "🦴",
            "🎲"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🔺",
            "🔻",
            "🔶",
            "🔺",
            "🔻",
            "🔶",
            "❓"
          ],
          "options": [
            "🔺",
            "🥕",
            "🍇"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🔻",
            "🔶",
            "🔺",
            "🔻",
            "🔶",
            "🔺",
            "❓"
          ],
          "options": [
            "🔻",
            "🥕",
            "🍇"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🐟",
            "🦋",
            "🐝",
            "🐟",
            "🦋",
            "🐝",
            "❓"
          ],
          "options": [
            "🐟",
            "🍉",
            "🌵"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🦋",
            "🐝",
            "🐟",
            "🦋",
            "🐝",
            "🐟",
            "❓"
          ],
          "options": [
            "🦋",
            "🍉",
            "🌵"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🌸",
            "🍀",
            "🌵",
            "🌸",
            "🍀",
            "🌵",
            "❓"
          ],
          "options": [
            "🌸",
            "🎲",
            "🧦"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🍀",
            "🌵",
            "🌸",
            "🍀",
            "🌵",
            "🌸",
            "❓"
          ],
          "options": [
            "🍀",
            "🎲",
            "🧦"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🎈",
            "🧦",
            "🎲",
            "🎈",
            "🧦",
            "🎲",
            "❓"
          ],
          "options": [
            "🎈",
            "🌵",
            "🍉"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "🧦",
            "🎲",
            "🎈",
            "🧦",
            "🎲",
            "🎈",
            "❓"
          ],
          "options": [
            "🧦",
            "🌵",
            "🍉"
          ],
          "correct": 0
        }
      ]
    },
    {
      "id": 3,
      "stars": 3,
      "series": [
        {
          "pattern": [
            "1",
            "2",
            "3",
            "4",
            "❓"
          ],
          "options": [
            "5",
            "4",
            "6"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "3",
            "4",
            "5",
            "6",
            "❓"
          ],
          "options": [
            "7",
            "6",
            "8"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "5",
            "6",
            "7",
            "8",
            "❓"
          ],
          "options": [
            "9",
            "8",
            "10"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "10",
            "11",
            "12",
            "13",
            "❓"
          ],
          "options": [
            "14",
            "13",
            "15"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "20",
            "21",
            "22",
            "23",
            "❓"
          ],
          "options": [
            "24",
            "23",
            "25"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "0",
            "2",
            "4",
            "6",
            "❓"
          ],
          "options": [
            "8",
            "6",
            "10"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "2",
            "4",
            "6",
            "8",
            "❓"
          ],
          "options": [
            "10",
            "8",
            "12"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "4",
            "6",
            "8",
            "10",
            "❓"
          ],
          "options": [
            "12",
            "10",
            "14"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "10",
            "12",
            "14",
            "16",
            "❓"
          ],
          "options": [
            "18",
            "16",
            "20"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "21",
            "23",
            "25",
            "27",
            "❓"
          ],
          "options": [
            "29",
            "27",
            "31"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "0",
            "5",
            "10",
            "15",
            "❓"
          ],
          "options": [
            "20",
            "15",
            "25"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "5",
            "10",
            "15",
            "20",
            "❓"
          ],
          "options": [
            "25",
            "20",
            "30"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "10",
            "15",
            "20",
            "25",
            "❓"
          ],
          "options": [
            "30",
            "25",
            "35"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "0",
            "10",
            "20",
            "30",
            "❓"
          ],
          "options": [
            "40",
            "30",
            "50"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "10",
            "20",
            "30",
            "40",
            "❓"
          ],
          "options": [
            "50",
            "40",
            "60"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "5",
            "15",
            "25",
            "35",
            "❓"
          ],
          "options": [
            "45",
            "35",
            "55"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "1",
            "2",
            "4",
            "8",
            "❓"
          ],
          "options": [
            "16",
            "8",
            "24"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "2",
            "4",
            "8",
            "16",
            "❓"
          ],
          "options": [
            "32",
            "16",
            "48"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "3",
            "6",
            "12",
            "24",
            "❓"
          ],
          "options": [
            "48",
            "24",
            "72"
          ],
          "correct": 0
        },
        {
          "pattern": [
            "5",
            "10",
            "20",
            "40",
            "❓"
          ],
          "options": [
            "80",
            "40",
            "120"
          ],
          "correct": 0
        }
      ]
    },
    {
      "id": 4,
      "stars": 4,
      "series": [
        { "pattern": ["★", "A", "●", "B", "★", "A", "●", "❓"], "options": ["B", "A", "C"], "correct": 0 },
        { "pattern": ["●", "B", "★", "A", "●", "B", "★", "❓"], "options": ["A", "B", "C"], "correct": 0 },
        { "pattern": ["▲", "C", "■", "D", "▲", "C", "■", "❓"], "options": ["D", "C", "A"], "correct": 0 },
        { "pattern": ["■", "D", "▲", "C", "■", "D", "▲", "❓"], "options": ["C", "D", "B"], "correct": 0 },
        { "pattern": ["♦", "E", "♥", "F", "♦", "E", "♥", "❓"], "options": ["F", "E", "A"], "correct": 0 },
        { "pattern": ["♥", "F", "♦", "E", "♥", "F", "♦", "❓"], "options": ["E", "F", "C"], "correct": 0 },
        { "pattern": ["☀", "G", "☾", "H", "☀", "G", "☾", "❓"], "options": ["H", "G", "D"], "correct": 0 },
        { "pattern": ["☾", "H", "☀", "G", "☾", "H", "☀", "❓"], "options": ["G", "H", "E"], "correct": 0 },
        { "pattern": ["★", "A", "▲", "C", "★", "A", "▲", "❓"], "options": ["C", "A", "B"], "correct": 0 },
        { "pattern": ["●", "B", "■", "D", "●", "B", "■", "❓"], "options": ["D", "B", "A"], "correct": 0 },
        { "pattern": ["♦", "E", "☀", "G", "♦", "E", "☀", "❓"], "options": ["G", "E", "H"], "correct": 0 },
        { "pattern": ["♥", "F", "☾", "H", "♥", "F", "☾", "❓"], "options": ["H", "F", "G"], "correct": 0 }
      ]
    }
];

/* Description of each activity, per language (id -> description). */
const DESCRIPCION_NIVEL = {
  es: { 1: 'Colores y shapes', 2: 'Series de 3 y tamaños', 3: 'Números', 4: 'Descifra el código' },
  en: { 1: 'Colours and shapes', 2: 'Sets of 3 and sizes', 3: 'Numbers', 4: 'Crack the code' }
};

function nivelesPatrones(loc) {
  var descripciones = DESCRIPCION_NIVEL[loc] || DESCRIPCION_NIVEL.es;
  return LEVELS_BASE.map(function (n) {
    return {
      id: n.id,
      description: descripciones[n.id],
      stars: n.stars,
      series: n.series
    };
  });
}

const DATA = {
  es: { levels: nivelesPatrones('es') },
  en: { levels: nivelesPatrones('en') }
};
