# Guía para crear actividades

> **Cómo diseñar y construir una actividad nueva en Calculia,
> aplicando las reglas de producto de [`SPEC.md`](SPEC.md) §3, las
> reglas de accesibilidad de [`tecnico.md`](tecnico.md) §5, la receta
> técnica de §9, y un conjunto de técnicas **didácticas**, de
> **gamificación**, de **persuasión** y de **neuromarketing**
> adaptadas a la audiencia del proyecto.**
>
> Este documento **no** duplica la guía pedagógica canónica; apunta a
> ella y solo recoge lo específico de Calculia. Si una regla aquí
> entra en conflicto con la guía canónica o con `tecnico.md`,
> `tecnico.md` gana.

---

## 1. La guía pedagógica canónica

Las técnicas didácticas, de gamificación, de persuasión y de
neuromarketing completas que comparten todas las apps de la suite
de Apptonomia viven en el repositorio de **Routime** en
[`guia-crear-elementos.md`](https://github.com/thenkdframe/routime/blob/main/doc/es/guia-crear-elementos.md).

Léela antes de diseñar nada. Cubre (entre otras cosas):

- Las 13 reglas obligatorias de accesibilidad (con su porqué).
- La escalera de pistas del método socrático (pista → pista más
  grande → respuesta).
- La paleta de refuerzo positivo (sonidos, animaciones, micro-copy).
- Los patrones de neuromarketing que usa el suite (compromiso,
  reciprocidad, prueba social) y cómo se ajustan a una audiencia
  que aprende a su ritmo.
- La lista de comprobación del diseño de niveles (progresión
  Fácil → Medio → Difícil).

## 2. Lo específico de Calculia

- **Foco de dominio**: cálculo y razonamiento. Las actividades son
  sobre operaciones, cantidades, dinero, tiempo, patrones y lógica
  verbal/espacial — nunca sobre habilidades de vida diaria (esas
  viven en Routime).
- **UI numérica**: la actividad debe leer los números en voz alta
  cuando sea posible (`App.audio.speakNumber`) y aceptar tanto
  **dígitos** (p. ej. `12`) como **palabras** (`doce`) como entrada
  cuando aplique. Las formas en palabras en español y en inglés se
  guardan en `assets/js/numbers.<locale>.js` (ver
  [`I18N.md`](I18N.md)).
- **Dinero**: los importes se almacenan internamente en **céntimos**
  para evitar problemas de coma flotante. La capa de presentación
  los formatea con el separador del idioma
  (`I18N.formatCurrency`).
- **Actividades de patrón y reloj**: se apoyan en **SVG** para las
  formas visuales (números romanos, esferas de reloj, teselas de
  patrones) y en `App.audio` para cualquier pista hablada. El SVG
  debe ser escalable y respetar `prefers-reduced-motion`.
- **Actividades de razonamiento**: cada elemento de "Qué sobra",
  "Patrones" o "Acertijos" debe tener **una razón evidente** y
  **ninguna alternativa oculta**. Una persona revisora debe poder
  justificar la respuesta correcta en una frase.

## 3. La receta técnica

Cómo crear la carpeta, registrar la actividad en el fichero de
catálogo, añadir las cadenas en ambos idiomas y subir la versión de
caché del service worker se describe paso a paso en
[`tecnico.md`](tecnico.md) §9. **Lee esa sección antes de escribir
ningún código.**

## 4. Lista de comprobación antes de abrir un PR

- [ ] Carpeta creada en `tools/<slug>/` con la anatomía estándar
      descrita en [`tecnico.md`](tecnico.md) §5.
- [ ] Actividad registrada en el fichero de catálogo (visible en la
      cuadrícula de inicio).
- [ ] Cadenas añadidas en AMBOS `tools/<slug>/strings.es.js` **y**
      `tools/<slug>/strings.en.js` con las mismas claves.
- [ ] Niveles (1, 2, 3) configurados con dificultad progresiva.
- [ ] Escalera de pistas con método socrático (ver la guía de
      Routime, §3).
- [ ] Pista de audio que respeta `prefers-reduced-motion` y la
      preferencia de audio de la persona en ajustes.
- [ ] Progreso guardado solo en `localStorage`; sin llamadas de
      red.
- [ ] Caché del service worker: `VERSION` subida en `sw.js`.
- [ ] `node scripts/check.js` pasa.

## 5. Ver también

- Guía pedagógica canónica (Routime):
  [guia-crear-elementos.md](https://github.com/thenkdframe/routime/blob/main/doc/es/guia-crear-elementos.md).
- Receta técnica: [`tecnico.md`](tecnico.md) §9.
- Reglas innegociables del producto:
  [`SPEC.md`](SPEC.md) §3.
- Catálogo de actividades: [`actividades.md`](actividades.md).
