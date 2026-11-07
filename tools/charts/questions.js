/* ============================================================
   Calculia — Charts: the generators: one per kind of question.
   ============================================================ */
(function () {
  'use strict';

  var M = App.ChartsModel;
  var tokensHtml = M.tokensHtml, tokenById = M.tokenById, catName = M.catName, pickNumbers = M.pickNumbers,
      spreadLine = M.spreadLine, setTitle = M.setTitle, pictogram = M.pictogram, setAria = M.setAria,
      numberOptions = M.numberOptions, extremeCat = M.extremeCat, catOptions = M.catOptions, barChart = M.barChart,
      frequencyTable = M.frequencyTable, shareRows = M.shareRows, bagHtml = M.bagHtml, pairChart = M.pairChart;

  var GENERATORS = {

    /* Two things measured together. The dots are drawn left to right, so
       "when one goes up, does the other go up or down?" is read off the
       cloud rather than worked out. */
    scatter: function (nv) {
      var cloud = App.utils.drawRound(nv.id, DATA.clouds);
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
        hint: App.i18n.t('gen.socraticScatter'),
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
      var bag = App.utils.drawRound(nv.id, DATA.bags.filter(function (b) {
        return b.items.length === 2 && b.items.every(function (i) { return i.n >= 2; });
      }));
      /* Keyed by the bag as well as the level: a pool shared across bags
         would hand out a colour that is not in this one. */
      var taken = App.utils.drawRound(nv.id + 'take' + bag.id, bag.items.map(function (i) {
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
        hint: App.i18n.t('gen.socraticAfterDraw'),
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
      var set = App.utils.drawRound(nv.id, DATA.outfits);
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
        hint: App.i18n.t('gen.socraticOutfits'),
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
      var pair = App.utils.drawRound(nv.id, DATA.spreads);
      var askWide = App.utils.drawRound(nv.id + 'dir', [true, false]);
      /* Which of the two is drawn on top changes from question to
         question, so the answer is never "always the first one". */
      var wideOnTop = App.utils.drawRound(nv.id + 'order', [true, false]);
      var first = App.i18n.t('gen.groupA');
      var second = App.i18n.t('gen.groupB');
      var wideLabel = wideOnTop ? first : second;
      var tightLabel = wideOnTop ? second : first;
      var answer = askWide ? wideLabel : tightLabel;
      return {
        prompt: App.i18n.t(askWide ? 'gen.whichSpread' : 'gen.whichTight'),
        hint: App.i18n.t('gen.socraticSpread'),
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
      var kinds = App.utils.drawRound(nv.id, DATA.drawSets).map(function (id) {
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
        hint: App.i18n.t('gen.socraticTwoDraws'),
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
      var set = App.utils.drawRound(nv.id, DATA.sets);
      var cat = App.utils.shuffle(set.cats)[0];
      return {
        prompt: setTitle(set.id) + ' ' +
          App.i18n.t('gen.howMany').replace(/\{thing\}/g, catName(cat.id)),
        visual: pictogram(set, cat.id),
        hint: App.i18n.t('gen.socraticReadRow'),
        visualAria: setAria(set),
        legend: App.i18n.t('gen.countRow'),
        options: numberOptions(cat.n)
      };
    },

    /* Which one has most / least. No number is asked for: comparing rows
       is its own step. */
    extreme: function (nv) {
      var set = App.utils.drawRound(nv.id, DATA.sets);
      var cat = extremeCat(set, nv.which);
      return {
        prompt: setTitle(set.id) + ' ' +
          App.i18n.t(nv.which === 'max' ? 'gen.whichMost' : 'gen.whichLeast'),
        visual: pictogram(set, null),
        hint: App.i18n.t('gen.socraticExtremeRow'),
        visualAria: setAria(set),
        options: catOptions(set, cat.id),
        inline: true
      };
    },

    /* The same question, now against a scale instead of countable things. */
    readBar: function (nv) {
      var set = App.utils.drawRound(nv.id, DATA.barSets);
      var cat = App.utils.shuffle(set.cats)[0];
      return {
        prompt: setTitle(set.id) + ' ' +
          App.i18n.t('gen.howMany').replace(/\{thing\}/g, catName(cat.id)),
        visual: barChart(set, cat.id),
        hint: App.i18n.t('gen.socraticReadBar'),
        visualAria: setAria(set),
        legend: App.i18n.t('gen.readScale'),
        options: numberOptions(cat.n, DATA.barStep)
      };
    },

    extremeBar: function (nv) {
      var set = App.utils.drawRound(nv.id, DATA.barSets);
      var cat = extremeCat(set, nv.which);
      return {
        prompt: setTitle(set.id) + ' ' +
          App.i18n.t(nv.which === 'max' ? 'gen.whichMost' : 'gen.whichLeast'),
        visual: barChart(set, null),
        hint: App.i18n.t('gen.socraticExtremeBar'),
        visualAria: setAria(set),
        options: catOptions(set, cat.id),
        inline: true
      };
    },

    /* The same information with no picture at all: only numbers. */
    readTable: function (nv) {
      var set = App.utils.drawRound(nv.id, DATA.sets.concat(DATA.barSets));
      var cat = App.utils.shuffle(set.cats)[0];
      return {
        prompt: setTitle(set.id) + ' ' +
          App.i18n.t('gen.howMany').replace(/\{thing\}/g, catName(cat.id)),
        visual: frequencyTable(set, null),
        visualAria: setAria(set),
        legend: App.i18n.t('gen.readTable'),
        hint: App.i18n.t('gen.socraticReadTable'),
        options: numberOptions(cat.n)
      };
    },

    /* The mode, named for what it is: the one that comes up most. */
    mode: function (nv) {
      var set = App.utils.drawRound(nv.id, DATA.sets.concat(DATA.barSets));
      var cat = extremeCat(set, 'max');
      return {
        prompt: setTitle(set.id) + ' ' + App.i18n.t('gen.mostRepeated'),
        hint: App.i18n.t('gen.socraticMode'),
        visual: frequencyTable(set, null),
        visualAria: setAria(set),
        options: catOptions(set, cat.id),
        inline: true
      };
    },

    /* The average as what it really is: sharing out so everyone has the
       same. No formula, no dividing written down. */
    share: function (nv) {
      var set = App.utils.drawRound(nv.id, DATA.shareSets);
      var total = set.cats.reduce(function (sum, c) { return sum + c.n; }, 0);
      return {
        prompt: setTitle(set.id) + ' ' + App.i18n.t('gen.shareEqually'),
        hint: App.i18n.t('gen.socraticShare'),
        visual: shareRows(set),
        visualAria: setAria(set),
        legend: App.i18n.t('gen.shareHint'),
        options: numberOptions(total / set.cats.length)
      };
    },

    /* Certain, possible or impossible, decided by looking in the bag. */
    chance: function (nv) {
      var bag = App.utils.drawRound(nv.id, DATA.bags);
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
        hint: App.i18n.t('gen.socraticChance'),
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
      var set = App.utils.drawRound(nv.id, DATA.pairSets);
      var which = App.utils.drawRound(nv.id + 'which', ['a', 'b', 'same']);
      var answer = set.cats.filter(function (c) {
        return which === 'same' ? c.an === c.bn
          : (which === 'a' ? c.an > c.bn : c.bn > c.an);
      })[0];
      var promptKey = which === 'same' ? 'gen.whenSame' : 'gen.whenMore';
      return {
        prompt: App.i18n.t(promptKey)
          .replace(/\{a\}/g, catName(which === 'b' ? set.b : set.a))
          .replace(/\{b\}/g, catName(which === 'b' ? set.a : set.b)),
        hint: App.i18n.t('gen.socraticTwoSeries'),
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
      var pair = App.utils.drawRound(nv.id, DATA.spreads);
      var values = App.utils.drawRound(nv.id + 'group', [pair.tight, pair.wide]);
      var low = Math.min.apply(null, values);
      var high = Math.max.apply(null, values);
      var answer = high - low;
      return {
        prompt: App.i18n.t('gen.rangePrompt'),
        hint: App.i18n.t('gen.socraticRange'),
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
      var bag = App.utils.drawRound(nv.id, DATA.bags.filter(function (b) {
        return b.items.length >= 2;
      }));
      var item = App.utils.drawRound(nv.id + bag.id, bag.items.map(function (it) { return it.id; }));
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
        hint: App.i18n.t('gen.socraticChanceNumber'),
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
      var bag = App.utils.drawRound(nv.id, DATA.bags.filter(function (b) {
        return b.items.length === 2 && b.items[0].n !== b.items[1].n;
      }));
      var sorted = bag.items.slice().sort(function (a, b) { return b.n - a.n; });
      return {
        prompt: App.i18n.t('gen.moreLikely'),
        hint: App.i18n.t('gen.socraticMoreLikely'),
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

  App.ChartsQuestions = {
    GENERATORS: GENERATORS
  };
})();
