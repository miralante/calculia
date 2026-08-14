# Contribuir a Calculia

¡Gracias por tu interés! Antes de abrir un issue o un PR, echa un
vistazo a:

- La especificación de producto en la carpeta `doc/` de este repo (la
  fuente canónica de las reglas no negociables de producto y
  accesibilidad).
- La referencia técnica en `doc/` (arquitectura, restricciones,
  política de idioma).
- `CLAUDE.md` (el flujo de trabajo que seguimos al editar el repo).

## Cómo contribuir

- **Bugs y peticiones de producto**: usa las
  [plantillas de issue](../../.github/ISSUE_TEMPLATE/).
- **Pull requests**: usa la
  [plantilla de PR](../../.github/PULL_REQUEST_TEMPLATE.md).

## Cambios de producto: ambos idiomas

`es` es el idioma por defecto y la fuente de verdad. Si tocas cadenas
de UI, datos de lecciones / actividades o cualquier otro contenido
dividido por idioma, actualiza tanto `es` como `en` (raíz y/o
`legal/`, según el caso). `node scripts/check.js` impone paridad de
claves, pero no calidad de traducción: revisa los dos idiomas.

## Estilo de código

- Scripts clásicos, no módulos ES (compatibilidad con `file://` y
  navegadores antiguos). Todo el código compartido se expone en
  `window.App.*`.
- Identificadores, comentarios y mensajes de commit en inglés.
- Texto de UI en el idioma que representa.
- Sin frameworks, sin bundlers, sin CDNs de JS.

## Entorno de desarrollo

```bash
npx serve .
# o
python -m http.server 8080
```

No hay paso de build. `node scripts/check.js` es el único paso de
validación (lo corre también el CI en cada push y PR).

## Cómo reportar una vulnerabilidad

Ver [`SECURITY.md`](SECURITY.md).
