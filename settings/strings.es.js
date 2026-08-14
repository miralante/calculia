/* ============================================================
   Calculia — Textos de Ajustes (ES)
   Archivo específico del idioma. Se carga condicionalmente
   desde index.html según App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⚙️ Calculia — Ajustes',
    routeNotice: 'Página de ajustes. No aparece en el menú de la aplicación: solo se llega escribiendo esta dirección.',
    intro: 'Aquí se puede borrar lo guardado en este navegador. Pensada para quien gestiona el dispositivo (familia, profesorado), no para la persona usuaria.',

    stateTitle: 'Estado actual de este navegador',
    currentLanguage: 'Idioma actual: {lang}',
    languageNameEs: 'Español',
    languageNameEn: 'English',
    activitiesWithProgress: 'Actividades con progreso guardado: {n}',
    totalStars: 'Estrellas totales: {n}',

    progressTitle: 'Progreso por actividad',
    progressIntro: 'Estrellas ⭐ guardadas en este navegador, actividad por actividad. "Sin empezar" quiere decir que la persona todavía no ha jugado a esa actividad en este dispositivo.',
    notStarted: 'Sin empezar',
    colActivity: 'Actividad',
    colProgress: 'Progreso',

    module1: '🧮 Matemáticas',
    module2: '🧩 Razonamiento y lógica',

    activity: {
      'numbers': 'Los Números', 'fractions-measures': 'Fracciones y Medidas',
      'mental-math': 'Restar y Cálculo Mental', 'money': 'Dinero',
      'quantities': 'Cantidades', 'math-tables': 'Las Tablas',
      'roman-numerals': 'Números Romanos', 'riddles': 'Adivinanzas', 'patterns': 'Patrones',
      'wallet': 'El Monedero', 'clock': 'El Reloj', 'stories': 'Historias',
      'odd-one-out': '¿Qué no encaja?', 'puzzle': 'Puzzle'
    },

    resetPersonTitle: 'Restablecer los datos de la persona',
    resetPersonIntro: 'Borra el idioma elegido (la próxima vez se detecta de nuevo o se vuelve a español).',
    resetPersonNote1: 'El progreso (estrellas y niveles guardados) de todas las actividades ',
    resetPersonNoteStrong: 'NO se borra',
    resetPersonNote2: '.',
    btnResetPerson: '🧑 Restablecer datos de la persona',
    confirmResetPerson: '¿Seguro? Toca otra vez para borrar el idioma.',
    feedbackResetPersonDone: 'Hecho. Idioma borrado. El progreso se ha conservado.',

    resetAppTitle: 'Restablecer toda la aplicación',
    resetAppIntro1: 'Borra ',
    resetAppIntroStrong: 'todo',
    resetAppIntro2: ' lo guardado en este navegador: idioma, estrellas y niveles completados de todas las actividades.',
    resetAppNoteStrong: 'No se puede deshacer.',
    resetAppNote2: ' Es como si la aplicación se abriera por primera vez.',
    btnResetApp: '🗑️ Restablecer toda la aplicación',
    confirmResetApp: '¿Seguro? Toca otra vez para borrar TODO. No se puede deshacer.',
    feedbackResetAppDone: 'Hecho. Se ha borrado todo. La aplicación queda como recién instalada.',

    footerActivities: 'Ir a las actividades'
  }, 'es');
})();
