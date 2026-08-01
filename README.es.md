# Calculia

> 🌐 **Otros idiomas:** [English](README.md)

Una aplicación web gratuita, estática y sin dependencias con 12
actividades para practicar **cálculo y razonamiento lógico**: Los
Números, Cantidades, Las Tablas, Números Romanos, Adivinanzas, Patrones,
El Monedero, El Reloj, Historias, ¿Qué no encaja?, Puzzle y La Oca. Sin
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
| Guía de despliegue (Cloudflare Pages) | [`DEPLOY.es.md`](DEPLOY.es.md) · [`DEPLOY.md`](DEPLOY.md) |
| Flujo operativo para agentes de IA | [`CLAUDE.md`](CLAUDE.md) |

El historial del proyecto vive en `git log`; no se mantiene una hoja de
ruta externa.

---

## ☁️ Despliegue

Calculia es un sitio totalmente estático (HTML/CSS/JS, sin build), así
que se publica directamente en **[Cloudflare Pages](https://pages.cloudflare.com)**
mediante su integración nativa con GitHub — no hay workflow personalizado
de GitHub Actions. Las cabeceras de seguridad HTTP viven en
[`_headers`](_headers), el fallback 404 en [`_redirects`](_redirects), y
la metadata del proyecto en [`wrangler.toml`](wrangler.toml). Consulta
[`DEPLOY.es.md`](DEPLOY.es.md) con la guía completa (rebuild, rollback,
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
