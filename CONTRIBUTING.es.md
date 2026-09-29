# Contribuir a Calculia

> 🌐 **Otros idiomas:** [English](CONTRIBUTING.md)
>
> **Parte de la suite [Miralante](https://apptonomia.uk)** —
> Calculia es uno de los siete proyectos hermanos (Apptonomia,
> Calculia, Memofun, Okeymoney, Routime, Sinonimia, Teclatlon) que
> comparten el mismo flujo de trabajo, las mismas reglas de
> accesibilidad y el mismo código de conducta. Este repo publica
> **Calculia** en sí.

Gracias por tu interés en contribuir. Esta guía cubre el flujo de
trabajo en GitHub que seguimos en toda la suite, los roles del
proyecto y el pequeño conjunto de recetas que mantienen a cada
hermano coherente.

---

## 🔀 Flujo de trabajo en GitHub

```text
1. 🔍 Buscar o crear un issue (en español o inglés)
2. 💬 Comentar y consensuar el alcance
3. 🌿 Crear una rama (fork si no tienes acceso de push)
4. ✏️  Hacer los cambios siguiendo las recetas de abajo
5. 📤 Abrir un Pull Request (PR) referenciando el issue
6. 👀 Esperar revisión (al menos 1 de un maintainer)
7. ✅ Merge cuando hay aprobación
```

**Etiquetas de issues** (las usamos para clasificar):

| Etiqueta | Significado |
|---|---|
| `UX` | Mejora de usabilidad o experiencia |
| `contenido` | Textos, traducciones, copy de accesibilidad |
| `bug` | Error reproducible en el comportamiento |
| `tech` | Implementación técnica, refactor |
| `docs` | Cambios en la documentación |
| `good first issue` | Apto para una primera contribución |

### Convenciones de ramas

- `feat/<slug>` — nuevas funcionalidades
- `fix/<slug>` — corrección de bugs
- `docs/<slug>` — cambios solo en documentación
- `content/<slug>` — cambios solo de contenido (definiciones, ejemplos, tarjetas)
- `i18n/<código>` — traducción a un idioma (ej. `i18n/ca`, `i18n/gl`)

### Commits

- Mensaje en **inglés** (convención del repo), resumen en imperativo.
- Una cosa por commit — commits grandes se pueden pedir trocear.
- Si cierran un issue, incluir `Closes #123` al final.

---

## 👥 Roles del proyecto

La mayoría de proyectos Miralante comparten tres roles. La división
exacta depende del hermano; consulta el `doc/es/roles.md` del
hermano afectado para la descripción autorizada.

| # | Rol | Lee primero |
|---|---|---|
| 1 | 👤 **Persona usuaria** | La app — nunca este fichero. |
| 2 | 🤝 **Apoyo** (familia / docente / terapeuta) | El `doc/es/roles.md` del hermano. |
| 3 | 💻 **Persona constructora** (contenido o código) | Este fichero, más el `doc/es/SPEC.md`, el `doc/es/tecnico.md` y el `CLAUDE.md` del hermano. |

> Las decisiones puramente técnicas viven en el rol de persona
> constructora, **no porque se ignore a la persona usuaria, sino
> porque ese es el dominio de cada rol.** Las decisiones de
> producto, contenido, idioma y diseño de UI **se prueban y validan
> con la persona usuaria siempre que es posible**, y su feedback es
> la fuente principal de mejora.

---

## 📝 Qué puedes aportar

- **Correcciones de copy** — typos, redacción más clara, ajustes de
  accesibilidad en los `strings.<locale>.js` por actividad.
- **Nueva actividad / elemento** — consulta
  [`doc/es/guia-crear-elementos.md`](doc/es/guia-crear-elementos.md)
  para la receta completa (seis ficheros canónicos, paridad de
  catálogo, bump de SW, reglas de didáctica y lectura fácil).
- **Nuevo idioma** — consulta el `doc/es/I18N.md` del hermano para
  la receta completa.
- **Accesibilidad** — contraste, orden de foco, visibilidad de foco,
  `prefers-reduced-motion`, etiquetas ARIA, copy en lectura fácil
  (UNE 153101).
- **Corrección de bugs** — cualquier cosa que se rompa en un
  navegador soportado.
- **Cabeceras de seguridad / CSP** — endurecer la política en
  `_headers`.

Cada una de estas es lo bastante pequeña como para que las recetas
de abajo la cubran sin una revisión arquitectónica aparte.

---

## 🌐 Recetas

### Corrección de copy

1. Edita el `strings.<locale>.js` fuente de verdad (`es` por defecto,
   según la política de idiomas de la suite).
2. Refleja el cambio en todos los demás ficheros de strings (`en`
   como mínimo).
3. Si el cambio toca estructura HTML visible, ejecuta
   `node scripts/check.js` para verificar la paridad de claves.
4. Abre un PR con una descripción de una línea.

### Nuevo idioma

Consulta el `doc/es/I18N.md` para el paso a paso completo. La
arquitectura está lista para multi-idioma desde el inicio: cada
página va a través de `App.i18n.t()` y atributos `data-i18n`, así
que añadir un idioma **no requiere cambios** en el bootstrap ni en el
código de la app.

### Mejora de accesibilidad

Lee primero el `doc/es/SPEC.md` §3 — las restricciones innegociables
viven ahí (botones ≥ 64×64 px, contraste WCAG AA con AAA como
objetivo de diseño, copy en lectura fácil, feedback sin presión).
Cualquier cosa que las rompa será rechazada.

### Añadir o endurecer una cabecera de seguridad

Las cabeceras viven en `_headers`. La CSP es deliberadamente
estricta (`script-src 'self'`, sin scripts inline; el bloque JSON-LD
se interpreta como dato y no necesita `unsafe-inline`). Endurecerla
es bienvenido; relajarla casi nunca lo es — abre un issue antes.

---

## ✅ Checklist antes de abrir PR

- [ ] `node scripts/check.js` pasa en local.
- [ ] Si añadiste cadenas de UI, **todos los locales soportados**
      están en sincronía (al menos `es` y `en`).
- [ ] Probaste el flujo en al menos un navegador real de escritorio
      (Chrome / Firefox / Safari).
- [ ] No añadiste ninguna dependencia de runtime nueva — solo HTML /
      CSS / JS vanilla en toda la suite.
- [ ] No aflojaste la CSP en `_headers` sin abrir un issue.
- [ ] Si este PR toca un fichero cacheado, bumpeaste `VERSION` en
      `sw.js`.

---

## 🚫 Lo que este repositorio NO acepta

- **Relajar la CSP** (`script-src 'self'` se queda estricto — no se
  permiten scripts inline).
- **Nuevas dependencias de runtime** — solo HTML / CSS / JS vanilla,
  sin npm, sin CDNs, sin paso de build.
- **Añadir analítica / telemetría / llamadas a terceros de cualquier
  tipo.**
- **Datos personales** de cualquier tipo — la suite está pensada
  para ser gratuita, sin cuentas y sin telemetría.
- **Una SPA, un router o un paso de build.** Cada hermano son
  ficheros estáticos planos; si te ves alcanzando un router, estás
  resolviendo el problema equivocado.

---

## 📞 Comunicación

- **Issues** → canal principal para propuestas, bugs, preguntas.
- **Revisiones de Pull Request** → para revisar cambios concretos.

---

## 📜 Código de conducta

Este proyecto sigue [`CODE_OF_CONDUCT.es.md`](CODE_OF_CONDUCT.es.md).
Participar implica aceptarlo.

---

## 🙏 Gracias

Gracias por dedicar tiempo a una herramienta que ayuda a las personas
a aprender a su propio ritmo.
