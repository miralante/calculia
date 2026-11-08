/* ============================================================
   Calculia — shared time helpers for the clock and date activities.
   Exposes App.time:
     durationLabel(duration)     [count, unit] -> "1 hora", "2 horas"
     monthNameByNumber(month)    1..12 -> the month name (month.m01 .. month.m12)
   Requires i18n.js. Loaded before each activity's app.js.
   ============================================================ */
(function () {
  'use strict';

  window.App = window.App || {};

  /* A duration is [count, unit]; the unit key lives under 'units.' with
     '.one' for a single item and '.many' for the rest. */
  function durationLabel(duration) {
    var n = duration[0];
    var key = 'units.' + duration[1] + (n === 1 ? '.one' : '.many');
    return n + ' ' + App.i18n.t(key);
  }

  /* Month number, 1 to 12, to its name in the active locale. */
  function monthNameByNumber(month) {
    return App.i18n.t('month.m' + (month < 10 ? '0' + month : String(month)));
  }

  App.time = {
    durationLabel: durationLabel,
    monthNameByNumber: monthNameByNumber
  };
})();
