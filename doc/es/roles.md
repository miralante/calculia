# Roles del proyecto

Calculia tiene **tres roles diferenciados**, igual que el resto de la
familia de proyectos (Apptonomia, Memofun, Okeymoney, Sinonimia,
Teclatlon):

| Rol | Quién es | Cómo participa | Dónde mira primero |
|---|---|---|---|
| 👤 **Persona usuaria** (cualquiera que practica cálculo y razonamiento lógico, y en particular personas que se benefician de la lectura fácil) | Practica las 14 actividades | Abre `site/index.html` en un navegador y usa la app de forma autónoma. **No lee código**, no toca [`settings/`](../../settings/) más allá del reset de progreso. | La aplicación — no hace falta leer nada más |
| ❤️ **Apoyo**: familia, docente, terapeuta | Elige la actividad adecuada para un objetivo de aprendizaje | Escoge actividades que encajen con un objetivo (Cálculo, Razonamiento y lógica) y supervisa el progreso por las estrellas ⭐ en [`settings/`](../../settings/). También puede reportar contenido que falta o redacción que resulta difícil. | [`CONTRIBUTING.es.md`](../../CONTRIBUTING.es.md) (la sección "Apoyo") |
| 💻 **Construcción**: desarrollador/a | Mantiene el catálogo, el core compartido y el CI | Implementa actividades en `tools/<slug>/`, ejecuta [`scripts/check.js`](../../scripts/check.js), sube el `VERSION` en `sw.js` y despliega. | [`CLAUDE.md`](../../CLAUDE.md) · [`tecnico.md`](tecnico.md) |

> 💡 La persona usuaria final es siempre alguien que se beneficia de
> la lectura fácil, un ritmo sin presión y pantallas sin ruido — ver
> [`SPEC.md`](SPEC.md) §2. Las decisiones de contenido, lenguaje e
> interfaz se piensan siempre desde su experiencia. Lo que queda fuera
> de su participación son las decisiones puramente técnicas (GitHub,
> arquitectura del código, el bloqueo de paridad del catálogo) — no
> por exclusión, sino porque es el ámbito de apoyo/construcción.

## Por dónde empezar, según tu perfil

| Si eres… | Empieza por… |
|---|---|
| 👤 Persona usuaria o familiar directo | La aplicación — no hace falta leer nada técnico |
| ❤️ Familia o docente que elige actividades para un objetivo de aprendizaje | [`SPEC.md`](SPEC.md) — reglas completas de producto y accesibilidad |
| ❤️ Persona de apoyo que reporta una actividad que falta o una redacción poco clara | [`CONTRIBUTING.es.md`](../../CONTRIBUTING.es.md) (la sección "Apoyo") |
| 🤔 Solo quiero entender qué es Calculia | [`README.es.md`](../../README.es.md) |
| 💻 Desarrollador/a | [`CLAUDE.md`](../../CLAUDE.md) · [`tecnico.md`](tecnico.md) |

## 🤝 Un proyecto pequeño y enfocado

A diferencia de un producto con varios equipos, Calculia es
deliberadamente pequeño: un catálogo de 14 actividades, un core
compartido en `assets/js/`, un sitio estático, sin backend. El rol de
**apoyo** suele solaparse con el de **construcción** — la misma
persona que escoge la actividad para quien aprende es también quien
abre el PR — y eso es esperable. Los tres roles se documentan por
separado para que quien se incorpore al proyecto sepa qué se espera de
cada perfil, no porque tengan que hacerlo tres personas distintas.
