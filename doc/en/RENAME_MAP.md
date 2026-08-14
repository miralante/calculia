# Spanish → English rename mapping

This document is the single source of truth for the technical-code → English
rename pass mandated by `CLAUDE.md` ("technical code always English").
Every Spanish identifier found in the codebase (excluding `strings.<locale>.js`
UI text, which is allowed to be Spanish) is listed here with its proposed
English replacement.

## How to read this

- **ES**: the Spanish token as it appears in the source.
- **EN**: the proposed English replacement (used as both variable name and
  identifier everywhere it appears).
- **Notes**: edge cases (false positives, public-API breakage, ambiguous
  meaning).

This list was generated from `tools/`, `assets/`, `site/`, `settings/`,
`legal/`, `scripts/`, and `sw.js`. `tools/roman-numerals/` is intentionally
**excluded** from this pass — there is already an in-flight rename there,
and the user will handle it separately.

## Word-level mapping

| ES | EN | Notes |
|---|---|---|
| `datos` | `data` | Public: `App.i18n.datos()` → `App.i18n.dataByLocale()`. Currently zero callers in the codebase (confirmed via grep), so the rename is safe. |
| `idioma`, `idiomas` | `language`, `languages` | |
| `clave` (var/parameter) | `key` | Excludes `localStorage.key(i)` (built-in method). |
| `valor` | `value` | |
| `prefijo` | `prefix` | |
| `texto` (var/param) | `text` | Excludes string literals and CSS values. |
| `buscar` (function) | `lookup` | |
| `tituloClave` | `titleKey` | |
| `pendientes` | `pending` | |
| `boton`, `botones` | `button`, `buttons` | Variable/parameter only; not CSS class names (those have their own row). |
| `moneda`, `monedas` | `coin`, `coins` | Excludes the `App.dinero.moneda*` i18n **key string** (those are translation keys, not identifiers). |
| `alAzar` (function name) | `pickRandom` | |
| `alConfirmar` (param) | `onConfirm` | |
| `iniciar`, `inicio` | `init` | Excludes DOM event handlers `'inicio'` (rare, would be renamed to `'init'` only if it's a real event name). |
| `empezar` | `start` | |
| `comenzar` | `start` | |
| `terminar` | `end` | Excludes i18n key strings. |
| `finalizar` | `finish` | |
| `cargar` | `load` | |
| `guardar` | `save` | |
| `mostrar` | `show` | |
| `ocultar` | `hide` | |
| `limpiar` | `clear` | |
| `borrar` | `delete` / `clear` | "delete" when removing data, "clear" when clearing UI. Per-call decision. |
| `mezclar` | `shuffle` | |
| `ordenar` | `sort` / `order` | "sort" for array ops, "order" for sequencing. Per-call decision. |
| `comparar` | `compare` | |
| `resultado`, `resultados` | `result`, `results` | |
| `valor`, `valores` | `value`, `values` | |
| `ejercicio`, `ejercicios` | `exercise`, `exercises` | |
| `nivel`, `niveles` | `level`, `levels` | |
| `juego`, `juegos` | `game`, `games` | |
| `usuario`, `usuarios` | `user`, `users` | |
| `configuracion` | `config` | |
| `opciones`, `opcion` | `options`, `option` | |
| `seleccion` | `selection` | |
| `entrada` | `input` | Excludes DOM `entrada` ids that are read by JS (those are renamed together with their consumers). |
| `salida` | `output` | |
| `imagen`, `imagenes` | `image`, `images` | Excludes the i18n key `imagen` used as a translation key. |
| `pantalla`, `pantallas` | `screen`, `screens` | |
| `enlace`, `enlaces` | `link`, `links` | |
| `menu`, `menus` | `menu`, `menus` | **No rename.** English-borrowed; identical meaning. |
| `seccion`, `secciones` | `section`, `sections` | |
| `elemento`, `elementos` | `element`, `elements` | |
| `ajustes` | `settings` | |
| `preferencias` | `preferences` | |
| `ayuda` | `help` | |
| `informacion` | `info` / `information` | "info" for variable names, "information" for labels. Per-call decision. |
| `acerca` | `about` | |
| `actualizar` | `update` | |
| `descargar` | `download` | |
| `subir` | `up` / `raise` | "up" for direction, "raise" for math/UI. Per-call decision. |
| `bajar` | `down` / `lower` | |
| `izquierda` | `left` | |
| `derecha` | `right` | |
| `arriba` | `up` | |
| `abajo` | `down` | |
| `centro` | `center` | |
| `frente` | `front` | |
| `fondo` | `background` | **As identifier only** (CSS var, CSS property). CSS classes `.fondo*` would be `.bg*`. |
| `color`, `colores` | `color`, `colors` | **No rename.** English word. |
| `tamano`, `tamanoFuente` | `size`, `fontSize` | |
| `fuente` | `font` / `source` | "font" for typography, "source" for data origin. Per-call decision. |
| `sonido`, `sonidos` | `sound`, `sounds` | |
| `musica` | `music` | |
| `volumen` | `volume` | |
| `silencio` | `mute` / `silence` | |
| `pista`, `pistas` | `hint`, `hints` | Excludes the i18n key `pista` (translation key). |
| `punto`, `puntos` | `dot`, `points` / `score` | "dot" for graphics, "points"/"score" for game scores. Per-call decision. |
| `intento`, `intentos` | `attempt`, `attempts` | |
| `intentar` | `try` / `attempt` | |
| `repetir` | `repeat` | |
| `repeticiones` | `repetitions` | |
| `reiniciar` | `restart` | |
| `reintentar` | `retry` | |
| `continuar` | `continue` | |
| `pausa` | `pause` | |
| `parada` | `stop` | |
| `detener` | `stop` | |
| `reanudar` | `resume` | |
| `completar` | `complete` | |
| `completado` | `completed` | |
| `fallo`, `fallos` | `failure`, `failures` | |
| `fallar` | `fail` | |
| `fracaso` | `failure` | |
| `mejora`, `mejoras` | `improvement`, `improvements` | |
| `historial` | `history` | |
| `progreso` | `progress` | |
| `puntuacion` | `score` | |
| `maximo` | `max` | |
| `minimo` | `min` | |
| `medio` | `middle` / `medium` / `average` | Per-call decision. |
| `suma`, `sumar` | `sum`, `add` | "sum" for noun, "add" for verb. |
| `resta`, `restar` | `subtract`, `subtraction` | |
| `multiplicar`, `multiplicacion` | `multiply`, `multiplication` | |
| `dividir`, `division` | `divide`, `division` | |
| `producto` | `product` | |
| `cociente` | `quotient` | |
| `residuo` | `remainder` | |
| `modulo` | `mod` / `module` | "mod" for math, "module" for code organization. Per-call decision. |
| `primo` | `prime` | |
| `compuesto` | `composite` | |
| `entero` | `integer` | |
| `decimal` | `decimal` | **No rename.** English word. |
| `fraccionario` | `fractional` | |
| `porcentaje` | `percentage` | |
| `unidad`, `unidades` | `unit`, `units` | |
| `decena`, `decenas` | `ten`, `tens` | |
| `centena`, `centenas` | `hundred`, `hundreds` | |
| `millar`, `millares` | `thousand`, `thousands` | |
| `millon`, `millones` | `million`, `millions` | |
| `mil` | `thousand` | |
| `miles` | `thousands` | |
| `hora`, `horas` | `hour`, `hours` | |
| `minuto`, `minutos` | `minute`, `minutes` | |
| `segundo`, `segundos` | `second`, `seconds` | |
| `dia`, `dias` | `day`, `days` | |
| `semana`, `semanas` | `week`, `weeks` | |
| `mes`, `meses` | `month`, `months` | |
| `ano`, `anos` | `year`, `years` | |
| `siglo`, `siglos` | `century`, `centuries` | |
| `tabla`, `tablas` | `table`, `tables` | |
| `exito` | `success` | |
| `numero`, `numeros` | `number`, `numbers` | |
| `numeral`, `numerales` | `numeral`, `numerals` | |
| `fraccion`, `fracciones` | `fraction`, `fractions` | |
| `cantidad` | `quantity` / `amount` | "quantity" for count, "amount" for money. Per-call decision. |
| `cantidades` | `quantities` | |
| `respuesta`, `respuestas` | `answer`, `answers` | |
| `pregunta`, `preguntas` | `question`, `questions` | |
| `acierto`, `aciertos` | `success`, `successes` / `correct`, `corrects` | "success" for outcome, "correct" for boolean. Per-call decision. |
| `moneda` (i18n key) | (left as-is) | It's a translation key, not an identifier. |
| `numeral` (i18n key) | (left as-is) | Same. |
| `romano`, `romanos` | `roman`, `romans` | |
| `ayuda` | `help` | |

## Things explicitly NOT renamed

- **CSS class names**: handled in a separate CSS-only pass (per your second answer). Current pass only renames HTML `id`, `data-*`, and JS variables/parameters.
- **String literals in `strings.<locale>.js`**: these are UI text, not code.
- **DOM ids in HTML that are read by JS**: renamed atomically together with the JS that reads them. Each `id="..."` is paired with its `getElementById`/`querySelector` consumer.
- **Comments**: not renamed in this pass. Comments are documentation; bilingual comments already exist. Future pass.
- **i18n key strings** (the *values* used as keys for `App.i18n.t(...)`): renamed only when the key itself is a Spanish word AND the consumer side is also renamed atomically.

## Commit plan (one commit per logical area)

1. `i18n.js` + `dinero.js` + `feedback.js` + `storage.js` + `tts.js` + `utils.js` (shared core).
2. `assets/css/` (CSS variables and class names) — separate commit.
3. `site/`, `settings/`, `legal/`, `scripts/check.js`, `sw.js`.
4. Per activity (13 separate commits, alphabetical):
   - `tools/clock/`
   - `tools/fractions-measures/`
   - `tools/math-tables/`
   - `tools/mental-math/`
   - `tools/money/`
   - `tools/numbers/`
   - `tools/odd-one-out/`
   - `tools/patterns/`
   - `tools/puzzle/`
   - `tools/quantities/`
   - `tools/riddles/`
   - `tools/stories/`
   - `tools/wallet/`
   (`tools/roman-numerals/` excluded — in-flight.)

## Validation per commit

- `node scripts/check.js` (CI check; validates syntax, structure, key parity).
- Manual smoke test of the touched area in a browser (the user runs this, since
  I cannot open localhost in a browser from this environment).
