import { expect, test } from '@playwright/test';
import '../coverage.mjs';

test('Add custom to-do list', async ({ page }) => {
  await page.goto('http://localhost:8080');

  const add = page.locator('.todo-frame.-custom .add');
  await add.click();

  const title = page.locator('.todo-custom-list > .header > .title');
  await expect(title).toHaveText('...');
});

test('Edit custom to-do list title (Enter)', async ({ page }) => {
  await page.goto('http://localhost:8080');

  const add = page.locator('.todo-frame.-custom .add');
  await add.click();

  const title = page.locator('.todo-custom-list > .header > .title');
  await title.click();

  const input = page.locator('.todo-custom-list  > .header > .form > .input');

  await expect(input).toBeVisible();
  await expect(input).toBeFocused();

  await input.fill('Hello, world!');
  await page.keyboard.press('Enter');

  await expect(title).toHaveText('Hello, world!');
});
