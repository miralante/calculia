/* ============================================================
   Calculia — Support team guide text (EN)
   Language-specific file. Loaded conditionally from index.html
   based on App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    "pageTitle": 'Guide for the support team',
    "routeNotice": 'Page for the support team. It does not appear in the app menu: the only way here is typing this address.',
    "title": 'Calculia — Guide for the support team',
    "intro1": 'Information for ',
    "introStrong": 'families, occupational therapists, speech therapists and support teachers',
    "intro2": ' about the project’s goals, the areas it works on, and the educational purpose of each activity. It includes a technical note for the AI agent that maintains the code.',
    "navProject": 'The project',
    "navDesign": 'How it is designed',
    "navAreas": 'Areas and activities',
    "navProgress": 'Progress and privacy',
    "navSupport": 'How to support without taking over',
    "navExceptions": 'Pure-skill training',
    "navAgentAI": 'Technical note (AI)',
    "projectTitle": 'The project',
    "projectP1a": 'Calculia is a ',
    "projectP1Strong1": 'math and logical reasoning',
    "projectP1b": ' web app for people with intellectual disabilities. Its goal is to offer short, visual activities on ',
    "projectP1Strong2": 'everyday math',
    "projectP1c": ' (adding, subtracting, handling money, reading the time, counting, comparing) that the person can do on their own, without a professional beside them.',
    "projectLi1Label": 'Autonomy',
    "projectLi1Text": 'everything is understood and used without help. Works offline (can be installed as an app), no sign-up and no cost.',
    "projectLi2Label": 'Functional, not academic',
    "projectLi2Text": 'the activities train practical skills — counting change, reading the time, telling coins apart, comparing prices — over abstract calculation.',
    "projectLi3Label": 'Reasoning and logic',
    "projectLi3Text": 'series, patterns, riddles, odd-one-out and puzzles, with graded difficulty and no pressure.',
    "projectP2a": 'The interface the person using the app sees ',
    "projectP2Strong": 'never',
    "projectP2b": ' uses clinical language ("patient", "therapy", "disability"). This page is the only one with that vocabulary, because it is written for the support team.',
    "designTitle": 'How it is designed',
    "designIntro": 'Every screen follows these principles. If you notice something that does not, that is a bug to fix.',
    "designLi1Label": 'Plain Language',
    "designLi1Text": 'short sentences, one idea per sentence, no metaphors or irony.',
    "designLi2Label": 'No pressure',
    "designLi2Text": 'no visible timers, no negative scoring, no "game over". Mistakes get encouragement ("Almost. Try again!"), never punishment.',
    "designLi3Label": 'Positive reinforcement',
    "designLi3Text": 'immediate and brief when the person gets it right. Stars ⭐ only ever add up.',
    "designLi4Label": 'No comparing people',
    "designLi4Text": 'no rankings and no competition.',
    "designLi5Label": 'Accessibility',
    "designLi5Text": 'large buttons (64 pixels minimum), large text, high contrast, audio 🔊 only when gamification or the activity design requires it (e.g. hearing a riddle read aloud), full keyboard navigation, and animations that turn off if the system asks for it.',
    "designLi6Label": 'Few options at once',
    "designLi6Text": 'a maximum of 4–6 visible options and one main action per screen.',
    "areasTitle": 'The areas of work and their activities',
    "areasIntro": 'The main menu groups activities into two modules (🧮 Math and 🧩 Reasoning and logic), each with its own color. Here you can see what each activity works on from a functional math and reasoning point of view.',
    "colActivity": 'Activity',
    "colDoes": 'What the person does',
    "colWorks": 'What it works on',
    "colDaily": 'In daily life',
    "module1Title": '🧮 Math',
    "module1Intro": 'Numbers, quantities, mental arithmetic, fractions, measures, money, the clock and Roman numerals.',
    "module2Title": '🧩 Reasoning and logic',
    "module2Intro": 'Series, patterns, riddles, odd-one-out, stories and shape puzzles.',
    activity: {
      "numbers": {
        "name": 'Numbers',
        "does": 'Reads, orders and compares numbers; counts forward and backward; identifies the position (before, after, between).',
        "works": 'Number sense, counting, ordering, comparison and one-to-one matching.',
        "daily": 'Count together at home: "there are 4 plates on the table", "3 is between 2 and 4". Play cards by who has the higher number.'
      },
      "quantities": {
        "name": 'Quantities',
        "does": 'Compares sets ("where are there more?"), measures weights and lengths, and picks the amount that answers a question.',
        "works": 'Comparing quantities, first measures, vocabulary more/less/same/a lot/a little.',
        "daily": 'At the shop, ask "how many apples do we take? What if we take 2 more?" Weigh fruit together.'
      },
      "math-tables": {
        "name": 'Times Tables',
        "does": 'Practices the 2 to 10 tables in three levels: pick the answer from options, complete the result, and type the result in.',
        "works": 'Memorising the tables, automating basic calculation, associating n×n with the result.',
        "daily": 'Take the tables into real life: 3 trays with 4 biscuits each is 12; 4 cars with 2 wheels each is 8.'
      },
      "divisibility": {
        "name": 'Exact groups',
        "does": 'Puts dots in rows to see whether a number shares out exactly, learns the quick rules (by 2, by 5, by 10 and by 3), tests whether a number is prime, finds when two repeating things meet, and works out how long the side of a square is.',
        "works": 'The idea of an exact share against \"something is left over\", the vocabulary of multiple, divisor and prime, and a power seen as a square you can count.',
        "daily": 'When dealing out cards or sweets, see whether it comes out exactly or something is left. If two buses come every 10 and every 15 minutes, work out together when they next come together.'
      },
      "operations": {
        "name": 'Big sums',
        "does": 'Sees that 3 times 4 and 4 times 3 are the same dots turned round. Cuts a hard multiplication into two easy ones (6 times 7 is 6 times 5 and 6 times 2) and so multiplies by two-digit numbers too. Shares into piles and counts how many come out. And decides what is done first when there are brackets.',
        "works": 'The idea that a big sum is solved by cutting it up, not by memorising; the two ways of dividing that people actually use when speaking; and what brackets are for.',
        "daily": 'When sharing something between several people, let them say how many each one gets. When shopping, cut a price up: \"12 euros each is 10 and 2 more, for three people\".'
      },
      "mental-math": {
        "name": 'Mental Addition and Subtraction',
        "does": 'Solves addition and subtraction with increasingly large numbers (1 to 3 digits), with and without carrying, choosing the right answer.',
        "works": 'Mental calculation, decomposition strategies (10 + n), automating basic operations.',
        "daily": 'Calculate together without paper: "what is 23 + 14? And if we add 2 more?" Add the prices before paying.'
      },
      "places": {
        "name": 'Places and sizes',
        "does": 'Looks at a picture and says whether the thing is inside or outside the box, on top of or underneath the chair, on the left or on the right of the tree. Also compares two real things: which is longer, which weighs more and which holds more.',
        "works": 'Vocabulary of position and size, orientation in space, and comparing without measuring or counting.',
        "daily": 'Ask for things by saying where they are: \"the glass that is inside the cupboard\". When carrying the shopping, ask which bag weighs more before picking it up.'
      },
      "shapes": {
        "name": 'Shapes',
        "does": 'Recognises flat shapes (circle, square, triangle, rectangle, pentagon, hexagon) and solids (cube, sphere, cylinder) through real objects, and counts the sides and corners of each figure.',
        "works": 'Geometric vocabulary, attention to detail in a drawing, and the idea that a shape is recognised by what it is like, not by what it is for.',
        "daily": 'Look for shapes out in the street: triangular road signs, square windows, cylindrical tins. Count the sides of a floor tile together.'
      },
      "geometry": {
        "name": 'Geometry',
        "does": 'Compares a corner with the corner of a sheet of paper to say whether the angle is right, acute or obtuse. Counts how many squares long the edge of a figure is and how many squares fit inside. And folds figures in half to see whether the two sides match.',
        "works": 'Geometric vocabulary with its meaning (angle, edge, symmetrical), and the idea that perimeter and area can be counted, with no formula needed.',
        "daily": 'Fold a piece of paper in half and see whether it matches. When putting down a mat or a rug, count together how many tiles it covers.'
      },
      "similar": {
        "name": 'Same shapes',
        "does": 'Compares two figures and says whether they are the same shape at another size, counting the little squares across and down. Counts the squares drawn on the sides of a triangle with a right corner. And looks at two ramps to say which one climbs more.',
        "works": 'The idea of scale (the same shape, bigger), the relation between the sides of a right triangle counted in little squares, and slope as \"how much it climbs for how far it goes\".',
        "daily": 'Look at an enlarged photo and a stretched one: which is the same shape? Going up a hill, talk about whether this one climbs more than that one.'
      },
      "fractions-measures": {
        "name": 'Fractions',
        "does": 'Recognises halves, quarters and thirds, decides when two fractions are worth the same, adds and subtracts parts of the same size, and reads a part written with a point (0.5).',
        "works": 'The fraction as sharing, the equivalence between different ways of saying the same amount, and the step from a fraction to a decimal.',
        "daily": 'Share a pizza or a sponge cake into halves and quarters. When you read a price with a point, say out loud how much "and a half" is.'
      },
      "measures": {
        "name": 'Measures',
        "does": 'Picks the unit that fits each thing (cm, m, g, kg, ml, l) and estimates how long, how heavy or how much it holds.',
        "works": 'Measure vocabulary (longer, heavier, holds more), and the idea that each thing is measured with a unit its own size.',
        "daily": 'While cooking, measure with cups and spoons ("half a kilo of flour"). When shopping, look at the weight on the label together.'
      },
      "percent": {
        "name": 'Percentages',
        "does": 'Counts the coloured squares of a hundred grid to say the percentage. Works out how much is taken off and how much is left to pay, with the coins in front of them. Grows a recipe without breaking its proportion. And reads off a plan how many real metres something is.',
        "works": 'The idea that \"per cent\" means \"out of a hundred\", the percentage applied to real money, the proportion of a recipe, and reading a plan to scale.',
        "daily": 'In the sales, look at the sign together and work out what the price comes down to. When cooking for twice as many people, double both ingredients out loud.'
      },
      "money": {
        "name": 'Money',
        "does": 'Recognises coins and notes (cents and euros), counts a set of money, and decides whether there is enough to buy something.',
        "works": 'Recognising coins and notes, mental addition with decimals, sense of value.',
        "daily": 'Pay together at the shop: hand the money over, count the change, and check that it is right.'
      },
      "wallet": {
        "name": 'The Coin Purse',
        "does": 'Uses money like in real life: counts a purse, pays exactly, pays too much, checks the change, and works out how much is missing to buy something (the piggy bank).',
        "works": 'Real operations with money, sense of change, saving, price comparison.',
        "daily": 'Give them a small real budget and go with them to spend it: let them decide, pay and check the change themselves.'
      },
      "problems": {
        "name": 'Problems',
        "does": 'Reads a short problem and first decides what needs doing (add or take away), without working anything out. Then solves how many there are, with the picture in front of them to count.',
        "works": 'Understanding the wording, the difference between understanding a problem and doing the sum, and the vocabulary of joining and taking away.',
        "daily": 'Tell them problems from around the house out loud: \"there are 4 plates and I am bringing 2 more\". Let them say first whether to add or take away, before saying the number.'
      },
      "temperature": {
        "name": 'Water Temperature',
        "does": 'Reads the water thermometer (cold, warm, hot, scalding), matches each value to an everyday situation, and picks the right temperature for each task.',
        "works": 'Reading a thermometer, temperature vocabulary, safety in the kitchen and bathroom.',
        "daily": 'Before a bath or turning the tap, decide together: "the water should be warm, not scalding."'
      },
      "riddles": {
        "name": 'Riddles',
        "does": 'Reads or hears a short riddle and picks the right answer from 3 options.',
        "works": 'Reading comprehension, deduction, attention to detail and vocabulary.',
        "daily": 'Tell riddles as a family, no rush. If they get stuck, let them think; the hint teaches the strategy.'
      },
      "patterns": {
        "name": 'Patterns',
        "does": 'Completes a visual or numerical series (colors, shapes, numbers) by picking the next piece.',
        "works": 'Spotting regularities, anticipation, inductive reasoning.',
        "daily": 'Look for patterns at home: tiles, house numbers, days of the week.'
      },
      "odd-one-out": {
        "name": 'Odd One Out',
        "does": 'Looks at a group of 4 images or words and picks the one that does not belong to the category.',
        "works": 'Semantic categorisation, reasoning by elimination, vocabulary.',
        "daily": 'At the shop, play "which of these is not a fruit?" or "which one does not fit with the others?"'
      },
      "stories": {
        "name": 'Stories',
        "does": 'Reads a small everyday story (shopping, going to the doctor, waiting for the bus) and answers comprehension questions (who, what, where, why).',
        "works": 'Reading comprehension, everyday vocabulary, narrative sequence, basic inference.',
        "daily": 'Read a recipe, a letter or a sign together. Ask who appears, what happens first and what happens next.'
      },
      "roman-numerals": {
        "name": 'Roman Numerals',
        "does": 'Learns the symbols (I, V, X, L, C, D, M) and combines them to read Roman numerals from 1 to 1000, with and without subtraction.',
        "works": 'Rules of the Roman system, equivalence with the decimal system, attention to the subtraction rules.',
        "daily": 'Look for Roman numerals in the street: old clocks, king names, building façades.'
      },
      "algebra": {
        "name": 'The balance',
        "does": 'Looks at a balance with one-kilo weights and a bag of unknown weight, and says how much the bag weighs so both pans come out level. Sees that a letter is the name of a number not known yet. And reads off a bar graph whether something goes up, goes down or stays the same.',
        "works": 'The idea of an unknown without moving symbols about, balance as a way of reasoning, and reading a real graph.',
        "daily": 'Look at the phone battery graph together: is it going up or down? When splitting the shopping into two bags, aim for them to weigh about the same and say so out loud.'
      },
      "charts": {
        "name": 'Data and charts',
        "does": 'Counts the pictures in a pictogram, reads the length of a bar against its scale, and finds a figure in a table. Also shares out equally (the average) and decides whether taking something out of a bag is certain, possible or impossible.',
        "works": 'Reading charts, comparing amounts shown as pictures, and the first ideas of statistics and chance without formulas.',
        "daily": 'Look at a chart in the newspaper or on the phone together: which bar is the tallest? When sharing something out at home, say out loud how many each one gets.'
      },
      "calendar": {
        "name": 'The Calendar',
        "does": 'Walks through the days of the week and the months of the year forwards and backwards, fills in the missing one, and groups the months into their four seasons.',
        "works": 'Orientation in time, the order of cycles that come round again, and the vocabulary of days, months and seasons.',
        "daily": 'Look at the kitchen calendar together each morning: what day it is today, what day it will be tomorrow, how many days are left until something they are waiting for.'
      },
      "clock": {
        "name": 'The Clock',
        "does": 'Reads the time on an analog, digital or word clock; sets the hands to a given time; pairs the analog clock with its digital twin; and matches each moment of the day (breakfast, lunch, dinner…) with the right time.',
        "works": 'Time orientation, understanding of analog and digital formats, time vocabulary (o’clock, quarter past, half past, quarter to).',
        "daily": 'Ask them what time the kitchen or school clock shows and check together if they can read it.'
      },
      "puzzle": {
        "name": 'Puzzle',
        "does": 'Fits puzzle pieces by picking the right one from several (by color, shape or element count).',
        "works": 'Attention to detail, visual perception, discrimination by colors and shapes, spatial planning.',
        "daily": 'Do real puzzles together, starting with a few pieces (4, 6, 12) and adding more as they get the hang of it.'
      }
    },
    "scopeNote1": 'Out of scope',
    "scopeNote2": ' for a self-guided website: algebra, equations and complex fractions (better on paper with a professional), statistics and probability (need abstract concepts) and long written calculation (better on paper with a method explained in class).',
    "progressTitle": 'Progress and privacy',
    "progressLi1a": 'Progress (stars, completed levels, text size) is saved ',
    "progressLi1Strong": 'only in the device’s browser',
    "progressLi1b": ' (localStorage, under the "calculia:" prefix). It never leaves it.',
    "progressLi2Strong": 'No personal data is requested or stored',
    "progressLi2b": '. No accounts, cookies or analytics. The only preference saved is the text size chosen in Settings.',
    "progressLi3": 'Practical consequence: switching device or browser, or clearing browsing data, resets progress to zero. To track progress over time, always use the same device and browser.',
    "progressLi4a": 'To delete the saved language and text size (or reset the whole app), there is a',
    "progressLi4Link": 'settings page',
    "progressLi4b": 'that, like this guide, does not appear in the app menu.',
    "progressLi5": 'The stars ⭐ in the main menu add up those from every activity: they are encouragement, not an assessment.',
    "supportTitle": 'How to support without taking over autonomy',
    "supportLi1a": 'The app is meant to be used ',
    "supportLi1Strong": 'without help',
    "supportLi1b": '. If the person asks for support, help them the first time and step back gradually after that.',
    "supportLi2": 'Let them choose the activity. The menu order is not a mandatory route.',
    "supportLi3": 'Do not correct the mistake before the app does: the encouragement message and the retry are part of the training.',
    "supportLi4": 'Every activity has levels: start with the easiest one even if it looks simple; finishing successfully builds more confidence than "living up to" a harder level.',
    "supportLi5": 'If they get stuck, let them try again or switch to another activity. Coming back later with a rested head usually works better than pushing through.',
    "exceptionsTitle": 'Pure-skill training: prioritised design decision',
    "exceptionsIntro": 'Most Calculia activities follow the functional math contract: a recognisable scene (a shop, a thermometer, a clock), a clear question, Socratic feedback and a closing transfer to real life. The activities below are a documented exception: they are perceptual or pure-reasoning exercises where turning the prompt into an everyday scene would confuse the educational goal. They keep the rest of the product principles (no pressure, no punishment, positive reinforcement), but they do not expose the explicit real-life transfer on every round.',
    "exceptionRiddles": 'Riddles · reading comprehension and deduction from a fixed text.',
    "exceptionPatterns": 'Patterns · spotting visual or numerical regularities.',
    "exceptionOddOneOut": 'Odd One Out · categorisation by elimination, with no scene.',
    "exceptionStories": 'Stories · reading comprehension over short narratives.',
    "exceptionPuzzle": 'Puzzle · visual perception and piece fitting, with no calculation.',
    "exceptionRomanNumerals": 'Roman Numerals · learning a symbolic system, not functional math.',
    "exceptionsNote": 'The general rule is still functional math: any new activity that represents a calculation or reasoning applied to an everyday situation must include the full contract. This list is reviewed and updated alongside the repository (git log keeps the history of every inclusion and exclusion).',
    "agentTitle": 'Technical note for the AI agent that codes the app',
    "agentP1a": 'If you are a coding agent working in this repository, the sources of truth are',
    "agentP1code": 'CLAUDE.md',
    "agentP1b": '(operating workflow for AI agents) and the',
    "agentP1Link": 'documentation map',
    "agentP1c": 'in',
    "agentP1code2": 'doc/',
    "agentP1d": '. Non-negotiable summary:',
    "agentLi1": 'HTML + CSS + vanilla JavaScript. No frameworks, no build step, no backend, no runtime dependencies. Persistence only in localStorage with the "calculia:" prefix.',
    "agentLi2": 'User interface in Spanish (Spain) and English, in Plain Language, with no clinical language and no pressure or competition mechanics. CLAUDE.md’s 10 accessibility rules are mandatory.',
    "agentLi3a": 'Each activity lives in',
    "agentLi3code1": 'tools/<slug>/',
    "agentLi3b": 'with',
    "agentLi3code2": 'index.html',
    "agentLi3c": ',',
    "agentLi3code3": 'app.js',
    "agentLi3code4": '(logic),',
    "agentLi3code5": 'data.js',
    "agentLi3code6": '(data) and',
    "agentLi3code7": 'styles.css',
    "agentLi3code8": '; it uses the shared',
    "agentLi3code9": 'window.App.*',
    "agentLi3code10": 'modules from',
    "agentLi3code11": 'assets/js/',
    "agentLi3code12": '.',
    "agentLi4a": 'When adding or touching files: update the cache list and version in',
    "agentLi4code": 'sw.js',
    "agentLi4b": '.',
    "agentLi5a": 'This page (',
    "agentLi5code1": 'team/',
    "agentLi5b": ') is deliberately',
    "agentLi5Strong": 'a hidden route',
    "agentLi5c": ', just like',
    "agentLi5code2": 'settings/',
    "agentLi5d": '(view/delete',
    "agentLi5code3": 'localStorage',
    "agentLi5e": '): never link to them from',
    "agentLi5code4": 'site/index.html',
    "agentLi5f": 'or from any activity. Keep this guide up to date whenever new activities are added.',
    "footerActivities": 'Go to the activities'
  }, 'en');
})();
