/* ============================================================
   Calculia — Pares e impares: texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().

   Mirrors strings.es.js key for key (scripts/check.js enforces
   the parity). The prompt shows the figure ("Is 5 even or
   odd?") and the dots form the picture; the two button labels
   live here in their short answer form.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🟦 Even and odd',
    instruction: 'Look at the dots: one left alone or all paired up?',
    btnMenu: 'Back to the start',

    /* Root-menu key: the "Pares e impares" / "Even and odd"
       word used on the landing card and dev/. */
    parityName: 'Even and odd',
    parityDetail: 'Look at the dots: one left alone or all paired up?',

    /* ---------- Game ----------
       Prompt carries {a} = the dot count the person sees. The
       pairs go into pairsWord ({a} 'pairs') and, if there is a
       leftover dot, oneLeftWord is tacked on (', one left
       over'). Same sum drives the aria-label on the dots card. */
    parityPrompt: 'Is {a} even or odd?',
    evenLabel: 'Even',
    oddLabel: 'Odd',
    pairsWord: 'pairs',
    oneLeftWord: 'one left over',
    hintParity: 'Pair the dots two by two. If one is left alone, it is odd.',
    explainParity: 'The {a} dots go two by two. If none is left, it is even; if one is left, it is odd.',

    parityFinalSummary: 'You saw {count} numbers and classified them. Now you have {stars} stars.',
    parityTransfer: 'Knowing which numbers are even and which are odd helps split into two teams, alternate turns, or cut a list in half.'
  }, 'en');
})();
