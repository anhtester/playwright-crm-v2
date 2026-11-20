import { test, expect } from '../fixtures';
import { STORAGE } from '../utils/auth';
import { uniqueName } from '../utils/data';
// Cả file dùng phiên Admin do tests/auth.setup.ts lưu sẵn: không test nào phải đăng nhập lại
test.use({ storageState: STORAGE.admin });

test.describe('CRM Admin - Customers', () => {
  test('CRM_CUSTOMER_TC_001 - Có phiên Admin thì mở thẳng danh sách Customers, không qua trang Login',
    { tag: ['@smoke', '@ui'] }, async ({ page, customerListPage }) => {
      await customerListPage.goto();
      await expect(page).toHaveURL(customerListPage.url);
      await expect(page).toHaveTitle(/Customers/);
      await expect(customerListPage.newCustomerLink).toBeVisible();
    });

  test('CRM_CUSTOMER_TC_002 - Thêm Customer đủ thông tin thì lưu thành công và mở trang Customer vừa tạo',
    { tag: ['@smoke', '@ui'] }, async ({ page, customerListPage }) => {
      const company = uniqueName('AT Auto Customer');

      await customerListPage.goto();
      const customerFormPage = await customerListPage.openNewCustomer();
      await customerFormPage.fill({
        company,
        vat: '10',
        phone: '0123456789',
        website: 'https://anhtester.com',
        address: '123 Test Street',
        city: 'Ho Chi Minh',
        country: 'Vietnam',
      });
      await customerFormPage.save();

      // Kiểm kết quả lưu bền (URL có id, tiêu đề), KHÔNG kiểm thông báo "Customer added successfully.":
      // thông báo nằm trong phiên đăng nhập, các worker dùng chung phiên có thể làm nó biến mất
      await expect(page).toHaveURL(/\/admin\/clients\/client\/\d+$/);
      await expect(page.getByRole('heading', { name: company })).toBeVisible();
      await expect(customerFormPage.phoneInput).toHaveValue('0123456789');
      await expect(customerFormPage.country.toggle).toHaveText('Vietnam');
    });

  test('CRM_CUSTOMER_TC_003 - Chỉ điền ô bắt buộc Company thì vẫn lưu được',
    { tag: ['@regression', '@ui'] }, async ({ page, customerFormPage }) => {
      const company = uniqueName('AT Auto Customer');

      await customerFormPage.goto();
      await customerFormPage.fill({ company });
      await customerFormPage.save();

      await expect(page).toHaveURL(/\/admin\/clients\/client\/\d+$/);
      await expect(page.getByRole('heading', { name: company })).toBeVisible();
    });

  test('CRM_CUSTOMER_TC_004 - Bỏ trống Company thì báo lỗi bắt buộc và không lưu',
    { tag: ['@regression', '@validation'] }, async ({ page, customerFormPage }) => {
      await customerFormPage.goto();
      await customerFormPage.save();

      // Câu lỗi nằm ở thẻ p#company-error, ô Company trỏ tới nó qua aria-describedby
      await expect(customerFormPage.companyInput).toHaveAccessibleDescription('This field is required.');
      await expect(page).toHaveURL(customerFormPage.url); // vẫn ở form thêm mới, chưa có id
    });

  test('CRM_CUSTOMER_TC_005 - Customer vừa tạo tìm thấy trong danh sách Customers',
    { tag: ['@regression', '@ui'] }, async ({ customerFormPage, customerListPage }) => {
      const company = uniqueName('AT Auto Customer');

      await customerFormPage.goto();
      await customerFormPage.fill({ company, phone: '0987654321' });
      await customerFormPage.save();

      await customerListPage.goto();
      await customerListPage.search(company);
      await expect(customerListPage.row(company)).toHaveCount(1);
      await expect(customerListPage.row(company)).toContainText('0987654321');
    });
});
