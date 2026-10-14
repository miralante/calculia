const fs = require('fs');

// 1. Verify production index.html has numbers before shapes.
const prod = fs.readFileSync('D:/apps/onedrive/jrodriguezgar/OneDrive/dev/git/Miralante/calculia/index.html', 'utf8');
const prodIdxN = prod.indexOf('tools/numbers/');
const prodIdxS = prod.indexOf('tools/shapes/');
console.log('Production — numbers @ ' + prodIdxN + ', shapes @ ' + prodIdxS);
console.log('  numbers before shapes:', prodIdxN >= 0 && prodIdxS > prodIdxN);

// 2. Verify dev/index.html has numbers before shapes.
const dev = fs.readFileSync('D:/apps/onedrive/jrodriguezgar/OneDrive/dev/git/Miralante/calculia/dev/index.html', 'utf8');
const devIdxN = dev.indexOf('../tools/numbers/');
const devIdxS = dev.indexOf('../tools/shapes/');
console.log('Dev — numbers @ ' + devIdxN + ', shapes @ ' + devIdxS);
console.log('  numbers before shapes:', devIdxN >= 0 && devIdxS > devIdxN);

// 3. Confirm landing strings have 'numbers' entry.
const les = fs.readFileSync('D:/apps/onedrive/jrodriguezgar/OneDrive/dev/git/Miralante/calculia/strings.es.js', 'utf8');
const len = fs.readFileSync('D:/apps/onedrive/jrodriguezgar/OneDrive/dev/git/Miralante/calculia/strings.en.js', 'utf8');
console.log('ES strings has numbers:', les.indexOf('"numbers":') !== -1);
console.log('EN strings has numbers:', len.indexOf('"numbers":') !== -1);
console.log('ES strings has shapes:', les.indexOf('"shapes":') !== -1);
console.log('EN strings has shapes:', len.indexOf('"shapes":') !== -1);

// 4. Make sure the production card label still works (data-i18n values).
const expectedLabels = ['numbers.name', 'numbers.detail', 'shapes.name', 'shapes.detail'];
for (const l of expectedLabels) {
  console.log('Prod card uses data-i18n="' + l + '":', prod.indexOf('data-i18n="' + l + '"') !== -1);
  console.log('Dev card uses data-i18n="' + l + '":', dev.indexOf('data-i18n="' + l + '"') !== -1);
}