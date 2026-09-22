/* ============================================================
   Calculia — Textos de La balanza (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   'series.*' son los nombres de lo que mide cada gráfica y 'trend.*'
   las tres cosas que puede hacer una línea: app.js los busca por el id
   que usa data.js.
   Los números NO están aquí: viven una sola vez en data.js.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⚖️ La balanza',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Una balanza tiene que quedar equilibrada. Una letra es el nombre de un número que todavía no sabes. Y una gráfica cuenta si algo sube o baja.',
    explicacion: '✅ Aquí no hay que despejar nada ni aprenderse reglas. Solo mirar qué falta para que los dos platos pesen igual.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 Prueba otra vez. Mira el dibujo con calma.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    answer: {
      yes: 'Sí',
      no: 'No'
    },
    trend: {
      up: 'Sube',
      down: 'Baja',
      same: 'Se queda igual'
    },
    series: {
      temperature: 'la temperatura',
      people: 'la gente que entra',
      battery: 'la batería del móvil',
      rain: 'la lluvia'
    },
    activity: {
      dosBalanzas: { name: 'Dos balanzas', detail: 'Dos cosas a la vez.', instruction: 'Cuando hay dos cosas que no sabes hacen falta dos balanzas: una sola no basta. Busca la pareja de pesos que hace que las dos queden bien. Y si una balanza está torcida, el lado que baja es el que pesa más.' },
      cuadrado: { name: 'El cuadrado', detail: 'Si x por x es tanto...', instruction: 'Si multiplicas un número por sí mismo sale un cuadrado de cuadraditos. Te damos los cuadraditos y buscas el lado: eso es deshacer el cuadrado.' },
      crecer: { name: 'Cómo crece', detail: 'Siempre igual o cada vez más.', instruction: 'Algo puede crecer siempre lo mismo (de 2 en 2, de 5 en 5) o cada vez más deprisa. Encima de las barras está escrito cuánto sube cada vez: si todos los saltos son iguales, crece siempre igual.' },
      balanza: { name: 'La balanza', detail: '¿Cuánto pesa la bolsa?', instruction: 'Los dos platos de la balanza pesan lo mismo. Cada pesa vale 1 kilo. La bolsa tiene un peso que no sabes: mira qué falta en su lado para que los dos pesen igual.' },
      letras: { name: 'Las letras', detail: 'Un número que no sabes.', instruction: 'Cuando no sabes un número se le pone una letra, casi siempre la x. Si luego te dicen cuánto vale la x, ya puedes calcular lo demás. Y 3x quiere decir tres veces x.' },
      piezas: { name: 'Las piezas', detail: 'Escribir y montar.', instruction: 'Hay tres piezas. La grande es un cuadrado y su lado mide x. La tira mide x de largo y 1 de ancho. La pequeña es un 1. Un montón de piezas se puede escribir, y con las piezas se pueden montar cuadrados y rectángulos.' },
      graficas: { name: 'Las gráficas', detail: 'Si sube o si baja.', instruction: 'Una gráfica dibuja cómo cambia algo con las horas. Si las barras van creciendo, sube. Si van bajando, baja. Si son iguales, se queda igual.' }
    },
    level: {
      s1: 'La pareja que cuadra',
      s2: '¿Qué lado pesa más?',
      q1: 'Si x por x es tanto',
      c1: '¿Cómo crece?',
      c2: 'Busca la que sube igual',
      b1: 'Una bolsa y pesas',
      b2: 'Varias bolsas iguales',
      b3: 'Pesas en los dos lados',
      l1: 'Si la x vale...',
      l2: 'Cómo se escribe',
      g1: '¿Sube o baja?',
      t1: '¿Cómo se escribe el montón?',
      t2: 'El lado del cuadrado',
      t3: 'El lado que falta',
      g2: '¿Cuándo es lo más alto?'
    },
    grow: {
      same: 'Siempre lo mismo',
      faster: 'Cada vez más'
    },
    gen: {
      system: '¿Cuánto pesa cada una?',
      systemHint: 'La pareja tiene que quedar bien en las dos balanzas, no solo en una.',
      systemAria: 'Dos balanzas: juntas pesan {total}, y una pesa {diff} más que la otra.',
      andAlso: 'y además',
      pairLabel: 'la bolsa {bag} y la caja {box}',
      whichHeavier: 'Esta balanza está torcida. ¿Qué lado pesa más?',
      tiltHint: 'El lado que baja es el que pesa más.',
      tiltAria: 'Una balanza con {left} pesas a un lado y {right} al otro.',
      sideLeft: 'El de la izquierda',
      sideRight: 'El de la derecha',
      squareEquation: 'Un número por sí mismo da {n}. ¿Qué número es?',
      squareEqHint: 'Cuenta los cuadraditos de un solo lado del cuadrado.',
      squareEqAria: 'Un cuadrado de {n} cuadraditos, con {side} de lado.',
      howItGrows: '¿Cómo crece?',
      growthHint: 'Mira los saltos escritos encima. Si son todos iguales, crece siempre lo mismo.',
      growthAria: 'Una gráfica de {n} barras con el salto escrito entre cada dos.',
      pickStraight: '¿Cuál de las tres sube siempre lo mismo?',
      howMuchBag: '¿Cuánto pesa la bolsa?',
      howMuchEachBag: 'Las {bags} bolsas pesan lo mismo. ¿Cuánto pesa cada una?',
      simpleHint: 'Quita del lado derecho las pesas que ya hay en el izquierdo.',
      manyHint: 'Reparte las pesas entre las {bags} bolsas.',
      bothHint: 'Quita las mismas pesas de los dos lados. La bolsa se queda sola.',
      balanceAria: 'Una balanza con una bolsa y {left} pesas a un lado, y {right} pesas al otro.',
      manyAria: 'Una balanza con {bags} bolsas a un lado y {total} pesas al otro.',
      kilo: ' kg',
      substitute: 'Si la x vale {x}, ¿cuánto es {times}x?',
      substituteHint: '{times}x quiere decir {times} veces la x.',
      substituteAria: 'La expresión {times}x, con la x valiendo {x}.',
      writeIt: '¿Cómo se escribe «{times} veces la x»?',
      writeItHint: 'El número va delante de la letra, y no se pone signo entre los dos.',
      writeItAria: '{times} bolsas iguales.',
      upOrDown: 'Entre las {a} y las {b}, ¿qué hace {what}?',
      trendHint: 'Compara las dos barras señaladas.',
      graphAria: 'Una gráfica de barras con {what} hora a hora.',
      whenHighest: '¿A qué hora es más alta {what}?',
      highestHint: 'Busca la barra más alta y mira su hora.',
      readTiles: '¿Cómo se escribe este montón de piezas?',
      tilesHint: 'Cuenta cada clase de pieza por separado. La grande es x al cuadrado, la tira es x y la pequeña es 1.',
      squareSide: 'Con estas piezas se ha montado un cuadrado. ¿Cuánto mide su lado?',
      squareSideHint: 'Mira un lado entero: primero la pieza grande, que mide x, y después las pequeñas que siguen.',
      otherSide: 'Este rectángulo mide x de alto. ¿Cuánto mide de largo?',
      otherSideHint: 'Recorre el largo: la pieza grande mide x, y cada tira que sigue añade 1.',
      ariaSq: '{n} cuadrados grandes de lado x',
      ariaStr: '{n} tiras de largo x',
      ariaOne: '{n} cuadraditos de 1',
      ariaSide: 'x más {n}',
      ariaTwoX: 'dos veces x',
      ariaTimesX: '{n} veces x',
      hour: 'a las {h}'
    },
    transfer: 'Esto te servirá para entender una gráfica del periódico o del móvil, para darte cuenta de que una letra en una cuenta es solo un número que aún no te han dicho, y para ver que esas cuentas con letras son trozos que se pueden montar y separar.'
  }, 'es');
})();
