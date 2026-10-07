# Diseño de producto y usuario/a tipo

> Las **pautas de diseño** de Calculia en un solo sitio: para quién
> diseñamos, dónde vive el sistema de diseño, qué reglas no se negocian y
> **cómo se comprueban**. Complementa a [`SPEC.md`](SPEC.md) (producto y
> accesibilidad) y [`tecnico.md`](tecnico.md) (arquitectura).
> Other language: [English](../en/design.md)

---

## 1. Para quién diseñamos: el usuario/a tipo

El usuario/a tipo de Calculia practica cálculo y razonamiento lógico
**de forma autónoma**. En la práctica son dos perfiles que comparten las
mismas necesidades de interfaz:

| Perfil | Qué trae | Qué necesita de la interfaz |
|---|---|---|
| **Persona que se beneficia de la lectura fácil** (lectura fácil, ritmo sin presión, pantallas predecibles) | Lee poco y despacio; la carga visual compite con la tarea | Una idea por pantalla, texto corto, sin ruido, sin sorpresas |
| **Estudiante de cualquier edad** que repasa | Lee rápido, pero a menudo con prisa o en móvil | Objetivos táctiles grandes, respuesta inmediata, sin bloqueo |

Las dos personas **usan la app sin nadie al lado**. Esa es la razón de
que casi todas las reglas del proyecto sean de *autonomía*: si hay que
explicar cómo funciona algo, el diseño está mal.

### 1.1 Las cinco necesidades que generan cada regla

1. **Ver sin esfuerzo qué se puede pulsar.** Por eso todo control es un
   `<button>` con ≥ 64×64 px, separado ≥ 16 px, y con una etiqueta de
   texto. Un control que solo se reconoce al pasar el ratón por encima
   —porque su fondo se transparenta— **no existe** para quien no busca.
2. **Saber dónde está.** Cabecera fija, vuelta atrás siempre arriba a la
   izquierda, y las pantallas en cadena siempre con un botón que nombra
   la *siguiente* acción concreta ("Mueve el termómetro →", no
   "Siguiente").
3. **No sentir que se falla.** El error da ánimo, nunca castigo: sin
   cronómetros, sin restar estrellas, con pistas antes de la respuesta.
4. **Entender sin que se lo expliquen.** Enseñar antes de preguntar:
   contexto → referencia → práctica.
5. **Poder usar el oído.** Botón 🔊 y `App.tts.speak()` **solo** en las
   actividades cuyo contenido lo necesita, no en todas.

### 1.2 Cómo se nombra a esta audiencia

Regla de la suite, fijada en [`CLAUDE.md`](../../CLAUDE.md) y en
[`SPEC.md`](SPEC.md) §4:

- **"Discapacidad intelectual"** es el término canónico y solo puede
  aparecer en **documentación interna** (este documento, `CLAUDE.md`,
  `SPEC.md`, `tecnico.md`, `roles.md`, `CONTRIBUTING.md`).
- **"Usuario/a tipo"** es el eufemismo aceptado en las **superficies
  públicas** (README, talks, redes, notas de prensa).
- **El producto —lo que lee quien usa la app— no lleva ninguna mención**,
  ni siquiera "usuario/a tipo". Ni `index.html`, ni `tools/<slug>/`, ni
  `strings.<locale>.js`, ni `legal/`. `scripts/check.js` lo verifica y
  falla si aparece un término prohibido en una página visible.

---

## 2. Los tres temas

El tema se elige con `data-theme` en `<html>`; el conmutador está en el ⚙️
de los ajustes. **Nunca escribas un color literal si ya existe un token**:
es lo que hace que los tres temas funcionen.

| Tema | `data-theme` | Fondo | Texto |
|---|---|---|---|
| Claro (por defecto) | *(sin atributo)* | `#FAF7F2` | `#1A1A2E` |
| Oscuro | `"dark"` | `#14161E` | `#F2F0EA` |
| Alto contraste | `"contrast"` | `#000000` | `#FFFFFF` |

`--texto-sobre-acento` es el token que **se invierte** según el tema
(blanco en claro, oscuro en oscuro y contraste) porque los acentos se
aclaran. Un botón primario cuyo color no venga de `--mod-*` rompe eso.

---

## 3. Dónde vive el sistema de diseño

```
assets/css/tokens.css       ← la única fuente de color, tamaño y espaciado
assets/css/base.css         ← reset, tipografía, foco visible
assets/css/components.css   ← .btn, .card, .option-btn, .tool-header, utilidades
tools/<slug>/styles.css     ← SOLO lo que esa actividad añade
```

**Regla de reparto:** un componente que usan muchas actividades vive en
`components.css`, no en la hoja de la primera actividad que lo inventó.
Si dos actividades declaran las mismas reglas, se suben al compartido
( [`components.css`](../../assets/css/components.css) tiene el caso de
`.menu-grid` / `.btn-actividad`: lo construyen 18 actividades con
`paintMenu()`, pero las reglas solo existían en las hojas de 6; las
mismas reglas, verbatim, están ahora en el compartido).

### 3.1 Los tokens que importan

| Token | Valor claro | Para qué |
|---|---|---|
| `--boton-min` | `64px` | lado mínimo de cualquier control |
| `--espacio` | `16px` | separación mínima entre controles |
| `--espacio-grande` | `24px` | separación de bloques |
| `--radio` | `16px` | radio de esquinas |
| `--color-borde` | `#D8D2C8` | borde de tarjeta y botón secundario |
| `--color-texto-suave` | `#4A4A68` | texto secundario |
| `--color-acierto` | `#2E7D32` | acierto |
| `--color-animo` | `#C05621` | ánimos — **nunca un rojo agresivo** |
| `--texto-sobre-acento` | `#FFFFFF` | texto encima de un acento sólido |

### 3.2 El acento de cada actividad: la tabla que hay que respetar

Cada actividad tiene **un** color de acento, tomado de la sección a la que
pertenece. La tabla se lee del catálogo, no del gusto:

| Sección | Acento | Actividades |
|---|---|---|
| **Matemáticas** (`#mod-mates`) | `--mod-razonamiento` (verde azulado) | numbers (incluye positivos y negativos), roman-numerals, shapes, places, geometry, divisibility, operations, quantities, mental-math, percent, money, math-tables, measures, similar, fractions-measures, problems, temperature |
| **Razonamiento y lógica** (`#mod-logica`) | `--mod-memoria` (naranja) | riddles, patterns, wallet, algebra, charts, calendar, clock, stories, odd-one-out, puzzle |

⚠️ **`--mod-mates` no es un token.** Es el `id` de la `<section>` de
Matemáticas en el catálogo. Apuntar a él desde CSS no da error: da
*silencio*. Ver §6.

Para teñir el botón primario de una actividad, el patrón es exactamente
este (copiado de `roman-numerals` y `shapes`):

```css
.tool-header h1 { color: var(--mod-razonamiento); }
.btn:not(.btn-secondary):not(.btn-audio) { background: var(--mod-razonamiento); }
```

El `:not(...)` está para no repintar los botones que ya son secundarios o
de audio.

---

## 4. Las pautas de diseño, en lista

Estas son las que se comprueban. La fuente normativa es
[`SPEC.md`](SPEC.md) §3.5 y §6.

1. **Un acento por actividad**, el de su sección (§3.2).
2. **Todo control pulsable es un `<button type="button">`** con etiqueta
   de texto. Nada de `<div>` ni `<span>` con `cursor: pointer`.
3. **El botón dice lo que hace.** Cada botón de transición nombra la
   acción siguiente de forma concreta — "Ver en la vida real →", no
   "Siguiente" — y la pantalla a la que lleva cumple lo que promete. Las
   dos actividades de portada encadenan igual: teoría → **vida real** →
   práctica.
4. **≥ 64×64 px** de objetivo táctil y **≥ 16 px** de separación.
5. **Contraste AA mínimo (4.5:1), AAA cuando se pueda (7:1)** entre el
   texto y lo que tiene detrás — y si el botón tiene fondo transparente,
   el contraste se mide contra **lo que hay detrás**, no contra el papel.
6. **El color nunca es el único código.** Toda señal (acierto, cero,
   positivo/negativo) se refuerza con forma, icono o texto.
7. **Foco visible** en todo lo enfocable (`--color-foco`).
8. **El error no castiga** y **no hay presión temporal**.
9. **`prefers-reduced-motion`** respetado.
10. **Máximo 4–6 opciones** por pantalla.
11. **Nadie lee código**: el texto de la interfaz vive en
    `strings.<locale>.js`, nunca en el HTML ni en `app.js`.

---

## 5. Cómo se comprueban (no leyendo el código)

**Un estilo que no se abre en el navegador no está comprobado.**
`node scripts/check.js` valida sintaxis, estructura, paridad `es`/`en` y
catálogo — pero **no mira el aspecto**. Un botón puede pasar todas sus
comprobaciones y ser invisible.

Hay tres formas, de más rápida a más completa:

### 5.1 Mirar

Abrir `tools/<slug>/index.html` y recorrer las pantallas. Es el control
de oro: el fallo de §6 se ve en dos segundos.

### 5.2 Medir el estilo computado

```bash
node scripts/one-off/probe-acento-actividad.js
```

Compara el `background` y el `color` **calculados** del botón principal de
cada actividad y devuelve el ratio de contraste. Es el que detecta un
acento que no se aplica.

### 5.3 Auditar toda la actividad

```bash
npm run test:ui -- /tools/numbers/
```

El recorrido comprueba la explicación, los ejemplos cotidianos, el
termómetro y el ascensor en español e inglés. También verifica que las
pantallas que se han añadido caben a 320, 375, 768 y 1280 píxeles.

**Mídelo a 375×667**, no en escritorio: en pantallas altas
`@media (min-height: 720px)` compacta `.btn` a 40 px a propósito
(`components.css`), y ese compacto **tapa** un `min-height`
hardcodeado que incumple.

Playwright es global en esta máquina; si no lo tienes, `CLAUDE.md` §
"Shared Playwright installation" explica el montaje.

---

## 6. Caso anterior a la integración: el botón invisible de *Positivos y negativos*

Este apartado conserva el diagnóstico de la antigua herramienta
independiente. El contenido ahora forma parte de Números.

**El síntoma.** En la antigua `tools/posneg/` los botones no se veían. En lugar de un
botón aparecía **una mano**: el cursor `pointer` sobre un hueco. Nadie
diría "no hay botón" si no fuera porque el resto de la app sí los tiene
— `roman-numerals` y `shapes`, las dos de la portada, los muestran
bien.

**La causa.** La antigua hoja `tools/posneg/styles.css` teñía sus botones con
`var(--mod-mates)`, que **no existe**. `--mod-mates` es el `id` de una
`<section>` del catálogo, no un token; el nombre venía de Apptonomia,
de donde se copió la hoja.

Un `var()` que no resuelve **no da error**: el navegador marca la
declaración como inválida en tiempo de cómputo y la propaga a su valor
inicial. Para `background` eso es **transparente**. Pero `.btn` en
`components.css` pone su color de etiqueta en `--texto-sobre-acento`
(blanco), que **sigue aplicando**. Resultado:

```
fondo:   transparent   ← el var() no existía
texto:   #FFFFFF       ← el token sí existía
detrás:  #FAF7F2       ← crema de la página
contraste: 1.07 : 1
```

Texto blanco sobre crema: **invisible**. Lo único que quedaba era el
`cursor: pointer` — la mano. Lo mismo pasaba en el `<h1>`, que se quedaba
navy en vez de teal, y en el título de la teoría, la línea de números y
los marcos punteados.

**Por qué nadie lo vio antes:**

- `check.js` pasó **todas** sus comprobaciones (variascientas; la cifra
  cambia con el catálogo). Valida sintaxis y estructura, no el aspecto.
- El HTML era correcto: eran `<button>` de verdad, con `type`, con
  etiqueta y con su manejador. El fallo estaba **solo** en una hoja de
  estilos.
- El smoke de UI tampoco lo cazaba: comprueba que el botón exista y sea
  clicable, y lo era — solo que no se veía.

**Cómo se detecta en 10 segundos:** abrir la página y mirar. Después,
`probe-acento-actividad.js` lo convierte en un número (`1.07`) que se
puede comparar entre actividades.

**La lección, en una frase:** *un token que no existe no rompe el build,
rompe la pantalla.* Y el patrón de fallo —**acento invisible, etiqueta
que sí se aplica**— solo puede existir si el color de la etiqueta y el
del fondo vienen de fuentes distintas, que es justo lo que hace
`.btn`. Si el fondo de un botón depende de un token que no has
verificado, mídelo.

### 6.1 El hermano del mismo error: un color fijo que ignora el tema

Arreglado el botón, la misma actividad escondía el error opuesto: las
tarjetas de **positivo** y **negativo** llevaban el fondo escrito a
mano (`#FFFBEB`, `#E3F2FD`). Un color escrito a mano **no cambia con el
tema**, así que al cambiar a oscuro o a alto contraste la tarjeta se
quedaba crema mientras el texto de dentro tomaba el color del tema.
Medido en la pantalla del termómetro:

| Tema | `.temp-goal` / `.temp-sign` | Contraste |
|---|---|---|
| Claro | sobre crema | 2.03 : 1 |
| Oscuro | `#B3B0C8` sobre crema | 2.03 : 1 |
| Alto contraste | `#FFFFFF` sobre crema | **1.04 : 1** |

O sea: el mismo texto invisible, en el mismo sitio, y en dos de los tres
temas. **Ocho fallos** de una tacada.

La arreglo con tokens propios de la actividad (`--pn-pos-*`,
`--pn-neg-*`) definidos **una vez por tema**. Lo importante no es el
nombre del token sino la regla: *si el fondo cambia con el tema, el texto
que va dentro tiene que ser un token también*. Al hacer el fondo
sensible al tema, las etiquetas pudieron volver a
`--color-texto` / `--color-texto-suave` y quedaron correctas en los tres
temas sin tocar nada más.

Comprobación:

```bash
node scripts/one-off/probe-temas-contraste.js
```

Recorre las pantallas en los tres temas y lista cada texto por debajo
del mínimo de WCAG (4.5:1, o 3:1 si es texto grande). Es la forma de
cazar esta familia de fallos, porque en una actividad que **sí** usa
tokens el resultado sale limpio sin tocar nada.

---

## 7. De aquí en adelante

- Cualquier actividad nueva arranca de `components.css` y de las dos
  referencias de portada (`roman-numerals`, `shapes`), no de una hoja
  antigua de otro proyecto.
- Un `styles.css` de actividad que **varias** actividades necesitan es una
  señal de que el componente va a `components.css`.
- Si una regla depende de un token, que el token exista: una búsqueda de
  `--mod-` en `assets/css/tokens.css` lo confirma en un segundo.
- Cuando toques algo de la interfaz, la comprobación es
  `check.js` **más** una mirada a la pantalla. Las dos.

---

## Referencias

| Documento | Qué aporta |
|---|---|
| [`SPEC.md`](SPEC.md) | Definición de producto, restricciones no negociables y reglas de accesibilidad (§3.5, §6) |
| [`tecnico.md`](tecnico.md) | Arquitectura, core compartido y anatomía de una actividad |
| [`guia-crear-elementos.md`](guia-crear-elementos.md) | Receta para crear una actividad nueva |
| [`actividades.md`](actividades.md) | Catálogo de las 30 actividades |
| [`roles.md`](roles.md) | Quién decide qué |
| [`../../CLAUDE.md`](../../CLAUDE.md) | Normas de la suite, incluida la regla de "usuario/a tipo" |