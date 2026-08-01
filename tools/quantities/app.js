(function () {
  'use strict';

  var TOOL_ID = 'quantities';
  var $ = App.utils.$;
  var progress = App.storage.get(TOOL_ID);
  var practice = null;
  var round = [];
  var index = 0;
  var attempts = 0;

  if (typeof progress.estrellas !== 'number') progress.estrellas = 0;

  function saveProgress() { App.storage.set(TOOL_ID, progress); }
  function show(element) { element.classList.remove('oculto'); }
  function hide(element) { element.classList.add('oculto'); }

  function formatValue(value, unit) {
    var key = unit || 'plain';
    if (key === 'plain') return String(value);
    return App.i18n.t(key).replace('{value}', value);
  }

  function currentCase() { return round[index]; }

  function taskText(item) {
    if (practice === 'amount') {
      return {
        prompt: App.i18n.t('promptAmount').replace('{goal}', App.i18n.t('goal' + item.goal.charAt(0).toUpperCase() + item.goal.slice(1))),
        detail: App.i18n.t('detailAmount')
      };
    }
    if (practice === 'change') {
      return {
        prompt: App.i18n.t('promptChange')
          .replace('{start}', item.start)
          .replace('{direction}', App.i18n.t('direction' + item.direction.charAt(0).toUpperCase() + item.direction.slice(1)))
          .replace('{target}', item.target),
        detail: App.i18n.t('detailChange')
      };
    }
    if (practice === 'round') {
      return {
        prompt: App.i18n.t('promptRound').replace('{value}', formatValue(item.value, item.unit)),
        detail: App.i18n.t('detailRound')
      };
    }
    return {
      prompt: App.i18n.t('promptMiddle').replace('{min}', item.min).replace('{max}', item.max),
      detail: App.i18n.t('detailMiddle')
    };
  }

  function updateValue() {
    var item = currentCase();
    var value = Number($('#amountSlider').value);
    var shown = formatValue(value, item.unit);
    $('#valueDisplay').textContent = App.i18n.t('value').replace('{value}', shown);
    $('#amountSlider').setAttribute('aria-valuetext', shown);
  }

  function renderTask() {
    var item = currentCase();
    var text = taskText(item);
    var slider = $('#amountSlider');
    attempts = 0;
    $('#taskIcon').textContent = DATA.practices.filter(function (itemPractice) { return itemPractice.id === practice; })[0].icon;
    $('#prompt').textContent = text.prompt;
    $('#taskDetail').textContent = text.detail;
    $('#sliderLabel').textContent = App.i18n.t('sliderLabel');
    slider.min = item.min;
    slider.max = item.max;
    slider.step = item.step;
    slider.value = item.start === undefined ? item.min : item.start;
    $('#sliderEnds').innerHTML = '<span>' + formatValue(item.min, item.unit) + '</span><span>' + formatValue(item.max, item.unit) + '</span>';
    $('#progressFill').style.width = ((index / round.length) * 100) + '%';
    $('#progressText').textContent = App.i18n.t('progress').replace('{current}', index + 1).replace('{total}', round.length);
    $('#feedback').textContent = '';
    show($('#checkAnswer'));
    hide($('#nextTask'));
    updateValue();
    slider.focus();
  }

  function isCorrect(item, value) {
    if (practice === 'amount') return value >= item.target[0] && value <= item.target[1];
    return value === item.target;
  }

  function checkAnswer() {
    var item = currentCase();
    var value = Number($('#amountSlider').value);
    var feedback = $('#feedback');
    if (!isCorrect(item, value)) {
      attempts += 1;
      App.feedback.encourage(feedback);
      feedback.textContent += ' ' + App.i18n.t('hint' + practice.charAt(0).toUpperCase() + practice.slice(1));
      return;
    }
    progress.estrellas += 1;
    saveProgress();
    $('#stars').textContent = '⭐ ' + progress.estrellas;
    App.feedback.success(feedback);
    hide($('#checkAnswer'));
    show($('#nextTask'));
    $('#nextTask').focus();
  }

  function moveSlider(direction) {
    var slider = $('#amountSlider');
    slider.value = Number(slider.value) + (direction * Number(slider.step));
    updateValue();
    slider.focus();
  }

  function startPractice(id) {
    practice = id;
    round = App.utils.shuffle(DATA.cases[id]).slice(0, DATA.perRound);
    index = 0;
    hide($('#screenMenu'));
    hide($('#screenFinish'));
    show($('#screenTask'));
    renderTask();
  }

  function nextTask() {
    index += 1;
    if (index < round.length) {
      renderTask();
      return;
    }
    hide($('#screenTask'));
    show($('#screenFinish'));
    $('#finishText').textContent = App.i18n.t('roundSummary')

      .replace('{count}', round.length)
      .replace('{stars}', progress.estrellas);
    $("#transferencia").textContent = App.i18n.t("transferencia");
    App.feedback.celebrate(App.i18n.t('roundComplete'));
  }

  function showMenu() {
    hide($('#screenTask'));
    hide($('#screenFinish'));
    show($('#screenMenu'));
  }

  function renderMenu() {
    $('#practiceGrid').innerHTML = '';
    DATA.practices.forEach(function (item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-practice';
      button.innerHTML = '<span class="practice-icon" aria-hidden="true">' + item.icon + '</span><span>' +
        App.i18n.t(item.id + 'Name') + '</span><small>' + App.i18n.t(item.id + 'Detail') + '</small>';
      button.addEventListener('click', function () { startPractice(item.id); });
      $('#practiceGrid').appendChild(button);
    });
  }

  function init() {
    App.i18n.apply();
    $('#stars').textContent = '⭐ ' + progress.estrellas;
    renderMenu();

    $('#amountSlider').addEventListener('input', updateValue);
    $('#decrease').addEventListener('click', function () { moveSlider(-1); });
    $('#increase').addEventListener('click', function () { moveSlider(1); });
    $('#checkAnswer').addEventListener('click', checkAnswer);
    $('#nextTask').addEventListener('click', nextTask);
    $('#backToMenu').addEventListener('click', showMenu);
    $('#playAgain').addEventListener('click', function () { startPractice(practice); });
    $('#chooseAnother').addEventListener('click', showMenu);
    $('#decrease').setAttribute('aria-label', App.i18n.t('decrease'));
    $('#increase').setAttribute('aria-label', App.i18n.t('increase'));
    $('#amountSlider').setAttribute('aria-label', App.i18n.t('sliderLabel'));
  }

  document.addEventListener('DOMContentLoaded', init);
})();