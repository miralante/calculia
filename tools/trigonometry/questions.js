/* ============================================================
   Calculia — Trigonometry: the questions. The question pieces (the options of
   a question, the aria labels, the ramp text) and the generators that build
   each kind of question from a figure. Uses the helpers of figures.js.
   ============================================================ */
(function () {
  'use strict';

  var F = App.trigonometryFigures;
  var hyp = F.hyp, reasonOf = F.reasonOf, sameReason = F.sameReason, doubled = F.doubled, sideFor = F.sideFor, sideName = F.sideName, sideOptionHtml = F.sideOptionHtml, ALL_SIDES = F.ALL_SIDES, ratioText = F.ratioText, triangleSvg = F.triangleSvg, laddersSvg = F.laddersSvg;

  /* ---- Question pieces ---- */

  /* "3 for every 4", with the two numbers that make it go wrong: the
     other way round (the real confusion) and each one off by one (the
     error counting a grid actually produces). */
  function ratioOptions(t) {
    /* Build the right answer FIRST and never drop it. An earlier version
       shuffled all four candidates and then cut to three, which quietly
       removed the correct answer from one question in four — the page
       then had no right answer at all, and clicking any option threw
       while trying to explain itself. Taking the correct one first and
       filling the rest makes that impossible. */
    var seen = {};
    var right = { up: t.up, along: t.along };
    seen[right.up + ':' + right.along] = true;
    var wrongs = [];
    [
      { up: t.along, along: t.up },
      { up: t.up + 1, along: t.along },
      { up: t.up, along: t.along + 1 }
    ].forEach(function (c) {
      var key = c.up + ':' + c.along;
      if (seen[key]) return;
      seen[key] = true;
      wrongs.push(c);
    });
    /* A triangle whose legs differ by one loses both "off by one"
       distractors to each other, but the swapped one is always there,
       so there are always two. */
    var out = [{ text: ratioText(right.up, right.along), correct: true }];
    wrongs.slice(0, 2).forEach(function (c) {
      out.push({ text: ratioText(c.up, c.along), correct: false });
    });
    return App.utils.shuffle(out);
  }

  function triAria(t) {
    return App.i18n.t('gen.triAria')
      .replace(/\{up\}/g, t.up)
      .replace(/\{along\}/g, t.along);
  }

  /* Two ramps side by side, each with its letter and its numbers under it.
     The numbers are written down so the answer is never judged by eye alone. */
  function rampKeyText(t) {
    return App.i18n.t('gen.steeperRampKey').replace('{up}', t.up).replace('{along}', t.along);
  }

  function rampPairHtml(named) {
    return '<div class="reason-compare-stage">' + named.map(function (item) {
      return '<div class="reason-example"><span class="reason-example-label">' + item.letter + '</span>' +
        triangleSvg(item.triangle, { grid: true }) +
        '<span class="reason-name">' + rampKeyText(item.triangle) + '</span></div>';
    }).join('') + '</div>';
  }

  function rampPairAria(named) {
    return App.i18n.t('gen.steeperRampAria')
      .replace(/\{x\}/g, named[0].letter).replace(/\{a\}/g, named[0].triangle.up).replace(/\{b\}/g, named[0].triangle.along)
      .replace(/\{y\}/g, named[1].letter).replace(/\{c\}/g, named[1].triangle.up).replace(/\{d\}/g, named[1].triangle.along);
  }

  var GENERATORS = {

    /* Which side is the slanted one — the longest. Every option is the
       same triangle with a different side drawn heavier, so the answer
       is which marked side reaches furthest: counting and looking, not
       remembering a word. */
    whichHypotenuse: function (nv) {
      var t = App.utils.drawRound(nv.id, DATA.triangles);
      /* The answer is "the longest side", so check that the side this
         question points at really is the longest one in the drawing that
         goes with it. Nothing else catches this: an edit that moved
         `correct` onto another side would leave the code perfectly
         well-formed, every string registered and every structural gate
         green, while marking a plainly wrong picture as right. */
      var options = ALL_SIDES.map(function (side) {
        return { side: side, correct: side === 'hyp' };
      });
      var right = options.filter(function (o) { return o.correct; });
      if (right.length !== 1) {
        throw new Error('trigonometry: level "' + nv.id + '" offers ' +
          right.length + ' hypotenuses');
      }
      var lens = { up: t.up, along: t.along, hyp: hyp(t) };
      var longest = ALL_SIDES.slice().sort(function (a, b) {
        return lens[b] - lens[a];
      })[0];
      if (right[0].side !== longest) {
        throw new Error('trigonometry: level "' + nv.id + '" calls "' +
          right[0].side + '" the hypotenuse of "' + t.id +
          '", but "' + longest + '" is the longest side of it');
      }
      return {
        prompt: App.i18n.t('gen.whichHypotenuse'),
        hint: App.i18n.t('gen.socraticHypotenuse'),
        visual: '<div class="tri-stage">' + triangleSvg(t, {}) + '</div>',
        visualAria: triAria(t),
        legend: App.i18n.t('gen.hypHint'),
        options: App.utils.shuffle(ALL_SIDES.map(function (side) {
          return {
            html: sideOptionHtml(t, side),
            aria: App.i18n.t('gen.sideMarked').replace(/\{side\}/g, sideName(side)),
            correct: side === 'hyp'
          };
        })),
        inline: true
      };
    },

    /* The two sides that depend on where the angle is. The angle is drawn
       in every option too, so which side it "looks at" is visible and not
       something to recall.
       The wording has to rule the hypotenuse out explicitly. "Which side
       touches that angle?" would have TWO right answers, because the
       slanted side touches it too — and a question with two right
       answers is not something the person can get wrong, only something
       the activity looks broken doing. */
    whichSideByAngle: function (nv) {
      var role = nv.tipo === 'whichOpposite' ? 'opposite' : 'adjacent';
      var corner = nv.corner || 'B';
      var t = App.utils.drawRound(nv.id, DATA.triangles);
      var wanted = sideFor(t, role, corner);
      if (wanted === 'hyp') {
        throw new Error('trigonometry: level "' + nv.id + '" asks for the "' +
          role + '" side and got the hypotenuse, which touches every angle');
      }
      return {
        prompt: App.i18n.t(role === 'opposite' ? 'gen.whichOpposite' : 'gen.whichAdjacent')
          .replace(/\{where\}/g, App.i18n.t('gen.corner' + corner)),
        hint: App.i18n.t('gen.socraticSideByAngle'),
        visual: '<div class="tri-stage">' + triangleSvg(t, { angleAt: corner }) + '</div>',
        visualAria: triAria(t),
        legend: App.i18n.t(role === 'opposite' ? 'gen.oppositeHint' : 'gen.adjacentHint'),
        options: App.utils.shuffle(ALL_SIDES.map(function (side) {
          return {
            html: sideOptionHtml(t, side, { angleAt: corner }),
            aria: App.i18n.t('gen.sideMarked').replace(/\{side\}/g, sideName(side)),
            correct: side === wanted
          };
        })),
        inline: true
      };
    },

    /* How many up for every along. Counted off the grid, so the number is
       read, not computed. */
    countReason: function (nv) {
      var t = App.utils.drawRound(nv.id, DATA.triangles);
      return {
        prompt: App.i18n.t('gen.countReason'),
        hint: App.i18n.t('gen.socraticReason'),
        visual: '<div class="tri-stage">' + triangleSvg(t, {}) + '</div>',
        visualAria: triAria(t),
        legend: App.i18n.t('gen.reasonHint')
          .replace(/\{up\}/g, t.up)
          .replace(/\{along\}/g, t.along),
        options: App.utils.shuffle(ratioOptions(t).map(function (o) {
          return { html: '<span class="reason-name">' + o.text + '</span>', aria: o.text, correct: o.correct };
        }))
      };
    },

    /* Compare two candidates with a reference. One has the same rise/run
       and one does not, so both possibilities are visible at once. */
    sameReasonJudge: function (nv) {
      var pair = App.utils.drawRound(nv.id, DATA.reasonPairs);
      var other = App.utils.drawRound(nv.id + 'other',
        DATA.triangles.filter(function (t) { return !sameReason(t, pair); }));
      var candidates = App.utils.shuffle([
        { triangle: doubled(pair), same: true },
        { triangle: other, same: false }
      ]).map(function (candidate, i) {
        candidate.letter = i === 0 ? 'A' : 'B';
        return candidate;
      });
      var asked = App.utils.drawRound(nv.id + 'asked', [true, false]);
      var target = candidates.filter(function (candidate) { return candidate.same === asked; })[0];
      return {
        prompt: App.i18n.t('gen.sameReason').replace(/\{x\}/g, target.letter),
        hint: App.i18n.t('gen.socraticSameReason'),
        visual: '<div class="reason-compare-stage">' +
          '<div class="reason-example reason-reference"><span class="reason-example-label">' +
          App.i18n.t('gen.sameInclinationExample') + '</span>' + triangleSvg(pair, {}) + '</div>' +
          candidates.map(function (candidate) {
            return '<div class="reason-example"><span class="reason-example-label">' +
              candidate.letter + '</span>' + triangleSvg(candidate.triangle, { small: true, grid: true }) + '</div>';
          }).join('') + '</div>',
        visualAria: App.i18n.t('gen.threeAria')
          .replace(/\{a\}/g, pair.up).replace(/\{b\}/g, pair.along)
          .replace(/\{c\}/g, candidates[0].triangle.up).replace(/\{d\}/g, candidates[0].triangle.along)
          .replace(/\{e\}/g, candidates[1].triangle.up).replace(/\{f\}/g, candidates[1].triangle.along)
          .replace(/\{x\}/g, candidates[0].letter).replace(/\{y\}/g, candidates[1].letter),
        legend: App.i18n.t('gen.sameReasonHint'),
        options: App.utils.shuffle([true, false].map(function (v) {
          return {
            html: '<span class="reason-name">' + App.i18n.t(v ? 'answer.yes' : 'answer.no') + '</span>',
            aria: App.i18n.t(v ? 'answer.yes' : 'answer.no'),
            correct: v === target.same
          };
        })),
        inline: true
      };
    },

    /* Which one of the three shares it. One step on from judging: the
       same comparison, but out loud. */
    whichSameReason: function (nv) {
      var pair = App.utils.drawRound(nv.id, DATA.reasonPairs);
      var right = doubled(pair);
      var wrongs = [];
      var seenReason = {};
      seenReason[reasonOf(right)] = true;
      App.utils.shuffle(DATA.triangles.filter(function (t) {
        return !sameReason(t, pair);
      })).forEach(function (t) {
        var key = reasonOf(t);
        if (seenReason[key]) return;
        seenReason[key] = true;
        wrongs.push(t);
      });
      wrongs = wrongs.slice(0, 2);
      /* Never pad with the right answer. The start-up invariant already
         guarantees two distinct wrong reasons exist, so falling back to
         `doubled(pair)` here could only have produced a second correct
         option — a question nobody can get wrong. Fail loudly instead. */
      if (wrongs.length < 2) {
        throw new Error('trigonometry: level "' + nv.id + '" could only offer ' +
          wrongs.length + ' wrong answer(s) for pair "' + pair.id + '"');
      }
      return {
        prompt: App.i18n.t('gen.whichSameReason')
          .replace(/\{up\}/g, pair.up)
          .replace(/\{along\}/g, pair.along),
        hint: App.i18n.t('gen.socraticWhichSameReason'),
        visual: '<div class="tri-stage">' + triangleSvg(pair, {}) + '</div>',
        visualAria: App.i18n.t('gen.triAria')
          .replace(/\{up\}/g, pair.up).replace(/\{along\}/g, pair.along),
        legend: App.i18n.t('gen.whichSameReasonHint'),
        options: App.utils.shuffle([right].concat(wrongs).map(function (t) {
          return {
            html: triangleSvg(t, { small: true, grid: true }),
            aria: App.i18n.t('gen.reasonOf').replace(/\{up\}/g, t.up).replace(/\{along\}/g, t.along),
            correct: sameReason(t, pair)
          };
        })),
        inline: true
      };
    },

    /* Compare two ladders of the same length. Their height on the wall
       makes the difference in steepness visible without a calculation. */
    compareLadders: function (nv) {
      var pair = DATA.ladders.filter(function (ladder) { return ladder.run > 0; });
      var letters = App.utils.shuffle(App.i18n.t('gen.ladderLetters').split('')).slice(0, 2);
      var named = pair.map(function (ladder, i) {
        return { ladder: ladder, letter: letters[i] };
      }).sort(function (a, b) { return a.ladder.run - b.ladder.run; });
      var right = named.filter(function (item) {
        return item.ladder.rise === Math.max(pair[0].rise, pair[1].rise);
      })[0];
      var text = App.i18n.t('gen.ladderOption').replace(/\{x\}/g, right.letter);
      return {
        prompt: App.i18n.t('gen.compareLadders'),
        hint: App.i18n.t('gen.socraticLadderCompare'),
        explanation: App.i18n.t('gen.ladderCompareExplanation').replace(/\{x\}/g, right.letter),
        visual: '<div class="tri-stage">' + laddersSvg(named.map(function (item) { return item.ladder; }), {
          labels: named.map(function (item) { return item.letter; })
        }) + '</div>',
        visualAria: App.i18n.t('gen.twoLaddersAria')
          .replace(/\{a\}/g, named[0].letter).replace(/\{b\}/g, named[0].ladder.rise)
          .replace(/\{c\}/g, named[0].ladder.run).replace(/\{d\}/g, named[1].letter)
          .replace(/\{e\}/g, named[1].ladder.rise).replace(/\{f\}/g, named[1].ladder.run),
        options: App.utils.shuffle(named.map(function (item) {
          var optionText = App.i18n.t('gen.ladderOption').replace(/\{x\}/g, item.letter);
          return { html: '<span class="kind-name">' + optionText + '</span>', aria: optionText, correct: item === right };
        })),
        inline: true
      };
    },

    /* Two ramps of different lean, drawn at the same scale. The one that
       climbs more for every step it goes along is the one that climbs faster.
       Compared by multiplying across, so no decimals decide it. */
    steeperRamp: function (nv) {
      var a = App.utils.drawRound(nv.id, DATA.triangles);
      var b = App.utils.drawRound(nv.id + 'other', DATA.triangles.filter(function (t) {
        return !sameReason(t, a);
      }));
      var named = App.utils.shuffle([a, b]).map(function (t, i) {
        return { triangle: t, letter: i === 0 ? 'A' : 'B' };
      });
      var steeper = named[0].triangle.up * named[1].triangle.along > named[1].triangle.up * named[0].triangle.along
        ? named[0] : named[1];
      return {
        prompt: App.i18n.t('gen.steeperRamp'),
        hint: App.i18n.t('gen.socraticSteeperRamp'),
        explanation: App.i18n.t('gen.steeperRampExplanation'),
        visual: rampPairHtml(named),
        visualAria: rampPairAria(named),
        legend: App.i18n.t('gen.steeperRampHint'),
        options: App.utils.shuffle(named.map(function (item) {
          var text = App.i18n.t('gen.steeperRampOption').replace(/\{x\}/g, item.letter);
          return { html: '<span class="kind-name">' + text + '</span>', aria: text, correct: item === steeper };
        })),
        inline: true
      };
    },

    /* The ladder against the wall. Which of the three is the slanted one?
       Answerable by looking: two of them stand straight up, one leans. */
    ladderSide: function (nv) {
      var l = App.utils.drawRound(nv.id, DATA.ladders.filter(function (x) { return x.run > 0; }));
      return {
        prompt: App.i18n.t('gen.ladderSide'),
        hint: App.i18n.t('gen.socraticLadderSide'),
        visual: '<div class="tri-stage">' + laddersSvg([l], {}) + '</div>',
        visualAria: App.i18n.t('gen.ladderAria'),
        legend: App.i18n.t('gen.ladderSideHint'),
        options: App.utils.shuffle(['ladder', 'wall', 'floor'].map(function (k) {
          return {
            html: '<span class="kind-name">' + App.i18n.t('ladderPart.' + k + '.name') + '</span>' +
              '<span class="kind-gloss">' + App.i18n.t('ladderPart.' + k + '.gloss') + '</span>',
            aria: App.i18n.t('ladderPart.' + k + '.name') + ', ' + App.i18n.t('ladderPart.' + k + '.gloss'),
            correct: k === 'ladder'
          };
        })),
        inline: true
      };
    },

    /* The same ladder, three ways of standing it up. Which reaches
       highest? More upright, higher — and all three are exactly the same
       length, so nothing else is being compared.
       Each is named by a letter drawn on it, and the letters are handed
       out in a different order every question: if the letters followed
       the lean, the right answer would always be the same one. */
    ladderTaller: function (nv) {
      var all = DATA.ladders;
      var tallest = Math.max.apply(null, all.map(function (l) { return l.rise; }));
      /* Shuffled, not drawn from the bag. `App.utils.drawRound()` hands out ONE item of a
         list, so calling it here returned a single letter — and then
         `letters[1]` and `letters[2]` were undefined, which put "La
         escalera undefined" on two of the three answers. */
      var letters = App.utils.shuffle(App.i18n.t('gen.ladderLetters').split(''));
      var byRun = all.slice().sort(function (a, b) { return a.run - b.run; });
      var named = byRun.map(function (l, i) {
        return { ladder: l, letter: letters[i] };
      });
      if (named.some(function (n) { return !n.letter; })) {
        throw new Error('trigonometry: level "' + nv.id + '" ran out of ladder letters');
      }
      return {
        prompt: App.i18n.t('gen.ladderTaller'),
        hint: App.i18n.t('gen.socraticLadderTaller'),
        visual: '<div class="tri-stage">' + laddersSvg(byRun, {
          labels: named.map(function (n) { return n.letter; }),
          guide: true
        }) + '</div>',
        visualAria: App.i18n.t('gen.ladderAllAria')
          .replace(/\{a\}/g, named[0].letter)
          .replace(/\{b\}/g, named[1].letter)
          .replace(/\{c\}/g, named[2].letter),
        legend: App.i18n.t('gen.ladderTallerHint'),
        options: App.utils.shuffle(named.map(function (n) {
          var text = App.i18n.t('gen.ladderOption').replace(/\{x\}/g, n.letter);
          return {
            html: '<span class="kind-name">' + text + '</span>' +
              '<span class="kind-gloss">' + App.i18n.t('gen.ladderOptionHint') + '</span>',
            aria: text,
            correct: n.ladder.rise === tallest
          };
        })),
        inline: true
      };
    }
  };

  /* Levels whose type differs only in which role they ask for share one
     generator; the rest are looked up by their own type. */
  var GENERATOR_FOR = {
    compareLadders: GENERATORS.compareLadders,
    whichHypotenuse: GENERATORS.whichHypotenuse,
    whichOpposite: GENERATORS.whichSideByAngle,
    whichAdjacent: GENERATORS.whichSideByAngle,
    countReason: GENERATORS.countReason,
    sameReasonJudge: GENERATORS.sameReasonJudge,
    whichSameReason: GENERATORS.whichSameReason,
    ladderSide: GENERATORS.ladderSide,
    ladderTaller: GENERATORS.ladderTaller,
    steeperRamp: GENERATORS.steeperRamp
  };


  App.trigonometryQuestions = {
    rampPairHtml: rampPairHtml,
    rampPairAria: rampPairAria,
    GENERATORS: GENERATORS,
    GENERATOR_FOR: GENERATOR_FOR
  };
})();
