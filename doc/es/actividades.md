# Catálogo de actividades

Calculia ofrece actualmente **27 actividades**, organizadas en dos
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
| **Sitios y tamaños** | Decir dónde está algo (dentro, fuera, encima, debajo, izquierda, derecha) y cuál de dos cosas es más larga, pesa más o cabe más. |
| **Números** | Leer, escribir y comparar números enteros, secuencias y valor posicional. |
| **Formas** | Reconocer formas planas y cuerpos, contar sus lados y sus esquinas. |
| **Formas parecidas** | Decidir si dos figuras son la misma forma a otro tamaño, contar los cuadrados sobre los lados de un triángulo recto, y comparar lo inclinadas que están dos rampas. |
| **Fracciones** | Reconocer, comparar y operar con fracciones sencillas y decimales. |
| **Medidas** | Elegir la unidad adecuada (cm, m, g, kg, ml, l) y estimar longitud, peso y capacidad. |
| **Geometría** | Distinguir un ángulo recto de uno agudo u obtuso, contar el borde y los cuadrados de dentro de una figura, y doblarla por la mitad para ver si coincide. |
| **Tablas de multiplicar** | Practicar las tablas de multiplicar y dividir mediante repetición y retos cortos. |
| **Cuentas grandes** | Dar la vuelta a una multiplicación, partir una difícil en dos fáciles, repartir de las dos maneras en que se divide, y decidir qué va primero cuando hay paréntesis. |
| **Grupos exactos** | Múltiplos y reglas de divisibilidad, números primos, cuándo coinciden dos cosas que se repiten, el trozo más grande común a dos medidas, y los cuadrados con su raíz. |
| **Cálculo mental** | Ejercicios rápidos con las cuatro operaciones, sin escribir pasos intermedios. |
| **Porcentajes** | Leer un porcentaje en una cuadrícula de cien, calcular un descuento o un aumento en euros, hacer crecer una receta manteniendo la proporción, ver que más gente en el mismo trabajo es menos rato, leer los metros de verdad en un plano, y saber para cuántas cosas llega el dinero que se lleva. |
| **Dinero** | Reconocer monedas y billetes, contar cantidades, calcular totales. |
| **Cartera** | Practicar dar y recibir dinero, calcular vueltas y gestionar un pequeño presupuesto. |
| **Cantidades** | Comparar cantidades, estimar y razonar sobre "más / menos / igual". |
| **Números romanos** | Leer y escribir números romanos hasta los millares. |
| **Problemas** | Problemas contados con palabras: decidir si hay que sumar o restar, y después cuántos son, con la situación dibujada para poder contarla. |
| **Temperatura** | Leer un termómetro, comparar temperaturas y convertir entre °C y °F. |

## Módulo 2: 🧩 Razonamiento y lógica

**¿Qué trabaja?** Lógica, reconocimiento de patrones, razonamiento verbal, razonamiento espacial.

| Actividad | Descripción |
|-----------|-------------|
| **Acertijos** | Razonamiento verbal: leer una pista corta, inferir la respuesta. |
| **Patrones** | Detectar y continuar patrones visuales y numéricos. |
| **Qué sobra** | Identificar qué elemento no pertenece a un conjunto, y explicar por qué. |
| **Puzzle** | Razonamiento espacial: reorganizar piezas para reconstruir una imagen o secuencia. |
| **La balanza** | Averiguar cuánto pesa la bolsa para que los dos platos queden iguales, ver que una letra es un número que aún no se sabe, leer si una gráfica de verdad sube o baja, y escribir y montar piezas: la grande mide x de lado, la tira mide x de largo y la pequeña es un 1. |
| **Datos y gráficos** | Leer un pictograma, un gráfico de barras y una tabla; repartir a partes iguales; decidir si algo es seguro, puede ser o imposible; ver en una nube de puntos si dos cosas suben juntas; y sacar una bola sin devolverla. |
| **El Calendario** | Los días de la semana, los meses del año y las cuatro estaciones, leídos sobre un calendario a la vista. |
| **Reloj** | Leer la hora en relojes analógicos y digitales, y razonar sobre duraciones. |
| **Cuentos** | Ordenar los dibujos de una rutina cotidiana según lo que pasó antes y lo que pasó después. |

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
