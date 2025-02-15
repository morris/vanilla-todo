/* global process */
import { test } from '@playwright/test';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// See also https://playwright.dev/docs/api/class-coverage

if (process.env.NODE_V8_COVERAGE) {
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

    await fs.promises.mkdir(process.env.NODE_V8_COVERAGE, { recursive: true });
    await fs.promises.writeFile(
      path.join(
        process.env.NODE_V8_COVERAGE,
        `coverage-${crypto.randomUUID()}.json`,
      ),
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
