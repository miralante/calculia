// tests/back-menu.spec.js — the header «← Volver» of every activity with a menu.
//
// From a screen that the activity shows after its menu (a practice, a
// table, an explanation), «← Volver» goes back to the menu it came from:
// the activity's own menu, or the submenu of the group that holds the
// activity. This spec picks one entry of the menu of each activity that has
// one, checks that the entry opened another screen, and checks that
// «← Volver» brings back the menu screen the entry was picked on.
//
// The activities that go straight to the hub (no menu of their own) are not
// listed here: their «← Volver» is the link to the hub, checked by the
// smoke and the catalogue tests.
'use strict';

const { test, expect } = require('./playwright.js');

const NAV_TIMEOUT = 15000;

/* Activities with a menu of their own, and the query that opens each one on
   its menu. math-tables needs its operation: without it the page goes back
   to the landing. */
const ACTIVITIES = [
  { slug: 'algebra' },
  { slug: 'calendar' },
  { slug: 'charts' },
  { slug: 'fractions-measures' },
  { slug: 'geometry' },
  { slug: 'head-math' },
  { slug: 'linear-functions' },
  { slug: 'math-tables', query: '?op=add' },
  { slug: 'measures' },
  { slug: 'mental-math' },
  { slug: 'money' },
  { slug: 'numbers' },
  { slug: 'operation-concepts' },
  { slug: 'operations' },
  { slug: 'percent' },
  { slug: 'problems' },
  { slug: 'quantities' },
  { slug: 'scale' },
  { slug: 'shapes' },
  { slug: 'temperature' },
  { slug: 'wallet' },
];

/* The entries of a menu: the activity cards of the template, the cards of a
   hand-made menu (a grid of buttons), or the stage cards of temperature. */
const ENTRY = ['.btn-actividad', '.stage-card', '.menu-grid button'];

/* The entries inside a scope (a screen selector), as one CSS selector list. */
function entriesIn(scope) {
  return ENTRY.map((sel) => `${scope} ${sel}`).join(', ');
}

/* Fails the test on any console error or uncaught exception of the page. */
function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  return errors;
}

/* The language is stored as a plain code, seeded on the first load only, so
   the texts the test looks for are the Spanish ones. */
async function seedLocale(page) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('__suite_seeded_locale')) return;
    localStorage.setItem('calculia:locale', 'es');
    sessionStorage.setItem('__suite_seeded_locale', 'true');
  });
}

/* The id of the one visible screen of the activity (its direct section under
   <main>). Every screen of an activity is a <section> that is hidden or shown. */
async function visibleScreen(page) {
  const screen = page.locator('main section:not(.hidden)').first();
  await expect(screen).toBeVisible({ timeout: NAV_TIMEOUT });
  return screen.getAttribute('id');
}

for (const { slug, query = '' } of ACTIVITIES) {
  test(`${slug}: «← Volver» from a screen after the menu goes back to that menu`, async ({ page }) => {
    const errors = watchErrors(page);
    await seedLocale(page);
    await page.goto(`./tools/${slug}/${query}`, { timeout: NAV_TIMEOUT });

    const back = page.locator('[data-suite-activity] .back-link');
    await expect(back).toBeVisible({ timeout: NAV_TIMEOUT });

    // The first screen the activity shows. For most activities it is the
    // menu itself (or the list of tables of math-tables); for the ones that
    // open on their explanation, the menu is the screen behind it.
    const first = await visibleScreen(page);
    const entries = page.locator(entriesIn(`main section#${first}`));

    if ((await entries.count()) === 0) {
      // Opened on the explanation: «← Volver» goes to the menu of the activity.
      await back.click();
      await expect.poll(() => page.locator(entriesIn('main section:not(.hidden)')).count(),
        { timeout: NAV_TIMEOUT }).toBeGreaterThan(0);
      expect(page.url()).toContain(`/tools/${slug}/`);
      expect(errors).toEqual([]);
      return;
    }

    // Pick the first entry of the menu and check that it opened another screen.
    await entries.first().click();
    await expect.poll(() => visibleScreen(page), { timeout: NAV_TIMEOUT }).not.toBe(first);

    // «← Volver» goes back to the menu it was picked on, not to the hub.
    await back.click();
    await expect.poll(() => visibleScreen(page), { timeout: NAV_TIMEOUT }).toBe(first);
    expect(page.url()).toContain(`/tools/${slug}/`);

    expect(errors).toEqual([]);
  });
}
