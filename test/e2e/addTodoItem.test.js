import { expect, test } from '@playwright/test';
import '../coverage.js';

test("Add item to today's to-do list (Enter)", async ({ page }) => {
  await page.goto('http://localhost:8080');

  const input = page.locator('.-today .todo-item-input > input');
  await input.focus();
  await input.fill('Hello, world!');
  await page.keyboard.press('Enter');

  await expect(page.locator('.-today .todo-item > .label')).toHaveText(
    'Hello, world!',
  );
});

test("Add item to today's to-do list (click)", async ({ page }) => {
  await page.goto('http://localhost:8080');

  const input = page.locator('.-today .todo-item-input > input');
  await input.focus();
  await input.fill('Hello, world!');
  await page.locator('.-today .todo-item-input > .save').click();

  await expect(page.locator('.-today .todo-item > .label')).toHaveText(
    'Hello, world!',
  );
});

test("Add item to today's to-do list (blur)", async ({ page }) => {
  await page.goto('http://localhost:8080');

  const input = page.locator('.-today .todo-item-input > input');
  await input.focus();
  await input.fill('Hello, world!');
  await page.locator('.-today').click();

  await expect(page.locator('.-today .todo-item > .label')).toHaveText(
    'Hello, world!',
  );
});
