import { expect, test } from '@playwright/test';
import util from '../../public/scripts/util.js';

test('formatDate', () => {
  expect(util.formatDate(new Date(0))).toEqual('January 1st 1970');
  expect(util.formatDate(new Date('2023-05-13 12:00:00'))).toEqual(
    'May 13th 2023'
  );
});
