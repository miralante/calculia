/* ============================================================
   Calculia — Math tables: the dot and group pictures that show each fact: addition, multiplication, subtraction and division.
   ============================================================ */
(function () {
  'use strict';

  function dotCell(color, opts) {
    var cell = document.createElement('span');
    cell.className = 'dot-cell' + (opts.label !== undefined ? ' dot-cell-num' : '') +
      (opts.below ? ' dot-cell-below' : '');
    var dot = document.createElement('span');
    dot.className = opts.removed ? 'dot dot-removed' : 'dot';
    dot.style.backgroundColor = color;
    cell.appendChild(dot);
    if (opts.label !== undefined) {
      var label = document.createElement('span');
      label.className = 'dot-label';
      label.textContent = String(opts.label);
      cell.appendChild(label);
    }
    if (opts.removed) {
      var cross = document.createElement('span');
      cross.className = 'dot-cross';
      cross.setAttribute('aria-hidden', 'true');
      cross.textContent = '✕';
      cell.appendChild(cross);
    }
    return cell;
  }

  /* A row of `count` dots. opts.from is the number the first dot carries
     (the rest count on from it); leave it out and the dots carry no number. */
  function dotRow(count, color, opts) {
    var o = opts || {};
    var row = document.createElement('div');
    row.className = 'dot-row';
    for (var i = 0; i < count; i += 1) {
      row.appendChild(dotCell(color, {
        removed: o.removed,
        below: o.below,
        label: o.from === undefined ? undefined : o.from + i
      }));
    }
    return row;
  }

  function sign(character) {
    var span = document.createElement('span');
    span.className = 'visual-sign';
    span.textContent = character;
    return span;
  }

  /* Addition: first addend in color 0, second in color 1. With the total
     revealed, the combined row keeps both colors so the sum stays visible. */
  function renderAddVisual(container, item, showTotal, numbered) {
    var operands = document.createElement('div');
    operands.className = 'visual-line';
    /* Each addend is counted from 1 on its own. The result counts on from 1
       to the total: the first addend's dots, then the second's go on after. */
    operands.appendChild(dotRow(item.a, DATA.dotColors[0], { from: numbered ? 1 : undefined }));
    operands.appendChild(sign('+'));
    operands.appendChild(dotRow(item.b, DATA.dotColors[1], { from: numbered ? 1 : undefined }));
    container.appendChild(operands);
    if (!showTotal) return;
    var total = document.createElement('div');
    total.className = 'visual-line';
    total.appendChild(sign('='));
    var combined = document.createElement('div');
    combined.className = 'dot-row';
    combined.appendChild(dotRow(item.a, DATA.dotColors[0], { from: numbered ? 1 : undefined }));
    combined.appendChild(dotRow(item.b, DATA.dotColors[1], { from: numbered ? item.a + 1 : undefined }));
    total.appendChild(combined);
    container.appendChild(total);
  }

  /* A factor label: the number that sits on the top or on the left of the
     dots, so the array reads as "a × b". */
  function factor(value, className) {
    var span = document.createElement('span');
    span.className = 'mult-factor ' + className;
    span.textContent = String(value);
    return span;
  }

  /* Multiplication: b groups of a dots, one color per group, so the
     repetition can be seen and counted group by group. The factors frame
     the dots: a on the top (dots per group), b on the left (number of
     groups), and the × sign in the corner where they meet. */
  function renderMultiplyVisual(container, item, numbered) {
    var grid = document.createElement('div');
    grid.className = 'mult-grid';
    grid.appendChild(sign('×'));
    grid.appendChild(factor(item.a, 'mult-top'));
    grid.appendChild(factor(item.b, 'mult-left'));
    var groups = document.createElement('div');
    groups.className = 'group-stack';
    for (var i = 0; i < item.b; i += 1) {
      groups.appendChild(dotRow(item.a, DATA.dotColors[i % DATA.dotColors.length],
        { from: numbered ? i * item.a + 1 : undefined }));
    }
    grid.appendChild(groups);
    container.appendChild(grid);
  }

  /* Subtraction: the minuend's dots stay visible while the subtrahend's
     are crossed out in a second color, so the remaining dots (color 0)
     can be counted by the user. The crossed-out dots use a 'dot-removed'
     span so the answer is "the dots that survived". */
  function renderSubtractVisual(container, item, numbered) {
    var line = document.createElement('div');
    line.className = 'visual-line';
    var row = document.createElement('div');
    row.className = 'dot-row';
    /* The numbers of this table sit under each dot, so the crossed-out
       ones are counted on from the ones that stay. */
    var below = !!numbered;
    row.appendChild(dotRow(item.a - item.b, DATA.dotColors[0], { from: numbered ? 1 : undefined, below: below }));
    row.appendChild(dotRow(item.b, DATA.dotColors[1], { removed: true, from: numbered ? item.a - item.b + 1 : undefined, below: below }));
    line.appendChild(row);
    container.appendChild(line);
  }

  /* Division: as many full rows of `b` dots as fit, one color per row
     (same trick as multiply), plus a leftover row for the remainder if
     any. The leftover row uses the next slot in dotColors, distinct
     from a "full row", so the answer is literally "the number of full
     rows of dots". */
  function renderDivideVisual(container, item, numbered) {
    var groups = document.createElement('div');
    groups.className = 'group-stack';
    var quotient = Math.floor(item.a / item.b);
    var remainder = item.a % item.b;
    for (var i = 0; i < quotient; i += 1) {
      groups.appendChild(dotRow(item.b, DATA.dotColors[i % DATA.dotColors.length],
        { from: numbered ? i * item.b + 1 : undefined }));
    }
    if (remainder > 0) {
      groups.appendChild(dotRow(remainder, DATA.dotColors[quotient % DATA.dotColors.length],
        { removed: true, from: numbered ? quotient * item.b + 1 : undefined }));
    }
    container.appendChild(groups);
  }

  /* `numbered` is set only by the demonstration, never by the quiz: the
     quiz asks the user to count, so the dots carry no numbers there. */

  App.MathTablesVisuals = {
    renderAddVisual: renderAddVisual,
    renderMultiplyVisual: renderMultiplyVisual,
    renderSubtractVisual: renderSubtractVisual,
    renderDivideVisual: renderDivideVisual
  };
})();
