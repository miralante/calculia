/* ============================================================
   Calculia — Numbers: the free-exploration counter.
   A level that is not a question: a counter that reads a number aloud and in words. It owns its
   drawing, its buttons and its state.
   The page gives it what it needs in the host object: the shared progress, save(), paintStars(),
   endRound(), show(), the current level, and the elements of the round that it reuses.
   ============================================================ */
(function () {
  'use strict';
  var $ = App.utils.$;
  var M = App.numbersModel;
  var POS_CLASS = M.POS_CLASS, paintNumber = M.paintNumber, counterSay = M.counterSay, numberToWords = M.numberToWords;
  /* host: { progress, save(), paintStars(), endRound(), show(), level(), screenMenu, el: {...} } */
  App.numbersCounter = function (host) {
    var progress = host.progress;
    var save = host.save;
    var paintStars = host.paintStars;
    var endRound = host.endRound;
    var feedbackEl = host.el.feedbackEl, progressBar = host.el.progressBar, quizCard = host.el.quizCard,
      optionsEl = host.el.optionsEl, btnNext = host.el.btnNext, progressFill = host.el.progressFill,
      progressText = host.el.progressText, counterUI = host.el.counterUI;
    var counterNumber = $('#counterNumber');
    var counterSep = $('#counterSep');
    var counterSepLabel = $('#counterSepLabel');
    var counterAudio = $('#counterAudio');
    var counterReset = $('#counterReset');
    var counterExit = $('#counterExit');
    var counterHint = $('#counterHint');
    var counterGroups = $('#counterGroups');
    var counterGroupsLabel = $('#counterGroupsLabel');
    var counterWords = $('#counterWords');
    var counterWordsLabel = $('#counterWordsLabel');
    var counterWritten = $('#counterWritten');
    var counterValue = 0;
    var counterMax = 0;
    var counterShowSep = true;
    var counterColorGroups = false;
    var counterShowWords = false;

    function renderCounter(q) {
      counterValue = 0;
      counterMax = q.max;
      counterShowSep = true;
      counterColorGroups = false;
      counterShowWords = false;
      counterWords.setAttribute('aria-pressed', 'false');
      counterWordsLabel.textContent = App.i18n.t('gen.counterWordsOff');
      counterUI.classList.remove('hidden');
      counterHint.textContent = App.i18n.t('gen.counterHint');
      /* The progress bar / quiz card / options belong to the quiz flow;
         they're hidden while the counter is shown so the screen reads
         as a free exploration surface, not a question. */
      progressBar.classList.add('hidden');
      quizCard.classList.add('hidden');
      optionsEl.classList.add('hidden');
      btnNext.classList.add('hidden');
      feedbackEl.textContent = '';
      feedbackEl.className = 'feedback';
      /* progressText stays at 0/6; the bar is hidden, so it isn't read. */
      progressFill.style.width = '0%';
      progressText.textContent = '';
      paintCounter();
      paintCounterToggle();
      paintStars();
    }

    function paintCounter() {
      counterNumber.innerHTML = paintCounterNumber(counterValue);
      counterWritten.textContent = counterShowWords ? numberToWords(counterValue) : '';
      counterWritten.classList.toggle('hidden', !counterShowWords);
      /* Disable "-" buttons at 0; the "−" buttons share the .data-step
         attribute that starts with "-". */
      App.utils.$$('#counterUI .btn-counter[data-step]').forEach(function (b) {
        var step = parseInt(b.getAttribute('data-step'), 10);
        var wouldBeNeg = (counterValue + step) < 0;
        var wouldBeOver = (counterValue + step) > counterMax;
        b.disabled = wouldBeNeg || wouldBeOver;
      });
    }

    function paintCounterToggle() {
      /* The button shows what the current state LOOKS LIKE; clicking
         it switches to the other state. The label is built from
         strings.es/en.js so it stays localized. */
      counterSepLabel.textContent = counterShowSep
        ? App.i18n.t('gen.counterSepOn')
        : App.i18n.t('gen.counterSepOff');
      counterSep.setAttribute('aria-pressed', String(counterShowSep));
      /* The 'colour groups' toggle is only meaningful when the
         thousands separator is hidden: with the separator on, the
         dot/label already does the grouping visually. Hide the
         button otherwise to keep the surface uncluttered. */
      if (counterShowSep) {
        counterGroups.classList.add('hidden');
      } else {
        counterGroups.classList.remove('hidden');
        counterGroupsLabel.textContent = counterColorGroups
          ? App.i18n.t('gen.counterGroupsOn')
          : App.i18n.t('gen.counterGroupsOff');
        counterGroups.setAttribute('aria-pressed', String(counterColorGroups));
      }
    }

    /* Three paint variants for the displayed number, chosen from the
       current toggle state:
         - showSep              —  digit groups with . separator + label
         - !showSep && colorGroups —  digit groups with a coloured background
                                     per 3-digit chunk (no separator glyph)
         - !showSep && !colorGroups —  one continuous digit string */
    function paintCounterNumber(n) {
      if (counterShowSep) return paintNumber(n, { labels: true });
      var s = String(n);
      var groups = [];
      for (var i = s.length; i > 0; i -= 3) groups.unshift(s.slice(Math.max(0, i - 3), i));
      var html = '<span class="pv-number">';
      for (var g = 0; g < groups.length; g++) {
        var body = '';
        for (var j = 0; j < groups[g].length; j++) {
          var pos = groups[g].length - 1 - j;
          body += '<span class="' + POS_CLASS[pos] + '">' + groups[g][j] + '</span>';
        }
        if (counterColorGroups && groups.length > 1) {
          /* Cycle the tint across groups (g0 leftmost = lowest group).
             Three hues is enough to tell adjacent groups apart without
             becoming a rainbow. */
          html += '<span class="num-group num-group-' + (g % 3) + '">' + body + '</span>';
        } else {
          html += body;
        }
      }
      html += '</span>';
      return html;
    }

    function counterAddStep(step) {
      var next = counterValue + step;
      if (next < 0 || next > counterMax) return;
      counterValue = next;
      paintCounter();
    }

    function exitCounter() {
      progress.stars += 1;
      save();
      paintStars();
      endRound();
    }

    /* Wire up the counter buttons once (the elements persist). */
    App.utils.$$('#counterUI .btn-counter[data-step]').forEach(function (b) {
      b.addEventListener('click', function () {
        var step = parseInt(b.getAttribute('data-step'), 10);
        counterAddStep(step);
      });
    });
    counterReset.addEventListener('click', function () {
      counterValue = 0;
      paintCounter();
    });
    counterSep.addEventListener('click', function () {
      /* Toggle the separator state, then redraw both the toggle label
         (which button shows, whether the colour-groups toggle is
         visible, and its label) and the number itself. Turning the
         separator ON makes the colour-groups cue redundant, so we
         force it OFF to keep the two toggles mutually consistent. */
      counterShowSep = !counterShowSep;
      if (counterShowSep) counterColorGroups = false;
      paintCounterToggle();
      paintCounter();
    });
    counterGroups.addEventListener('click', function () {
      if (counterShowSep) return; /* safety: toggle is hidden in this state */
      counterColorGroups = !counterColorGroups;
      paintCounterToggle();
      paintCounter();
    });
    counterAudio.addEventListener('click', function () {
      counterSay(counterValue);
    });
    counterExit.addEventListener('click', function () { exitCounter(); });
    /* Localized aria-label for the audio button. Setting it after the
       elements are wired keeps the HTML lean (no data-i18n-aria needed)
       while still going through the i18n table. */
    counterAudio.setAttribute('aria-label', App.i18n.t('gen.counterAudioAria'));
    counterReset.textContent = App.i18n.t('gen.counterResetLabel');
    counterExit.textContent = App.i18n.t('gen.counterExitLabel');
    counterGroups.setAttribute('aria-label', App.i18n.t('gen.counterGroupsAria'));
    counterWordsLabel.textContent = App.i18n.t('gen.counterWordsOff');
    counterWords.setAttribute('aria-label', App.i18n.t('gen.counterWordsAria'));
    counterWords.addEventListener('click', function () {
      counterShowWords = !counterShowWords;
      counterWords.setAttribute('aria-pressed', String(counterShowWords));
      counterWordsLabel.textContent = App.i18n.t(counterShowWords ? 'gen.counterWordsOn' : 'gen.counterWordsOff');
      paintCounter();
    });

    return { renderCounter: renderCounter };
  };
})();
