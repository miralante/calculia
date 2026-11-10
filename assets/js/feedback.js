/* ==========================================================================
   Calculia — Positive reinforcement and encouragement messages
   Exposes window.App.feedback.success(zone) / .encourage(zone) / .celebrate(msg) /
   .lockUntilAck(buttons, zone, onConfirm)
   Rules 5 and 6 of CLAUDE.md: mistakes are never punished; feedback <= 2 s.
   Messages follow the active language (App.i18n.pick). Requires utils.js and i18n.js.
   ========================================================================== */
(function () {
  'use strict';

  window.App = window.App || {};

  function pickRandom(key) {
    if (window.App.i18n) return window.App.i18n.pick(key);
    return '';
  }

  /* Soft sound with Web Audio (no audio files). Fails silently.
     Honors the "Sounds" preference from /config/ (on by default:
     only muted if someone has explicitly turned it off). */
  var audioCtx = null;

  function sharedSoundEnabled(kind) {
    try {
      var saved = JSON.parse(localStorage.getItem('miralante:sounds') || 'null');
      if (saved && typeof saved[kind] === 'boolean') return saved[kind];
    } catch (e) { /* ignore */ }
    return null;
  }

  function soundsEnabled(kind) {
    var shared = sharedSoundEnabled(kind);
    if (shared !== null) return shared;
    if (!window.App.storage) return kind !== 'error';
    var prefs = App.storage.get('prefs');
    return kind === 'error' ? prefs.sonidos === true : prefs.sonidos !== false;
  }

  function tone(frequency, duration, type, kind) {
    if (!soundsEnabled(kind || 'success')) return;
    try {
      if (!audioCtx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audioCtx = new AC();
      }
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) { /* silent */ }
  }

  function successSound() {
    tone(523.25, 0.15, 'sine', 'success');          /* C */
    setTimeout(function () { tone(659.25, 0.2, 'sine', 'success'); }, 120); /* E */
  }

  function encourageSound() {
    /* Soft and neutral, never harsh (rule 5) */
    tone(180, 0.12, 'triangle', 'error');
  }

  /**
   * Positive reinforcement in a feedback zone (element with aria-live).
   * @param {Element} [zona] - element to write the message into
   * @returns {string} the message used
   */
  function success(zone) {
    var msg = pickRandom('feedback.success');
    if (zone) {
      zone.textContent = '⭐ ' + msg;
      zone.classList.remove('encourage');
      zone.classList.add('success');
    }
    successSound();
    return msg;
  }

  /**
   * Encouragement message after a mistake. Never punitive.
   * @param {Element} [zona]
   * @returns {string} the message used
   */
  function encourage(zone) {
    /* Lets assets/js/achievements.js know the round had a mistake
       (the "perfect round" badge). Nothing is stored here. */
    try { document.dispatchEvent(new CustomEvent('calculia:mistake')); } catch (e) { /* ignore */ }
    var msg = pickRandom('feedback.encourage');
    if (zone) {
      zone.textContent = msg;
      zone.classList.remove('success');
      zone.classList.add('encourage');
    }
    encourageSound();
    return msg;
  }

  /* Rounds completed in this page session (rule 5: never in
     localStorage, never pressure — just a kind phrase every 5 rounds). */
  var sessionRounds = 0;

  /**
   * Socratic hint text after a wrong answer. A template may hold
   * «{elegida}»: it is replaced by the answer the person just tried, so the
   * hint can say why that one does not fit. Without a text label (a picture
   * option) the phrase "esta opción" / "this option" is used instead.
   * @param {string} template - hint text, from the question or the locale
   * @param {string} [chosen] - plain text of the answer just tried
   * @returns {string} the hint to show
   */
  function hintText(template, chosen) {
    var text = template || '';
    if (text.indexOf('{elegida}') === -1) return text;
    var label = (chosen || '').trim();
    var fallback = window.App.i18n ? App.i18n.t('core.thisOption') : 'this option';
    return text
      .replace('«{elegida}»', label ? '«' + label + '»' : fallback)
      .replace('{elegida}', label || fallback);
  }

  /* Failure reinforcement at the end of the round. Shared pattern
     used by every activity that wants to replay, in a mini-round,
     the items the person failed in the normal round.

     Design:
       - start(onReinforce) — the activity calls this when starting
         the normal round. It receives a callback that is invoked
         when the mini-round needs to be launched, with the list of
         payloads of the failed items.
       - add(key, payload?) — the activity calls this when an item
         fails. The key must be stable across renders (the activity
         decides what counts as a "signature": idx+levelId,
         mode+roman, etc.). The optional payload is what the activity
         will need to render the item in the mini-round (question
         object, entry, etc.).
       - consume() — the activity calls this in its next(), right
         before finish(). If there are items, fires onReinforce(pay-
         loads) and returns the list. If not, returns [].
       - clear() — the activity calls this when closing the mini-
         round to reset the state.

     State lives only for the session (not in localStorage): like
     sessionRounds, this is a contextual learning aid, not a long-
     term marker.

     The mini-round itself is rendered by the activity (each has its
     own options structure, feedback and end-screen). The core only
     coordinates "what is reinforced" and "when the reinforcement
     starts and ends". */
  function makeReinforce() {
    var entries = [];
    var seen = new Set();
    var onReinforce = null;

    function start(callback) {
      entries = [];
      seen.clear();
      onReinforce = callback || null;
    }

    function add(key, payload) {
      if (seen.has(key)) return;
      seen.add(key);
      entries.push({ key: key, payload: payload });
    }

    function consume() {
      if (entries.length === 0) return [];
      var list = entries.slice();
      if (onReinforce) onReinforce(list);
      return list;
    }

    function clear() {
      entries = [];
      seen.clear();
    }

    /* The progress bar of a mini-round: the item on screen out of the
       items of the mini-round. `session` is an App.reinforce.session. */
    function paintBar(fill, session) {
      fill.style.width = (((session.position() + 1) / session.total()) * 100) + '%';
    }

    return { start: start, add: add, consume: consume, clear: clear, paintBar: paintBar };
  }

  window.App.reinforce = makeReinforce();

  /* Floating reinforcement banner: created once on first use and
     reused. Each activity calls setBanner(visible, text) to show /
     hide / update the banner without touching its own HTML or
     adding CSS per activity. Styles are inline so they don't depend
     on tokens.css (which exists, but the banner must also work on
     narrow screens). */
  var reinforceBanner = null;
  function ensureBanner() {
    if (reinforceBanner) return reinforceBanner;
    reinforceBanner = document.createElement('div');
    reinforceBanner.id = 'app-reinforce-banner';
    reinforceBanner.setAttribute('role', 'status');
    reinforceBanner.setAttribute('aria-live', 'polite');
    reinforceBanner.style.cssText = [
      'position:fixed', 'top:0', 'left:50%', 'transform:translateX(-50%)',
      'z-index:9999', 'display:none',
      'background:#FFF6E5', 'color:#7A4A00',
      'border:2px solid #E0A040', 'border-radius:0 0 12px 12px',
      'padding:8px 16px', 'font-weight:700', 'font-size:14px',
      'box-shadow:0 2px 6px rgba(0,0,0,0.12)',
      'max-width:90vw', 'text-align:center'
    ].join(';');
    document.body.appendChild(reinforceBanner);
    return reinforceBanner;
  }

  function setBanner(visible, text) {
    var b = ensureBanner();
    b.textContent = text || '';
    b.style.display = visible ? 'block' : 'none';
  }

  App.reinforce.banner = {
    show: function (text) { setBanner(true, text); },
    hide: function () { setBanner(false, ''); },
    set: function (text) { setBanner(true, text); }
  };

  /* A reinforcement session for one activity. It keeps the mini-round state
     (the failed items, which one is on screen, whether the mini-round runs)
     that each activity used to declare by hand:

       var reinforcement = App.reinforce.session({
         titleKey: 'reinforceTitle',   // banner title, looked up with App.i18n.t
         introKey: 'reinforceIntro',   // banner line; {n} is the number of items
         show: paintQuestion           // paints one item of the mini-round
       });

     begin()     at the start of a round: clears the state and the banner, and
                 arms App.reinforce.start so that consume() starts the mini-round.
     active()    true while the mini-round runs.
     position()  0-based index of the item on screen.
     total()     number of items in the mini-round.
     nextItem()  on Next while active(): shows the next item and returns true,
                 or ends the mini-round (clears the state and the banner) and
                 returns false. The activity then ends the round itself. */
  function makeReinforceSession(options) {
    var items = [];
    var index = 0;
    var running = false;

    function startMini(fallos) {
      items = fallos.map(function (f) { return f.payload; });
      index = 0;
      running = true;
      App.reinforce.banner.set(
        App.i18n.t(options.titleKey) + ' — ' +
        App.i18n.t(options.introKey).replace('{n}', items.length)
      );
      options.show(items[0]);
    }

    function begin() {
      items = [];
      index = 0;
      running = false;
      App.reinforce.banner.hide();
      App.reinforce.start(startMini);
    }

    function nextItem() {
      index += 1;
      if (index < items.length) {
        options.show(items[index]);
        return true;
      }
      running = false;
      App.reinforce.clear();
      App.reinforce.banner.hide();
      return false;
    }

    return {
      begin: begin,
      active: function () { return running; },
      position: function () { return index; },
      total: function () { return items.length; },
      nextItem: nextItem
    };
  }

  App.reinforce.session = makeReinforceSession;

  /* The star just earned: "Ya tienes X estrellas · A por las Y estrellas" goes
     into the success message on screen, not into the header. storage.js fires
     'calculia:progress' on every save ({ before, after } of the activity), and
     the star is already in `after` by then. stars-engine.js builds the line. */
  function starLineIntoSuccess(e) {
    var d = e && e.detail;
    if (!d || !d.before || !d.after || !window.MiralanteStars) return;
    var gained = (Number(d.after.stars) || 0) - (Number(d.before.stars) || 0);
    if (gained <= 0) return;
    var zone = document.getElementById('feedback');
    if (!zone || !zone.classList.contains('success')) zone = document.querySelector('.feedback.success');
    if (!zone) return;
    var old = zone.querySelector('.stars-goal');
    if (old) old.remove();
    var span = document.createElement('span');
    span.className = 'stars-goal';
    span.textContent = window.MiralanteStars.line(App.storage.totalStars(), {
      reached: App.i18n.t('core.starsReached'),
      goal: App.i18n.t('core.starsGoal')
    });
    zone.appendChild(span);
  }
  document.addEventListener('calculia:progress', starLineIntoSuccess);

  window.App.feedback = {
    success: success,
    encourage: encourage,
    hintText: hintText
  };
  /* Closing celebration hooks (the celebrate block below calls them). */
  function playCelebrationSound() { successSound(); }
  function restDue() { sessionRounds += 1; return sessionRounds % 5 === 0; }
  function restDone() {}

  /* suite:answer-round:begin
     Miralante answer round. ONE definition for every suite app.
     Canonical source: apptonomia/scripts/suite/answer-round.js. The block between
     the begin/end markers is copied byte-for-byte into assets/js/feedback.js of
     each app by apptonomia/scripts/sync-answer-round.js. Never edit a copy by hand.

     Rules (the same in every app):
       - Right answer: the chosen answer stays, the other answers are hidden, and
         the app says it is correct (markCorrect + the app's own success message).
       - Wrong answer: the answers are hidden while the socratic hint is shown;
         «Entendido» brings the answers back. The wrong answer stays disabled.
       - Mistakes are never punished and retries are unlimited. */

  /* The label of the acknowledgement button, in the active language. */
  function textoEntendido() {
    return window.App.i18n ? App.i18n.t('core.understood') : 'Entendido';
  }

  /* Keeps the reading pause in a stable place, before the option group.
     Activities wrap their options differently, so find the nearest ancestor
     that shares a parent with the zone and put the zone in front of it. */
  function colocarZonaAntesDeOpciones(buttons, zona) {
    var primero = buttons && buttons.length ? buttons[0] : null;
    if (!primero || !zona || !zona.parentNode) return;

    var grupoOpciones = primero;
    while (grupoOpciones.parentNode && grupoOpciones.parentNode !== zona.parentNode) {
      grupoOpciones = grupoOpciones.parentNode;
    }
    if (grupoOpciones.parentNode === zona.parentNode) {
      zona.parentNode.insertBefore(zona, grupoOpciones);
    }
  }

  /**
   * Pauses the round after a wrong answer. While the hint shows, the round's
   * answers are hidden. Buttons already disabled from an earlier wrong try in
   * this round stay disabled. Shows/reuses an «Entendido» button inside `zona`
   * and focuses it; tapping it shows the answers again, hides the hint and
   * re-enables the buttons this call locked.
   * @param {Element|Element[]|NodeList} buttons - answers of the current round
   * @param {Element} zona - wrap holding the hint (or explanation) text
   * @param {function} [alConfirmar] - called after the person taps «Entendido»
   */
  function lockUntilAck(buttons, zona, alConfirmar) {
    var opciones = buttons && typeof buttons.length === 'number' ? buttons : (buttons ? [buttons] : []);
    var pendientes = Array.prototype.filter.call(opciones, function (b) {
      return b && !b.disabled && b.getAttribute('aria-disabled') !== 'true';
    });
    /* `disabled` is enough for native buttons, but some activities use custom
       interactive elements whose click handlers can still run. Capture the
       events as well so no answer can be picked while the pause waits. */
    function bloquearEvento(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    pendientes.forEach(function (b) {
      b.disabled = true;
      b.setAttribute('aria-disabled', 'true');
      b.classList.add('bloqueada');
      b.addEventListener('click', bloquearEvento, true);
      b.addEventListener('keydown', bloquearEvento, true);
    });
    if (!zona) return;
    colocarZonaAntesDeOpciones(opciones, zona);
    /* The answers are hidden while the hint shows, not only disabled. */
    var ocultas = Array.prototype.filter.call(opciones, function (b) {
      return b && !b.classList.contains('hidden');
    });
    ocultas.forEach(function (b) { b.classList.add('hidden'); });
    var boton = zona.querySelector('.btn-entendido');
    if (!boton) {
      boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'btn btn-entendido';
      zona.appendChild(boton);
    }
    boton.textContent = textoEntendido();
    boton.classList.remove('hidden');
    boton.onclick = function () {
      pendientes.forEach(function (b) {
        b.removeEventListener('click', bloquearEvento, true);
        b.removeEventListener('keydown', bloquearEvento, true);
        b.disabled = false;
        b.removeAttribute('aria-disabled');
        b.classList.remove('bloqueada');
      });
      ocultas.forEach(function (b) { b.classList.remove('hidden'); });
      boton.classList.add('hidden');
      zona.classList.add('hidden');
      if (alConfirmar) alConfirmar();
    };
    boton.focus();
  }

  /**
   * A right answer is final: the chosen answer stays as it is, the other answers
   * are hidden and none of them can be pressed. The caller marks the answer
   * and says it is correct.
   * @param {Element} control - the answer the person chose
   * @param {Element|Element[]|NodeList} buttons - all the answers of the round
   */
  function markCorrect(control, buttons) {
    var opciones = buttons && typeof buttons.length === 'number' ? buttons : (buttons ? [buttons] : []);
    Array.prototype.forEach.call(opciones, function (b) {
      if (!b || b === control) return;
      b.classList.add('hidden');
      b.disabled = true;
      b.setAttribute('aria-disabled', 'true');
    });
    if (control) {
      control.disabled = true;
      control.setAttribute('aria-disabled', 'true');
    }
  }

  window.App.feedback.lockUntilAck = lockUntilAck;
  window.App.feedback.markCorrect = markCorrect;
  /* suite:answer-round:end */

  /* suite:reward-screen:begin
     Miralante closing screen of an activity. ONE definition for every suite app.
     Canonical source: apptonomia/scripts/suite/reward-screen.js. The block between
     the begin/end markers is copied byte for byte into assets/js/feedback.js of each
     app by apptonomia/scripts/sync-answer-round.js. Never edit a copy by hand.

     The reward is the stars won, with a short summary. Nothing else is shown here
     (no money, no points, no ranking). */

  /**
   * Writes the closing reward into `container`, replacing what it held.
   * @param {Element} container - element that holds the summary of the round
   * @param {number} stars - stars the person has
   * @param {string} summary - the summary sentence of the round
   */
  function paintReward(container, stars, summary) {
    if (!container) return;
    container.textContent = '';
    var estrellas = document.createElement('span');
    estrellas.className = 'reward-stars';
    estrellas.textContent = '⭐ ' + stars;
    var texto = document.createElement('span');
    texto.className = 'reward-summary';
    texto.textContent = summary || '';
    container.appendChild(estrellas);
    container.appendChild(texto);
  }

  window.App.feedback.paintReward = paintReward;
  /* suite:reward-screen:end */

  /* suite:celebrate:begin
     Miralante closing celebration. ONE definition for every suite app.
     Canonical source: apptonomia/scripts/suite/celebrate.js. The block between the
     begin/end markers is copied byte for byte into assets/js/feedback.js of each app
     (and into the new-app template) by apptonomia/scripts/sync-answer-round.js.
     Never edit a copy by hand.

     Each app supplies three small hooks OUTSIDE this block, in the same file:
       playCelebrationSound()  plays the app's success sound
       restDue()               true when this celebration carries the rest reminder
                               (counts the rounds, or the minutes, as the app decides)
       restDone()              resets the rest reminder after it was shown
     The overlay, its text and its timing are the same everywhere. */

  /**
   * Shows the closing overlay with `message` until the reading time has passed,
   * then hides it and calls `after`. The time is fixed by the length of the
   * message, so a long closing message (name, transfer line, progress) can be read.
   * @param {string} message - the closing text
   * @param {function} [after] - called when the overlay hides
   * @returns {number} how long the overlay stays up, in ms
   */
  function celebrate(message, after) {
    if (restDue()) {
      var rest = window.App.i18n ? window.App.i18n.t('core.rest') : '';
      if (rest) message = message + ' ' + rest;
      restDone();
    }
    var layer = document.getElementById('app-celebration');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'app-celebration';
      layer.className = 'celebration hidden';
      layer.setAttribute('role', 'status');
      layer.innerHTML = '<div class="emoji" aria-hidden="true">⭐</div><div class="message"></div>';
      document.body.appendChild(layer);
    }
    layer.querySelector('.message').textContent = message;
    layer.classList.remove('hidden');
    playCelebrationSound();

    var reduced = !!(window.App.utils && window.App.utils.reducedMotion());
    var duration = Math.min(10000, (reduced ? 2500 : 3000) + String(message).length * 60);
    setTimeout(function () {
      layer.classList.add('hidden');
      if (after) after();
    }, duration);
    return duration;
  }

  window.App.feedback.celebrate = celebrate;
  /* suite:celebrate:end */

})();
