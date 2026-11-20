import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { ForgotPasswordPage } from './forgot-password.page';

export class LoginPage extends BasePage {
  // page, path, url, goto(), title() đã có sẵn từ BasePage
  readonly logoLink: Locator;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page, '/admin/authentication'); // phải gọi trước khi dùng this
    this.logoLink = page.getByRole('link', { name: 'Perfex CRM | Anh Tester Demo' });
    this.heading = page.getByRole('heading', { name: 'Login' });
    this.emailInput = page.getByLabel('Email Address');
    this.passwordInput = page.getByLabel('Password');
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
  }

  /** Đúng URL và đã thấy tiêu đề Login */
  async expectLoaded(): Promise<void> {
    await super.expectLoaded();
    await expect(this.heading).toBeVisible();
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /** Điền cả hai ô, KHÔNG gửi biểu mẫu */
  async fillCredentials(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  /**
   * Điền rồi bấm Login. Dùng từ bài đọc config từ file .env và bài Storage State,
   * khi email và mật khẩu lấy từ biến môi trường. Không chạy với tài khoản thật trên CRM demo trong bài này.
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.loginButton.click();
  }

  /** Bấm link Forgot Password? và trả về Page Object của trang vừa mở */
  async openForgotPassword(): Promise<ForgotPasswordPage> {
    await this.forgotPasswordLink.click();
    return new ForgotPasswordPage(this.page);
  }
}
