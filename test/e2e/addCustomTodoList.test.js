import { expect, test } from '@playwright/test';
import '../coverage.js';

test('Add custom to-do list', async ({ page }) => {
  await page.goto('http://localhost:8080');

  const addCustomTodoList = page.locator('.todo-frame.-custom .add');
  await addCustomTodoList.click();

  const title = page.locator('.todo-custom-list > .header > .title');
  await expect(title).toHaveText('...');
});
