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
    btnMenu: 'Volver al inicio',
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
       Cuatro slides directos: el podio (🥇🥈🥉 en una tarima), la
       clasificación (una tabla con los puestos del 1 al 5), la cola
       (el primero va delante) y el edificio (los pisos se cuentan
       de abajo arriba, con flechas arriba/abajo para señalar el piso
       actual). Las listas explícitas (1-9 y redondos) se quitaron: el
       recordatorio de la pantalla 3 ya muestra la serie entera, y
       repetirlas aquí era recargar lo mismo. */
    famousTitle: 'En la vida real',
    famousSubtitle: 'Cuatro sitios donde los ordinales cobran sentido:',
    /* Antes había aquí un 'back: Anterior' para Pantalla 2: la navegación
       hacia atrás entre pantallas (1→2→3→4→5) ya no existe. Solo
       queda el "← Volver" de la cabecera, que va a la portada de
       Calculia. Las claves back/backToReminder/backToLevels/
       backToExamples se quitan. */
    continue: 'Recuerda →',

    /* ---------- Pantalla 3: recordatorio ----------
       Antes 'Recuerda la serie entera'. Se quita 'la serie entera':
       la pantalla 3 NO es una serie, es una tabla de referencia
       con todos los ordinales que se enseñan. El botón de Pantalla 2
       que lleva aquí se llama ahora 'Recuerda' para que coincida con
       el nombre de la pantalla a la que se entra. */
    reminderTitle: 'Recuerda',
    reminderText: 'Cada ordinal va con su número.',
    ruleMatchTitle: 'Cada ordinal va con su número:',
    start: 'Empezar a practicar →',

    /* ---------- Pantalla 4: los pasos ---------- */
    chooseLevel: 'Elige un paso.',
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
      /* Los nombres y los lugares siguen aquí porque el recordatorio,
         los slides-lista y las preguntas del juego los usan. La
         antigua sección de captions (captionInRow + number.N +
         numberUsage.N) se quitó: el caption del carrusel se eliminó
         entero porque "Sexto. seis en fila." repetía la palabra del
         ordinal una y otra vez. La ficha del recordatorio tampoco
         usa NPlace, porque "sexto lugar" repetía "sexto" — la pieza
         3 ahora es el número natural (1, 2, 3…). NPlace se conserva
         sólo para las preguntas del juego ("¿Quién está en sexto
         lugar?"), donde "lugar" sí aporta. */
      '1Name': 'primero', '1Place': 'primer lugar',
      '2Name': 'segundo', '2Place': 'segundo lugar',
      '3Name': 'tercero', '3Place': 'tercer lugar',
      '4Name': 'cuarto', '4Place': 'cuarto lugar',
      '5Name': 'quinto', '5Place': 'quinto lugar',
      '6Name': 'sexto', '6Place': 'sexto lugar',
      '7Name': 'séptimo', '7Place': 'séptimo lugar',
      '8Name': 'octavo', '8Place': 'octavo lugar',
      '9Name': 'noveno', '9Place': 'noveno lugar',
      '10Name': 'décimo', '10Place': 'décimo lugar',
      /* Los cinco ordinales "redondos" que sí se enseñan. La palabra
         sola es la que la persona tiene que aprender de memoria;
         el uso real se muestra en el escenario de la pantalla 2
         (edificio: undécimo piso; meses: duodécimo mes;
         cumpleaños: vigésimo, trigésimo, cuadragésimo). */
      '11Name': 'undécimo', '11Place': 'undécimo lugar',
      '12Name': 'duodécimo', '12Place': 'duodécimo lugar',
      '20Name': 'vigésimo', '20Place': 'vigésimo lugar',
      '30Name': 'trigésimo', '30Place': 'trigésimo lugar',
      '40Name': 'cuadragésimo', '40Place': 'cuadragésimo lugar'
    },

    /* ---------- Ejemplos de la vida real ----------
       Hay CUATRO: el podio, la clasificación, la cola y el edificio.
       Las frases terminan en ':' porque cada escenario se pinta como
       un todo (la tarima, la tabla, la fila de gente o la pila de
       pisos), no como "1= primero ... = tercero" pieza a pieza; la
       frase es la introducción y los ordinales se leen dentro. */
    famous: {
      /* Slides de "En la vida real": cada uno se compone solo de un
         titular (label, pintado por #famousLabel) y el visual. Sin
         texto explicativo debajo — la aclaración larga vive en la
         tabla del recordatorio (pantalla 3), que es donde se
         consolidan las cifras, las palabras y los lugares. Mismo
         criterio que la galería de Formas: la figura se muestra con
         su nombre y nada más. Las claves de las antiguas
         lista1a9/listaRedondos se quitaron: ya no hay slides-lista,
         solo los cuatro escenarios. Las "text" se quedan vacías
         para que la paridad es/en no se queje de claves huérfanas. */
      podio: '',
      clasificacion: '',
      edificio: '',
      cola: ''
    },

    /* ---------- Situaciones de apoyo ----------
       Para que el ordinal nombre algo y no sea una palabra suelta.
       Después del rediseño de la pantalla 2, las situaciones de
       apoyo del juego se reparten entre los cuatro escenarios
       que la pantalla 2 acaba de presentar: pisos (1°-5°), cola
       (1°-5°), clasificación (1°-5°) y podio (1°-3°). */
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
      cola5: 'Es el puesto en la cola.',
      clasificacion: 'Es el puesto en la clasificación.',
      clasificacion2: 'Es el puesto en la clasificación.',
      clasificacion3: 'Es el puesto en la clasificación.',
      clasificacion4: 'Es el puesto en la clasificación.',
      clasificacion5: 'Es el puesto en la clasificación.',
      podio: 'Es el puesto en el podio.',
      podio2: 'Es el puesto en el podio.',
      podio3: 'Es el puesto en el podio.'
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
    /* Pieza 3 de la ficha del recordatorio y de los ejemplos de la
       regla 1: el número natural con la palabra "posición" delante,
       para que la cifra quede ligada a su papel sin repetir la
       palabra del ordinal ("décimo lugar" repetía "décimo"). El
       número va al final porque es el dato — "Posición 10" suena
       más a "el puesto número 10" que "10 posición". */
    placePrefix: 'Posición {n}',

    /* ---------- La fila ---------- */
    queueHint: 'Cuenta desde la bandera 🏁.',
    queueAria: 'Fila de {n}. La flecha señala el lugar {pos}.',

    /* ---------- El edificio y la cola ---------- */
    /* Etiqueta que aparece sobre el escenario en la pantalla 2. */
    buildingLabel: 'El edificio',
    /* La aria menciona el piso actual ({current}) además del rango: un
       lector de pantalla oye "estás en el piso N", que es justo lo
       que la persona ve en el visual con el realce del piso. */
    buildingAria: 'Edificio de {n} pisos. Estás en el piso {current}; la planta baja es el piso 1 y se sube hasta el {top}.',
    buildingFloor: 'piso {n}',
    /* Etiquetas accesibles de las flechas arriba/abajo. No son
       visibles — solo las oyen los lectores de pantalla. */
    buildingArrowUp: 'Subir al piso de arriba',
    buildingArrowDown: 'Bajar al piso de abajo',
    queueLabel: 'La cola',
    queuePosition: '{n}º',
    queueAriaLabel: 'Cola de {n} personas. La primera está delante; la última, detrás.',

    /* ---------- El podio y la clasificación ---------- */
    /* Etiquetas que aparecen sobre los dos escenarios nuevos en la
       pantalla 2. El podio no necesita "n" porque siempre tiene
       tres posiciones (es la definición de podio olímpico); la
       clasificación sí, porque tiene la misma longitud que la cola
       y el edificio. */
    podiumLabel: 'El podio',
    /* La aria describe los tres puestos por su medalla (oro, plata,
       bronce) y por su cifra ordinal, en el mismo orden que el
       visual: primero en el centro arriba, segundo a su izquierda,
       tercero a su derecha. Un lector de pantalla oye la misma
       lectura que el ojo. */
    podiumAria: 'Podio olímpico. El primero en el centro, con la medalla de oro; el segundo a la izquierda, con la de plata; el tercero a la derecha, con la de bronce.',
    classificationLabel: 'La clasificación',
    classificationAria: 'Clasificación de {n} participantes, del primero al último.',

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
    hintPosition: '«{elegida}» no es el puesto: cuenta desde la bandera. El primero va justo al lado de ella.',
    hintMember: '«{elegida}» no es ese puesto: cuenta desde la bandera hasta ese puesto.',
    hintOrdinalToDigit: '«{elegida}» no es el número: mira qué número va escrito junto a la palabra.',
    hintDigitToOrdinal: '«{elegida}» no es la palabra de ese puesto: piensa qué puesto ocupa ese número en la fila.',

    finalSummary: 'Has acertado {n} de {total}. Ahora tienes {stars} estrellas.',
    transfer: 'Los ordinales se usan en los podios, en las clasificaciones, en las colas, en los pisos, en las fechas y en las listas. Saber el puesto de cada uno ayuda en el día a día.'
  }, 'es');
})();