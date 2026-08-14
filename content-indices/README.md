# Índices de contenido — Matemáticas, Primaria a ESO

Esta carpeta es un **temario de referencia**, no un punto de ingesta:
a diferencia de la carpeta homónima en el proyecto hermano Memofun,
aquí ningún agente de IA lee estos archivos para generar contenido
automáticamente. Calculia no tiene una tubería de generación — sus 14
actividades (`tools/`) están programadas a mano, cada una con su
propia mecánica.

El propósito es poder **consultar** qué temas de matemáticas
corresponden a cada curso, y compararlo con las actividades que ya
existen en `tools/` (`math-tables`, `roman-numerals`, `numbers`,
`quantities`, `fractions-measures`, `mental-math`, `clock`,
`money`/`wallet`, `patterns`...) para ver qué cubren y qué no.

## Alcance

Cubre **1º de Primaria a 4º de ESO** — el mismo tramo que Memofun
cubría antes de que Matemáticas se retirara de allí (ese contenido
vive aquí ahora, no en Memofun; ver `content-indices/README.md` de
Memofun).

## Estructura de cada archivo

```markdown
---
tema: "Matemáticas - 3º de Primaria"
nivel: "principiante"
---
# Índice
- Los números hasta el 9.999
- La multiplicación: tablas hasta el 10
- ...

# Contexto o notas adicionales
(nivel y enfoque; relación con actividades existentes en tools/)
```

Sin `cantidad` ni `salida`: esos campos solo tienen sentido si algo
genera contenido a partir del archivo, y aquí nada lo hace.

## Precisión curricular

Es un temario general orientativo (currículo LOMLOE habitual), no un
documento curricular oficial certificado: el reparto exacto por curso
puede variar algo según la comunidad autónoma y el centro. Revisa el
temario oficial si necesitas precisión exacta — misma salvedad que
hace Memofun para sus propios índices.

Escrito solo en español, igual que los índices de contenido de
Memofun: es documentación de referencia, no forma parte del producto
servido a quien usa la app, así que no le aplica la paridad ES/EN de
`CLAUDE.md`.
