import { expect, test } from '@playwright/test';
import '../coverage.js';

test("Reorder items inside today's list", async ({ page }) => {
  // given
  await page.goto('http://localhost:8080');

  const input = page.locator('.-today .todo-item-input > input');

  await input.focus();
  await input.fill('Item A');
  await page.keyboard.press('Enter');

  await input.focus();
  await input.fill('Item B');
  await page.keyboard.press('Enter');

  const itemA = page.getByText('Item A');
  const itemB = page.getByText('Item B');

  // when
  await itemA.dragTo(itemB);

  // then
  const firstItem = page.locator('.-today .todo-item').first();
  const secondItem = page.locator('.-today .todo-item').last();

  await expect(firstItem).toHaveText('Item B');
  await expect(secondItem).toHaveText('Item A');
});

test('Drag and drop from today to new custom list', async ({ page }) => {
  // given
  await page.goto('http://localhost:8080');

  const input = page.locator('.-today .todo-item-input > input');

  await input.focus();
  await input.fill('Item A');
  await page.keyboard.press('Enter');

  const addCustomTodoList = page.locator('.todo-frame.-custom .add');
  await addCustomTodoList.click();

  const itemA = page.getByText('Item A');
  const customList = page.locator('.todo-custom-list');

  // when
  await itemA.dragTo(customList, { targetPosition: { x: 0, y: 100 } });

  // then
  const movedItem = page.locator('.todo-custom-list .todo-item');
  await expect(movedItem).toHaveText('Item A');
  await page.waitForTimeout(100);
});
