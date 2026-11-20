import { test as setup, expect } from '../fixtures';
import { account } from '../utils/env.config';
import { STORAGE } from '../utils/auth';

/**
 * Đăng nhập MỘT lần cho mỗi vai trò rồi lưu trạng thái ra file.
 * Các test sau đọc lại file này, không phải điền email, mật khẩu nữa.
 */
setup('Đăng nhập Admin và lưu Storage State', async ({ page, loginPage }) => {
  const { email, password } = account('ADMIN');
  await loginPage.goto();
  await loginPage.login(email, password);

  // Đăng nhập đúng thì CRM chuyển tới Dashboard. Chưa tới thì KHÔNG lưu file, setup đỏ ngay tại đây
  await expect(page).toHaveURL('/admin/');
  await expect(page).toHaveTitle(/Dashboard/);
  await page.context().storageState({ path: STORAGE.admin });
});

setup('Đăng nhập Project Manager và lưu Storage State', async ({ page, loginPage }) => {
  const { email, password } = account('PM');
  await loginPage.goto();
  await loginPage.login(email, password);

  await expect(page).toHaveURL('/admin/');
  await expect(page).toHaveTitle(/Dashboard/);
  await page.context().storageState({ path: STORAGE.pm });
});

setup('Đăng nhập Customer và lưu Storage State', async ({ page, clientLoginPage }) => {
  const { email, password } = account('CUSTOMER');
  await clientLoginPage.goto();
  await clientLoginPage.login(email, password);

  await expect(page).not.toHaveURL(/authentication/);
  await page.context().storageState({ path: STORAGE.customer });
});
