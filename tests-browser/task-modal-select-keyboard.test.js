// Bob 1.0's Select in the New task modal, driven by the keyboard.
//
// WHY THIS RUNG. The list is a Base UI listbox in a portal at the end of <body>, but React sends
// its keyboard events along the React tree, through the portal, to the modal's Enter-saves
// handler. Only a real browser with the built client shows that: an Enter that picks a project
// saved the task with the project from BEFORE the pick, and closed the modal.
//
// ## Verified red-green: 2026-11-27 — the `contains(ev.target)` guard taken out of TaskModal's
//   onKeyDown: the case fails at the first check, because the Enter on the option saves and
//   closes the modal (the dialog count is 0, not 1).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startApp, stopApp, until } from './harness.js';

const LABEL = 'Keyboard task';
const stateFromPage = (page) => page.evaluate(() => fetch('/api/state').then((r) => r.json()));

describe('New task modal: a project chosen with the keyboard', () => {
  let app = null;
  beforeAll(async () => {
    app = await startApp();
  }, 120000);
  afterAll(async () => {
    await stopApp(app);
  });

  it('Enter on an option picks it and keeps the modal open; Enter in the name saves with it', async () => {
    const { page } = app;
    const state = await stateFromPage(page);
    const active = state.projects.filter((project) => !project.archived);
    // The modal starts on the first project; the keyboard picks the second one.
    const target = active[1];
    expect(target, 'the demo seed has at least two active projects').toBeTruthy();

    await page.locator('button:has-text("+ task")').first().click();
    const dialog = page.getByRole('dialog', { name: 'New task' });
    await dialog.waitFor({ timeout: 15000 });
    await page.keyboard.type(LABEL);

    const trigger = dialog.locator('.select-trigger');
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await page.getByRole('listbox').waitFor({ timeout: 5000 });
    const highlighted = page.locator('[role=option][data-highlighted]');
    for (let i = 0; i < 10; i++) {
      if (((await highlighted.textContent()) || '').startsWith(target.code + ' ')) break;
      await page.keyboard.press('ArrowDown');
    }
    expect(await highlighted.textContent()).toMatch(new RegExp('^' + target.code + ' '));
    await page.keyboard.press('Enter');

    // The pick closed the list, not the modal, and saved nothing.
    await until(async () => (await page.getByRole('listbox').count()) === 0, { timeout: 5000 });
    expect(await page.getByRole('dialog', { name: 'New task' }).count()).toBe(1);
    expect(await trigger.textContent()).toContain(target.code + ' · ' + target.name);
    expect((await stateFromPage(page)).tasks.some((task) => task.label === LABEL)).toBe(false);

    // Escape on the open list closes the list only.
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await page.getByRole('listbox').waitFor({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await until(async () => (await page.getByRole('listbox').count()) === 0, { timeout: 5000 });
    expect(await page.getByRole('dialog', { name: 'New task' }).count()).toBe(1);
    expect(await trigger.textContent()).toContain(target.code + ' · ' + target.name);

    // Enter in the name field saves, with the chosen project.
    await dialog.locator('input').first().focus();
    await page.keyboard.press('Enter');
    await until(async () => (await page.getByRole('dialog', { name: 'New task' }).count()) === 0, { timeout: 5000 });
    const saved = await until(async () =>
      (await stateFromPage(page)).tasks.some((task) => task.label === LABEL && task.project === target.code),
    );
    expect(saved, `task "${LABEL}" saved with project ${target.code}`).toBe(true);
    expect(app.pageErrors).toEqual([]);
  }, 120000);
});
