/* ============================================================
   Calculia — Números ordinales: textos (ES)
   Archivo específico del idioma. Se carga condicionalmente
   desde index.html según App.i18n.locale().

   OJO CON LA FORMA DE LAS CLAVES
   ------------------------------
   app.js y screens.js construyen las claves de la serie concatenando:
   `t('ord.' + n + 'Name')`, con n numérico. Eso produce `ord.1Name`,
   `ord.10Place`… El diccionario las registra PLANAS, con el número
   pegado al sufijo:

       ord: { '1Name': 'primero', '1Place': 'primer lugar', ... }

   y NUNCA anidadas (`ord: { 1: { Name: … } }`), que darían
   `ord.1.Name` y no encajarían. El validador de es/en no lo detecta
   —sólo ve llamadas literales a t()— así que un error aquí pasa todas
   las puertas y falla en el navegador, donde t() devuelve la propia
   clave. Las claves numéricas van entrecomilladas porque `1Name` no es
   un identificador válido en JavaScript.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🥇 Números ordinales',
    instruction: 'Aprende qué lugar ocupa cada uno.',

    /* ---------- Explicación ---------- */
    introTitle: 'Los ordinales dicen el lugar',
    introText: 'Los números dicen cuántos hay. Los ordinales dicen en qué puesto está cada uno.',

    /* ---------- Recordatorio ---------- */
    reminderTitle: 'Recuerda',
    reminderText: 'Cada ordinal va con su número.',
    ruleMatchTitle: 'Cada ordinal va con su número:',
    /* Botón del recordatorio: empieza el test. */
    start: 'Empezar a practicar →',

    /* Pieza del número natural de un ordinal: "Posición 3". El número va
       al final porque es el dato. */
    placePrefix: 'Posición {n}',

    /* ---------- La serie ----------
       Tres formas por ordinal —la cifra, la palabra y el lugar— porque el
       error típico es usar una donde toca otra. No hay abreviatura con el
       signo de grado superíndice: check.js (6.1) la prohíbe por substring
       en todo lo que se sirve al navegador. */
    ord: {
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
      /* Los ordinales redondos que sí se enseñan. El uso real aparece en los
         ejemplos (edificio: undécimo piso; cumpleaños: vigésimo, trigésimo). */
      '11Name': 'undécimo', '11Place': 'undécimo lugar',
      '12Name': 'duodécimo', '12Place': 'duodécimo lugar',
      '20Name': 'vigésimo', '20Place': 'vigésimo lugar',
      '30Name': 'trigésimo', '30Place': 'trigésimo lugar',
      '40Name': 'cuadragésimo', '40Place': 'cuadragésimo lugar'
    },

    /* ---------- Ejemplos de la vida real: la etiqueta de cada uno ---------- */
    podiumLabel: 'El podio',
    /* Descripción del podio por su medalla (oro, plata, bronce) y su orden. */
    podiumAria: 'Podio olímpico. El primero en el centro, con la medalla de oro; el segundo a la izquierda, con la de plata; el tercero a la derecha, con la de bronce.',
    classificationLabel: 'La clasificación',
    classificationAria: 'Clasificación de {n} participantes, del primero al último.',
    queueLabel: 'La cola',
    queueAriaLabel: 'Cola de {n} personas. La primera está delante; la última, detrás.',
    queueCounter: 'Ventanilla',
    buildingLabel: 'El edificio',
    buildingAria: 'Edificio de {n} pisos. Estás en el piso {current}; la planta baja es el piso 1 y se sube hasta el {top}.',
    buildingFloor: 'piso {n}',
    /* Etiqueta del piso señalado: el realce no es solo de color. */
    buildingHere: 'Estás aquí',

    /* ---------- El test ---------- */
    queueGoal: 'Meta',
    queueHint: 'Cuenta desde la meta.',
    queueAria: 'Fila de {n}. La flecha señala el lugar {pos}.',

    qPosition: '¿Qué lugar ocupa el que señala la flecha?',
    qMember: '¿Quién está en {place}?',
    qOrdinalToDigit: '¿Qué número es este ordinal?',
    qDigitToOrdinal: '¿Qué ordinal es este número?',

    /* Explicación tras acertar (y tras fallar dos veces): la regla de la
       pregunta, dicha con sus palabras. */
    explainPosition: 'Contando desde la meta, el que señala la flecha es el {ord}.',
    explainMember: 'Contando desde la meta, el {place} es {animal}.',
    explainOrdinalToDigit: 'El ordinal {ord} se escribe con el número {n}.',
    explainDigitToOrdinal: 'El número {n} se dice {ord}.',

    /* Pistas socráticas: dicen dónde mirar, nunca cuál era la respuesta. */
    hintPosition: '«{elegida}» no es el puesto: cuenta desde la meta. El primero va justo al lado de ella.',
    hintMember: '«{elegida}» no es ese puesto: cuenta desde la meta hasta ese puesto.',
    hintOrdinalToDigit: '«{elegida}» no es el número: mira qué número va escrito junto a la palabra.',
    hintDigitToOrdinal: '«{elegida}» no es la palabra de ese puesto: piensa qué puesto ocupa ese número en la fila.'
  }, 'es');
})();
