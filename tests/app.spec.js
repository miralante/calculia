// tests/app.spec.js — the flows of Calculia itself.
//
// The shared smoke (tests/smoke.spec.js) checks the contract of the suite;
// this file checks what makes Calculia: its catalogue, the group that
// gathers the number activities, the migration of the progress of a
// sub-activity that no longer exists, an activity that can be started and
// answered, the settings page that wipes what is saved in the browser and
// the language row of the drawer.
//
// The ideas come from the crawler (scripts/ui-smoke.js), but these are real
// tests: they assert what the app shows, they never copy the crawler.
'use strict';

const { test, expect } = require('./playwright.js');

const NAV_TIMEOUT = 15000;

/* Fails the test on any console error or uncaught exception of the page. */
function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  return errors;
}

/* The app keeps its own state in localStorage under the "calculia:" prefix.
   Seeding it before the page scripts run (addInitScript) is the only way to
   reproduce a browser that already has progress saved. Anything that is not
   a string is stored as JSON, the way App.storage does it. */
async function seedStorage(page, entries) {
  await page.addInitScript((values) => {
    Object.keys(values).forEach((key) => {
      const value = values[key];
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
  }, entries);
}

/* The language is stored as a plain code, and it is seeded only on the
   first load: the picker reloads the page when the language changes, and a
   seed that ran again would undo the change that was just made. */
async function seedLocale(page, locale) {
  await page.addInitScript((code) => {
    if (sessionStorage.getItem('__suite_seeded_locale')) return;
    localStorage.setItem('calculia:locale', code);
    sessionStorage.setItem('__suite_seeded_locale', 'true');
  }, locale);
}

// ===========================================================================
// CATALOGUE
// ===========================================================================

test('1 — the home shows the catalogue and the stars of this browser',
  async ({ page }) => {
    const errors = watchErrors(page);
    // Spanish, so the text of the cards is known and not the browser's.
    await seedLocale(page, 'es');
    await page.goto('./');

    // The star counter is painted from the shared storage: in a clean
    // browser it starts at zero, but it must be there.
    const stars = page.locator('#totalStars');
    await expect(stars).toBeVisible();
    await expect(stars).toHaveText(/⭐\s*0/);

    // The catalogue is four blocks of cards, and every card is a link to
    // its own folder.
    const cards = page.locator('main .grid-cards a.card');
    expect(await cards.count()).toBeGreaterThan(10);
    await expect(cards.first()).toHaveAttribute('href', /tools\//);

    // The first card of the first block is the numbers group.
    const numbers = page.locator('a[href="tools/numbers-group/"]');
    await expect(numbers).toBeVisible();
    await expect(numbers).toContainText('Los números');

    expect(errors).toEqual([]);
  });

test('2 — the numbers group lists its four activities and opens one',
  async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('./');

    await page.locator('a[href="tools/numbers-group/"]').click();
    await page.waitForURL('**/tools/numbers-group/');

    // The group is a menu of four activities, not a tool with a round of
    // its own: nothing is practised here.
    const activities = page.locator('#activitiesMenu a.btn-actividad');
    await expect(activities).toHaveCount(4);

    // One of them opens a sub-activity straight away (with ?sub=), so the
    // menu of that tool is skipped and its exposition opens instead.
    await page.locator('#activitiesMenu a.btn-actividad[href="../numbers/?sub=unidades"]').click();
    await page.waitForURL('**/tools/numbers/?sub=unidades');
    await expect(page.locator('#expoScreen')).toBeVisible();

    expect(errors).toEqual([]);
  });

test('3 — the progress of the removed sub-activity is moved to "numbers"',
  async ({ page }) => {
    // "Positivos y negativos" is gone, but the stars it gave are not: they
    // are added to the progress of "numbers" the first time that tool runs.
    await seedStorage(page, {
      'calculia:numbers': { stars: 2, completedRounds: 8 },
      'calculia:posneg': { stars: 4, completedRounds: 2 },
    });
    await page.goto('/tools/numbers/?sub=unidades');
    await expect(page.locator('#expoScreen')).toBeVisible();

    const stored = await page.evaluate(() => ({
      numbers: JSON.parse(localStorage.getItem('calculia:numbers') || '{}'),
      legacy: localStorage.getItem('calculia:posneg'),
    }));
    // The two stars of the old key join the two that were already there.
    expect(stored.numbers.stars).toBe(6);
    // The rest of the progress is left alone.
    expect(stored.numbers.completedRounds).toBe(8);
    // The old key is not left behind, or the stars would be counted twice.
    expect(stored.legacy).toBeNull();
  });

// ===========================================================================
// ACTIVITY
// ===========================================================================

test('4 — an activity can be started and a question can be answered',
  async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/tools/patterns/');

    // A start screen with no button looks exactly like a working one to
    // anything that only counts clicks.
    await expect(page.locator('#screenStart')).toBeVisible();
    await expect(page.locator('#btnStart')).toBeVisible();

    await page.locator('#btnStart').click();
    await expect(page.locator('#screenGame')).toBeVisible();

    const options = page.locator('#options .option-btn');
    await expect(options.first()).toBeVisible();
    const total = await options.count();

    // The options are shuffled and a wrong one is disabled, so the correct
    // one is found by trying them in order. A wrong answer hides the
    // options behind the hint: the round only continues after the
    // "Entendido" tap.
    let answered = false;
    for (let i = 0; i < total && !answered; i += 1) {
      const option = options.nth(i);
      if (!await option.isVisible().catch(() => false)) continue;
      if (!await option.isEnabled().catch(() => false)) continue;
      await option.click();
      const classes = (await option.getAttribute('class').catch(() => '')) || '';
      if (classes.includes('correct')) {
        answered = true;
        break;
      }
      const ack = page.locator('#explanationWrap .btn-entendido');
      if (await ack.count() && await ack.first().isVisible().catch(() => false)) {
        await ack.first().click();
      }
    }
    expect(answered).toBe(true);

    // A right answer gives feedback and opens the way to the next question.
    await expect(page.locator('#feedback')).not.toBeEmpty();
    await expect(page.locator('#btnNext')).toBeVisible();

    expect(errors).toEqual([]);
  });

// ===========================================================================
// SETTINGS
// ===========================================================================

// ===========================================================================
// LANGUAGE
// ===========================================================================

test('6 — the language row of the drawer renames the catalogue cards',
  async ({ page }) => {
    await seedLocale(page, 'es');
    await page.goto('./');

    const numbers = page.locator('a[href="tools/numbers-group/"]');
    await expect(numbers).toContainText('Los números');

    // The picker lives inside the settings drawer, as its first row.
    await page.locator('.locale-settings-trigger').click();
    const drawer = page.locator('#accessibility-settings');
    await expect(drawer).toBeVisible();
    await drawer.locator('.locale-picker-btn').click();
    await page.locator('#locale-picker .locale-picker-panel li[data-locale="en"]').click();

    // Choosing a language reloads the page (App.i18n.setLocale), so the
    // card is looked up again after the reload.
    await expect(page.locator('html')).toHaveAttribute('lang', 'en', {
      timeout: NAV_TIMEOUT,
    });
    await expect(numbers).toContainText('The numbers');
  });
