import { test, expect } from '../fixtures/common.fixture';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { PromotionPage } from '../pages/book/promotion.page';
import { UserPage } from '../pages/book/user.page';

test.describe('Fixture riêng: testEmail và consoleErrors', () => {
  test('CRM - ô Email của trang Quên mật khẩu nhận đúng testEmail', async ({ page, testEmail }) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.goto();
    await forgotPasswordPage.expectLoaded();

    console.log('testEmail:', testEmail);
    await forgotPasswordPage.fillEmail(testEmail); // chỉ điền, KHÔNG bấm Confirm
    await expect(forgotPasswordPage.emailInput).toHaveValue(testEmail);
  });

  test('CRM - trang Quên mật khẩu không có lỗi JavaScript', async ({ page, testEmail, consoleErrors }) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.goto();
    await forgotPasswordPage.expectLoaded();
    await forgotPasswordPage.fillEmail(testEmail); // chỉ điền, KHÔNG bấm Confirm

    console.log('CRM - số lỗi console:', consoleErrors.length);
    expect(consoleErrors, 'Trang Quên mật khẩu không được có lỗi JavaScript').toEqual([]);
  });

  test('Book - đi từ trang Promotion sang trang User: lỗi console được đính vào report', async ({ page, consoleErrors }) => {
    const promotionPage = new PromotionPage(page);
    const userPage = new UserPage(page);

    await promotionPage.goto();
    await promotionPage.expectLoaded();
    await expect(promotionPage.table.rows).not.toHaveCount(0); // chờ dữ liệu về

    await promotionPage.menu.open('User');
    await userPage.expectLoaded();
    await expect(userPage.table.rows).not.toHaveCount(0);

    console.log('Book - số lỗi console:', consoleErrors.length);
    for (const error of consoleErrors) console.log('  ', error);
  });
});
