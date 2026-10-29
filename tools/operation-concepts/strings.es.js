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
      coin: '€',
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
      groupsOf: '{g} grupos de {e}',
      remainder: 'resto {r}'
    },

    /* Operaciones: nombre, idea en una frase, explicación en slides,
       ejemplos de la vida real. */
    ops: {
      add: {
        name: 'Sumar', symbolName: 'Sumar', detail: 'Juntar cosas y contar el total.',
        intro: {
          1: { title: 'Sumar es juntar', text: 'Juntas 3 manzanas rojas y 2 verdes. Ahora tienes 5 en total.' },
          2: { title: 'Sumar también es añadir', text: 'Tienes 3 manzanas rojas y te añaden 2 verdes. Las verdes se añaden a las rojas: son 5.' },
          3: { title: 'Puedes juntar en cualquier orden', text: '3 + 2 = 2 + 3 = 5' }
        },
        real: {
          1: '🍪 Tienes 3 galletas y te compras 2 más: ahora tienes 5.',
          2: '🚌 Suben 2 personas en una parada y 2 en la siguiente: van 4.',
          3: '🪙 Tienes 2 euros en una mano y 5 en la otra: tienes 7 euros.'
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
          2: '🚲 Hay 6 bicis y se llevan 2: quedan 4.',
          3: '🎈 Necesitas 8 globos para la fiesta y tienes 5: te faltan 3.'
        }
      },
      mul: {
        name: 'Multiplicar', symbolName: 'Multiplicar', detail: 'Repetir el mismo grupo muchas veces.',
        intro: {
          1: { title: 'Multiplicar es repetir un grupo', text: 'Hay 3 paquetes y en cada paquete hay 4 pilas. Son 4 + 4 + 4 = 12.' },
          2: { title: 'Es sumar lo mismo varias veces', text: '3 × 4 se lee «3 veces 4»: el 4 se repite 3 veces.' },
          3: { title: 'Cambiar el orden de los grupos', text: '4 grupos de 3 también son 12: 3 + 3 + 3 + 3 = 12.' },
          4: { title: 'El orden no cambia el total', text: '3 × 4 = 4 × 3. El total es 12 en los dos casos.' }
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
          1: { title: 'Dividir es repartir en partes iguales', text: '12 trozos de pizza entre 3 amigos: a cada uno le tocan 4.' },
          2: { title: 'Dividir también es contar cuántos grupos caben', text: '12 bolas en paquetes de 4: salen 3 paquetes.' },
          3: { title: 'Puede sobrar', text: '13 bolas en paquetes de 4: salen 3 paquetes llenos y sobra 1. Es la división con resto.' },
          4: { title: 'Dividir es lo contrario de multiplicar', text: 'Multiplicas: 3 × 4 = 12. Divides: 12 ÷ 4 = 3. Si sabes una, sabes la otra.' }
        },
        real: {
          1: '🪙 Repartes 12 euros entre 4 amigos: a cada amigo le tocan 3 euros.',
          2: '📦 Tienes 15 libros y pones 5 en cada estante: necesitas 3 estantes.',
          3: '🍪 Tienes 7 galletas y las metes en cajas de 3: llenas 2 cajas y sobra 1.'
        }
      }
    },

    /* Preguntas de «¿qué operación usarías?». Cada una describe una situación. */
    picks: {
      prompt: '¿Qué operación usarías?',
      hint: '🤔 Piensa qué pasa en la historia: ¿se juntan, se quitan, se repiten o se reparten?',
      add1: 'En el autobús hay 12 personas y suben 3 más.',
      add2: 'Tienes 2 euros y te dan 5.',
      sub1: 'Tenías 9 caramelos y te comes 4.',
      sub2: 'Necesitas 10 sillas y hay 6.',
      mul1: 'Hay 4 cajas y en cada caja hay 6 lápices.',
      mul2: 'Tienes 5 bolsas con 2 canicas en cada una.',
      div1: 'Tienes 12 trozos de pizza y los repartes entre 3 amigos, todos igual.',
      div2: 'Tienes 15 pegatinas y las pones en hojas de 5.'
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
      swap: {
        prompt: '¿Qué suma da lo mismo que {a} + {b}?',
        hint: '🤔 Cambia el orden de los números: ¿cambia el total?',
        explain: '{a} + {b} es lo mismo que {b} + {a}: el total es {T}.'
      },
      swapTimes: {
        prompt: '¿Qué multiplicación da lo mismo que {g} × {e}?',
        hint: '🤔 Gira los grupos: ¿cambia el total?',
        explain: '{g} × {e} es lo mismo que {e} × {g}: el orden no cambia el total.'
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
        prompt: 'Tienes {T} trozos de pizza y los repartes entre {g} amigos, todos igual. ¿Cuántos le tocan a cada uno?',
        hint: '🤔 Reparte los trozos de uno en uno, en cada grupo de amigos.',
        explain: 'Cada uno recibe {each}, porque {T} ÷ {g} = {each}.'
      },
      rest: {
        prompt: 'Tienes {T} bolas y las metes en paquetes de {e}. ¿Cuántos paquetes llenos salen?',
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
