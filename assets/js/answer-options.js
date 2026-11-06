/* ============================================================
   Calculia — Answer options: the option builders that several
   activities share.

   dotRow(count, cls, dot)  a row of `count` dots, each a span with the
                            class `cls` and the character `dot`.
   yesNo(yes, labels)       the two options Yes and No, in a shuffled
                            order. `labels` is { yes, no } (already
                            translated); the option that matches `yes`
                            is the correct one.

   Exposes window.App.answerOptions.
   ============================================================ */
(function () {
  'use strict';

  /* A row of dots: count copies of dot, each in a span of class cls. */
  function dotRow(count, cls, dot) {
    var html = '';
    for (var i = 0; i < count; i += 1) {
      html += '<span class="' + cls + '" aria-hidden="true">' + dot + '</span>';
    }
    return html;
  }

  /* «Sí» and «No», in a shuffled order. */
  function yesNo(yes, labels) {
    return window.App.utils.shuffle([
      { html: labels.yes, aria: labels.yes, correct: yes },
      { html: labels.no, aria: labels.no, correct: !yes }
    ]);
  }

  window.App.answerOptions = {
    dotRow: dotRow,
    yesNo: yesNo
  };
})();
