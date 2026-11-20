import { test, expect } from '../fixtures';
import { STORAGE } from '../utils/auth';
import { uniqueName } from '../utils/data';

test.use({ storageState: STORAGE.admin });

/**
 * Chuỗi 3 test PHỤ THUỘC nhau: test sau dùng Customer do test trước tạo.
 * mode 'serial': cả nhóm chạy trong MỘT worker, đúng thứ tự viết; một test đỏ thì các test sau bị bỏ qua.
 * Chỉ dùng khi thật sự cần các bước là các test riêng. Còn lại: gộp vào một test với test.step (crm-roles.spec.ts).
 */
test.describe('CRM Admin - Sửa Customer (serial)', () => {
  test.describe.configure({ mode: 'serial' });

  const company = uniqueName('AT Auto Customer');
  let customerUrl = '';

  test('CRM_CUSTOMER_TC_014 - Tạo Customer có số điện thoại ban đầu',
    { tag: ['@regression', '@ui'] }, async ({ page, customerFormPage }) => {
      await customerFormPage.goto();
      await customerFormPage.fill({ company, phone: '0901000001' });
      await customerFormPage.save();

      await expect(page).toHaveURL(/\/admin\/clients\/client\/\d+$/);
      customerUrl = page.url();
    });

  test('CRM_CUSTOMER_TC_015 - Sửa số điện thoại của Customer vừa tạo thì lưu giá trị mới',
    { tag: ['@regression', '@ui'] }, async ({ page, customerFormPage }) => {
      await page.goto(customerUrl); // form của chính Customer ở test trước, chế độ sửa
      await customerFormPage.phoneInput.fill('0901000002');
      await customerFormPage.save();

      await page.reload();
      await expect(customerFormPage.phoneInput).toHaveValue('0901000002');
    });

  test('CRM_CUSTOMER_TC_016 - Danh sách Customers hiện số điện thoại mới',
    { tag: ['@regression', '@ui'] }, async ({ customerListPage }) => {
      await customerListPage.goto();
      await customerListPage.search(company);
      await expect(customerListPage.row(company)).toContainText('0901000002');
      await expect(customerListPage.row(company)).not.toContainText('0901000001');
    });
});
