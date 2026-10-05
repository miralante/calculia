/* ============================================================
     Calculia — Positivos y negativos (data)
     Schema:
     - DATA.temperature / DATA.elevator: the two playable
         missions, each with its own levels[] list. Object.keys()
         fixes the order (temperature first, elevator second).
         Same mechanic as the rest of the suite: 'levels' is an
         ordered list of { id, tipo, ...config }. The 'tipo'
         chooses the mission generator in app.js.
     - DATA.numberline: how the theoretical "line" is rendered
         (range and label). Kept here so the visual range matches
         the mission range and stays consistent across screens.
     Activity and level names are UI text — they live in
     strings.<locale>.js keyed by 'id':
         App.i18n.t('level.<id>').
     To extend: add a new level to DATA.temperature.levels or
     DATA.elevator.levels, write a generator in app.js matching
     the new 'tipo', register the level text in both locale
     files. The intro screen is a fixed reading screen — it has
     no levels of its own.
     ============================================================ */
var DATA = {
    perRound: 6,

    /* Theoretical line: from minC to maxC. Chosen to overlap the
     * temperature range (-10 / +110) and the elevator range
     * (-5 / +5 plant floors, with 0 = ground floor). The number
     * line drawn in the intro screen uses these bounds. */
    minC: -10,
    maxC: 110,

    /* Temperature missions. Three missions, increasing difficulty:
     * introduce the idea (one direction at a time), then combine
     * (land on a target). Reuses the temperature activity's
     * domain knowledge — the visual reaction (ice / liquid /
     * steam) is replaced here by a simpler number-only display
     * because the goal is the number, not the physical state. */
    temperature: {
        levels: [
          { id: 'subzero',  tipo: 'misionEstado',  meta: 'negativo', inicioC: 5 },
          { id: 'positive', tipo: 'misionEstado',  meta: 'positivo',  inicioC: -5 },
          { id: 'target',   tipo: 'misionExacta',  meta: 0,          inicioC: 15 }
        ]
    },

    /* Elevator missions. Four levels, increasing difficulty:
     *   libre  : open exploration, no target (just play).
     *   down   : target restricted to the basement (forces
     *            crossing zero).
     *   up     : target above ground.
     *   random : target can be on either side.
     * Progression (rule 13, only one variable changes between
     * them): libre→down adds a target; down→up flips direction;
     * up→random lifts the side restriction. */
    elevator: {
        levels: [
          { id: 'libre',  tipo: 'misionPiso',  direction: 'libre' },
          { id: 'down',   tipo: 'misionPiso',  direction: 'down' },
          { id: 'up',     tipo: 'misionPiso',  direction: 'up' },
          { id: 'random', tipo: 'misionPiso',  direction: 'random' }
        ]
    },

    /* Number line styling. Kept here so the visual range follows
     * the same DATA.minC / DATA.maxC used by the temperature
     * missions — the user sees the same domain everywhere. */
    numberline: {
        /* How many integer marks to render on each side of zero.
         * Five marks on each side covers -5 to +5, which is enough
         * for both the theory and the elevator ranges. Adding more
         * would clutter small screens without adding meaning. */
        span: 5,
        /* Tick labels use the same signed format as the rest of
         * the activity: "−3", "0", "+2". */
        showZero: true,
        showPlus: true
    },

    /* Temperature mission tolerance (±°C). Same as the original
     * temperature activity so the "land on a number" feeling is
     * identical. */
    tolerancia: 2,

    /* Elevator bounds: −5 (5 underground floors) to +5 (5 above
     * ground). 0 = ground floor (planta baja / planta cero).
     * Matches DATA.numberline.span so the line shown in the intro
     * already covers the whole elevator domain. */
    minFloor: -5,
    maxFloor: 5,

    /* Starting floor for an elevator mission. 1 (one floor above
     * ground) instead of 0, so the user has a clear "side" to
     * start from: any crossing back to zero and then to −N is a
     * proper negative-side crossing (which is the didactic
     * moment we want to celebrate). The cabin label still shows
     * the number with its sign so the user knows where they are. */
    inicioFloor: 1
};