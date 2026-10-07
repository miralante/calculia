/* ============================================================
   Calculia — Números ordinales: textos (ES)
   Archivo específico del idioma. Se carga condicionalmente
   desde index.html según App.i18n.locale().

   OJO CON LA FORMA DE LAS CLAVES
   ------------------------------
   app.js construye las claves de la serie concatenando:
   `t('ord.' + n + 'Name')`, con n numérico. Eso produce
   `ord.1Name`, `ord.10Place`… El diccionario las registra PLANAS
   bajo el prefijo, con el número pegado al sufijo:

       ord: { '1Name': 'primero', '1Place': 'primer lugar', ... }

   y NUNCA anidadas (`ord: { 1: { Name: … } }`), que darían
   `ord.1.Name` y no encajarían. El validador de es/en no lo detecta
   —sólo ve llamadas literales a t()— así que un error aquí pasa
   todas las puertas y falla en el navegador, donde t() devuelve la
   propia clave. Mismo criterio que `centuryContext.<n>` en Romanos.

   Las claves numéricas van entrecomilladas porque `1Name` no es un
   identificador válido en JavaScript.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🥇 Números ordinales',
    instruction: 'Aprende qué lugar ocupa cada uno.',

    /* ---------- Pantalla 1: la serie ---------- */
    introTitle: 'Los ordinales dicen el lugar',
    introText: 'Los números dicen cuántos hay. Los ordinales dicen en qué puesto está cada uno.',
    introNext: 'Siguiente →',
    prev: '←',
    nextArrow: '→',

    /* ---------- Pantalla 2: la vida real ---------- */
    famousTitle: 'Un ordinal de la vida real',
    famousSubtitle: 'Fíjate en este ejemplo:',
    back: '← Anterior',
    continue: 'Siguiente →',

    /* ---------- Pantalla 3: recordatorio ---------- */
    backToExamples: '← Volver a los ejemplos',
    reminderTitle: 'Recuerda la serie entera',
    reminderText: 'Cada ordinal va con su número.',
    ruleMatchTitle: 'Cada ordinal va con su número:',
    ruleStartTitle: 'Y la cuenta empieza en el primero. No hay un lugar cero:',
    start: 'Empezar a practicar →',
    backToReminder: '← Volver al recordatorio',

    /* ---------- Pantalla 4: los pasos ---------- */
    chooseLevel: 'Elige un paso.',
    backToLevels: '← Volver a los pasos',
    chooseAnother: 'Elegir otro paso',
    btnHome: 'Volver al inicio',

    /* ---------- La serie ----------
       Dos formas por ordinal —la cifra y la palabra— más el lugar,
       porque el error típico es usar una donde toca otra. No hay
       abreviatura con el signo de grado superíndice: check.js (6.1)
       la prohíbe por substring en todo lo que se sirve, porque es
       indistinguible de la marca de curso escolar, y el escaneo
       incluye los comentarios. La cifra hace el mismo trabajo sin
       chocar con esa puerta. */
    ord: {
      '1Name': 'primero', '1Place': 'primer lugar',
      '1Caption': 'Es el que va delante de todos. El primero de la fila.',
      '2Name': 'segundo', '2Place': 'segundo lugar',
      '2Caption': 'Va detrás del primero. El segundo de la fila.',
      '3Name': 'tercero', '3Place': 'tercer lugar',
      '3Caption': 'Va el tercero. En una fila, el tercero va en el tercer puesto.',
      '4Name': 'cuarto', '4Place': 'cuarto lugar',
      '4Caption': 'Cuarto. Desde aquí, el ordinal se parece a su número: 4.',
      '5Name': 'quinto', '5Place': 'quinto lugar',
      '5Caption': 'Quinto. El quinto va en el quinto puesto.',
      '6Name': 'sexto', '6Place': 'sexto lugar',
      '6Caption': 'Sexto. Seis en fila: el sexto es el sexto puesto.',
      '7Name': 'séptimo', '7Place': 'séptimo lugar',
      '7Caption': 'Séptimo. Siete en fila.',
      '8Name': 'octavo', '8Place': 'octavo lugar',
      '8Caption': 'Octavo. Ocho en fila.',
      '9Name': 'noveno', '9Place': 'noveno lugar',
      '9Caption': 'Noveno. Nueve en fila.',
      '10Name': 'décimo', '10Place': 'décimo lugar',
      '10Caption': 'Décimo. Diez en fila: el décimo es el último.'
    },

    /* ---------- Ejemplos de la vida real ----------
       Las frases terminan en ':' porque app.js añade detrás la cuenta
       con color ("3 = tercero"). Si trajeran su punto final, las dos
       mitades pelearían por la puntuación. */
    famous: {
      primeraCita: 'Es la primera vez que pide cita. Primero es el que va delante:',
      segundaVez: 'Vuelve por segunda vez. La segunda vez ya no es la primera:',
      tercerPiso: 'Vive en el tercer piso. Los pisos se cuentan desde abajo:',
      cuartoLugar: 'Llegó cuarto a la carrera. Se dice cuarto lugar:',
      quintoPiso: 'Vive en el quinto piso. Está cinco plantas más arriba que el primero:'
    },

    /* ---------- Situaciones de apoyo ----------
       Para que el ordinal nombre algo y no sea una palabra suelta. */
    scene: {
      cita: 'Es la primera vez que viene.',
      repetir: 'Es la segunda vez que lo hace.',
      piso: 'Es el piso en el que vive.',
      carrera: 'Es el puesto que sacó en la carrera.',
      turno: 'Es el turno que le toca.',
      entrega: 'Es la primera entrega del paquete.',
      visita: 'Es la segunda visita.',
      escalera: 'Es el piso al que sube.',
      clasificacion: 'Es la posición en la lista.',
      puesto: 'Es el puesto que le toca.'
    },

    /* ---------- Los pasos ---------- */
    level: {
      learnName: 'Aprender los lugares',
      learnDetail: 'Mira una fila y di qué lugar ocupa cada uno.',
      applyName: 'Usar los ordinales',
      applyDetail: 'Primero, segundo, tercero… hasta el décimo.',
      testName: 'Todos',
      testDetail: 'Un poco de todo, sin orden fijo.'
    },
    levelDone: 'Hecho',
    starsCount: 'Dificultad {n}',
    stepLabel: 'Paso {n} de {total} · {name}',
    chainNext: 'Siguiente paso: {name}',

    /* ---------- La fila ---------- */
    queueHint: 'Cuenta desde la bandera 🏁.',
    queueAria: 'Fila de {n}. La flecha señala el lugar {pos}.',

    /* ---------- El juego ---------- */
    qPosition: '¿Qué lugar ocupa el que señala la flecha?',
    qMember: '¿Quién está en {place}?',
    qOrdinalToDigit: '¿Qué número es este ordinal?',
    qDigitToOrdinal: '¿Qué ordinal es este número?',

    correct: '✅ Así se dice.',
    hintPrefix: '💡 ',
    wrongPrefix: 'La respuesta es: ',

    /* Pistas socráticas: dicen dónde mirar, nunca cuál era la
       respuesta. */
    hintPosition: 'Cuenta desde la bandera. El primero va justo al lado de ella.',
    hintMember: 'Cuenta desde la bandera hasta ese puesto.',
    hintOrdinalToDigit: 'Mira qué número va escrito junto a la palabra.',
    hintDigitToOrdinal: 'Piensa qué puesto ocupa ese número en la fila.',

    finalSummary: 'Has acertado {n} de {total}. Ahora tienes {stars} estrellas.',
    transfer: 'Los ordinales se usan en los turnos, en los pisos, en las fechas y en las listas. Saber el puesto de cada uno ayuda en el día a día.'
  }, 'es');
})();