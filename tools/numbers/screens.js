/* ============================================================
   Calculia — Numbers: the screens around the test.
   The exposition and the real-life screens of an activity, and the signed-temperature mission
   of 'positivos y negativos': the screens that come before the test or stand beside it. This
   file owns them and their buttons. The page gives it what it needs in the host object: the
   screens, show(), paintStars(), the current activity, and two starts (the round of this
   activity, and the positivos y negativos round after the last mission).
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;

  /* host: { show(screen), paintStars(), current(), startCurrentRound(), startPositivosNegativos(),
     screens: { menu, expo, real, signedIntro, signedReal, signedTemp } } */
  App.numbersScreens = function (host) {
    var show = host.show;
    var paintStars = host.paintStars;
    var screenMenu = host.screens.menu;
    var screenExpo = host.screens.expo;
    var screenReal = host.screens.real;
    var signedIntroScreen = host.screens.signedIntro;
    var signedRealScreen = host.screens.signedReal;
    var signedTempScreen = host.screens.signedTemp;
    var signedNumberline = $('#signedNumberline');
    var signedRealList = $('#signedRealList');
    var signedTempGoal = $('#signedTempGoal');
    var signedTempNumber = $('#signedTempNumber');
    var signedTempSign = $('#signedTempSign');
    var signedTempMercury = $('#signedThermometerMercury');
    var signedTempSuccess = $('#signedTempSuccess');
    var signedTempNext = $('#signedTempNext');
    var signedTempReset = $('#signedTempReset');
  
    var signedTempLevelIndex = 0;
    var signedTempValue = 0;
    var signedTempMission = null;
  
    function paintExpo(id) {
      var block = App.i18n.t('expo.' + id);
      if (!block) { show(screenMenu); return; }
      $('#expoTitleEl').textContent = block.title || '';
      $('#expoIntroEl').textContent = block.intro || '';
      var bulletsEl = $('#expoBulletsEl');
      bulletsEl.innerHTML = '';
      (block.bullets || []).forEach(function (b) {
        var li = document.createElement('li');
        li.textContent = b;
        bulletsEl.appendChild(li);
      });
      var noteEl = $('#expoNoteEl');
      if (block.note) {
        noteEl.textContent = '💡 ' + block.note;
        noteEl.classList.remove('hidden');
      } else {
        noteEl.textContent = '';
        noteEl.classList.add('hidden');
      }
      screenExpo.setAttribute('aria-label',
        (block.title || '') + ' — ' + (App.i18n.t('activity.' + id + '.name') || ''));
    }
  
    function paintReal(id) {
      var block = App.i18n.t('real.' + id);
      if (!block) { show(screenMenu); return; }
      $('#realTitleEl').textContent = block.title || '';
      var listEl = $('#realListEl');
      listEl.innerHTML = '';
      (block.items || []).forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'real-list-item';
        var icon = document.createElement('span');
        icon.className = 'real-list-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = item.icon || '';
        var para = document.createElement('p');
        para.textContent = item.text || '';
        row.appendChild(icon);
        row.appendChild(para);
        listEl.appendChild(row);
      });
      screenReal.setAttribute('aria-label',
        (block.title || '') + ' — ' + (App.i18n.t('activity.' + id + '.name') || ''));
    }
  
    function startExpoScreen(id) {
      paintExpo(id);
      show(screenExpo);
    }
  
    function startRealScreen(id) {
      paintReal(id);
      show(screenReal);
    }
  
    function startSignedIntro() {
      show(signedIntroScreen);
      signedNumberline.innerHTML = '';
      for (var value = -3; value <= 3; value += 1) {
        var tick = document.createElement('span');
        tick.className = 'signed-numberline-tick' + (value === 0 ? ' zero' : '');
        tick.textContent = value < 0 ? '−' + Math.abs(value) : value > 0 ? '+' + value : '0';
        signedNumberline.appendChild(tick);
      }
      signedNumberline.setAttribute('aria-label', App.i18n.t('signed.numberlineAria'));
      paintStars();
    }
  
    function paintSignedReal() {
      signedRealList.innerHTML = '';
      DATA.signedNumbers.real.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'signed-real-item';
        var icon = document.createElement('span');
        icon.className = 'signed-real-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = item.object;
        var body = document.createElement('div');
        var title = document.createElement('h3');
        title.textContent = App.i18n.t('signed.real.' + item.id + '.title');
        var text = document.createElement('p');
        text.textContent = App.i18n.t('signed.real.' + item.id + '.text');
        body.appendChild(title);
        body.appendChild(text);
        row.appendChild(icon);
        row.appendChild(body);
        signedRealList.appendChild(row);
      });
    }
  
    function startSignedTemperature() {
      signedTempLevelIndex = 0;
      loadSignedTemperatureMission();
    }
  
    function loadSignedTemperatureMission() {
      signedTempMission = DATA.signedNumbers.temperature[signedTempLevelIndex];
      signedTempValue = signedTempMission.start;
      signedTempSuccess.classList.add('hidden');
      signedTempNext.classList.add('hidden');
      signedTempGoal.textContent = App.i18n.t('signed.tempGoals.' + signedTempMission.id);
      show(signedTempScreen);
      paintSignedTemperature();
    }
  
    function signedTemperatureReachedGoal() {
      if (signedTempMission.target === 'negative') return signedTempValue < 0;
      if (signedTempMission.target === 'positive') return signedTempValue > 0;
      return signedTempValue === signedTempMission.target;
    }
  
    function paintSignedTemperature() {
      var sign = signedTempValue < 0 ? 'negative' : signedTempValue > 0 ? 'positive' : 'zero';
      var shown = signedTempValue < 0 ? '−' + Math.abs(signedTempValue)
        : signedTempValue > 0 ? '+' + signedTempValue : '0';
      signedTempNumber.textContent = shown + ' °C';
      signedTempNumber.className = 'signed-temp-number sign-' + sign;
      signedTempNumber.setAttribute('aria-label',
        App.i18n.t('signed.tempReadout').replace('{value}', shown));
      signedTempSign.textContent = App.i18n.t('signed.sign.' + sign);
      signedTempSign.className = 'signed-temp-sign sign-' + sign;
      signedTempMercury.className = 'signed-thermometer-mercury sign-' + sign;
      signedTempMercury.style.height = Math.abs(signedTempValue) * 5 + '%';
      signedTempMercury.style.top = signedTempValue < 0 ? '50%' : 'auto';
      signedTempMercury.style.bottom = signedTempValue >= 0 ? '50%' : 'auto';
      App.utils.$$('#signedTempScreen .btn-signed-temp[data-step]').forEach(function (button) {
        var nextValue = signedTempValue + parseInt(button.getAttribute('data-step'), 10);
        button.disabled = nextValue < DATA.signedNumbers.min || nextValue > DATA.signedNumbers.max;
      });
      var reached = signedTemperatureReachedGoal();
      signedTempSuccess.classList.toggle('hidden', !reached);
      if (reached) signedTempSuccess.textContent = App.i18n.t('signed.tempSuccess');
      signedTempNext.classList.toggle('hidden', !reached);
    }
  
    function stepSignedTemperature(step) {
      var nextValue = signedTempValue + step;
      if (nextValue < DATA.signedNumbers.min || nextValue > DATA.signedNumbers.max) return;
      signedTempValue = nextValue;
      paintSignedTemperature();
    }
  
    function finishSignedTemperatureMission() {
      if (!signedTemperatureReachedGoal()) return;
      signedTempLevelIndex += 1;
      if (signedTempLevelIndex < DATA.signedNumbers.temperature.length) {
        loadSignedTemperatureMission();
        return;
      }
      host.startPositivosNegativos();
    }
  

    /* ---- Exposition + real-life buttons (hasExpoReal activities) ---- */
    $('#expoNext').addEventListener('click', function () {
      if (!host.current()) return;
      startRealScreen(host.current().id);
    });
    $('#realBack').addEventListener('click', function () {
      if (!host.current()) return;
      startExpoScreen(host.current().id);
    });
    $('#realNext').addEventListener('click', function () {
      if (!host.current()) return;
      host.startCurrentRound();
    });
  
    $('#signedIntroNext').addEventListener('click', function () {
      paintSignedReal();
      show(signedRealScreen);
    });
    $('#signedRealNext').addEventListener('click', startSignedTemperature);
    App.utils.$$('#signedTempScreen .btn-signed-temp[data-step]').forEach(function (button) {
      button.addEventListener('click', function () {
        stepSignedTemperature(parseInt(button.getAttribute('data-step'), 10));
      });
    });
    signedTempReset.addEventListener('click', function () {
      signedTempValue = signedTempMission.start;
      paintSignedTemperature();
    });
    signedTempNext.addEventListener('click', finishSignedTemperatureMission);
    return { startSignedIntro: startSignedIntro, startExpoScreen: startExpoScreen, startRealScreen: startRealScreen };
  };
})();
