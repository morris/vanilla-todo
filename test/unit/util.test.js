import { expect, test } from '@playwright/test';
import { formatDate } from '../../public/scripts/util.js';
import '../coverage.js';

test('formatDate', () => {
  expect(formatDate(new Date(0))).toEqual('January 1st 1970');
  expect(formatDate(new Date('2023-05-13 12:00:00'))).toEqual('May 13th 2023');
});

test('toDataURL', async ({ page }) => {
  // Needs to be tested in the browser because FileReader is not available in Node.js
  // However, this approach does not support test coverage :'(
  await page.goto('http://localhost:8080');

  const dataURL = await page.evaluate(async () => {
    const { toDataURL } = await import('./scripts/util.js');
    const text = 'a Ā 𐀀 文 🦄';
    const json = JSON.stringify({ text });
    const dataURL = await toDataURL(json, 'application/json;charset=utf-8');

    return dataURL;
  });

  expect(dataURL).toEqual(
    'data:application/json;charset=utf-8;base64,eyJ0ZXh0IjoiYSDEgCDwkICAIOaWhyDwn6aEIn0=',
  );
});
