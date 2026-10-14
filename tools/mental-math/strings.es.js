/* ============================================================
   Calculia — Mental Math texts (ES)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🧠 Restar y Cálculo Mental',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Alguien te pregunta cuánto queda o cuánto es sin usar papel. Aprende a restar y a calcular de cabeza con trucos sencillos.',
    explicacion: '✅ Restar y calcular de cabeza te sirve para no depender siempre de una calculadora.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    explicacionCorrecta: '✅ ¡Correcto! La respuesta es: ',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    explicacionIncorrectaA: '❌ Mira: la respuesta correcta es ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    pista: '🤔 Prueba otra vez. Piensa con calma.',
    hint: '🤔 Prueba otra vez. Piensa con calma.',
    refuerzoTitulo: 'Refuerzo',
    reinforceTitle: 'Refuerzo',
    refuerzoIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    leyendaUnidadesTxt: 'unidades',
    legendUnitsTxt: 'unidades',
    leyendaDecenasTxt: 'decenas',
    legendTensTxt: 'decenas',
    leyendaCentenasTxt: 'centenas',
    legendHundredsTxt: 'centenas',
    activity: {
      anchors: { name: 'Sumar y restar 1, 5 y 10', detail: 'Empieza por lo más fácil.', instruction: 'Mira el dibujo. Una barra es 10. Un punto suelto es 1.' },
      restar: { name: 'Restar', detail: 'Quitar y contar lo que queda.', instruction: 'Restar es quitar. Cuenta los puntos que no tienen una cruz.' },
      cabeza: { name: 'De cabeza', detail: 'Calcula sin papel.', instruction: 'Piensa el resultado de cabeza. Fíjate en la cifra que cambia.' },
      groups: { name: 'Contar en grupos', detail: 'Decenas, centenas, millares y docenas.', instruction: 'Mira el grupo y di cuántos hay.' }
    },

    /* ============================================================
       Práctica "grupos" — recorrido de aprendizaje
       Antes vivía en Cantidades. Sigue el mismo método de números
       romanos: carrusel, ejemplos de la vida real, recordatorio
       cromático, pasos encadenados.
       ============================================================ */

    /* Pantalla 1: qué es contar en grupos. */
    groupsIntroTitle: 'Contamos en grupos',
    groupsIntroText: 'Contar de uno en uno es muy lento. Por eso la gente cuenta en grupos.',
    groupsIntroNext: 'En la vida real →',
    groupsPrev: '←',
    groupsNext: '→',

    /* Pantalla 2: los grupos en la vida real. */
    groupsFamousTitle: 'Un grupo de la vida real',
    groupsFamousSubtitle: 'Fíjate en este ejemplo:',
    groupsBack: '← Anterior',
    groupsBackToExamples: '← Volver a los ejemplos',
    groupsContinue: 'Siguiente →',

    /* Pantalla 3: recordatorio. */
    groupsReminderTitle: 'Recuerda cuánto vale cada grupo',
    groupsReminderText: 'Cada grupo vale siempre lo mismo.',
    ruleMultiplyTitle: 'Para saber cuánto hay: cuenta los grupos y multiplica.',
    ruleDozenTitle: 'Cuidado: una docena son doce, no diez.',
    groupsStart: 'Empezar a practicar →',

    /* Pantalla 4: los pasos. */
    groupsChooseLevel: 'Elige un paso.',
    groupsBackReminder: '← Volver al recordatorio',
    groupsBackLevels: '← Volver a los pasos',
    groupsChooseAnother: 'Elegir otro paso',

    /* ---------- Los grupos ----------
       Claves PLANAS dentro de 'group': app.js las construye como
       'group.' + id + 'Name', así que un nivel más de anidamiento
       rompería la resolución en tiempo de ejecución sin que check.js
       lo note — el validador sólo ve llamadas literales a t(), no
       las que concatenan. Por grupo:
       Name = singular ("una docena"), Label = con su {n}
       ("2 docenas"), Plural = solo el plural ("docenas") y
       Caption = una frase fácil sobre ese grupo.
       El color nunca va solo: el nombre siempre está escrito. */
    group: {
      unitName: 'unidad',
      unitLabel: '{n} unidades',
      unitPlural: 'unidades',
      unitCaption: 'Una sola cosa. Es el grupo más pequeño.',

      tenName: 'decena',
      tenLabel: '{n} decenas',
      tenPlural: 'decenas',
      tenCaption: 'Diez cosas juntas. Una decena son diez.',

      hundredName: 'centena',
      hundredLabel: '{n} centenas',
      hundredPlural: 'centenas',
      hundredCaption: 'Cien cosas. Una centena son cien.',

      thousandName: 'millar',
      thousandLabel: '{n} millares',
      thousandPlural: 'millares',
      thousandCaption: 'Mil cosas. Un millar son mil.',

      halfDozenName: 'media docena',
      halfDozenLabel: '{n} medias docenas',
      halfDozenPlural: 'medias docenas',
      halfDozenCaption: 'Seis cosas. Es la mitad de una docena.',

      dozenName: 'docena',
      dozenLabel: '{n} docenas',
      dozenPlural: 'docenas',
      dozenCaption: 'Doce cosas. Ojo: una docena no son diez.'
    },

    /* ---------- Ejemplos de la vida real ----------
       Cada frase termina en ':' porque app.js añade detrás la
       cuenta con color ("docena = 12"). Si la frase ya trajera su
       punto final, las dos mitades pelearían por la puntuación. */
    famous: {
      huevos: 'En el mercado, los huevos se venden por docenas. Una caja pequeña trae una:',
      medioHuevos: 'Media caja son seis huevos. Eso es una media docena:',
      dedos: 'Las dos manos juntas tienen diez dedos. Eso es una decena:',
      siglo: 'Un siglo dura cien años. Cien son una centena:',
      concierto: 'Un concierto grande reúne a mil personas. Mil son un millar:'
    },

    /* ---------- Situaciones ----------
       Se muestran como apoyo bajo el enunciado del juego, para que
       la pregunta no sea abstracta: "2 docenas" es una caja de
       huevos, no un ejercicio suelto. */
    scene: {
      huevos: 'Es una caja de huevos del mercado.',
      cajaMedia: 'Es media caja de huevos.',
      manos: 'Son los dedos de las dos manos.',
      siglo: 'Es el número de años que dura un siglo.',
      gradas: 'Es el número de personas en un concierto grande.'
    },

    /* ---------- Los pasos ----------
       También planas: app.js pide 'level.' + id + 'Name' / 'Detail'. */
    level: {
      learnName: 'Aprender los grupos',
      learnDetail: 'Mira un grupo y di cuántos hay.',
      applyName: 'Usar los grupos',
      applyDetail: 'Lee un número grande y cuenta en docenas.',
      testName: 'Todos',
      testDetail: 'Un poco de todo, sin orden fijo.'
    },
    levelDone: 'Hecho',
    starsCount: 'Dificultad {n}',
    stepLabel: 'Paso {n} de {total} · {name}',
    chainNext: 'Siguiente paso: {name}',

    /* ---------- El juego ---------- */
    qHowMany: '¿Cuántas cosas hay?',
    qWhichGroup: '¿En qué grupo se cuenta?',
    qDigitValue: '¿Cuánto vale el {digit} de las {plural}?',

    groupsCorrect: '✅ Así se cuenta.',
    groupsFinal: 'Has acertado {n} de {total}. Ahora tienes {stars} estrellas.',
    groupsHintPrefix: '💡 ',
    groupsWrongPrefix: 'La respuesta es: ',

    hintDigitValue: 'Mira el color de la cifra. Cada color es un grupo.',
    hintWhichGroup: 'Piensa en cuántos grupos caben en ese número. Mira los colores.',
    hintDozen: 'Recuerda: una docena son doce.',
    hintHowMany: 'Cuenta los grupos. Luego multiplica por lo que vale cada grupo.',

    groupsTransfer: 'Contar en grupos te sirve para los huevos, las cajas, el dinero y los números grandes.',
    level: { a1: 'Sumar 1', a2: 'Restar 1', a3: 'Sumar 10', a4: 'Restar 10', a5: 'Sumar 5', a6: 'Restar 5', a7: 'Juntar decenas y unidades', a8: 'Quitar las unidades', a9: 'Sumar formando una decena nueva', a10: 'Restar rompiendo una decena', r10: 'Restas hasta 10', r20: 'Restas hasta 20', k1: 'Dobles', k2: 'Sumar 10', k3: 'Sumar 100', k4: 'Sumar 1.000', k5: 'Restar 10', k6: 'Restar 100', k7: 'Restar 1.000', k8: 'Multiplicar x10', k9: 'Multiplicar x100' },
    gen: {
      anchorAddPrompt: '¿Cuánto es {a} + {step}?',
      anchorSubtractPrompt: '¿Cuánto es {a} − {step}?',
      anchorHintOne: 'Sumar 1 es el número siguiente. Restar 1 es el anterior.',
      anchorHintFive: '5 es media barra. Cuenta los puntos de cinco en cinco.',
      anchorHintTen: 'Una barra entera es 10. Solo cambian las decenas.',
      placeValueAddPrompt: '¿Cuánto es {a} + {b}?',
      placeValueAddHint: 'Junta las barras y los puntos sueltos. Las decenas no cambian.',
      placeValueSubtractPrompt: '¿Cuánto es {a} − {b}?',
      placeValueSubtractHint: 'Quita los puntos sueltos. Quedan solo las barras.',
      carryAddPrompt: '¿Cuánto es {a} + {b}?',
      carryAddHint: 'Cuenta los puntos sueltos. Si llegan a 10, forman una barra nueva.',
      borrowSubtractPrompt: '¿Cuánto es {a} − {b}?',
      borrowSubtractHint: 'No hay puntos sueltos suficientes. Rompe una barra en 10 puntos y quita {b}.',
      restarEnunciado: '¿Cuánto es {a} − {b}?',
      subtractPrompt: '¿Cuánto es {a} − {b}?',
      restarPista: 'Quita {b}. Cuenta los puntos que quedan.',
      subtractHint: 'Quita {b}. Cuenta los puntos que quedan.',
      doblesEnunciado: '¿Cuánto es {a} + {a}?',
      doublesPrompt: '¿Cuánto es {a} + {a}?',
      doblesPista: 'Los dos números son iguales. Es un doble.',
      doublesHint: 'Los dos números son iguales. Es un doble.',
      pistaDecenas: 'Solo cambia la cifra verde: las decenas.',
      tensHint: 'Solo cambia la cifra verde: las decenas.',
      hintDecenas: 'Solo cambia la cifra verde: las decenas.',
      pistaCentenas: 'Solo cambia la cifra morada: las centenas.',
      hundredsHint: 'Solo cambia la cifra morada: las centenas.',
      hintCentenas: 'Solo cambia la cifra morada: las centenas.',
      pistaMiles: 'Solo cambia la cifra de los miles.',
      thousandsHint: 'Solo cambia la cifra de los miles.',
      hintMiles: 'Solo cambia la cifra de los miles.',
      sumaGrandeEnunciado: '¿Cuánto es {n} + {suma}?',
      bigAddPrompt: '¿Cuánto es {n} + {suma}?',
      restaGrandeEnunciado: '¿Cuánto es {n} − {resta}?',
      bigSubtractPrompt: '¿Cuánto es {n} − {resta}?',
      multiplicaGrandeEnunciado: '¿Cuánto es {n} × {factor}?',
      bigMultiplyPrompt: '¿Cuánto es {n} × {factor}?',
      multiplicaGrandePista: 'Añade {ceros} al final de {n}.',
      bigMultiplyHint: 'Añade {ceros} al final de {n}.',
      oneZero: 'un cero',
      twoZeros: 'dos ceros',
      /* Pista socrática: una por tipo de pregunta. La frase genérica
         («Prueba otra vez…») era la misma para todas, así que no decía
         nada. Estas dicen qué mirar en el dibujo o en la cuenta de esta
         pregunta y nunca dan la respuesta. */
      socraticAnchor: '🤔 Mira la barra de diez cosas y cuenta cuántas se mueven.',
      socraticPlaceAdd: '🤔 Mira la barra de decenas: los sueltos se pegan al final.',
      socraticPlaceSub: '🤔 Mira las unidades sueltas que se van: los puntos que quedan son la decena.',
      socraticCarry: '🤔 Cuenta los puntos sueltos: cuando forman diez, se convierten en una barra nueva.',
      socraticBorrow: '🤔 Mira la barra rota en diez sueltos: de ahí se quita lo que falta.',
      socraticRestar: '🤔 Mira el grupo tachado: lo que queda es la respuesta.',
      socraticDoubles: '🤔 Los dos grupos son iguales: juntalos y cuenta los dos.',
      socraticSumLarge: '🤔 Mira la cifra morada: es la única que cambia al sumar.',
      socraticSubtractLarge: '🤔 Mira la cifra morada: es la única que baja al restar.',
      socraticMultiplyLarge: '🤔 Mira la cifra morada: al multiplicar solo cambia ella y los ceros.'
    },
    transfer: 'Esto te servirá para saber cuánto te queda, cuánto falta o calcular una cantidad grande sin usar la calculadora.'
  }, 'es');
})();
