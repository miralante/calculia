/* ============================================================
   Datos: Puzzle (razonamiento — recomponer una imagen).
   Formato: DATA[locale].niveles = [{ id, descripcion, estrellas,
     filas, columnas, images: [{ nombre, cells: string[] }] }]
   'celdas' tiene tantos pictos como filas x columnas, en el orden
   correcto (fila a fila). Los pictos son iconos y no cambian entre
   idiomas; solo se traducen los nombres visibles. Para ampliar:
   añadir imágenes al nivel del idioma correspondiente.
   app.js usa DATA[App.i18n.locale()] || DATA.es.
   ============================================================ */
const DATA = {
  es: {
    levels: [
      {
        id: 1,
        descripcion: '4 piezas',
        estrellas: 1,
        filas: 2,
        columnas: 2,
        images: [
          { nombre: 'Paisaje', cells: ['☀️', '☁️', '🌳', '🌸'] },
          { nombre: 'Frutas', cells: ['🍎', '🍌', '🍇', '🍊'] },
          { nombre: 'Animales', cells: ['🐶', '🐱', '🐰', '🐻'] },
          { nombre: 'Caras', cells: ['😀', '😺', '🐵', '🐸'] }
        ]
      },
      {
        id: 2,
        descripcion: '6 piezas',
        estrellas: 2,
        filas: 2,
        columnas: 3,
        images: [
          { nombre: 'Cocina', cells: ['🍎', '🍌', '🍞', '🧀', '🥕', '🥛'] },
          { nombre: 'Selva', cells: ['🐒', '🦁', '🐘', '🐍', '🦜', '🐆'] },
          { nombre: 'Cielo', cells: ['☀️', '🌙', '⭐', '☁️', '🌈', '⚡'] },
          { nombre: 'Mar', cells: ['🐟', '🐙', '🦀', '🐠', '🐬', '🦈'] }
        ]
      },
      {
        id: 3,
        descripcion: '9 piezas',
        estrellas: 3,
        filas: 3,
        columnas: 3,
        images: [
          { nombre: 'Granja', cells: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐓', '🐐', '🦆', '🐕'] },
          { nombre: 'Frutas variadas', cells: ['🍎', '🍌', '🍇', '🍊', '🍉', '🍓', '🍑', '🍒', '🥝'] },
          { nombre: 'Espacio', cells: ['🌍', '🌙', '⭐', '🚀', '☄️', '🪐', '👽', '🛰️', '🌟'] },
          { nombre: 'Ciudad', cells: ['🏠', '🏢', '🚗', '🚌', '🚦', '🌳', '🏪', '🚲', '👥'] }
        ]
      }
    ]
  },
  en: {
    levels: [
      {
        id: 1,
        descripcion: '4 pieces',
        estrellas: 1,
        filas: 2,
        columnas: 2,
        images: [
          { nombre: 'Landscape', cells: ['☀️', '☁️', '🌳', '🌸'] },
          { nombre: 'Fruits', cells: ['🍎', '🍌', '🍇', '🍊'] },
          { nombre: 'Animals', cells: ['🐶', '🐱', '🐰', '🐻'] },
          { nombre: 'Faces', cells: ['😀', '😺', '🐵', '🐸'] }
        ]
      },
      {
        id: 2,
        descripcion: '6 pieces',
        estrellas: 2,
        filas: 2,
        columnas: 3,
        images: [
          { nombre: 'Kitchen', cells: ['🍎', '🍌', '🍞', '🧀', '🥕', '🥛'] },
          { nombre: 'Jungle', cells: ['🐒', '🦁', '🐘', '🐍', '🦜', '🐆'] },
          { nombre: 'Sky', cells: ['☀️', '🌙', '⭐', '☁️', '🌈', '⚡'] },
          { nombre: 'Sea', cells: ['🐟', '🐙', '🦀', '🐠', '🐬', '🦈'] }
        ]
      },
      {
        id: 3,
        descripcion: '9 pieces',
        estrellas: 3,
        filas: 3,
        columnas: 3,
        images: [
          { nombre: 'Farm', cells: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐓', '🐐', '🦆', '🐕'] },
          { nombre: 'Mixed fruits', cells: ['🍎', '🍌', '🍇', '🍊', '🍉', '🍓', '🍑', '🍒', '🥝'] },
          { nombre: 'Space', cells: ['🌍', '🌙', '⭐', '🚀', '☄️', '🪐', '👽', '🛰️', '🌟'] },
          { nombre: 'City', cells: ['🏠', '🏢', '🚗', '🚌', '🚦', '🌳', '🏪', '🚲', '👥'] }
        ]
      }
    ]
  }
};
