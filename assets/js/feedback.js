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
     Honors the "Sounds" preference from /settings/ (on by default:
     only muted if someone has explicitly turned it off). */
  var audioCtx = null;

  function soundsEnabled() {
    if (!window.App.storage) return true;
    return App.storage.get('prefs').sonidos !== false;
  }

  function tone(frequency, duration, type) {
    if (!soundsEnabled()) return;
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
    tone(523.25, 0.15);          /* C */
    setTimeout(function () { tone(659.25, 0.2); }, 120); /* E */
  }

  function encourageSound() {
    /* Soft and neutral, never harsh (rule 5) */
    tone(392, 0.2, 'sine');
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
   * Brief celebration screen (uses .celebration from components.css).
   * Creates the element if it doesn't exist. Hides itself after 2 s.
   * @param {string} message - e.g. '¡Rutina completada!'
   * @param {function} [after] - callback when it hides
   */
  function celebrate(message, after) {
    sessionRounds += 1;
    if (sessionRounds % 5 === 0) {
      var rest = window.App.i18n ? window.App.i18n.t('core.rest') : '';
      if (rest) message = message + ' ' + rest;
    }
    var layer = document.getElementById('app-celebration');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'app-celebration';
      layer.className = 'celebration hidden';
      layer.setAttribute('role', 'status');
      layer.innerHTML =
        '<div class="emoji">🎉</div>' +
        '<div class="message"></div>';
      document.body.appendChild(layer);
    }
    layer.querySelector('.message').textContent = message;
    layer.classList.remove('hidden');
    successSound();

    var duration = (window.App.utils && window.App.utils.reducedMotion()) ? 1200 : 2000;
    setTimeout(function () {
      layer.classList.add('hidden');
      if (after) after();
    }, duration);
  }

  function understoodText() {
    return window.App.i18n ? App.i18n.t('core.understood') : 'Entendido';
  }

  /**
   * Locks every not-yet-tried option button after a wrong answer (rule 12:
   * a reading pause, never a punishment). Buttons already disabled from an
   * earlier wrong try in this round are left as-is. Shows/reuses an
   * "Entendido" button inside `zone`, focuses it; clicking it re-enables
   * the buttons this call locked. Retries stay unlimited.
   * @param {Element[]|NodeList} buttons - option buttons of the current round
   * @param {Element} zone - wrap holding the pista/explicacion (or consejo) text
   * @param {function} [onConfirm] - called after the person taps Entendido
   */
  function lockUntilAck(buttons, zone, onConfirm) {
    var pending = Array.prototype.filter.call(buttons || [], function (b) { return !b.disabled; });
    pending.forEach(function (b) {
      b.disabled = true;
      b.classList.add('bloqueada');
    });
    if (!zone) return;
    var button = zone.querySelector('.btn-entendido');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-entendido';
      zone.appendChild(button);
    }
    button.textContent = understoodText();
    button.classList.remove('oculto');
    button.onclick = function () {
      pending.forEach(function (b) {
        b.disabled = false;
        b.classList.remove('bloqueada');
      });
      button.classList.add('oculto');
      if (onConfirm) onConfirm();
    };
    button.focus();
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

    return { start: start, add: add, consume: consume, clear: clear };
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

  window.App.feedback = {
    success: success,
    encourage: encourage,
    celebrate: celebrate,
    lockUntilAck: lockUntilAck
  };
})();
