// Browsertests. Auf dem Mac das installierte Chrome; in der Cloud-Sitzung der vorinstallierte Chromium (PW_CHROMIUM).
const { defineConfig, devices } = require('@playwright/test');
const exe = process.env.PW_CHROMIUM;
const browser = exe ? { launchOptions: { executablePath: exe, env: { ...process.env, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' } } } : { channel: process.env.CI ? undefined : 'chrome' };

module.exports = defineConfig({
  testDir: 'test',
  timeout: 60_000,
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:5193', locale: 'de-DE', timezoneId: 'Europe/Berlin', acceptDownloads: true, ...browser },
  projects: [
    { name: 'kern', testMatch: /kern\.spec/ },
    { name: 'mac', use: { viewport: { width: 1280, height: 860 } }, testIgnore: /kern\.spec/ },
    { name: 'ipad', use: { viewport: { width: 1180, height: 820 }, hasTouch: true }, grep: /@ipad/, testIgnore: /kern\.spec/ },
    { name: 'iphone', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' }, grep: /@mobil/, testIgnore: /kern\.spec/ }
  ],
  webServer: { command: 'node scripts/serve.mjs', env: { PORT: '5193' }, url: 'http://localhost:5193', reuseExistingServer: !process.env.CI }
});
