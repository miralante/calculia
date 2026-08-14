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
- **PWA offline-first**: `manifest.json` + `sw.js` (caché cache-first de
  la app shell).
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
(`index.html`, `site/`, `settings/`, `legal/`, cada
`tools/<slug>/index.html`) — mismo patrón que Apptonomia, evita el error
"no se puede abrir la página" de Safari cuando alguien llega directamente
a una subpágina.

---

## 2. Arquitectura

```
calculia/
├── index.html             # Nivel 0: redirige a site/index.html
├── site/index.html        # Nivel 0: landing = cuadrícula de actividades (2 bloques)
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
│   ├── fonts/              #   woff2 autoalojadas (Atkinson Hyperlegible, Nunito)
│   └── img/icono.svg       #   icono de la app (también icono PWA)
├── tools/<slug>/          # Nivel 2: una carpeta por ACTIVIDAD (14 en total)
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

Misma arquitectura de tres niveles que Apptonomia, acotada a 14
actividades agrupadas en dos bloques en vez de 7 módulos terapéuticos:
`site/index.html` tiene un bloque "🧮 Matemáticas" (Los Números,
Fracciones y Medidas, Restar y Cálculo Mental, Dinero, Las Tablas,
Cantidades, Números Romanos) y un bloque "🧩 Razonamiento y lógica"
(Adivinanzas, Patrones, El Monedero, El Reloj, Historias, ¿Qué no
encaja?, Puzzle).

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
  bloquear las opciones restantes tras un fallo (una pausa de lectura,
  nunca un bloqueo de progreso).
- `App.storage.estrellasTotales()` / `.listaToolIds()`: usado por
  `site/index.html` (estrellas totales) y `settings/` (lista de
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
[`doc/es/I18N.md`](I18N.md) (y su espejo en inglés
[`doc/en/I18N.md`](../en/I18N.md)).

Resumen: `strings.<locale>.js` por actividad/landing registra cada
uno un idioma con `App.i18n.register(dict, '<locale>')`; ambos
archivos se cargan siempre y `App.i18n.locale()` decide cuál está
activo. `scripts/check.js` comprueba la paridad de claves entre todos
los archivos de locale para cada `tools/<slug>/`, además de `site/`,
`settings/` y `legal/`.

El núcleo está listo para multi-idioma desde el inicio — ver
`I18N.md` §4 para los tres puntos binarios `es`/`en` que hay que
generalizar al añadir un tercer idioma (mapa `BCP47` en `i18n.js`,
`DECIMAL_SEP` en `dinero.js` y mapa `BOTONES_IDIOMA` en
`site/index.html`).

---

## 4. PWA y service worker

- `sw.js` es cache-first para la app shell. Contrato al tocar archivos:
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
`site/index.html`, recorre varias actividades de cada bloque, en `es` y
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
