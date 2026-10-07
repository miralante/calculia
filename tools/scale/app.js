/* ============================================================
   Calculia — Escala
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'scale';
  var $ = App.utils.$;

  var screenIntro = $('#screenIntro');
  var screenReal = $('#screenReal');
  var screenMenu = $('#screenMenu');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var conceptVisual = $('#conceptVisual');
  var conceptTitle = $('#conceptTitle');
  var conceptText = $('#conceptText');
  var conceptPrev = $('#conceptPrev');
  var conceptNext = $('#conceptNext');
  var realObject = $('#realObject');
  var realCaption = $('#realCaption');
  var realNote = $('#realNote');
  var realPrev = $('#realPrev');
  var realNext = $('#realNext');
  var promptEl = $('#prompt');
  var visualEl = $('#visual');
  var legendEl = $('#legend');
  var optionsEl = $('#options');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var btnNext = $('#btnNext');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;
  if (!progress.roundsByActivity || typeof progress.roundsByActivity !== 'object' ||
      Array.isArray(progress.roundsByActivity)) progress.roundsByActivity = {};

  /* Round state */
  var activity = null;
  var level = null;
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var question = null;
  var pools = {};
  var conceptIndex = 0;
  var realIndex = 0;
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce).
     inReinforce controls the mini-round flow; `fixed` lets render()
     replay a question the round already asked. */
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Utilities ---- */

  /* Takes elements from a list without repeating within the round. */
  function draw(key, list) {
    var p = pools[key];
    if (!p || p.i >= p.orden.length) {
      var fresh = App.utils.shuffle(list);
      /* When the bag is refilled, its first item must not be the one just
         handed out: two identical questions in a row read as a "Siguiente"
         button that does nothing. */
      if (p && fresh.length > 1 && fresh[0] === p.last) {
        var swap = fresh[1];
        fresh[1] = fresh[0];
        fresh[0] = swap;
      }
      p = pools[key] = { orden: fresh, i: 0, last: p ? p.last : null };
    }
    p.last = p.orden[p.i];
    return p.orden[p.i++];
  }

  /* Four different options: the right one and three that come out of the
     same instrument. A repeated wrong answer would make "the correct
     answer" not one, so duplicates are dropped and the fourth is taken
     further along the scale. */
  function optionsFor(correct, wrongs, unit) {
    var values = [correct];
    var pool = wrongs.slice();
    var extra = 1;
    while (values.length < 4) {
      var candidate = null;
      if (pool.length) {
        candidate = pool.shift();
      } else {
        extra += 1;
        candidate = correct + extra;
      }
      if (candidate !== null && candidate > 0 && values.indexOf(candidate) === -1) {
        values.push(candidate);
      }
    }
    var suffix = ' ' + unit;
    return App.utils.shuffle(values).map(function (v) {
      return { html: v + suffix, aria: v + suffix, correct: v === correct };
    });
  }

  /* The numbers printed on each side of the reached mark: the label to
     its left and the label to its right. When the mark IS a label the
     neighbours are one label further out, which is the pair a person
     actually reads by mistake. */
  function labelNeighbours(nv, value) {
    var off = value - nv.from;
    var isLabel = (off % nv.labelEvery) === 0;
    var left = isLabel
      ? value - nv.labelEvery
      : nv.from + Math.floor(off / nv.labelEvery) * nv.labelEvery;
    var right = isLabel ? value + nv.labelEvery : left + nv.labelEvery;
    return { left: left, right: right };
  }

  /* Words for the unit in the question text: "¿cuántos metros?" needs the
     word, while the rule and the options carry the symbol. */
  function unitWord(symbol) {
    if (symbol === 'km') return App.i18n.t('gen.unitKm');
    if (symbol === 'm') return App.i18n.t('gen.unitMetre');
    return App.i18n.t('gen.unitCentimetre');
  }

  /* ---- Drawing ----
     Every scale is drawn from the same numbers the answer is compared
     against: the mark for value v falls at x0 + (v - from) * px. If the
     drawing and the number were worked out separately, changing one
     would leave the other lying.

     The numbers go BELOW the body, never inside it. Printed inside, the
     first and the last one sit exactly on the rounded end of the rule,
     and the outline of the rule crosses them: a 0 with a line through
     it reads as a D, and the last number of a 0-10 rule reads as a 1
     with a 0 stuck to it. */
  var RULER = { x: 24, w: 272, top: 92, h: 48 };
  var NUM_Y = RULER.top + RULER.h + 16;
  var RULE_BOX = '0 0 320 168';
  var GAUGE = { x: 108, top: 26, bottom: 152 };
  var PLAN = { x: 78, w: 212, segs: 4 };

  /* The two vertical instruments are the same column of marks: only the
     vessel around it changes. A thermometer is narrow, ends in a bulb
     and has nothing to hold; a jug is wide, has a handle and a pouring
     lip and no bulb. Without those differences they are two
     thermometers with two labels on them. */
  var GAUGE_SHAPES = {
    termo: { w: 30, bulb: true, handle: false, lip: false },
    jar: { w: 48, bulb: false, handle: true, lip: true }
  };

  function svgWrap(viewBox, body) {
    return '<svg class="scale-svg" viewBox="' + viewBox + '">' + body + '</svg>';
  }

  /* A ruler with its marks and numbers. `here` is the mark the question
     is about; it is left out of the loop and drawn afterwards, taller,
     so the difference is carried by the LENGTH of the mark as well as by
     its colour (WCAG 1.4.1: never colour alone). */
  function rulerFace(from, to, step, labelEvery, here) {
    var px = RULER.w / (to - from);
    var labelStep = Math.max(1, Math.round(labelEvery / step));
    var i = 0;
    var ticks = '';
    var labels = '';
    for (var v = from; v <= to; v += step, i += 1) {
      if (here !== undefined && v === here) continue;
      var x = RULER.x + (v - from) * px;
      var isLabel = i % labelStep === 0;
      ticks += '<line class="ruler-tick" x1="' + x + '" y1="' + RULER.top +
        '" x2="' + x + '" y2="' + (RULER.top + (isLabel ? 18 : 10)) + '"/>';
      if (isLabel) {
        labels += '<text class="ruler-num" x="' + x + '" y="' + NUM_Y + '">' + v + '</text>';
      }
    }
    var hereMark = '';
    if (here !== undefined) {
      var hx = RULER.x + (here - from) * px;
      hereMark = '<line class="ruler-tick-here" x1="' + hx + '" y1="' + RULER.top +
        '" x2="' + hx + '" y2="' + (RULER.top + 24) + '"/>';
    }
    return '<rect class="ruler-face" x="' + RULER.x + '" y="' + RULER.top +
      '" width="' + RULER.w + '" height="' + RULER.h + '" rx="8"/>' +
      ticks + hereMark + labels;
  }

  function rulerUnit(unit) {
    return '<text class="ruler-unit" x="' + RULER.x + '" y="' + (RULER.top - 12) + '">' + unit + '</text>';
  }

  /* The ruler plus a pencil whose tip lands exactly on `value`. */
  function rulerSvg(cfg) {
    var px = RULER.w / (cfg.to - cfg.from);
    var hx = RULER.x + (cfg.value - cfg.from) * px;
    var pencil = '<path class="pencil-tip" d="M' + (hx - 7) + ' ' + (RULER.top - 9) +
        ' L' + hx + ' ' + RULER.top + ' L' + (hx + 7) + ' ' + (RULER.top - 9) + ' Z"/>' +
      '<rect class="pencil-body" x="' + (hx - 7) + '" y="' + (RULER.top - 46) +
        '" width="14" height="37" rx="3"/>';
    return svgWrap(RULE_BOX, rulerUnit(cfg.unit) + pencil +
      rulerFace(cfg.from, cfg.to, cfg.step, cfg.labelEvery, cfg.value));
  }

  /* The same reading on a vertical instrument. Both shapes fill from the
     bottom and carry their marks on the same side, so once the rule has
     been read the second instrument is only a change of vessel and
     unit — which is the whole point of putting it in the same activity.
     The mark reached is drawn longer as well as in a different colour,
     for the same reason it is on the horizontal rule. */
  function gaugeSvg(cfg) {
    var shape = GAUGE_SHAPES[cfg.shape] || GAUGE_SHAPES.termo;
    var height = GAUGE.bottom - GAUGE.top;
    var py = height / cfg.to;
    var gw = shape.w;
    var tickX = GAUGE.x + gw;
    /* Past the longest mark (the one that is 26 wide), not inside it:
       with the numbers 10px away, every mark drew a line straight
       through the number next to it and "1000" read as "1000" with a
       scratch down the middle. */
    var numX = tickX + 30;
    var labelStep = Math.max(1, Math.round(cfg.labelEvery / cfg.step));
    var i = 0;
    var ticks = '';
    var labels = '';
    for (var v = cfg.from; v <= cfg.to; v += cfg.step, i += 1) {
      if (v === cfg.value) continue;
      var y = GAUGE.bottom - (v - cfg.from) * py;
      var isLabel = i % labelStep === 0;
      ticks += '<line class="gauge-tick" x1="' + tickX + '" y1="' + y +
        '" x2="' + (tickX + (isLabel ? 20 : 11)) + '" y2="' + y + '"/>';
      if (isLabel) {
        labels += '<text class="gauge-num" x="' + numX + '" y="' + (y + 4) + '">' + v + '</text>';
      }
    }
    var levelY = GAUGE.bottom - (cfg.value - cfg.from) * py;
    var hereMark = '<line class="gauge-tick-here" x1="' + tickX + '" y1="' + levelY +
      '" x2="' + (tickX + 26) + '" y2="' + levelY + '"/>';

    /* The handle and the lip exist so the jug is not read as a second
       thermometer. Both are strokes and neither is filled: the lip
       filled reads as a mouse cursor sitting on the rim of the vessel,
       which is what it looked like the first time. The handle goes on
       the LEFT because the marks and their numbers are on the right: a
       handle drawn across the marks puts a curve through every number
       on the instrument. */
    var extras = '';
    if (shape.handle) {
      extras += '<path class="gauge-handle" d="M' + (GAUGE.x - 4) + ' ' + (GAUGE.top + 36) +
        ' q-26 20 0 50"/>';
    }
    if (shape.lip) {
      extras += '<line class="gauge-lip" x1="' + (GAUGE.x + 4) + '" y1="' + GAUGE.top +
        '" x2="' + (GAUGE.x - 16) + '" y2="' + (GAUGE.top - 10) + '"/>';
    }
    var bulb = '';
    if (shape.bulb) {
      bulb = '<circle class="gauge-bulb" cx="' + (GAUGE.x + gw / 2) +
        '" cy="' + (GAUGE.bottom + 12) + '" r="' + (gw / 2 + 4) + '"/>';
    }
    var column = '<rect class="gauge-level" x="' + (GAUGE.x + 4) + '" y="' + levelY +
      '" width="' + (gw - 8) + '" height="' + (GAUGE.bottom - levelY) + '" rx="4"/>' + bulb;

    return svgWrap('0 0 320 190', extras +
      '<rect class="gauge-tube" x="' + GAUGE.x + '" y="' + GAUGE.top +
      '" width="' + gw + '" height="' + height + '" rx="8"/>' +
      column + ticks + hereMark + labels +
      '<text class="gauge-unit" x="' + numX + '" y="' + (GAUGE.top - 10) + '">' + cfg.unit + '</text>');
  }

  /* A stretch of ruler with only its two end numbers written, so the
     marks between them can be counted — the picture of "a step". */
  function spanSvg(span, unit) {
    var x0 = 44;
    var w = 232;
    var seg = w / span.gaps;
    var ticks = '';
    for (var i = 0; i <= span.gaps; i += 1) {
      var x = x0 + seg * i;
      ticks += '<line class="span-tick" x1="' + x + '" y1="' + RULER.top +
        '" x2="' + x + '" y2="' + (RULER.top + 11) + '"/>';
    }
    /* The two end marks are drawn again on top, longer: they carry the
       two numbers, and the length is what tells them apart from the
       marks inside the stretch. */
    var ends = '<line class="span-tick-end" x1="' + x0 + '" y1="' + RULER.top +
      '" x2="' + x0 + '" y2="' + (RULER.top + 22) + '"/>' +
      '<line class="span-tick-end" x1="' + (x0 + w) + '" y1="' + RULER.top +
      '" x2="' + (x0 + w) + '" y2="' + (RULER.top + 22) + '"/>';
    var nums = '<text class="span-num" x="' + x0 + '" y="' + NUM_Y +
      '" text-anchor="middle">' + span.from + '</text>' +
      '<text class="span-num" x="' + (x0 + w) + '" y="' + NUM_Y +
      '" text-anchor="middle">' + span.to + '</text>';
    return svgWrap(RULE_BOX,
      '<rect class="span-face" x="' + x0 + '" y="' + RULER.top + '" width="' + w +
      '" height="' + RULER.h + '" rx="8"/>' +
      '<text class="ruler-unit" x="' + x0 + '" y="' + (RULER.top - 12) + '">' + unit + '</text>' +
      ticks + ends + nums);
  }

  /* The pencil lying over the ruler between two numbers: what the marks
     it passes are, which is one more than how many marks a person can
     point at when they are careless. */
  function objectSpanSvg(rec, unit) {
    var px = RULER.w / rec.to;
    var fx = RULER.x + rec.from * px;
    var tx = RULER.x + rec.to * px;
    var guides = '<line class="span-guide" x1="' + fx + '" y1="48" x2="' + fx +
      '" y2="' + RULER.top + '"/>' +
      '<line class="span-guide" x1="' + tx + '" y1="48" x2="' + tx +
      '" y2="' + RULER.top + '"/>';
    var pencil = '<rect class="span-object" x="' + fx + '" y="52" width="' + (tx - fx) +
      '" height="24" rx="5"/>';
    return svgWrap(RULE_BOX, rulerUnit(unit) + guides + pencil +
      rulerFace(0, rec.to, 1, 1, undefined));
  }

  /* The scale of a plan: a bar split into four centimetres, which is
     the same `key` on every plan, and below it the stretch being
     measured. With `cm` the stretch is on the plan; with `real` it is
     the real road, drawn to no scale and carrying its own number. */
  function planSvg(cfg) {
    var seg = PLAN.w / PLAN.segs;
    var bar = '<rect class="plan-bar" x="' + PLAN.x + '" y="34" width="' + PLAN.w +
      '" height="20" rx="4"/>';
    var segs = '';
    var cmLabels = '';
    for (var i = 1; i <= PLAN.segs; i += 1) {
      var x = PLAN.x + seg * i;
      segs += '<line class="plan-seg" x1="' + x + '" y1="34" x2="' + x + '" y2="54"/>';
      cmLabels += '<text class="plan-num" x="' + x + '" y="70" text-anchor="middle">' + i + '</text>';
    }
    var rows = '<text class="plan-row-label" x="' + (PLAN.x - 12) + '" y="49" text-anchor="end">' +
      App.i18n.t('gen.planLabel') + '</text>';
    var y = 126;
    var route;
    if (cfg.cm) {
      var len = cfg.cm * seg;
      route = '<line class="plan-route" x1="' + PLAN.x + '" y1="' + y + '" x2="' +
        (PLAN.x + len) + '" y2="' + y + '"/>' +
        '<circle class="plan-dot" cx="' + PLAN.x + '" cy="' + y + '" r="6"/>' +
        '<circle class="plan-dot" cx="' + (PLAN.x + len) + '" cy="' + y + '" r="6"/>' +
        '<text class="plan-measure" x="' + (PLAN.x + len / 2) + '" y="' + (y - 14) +
        '" text-anchor="middle">' + cfg.cm + ' cm</text>';
      rows += '<text class="plan-row-label" x="' + (PLAN.x - 12) + '" y="' + (y + 5) +
        '" text-anchor="end">' + App.i18n.t('gen.planPath') + '</text>';
    } else {
      /* The real distance is drawn to no scale on purpose: drawn to
         scale it would BE the answer in centimetres, and the question
         would be read off the drawing instead of worked out. */
      route = '<line class="plan-route" x1="' + PLAN.x + '" y1="' + y + '" x2="' +
        (PLAN.x + PLAN.w) + '" y2="' + y + '"/>' +
        '<circle class="plan-dot" cx="' + PLAN.x + '" cy="' + y + '" r="6"/>' +
        '<circle class="plan-dot" cx="' + (PLAN.x + PLAN.w) + '" cy="' + y + '" r="6"/>' +
        '<text class="plan-measure" x="' + (PLAN.x + PLAN.w / 2) + '" y="' + (y - 14) +
          '" text-anchor="middle">' + cfg.real + ' ' + cfg.unit + '</text>';
      rows += '<text class="plan-row-label" x="' + (PLAN.x - 12) + '" y="' + (y + 5) +
        '" text-anchor="end">' + App.i18n.t('gen.planReal') + '</text>';
    }
    return svgWrap('0 0 320 176', rows + bar + segs + cmLabels + route);
  }

  /* ---- The four ideas, shown before any question ---- */
  var CONCEPTS = ['escala', 'rayita', 'llegar', 'dibujo'];

  function conceptSvg(id) {
    if (id === 'escala') {
      /* All the marks carry a number: this is what "the scale" means. */
      return svgWrap(RULE_BOX, rulerUnit('cm') + rulerFace(0, 10, 1, 1, undefined));
    }
    if (id === 'rayita') {
      /* The marks between two numbers, all the same length: a step. */
      return svgWrap(RULE_BOX, rulerUnit('cm') +
        spanSvg({ from: 0, to: 5, gaps: 5 }, 'cm'));
    }
    if (id === 'llegar') {
      /* The pencil on its mark, and that mark drawn taller than the
         rest so the eye knows which one is being asked about. */
      return svgWrap(RULE_BOX, rulerUnit('cm') +
        rulerSvg({ from: 0, to: 10, step: 1, labelEvery: 1, value: 6, unit: 'cm' }));
    }
    /* id === 'dibujo': the plan's scale, which is a step too — one
       centimetre of the drawing for so much of real life. */
    return svgWrap('0 0 320 176',
      planSvg({ key: 5, unit: 'm', cm: 3 }));
  }

  function paintConcept() {
    var id = CONCEPTS[conceptIndex];
    conceptVisual.innerHTML = conceptSvg(id);
    conceptTitle.textContent = App.i18n.t('concept.' + id + '.title');
    conceptText.textContent = App.i18n.t('concept.' + id + '.text');
    conceptPrev.setAttribute('aria-label', App.i18n.t('galleryPrevious'));
    conceptNext.setAttribute('aria-label', App.i18n.t('galleryNext'));
  }

  function paintReal() {
    var item = DATA.real[realIndex];
    realObject.textContent = item.picto;
    realCaption.textContent = App.i18n.t('real.' + item.id + '.name');
    realNote.textContent = App.i18n.t('real.' + item.id + '.text');
    realPrev.setAttribute('aria-label', App.i18n.t('galleryPrevious'));
    realNext.setAttribute('aria-label', App.i18n.t('galleryNext'));
  }

  /* ---- Question generators ----
     Every generator returns { prompt, visual, visualAria, legend,
     options }. The prompt is always the whole question in one sentence:
     this audience reads one idea at a time. */
  var GENERATORS = {
    /* The same question on the ruler and on the other two instruments:
       the object reaches a mark, say how much it measures. The wrong
       answers are the marks next to it on that very instrument, so
       they are the numbers a person reads by mistake — the number
       printed to the left, the one to the right, and the neighbouring
       marks themselves. */
    /* What is reached, depends on the instrument: the length of a pencil,
       the temperature of a thermometer, how much water is in a jug. One
       shared sentence for the three of them would say "the pencil" on a
       jug, and the person reads the words before the picture. */
    readValue: function (nv) {
      var value = draw(nv.id, DATA.readings[nv.id]);
      var near = labelNeighbours(nv, value);
      var wrongs = [near.left, near.right, value - nv.step, value + nv.step];
      var isRuler = nv.shape === 'ruler';
      var visual = isRuler
        ? rulerSvg({ from: nv.from, to: nv.to, step: nv.step, labelEvery: nv.labelEvery, value: value, unit: nv.unit })
        : gaugeSvg({ shape: nv.shape, from: nv.from, to: nv.to, step: nv.step, labelEvery: nv.labelEvery, value: value, unit: nv.unit });
      var aria = isRuler
        ? App.i18n.t('gen.readAria').replace(/\{value\}/g, value)
        : (nv.shape === 'jar'
          ? App.i18n.t('gen.jarAria').replace(/\{value\}/g, value)
          : App.i18n.t('gen.levelAria').replace(/\{value\}/g, value));
      var prompt = isRuler
        ? App.i18n.t('gen.readPromptRuler')
        : (nv.shape === 'jar'
          ? App.i18n.t('gen.readPromptJar')
          : App.i18n.t('gen.readPromptTermo'));
      return {
        prompt: prompt,
        visual: visual,
        visualAria: aria,
        legend: App.i18n.t('gen.readHint'),
        options: optionsFor(value, wrongs, nv.unit)
      };
    },

    /* What one mark is worth. The answer is the stretch divided by the
       number of marks, and it only comes out right if the marks were
       counted right — which is why the two numbers are printed and
       every mark between them is drawn. */
    stepValue: function (nv) {
      var span = draw(nv.id, DATA.spans);
      var step = (span.to - span.from) / span.gaps;
      var total = span.to - span.from;
      return {
        prompt: App.i18n.t('gen.stepPrompt'),
        visual: spanSvg(span, nv.unit),
        visualAria: App.i18n.t('gen.stepAria')
          .replace(/\{gaps\}/g, span.gaps)
          .replace(/\{from\}/g, span.from)
          .replace(/\{to\}/g, span.to),
        legend: App.i18n.t('gen.stepHint'),
        /* The total between the two numbers is the mistake here: it is
           on the picture, it is plausible, and it is not what a mark is
           worth. */
        options: optionsFor(step, [total, step * 2, step * 3], nv.unit)
      };
    },

    /* The other direction: how many marks a thing goes through. The
       classic answer is one short, from counting the marks a person
       can point at and forgetting that the starting mark is not one of
       the marks it passes. */
    stepsCounted: function (nv) {
      var rec = draw(nv.id, DATA.recorridos);
      var answer = rec.to - rec.from;
      return {
        prompt: App.i18n.t('gen.stepsPrompt'),
        visual: objectSpanSvg(rec, nv.unit),
        visualAria: App.i18n.t('gen.stepsAria')
          .replace(/\{from\}/g, rec.from)
          .replace(/\{to\}/g, rec.to),
        legend: App.i18n.t('gen.stepsHint'),
        options: optionsFor(answer, [answer - 1, answer + 1, rec.to], nv.unit)
      };
    },

    /* Plan to real life: each centimetre of the drawing is worth so
       much, so the centimetres are counted and multiplied. */
    planToReal: function () {
      var plano = draw('d1', DATA.planos);
      /* The pool key carries the plan it came from. A single pool for
         the whole level would hand a centimetre count over from one
         scale to another, and "3 cm at 1:50" would come out as the
         same 3 cm at 1:5 — two different questions wearing the same
         number. */
      var cm = draw('d1:' + plano.key + ':' + plano.unit, plano.cm);
      var answer = cm * plano.key;
      return {
        prompt: App.i18n.t('gen.planPrompt')
          .replace(/\{cm\}/g, cm)
          .replace(/\{unit\}/g, unitWord(plano.unit)),
        visual: planSvg({ key: plano.key, unit: plano.unit, cm: cm }),
        visualAria: App.i18n.t('gen.planAria')
          .replace(/\{key\}/g, plano.key)
          .replace(/\{unit\}/g, plano.unit)
          .replace(/\{cm\}/g, cm),
        /* The key and then the advice, in that order: the drawing does not
           carry the numbers, so the sentence that states them has to be
           there. The advice does not repeat them — saying "each
           centimetre is 10 m" twice on one screen is two readings of
           the same line. */
        legend: App.i18n.t('gen.planKey')
          .replace(/\{key\}/g, plano.key)
          .replace(/\{unit\}/g, plano.unit) + ' ' + App.i18n.t('gen.planHint'),
        /* Adding instead of multiplying is the mistake a plan really
           produces: two numbers are written and the eye adds them. */
        options: optionsFor(answer, [answer - plano.key, answer + plano.key, cm + plano.key], plano.unit)
      };
    },

    /* And the same convention read the other way round. The distance in
       real life has to be one of THIS plan's distances: taking it
       from a pool shared across plans is how 150 m ends up divided by
       50 to give 0.08 cm, a number no plan has. */
    realToPlan: function () {
      var plano = draw('d2', DATA.planos);
      var real = draw('d2:' + plano.key + ':' + plano.unit, plano.real);
      var answer = real / plano.key;
      return {
        prompt: App.i18n.t('gen.planBackPrompt')
          .replace(/\{real\}/g, real)
          .replace(/\{unit\}/g, unitWord(plano.unit)),
        visual: planSvg({ key: plano.key, unit: plano.unit, real: real }),
        visualAria: App.i18n.t('gen.planBackAria')
          .replace(/\{key\}/g, plano.key)
          .replace(/\{unit\}/g, plano.unit)
          .replace(/\{real\}/g, real),
        legend: App.i18n.t('gen.planKey')
          .replace(/\{key\}/g, plano.key)
          .replace(/\{unit\}/g, plano.unit) + ' ' +
          App.i18n.t('gen.planBackHint')
            .replace(/\{real\}/g, real)
            .replace(/\{unit\}/g, plano.unit),
        options: optionsFor(answer, [answer - 1, answer + 1, answer * 2], 'cm')
      };
    }
  };

  /* ============================================================
     Screens and flow
     ============================================================ */

  function show(screen) {
    [screenIntro, screenReal, screenMenu, screenGame, screenEnd].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Activity menu (flat grid, one button per DATA.activities entry) ---- */
  function paintMenu() {
    var cont = $('#activitiesMenu');
    cont.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'menu-grid';
    Object.keys(DATA.activities).forEach(function (id) {
      var act = DATA.activities[id];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-actividad';
      btn.innerHTML = '<span class="picto" aria-hidden="true">' + act.picto + '</span>' +
        '<span>' + App.i18n.t('activity.' + id + '.name') + '</span>' +
        '<span class="detail-card">' + App.i18n.t('activity.' + id + '.detail') + '</span>';
      btn.addEventListener('click', function () { openActivity(id); });
      grid.appendChild(btn);
    });
    cont.appendChild(grid);
  }

  /* The level rises one step per completed round, capped at the last
     one, so a person who comes back continues where they were. */
  function levelFromProgress(activityId) {
    var levels = activity.levels;
    var completed = progress.roundsByActivity[activityId];
    if (typeof completed !== 'number' || completed < 0) completed = 0;
    return levels[Math.min(Math.floor(completed), levels.length - 1)];
  }

  function roundLength() {
    return DATA.perRound;
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    startRound(levelFromProgress(id));
  }

  /* ---- Game ---- */

  function startRound(nv) {
    level = nv;
    index = 0;
    roundCorrect = 0;
    pools = {};
    reinforceList = [];
    reinforceIndex = 0;
    inReinforce = false;
    App.reinforce.banner.hide();
    /* Registers the callback that runs when the normal round ends with
       pending failures; it mounts the mini-round with just those. */
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    show(screenGame);
    render();
  }

  function startReinforce(fallos) {
    reinforceList = fallos.map(function (f) { return f.payload; });
    reinforceIndex = 0;
    inReinforce = true;
    attempts = 0;
    App.reinforce.banner.set(
      App.i18n.t('reinforceTitle') + ' — ' +
      App.i18n.t('reinforceIntro').replace('{n}', reinforceList.length)
    );
    showReinforceQuestion(reinforceList[0]);
  }

  /* Paints one question. `fixed` replays a question from the reinforce
     queue; without it a new one is generated for the current level. */
  function paintQuestion(fixed) {
    question = fixed || GENERATORS[level.tipo](level, index);
    answered = false;
    attempts = 0;

    promptEl.textContent = question.prompt;
    visualEl.innerHTML = question.visual || '';
    if (question.visualAria) {
      visualEl.setAttribute('role', 'img');
      visualEl.setAttribute('aria-label', question.visualAria);
    } else {
      visualEl.removeAttribute('role');
      visualEl.removeAttribute('aria-label');
    }
    legendEl.innerHTML = question.legend || '';
    legendEl.classList.toggle('hidden', !question.legend);

    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');

    optionsEl.innerHTML = '';
    question.options.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.innerHTML = op.html;
      if (op.aria) btn.setAttribute('aria-label', op.aria);
      btn.addEventListener('click', function () { answer(op, btn); });
      optionsEl.appendChild(btn);
    });

    progressFill.style.width = (inReinforce
      ? ((reinforceIndex + 1) / reinforceList.length)
      : (index / roundLength())) * 100 + '%';
    progressText.textContent = '';
    paintStars();
  }

  function showReinforceQuestion(p) { paintQuestion(p); }

  function render() { paintQuestion(null); }

  /* Visible text of an option (its html may wrap spans). */
  function plainText(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
  }

  function showExplanation(isCorrect) {
    if (isCorrect && inReinforce) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    explanationEl.textContent =
      (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      plainText(correct.html) + '.';
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: the first mistake does not give the answer away,
     it invites another look. Only the second one explains it. */
  function showHint() {
    explanationEl.textContent = App.i18n.t('hint');
    explanationWrap.classList.remove('hidden');
  }

  function answer(op, btn) {
    if (answered) return;
    if (op.correct) {
      showExplanation(true);
      answered = true;
      btn.classList.add('correct');
      App.feedback.success(feedbackEl);
      /* The reinforcement mini-round replays questions this round already
         asked, so counting it here reported more correct answers than the
         round has — "Has resuelto 11 preguntas" for a 6-question round —
         and pushed roundCorrect past DATA.perRound, which is the exact
         value endRound() compares against to offer the next level. The
         button therefore vanished for anyone who had to repeat a
         question, which is precisely the person who should be moving
         up. Stars move with the score so the two numbers stay
         consistent. */
      if (!inReinforce) {
        progress.stars += 1;
        roundCorrect += 1;
      }
      save();
      paintStars();
      App.utils.$$('#options .option-btn').forEach(function (b) { b.disabled = true; });
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      attempts += 1;
      App.reinforce.add(level.id + ':' + index, question);
      var respuestaTrasPista = attempts > 1;
      showHint();
      /* Reveal the explanation only after the hint is acknowledged. */
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap, function () { if (respuestaTrasPista) showExplanation(false); });
    }
  }

  function next() {
    if (inReinforce) {
      reinforceIndex += 1;
      if (reinforceIndex >= reinforceList.length) {
        inReinforce = false;
        App.reinforce.clear();
        App.reinforce.banner.hide();
        endRound();
      } else {
        showReinforceQuestion(reinforceList[reinforceIndex]);
      }
      return;
    }
    index += 1;
    if (index >= roundLength()) {
      /* consume() returns [] when nothing was failed; otherwise it fires
         the callback that mounts the mini-round, which ends the round
         itself, so endRound must not also run here. */
      if (App.reinforce.consume().length === 0) endRound();
    } else {
      render();
    }
  }

  function endRound() {
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    progress.roundsByActivity[activity.id] =
      (progress.roundsByActivity[activity.id] || 0) + 1;
    save();
    show(screenEnd);
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{activity}', App.i18n.t('activity.' + activity.id + '.name'))
        .replace('{stars}', progress.stars);
    }
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));

    var idxN = activity.levels.indexOf(level);
    var nextLevel = (roundCorrect === roundLength() && idxN !== -1 && idxN + 1 < activity.levels.length)
      ? activity.levels[idxN + 1] : null;
    var btnHarder = $('#btnHarder');
    if (nextLevel) {
      btnHarder.textContent = App.i18n.t('btnHarder').replace('{name}', App.i18n.t('level.' + nextLevel.id));
      btnHarder.classList.remove('hidden');
      btnHarder.onclick = function () { startRound(nextLevel); };
    } else {
      btnHarder.classList.add('hidden');
    }
  }

  /* ---- Events ---- */

  $('#btnNext').addEventListener('click', next);
  $('#btnRepeat').addEventListener('click', function () {
    startRound(levelFromProgress(activity.id));
  });
  $('#btnMenu').addEventListener('click', function () { show(screenMenu); });
  $('#btnOtherActivity').addEventListener('click', function () { show(screenMenu); });

  function moveConcept(step) {
    conceptIndex = (conceptIndex + step + CONCEPTS.length) % CONCEPTS.length;
    paintConcept();
  }

  conceptPrev.addEventListener('click', function () { moveConcept(-1); });
  conceptNext.addEventListener('click', function () { moveConcept(1); });
  realPrev.addEventListener('click', function () {
    realIndex = (realIndex + DATA.real.length - 1) % DATA.real.length;
    paintReal();
  });
  realNext.addEventListener('click', function () {
    realIndex = (realIndex + 1) % DATA.real.length;
    paintReal();
  });
  $('#introContinue').addEventListener('click', function () { show(screenReal); });
  $('#realBack').addEventListener('click', function () { show(screenIntro); });
  $('#realContinue').addEventListener('click', function () { show(screenMenu); });
  $('#menuBack').addEventListener('click', function () { show(screenReal); });

  paintConcept();
  paintReal();
  paintMenu();
  paintStars();
})();