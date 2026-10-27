const { defineConfig } = require('@playwright/test');

// The same tests run twice: once against Project A and once against Project B.
// Run only one with: npx playwright test --project=b
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 3000 },
  reporter: 'list',
  use: { browserName: 'chromium' },
  projects: [
    { name: 'a', use: { baseURL: 'http://localhost:4173/a/' } },
    { name: 'b', use: { baseURL: 'http://localhost:4173/b/' } }
  ],
  webServer: {
    command: 'node tests/server.js',
    url: 'http://localhost:4173/birds.json',
    reuseExistingServer: !process.env.CI
  }
});
