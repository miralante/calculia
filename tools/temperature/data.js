/* ============================================================
   Calculia — Water Temperature — data
   Schema:
   - DATA.activities[id]: picto and levels[]. Each level: { id,
     tipo, ...config }. The 'tipo' chooses the mission generator
     in app.js. Object.keys(DATA.activities) fixes the menu order.
   - DATA.states: thresholds for the physical-state visual
     (ice / liquid / steam). Each threshold has a min/max (the
     melting and boiling points at 1 atm). Kept here so the
     visual reacts to the same numbers the missions reference.
   - DATA.units: reserved for future localisation of the unit
     (Celsius vs Fahrenheit). Currently only Celsius.
   Activity and level names do NOT live here: they are UI text
   and live in strings.<locale>.js, keyed by 'id':
     App.i18n.t('activity.<id>.name'),
     App.i18n.t('activity.<id>.detail'),
     App.i18n.t('activity.<id>.instruction'),
     App.i18n.t('level.<id>').
   Progression (SPEC §6 rule 13: each level changes one thing):
     freeze → heat    : only changes the goal temperature and
                        the resulting state (cold vs hot), the
                        controls stay the same.
     heat   → balance : only changes the goal (range → exact) and
                        the visual feedback (state hint → exact
                        target). The skill "land on a number"
                        is new here and harder than "reach a range".
   To extend: add a new { id, tipo } to levels, register the
   level text in strings.<locale>.js (es and en), and add a
   generator function in app.js matching 'tipo'.
   ============================================================ */
var DATA = {
  porRonda: 6,

  activities: {
    /* "Mission" mechanics: not a quiz. The user manipulates the
       thermometer with +/− buttons and tries to reach a goal
       (a state, a range, or an exact value). When the goal is
       reached, the level is marked complete (+1 star) and the
       user can exit or try again. No wrong-answer feedback —
       the visual reacts to every change. */
    'water-temperature': {
      picto: '🌡️',
      levels: [
        /* freeze: start at room temperature (20 °C, liquid), need
           to cool down to ≤ 0 °C. */
        { id: 'freeze',  tipo: 'misionEstado',  meta: 'ice' },
        /* heat: same start, need to heat up to ≥ 100 °C. */
        { id: 'heat',    tipo: 'misionEstado',  meta: 'steam' },
        /* balance: start at 90 °C (just below boiling), need to
           land exactly on 20 °C within a small tolerance band
           (DATA.tolerancia). Harder than the state missions because
           the user must both stop and step the right number of
           times — "land in the band" is a different skill than
           "reach a state". */
        { id: 'balance', tipo: 'misionExacta',  meta: 20, inicioC: 90 }
      ]
    }
  },

  /* Temperature range the user can move within. Inclusive.
     -10 °C is enough to reach ice even with the +10 / −10 step
     buttons (−10 from 0 in one click); 110 °C reaches steam from
     0 with +10 clicks. The buttons +1 / −1 and +10 / −10 give
     four useful deltas. */
  minC: -10,
  maxC: 110,

  /* Starting temperature for every mission. 20 °C (room temperature)
     is the natural "neutral" starting point: water is liquid, the
     thermometer reads a familiar number, and both "freeze" and
     "boil" missions need a real movement from the user (going
     down to ≤ 0, or up to ≥ 100). The third mission ("balance")
     starts at the target by coincidence — its only challenge is
     staying there, not arriving. */
  inicioC: 20,

  /* Physical-state thresholds (Celsius, 1 atm). Used both for
     the visual and to detect when a 'misionEstado' is complete.
     `melt` = solid → liquid; `boil` = liquid → gas. */
  states: {
    ice:    { min: -Infinity, max: 0,  emoji: '🧊', color: 'ice' },
    liquid: { min: 1,         max: 99, emoji: '💧', color: 'liquid' },
    steam:  { min: 100,       max: Infinity, emoji: '♨️', color: 'steam' }
  },

  /* Tolerance (in °C) for 'misionExacta'. ±2 is tight enough
     that landing exactly is the goal, but lenient enough that
     a one-off over-/undershoot with the +1 button still wins. */
  tolerancia: 2
};