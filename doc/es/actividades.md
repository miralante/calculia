# Catálogo de actividades

Calculia ofrece actualmente **15 actividades**, organizadas en dos
familias: **matemáticas** (números, operaciones, medidas, dinero) y
**razonamiento** (lógica, patrones, secuencias, acertijos). Las
actividades se agrupan por la habilidad que trabajan, no por carpeta
de pantalla.

> La descripción canónica del producto (audiencia, reglas
> innegociables, modelo de datos) está en [`SPEC.md`](SPEC.md) §2. La
> receta para crear una actividad nueva está en
> [`tecnico.md`](tecnico.md) §9 y en
> [`guia-crear-elementos.md`](guia-crear-elementos.md).

---

## Módulo 1: 🔢 Matemáticas

**¿Qué trabaja?** Cálculo, cantidad, medida, dinero.

| Actividad | Descripción |
|-----------|-------------|
| **Números** | Leer, escribir y comparar números enteros, secuencias y valor posicional. |
| **Fracciones y medidas** | Reconocer, comparar y operar con fracciones y unidades de medida habituales. |
| **Tablas de multiplicar** | Practicar las tablas de multiplicar y dividir mediante repetición y retos cortos. |
| **Cálculo mental** | Ejercicios rápidos con las cuatro operaciones, sin escribir pasos intermedios. |
| **Dinero** | Reconocer monedas y billetes, contar cantidades, calcular totales. |
| **Cartera** | Practicar dar y recibir dinero, calcular vueltas y gestionar un pequeño presupuesto. |
| **Cantidades** | Comparar cantidades, estimar y razonar sobre "más / menos / igual". |
| **Números romanos** | Leer y escribir números romanos hasta los millares. |
| **Temperatura** | Leer un termómetro, comparar temperaturas y convertir entre °C y °F. |

## Módulo 2: 🧩 Razonamiento y lógica

**¿Qué trabaja?** Lógica, reconocimiento de patrones, razonamiento verbal, razonamiento espacial.

| Actividad | Descripción |
|-----------|-------------|
| **Acertijos** | Razonamiento verbal: leer una pista corta, inferir la respuesta. |
| **Patrones** | Detectar y continuar patrones visuales y numéricos. |
| **Qué sobra** | Identificar qué elemento no pertenece a un conjunto, y explicar por qué. |
| **Puzzle** | Razonamiento espacial: reorganizar piezas para reconstruir una imagen o secuencia. |
| **Reloj** | Leer la hora en relojes analógicos y digitales, y razonar sobre duraciones. |
| **Cuentos** | Problemas breves: extraer los datos relevantes y elegir la operación adecuada. |

---

## Cómo leer el catálogo

- **Actividad** es el nombre que ve la persona usuaria (la misma
  etiqueta que aparece en la pantalla de inicio de la app y en
  `site/index.html`).
- **Descripción** es un resumen de una línea de la habilidad que se
  practica. La intención pedagógica completa, los niveles y las
  notas didácticas viven en
  [`guia-crear-elementos.md`](guia-crear-elementos.md).
- Cada actividad vive en su carpeta `tools/<slug>/`, sigue la anatomía
  descrita en [`tecnico.md`](tecnico.md) §5 y está registrada en el
  fichero de catálogo que consume la cuadrícula de inicio.
