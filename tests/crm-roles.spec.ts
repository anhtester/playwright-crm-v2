import { test, expect } from '../fixtures';
import { STORAGE } from '../utils/auth';
import { uniqueName } from '../utils/data';

test.describe('CRM - Nhiều vai trò trong một test', () => {
  // Trình duyệt chính (page) là Admin. Project Manager đi qua fixture pmPage, có trình duyệt riêng
  test.use({ storageState: STORAGE.admin });

  test('CRM_ROLE_TC_001 - Admin tạo Customer rồi tạo Project, Project Manager thấy Project đó',
    { tag: ['@regression', '@permission'] }, async ({ page, customerFormPage, projectFormPage, pmProjectListPage }) => {
      const company = uniqueName('AT Auto Customer');
      const projectName = uniqueName('AT Auto Project');
      let customerUrl = '';

      await test.step('Admin tạo Customer', async () => {
        await customerFormPage.goto();
        await customerFormPage.fill({ company, country: 'Vietnam' });
        await customerFormPage.save();
        await expect(page).toHaveURL(/\/admin\/clients\/client\/\d+$/);
        customerUrl = page.url(); // địa chỉ trang Customer vừa tạo, có id ở cuối
      });

      await test.step('Admin tạo Project gắn với Customer vừa tạo', async () => {
        await projectFormPage.goto();
        await projectFormPage.fill({ name: projectName, customer: company, estimatedHours: '40' });
        await projectFormPage.save();

        await expect(page).toHaveURL(/\/admin\/projects\/view\/\d+$/);
        await expect(page).toHaveTitle(projectName);
        // Mục Customer ở phần Overview trỏ đúng về Customer vừa tạo
        await expect(page.getByRole('link', { name: company })).toHaveAttribute('href', customerUrl);
      });

      await test.step('Project Manager mở danh sách Projects và thấy Project mới', async () => {
        await pmProjectListPage.goto();
        await pmProjectListPage.search(projectName);
        await expect(pmProjectListPage.row(projectName)).toHaveCount(1);
        await expect(pmProjectListPage.row(projectName)).toContainText(company);
      });
    });
});
