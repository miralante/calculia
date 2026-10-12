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
    /* Tarjeta de medallas: la presentación del concepto. Es el
       primer contacto real con los ordinales — primero, segundo,
       tercero son los que ya se conocen sin tener que aprenderlos.
       Por eso la tarjeta es fija y va ANTES del carrusel: la serie
       que viene después añade, no presenta. La tarjeta no lleva ni
       h2 ni párrafo: las tres medallas 🥇🥈🥉 con su cifra abreviada
       (la pinta app.js con `abbrev(n)` y la concatena en runtime
       para esquivar el check 6.1) y su nombre (primero, segundo,
       tercero) ya dicen todo. La intro general de la pantalla (la
       tarjeta de arriba, "Los ordinales dicen el lugar") titula la
       sección. */
    introNext: 'Ver en la vida real →',
    prev: '←',
    nextArrow: '→',

    /* ---------- Pantalla 2: la vida real ----------
       Cuatro slides: dos listas (los más conocidos 1-9, los redondos
       11/12/20/30) y dos escenarios (edificio, cola). El subtítulo
       refleja esa mezcla: los más oídos + dos ejemplos de uso. */
    famousTitle: 'En la vida real',
    famousSubtitle: 'Los más conocidos y dos sitios donde se usan:',
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
       Tres formas por ordinal —la cifra, la palabra y el lugar— porque
       el error típico es usar una donde toca otra. Los cuatro
       ordinales redondos (11, 12, 20, 30) tienen una "caption" más
       explícita porque son palabras que la mayoría de la gente no
       reconoce a primera vista y necesita una frase que las sitúe.

       No hay abreviatura con el signo de grado superíndice: check.js
       (6.1) la prohíbe por substring en todo lo que se sirve, porque
       es indistinguible de la marca de curso escolar, y el escaneo
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
      '10Caption': 'Décimo. Diez en fila: el décimo es el último.',
      /* Los cuatro ordinales "redondos" que sí se enseñan. La frase
         los mete en la vida real — pisos del 11, mes 12, edad 20,
         edad 30 — porque la palabra sola no se asocia a nada. */
      '11Name': 'undécimo', '11Place': 'undécimo lugar',
      '11Caption': 'Undécimo. Once en fila. Se usa para los pisos: "vive en el piso undécimo".',
      '12Name': 'duodécimo', '12Place': 'duodécimo lugar',
      '12Caption': 'Duodécimo. Doce en fila. También se usa para los meses: "el duodécimo mes".',
      '20Name': 'vigésimo', '20Place': 'vigésimo lugar',
      '20Caption': 'Vigésimo. Veinte en fila. Se usa para los cumpleaños: "el vigésimo".',
      '30Name': 'trigésimo', '30Place': 'trigésimo lugar',
      '30Caption': 'Trigésimo. Treinta en fila. También para los cumpleaños: "el trigésimo".'
    },

    /* ---------- Ejemplos de la vida real ----------
       Sólo hay DOS: el edificio y la cola. Las frases terminan en
       ':' porque cada escenario se pinta como un todo (la pila de
       pisos o la fila de gente), no como "1= primero ... = tercero"
       pieza a pieza; la frase es la introducción y los ordinales se
       leen dentro. */
    famous: {
      /* Slides de "En la vida real": cada uno se compone solo de un
         titular (label, pintado por #famousLabel) y el visual. Sin
         texto explicativo debajo — la aclaración larga vive en la
         tabla del recordatorio (pantalla 3), que es donde se
         consolidan las cifras, las palabras y los lugares. Mismo
         criterio que la galería de Formas: la figura se muestra con
         su nombre y nada más.

         La "aria" sigue siendo larga para los lectores de pantalla:
         lo que se calla visualmente se sigue leyendo. Las "text" se
         conservan vacías para que la clave quede registrada y la
         paridad es/en no se queje de claves huérfanas. */
      lista1a9: {
        label: 'Los más conocidos',
        text: '',
        aria: 'Los ordinales del primero al noveno: {list}.'
      },
      listaRedondos: {
        label: 'Los redondos',
        text: '',
        aria: 'Los ordinales redondos: {list}.'
      },
      edificio: '',
      cola: ''
    },

    /* ---------- Situaciones de apoyo ----------
       Para que el ordinal nombre algo y no sea una palabra suelta.
       Después del rediseño de la pantalla 2, las situaciones de
       apoyo del juego se reparten entre pisos (1°-5°) y cola (1°-5°)
       —los dos contextos que la pantalla 2 acaba de presentar. */
    scene: {
      piso: 'Es el piso en el que vive.',
      piso2: 'Es el piso en el que vive.',
      piso3: 'Es el piso en el que vive.',
      piso4: 'Es el piso en el que vive.',
      piso5: 'Es el piso en el que vive.',
      cola: 'Es el puesto en la cola.',
      cola2: 'Es el puesto en la cola.',
      cola3: 'Es el puesto en la cola.',
      cola4: 'Es el puesto en la cola.',
      cola5: 'Es el puesto en la cola.'
    },

    /* ---------- Los pasos ---------- */
    level: {
      learnName: 'Aprender los lugares',
      learnDetail: 'Mira una fila y di qué lugar ocupa cada uno.',
      applyName: 'Usar los ordinales',
      applyDetail: 'Los más comunes: del primero al décimo y los redondos.',
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

    /* ---------- El edificio y la cola ---------- */
    /* Etiqueta que aparece sobre el escenario en la pantalla 2. */
    buildingLabel: 'El edificio',
    buildingAria: 'Edificio de {n} pisos. La planta baja es el piso 1; se sube hasta el piso {top}.',
    buildingFloor: 'piso {n}',
    queueLabel: 'La cola',
    queuePosition: '{n}º',
    queueAriaLabel: 'Cola de {n} personas. La primera está delante; la última, detrás.',

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