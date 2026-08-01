/* ============================================================
   Datos: Puzzle (razonamiento — recomponer una imagen).
   Formato: DATA[locale].niveles = [{ id, nombre, descripcion, estrellas,
     filas, columnas, imagenes: [{ nombre, celdas: string[] }] }]
   'celdas' tiene tantos pictos como filas x columnas, en el orden
   correcto (fila a fila). Los pictos son iconos y no cambian entre
   idiomas; solo se traducen los nombres visibles. Para ampliar:
   añadir imágenes al nivel del idioma correspondiente.
   app.js usa DATA[App.i18n.locale()] || DATA.es.
   ============================================================ */
const DATA = {
  es: {
    niveles: [
      {
        id: 1,
        nombre: 'Nivel 1',
        descripcion: '4 piezas',
        estrellas: 1,
        filas: 2,
        columnas: 2,
        imagenes: [
          { nombre: 'Paisaje', celdas: ['☀️', '☁️', '🌳', '🌸'] },
          { nombre: 'Frutas', celdas: ['🍎', '🍌', '🍇', '🍊'] },
          { nombre: 'Animales', celdas: ['🐶', '🐱', '🐰', '🐻'] },
          { nombre: 'Caras', celdas: ['😀', '😺', '🐵', '🐸'] }
        ]
      },
      {
        id: 2,
        nombre: 'Nivel 2',
        descripcion: '6 piezas',
        estrellas: 2,
        filas: 2,
        columnas: 3,
        imagenes: [
          { nombre: 'Cocina', celdas: ['🍎', '🍌', '🍞', '🧀', '🥕', '🥛'] },
          { nombre: 'Selva', celdas: ['🐒', '🦁', '🐘', '🐍', '🦜', '🐆'] },
          { nombre: 'Cielo', celdas: ['☀️', '🌙', '⭐', '☁️', '🌈', '⚡'] },
          { nombre: 'Mar', celdas: ['🐟', '🐙', '🦀', '🐠', '🐬', '🦈'] }
        ]
      },
      {
        id: 3,
        nombre: 'Nivel 3',
        descripcion: '9 piezas',
        estrellas: 3,
        filas: 3,
        columnas: 3,
        imagenes: [
          { nombre: 'Granja', celdas: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐓', '🐐', '🦆', '🐕'] },
          { nombre: 'Frutas variadas', celdas: ['🍎', '🍌', '🍇', '🍊', '🍉', '🍓', '🍑', '🍒', '🥝'] },
          { nombre: 'Espacio', celdas: ['🌍', '🌙', '⭐', '🚀', '☄️', '🪐', '👽', '🛰️', '🌟'] },
          { nombre: 'Ciudad', celdas: ['🏠', '🏢', '🚗', '🚌', '🚦', '🌳', '🏪', '🚲', '👥'] }
        ]
      }
    ]
  },
  en: {
    niveles: [
      {
        id: 1,
        nombre: 'Level 1',
        descripcion: '4 pieces',
        estrellas: 1,
        filas: 2,
        columnas: 2,
        imagenes: [
          { nombre: 'Landscape', celdas: ['☀️', '☁️', '🌳', '🌸'] },
          { nombre: 'Fruits', celdas: ['🍎', '🍌', '🍇', '🍊'] },
          { nombre: 'Animals', celdas: ['🐶', '🐱', '🐰', '🐻'] },
          { nombre: 'Faces', celdas: ['😀', '😺', '🐵', '🐸'] }
        ]
      },
      {
        id: 2,
        nombre: 'Level 2',
        descripcion: '6 pieces',
        estrellas: 2,
        filas: 2,
        columnas: 3,
        imagenes: [
          { nombre: 'Kitchen', celdas: ['🍎', '🍌', '🍞', '🧀', '🥕', '🥛'] },
          { nombre: 'Jungle', celdas: ['🐒', '🦁', '🐘', '🐍', '🦜', '🐆'] },
          { nombre: 'Sky', celdas: ['☀️', '🌙', '⭐', '☁️', '🌈', '⚡'] },
          { nombre: 'Sea', celdas: ['🐟', '🐙', '🦀', '🐠', '🐬', '🦈'] }
        ]
      },
      {
        id: 3,
        nombre: 'Level 3',
        descripcion: '9 pieces',
        estrellas: 3,
        filas: 3,
        columnas: 3,
        imagenes: [
          { nombre: 'Farm', celdas: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐓', '🐐', '🦆', '🐕'] },
          { nombre: 'Mixed fruits', celdas: ['🍎', '🍌', '🍇', '🍊', '🍉', '🍓', '🍑', '🍒', '🥝'] },
          { nombre: 'Space', celdas: ['🌍', '🌙', '⭐', '🚀', '☄️', '🪐', '👽', '🛰️', '🌟'] },
          { nombre: 'City', celdas: ['🏠', '🏢', '🚗', '🚌', '🚦', '🌳', '🏪', '🚲', '👥'] }
        ]
      }
    ]
  }
};
