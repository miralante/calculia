/* ============================================================
   Calculia — El Calendario — datos
   Formato:
   - DATA.activities[id]: picto y levels[]. Cada nivel: { id, tipo,
     ...config }. El tipo elige el generador de preguntas en app.js.
     Object.keys(DATA.activities) fija el orden del menú.
   - DATA.days / DATA.months: solo los ids, en su orden real. El orden
     ES el contenido de esta actividad, así que vive aquí y no se
     deduce de ninguna otra cosa.
   - DATA.seasons: a qué estación pertenece cada mes. Solo están los
     meses que caen enteros dentro de una estación; marzo, junio,
     septiembre y diciembre están partidos por la mitad, y una
     respuesta "casi" enseñaría algo falso.
   Los nombres de días, meses y estaciones NO están aquí: son texto y
   viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  activities: {
    /* La semana primero: es el ciclo más corto y el que más se usa al
       hablar ("mañana", "el lunes que viene"). */
    semana: {
      picto: '📅',
      levels: [
        /* w1→w2 solo cambia la dirección; w2→w3 quita el apoyo (el día
           deja de estar escrito en la tira). Una variable por paso. */
        { id: 'w1', tipo: 'daySeq', dir: 'next' },
        { id: 'w2', tipo: 'daySeq', dir: 'prev' },
        { id: 'w3', tipo: 'dayGap' }
      ]
    },

    /* El año después: mismo mecanismo, ciclo más largo. */
    meses: {
      picto: '🗓️',
      levels: [
        { id: 'm1', tipo: 'monthSeq', dir: 'next' },
        { id: 'm2', tipo: 'monthSeq', dir: 'prev' },
        { id: 'm3', tipo: 'monthGap' }
      ]
    },

    /* Las estaciones cierran el bloque: ya no es orden, es agrupar. */
    estaciones: {
      picto: '🌸',
      levels: [
        { id: 's1', tipo: 'season' },
        { id: 's2', tipo: 'seasonMonth' }
      ]
    },

    /* Y por último cuánto dura cada cosa. Todo se cuenta sobre las mismas
       tiras: un año son 12 meses porque se ven los 12. */
    unidades: {
      picto: '⏳',
      levels: [
        { id: 'u1', tipo: 'howManyIn' },
        { id: 'u2', tipo: 'longerUnit' }
      ]
    }
  },

  /* Cuántas cosas caben en otra. `kind` dice qué tira se dibuja, porque
     la respuesta se cuenta en ella y no se aprende de memoria. */
  units: [
    { id: 'daysInWeek', kind: 'week', n: 7 },
    { id: 'monthsInYear', kind: 'year', n: 12 },
    { id: 'seasonsInYear', kind: 'seasons', n: 4 }
  ],

  /* Solo parejas que se pueden dibujar exactamente: una semana contiene
     los 7 días que se ven, y un año los 12 meses que se ven. "Semana o
     mes" no está porque un mes no son un número exacto de semanas, y
     una respuesta aproximada aquí enseñaría algo falso. */
  unitPairs: [
    { small: 'day', big: 'week', kind: 'week' },
    { small: 'month', big: 'year', kind: 'year' }
  ],

  /* El orden es el dato. La semana empieza en lunes, como el
     calendario escolar y laboral español. */
  days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday',
    'saturday', 'sunday'],

  months: ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'],

  /* Sábado y domingo se marcan en la tira: es la distinción que de
     verdad se usa para orientarse en la semana. */
  weekend: ['saturday', 'sunday'],

  seasons: [
    { id: 'spring', icon: '🌸', months: ['april', 'may'] },
    { id: 'summer', icon: '☀️', months: ['july', 'august'] },
    { id: 'autumn', icon: '🍂', months: ['october', 'november'] },
    { id: 'winter', icon: '❄️', months: ['january', 'february'] }
  ]
};
