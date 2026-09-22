/* ============================================================
   Calculia — Datos y gráficos
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'charts';
  var $ = App.utils.$;

  var screenMenu = $('#screenMenu');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
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

  /* Round state */
  var activity = null;
  var level = null;
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var question = null;
  var pools = {};
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce). */
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Data invariants ----
     Every "which has most / least" question needs a single winner, and
     every bar has to land exactly on a line of the scale. A bad data row
     must be loud here rather than produce a question with two right
     answers, which would teach that the person was wrong when they were
     not. */
  function counts(set) {
    return set.cats.map(function (c) { return c.n; });
  }
  function uniqueExtreme(list, pick) {
    var best = pick.apply(Math, list);
    return list.filter(function (v) { return v === best; }).length === 1;
  }
  DATA.sets.concat(DATA.barSets).forEach(function (set) {
    var ns = counts(set);
    if (!uniqueExtreme(ns, Math.max) || !uniqueExtreme(ns, Math.min)) {
      throw new Error('charts: set "' + set.id + '" has no single most/least');
    }
  });
  DATA.barSets.forEach(function (set) {
    set.cats.forEach(function (c) {
      if (c.n % DATA.barStep !== 0 || c.n > DATA.barMax) {
        throw new Error('charts: bar "' + set.id + '/' + c.id + '" misses the scale');
      }
    });
  });
  DATA.shareSets.forEach(function (set) {
    var total = counts(set).reduce(function (a, b) { return a + b; }, 0);
    if (total % set.cats.length !== 0) {
      throw new Error('charts: share set "' + set.id + '" does not divide evenly');
    }
  });

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

  function catName(id) { return App.i18n.t('cat.' + id); }
  function setTitle(id) { return App.i18n.t('set.' + id); }
  function tokenById(id) {
    return DATA.tokens.filter(function (t) { return t.id === id; })[0];
  }

  function extremeCat(set, which) {
    return set.cats.slice().sort(function (a, b) {
      return which === 'max' ? b.n - a.n : a.n - b.n;
    })[0];
  }

  /* Three numbers around the right one: one less, the answer, one more.
     Being out by one is the mistake reading a chart actually produces. */
  function numberOptions(value, step) {
    var d = step || 1;
    var values = [value, value - d, value + d].filter(function (v) { return v >= 0; });
    var extra = value + 2 * d;
    while (values.length < 3) { values.push(extra); extra += d; }
    return App.utils.shuffle(values.slice(0, 3)).map(function (v) {
      return { html: String(v), correct: v === value };
    });
  }

  /* The categories themselves as options: the confusion on offer is the
     real one (this row against that row), never a random word. */
  function catOptions(set, answerId) {
    return App.utils.shuffle(set.cats.map(function (c) {
      return {
        html: '<span class="opt-picto" aria-hidden="true">' + c.picto + '</span>' +
          '<span class="opt-name">' + catName(c.id) + '</span>',
        aria: catName(c.id),
        correct: c.id === answerId
      };
    }));
  }

  /* ---- The charts ----
     Everything is countable or readable off a labelled scale: the answer
     is always on screen, never held in the head. */
  function tokensHtml(n, picto) {
    var html = '';
    for (var i = 0; i < n; i++) {
      html += '<span class="chart-token">' + picto + '</span>';
    }
    return html;
  }

  function pictogram(set, markId) {
    var html = '<div class="pictogram">';
    set.cats.forEach(function (c) {
      html += '<div class="chart-row' + (c.id === markId ? ' is-asked' : '') + '">' +
        '<span class="row-label">' +
        (c.id === markId ? '<span class="row-mark" aria-hidden="true">👉</span>' : '') +
        catName(c.id) + '</span>' +
        '<span class="row-pictos">' + tokensHtml(c.n, c.picto) + '</span>' +
        '</div>';
    });
    return html + '</div>';
  }

  /* Horizontal bars: at 320px a vertical chart with three labels either
     overflows or shrinks the text, and neither is acceptable. */
  function barChart(set, markId) {
    var html = '<div class="bar-chart">';
    set.cats.forEach(function (c) {
      html += '<div class="bar-row' + (c.id === markId ? ' is-asked' : '') + '">' +
        '<span class="row-label">' +
        (c.id === markId ? '<span class="row-mark" aria-hidden="true">👉</span>' : '') +
        catName(c.id) + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' +
        ((c.n / DATA.barMax) * 100) + '%"></span></span>' +
        '</div>';
    });
    /* The scale is what makes the height readable, so it is part of the
       chart, not decoration. */
    html += '<div class="bar-scale">';
    for (var v = 0; v <= DATA.barMax; v += DATA.barStep * 2) {
      html += '<span class="scale-mark" style="left:' +
        ((v / DATA.barMax) * 100) + '%">' + v + '</span>';
    }
    return html + '</div></div>';
  }

  function frequencyTable(set, markId) {
    var html = '<table class="freq-table"><thead><tr>' +
      '<th>' + App.i18n.t('gen.colThing') + '</th>' +
      '<th>' + App.i18n.t('gen.colHowMany') + '</th>' +
      '</tr></thead><tbody>';
    set.cats.forEach(function (c) {
      html += '<tr class="' + (c.id === markId ? 'is-asked' : '') + '">' +
        '<td>' + catName(c.id) + '</td><td class="cell-n">' + c.n + '</td></tr>';
    });
    return html + '</tbody></table>';
  }

  function shareRows(set) {
    var html = '<div class="share-rows">';
    set.cats.forEach(function (c) {
      html += '<div class="share-row"><span class="row-label">' + catName(c.id) +
        '</span><span class="row-pictos">' + tokensHtml(c.n, c.picto) + '</span></div>';
    });
    return html + '</div>';
  }

  function bagHtml(bag) {
    var html = '<div class="bag">';
    bag.items.forEach(function (it) {
      html += tokensHtml(it.n, tokenById(it.id).picto).replace(/chart-token/g, 'bag-token');
    });
    return html + '</div>';
  }

  function setAria(set) {
    return setTitle(set.id) + '. ' + set.cats.map(function (c) {
      return catName(c.id) + ': ' + c.n;
    }).join('. ') + '.';
  }

  /* Three distinct numbers: the answer first, then the given confusions,
     then neighbours to pad if any of them collided with it. */
  function pickNumbers(correct, candidates) {
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.concat([correct + 1, correct - 1, correct + 2]).forEach(function (v) {
      if (v > 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    return App.utils.shuffle(list).map(function (v) {
      return { html: String(v), correct: v === correct };
    });
  }

  /* A group of measurements marked on one line from 1 to 10, so two
     groups can be compared by how far apart their marks are. */
  function spreadLine(values, label) {
    var html = '<span class="spread-row"><span class="spread-label">' + label + '</span>' +
      '<span class="spread-line">';
    for (var v = 1; v <= 10; v++) {
      var n = values.filter(function (x) { return x === v; }).length;
      html += '<span class="spread-slot">' +
        (n ? '<span class="spread-mark" data-count="' + n + '">' +
          new Array(n + 1).join('●') + '</span>' : '') + '</span>';
    }
    return html + '</span></span>';
  }

  /* Two series over the same columns. Each series carries its own picture
     at the start of its bar and its own outline, so the two are never told
     apart by colour alone (WCAG 1.4.1). */
  function pairChart(set) {
    var html = '<div class="pair-chart"><p class="pair-key">' +
      '<span class="key-item"><span class="key-picto" aria-hidden="true">' +
      tokenOrCatPicto(set.a) + '</span>' + catName(set.a) + '</span>' +
      '<span class="key-item is-b"><span class="key-picto" aria-hidden="true">' +
      tokenOrCatPicto(set.b) + '</span>' + catName(set.b) + '</span></p>';
    set.cats.forEach(function (c) {
      html += '<div class="pair-row"><span class="pair-label">' + catName(c.id) + '</span>' +
        '<span class="pair-bars">' +
        '<span class="pair-track"><span class="pair-fill is-a" style="width:' +
        ((c.an / DATA.barMax) * 100) + '%"></span></span>' +
        '<span class="pair-track"><span class="pair-fill is-b" style="width:' +
        ((c.bn / DATA.barMax) * 100) + '%"></span></span>' +
        '</span></div>';
    });
    html += '<div class="bar-scale">';
    for (var v = 0; v <= DATA.barMax; v += DATA.barStep * 2) {
      html += '<span class="scale-mark" style="left:' +
        ((v / DATA.barMax) * 100) + '%">' + v + '</span>';
    }
    return html + '</div></div>';
  }

  /* The series are named with category ids, which carry their picture in
     whichever set they came from. */
  function tokenOrCatPicto(id) {
    var found = '';
    DATA.sets.concat(DATA.barSets).forEach(function (set) {
      set.cats.forEach(function (c) { if (c.id === id && !found) found = c.picto; });
    });
    return found;
  }

  /* Every pair of series has to have one column each way and one tie, or
     one of the three questions would have no answer, or more than one. */
  DATA.pairSets.forEach(function (set) {
    var wins = function (pick) {
      return set.cats.filter(pick).length;
    };
    if (wins(function (c) { return c.an > c.bn; }) !== 1) {
      throw new Error('charts: pair "' + set.id + '" has no single column where the first wins');
    }
    if (wins(function (c) { return c.bn > c.an; }) !== 1) {
      throw new Error('charts: pair "' + set.id + '" has no single column where the second wins');
    }
    if (wins(function (c) { return c.an === c.bn; }) !== 1) {
      throw new Error('charts: pair "' + set.id + '" has no single tied column');
    }
    /* An odd value would land the bar between two marks of the scale. */
    set.cats.forEach(function (c) {
      if (c.an % DATA.barStep || c.bn % DATA.barStep ||
          c.an > DATA.barMax || c.bn > DATA.barMax) {
        throw new Error('charts: pair "' + set.id + '" has a bar that cannot be read off the scale');
      }
    });
    [set.a, set.b].forEach(function (id) {
      if (!tokenOrCatPicto(id)) {
        throw new Error('charts: series "' + id + '" has no picture of its own');
      }
    });
  });

  /* A group whose lowest and highest are the same has no spread to measure. */
  DATA.spreads.forEach(function (pair) {
    ['tight', 'wide'].forEach(function (k) {
      var values = pair[k];
      if (Math.max.apply(null, values) === Math.min.apply(null, values)) {
        throw new Error('charts: group ' + values.join(',') + ' has no lowest and highest');
      }
    });
  });

  /* Each cloud has to do what it says: the dots must really end higher or
     lower than they started, or the level would teach the opposite. */
  DATA.clouds.forEach(function (c) {
    var goesUp = c.points[c.points.length - 1] > c.points[0];
    if (goesUp !== (c.dir === 'up')) {
      throw new Error('charts: cloud "' + c.id + '" does not go ' + c.dir);
    }
  });
  ['up', 'down'].forEach(function (dir) {
    if (!DATA.clouds.some(function (c) { return c.dir === dir; })) {
      throw new Error('charts: no cloud that goes "' + dir + '"');
    }
  });

  var GENERATORS = {

    /* Two things measured together. The dots are drawn left to right, so
       "when one goes up, does the other go up or down?" is read off the
       cloud rather than worked out. */
    scatter: function (nv) {
      var cloud = draw(nv.id, DATA.clouds);
      var top = Math.max.apply(Math, cloud.points);
      var html = '<div class="scatter">';
      cloud.points.forEach(function (v, i) {
        html += '<span class="scatter-col"><span class="scatter-dot" style="bottom:' +
          Math.round((v / top) * 88) + '%"></span></span>';
      });
      var goesUp = cloud.points[cloud.points.length - 1] > cloud.points[0];
      return {
        prompt: App.i18n.t('gen.scatterPrompt')
          .replace(/\{a\}/g, App.i18n.t('cloud.' + cloud.id + '.a'))
          .replace(/\{b\}/g, App.i18n.t('cloud.' + cloud.id + '.b')),
        visual: html + '</div>',
        visualAria: App.i18n.t('gen.scatterAria')
          .replace(/\{n\}/g, cloud.points.length),
        legend: App.i18n.t('gen.scatterHint'),
        options: App.utils.shuffle(['up', 'down'].map(function (k) {
          return {
            html: '<span class="answer-name">' + App.i18n.t('together.' + k) + '</span>',
            aria: App.i18n.t('together.' + k),
            correct: k === (goesUp ? 'up' : 'down')
          };
        })),
        inline: true
      };
    },

    /* Chance that depends on what already happened. One ball is taken out
       and NOT put back, so the bag is drawn twice: before and after. What
       is left is counted, not reasoned about. */
    afterDraw: function (nv) {
      var bag = draw(nv.id, DATA.bags.filter(function (b) {
        return b.items.length === 2 && b.items.every(function (i) { return i.n >= 2; });
      }));
      /* Keyed by the bag as well as the level: a pool shared across bags
         would hand out a colour that is not in this one. */
      var taken = draw(nv.id + 'take' + bag.id, bag.items.map(function (i) {
        return i.id;
      }));
      var before = bag.items.map(function (i) { return { id: i.id, n: i.n }; });
      var after = before.map(function (i) {
        return { id: i.id, n: i.id === taken ? i.n - 1 : i.n };
      });
      function drawBag(items, cls) {
        var html = '<div class="bag ' + cls + '">';
        items.forEach(function (it) {
          html += tokensHtml(it.n, tokenById(it.id).picto).replace(/chart-token/g, 'bag-token');
        });
        return html + '</div>';
      }
      var left = after.filter(function (i) { return i.id === taken; })[0].n;
      return {
        prompt: App.i18n.t('gen.afterDraw')
          .replace(/\{thing\}/g, catName(taken)),
        visual: '<div class="before-after">' +
          '<span class="ba-one"><span class="ba-label">' + App.i18n.t('gen.before') +
          '</span>' + drawBag(before, 'is-before') + '</span>' +
          '<span class="ba-arrow" aria-hidden="true">\u2192</span>' +
          '<span class="ba-one"><span class="ba-label">' + App.i18n.t('gen.after') +
          '</span>' + drawBag(after, 'is-after') + '</span></div>',
        visualAria: App.i18n.t('gen.afterAria').replace(/\{n\}/g, left),
        legend: App.i18n.t('gen.afterHint'),
        /* Answering with what there was before is the mistake this teaches
           about: the second draw is not the same as the first. */
        options: pickNumbers(left, [left + 1, left + 2])
      };
    },


    /* How many different outfits come out. Every one of them is drawn, so
       the count is a count and not a multiplication to be trusted. */
    outfits: function (nv) {
      var set = draw(nv.id, DATA.outfits);
      var total = set.tops.length * set.bottoms.length;
      var html = '<div class="outfit-grid">';
      set.tops.forEach(function (top) {
        set.bottoms.forEach(function (bottom) {
          html += '<span class="outfit"><span class="outfit-part">' + top +
            '</span><span class="outfit-part">' + bottom + '</span></span>';
        });
      });
      return {
        prompt: App.i18n.t('gen.howManyOutfits')
          .replace(/\{tops\}/g, set.tops.length)
          .replace(/\{bottoms\}/g, set.bottoms.length),
        visual: html + '</div>',
        visualAria: App.i18n.t('gen.outfitsAria').replace(/\{n\}/g, total),
        legend: App.i18n.t('gen.outfitsHint'),
        /* Adding the two instead of pairing them off is the mistake this
           actually produces, so it is one of the buttons. */
        options: pickNumbers(total, [set.tops.length + set.bottoms.length])
      };
    },

    /* Which group is more spread out. Both are drawn on the same line, so
       "more spread" is something you see rather than something you work
       out. */
    spread: function (nv) {
      var pair = draw(nv.id, DATA.spreads);
      var askWide = draw(nv.id + 'dir', [true, false]);
      /* Which of the two is drawn on top changes from question to
         question, so the answer is never "always the first one". */
      var wideOnTop = draw(nv.id + 'order', [true, false]);
      var first = App.i18n.t('gen.groupA');
      var second = App.i18n.t('gen.groupB');
      var wideLabel = wideOnTop ? first : second;
      var tightLabel = wideOnTop ? second : first;
      var answer = askWide ? wideLabel : tightLabel;
      return {
        prompt: App.i18n.t(askWide ? 'gen.whichSpread' : 'gen.whichTight'),
        visual: '<div class="spread-stage">' +
          spreadLine(wideOnTop ? pair.wide : pair.tight, first) +
          spreadLine(wideOnTop ? pair.tight : pair.wide, second) + '</div>',
        visualAria: App.i18n.t('gen.spreadAria'),
        legend: App.i18n.t('gen.spreadHint'),
        options: App.utils.shuffle([first, second].map(function (label) {
          return {
            html: '<span class="answer-name">' + label + '</span>',
            aria: label,
            correct: label === answer
          };
        })),
        inline: true
      };
    },

    /* Drawing twice. Every possible pair is drawn, so "how many different
       results" is counted. With two colours it is four and with three it
       is nine, which is exactly the idea: doing it twice multiplies what
       can happen. */
    twoDraws: function (nv) {
      var kinds = draw(nv.id, DATA.drawSets).map(function (id) {
        return tokenById(id);
      });
      var html = '<div class="coin-results">';
      kinds.forEach(function (a) {
        kinds.forEach(function (b) {
          html += '<span class="coin-result' + (a.id !== b.id ? ' is-mixed' : '') + '">' +
            '<span class="coin-face">' + a.picto + '</span>' +
            '<span class="coin-face">' + b.picto + '</span></span>';
        });
      });
      var total = kinds.length * kinds.length;
      return {
        prompt: App.i18n.t('gen.twoDraws').replace(/\{n\}/g, kinds.length),
        visual: html + '</div>',
        visualAria: App.i18n.t('gen.coinsResultAria').replace(/\{n\}/g, total),
        legend: App.i18n.t('gen.twoDrawsHint'),
        /* Answering with the number of colours, or with twice that, are
           the two real confusions. */
        options: pickNumbers(total, [kinds.length, kinds.length * 2])
      };
    },


    /* How many of this one are there? Counting a row of a pictogram. */
    readRow: function (nv) {
      var set = draw(nv.id, DATA.sets);
      var cat = App.utils.shuffle(set.cats)[0];
      return {
        prompt: setTitle(set.id) + ' ' +
          App.i18n.t('gen.howMany').replace(/\{thing\}/g, catName(cat.id)),
        visual: pictogram(set, cat.id),
        visualAria: setAria(set),
        legend: App.i18n.t('gen.countRow'),
        options: numberOptions(cat.n)
      };
    },

    /* Which one has most / least. No number is asked for: comparing rows
       is its own step. */
    extreme: function (nv) {
      var set = draw(nv.id, DATA.sets);
      var cat = extremeCat(set, nv.which);
      return {
        prompt: setTitle(set.id) + ' ' +
          App.i18n.t(nv.which === 'max' ? 'gen.whichMost' : 'gen.whichLeast'),
        visual: pictogram(set, null),
        visualAria: setAria(set),
        options: catOptions(set, cat.id),
        inline: true
      };
    },

    /* The same question, now against a scale instead of countable things. */
    readBar: function (nv) {
      var set = draw(nv.id, DATA.barSets);
      var cat = App.utils.shuffle(set.cats)[0];
      return {
        prompt: setTitle(set.id) + ' ' +
          App.i18n.t('gen.howMany').replace(/\{thing\}/g, catName(cat.id)),
        visual: barChart(set, cat.id),
        visualAria: setAria(set),
        legend: App.i18n.t('gen.readScale'),
        options: numberOptions(cat.n, DATA.barStep)
      };
    },

    extremeBar: function (nv) {
      var set = draw(nv.id, DATA.barSets);
      var cat = extremeCat(set, nv.which);
      return {
        prompt: setTitle(set.id) + ' ' +
          App.i18n.t(nv.which === 'max' ? 'gen.whichMost' : 'gen.whichLeast'),
        visual: barChart(set, null),
        visualAria: setAria(set),
        options: catOptions(set, cat.id),
        inline: true
      };
    },

    /* The same information with no picture at all: only numbers. */
    readTable: function (nv) {
      var set = draw(nv.id, DATA.sets.concat(DATA.barSets));
      var cat = App.utils.shuffle(set.cats)[0];
      return {
        prompt: setTitle(set.id) + ' ' +
          App.i18n.t('gen.howMany').replace(/\{thing\}/g, catName(cat.id)),
        visual: frequencyTable(set, null),
        visualAria: setAria(set),
        legend: App.i18n.t('gen.readTable'),
        options: numberOptions(cat.n)
      };
    },

    /* The mode, named for what it is: the one that comes up most. */
    mode: function (nv) {
      var set = draw(nv.id, DATA.sets.concat(DATA.barSets));
      var cat = extremeCat(set, 'max');
      return {
        prompt: setTitle(set.id) + ' ' + App.i18n.t('gen.mostRepeated'),
        visual: frequencyTable(set, null),
        visualAria: setAria(set),
        options: catOptions(set, cat.id),
        inline: true
      };
    },

    /* The average as what it really is: sharing out so everyone has the
       same. No formula, no dividing written down. */
    share: function (nv) {
      var set = draw(nv.id, DATA.shareSets);
      var total = set.cats.reduce(function (sum, c) { return sum + c.n; }, 0);
      return {
        prompt: setTitle(set.id) + ' ' + App.i18n.t('gen.shareEqually'),
        visual: shareRows(set),
        visualAria: setAria(set),
        legend: App.i18n.t('gen.shareHint'),
        options: numberOptions(total / set.cats.length)
      };
    },

    /* Certain, possible or impossible, decided by looking in the bag. */
    chance: function (nv) {
      var bag = draw(nv.id, DATA.bags);
      var present = bag.items.map(function (it) { return it.id; });
      var absent = DATA.tokens.filter(function (t) {
        return present.indexOf(t.id) === -1;
      });
      /* The three answers must all be reachable, so the kind asked about
         is chosen from what would make each one true. */
      var kinds = ['possible', 'impossible', 'certain'].filter(function (k) {
        if (k === 'impossible') return absent.length > 0;
        if (k === 'certain') return present.length === 1;
        return present.length > 1;
      });
      var kind = App.utils.shuffle(kinds)[0];
      var token = kind === 'impossible'
        ? App.utils.shuffle(absent)[0]
        : tokenById(App.utils.shuffle(present)[0]);
      var label = function (k) {
        return '<span class="chance-name">' + App.i18n.t('chance.' + k) + '</span>';
      };
      return {
        prompt: App.i18n.t('gen.chanceOf')
          .replace(/\{thing\}/g, catName(token.id)) + ' ' + token.picto,
        visual: bagHtml(bag),
        visualAria: App.i18n.t('gen.bagAria').replace(/\{n\}/g,
          bag.items.reduce(function (s, it) { return s + it.n; }, 0)),
        options: App.utils.shuffle(['certain', 'possible', 'impossible'].map(function (k) {
          return { html: label(k), aria: App.i18n.t('chance.' + k), correct: k === kind };
        })),
        inline: true
      };
    },

    /* Two series in the same chart: the combined chart, read by comparing
       one bar against the one under it. Which column is asked about
       changes with the question, and one column is a tie, so all three
       answers really happen. */
    twoSeries: function (nv) {
      var set = draw(nv.id, DATA.pairSets);
      var which = draw(nv.id + 'which', ['a', 'b', 'same']);
      var answer = set.cats.filter(function (c) {
        return which === 'same' ? c.an === c.bn
          : (which === 'a' ? c.an > c.bn : c.bn > c.an);
      })[0];
      var promptKey = which === 'same' ? 'gen.whenSame' : 'gen.whenMore';
      return {
        prompt: App.i18n.t(promptKey)
          .replace(/\{a\}/g, catName(which === 'b' ? set.b : set.a))
          .replace(/\{b\}/g, catName(which === 'b' ? set.a : set.b)),
        visual: pairChart(set),
        visualAria: App.i18n.t('gen.pairAria')
          .replace(/\{a\}/g, catName(set.a)).replace(/\{b\}/g, catName(set.b)) + ' ' +
          set.cats.map(function (c) {
            return catName(c.id) + ': ' + c.an + ', ' + c.bn;
          }).join('. ') + '.',
        legend: App.i18n.t('gen.pairHint'),
        options: App.utils.shuffle(set.cats.map(function (c) {
          return {
            html: '<span class="answer-name">' + catName(c.id) + '</span>',
            aria: catName(c.id),
            correct: c.id === answer.id
          };
        })),
        inline: true
      };
    },

    /* From the lowest mark to the highest: that is the range, and here it
       is the number of steps you count along the line. */
    range: function (nv) {
      var pair = draw(nv.id, DATA.spreads);
      var values = draw(nv.id + 'group', [pair.tight, pair.wide]);
      var low = Math.min.apply(null, values);
      var high = Math.max.apply(null, values);
      var answer = high - low;
      return {
        prompt: App.i18n.t('gen.rangePrompt'),
        visual: '<div class="spread-stage">' +
          spreadLine(values, App.i18n.t('gen.groupA')) + '</div>',
        visualAria: App.i18n.t('gen.rangeAria')
          .replace(/\{low\}/g, low).replace(/\{high\}/g, high),
        legend: App.i18n.t('gen.rangeHint'),
        /* Answering with the highest mark, or with the lowest, is what
           happens when the question is read as "which is the biggest". */
        options: pickNumbers(answer, [high, low, answer + 1])
      };
    },

    /* The chance said as a number: how many of that kind out of how many
       there are. Both counts are in the bag, so it is counted, not
       calculated. */
    chanceNumber: function (nv) {
      /* One kind only would make every chance "all of them", and the
         level would have nothing to teach. */
      var bag = draw(nv.id, DATA.bags.filter(function (b) {
        return b.items.length >= 2;
      }));
      var item = draw(nv.id + bag.id, bag.items.map(function (it) { return it.id; }));
      var part = bag.items.filter(function (it) { return it.id === item; })[0].n;
      var total = bag.items.reduce(function (s, it) { return s + it.n; }, 0);
      var say = function (k, n) {
        return App.i18n.t('gen.outOf').replace(/\{k\}/g, k).replace(/\{n\}/g, n);
      };
      var option = function (k, n) {
        return { html: '<span class="answer-name">' + say(k, n) + '</span>', aria: say(k, n) };
      };
      var right = option(part, total);
      /* Saying it the other way round, and counting the rest instead of
         the whole bag, are the two mistakes this actually produces. */
      var wrong = [option(total, part), option(part, total - part), option(part + 1, total)];
      var seen = {};
      var list = [right];
      seen[right.html] = true;
      wrong.forEach(function (w) {
        if (!seen[w.html] && list.length < 3) { seen[w.html] = true; list.push(w); }
      });
      if (list.length < 3) {
        throw new Error('charts: only ' + list.length + ' distinct chances for bag ' + bag.id);
      }
      return {
        prompt: App.i18n.t('gen.chanceNumber')
          .replace(/\{thing\}/g, catName(item)) + ' ' + tokenById(item).picto,
        visual: bagHtml(bag),
        visualAria: App.i18n.t('gen.bagAria').replace(/\{n\}/g, total),
        legend: App.i18n.t('gen.chanceNumberHint'),
        options: App.utils.shuffle(list).map(function (o) {
          return { html: o.html, aria: o.aria, correct: o === right };
        }),
        inline: true
      };
    },

    /* Which is more likely, decided by counting which there is more of. */
    moreLikely: function (nv) {
      /* Exactly two kinds, and not the same amount of each: with three
         kinds there would be no two options to choose between, and with
         a tie there would be no single right answer. */
      var bag = draw(nv.id, DATA.bags.filter(function (b) {
        return b.items.length === 2 && b.items[0].n !== b.items[1].n;
      }));
      var sorted = bag.items.slice().sort(function (a, b) { return b.n - a.n; });
      return {
        prompt: App.i18n.t('gen.moreLikely'),
        visual: bagHtml(bag),
        visualAria: App.i18n.t('gen.bagAria').replace(/\{n\}/g,
          bag.items.reduce(function (s, it) { return s + it.n; }, 0)),
        legend: App.i18n.t('gen.moreLikelyHint'),
        options: App.utils.shuffle(bag.items.map(function (it) {
          return {
            html: '<span class="opt-picto" aria-hidden="true">' + tokenById(it.id).picto +
              '</span><span class="opt-name">' + catName(it.id) + '</span>',
            aria: catName(it.id),
            correct: it.id === sorted[0].id
          };
        })),
        inline: true
      };
    }
  };

  /* ============================================================
     Screens and flow
     ============================================================ */

  function show(screen) {
    [screenMenu, screenGame, screenEnd].forEach(function (p) {
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
  function levelFromProgress() {
    var levels = activity.levels;
    return levels[Math.min(progress.completedRounds || 0, levels.length - 1)];
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    startRound(levelFromProgress());
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
    legendEl.textContent = question.legend || '';
    legendEl.classList.toggle('hidden', !question.legend);

    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');

    optionsEl.innerHTML = '';
    optionsEl.classList.toggle('options-row', !!question.inline);
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
      : (index / DATA.perRound)) * 100 + '%';
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
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      App.utils.$$('#options .option-btn').forEach(function (b) { b.disabled = true; });
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      attempts += 1;
      App.reinforce.add(level.id + ':' + index, question);
      if (attempts === 1) showHint();
      else showExplanation(false);
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap);
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
    if (index >= DATA.perRound) {
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
    var nextLevel = (roundCorrect === DATA.perRound && idxN !== -1 && idxN + 1 < activity.levels.length)
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

  var elBtnBackToMenu = $('#btnBackToMenu');
  if (elBtnBackToMenu) elBtnBackToMenu.addEventListener('click', function () { show(screenMenu); });
  $('#btnNext').addEventListener('click', next);
  $('#btnRepeat').addEventListener('click', function () { startRound(levelFromProgress()); });
  $('#btnMenu').addEventListener('click', function () { show(screenMenu); });
  $('#btnOtherActivity').addEventListener('click', function () { show(screenMenu); });

  paintMenu();
  paintStars();
})();
