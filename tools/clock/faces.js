/* ============================================================
   Calculia — Clock: the time words and the clock faces (SVG and digital).
   ============================================================ */
(function () {
  'use strict';

  /* ---- Time helpers ---- */
  function hour12(hour24) {
    var h = hour24 % 12;
    return h === 0 ? 12 : h;
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  /* "8 en punto", "8 y cuarto", "8 y media", "9 menos cuarto". */
  function timeText(h, minute) {
    if (minute === 0) return App.i18n.t('oClock').replace('{h}', h);
    if (minute === 15) return App.i18n.t('quarterPast').replace('{h}', h);
    if (minute === 30) return App.i18n.t('halfPast').replace('{h}', h);
    var next = h === 12 ? 1 : h + 1;
    return App.i18n.t('quarterTo').replace('{h}', next);
  }

  /* "08:00" — locale-neutral, two digits each. */
  function timeDigital(h, minute) { return pad2(h) + ':' + pad2(minute); }

  /* The dial, the same for every clock face: the twelve hours as numbers
     (1 to 12) round the edge, a short tick for each minute and a longer tick
     on each hour. 12 is at the top, and the hours go round clockwise. */
  function dialSvg() {
    var ticks = '';
    for (var m = 0; m < 60; m += 1) {
      var a = m * 6 * Math.PI / 180;
      var isHour = m % 5 === 0;
      var inner = isHour ? 38 : 41.5;
      var outer = 44;
      ticks += '<line x1="' + (50 + inner * Math.sin(a)).toFixed(2) +
        '" y1="' + (50 - inner * Math.cos(a)).toFixed(2) +
        '" x2="' + (50 + outer * Math.sin(a)).toFixed(2) +
        '" y2="' + (50 - outer * Math.cos(a)).toFixed(2) +
        '" stroke="var(--color-texto)" stroke-width="' + (isHour ? 2 : 0.9) + '"/>';
    }
    var numbers = '';
    for (var h = 1; h <= 12; h += 1) {
      var ang = h * 30 * Math.PI / 180;
      var r = 30.5;
      numbers += '<text x="' + (50 + r * Math.sin(ang)).toFixed(2) +
        '" y="' + (50 - r * Math.cos(ang) + 3.6).toFixed(2) + '" text-anchor="middle" ' +
        'font-size="10" font-weight="700" fill="var(--color-texto)" ' +
        'style="font-family:var(--fuente)">' + h + '</text>';
    }
    return '<circle cx="50" cy="50" r="45" fill="#FFFFFF" stroke="var(--color-texto)" stroke-width="4"/>' +
      ticks + numbers;
  }

  function clockSvg(h, minute) {
    var hourAngle = ((h % 12) + minute / 60) * 30;
    var minuteAngle = minute * 6;
    return '<svg viewBox="0 0 100 100" width="120" height="120" role="img" aria-hidden="true">' +
      dialSvg() +
      '<line x1="50" y1="50" x2="50" y2="30" stroke="var(--color-texto)" stroke-width="5" ' +
      'stroke-linecap="round" transform="rotate(' + hourAngle + ' 50 50)"/>' +
      '<line x1="50" y1="50" x2="50" y2="24" stroke="var(--color-texto)" stroke-width="3.5" ' +
      'stroke-linecap="round" transform="rotate(' + minuteAngle + ' 50 50)"/>' +
      '<circle cx="50" cy="50" r="3" fill="var(--color-texto)"/>' +
      '</svg>';
  }

  /* Same face as clockSvg, but each hand keeps its own colour so the
     reference screen can name it. Colour is never the only cue: the
     legend also states which hand is short and which is long. */
  function referenceClockSvg(h, minute) {
    var hourAngle = ((h % 12) + minute / 60) * 30;
    var minuteAngle = minute * 6;
    return '<svg viewBox="0 0 100 100" width="150" height="150" role="img" aria-hidden="true">' +
      dialSvg() +
      '<line x1="50" y1="50" x2="50" y2="30" stroke="var(--color-foco)" stroke-width="6" ' +
      'stroke-linecap="round" transform="rotate(' + hourAngle + ' 50 50)"/>' +
      '<line x1="50" y1="50" x2="50" y2="24" stroke="var(--color-animo)" stroke-width="3.5" ' +
      'stroke-linecap="round" transform="rotate(' + minuteAngle + ' 50 50)"/>' +
      '<circle cx="50" cy="50" r="3" fill="var(--color-texto)"/>' +
      '</svg>';
  }

  /* Plain digital LCD-style face (no seconds). */
  function digitalFace(h, minute) {
    return '<div class="digital-face" role="img" aria-hidden="true">' +
      '<span class="dig-pair">' + pad2(h) + ':' + pad2(minute) + '</span>' +
      '</div>';
  }

  /* Live digital face with running seconds. Returns the host element;
     the caller must later call stopLiveDigital(host) (or rely on
     render()'s cleanup) to stop the interval. */
  function startLiveDigital(host) {
    function paint() {
      var now = new Date();
      var h = now.getHours() % 12; if (h === 0) h = 12;
      var m = now.getMinutes();
      var s = now.getSeconds();
      host.innerHTML =
        '<span class="dig-pair">' + pad2(h) + ':' + pad2(m) + '</span>' +
        '<span class="dig-seg">:' + pad2(s) + '</span>';
    }
    host.classList.add('digital-live');
    host.setAttribute('role', 'img');
    paint();
    var id = setInterval(paint, 1000);
    host.dataset.tickId = String(id);
    return host;
  }

  function stopLiveDigital(host) {
    if (!host || !host.dataset.tickId) return;
    clearInterval(parseInt(host.dataset.tickId, 10));
    delete host.dataset.tickId;
  }

  App.ClockFaces = {
    hour12: hour12,
    timeText: timeText,
    timeDigital: timeDigital,
    clockSvg: clockSvg,
    referenceClockSvg: referenceClockSvg,
    stopLiveDigital: stopLiveDigital
  };
})();
