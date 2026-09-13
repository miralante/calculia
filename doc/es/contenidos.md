# Contenidos detallados — Calculia

> 🌐 **Otro idioma:** [English](../en/CONTENTS.md)

Este documento es un **índice didáctico detallado** de Calculia.
Amplía [`actividades.md`](actividades.md) y
[`guia-crear-elementos.md`](guia-crear-elementos.md) dando,
para cada actividad, módulo y concepto pedagógico que se distribuye
con la app:

- Su **nombre** (tal y como aparece en la UI).
- Su **módulo** (slug en `tools/`).
- Su **objetivo didáctico** (qué trabaja).
- Su **vocabulario / tema clave** (usado en `strings.es.js` /
  `strings.en.js`).
- Su **referencia** (documento canónico y sección).

Usa este documento como el **workbook de Calculia**: cuando se
proponga una actividad nueva, cuando se revise contenido, o cuando
se reequilibre el catálogo, este es el documento que hay que leer
primero.

> **Fuente de verdad para las reglas de producto**:
> [`SPEC.md`](SPEC.md). **Fuente de verdad para la pedagogía**:
> [`guia-crear-elementos.md`](guia-crear-elementos.md). Este
> documento **no** redefine reglas; indexa el contenido que esas
> reglas producen.

---

## 0. Cómo se organiza este documento

1. Módulos (los 2 bloques temáticos: Matemáticas / Razonamiento).
2. Actividades, módulo a módulo, en orden didáctico.
3. Conceptos pedagógicos (el "qué trabaja cada actividad").
4. Contenido numérico (qué hay en el banco de datos).
5. Restricciones y contenido prohibido.

---

## 1. Módulos

| # | Módulo | Emoji | Slug | Color | Qué trabaja |
|---|---|---|---|---|---|
| 1 | Matemáticas | 🔢 | `math` | Azul | Cálculo, cantidad, medida, dinero. |
| 2 | Razonamiento y lógica | 🧩 | `reasoning` | Turquesa | Lógica, reconocimiento de patrones, razonamiento verbal, razonamiento espacial. |

---

## 2. Actividades por módulo

### 2.1 Módulo 1 — Matemáticas (🔢)

| Actividad | Slug (`tools/`) | Objetivo didáctico | Vocabulario clave |
|---|---|---|---|
| Números | `numbers/` | Leer, escribir y comparar números enteros, secuencias y valor posicional. | número, contar, secuencia, posición, mayor, menor, igual. |
| Fracciones y medidas | `fractions-measures/` | Reconocer, comparar y operar con fracciones y unidades de medida habituales. | fracción, mitad, tercio, metro, kilo, litro, comparar. |
| Tablas de multiplicar | `math-tables/` | Tablas de multiplicar y dividir mediante repetición y retos cortos. | tabla, multiplicar, dividir, producto. |
| Cálculo mental | `mental-math/` | Cálculo rápido con las cuatro operaciones, sin pasos intermedios escritos. | sumar, restar, multiplicar, dividir, rápido, cálculo. |
| Dinero | `money/` | Reconocer monedas y billetes, contar cantidades, calcular totales. | moneda, billete, céntimo, euro, contar, total. |
| Cartera | `wallet/` | Dar y recibir dinero, calcular vueltas, gestionar un pequeño presupuesto. | cartera, pagar, vuelta, gasto, presupuesto. |
| Cantidades | `quantities/` | Comparar cantidades, estimar y razonar sobre "más / menos / igual". | más, menos, igual, comparar, estimar. |
| Números romanos | `roman-numerals/` | Leer y escribir números romanos hasta los millares. | romano, I, V, X, L, C, D, M, convertir. |
| Temperatura | `temperature/` | Leer un termómetro, comparar temperaturas, convertir entre °C y °F. | temperatura, grado, Celsius, Fahrenheit, termómetro. |

### 2.2 Módulo 2 — Razonamiento y lógica (🧩)

| Actividad | Slug (`tools/`) | Objetivo didáctico | Vocabulario clave |
|---|---|---|---|
| Acertijos | `riddles/` | Razonamiento verbal: leer una pista corta, inferir la respuesta. | pista, deducir, respuesta, inferir. |
| Patrones | `patterns/` | Detectar y continuar patrones visuales y numéricos. | patrón, secuencia, continuar, regla. |
| Qué sobra | `odd-one-out/` | Identificar qué elemento no pertenece a un conjunto, y explicar por qué. | sobra, conjunto, común, distinto. |
| Puzzle | `puzzle/` | Razonamiento espacial: reorganizar piezas para reconstruir una imagen o secuencia. | pieza, imagen, reconstruir, espacio. |
| Reloj | `clock/` | Leer la hora en relojes analógicos y digitales, razonar sobre duraciones. | hora, minuto, reloj, analógico, digital, duración. |
| Cuentos | `stories/` | Problemas breves: extraer los datos relevantes, elegir la operación adecuada. | cuento, problema, dato, operación, sumar, restar. |

---

## 3. Conceptos pedagógicos (qué trabaja cada actividad)

### 3.1 Sentido numérico

- Contar y la recta numérica (`numbers/`).
- Valor posicional (`numbers/`).
- Comparar números (`numbers/`, `quantities/`).

### 3.2 Operaciones

- Suma y resta (`mental-math/`, `stories/`).
- Multiplicación y división (`math-tables/`, `mental-math/`).
- Composición y descomposición de cantidades (`quantities/`,
  `stories/`).

### 3.3 Fracciones y medidas

- Leer y escribir fracciones (`fractions-measures/`).
- Comparar fracciones (`fractions-measures/`).
- Convertir entre unidades (`fractions-measures/`).

### 3.4 Dinero

- Reconocimiento de monedas y billetes (`money/`).
- Sumar importes (`money/`, `stories/`).
- Calcular vueltas (`wallet/`).
- Construir un pequeño presupuesto (`wallet/`).

### 3.5 Tiempo y temperatura

- Leer relojes analógicos y digitales (`clock/`).
- Razonar sobre duraciones (`clock/`, `stories/`).
- Leer un termómetro (`temperature/`).
- Convertir °C ↔ °F (`temperature/`).

### 3.6 Sistemas de numeración

- Leer y escribir números romanos (`roman-numerals/`).
- Traducir entre romano y decimal (`roman-numerals/`).

### 3.7 Patrones

- Detección de patrones visuales (`patterns/`, `puzzle/`).
- Detección de patrones numéricos (`patterns/`).
- Continuar una secuencia (`patterns/`).

### 3.8 Razonamiento verbal

- Inferir a partir de una pista corta (`riddles/`).
- Explicar por qué algo "sobra" (`odd-one-out/`).
- Extraer los datos relevantes de un cuento corto (`stories/`).

### 3.9 Razonamiento espacial

- Reconstruir una imagen o secuencia (`puzzle/`).
- Leer posiciones en la esfera del reloj (`clock/`).

### 3.10 Lógica y justificación

- Cada elemento de "Qué sobra", "Patrones" o "Acertijos" tiene
  **una razón evidente** y **ninguna alternativa oculta**. Una
  persona revisora debe poder justificar la respuesta correcta en
  una frase (ver
  [`guia-crear-elementos.md`](guia-crear-elementos.md) §2.2).

---

## 4. Contenido numérico (banco de datos)

Las actividades sacan números, precios, fracciones, horas y
temperaturas de un **banco de datos por idioma**:

| Contenido | Origen | Ejemplos |
|---|---|---|
| Formas en palabras de los números | `assets/js/numbers.<locale>.js` | `doce` (es), `twelve` (en). |
| Formato de moneda | `I18N.formatCurrency` | `12,50 €` (es), `€12.50` (en). |
| Cadenas de fecha y hora | `I18N.formatTime`, `I18N.formatDate` | `14:35` (es), `2:35 pm` (en). |
| Separador decimal | Conmutador por idioma | `,` en es, `.` en en. |

Reglas del banco de datos:

- Todos los importes se almacenan internamente en **céntimos**
  (entero), y se formatean en la capa de UI con el helper de
  moneda por idioma.
- Todas las formas en palabras de los números viven en
  `assets/js/numbers.<locale>.js`, una entrada por idioma,
  **nunca en línea** dentro de `tools/<slug>/data.js`.
- La tabla de conversión de números romanos es **por idioma**
  (español / inglés), y usa las formas romanas canónicas
  `I V X L C D M`.

---

## 5. Restricciones y contenido prohibido

Estas reglas se aplican a **toda** actividad y **nunca** se rompen
(justificación completa en [`SPEC.md`](SPEC.md) §3 y en
[`guia-crear-elementos.md`](guia-crear-elementos.md) §2):

- **Sin cronómetros, sin puntuación, sin castigo** — el feedback es
  ánimo, no "incorrecto".
- **Sin etiquetas clínicas** sobre la persona usuaria (discapacidad
  intelectual, terapia ocupacional, menores) dentro de la UI.
- **Sin dinero en coma flotante** — los importes se guardan en
  céntimos.
- **Sin respuestas con "alternativa oculta"** — cada elemento de
  razonamiento tiene exactamente una respuesta correcta evidente.
- **Sin tracking, sin login, sin analítica** — el progreso vive
  solo en `localStorage`.
- **Sin contenido de odio, sexual, político o violento** en el
  producto que ve quien usa la app.

---

## 6. Ver también

- Producto: [`SPEC.md`](SPEC.md).
- Arquitectura: [`tecnico.md`](tecnico.md).
- Catálogo de actividades (resumen): [`actividades.md`](actividades.md).
- Guía pedagógica (larga): [`guia-crear-elementos.md`](guia-crear-elementos.md).
- Idiomas: [`I18N.md`](I18N.md).
- Para familias y terapeutas: [`equipo.md`](equipo.md).
