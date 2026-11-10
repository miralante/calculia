/* ==========================================================================
   Calculia — Classic quiz engine: the answer, the hint and the next step of
   the one-question-at-a-time activities, the painting of a question and the
   activities menu they open from. Shared by the activities that predate the
   three-stage flow.

   The round state lives in one object per activity (App.classicRound()), so
   the shared functions and the activity read and write the same values:
   level, index, roundCorrect, answered, attempts and question.

   Exposes window.App.classicRound(), App.classicQuiz(host) and
   App.activityMenu(host). Needs feedback.js, the reinforcement session of
   the activity (App.reinforce.session) and utils.js for plainText and $$.
   ========================================================================== */
(function () {
  'use strict';

  window.App = window.App || {};

  /* The state of a round. */
  function classicRound() {
    return { level: null, index: 0, roundCorrect: 0, answered: false, attempts: 0, question: null };
  }

  /* host: {
       round:           the object from classicRound()
       progress:        the activity's progress object (it gets the stars)
       save(), paintStars()
       reinforcement:   the activity's App.reinforce.session
       feedback:        element of the feedback zone
       explanation:     element holding the hint or the explanation text
       explanationWrap: its wrapper
       btnNext:         the "next" button
       perRound:        questions in a round
       showExplanation(isCorrect), render(), endRound()
     }
     Returns { answer(op, btn), showHint(op), next() }. */
  function classicQuiz(host) {
    var R = host.round;
    var progress = host.progress;

    function showHint(op) {
      host.explanation.textContent = App.feedback.hintText(
        (R.question && R.question.hint) || App.i18n.t('hint'),
        op ? App.utils.plainText(op.html) : '');
      host.explanationWrap.classList.remove('hidden');
    }

    function answer(op, btn) {
      if (R.answered) return;
      if (op.correct) {
        host.showExplanation(true);
        R.answered = true;
        btn.classList.add('correct');
        App.feedback.success(host.feedback);
        progress.stars += 1;
        R.roundCorrect += 1;
        host.save();
        host.paintStars();
        App.feedback.markCorrect(btn, App.utils.$$('#options .option-btn'));
        host.btnNext.classList.remove('hidden');
        host.btnNext.focus();
      } else {
        R.attempts += 1;
        App.reinforce.add(R.level.id + ':' + R.index, R.question);
        var respuestaTrasPista = R.attempts > 1;
        showHint(op);
        /* Reveal the explanation only after the hint is acknowledged. */
        btn.classList.add('encourage');
        btn.disabled = true;
        App.feedback.encourage(host.feedback);
        App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), host.explanationWrap, function () {
          if (respuestaTrasPista) host.showExplanation(false);
        });
      }
    }

    function next() {
      if (host.reinforcement.active()) {
        if (!host.reinforcement.nextItem()) host.endRound();
        return;
      }
      R.index += 1;
      if (R.index >= host.perRound) {
        /* consume() returns [] when nothing was failed; otherwise it fires the
           callback that mounts the mini-round, which ends the round itself, so
           endRound must not also run here. */
        if (App.reinforce.consume().length === 0) host.endRound();
      } else {
        host.render();
      }
    }

    return { answer: answer, showHint: showHint, next: next };
  }

  /* host: { container: the element the menu is painted into,
             activities: DATA.activities (its key order is the menu order),
             open(id): called when a button is tapped }
     Returns { paint() }. */
  function activityMenu(host) {
    function paint() {
      var cont = host.container;
      cont.innerHTML = '';
      var grid = document.createElement('div');
      grid.className = 'menu-grid';
      Object.keys(host.activities).forEach(function (id) {
        var act = host.activities[id];
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-actividad';
        btn.innerHTML = '<span class="picto" aria-hidden="true">' + act.picto + '</span>' +
          '<span>' + App.i18n.t('activity.' + id + '.name') + '</span>' +
          '<span class="detail-card">' + App.i18n.t('activity.' + id + '.detail') + '</span>';
        btn.addEventListener('click', function () { host.open(id); });
        grid.appendChild(btn);
      });
      cont.appendChild(grid);
    }
    return { paint: paint };
  }

  /* host: {
       round:          the object from classicRound()
       reinforcement:  the activity's App.reinforce.session
       els:            { prompt, visual, legend, options, feedback, explanationWrap,
                         explanation, btnNext, progressFill, progressText }
       perRound:       questions in a round
       generate(level, index): the question for that position of the level
       answer(op, btn): the activity's answer (from classicQuiz)
       paintStars(), showGame()
     }
     Returns { startRound(level), paintQuestion(fixed), render() }.
     paintQuestion(fixed) replays `fixed` (a question from the reinforce queue);
     without it a new one is generated for the current level. */
  function classicPainter(host) {
    var R = host.round;
    var reinforcement = host.reinforcement;
    var el = host.els;

    function paintQuestion(fixed) {
      R.question = fixed || host.generate(R.level, R.index);
      R.answered = false;
      R.attempts = 0;
      var q = R.question;

      el.prompt.textContent = q.prompt;
      el.visual.innerHTML = q.visual || '';
      el.visual.classList.toggle('hidden', !q.visual);
      if (q.visualAria) {
        el.visual.setAttribute('role', 'img');
        el.visual.setAttribute('aria-label', q.visualAria);
      } else {
        el.visual.removeAttribute('role');
        el.visual.removeAttribute('aria-label');
      }
      el.legend.textContent = q.legend || '';
      el.legend.classList.toggle('hidden', !q.legend);

      el.feedback.textContent = '';
      el.feedback.className = 'feedback';
      el.explanationWrap.classList.add('hidden');
      el.explanation.textContent = '';
      el.btnNext.classList.add('hidden');

      el.options.innerHTML = '';
      el.options.classList.toggle('options-row', !!q.inline);
      q.options.forEach(function (op) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.innerHTML = op.html;
        if (op.aria) btn.setAttribute('aria-label', op.aria);
        btn.addEventListener('click', function () { host.answer(op, btn); });
        el.options.appendChild(btn);
      });

      el.progressFill.style.width = (reinforcement.active()
        ? ((reinforcement.position() + 1) / reinforcement.total())
        : (R.index / host.perRound)) * 100 + '%';
      el.progressText.textContent = '';
      host.paintStars();
    }

    function render() { paintQuestion(null); }

    function startRound(nv) {
      R.level = nv;
      R.index = 0;
      R.roundCorrect = 0;
      App.utils.drawRoundReset();
      reinforcement.begin();
      host.showGame();
      render();
    }

    return { startRound: startRound, paintQuestion: paintQuestion, render: render };
  }

  window.App.classicRound = classicRound;
  window.App.classicQuiz = classicQuiz;
  window.App.activityMenu = activityMenu;
  window.App.classicPainter = classicPainter;
})();
