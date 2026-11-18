/* ============================================================
   Calculia — Temporizador.
   The person picks a time. The count goes UP from 00:00 towards it.
   When the time is reached, an alarm rings like a clock alarm: beeps,
   vibration (where the device has it) and a card that says so in words.
   The alarm stops only when the person presses the button.

   Timing uses the clock (Date.now), not a counter of ticks, so a
   background tab that slows the timer does not make the count wrong.
   Data in data.js. Texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;
  var $ = App.utils.$;

  var screenPick = $('#screenPick');
  var screenRun = $('#screenRun');
  var choicesEl = $('#choices');
  var elapsedEl = $('#elapsed');
  var goalEl = $('#goal');
  var fillEl = $('#timerFill');
  var barEl = $('#timerBar');
  var btnStart = $('#btnStart');
  var btnPause = $('#btnPause');
  var btnStop = $('#btnStop');
  var alarmEl = $('#alarm');
  var alarmTextEl = $('#alarmText');
  var btnSilence = $('#btnSilence');
  var btnAgain = $('#btnAgain');

  var TICK_MS = 200;

  var targetMs = 0;      // the chosen time, in ms
  var elapsedMs = 0;     // time counted so far, in ms
  var running = false;
  var lastTick = 0;
  var tickTimer = null;

  var audioCtx = null;   // created on a tap, so browsers let it sound
  var ringTimer = null;
  var ringCutTimer = null;

  /* "05:00", or "1:00:00" from one hour on. */
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function format(ms) {
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    return h > 0 ? h + ':' + pad(m) + ':' + pad(sec) : pad(m) + ':' + pad(sec);
  }

  function show(screen) {
    [screenPick, screenRun].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* The sound needs one tap first. Each tap on a choice runs this. */
  function unlockAudio() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) {
      audioCtx = null;
    }
  }

  function render() {
    var shown = Math.min(elapsedMs, targetMs);
    elapsedEl.textContent = format(shown);
    var pct = targetMs > 0 ? Math.min(100, (shown / targetMs) * 100) : 0;
    fillEl.style.width = pct + '%';
    barEl.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  function startTicking() {
    running = true;
    lastTick = Date.now();
    tickTimer = setInterval(tick, TICK_MS);
  }

  function stopTicking() {
    running = false;
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = null;
  }

  function tick() {
    if (!running) return;
    var now = Date.now();
    elapsedMs += now - lastTick;
    lastTick = now;
    if (elapsedMs >= targetMs) {
      elapsedMs = targetMs;
      render();
      finish();
      return;
    }
    render();
  }

  function togglePause() {
    if (!alarmEl.classList.contains('hidden')) return;
    if (running) {
      stopTicking();
      btnPause.textContent = t('resume');
    } else {
      startTicking();
      btnPause.textContent = t('pause');
    }
  }

  /* A choice is picked: the count is ready, at 00:00, and waits for the person
     to press Empezar. Nothing counts until then. */
  function prepare(choice) {
    stopRinging();
    stopTicking();
    targetMs = choice.seconds * 1000;
    elapsedMs = 0;
    goalEl.textContent = t('goal').replace('{t}', format(targetMs));
    barEl.setAttribute('aria-valuemax', '100');
    alarmEl.classList.add('hidden');
    btnStart.classList.remove('hidden');
    btnPause.classList.add('hidden');
    btnStop.classList.remove('hidden');
    btnPause.textContent = t('pause');
    show(screenRun);
    render();
  }

  /* The person presses Empezar: the count starts. The tap also unlocks the sound. */
  function begin() {
    unlockAudio();
    btnStart.classList.add('hidden');
    btnPause.classList.remove('hidden');
    btnPause.textContent = t('pause');
    startTicking();
  }

  /* The time is up: stop counting and ring. */
  function finish() {
    stopTicking();
    btnStart.classList.add('hidden');
    btnPause.classList.add('hidden');
    btnStop.classList.add('hidden');
    alarmTextEl.textContent = t('alarmText').replace('{t}', format(targetMs));
    alarmEl.classList.remove('hidden');
    alarmEl.focus();
    startRinging();
  }

  /* ---- Alarm: beeps and vibration ---- */

  function beep(delaySec, freq) {
    if (!audioCtx) return;
    var t0 = audioCtx.currentTime + delaySec;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.32);
  }

  /* Three beeps, the last one higher: the rhythm of a clock alarm. */
  function ringOnce() {
    beep(0, 880);
    beep(0.4, 880);
    beep(0.8, 1100);
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
  }

  function startRinging() {
    ringOnce();
    ringTimer = setInterval(ringOnce, DATA.ringEverySeconds * 1000);
    /* The sound stops by itself after a while, so it never rings for good;
       the card stays on screen until the person leaves it. */
    ringCutTimer = setTimeout(stopRinging, DATA.ringMaxSeconds * 1000);
  }

  function stopRinging() {
    if (ringTimer) clearInterval(ringTimer);
    if (ringCutTimer) clearTimeout(ringCutTimer);
    ringTimer = null;
    ringCutTimer = null;
    if (navigator.vibrate) navigator.vibrate(0);
  }

  /* Back to the choices, from anywhere. */
  function backToPick() {
    stopRinging();
    stopTicking();
    alarmEl.classList.add('hidden');
    show(screenPick);
  }

  /* ---- Choices ---- */
  DATA.choices.forEach(function (choice) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn timer-choice';
    btn.innerHTML = '<span class="picto" aria-hidden="true">' + choice.picto + '</span>' +
      '<span class="timer-choice-name">' + t('choice.' + choice.id) + '</span>';
    btn.addEventListener('click', function () { prepare(choice); });
    choicesEl.appendChild(btn);
  });

  /* ---- Events ---- */
  btnStart.addEventListener('click', begin);
  btnPause.addEventListener('click', togglePause);
  btnStop.addEventListener('click', backToPick);
  btnSilence.addEventListener('click', stopRinging);
  btnAgain.addEventListener('click', backToPick);

  show(screenPick);
})();
