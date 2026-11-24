/* ============================================================
   Calculia — Operaciones: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en las preguntas van entre llaves: {n}, {g}, {e}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: 'Operaciones',
    btnMenu: 'Volver al inicio',

    ui: {
      menuInstruction: 'Elige qué quieres practicar',
      hintPrefix: '',
      wrongPrefix: '❌ Mira: ',
      rightPrefix: '✅ ¡Correcto! ',
      menuTitle: '¿Qué quieres practicar?',
      menuText: 'Aquí se entiende qué significa cada una, sin hacer cuentas largas.',
      coin: '€',
      deal: 'Repartir',
      dealReset: 'Empezar de nuevo',
      packInstruction: 'Haz {g} grupos de {e}.',
      packOne: 'Agrupar',
      packGroup: 'Grupo {n}',
      packResult: '{T} ÷ {e} = {g}',
      packResultLeft: '{T} ÷ {e} = {g}, sobra {r}',
      repeatInstruction: 'Haz {g} grupos de {e} pilas.',
      repeatOne: 'Repetir',
      repeatSum: '{sum} = {T}',
      repeatSay: 'Eso es multiplicar: {g} veces {e} pilas.',
      repeatProduct: '{g} × {e} = {T}',
      calcValue: '{T} ÷ {e} = {v}',
      relationLine: '{g} × {e} = {T}',
      calcWhole: 'Antes de la coma: {q} paquetes llenos.',
      calcDecimal: 'Después de la coma: {dec}, es decir, {r} de {e} partes de un paquete.',
      decimalSep: ',',
      fillInstructionAdd: 'Añade manzanas hasta tener {n}.',
      fillInstructionSub: 'Pon monedas hasta tener {n}.',
      fillLeftAdd: 'Faltan {m} por añadir.',
      fillLeftSub: 'Te faltan {m}.',
      fillResultAdd: '{h} + {m} = {n}',
      fillResultSub: '{n} − {h} = {m}',
      fillOneAdd: 'Añadir manzana',
      fillOneSub: 'Poner moneda',
      swapInstruction: 'Cambia el orden de los grupos.',
      swapOne: 'Cambiar el orden',
      swapResult: '{a} + {b} = {b} + {a} = {T}',
      joinInstruction: 'Junta los dos grupos.',
      joinOne: 'Juntar',
      joinResult: '{a} + {b} = {T}',
      takeInstruction: 'Quita {t} monedas.',
      takeOne: 'Quitar',
      takeResult: '{n} − {t} = {r}',
      namesPick: 'Toca un nombre y luego el sitio donde va.',
      namesPlace: 'Ahora toca el sitio donde va.',
      namesRight: '¡Eso es!',
      namesWrong: 'Ese nombre va en otro sitio. Prueba otra vez.',
      checkRight: '✅ ¡Correcto!',
      checkWrong: '✗ No es esa. Mira el dibujo y prueba otra.',
      checkYes: 'Sí',
      checkNo: 'No',
      checkDealQ: '¿Cuántas bolas le tocan a cada amigo?',
      checkPackQ: '¿Cuántos paquetes llenos salen?',
      checkJoinQ: '¿Cuánto es {a} + {b}?',
      checkTakeQ: 'Si quitas {t} de {n}, ¿cuántas quedan?',
      checkFillAddQ: '¿Cuántas manzanas faltan para llegar a {n}?',
      checkFillSubQ: '¿Cuántas monedas faltan para llegar a {n}?',
      checkSwapQ: '¿Cambia el total si cambias el orden?',
      namesDone: '¡Bien! Cada parte de la división ya tiene su nombre.',
      dealResult: '{T} ÷ {g} = {e}',
      friend: 'Amigo {n}',
      pack: 'Paquete {n}',
      shelf: 'Estante {n}',
      box: 'Caja {n}',
      otherOps: '← Otras operaciones',
      realTitle: 'Se usa en la vida real:',
      introTitle: 'Así funciona',
      realLabel: 'Ejemplos de la vida real',
      visualAria: 'Dibujo con puntos o figuras que cuentan la operación.',
      groupsOf: '{g} grupos de {e}',
      remainder: 'resto {r}',
      noRest: 'Todas las divisiones salen exactas: no sobra nada.'
    },

    /* Operaciones: nombre, idea en una frase, explicación en slides,
       ejemplos de la vida real. */
    ops: {
      add: {
        name: 'Sumar', symbolName: 'Sumar', detail: 'Juntar cosas y contar el total.',
        intro: {
          1: { title: 'Sumar es juntar', text: 'Juntas 3 manzanas rojas y 2 verdes. Ahora tienes 5 en total.' },
          2: { title: 'Sumar también es añadir', text: 'Tienes 3 manzanas rojas y te añaden 2 verdes, son 5.' },
          3: { title: 'Puedes juntar en cualquier orden', text: '3 + 2 = 2 + 3 = 5' }
        },
        real: {
          1: 'Tienes 3 galletas y te compras 2 más: ahora tienes 5.',
          2: 'Suben 2 personas en una parada y 2 en la siguiente: van 4.',
          3: 'Tienes 2 euros en una mano y 5 en la otra: tienes 7 euros.'
        }
      },
      sub: {
        name: 'Restar', symbolName: 'Restar', detail: 'Quitar cosas, o ver cuánto falta.',
        intro: {
          1: { title: 'Restar es quitar', text: 'Tenías 5 euros y te gastas 2. Te quedan 3 euros.' },
          2: { title: 'Restar también es ver cuánto falta', text: 'Quieres comprar algo que cuesta 5 euros y tienes 3 euros. Te faltan 2 euros.' }
        },
        real: {
          1: 'Tenías 6 zumos y te bebes 2: te quedan 4.',
          2: 'Hay 6 bicis y se llevan 2: quedan 4.',
          3: 'Necesitas 8 globos para la fiesta y tienes 5: te faltan 3.'
        }
      },
      mul: {
        name: 'Multiplicar', symbolName: 'Multiplicar', detail: 'Repetir el mismo grupo muchas veces.',
        intro: {
          1: { title: 'Multiplicar es repetir un grupo', text: 'Este es un grupo de 4 pilas. Repítelo 3 veces.' },
          2: { title: 'Es sumar lo mismo varias veces', text: '3 × 4 se lee «3 veces 4»: el 4 se repite 3 veces.' },
          3: { title: 'Cambiar el orden de los grupos', text: '4 grupos de 3 también son 12: 3 + 3 + 3 + 3 = 12.' },
          4: { title: 'El orden no cambia el total', text: '3 × 4 = 4 × 3. El total es 12 en los dos casos.' }
        },
        real: {
          1: 'Una caja tiene 6 huevos. Si hay 2 cajas, son 12 huevos.',
          2: 'Hay 4 filas de 5 sillas: son 20 sillas.',
          3: '3 pizzas cortadas en 4 trozos cada una: son 12 trozos.'
        }
      },
      div: {
        name: 'Dividir', symbolName: 'Dividir', detail: 'Repartir en partes iguales, o contar cuántos grupos caben.',
        names: { dividend: 'dividendo', divisor: 'divisor', quotient: 'cociente', rest: 'resto', leftOver: 'sobra' },
        intro: {
          1: { title: 'Cada parte de la división tiene nombre', text: '7 es el dividendo: lo que se reparte. 3 es el divisor. 2 es el cociente: el resultado. 1 es el resto: lo que sobra.' },
          2: { title: 'Dividir es repartir en partes iguales', text: 'Reparte 6 bolas entre 2 amigos: a cada uno le tocan 3.' },
          3: { title: 'Dividir también es agrupar y contar cuántos grupos salen', text: '6 bolas en paquetes de 2: salen 3 paquetes.' },
          4: { title: 'Puede sobrar', text: '7 bolas en paquetes de 3: salen 2 paquetes llenos y sobra 1. Es la división con resto.' },
          5: { title: 'Dividir es lo contrario de multiplicar', text: 'Multiplicas: 4 × 2 = 8. Divides: 8 ÷ 2 = 4. Si sabes una, sabes la otra.' },
          6: { title: 'La parte entera: los paquetes llenos', text: '7 bolas en paquetes de 3: se llenan 2 paquetes. Esos 2 son la parte entera.' },
          7: { title: 'La calculadora: lo de antes de la coma', text: 'La calculadora dice 2,333… Lo que está antes de la coma es la parte entera: 2 paquetes llenos.' },
          8: { title: 'Después de la coma: la parte decimal', text: '13 ÷ 5 = 2,6. El 2 son paquetes llenos. El 0,6 es lo que sobra: 3 de 5 partes de un paquete.' }
        },
        real: {
          1: 'Repartes 8 euros entre 4 amigos: a cada amigo le tocan 2 euros.',
          2: 'Tienes 6 libros y pones 2 en cada estante: necesitas 3 estantes.',
          3: 'Tienes 8 galletas y las metes en cajas de 3: llenas 2 cajas y sobran 2.'
        }
      },
      fac: {
        name: 'Factorial', detail: 'Qué significa el signo «!» y para qué sirve.',
        intro: {
          1: { title: '¿Qué es un factorial?', text: '4! se lee «4 factorial». Es multiplicar 4 × 3 × 2 × 1. El resultado es 24.' },
          2: { title: 'Crece muy deprisa', text: '1! = 1, 2! = 2, 3! = 6, 4! = 24, 5! = 120. Cada paso multiplica por un número más. Por acuerdo, 0! = 1.' },
          3: { title: 'Sirve para la divisibilidad', text: '5! = 120. Entre 1, 2, 3, 4 y 5 se divide exacto: no sobra nada. Por eso los factoriales ayudan a entender la divisibilidad.' }
        },
        real: {
          1: '3 amigos se ponen en fila para una foto. Hay 6 formas distintas de ponerse.',
          2: 'Tienes 4 libros para un estante. Los puedes colocar de 24 formas distintas.',
          3: '5 amigos se sientan en un banco. Hay 120 formas distintas de sentarse.'
        }
      },
      pow: {
        name: 'Potencias', detail: 'Multiplicar muchas veces el mismo número.',
        intro: {
          1: { title: 'Potencia es multiplicar lo mismo', text: '2³ se lee «2 elevado a 3».' },
          2: { title: 'El número pequeño cuenta las repeticiones', text: 'Se llama exponente.' },
          3: { title: 'Las tres partes', text: '' },
          4: { title: 'El juego', text: 'Pon cada nombre en su sitio.' }
        }
      }
    },

    /* Preguntas de «¿qué operación usarías?». Cada una describe una situación. */
    picks: {
      prompt: '¿Qué operación usarías?',
      hint: '🤔 Piensa qué pasa: ¿se juntan, se quitan, se repiten o se reparten?',
      add1: 'En el autobús hay 12 personas y suben 3 más.',
      add2: 'Tienes 2 euros y te dan 5.',
      add3: 'En la tienda hay 9 personas y entran 6 más.',
      add4: 'Tienes 6 cromos y tu amigo te da 7.',
      add5: 'Ayer leíste 8 páginas y hoy leíste 5.',
      sub1: 'Tenías 9 caramelos y te comes 4.',
      sub2: 'Necesitas 10 sillas y tienes 6.',
      sub3: 'Tenías 12 euros y te gastas 5 euros.',
      sub4: 'Había 15 pájaros y se van 6.',
      sub5: 'Tienes 11 lápices y prestas 4 a un amigo.',
      mul1: 'Hay 4 cajas y en cada caja hay 6 lápices.',
      mul2: 'Tienes 5 bolsas con 2 canicas en cada una.',
      mul3: 'Hay 3 filas de 5 sillas.',
      mul4: 'Cada persona tiene 4 canicas. Hay 6 personas.',
      mul5: 'Una pizza tiene 8 trozos y compras 2 pizzas.',
      div1: 'Tienes 6 trozos de pizza y los repartes entre 2 amigos, todos igual.',
      div2: 'Tienes 8 pegatinas y pones 2 en cada hoja.',
      div3: 'Tienes 12 galletas y las repartes entre 4 amigos, todas igual.',
      div4: 'Tienes 15 caramelos y los metes en bolsas de 3, todas igual.',
      div5: 'Tienes 10 fichas y pones 5 en cada caja.'
    },

    /* Preguntas de la prueba: enunciado, pista (sin dar la respuesta) y
       explicación al acertar. {n}, {g}, {e}, {T}… se rellenan en app.js. */
    q: {
      integer: {
        prompt: 'Metes {T} bolas en paquetes de {e}. La calculadora dice {v}. ¿Cuántos paquetes llenos salen?',
        hint: '🤔 Mira el número que está antes de la coma. Lo que no llena un paquete no cuenta.',
        explain: 'Antes de la coma está {q}: salen {q} paquetes llenos. Lo que va después de la coma es lo que sobra.'
      },
      decimal: {
        prompt: 'Metes {T} bolas en paquetes de {e}. La calculadora dice {v}. ¿Cuál es la parte decimal?',
        hint: '🤔 La parte decimal va después de la coma. ¿Qué parte de un paquete sobra?',
        explain: 'La parte decimal es {dec}. Es {r} de {e} partes de un paquete.'
      },
      join: {
        prompt: 'Juntas los dos grupos. ¿Cuántos hay en total?',
        hint: '🤔 Cuenta todos los dibujos, uno a uno, sin contar dos veces.',
        explain: 'Juntamos {a} y {b}: son {T} en total.'
      },
      more: {
        prompt: 'Hay {a} y se añaden {b} más. ¿Cuántos hay ahora?',
        hint: '🤔 Empieza por lo que ya había y cuenta lo que se añade.',
        explain: 'Añadimos {b} a los {a} que había: son {T} en total.'
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
        prompt: 'Tenías {n} y quitas {t}. ¿Cuántos quedan?',
        hint: '🤔 Tacha lo que se va y cuenta lo que queda sin tachar.',
        explain: 'Quitamos {t} de {n}: quedan {r}.'
      },
      gap: {
        prompt: 'Necesitas {n} y tienes {h}. ¿Cuántos faltan?',
        hint: '🤔 Cuenta cuántos huecos quedan vacíos.',
        explain: 'Faltan {m}, porque {n} − {h} = {m}.'
      },
      times: {
        prompt: 'Hay {g} grupos con {e} en cada uno. ¿Cuántos hay en total?',
        hint: '🤔 Cuenta cuántos grupos hay y cuántos hay en cada grupo.',
        explain: '{g} grupos de {e} son {T}.'
      },
      repeat: {
        prompt: '¿Qué suma es lo mismo que {g} × {e}?',
        hint: '🤔 Escribe el grupo tantas veces como grupos hay, y súmalo.',
        explain: '{g} × {e} es lo mismo que sumar {e} cada vez, {g} veces.'
      },
      share: {
        prompt: 'Tienes {T} y los repartes entre {g} amigos, todos igual. ¿Cuántos le tocan a cada uno?',
        hint: '🤔 Reparte uno a uno, en cada grupo de amigos.',
        explain: 'Cada uno recibe {each}, porque {T} ÷ {g} = {each}.'
      },
      rest: {
        prompt: 'Tienes {T} y los metes en grupos de {e}. ¿Cuántos grupos llenos salen?',
        hint: '🤔 Cuenta los grupos que van completos. Lo que no llena un grupo, sobra.',
        explain: 'Salen {q} grupos llenos y sobran {r}.',
        explainOne: 'Salen {q} grupos llenos y sobra 1.'
      },
      leftover: {
        prompt: 'Tienes {T} y los metes en grupos de {e}. ¿Cuántos sobran?',
        hint: '🤔 Primero cuenta los grupos llenos. Lo que queda fuera de ellos, sobra.',
        explain: 'Salen {q} grupos llenos y sobran {r}.',
        explainOne: 'Salen {q} grupos llenos y sobra 1.'
      },
      relation: {
        prompt: 'Repartes {T} en grupos de {e}. ¿Qué división sale?',
        hint: '🤔 Piensa en grupos de {e}: ¿cuántos grupos salen?',
        explain: '{T} ÷ {e} = {g}: caben {g} grupos de {e}.'
      },
      factValue: {
        prompt: '¿Cuánto vale {n}!?',
        hint: 'Multiplica, no sumes. Sigue bajando hasta el 1.',
        explain: '{chain} = {T}.'
      },
      factMeaning: {
        prompt: '¿Qué significa {n}!?',
        hint: 'El signo ! quiere decir: multiplica desde ese número hasta el 1.',
        explain: '{n}! = {chain}.'
      },
      factSlots: {
        prompt: '¿De cuántas formas se pueden poner {n} amigos en fila?',
        hint: 'Para el primer sitio hay {n} opciones. Para el segundo, una menos. Así hasta el último.',
        explain: '{chain} = {T} formas.'
      },
      factDivides: {
        prompt: '¿Entre cuál de estos números se divide exacto {n}!?',
        hint: 'Divide {T} entre cada número. El que no deja nada sobrando es la respuesta.',
        explain: '{T} ÷ {k} = {g}, sin nada sobrando.'
      }
    },

    /* La práctica de Potencias (sin test): pocas palabras, las figuras cuentan. */
    power: {
      /* El nombre de cada parte de la potencia. */
      parts: { base: 'Base', exp: 'Exponente', pow: 'Potencia' },
      /* El sitio vacío del juego: el nombre que le toca. */
      partsAria: { base: 'Sitio de la base', exp: 'Sitio del exponente', pow: 'Sitio de la potencia' },
      namesPick: 'Toca un nombre y luego el sitio donde va.',
      namesPlace: 'Ahora toca el sitio donde va.',
      namesRight: '¡Eso es!',
      namesWrong: 'Ese nombre va en otro sitio. Prueba otra vez.',
      namesDone: '¡Bien! Cada parte de la potencia ya tiene su nombre.',
      /* La práctica: las dos maneras de practicar una potencia. */
      practiceTitle: 'Empezar a practicar',
      practiceExp: 'Pon un número entre el 2 y 5 para el exponente.',
      practiceBase: 'Pon un número en la base entre el 2 y 5.',
      practiceBoth: 'Pon la base y el exponente, entre el 2 y 5.',
      prev: 'Anterior',
      next: 'Siguiente',
      calc: 'Calcular',
      empty: 'Escribe un número',
      range: 'Pon un número entre el 2 y el 5.',
      again: 'Otra vez'
    },

    answerName: { add: 'Sumar', sub: 'Restar', mul: 'Multiplicar', div: 'Dividir' },

    /* Cierre de la explicación de un «pick» al acertar. */
    pickExplain: 'Esta situación es de «{op}».'
  }, 'es');
})();
