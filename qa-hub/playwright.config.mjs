import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['json', { outputFile: 'results/playwright-results.json' }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Mặc định chỉ chạy Chromium cho nhanh. CROSS_BROWSER=1 thêm Firefox, WebKit và Pixel 5.
  // Lần đầu cần cài trình duyệt: npx playwright install firefox webkit
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ...(process.env.CROSS_BROWSER === '1' ? [
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      { name: 'mobile-pixel5', use: { ...devices['Pixel 5'] } },
    ] : []),
  ],
  webServer: {
    command: 'node scripts/test-server.mjs',
    url: `http://127.0.0.1:${PORT}/api/health`,
    // Dùng lại server đang chạy trên cổng này nếu còn sót từ lần trước (health check vẫn bắt buộc).
    reuseExistingServer: true,
    env: {
      PORT: String(PORT),
      DATA_DIR: '.test-data',
      RESULTS_FILE: 'results/playwright-results.json',
    },
  },
});
