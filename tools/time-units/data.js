/* ============================================================
   Calculia — Unidades de tiempo — datos
   Formato:
   - DATA.perRound: preguntas por ronda.
   - DATA.units: las unidades de la explicación, del siglo al segundo,
     con las fracciones del año, del mes, del día y de la hora.
     `picto` es el dibujo de cada tarjeta; el texto está en strings.
     `line` (opcional) es la línea continua con números que se dibuja
     debajo de la tarjeta:
       · { total, band }: una casilla por número, del 1 al total; las
         casillas se agrupan en bloques de `band` (un semestre son 6
         meses, así que band 6 pinta los meses 1-6 y 7-12 en dos tonos).
       · { total, band, marks }: una escala de 0 a total con marcas
         en los valores de `marks` (las horas y los minutos).
   - DATA.pairs: cuántas unidades pequeñas caben en una grande. Cada
     `answer` es la respuesta; la pregunta está en strings (q.<id>).
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  units: [
    { id: 'century', picto: '💯', line: { total: 100, band: 100, marks: [0, 20, 40, 60, 80, 100] } },
    { id: 'decade', picto: '🔟', line: { total: 10, band: 10 } },
    { id: 'lustro', picto: '🖐️', line: { total: 5, band: 5 } },
    { id: 'year', picto: '🗓️', line: { total: 12, band: 12 } },
    { id: 'yearMonths', picto: '📋', grid: 'months', line: { total: 12, band: 12 } },
    { id: 'semester', picto: '6️⃣', line: { total: 12, band: 6 } },
    { id: 'semesterParts', picto: '🧩', grid: 'parts', count: 2, size: 6, line: { total: 12, band: 6 } },
    { id: 'quadrimester', picto: '4️⃣', line: { total: 12, band: 4 } },
    { id: 'quadrimesterParts', picto: '🧩', grid: 'parts', count: 3, size: 4, line: { total: 12, band: 4 } },
    { id: 'trimester', picto: '3️⃣', line: { total: 12, band: 3 } },
    { id: 'trimesterParts', picto: '🧩', grid: 'parts', count: 4, size: 3, line: { total: 12, band: 3 } },
    { id: 'bimester', picto: '2️⃣', line: { total: 12, band: 2 } },
    { id: 'bimesterParts', picto: '🧩', grid: 'parts', count: 6, size: 2, line: { total: 12, band: 2 } },
    { id: 'solstice', picto: '🌞' },
    { id: 'month', picto: '🌙' },
    { id: 'monthDays', picto: '📆', grid: 'days' },
    { id: 'fortnight', picto: '🌓', line: { total: 15, band: 15 } },
    { id: 'week', picto: '📆', line: { total: 7, band: 7 } },
    { id: 'day', picto: '☀️', line: { total: 24, band: 12, marks: [0, 6, 12, 18, 24] } },
    { id: 'hour', picto: '🕐', dial: { part: 1, of: 1 }, line: { total: 60, band: 15, marks: [0, 15, 30, 45, 60] } },
    { id: 'halfHour', picto: '🕧', dial: { part: 1, of: 2 }, line: { total: 30, band: 10, marks: [0, 10, 20, 30] } },
    { id: 'quarterHour', picto: '🕒', dial: { part: 1, of: 4 }, line: { total: 15, band: 5, marks: [0, 5, 10, 15] } },
    { id: 'minute', picto: '⏱️', line: { total: 60, band: 15, marks: [0, 15, 30, 45, 60] } },
    { id: 'second', picto: '⚡' }
  ],

  /* Days in each month, January first. February has 28; in a leap year
     it has 29 (the grid shows that note). */
  monthDays: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

  /* Real-life slides added right after "monthDays": the months of 31 days,
     and February's special case. `months` are the month numbers shown. */
  monthCases: [
    { id: 'days31', picto: '📅', months: [1, 3, 5, 7, 8, 10, 12] },
    { id: 'februaryCase', picto: '🔍', months: [2] }
  ],

  pairs: [
    { id: 'century', answer: 100 },
    { id: 'decade', answer: 10 },
    { id: 'lustro', answer: 5 },
    { id: 'year', answer: 12 },
    { id: 'semester', answer: 6 },
    { id: 'quadrimester', answer: 4 },
    { id: 'trimester', answer: 3 },
    { id: 'bimester', answer: 2 },
    { id: 'fortnight', answer: 15 },
    { id: 'week', answer: 7 },
    { id: 'day', answer: 24 },
    { id: 'hour', answer: 60 },
    { id: 'halfHour', answer: 30 },
    { id: 'quarterHour', answer: 15 },
    { id: 'minute', answer: 60 }
  ]
};
