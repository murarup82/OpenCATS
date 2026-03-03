import { defineConfig } from '@playwright/test';

const requestedWorkers = Number(process.env.PLAYWRIGHT_WORKERS || 1);
const workers = Number.isFinite(requestedWorkers) && requestedWorkers > 0 ? requestedWorkers : 1;

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  workers,
  reporter: [['list']],
  use: {
    trace: 'off'
  }
});
