// Minimal Playwright config for beginners

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: "./tests", // Place your tests in the 'tests' directory
  timeout: 30000, // 30 seconds per test
  retries: 0, // No retries by default
  use: {
    headless: true, // Run tests in headless mode
    baseURL: "http://localhost:5173", // Change if your dev server runs elsewhere
  },
};

module.exports = config;
