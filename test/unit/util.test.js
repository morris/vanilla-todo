import { expect, test } from '@playwright/test';
import { formatDate } from '../../public/scripts/util.js';
import '../coverage.js';

test('formatDate', () => {
  expect(formatDate(new Date(0))).toEqual('January 1st 1970');
  expect(formatDate(new Date('2023-05-13 12:00:00'))).toEqual('May 13th 2023');
});
