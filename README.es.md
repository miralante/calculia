# Calculia

> 🌐 **Otros idiomas:** [English](README.md)

Una aplicación web gratuita, estática y sin dependencias con 11
actividades para practicar **cálculo y razonamiento lógico**: Los
Números, Cantidades, Las Tablas, Números Romanos, Adivinanzas, Patrones,
El Monedero, El Reloj, Historias, ¿Qué no encaja? y Puzzle. Sin
cuentas, sin cookies, sin analítica: todo se ejecuta en el navegador y el
progreso solo se guarda en `localStorage`, en tu propio dispositivo.

- 💻 **Ejecutar en local**: abre `site/index.html` directamente en un
  navegador, o sirve la carpeta con cualquier servidor estático
  (`npx serve .` / `python -m http.server 8080`) para la experiencia PWA
  completa, con soporte sin conexión.

---

## 📚 Documentación

| Tema | Documento |
|---|---|
| Producto, audiencia, reglas de accesibilidad | [`doc/es/SPEC.md`](doc/es/SPEC.md) · [`doc/en/SPEC.md`](doc/en/SPEC.md) |
| Arquitectura y referencia técnica | [`doc/es/tecnico.md`](doc/es/tecnico.md) · [`doc/en/technical.md`](doc/en/technical.md) |
| Internacionalización (añadir un idioma) | [`doc/es/I18N.md`](doc/es/I18N.md) · [`doc/en/I18N.md`](doc/en/I18N.md) |
| Guía de despliegue (Cloudflare Workers) | [`CLOUDFLARE.md`](CLOUDFLARE.md) |
| Flujo operativo para agentes de IA | [`CLAUDE.md`](CLAUDE.md) |

El historial del proyecto vive en `git log`; no se mantiene una hoja de
ruta externa.

---

## ☁️ Despliegue

Calculia es un sitio totalmente estático (HTML/CSS/JS, sin build), así
que se publica directamente en **[Cloudflare Workers (static assets)](https://developers.cloudflare.com/workers/static-assets/)**
mediante su integración nativa con GitHub — no hay workflow personalizado
de GitHub Actions. Las cabeceras de seguridad HTTP viven en
[`_headers`](_headers), el fallback 404 en [`_redirects`](_redirects), y
la metadata del proyecto en [`wrangler.toml`](wrangler.toml). Consulta
[`CLOUDFLARE.md`](CLOUDFLARE.md) con la guía completa (rebuild, rollback,
dominio personalizado, rotación de credenciales).

Las pull requests reciben automáticamente una URL de previsualización en
`*.pages.dev` — sin necesidad de un workflow extra.

---

## ✅ Validar

```bash
node scripts/check.js
```

No hace falta `npm install` — el script solo usa la librería estándar de Node.

---

## 📄 Licencia

MIT — ver [`LICENSE`](LICENSE).

---

## 🧩 Proyectos hermanos

Este proyecto forma parte de un pequeño grupo de proyectos hermanos
que comparten autor, la misma filosofía de accesibilidad y sin
backend, y la misma historia de despliegue en Cloudflare. **Apptonomia
es el proyecto principal**; los demás (Calculia, Okeymoney, Sinonimia,
Teclatlon) salieron de él o se construyeron a su lado sobre el mismo
stack.

| Proyecto | Qué es | Repositorio |
|---|---|---|
| **Apptonomia** *(principal)* | Terapia ocupacional: 7 módulos, 69 actividades | [github.com/thenkdframe/apptonomia](https://github.com/thenkdframe/apptonomia) |
| Calculia | Cálculo y razonamiento lógico: 11 actividades | [github.com/thenkdframe/calculia](https://github.com/thenkdframe/calculia) |
| Okeymoney | Finanzas personales y autonomía cotidiana | [github.com/thenkdframe/okeymoney](https://github.com/thenkdframe/okeymoney) |
| Sinonimia | Diccionario en lectura fácil | [github.com/thenkdframe/sinonimia](https://github.com/thenkdframe/sinonimia) |
| Teclatlon | Mecanografía con el teclado físico | [github.com/thenkdframe/teclatlon](https://github.com/thenkdframe/teclatlon) |

La guía canónica de Cloudflare / despliegue para el grupo vive en
[`CLOUDFLARE.md` de Apptonomia](https://github.com/thenkdframe/apptonomia/blob/master/CLOUDFLARE.md).
Este repo usa el modelo **Workers + static assets** (`wrangler.toml` +
`[assets]` + `_redirects`), que es una forma distinta al modelo Pages
clásico de Apptonomia/Teclatlon — ver [`CLOUDFLARE.md`](CLOUDFLARE.md)
para la guía local.
