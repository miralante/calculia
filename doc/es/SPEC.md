# Especificación de producto

> Fuente canónica del alcance de producto, la audiencia y las reglas no
> negociables. La arquitectura técnica vive en [`tecnico.md`](tecnico.md).

## 1. Qué es Calculia

Una aplicación web gratuita y estática con 27 actividades para practicar
cálculo y razonamiento lógico:

- **Matemáticas**: Sitios y tamaños, Los Números, Formas, Geometría, Formas parecidas, Fracciones, Medidas, Restar y
  Cálculo Mental, Dinero, Porcentajes, Las Tablas, Grupos exactos, Cuentas grandes,
  Cantidades, Números Romanos,
  Problemas, Temperatura del agua.
- **Razonamiento y lógica**: Adivinanzas, Patrones, El Monedero, La balanza, Datos
  y gráficos, El Calendario, El Reloj, Historias, ¿Qué no encaja?, Puzzle.

Calculia es una de las apps de la suite Miralante, junto a Apptonomia
(la suite original, más amplia, de actividades de terapia ocupacional
de la que se escindieron las demás): el alcance de Calculia es cálculo
y razonamiento específicamente, no los 6 juegos de mesa clásicos
(ajedrez, damas, dominó, tres en raya, sudoku visual, conecta 4) que
forman parte del catálogo de actividades de Apptonomia. Comparte el
lenguaje de diseño centrado en accesibilidad de Apptonomia (lectura
fácil, sin presión, alto contraste, objetivos táctiles grandes) porque
ese diseño sirve a cualquiera que practique matemáticas o lógica, no
solo a la audiencia para la que se construyó Apptonomia originalmente.

## 2. Audiencia

Cualquier persona que practique cálculo o razonamiento lógico:
estudiantes y, en particular, personas que se benefician de la lectura
fácil, un ritmo sin presión y pantallas predecibles y sin ruido visual.
Usable de forma **autónoma**, sin que un profesor o familiar tenga que
estar al lado de quien aprende. Funciona igual en escritorio y en
móvil/tablet — sin restricción de dispositivo, a diferencia de la app
de la suite Teclatlon (solo teclado de ordenador).

## 3. Restricciones no negociables (de producto)

Estas restricciones vienen del **producto**, no son técnicas. Son las
"leyes" que nunca se rompen porque definen qué tipo de experiencia
ofrece Calculia. Calculia comparte esta constitución con la otra app
de la suite Apptonomia (ver el `SPEC.md` de Apptonomia) — están
adaptadas a que Calculia practica cálculo y razonamiento, no
habilidades de vida diaria ni terapia ocupacional.

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

La accesibilidad cognitiva es un principio rector: todo el contenido
sigue las pautas de **lectura fácil** y la norma **UNE 153101:2018 EX**
(estándar español de lectura fácil), alineada con las pautas europeas
de Inclusion Europe. La comprensión prevalece sobre la precisión
técnica expresada con dificultad.

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
- Alto contraste (WCAG AA mínimo, AAA cuando sea posible) — ver §5
  para los criterios AAA que este proyecto honra y por qué la
  conformidad AAA completa no es viable para una aplicación web.
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

#### Enseñar antes de preguntar

Una actividad que solo pregunta **evalúa, no enseña**. Quien ya sabe la
respuesta acierta; quien no la sabe falla y sigue sin saberla. Por eso
una actividad debería ofrecer, antes de la primera pregunta:

1. **Para qué sirve** esto fuera de la app (una frase, clave
   `contexto`).
2. **La regla o la referencia**, en una pantalla propia: la tabla, el
   esquema o el ejemplo resuelto del que sale la respuesta.
3. **La práctica**, solo después.

La pantalla de referencia **no desaparece al empezar**: se puede volver
a abrir durante la ronda, y volver de ella no reinicia la partida.
Sostener la regla a la vista no es hacer trampa — memorizarla no es el
objetivo, usarla sí.

Referencias en el código: Números Romanos (`introScreen` →
`famousScreen` → `reminderScreen` → quiz, con la tabla I/V/X como pista
permanente), El Reloj (`screenLearn`, con cada aguja de un color y su
etiqueta) y Las Tablas (`screenLearn`, la tabla con puntos antes de
practicarla).

Cuando el color codifique la referencia (una aguja, una letra, una
cifra), nunca puede ser la única pista: la forma, la longitud o el texto
deben decir lo mismo (regla 1.4.1, ver §6.1).

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

### 3.8 Anatomía socrática completa (pregunta → pista → explicación → transferencia)

Cada actividad de Calculia cierra su ciclo de aprendizaje con la
misma secuencia de cuatro elementos. Es el contrato de "anatomía
socrática completa" que toda actividad debe respetar; cualquier
nueva actividad o actividad modificada debe mantener los cuatro
pasos, en este orden, y con la misma función pedagógica.

1. **Pregunta** — la actividad formula la pregunta o el reto
   concreto de la pantalla. Es el primer elemento visible durante
   la ronda.
2. **Pista** — cuando se falla la primera vez, la actividad muestra
   una pista que **no revela la respuesta**. Esta pista es la voz
   socrática: guía una idea, una pauta o un paso que la persona
   puede probar antes de volver a intentarlo. La pista se publica
   en el lugar de la explicación (sustituyéndola) y se desbloquea
   la explicación completa solo a partir del segundo fallo
   (regla 12 de §6). La pista nunca se construye como respuesta
   escondida: no dice "es 7", dice "cuenta otra vez despacio".
3. **Explicación** — cuando se acierta, o cuando se falla la
   segunda vez, la actividad publica la explicación de por qué la
   respuesta correcta es esa: la regla, la operación, la analogía
   o el detalle que permite entenderla. La explicación se publica
   en el lugar de la pista tras acierto o segundo fallo, y se
   mantiene visible hasta la siguiente pregunta.
4. **Transferencia** — al cerrar la ronda (`screenEnd` /
   `screenFinish`), la actividad incluye una frase de
   **transferencia** que conecta lo practicado con la vida real:
   dónde se usará lo aprendido más allá de la app ("esto te
   servirá para…"). La transferencia no es opcional: si aporta
   valor, debe estar; si la actividad no encuentra un caso real,
   se documenta en `doc/en/technical.md` por qué esa actividad
   concreta prescinde de ella.

#### Contenido del cierre

El cierre de cada actividad muestra, en este orden, el resumen de la ronda,
la explicación de lo practicado y una frase de transferencia que conecta el
aprendizaje con una situación real. La transferencia puede no aplicarse solo
cuando no aporta valor; la razón debe quedar documentada.

La forma técnica de implementar esta anatomía, sus claves de contenido y su
cobertura por actividad están en [`tecnico.md`](tecnico.md).

#### Cobertura por actividad (estado actual)

Esta tabla la mantiene el agente cuando aplica la anatomía. La
columna "Cierre" indica si la pantalla final pinta los cuatro
bloques en el orden correcto:

| Actividad | contexto | pista | explicacion | transferencia | Cierre |
|---|---|---|---|---|---|
| clock            | ✅ | ✅ | ✅ | ✅ | ✅ |
| fractions-measures | ✅ | ✅ | ✅ | ✅ | ✅ |
| math-tables      | ✅ | ✅ | ✅ | ✅ | ✅ |
| mental-math      | ✅ | ✅ | ✅ | ✅ | ✅ |
| money            | ✅ | ✅ | ✅ | ✅ | ✅ |
| numbers          | ✅ | ✅ | ✅ | ✅ | ✅ |
| odd-one-out      | ✅ | ✅ | ✅ | ✅ | ✅ |
| patterns         | ✅ | ✅ | ✅ | ✅ | ✅ |
| riddles          | ✅ | ✅ | ✅ | ✅ | ✅ |
| roman-numerals   | ✅ | ✅ | ✅ | ✅ | ✅ |
| stories          | ✅ | ✅ | ✅ | ✅ | ✅ |
| temperature      | ✅ | ✅ | ✅ | ✅ | ✅ |
| wallet           | ✅ | ✅ | ✅ | ✅ | ✅ |
| puzzle           | — | — | ✅ | ✅ | ✅ |
| quantities       | ✅ | ✅ | ✅ | ✅ | ✅ |

> El guion largo `—` en Puzzle significa "no aplicable": la
> actividad es espacial y no tiene pregunta con respuesta correcta
> / incorrecta, por lo que no hay pista socrática en el sentido de
> §3.8. En su lugar, `contexto` + `explicacion` cubren la
> transferencia sin la pista.

Esta tabla es la fuente de verdad para "anatomía socrática
completa". Si una actividad deja de cumplirla, esta tabla se
actualiza en el mismo PR que introduce o corrige la regresión.

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

### 4.1 Eufemismo público: "persona tipo"

Cuando se presenta Calculia de cara al **público general** (prensa,
charlas, READMEs públicos que cualquiera pueda leer, el portal
`apptonomia.uk`, notas en redes sociales, marketing), el término
"discapacidad intelectual" **no debe usarse** para describir la
audiencia de la app, ni siquiera cuando el texto que lo rodea sería
público. El eufemismo aceptado en esas superficies para referirse a la
audiencia es **"persona tipo"** (plural "personas tipo"),
entendido como marcador genérico de perfil, no como etiqueta para
ninguna persona real.

Dónde se aplica y dónde no:

- **Se aplica** a cualquier texto que cualquier persona ajena al
  proyecto pueda leer sin autenticarse: `README.es.md`, `README.md`,
  el portal en `apptonomia.uk`, charlas públicas, copy en redes, notas
  de prensa, material de marketing. En estas superficies se habla de
  la audiencia como "la persona tipo" o "las personas tipo"
  de la app.
- **No se aplica** a la documentación interna de este repositorio
  (`CLAUDE.md`, `doc/es/spec.md`, `doc/en/spec.md`, `tecnico.md`,
  [`roles.md`](roles.md), `CONTRIBUTING.es.md`, `CONTRIBUTING.md`) —
  esos archivos los lee quien mantiene o contribuye al proyecto, y
  "discapacidad intelectual" sigue siendo allí el término canónico,
  porque el proyecto necesita explicar sin ambigüedad su objetivo real
  a quien lo mantiene.
- **No se aplica** al contenido del proyecto que nombra un concepto
  clínico por su nombre real (p. ej. una actividad que practica cálculos
  sobre un trámite administrativo real relacionado con discapacidad):
  eso es contenido, no etiquetado de la audiencia.
- **No se aplica** a la UI de la propia app: la regla de §4 sigue
  prohibiendo **cualquier** mención, incluida "persona tipo", en
  `site/index.html`, `tools/<slug>/index.html`, `app.js`, `data.js`,
  `strings.<locale>.js`, `settings/`, `legal/` y cualquier otra
  superficie visible. El eufemismo es para el exterior, no para lo que
  lee quien visita la app.

Razón: presentar el objetivo real del proyecto en documentación interna
es útil y necesario; presentarlo en superficies de marketing o landing
no es necesario ni respetuoso con la audiencia — "persona tipo"
permite describir en público para qué sirve la app (qué perfil tiene
quien la usa) sin nombrar públicamente un grupo clínico.

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

### Indicador de progreso

La barra de progreso de las actividades se diseña como una cápsula
horizontal compacta: el avance se muestra mediante el relleno de la
barra y el contador breve (`actual / total`) aparece centrado dentro de
ella, superpuesto al relleno. No se utiliza una frase separada del tipo
«X de Y», para reservar espacio visual a la actividad. El contador sigue
siendo dinámico y accesible para tecnologías de asistencia.

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

### 6.1 Baseline WCAG AAA (común a toda la suite)

Este proyecto cumple WCAG 2.1 en **AA mínimo** y adopta los **criterios
AAA aplicables al público de la suite** cuando es viable. La conformidad
AAA completa no es factible para toda una aplicación web (el propio W3C
señala que AAA está pensado para contextos específicos); los criterios
AAA que sí son aplicables y que este proyecto honra son:

- **1.4.6 Contraste (mejorado)** — contraste de texto ≥ 7:1 (texto
  grande ≥ 4.5:1). AA (4.5:1) es el suelo legal; AAA es el objetivo
  de diseño.
- **3.1.5 Nivel de lectura** — cuando el contenido es para el público
  general, no exige capacidad lectora avanzada. Ya se cumple a través
  de UNE 153101 (ver `CLAUDE.md` §"UNE 153101 reference (suite-wide)")
  y de las pautas europeas de lectura fácil de Inclusion Europe.
- **1.4.1 Uso del color** — el color nunca es el único medio para
  transmitir información. Cada estado de feedback (acierto / pista /
  error / bloqueo) usa también forma, icono, texto o sonido, para no
  excluir a personas con dificultades de visión cromática.

La lista completa, la justificación y lo que queda explícitamente
fuera del alcance de una aplicación web general viven en `CLAUDE.md`
§"WCAG AAA baseline (suite-wide)".

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
| No exige pericia de resolución simbólica en los contenidos avanzados de la ESO (álgebra, trigonometría, funciones, geometría analítica...) | Esos contenidos se presentan como concepto aplicado, no como destreza a dominar — ver `§8.1` |

### 8.1 Alcance curricular: el currículo completo, con distinta ambición según el nivel

**El punto de partida es un derecho, no una concesión.** Lo que busca
Calculia es la **igualdad de oportunidades y el mismo derecho a adquirir
conocimiento** que tiene cualquier persona sin dificultades de
aprendizaje. Que la usuaria o el usuario tipo tenga discapacidad
intelectual no es motivo para ofrecerle un currículo recortado: es
motivo para diseñar con más cuidado cómo se le presenta ese currículo
completo. El repositorio guarda el temario de referencia de Matemáticas
de 1º de Primaria a 4º de ESO en [`curriculum/`](../../curriculum/);
Calculia se compromete a cubrirlo entero, tarde o temprano. El listado
concreto de qué está hecho y qué falta vive en [`TODO.md`](../../TODO.md)
(raíz del repositorio) y se mantiene al día conforme se implementan
actividades.

**Pero cubrir el currículo no significa exigir pericia en todo él.**
Para esta audiencia, no tiene sentido pretender que alguien domine
ecuaciones de segundo grado o funciones logarítmicas del mismo modo que
domina sumar. Lo que Calculia promete varía según el contenido, en dos
niveles de ambición:

1. **Cimientos** — aritmética básica: contar, sumar y restar, valor
   posicional, los números ancla (1, 5, 10), resolución de problemas
   sencillos con apoyo visual. Aquí el objetivo **sí es el dominio**:
   práctica progresiva, paciente, hasta que la persona lo hace con
   soltura. Es la base sin la cual nada más tiene sentido.
2. **Conceptos** — todo lo demás: geometría, fracciones y decimales más
   allá de lo básico, estadística, probabilidad, proporcionalidad, y
   los contenidos abstractos de la ESO (álgebra, trigonometría,
   funciones, geometría analítica, combinatoria...). Aquí el objetivo
   **no es el dominio, es la exposición accesible**: presentar qué es
   la idea y, siempre que sea posible, para qué sirve, en lectura
   fácil, sin exigir manejo simbólico ni procedimientos de cálculo.
   Trigonometría se presenta como "¿qué rampa está más inclinada?" con
   una comparación visual, nunca como calcular un seno o un coseno;
   álgebra se presenta como una balanza que hay que mantener
   equilibrada, nunca como manipular símbolos.

**"Cimientos primero" describe el orden de trabajo, no el alcance.** No
tiene sentido avanzar en el temario mientras el cálculo básico no esté
asentado — por eso las actividades de cimientos se implementan primero
— pero eso ya no significa que el resto quede fuera del compromiso:
significa que le llega después, y con la ambición de "concepto" en vez
de "dominio".

**Cada paso con apoyo visual.** La cantidad se dibuja, no solo se
escribe: una barra de diez puntos es una decena, un punto suelto es una
unidad, y lo que se quita lleva una cruz. Ver la cantidad es parte de la
explicación, no un adorno. Referencia en el código: `tools/mental-math/`
(actividad `anchors`).

**Cada actividad tiene un trabajo, y solo uno.** La escalera aritmética
de cimientos pertenece a las **actividades de aritmética**
(`tools/mental-math/`, `tools/math-tables/`); no se reparte por el resto
del catálogo. Meter cuentas en una actividad que no va de cuentas le
quita sitio a lo que sí enseña y añade una dificultad que no venía al
caso.

El caso claro es el **ascensor** (actividad `positivos-y-negativos` en
`tools/numbers/`): está ahí para **entender los números positivos y
negativos**, y nada más. Las plantas bajo el suelo son negativas, la
planta baja es el 0, las de arriba positivas; la persona sube y baja y
ve cómo cambia el número al cruzar el cero. **No plantea operaciones ni
preguntas de opción múltiple**, y no debe hacerlo: su valor está en que
el número negativo se vuelva un sitio al que se puede ir, no un símbolo
que hay que calcular.

**Nunca una llevada antes de tiempo.** En los niveles de ancla, los
números se eligen para que la operación no cruce la decena: al sumar,
las unidades tienen sitio; al restar, hay bastante que quitar. Así el
único cambio entre un nivel y el siguiente es el ancla (regla 13).

Un contenido en nivel "concepto" sigue estando sujeto a todas las
demás reglas de este documento — lectura fácil (`§3.3`), progresión
gradual (`§6`, regla 13), método socrático (`§3.8`) — solo cambia lo que
se espera que la persona sea capaz de hacer al final: reconocer y
relacionar la idea, no ejecutar el procedimiento formal.

**Nada de esto se le nombra a quien usa la app.** El currículo decide en
qué orden se construyen y se muestran las actividades, pero la persona no
debe encontrárselo nunca: decirle que una pantalla es "2º de Primaria" le
está diciendo que hace un ejercicio de niño, y eso sobra. En lo que se
sirve al navegador no aparecen etapas, cursos ni nombres de tema —
tampoco en los comentarios del código, que se leen con "ver código
fuente". La trazabilidad vive en [`TODO.md`](../../TODO.md) y en este
documento, que no se sirven. `scripts/check.js` (punto 6.1) lo comprueba
en cada cambio.

Los niveles se nombran por lo que se hace en ellos ("Hasta 10", "Sumar
5", "Con menos marcas"), nunca por el curso al que pertenecen.

Cuando una actividad cubra un contenido curricular, conviene que su
documentación lo diga, para que el hueco de cobertura sea visible sin
tener que leer el código.

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
