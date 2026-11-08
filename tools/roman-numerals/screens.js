/* ============================================================
   Calculia — Roman numerals: the three screens before the quiz.
   Screen 1 is the symbol carousel, screen 2 the famous Roman numerals
   (with their listen button) and screen 3 the reminder: the I/V/X table
   and the subtract and add examples. This file owns their elements and
   their buttons. The page gives it what it needs in the host object and
   gets back the paint, bind and speech helpers.
   ============================================================ */
(function () {
  'use strict';

  /* host: { show(screen), resetAudioUI(), screens: { famous, reminder } }
     Returns { paint(), bind(), speakWithButton(btn, text), coloredChunkValue(chunk) }.
     The three screens live in screens-carousel.js, screens-famous.js and
     screens-reminder.js; this file only puts them together. */
  App.romanNumeralsScreens = function (host) {
    var carousel = App.romanNumeralsCarousel(host);
    var famous = App.romanNumeralsFamous(host);
    var reminder = App.romanNumeralsReminder(host);

    return {
      paint: function () { carousel.paint(); famous.paint(); reminder.paint(); },
      bind: function () { carousel.wire(); famous.wire(); },
      speakWithButton: famous.speakWithButton,
      coloredChunkValue: famous.coloredChunkValue
    };
  };
})();
