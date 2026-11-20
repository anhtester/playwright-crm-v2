import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  readonly logoLink: Locator;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly confirmButton: Locator;
  readonly allTextboxes: Locator;
  readonly allLinks: Locator;

  constructor(page: Page) {
    super(page, '/admin/authentication/forgot_password');
    this.logoLink = page.getByRole('link', { name: 'Perfex CRM | Anh Tester Demo' });
    this.heading = page.getByRole('heading', { name: 'Forgot Password' });
    this.emailInput = page.getByLabel('Email Address');
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.allTextboxes = page.getByRole('textbox');
    this.allLinks = page.getByRole('link');
  }

  /** Đúng URL và đã thấy tiêu đề Forgot Password */
  async expectLoaded(): Promise<void> {
    await super.expectLoaded();
    await expect(this.heading).toBeVisible();
  }

  /** Điền ô Email, KHÔNG bấm Confirm */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }
}
