import { test as base } from '@playwright/test';
import { uniqueEmail } from '../utils/data';

export type CommonFixtures = {
  testEmail: string;
  consoleErrors: string[];
};

export type CommonWorkerFixtures = {
  runId: string;
};

export const test = base.extend<CommonFixtures, CommonWorkerFixtures>({
  /** Email không trùng, mỗi test một giá trị */
  testEmail: async ({}, use) => {
    await use(uniqueEmail('tester'));
  },

  /** Gom lỗi console + lỗi JavaScript của trang, đính vào report khi có */
  consoleErrors: async ({ page }, use, testInfo) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`[console] ${message.text()}`);
    });
    page.on('pageerror', (error) => {
      errors.push(`[pageerror] ${error.message}`);
    });

    await use(errors);

    if (errors.length > 0) {
      await testInfo.attach('console-errors', {
        body: errors.join('\n'),
        contentType: 'text/plain',
      });
    }
  },

  /** Mã của lượt chạy, mỗi worker tạo MỘT lần, các test trong worker dùng chung */
  runId: [async ({}, use, workerInfo) => {
    await use(`w${workerInfo.workerIndex}-${Date.now()}`);
  }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';
