# Información técnica

> Documentación para desarrolladores que quieran entender, mantener o
> ampliar Calculia. El alcance de producto y las reglas de accesibilidad
> viven en [`SPEC.md`](SPEC.md); este documento es solo arquitectura.

---

## 1. Restricciones técnicas no negociables

- **HTML5 + CSS3 + JavaScript vanilla.** Sin frameworks, sin bundlers,
  sin paso de build, sin backend, sin dependencias npm. No hay
  `package.json` en el repo, así que Cloudflare Pages no ejecuta
  `npm install` durante el build y no hay nada que empaquetar.
- **Scripts clásicos**, no módulos ES (compatibilidad con `file://` y
  navegadores antiguos). Todo el código compartido se expone en
  `window.App.*`.
- **Sin CDNs de JS.** Las fuentes están autoalojadas en `assets/fonts/`.
- **Persistencia solo en `localStorage`.** Sin login, sin cookies, sin
  datos personales, sin analítica.
- **PWA offline-first**: `manifest.json` + `sw.js` (network-first con caché
  de respaldo para la app shell).
- **Estilo de código**: JS estilo ES5 (`var`, funciones clásicas, IIFE
  con `'use strict'`); identificadores, comentarios y mensajes de commit
  siempre en inglés. El texto de interfaz (`strings.es.js` /
  `strings.en.js`, contenido de actividades en `data.js`) se queda en el
  idioma que representa.

### 1.1 Alojamiento y despliegue — Cloudflare Pages

Desplegado en Cloudflare Pages vía el conector de Git, siguiendo el
mismo patrón que los proyectos hermanos Apptonomia, Sinonimia y
Teclatlon:

- **Sin paso de build.** La raíz del repo *es* la salida del build.
- **Sin `_redirects`, sin `wrangler.toml`, sin `functions/`.** Cloudflare
  Pages sirve cada archivo estático con búsqueda implícita de
  `index.html` por directorio, así que `/tools/<slug>/` resuelve a
  `tools/<slug>/index.html` automáticamente.
- **Las cabeceras de caché viven en `_headers`** en la raíz del repo.
  Los puntos de entrada HTML, `manifest.json` y `sw.js` se fuerzan a
  `must-revalidate`; los assets JS/CSS/fuentes con huella de versión
  reciben caché inmutable de 1 año.
- **`manifest.json` y `sw.js` deben usar rutas relativas** (empezar con
  `./`) para que la app funcione en cualquier host sin cambios.
- Un despliegue de previsualización puntual desde un worktree sucio, sin
  comprometer configuración de Wrangler:
  `npx wrangler pages deploy . --project-name calculia`.

### 1.2 Soporte multi-navegador

Verifica manualmente en Chromium, Firefox y WebKit (Safari), en
escritorio y móvil, antes de publicar un cambio en los archivos del
núcleo compartido (`assets/`) o en el `index.html`/`app.js`/`styles.css`
de una actividad. Registra el service worker desde cada punto de entrada
(`index.html`, `settings/`, `legal/`, cada
`tools/<slug>/index.html`) — mismo patrón que Apptonomia, evita el error
"no se puede abrir la página" de Safari cuando alguien llega directamente
a una subpágina.

---

## 2. Arquitectura

```
calculia/
├── index.html             # Nivel 0: Cantidades, Ordinales, Romanos, Formas y Escala
├── styles.css             #   CSS de la landing, junto a index.html
├── app.js                 #   lógica de la landing, junto a index.html
├── strings.<locale>.js    #   textos de la landing, es/en, junto a index.html
├── site/index.html        # Solo stub de compatibilidad: redirige a /
├── dev/index.html         # Catálogo oculto = las otras 25 actividades
├── assets/                # Nivel 1: NÚCLEO COMPARTIDO
│   ├── css/tokens.css     #   variables de diseño (colores, tipografía, táctil)
│   ├── css/base.css       #   reset, fuentes autoalojadas, foco visible
│   ├── css/components.css #   componentes reutilizables (.btn, .card, …)
│   ├── js/utils.js        #   window.App.utils
│   ├── js/i18n.js         #   window.App.i18n
│   ├── js/tts.js          #   window.App.tts
│   ├── js/storage.js      #   window.App.storage
│   ├── js/feedback.js     #   window.App.feedback
│   ├── js/dinero.js       #   window.App.dinero (usado por El Monedero)
│   ├── js/number-sort.js  #   window.App.numberSort (las actividades de ordenar)
│   ├── fonts/              #   woff2 autoalojadas (Atkinson Hyperlegible, Nunito)
│   └── img/icono.svg       #   icono de la app (también icono PWA)
├── tools/<slug>/          # Nivel 2: una carpeta por ACTIVIDAD (28 en total)
│   ├── index.html         #   estructura y carga de assets
│   ├── app.js             #   solo lógica
│   ├── data.js             #   solo datos
│   ├── strings.es.js      #   texto en español
│   ├── strings.en.js      #   texto en inglés
│   └── styles.css         #   estilos específicos únicamente
├── settings/              # Ruta oculta: ver/borrar localStorage (§4)
├── legal/                 # Página de protección de datos (enlazada en cada pie)
├── manifest.json          # PWA
├── sw.js                  # Service worker: lista de caché + VERSION
└── _headers                # Cabeceras de caché y seguridad de Cloudflare Pages
```

Misma arquitectura de tres niveles que Apptonomia, acotada a 30 actividades. `index.html` pública enlaza a las seis actividades de portada (Cantidades, Números ordinales, Números Romanos, Formas, Trigonometría, Escala); `dev/index.html`, oculta, enlaza a las restantes, Números entre ellas, más las que aparecen en `BOTH_SLUGS` (Cantidades, Números ordinales, Escala y Trigonometría, que son a la vez portada y siguen en el catálogo completo). Los números positivos y negativos forman parte de Números; no hay una herramienta independiente. La lista de slugs públicos vive en `scripts/check.js` (`PUBLIC_SLUGS` y `BOTH_SLUGS`), y el orden en `PUBLIC_SLUGS` es el orden visible en `index.html`.

### 2.1 `assets/` — núcleo compartido, conservado entero

Este núcleo se migró desde Apptonomia **sin recortar ninguna función**
(solo se renombró: prefijo de storage `apptonomia:` → `calculia:`,
`Apptonomia` → `Calculia` en comentarios/textos/`document.title`). A
diferencia del proyecto hermano de una sola actividad Teclatlon —que
pudo eliminar funciones sin usar con seguridad porque solo el código de
una actividad llamaba al núcleo—, Calculia tiene 14 actividades
distintas, y entre todas usan casi cada rincón de la API:

- `App.dinero` (`dinero.js`): usado por El Monedero para dibujar y
  razonar sobre monedas y billetes de euro.
- `App.i18n.data()` / `.datos()` / `.registerStructure()`: usado por
  varias actividades (p. ej. Los Números, Adivinanzas, El Monedero, El
  Reloj, Números Romanos, Patrones, Historias, ¿Qué no encaja?) cuyo
  `data.js` es neutral en idioma y recibe el texto fusionado desde
  `strings.<locale>.js`.
- `App.feedback.lockUntilAck()`: usado por actividades tipo quiz para
  bloquear las opciones restantes tras un fallo y ocultarlas mientras se
  muestra la pista; "Entendido" las vuelve a mostrar (una pausa de lectura,
  nunca un bloqueo de progreso).
- `App.feedback.hintText(plantilla, elegida)`: rellena el marcador
  `«{elegida}»` de una pista socrática con la respuesta que se acaba de
  probar, para que la pista diga por qué no encaja. Sin texto, usa
  «esta opción».
- En la repetición de refuerzo, al acertar se mantiene el mensaje positivo,
  pero se oculta la explicación con la respuesta para reducir la carga visual.
- `App.storage.estrellasTotales()` / `.listaToolIds()`: usado por
  `index.html` (estrellas totales) y `settings/` (lista de
  progreso, restablecimiento completo).

Antes de eliminar algo de `assets/js/`, busca con grep cada
`tools/<slug>/app.js` para encontrar quién lo llama — no asumas que una
función está muerta solo porque no la usa obviamente la actividad que
estás mirando.

### 2.2 Nivel 2 — Actividades (`tools/<slug>/`)

Cada actividad es autónoma e independiente (su propia clave de storage,
sin importar nada de otra carpeta `tools/`, funciona si abres su
`index.html` directamente) — mismo contrato que en Apptonomia. Consulta
el comentario de cabecera de `data.js` de cada actividad para su formato
de datos específico.

#### 2.2.1 Aleatoriedad de preguntas y opciones (contrato)

Por diseño, **toda actividad baraja el orden de las preguntas** dentro
de una ronda **y baraja las opciones de respuesta** de cada pregunta.
El barajado se hace con `App.utils.shuffle(...)` (Fisher–Yates en
`assets/js/utils.js`); nunca con `sort(() => Math.random() - 0.5)`,
que está sesgado y produce listas no uniformes.

La razón es que el orden fijo enseña la **posición** del botón, no el
contenido: el mismo niño que pasa una ronda entera en la que la
respuesta correcta siempre estaba abajo a la izquierda fallaría la
misma ronda si la lista apareciera barajada. Barajar a cada ronda
fuerza a leer el contenido y a comprobar antes de pulsar.

Excepciones documentadas (no se baraja porque el orden es intrínseco al
contenido, no una distracción):

- **Pares Sí/No** (por ejemplo `wallet` → "¿has pagado lo justo?"): el
  orden natural Sí/No es la convención y barajarlo confunde sin añadir
  ningún reto.
- **Líneas numéricas** (por ejemplo `wallet` → "aproximadamente,
  ¿cuánto cuesta?" con tres importes consecutivos): barajar una recta
  la convierte en una distracción sin pista visual, que es justo lo que
  la línea numérica intenta evitar.
- **Piezas de puzzle** (`puzzle`, `stories`): se barajan las piezas
  disponibles, pero la "pregunta" es la imagen completa y su orden de
  pintado es siempre de izquierda a derecha.

`temperature` queda fuera de este contrato porque su mecánica no es de
opción múltiple y la ronda no tiene orden que barajar (las parejas se
arman al abrir el termómetro).

#### 2.2.2 Implementación

Cada `tools/<slug>/app.js` aplica el contrato con uno de estos dos
patrones (ambos válidos):

- **Opciones**: `App.utils.shuffle([correcto].concat(distractores))`
  dentro del generador de la pregunta, o
  `App.utils.shuffle(p.options).forEach(...)` al pintar.
- **Preguntas**: `draw(key, list)` (un bolsa sin repetición dentro de
  la ronda, con refill al acabarse) cuando la actividad elige una forma
  concreta por pregunta; o `App.utils.shuffle(list).slice(0, N)` cuando
  la ronda toma N elementos de un pool mayor.

Un check en `scripts/check.js` (sección 5, "Estructura de la ronda")
comprueba que toda actividad con preguntas de opción múltiple baraja
las opciones y que toda actividad con un pool mayor que la ronda baraja
el orden. Las actividades mecánicas (`puzzle`, `stories`,
`odd-one-out`) y `temperature` están excluidas del check.

#### 2.2.2.1 Partir una actividad grande (`model.js`, `comma.js`)

Una actividad cuyo código crece se parte según lo que hace:

- `model.js` guarda el código que no toca la página: los generadores de
  preguntas, los dibujos como texto HTML, los números en palabras, las reglas
  de nivel. Se puede comprobar en Node. Publica sus nombres como
  `App.<nombre>Model`.
- `app.js` conserva la página: el DOM, el flujo y los eventos. Lee los nombres
  del modelo mediante alias al principio del fichero.
- Un ejercicio con estado y eventos propios va a su propio fichero, como una
  fábrica `App.<nombre>(host)`. La página le pasa lo que necesita (el progreso
  compartido, `save`, `paintStars`, las pantallas, el número de aciertos) en el
  objeto `host`, así el ejercicio no entra en el resto de la actividad. El
  ejercicio de la coma de Fracciones y medidas es el ejemplo.

`model.js`, `comma.js`, `screens.js`, `counter.js` y `art.js` son los únicos
ficheros extra que puede tener una actividad (`EXTRA_MODULES` en
`scripts/check.js`). Cada uno aparece en `sw.js` y lo carga `index.html` antes
de `app.js`. `art.js` guarda los dibujos (`shapes`): SVG como texto, publicado
como `App.shapesArt`, que `model.js` lee mediante alias.

#### 2.2.2.2 Estilos compartidos y la regla de deriva

`assets/css/components.css` es la única definición de un componente compartido
(`.option-btn`, `.feedback`, `.tool-header h1`, …). `assets/css/activity-flow.css`
añade solo lo que necesitan las pantallas del flujo, y sus reglas que tocan un
componente van con `:where(#activity)`: no suman especificidad y el orden en
cascada no cambia.

El `styles.css` de una actividad puede añadir propiedades que el componente no
fija, y puede colorear su acento con `color: var(--mod-…)` (su identidad). No
puede cambiar un valor que el componente ya fija: eso es deriva.
`node scripts/css-drift.js` lista cada override de ese tipo; las copias idénticas
se eliminan. Las copias de opción y de respuesta que el informe sigue marcando
(divisibility-test, head-math, math-tables, multiples, prime-composite) mantienen
el aspecto del flujo en páginas que no usan el motor: es una decisión por página
(migrarlas al motor o mantener la variante), no algo que el script cambie.

El carrusel de explicación (la tarjeta ← → de las diapositivas y de los ejemplos)
está definido una sola vez, en `components.css` (`.carousel-*`, `.intro-buttons`).
Su cableado es `App.utils.bindCarousel` y `App.utils.wrapIndex` en `utils.js`.
La comprobación 18 (`scripts/checks/design.js`) rechaza una copia de esas reglas
en el `styles.css` de una actividad. Ver [diseno.md](diseno.md) §3.3.

#### 2.2.3 Flujo de tres etapas (`assets/js/activity-flow.js`)

Las actividades con explicación en diapositivas, vida real y test
(`App.activityFlow`) no repiten el flujo: `app.js` aporta sus datos,
sus dibujos (`visualHtml`), la baraja de cada ronda (`buildRound`, que
sigue llamando a `App.utils.shuffle`) y el generador de preguntas
(`makeQuestion`). El motor monta las pantallas en `<div id="activity">`
y gestiona estrellas, progreso guardado y pantalla final. Los estilos
genéricos están en `assets/css/activity-flow.css` y los dibujos
compartidos de una familia en su propio fichero (p. ej.
`assets/css/common-factors.css`). Así un cambio de diseño del flujo se
hace en un único sitio. Todas las pruebas usan `test: 'options'`: una
pregunta cada vez, con pantalla final. El modo `test: 'sheet'` (toda la
ronda en una hoja, con «Comprobar» y «Otra ronda», sin pantalla final)
sigue en el motor por si una actividad futura lo necesita; hoy ninguna lo
usa.

En el modo `options`, `socratic: true` da la retroalimentación socrática
de `factorial` (primer fallo, pista; segundo, explicación; las demás
opciones se bloquean hasta «Entendido»), `review: 'rule'` pone «Repasar
la regla» bajo la pregunta, `introCard` añade una tarjeta sobre las
diapositivas y `endNotes` añade textos a la pantalla final.

Las cuatro actividades de orden (`order-*`) usan el modo `options` a través
de `App.numberSort.setup`, que delega en el motor: el nivel se muestra como
etiqueta (`levelName`), la frase de transferencia aparece en la pantalla
final (`transferKey`), y el nivel sube con las rondas hechas. `operation-concepts` cumple la regla de la pantalla
final: un único botón, «Volver al inicio»; «Otra ronda» vive dentro del test.

#### 2.2.3.1 Opciones del modo 'options': sin etapa de vida real, varios pasos

Dos opciones permiten usar el modo 'options' sin copiar su flujo:

- `skipReal: true` hace que las diapositivas de explicación lleven directamente
  al test. El botón bajo las diapositivas dice «Empezar a practicar», y la etapa
  de vida real no se muestra. Usan esta opción Múltiplos, Primo o compuesto y
  Divisibilidad.
- Una pregunta puede llevar `steps: [ {prompt, hint, options, explanation}, … ]`
  en lugar de su propio enunciado y sus opciones. Los pasos se responden uno a
  uno, bajo «Paso 1 de 3»; la pregunta puntúa una vez, en su último paso, y solo
  si no se falló ningún paso. Divisibilidad lo usa para las reglas (última cifra,
  y después la comprobación).

#### 2.2.4 Esqueletos de actividad: general, enseñar–vida real–test y juegos

Cada actividad se construye en dos capas. El **esqueleto general** es la parte
que comparten todas: la cáscara de la página, los datos y los textos, la ronda,
las estrellas y la pantalla final. Encima va una **familia de flujo**, que se
elige antes que nada:

- **A. Enseñar → vida real → test**: diapositivas de explicación, ejemplos de
  vida real y un test. Lo construye el motor compartido (`App.activityFlow`).
- **B. Juego**: rondas de elementos con retroalimentación inmediata y sin
  etapa de explicación (puzzles, selectores, secuencias, adivinanzas).
  Se comparte mediante `App.reinforce` y `App.activityGlue`; el bucle común es
  el objetivo que se describe más abajo.

Añadir una actividad consiste en elegir su familia y rellenar sus datos y su
mecánica. Las reglas de abajo son lo que el código ya hace; donde una familia
todavía no tiene motor compartido, la sección lo dice.

##### 2.2.4.1 Esqueleto general (toda actividad)

| Capa | Qué contiene | Quién la posee |
|---|---|---|
| Cáscara de página | `index.html`: cabecera (enlace de volver, título, estrellas), pie y orden de scripts. Las páginas del motor inyectan sus etapas en `<div id="activity">`. | Esqueleto; la actividad solo enumera sus scripts |
| Datos | `data.js`: números, disposiciones, especificaciones de diapositivas, `perRound`, tipos de pregunta; independiente del idioma | Actividad |
| Textos | `strings.es.js` y `strings.en.js` (`App.i18n.register`). Ningún texto en `app.js`. | Actividad; las claves deben coincidir en ambos idiomas |
| Lógica | `app.js`: generación de la ronda, creadores de preguntas, dibujos. Los ficheros grandes se parten en `model.js` (y módulos extra), ver 2.2.2.1 | Actividad |
| Progreso | `App.storage` bajo la clave de la actividad: `stars`, `completedRounds` y `roundsByActivity` para los menús | Esqueleto (ayudas en `App.activityGlue`) |
| Ronda | `buildRound` devuelve los tipos de pregunta de la ronda, barajados. `makeQuestion(tipo)` devuelve `{ prompt, hint, options, explanation }`, con opciones `[{ html, aria, correct }]` (contrato en 2.2.1) | Actividad |
| Retroalimentación | Acierto: una estrella y la explicación. Fallo: la pista, y la opción se apaga. Nunca se castiga. `App.feedback` para el tono y los bloqueos | Esqueleto |
| Pantalla final | Un único botón principal, «Volver al inicio», a la portada. El resumen usa `ui.roundDone` o `endSummaryKey`. | Esqueleto (regla de pantalla final en `CLAUDE.md`) |
| Ayudas compartidas | `App.utils` (`fill`, `rint`, `pick`, `shuffle`, `numericOptions`, …). Las copias locales están prohibidas para los nombres de `scripts/check.js` | Núcleo |

El contrato en todas las familias: sin temporizadores, sin vidas, sin
puntuación negativa, y cada error lleva a una pista y a otro intento.

##### 2.2.4.2 Familia A: enseñar → vida real → test (`App.activityFlow`)

El motor tiene tres etapas, cada una opcional en las formas que se indican:

1. **Explicación**: `intro` es una lista de diapositivas `{ visual }`. El título
   y el texto salen de `intro.<n>.title` e `intro.<n>.text` (o de `introCopy`).
   Las diapositivas dan la vuelta, y una barra de progreso muestra la posición.
2. **Vida real** (opcional): `real` es una lista de ejemplos `{ visual }`, con
   `realVisualHtml` o `visualHtml` y el texto de `realText` o `real.<n>`.
   Se omite con `skipReal: true`.
3. **Test**: una pregunta cada vez (`options`, el modo por defecto y el único
   que usan las actividades), una estrella por cada acierto, y una pantalla
   final. El modo `sheet` (`test: 'sheet'`: la ronda entera en una hoja, con
   «Comprobar» y «Otra ronda», sin pantalla final) sigue en el motor sin uso.

Las claves de configuración que lee el motor:

| Clave | Significado |
|---|---|
| `toolId` | Clave de almacenamiento, y el progreso de la actividad |
| `intro`, `real` | Diapositivas y ejemplos (`real: []` cuando no hay etapa de vida real) |
| `visualHtml(spec)` | HTML de un dibujo (diapositivas; los ejemplos también, salvo `realVisualHtml`) |
| `introCopy`, `introVisualAria`, `realText` | Textos y etiquetas que dependen de la diapositiva |
| `introHeading`, `introCard` | Línea sobre las diapositivas, y una tarjeta encima de ellas |
| `buildRound(def, level)`, `makeQuestion(tipo, índice, def)` | La ronda y sus preguntas |
| `test` | `'options'` (por defecto, una pregunta cada vez); `'sheet'` para el modo hoja, sin uso hoy |
| `levelName`, `transferKey` | Etiqueta del nivel en el test, y frase de la pantalla final (las actividades de orden) |
| `socratic` | Primer fallo: pista. Segundo fallo: explicación. Las demás opciones se bloquean hasta «Entendido» |
| `review` | `'back'` (por defecto), `'rule'` (repasar la regla bajo la pregunta) o `'none'` |
| `reinforce` | Las preguntas falladas se repiten en una mini-ronda hasta acertarlas todas (`App.reinforce`) |
| `activities`, `menuPlacement` | Un menú de actividades, primero (por defecto) o después de los ejemplos; cada actividad puede tener sus propias diapositivas y ejemplos |
| `skipReal` | Las diapositivas llevan directamente al test (botón «Empezar a practicar») |
| `reminder` | `{ title(), html(), next() }`: una tarjeta con la regla, leída otra vez entre los ejemplos de la vida real y el test. El botón de después inicia el test (`startTest` del modo) |
| `explanationVisual` (en una pregunta) | HTML que se pinta bajo el texto de la explicación (la retroalimentación socrática y la respuesta acertada). El texto sigue en `explanation`; esto es para un dibujo o una fórmula |
| `steps` (en una entrada del menú) | La entrada es una cadena: sus pasos se suceden, una ronda cada uno, sin volver al menú. La pantalla final ofrece «Siguiente paso →» hasta el último, y un aviso dice «Paso n de m». Cada paso es un objeto como una entrada del menú, con su propio `buildRound` y `makeQuestion` |
| `steps` (en una pregunta) | Una pregunta de varios pasos, respondidos uno a uno («Paso 1 de 3»); puntúa una vez, en su último paso, y solo si no se falló ningún paso |
| `testVisuals`, `testVisualClass` | Un dibujo en cada pregunta del test |
| `endSummaryKey`, `endNotes`, `endEmoji` | Texto del resumen, textos extra y emoji de la pantalla final |
| `prepareProgress`, `slideProgress`, `backHref`, `menuBackKey` | Conversión del progreso, barras de progreso, enlace de volver, etiqueta del menú |
| `typedAnswers`, `audio`, `introContinueKey` | Opciones del test: un número escrito en vez de opciones (`question.input = { answer }`), una pregunta leída en voz alta con un botón para oírla otra vez (`question.speak`), y la clave del botón tras las diapositivas cuando no hay ejemplos de la vida real (`skipReal`) |
| `test: 'gallery'` | Solo diapositivas, sin test: la última diapositiva lleva el botón que termina la actividad, y la pantalla final da una estrella por página. Un modo puede pintar más una diapositiva (`paintIntro`), y una actividad puede mandar las diapositivas a su propia pantalla al leerlas (`mode_state.afterIntro`, que lee el modo de opciones) |
| `extraMarkup`, `extraScreens`, `open(ctx)` de la entrada | Pantallas propias de una actividad: marcado añadido a la página, pantallas que el motor oculta y muestra, y una entrada del menú que inicia su propio flujo |

Qué variante de la familia A encaja con cada actividad:

- **Flujo completo con vida real**: `common-multiple`, `common-divisor`, `factorial`
  (socrático), `linear-functions`, `scale`, `operation-concepts`.
- **Una pregunta por diapositiva, con vida real**: `lines`, `primes`, `time-units` y `time-convert` (con vida real), `shapes` (varias hojas, con menú y niveles; cada una con sus diapositivas y ejemplos), `time-compare` y `time-durations` (dos diapositivas y dos ejemplos cada una), y `moments` (tres diapositivas, una por parte del día, y seis momentos de la vida diaria). `date-format` no tiene vida real (`skipReal`); su diapositiva de los meses es una rejilla de doce casillas, como en `time-units`.
- **Menú de actividades**: las cuatro `order-*` (mediante `App.numberSort`, que
  delega en el motor) y `operation-concepts`.
- **Opciones, con recordatorio**: `parity` (diapositivas de los números, vida real, la regla otra vez, luego una pregunta cada vez).
- **Opciones, con menú de pasos encadenados**: `ordinals` (tres grupos de pasos, con el recordatorio y las escenas de la vida real; las flechas del edificio son un listener delegado en la página) y `roman-numerals` (la misma forma, socrática, con la descomposición como explicación).
- **Opciones, con menú de niveles y pasos encadenados** (menú primero): `mental-math`. Tres entradas planas (anchors, restar, cabeza) cuyos niveles suben con las rondas y que no tienen diapositivas propias, así que empiezan al momento; y «Contar en grupos» en tres entradas (aprender y usar, cadenas de pasos; todos, una ronda), cada una con sus diapositivas. Una entrada del menú sin `intro` empieza su ronda al momento.
- **Opciones, con menú de tablas y pantalla de práctica**: `math-tables` (las diez tablas de una operación son las entradas del menú; cada una abre su propia pantalla de práctica con `open(ctx)`, donde la persona elige el canal, escrita o con audio, y el orden, en orden o al azar; antes del test se ven las diez operaciones una a una, contadas con puntos). La división pide un número escrito (`typedAnswers`); el canal con audio lee la operación (`audio`).
- **Galería** (`test: 'gallery'`): `los-numeros`, diez diapositivas y sin test: los tipos de número, cada uno con su dibujo y sus ejemplos de la vida real, y la última diapositiva termina la actividad.
- **Opciones, una ronda mixta tras las diapositivas**: `trigonometry` (dos diapositivas, una con las escaleras y otra con las rampas; tres ejemplos de la vida real; siete tipos de pregunta en una ronda, mezclados).
- **Opciones, con menú de actividades**: `fractions-measures` (fracciones y decimales, cada una con sus diapositivas, ejemplos y niveles; el juego de la coma es una tercera entrada que abre sus propias pantallas con `open(ctx)`).
- **Enseñar → test, sin vida real**: `multiples`, `prime-composite`,
  `divisibility-test` (esta última usa además `steps`).

Reglas prácticas: quitar la vida real cuando ningún ejemplo real añade un caso
nuevo; usar `steps` cuando una pregunta encadena comprobaciones y cada una hace
falta para la siguiente; si una actividad futura necesitara que la persona
compare u ordene todo a la vez, usar el modo `sheet`; hoy todas usan una
pregunta por diapositiva.

##### 2.2.4.2b Cinco actividades con motor propio

Fracciones y medidas, Tablas, Trigonometría, Cálculo mental y Los números
**no usan `App.activityFlow`**: cada una conserva el motor con el que se
construyó en `origin/main` y su propio conjunto de módulos. Su `index.html`
carga exactamente esos scripts, y sus textos y estilos son los de ese motor.

| Actividad | Motor | Módulos propios de la página |
|---|---|---|
| Fracciones y medidas (`fractions-measures`) | `App.classicQuiz` y `App.activityGlue` | `model.js`, `generators.js`, `helpers.js`, `intro.js`, `comma.js` |
| Tablas (`math-tables`) | Bucle propio de la página, con los dibujos en `App.MathTablesVisuals` | `visuals.js` |
| Trigonometría (`trigonometry`) | `App.classicQuiz` y `App.activityGlue` | `questions.js`, `figures.js` |
| Cálculo mental (`mental-math`) | `App.classicQuiz` y `App.activityGlue` | `model.js`, `groups.js` |
| Los números (`los-numeros`) | `App.activityGlue` | — |

La migración de estas cinco al flujo de tres etapas (`activity-flow`) se ha
descartado: no forma parte de `main`. Si una de ellas se migra en el futuro,
debe hacerse en un cambio aparte, con sus textos, estilos y esta tabla.

##### 2.2.4.3 Familia B: juego

Las actividades de esta familia dan una mecánica y una ronda, no primero una
explicación: `puzzle` (tocar una pieza y su sitio), `odd-one-out` (tocar el
intruso), `stories` (tocar los textos en orden de tiempo), `patterns` (completar
una serie), `riddles` (elegir la respuesta). El aprendizaje viene de la
retroalimentación tras cada intento, y un elemento fallado se repite en una
mini-ronda (`App.reinforce`).

Estado actual: cada una está escrita a mano en su propio `app.js`, con
`App.reinforce` y las ayudas de `App.activityGlue`. Todavía no hay un bucle
compartido, así que cada juego repite la ronda, la selección y el cierre.

Contrato objetivo (que se construirá como el modo «solo prueba» del motor:
menú → ronda, sin diapositivas):

- **Entrada**: un menú de mecánicas o niveles. El nivel sale del progreso
  (`levelOf`), como en la familia A.
- **Ronda**: `buildRound(def, level)` devuelve N elementos; la mecánica hace de
  cada elemento una sola acción (tocar, arrastrar, elegir).
- **Comprobación**: `check(elemento, acción)` devuelve `{ correct, hint, explanation }`.
  Acierto: una estrella y una frase breve de ánimo. Fallo: la pista y otro intento.
- **Refuerzo**: `reinforce: true` repite los fallos hasta acertarlos todos.
- **Cierre**: la pantalla final con un único botón, como en la familia A.
- **No permitido**: temporizadores, vidas, puntuación negativa, «fin del juego».

Una actividad necesita más que este contrato, y queda fuera hasta que el
motor tenga las piezas: `head-math` tiene niveles que elige la persona. Es un
flujo guiado por menú, no una ronda de elementos. (`math-tables` ya corre en el
modo de opciones, con la respuesta escrita y el audio del motor.)

##### 2.2.4.4 Elegir el esqueleto y añadir una actividad

1. ¿La actividad enseña una regla antes de preguntar? Sí: familia A. No: familia B.
2. ¿Un ejemplo de vida real añade un caso? Sí: mantener `real`. No: `skipReal: true`.
3. ¿Una pregunta encadena varias comprobaciones? Usar `steps`.
4. ¿La persona debe ver la ronda entera a la vez? Solo entonces, el modo `sheet`; hoy ninguna actividad lo usa.
5. Crear los seis ficheros canónicos en `tools/<slug>/`, más `model.js` cuando la
   lógica es grande (2.2.2.1). Registrar la tarjeta en `index.html`, su fila de
   progreso en `settings/` y sus ficheros en `sw.js` (`ARCHIVOS`), y subir
   `VERSION`.
6. Ejecutar `node scripts/check.js`, `node scripts/smoke-sw.js` y la prueba de
   interfaz, y refrescar los tokens `?v=` con `scripts/asset-tokens.js`.

Las familias y sus usuarios se anotan en la documentación en el momento de cada
cambio; compruébalos buscando `App.activityFlow.setup` y `App.reinforce` antes
de fiarte de una lista.

### 2.3 `settings/` — recortado respecto al de Apptonomia

Dos acciones, mismo patrón de confirmación en dos pasos que Apptonomia:

- **Restablecer datos de la persona**: solo elimina la preferencia de
  idioma. Ninguna de las 14 actividades de Calculia guarda un nombre u
  otro dato personal, así que aquí no hay lista `TOOLS_WITH_NAME`
  (el settings/app.js de Apptonomia sí tiene una, para Piano).
- **Restablecer toda la aplicación**: borra todas las claves `calculia:*`.

Se eliminó respecto al settings/ de Apptonomia: copia de seguridad
(exportar/importar), preferencias de tamaño de letra/sonidos, y el
formulario de datos personales "Mis Datos" — nada de eso aplica al
alcance de Calculia. Si una futura actividad necesita algo de esto,
migra la pieza correspondiente desde `apptonomia/settings/app.js` en vez
de reinventarla.

---

## 3. Internacionalización

Patrón multi-archivo, **diseñado para más de dos idiomas** desde el
primer commit (la arquitectura viene del i18n maduro de Apptonomia).
Hoy se distribuye en español (`es`, por defecto) e inglés (`en`); para
añadir un tercer locale se sigue la receta de
[`doc/es/i18n.md`](I18N.md) (y su espejo en inglés
[`doc/en/i18n.md`](../en/I18N.md)).

Resumen: `strings.<locale>.js` por actividad/landing registra cada
uno un idioma con `App.i18n.register(dict, '<locale>')`; ambos
archivos se cargan siempre y `App.i18n.locale()` decide cuál está
activo. `scripts/check.js` comprueba la paridad de claves entre todos
los archivos de locale para cada `tools/<slug>/`, además de la raíz del sitio,
`settings/` y `legal/`.

El núcleo está listo para multi-idioma desde el inicio — ver
`I18N.md` §4 para los tres puntos binarios `es`/`en` que hay que
generalizar al añadir un tercer idioma (mapa `BCP47` en `i18n.js`,
`DECIMAL_SEP` en `dinero.js` y el desplegable compartido
(`#locale-picker` + `locale-picker-config.js`) para ofrecer el idioma).

---

## 4. PWA y service worker

- `sw.js` es network-first con caché de respaldo para la app shell. Contrato al tocar archivos:
  1. Archivo nuevo → añádelo a la lista `ARCHIVOS`.
  2. Cualquier cambio a un archivo cacheado → sube `VERSION`
     (`calculia-vN`), o quienes tengan la PWA instalada no recibirán el cambio.
- **Sube `VERSION` en cada commit que toque un archivo cacheado.** No
  es solo "añadir una actividad": aplica a cualquier retoque de CSS,
  cualquier fix de cadena, cualquier refactor de JS en `tools/`,
  cada asignación de color de un símbolo. La caché es silenciosa:
  el desarrollador ve el código nuevo en un Ctrl+Shift+R, pero el
  usuario ve la versión vieja hasta que desregistre el SW a mano. El
  coste de subir el entero es trivial; el coste de no subirlo es
  "el usuario cree que el fix no llegó". Sube liberalmente, no de
  forma conservadora.
  El patrón de bug en la práctica: el desarrollador edita una clase
  CSS, espera ver el nuevo color en la app en ejecución, no lo ve,
  "arregla" el código otra vez, sigue sin verlo — y lo único que
  faltaba era el bump de `VERSION`. La solución es bumpear primero y
  verificar después.
- `manifest.json` actualmente incluye un único icono SVG (`sizes: "any"`).
  Conviene añadir un conjunto de iconos PNG 192×192 / 512×512 para la
  mejor experiencia de "Añadir a pantalla de inicio" en iOS, que no usa
  de forma fiable iconos SVG del manifest — no se generaron aquí por
  falta de un rasterizador en el entorno de autoría; sustitúyelos por
  artwork real cuando esté disponible.

---

## 5. Verificación

```bash
node scripts/check.js
```

No hace falta `npm install`. Para una pasada manual: abre
`index.html`, recorre varias actividades de cada bloque, en `es` y
en `en`, y revisa la tabla de progreso y las acciones de
restablecimiento de `settings/index.html`.

---

## 6. Despliegue

Cloudflare Pages, mismo patrón que Apptonomia, Sinonimia y Teclatlon: la
raíz del repositorio es la salida del build, sin bundler. Un push a
`master` dispara el build a través del conector de Git de Cloudflare;
los pull requests obtienen un canal de previsualización automático. Un
despliegue — incluso a un canal de previsualización — es una operación
de red: pide confirmación antes de ejecutarlo (ver `CLAUDE.md`
§"Agent workflow").

---

## 7. Licencia

MIT. Ver [`LICENSE`](../../LICENSE).

## 8. Patrón de la suite — cómo se construye cada app de Miralante

> 🌐 **Other language:** [English](../en/technical.md#8-suite-pattern-how-every-app-of-miralante-is-built)

Esta sección es la **guía canónica y transversal** de cómo se
construye y mantiene cada app de la [suite Miralante](https://apptonomia.uk).
Es la fuente de verdad que prevalece sobre el `technical.md`
(tecnico.md) de cualquier repo cuando entran en conflicto,
porque el objetivo es mantener las siete apps hermanas
(Apptonomia, Calculia, Memofun, Okeymoney, Sinonimia, Teclatlon,
Routime) consistentes: misma forma, mismas convenciones,
mismo deploy, mismo i18n, mismo comportamiento offline.

Un cambio en esta sección es un **cambio transversal a la
suite** y debe aplicarse a todos los repos. Un cambio en
otras secciones de este archivo es específico del proyecto y
se queda ahí.

> **Fuente de verdad de las reglas de producto** en este
> repo: [`SPEC.md`](SPEC.md).
> **Fuente de verdad del i18n**: [`I18N.md`](I18N.md).
> Esta sección **no** redefine esas; codifica el patrón que
> todas comparten.

### 8.0 El patrón en un párrafo

Cada app de la suite Miralante es una **PWA estática, sin
dependencias y offline-first**, construida a partir del mismo
esqueleto mínimo:

1. Un conjunto pequeño de **páginas HTML standalone** en la
   raíz del repo (una sola actividad) o bajo `tools/<slug>/`
   (hubs multi-actividad).
2. Cada página es una **URL real y navegable** — **no hay
   routing SPA**, ni cambio de vista en la misma página, ni
   `pushState`. Cada página se recarga al entrar; la
   navegación entre páginas es un clic normal en un `<a>`.
3. Las rutas ocultas (`about/`, `legal/`, `config/`)
   comparten la misma forma: `index.html` + `styles.css` + par
   `strings.<locale>.js`, con **interlinking en el pie** para
   que cualquiera de ellas esté a un clic de cualquier otra.
4. Un **service worker** (`sw.js`, network-first) cachea el
   shell (lista `FILES`, `VERSION` bumped) para que la app
   funcione offline.
5. **Sin paso de build**, sin `package.json`, sin frameworks,
   sin bundlers, sin CDNs de JS. La raíz del repo es el
   output de deploy.

### 8.1 La forma de las páginas standalone

Este es el patrón que siguen todas las rutas ocultas y todas
las rutas públicas. La forma es idéntica en la suite; solo
cambian los contenidos.

#### 8.1.1 El esqueleto de cinco carpetas

Cada app expone las mismas cinco carpetas:

```
<app>/
  index.html              # Entrada pública (la actividad)
  app.js                  # Lógica
  data.js                 # Layouts sin locale + contenido por locale
  strings.es.js           # Textos UI en español (fuente de verdad)
  strings.en.js           # Textos UI en inglés
  styles.css              # Estilos específicos de la app
  assets/
    css/{tokens,base,components}.css
    fonts/                # Atkinson Hyperlegible + Nunito autohospedados
    img/                  # Icono de la app + imágenes decorativas
    js/{utils,i18n,tts,storage,feedback}.js
  about/                  # Ruta oculta: presentación
    index.html
    styles.css
    strings.es.js
    strings.en.js
    index.html
    styles.css
    strings.es.js
    strings.en.js
  legal/                  # Página de protección de datos (enlazada desde el pie)
    index.html
    styles.css
    strings.es.js
    strings.en.js
  config/                 # Ajustes (solo en apps que lo necesitan)
    index.html
    app.js
    styles.css
    strings.es.js
    strings.en.js
  manifest.json
  sw.js
  _headers
  404.html
  robots.txt
  sitemap.xml
```

Las apps de una sola actividad (Teclatlon, Okeymoney) ponen el
`index.html` en la raíz del repo. Las apps multi-actividad
(Apptonomia, Calculia) ponen `tools/<slug>/index.html` por
actividad y un landing `index.html`; las cuatro carpetas
ocultas viven en la raíz del repo.

#### 8.1.2 La concha HTML de una página standalone

Cada página standalone abre con el mismo boilerplate. Abajo,
la **plantilla**; las desviaciones se indican donde apliquen.

```html
<!DOCTYPE html>
<html lang="es" data-i18n-title="pageTitle">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculia — Sobre este proyecto</title>
  <!-- Hidden route: not linked from the main menu and should not be
       indexed. Aimed at anyone who wants to know what Teclatlon is:
       families, professionals, journalists, funders, contributors. -->
  <meta name="robots" content="noindex, nofollow">
  <meta name="description" content="…">
  <meta name="theme-color" content="#FAF7F2">
  <link rel="stylesheet" href="../assets/css/tokens.css">
  <link rel="stylesheet" href="../assets/css/base.css">
  <link rel="stylesheet" href="../assets/css/components.css">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="../assets/css/locale-picker.css?v=calculia-v75403dc2">
</head>
<body>
  <div class="container {legal|about}">
    <header class="cabecera-{legal|about}">
      <!-- El idioma vive dentro del cajon del engranaje, como primera fila: el componente compartido lo mueve alli. En la cabecera solo queda el engranaje. No hay ningun boton de idioma en el HTML. -->
      <div class="suite-controls">
        <div id="locale-picker"></div>
      </div>
      <img src="../assets/img/icono.svg" alt="" width="80" height="80"
           class="logo-{legal|about}">
      <h1>…</h1>
      <p class="lema" data-i18n="tagline">…</p>
      <p class="entradilla" data-i18n="lead">…</p>
      <nav class="indice">…opcional, solo en páginas largas…</nav>
    </header>

    <main class="pila">
      <section class="card">…</section>
    </main>

    <footer class="pie-{legal|about}">
      <a class="btn btn-secundario" href="../"
         data-i18n="footerActivities">Ir a la aplicación</a>
      <a class="btn btn-secundario" href="../legal/"
         data-i18n="footerDataProtection">Protección de datos</a>
      <a class="btn btn-secundario" href="../about/"
         data-i18n="footerAbout">Sobre este proyecto</a>
      <a class="btn btn-secundario" href="../config/"
         data-i18n="footerSettings">Ajustes</a>
    </footer>
  </div>

  <script src="../assets/js/utils.js"></script>
  <script src="../assets/js/i18n.js"></script>
  <script src="strings.es.js"></script>
  <script src="strings.en.js"></script>
  <!-- El desplegable necesita su configuracion ANTES que el
       componente. Los dos van diferidos, y los diferidos se ejecutan
       en orden de documento, con listarlos en ese orden basta. El ?v=
       no es opcional: los .js y .css se sirven immutable un ano, sin el
       la pagina sirve la version vieja desde la cache. El valor NO se
       escribe a mano: lo calcula `node scripts/asset-tokens.js` a partir
       del hash del propio fichero, y `scripts/check.js` (check 16) falla
       si queda alguno desactualizado. -->
  <script src="../assets/js/locale-picker-config.js?v=calculia-v3be3c240"></script>
  <script src="../assets/js/locale-picker.js?v=calculia-v8b6a4103" defer></script>
  <script>
    /* Register the SW from this entry point so it is active for any
       later navigation, matching what the main index.html and the
       other standalone pages already do. */
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../sw.js').catch(function () {});
    }
  </script>
</body>
</html>
```

**Notas:**

- `data-i18n-title="pageTitle"` en `<html>` permite que
  `assets/js/i18n.js` rellene `document.title` durante
  `init()`. El `<title>` hardcoded es el fallback que la
  pestaña del navegador mostraría antes de que i18n.js se
  ejecute (y el fallback de la cache del SW).
- La clase propia de la página en el wrapper
  `<div class="container …">` es bajo la que `styles.css` de
  la página scopea sus reglas (`legal-page`, `about-page`,
  `team-page`). Sin prefijos ancestro `.sp-*` (eran residuo
  de la fusión SPA, retirado en 2026-09; ver `git log`).
- El pie es **siempre** los mismos cinco enlaces (en el mismo
  orden) en `about/` y `legal/`. `config/` tiene un
  pie reducido que solo vuelve a la SPA. La raíz de la app
  (`index.html`) **no** renderiza este pie (tiene su propio
  pie con el botón de reset y el enlace a protección de datos
  — ver §2 arriba).

#### 8.1.3 El par de strings

Cada carpeta standalone trae su propio par `strings.es.js` /
`strings.en.js`. Siguen el patrón **clave plana,
IIFE-register**; `scripts/check.js` extrae el diccionario vía
`vm.createContext` con un stub `App.i18n.register` y verifica
la paridad de claves entre locales.

```javascript
/* legal/strings.es.js — texto de la página (ES). */
(function () {
  'use strict';
  App.i18n.register({
    pageTitle: 'Protección de datos',
    pageDescription: 'Teclatlon: qué datos guarda, dónde y por qué. …',
    routeNotice: 'Esta página no se enlaza desde la aplicación. …',
    tagline: 'Sin registro. Sin cookies. Sin analítica.',
    lead: 'Teclatlon no pide tus datos personales. …',
    navResponsible: 'Quién trata tus datos',
    navData: 'Qué guardamos',
    /* …más claves… */
    footerActivities: 'Ir a la aplicación',
    footerAbout: 'Sobre este proyecto',
    footerSettings: 'Ajustes'
  }, 'es');
})();
```

Las claves son planas (sin namespacing tipo
`legal.pageTitle`); la página **es** el namespace, porque el
archivo vive en su propia carpeta. Las claves comunes
(`core.back`, `core.listen`, `core.dataProtection`) ya vienen
en `assets/js/i18n.js` y no se redefinen aquí.

#### 8.1.4 La hoja de estilos standalone

Cada carpeta standalone trae su propio `styles.css`. Es **el
antiguo `assets/css/subpages.css` dividido por página**, con
los prefijos ancestro `.sp-legal` / `.sp-about` eliminados
(eran residuo de la fusión SPA). La clase wrapper de la
página (`<div class="legal-page">`, `<div class="about-page">`,
etc.) es la que usa el CSS para scope:

```css
.legal-page { max-width: 880px; }
.legal-page .cabecera-legal { … }
.legal-page .indice a { … }
.legal-page section { … }
```

**No** introduzcas nombres de clase por página que colisionen
con los componentes compartidos (`base.css` ya define
`.cabecera`, `.lema`, `.indice`, `.btn`, `.card`, `.pila`, …).
Cuando la página standalone necesite un aspecto distinto,
scopea la regla bajo la clase de la página — nunca bajo un
`.cabecera` o `.indice` genérico.

### 8.2 El núcleo compartido

Cada app de la suite trae los mismos seis ficheros bajo
`assets/js/`, en el mismo orden de carga, con la misma forma
exportada. Adelgazar está permitido; **añadir** funcionalidad
de vuelta está prohibido a menos que sirva a una necesidad
concreta (las notas de adelgazamiento en §2.1 arriba son la
justificación canónica).

| Módulo | Superficie | Requerido por |
|---|---|---|
| `utils.js` | `App.utils.shuffle / $ / $$ / reducedMotion / wakeLock / bindEndBackToStart` | cada página |
| `i18n.js` | `App.i18n.{locale, setLocale, lang, register, t, pick, apply, SUPPORTED, DEFAULT_LOCALE, LABEL, FLAG}` | cada página |
| `tts.js` | `App.tts.speak` | solo páginas que leen en voz alta (la mayoría) |
| `storage.js` | `App.storage.{get, set, remove, progressWith}` | solo páginas que leen o escriben `localStorage` (`index.html`, `config/`) |
| `feedback.js` | `App.feedback.{success, encourage, celebrate}` | solo el `app.js` de la actividad |
| `activity-flow-gallery.js` | `App.activityFlow.modes.gallery` | el modo `test: 'gallery'` del flujo de tres etapas: solo diapositivas, la pantalla final y una estrella por página |
| `activity-glue.js` | `App.activityGlue(host)` → `{save, paintStars, levelFromProgress, endRound}` | actividades que llevan su propio bucle de ronda (no `App.activityFlow`) |
| `activity-flow-gallery.js` | `App.activityFlow.modes.gallery` | el modo `test: 'gallery'` del flujo de tres etapas: solo diapositivas, la pantalla final y una estrella por página |
| `answer-options.js` | `App.answerOptions.{dotRow, yesNo}` | las actividades que muestran una fila de puntos o un Sí / No barajado (divisibility-test, multiples, prime-composite) |
| `sheet-test.js` | `App.sheetTest.create({...})` → `{set, render, check}` | el modo hoja del flujo de actividad (`activity-flow-sheet.js`), que hoy no usa ninguna actividad |
| `classic-quiz.js` | `App.classicRound()`, `App.classicQuiz(host)` → `{answer, showHint, next}`, `App.activityMenu(host)` → `{paint}`, `App.classicPainter(host)` → `{startRound, paintQuestion, render}` | las actividades clásicas de una pregunta (algebra, calendar, charts, divisibility, fractions-measures, geometry, measures, operations, percent, problems): el objeto de estado de la ronda, la respuesta, la pista, el siguiente paso, el menú y el inicio y pintado de una pregunta compartidos (de momento geometry, operations y percent) |

El orden de carga es `utils.js → i18n.js → tts.js → storage.js →
feedback.js → strings.<locale>.js → data.js → app.js`. `i18n.js`
debe cargar **antes** que `tts.js` y `feedback.js`, que leen
el idioma activo.

Tanto `strings.es.js` como `strings.en.js` cargan siempre (no
están gateados por `locale`); `App.i18n.locale()` decide cuál
está activo. El locale se elige primero de
`localStorage['teclatlon:locale']`, luego de `navigator.language`
(fallback `'es'`).

### 8.3 El contrato de la PWA

El service worker es **network-first, cache-fallback**,
declarado en `sw.js` y commiteado junto a `manifest.json`. El
contrato:

```javascript
var VERSION = 'teclatlon-vN';
var FILES = [
  './index.html',
  './404.html',
  './manifest.json',
  './app.js',
  './data.js',
  './strings.es.js',
  './strings.en.js',
  './styles.css',
  /* una entrada por fichero del shell, incluyendo cada
     index.html / styles.css / par strings.<locale>.js de las
     páginas standalone */
  './legal/index.html',
  './legal/styles.css',
  './legal/strings.es.js',
  './legal/strings.en.js',
  /* …about/, config/ igual… */
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/css/components.css',
  './assets/fonts/…woff2',
  './assets/js/utils.js',
  './assets/js/i18n.js',
  './assets/js/tts.js',
  './assets/js/storage.js',
  './assets/js/feedback.js',
  './assets/img/icono.svg'
];
```

Dos reglas gobiernan cambios en `FILES`:

1. **Fichero nuevo → añadirlo a `FILES`.** El handler
   `install` mete cada fichero individualmente (nunca
   `cache.addAll`, que aborta en el primer fallo y rompe la
   cache para todos).
2. **Cualquier cambio en un fichero cacheado → bumpear
   `VERSION`** (`'teclatlon-vN'` → `'teclatlon-vN+1'`). Sin el
   bump, un usuario offline queda atascado en la versión
   vieja para siempre, porque el handler `activate` solo
   purga caches con un nombre distinto.

`scripts/check-version-bump.js` aplica (2): hace
`git show HEAD:sw.js` para ver qué `VERSION` había en el
último commit, lo compara contra el `VERSION` actual, y
verifica que `FILES` y el diff contra HEAD coincidan. Si no
coinciden, el script falla y el job `cache-bump` de CI
también falla.

Cada página standalone también ejecuta
`navigator.serviceWorker.register('../sw.js')` desde su
script inline, así una visita directa a `/legal/`,
`/about/` prima el SW para la raíz de la SPA del
mismo modo que hace `index.html`.

### 8.4 Invariantes de i18n

Estas son no negociables en toda la suite. Un cambio de
locale está incompleto hasta que **todos** los ficheros de
esta lista estén actualizados:

1. `assets/js/i18n.js#SUPPORTED` y `#DEFAULT_LOCALE`.
2. `assets/js/i18n.js#BCP47` (para selección de voz en
   `speechSynthesis`).
3. El detector pre-paint en `index.html` (el `<script>`
   inline que elige el locale antes del primer paint — ver
   §2.5 arriba).
4. `strings.<locale>.js` y cada par `strings.<locale>.js`
   por carpeta (`legal/`, `about/`, `config/`).
5. `data.js`: cada array dividido por locale
   (`DATA.lessons.<locale>`, `DATA.words.<locale>`,
   `DATA.templates.<locale>`, `DATA.numpadSteps.<locale>`).
6. `sw.js`: añadir los nuevos `strings.<locale>.js` a
   `FILES` y bumpear `VERSION`.
7. `scripts/check.js`: la verificación de paridad funciona
   en N locales sin cambios de código (los coge todos vía
   `fs.readdirSync`); confirmar que el script sigue pasando
   tras añadir el locale.

La receta paso a paso completa (con código de ejemplo) está
en [`I18N.md`](I18N.md).

### 8.5 Lo que está **prohibido** (en toda la suite)

Estos son antipatrones observados en algún momento y
retirados explícitamente; el historial de commits es la fuente
de verdad de cada retirada. La regla es: "si te ves tentado
de usar uno de estos, para y vuelve a leer esta sección".

- **Sin SPA / sin `pushState` / sin secciones `view-*`.**
  Cada página es su propia URL. No fusionar `legal/`,
  `about/` dentro de `index.html` como secciones
  ocultas, ni siquiera con un redirect shim. Se intentó en
  2026-09 (`spa: merge`) y se revirtió en la misma release;
  ver `git log` para las lecciones aprendidas. La
  navegación entre páginas debe ser siempre un clic real en
  un `<a>`, y cada ruta oculta debe estar a un clic de
  cualquier otra vía el pie compartido.
- **Sin `App.goLegal` / `App.goAbout` / `view-legal` /
  `view-about` / `sp-legal` / `sp-about` / `sp-idioma` /
  `subpages.css`.** Todos pertenecen al modelo de fusión
  SPA retirado.
- **Sin `_redirects` SPA catch-all.** Cloudflare lo
  rechaza como loop; documentado en `CLOUDFLARE.md` y en
  la receta de deploy.
- **Sin flash de `data-app-blocked="mobile"`.** El script
  pre-paint es un único `<script>` inline en `<head>`; no
  lo dividas en un `.js` aparte (CSP `script-src 'self'`
  lo permitiría, pero la garantía de timing síncrono solo
  se cumple con scripts inline en la cabeza).
- **Sin `package.json`, sin `node_modules`.** El repo es
  el output de build. Un package manifest forzaría a
  Cloudflare a ejecutar `npm install` en cada build,
  sobrepasando el límite de 25 MiB de assets.
- **Sin CDNs de JS.** Todas las fuentes, iconos y JS
  vienen en `assets/`.
- **Sin imports de ES modules** (`<script type="module">`).
  La app debe funcionar desde `file://` para uso offline;
  los ES modules rompen eso.
- **Sin base de datos en tiempo real, sin login, sin
  cookies, sin analítica.** La persistencia es solo
  `localStorage`.
- **Sin teclado en pantalla táctil** en apps que apuntan
  al teclado físico del ordenador (Teclatlon, importes
  tipeados de Okeymoney, palabras tipeadas de Sinonimia).
  El teclado en pantalla es solo decorativo.

### 8.6 Checklist de validación

Ejecutar esto en cada PR que toque cualquiera de los
ficheros de superficie (`*.html`, `*.js`, `*.css`, `sw.js`,
`manifest.json`, `data.js`):

```bash
node scripts/check.js           # debe reportar OK (N checks, sin fallos)
node scripts/check-version-bump.js   # debe pasar
```

Después abrir las páginas afectadas en un navegador en
`http://localhost:<puerto>/<ruta>` y recorrer el smoke
manual:

- `index.html` arranca en la pantalla de nombre o en el menú
  según el estado guardado; el roundtrip de `localStorage`
  funciona; el botón "🗑️ Borrar mi progreso" resetea tanto
  los datos como la UI.
- `/legal/` carga con el h1, lema y pie localizados; el
  selector de idioma cambia `lang`, `document.title` y cada
  texto `data-i18n` sin parpadeo de valores antiguos.
- `/about/` igual; sus enlaces del pie navegan
  entre ellos y a `/legal/` y `/config/` sin recargas
  antes de que el SW se prime.
- `/config/` lista el estado guardado y sus dos botones de
  reset funcionan (confirmación en dos pasos).
- Refrescar una vez tras la primera carga y verificar que
  `navigator.serviceWorker.controller` no es null.

Si algo falla, el cambio no encaja con el patrón de la suite
y debe revisarse antes de aterrizarlo.

### 8.7 Diferencias entre repos (lo que esta sección **no** cubre)

Cada app es una variante de una sola actividad del patrón de
arriba. Las diferencias por app — qué se comparte con la
suite, qué se adelgaza, y qué es intencionalmente distinto —
se documentan en el `tecnico.md` § "Other apps of the suite:
real differences" (la "diferencia específica del proyecto")
de cada repo. Usa esa sección para decidir si una
desviación en un repo es intencional antes de copiarla a
otro.

Esta sección canónica vive en el `tecnico.md` /
`technical.md` de **todos los repos** de la suite, mantenida
en sincronía. Si la cambias en un repo, espejéala en los
demás en el mismo PR.

### 8.8 Ver también

- §2 arriba — Recetas y contratos específicos de Teclatlon
  que se construyen sobre este patrón.
- [`I18N.md`](I18N.md) — Cómo añadir un idioma manteniendo
  las invariantes de i18n intactas.
- [`CLOUDFLARE.md`](../../CLOUDFLARE.md) — Contratos de
  deploy y SW/headers a nivel de Cloudflare Workers.
- [`SPEC.md`](SPEC.md) §"Mandatory rule" — Las invariantes
  de accesibilidad y "ninguna mención clínica" que cada
  página debe respetar.

---

## Cabecera compacta de la aplicación

La cabecera principal sigue el modelo de Memofun: icono de 44px (32px por
debajo de 650px), título Nunito de 28px (22px en móvil), atribución a la suite
y controles alineados. Usa un margen interior vertical de 8px y separa las
filas 6px. El texto secundario tiene peso normal y el contador de estrellas
es compacto. El desplegable de idioma, dentro del cajón del engranaje, muestra nombres completos en escritorio
y ES/EN en móvil, con nombres accesibles completos. Teclatlon conserva sus
controles de teclado y ajustes; Enroca conserva navegación y ajustes. Estos
estilos de cabecera no cambian los controles de las actividades.
