# Calculia 🧮

> 🌐 **Otros idiomas:** [English](README.md)
>
> 🚀 **Pruébalo en vivo:** [calculia.apptonomia.uk](https://calculia.apptonomia.uk/)

[![Licencia MIT](https://img.shields.io/badge/licencia-MIT-blue.svg)](LICENSE)
[![Sin dependencias](https://img.shields.io/badge/dependencias-ninguna-success.svg)](#-caracter%C3%ADsticas)
[![Sitio estático](https://img.shields.io/badge/build-ninguno-informational.svg)](#-caracter%C3%ADsticas)
[![PWA](https://img.shields.io/badge/PWA-instalable-5A0FC8.svg)](manifest.json)
[![i18n](https://img.shields.io/badge/i18n-es%20%7C%20en-yellow.svg)](#-documentaci%C3%B3n-del-proyecto-biling%C3%BCe)
[![CI](https://img.shields.io/badge/CI-node%20scripts%2Fcheck.js-blue.svg)](.github/workflows/validate.yml)

Una aplicación web gratuita, estática y sin dependencias con 11
actividades para practicar **cálculo y razonamiento lógico**: Los
Números, Cantidades, Las Tablas, Números Romanos, Adivinanzas, Patrones,
El Monedero, El Reloj, Historias, ¿Qué no encaja? y Puzzle. Sin
cuentas, sin cookies, sin analítica: todo se ejecuta en el navegador y el
progreso solo se guarda en `localStorage`, en tu propio dispositivo.

- 🌐 **Aplicación**: [calculia.apptonomia.uk](https://calculia.apptonomia.uk/)
- 📦 **Repositorio**: [github.com/miralante/calculia](https://github.com/miralante/calculia)
- 💻 **Ejecutar en local**: abre `site/index.html` directamente en un
  navegador, o sirve la carpeta con cualquier servidor estático
  (
npx serve .` / `python -m http.server 8080`) para la experiencia PWA
  completa, con soporte sin conexión.

---

## 🚀 Pruébalo en vivo

Calculia está desplegada en **[calculia.apptonomia.uk](https://calculia.apptonomia.uk/)**
— ábrela en un navegador, instálala en la pantalla de inicio para usarla
sin conexión, y elige una actividad para empezar. Sin cuentas, sin
telemetría.

---

## ✨ Características

Calculia es un **catálogo multi-actividad** construido sobre la misma
arquitectura de tres niveles que Apptonomia (núcleo compartido en
`assets/js/`, una carpeta por actividad en `tools/<slug>/`, una
portada en `site/`), más una página de ajustes para ver el progreso.

- 🧮 **11 actividades** — Los Números, Cantidades, Las Tablas, Números
  Romanos, Adivinanzas, Patrones, El Monedero, El Reloj, Historias,
  ¿Qué no encaja? y Puzzle.
- 🪶 **Cero dependencias en tiempo de ejecución** — HTML/CSS/JS puros,
  sin paso de build.
- 🌐 **Bilingüe** — español (por defecto) e inglés.
- 🔒 **Privacidad por defecto** — sin cuentas, sin cookies, sin
  analítica: el progreso solo se guarda en `localStorage` en el
  dispositivo del usuario.
- 📦 **PWA instalable** — se puede añadir a la pantalla de inicio,
  funciona sin conexión.
- 🖐️ **Accesibilidad** — botones ≥ 64×64 px, contraste WCAG AA,
  navegación completa por teclado, `prefers-reduced-motion`,
  compatible con lectores de pantalla (ARIA).
- ⭐ **Estrellas progresivas** — solo se suman, nunca se restan; la
  única presión de gamificación es "puedes volver".

---

## 👥 Roles del proyecto

| Rol | Quién es | Cómo participa | Dónde mira primero |
|---|---|---|---|
| 👤 **Persona usuaria** (persona tipo) | Practica actividades de cálculo y razonamiento | Abre la app en un navegador; no lee ni escribe código | La aplicación — no hace falta leer nada más |
| ❤️ **Apoyo / familia / docente** | Acompaña a la persona usuaria o usa Calculia con un grupo | Elige actividades que encajen con un objetivo de aprendizaje; supervisa el progreso por las estrellas ⭐ | [`CONTRIBUTING.es.md`](CONTRIBUTING.es.md) (la sección "Apoyo") |
| 💻 **Construcción / desarrollador/a** | Mantiene el catálogo, el core compartido y el CI | Implementa actividades en `tools/<slug>/`, ejecuta 
ode scripts/check.js`, despliega | [`CLAUDE.md`](CLAUDE.md) |

Ver [`doc/es/roles.md`](doc/es/roles.md) para la descripción completa
de los roles y los patrones trio/par/único en el conjunto de la suite.

---

## 📚 Documentación del proyecto (bilingüe)

Toda la documentación del proyecto vive en la carpeta `doc/`:

| Idioma | Punto de entrada |
|---|---|
| 🇪🇸 Español (este archivo) | [`doc/es/indice.md`](doc/es/indice.md) |
| 🇬🇧 English | [`doc/en/index.md`](doc/en/index.md) |

Según tu rol y perfil, te interesa una u otra documentación:

| Soy… | Empieza por… |
|---|---|
| 👤 Persona usuaria o familiar | [`doc/es/readme.md`](doc/es/readme.md) |
| ❤️ Terapeuta, familiar o profesional de apoyo | [`doc/es/equipo.md`](doc/es/equipo.md) |
| 🤔 Quiero entender qué es Calculia y por qué | [`doc/es/spec.md`](doc/es/spec.md) |
| 💻 Desarrollador/a | [`doc/es/tecnico.md`](doc/es/tecnico.md) |

### 📄 Otros documentos del repo

| Documento | Para quién |
|---|---|
| [`CONTRIBUTING.es.md`](CONTRIBUTING.es.md) | Familias, terapeutas y desarrolladores que quieran contribuir |
| `CLAUDE.md` | Agentes IA: reglas obligatorias y estado del proyecto |
| [`CLOUDFLARE.md`](CLOUDFLARE.md) | Guía canónica de despliegue en Cloudflare Workers para la suite (Calculia + Apptonomia + Memofun, Okeymoney, Sinonimia, Teclatlon) |
| Historial del proyecto | En `git log`; no se mantiene una hoja de ruta externa |
| `doc/es/i18n.md` / `doc/en/i18n.md` | Detalles del sistema multiidioma ES/EN |

---

## 🛠️ Preparar / Ampliar contenido

Calculia crece añadiendo **actividades** bajo `tools/<slug>/`. Cada
actividad trae los seis archivos canónicos (`index.html`, `app.js`,
`data.js`, `strings.es.js`, `strings.en.js`, `styles.css`); cualquier
cambio tiene que respetar el bloqueo de paridad del catálogo (el
mismo conjunto de slugs debe aparecer en `tools/` en disco, en las
tarjetas de `site/index.html`, en las filas de progreso de
`settings/index.html` y en `ARCHIVOS` de `sw.js`).

Para añadir una actividad nueva:

1. Crea `tools/<slug>/` con los seis archivos canónicos (usa una
   actividad existente como plantilla).
2. Registra la actividad: añade su tarjeta a `site/index.html` (+ las
   claves en ambos `site/strings.<locale>.js`), su fila de progreso a
   `settings/index.html` (+ las claves en ambos
   `settings/strings.<locale>.js`), y sus seis archivos a `ARCHIVOS` de
   `sw.js`.
3. Sube el `VERSION` en `sw.js` (p. ej. `calculia-vN` → `calculia-vN+1`).
4. Añade el slug a `STRING_LOCALES` en `scripts/check.js` solo si vas a
   añadir un idioma nuevo (raro).

Para ampliar los **datos** de una actividad existente, edita su
`data.js` (más `data.js` dividido por idioma si lo hay) —

ode scripts/check.js` impone paridad de claves entre
`strings.es.js` y `strings.en.js`.

---

## ✅ Validar los cambios

```bash
node scripts/check.js
```

No hace falta 
pm install` — el script solo usa la librería estándar de
Node. Comprueba sintaxis JS en `tools/`, `site/` y `assets/js/`, la
anatomía canónica de cada carpeta de actividad, paridad entre `sw.js`
y el contenido en disco, paridad de claves es/en, y la regla de paridad
del catálogo (el mismo conjunto de slugs debe aparecer en `tools/`
en disco, en las tarjetas de `site/index.html`, en las filas de
progreso de `settings/index.html` y en `ARCHIVOS` de `sw.js`). El
mismo script corre en cada push y PR vía
[`.github/workflows/validate.yml`](.github/workflows/validate.yml).

Si tocas cualquier archivo listado en `ARCHIVOS` de `sw.js`, sube
también el `VERSION` en `sw.js` — el bloqueo del catálogo +
`check.js` lo imponen.

---

## ☁️ Despliegue

Calculia es un sitio totalmente estático (HTML/CSS/JS, sin build), así
que se publica directamente en **[Cloudflare Workers (static assets)](https://developers.cloudflare.com/workers/static-assets/)**
mediante su integración nativa con GitHub. Las cabeceras de seguridad
HTTP viven en [`_headers`](_headers), el fallback 404 en
[`_redirects`](_redirects), y la metadata del proyecto en
[`wrangler.toml`](wrangler.toml). Consulta [`CLOUDFLARE.md`](CLOUDFLARE.md)
con la guía completa (rebuild, rollback, dominio personalizado,
rotación de credenciales).

Las pull requests reciben automáticamente una URL de previsualización
en `*.pages.dev` — sin necesidad de un workflow extra.

---

## 🔐 Seguridad

Calculia es un sitio estático completamente del lado del cliente: sin
backend, sin base de datos, sin telemetría, sin servicios de terceros en
tiempo de ejecución. El modelo de amenaza es esencialmente "qué podría
hacer una página maliciosa offline contra el mismo origen", algo que el
navegador ya aísla. Ver [`SECURITY.es.md`](SECURITY.es.md) (o
[`SECURITY.md`](SECURITY.md)) para reportar una sospecha de forma privada.

---

## 📄 Licencia

MIT — ver [`LICENSE`](LICENSE).

---

## 🧹 Mantenimiento

Este repo no tiene 
ode_modules`, artefactos de build, ni directorio
de caché. Para limpiar la caché local del service worker durante el
desarrollo, desregistra el SW desde DevTools (`Application → Service
workers → Unregister`) y borra los datos del sitio. Para forzar una
re-validación tras cambios grandes:

```bash
rm -rf site/.cache tools/.cache assets/.cache  # solo si están presentes
```

El script `scripts/check.js` es el único paso de "test" y el único
script que necesita correr en local.

---

## 🙏 Créditos

Calculia salió de la app Apptonomia de la suite (que fue el origen del
grupo con una suite más amplia de actividades de terapia ocupacional)
y mantiene la misma filosofía de accesibilidad sin backend y lectura
fácil. El core compartido (`assets/js/`) se portó desde Apptonomia con
solo el prefijo de storage rebrandead (`apptonomia:` → `calculia:`).

---

## 🌐 La suite Miralante — proyectos del grupo

Calculia es una de las **seis apps** de la suite **Miralante**, que
comparten autor, la misma filosofía de accesibilidad sin backend, y la
misma historia de despliegue en Cloudflare. Apptonomia, además de
ser una app en sí misma, actúa como **portal de la suite** que la
presenta al mundo. Ninguno de los siete repos es el "principal" —
son iguales; este es el producto original del que nació el grupo.

| Proyecto | Qué es | Repositorio |
|---|---|---|
| **Apptonomia** *(portal — landing only, no es app)* | Landing que presenta la suite Miralante (no es una app en tiempo de ejecución) | [github.com/miralante/apptonomia](https://github.com/miralante/apptonomia) |
| [Calculia](https://calculia.apptonomia.uk/) | Cálculo y razonamiento lógico | [github.com/miralante/calculia](https://github.com/miralante/calculia) |
| [Memofun](https://memofun.apptonomia.uk/) | Tarjetas de memoria con aprendizaje significativo | [github.com/miralante/memofun](https://github.com/miralante/memofun) |
| [Okeymoney](https://okeymoney.apptonomia.uk/) | Finanzas personales y autonomía cotidiana | [github.com/miralante/okeymoney](https://github.com/miralante/okeymoney) |
| [Routime](https://routime.apptonomia.uk/) | Actividades para rutinas y vida cotidiana | [github.com/miralante/routime](https://github.com/miralante/routime) |
| [Sinonimia](https://sinonimia.apptonomia.uk/) | Diccionario en lectura fácil | [github.com/miralante/sinonimia](https://github.com/miralante/sinonimia) |
| [Teclatlon](https://teclatlon.apptonomia.uk/) | Mecanografía con el teclado físico | [github.com/miralante/teclatlon](https://github.com/miralante/teclatlon) |

La guía canónica de Cloudflare / despliegue para el grupo vive en
[`CLOUDFLARE.md` de Apptonomia](https://github.com/miralante/apptonomia/blob/master/CLOUDFLARE.md).
Este repo usa el modelo **Workers + static assets** (`wrangler.toml` +
`[assets]` + `_redirects`), que es una forma distinta al modelo Pages
clásico de Apptonomia/Teclatlon — ver [`CLOUDFLARE.md`](CLOUDFLARE.md)
para la guía local.



