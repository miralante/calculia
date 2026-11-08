/* ============================================================
   Calculia — Temporizador — datos
   Formato:
   - DATA.choices: los tiempos que se pueden medir. `seconds` es la
     duración; el nombre del botón está en strings (choice.<id>).
   - DATA.ringEverySeconds: cada cuánto suena el aviso.
   - DATA.ringMaxSeconds: tras este tiempo el aviso deja de sonar,
     pero la pantalla sigue mostrando que el tiempo ha acabado.
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  choices: [
    { id: 'second',         seconds: 1,    picto: '⚡' },
    { id: 'minute',         seconds: 60,   picto: '⏱️' },
    { id: 'fiveMinutes',    seconds: 300,  picto: '🖐️' },
    { id: 'tenMinutes',     seconds: 600,  picto: '🔟' },
    { id: 'fifteenMinutes', seconds: 900,  picto: '🕒' },
    { id: 'halfHour',       seconds: 1800, picto: '🕧' },
    { id: 'hour',           seconds: 3600, picto: '🕐' }
  ],
  ringEverySeconds: 2,
  ringMaxSeconds: 60
};
