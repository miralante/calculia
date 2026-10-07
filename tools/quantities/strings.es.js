/* ============================================================
   Calculia — Cantidades: textos (ES)
   Archivo específico del idioma. Se carga condicionalmente
   desde index.html según App.i18n.locale().

   El diccionario cubre dos mitades: las tres prácticas de
   escritura (leer / escribir / puntos) y la práctica de grupos,
   que tiene su propio recorrido (intro, ejemplos, recordatorio,
   pasos y juego). Las claves de 'group.*', 'famous.*' y
   'scene.*' son el contenido real de la actividad: el número
   vive en data.js y solo se traduce la palabra que lo rodea,
   nunca la cifra.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '👀 Cantidades',
    instruction: 'Lee números grandes y cuenta en grupos.',
    choosePractice: 'Elige qué quieres practicar.',
    btnMenu: 'Volver al inicio',

    /* ---------- Menú de prácticas ----------
       Claves '<id>Name' / '<id>Detail': una entrada por práctica
       de DATA.practices. */
    readName: 'Leer números',
    readDetail: 'Mira el número y escríbelo.',
    writeName: 'Escribir números',
    writeDetail: 'Escucha el número y escríbelo.',
    pointsName: 'Poner los puntos',
    pointsDetail: 'Separa los millares con puntos.',
    groupsName: 'Contar en grupos',
    groupsDetail: 'Decenas, centenas, millares y docenas.',

    /* ---------- Prácticas de escritura ----------
       {n} = número ya formateado. {nRaw} = número sin separador. */
    promptRead: 'Escribe este número: {n}',
    promptWrite: 'Escribe el número que oyes.',
    promptPoints: 'Escribe este número con sus puntos: {nRaw}',

    detailRead: 'Copia las cifras. Añade el punto cada tres, si toca.',
    detailWrite: 'Pulsa 🔊 si necesitas escucharlo otra vez.',
    detailPoints: 'Cuenta tres cifras desde la derecha y pon el punto.',

    /* Pistas socráticas: enseñan el mecanismo, nunca dan la
       respuesta (ver SPEC: la anatomía socrática completa). */
    hintRead: 'Cuenta las cifras. Si hay cuatro o más, agrúpalas de tres desde la derecha.',
    hintWrite: 'Pulsa 🔊 y escribe lo que oigas.',
    hintPoints: 'El punto va cada tres cifras, empezando por la derecha.',

    /* Refuerzo: al terminar la ronda, los fallos se repiten en una
       mini-ronda. Las estrellas ya ganadas no se quitan. */
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir los {n} ejercicios que has fallado hasta acertarlos todos.',

    check: 'Comprobar',
    chooseAnother: 'Elegir otra práctica',
    roundComplete: '¡Ronda terminada!',
    roundSummary: 'Has resuelto {count} ejercicios. Ahora tienes {stars} estrellas.',
    progress: '{current} de {stars}',
    correctFormat: 'Se escribe: {n}',

    answerInputAria: 'Escribe el número',

    /* Transferencia: para qué sirve esto fuera de la pantalla. */
    contexto: 'Lees números en la tienda, en el ascensor, en el dinero y en la prensa. Leer y escribir números grandes se usa a cada rato.',
    explicacion: '✅ Los números se cuentan en grupos. Cada grupo vale siempre lo mismo: una decena son diez, una centena son cien. Si conoces los grupos, ya no necesitas contar de uno en uno.',
    transfer: 'Esto te servirá para leer precios, noticias o cualquier número grande del día a día.',

    /* ============================================================
       Práctica "grupos" — recorrido de aprendizaje
       ============================================================ */

    /* Pantalla 1: qué es contar en grupos. */
    groupsIntroTitle: 'Contamos en grupos',
    groupsIntroText: 'Contar de uno en uno es muy lento. Por eso la gente cuenta en grupos.',
    groupsIntroNext: 'Siguiente →',
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
       ('group.unit.Name') rompería la resolución en tiempo de
       ejecución sin que check.js lo note — el validador sólo ve
       llamadas literales a t(), no las que concatenan. Por grupo:
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

    groupsTransfer: 'Contar en grupos te sirve para los huevos, las cajas, el dinero y los números grandes.'
  }, 'es');
})();