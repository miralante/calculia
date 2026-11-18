/* ============================================================
   Calculia — Divisibilidad: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en los juegos van entre llaves: {n}, {d}, {q}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '✅ Divisibilidad',
    btnMenu: 'Volver al inicio',

    ui: {
      visualAria: 'Divisiones que muestran si salen exactas.',
      divChoice: '÷ {d}',
      lineExact: '{n} ÷ {d} = {q}',
      lineRest: '{n} ÷ {d} = {q}, sobra {r}',
      exactTag: 'sale exacto',
      restTag: 'sobra {r}',
      teacherStart: 'Yo elijo el {n}. Elige tú un divisor: 2, 3, 5 o 10.',
      teacherNext: 'Yo elijo otro número',
      ruleCard2: 'Regla del 2: si termina en 0, 2, 4, 6 u 8, se divide exacto entre 2.',
      ruleCard3: 'Regla del 3: si la suma de sus cifras se divide exacto entre 3, el número también.',
      ruleCard5: 'Regla del 5: si termina en 0 o en 5, se divide exacto entre 5.',
      ruleCard10: 'Regla del 10: si termina en 0, se divide exacto entre 10.',
      digitsInstruction: 'Suma las cifras de {n}.',
      digitsResult: '{parts} = {s}',
      ballsInstruction: '{n} bolas en grupos de {d}.',
      groupFull: '✔ grupo completo',
      ballsLeft: 'sobra {r}',
      calcSum: '{n} ÷ {d} =',
      calcNoDecimals: 'sin decimales: es divisible',
      calcHasDecimals: 'con decimales: no es divisible',
      decimalSep: ','
    },

    /* La explicación: una idea por diapositiva. Los juegos de cada regla están en la práctica (data.js y app.js). */
    intro: {
      1: { title: 'Divisible: sale exacto', text: '12 ÷ 3 = 4: no sobra nada. Por eso 12 es divisible entre 3.' },
      2: { title: 'No divisible: sobra algo', text: '13 ÷ 3 = 4 y sobra 1. Ese 1 es el resto. Por eso 13 no es divisible entre 3.' },
      3: { title: 'La calculadora: mira los decimales', text: 'Divide con la calculadora. Si la pantalla muestra un número sin decimales, es divisible. Si muestra decimales, no lo es.' },
      4: { title: 'Regla del 2: termina en cifra par', text: 'Si termina en 0, 2, 4, 6 u 8, se divide exacto entre 2. Yo elijo un número y tú eliges el divisor: yo te digo si sale exacto.' },
      5: { title: 'Regla del 3: suma las cifras', text: 'Suma las cifras: si la suma se divide exacto entre 3, el número también. Yo elijo un número y tú eliges el divisor.' },
      6: { title: 'Regla del 5: termina en 0 o en 5', text: 'Si termina en 0 o en 5, se divide exacto entre 5. Yo elijo un número y tú eliges el divisor.' },
      7: { title: 'Regla del 10: termina en 0', text: 'Si termina en 0, se divide exacto entre 10. Yo elijo un número y tú eliges el divisor.' },
      8: { title: 'Si la suma no se divide entre 3, tampoco', text: 'Suma las cifras de 14: 1 + 4 = 5. Como 5 no se divide entre 3, 14 no es divisible entre 3.' },
      9: { title: 'Lo que sobra es el resto', text: '13 ÷ 5 = 2 y sobra 3. Ese 3 es el resto: no llena un grupo de 5.' }
    },

    /* Los juegos: las respuestas de la regla que se pone en cada uno. */
    q: {
      rule: {
        sumExplain: 'Las cifras de {n} son {a} y {b}: {a} + {b} = {s}.',
        div3Yes: '{s} ÷ 3 = {q3}: no sobra nada.',
        div3No: '{s} ÷ 3 = {q3} y sobra {r}.',
        check: {
          2: { yes: '{c} es par.', no: '{c} es impar.' },
          5: { yes: '{c} es 0 o 5.', no: '{c} no es 0 ni 5.' },
          10: { yes: '{c} es 0.', no: '{c} no es 0.' }
        }
      },
      yesno: {
        yes: '{n} ÷ {d} = {q}: no sobra nada. Sí se divide.',
        no: '{n} ÷ {d} = {q} y sobra {r}. No se divide exacto.'
      }
    }
  }, 'es');
})();
