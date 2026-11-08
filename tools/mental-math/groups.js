/* ============================================================
   Calculia — Mental math: the "Contar en grupos" walkthrough.
   Its own screens (intro, real situations, the reminder, the levels) and its
   own quiz and end screen, with its own progress slot. The classic activity
   menu opens it through groupsStart. The page gives it the progress object
   and the shared show() and paintStars() helpers.
   ============================================================ */
(function () {
  'use strict';

  var M = App.mentalMathModel;
  var $ = App.utils.$;
  var rint = App.utils.rint,
      digits = M.digits,
      groupsT = M.groupsT,
      groupsFormat = M.groupsFormat,
      RULE_EXAMPLES = M.RULE_EXAMPLES,
      DOZEN_EXAMPLES = M.DOZEN_EXAMPLES,
      groupsLevelStars = M.groupsLevelStars,
      groupsLevelIcon = M.groupsLevelIcon,
      groupsEntryKey = M.groupsEntryKey,
      groupsTakeTwo = M.groupsTakeTwo,
      groupsColoredDigits = M.groupsColoredDigits,
      groupsPlainShown = M.groupsPlainShown,
      groupsPickHint = M.groupsPickHint;

  /* host: { progress, show(screen), paintStars() }. Returns { start: groupsStart }. */
  App.mentalMathGroups = function (host) {
    var progress = host.progress;
    var show = host.show;
    var paintStars = host.paintStars;
    var starsEl = $('#stars');
    var screenMenu = $('#screenMenu');

    /* ---- 'groups' walkthrough screens ----
       La actividad 'Contar en grupos' (antes en Cantidades) tiene un
       recorrido propio: carrusel → ejemplos reales → recordatorio
       cromático → niveles → cuestionario → fin. Vive EN UN BLOQUE
       DISTINTO del flujo flat de anchors/restar/cabeza, así que
       declaramos sus pantallas por separado (prefijadas con g) para
       no tocar las del flujo flat. */
    var gIntroScreen = $('#screenGroupsIntro');
    var gFamousScreen = $('#screenGroupsFamous');
    var gReminderScreen = $('#screenGroupsReminder');
    var gLevelsScreen = $('#screenGroupsLevels');
    var gQuizScreen = $('#screenGroupsQuiz');
    var gEndScreen = $('#screenGroupsEnd');
    var gProgressFill = $('#groupsProgressFill');
    var gProgressText = $('#groupsProgressText');
    var gStep = $('#groupsStep');
    var gChainBanner = $('#groupsChainBanner');
    /* ============================================================
       Práctica "Contar en grupos" — recorrido propio
       Antes vivía en Cantidades. Sigue la metodología de números
       romanos: las pantallas intro/famoso/recordatorio se montan
       una vez al abrir, y los pasos (Aprender / Usar / Todos)
       encadenan sus sub-niveles sin volver al menú. Las estrellas
       viven en su propio slot de almacenamiento (mental-math-groups)
       para no mezclarse con anchors/restar/cabeza.
       ============================================================ */

    /* Localised lookup used by the helper above. Wrapped in a function
       (instead of calling App.i18n.t directly) so data.js stays loadable
       before i18n registers the dictionary; it reads App.i18n.t at call
       time, which is always after register(). */
    /* Persistent progress lives in its own slot. The stars kept by
       Cantidades for this practice still sit under the 'quantities'
       key of localStorage until a reset — that history is intentionally
       not migrated, since the new activity starts from zero. */
    var groupsProgress = GROUPS_PROGRESS.load();
    function groupsSave() { GROUPS_PROGRESS.save(groupsProgress); }
    function groupsPaintStars() {
      starsEl.textContent = '⭐ ' + ((progress.stars || 0) + groupsProgress.stars);
    }

    /* ---- Switcher for the four walkthrough screens + quiz + end. ----
       One place decides which screen is visible so the header star
       counter and the scroll position are consistent whichever way the
       person navigates. */
    var GROUPS_ALL_SCREENS = [
      gIntroScreen, gFamousScreen, gReminderScreen,
      gLevelsScreen, gQuizScreen, gEndScreen
    ];
    function groupsSwitchTo(screen) {
      GROUPS_ALL_SCREENS.forEach(function (s) {
        s.classList.toggle('hidden', s !== screen);
      });
      /* Paint here too: when this activity is reached from the
         activities menu the global `paintStars` runs first, but on
         navigation between groups screens the header would otherwise
         keep the count from anchors/restar/cabeza alone. */
      if (screen === gLevelsScreen) groupsPaintLevels();
      groupsPaintStars();
      window.scrollTo(0, 0);
    }

    /* ---- Walkthrough entry ---- */
    function groupsStart() {
      /* Reset the carousel/famous indices so each entry to the
         walkthrough starts at the first group and first example.
         The sub-level index lives separately, see startGroupsLevel. */
      carouselIdx = 0;
      famousIdx = 0;
      paintCarousel();
      paintFamous();
      paintGroupsRow();
      paintRuleExamples();
      groupsSwitchTo(gIntroScreen);
    }

    /* ---- Screen 1: intro carousel ---- */

    var carouselIdx = 0;

    /* The big display shows the group name, its colour, how many it
       holds and a worked example ("4 decenas = 40"). The example is
       generated, not written by hand, so the carousel and the quiz can
       never disagree about what a decena is. */
    function paintCarousel() {
      var id = GROUPS_DATA.carousel[carouselIdx];
      var g = groupById(id);
      var el = $('#carouselDisplay');
      el.innerHTML =
        '<span class="carousel-name ' + g.cls + '">' + groupsT('group.' + id + 'Name') + '</span>' +
        '<span class="carousel-value">' + groupsFormat(g.size) + '</span>';
      el.setAttribute('aria-label', groupsT('group.' + id + 'Name') + ': ' + groupsFormat(g.size));
      $('#carouselCaption').textContent = groupsT('group.' + id + 'Caption');
    }

    function carouselStep(delta) {
      carouselIdx = (carouselIdx + delta + GROUPS_DATA.carousel.length) % GROUPS_DATA.carousel.length;
      paintCarousel();
    }

    /* Localised number formatter used everywhere the groups walkthrough
       shows a count ("una decena", "12", "100"). The thousands separator
       rule from the typing practices (no separator below 10.000) still
       applies — group counts never reach four digits, so the locale
       separator is harmless here. */
    /* ---- Screen 2: real situations ---- */

    var famousIdx = 0;

    /* Each entry pairs a group with a real situation. The situation
       sentence lives in strings.<locale>.js and always ends with ":",
       so the coloured formula can be appended without the two halves
       fighting over the punctuation — same trick as
       roman-numerals' famous screen. */
    function paintFamous() {
      var item = GROUPS_DATA.famous[famousIdx];
      var g = groupById(item.group);
      var example = groupsT('famous.' + item.factKey);
      var exampleText = example !== 'famous.' + item.factKey ? example : '';
      $('#famousExample').innerHTML =
        '<span class="famoso-group ' + g.cls + '">' + groupsT('group.' + item.group + 'Name') + '</span>' +
        '<span class="famoso-value"><span class="famoso-equals">=</span>' +
        '<span class="famoso-number">' + groupsFormat(g.size) + '</span></span>';
      $('#famousExample').setAttribute('aria-label', groupsT('group.' + item.group + 'Name') + ': ' + groupsFormat(g.size));
      $('#famousText').textContent = exampleText;
    }

    function famousStep(delta) {
      famousIdx = (famousIdx + delta + GROUPS_DATA.famous.length) % GROUPS_DATA.famous.length;
      paintFamous();
    }

    /* ---- Screen 3: the reminder ---- */

    /* The colour table has one row per group, each showing the group's
       colour, its name and how many it holds. Below it, the two rules
       with worked examples — the same shape as the roman-numerals
       reminder, which teaches two rules with two examples each so the
       rule is seen with more than one number.

       Rule 1 (same in every group): count the groups, then multiply.
         "3 decenas = 3 × 10 = 30"
       Rule 2 (the one that surprises): a dozen is twelve, not ten.
         "2 docenas = 2 × 12 = 24"  vs  "2 decenas = 20" */
    function paintGroupsRow() {
      var el = $('#groupsRow');
      el.innerHTML = '';
      GROUPS_DATA.carousel.forEach(function (id) {
        var g = groupById(id);
        var chip = document.createElement('div');
        chip.className = 'group-chip';
        chip.innerHTML =
          '<span class="group-chip-name ' + g.cls + '">' + groupsT('group.' + id + 'Name') + '</span>' +
          '<span class="group-chip-size">' + groupsFormat(g.size) + '</span>';
        el.appendChild(chip);
      });
    }

    /* The worked example: "3 decenas = 3 × 10 = 30". The count, the
       multiplier and the total each keep the group's colour so the eye
       can pair "decenas" with the number that multiplies and with the
       number that comes out. */
    function exampleFormula(example) {
      var g = groupById(example.group);
      var phrase = groupPhrase(example.count, example.group);
      var total = example.count * g.size;
      return '<span class="ex-phrase ' + g.cls + '">' + phrase.text + '</span>' +
        '<span class="ex-op"> = </span>' +
        '<span class="ex-count ' + g.cls + '">' + example.count + '</span>' +
        '<span class="ex-op"> × </span>' +
        '<span class="ex-size ' + g.cls + '">' + groupsFormat(g.size) + '</span>' +
        '<span class="ex-op"> = </span>' +
        '<span class="ex-total">' + groupsFormat(total) + '</span>';
    }

    function paintRuleExamples() {
      var box1 = $('#ruleMultiply');
      box1.innerHTML = RULE_EXAMPLES.map(function (ex) {
        return '<div class="rule-example">' + exampleFormula(ex) + '</div>';
      }).join('');
      var box2 = $('#ruleDozen');
      box2.innerHTML = DOZEN_EXAMPLES.map(function (ex) {
        return '<div class="rule-example">' + exampleFormula(ex) + '</div>';
      }).join('');
    }

    /* ---- Screen 4: the levels ---- */

    /* Difficulty rating shown on the level button. A group is rated by
       its hardest sub-level, so the number is written once in data.js
       and the group can never claim to be easier than the step it
       ends on. */
    function groupsPaintLevels() {
      var cont = $('#levelsGrid');
      cont.innerHTML = '';
      GROUPS_DATA.levels.forEach(function (level) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-actividad';
        var done = groupsLevelDone(level);
        btn.innerHTML =
          '<span class="picto" aria-hidden="true">' + (level.icon || groupsLevelIcon(level)) + '</span>' +
          '<span>' + groupsT('level.' + level.id + 'Name') + '</span>' +
          '<span class="detail-card">' + groupsT('level.' + level.id + 'Detail') + '</span>' +
          '<div class="practice-stars" aria-label="' + groupsT('starsCount').replace('{n}', groupsLevelStars(level)) + '">' +
          '⭐'.repeat(groupsLevelStars(level)) + '</div>' +
          (done ? '<div class="practice-done">' + groupsT('levelDone') + '</div>' : '');
        btn.addEventListener('click', function () { groupsStartLevel(level); });
        cont.appendChild(btn);
      });
    }

    /* Every sub-level of a group must be finished before the group
       counts as done — the group is a chain, not a single round. */
    function groupsLevelDone(level) {
      if (level.sublevels) {
        return level.sublevels.every(function (sn) {
          return groupsProgress.groupsCompleted[sn.id];
        });
      }
      return !!groupsProgress.groupsCompleted[level.id];
    }

    /* ---- Quiz ---- */

    var currentGroup = null;
    var currentSubIdx = 0;
    var items = [];
    var gIdx = 0;
    var gCorrect = 0;
    var gResolved = false;
    var gAttempts = 0;
    /* Text of the "next step of the chain" banner, set by groupsFinish
       before it jumps to the next sub-level and cleared once painted.
       Kept in a variable instead of being written straight into the
       DOM because groupsStartLevel re-renders the quiz from scratch,
       which would otherwise wipe the banner it is meant to show. */
    var chainBanner = '';
    var currentLevel = null;

    /* A number that has a non-zero digit in one of the positions the
       level allows, plus other digits in the other allowed positions.
       Building the number this way (instead of drawing a random one and
       hoping the digit is non-zero) means the question never lands on
       a 0, which carries no information about the group. */
    function groupsNumberWithTargetDigit(positions) {
      var targetId = positions[rint(0, positions.length - 1)];
      var target = groupById(targetId);
      var digit = rint(1, 9);
      var n = digit * target.size;
      positions.forEach(function (id) {
        if (id === targetId) return;
        if (Math.random() < 0.6) n += rint(0, 9) * groupById(id).size;
      });
      return {
        n: n,
        targetId: targetId,
        digit: digit,
        /* The value of the digit at its position, e.g. 4 at hundreds
           = 400. This is what the question asks for. */
        value: digit * target.size
      };
    }

    /* One round entry. Each mode returns the same shape so buildRound
       can treat them uniformly. */
    function groupsEntryFor(level) {
      var mode = level.mode;
      if (mode === 'groupToNumber' || mode === 'dozenToNumber') {
        var pool = level.pools || ['unit', 'ten'];
        var groupId = pool[rint(0, pool.length - 1)];
        var count = rint(1, level.maxCount || 9);
        var g = groupById(groupId);
        return {
          mode: mode, groupId: groupId, count: count,
          n: count * g.size, size: g.size
        };
      }
      if (mode === 'numberToGroup' || mode === 'numberToDozen') {
        var pool2 = level.pools || ['unit', 'ten'];
        var groupId2 = pool2[rint(0, pool2.length - 1)];
        var count2 = rint(1, level.maxCount || 9);
        var g2 = groupById(groupId2);
        return {
          mode: mode, groupId: groupId2, count: count2,
          n: count2 * g2.size, size: g2.size
        };
      }
      /* digitValue */
      var positions = level.positions || ['ten', 'hundred'];
      var built = groupsNumberWithTargetDigit(positions);
      return {
        mode: 'digitValue', groupId: built.targetId,
        n: built.n, digit: built.digit, value: built.value,
        size: groupById(built.targetId).size
      };
    }

    /* Identity of a round entry, so two identical questions never land
       one after the other (see App.utils.spreadRepeats). */
    /* The flat list of base sub-levels (those with their own mode),
       excluding the groups and the 'test' level, which are wrappers. */
    function groupsBaseLevels() {
      var out = [];
      GROUPS_DATA.levels.forEach(function (level) {
        if (level.pool === 'group') {
          if (level.sublevels) out = out.concat(level.sublevels);
        } else if (level.pool !== 'random' && level.mode !== 'random') {
          out.push(level);
        }
      });
      return out;
    }

    function groupsItemsForGroupsLevel(level) {
      var total = GROUPS_DATA.perRoundGroups;
      if (level.pool === 'random' || level.mode === 'random') {
        var modes = groupsBaseLevels();
        var out = [];
        for (var i = 0; i < total; i++) {
          var entry, tries = 0;
          do {
            var base = modes[rint(0, modes.length - 1)];
            entry = groupsEntryFor(base);
            tries += 1;
          } while (out.length && tries < 10 &&
                   groupsEntryKey(entry) === groupsEntryKey(out[out.length - 1]));
          out.push(entry);
        }
        return out;
      }
      var pool = [];
      for (var k = 0; k < total; k++) {
        var candidate, ct = 0;
        do {
          candidate = groupsEntryFor(level);
          ct += 1;
        } while (pool.length && ct < 10 &&
                 groupsEntryKey(candidate) === groupsEntryKey(pool[pool.length - 1]));
        pool.push(candidate);
      }
      return pool;
    }

    /* Starts a round. If 'level' is a group, starts with its first
       sub-level and remembers which one, so the chain continues
       automatically when the round ends (see groupsFinish).

       `inChain` separates "entered from the levels screen" from "next
       sub-level of a chain". Without it, the non-chain branch clears
       currentGroup and the chain breaks silently: groupsFinish() no
       longer finds the group and jumps to the end screen after the
       FIRST sub-level, so steps 2 and 3 are never played. */
    function groupsStartLevel(level, inChain) {
      if (level.pool === 'group') {
        currentGroup = level;
        currentSubIdx = 0;
        groupsStartLevel(level.sublevels[0], true);
        return;
      }
      if (!inChain) {
        currentGroup = null;
        currentSubIdx = 0;
      }
      currentLevel = level;
      items = groupsItemsForGroupsLevel(level);
      gIdx = 0;
      gCorrect = 0;
      groupsSwitchTo(gQuizScreen);
      groupsRender();
    }

    /* Real-life sentence for a round, when the entry's group has one.

       Only when the round asks for a SINGLE group. Every scene in
       GROUPS_DATA.scenes describes one group of that size — "there are
       ten fingers on both hands" is about one decena — so attaching it
       to "6 decenas" would state something false, and a false example is
       worse than no example. digitValue never gets one either: its
       prompt is an arbitrary number, not a group of things.

       groupsT() returns the key itself when missing, so a key with no
       translation simply yields no context line. */
    function groupsSceneFor(entry) {
      if (entry.mode === 'digitValue' || entry.count !== 1) return '';
      var scene = GROUPS_DATA.scenes.filter(function (s) { return s.group === entry.groupId; })[0];
      return scene ? groupsT('scene.' + scene.id) : '';
    }

    /* Builds the wrong options. They are never invented numbers: each
       comes from another group the activity teaches, or from the same
       group with a different count. So every option on screen is
       something the person has already met. */
    function groupsValueDistractors(entry, correct) {
      var pool = [];
      GROUPS_DATA.groups.forEach(function (g) {
        if (g.id === entry.groupId) return;
        /* Same count in another group: "3 decenas" and "3 centenas"
           are the classic confusion, so it must be one of the two. */
        pool.push(entry.count * g.size);
      });
      /* Same group, one more or one less group. */
      if (entry.count + 1 <= 12) pool.push((entry.count + 1) * entry.size);
      if (entry.count - 1 >= 1) pool.push((entry.count - 1) * entry.size);
      /* digitValue: the bare digit is the trap — the person reads the
         4 and forgets it stands for 400. */
      if (entry.mode === 'digitValue') {
        pool.push(entry.digit);
        pool.push(entry.digit * 10);
      }
      return groupsTakeTwo(pool, correct);
    }

    function groupsPhraseDistractors(entry, correctText) {
      var pool = [];
      GROUPS_DATA.groups.forEach(function (g) {
        if (g.id !== entry.groupId) pool.push(groupPhrase(entry.count, g.id).text);
      });
      pool.push(groupPhrase(entry.count + 1, entry.groupId).text);
      if (entry.count > 1) pool.push(groupPhrase(entry.count - 1, entry.groupId).text);
      return groupsTakeTwo(pool, correctText);
    }

    /* Two distinct wrong values that are not the correct one, in the
       original order, so the option set never repeats itself. */
    function groupsBuildRound(entry) {
      var mode = entry.mode;
      var shown, question, correctValue, options, context = '';

      if (mode === 'groupToNumber' || mode === 'dozenToNumber') {
        shown = groupPhrase(entry.count, entry.groupId).text;
        question = groupsT('qHowMany');
        correctValue = entry.n;
        options = App.utils.shuffle([correctValue].concat(groupsValueDistractors(entry, correctValue)));
        context = groupsSceneFor(entry);
      } else if (mode === 'numberToGroup' || mode === 'numberToDozen') {
        shown = groupsFormat(entry.n);
        question = groupsT('qWhichGroup');
        correctValue = groupPhrase(entry.count, entry.groupId).text;
        options = App.utils.shuffle([correctValue].concat(groupsPhraseDistractors(entry, correctValue)));
        context = groupsSceneFor(entry);
      } else {
        /* digitValue: the prompt is the number with its digits in the
           colour of their group. aria-label carries the plain number so
           the screen reader does not read the spans separately. */
        shown = groupsColoredDigits(entry.n);
        question = groupsT('qDigitValue')
          .replace('{digit}', entry.digit)
          .replace('{plural}', groupsT('group.' + entry.groupId + 'Plural'));
        correctValue = entry.value;
        options = App.utils.shuffle([correctValue].concat(groupsValueDistractors(entry, correctValue)));
        context = groupsSceneFor(entry);
      }
      return {
        shown: shown, question: question, correctValue: correctValue,
        options: options, context: context, entry: entry
      };
    }

    /* Paint a number whose digit colours follow the group palette
       (units = mod-cuerpo, tens = mod-coordinacion, etc), used in the
       digitValue mode so the eye can pair the digit with its position
       even before reading the question. */
    function groupsPaintGroupsProgress() {
      gProgressFill.style.width = ((gIdx / items.length) * 100) + '%';
      gProgressText.textContent = (gIdx + 1) + ' / ' + items.length;
      /* The sub-levels are not named individually: they are numbered
         steps inside their group, so the header reads "Paso 2 de 4 ·
         Aplicar". Naming each sub-level separately would mean six
         near-identical labels in four languages for what is really one
         progression. */
      var groupId = currentLevel.group || currentLevel.id;
      var position = 1;
      var totalSteps = GROUPS_DATA.levels.filter(function (l) { return l.id === groupId; })[0];
      var flat = totalSteps && totalSteps.sublevels ? totalSteps.sublevels : [currentLevel];
      flat.forEach(function (sn, i) { if (sn.id === currentLevel.id) position = i + 1; });
      gStep.textContent = groupsT('stepLabel')
        .replace('{n}', position)
        .replace('{total}', flat.length)
        .replace('{name}', groupsT('level.' + groupId + 'Name'));
    }

    function groupsRender() {
      var roundData = groupsBuildRound(items[gIdx]);
      gResolved = false;
      gAttempts = 0;
      var shownEl = $('#groupsShown');
      shownEl.innerHTML = roundData.shown;
      shownEl.setAttribute('aria-label', groupsPlainShown(roundData));
      /* 72px está pensado para una cifra. Cuando el prompt es una frase
         ("4 decenas") no cabe en 320px, así que baja de tamaño; el
         layout se decide aquí, no con un poco de CSS suelta. */
      shownEl.classList.toggle('quiz-shown--phrase', roundData.entry.mode !== 'digitValue');
      $('#groupsContext').textContent = roundData.context;
      $('#groupsContext').classList.toggle('hidden', !roundData.context);
      $('#groupsQuestion').textContent = roundData.question;
      $('#groupsFeedback').textContent = '';
      $('#groupsFeedback').className = 'feedback';
      $('#groupsExplanationWrap').classList.add('hidden');
      $('#groupsExplanation').textContent = '';
      $('#groupsNext').classList.add('hidden');
      var banner = gChainBanner;
      if (chainBanner) {
        banner.textContent = chainBanner;
        banner.classList.remove('hidden');
        chainBanner = '';
      } else {
        banner.textContent = '';
        banner.classList.add('hidden');
      }

      var gridEl = $('#groupsOptions');
      gridEl.innerHTML = '';
      roundData.options.forEach(function (value) {
        var btn = document.createElement('button');
        btn.type = 'button';
        /* Una frase ("4 decenas", "3 medias docenas") no cabe en una
           celda de tres columnas a 375px con el tamaño de titular: se
           salía del botón. Los dígitos sí caben, así que el tamaño sólo
           baja cuando la opción es texto. */
        btn.className = 'option-btn' + (/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(String(value)) ? ' option-btn--word' : '');
        btn.textContent = value;
        btn.addEventListener('click', function () { groupsAnswer(btn, value, roundData); });
        gridEl.appendChild(btn);
      });

      groupsPaintGroupsProgress();
      groupsPaintStars();
    }

    /* The spoken/announced version of the prompt, without the coloured
       markup, so aria-label is readable. */
    /* Socratic hint. It must not give the answer away (SPEC: the hint
       teaches the mechanic, it does not resolve the round), so it says
       which group to look at, never what it multiplies to. */
    function groupsAnswer(btn, value, roundData) {
      if (gResolved) return;
      var isCorrect = value === roundData.correctValue;
      if (isCorrect) {
        gResolved = true;
        btn.classList.add('correct');
        App.utils.$$('#groupsOptions .option-btn').forEach(function (b) { b.disabled = true; });
        App.feedback.success($('#groupsFeedback'));
        groupsProgress.stars += 1;
        gCorrect += 1;
        groupsSave();
        groupsPaintStars();
        $('#groupsExplanation').textContent = groupsT('groupsCorrect');
        $('#groupsExplanationWrap').classList.remove('hidden');
        $('#groupsNext').classList.remove('hidden');
        $('#groupsNext').focus();
      } else {
        gAttempts += 1;
        if (gAttempts === 1) {
          $('#groupsExplanation').textContent = groupsT('groupsHintPrefix') +
            App.feedback.hintText(groupsPickHint(roundData.entry), btn.textContent);
        } else {
          $('#groupsExplanation').textContent = groupsT('groupsWrongPrefix') + roundData.correctValue;
        }
        $('#groupsExplanationWrap').classList.remove('hidden');
        btn.classList.add('encourage');
        btn.disabled = true;
        App.feedback.encourage($('#groupsFeedback'));
        /* Socratic lock: block the rest of the options until the
           person confirms, so the hint is read before trying again. */
        App.feedback.lockUntilAck(App.utils.$$('#groupsOptions .option-btn'), $('#groupsExplanationWrap'));
      }
    }

    function groupsNext() {
      gIdx += 1;
      if (gIdx >= items.length) groupsFinish();
      else groupsRender();
    }

    function groupsFinish() {
      groupsProgress.groupsCompleted[currentLevel.id] = (groupsProgress.groupsCompleted[currentLevel.id] || 0) + 1;
      groupsSave();
      /* If the round belonged to a chained group, jump straight to the
         next sub-level without going back to the menu (regla 13: the
         chain keeps the progression visible). */
      if (currentGroup && currentSubIdx + 1 < currentGroup.sublevels.length) {
        currentSubIdx += 1;
        chainBanner = groupsT('chainNext')
          .replace('{name}', groupsT('level.' + currentGroup.sublevels[currentSubIdx].group + 'Name'));
        groupsStartLevel(currentGroup.sublevels[currentSubIdx], true);
        return;
      }
      $('#groupsFinalSummary').textContent = groupsT('groupsFinal')
        .replace('{n}', gCorrect)
        .replace('{total}', items.length)
        .replace('{stars}', groupsProgress.stars).replace('{starsWord}', App.i18n.starsWord(groupsProgress.stars));
      groupsSwitchTo(gEndScreen);
      App.feedback.celebrate(App.i18n.t('core.roundComplete'));
    }

    /* ---- Wire-up of the groups walkthrough ---- */
    /* Leaves the walkthrough for the activities menu. The classic show() only
       toggles the menu, the game and the end screen, so every group screen is
       hidden here first; otherwise the menu would open under the walkthrough. */
    function leaveToMenu() {
      GROUPS_ALL_SCREENS.forEach(function (s) { s.classList.add('hidden'); });
      show(screenMenu);
      paintStars();
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
    $('#introNext').addEventListener('click', function () { groupsSwitchTo(gFamousScreen); });

    $('#famousPrev2').addEventListener('click', function () { famousStep(-1); });
    $('#famousNext2').addEventListener('click', function () { famousStep(1); });
    $('#famousPrevBtn').addEventListener('click', function () { groupsSwitchTo(gIntroScreen); });
    $('#famousNextBtn').addEventListener('click', function () { groupsSwitchTo(gReminderScreen); });

    $('#reminderBack').addEventListener('click', function () { groupsSwitchTo(gFamousScreen); });
    $('#referenceNext').addEventListener('click', function () { groupsSwitchTo(gLevelsScreen); });

    $('#levelsBack').addEventListener('click', function () { groupsSwitchTo(gReminderScreen); });
    /* Sub-implementación más natural: "Volver al menú" desde la
       cuadrícula de niveles debe devolver al menú de actividades
       (no al intro del recorrido) — esa es la única ruta en la que
       la persona dice "ya no quiero contar en grupos", y todo el
       recorrido se cierra. Las otras vueltas atrás son internas. */
    $('#levelsBackToMenu').addEventListener('click', leaveToMenu);

    $('#groupsBackLevels').addEventListener('click', function () { groupsSwitchTo(gLevelsScreen); });
    $('#groupsNext').addEventListener('click', groupsNext);
    $('#groupsReplay').addEventListener('click', function () { groupsStartLevel(currentLevel); });
    $('#groupsChooseLevel').addEventListener('click', function () { groupsSwitchTo(gLevelsScreen); });
    $('#groupsEndMenu').addEventListener('click', leaveToMenu);



    return { start: groupsStart };
  };
})();
