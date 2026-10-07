/* ============================================================
   Calculia — Textos de Escala (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   Los nombres de instrumentos van en 'real.*' y app.js los busca por
   el id que usa data.js, así que añadir un instrumento es añadir su
   id aquí y en los dos idiomas.
   Todo el texto sigue UNE 153101: frases cortas, una idea por
   frase, palabras de cada día. "Escala" y "rayita" valen más que
   "graduación" y "división", que no son palabras de la calle.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '📏 Escala',
    instructionIntro: 'Mira cómo se lee una escala.',

    /* ---- Las cuatro ideas, antes de preguntar ---- */
    concept: {
      escala: {
        title: 'La escala',
        text: 'Es la lista de medidas de un instrumento. Cada rayita tiene su número.'
      },
      rayita: {
        title: 'La rayita',
        text: 'Cada rayita vale lo mismo. A eso le llaman un paso.'
      },
      llegar: {
        title: 'Llegar a la rayita',
        text: 'El objeto llega a una rayita. Esa rayita es su medida.'
      },
      dibujo: {
        title: 'La escala de un dibujo',
        text: 'Un plano es más pequeño que la vida de verdad. La escala dice cuánto más pequeño.'
      }
    },

    galleryPrevious: 'Anterior',
    galleryNext: 'Siguiente',
    introContinue: 'Verlas en la vida real →',
    realTitle: 'Las escalas están a tu alrededor',
    realBack: '← Volver a las ideas',
    realContinue: 'Hacer el test →',
    instructionMenu: 'Elige qué quieres practicar.',
    menuBack: '← Volver a los instrumentos',

    real: {
      regla: {
        name: 'Una regla',
        text: 'Mide en centímetros. Las rayitas más cortas son los milímetros.'
      },
      termo: {
        name: 'Un termómetro',
        text: 'Mide la temperatura. Cada rayita es un grado.'
      },
      jarra: {
        name: 'Una jarra de la cocina',
        text: 'Mide los mililitros. Cada rayita son cien.'
      },
      mapa: {
        name: 'Un mapa',
        text: 'Una ciudad entera cabe en una hoja. La escala lo hace posible.'
      },
      agua: {
        name: 'El contador del agua',
        text: 'Sus números van de uno en uno. Es una lista de medidas, como la regla.'
      }
    },

    activity: {
      leer: { name: 'Leer la medida', detail: 'A ver hasta dónde llega.' },
      paso: { name: 'El paso', detail: 'Cuánto vale una rayita.' },
      instrumento: { name: 'Otros instrumentos', detail: 'La misma idea, con otra forma.' },
      plano: { name: 'La escala de un plano', detail: 'Del dibujo a la vida real.' }
    },
    level: {
      l1: 'Rayitas con número',
      l2: 'Un número de cada dos rayitas',
      l3: 'Un número de cada cinco rayitas',
      p1: 'Cuánto vale una rayita',
      p2: 'Cuántas rayitas hay',
      t1: 'El termómetro',
      t2: 'La jarra',
      d1: 'Del plano a la realidad',
      d2: 'De la realidad al plano'
    },

    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnMenu: 'Volver al inicio',
    btnOtherActivity: 'Otra actividad',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 Prueba otra vez. Mira el dibujo con calma.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',

    gen: {
      /* --- leer y los instrumentos: la misma lectura, tres recipientes --- */
      readPromptRuler: 'El lápiz llega aquí. ¿Cuánto mide?',
      readPromptTermo: 'El termómetro marca aquí. ¿Qué temperatura es?',
      readPromptJar: 'El agua llega aquí. ¿Cuánta agua hay?',
      readAria: 'El lápiz llega a la marca {value}.',
      readHint: 'Empieza en el número más bajo y sube contando las rayitas.',
      levelAria: 'El nivel llega a {value} grados.',
      jarAria: 'El agua llega a {value} mililitros.',

      /* --- paso --- */
      stepPrompt: 'Cada rayita vale lo mismo. ¿Cuánto vale una rayita?',
      stepAria: 'En la regla hay {gaps} rayitas entre {from} y {to}.',
      stepHint: 'Mira cuántos números hay y cuántas rayitas los separan.',
      stepsPrompt: 'El lápiz empieza aquí y llega aquí. ¿Cuántas rayitas recorre?',
      stepsAria: 'El lápiz va de {from} a {to}.',
      stepsHint: 'Cuenta las rayitas que pasa, sin contar la de la que parte.',

      /* --- plano --- */
      planKey: 'En el plano, cada centímetro son {key} {unit}.',
      planPrompt: 'En el plano son {cm} cm. ¿Cuántos {unit} son de verdad?',
      planAria: 'En el plano, cada centímetro son {key} {unit}. El tramo del plano mide {cm} centímetros.',
      planHint: 'Cuenta los centímetros del camino y multiplica.',
      planBackPrompt: 'De verdad son {real} {unit}. ¿Cuántos centímetros mide en el plano?',
      planBackAria: 'En el plano, cada centímetro son {key} {unit}. De verdad son {real} {unit}.',
      planBackHint: 'Reparte los {real} {unit} en trozos de {key}.',
      planBackWrong: 'En el plano son {real} cm de verdad.',
      planLabel: 'Plano',
      planPath: 'El camino',
      planReal: 'Vida real',
      unitCentimetre: 'centímetros',
      unitMetre: 'metros',
      unitKm: 'kilómetros'
    },

    transfer: 'Te servirá para leer una receta, un plano del metro o el contador del agua sin miedo.'
  }, 'es');
})();