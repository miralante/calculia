/* ============================================================
   Datos: La Oca (juego de mesa en solitario — dado y casillas).
   Formato: DATA[locale].niveles = [{ id, nombre, descripcion, estrellas,
     casillas (número total, la última es la meta) }]
   Las casillas con regalo NO se guardan aquí: app.js las calcula a
   partir de 'casillas' (especialesDe(), una cada 3 a partir de la 4ª)
   para que 'casillas' sea la única variable de dificultad por nivel
   (regla 13 — progresión de un solo cambio).
   Las caras del dado son símbolos y no cambian entre idiomas.
   Para ampliar: añadir un tablero nuevo al array del idioma
   correspondiente. app.js usa DATA[App.i18n.locale()] || DATA.es.
   ============================================================ */
const DATA = {
  es: {
    caras: ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'],
    niveles: [
      { id: 1, nombre: 'Tablero corto', descripcion: '10 casillas', estrellas: 1, casillas: 10 },
      { id: 2, nombre: 'Tablero medio', descripcion: '15 casillas', estrellas: 2, casillas: 15 },
      { id: 3, nombre: 'Tablero largo', descripcion: '20 casillas', estrellas: 3, casillas: 20 }
    ]
  },
  en: {
    caras: ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'],
    niveles: [
      { id: 1, nombre: 'Short board', descripcion: '10 squares', estrellas: 1, casillas: 10 },
      { id: 2, nombre: 'Medium board', descripcion: '15 squares', estrellas: 2, casillas: 15 },
      { id: 3, nombre: 'Long board', descripcion: '20 squares', estrellas: 3, casillas: 20 }
    ]
  }
};
