/* ============================================================
   Calculia — Primo o compuesto: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en las preguntas van entre llaves: {n}, {p}, {a}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔎 Primo o compuesto',
    btnMenu: 'Volver al inicio',

    ui: {
      visualAria: 'Dibujo con puntos en filas que muestra el número.',
      product: '{k} × {d} = {m}',
      yes: 'Sí',
      no: 'No',
    },

    /* La explicación: una idea por diapositiva. El dibujo está en data.js. */
    intro: {
      1: { title: 'Número primo: solo se divide entre 1 y él mismo', text: '7 solo sale como 1 × 7. Por eso 7 es primo.' },
      2: { title: 'Número compuesto: se divide entre más números', text: '6 también sale como 2 × 3. Se divide entre 1, 2, 3 y 6. Por eso 6 es compuesto.' },
      3: { title: 'Los primos hasta 20', text: 'Tienen borde grueso: 2, 3, 5, 7, 11, 13, 17 y 19. Los demás, salvo el 1, son compuestos.' },
      4: { title: 'El 1 no es primo ni compuesto', text: '1 solo tiene un divisor: él mismo. Por eso no es primo. Tampoco es compuesto.' },
      5: { title: 'Números compuestos: 4, 6, 8, 9', text: 'Salen al multiplicar dos números mayores que 1: 2 × 2 = 4, 2 × 3 = 6, 2 × 4 = 8, 3 × 3 = 9.' },
      6: { title: 'Si lo puedes formar de otra manera, es compuesto', text: '15 = 3 × 5. Como se divide entre 3 y entre 5, además de entre 1 y 15, es compuesto.' }
    },

    /* La prueba: enunciado, pista (sin dar la respuesta) y explicación al acertar. */
    q: {
      yesno: {
        prompt: '¿{n} es primo?',
        hint: '🤔 Mira entre qué números se divide exacto {n}. ¿Solo entre 1 y él mismo?',
        prime: '{n} solo se divide entre 1 y {n}: es primo.',
        composite: '{n} = {a} × {b}: se divide entre más números. Es compuesto.',
        one: '1 solo tiene un divisor: él mismo. Por eso no es primo.'
      },
      pick: {
        prompt: 'Elige el número primo.',
        hint: '🤔 Un primo solo se divide entre 1 y él mismo. Busca el que no se puede formar de otra manera.',
        explain: '{p} es primo: solo se divide entre 1 y {p}. Los otros dos son compuestos.'
      },
      divisors: {
        prompt: '¿Entre cuántos números se divide exacto {n}? Cuenta el 1 y el {n}.',
        hint: '🤔 Divide {n} entre 2, 3, 4… y mira cuáles salen exactos.',
        prime: '{n} se divide entre {list}: son {count}. Como son solo 2, es primo.',
        composite: '{n} se divide entre {list}: son {count}. Como son más de 2, es compuesto.'
      }
    }
  }, 'es');
})();
