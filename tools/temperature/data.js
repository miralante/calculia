/* ============================================================
   Calculia — Sube y baja — data
   The folder keeps its slug (temperature) so saved stars and links
   still work. Texts live in strings.<locale>.js.

   Two games, one board. Each game is a line of numbers from min to
   max; the player moves a marker up and down with the buttons or the
   arrow keys. A round is a short list of orders ("Sube 4 grados").
   Each order starts where the previous one ended, so its target is
   computed by the game and shown with an arrow: the player never has
   to add or subtract to find it. There are no levels: the game is the
   same from the first round to the last.

   Fields:
     perRound   orders per round
     start      value where the first order of a round begins
     orders     { amin, amax }: size of one order (the game keeps the
                orders inside min and max)
     min / max  limits of the line (inclusive); the buttons never leave them
     ticks      values written on the line (default: every whole value)
     keys       values drawn as reference lines (ground floor, 0 °C, 100 °C)
     steps      sizes of the step buttons, negative = down
     zones      coloured bands of the line: { from, to, cls }
     horizontal true: the line runs left to right (default: bottom to top)
     marker     icon of the position on the line (elevator)
     states     icon of each physical state (water)
   ============================================================ */
var DATA = {
  /* Game 1: the elevator. Floors below ground are negative, the
     ground floor is 0, floors above it are positive. */
  elevator: {
    perRound: 6,
    start: 0,
    orders: { amin: 1, amax: 4 },
    min: -3,
    max: 5,
    keys: [0],
    steps: [-1, 1],
    marker: '🛗',
    zones: [
      { from: -3, to: 0, cls: 'zone-basement' }
    ]
  },

  /* Game 2: the water thermometer, in °C at 1 atm, lying horizontally.
     Ice at or below freeze, liquid between, steam at or above boil. The
     line goes from −10 to 120 °C, so the orders can cross 0 °C and 100 °C. */
  water: {
    perRound: 6,
    start: 20,
    orders: { amin: 2, amax: 20 },
    min: -10,
    max: 120,
    horizontal: true,
    ticks: [0, 50, 100],
    keys: [0, 100],
    steps: [-10, -1, 1, 10],
    states: { ice: '🧊', liquid: '💧', steam: '♨️' },
    freeze: 0,
    boil: 100,
    zones: [
      { from: -10, to: 0,   cls: 'zone-ice' },
      { from: 0,   to: 100, cls: 'zone-liquid' },
      { from: 100, to: 120, cls: 'zone-steam' }
    ]
  }
};
