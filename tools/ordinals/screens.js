/* ============================================================
   Calculia — Ordinal numbers: the three screens before the levels.
   Screen 1 is the race-finish card and the carousel, screen 2 the real-life
   scenes (the podium, the ranking, the queue and the building) and screen 3
   the reminder (the ordinal row and the rule). This file owns their drawing
   and their buttons. The page gives it switchTo() and the abbreviation helper,
   and gets back paint() and bind().

   Medals and people are inline SVG, not emoji: they draw the same on every
   system, and the figure and the word always carry the meaning.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;
  function t(key) { return App.i18n.t(key); }

  /* Gold, silver and bronze discs with a two-colour ribbon. Decorative. */
  var MEDAL_FILL = { 1: '#D4A017', 2: '#9AA3AD', 3: '#B0703C' };
  function medalSvg(n) {
    return '<svg class="medal-svg" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
      '<path d="M10 2h8l4 12-6 2z" fill="#00695C"/>' +
      '<path d="M22 2h8l-6 14-6-2z" fill="#B3446C"/>' +
      '<circle cx="20" cy="27" r="11" fill="' + MEDAL_FILL[n] + '"/>' +
      '</svg>';
  }

  /* Neutral person emoji for the real-life scenes (building, queue, podium).
     The pool is small and has no gender or skin tone. Each place takes the
     next one, so neighbours differ and the sequence is predictable. */
  var NEIGHBOURS = ['🧑', '👶', '🧒', '🧓', '🧑'];
  function neighbourEmoji(n) { return NEIGHBOURS[(n - 1) % NEIGHBOURS.length]; }

  /* Kit colours of the five rows of the ranking: one per place, so each
     footballer is told apart by colour as well as by the ordinal next to it. */
  var KIT = ['#1E5BB8', '#2E7D32', '#6A3FA0', '#C0632A', '#B3446C'];

  /* A footballer bust in kit: head with hair, a collar in white, shoulders in
     the kit colour, and a ball at the side. Decorative. */
  function footballerSvg(n) {
    var kit = KIT[(n - 1) % KIT.length];
    return '<svg class="person-svg" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" focusable="false">' +
      '<path d="M4 28c0-6.5 4.5-10 10-10s10 3.5 10 10z" fill="' + kit + '"/>' +
      '<path d="M11 18.2 14 22l3-3.8" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<rect x="12.2" y="14" width="3.6" height="4.5" fill="#F1C27D"/>' +
      '<circle cx="14" cy="9.5" r="5" fill="#F1C27D"/>' +
      '<path d="M9 9c0-3.4 2.2-5.2 5-5.2s5 1.8 5 5.2c-1.2-1.6-2.8-2.4-5-2.4S10.2 7.4 9 9z" fill="#3B2A1A"/>' +
      '<circle cx="22.2" cy="23.2" r="3.4" fill="#FFFFFF" stroke="#14161E" stroke-width="0.8"/>' +
      '<path d="M22.2 21.4l1.3.9-.5 1.5h-1.6l-.5-1.5z" fill="#14161E"/>' +
      '</svg>';
  }

  /* host: { switchTo(screen), abbrev(n) }. Returns { paint(), bind() }. */
  App.ordinalsScreens = function (host) {
    var switchTo = host.switchTo;
    var abbrev = host.abbrev;
    var famousScreen = $('#screenFamous');
    var reminderScreen = $('#screenReminder');
    var levelsScreen = $('#screenLevels');

    /* ============================================================
       Screen 1: podium card + carousel
       ============================================================ */

    /* The first card is fixed and always comes before the carousel: first,
       second and third are the ones people already know. It is a race finish:
       three runners in their lanes, the first one reaching the line and the
       others a little behind. It shows what the places mean at the finish. */
    function runnerSvg() {
      return '<svg class="runner-svg" width="26" height="30" viewBox="0 0 26 30" aria-hidden="true" focusable="false">' +
        '<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M15 10.5 12 18"/>' +
        '<path d="M14 11.5 19.5 15"/>' +
        '<path d="M14 11.5 9 12.5"/>' +
        '<path d="M12 18 17.5 25"/>' +
        '<path d="M12 18 6.5 24"/>' +
        '</g>' +
        '<circle cx="17" cy="5" r="3.4" fill="currentColor"/>' +
        '</svg>';
    }

    function paintStops() {
      var el = $('#stopsRow');
      if (!el) return;
      el.setAttribute('role', 'group');
      el.setAttribute('aria-label', [1, 2, 3].map(function (n) {
        return abbrev(n) + ' — ' + t('ord.' + n + 'Name');
      }).join('; '));
      el.innerHTML = '<div class="race-lanes">' + [1, 2, 3].map(function (n) {
        var o = ordinalByN(n);
        return '<div class="race-lane ' + o.cls + '">' +
          '<span class="race-label">' +
            '<span class="race-ord">' + abbrev(n) + '</span>' +
            '<span class="race-name">' + t('ord.' + n + 'Name') + '</span>' +
          '</span>' +
          '<span class="race-track">' +
            '<span class="race-runner race-runner--' + n + '" aria-hidden="true">' + runnerSvg() + '</span>' +
            '<span class="race-tape" aria-hidden="true"></span>' +
          '</span>' +
        '</div>';
      }).join('') + '</div>';
    }

    var carouselIdx = 0;

    /* One dot per slide, the current one stretched. Shows where you are in the
       series without a number to read. */
    function paintDots() {
      var dots = $('#carouselDots');
      if (!dots) return;
      dots.innerHTML = DATA.carousel.map(function (_, i) {
        return '<span class="carousel-dot' + (i === carouselIdx ? ' carousel-dot--on' : '') + '"></span>';
      }).join('');
    }

    /* Each slide shows the ordinal three ways at once: the figure with its
       indicator (built with abbrev, see app.js), the word and the place. The
       place is the natural number, so the figure is tied to its position. */
    function paintCarousel() {
      var n = DATA.carousel[carouselIdx];
      var o = ordinalByN(n);
      var el = $('#carouselDisplay');
      el.innerHTML =
        '<span class="ordinal-hero ' + o.cls + '">' + abbrev(n) + '</span>' +
        '<span class="ordinal-hero-name ' + o.cls + '">' + t('ord.' + n + 'Name') + '</span>' +
        '<span class="ordinal-hero-place">' + t('placePrefix').replace('{n}', n) + '</span>';
      el.setAttribute('aria-label', abbrev(n) + ' — ' + t('ord.' + n + 'Name'));
      paintDots();
      paintCarouselEnd();
    }

    /* The tour is linear: it ends on the last slide. There the arrows go away
       and "Ver en la vida real" appears; before that, the button stays hidden. */
    function paintCarouselEnd() {
      var atEnd = carouselIdx === DATA.carousel.length - 1;
      $('#carouselControls').classList.toggle('hidden', atEnd);
      $('#introNext').classList.toggle('hidden', !atEnd);
    }

    /* Moves one slide; does nothing past either end, so the card click on the
       last slide cannot wrap back to the start. */
    function carouselStep(delta) {
      var next = carouselIdx + delta;
      if (next < 0 || next >= DATA.carousel.length) return;
      carouselIdx = next;
      paintCarousel();
    }

    /* ============================================================
       Screen 2: four real-life scenes, one at a time
       ============================================================ */

    /* Each scene shows several ordinals at once, in their context: someone
       hears "I live on the third floor" with the other floors around it, and
       that context is what makes the word make sense. */
    var famousIdx = 0;

    /* Building: a stack of floors, first floor at the bottom. The arrows sit
       under it and move the current-floor highlight. */
    var currentFloor = 1;

    function renderBuilding(total) {
      var upDisabled = currentFloor >= total ? ' disabled' : '';
      var downDisabled = currentFloor <= 1 ? ' disabled' : '';
      var rows = [];
      for (var i = total; i >= 1; i--) {
        var o = ordinalByN(i);
        var isCurrent = i === currentFloor;
        rows.push(
          '<div class="building-floor ' + o.cls + (isCurrent ? ' building-floor--current' : '') + '">' +
            '<span class="building-floor-ord ' + o.cls + '">' + abbrev(i) + '</span>' +
            '<span class="building-floor-label">' + t('buildingFloor').replace('{n}', i) + '</span>' +
            (isCurrent ? '<span class="building-here">' + t('buildingHere') + '</span>' : '') +
            '<span class="building-person" aria-hidden="true">' + neighbourEmoji(i) + '</span>' +
          '</div>'
        );
      }
      rows.push(
        '<div class="building-arrows">' +
        '<button type="button" class="building-arrow building-arrow--up" id="buildingUp"' +
        upDisabled + ' aria-label="' + t('buildingArrowUp') + '">▲</button>' +
        '<button type="button" class="building-arrow building-arrow--down" id="buildingDown"' +
        downDisabled + ' aria-label="' + t('buildingArrowDown') + '">▼</button>' +
        '</div>'
      );
      return rows.join('');
    }

    /* Queue: the goal at the front, then the people, each with its figure. */
    function renderQueue(total) {
      var cells = ['<span class="queue-counter" aria-hidden="true">' + t('queueCounter') + '</span>'];
      for (var i = 1; i <= total; i++) {
        var o = ordinalByN(i);
        cells.push(
          '<span class="queue-person-cell">' +
            '<span class="queue-person-figure" aria-hidden="true">' + neighbourEmoji(i) + '</span>' +
            '<span class="queue-person-ord ' + o.cls + '">' + abbrev(i) + '</span>' +
          '</span>'
        );
      }
      return cells.join('');
    }

    /* Ranking: a list from first to last, figure on the left, participant on
       the right. Reads the way a race result does. */
    function renderClasificacion(total) {
      var rows = [];
      for (var i = 1; i <= total; i++) {
        var o = ordinalByN(i);
        rows.push(
          '<div class="classification-row ' + o.cls + '">' +
            '<span class="classification-ord ' + o.cls + '">' + abbrev(i) + '</span>' +
            '<span class="classification-person" aria-hidden="true">' + footballerSvg(i) + '</span>' +
          '</div>'
        );
      }
      return rows.join('');
    }

    /* Podium: the first place in the centre and highest, second to its left,
       third to its right. The figure sits under the medal, so the medal is
       what marks the place and the figure names it. */
    function renderPodium() {
      var positions = [
        { n: 2, cls: 'podium-pos--2' },
        { n: 1, cls: 'podium-pos--1' },
        { n: 3, cls: 'podium-pos--3' }
      ];
      return positions.map(function (p) {
        var o = ordinalByN(p.n);
        return '<div class="podium-pos ' + p.cls + '">' +
          '<div class="podium-medal">' + medalSvg(p.n) + '</div>' +
          '<div class="podium-block">' +
            '<span class="podium-person" aria-hidden="true">' + neighbourEmoji(p.n) + '</span>' +
            '<span class="podium-ord ' + o.cls + '">' + abbrev(p.n) + '</span>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function paintFamous() {
      var item = DATA.famous[famousIdx];
      var container = $('#famousScene');
      var labelEl = $('#famousLabel');
      var textEl = $('#famousText');
      var ariaEl = $('#famousSceneWrap');

      /* The scene has only a title and the visual; the long explanation lives
         in the reminder table on screen 3. */
      textEl.textContent = '';

      if (item.id === 'edificio') {
        container.className = 'famous-stage famous-building';
        container.innerHTML = renderBuilding(item.n);
        container.setAttribute('aria-hidden', 'true');
        labelEl.textContent = t('buildingLabel');
        ariaEl.setAttribute('aria-label', t('buildingAria')
          .replace('{n}', item.n).replace('{top}', item.n)
          .replace('{current}', currentFloor));
      } else if (item.id === 'cola') {
        container.className = 'famous-stage famous-queue';
        container.innerHTML = renderQueue(item.n);
        container.setAttribute('aria-hidden', 'true');
        labelEl.textContent = t('queueLabel');
        ariaEl.setAttribute('aria-label', t('queueAriaLabel')
          .replace('{n}', item.n));
      } else if (item.id === 'clasificacion') {
        container.className = 'famous-stage famous-classification';
        container.innerHTML = renderClasificacion(item.n);
        container.setAttribute('aria-hidden', 'true');
        labelEl.textContent = t('classificationLabel');
        ariaEl.setAttribute('aria-label', t('classificationAria')
          .replace('{n}', item.n));
      } else if (item.id === 'podio') {
        container.className = 'famous-stage famous-podium';
        container.innerHTML = renderPodium();
        container.setAttribute('aria-hidden', 'true');
        labelEl.textContent = t('podiumLabel');
        ariaEl.setAttribute('aria-label', t('podiumAria'));
      }
      paintFamousEnd();
    }

    /* Same rule as the carousel: the arrows go away on the last scene and
       "Recuerda" appears there. */
    function paintFamousEnd() {
      var atEnd = famousIdx === DATA.famous.length - 1;
      $('#famousControls').classList.toggle('hidden', atEnd);
      $('#famousNextBtn').classList.toggle('hidden', !atEnd);
    }

    function famousStep(delta) {
      var next = famousIdx + delta;
      if (next < 0 || next >= DATA.famous.length) return;
      famousIdx = next;
      /* Each time the slide changes, the highlighted floor goes back to 1. */
      currentFloor = 1;
      paintFamous();
    }

    /* ============================================================
       Screen 3: reminder
       ============================================================ */

    /* One chip per ordinal: figure (with its medal for the first three), the
       word, and the place. The colour stripe on top follows the ordinal class;
       the figure and the word are always written, so colour is never the only
       cue. */
    function renderOrdinalChips(ordinals) {
      return ordinals.map(function (n) {
        var o = ordinalByN(n);
        var medal = n <= 3 ? medalSvg(n) : '';
        return '<div class="ord-chip ' + o.cls + '">' +
          '<span class="ord-chip-figure ' + o.cls + '">' + medal + abbrev(n) + '</span>' +
          '<span class="ord-chip-name">' + t('ord.' + n + 'Name') + '</span>' +
          '<span class="ord-chip-place">' + t('placePrefix').replace('{n}', n) + '</span>' +
        '</div>';
      }).join('');
    }

    /* The whole series, in chips. */
    function paintOrdinalRow() {
      var el = $('#ordinalsRow');
      el.innerHTML = renderOrdinalChips(DATA.presentedOrdinals);
    }

    /* The rule: figure · word · place. Four examples cover the rule. */
    var RULE_ONE = [1, 2, 3, 4];

    function exampleFormula(n) {
      var o = ordinalByN(n);
      return '<span class="ex-figure ' + o.cls + '">' + abbrev(n) + '</span>' +
        '<span class="ex-op"> · </span>' +
        '<span class="ex-name">' + t('ord.' + n + 'Name') + '</span>' +
        '<span class="ex-op"> · </span>' +
        '<span class="ex-natural">' + t('placePrefix').replace('{n}', n) + '</span>';
    }

    function paintRuleExamples() {
      $('#ruleMatch').innerHTML = RULE_ONE.map(function (n) {
        return '<div class="rule-example">' + exampleFormula(n) + '</div>';
      }).join('');
    }

    function bind() {
      App.utils.bindCarousel({ prev: $('#carouselPrev'), next: $('#carouselNext'), card: $('#carouselDisplay') }, carouselStep);
      $('#introNext').addEventListener('click', function () { switchTo(famousScreen); });

      $('#famousPrev2').addEventListener('click', function () { famousStep(-1); });
      /* Delegated click: the building arrows live inside #famousScene, whose
         innerHTML is rebuilt on every paint, so one listener on the container
         is enough. */
      $('#famousScene').addEventListener('click', function (e) {
        var target = e.target;
        if (target.id === 'buildingUp') {
          if (currentFloor < DATA.famous[famousIdx].n) {
            currentFloor += 1;
            paintFamous();
          }
        } else if (target.id === 'buildingDown') {
          if (currentFloor > 1) {
            currentFloor -= 1;
            paintFamous();
          }
        }
      });
      $('#famousNext2').addEventListener('click', function () { famousStep(1); });
      $('#famousNextBtn').addEventListener('click', function () { switchTo(reminderScreen); });
      /* #referenceNext ("Empezar a practicar") is bound in app.js: it starts the
         practice directly, as roman-numerals does, instead of showing the steps. */
    }

    return {
      paint: function () {
        paintStops();
        paintCarousel();
        paintFamous();
        paintOrdinalRow();
        paintRuleExamples();
      },
      bind: bind
    };
  };
})();
