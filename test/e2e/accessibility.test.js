import { expect, test } from '@playwright/test';
import '../coverage.js';

test('Collapsed custom to-do lists are not keyboard-reachable', async ({
  page,
}) => {
  await page.goto('http://localhost:8080');

  const toggle = page.locator('.app-collapsible > .bar > .toggle');
  const body = page.locator('.app-collapsible > .body');
  const addCustomTodoList = page.locator('.todo-frame.-custom .add');

  // Collapse the panel if it starts expanded.
  if (await body.evaluate((el) => el.offsetHeight > 0)) {
    await toggle.click();
  }

  await expect(body).toHaveJSProperty('offsetHeight', 0);

  // Content hidden behind a zero-height, overflow:hidden panel must not be
  // reachable by keyboard, or focus becomes invisible to sighted users and
  // the content stays exposed to screen readers despite being clipped.
  await toggle.focus();
  await page.keyboard.press('Tab');

  await expect(addCustomTodoList).not.toBeFocused();
});

test('Toggling the custom to-do lists panel updates aria-expanded', async ({
  page,
}) => {
  await page.goto('http://localhost:8080');

  const toggle = page.locator('.app-collapsible > .bar > .toggle');

  const initial = await toggle.getAttribute('aria-expanded');
  await toggle.click();
  const afterClick = await toggle.getAttribute('aria-expanded');

  expect(initial).not.toBeNull();
  expect(afterClick).not.toBe(initial);
});

test('Date-picker day buttons have a full accessible name', async ({
  page,
}) => {
  await page.goto('http://localhost:8080');

  await page.locator('.todo-frame.-days .pickdate').click();

  const dayButton = page.locator('.app-date-picker .pick').first();
  const visibleText = (await dayButton.innerText()).trim();
  const accessibleName = await dayButton.evaluate((el) =>
    (el.getAttribute('aria-label') || el.textContent || '').trim(),
  );

  // A bare "15" is ambiguous across months to a screen-reader user; the
  // accessible name should carry more information than the visible day
  // number alone (e.g. include the month or year).
  expect(accessibleName.length).toBeGreaterThan(visibleText.length);
});

test("Today's date-picker cell is marked with aria-current", async ({
  page,
}) => {
  await page.goto('http://localhost:8080');

  await page.locator('.todo-frame.-days .pickdate').click();

  const today = page.locator('.app-date-picker .pick.-highlight');

  await expect(today).toHaveAttribute('aria-current', 'date');
});

test('Dark-mode toggle title reflects current state', async ({ page }) => {
  await page.goto('http://localhost:8080');

  const toggle = page.locator('.app-header .invertcolorscheme');

  const titleBefore = await toggle.getAttribute('title');
  await toggle.click();
  const titleAfter = await toggle.getAttribute('title');

  // The control's name must describe what activating it will do next;
  // it should change once the mode it toggles has changed.
  expect(titleAfter).not.toBe(titleBefore);
});
