# Especificación de producto

> Fuente canónica del alcance de producto, la audiencia y las reglas no
> negociables. La arquitectura técnica vive en [`tecnico.md`](tecnico.md).

## 1. Qué es Calculia

Una aplicación web gratuita y estática con 12 actividades para practicar
cálculo y razonamiento lógico:

- **Matemáticas**: Los Números, Cantidades, Las Tablas, Números Romanos.
- **Razonamiento y lógica**: Adivinanzas, Patrones, El Monedero, El
  Reloj, Historias, ¿Qué no encaja?, Puzzle, La Oca.

Calculia se separó de Apptonomia, una suite más amplia de actividades de
terapia ocupacional, donde estas actividades vivían en un único módulo
"Pensar y contar" junto a 6 juegos de mesa clásicos. Los juegos de mesa
(ajedrez, damas, dominó, tres en raya, sudoku visual, conecta 4) se
quedaron en Apptonomia; el alcance de Calculia es cálculo y razonamiento
específicamente. Conserva el lenguaje de diseño centrado en accesibilidad
de Apptonomia (lectura fácil, sin presión, alto contraste, objetivos
táctiles grandes) porque ese diseño sirve a cualquiera que practique
matemáticas o lógica, no solo a la audiencia para la que se construyó
Apptonomia originalmente.

## 2. Audiencia

Cualquier persona que practique cálculo o razonamiento lógico:
estudiantes y, en particular, personas que se benefician de la lectura
fácil, un ritmo sin presión y pantallas predecibles y sin ruido visual.
Usable de forma **autónoma**, sin que un profesor o familiar tenga que
estar al lado de quien aprende. Funciona igual en escritorio y en
móvil/tablet — sin restricción de dispositivo, a diferencia del proyecto
hermano Teclatlon (solo teclado de ordenador).

## 3. Principios no negociables

1. **Autonomía** — usable sin que un profesional o familiar esté presente.
2. **Sin presión** — sin temporizadores, sin puntuación negativa, sin
   "game over". Los errores reciben un mensaje de ánimo y reintentos
   ilimitados.
3. **Privacidad** — sin login, sin cookies, sin analítica, sin servidor.
   Los únicos datos guardados (progreso, preferencia de idioma) viven en
   el `localStorage` de este navegador y nunca salen del dispositivo. Ver
   [`legal/`](../../legal/index.html).
4. **Lectura fácil** — frases cortas, una idea por frase, lenguaje llano,
   sin jerga clínica o técnica en nada que lea quien aprende.
5. **Accesibilidad** — botones ≥ 64×64 px, espaciado ≥ 16 px, contraste
   AA de WCAG, navegación completa por teclado, ARIA en botones de icono
   y zonas de feedback, respeta `prefers-reduced-motion`.
6. **Tecnología sobria** — HTML5 + CSS3 + JavaScript vanilla, sin
   frameworks, sin paso de build, sin dependencias npm, PWA offline-first.

## 4. Reglas de accesibilidad (obligatorias en cualquier cambio de UI)

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

## 5. Política de idioma

La interfaz es bilingüe (`es`/`en`); `es` es el idioma por defecto y la
fuente de la verdad cuando falta una clave. Los cambios de contenido de
producto (datos de actividades, textos de interfaz) deben publicarse en
ambos idiomas — ver [detalles de i18n en `tecnico.md`](tecnico.md).
El código (identificadores, comentarios, mensajes de commit) siempre en
inglés.
