import { test as base, type Page } from '@playwright/test';
import { ProjectListPage } from '../pages/admin/project-list.page';
import { STORAGE } from '../utils/auth';

export type RoleFixtures = {
  pmPage: Page;
  pmProjectListPage: ProjectListPage;
};

export const test = base.extend<RoleFixtures>({
  /**
   * Một trình duyệt riêng đã đăng nhập bằng tài khoản Project Manager, chạy cùng lúc với page (Admin).
   * browser.newContext() trong test nhận lại MỌI mục của khối use (baseURL, locale... và cả storageState
   * của file test). Không truyền storageState thì tab này vẫn là Admin, nên phải ghi rõ STORAGE.pm.
   */
  pmPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE.pm });
    const pmPage = await context.newPage();
    await use(pmPage);
    await context.close();
  },

  /** Fixture Chaining: trang danh sách Projects nhìn bằng mắt Project Manager */
  pmProjectListPage: async ({ pmPage }, use) => {
    await use(new ProjectListPage(pmPage));
  },
});

export { expect } from '@playwright/test';
