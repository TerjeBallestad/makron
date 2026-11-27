// The grid's hover reveals on a touch screen.
//
// WHY THIS RUNG. A row's delete "×" and a running row's stop button show only while the row is
// hovered (EntryRow: the Tailwind group "row" and group-hover/row). Tailwind 4 puts hover: inside
// @media (hover: hover) by default, so on a device that cannot hover a tap never showed them. The
// CSS Modules before PLAN-005 Task 8 used a plain :hover, which a tap sets. app.css makes hover: a
// plain :hover again. Only a real browser with a touch device and the built CSS shows this.
//
// The rows carry data-tt="entry-row" for this test: Tailwind class names are styling, not a hook.
//
// ## Verified red-green: 2026-11-27 — `@custom-variant hover (&:hover);` taken out of app.css:
//   the case fails, because the tapped row's "×" stays hidden.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startApp, stopApp, until } from './harness.js';

describe('Grid on a touch screen', () => {
  let app = null;
  beforeAll(async () => {
    app = await startApp({ pageOptions: { hasTouch: true, isMobile: true } });
  }, 120000);
  afterAll(async () => {
    await stopApp(app);
  });

  it('a tap on a row shows its delete button', async () => {
    const { page } = app;
    expect(await page.evaluate(() => matchMedia('(hover: hover)').matches), 'the page cannot hover').toBe(false);

    // The app opens on a page whose task list has "×" buttons of its own: go to the grid.
    await page.locator('text=This week').first().tap();
    const rows = page.locator('[data-tt="entry-row"]');
    await rows.first().waitFor({ timeout: 15000 });
    expect(await rows.count(), 'the demo seed has at least two rows this week').toBeGreaterThan(1);
    const del = (row) => rows.nth(row).locator('button', { hasText: '×' });
    const visibility = (row) => del(row).evaluate((el) => getComputedStyle(el).visibility);
    expect(await visibility(1)).toBe('hidden');

    // Tap the second row's first cell. Its "×" shows, and the first row's stays hidden.
    await rows.nth(1).locator('input').first().tap();
    const shown = await until(async () => (await visibility(1)) === 'visible', { timeout: 5000 });
    expect(shown, 'the tapped row shows its "×"').toBe(true);
    expect(await visibility(0)).toBe('hidden');
    expect(app.pageErrors).toEqual([]);
  }, 120000);
});
