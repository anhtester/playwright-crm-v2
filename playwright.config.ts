import { defineConfig, devices } from '@playwright/test';
import { env } from './utils/env.config';

/**
 * File cấu hình của project playwright-crm.
 * Tài liệu: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Thư mục Playwright tìm file test
  testDir: './tests',
  // Chỉ file có đuôi .spec.ts mới được coi là file test
  testMatch: '**/*.spec.ts',

  // Thời gian tối đa cho MỘT test, tính cả hook và fixture của test đó
  timeout: 30_000,
  expect: {
    // Thời gian tối đa mỗi expect(...) Web-First chờ điều kiện đúng
    timeout: 5_000,
  },

  // Chạy song song cả các test trong cùng một file
  fullyParallel: true,
  // Trên CI: còn sót test.only thì báo lỗi ngay, không chạy
  forbidOnly: !!process.env.CI,
  // Trên CI chạy lại test lỗi 2 lần, ở máy mình thì không
  retries: process.env.CI ? 2 : 0,
  // Số worker lấy từ WORKERS trong file .env. Để trống thì Playwright tự chọn một nửa số nhân CPU.
  // Gõ --workers=<số> ở dòng lệnh thì dòng lệnh thắng
  workers: env.workers,
  // Nhiều reporter cùng lúc: list in ra terminal, html và allure-playwright ghi ra thư mục.
  // Gõ --reporter=<tên> ở dòng lệnh thì cả danh sách này bị thay thế
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],

  // Thiết lập dùng chung cho mọi project. Project và test.use() ghi đè được từng mục
  use: {
    // Địa chỉ gốc lấy từ file .env.<TEST_ENV>: page.goto('/admin/authentication') tự ghép thành địa chỉ đầy đủ
    baseURL: env.crmURL,
    // Chạy ẩn trình duyệt. Muốn xem trình duyệt chạy thì gõ thêm --headed
    headless: true,
    // Ngôn ngữ và múi giờ cố định: máy nào chạy cũng ra cùng định dạng ngày, số
    locale: 'en-US',
    timezoneId: 'Asia/Ho_Chi_Minh',
    // Bằng chứng khi test lỗi: ảnh màn hình, video, trace.
    // Trên CI thì tắt: repo public ai cũng tải được report, mà trace có cookie phiên đăng nhập, video và ảnh có dữ liệu CRM
    screenshot: process.env.CI ? 'off' : 'only-on-failure',
    video: process.env.CI ? 'off' : 'retain-on-failure',
    trace: process.env.CI ? 'off' : 'retain-on-failure',
  },

  projects: [
    {
      // Đăng nhập CRM một lần cho 3 vai trò, lưu ra playwright/.auth/*.json
      name: 'setup',
      testMatch: 'auth.setup.ts',
      // Không ghi trace, ảnh, video cho bước đăng nhập: trace lưu nguyên mật khẩu đã gõ (Fill "...").
      // Trên CI các file này được upload thành artifact, ai tải về cũng đọc được
      use: { trace: 'off', screenshot: 'off', video: 'off' },
    },
    {
      // Đăng nhập API Book một lần, lưu token ra playwright/.auth/book-token.json
      name: 'api-setup',
      testMatch: 'book-api.setup.ts',
      // Trace của request đăng nhập lưu cả body có mật khẩu, nên tắt như project setup
      use: { baseURL: env.bookURL, trace: 'off', screenshot: 'off', video: 'off' },
    },
    {
      // Test API của Book: không mở trình duyệt, chỉ gửi request.
      // baseURL là Book nên trong test chỉ viết '/api/book'
      name: 'api',
      testMatch: '**/*.api.spec.ts',
      use: { baseURL: env.bookURL },
      dependencies: ['api-setup'],
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // File test API để project api chạy, trình duyệt không chạy lại
      testIgnore: '**/*.api.spec.ts',
      // api-setup: test kết hợp API + UI tạo dữ liệu Book qua API, cần token
      dependencies: ['setup', 'api-setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      // File test API để project api chạy, trình duyệt không chạy lại
      testIgnore: '**/*.api.spec.ts',
      // api-setup: test kết hợp API + UI tạo dữ liệu Book qua API, cần token
      dependencies: ['setup', 'api-setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      // File test API để project api chạy, trình duyệt không chạy lại
      testIgnore: '**/*.api.spec.ts',
      // api-setup: test kết hợp API + UI tạo dữ liệu Book qua API, cần token
      dependencies: ['setup', 'api-setup'],
    },
    {
      // Điện thoại Android giả lập trên Chromium: chỉ chạy test @smoke của khu khách hàng
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      testMatch: 'crm-client-pom.spec.ts',
      grep: /@smoke/,
    },
  ],
});
