/* Quantity-training cases.
   Each group contains eight shared cases. Amounts are raw numbers;
   their unit and all user-facing text are resolved in app.js and strings. */
var DATA = {
  perRound: 6,
  practices: [
    { id: 'amount', icon: '⚖️' },
    { id: 'change', icon: '↕️' },
    { id: 'round', icon: '≈' },
    { id: 'middle', icon: '↔️' }
  ],
  cases: {
    amount: [
      { goal: 'little', min: 0, max: 10, step: 1, target: [0, 2] },
      { goal: 'much', min: 0, max: 10, step: 1, target: [8, 10] },
      { goal: 'little', min: 0, max: 20, step: 2, target: [0, 4] },
      { goal: 'much', min: 0, max: 20, step: 2, target: [16, 20] },
      { goal: 'little', min: 0, max: 50, step: 5, target: [0, 10] },
      { goal: 'much', min: 0, max: 50, step: 5, target: [40, 50] },
      { goal: 'little', min: 0, max: 100, step: 10, target: [0, 20] },
      { goal: 'much', min: 0, max: 100, step: 10, target: [80, 100] }
    ],
    change: [
      { direction: 'increase', start: 2, target: 5, min: 0, max: 10, step: 1 },
      { direction: 'decrease', start: 8, target: 5, min: 0, max: 10, step: 1 },
      { direction: 'increase', start: 10, target: 16, min: 0, max: 20, step: 2 },
      { direction: 'decrease', start: 18, target: 12, min: 0, max: 20, step: 2 },
      { direction: 'increase', start: 15, target: 30, min: 0, max: 50, step: 5 },
      { direction: 'decrease', start: 40, target: 25, min: 0, max: 50, step: 5 },
      { direction: 'increase', start: 20, target: 60, min: 0, max: 100, step: 10 },
      { direction: 'decrease', start: 90, target: 50, min: 0, max: 100, step: 10 }
    ],
    round: [
      { value: 23, target: 20, min: 0, max: 50, step: 10, unit: 'euro' },
      { value: 37, target: 40, min: 0, max: 50, step: 10, unit: 'euro' },
      { value: 62, target: 60, min: 0, max: 100, step: 10, unit: 'meter' },
      { value: 78, target: 80, min: 0, max: 100, step: 10, unit: 'meter' },
      { value: 145, target: 150, min: 100, max: 200, step: 10, unit: 'euro' },
      { value: 184, target: 180, min: 100, max: 200, step: 10, unit: 'euro' },
      { value: 247, target: 250, min: 200, max: 300, step: 10, unit: 'liter' },
      { value: 263, target: 260, min: 200, max: 300, step: 10, unit: 'liter' }
    ],
    middle: [
      { min: 0, max: 10, step: 1, target: 5 },
      { min: 2, max: 8, step: 1, target: 5 },
      { min: 0, max: 20, step: 2, target: 10 },
      { min: 10, max: 30, step: 2, target: 20 },
      { min: 0, max: 50, step: 5, target: 25 },
      { min: 20, max: 60, step: 5, target: 40 },
      { min: 0, max: 100, step: 10, target: 50 },
      { min: 40, max: 80, step: 10, target: 60 }
    ]
  }
};