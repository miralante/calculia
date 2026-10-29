/* ============================================================
   Calculia — Operaciones: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en las preguntas van entre llaves: {n}, {g}, {e}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➕ Operaciones',
    instruction: 'Elige una operación. Aquí se entiende qué significa cada una, sin hacer cuentas largas.',
    pickTitle: 'Elige una operación.',

    ui: {
      prev: 'Anterior',
      next: 'Siguiente',
      count: '{i} de {n}',
      seeReal: 'Ver ejemplos reales →',
      startTest: 'Empezar a practicar →',
      right: '✅ ¡Muy bien!',
      roundDone: 'Has terminado la ronda: {n} de {total} a la primera. Ahora tienes {stars} estrellas.',
      newRound: 'Otra ronda →',
      otherOps: '← Otras operaciones',
      realTitle: 'Se usa en la vida real:',
      introTitle: 'Así funciona',
      realLabel: 'Ejemplos de la vida real',
      visualAria: 'Dibujo con puntos o figuras que cuentan la operación.',
      groupsOf: '{g} grupos de {e}'
    },

    /* Operaciones: nombre, idea en una frase, explicación en slides,
       ejemplos de la vida real. */
    ops: {
      add: {
        name: 'Sumar', symbolName: 'Sumar', detail: 'Juntar cosas y contar el total.',
        intro: {
          1: { title: 'Sumar es juntar', text: 'Juntas 3 manzanas rojas y 2 verdes. Ahora tienes 5 en total.' },
          2: { title: 'Sumar también es añadir', text: 'Tienes 3 manzanas rojas y te añaden 2 verdes. Las verdes se añaden a las rojas: son 5.' },
          3: { title: 'Puedes juntar en cualquier orden', text: '3 + 2 y 2 + 3 dan lo mismo: 5.' }
        },
        real: {
          1: '🍪 Tienes 5 galletas y te compras 3 más: ahora tienes 8.',
          2: '🚌 Suben 4 personas en una parada y 3 en la siguiente: van 7.',
          3: '💶 Tienes 2 euros en una mano y 5 en la otra: tienes 7 euros.'
        }
      },
      sub: {
        name: 'Restar', symbolName: 'Restar', detail: 'Quitar cosas, o ver cuánto falta.',
        intro: {
          1: { title: 'Restar es quitar', text: 'Tenías 5 galletas y te comes 2. Te quedan 3.' },
          2: { title: 'Restar también es ver cuánto falta', text: 'Necesitas 5 euros y tienes 3. Te faltan 2 euros.' }
        },
        real: {
          1: '🧃 Tenías 6 zumos y te bebes 2: te quedan 4.',
          2: '🚲 Hay 10 bicis y se llevan 3: quedan 7.',
          3: '🎁 Necesitas 8 pegatinas y tienes 5: te faltan 3.'
        }
      },
      mul: {
        name: 'Multiplicar', symbolName: 'Multiplicar', detail: 'Repetir el mismo grupo muchas veces.',
        intro: {
          1: { title: 'Multiplicar es repetir un grupo', text: 'Hay 3 paquetes y en cada paquete hay 4 pilas. Son 4 + 4 + 4 = 12.' },
          2: { title: 'Es sumar lo mismo varias veces', text: '3 × 4 se lee «3 veces 4»: el 4 se repite 3 veces.' },
          3: { title: 'El orden no cambia el total', text: '4 grupos de 3 también son 12. 3 × 4 = 4 × 3.' }
        },
        real: {
          1: '🥚 Una caja tiene 6 huevos. Si hay 2 cajas, son 12 huevos.',
          2: '🪑 Hay 4 filas de 5 sillas: son 20 sillas.',
          3: '🍕 3 pizzas cortadas en 4 trozos cada una: son 12 trozos.'
        }
      },
      div: {
        name: 'Dividir', symbolName: 'Dividir', detail: 'Repartir en partes iguales, o contar cuántos grupos caben.',
        intro: {
          1: { title: 'Dividir es repartir en partes iguales', text: '12 calcetines entre 3 amigos: a cada uno le tocan 4.' },
          2: { title: 'Dividir también es contar cuántos grupos caben', text: '12 calcetines en paquetes de 4: salen 3 paquetes.' },
          3: { title: 'Puede sobrar', text: '13 calcetines en paquetes de 4: salen 3 paquetes llenos y sobra 1. Es la división con resto.' },
          4: { title: 'Dividir y multiplicar van juntas', text: '12 ÷ 4 = 3, porque 3 × 4 = 12.' }
        },
        real: {
          1: '🧦 Repartes 12 calcetines entre 4 amigos: a cada amigo le tocan 3.',
          2: '📦 Tienes 15 libros y pones 5 en cada estante: necesitas 3 estantes.',
          3: '🍪 Tienes 11 galletas y las metes en cajas de 3: llenas 3 cajas y sobran 2.'
        }
      }
    },

    /* Preguntas de «¿qué operación usarías?». Cada una describe una situación. */
    picks: {
      prompt: '¿Qué operación usarías?',
      hint: '🤔 Piensa qué pasa en la historia: ¿se juntan, se quitan, se repiten o se reparten?',
      add1: 'En el autobús hay 12 personas y suben 3 más. ¿Cuántas hay ahora?',
      add2: 'Tienes 2 euros y te dan 5. ¿Cuánto tienes?',
      sub1: 'Tenías 9 caramelos y te comes 4. ¿Cuántos te quedan?',
      sub2: 'Necesitas 10 sillas y hay 6. ¿Cuántas faltan?',
      mul1: 'Hay 4 cajas y en cada caja hay 6 lápices. ¿Cuántos lápices hay?',
      mul2: 'Tienes 5 bolsas con 2 canicas en cada una. ¿Cuántas canicas tienes?',
      div1: 'Tienes 12 calcetines y los repartes entre 3 amigos, todos igual. ¿Qué operación es?',
      div2: 'Tienes 15 pegatinas y las pones en hojas de 5. ¿Cuántas hojas necesitas?'
    },

    /* Preguntas de la prueba: enunciado, pista (sin dar la respuesta) y
       explicación al acertar. {n}, {g}, {e}, {T}… se rellenan en app.js. */
    q: {
      join: {
        prompt: '¿Cuántos hay en total?',
        hint: '🤔 Cuenta todos los dibujos, uno a uno, sin contar dos veces.',
        explain: 'Juntamos {a} y {b}: son {T} en total.'
      },
      more: {
        prompt: 'Tienes {a} manzanas rojas y te añaden {b} verdes. ¿Cuántas hay ahora?',
        hint: '🤔 Empieza por las rojas que ya tenías y cuenta las verdes que se añaden.',
        explain: 'Añadimos {b} verdes a las {a} rojas: son {T} en total.'
      },
      take: {
        prompt: '¿Cuántos quedan?',
        hint: '🤔 Tacha lo que se va y cuenta lo que queda sin tachar.',
        explain: 'Quitamos {t} de {n}: quedan {r}.'
      },
      gap: {
        prompt: '¿Cuántos faltan?',
        hint: '🤔 Cuenta cuántos huecos quedan vacíos.',
        explain: 'Faltan {m}, porque {n} − {h} = {m}.'
      },
      times: {
        prompt: '¿Cuántos hay en total?',
        hint: '🤔 Cuenta cuántos grupos hay y cuántos hay en cada grupo.',
        explain: '{g} grupos de {e} son {T}.'
      },
      repeat: {
        prompt: '¿Qué suma es lo mismo que {g} × {e}?',
        hint: '🤔 Escribe el grupo tantas veces como grupos hay, y súmalo.',
        explain: '{g} × {e} es lo mismo que sumar {e} cada vez, {g} veces.'
      },
      share: {
        prompt: '¿Cuántos calcetines le tocan a cada uno?',
        hint: '🤔 Reparte los dibujos de uno en uno, entre los amigos.',
        explain: 'Cada uno recibe {each}, porque {T} ÷ {g} = {each}.'
      },
      rest: {
        prompt: '¿Cuántos paquetes llenos salen?',
        hint: '🤔 Cuenta los paquetes que van completos. Lo que no llena un paquete, sobra.',
        explain: 'Salen {q} paquetes llenos y sobran {r}.'
      },
      relation: {
        prompt: 'Repartes {T} en grupos de {e}. ¿Qué división sale?',
        hint: '🤔 Piensa en grupos de {e}: ¿cuántos grupos salen?',
        explain: '{T} ÷ {e} = {g}: caben {g} grupos de {e}.'
      }
    },

    /* Respuestas de la pregunta de operación: el nombre y su símbolo. */
    answerName: { add: 'Sumar', sub: 'Restar', mul: 'Multiplicar', div: 'Dividir' },

    /* Cierre de la explicación de un «pick» al acertar. */
    pickExplain: 'Esta situación es de «{op}».'
  }, 'es');
})();
