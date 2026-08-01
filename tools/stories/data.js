/* ============================================================
   Datos: Historias (razonamiento — ordenar viñetas en el tiempo).
   Formato: DATA.niveles = [{ id, estrellas,
     historias: [{ id, vinetas: string[] }] }]
   'vinetas' está en el orden correcto (el primero pasa primero).
   Los nombres NO están aquí: son texto y viven en strings.js.
   Nivel: App.i18n.t('nivelNombre').replace('{n}', nivel.id) +
   App.i18n.t('nivelDescripcion').replace('{n}', viñetas del nivel).
   Historia: App.i18n.t('historia.' + historia.id).
   Progresión (regla 13, un solo cambio por nivel): solo cambia el número
   de viñetas por historia (nivel 1: 3, nivel 2: 4, nivel 3: 5).
   Para ampliar: añadir una historia al array del nivel (con un id
   nuevo) y su nombre a strings.js (es y en).
   ============================================================ */
const DATA = {
  porRonda: 5,
  niveles: [
    {
      id: 1,
      estrellas: 1,
      historias: [
        { id: 'lavarse-manos', vinetas: ['🚰', '🧼', '🤲'] },
        { id: 'tostar-pan', vinetas: ['🍞', '🔥', '🧈'] },
        { id: 'dia-noche', vinetas: ['☀️', '🌇', '🌙'] },
        { id: 'flor-crece', vinetas: ['🌰', '🌱', '🌸'] },
        { id: 'vestir-piernas', vinetas: ['🧦', '👖', '👟'] },
        { id: 'crecer', vinetas: ['👶', '🧒', '🧑'] },
        { id: 'lavar-ropa', vinetas: ['🧺', '🌀', '👕'] },
        { id: 'bocadillo', vinetas: ['🍞', '🧀', '🥪'] }
      ]
    },
    {
      id: 2,
      estrellas: 2,
      historias: [
        { id: 'tarta', vinetas: ['🥚', '🥣', '🔥', '🎂'] },
        { id: 'dormir', vinetas: ['🛁', '🦷', '🛏️', '😴'] },
        { id: 'dia-lluvia', vinetas: ['☀️', '☁️', '🌧️', '🌈'] },
        { id: 'plantar-arbol', vinetas: ['🕳️', '🌱', '🌿', '🌳'] },
        { id: 'compra', vinetas: ['📝', '🛒', '💳', '🛍️'] },
        { id: 'fiesta-cumpleanos', vinetas: ['🎈', '🎂', '🕯️', '🎁'] },
        { id: 'freir-huevo', vinetas: ['🥚', '🍳', '🍽️', '😋'] },
        { id: 'ir-colegio', vinetas: ['🛏️', '🥣', '🎒', '🏫'] }
      ]
    },
    {
      id: 3,
      estrellas: 3,
      historias: [
        { id: 'ciclo-agua', vinetas: ['☀️', '🌊', '☁️', '🌧️', '🌈'] },
        { id: 'tarta-cumpleanos', vinetas: ['🥣', '🔥', '🎂', '🕯️', '🎁'] },
        { id: 'dia-completo', vinetas: ['🌅', '☀️', '🌇', '🌙', '😴'] },
        { id: 'semilla-fruto', vinetas: ['🌰', '🌱', '🌿', '🌸', '🍎'] },
        { id: 'preparar-bocadillo', vinetas: ['🍞', '🧀', '🥪', '🍽️', '😋'] },
        { id: 'lavar-guardar-ropa', vinetas: ['🧺', '🌀', '☀️', '👕', '🚪'] }
      ]
    }
  ]
};
