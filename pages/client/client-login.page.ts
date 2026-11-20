import { type Page, type Locator } from '@playwright/test';
import { ClientBasePage } from './client-base.page';
import { ClientForgotPasswordPage } from './client-forgot-password.page';

/** Trang đăng nhập của khách hàng (vai trò Customer). Trang đăng nhập Admin là pages/login.page.ts */
export class ClientLoginPage extends ClientBasePage {
  readonly languageSelect: Locator;
  readonly languageOptions: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page, '/authentication/login', 'Please login');
    // Trang có 2 phần tử role combobox (thẻ select thật và nút giả lập của giao diện) nên tìm theo nhãn
    this.languageSelect = page.getByLabel('Language');
    this.languageOptions = this.languageSelect.getByRole('option');
    this.emailInput = page.getByLabel('Email Address');
    this.passwordInput = page.getByLabel('Password');
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
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

  /** Điền rồi bấm Login. Email và mật khẩu lấy từ account('CUSTOMER') trong .env */
  async login(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.loginButton.click();
  }

  /** Bấm link Forgot Password? và trả về Page Object của trang vừa mở */
  async openForgotPassword(): Promise<ClientForgotPasswordPage> {
    await this.forgotPasswordLink.click();
    return new ClientForgotPasswordPage(this.page);
  }
}
