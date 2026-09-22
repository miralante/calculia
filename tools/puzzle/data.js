/* ============================================================
   Datos: Puzzle (razonamiento — recomponer una imagen).
   Formato: DATA[locale].levels = [{ id, description, stars,
     rows, cols, images: [{ name, cells: string[] }] }]
   'cells' tiene tantos pictos como rows x cols, en el orden
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
        description: '4 piezas',
        stars: 1,
        rows: 2,
        cols: 2,
        images: [
          { name: 'Paisaje', cells: ['☀️', '☁️', '🌳', '🌸'] },
          { name: 'Frutas', cells: ['🍎', '🍌', '🍇', '🍊'] },
          { name: 'Animales', cells: ['🐶', '🐱', '🐰', '🐻'] },
          { name: 'Caras', cells: ['😀', '😺', '🐵', '🐸'] }
        ]
      },
      {
        id: 2,
        description: '6 piezas',
        stars: 2,
        rows: 2,
        cols: 3,
        images: [
          { name: 'Cocina', cells: ['🍎', '🍌', '🍞', '🧀', '🥕', '🥛'] },
          { name: 'Selva', cells: ['🐒', '🦁', '🐘', '🐍', '🦜', '🐆'] },
          { name: 'Cielo', cells: ['☀️', '🌙', '⭐', '☁️', '🌈', '⚡'] },
          { name: 'Mar', cells: ['🐟', '🐙', '🦀', '🐠', '🐬', '🦈'] }
        ]
      },
      {
        id: 3,
        description: '9 piezas',
        stars: 3,
        rows: 3,
        cols: 3,
        images: [
          { name: 'Granja', cells: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐓', '🐐', '🦆', '🐕'] },
          { name: 'Frutas variadas', cells: ['🍎', '🍌', '🍇', '🍊', '🍉', '🍓', '🍑', '🍒', '🥝'] },
          { name: 'Espacio', cells: ['🌍', '🌙', '⭐', '🚀', '☄️', '🪐', '👽', '🛰️', '🌟'] },
          { name: 'Ciudad', cells: ['🏠', '🏢', '🚗', '🚌', '🚦', '🌳', '🏪', '🚲', '👥'] }
        ]
      }
    ]
  },
  en: {
    levels: [
      {
        id: 1,
        description: '4 pieces',
        stars: 1,
        rows: 2,
        cols: 2,
        images: [
          { name: 'Landscape', cells: ['☀️', '☁️', '🌳', '🌸'] },
          { name: 'Fruits', cells: ['🍎', '🍌', '🍇', '🍊'] },
          { name: 'Animals', cells: ['🐶', '🐱', '🐰', '🐻'] },
          { name: 'Faces', cells: ['😀', '😺', '🐵', '🐸'] }
        ]
      },
      {
        id: 2,
        description: '6 pieces',
        stars: 2,
        rows: 2,
        cols: 3,
        images: [
          { name: 'Kitchen', cells: ['🍎', '🍌', '🍞', '🧀', '🥕', '🥛'] },
          { name: 'Jungle', cells: ['🐒', '🦁', '🐘', '🐍', '🦜', '🐆'] },
          { name: 'Sky', cells: ['☀️', '🌙', '⭐', '☁️', '🌈', '⚡'] },
          { name: 'Sea', cells: ['🐟', '🐙', '🦀', '🐠', '🐬', '🦈'] }
        ]
      },
      {
        id: 3,
        description: '9 pieces',
        stars: 3,
        rows: 3,
        cols: 3,
        images: [
          { name: 'Farm', cells: ['🐮', '🐷', '🐔', '🐑', '🐴', '🐓', '🐐', '🦆', '🐕'] },
          { name: 'Mixed fruits', cells: ['🍎', '🍌', '🍇', '🍊', '🍉', '🍓', '🍑', '🍒', '🥝'] },
          { name: 'Space', cells: ['🌍', '🌙', '⭐', '🚀', '☄️', '🪐', '👽', '🛰️', '🌟'] },
          { name: 'City', cells: ['🏠', '🏢', '🚗', '🚌', '🚦', '🌳', '🏪', '🚲', '👥'] }
        ]
      }
    ]
  }
};
