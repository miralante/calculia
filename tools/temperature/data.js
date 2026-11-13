/* ============================================================
   Calculia — Water Temperature — data
   Schema:
   - DATA.perRound: orders per round. Each order is a relative
     instruction ("go up 4 degrees") that starts from wherever
     the thermometer is when the previous order ended, so the
     game keeps its own dynamics: the target always follows the
     play, never a fixed number.
   - DATA.levels[]: difficulty steps. A round uses the level that
     matches the number of completed rounds (the last one repeats).
       lo / hi   : range the thermometer can move within (inclusive)
       amin/amax : size of a single order, in degrees
       start     : temperature where the first order of the round begins
   - DATA.states: thresholds for the physical-state visual
     (ice / liquid / steam), at 1 atm.
   Level and activity names are UI text and live in
   strings.<locale>.js ('level.<id>', 'activity.<id>.name').
   ============================================================ */
var DATA = {
  perRound: 6,

  /* Limits of the thermometer itself: the buttons and the number line
     go from −50 °C up to 250 °C in every level. Each level only sets
     the range the orders are drawn from (below). */
  minC: -50,
  maxC: 250,

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

  states: {
    ice:    { emoji: '🧊', color: 'ice' },
    liquid: { emoji: '💧', color: 'liquid' },
    steam:  { emoji: '♨️', color: 'steam' }
  }
};
