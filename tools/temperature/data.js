/* ============================================================
   Calculia — Positives and negatives — data
   Two games share the same mechanic (orders on a number line) and
   the same schema:
   - perRound: orders per round. Each order is a relative instruction
     ("go up 4") that starts from wherever the previous order ended,
     so the target always follows the play, never a fixed number.
   - min / max: the limits of the whole number line the game shows.
   - levels[]: difficulty steps. A round uses the level that matches
     the number of completed rounds of that game (the last one repeats).
       lo / hi   : range the marker can move within (inclusive)
       amin/amax : size of a single order
       start     : value where the first order of the round begins
   Game 1 (elevator) is played first; game 2 (water) follows.
   Level and game names are UI text and live in strings.<locale>.js.
   ============================================================ */
var DATA = {
  /* Game 1: the elevator. Floors go from the basement (negative) up
     to floors above ground (positive). The ground floor is 0. */
  elevator: {
    perRound: 6,
    min: -3,
    max: 5,
    levels: [
      /* 1. Around the ground floor: short trips, never far from 0. */
      { id: 'cerca',  lo: -2, hi: 2,  amin: 1, amax: 2, start: 0 },
      /* 2. Crossing the ground floor: trips that pass from the basement
            to the upper floors, or back. */
      { id: 'cruzar', lo: -3, hi: 4,  amin: 1, amax: 4, start: -1 },
      /* 3. The whole building: longer trips, from the lowest to the
            highest floor. */
      { id: 'todo',   lo: -3, hi: 5,  amin: 2, amax: 5, start: 2 }
    ]
  },

  /* Game 2: water temperature. The thermometer goes from −50 °C up
     to 250 °C in every level. Each level only sets the range the
     orders are drawn from. */
  water: {
    perRound: 6,
    min: -50,
    max: 250,
    levels: [
      /* 1. Near zero: small orders, the thermometer stays around 0.
         The first lesson is that going down from 2 °C by 4 degrees
         lands below zero. */
      { id: 'cerca',   lo: -6,  hi: 6,   amin: 1, amax: 4, start: 0 },
      /* 2. Crossing zero: bigger orders that often pass through 0 °C. */
      { id: 'cruzar',  lo: -10, hi: 10,  amin: 2, amax: 8, start: 2 },
      /* 3. Physical states: the water freezes below 0 and boils at 100. */
      { id: 'estados', lo: -10, hi: 110, amin: 5, amax: 30, start: 20 }
    ],
    /* Physical states at 1 atm, for the visual of game 2. */
    states: {
      ice:    { emoji: '🧊', color: 'ice' },
      liquid: { emoji: '💧', color: 'liquid' },
      steam:  { emoji: '♨️', color: 'steam' }
    }
  }
};
