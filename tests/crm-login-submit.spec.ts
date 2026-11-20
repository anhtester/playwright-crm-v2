import { test, expect } from '../fixtures';
import { STORAGE } from '../utils/auth';
import invalidLogins from '../data/login-invalid.json';

/**
 * Các case BẤM Login thật. Dữ liệu sai đều là dữ liệu giả, không dùng tài khoản thật.
 * Case đăng nhập ĐÚNG (Admin, Project Manager, Customer) nằm ở tests/auth.setup.ts:
 * setup không vào được Dashboard thì đỏ, và mọi test cần phiên cũng không chạy.
 */
test.describe('CRM - Gửi biểu mẫu đăng nhập Admin', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // Data-driven: MỘT kịch bản, mỗi dòng của data/login-invalid.json sinh ra MỘT test riêng
  for (const data of invalidLogins) {
    test(`${data.id} - ${data.title} thì báo đúng lỗi và ở lại trang đăng nhập`,
      { tag: ['@regression', '@validation'] }, async ({ page, loginPage }) => {
        await loginPage.login(data.email, data.password);

        for (const message of data.messages) {
          await expect(page.getByText(message)).toBeVisible();
        }
        await expect(page).toHaveURL(loginPage.url);
      });
  }

  test('CRM_LOGIN_TC_012 - Email sai định dạng bị trình duyệt chặn, biểu mẫu không gửi đi',
    { tag: ['@regression', '@validation'] }, async ({ page, loginPage }) => {
      await loginPage.login('tester-khong-co-a-cong', 'Abc12345');

      // Ô type="email" tự kiểm định dạng: validity.typeMismatch = true thì trình duyệt không gửi biểu mẫu
      const typeMismatch = await loginPage.emailInput.evaluate((input: HTMLInputElement) => input.validity.typeMismatch);
      expect(typeMismatch).toBe(true);
      await expect(page.getByText('Invalid email or password')).toHaveCount(0);
      await expect(loginPage.emailInput).toHaveValue('tester-khong-co-a-cong');
    });

  test.fail('CRM_LOGIN_TC_016 - Đăng nhập thất bại thì ô Email vẫn giữ email vừa nhập',
    {
      tag: ['@regression', '@ui'],
      annotation: { type: 'issue', description: 'Bug đã biết: sau khi đăng nhập lỗi, ô Email bị xoá trắng' },
    }, async ({ page, loginPage, testEmail }) => {
      await loginPage.login(testEmail, 'Abc12345');

      await expect(page.getByText('Invalid email or password')).toBeVisible();
      await expect(loginPage.emailInput).toHaveValue(testEmail);
    });
});

test.describe('CRM - Trang đăng nhập khi đã có phiên', () => {
  test.use({ storageState: STORAGE.admin });

  test('CRM_LOGIN_TC_023 - Đang có phiên Admin thì mở trang đăng nhập bị đưa về Dashboard',
    { tag: ['@regression', '@ui'] }, async ({ page, loginPage }) => {
      await loginPage.goto();

      await expect(page).toHaveURL('/admin/');
      await expect(page).toHaveTitle(/Dashboard/);
    });
});

test.describe('CRM - Phiên của Customer ở khu Admin', () => {
  test.use({ storageState: STORAGE.customer });

  test('CRM_LOGIN_TC_020 - Đang có phiên Customer vẫn không mở được khu Admin',
    { tag: ['@regression', '@permission'] }, async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Projects Summary' })).toBeVisible();

      await page.goto('/admin/');
      await expect(page).toHaveURL(/\/admin\/authentication/);
    });
});
