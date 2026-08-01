/* ============================================================
   Datos: El Reloj (tiempo — leer la hora y asociarla al día).
   Formato:
   DATA.niveles = [{ id, estrellas, minutos: number[] }]
     'minutos' son los minutos que puede marcar el reloj en ese nivel.
   DATA.momentos = [{ id, picto, hora (0-23) }]
     'hora' es la hora base (formato 24h) de ese momento del día;
     el minuto exacto de cada pregunta lo decide el nivel elegido.
   Los nombres, descripciones y preguntas NO están aquí: son texto
   y viven en strings.js. Nivel: App.i18n.t('nivelNombre').replace('{n}', id)
   y App.i18n.t('nivelDescripcion.' + id). Momento:
   App.i18n.t('momento.' + id + '.nombre') / '.pregunta'.
   Para ampliar: añadir un nivel o momento nuevo con un id, y sus
   textos a strings.js (es y en).
   ============================================================ */
const DATA = {
  porRonda: 8,
  niveles: [
    { id: 1, estrellas: 1, minutos: [0] },
    { id: 2, estrellas: 2, minutos: [0, 30] },
    { id: 3, estrellas: 3, minutos: [0, 15, 30, 45] }
  ],
  momentos: [
    { id: 'desayuno', picto: '🍳', hora: 8 },
    { id: 'colegio', picto: '🏫', hora: 9 },
    { id: 'comida', picto: '🍽️', hora: 14 },
    { id: 'merienda', picto: '🍪', hora: 17 },
    { id: 'cena', picto: '🌙', hora: 21 },
    { id: 'dormir', picto: '😴', hora: 22 }
  ]
};
