/* ============================================================
   Calculia — Divisores y múltiplos (group page).
   Lists the two activities as links. Nothing is practised here:
   each activity has its own round.
   ============================================================ */
(function () {
  'use strict';

  var menu = App.utils.$('#activitiesMenu');
  var grid = document.createElement('div');
  grid.className = 'menu-grid';
  DATA.activities.forEach(function (act) {
    var link = document.createElement('a');
    link.className = 'btn-actividad';
    link.href = '../' + act.slug + '/';
    link.innerHTML = '<span class="picto" aria-hidden="true">' + act.picto + '</span>' +
      '<span>' + App.i18n.t(act.name) + '</span>' +
      '<span class="detail-card">' + App.i18n.t(act.detail) + '</span>';
    grid.appendChild(link);
  });
  menu.appendChild(grid);
})();
