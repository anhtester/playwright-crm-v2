import { test, expect } from '../fixtures';
import { STORAGE } from '../utils/auth';
import { readCsv, readExcel, findRow } from '../utils/data-reader';
import { toCustomer, withUniqueCompany } from '../utils/crm-data';
import { buildCustomer, buildProject } from '../utils/factories';

test.use({ storageState: STORAGE.admin });

// CSV đọc đồng bộ (readFileSync) nên đọc được ngay lúc Playwright nạp file, trước khi tạo test
const csvRows = readCsv('data/customers.csv');

test.describe('CRM Admin - Customers data-driven', () => {
  for (const row of csvRows) {
    test(`CRM_CUSTOMER_TC_010-${row.key} - Thêm Customer ở ${row.city} (${row.country}) từ CSV`,
      { tag: ['@regression', '@data'] }, async ({ page, customerFormPage }) => {
        const customer = withUniqueCompany(toCustomer(row));

        await customerFormPage.goto();
        await customerFormPage.fill(customer);
        await customerFormPage.save();

        await expect(page.getByRole('heading', { name: customer.company })).toBeVisible();
        await expect(customerFormPage.phoneInput).toHaveValue(row.phone);
        await expect(customerFormPage.country.toggle).toHaveText(row.country);
      });
  }

  // Excel chỉ đọc được bằng await. File test không cho await ở ngoài cùng,
  // nên lặp theo danh sách key, còn việc đọc file làm BÊN TRONG từng test
  for (const key of ['danang', 'tokyo']) {
    test(`CRM_CUSTOMER_TC_011-${key} - Thêm Customer từ dòng "${key}" của Excel`,
      { tag: ['@regression', '@data'] }, async ({ page, customerFormPage }) => {
        const row = findRow(await readExcel('data/customers.xlsx', 'Customers'), key);
        const customer = withUniqueCompany(toCustomer(row));

        await customerFormPage.goto();
        await customerFormPage.fill(customer);
        await customerFormPage.save();

        await expect(page.getByRole('heading', { name: customer.company })).toBeVisible();
        await expect(customerFormPage.cityInput).toHaveValue(row.city);
      });
  }
});

test.describe('CRM Admin - Data ngẫu nhiên với Faker', () => {
  test('CRM_CUSTOMER_TC_012 - Thêm Customer với data Faker, mọi ô lưu đúng như đã điền',
    { tag: ['@regression', '@data'] }, async ({ page, customerFormPage }) => {
      const customer = buildCustomer();
      // Đính data vào report: test đỏ thì biết ngay đã điền gì
      await test.info().attach('customer', { body: JSON.stringify(customer, null, 2), contentType: 'application/json' });

      await customerFormPage.goto();
      await customerFormPage.fill(customer);
      await customerFormPage.save();

      await expect(page.getByRole('heading', { name: customer.company })).toBeVisible();
      await expect(customerFormPage.vatInput).toHaveValue(customer.vat!);
      await expect(customerFormPage.phoneInput).toHaveValue(customer.phone!);
      await expect(customerFormPage.websiteInput).toHaveValue(customer.website!);
      await expect(customerFormPage.cityInput).toHaveValue(customer.city!);
    });

  test('CRM_CUSTOMER_TC_013 - Data mặc định của Faker, ghi đè riêng ô Country',
    { tag: ['@regression', '@data'] }, async ({ page, customerFormPage }) => {
      const customer = buildCustomer({ country: 'Japan' }); // chỉ cố định ô test cần kiểm

      await customerFormPage.goto();
      await customerFormPage.fill(customer);
      await customerFormPage.save();

      await expect(page.getByRole('heading', { name: customer.company })).toBeVisible();
      await expect(customerFormPage.country.toggle).toHaveText('Japan');
    });

  test('CRM_PROJECT_TC_001 - Customer và Project đều sinh bằng Faker, Project nằm trong danh sách',
    { tag: ['@smoke', '@data'] }, async ({ page, customerFormPage, projectFormPage, projectListPage }) => {
      const customer = buildCustomer();
      const project = buildProject(customer.company);

      await test.step('Tạo Customer', async () => {
        await customerFormPage.goto();
        await customerFormPage.fill(customer);
        await customerFormPage.save();
        await expect(page.getByRole('heading', { name: customer.company })).toBeVisible();
      });

      await test.step('Tạo Project cho Customer vừa tạo', async () => {
        await projectFormPage.goto();
        await projectFormPage.fill(project);
        await projectFormPage.save();
        await expect(page).toHaveURL(/\/admin\/projects\/view\/\d+$/);
        await expect(page).toHaveTitle(project.name);
      });

      await test.step('Project có trong danh sách, đúng Customer', async () => {
        await projectListPage.goto();
        await projectListPage.search(project.name);
        await expect(projectListPage.row(project.name)).toHaveCount(1);
        await expect(projectListPage.row(project.name)).toContainText(customer.company);
      });
    });
});
