/* Calculia — Roman numerals, screen 1: the symbol carousel.
   Built by screens.js with the host (show, screens) it gives; returns
   paint and wire for the carousel and its introduction button. */
(function () {
  'use strict';

  var M = App.romanNumeralsModel;
  var t = M.t, CAROUSEL_ORDER = M.CAROUSEL_ORDER, wrapRomanLetters = M.wrapRomanLetters, wrapTrailingRoman = M.wrapTrailingRoman;
  var coloredCaption = M.coloredCaption, paintFamousPhrase = M.paintFamousPhrase, famousFor = M.famousFor, totalColorClass = M.totalColorClass;
  var letterClass = M.letterClass, cardinalFor = M.cardinalFor, ordinalFor = M.ordinalFor;
  var $ = App.utils.$;

  App.romanNumeralsCarousel = function (host) {
    var show = host.show;
    var famousScreen = host.screens.famous;

    /* ---------- Screen 1: introduction (symbol carousel) ---------- */
    var carouselDisplay = $('#carouselDisplay');
    var carouselCaption = $('#carouselCaption');
    var carouselPrev = $('#carouselPrev');
    var carouselNext = $('#carouselNext');
    var introNext = $('#introNext');

    /* ---------- Screen 1: introduction (symbol carousel) ---------- */

    /* The carousel teaches the 7 symbols/combinations the activity
       actually relies on, in the order a reader naturally meets them:
       standalone I/V/X first, then the sum pairs (VI, XI), then the
       subtract pairs (IV, IX). The "sums first, then the special
       case of subtraction" order is the more intuitive one: once
       adding letters in sequence is settled, the rule "a smaller
       letter before a larger one subtracts" lands as a deliberate
       exception, not as a gotcha hiding in the second example. */
    var carouselIdx = 0;

    function paintCarousel() {
      var key = CAROUSEL_ORDER[carouselIdx];
      /* The large symbol of the carousel is also painted letter by
         letter with each letter's colour (I→blue, V→green, X→orange;
         the I that subtracts in IV/IX goes in red), just like in the
         reminder and the decomposition. That way the prompt and
         the explanation below share the same colour code. */
      var label = t('carousel.' + key + '.label');
      carouselDisplay.innerHTML = wrapRomanLetters(label);
      /* aria-label must match the visible symbol (with spaces
         between letters because each one is in its own span), so the
         screen reader announces exactly the letter the user sees.
         Without spaces "IV" would become "ive", which is unreadable. */
      carouselDisplay.setAttribute('aria-label', label.split('').join(' '));
      carouselCaption.innerHTML = coloredCaption(key, t('carousel.' + key + '.caption'));
    }

    /* Wraps every Roman letter (I, V, X) in `raw` with its colour
       span and passes every other character through as-is. Used by
       the carousel (where `raw` is just "I"/"V"/"X"/"IV"/"VI") and
       by the famous/quiz prompts (where `raw` can be "Carlos III",
       "Siglo XX", "Henry VIII", etc. — only the I/V/X get coloured,
       the rest of the word passes through unchanged).

       Subtract detection: an `I` is a subtract letter only when it
       sits immediately before a `V` or `X` (the IV/IX rule). The
       previous version of the carousel took a `key` argument for
       this; the position check is equivalent for "IV"/"IX" and
       also works inside longer strings like "XIV" / "XXIV" /
       "XII" (where IV or IX appears mid-string) and "Felipe VI"
       (where the I is at the end and isn't a subtract letter, so
       it stays blue instead of turning red).

       Each letter span is aria-hidden so the screen reader reads
       the parent textContent (the same string we passed in)
       instead of the broken-up per-letter HTML. */
    /* Colours only the trailing Roman numeral in `label`, leaving
       any earlier letters untouched. This is the right rule for the
       famous-screen label: each entry in DATA.famousRomans ends
       with the Roman numeral it teaches ("Siglo XX", "Carlos III",
       "Felipe VI", "Henry VIII", ...) and any I/V/X that appears
       *before* that suffix is just a letter of the monarch's first
       name or a context word — not a numeral. The previous
       wrapRomanLetters() coloured every I/V/X in the string, so the
       `I` of "Isabel" was painted blue along with the actual "II"
       suffix, which misleads the reader (it implies the `I` of the
       name is part of the Roman numeral being taught).

       Implementation: locate the trailing run of I/V/X characters
       (the longest suffix where every char is one of those three)
       and apply the same letter-by-letter colouring used by
       wrapRomanLetters, but only inside that suffix. Everything
       before it is returned verbatim. If the label has no I/V/X at
       all, the suffix is empty and the function returns the input
       unchanged — same behaviour as before for the "no Roman
       letters" edge case. aria-hidden is set on every coloured
       span so the screen reader still reads the full label as a
       single string ("Carlos tercero") instead of swallowing the
       numeral inside per-letter spans. */
    /* Replaces the placeholders {I}, {V}, {X} (the letter) and
       {i}, {v}, {x} (its decimal value) inside `raw` with spans in
       each letter's colour, so the explanation prose and the
       arithmetic formula share the same colour code as the
       reminder. Used by:
         - the carousel caption (coloredCaption), where every I
           subtracts in "iv"/"ix" so the I takes the red class;
         - the famous-screen sentence (paintFamousPhrase), where the
           subtract status is read from the actual Roman numeral
           (e.g. "IV" has one subtracting I, "XII" has none) so the
           same I→red rule applies if the numeral happens to contain
           IV/IX — never mixed into a sentence where the I is just
           being mentioned.

       {i4}/{i6}/{i9}/{i11}/{i19} close the operation with the I's
       colour so the final "4"/"6"/"9"/"11"/"19" reads as the
       result of the same letter. The set grew with each new
       example the carousel and the famous screen taught (IV, VI,
       IX, XI and the 19th century). aria-hidden on each span so
       the screen reader announces only the placeholder text (the
       CSS classes are decorative, not semantic). */
    /* Paints the carousel caption by replacing the {I}/{V}/{X} /
       {i}/{v}/{x} placeholders in `raw` with spans in each letter's
       colour, like the coloured formula of the reminder
       (coloredFormula) and formatEquals. That way, in the
       explanation of 4, the "5" of "is worth 5" and of the formula
       "5 − 1 = 4" is painted green (V's colour), and the "1" in
       blue (I's colour). In IV, only the I that subtracts is also
       painted red to visually reinforce the rule: the reader sees
       the same I, first blue in the mention ("the {I} is worth 1")
       and then red when it is explained that it goes in front and
       subtracts. The V never carries the "subtract" colour — only
       the letter that subtracts does — so we don't mix V's green
       with red on the same chip. The {i4}/{i6}/{i9}/{i11}/{i19} result also takes
       I's colour so the final "4"/"6" closes the operation with
       the same letter. */
    /* Paints the famous-screen sentence with the same colour code
       as the carousel and the reminder: every {I}/{V}/{X} letter
       mention and every {i}/{v}/{x} value mention is wrapped in a
       span with the letter's colour, so "X vale 10" reads "X (orange)
       vale 10 (orange)" — keeping the symbol → colour → value
       association in the prose, not only in the arithmetic formula
       at the end. Subtract status (red I in IV/IX) is taken from
       the actual Roman numeral of the current famous item, not
       assumed — the famous set currently has no IV/IX entries, but
       if one is added later the rule is already in place. */
    function carouselStep(delta) {
      carouselIdx = App.utils.wrapIndex(carouselIdx, delta, CAROUSEL_ORDER.length);
      paintCarousel();
    }

    function wire() {
      App.utils.bindCarousel({ prev: carouselPrev, next: carouselNext, card: carouselDisplay }, carouselStep);
      introNext.addEventListener('click', function () { show(famousScreen); });
    }

    return { paint: paintCarousel, wire: wire };
  };
})();
