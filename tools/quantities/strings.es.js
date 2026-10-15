/* ============================================================
   Calculia — Cantidades: textos (ES)
   Archivo específico del idioma. Se carga condicionalmente
   desde index.html según App.i18n.locale().

   El diccionario cubre las tres prácticas (leer / escribir /
   poner los puntos). El juego de los puntos sube de miles a miles
   de millones: la persona coloca los puntos en los huecos del número.
   La antigua práctica "contar en grupos" se mudó a Cálculo
   Mental en 2026-10: sus textos viven ahora en
   tools/mental-math/strings.es.js.
   La actividad de pares e impares se mudó a tools/parity/ en la
   misma fecha.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '👀 Leer y Escribir Números',
    instruction: 'Lee y escribe números grandes.',
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
    pointsDetail: 'Coloca los puntos. De miles a miles de millones.',

    /* ---------- Prácticas de escritura ----------
       {n} = número ya formateado. */
    promptRead: 'Escribe este número: {n}',
    promptWrite: 'Escribe el número que oyes.',

    detailRead: 'Copia las cifras. Añade el punto cada tres, si toca.',
    detailWrite: 'Pulsa 🔊 si necesitas escucharlo otra vez.',

    /* ---------- Juego de los puntos ----------
       {count} = puntos que faltan por colocar en este número.
       {n} = cuántos puntos quedan en la bandeja. */
    promptPoints: 'Pon {count} puntos en este número.',
    promptPointsOne: 'Pon 1 punto en este número.',
    detailPoints: 'Toca un hueco para poner un punto. Toca un punto para quitarlo.',
    pointsLeft: 'Puntos por colocar: {n}',
    pointsMissing: 'Todavía quedan puntos por colocar.',
    pointsNoneLeft: 'Ya no quedan puntos. Toca uno de los colocados para quitarlo.',
    pointsWrongMarked: 'Revisa los puntos marcados con ✗.',
    gapEmptyAria: 'Hueco vacío: toca para poner un punto.',
    gapFilledAria: 'Punto: toca para quitarlo.',
    pointsBoardAria: 'Número para colocar los puntos',

    /* Pistas socráticas: enseñan el mecanismo, nunca dan la
       respuesta (ver SPEC: la anatomía socrática completa). */
    hintRead: 'Cuenta las cifras. Si hay cuatro o más, agrúpalas de tres desde la derecha.',
    hintWrite: 'Pulsa 🔊 y escribe lo que oigas.',
    hintPoints: 'Cuenta las cifras de tres en tres, desde la derecha. Entre un grupo y el siguiente va un punto.',

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
    explicacion: '✅ Leer y escribir números grandes se coge con práctica: cada cifra va en su sitio y el separador agrupa los millares. Conoces los grupos y ya no necesitas contar de uno en uno.',
    transfer: 'Esto te servirá para leer precios, noticias o cualquier número grande del día a día.'
  }, 'es');
})();
