# Guía rápida

> 🌐 **Otro idioma:** [English](../en/quick-guide.md)

Esta guía explica paso a paso cómo usar Calculia: desde cómo abrirla
hasta cómo ganar estrellas, cambiar de idioma o instalarla en el
móvil. Incluye también **cuatro formas de abrir la aplicación**,
ordenadas de la más fácil a la más elaborada.

> 📦 La versión detallada paso a paso (con descripciones equivalentes a
> capturas para cada paso y una sección completa de resolución de
> problemas) vive en la guía canónica transversal del suite:
> [`routime/doc/es/guia-rapida.md`](https://github.com/thenkdframe/routime/blob/main/doc/es/guia-rapida.md).
> Esa guía la comparten todas las apps de la suite Miralante
> porque el **flujo de apertura, los pasos de instalación PWA, el
> cambio de idioma y la resolución de problemas son idénticos** en
> todo el suite. Este documento solo recoge lo específico de Calculia.

---

## 1. Cómo abrir Calculia

Hay **cuatro formas**, ordenadas de la más fácil a la más
elaborada. El recorrido completo está en la guía canónica enlazada
arriba; la versión corta:

| # | Método | Qué necesitas | ¿Sin conexión? | ¿Instalable como PWA? |
|---|---|---|---|---|
| **A** | Desde internet ([calculia.apptonomia.uk](https://calculia.apptonomia.uk)) | Un navegador | ❌ | ✅ |
| **B** | Descargando el ZIP de GitHub | Un navegador | ❌ | ❌ |
| **C** | Servidor local con Python | Python 3 | ❌ | ✅ |
| **D** | Servidor local con Node.js | Node.js | ✅ | ✅ |

> 💡 Si solo quieres **probar la app**, usa el método **A** o **B**.
> Para la **experiencia completa** (PWA, modo sin conexión, "Añadir
> a pantalla de inicio"), usa **C** o **D**.

---

## 2. La pantalla principal

La pantalla principal muestra una cuadrícula con las tarjetas de
actividades. Cada tarjeta abre una actividad. Las actividades están
agrupadas por habilidad (matemáticas vs razonamiento); consulta
[`actividades.md`](actividades.md) para la lista completa.

## 3. Elegir una actividad

Toca (o haz clic) cualquier tarjeta. Se abre el primer nivel
directamente. Puedes cambiar de nivel desde la cabecera de la
actividad.

## 4. Botones en cada actividad

Botones habituales: **inicio**, **reiniciar nivel**, **anterior /
siguiente**, **audio** (cuando la actividad lo necesite) y **ajustes**
(icono de engranaje, dentro de la app, no la página global de
ajustes).

## 5. Cómo funciona el audio

El audio se reproduce automáticamente cuando la actividad lo necesita
(p. ej. "Qué sobra" leyendo la palabra). Toca el botón 🔊 para
repetirlo. El audio respeta `prefers-reduced-motion` y el volumen del
usuario.

## 6. Mensajes de respuesta

Acierto → mensaje de ánimo y una estrella; error → mensaje de
ánimo y reintento ilimitado. **No hay puntuación negativa** en
ningún sitio — ver [`SPEC.md`](SPEC.md) §3.1.

## 7. Ganar estrellas

Cada nivel completado = 1 estrella. Hasta 3 estrellas por actividad.

## 8. Cambiar idioma

Abre el menú de idioma desde la cabecera (icono del globo 🌐).
Disponibles: **Español (predeterminado)** e **Inglés**. Consulta
[`I18N.md`](I18N.md) para la receta para añadir un nuevo idioma.

## 9. Ajustes personales

Abre `/settings` (consulta la guía canónica para ver el patrón
exacto de URL que usa el proyecto). Desde allí puedes:

- Ver **Mi progreso** (estrellas por actividad).
- Restablecer progreso (con confirmación, porque es destructivo).
- Gestionar preferencias de audio y de movimiento reducido.

## 10. Instalar la app en el móvil

Los pasos completos (Android / iOS / escritorio) están en la guía
canónica. Versión corta: abre la app en el navegador, elige
"Añadir a pantalla de inicio" / "Instalar", confirma.

## 11. Resolución de problemas

Consulta **§11 Resolución de problemas** de la guía canónica — los
apartados (pantalla en blanco, audio que no suena, service worker
que sirve una versión antigua, etc.) aplican idénticamente a
Calculia.

## 12. Más ayuda

- Producto: [`SPEC.md`](SPEC.md).
- Arquitectura: [`tecnico.md`](tecnico.md).
- Catálogo de actividades: [`actividades.md`](actividades.md).
- Para familias y terapeutas: [`equipo.md`](equipo.md).

## 13. Resumen rápido

1. Abre Calculia (4 métodos; el más fácil es **A**).
2. Elige una actividad en la cuadrícula de inicio.
3. Juega a tu ritmo, sin presión, sin cronómetros.
4. Gana hasta 3 estrellas por actividad al completar los 3 niveles.
5. Cambia idioma con el menú 🌐; instala como PWA para uso sin
   conexión.
