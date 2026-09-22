/* ============================================================
   Datos: Historias (razonamiento — ordenar viñetas en el tiempo).
   Formato: DATA.levels = [{ id, stars,
     stories: [{ id, panels: string[] }] }]
   'vinetas' está en el orden correcto (el first pasa first).
   Los nombres NO están aquí: son texto y viven en strings.js.
   Nivel: App.i18n.t('nivelDescripcion').replace('{n}', viñetas del nivel).
   Historia: App.i18n.t('historia.' + historia.id).
   Progresión (regla 13, un solo cambio por nivel): solo cambia el número
   de viñetas por historia (nivel 1: 3, nivel 2: 4, nivel 3: 5).
   Para ampliar: añadir una historia al array del nivel (con un id
   nuevo) y su name a strings.js (es y en).
   ============================================================ */
const DATA = {
  perRound: 5,
  levels: [
    {
      id: 1,
      stars: 1,
      stories: [
        { id: 'lavarse-manos', panels: ['🚰', '🧼', '🤲'] },
        { id: 'tostar-pan', panels: ['🍞', '🔥', '🧈'] },
        { id: 'dia-noche', panels: ['☀️', '🌇', '🌙'] },
        { id: 'flor-crece', panels: ['🌰', '🌱', '🌸'] },
        { id: 'vestir-piernas', panels: ['🧦', '👖', '👟'] },
        { id: 'crecer', panels: ['👶', '🧒', '🧑'] },
        { id: 'lavar-ropa', panels: ['🧺', '🌀', '👕'] },
        { id: 'bocadillo', panels: ['🍞', '🧀', '🥪'] }
      ]
    },
    {
      id: 2,
      stars: 2,
      stories: [
        { id: 'tarta', panels: ['🥚', '🥣', '🔥', '🎂'] },
        { id: 'dormir', panels: ['🛁', '🦷', '🛏️', '😴'] },
        { id: 'dia-lluvia', panels: ['☀️', '☁️', '🌧️', '🌈'] },
        { id: 'plantar-arbol', panels: ['🕳️', '🌱', '🌿', '🌳'] },
        { id: 'compra', panels: ['📝', '🛒', '💳', '🛍️'] },
        { id: 'fiesta-cumpleanos', panels: ['🎈', '🎂', '🕯️', '🎁'] },
        { id: 'freir-huevo', panels: ['🥚', '🍳', '🍽️', '😋'] },
        { id: 'ir-colegio', panels: ['🛏️', '🥣', '🎒', '🏫'] }
      ]
    },
    {
      id: 3,
      stars: 3,
      stories: [
        { id: 'cycle-agua', panels: ['☀️', '🌊', '☁️', '🌧️', '🌈'] },
        { id: 'tarta-cumpleanos', panels: ['🥣', '🔥', '🎂', '🕯️', '🎁'] },
        { id: 'dia-completo', panels: ['🌅', '☀️', '🌇', '🌙', '😴'] },
        { id: 'semilla-fruto', panels: ['🌰', '🌱', '🌿', '🌸', '🍎'] },
        { id: 'preparar-bocadillo', panels: ['🍞', '🧀', '🥪', '🍽️', '😋'] },
        { id: 'lavar-save-ropa', panels: ['🧺', '🌀', '☀️', '👕', '🚪'] }
      ]
    }
  ]
};
