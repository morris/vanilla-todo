import { expect, test } from '@playwright/test';

test("Add item to today's todo list (Enter)", async ({ page }) => {
  await page.goto('http://localhost:8080');

  const input = page.locator('.-today .todo-item-input > input').filter();
  await input.focus();
  await input.type('Hello, world!');
  await page.keyboard.press('Enter');

  await expect(page.locator('.-today .todo-item > .label')).toHaveText(
    'Hello, world!',
  );
});

test("Add item to today's todo list (click)", async ({ page }) => {
  await page.goto('http://localhost:8080');

  const input = page.locator('.-today .todo-item-input > input').filter();
  await input.focus();
  await input.type('Hello, world!');
  await page.locator('.-today .todo-item-input > .save').click();

  await expect(page.locator('.-today .todo-item > .label')).toHaveText(
    'Hello, world!',
  );
});
