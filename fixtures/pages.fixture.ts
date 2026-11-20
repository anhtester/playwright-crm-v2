import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { PromotionPage } from '../pages/book/promotion.page';
import { UserPage } from '../pages/book/user.page';
import { BookListPage } from '../pages/book/book-list.page';
import { BookDetailPage } from '../pages/book/book-detail.page';
import { ClientLoginPage } from '../pages/client/client-login.page';
import { ClientForgotPasswordPage } from '../pages/client/client-forgot-password.page';
import { KnowledgeBasePage } from '../pages/client/knowledge-base.page';
import { CustomerFormPage } from '../pages/admin/customer-form.page';
import { ProjectFormPage } from '../pages/admin/project-form.page';
import { ProjectListPage } from '../pages/admin/project-list.page';
import { CustomerListPage } from '../pages/admin/customer-list.page';

export type PageFixtures = {
  loginPage: LoginPage;
  forgotPasswordPage: ForgotPasswordPage;
  promotionPage: PromotionPage;
  userPage: UserPage;
  bookListPage: BookListPage;
  bookDetailPage: BookDetailPage;
  clientLoginPage: ClientLoginPage;
  clientForgotPasswordPage: ClientForgotPasswordPage;
  knowledgeBasePage: KnowledgeBasePage;
  customerListPage: CustomerListPage;
  customerFormPage: CustomerFormPage;
  projectFormPage: ProjectFormPage;
  projectListPage: ProjectListPage;
};

export const test = base.extend<PageFixtures>({
  /** Chỉ TẠO Page Object, chưa mở trang. Test tự gọi goto() */
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  /** Fixture Chaining: dùng lại loginPage, đi qua link Forgot Password? để tới trang */
  forgotPasswordPage: async ({ loginPage }, use) => {
    await loginPage.goto();
    await use(await loginPage.openForgotPassword());
  },

  promotionPage: async ({ page }, use) => {
    await use(new PromotionPage(page));
  },

  userPage: async ({ page }, use) => {
    await use(new UserPage(page));
  },

  bookListPage: async ({ page }, use) => {
    await use(new BookListPage(page));
  },

  bookDetailPage: async ({ page }, use) => {
    await use(new BookDetailPage(page));
  },

  // ----- Khu khách hàng của CRM -----
  clientLoginPage: async ({ page }, use) => {
    await use(new ClientLoginPage(page));
  },

  /** Fixture Chaining: dùng lại clientLoginPage, đi qua link Forgot Password? để tới trang */
  clientForgotPasswordPage: async ({ clientLoginPage }, use) => {
    await clientLoginPage.goto();
    await use(await clientLoginPage.openForgotPassword());
  },

  knowledgeBasePage: async ({ page }, use) => {
    await use(new KnowledgeBasePage(page));
  },

  // ----- Khu Admin, cần phiên đăng nhập (test.use({ storageState: STORAGE.admin })) -----
  customerListPage: async ({ page }, use) => {
    await use(new CustomerListPage(page));
  },

  customerFormPage: async ({ page }, use) => {
    await use(new CustomerFormPage(page));
  },

  projectFormPage: async ({ page }, use) => {
    await use(new ProjectFormPage(page));
  },

  projectListPage: async ({ page }, use) => {
    await use(new ProjectListPage(page));
  },
});

export { expect } from '@playwright/test';
