// DD-038 at the browser rung: in every view, no element carries two Bob text styles, and none
// carries a leading-*, tracking-* or font-* class (other than font-mono) next to a style.
//
// tests/bob-text-styles.test.js reads the source one string literal at a time, so it cannot see
// classes that clsx joins from two constants (`clsx(small, codeClass)`, `textCell('text-item')`).
// The rendered DOM has the joined class list, so this scan sees what the element gets.
//
// ## Verified red-green: 2026-11-28 (PR 4 follow-ups) — each break alone fails this test, with
//   the element in the message, while tests/bob-text-styles.test.js stays green:
//   cells.ts textCell with `font-sans` put back (the week grid's task and note inputs);
//   ReportsView's total hours as `clsx(cell, figure, num)` (text-figure and text-caption).
// ## Verified red-green: 2026-11-28 (review) — the scan of Invoice and the project page now
//   checks that each view is there: InvoiceView's totals as `num` fails 'invoice totals', and
//   ProjectPage's StatusDot without className fails 'project page dot'.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request } from 'playwright';
import { startApp, stopApp } from './harness.js';

// Bob's text styles, as whole class names. A colour (text-primary) or an alignment is not one.
const STYLE =
  '^text-(?:micro|tiny|id|label|caption|note|figure|body|subhead|item|base|prose|heading|title|headline|display)$';
// Type classes an app does not write next to a style: font-* other than font-mono, leading-*,
// tracking-*.
const OFF = '^(?:font-(?!mono$)[a-z][\\w-]*|leading-.+|tracking-.+)$';

/** Every element in the document whose classes break the rules, as "TAG classes | text". */
function scan(page) {
  return page.evaluate(
    ([styleSrc, offSrc]) => {
      const style = new RegExp(styleSrc);
      const off = new RegExp(offSrc);
      const bad = [];
      for (const el of document.querySelectorAll('[class]')) {
        const cls = String(el.getAttribute('class')).split(/\s+/);
        const styles = cls.filter((c) => style.test(c));
        const offs = cls.filter((c) => off.test(c));
        const what = (el.textContent || el.getAttribute('value') || el.getAttribute('placeholder') || '').trim();
        if (styles.length > 1 || (styles.length && offs.length)) {
          bad.push(`${el.tagName} ${[...styles, ...offs].join(' ')} | ${what.slice(0, 24)}`);
        }
      }
      return bad;
    },
    [STYLE, OFF],
  );
}

describe('Bob text styles in the rendered views', () => {
  /** @type {Awaited<ReturnType<typeof startApp>> | null} */
  let app = null;
  beforeAll(async () => {
    app = await startApp();
    // An employee with entries, so Review has a user, a week and its edit cells to show.
    const made = await app.page.evaluate(() =>
      fetch('/api/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'ea@x.local', name: 'Eva Ansatt', role: 'employee', password: 'evapw123' }),
      }).then((r) => r.status),
    );
    expect(made).toBe(200);
    const emp = await request.newContext({ baseURL: `http://localhost:${app.port}` });
    expect((await emp.post('/api/auth/login', { data: { email: 'ea@x.local', password: 'evapw123' } })).ok()).toBe(
      true,
    );
    const entry = (id, date) => ({
      id,
      date,
      start: 540,
      end: 660,
      durMin: null,
      project: 'FJH-NETT',
      label: 'Checkout',
      note: 'call',
      billable: true,
    });
    expect(
      (await emp.put('/api/state', { data: { entries: [entry('e1', '2026-11-23'), entry('e2', '2026-11-24')] } })).ok(),
    ).toBe(true);
    await emp.dispose();
    await app.page.reload();
    await app.page.locator('text=Settings').first().waitFor();
  }, 120000);
  afterAll(async () => {
    await stopApp(app);
  });

  it('no element in any view has two text styles, or a type class next to one', async () => {
    const page = app.page;
    const found = {};
    const visit = async (name) => {
      await page.waitForTimeout(500);
      const bad = await scan(page);
      if (bad.length) found[name] = bad;
    };
    const go = async (label) => {
      await page.locator('aside').getByText(label, { exact: true }).first().click();
      await visit(label);
    };

    await visit('Settings');
    // The scan sees only what is on the page, so each step checks that its elements are there.
    const seen = {};
    const count = async (name, selector) => (seen[name] = await page.locator(selector).count());
    await go('Today');
    await go('This week');
    await count('task inputs', 'input.text-item');
    await go('Reports');
    await count('report totals', '.text-figure');
    await go('Invoice');
    await count('invoice totals', '.text-figure');
    await go('Review');
    // Review with a user and a week open: the week panel and its edit cells.
    await page.locator('main nav button').first().click();
    await page.waitForTimeout(600);
    await page.locator('main section button').first().click();
    await visit('Review, a week open');
    await count('review edit cells', 'section input.text-body');
    // The first project's page.
    await page.locator('aside nav').nth(1).locator('> *').first().click();
    await visit('Project page');
    await count('project page dot', 'main .status-dot.self-center');

    for (const [name, n] of Object.entries(seen)) expect(n, name).toBeGreaterThan(0);
    expect(found).toEqual({});
    expect(app.pageErrors).toEqual([]);
  }, 120000);
});
