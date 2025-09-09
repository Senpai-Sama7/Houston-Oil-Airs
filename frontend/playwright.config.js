// Basic Playwright config to run dev server and a smoke test
// Requires: devDependencies already include playwright

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  webServer: {
    command: 'npx vite',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
  },
  testDir: './tests',
  testMatch: /.*\.spec\.js$/,
};

export default config;
