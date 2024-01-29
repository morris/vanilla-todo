import { expect, test } from '@playwright/test';
import '../coverage.js';

test('Delete custom to-do list', async ({ page }) => {
  await page.goto('http://localhost:8080');

  const add = page.locator('.todo-frame.-custom .add');
  await add.click();

  const title = page.locator('.todo-custom-list > .header > .title');
  await title.click();

  const button = page.locator('.todo-custom-list  > .header > .form > .delete');

  await expect(button).toBeVisible();

  await button.click();

  await expect(title).not.toBeAttached();
});
