/* ============================================================
   Calculia — Sube y baja — data
   The folder keeps its slug (temperature) so saved stars and links
   still work. Texts live in strings.<locale>.js.

   Two games, one board. Each game is a vertical scale from min to
   max; the player moves a marker up and down with the buttons or the
   arrow keys. A round is a short list of orders ("Sube 4 grados").
   Each order starts where the previous one ended, so its target is
   computed by the game and shown on the scale as 🎯: the player never
   has to add or subtract to find it.

   Fields:
     perRound   orders per round
     min / max  limits of the scale (inclusive); the buttons never leave them
     horizontal true: the scale runs left to right (default: bottom to top)
     keys       values drawn as reference lines (ground floor, 0 °C, 100 °C)
     steps      sizes of the step buttons, negative = down
     marker     icon of the current position on the scale
     zones      coloured bands of the scale: { from, to, cls }
     levels[]   difficulty. A round uses the level that matches the rounds
                already completed in that game (the last level repeats):
                  lo / hi    range the orders stay within (inclusive)
                  amin/amax  size of a single order
                  start      where the first order of the round begins
                  scale      optional: { min, max, ticks } of the scale for
                             this level (default: the game's min and max)
   ============================================================ */
var DATA = {
  /* Game 1: the elevator. Floors below ground are negative, the
     ground floor is 0, floors above it are positive. */
  elevator: {
    perRound: 6,
    min: -3,
    max: 5,
    keys: [0],
    steps: [-1, 1],
    marker: '🛗',
    zones: [
      { from: -3, to: 0, cls: 'zone-basement' }
    ],
    levels: [
      /* 1. Around the ground floor: short trips. */
      { id: 'cerca',  lo: -2, hi: 2, amin: 1, amax: 2, start: 0 },
      /* 2. Crossing the ground floor: trips from the basement to the
            upper floors, or back. */
      { id: 'cruzar', lo: -3, hi: 4, amin: 1, amax: 4, start: -1 },
      /* 3. The whole building: longer trips, from the lowest floor to
            the highest. */
      { id: 'todo',   lo: -3, hi: 5, amin: 2, amax: 5, start: 2 }
    ]
  },

  /* Game 2: the water thermometer, in °C at 1 atm, lying horizontally.
     Ice at or below freeze, liquid between, steam at or above boil.
     Every level shows the states it teaches: the orders cross 0 °C
     (ice and water), cross 100 °C (water and steam), or go through all
     three. Each level's scale is tight around its orders, but the
     scale always reaches the boiling point of the level that needs it. */
  water: {
    perRound: 6,
    min: -10,
    max: 120,
    horizontal: true,
    keys: [0, 100],
    steps: [-10, -1, 1, 10],
    /* The icon of each state: drawn on the track and in the readout. */
    states: { ice: '🧊', liquid: '💧', steam: '♨️' },
    freeze: 0,
    boil: 100,
    zones: [
      { from: -10, to: 0,   cls: 'zone-ice' },
      { from: 0,   to: 100, cls: 'zone-liquid' },
      { from: 100, to: 120, cls: 'zone-steam' }
    ],
    levels: [
      /* 1. Crossing zero: the water freezes below 0 °C and melts above it. */
      { id: 'cruzar',  lo: -10, hi: 10,  amin: 2, amax: 6, start: 2,
        scale: { min: -10, max: 10, ticks: [-10, -5, 0, 5, 10] } },
      /* 2. Near boiling: the water boils at 100 °C and turns to steam. */
      { id: 'hervir',  lo: 80,  hi: 120, amin: 2, amax: 8, start: 90,
        scale: { min: 80, max: 120, ticks: [80, 90, 100, 110, 120] } },
      /* 3. All the states: ice, water and steam. */
      { id: 'estados', lo: -10, hi: 110, amin: 5, amax: 30, start: 20,
        scale: { min: -10, max: 110, ticks: [-10, 0, 20, 40, 60, 80, 100] } }
    ]
  }
};
