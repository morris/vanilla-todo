import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { test } from 'playwright/test';

// See also https://playwright.dev/docs/api/class-coverage

if (process.env.COVERAGE) {
  test.beforeEach(async ({ page }) => {
    await page.coverage.startJSCoverage();
  });

  test.afterEach(async ({ page }) => {
    const coverage = await page.coverage.stopJSCoverage();

    const output = {
      result: coverage.map((entry) => ({
        ...entry,
        url: resolveFileUrl(entry.url),
      })),
    };

    await fs.mkdir('coverage/tmp', { recursive: true });
    await fs.writeFile(
      `coverage/tmp/coverage-${randomUUID()}.json`,
      JSON.stringify(output),
    );
  });
}

function resolveFileUrl(url) {
  return url.replace(
    'http://localhost:8080',
    `file://${path.resolve('public')}`,
  );
}
