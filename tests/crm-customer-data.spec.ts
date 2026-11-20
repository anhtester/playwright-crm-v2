import { test, expect } from '../fixtures';
import { STORAGE } from '../utils/auth';
import { readCsv, readExcel, findRow } from '../utils/data-reader';
import { toCustomer, withUniqueCompany } from '../utils/crm-data';
// File JSON import thẳng được: Playwright tự đọc và TypeScript tự biết kiểu của từng thuộc tính
import customers from '../data/customers.json';

test.use({ storageState: STORAGE.admin });

test.describe('CRM Admin - Customers với data đọc từ file', () => {
  test('CRM_CUSTOMER_TC_006 - Thêm Customer đủ thông tin, data lấy từ JSON',
    { tag: ['@regression', '@data'] }, async ({ page, customerFormPage }) => {
      const customer = withUniqueCompany(customers.full);

      await customerFormPage.goto();
      await customerFormPage.fill(customer);
      await customerFormPage.save();

      await expect(page).toHaveURL(/\/admin\/clients\/client\/\d+$/);
      await expect(page.getByRole('heading', { name: customer.company })).toBeVisible();
      await expect(customerFormPage.phoneInput).toHaveValue(customers.full.phone);
      await expect(customerFormPage.cityInput).toHaveValue(customers.full.city);
      await expect(customerFormPage.country.toggle).toHaveText(customers.full.country);
    });

  test('CRM_CUSTOMER_TC_007 - Thêm Customer chỉ có Company, data lấy từ JSON',
    { tag: ['@regression', '@data'] }, async ({ page, customerFormPage }) => {
      const customer = withUniqueCompany(customers.minimal);

      await customerFormPage.goto();
      await customerFormPage.fill(customer);
      await customerFormPage.save();

      await expect(page.getByRole('heading', { name: customer.company })).toBeVisible();
      await expect(customerFormPage.phoneInput).toHaveValue('');
    });

  test('CRM_CUSTOMER_TC_008 - Thêm Customer từ một dòng CSV rồi tìm thấy trong danh sách',
    { tag: ['@regression', '@data'] }, async ({ customerFormPage, customerListPage }) => {
      const row = findRow(readCsv('data/customers.csv'), 'hanoi');
      const customer = withUniqueCompany(toCustomer(row));

      await customerFormPage.goto();
      await customerFormPage.fill(customer);
      await customerFormPage.save();

      await customerListPage.goto();
      await customerListPage.search(customer.company);
      await expect(customerListPage.row(customer.company)).toHaveCount(1);
      await expect(customerListPage.row(customer.company)).toContainText(row.phone);
    });

  test('CRM_CUSTOMER_TC_009 - Thêm Customer từ một dòng Excel, số điện thoại giữ số 0 ở đầu',
    { tag: ['@regression', '@data'] }, async ({ page, customerFormPage }) => {
      const row = findRow(await readExcel('data/customers.xlsx', 'Customers'), 'tokyo');
      const customer = withUniqueCompany(toCustomer(row));

      await customerFormPage.goto();
      await customerFormPage.fill(customer);
      await customerFormPage.save();

      await expect(page.getByRole('heading', { name: customer.company })).toBeVisible();
      await expect(customerFormPage.phoneInput).toHaveValue('0312345678');
      await expect(customerFormPage.country.toggle).toHaveText('Japan');
    });
});
