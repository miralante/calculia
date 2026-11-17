/* ============================================================
   Calculia — Numbers (group page): data.

   The activities grouped under "Números". `slug` is the folder
   of the activity; `name` and `detail` are keys in
   strings.<locale>.js.

   The sub-activities of tools/numbers/ listed here sit at the
   same level as the others. `sub` is the sub-activity id; the link
   opens tools/numbers/ straight on that sub-activity (?sub=<id>), so
   there is no intermediate "Los números" menu to pass through.
   ============================================================ */
var DATA = {
  activities: [
    { slug: 'los-numeros', picto: '🔢', name: 'group.types.name', detail: 'group.types.detail' },
    { slug: 'temperature', picto: '🌡️', name: 'group.temperature.name', detail: 'group.temperature.detail' },
    { slug: 'numbers', sub: 'unidades', picto: '🧱', name: 'group.unidades.name', detail: 'group.unidades.detail' },
    { slug: 'ordinals', picto: '🥇', name: 'group.ordinals.name', detail: 'group.ordinals.detail' }
  ]
};
