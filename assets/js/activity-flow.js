/* ============================================================
   Calculia — Three-stage activity flow: the shared core.

   The flow of Operaciones, Mínimo común múltiplo, Máximo común divisor,
   Rectas, Primos y compuestos, Formas, Números factoriales and the order
   activities. Every such activity has three stages:
     1. explanation: slides with a drawing, one idea each, with ← →;
     2. real life: one everyday example at a time, with ← →;
     3. test, in one of two modes, each in its own file:
        • 'options' (assets/js/activity-flow-options.js): one question at a
          time, with a closing screen.
        • 'sheet' (assets/js/activity-flow-sheet.js): the whole round on one
          sheet, checked at once, with «Otra ronda», and optionally a menu
          of sheets with levels.

   This file has what both modes share: the stages, the slides, the saved
   progress and the screens. It builds one context object (ctx) with that
   shared state and hands it to the mode of the activity. The modes read and
   write the context; they do not touch each other.

   The activity passes its configuration to setup(config):
     toolId          storage key and tool id
     test            'options' (default) or 'sheet'
     intro           explanation slides, each { visual: spec }
     real            real-life examples, each { visual: spec }
     visualHtml      function(spec) -> HTML of one explanation drawing
     realVisualHtml  function(spec) -> HTML of one real-life picture
                     (optional; defaults to visualHtml)
     introVisualAria function(i) -> label of the picture of slide i
                     (optional; default ui.visualAria)
     introCopy       function(i) -> { title, text } (optional; defaults to
                     the keys intro.<n>.title and intro.<n>.text). A null
                     hides the title and the text; an empty text hides
                     only the text.
     realText        function(i) -> text of example i (optional; defaults
                     to the key real.<n>)
     introHeading    function() -> the line above the slides (optional;
                     without it there is no line)
     introCard       function() -> { title, text }: a card above the slides
                     (optional)
     slideProgress   false hides the progress bars of the slides
                     (optional; default true)
     buildRound      function() -> the question types of one round, shuffled
                     (the activity calls App.utils.shuffle here). In 'sheet'
                     it is used when there is one sheet and no config.activities.
     makeQuestion    function(type, index) -> question (see the modes)
     backHref        where «Volver al inicio» goes (optional)
     activities      list of activities that share one test, each
                     { id, picto, name(), detail(), … }. With more than one, a
                     menu offers them (both modes). The mode says what a pick
                     does (mode.pick). In 'options' each one also has its own
                     intro and real (the slides and the examples are its own),
                     and the test has «← Otras…» back to the menu and «Otra ronda».
     menuBackKey     i18n key of the «← …» button that goes back to the menu
                     (optional; default ui.menuBack)
     testVisuals     true: the test shows the picture of each question
                     (question.visual) in 'options' (optional)
     testVisualClass class of the test's picture (optional; default fac-visual)
   plus the options of each mode, documented in its file.

   The texts come from the activity's strings.<locale>.js. The keys every
   activity can rely on (ui.prev, ui.next, ui.count, ui.seeReal, ui.startTest,
   ui.visualAria, ui.check, ui.newRound, …) are in the core dictionary
   (assets/js/i18n.js); an activity overrides any of them in its own `ui`.

   The markup of the three stages is built here, once, so a change of layout
   is made in one place. The look comes from the design tokens and from
   assets/css/activity-flow.css.

   Exposes window.App.activityFlow.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;
  var fill = App.utils.fill;
  var rint = App.utils.rint;
  var pick = App.utils.pick;

  function t(key) { return App.i18n.t(key); }

  /* `count` copies of an icon, each in a span with the given class. */
  function items(count, icon, cls) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="' + cls + '" aria-hidden="true">' + icon + '</span>';
    return html;
  }

  /* The modes register here: activity-flow-options.js and activity-flow-sheet.js. */
  var modes = {};

  /* The menu of activities, shown only when there is more than one. Both modes use it. */
  var MENU_HTML = [
    '<section id="screenMenu" class="hidden stack">',
    '  <div class="row center-row"><p class="instruction" data-i18n="ui.menuInstruction">Elige un test.</p></div>',
    '  <div class="card reference-card stack">',
    '    <h2 class="reference-title" data-i18n="ui.menuTitle">¿Qué quieres practicar?</h2>',
    '    <p class="reference-text" data-i18n="ui.menuText">Elige qué quieres practicar.</p>',
    '  </div>',
    '  <div id="activitiesMenu"></div>',
    '</section>'
  ].join('\n');

  function hasMenu(config) { return !!config.activities && config.activities.length > 1; }

  /* One button per activity; a pick calls onPick with its entry. */
  function paintMenu(ctx, onPick) {
    var cont = $('#activitiesMenu');
    cont.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'menu-grid';
    ctx.config.activities.forEach(function (def) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-actividad';
      btn.innerHTML = '<span class="picto" aria-hidden="true">' + def.picto + '</span>' +
        '<span>' + def.name() + '</span>' +
        '<span class="detail-card">' + def.detail() + '</span>';
      btn.addEventListener('click', function () { onPick(def); });
      grid.appendChild(btn);
    });
    cont.appendChild(grid);
  }

  function openMenu(ctx) {
    paintMenu(ctx, function (def) { ctx.mode.pick(ctx, def); });
    ctx.show('#screenMenu');
  }

  /* The slides and the examples: those of the activity picked from the menu when it has its own
     (an activity with a menu may share one set of slides), or the activity's own. */
  function source(ctx) { return (ctx.current && ctx.current.intro) ? ctx.current : ctx.config; }

  /* The level of an activity rises with the rounds completed in it. A menu entry with no levels
     has none (null). */
  function levelOf(ctx, def) {
    if (!def.levels) return null;
    var done = ctx.progress.roundsByActivity[def.id];
    if (typeof done !== 'number' || done < 0) done = 0;
    return def.levels[Math.min(Math.floor(done), def.levels.length - 1)];
  }

  /* ---- Markup of the stages --------------------------------------------
     The ids and the classes are the contract with the CSS and with the modes. */
  var STAGES = [
    /* 1. Explanation: a line of text, an optional card, then slides with a
       drawing, one idea each. */
    '<section id="screenIntro" class="stack">',
    '  <div class="row center-row" id="introHeadingRow"><p class="instruction" id="introHeading"></p></div>',
    '  <h2 class="activity-title hidden" id="introActivityTitle"></h2>',
    '  <div class="card reference-card stack intro-card" id="introCard"><h2 class="reference-title" id="introCardTitle"></h2><p class="reference-text" id="introCardText"></p></div>',
    '  <div class="progress-bar" id="introProgress" role="progressbar" aria-valuemin="0"><div class="progress-fill" id="introProgressFill"></div></div>',
    '  <article class="card stack gallery-card">',
    '    <div class="ops-visual" id="introVisual"></div>',
    '    <h2 class="concept-title" id="introTitle"></h2>',
    '    <p class="concept-text" id="introText"></p>',
    '    <div class="carousel-controls">',
    '      <button type="button" class="btn btn-secondary" id="introPrev" data-i18n-aria="ui.prev" aria-label="Anterior">←</button>',
    '      <button type="button" class="btn btn-secondary" id="introNext" data-i18n-aria="ui.next" aria-label="Siguiente">→</button>',
    '    </div>',
    '  </article>',
    '  <button type="button" class="btn btn-secondary" id="introContinue" data-i18n="ui.seeReal">Ver ejemplos reales →</button>',
    '  <button type="button" class="btn btn-secondary hidden" id="introBack" data-i18n="ui.menuBack">← Volver al menú</button>',
    '</section>',
    /* 2. Real life: one everyday example at a time. */
    '<section id="screenReal" class="hidden stack">',
    '  <div class="row center-row">',
    '    <p class="instruction" data-i18n="ui.realLabel">Ejemplos de la vida real</p>',
    '  </div>',
    '  <div class="progress-bar" id="realProgress" role="progressbar" aria-valuemin="0"><div class="progress-fill" id="realProgressFill"></div></div>',
    '  <article class="card centered stack real-card">',
    '    <div class="ops-visual" id="realVisual"></div>',
    '    <p class="real-text" id="realText"></p>',
    '    <div class="carousel-controls">',
    '      <button type="button" class="btn btn-secondary" id="realPrev" data-i18n-aria="ui.prev" aria-label="Anterior">←</button>',
    '      <button type="button" class="btn btn-secondary" id="realNext" data-i18n-aria="ui.next" aria-label="Siguiente">→</button>',
    '    </div>',
    '  </article>',
    '  <button type="button" class="btn" id="realContinue" data-i18n="ui.startTest">Empezar a practicar →</button>',
    '</section>'
  ].join('\n');

  function removeNode(selector) {
    var node = document.querySelector(selector);
    if (node) node.parentNode.removeChild(node);
  }

  /* Puts a text in an element, or hides the element when there is none. */
  function paintText(selector, text) {
    var el = $(selector);
    if (text === null || text === undefined || text === '') {
      el.classList.add('hidden');
      el.textContent = '';
    } else {
      el.classList.remove('hidden');
      el.textContent = text;
    }
  }

  /* Replaces the bar's label and fill with the position of the current item. */
  function paintBar(ctx, barId, fillId, index, total) {
    var n = index + 1;
    var bar = $(barId);
    bar.setAttribute('aria-label', fill(t('ui.count'), { i: n, n: total }));
    bar.setAttribute('aria-valuemax', String(total));
    bar.setAttribute('aria-valuenow', String(n));
    $(fillId).style.width = (n / total * 100) + '%';
  }

  /* ---- The shared stages, painted from the context ------------------------ */
  /* The source (the activity's own or the one picked from the menu) is passed to the
     activity's callbacks as the second argument, so they can name its keys. */
  function introCopy(ctx, i) {
    var config = ctx.config;
    var src = source(ctx);
    if (config.introCopy) return config.introCopy(i, src);
    return { title: t('intro.' + (i + 1) + '.title'), text: t('intro.' + (i + 1) + '.text') };
  }
  function realCopy(ctx, i) {
    var config = ctx.config;
    return config.realText ? config.realText(i, source(ctx)) : t('real.' + (i + 1));
  }

  function paintIntro(ctx) {
    var config = ctx.config;
    var src = source(ctx);
    var i = ctx.state.intro;
    var copy = introCopy(ctx, i);
    paintText('#introTitle', copy ? copy.title : null);
    paintText('#introText', copy ? copy.text : null);
    $('#introVisual').innerHTML = config.visualHtml(src.intro[i].visual);
    /* A slide can name its own picture (a figure names itself); otherwise the generic label. */
    var label = config.introVisualAria ? config.introVisualAria(i) : null;
    $('#introVisual').setAttribute('aria-label', label || t('ui.visualAria'));
    if (ctx.slideBars) paintBar(ctx, '#introProgress', '#introProgressFill', i, src.intro.length);
  }

  function paintReal(ctx) {
    var config = ctx.config;
    var src = source(ctx);
    var i = ctx.state.real;
    var spec = src.real[i].visual;
    $('#realVisual').innerHTML = config.realVisualHtml ? config.realVisualHtml(spec) : config.visualHtml(spec);
    $('#realVisual').setAttribute('aria-label', t('ui.visualAria'));
    $('#realText').textContent = realCopy(ctx, i);
    if (ctx.slideBars) paintBar(ctx, '#realProgress', '#realProgressFill', i, src.real.length);
  }

  /* ---- setup: the context, the markup, the stages and the mode ----------- */
  App.activityFlow = {
    fill: fill,
    items: items,
    modes: modes,
    menuHtml: MENU_HTML,
    hasMenu: hasMenu,
    levelOf: levelOf,

    setup: function (config) {
      var mode = config.test === 'sheet' ? modes.sheet : modes.options;
      var TOOL_ID = config.toolId;

      var progress = App.storage.get(TOOL_ID);
      if (typeof progress.stars !== 'number') progress.stars = 0;
      if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;
      if (!progress.roundsByActivity || typeof progress.roundsByActivity !== 'object' ||
          Array.isArray(progress.roundsByActivity)) progress.roundsByActivity = {};
      /* An activity whose saved progress has another shape converts it here, once. */
      if (config.prepareProgress) config.prepareProgress(progress);

      var ctx = {
        config: config,
        mode: mode,
        progress: progress,
        /* The position in the slides, and whatever the mode keeps for itself. */
        state: { intro: 0, real: 0 },
        mode_state: {},
        /* The activity picked from the menu (null until one is picked, or when there is no menu). */
        current: null,
        slideBars: config.slideProgress !== false,
        screens: mode.screens(config),
        save: function () { App.storage.set(TOOL_ID, progress); },
        paintStars: function () { $('#stars').textContent = '⭐ ' + progress.stars; },
        show: function (screen) {
          ctx.screens.forEach(function (id) { $(id).classList.toggle('hidden', id !== screen); });
        },
        paintIntro: function () { paintIntro(ctx); },
        paintReal: function () { paintReal(ctx); },
        openMenu: function () { openMenu(ctx); },
        /* Opens the first real-life example, from the start. */
        goReal: function () {
          ctx.state.real = 0;
          paintReal(ctx);
          ctx.show('#screenReal');
        }
      };

      document.addEventListener('DOMContentLoaded', function () { init(ctx); });
    }
  };

  function init(ctx) {
    var config = ctx.config;
    $('#activity').innerHTML = STAGES + '\n' + ctx.mode.markup(ctx);
    if (config.introHeading) $('#introHeading').textContent = config.introHeading();
    else removeNode('#introHeadingRow');
    if (config.introCard) {
      var card = config.introCard();
      $('#introCardTitle').textContent = card.title;
      $('#introCardText').textContent = card.text;
      $('#introCard').classList.remove('hidden');
    } else {
      removeNode('#introCard');
    }
    if (!ctx.slideBars) {
      removeNode('#introProgress');
      removeNode('#realProgress');
    }
    App.i18n.apply();
    ctx.paintStars();

    /* Slides wrap around: the last one leads back to the first, and the first back to the last. */
    $('#introPrev').addEventListener('click', function () {
      var n = source(ctx).intro.length;
      ctx.state.intro = (ctx.state.intro + n - 1) % n;
      paintIntro(ctx);
    });
    $('#introNext').addEventListener('click', function () {
      ctx.state.intro = (ctx.state.intro + 1) % source(ctx).intro.length;
      paintIntro(ctx);
    });
    $('#introContinue').addEventListener('click', function () {
      /* A mode can take the button for itself (the rule reopened from the test). */
      if (ctx.mode.introContinue && ctx.mode.introContinue(ctx)) return;
      ctx.goReal();
    });
    $('#realPrev').addEventListener('click', function () {
      var n = source(ctx).real.length;
      ctx.state.real = (ctx.state.real + n - 1) % n;
      paintReal(ctx);
    });
    $('#realNext').addEventListener('click', function () {
      ctx.state.real = (ctx.state.real + 1) % source(ctx).real.length;
      paintReal(ctx);
    });

    ctx.mode.bind(ctx);
    if (ctx.mode.init) ctx.mode.init(ctx);
    /* The mode says where the activity starts: the slides, or the menu of activities. */
    if (ctx.mode.start) {
      ctx.mode.start(ctx);
    } else {
      paintIntro(ctx);
      ctx.show('#screenIntro');
    }
  }
})();
