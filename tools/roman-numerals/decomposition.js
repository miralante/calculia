/* ============================================================
   Calculia — Roman numerals: the breakdown of a number into chunks, and its drawing in the quiz.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;
  var M = App.romanNumeralsModel;
  var totalColorClass = M.totalColorClass;
  var coloredChunkValue = M.coloredChunkValue;
  var decompositionEl = $('#decomposition');

  /* From the decomposition into chunks, builds the list of "pieces"
     painted in the letters row (#decomposition):
     - a run of the same letter alone (e.g. "XX", "III") is expanded
       letter by letter ("X" + "X"), because there is no other
       different letter to group it with — without expanding, a
       single "XX"/20 chip would not show any operation.
     - a subtract-add pair alone (e.g. "IV" alone) stays as a single
       chip with both letters inside (the smaller in red): there
       is nothing else to combine it with.
     - inside a mixed number (e.g. "XIV"): a run is painted as a
       single chip (e.g. "III" in "VIII"), but a subtract-add pair
       IS split into its two letters with its own sign (e.g.
       "X" − "I" + "V"), because fusing it would hide the
       subtraction behind a misleading "+" between chunks.
     Each piece is { letters, value, sign } where sign is '-' only
     for the letter that subtracts from an already split pair. */
  function decompositionPieces(deco) {
    var pieces = [];
    deco.chunks.forEach(function (chunk) {
      if (chunk.pair && deco.chunks.length > 1) {
        pieces.push({ letters: chunk.letters[0], value: ROMAN_VALUES[chunk.letters[0]], sign: '-' });
        pieces.push({ letters: chunk.letters[1], value: ROMAN_VALUES[chunk.letters[1]], sign: '+' });
      } else if (!chunk.pair && deco.chunks.length === 1 && chunk.letters.length > 1) {
        chunk.letters.split('').forEach(function (letter) {
          pieces.push({ letters: letter, value: ROMAN_VALUES[letter], sign: '+' });
        });
      } else {
        pieces.push({ letters: chunk.letters, value: chunk.value, sign: '+', pair: chunk.pair });
      }
    });
    return pieces;
  }

  /* HTML of the final formula inside the quiz (#decomposition).
     Subtract pairs (IV, IX) are atomic ("5 − 1" / "10 − 1")
     because there's nothing else to combine them with, and the
     subtract rule is the lesson. Everything else walks chunks
     one at a time so each new sum builds on the previous
     partial: "III" → "1+1=2, 2+1=3", "XXI" → "10+10=20, 20+1=21",
     "VI" → "5+1=6". The numerals keep their colour association
     (I→blue, V→green, X→orange, subtract→red) — same colour
     code as the famous screen and the reminder, so the formula
     reads the same way regardless of where it appears. The
     helper shares its core logic with coloredFormula so the
     two screens never drift apart. */
  function decompositionFormula(deco) {
    /* Mirror of coloredFormula — the quiz renders the same
       arithmetic chain as the famous screen, so teacher and
       practice agree on the visible operation (and the subtract
       pair is never collapsed into its resolved value). See
       coloredFormula for the full rationale. */
    if (deco.mode === 'subtract') {
      var big = deco.chunks[0].letters[1];
      var small = deco.chunks[0].letters[0];
      var totalCls = totalColorClass(deco);
      return '<span class="letter-' + big.toLowerCase() + '">' + ROMAN_VALUES[big] + '</span>' +
        '−<span class="letter-' + small.toLowerCase() + ' letter-subtract">' + ROMAN_VALUES[small] + '</span>' +
        '=<span aria-hidden="true" class="' + totalCls + '">' + deco.total + '</span>';
    }
    var totalCls = totalColorClass(deco);
    if (deco.chunks.length === 1) {
      /* Single chunk that's a run of identical letters (XX, III,
         VIII → "5+1+1+1"): expand letter-by-letter and walk the
         running partial so the result reads as an accumulated
         sum like "10+10=20" or "1+1=2, 2+1=3", instead of the
         odd "20=20" / "3=3" you'd get by emitting the chunk's
         pre-summed value as both sides of "=". Single letters
         (X, V, I) don't reach here because they have no
         operation to show. */
      var letters = deco.chunks[0].letters.split('');
      var partial = 0;
      var steps = letters.map(function (letter, idx) {
        var cls = 'letter-' + letter.toLowerCase();
        if (idx === 0) {
          partial = ROMAN_VALUES[letter];
          return '<span class="' + cls + '">' + ROMAN_VALUES[letter] + '</span>';
        }
        var left = '<span class="deco-partial">' + partial + '</span>+<span class="' + cls + '">' + ROMAN_VALUES[letter] + '</span>';
        partial += ROMAN_VALUES[letter];
        return left + '=<span aria-hidden="true" class="' + totalCls + '">' + partial + '</span>';
      });
      return steps.join(', ');
    }
    /* Walk chunks, mirroring coloredFormula: subtract pairs
       become standalone "<big>−<small>=<value>" steps followed
       by their sum step onto the running partial; the first
       non-pair chunk is suspended and dropped so the chain
       doesn't read "5, 5+1=6". */
    var steps = [];
    var partial = 0;
    for (var idx = 0; idx < deco.chunks.length; idx++) {
      var chunk = deco.chunks[idx];
      if (chunk.pair) {
        var bigL = chunk.letters[1];
        var smallL = chunk.letters[0];
        steps.push(
          '<span class="letter-' + bigL.toLowerCase() + '">' + ROMAN_VALUES[bigL] + '</span>' +
          '−<span class="letter-' + smallL.toLowerCase() + ' letter-subtract">' + ROMAN_VALUES[smallL] + '</span>' +
          '=<span aria-hidden="true" class="letter-' + smallL.toLowerCase() + ' letter-subtract">' + chunk.value + '</span>'
        );
        if (partial > 0) {
          steps.push(
            '<span class="deco-partial">' + partial + '</span>+' + coloredChunkValue(chunk) +
            '=<span aria-hidden="true" class="' + totalCls + '">' + (partial + chunk.value) + '</span>'
          );
        }
        partial += chunk.value;
      } else if (idx === 0) {
        steps.push(coloredChunkValue(chunk));
        partial = chunk.value;
      } else {
        var left = '<span class="deco-partial">' + partial + '</span>+' + coloredChunkValue(chunk);
        partial += chunk.value;
        steps.push(left + '=<span aria-hidden="true" class="' + totalCls + '">' + partial + '</span>');
      }
    }
    if (deco.chunks[0] && !deco.chunks[0].pair) {
      steps.shift();
    }
    return steps.join(', ');
  }

  /* Paints the mechanic of the number in #decomposition:
     1) always, one piece per letter or per merged chunk (see
        decompositionPieces), coloured to associate symbol → colour
        → value.
     2) revealTotal=true also paints the formula with the total.
        Before answering revealTotal is false on purpose: teaching
        how each letter is read (the "operation") must not include
        doing the math for the user — the total is only revealed
        when the round resolves (see showExplanation / answer). A
        single-letter Roman numeral (e.g. "X") never carries a
        formula either: there is no operation to show.
     A piece value is an *operand*, and operands belong in the
     prompt exactly as in the rest of the suite ("3 + 2" above
     "¿Cuánto es?"). But when the whole numeral is a single piece —
     a lone subtract pair (IV, IX) or a single letter (I, V, X) —
     there is nothing to decompose and that piece's value IS the
     answer, so the panel is not painted at all until the round
     resolves: the letters are already the prompt above, and the
     value underneath them gave the round over (the card read "IX"
     with "9" under it while the three options offered 9, 1 and 10).
     The reveal on failure/success (showExplanation / answer
     repaint with revealTotal=true) brings the panel back with the
     letters, their value and the formula. This is the rule the
     socratic anatomy sets for the round: the prompt shows the
     question and never the answer before it is resolved
     (doc/es/spec.md, "anatomía socrática completa": the hint does
     not reveal the answer). A lone subtract pair stays atomic in
     the revealed panel for the reason above ("nothing else to
     combine it with"): there it shows the rule as "5 − 1 = 4".
     Multi-piece numerals keep the panel with its values, because
     there they are operands and not the answer: XIX shows
     "10 − 1", XXV shows "10 + 10 + 5", and in both cases the total
     is still pending.
     Empty roman hides the panel (numberToRoman level: the Roman
     numeral is the answer and is not previewed). */
  function paintQuizDecomposition(roman, revealTotal) {
    decompositionEl.innerHTML = '';
    if (!roman) {
      decompositionEl.classList.add('hidden');
      return;
    }
    var deco = DATA.decompose(roman);
    var pieces = decompositionPieces(deco);
    /* One piece == the numeral *is* that piece == nothing to
       decompose and its value is the answer. Panel hidden until the
       round resolves; see the comment above. */
    if (!revealTotal && pieces.length === 1) {
      decompositionEl.classList.add('hidden');
      return;
    }
    decompositionEl.classList.remove('hidden');

    var tokenRow = document.createElement('div');
    tokenRow.className = 'deco-row';
    pieces.forEach(function (piece, i) {
      if (i > 0) {
        var op = document.createElement('span');
        op.className = 'deco-op';
        op.textContent = piece.sign === '-' ? '−' : '+';
        tokenRow.appendChild(op);
      }
      var subtractChip = !piece.pair && piece.sign === '-';
      var lettersHtml = piece.letters.split('').map(function (letter, li) {
        var subtractLetter = piece.pair ? li === 0 : subtractChip;
        return '<span class="letter-' + letter.toLowerCase() + (subtractLetter ? ' letter-subtract' : '') + '">' + letter + '</span>';
      }).join('');
      var uniform = piece.letters.split('').every(function (ch) { return ch === piece.letters[0]; });
      var chip = document.createElement('span');
      chip.className = 'deco-token' + (subtractChip ? ' letter-subtract' : (piece.pair ? '' : (uniform ? ' letter-' + piece.letters[0].toLowerCase() : '')));
      chip.innerHTML = '<span class="deco-letters">' + lettersHtml + '</span><span class="deco-token-value">' + piece.value + '</span>';
      tokenRow.appendChild(chip);
    });
    decompositionEl.appendChild(tokenRow);

    var hasOperation = deco.tokens.length > 1;
    if (hasOperation && revealTotal) {
      var formulaRow = document.createElement('div');
      formulaRow.className = 'deco-row deco-formula';
      /* decompositionFormula returns the stepped chain with its
         last step already ending in "=<total>"; nothing extra
         to append. The same colour code as the famous screen
         and the reminder applies. */
      formulaRow.innerHTML =
        '<span class="deco-formula-text">' + decompositionFormula(deco) + '</span>';
      decompositionEl.appendChild(formulaRow);
    }
  }

  App.RomanDecomposition = {
    paintQuizDecomposition: paintQuizDecomposition
  };
})();
