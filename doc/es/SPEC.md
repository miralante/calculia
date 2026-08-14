# Especificación de producto

> Fuente canónica del alcance de producto, la audiencia y las reglas no
> negociables. La arquitectura técnica vive en [`tecnico.md`](tecnico.md).

## 1. Qué es Calculia

Una aplicación web gratuita y estática con 14 actividades para practicar
cálculo y razonamiento lógico:

- **Matemáticas**: Los Números, Fracciones y Medidas, Restar y Cálculo
  Mental, Dinero, Las Tablas, Cantidades, Números Romanos.
- **Razonamiento y lógica**: Adivinanzas, Patrones, El Monedero, El
  Reloj, Historias, ¿Qué no encaja?, Puzzle.

Calculia es un proyecto hermano de Apptonomia, una suite más amplia de
actividades de terapia ocupacional: el alcance de Calculia es cálculo y
razonamiento específicamente, no los 6 juegos de mesa clásicos (ajedrez,
damas, dominó, tres en raya, sudoku visual, conecta 4) que forman parte
del catálogo de actividades de Apptonomia. Comparte el lenguaje de
diseño centrado en accesibilidad de Apptonomia (lectura fácil, sin
presión, alto contraste, objetivos táctiles grandes) porque ese diseño
sirve a cualquiera que practique matemáticas o lógica, no solo a la
audiencia para la que se construyó Apptonomia originalmente.

## 2. Audiencia

Cualquier persona que practique cálculo o razonamiento lógico:
estudiantes y, en particular, personas que se benefician de la lectura
fácil, un ritmo sin presión y pantallas predecibles y sin ruido visual.
Usable de forma **autónoma**, sin que un profesor o familiar tenga que
estar al lado de quien aprende. Funciona igual en escritorio y en
móvil/tablet — sin restricción de dispositivo, a diferencia del proyecto
hermano Teclatlon (solo teclado de ordenador).

## 3. Restricciones no negociables (de producto)

Estas restricciones vienen del **producto**, no son técnicas. Son las
"leyes" que nunca se rompen porque definen qué tipo de experiencia
ofrece Calculia. Calculia comparte esta constitución con su proyecto
hermano Apptonomia (ver el `SPEC.md` de Apptonomia) — están adaptadas a
que Calculia practica cálculo y razonamiento, no habilidades de vida
diaria ni terapia ocupacional.

### 3.1 El error nunca castiga

- No se restan estrellas ni progreso por fallar.
- El fallo produce un mensaje de **ánimo** (`App.feedback.encourage()`),
  nunca un "incorrecto".
- Se puede reintentar sin límite.
- Se usan pistas (método socrático) antes de mostrar la respuesta.

### 3.2 Sin presión temporal

- **No hay cronómetros visibles** en la interfaz.
- No se mide ni se enseña el tiempo que tarda la persona.
- El ritmo lo marca quien aprende.

### 3.3 Lectura fácil siempre

- Frases cortas, una idea por frase.
- **Vocabulario cotidiano, sin tecnicismos** (p. ej. "recuerda el valor
  de cada letra", no "recuerda la mecánica"; "fíjate en los colores",
  no "mira la mecánica").
- Sin lenguaje clínico en la interfaz ("paciente", "terapia",
  "discapacidad").
- El lenguaje clínico o técnico del dominio (terapia ocupacional,
  discapacidad) solo se permite en la documentación interna del repo
  — nunca en lo que lee quien usa la app (ver §4, la regla de cero
  menciones).

### 3.4 Privacidad por defecto

- **Sin registro**: no se pide correo, nombre real ni contraseña.
- **Sin cookies ni analítica**: nada de rastreo.
- **Sin datos personales**: el progreso se guarda en el dispositivo
  (`localStorage`).
- La aplicación funciona sin conexión a internet.
- **Contrato de progreso local**: `localStorage` se limita a
  `estrellas` (número entero) y `completado` (qué niveles se han
  terminado). **Nunca** se guardan: fallos, tiempo tardado, número de
  intentos, comparativas con otras personas, historiales detallados de
  uso ni perfiles identificables. El progreso nunca sale del
  dispositivo ni se sincroniza en la nube.

### 3.5 Accesibilidad universal

- Botones ≥ 64×64 px, separación ≥ 16 px.
- Contraste WCAG AA mínimo.
- Audio **solo cuando el diseño de la actividad lo requiere** (ver §6,
  regla 4) — no es una regla general para cada texto. Las actividades
  centradas en leer símbolos visuales (p. ej. Números Romanos) no
  llevan botón de audio: el color y la forma ya hacen ese trabajo, y
  el audio no aporta nada ahí.
- Navegación completa por teclado.
- Respeta `prefers-reduced-motion`.
- Máximo 4–6 opciones por pantalla.
- Compatible con lectores de pantalla (ARIA).

### 3.6 Aprendizaje significativo cuando sea posible

Calculia no simula escenas de la vida diaria como Apptonomia — aquí el
objetivo es cálculo y razonamiento, no habilidades de vida diaria — pero
comparte el mismo principio pedagógico de fondo: **aprendizaje
significativo** (en el sentido de Ausubel y Novak). La práctica se
ancla en algo real que quien aprende ya puede reconocer, y se cierra,
cuando aporte, con una frase de **transferencia** que conecta lo
practicado con la vida fuera de la app. En concreto:

- Los ejemplos usan datos reales cuando existen (siglos históricos,
  reyes y reinas reales, relojes) en vez de números abstractos sin
  contexto — ver el panel "número romano famoso" en Números Romanos.
- Cada nivel completado puede cerrar con una frase de `transferencia`
  que dice dónde se usará lo aprendido fuera de la app.
- Un ejemplo "significativo" se queda dentro de lo que la propia
  actividad ya ha enseñado: un símbolo o una regla que la actividad
  todavía no ha explicado (p. ej. mostrar "MCMLXXXIX" antes de que se
  haya enseñado la tabla I/V/X) deja de ser significativo y pasa a ser
  confuso — rompe la progresión gradual (regla 13 de §6).

### 3.7 Comunicación persuasiva al servicio del aprendizaje

Cada actividad debe comunicar **al servicio de la persona, nunca al
servicio de la presión**:

1. **Muy didáctica** — el objetivo de cada pantalla se anuncia en una
   frase corta; se muestra un ejemplo o paso modelado antes de la
   primera ronda.
2. **Art effects con cuidado** — animación lenta (≥ 300 ms), un solo
   elemento a la vez, desactivada con `prefers-reduced-motion`, sin
   destellos ni fuegos artificiales invasivos.
3. **Buen copy** — frases cortas (≤ 12 palabras), voz activa, segunda
   persona, imperativos positivos, sin sarcasmo.
4. **Llamada a la acción clara** — un único CTA visible por pantalla;
   los CTA finales invitan a jugar otra vez o volver al menú, nunca a
   "compartir puntuación".
5. **Gamificación con moderación** — estrellas progresivas que solo se
   suman, sin leaderboards.
6. **Patrones de mercado explícitamente prohibidos** — no pueden
   aparecer en ningún punto de la app: escasez ("¡Solo te queda 1!"),
   falsa urgencia (cronómetros, cuentas atrás), prueba social
   convertida en presión (rankings, "otros ya lo han hecho"), coste
   irrecuperable / FOMO ("no pierdas la racha"), dark patterns
   (casillas premarcadas, alertas falsas), o aversión a la pérdida
   explotadora (restar estrellas).

## 4. Regla de obligado cumplimiento: cero menciones en el producto

**Ningún texto que vea quien usa la app puede mencionar, directa ni
indirectamente, discapacidad intelectual, terapia ocupacional, menores,
niños, ni expresiones equivalentes** ("dificultades cognitivas",
"necesidades especiales", "capacidades diferentes", "menor de edad",
etc.). Esto incluye todo lo visible en la interfaz:
`tools/<slug>/index.html`, `tools/<slug>/app.js`,
`tools/<slug>/data.js`, `tools/<slug>/strings.<locale>.js`,
`site/index.html`, `settings/index.html`, y `legal/`. El motivo es
exactamente el de §1 y §2: que nadie que use la aplicación se sienta
señalado, en inferioridad o discriminado por lo que la propia
aplicación dice sobre su persona.

Dónde se aplica y dónde no:

- **Se aplica** a todo lo que ve quien usa la app: títulos,
  descripciones meta, botones, etiquetas, mensajes, texto alternativo
  de iconos, pies de página.
- **No se aplica** a la documentación interna del proyecto (este
  documento, `README.md`, `CONTRIBUTING.md`, `CLAUDE.md`): esos
  archivos los lee quien mantiene o contribuye al proyecto, no quien
  usa la app, y es exactamente donde debe explicarse el objetivo real
  del producto (ver §2 y §3).

Esta regla se comprueba automáticamente: `node scripts/check.js`
falla si cualquiera de esos términos aparece en los archivos que ve
quien usa la app.

## 5. Principios de diseño

Estos principios **mandan sobre cualquier otra decisión**. Si una tarea
entra en conflicto con ellos, ganan los principios. Son la brújula del
producto.

1. **Lectura fácil**: frases cortas, una idea por frase, vocabulario
   cotidiano, sin tecnicismos ni metáforas.
2. **Una acción por pantalla**: la persona usuaria nunca debe decidir
   entre más de 4–6 opciones visibles a la vez.
3. **Objetos táctiles grandes**: botones mínimo **64×64 px**,
   separación mínima 16 px.
4. **Audio solo cuando aporta valor**: se usa solo para gamificación o
   cuando el diseño de la actividad lo requiere; nunca por defecto en
   cada texto. Una actividad centrada en leer símbolos visuales (p. ej.
   Números Romanos) no necesita audio — el color y la forma ya
   cumplen ese papel.
5. **Alto contraste** (WCAG AA mínimo).
6. **Sin presión**: sin cronómetros visibles, sin puntuación negativa,
   sin "game over".
7. **Refuerzo positivo inmediato** al acertar.
8. **`prefers-reduced-motion`**: toda animación se desactiva si el
   sistema lo pide.
9. **Autonomía**: funciona offline (PWA), sin login, sin coste, sin
   datos personales.
10. **Aprendizaje significativo cuando sea posible** (§3.6): ejemplos
    reales, no abstractos, y siempre dentro de lo que la actividad ya
    ha enseñado.
11. **Comunicación persuasiva al servicio del aprendizaje** (§3.7):
    nunca patrones de presión ni dark patterns. La persona practica
    porque la actividad es atractiva, no porque la estemos empujando.
12. **Tecnología sobria**: HTML5 + CSS3 + JavaScript vanilla, sin
    frameworks, sin paso de build, sin dependencias npm, PWA
    offline-first.

## 6. Reglas de accesibilidad (obligatorias en cualquier cambio de UI)

1. Lectura fácil: frases cortas, una idea por frase.
2. Botones ≥ 64×64 px, espaciado ≥ 16 px.
3. Alto contraste (mínimo AA de WCAG).
4. Audio solo cuando el diseño de la actividad lo requiere (botón 🔊 +
   `App.tts.speak()`), no como regla general para cada texto.
5. Sin presión: sin temporizadores, puntuación negativa ni "game over".
6. Refuerzo positivo al acertar: `App.feedback.success()`.
7. Respeta `prefers-reduced-motion`.
8. Navegación completa por teclado.
9. ARIA en botones de icono y zonas de feedback.
10. Máximo 4–6 opciones por pantalla.
11. Preguntas tipo quiz: máximo 3 opciones, siempre con explicación.
12. Ritmo socrático ante errores: pista antes que la respuesta, ánimo
    nunca castigo (`App.feedback.encourage()` /
    `App.feedback.lockUntilAck()`), reintentos ilimitados.
13. Progresión gradual: cada nivel cambia solo una variable cada vez.

## 7. Criterios de éxito

Un cambio en Calculia se considera exitoso cuando:

1. **Mantiene la autonomía**: la persona usuaria puede seguir usando la
   app sin ayuda externa para esa actividad.
2. **Es accesible**: cumple WCAG AA y las 13 reglas de §6.
3. **No introduce presión**: no hay contadores ni castigos nuevos.
4. **Funciona offline**: la app sigue siendo usable sin conexión.
5. **Respeta la privacidad**: no se recoge ningún dato personal nuevo.
6. **Mantiene la paridad ES/EN**: cualquier texto nuevo aparece en
   ambos idiomas.
7. **No rompe actividades existentes**: las actividades existentes
   siguen funcionando igual.
8. **Ancla el contenido nuevo en algo real cuando sea posible** (§3.6)
   y evita ejemplos que usan símbolos o reglas fuera de lo que la
   actividad ya ha enseñado.
9. **Evita los patrones de mercado prohibidos** del §3.7 (escasez,
   falsa urgencia, prueba social como presión, FOMO, dark patterns,
   aversión explotadora a la pérdida).

## 8. Lo que Calculia NO hace

Decisiones explícitas que pueden sorprender — están aquí para que no se
"sugieran" en el futuro:

| NO | Por qué |
|----|---------|
| No tiene cuenta de usuario | Privacidad y simplicidad |
| No guarda datos en la nube | Privacidad y offline-first |
| No tiene ranking ni comparativas | Sin presión, sin frustración |
| No usa notificaciones push | No introduce presión ni dependencias externas |
| No tiene compras integradas | Es y será gratis |
| No muestra publicidad | Sin ánimo de lucro |
| No recoge analítica | Privacidad |
| No tiene chatbot ni IA generativa | Determinismo, accesibilidad y predictibilidad |
| No usa redes sociales | Privacidad y foco |
| No usa mensajes de escasez, falsa urgencia ni FOMO ("solo te queda 1", "date prisa", "no pierdas tu racha") | Presión; choca con `§3.2` y `§3.7` |
| No usa prueba social como presión (rankings, posiciones, "otros ya lo han hecho") | Presión y desánimo; choca con `§3.1` y `§3.7` |
| No usa dark patterns (registros forzados, casillas premarcadas, costes ocultos, alertas falsas) | Confianza y accesibilidad; choca con `§3.4` y `§3.7` |
| No resta estrellas ni progreso como castigo | El producto solo suma, nunca resta (`§3.1`, principio 6) |
| No usa ejemplos "significativos" con símbolos o reglas que la actividad todavía no ha enseñado | Rompe la progresión gradual (`§6`, regla 13) y la lectura fácil (`§3.3`) |

## 9. Política de idioma

La interfaz es bilingüe (`es`/`en`); `es` es el idioma por defecto y la
fuente de la verdad cuando falta una clave. Los cambios de contenido de
producto (datos de actividades, textos de interfaz) deben publicarse en
ambos idiomas — ver [detalles de i18n en `tecnico.md`](tecnico.md).
El código (identificadores, comentarios, mensajes de commit) siempre en
inglés.

## 10. Cómo está organizado este documento

Este SPEC.md es la **definición del producto**: QUÉ, PARA QUIÉN y POR
QUÉ. El resto de la documentación cubre el CÓMO — arquitectura técnica
y API compartida en [`tecnico.md`](tecnico.md).
