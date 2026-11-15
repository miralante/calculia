/* ============================================================
   Calculia — Divisibilidad: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en las preguntas van entre llaves: {n}, {d}, {q}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '✅ Divisibilidad',
    btnMenu: 'Volver al inicio',

    ui: {
      visualAria: 'Dibujo con puntos que muestra el reparto en grupos.',
      yes: 'Sí',
      no: 'No',
      nextStep: 'Siguiente paso',
      stepOf: 'Paso {i} de {n}',
      divInstruction: 'Reparte {T} bolas en grupos de {d}.',
      divChoice: '÷ {d}',
      divOne: 'Hacer un grupo de {d}',
      divReset: 'Empezar otra vez',
      divWhole: '{T} ÷ {d} = {q}. No sobra nada: se divide exacto.',
      divRest: '{T} ÷ {d} = {q} y sobra {r}: no se divide exacto.',
      tapInstruction: 'Toca los números que se dividen exacto entre {d}.',
      tapYes: '{n} ÷ {d} = {q}: no sobra nada.',
      tapNo: '{n} ÷ {d} = {q} y sobra {r}.',
      digitsInstruction: 'Suma las cifras de {n}.',
      digitsSum: 'Sumar las cifras',
      digitsResult: '{parts} = {s}',
      digitsAsk: 'Ahora mira si {s} se divide entre 3.'
    },

    /* La explicación: una idea por diapositiva. La práctica está a la derecha (data.js y app.js). */
    intro: {
      1: { title: 'Divisible: no sobra nada', text: '12 entre 3: salen 4 grupos y no sobra nada. Por eso 12 es divisible entre 3.' },
      2: { title: 'No divisible: sobra algo', text: '13 entre 3: salen 4 grupos y sobra 1. Ese 1 es el resto. Por eso 13 no es divisible entre 3.' },
      3: { title: 'Divisible entre 2: termina en cifra par', text: 'Las cifras pares son 0, 2, 4, 6 y 8. 14 termina en 4: se divide exacto entre 2.' },
      4: { title: 'Divisible entre 5: termina en 0 o en 5', text: '15 termina en 5: se divide exacto entre 5. Si termina en otra cifra, no.' },
      5: { title: 'Divisible entre 10: termina en 0', text: '30 termina en 0: se divide exacto entre 10. Si termina en otra cifra, no.' },
      6: { title: 'Divisible entre 3: suma las cifras', text: 'Suma las cifras de 12: 1 + 2 = 3. El 3 se divide exacto entre 3. Por eso 12 es divisible entre 3.' },
      7: { title: 'Si la suma no se divide entre 3, tampoco', text: 'Suma las cifras de 14: 1 + 4 = 5. Como 5 no se divide entre 3, 14 no es divisible entre 3.' },
      8: { title: 'Lo que sobra es el resto', text: '13 bolas en paquetes de 5: se llenan 2 paquetes. Sobran 3 bolas. Ese 3 es el resto: no llena un paquete.' }
    },

    /* La prueba: enunciado, pista (sin dar la respuesta) y explicación al acertar. */
    q: {
      pick: {
        prompt: 'Elige el número que se divide exacto entre {d}.',
        hint: '🤔 Usa la regla de {d} o haz la división: ¿sobra algo?',
        explain: '{n} se divide exacto entre {d}: no sobra nada.'
      },
      yesno: {
        prompt: '¿Se divide exacto {n} entre {d}?',
        hint: '🤔 Haz la división y mira si sobra algo.',
        yes: '{n} ÷ {d} = {q}: no sobra nada. Sí se divide.',
        no: '{n} ÷ {d} = {q} y sobra {r}. No se divide exacto.'
      },
      /* Las reglas, paso a paso: cada paso es una pregunta con su pista y su explicación. */
      rule: {
        lastPrompt: 'Mira la última cifra de {n}. ¿Qué cifra es?',
        lastHint: '🤔 La última cifra es la de la derecha del número.',
        lastExplain: 'La última cifra de {n} es {c}.',
        sumPrompt: 'Suma las cifras de {n}. ¿Cuánto suman?',
        sumHint: '🤔 Suma la primera cifra con la segunda.',
        sumExplain: 'Las cifras de {n} son {a} y {b}: {a} + {b} = {s}.',
        div3Prompt: '¿Se divide exacto {s} entre 3?',
        div3Hint: '🤔 Haz la división entre 3 y mira si sobra algo.',
        div3Yes: '{s} ÷ 3 = {q3}: no sobra nada.',
        div3No: '{s} ÷ 3 = {q3} y sobra {r}.',
        check: {
          2: { prompt: '¿La cifra {c} es par?', hint: '🤔 Las cifras pares son 0, 2, 4, 6 y 8.', yes: '{c} es par.', no: '{c} es impar.' },
          5: { prompt: '¿La cifra {c} es 0 o 5?', hint: '🤔 Mira si la cifra es 0 o 5.', yes: '{c} es 0 o 5.', no: '{c} no es 0 ni 5.' },
          10: { prompt: '¿La cifra {c} es 0?', hint: '🤔 Solo cuenta si la cifra es un cero.', yes: '{c} es 0.', no: '{c} no es 0.' }
        },
        finalPrompt: '¿Se divide exacto {n} entre {d}?',
        finalHint: '🤔 Piensa en lo que has averiguado en los pasos anteriores.',
        finalYes: 'Por eso {n} se divide exacto entre {d}.',
        finalNo: 'Por eso {n} no se divide exacto entre {d}.'
      }
    }
  }, 'es');
})();
