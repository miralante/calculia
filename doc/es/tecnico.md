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
3. Las rutas ocultas (`about/`, `team/`, `legal/`, `config/`)
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
  team/                   # Ruta oculta: quiénes la hacen
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
actividad y un landing `site/index.html`; las cuatro carpetas
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
</head>
<body>
  <div class="container {legal|about}">
    <header class="cabecera-{legal|about}">
      <div class="idioma-selector" role="group" aria-label="Elegir idioma">
        <button type="button" class="btn-idioma" id="btnIdiomaEs"
                data-locale="es" aria-pressed="false">🇪🇸 Español</button>
        <button type="button" class="btn-idioma" id="btnIdiomaEn"
                data-locale="en" aria-pressed="false">🇬🇧 English</button>
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
      <a class="btn btn-secundario" href="../team/"
         data-i18n="footerTeamGuide">Quiénes la hacen</a>
      <a class="btn btn-secundario" href="../config/"
         data-i18n="footerSettings">Ajustes</a>
    </footer>
  </div>

  <script src="../assets/js/utils.js"></script>
  <script src="../assets/js/i18n.js"></script>
  <script src="strings.es.js"></script>
  <script src="strings.en.js"></script>
  <script>
    (function () {
      'use strict';
      function paintLanguageSelector() {
        var active = App.i18n.locale();
        document.getElementById('btnIdiomaEs')
          .setAttribute('aria-pressed', String(active === 'es'));
        document.getElementById('btnIdiomaEn')
          .setAttribute('aria-pressed', String(active === 'en'));
      }
      document.getElementById('btnIdiomaEs')
        .addEventListener('click', function () { App.i18n.setLocale('es'); });
      document.getElementById('btnIdiomaEn')
        .addEventListener('click', function () { App.i18n.setLocale('en'); });
      paintLanguageSelector();
    })();
  </script>
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
  orden) en `about/`, `team/` y `legal/`. `config/` tiene un
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
    footerTeamGuide: 'Quiénes la hacen',
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
| `utils.js` | `App.utils.shuffle / $ / $$ / reducedMotion / wakeLock` | cada página |
| `i18n.js` | `App.i18n.{locale, setLocale, lang, register, t, pick, apply, SUPPORTED, DEFAULT_LOCALE, LABEL, FLAG}` | cada página |
| `tts.js` | `App.tts.speak` | solo páginas que leen en voz alta (la mayoría) |
| `storage.js` | `App.storage.{get, set, remove}` | solo páginas que leen o escriben `localStorage` (`index.html`, `config/`) |
| `feedback.js` | `App.feedback.{success, encourage, celebrate}` | solo el `app.js` de la actividad |

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
  /* …about/, team/, config/ igual… */
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
`/about/` o `/team/` prima el SW para la raíz de la SPA del
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
   por carpeta (`legal/`, `about/`, `team/`, `config/`).
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
  `about/`, `team/` dentro de `index.html` como secciones
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
- `/about/` y `/team/` igual; sus enlaces del pie navegan
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


