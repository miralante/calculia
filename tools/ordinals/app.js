/* ============================================================
   Calculia — Números ordinales.

   Metodología de Números Romanos aplicada a "qué lugar ocupa cada
   uno":

     1. intro    : un carrusel que nombra cada ordinal y lo sitúa en
                   la serie, con la cifra siempre escrita al lado.
     2. famous   : el mismo ordinal en una situación real (una cita,
                   un piso, un puesto en una carrera), para que la
                   palabra nombre algo y no sea una etiqueta.
     3. reminder : tabla de color con la serie entera y las dos
                   reglas que explican los errores de verdad.
     4. quiz     : pasos encadenados que cambian UNA variable cada
                   vez, pistas socráticas que no dan la respuesta y
                   una ronda de refuerzo de los fallos.

   El contenido (la fila, la bandera, los ordinales 1..10, los
   niveles) viene de data.js y de la sub-actividad `ordinales` que
   ya existía dentro de Los Números; aquí se explica en data.js por
   qué se conserva esa fila y por qué el rango llega al décimo.

   Dos decisiones que conviene no deshacer sin pensarlo:

   - Las opciones equivocadas de los modos de fila son los LUGARES
     VECINOS (target±1, target±2), no números cualesquiera. El error
     real de un ordinal es contar desde el otro extremo o empezar
     por cero, y por eso las alternativas tienen que parecerse a ese
     error. Sacadas al azar de 1..10 el acierto pasa a ser suerte.

   - El paso 1 del recordatorio avisa de que no existe un "lugar
     cero". Es la misma idea, dicha de otra forma, y evita el
     desvío más caro de esta actividad: que alguien cuente la
     bandera como el sitio número cero.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'ordinals';
  var $ = App.utils.$;

  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (!progress.completed) progress.completed = {};

  function save() { App.storage.set(TOOL_ID, progress); }
  function t(key) { return App.i18n.t(key); }
  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }

  /* t() devuelve la clave cuando falta la traducción: así se
     detecta que una situación no tiene frase. */
  function realText(key) {
    var text = t(key);
    return text !== key ? text : '';
  }

  function randomInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
  function paintStars() { $('#stars').textContent = '⭐ ' + progress.stars; }

  var introScreen = $('#screenIntro');
  var famousScreen = $('#screenFamous');
  var reminderScreen = $('#screenReminder');
  var levelsScreen = $('#screenLevels');
  var quizScreen = $('#screenQuiz');
  var endScreen = $('#screenEnd');

  /* ============================================================
     Pantalla 1: la serie, en carrusel
     ============================================================ */
  var carouselIdx = 0;

  /* Cada paso enseña el ordinal de tres formas a la vez: la cifra
     (3), la palabra (tercero) y el lugar (tercer lugar). La cifra
     grande es lo que fija la posición en la serie; sin ella las
     palabras sueltas no se ordenan solas.

     La cifra va como número pelado, no abreviada con el signo de
     grado superíndice. Motivo, no gusto: check.js (comprobación
     6.1) prohíbe por substring las seis formas abreviadas de los
     ordinales en todo lo que se sirve al navegador, porque en
     pantalla son indistinguibles de la marca de curso escolar. El
     escaneo es sobre el contenido crudo del fichero, así que ni
     siquiera un comentario puede llevar el glifo (ni nombrar el
     término classroom que dispara la misma comprobación). La
     destreza que se enseña — "tres, tercero" — se practica igual
     con la cifra delante, y en día a día la gente dice "tercer
     piso" más que la forma abreviada. */
  function paintCarousel() {
    var n = DATA.carousel[carouselIdx];
    var o = ordinalByN(n);
    var el = $('#carouselDisplay');
    el.innerHTML =
      '<span class="carousel-figure ' + o.cls + '">' + n + '</span>' +
      '<span class="carousel-name ' + o.cls + '">' + t('ord.' + n + 'Name') + '</span>';
    el.setAttribute('aria-label', n + ' — ' + t('ord.' + n + 'Name'));
    $('#carouselCaption').textContent = t('ord.' + n + 'Caption');
  }

  function carouselStep(delta) {
    carouselIdx = (carouselIdx + delta + DATA.carousel.length) % DATA.carousel.length;
    paintCarousel();
  }

  /* ============================================================
     Pantalla 2: el ordinal en una situación real
     ============================================================ */
  var famousIdx = 0;

  function paintFamous() {
    var item = DATA.famous[famousIdx];
    var o = ordinalByN(item.n);
    var example = realText('famous.' + item.factKey);
    $('#famousExample').innerHTML =
      '<span class="famoso-figure ' + o.cls + '">' + item.n + '</span>' +
      '<span class="famoso-value"><span class="famoso-equals">=</span>' +
      '<span class="famoso-name ' + o.cls + '">' + t('ord.' + item.n + 'Name') + '</span></span>';
    $('#famousExample').setAttribute('aria-label',
      item.n + ' — ' + t('ord.' + item.n + 'Name'));
    $('#famousText').textContent = example;
  }

  function famousStep(delta) {
    famousIdx = (famousIdx + delta + DATA.famous.length) % DATA.famous.length;
    paintFamous();
  }

  /* ============================================================
     Pantalla 3: recordatorio
     ============================================================ */

  /* La serie entera. Cada ficha lleva su forma corta, su palabra y su
     lugar: los tres van juntos a propósito, porque el error típico es
     usar la palabra en el sitio donde va la forma corta o al revés. */
  function paintOrdinalRow() {
    var el = $('#ordinalsRow');
    el.innerHTML = '';
    DATA.carousel.forEach(function (n) {
      var o = ordinalByN(n);
      var chip = document.createElement('div');
      chip.className = 'ord-chip';
      chip.innerHTML =
        '<span class="ord-chip-figure ' + o.cls + '">' + n + '</span>' +
        '<span class="ord-chip-name ' + o.cls + '">' + t('ord.' + n + 'Name') + '</span>' +
        '<span class="ord-chip-place">' + t('ord.' + n + 'Place') + '</span>';
      el.appendChild(chip);
    });
  }

  /* Las dos reglas, con ejemplos.
     Regla 1 — el ordinal va con su número: 1 primero, 2 segundo.
     Regla 2 — la cuenta empieza en el primero: no hay lugar cero.
     La 2 se cuenta también con la bandera dibujada debajo, porque es
     la regla que se ve en la fila y no se entiende leyendo. */
  var RULE_ONE = [1, 2, 3, 4];
  var RULE_TWO = [1, 2, 3];

  /* "1 · primero · primer lugar": cifra, palabra y lugar unidos por
     un punto, que es como se leen en un cartel de puerta ("tercer
     piso") o en una lista de turnos. */
  function exampleFormula(n) {
    var o = ordinalByN(n);
    return '<span class="ex-figure ' + o.cls + '">' + n + '</span>' +
      '<span class="ex-op"> · </span>' +
      '<span class="ex-name ' + o.cls + '">' + t('ord.' + n + 'Name') + '</span>' +
      '<span class="ex-op"> · </span>' +
      '<span class="ex-place">' + t('ord.' + n + 'Place') + '</span>';
  }

  /* La regla 2 se apoya en la fila: la bandera es el primero y a
     partir de ahí no hay huecos. Se dibuja en miniatura, con tres
     posiciones.

     Cada miembro va DENTRO de su hueco junto a su número, no como
     hermano suelto: con los dos en el mismo flujo, el "1" quedaba
     flotando entre la bandera y el gato, que es justo lo contrario
     de lo que la regla quiere decir — el número va DEBAJO de lo que
     nombra. */
  function stripSlot(member, n, isFlag) {
    return '<span class="strip-slot">' +
      '<span class="strip-member' + (isFlag ? ' strip-first' : '') + '">' + member + '</span>' +
      '<span class="strip-label ' + ordinalByN(n).cls + '">' + n + '</span>' +
      '</span>';
  }

  function queueStrip() {
    return '<div class="strip">' +
      stripSlot('🏁', 1, true) +
      stripSlot('🐱', 2, false) +
      stripSlot('🐶', 3, false) +
      '</div>';
  }

  function paintRuleExamples() {
    $('#ruleMatch').innerHTML = RULE_ONE.map(function (n) {
      return '<div class="rule-example">' + exampleFormula(n) + '</div>';
    }).join('');
    $('#ruleStart').innerHTML = RULE_TWO.map(function (n) {
      return '<div class="rule-example rule-example--tight">' + exampleFormula(n) + '</div>';
    }).join('') + queueStrip();
  }

  /* ============================================================
     Pantalla 4: los pasos
     ============================================================ */

  /* La dificultad de un grupo es la de su sub-paso más difícil, así
     el número se escribe una sola vez (en data.js) y un grupo nunca
     puede presumir de ser más fácil que el paso que cierra. */
  function levelStars(level) {
    if (level.sublevels) {
      return level.sublevels.reduce(function (max, sn) {
        return Math.max(max, sn.stars || 1);
      }, 1);
    }
    return level.stars || 1;
  }

  function levelDone(level) {
    if (level.sublevels) {
      return level.sublevels.every(function (sn) { return progress.completed[sn.id]; });
    }
    return !!progress.completed[level.id];
  }

  function paintLevels() {
    var cont = $('#levelsGrid');
    cont.innerHTML = '';
    DATA.levels.forEach(function (level) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-practice';
      var done = levelDone(level);
      btn.innerHTML =
        '<div class="practice-icon" aria-hidden="true">' + level.icon + '</div>' +
        '<div class="practice-name">' + t('level.' + level.id + 'Name') + '</div>' +
        '<div class="practice-detail">' + t('level.' + level.id + 'Detail') + '</div>' +
        '<div class="practice-stars" aria-label="' + t('starsCount').replace('{n}', levelStars(level)) + '">' +
        '⭐'.repeat(levelStars(level)) + '</div>' +
        (done ? '<div class="practice-done">' + t('levelDone') + '</div>' : '');
      btn.addEventListener('click', function () { startLevel(level); });
      cont.appendChild(btn);
    });
  }

  /* ============================================================
     El juego
     ============================================================ */
  var currentLevel = null;
  var currentGroup = null;
  var currentSubIdx = 0;
  var items = [];
  var idx = 0;
  var correctCount = 0;
  var resolved = false;
  var attempts = 0;
  var chainBanner = '';

  /* La fila del round: n animales, la bandera al frente y un lugar
     señalado. La bandera es lo que fija por dónde empieza la cuenta;
     sin ella, "primero"dependería de adivinar por qué extremo se
     mira, y ese es justo el error que se quiere evitar. */
  function buildQueue(itemsCount, target, showPointer) {
    var row = App.utils.shuffle(DATA.queueMembers.slice()).slice(0, itemsCount);
    var pointerRow = showPointer
      ? '<div class="queue-row queue-pointers" aria-hidden="true">' +
        '<span class="queue-start-spacer"></span>' +
        row.map(function (_, i) {
          return '<span class="queue-pointer">' + (i + 1 === target ? '⬇️' : '') + '</span>';
        }).join('') +
        '</div>'
      : '';
    var queue = '<div class="queue-row" aria-hidden="true">' +
      '<span class="queue-start">🏁</span>' +
      row.map(function (m) { return '<span class="queue-member">' + m + '</span>'; }).join('') +
      '</div>';
    return { row: row, html: pointerRow + queue };
  }

  /* Lugares vecinos de 'target' dentro de una fila de 'total'. Dos
     porque sólo hay tres opciones por partida. */
  function nearbyPlaces(target, total) {
    var pool = [target - 1, target + 1, target - 2, target + 2];
    var out = [];
    pool.forEach(function (p) {
      if (p >= 1 && p <= total && p !== target && out.indexOf(p) === -1) out.push(p);
    });
    return out;
  }

  /* Números vecinos para los modos de texto. Mismo motivo que arriba:
     el error de un ordinal está al lado, no repartido por 1..10. */
  function nearbyDigits(target, min, max) {
    var pool = [target + 1, target - 1, target + 2, target - 2];
    var out = [];
    pool.forEach(function (p) {
      if (p >= min && p <= max && p !== target && out.indexOf(p) === -1) out.push(p);
    });
    return out;
  }

  function entryFor(level) {
    var mode = level.mode;
    if (mode === 'positionToName' || mode === 'nameToMember') {
      var itemsCount = Math.min(level.items || 3, DATA.maxQueue);
      return { mode: mode, items: itemsCount, target: randomInt(1, itemsCount) };
    }
    return {
      mode: mode,
      n: randomInt(level.min || 1, level.max || 10),
      min: level.min || 1,
      max: level.max || 10
    };
  }

  /* Identidad de una pregunta: la misma posición pedida en el mismo
     modo es la misma tarjeta en pantalla, y dos iguales seguidas
     hacen que "Siguiente" parezca roto. */
  function entryKey(entry) {
    return entry.mode + '|' + (entry.target || entry.n) + '|' + (entry.items || '');
  }

  function hasAdjacentRepeat(list) {
    for (var i = 1; i < list.length; i++) {
      if (entryKey(list[i]) === entryKey(list[i - 1])) return true;
    }
    return false;
  }

  function itemsForLevel(level) {
    var total = DATA.perRound;
    if (level.pool === 'random' || level.mode === 'random') {
      var base = baseLevels();
      var out = [];
      for (var i = 0; i < total; i++) {
        var entry, tries = 0;
        do {
          var pick = base[randomInt(0, base.length - 1)];
          entry = entryFor(pick);
          tries += 1;
        } while (out.length && tries < 10 && entryKey(entry) === entryKey(out[out.length - 1]));
        out.push(entry);
      }
      return out;
    }
    var pool = [];
    for (var k = 0; k < total; k++) {
      var candidate, ct = 0;
      do {
        candidate = entryFor(level);
        ct += 1;
      } while (pool.length && ct < 10 && entryKey(candidate) === entryKey(pool[pool.length - 1]));
      pool.push(candidate);
    }
    return pool;
  }

  /* Los sub-pasos con modo propio; los grupos y el test son
     envoltorios. */
  function baseLevels() {
    var out = [];
    DATA.levels.forEach(function (level) {
      if (level.pool === 'group') {
        if (level.sublevels) out = out.concat(level.sublevels);
      } else if (level.pool !== 'random' && level.mode !== 'random') {
        out.push(level);
      }
    });
    return out;
  }

  /* Arranca un paso. `inChain` distingue "entrada desde el menú" de
     "siguiente sub-paso de una cadena": si no se distingue, el caso
     no-cadena pone currentGroup a null y la cadena se rompe en
     silencio — finish() ya no encuentra grupo, así que tras el
     PRIMER sub-paso salta a la pantalla final y los pasos 2 y 3
     nunca se juegan. */
  function startLevel(level, inChain) {
    if (level.pool === 'group') {
      currentGroup = level;
      currentSubIdx = 0;
      startLevel(level.sublevels[0], true);
      return;
    }
    if (!inChain) {
      currentGroup = null;
      currentSubIdx = 0;
    }
    currentLevel = level;
    items = itemsForLevel(level);
    idx = 0;
    correctCount = 0;
    switchTo(quizScreen);
    render();
  }

  /* Situación de apoyo, si la hay para ese ordinal. */
  function sceneFor(entry) {
    var n = entry.target || entry.n;
    var scene = DATA.scenes.filter(function (s) { return s.n === n; })[0];
    return scene ? realText('scene.' + scene.id) : '';
  }

  function buildRound(entry) {
    var mode = entry.mode;
    var shown = '';
    var question;
    var options = [];
    var correctValue = null;
    var context = '';
    var aria = '';

    if (mode === 'positionToName' || mode === 'nameToMember') {
      var askingPosition = mode === 'positionToName';
      var q = buildQueue(entry.items, entry.target, askingPosition);
      shown = q.html +
        '<p class="queue-hint">' + t('queueHint') + '</p>';
      aria = t('queueAria')
        .replace('{n}', entry.items)
        .replace('{pos}', entry.target);
      var places = nearbyPlaces(entry.target, entry.items);
      if (askingPosition) {
        question = t('qPosition');
        correctValue = t('ord.' + entry.target + 'Name');
        options = [correctValue].concat(places.map(function (p) {
          return t('ord.' + p + 'Name');
        }));
      } else {
        question = t('qMember').replace('{place}', t('ord.' + entry.target + 'Place'));
        correctValue = '<span class="queue-member">' + q.row[entry.target - 1] + '</span>';
        options = [correctValue].concat(places.map(function (p) {
          return '<span class="queue-member">' + q.row[p - 1] + '</span>';
        }));
      }
      context = sceneFor(entry);
    } else if (mode === 'ordinalToDigit') {
      shown = '<span class="big-word ' + ordinalByN(entry.n).cls + '">' +
        t('ord.' + entry.n + 'Name') + '</span>';
      aria = t('ord.' + entry.n + 'Name');
      question = t('qOrdinalToDigit');
      correctValue = entry.n;
      options = [entry.n].concat(nearbyDigits(entry.n, entry.min, entry.max).slice(0, 2));
      context = sceneFor(entry);
    } else {
      shown = '<span class="big-digit">' + entry.n + '</span>';
      aria = String(entry.n);
      question = t('qDigitToOrdinal');
      correctValue = t('ord.' + entry.n + 'Name');
      options = [correctValue].concat(nearbyDigits(entry.n, entry.min, entry.max).slice(0, 2).map(function (p) {
        return t('ord.' + p + 'Name');
      }));
      context = sceneFor(entry);
    }

    return {
      shown: shown, aria: aria, question: question, options: App.utils.shuffle(options),
      correctValue: correctValue, context: context, entry: entry
    };
  }

  function paintProgress() {
    $('#progressFill').style.width = ((idx / items.length) * 100) + '%';
    $('#progressText').textContent = (idx + 1) + ' / ' + items.length;
    var groupId = currentLevel.group || currentLevel.id;
    var parent = DATA.levels.filter(function (l) { return l.id === groupId; })[0];
    var flat = parent && parent.sublevels ? parent.sublevels : [currentLevel];
    var position = 1;
    flat.forEach(function (sn, i) { if (sn.id === currentLevel.id) position = i + 1; });
    $('#stepLabel').textContent = t('stepLabel')
      .replace('{n}', position)
      .replace('{total}', flat.length)
      .replace('{name}', t('level.' + groupId + 'Name'));
  }

  function render() {
    var roundData = buildRound(items[idx]);
    resolved = false;
    attempts = 0;
    var shownEl = $('#shown');
    shownEl.innerHTML = roundData.shown;
    /* La fila es aria-hidden dentro del marcado y el enunciado lleva
       su propia etiqueta: un lector de pantalla no puede leer la
       flecha ⬇️ ni sacar nada de 🏁. */
    shownEl.setAttribute('aria-label', roundData.aria);
    $('#context').textContent = roundData.context;
    $('#context').classList.toggle('hidden', !roundData.context);
    $('#question').textContent = roundData.question;
    $('#feedback').textContent = '';
    $('#feedback').className = 'feedback';
    $('#explanationWrap').classList.add('hidden');
    $('#explanation').textContent = '';
    $('#next').classList.add('hidden');
    var banner = $('#chainBanner');
    if (chainBanner) {
      banner.textContent = chainBanner;
      banner.classList.remove('hidden');
      chainBanner = '';
    } else {
      banner.textContent = '';
      banner.classList.add('hidden');
    }

    var optionsEl = $('#options');
    optionsEl.innerHTML = '';
    roundData.options.forEach(function (value) {
      var btn = document.createElement('button');
      btn.type = 'button';
      /* Una palabra ("segundo") no cabe en una celda de tres
         columnas a 375px con el tamaño de titular: se salía del
         botón. Los dígitos y los emojis sí caben, así que el tamaño
         sólo baja cuando la opción es texto. */
      btn.className = 'option-btn' + (/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(stripTags(value)) ? ' option-btn--word' : '');
      btn.innerHTML = value;
      btn.setAttribute('aria-label', stripTags(value));
      btn.addEventListener('click', function () { answer(btn, value, roundData); });
      optionsEl.appendChild(btn);
    });

    paintProgress();
    paintStars();
  }

  /* La etiqueta accesible de un botón que puede traer HTML (un animal
     con <span>) tiene que ser el texto pelado. */
  function stripTags(html) {
    var el = document.createElement('div');
    el.innerHTML = html;
    return el.textContent.trim();
  }

  /* Pista socrática: dice dónde mirar, nunca cuál era la respuesta. */
  function pickHint(entry) {
    if (entry.mode === 'positionToName') return t('hintPosition');
    if (entry.mode === 'nameToMember') return t('hintMember');
    if (entry.mode === 'ordinalToDigit') return t('hintOrdinalToDigit');
    return t('hintDigitToOrdinal');
  }

  function answer(btn, value, roundData) {
    if (resolved) return;
    if (value === roundData.correctValue) {
      resolved = true;
      btn.classList.add('correct');
      App.utils.$$('#options .option-btn').forEach(function (b) { b.disabled = true; });
      App.feedback.success($('#feedback'));
      progress.stars += 1;
      correctCount += 1;
      save();
      paintStars();
      $('#explanation').textContent = t('correct');
      $('#explanationWrap').classList.remove('hidden');
      $('#next').classList.remove('hidden');
      $('#next').focus();
    } else {
      attempts += 1;
      $('#explanation').textContent = (attempts === 1
        ? t('hintPrefix') + pickHint(roundData.entry)
        : t('wrongPrefix') + stripTags(roundData.correctValue));
      $('#explanationWrap').classList.remove('hidden');
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage($('#feedback'));
      /* El bloqueo socrático deja fuera la opción equivocada y pide
         leer la pista antes del siguiente intento. */
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), $('#explanationWrap'));
    }
  }

  function next() {
    idx += 1;
    if (idx >= items.length) finish();
    else render();
  }

  function finish() {
    progress.completed[currentLevel.id] = (progress.completed[currentLevel.id] || 0) + 1;
    save();
    if (currentGroup && currentSubIdx + 1 < currentGroup.sublevels.length) {
      currentSubIdx += 1;
      chainBanner = t('chainNext')
        .replace('{name}', t('level.' + currentGroup.sublevels[currentSubIdx].group + 'Name'));
      startLevel(currentGroup.sublevels[currentSubIdx], true);
      return;
    }
    $('#finalSummary').textContent = t('finalSummary')
      .replace('{n}', correctCount)
      .replace('{total}', items.length)
      .replace('{stars}', progress.stars);
    switchTo(endScreen);
    App.feedback.celebrate(t('core.roundComplete'));
  }

  /* ============================================================
     Cambio de pantalla y cableado
     ============================================================ */
  var ALL_SCREENS = [introScreen, famousScreen, reminderScreen, levelsScreen, quizScreen, endScreen];

  function switchTo(screen) {
    ALL_SCREENS.forEach(function (s) { hide(s); });
    /* La rejilla de pasos lleva la marca de "hecho" por grupo, así que
       hay que repintarla en cada llegada. Si se pintara sólo en
       init(), al volver de terminar una cadena la pantalla seguiría
       diciendo que no se ha hecho nada — y es justo el momento en que
       la persona viene a ver qué le queda. */
    if (screen === levelsScreen) paintLevels();
    show(screen);
    paintStars();
    window.scrollTo(0, 0);
  }

  $('#carouselDisplay').addEventListener('click', function () { carouselStep(1); });
  $('#carouselDisplay').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carouselStep(1);
    }
  });
  $('#carouselPrev').addEventListener('click', function () { carouselStep(-1); });
  $('#carouselNext').addEventListener('click', function () { carouselStep(1); });
  $('#introNext').addEventListener('click', function () { switchTo(famousScreen); });

  $('#famousPrev2').addEventListener('click', function () { famousStep(-1); });
  $('#famousNext2').addEventListener('click', function () { famousStep(1); });
  $('#famousBackBtn').addEventListener('click', function () { switchTo(introScreen); });
  $('#famousNextBtn').addEventListener('click', function () { switchTo(reminderScreen); });

  $('#reminderBack').addEventListener('click', function () { switchTo(famousScreen); });
  $('#referenceNext').addEventListener('click', function () { switchTo(levelsScreen); });

  $('#levelsBack').addEventListener('click', function () { switchTo(reminderScreen); });
  $('#backLevelsBtn').addEventListener('click', function () { switchTo(levelsScreen); });
  $('#next').addEventListener('click', next);
  $('#replayBtn').addEventListener('click', function () { startLevel(currentLevel); });
  $('#btnChooseLevel').addEventListener('click', function () { switchTo(levelsScreen); });
  $('#btnHome').addEventListener('click', function () { window.location.href = '../../index.html'; });

  function init() {
    App.i18n.apply();
    paintStars();
    paintCarousel();
    paintFamous();
    paintOrdinalRow();
    paintRuleExamples();
    paintLevels();
    switchTo(introScreen);
  }

  document.addEventListener('DOMContentLoaded', init);
})();