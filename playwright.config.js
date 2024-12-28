/* global process */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  workers: process.env.CI ? 1 : undefined,
  ignoreSnapshots: !!process.env.CI,
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
      // Includes unit tests
    },
    {
      name: 'Firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /e2e/,
    },
    {
      name: 'Safari',
      use: { ...devices['Desktop Safari'] },
      testMatch: /e2e/,
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /e2e/,
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testMatch: /e2e/,
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      testMatch: /e2e/,
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
      testMatch: /e2e/,
    },
  ],
});
